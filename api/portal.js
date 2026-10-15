/**
 * Clima16 - POST /api/portal
 * Área do parceiro: o técnico entra com e-mail e senha (criados pelo admin) e vê só os leads
 * encaminhados a ele, podendo atualizar o andamento.
 *
 * Ações: login | list | update_status | change_password
 * Autorização: o token do Supabase Auth precisa ser de um usuário cujo e-mail seja de um parceiro APROVADO.
 * A tabela continua fechada ao público; esta função usa a chave de serviço e filtra por partner_id.
 */
const { supabaseHeaders, parseBody, boundedFetch: fetch, loginThrottle } = require('./_lib');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PARTNER_STATUSES = ['recebido', 'em_atendimento', 'fechado', 'sem_resposta'];
// Só estes campos do lead chegam ao parceiro (nada de ip_hash, utm, notas internas).
const LEAD_FIELDS = 'id,created_at,dispatched_at,name,phone,phone_digits,email,neighborhood,service_type,property_type,has_equipment,btu,description,partner_status';

function authKeyOf(serviceKey) {
  return process.env.SUPABASE_ANON_KEY || serviceKey;
}

/** Parceiro APROVADO vinculado a este usuário do Supabase Auth (o vínculo é criado pelo admin). */
async function findPartnerByUser(baseUrl, serviceKey, userId) {
  if (typeof userId !== 'string' || !UUID_RE.test(userId)) return null;
  const r = await fetch(`${baseUrl}/rest/v1/partners?select=id,name,email,status,auth_user_id&auth_user_id=eq.${userId}&status=eq.aprovado&limit=1`, {
    headers: supabaseHeaders(serviceKey)
  });
  if (!r.ok) throw new Error(`select_${r.status}`);
  const rows = await r.json();
  return (Array.isArray(rows) ? rows : []).find((p) => p.auth_user_id === userId && p.status === 'aprovado') || null;
}

async function verifyPartner(req, baseUrl, serviceKey) {
  const m = /^Bearer\s+(\S+)$/i.exec(req.headers.authorization || req.headers.Authorization || '');
  if (!m) return null;
  const res = await fetch(`${baseUrl}/auth/v1/user`, {
    headers: { apikey: authKeyOf(serviceKey), Authorization: `Bearer ${m[1]}` }
  });
  if (!res.ok) return null;
  const user = await res.json();
  const partner = await findPartnerByUser(baseUrl, serviceKey, user && user.id);
  return partner ? { partner, token: m[1] } : null;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const baseUrl = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!baseUrl || !serviceKey) {
    console.error('[portal] missing_env');
    return res.status(500).json({ ok: false, error: 'server_not_configured' });
  }

  const body = parseBody(req);
  if (!body || typeof body.action !== 'string') return res.status(400).json({ ok: false, error: 'invalid_request' });

  try {
    if (body.action === 'login') {
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      const password = typeof body.password === 'string' ? body.password : '';
      if (!email || !password || password.length > 200) return res.status(400).json({ ok: false, error: 'invalid_credentials' });
      const throttle = await loginThrottle(baseUrl, serviceKey, req, 'portal', email);
      if (throttle.blocked) return res.status(429).json({ ok: false, error: 'too_many_attempts' });

      const r = await fetch(`${baseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: supabaseHeaders(authKeyOf(serviceKey)),
        body: JSON.stringify({ email, password })
      });
      if (r.status === 400 || r.status === 401 || r.status === 422) {
        await throttle.fail();
        return res.status(401).json({ ok: false, error: 'invalid_credentials' });
      }
      if (!r.ok) {
        console.error('[portal] login_failed', r.status);
        return res.status(502).json({ ok: false, error: 'auth_unavailable' });
      }
      const data = await r.json();
      if (!data || !data.access_token) return res.status(502).json({ ok: false, error: 'auth_unavailable' });
      // Mesma resposta para "sem acesso" e "senha errada": não revela quem é parceiro.
      const partner = await findPartnerByUser(baseUrl, serviceKey, data.user && data.user.id);
      if (!partner) {
        await throttle.fail();
        return res.status(401).json({ ok: false, error: 'invalid_credentials' });
      }
      return res.status(200).json({ ok: true, access_token: data.access_token, name: partner.name });
    }

    const auth = await verifyPartner(req, baseUrl, serviceKey);
    if (!auth) return res.status(401).json({ ok: false, error: 'unauthorized' });
    const { partner, token } = auth;

    if (body.action === 'list') {
      const r = await fetch(`${baseUrl}/rest/v1/leads?select=${LEAD_FIELDS}&partner_id=eq.${partner.id}&order=dispatched_at.desc.nullslast&limit=200`, {
        headers: supabaseHeaders(serviceKey)
      });
      if (!r.ok) {
        console.error('[portal] list_failed', r.status);
        return res.status(502).json({ ok: false, error: 'list_failed' });
      }
      return res.status(200).json({ ok: true, partner: { name: partner.name, email: partner.email }, leads: await r.json() });
    }

    if (body.action === 'update_status') {
      if (typeof body.id !== 'string' || !UUID_RE.test(body.id)) return res.status(400).json({ ok: false, error: 'invalid_id' });
      if (!PARTNER_STATUSES.includes(body.partner_status)) return res.status(400).json({ ok: false, error: 'invalid_status' });
      // O filtro partner_id garante que o parceiro só mexe nos próprios leads.
      const r = await fetch(`${baseUrl}/rest/v1/leads?id=eq.${body.id}&partner_id=eq.${partner.id}`, {
        method: 'PATCH',
        headers: supabaseHeaders(serviceKey, { Prefer: 'return=representation' }),
        body: JSON.stringify({ partner_status: body.partner_status })
      });
      if (!r.ok) {
        console.error('[portal] update_failed', r.status);
        return res.status(502).json({ ok: false, error: 'update_failed' });
      }
      const rows = await r.json();
      if (!Array.isArray(rows) || rows.length === 0) return res.status(404).json({ ok: false, error: 'not_found' });
      return res.status(200).json({ ok: true, partner_status: rows[0].partner_status });
    }

    if (body.action === 'change_password') {
      const password = typeof body.password === 'string' ? body.password : '';
      if (password.length < 8 || password.length > 72) return res.status(400).json({ ok: false, error: 'weak_password' });
      const r = await fetch(`${baseUrl}/auth/v1/user`, {
        method: 'PUT',
        headers: { apikey: authKeyOf(serviceKey), Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (!r.ok) {
        console.error('[portal] password_failed', r.status);
        return res.status(r.status === 422 ? 422 : 502).json({ ok: false, error: r.status === 422 ? 'weak_password' : 'password_failed' });
      }
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ ok: false, error: 'invalid_action' });
  } catch (err) {
    console.error('[portal] error', err && err.message);
    return res.status(502).json({ ok: false, error: 'upstream_error' });
  }
};

module.exports._internals = { PARTNER_STATUSES, LEAD_FIELDS };
