/**
 * Clima16 - POST /api/leads
 * Vercel Function (Node 18+, sem dependências).
 *
 * Fluxo: valida -> checa spam/duplicado -> salva no Supabase -> avisa por e-mail (Resend).
 * O banco é a fonte oficial; o e-mail é só aviso e nunca derruba o salvamento.
 *
 * Variáveis de ambiente (Vercel > Settings > Environment Variables):
 *   SUPABASE_URL                 https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY    chave secreta (service_role / sb_secret_...)  [NUNCA no código]
 *   RESEND_API_KEY               chave da Resend (opcional: sem ela não envia e-mail)
 *   LEAD_NOTIFY_TO               contato@clima16.com.br
 *   LEAD_FROM                    "Clima16 <avisos@envio.clima16.com.br>"
 *   IP_HASH_SALT                 texto aleatório qualquer (opcional)
 */
const crypto = require('node:crypto');

const MAX_PER_IP_PER_HOUR = 10;
const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

function clean(value, max) {
  if (typeof value !== 'string') return '';
  // remove caracteres de controle (inclui quebras de linha) e limita o tamanho
  return value.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

function cleanMultiline(value, max) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  return (req.headers['x-real-ip'] || (req.socket && req.socket.remoteAddress) || '').toString();
}

function hashIp(ip) {
  if (!ip) return null;
  const salt = process.env.IP_HASH_SALT || 'clima16';
  return crypto.createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}

