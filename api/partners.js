/**
 * Clima16 - POST /api/partners
 * Cadastro de interesse de profissionais (técnicos e empresas de ar-condicionado).
 * Fluxo: valida -> antispam -> salva no Supabase (tabela partners) -> avisa por e-mail (Resend).
 *
 * Usa as mesmas variáveis de ambiente de /api/leads (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * RESEND_API_KEY, LEAD_NOTIFY_TO, LEAD_FROM, IP_HASH_SALT).
 */
const { clean, cleanMultiline, escapeHtml, clientIp, hashIp, supabaseHeaders, parseBody, postEmail } = require('./_lib');

const MAX_PER_IP_PER_HOUR = 5;
const HOUR_MS = 60 * 60 * 1000;
const DUPLICATE_WINDOW_MS = 7 * 24 * HOUR_MS;
const ALLOWED_SERVICES = ['Instalação', 'Manutenção', 'Higienização', 'Comercial', 'Residencial', 'Outros'];

function validate(input) {
  const name = clean(input.name, 120);
  const phoneRaw = clean(input.phone, 30);
  const phoneDigits = phoneRaw.replace(/\D/g, '');
  const email = clean(input.email, 254);

  if (name.length < 2) return { error: 'invalid_name' };
  if (phoneDigits.length < 10 || phoneDigits.length > 13) return { error: 'invalid_phone' };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'invalid_email' };
  if (input.consent !== true) return { error: 'consent_required' };

  const services = Array.isArray(input.services)
    ? [...new Set(input.services.map((s) => clean(s, 40)).filter((s) => ALLOWED_SERVICES.includes(s)))]
    : [];
  if (services.length === 0) return { error: 'invalid_services' };

  const cnpjDigits = clean(input.cnpj, 30).replace(/\D/g, '');
  if (cnpjDigits && cnpjDigits.length !== 14) return { error: 'invalid_cnpj' };

  return {
    value: {
      name,
      phone: phoneRaw,
      phone_digits: phoneDigits,
      email: email || null,
      city: clean(input.city, 80) || 'Ribeirão Preto – SP',
      services,
      cnpj: cnpjDigits || null,
      bio: cleanMultiline(input.bio, 1500) || null,
      utm_source: clean(input.utm_source, 200) || null,
      device: clean(input.device, 20) || null
    }
  };
}

function buildEmail(p, createdAt) {
  const when = new Date(createdAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const wa = `https://wa.me/${p.phone_digits.length <= 11 ? '55' + p.phone_digits : p.phone_digits}`;
  const rows = [
    ['Nome/Empresa', p.name],
    ['WhatsApp', p.phone],
    ['E-mail', p.email || '—'],
    ['Cidade', p.city],
    ['Serviços', p.services.join(', ')],
    ['CNPJ', p.cnpj || '—'],
    ['Sobre o trabalho', p.bio || '—'],
    ['Recebido em', when]
  ];
  const text = ['Novo cadastro de parceiro', '', ...rows.map(([k, v]) => `${k}: ${v}`), '', `Abrir WhatsApp: ${wa}`].join('\n');
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
  <h2 style="color:#092B55;margin:0 0 12px">Novo cadastro de parceiro</h2>
  <table style="width:100%;border-collapse:collapse;font-size:14px">
    ${rows.map(([k, v]) => `<tr><td style="padding:6px 10px;color:#64748b;border-bottom:1px solid #e2e8f0;width:130px">${escapeHtml(k)}</td><td style="padding:6px 10px;border-bottom:1px solid #e2e8f0"><strong>${escapeHtml(v)}</strong></td></tr>`).join('')}
  </table>
  <p style="margin:18px 0"><a href="${escapeHtml(wa)}" style="background:#10b981;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:bold;display:inline-block">Chamar no WhatsApp</a></p>
  <p style="color:#94a3b8;font-size:12px">Clima16 — o registro oficial está no painel admin (Parceiros).</p>
</div>`;
  return { subject: `🟢 Novo parceiro Clima16 — ${p.name}`.slice(0, 200), text, html };
}

async function select(baseUrl, key, query) {
  const res = await fetch(`${baseUrl}/rest/v1/partners?${query}`, { headers: supabaseHeaders(key) });
  if (!res.ok) throw new Error(`supabase_select_${res.status}`);
  return res.json();
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const input = parseBody(req);
  if (!input || JSON.stringify(input).length > 10000) return res.status(400).json({ ok: false, error: 'invalid_body' });

  // Honeypot: só robôs preenchem. Finge sucesso e não salva.
  if (typeof input.website === 'string' && input.website.trim() !== '') return res.status(200).json({ ok: true });

  const checked = validate(input);
  if (checked.error) return res.status(422).json({ ok: false, error: checked.error });
  const partner = checked.value;

  const baseUrl = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!baseUrl || !key) {
    console.error('[partners] server_not_configured');
    return res.status(500).json({ ok: false, error: 'server_not_configured' });
  }

  const ipHash = hashIp(clientIp(req));
  let status = 'novo';

  try {
    if (ipHash) {
      const since = new Date(Date.now() - HOUR_MS).toISOString();
      const recent = await select(baseUrl, key, `select=id&ip_hash=eq.${ipHash}&created_at=gte.${encodeURIComponent(since)}&limit=${MAX_PER_IP_PER_HOUR}`);
      if (Array.isArray(recent) && recent.length >= MAX_PER_IP_PER_HOUR) {
        return res.status(429).json({ ok: false, error: 'too_many_requests' });
      }
    }
    const sinceDup = new Date(Date.now() - DUPLICATE_WINDOW_MS).toISOString();
    const dup = await select(baseUrl, key, `select=id&phone_digits=eq.${partner.phone_digits}&created_at=gte.${encodeURIComponent(sinceDup)}&limit=1`);
    if (Array.isArray(dup) && dup.length > 0) status = 'duplicado';
  } catch (err) {
    console.error('[partners] precheck_failed', err && err.message);
  }

  let saved;
  try {
    const insert = await fetch(`${baseUrl}/rest/v1/partners`, {
      method: 'POST',
      headers: supabaseHeaders(key, { Prefer: 'return=representation' }),
      body: JSON.stringify({ ...partner, status, consent: true, consent_at: new Date().toISOString(), ip_hash: ipHash })
    });
    if (!insert.ok) {
      console.error('[partners] insert_failed', insert.status);
      return res.status(502).json({ ok: false, error: 'save_failed' });
    }
    const rows = await insert.json();
    saved = Array.isArray(rows) ? rows[0] : rows;
  } catch (err) {
    console.error('[partners] insert_error', err && err.message);
    return res.status(502).json({ ok: false, error: 'save_failed' });
  }

  if (status === 'novo') {
    const to = (process.env.LEAD_NOTIFY_TO || '').split(',').map((s) => s.trim()).filter(Boolean);
    if (to.length) {
      const { subject, text, html } = buildEmail(partner, (saved && saved.created_at) || new Date().toISOString());
      await postEmail({ to, subject, html, text, tag: 'partners' });
    }
  }

  return res.status(200).json({ ok: true });
};

module.exports._internals = { validate, buildEmail, ALLOWED_SERVICES };