function supabaseHeaders(key, extra = {}) {
  const headers = { apikey: key, 'Content-Type': 'application/json', ...extra };
  // Chaves antigas (JWT) vão também em Authorization; chaves novas (sb_secret_) só em apikey.
  if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`;
  return headers;
}

function parseBody(req) {
  const body = req.body;
  if (!body) return null;
  if (typeof body === 'string') {
    try { return JSON.parse(body); } catch { return null; }
  }
  return typeof body === 'object' ? body : null;
}

function validate(input) {
  const name = clean(input.name, 120);
  const phoneRaw = clean(input.phone, 30);
  const phoneDigits = phoneRaw.replace(/\D/g, '');
  const email = clean(input.email, 254);

  if (name.length < 2) return { error: 'invalid_name' };
  if (phoneDigits.length < 10 || phoneDigits.length > 13) return { error: 'invalid_phone' };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'invalid_email' };
  if (input.consent !== true) return { error: 'consent_required' };

  const service = clean(input.service_type, 120);
  if (!service) return { error: 'invalid_service' };

  return {
    value: {
      name,
      phone: phoneRaw,
      phone_digits: phoneDigits,
      email: email || null,
      neighborhood: clean(input.neighborhood, 120) || null,
      service_type: service,
      property_type: clean(input.property_type, 80) || null,
      has_equipment: clean(input.has_equipment, 80) || null,
      btu: clean(input.btu, 40) || null,
      description: cleanMultiline(input.description, 2000) || null,
      utm_source: clean(input.utm_source, 200) || null,
      utm_medium: clean(input.utm_medium, 200) || null,
      utm_campaign: clean(input.utm_campaign, 200) || null,
      utm_content: clean(input.utm_content, 200) || null,
      utm_term: clean(input.utm_term, 200) || null,
      gclid: clean(input.gclid, 300) || null,
      fbclid: clean(input.fbclid, 300) || null,
      referrer: clean(input.referrer, 500) || null,
      landing_page: clean(input.landing_page, 500) || null,
      device: clean(input.device, 20) || null
    }
  };
}

async function findRecent(baseUrl, key, query) {
  const res = await fetch(`${baseUrl}/rest/v1/leads?${query}`, { headers: supabaseHeaders(key) });
  if (!res.ok) throw new Error(`supabase_select_${res.status}`);
  return res.json();
}

function buildEmail(lead, createdAt, leadId) {
  const when = new Date(createdAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const wa = `https://wa.me/${lead.phone_digits.length <= 11 ? '55' + lead.phone_digits : lead.phone_digits}`;
  const origem = [lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(' / ') || 'direto';

  const protocol = leadId ? 'C16-' + String(leadId).replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase() : null;
  const rows = [
    ...(protocol ? [['Protocolo', protocol]] : []),
    ['Cliente', lead.name],
    ['WhatsApp', lead.phone],
    ['E-mail', lead.email || '—'],
    ['Serviço', lead.service_type],
    ['Bairro', lead.neighborhood || '—'],
    ['Imóvel', lead.property_type || '—'],
    ['Aparelho', [lead.has_equipment, lead.btu].filter(Boolean).join(' · ') || '—'],
    ['Descrição', lead.description || '—'],
    ['Origem', origem],
    ['Recebido em', when],
    ['Status', 'Novo']
  ];

  const text = ['Novo lead recebido', '', ...rows.map(([k, v]) => `${k}: ${v}`), '', `Abrir WhatsApp: ${wa}`].join('\n');

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
  <h2 style="color:#092B55;margin:0 0 12px">Novo lead recebido</h2>
  <table style="width:100%;border-collapse:collapse;font-size:14px">
    ${rows.map(([k, v]) => `<tr><td style="padding:6px 10px;color:#64748b;border-bottom:1px solid #e2e8f0;width:130px">${escapeHtml(k)}</td><td style="padding:6px 10px;border-bottom:1px solid #e2e8f0"><strong>${escapeHtml(v)}</strong></td></tr>`).join('')}
  </table>
  <p style="margin:18px 0"><a href="${escapeHtml(wa)}" style="background:#10b981;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:bold;display:inline-block">Chamar no WhatsApp</a></p>
  <p style="color:#94a3b8;font-size:12px">Clima16 — o registro oficial está no banco de dados.</p>
</div>`;

  return { subject: `🔵 Novo orçamento Clima16 — ${lead.service_type}`.slice(0, 200), text, html };
}

async function postEmail({ to, subject, html, text, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.LEAD_FROM;
  if (!apiKey || !from || !to || !to.length) return false;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const payload = { from, to, subject, html, text };
    if (replyTo) payload.reply_to = replyTo;
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    if (!res.ok) console.error('[leads] resend_failed', res.status);
    return res.ok;
  } catch (err) {
    console.error('[leads] resend_error', err && err.name);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function sendNotification(lead, createdAt, leadId) {
  const to = (process.env.LEAD_NOTIFY_TO || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!to.length) return false;
  const { subject, text, html } = buildEmail(lead, createdAt, leadId);
  return postEmail({ to, subject, html, text });
}

function protocolFor(leadId) {
  return leadId ? 'C16-' + String(leadId).replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase() : null;
}

function buildCustomerEmail(lead, leadId) {
  const protocol = protocolFor(leadId);
  const firstName = (lead.name || '').split(' ')[0] || 'Olá';
  const contactEmail = process.env.LEAD_NOTIFY_TO ? process.env.LEAD_NOTIFY_TO.split(',')[0].trim() : 'contato@clima16.com.br';
  const waText = `Olá! Fiz um pedido no Clima16${protocol ? ` (protocolo ${protocol})` : ''}. Serviço: ${lead.service_type}.`;
  const wa = `https://wa.me/5516981570034?text=${encodeURIComponent(waText)}`;
  const resumo = [
    ['Serviço', lead.service_type],
    ['Bairro', lead.neighborhood ? `${lead.neighborhood}, Ribeirão Preto – SP` : 'Ribeirão Preto – SP'],
    ...(protocol ? [['Protocolo', protocol]] : [])
  ];

  const text = [
    `Olá, ${firstName}!`,
    '',
    'Recebemos o seu pedido de orçamento no Clima16.',
    '',
    ...resumo.map(([k, v]) => `${k}: ${v}`),
    '',
    'O que acontece agora:',
    '1. Vamos entrar em contato, normalmente pelo WhatsApp, para confirmar os detalhes.',
    '2. Seu pedido pode ser encaminhado a profissionais da região para você comparar propostas.',
    '3. Você escolhe livremente, sem compromisso.',
    '',
    `Quer agilizar? Fale com a gente: ${wa}`,
    '',
    `Você recebeu este e-mail porque preencheu o formulário em clima16.com.br. Dúvidas: ${contactEmail}`
  ].join('\n');

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
  <h2 style="color:#092B55;margin:0 0 8px">Olá, ${escapeHtml(firstName)}!</h2>
  <p style="margin:0 0 16px;color:#334155">Recebemos o seu pedido de orçamento no <strong>Clima16</strong>.</p>
  <table style="width:100%;border-collapse:collapse;font-size:14px;background:#f8fafc;border-radius:8px">
    ${resumo.map(([k, v]) => `<tr><td style="padding:8px 12px;color:#64748b;width:110px">${escapeHtml(k)}</td><td style="padding:8px 12px"><strong>${escapeHtml(v)}</strong></td></tr>`).join('')}
  </table>
  <h3 style="color:#092B55;margin:22px 0 8px;font-size:15px">O que acontece agora</h3>
  <ol style="padding-left:18px;margin:0;color:#334155;font-size:14px;line-height:1.6">
    <li>Vamos entrar em contato, normalmente pelo WhatsApp, para confirmar os detalhes.</li>
    <li>Seu pedido pode ser encaminhado a profissionais da região para você comparar propostas.</li>
    <li>Você escolhe livremente, sem compromisso.</li>
  </ol>
  <p style="margin:20px 0"><a href="${escapeHtml(wa)}" style="background:#10b981;color:#fff;text-decoration:none;padding:11px 20px;border-radius:8px;font-weight:bold;display:inline-block">Falar no WhatsApp agora</a></p>
  <p style="color:#94a3b8;font-size:12px;line-height:1.5">Você recebeu este e-mail porque preencheu o formulário em clima16.com.br. Dúvidas: ${escapeHtml(contactEmail)}</p>
</div>`;

  return { subject: `Recebemos seu pedido — Clima16${protocol ? ` (${protocol})` : ''}`.slice(0, 200), text, html };
}

async function sendCustomerConfirmation(lead, leadId) {
  if (!lead.email) return false;
  const { subject, text, html } = buildCustomerEmail(lead, leadId);
  const replyTo = (process.env.LEAD_NOTIFY_TO || '').split(',')[0].trim() || undefined;
  return postEmail({ to: [lead.email], subject, html, text, replyTo });
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const input = parseBody(req);
  if (!input || JSON.stringify(input).length > 20000) {
    return res.status(400).json({ ok: false, error: 'invalid_body' });
  }

  // Honeypot: campo escondido que só robôs preenchem. Finge sucesso e não salva.
  if (typeof input.website === 'string' && input.website.trim() !== '') {
    return res.status(200).json({ ok: true });
  }

  const checked = validate(input);
  if (checked.error) return res.status(422).json({ ok: false, error: checked.error });
  const lead = checked.value;

  const baseUrl = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!baseUrl || !key) {
    console.error('[leads] server_not_configured');
    return res.status(500).json({ ok: false, error: 'server_not_configured' });
  }

  const ipHash = hashIp(clientIp(req));
  let status = 'novo';

  // Antiabuso: se a checagem falhar, segue em frente (melhor guardar o lead do que perdê-lo).
  try {
    if (ipHash) {
      const since = new Date(Date.now() - HOUR_MS).toISOString();
      const recent = await findRecent(baseUrl, key,
        `select=id&ip_hash=eq.${ipHash}&created_at=gte.${encodeURIComponent(since)}&limit=${MAX_PER_IP_PER_HOUR}`);
      if (Array.isArray(recent) && recent.length >= MAX_PER_IP_PER_HOUR) {
        return res.status(429).json({ ok: false, error: 'too_many_requests' });
      }
    }
    const sinceDup = new Date(Date.now() - DUPLICATE_WINDOW_MS).toISOString();
    const dup = await findRecent(baseUrl, key,
      `select=id&phone_digits=eq.${lead.phone_digits}&created_at=gte.${encodeURIComponent(sinceDup)}&limit=1`);
    if (Array.isArray(dup) && dup.length > 0) status = 'duplicado';
  } catch (err) {
    console.error('[leads] precheck_failed', err && err.message);
  }

  let saved;
  try {
    const insert = await fetch(`${baseUrl}/rest/v1/leads`, {
      method: 'POST',
      headers: supabaseHeaders(key, { Prefer: 'return=representation' }),
      body: JSON.stringify({
        ...lead,
        status,
        consent: true,
        consent_at: new Date().toISOString(),
        ip_hash: ipHash
      })
    });
    if (!insert.ok) {
      console.error('[leads] insert_failed', insert.status);
      return res.status(502).json({ ok: false, error: 'save_failed' });
    }
    const rows = await insert.json();
    saved = Array.isArray(rows) ? rows[0] : rows;
  } catch (err) {
    console.error('[leads] insert_error', err && err.message);
    return res.status(502).json({ ok: false, error: 'save_failed' });
  }

  // Lead já está salvo. O aviso por e-mail não pode mudar o resultado.
  if (status === 'novo') {
    await sendNotification(lead, (saved && saved.created_at) || new Date().toISOString(), saved && saved.id);
    // Confirmação ao cliente (só se informou e-mail). Falha aqui nunca derruba o pedido.
    await sendCustomerConfirmation(lead, saved && saved.id);
  }

  return res.status(200).json({ ok: true, id: saved && saved.id });
};

module.exports._internals = { validate, clean, escapeHtml, buildEmail, buildCustomerEmail };
