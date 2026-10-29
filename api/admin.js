/**
 * Clima16 - POST /api/admin
 * Vercel Function (Node 18+, sem dependências). Painel de leads com login.
 *
 * Ações (JSON): { action: 'login' | 'list' | 'funnel' | 'create_manual' | 'update' | 'delete', ... }
 *  - login:  e-mail + senha de um usuário do Supabase Auth que esteja na lista de admins.
 *  - list/update/delete: exigem "Authorization: Bearer <access_token>" do login.
 *
 * O navegador NUNCA fala direto com a tabela: ela continua fechada (RLS, sem política pública).
 * Esta função confere o token no Supabase, confere o e-mail na lista de admins e só então
 * usa a chave de serviço.
 *
 * Variáveis de ambiente (Vercel):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   (já existem)
 *   SUPABASE_ANON_KEY   chave pública (anon / sb_publishable_...) usada no login. Se faltar, usa a de serviço.
 *   ADMIN_EMAILS        e-mails autorizados, separados por vírgula. Se faltar, usa LEAD_NOTIFY_TO.
 */

const crypto = require('node:crypto');
const { escapeHtml, postEmail, boundedFetch, loginThrottle } = require('./_lib');
const fetch = boundedFetch;

const STATUSES = ['novo', 'em_contato', 'encaminhado', 'convertido', 'perdido', 'invalido', 'duplicado'];
const PARTNER_STATUSES = ['novo', 'em_analise', 'aprovado', 'recusado', 'duplicado'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LIST_LIMIT = 1000;

function supabaseHeaders(key, extra = {}) {
  const headers = { apikey: key, 'Content-Type': 'application/json', ...extra };
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

function adminEmails() {
  const raw = process.env.ADMIN_EMAILS || process.env.LEAD_NOTIFY_TO || '';
  return raw.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
}

function isAdminEmail(email) {
  return typeof email === 'string' && adminEmails().includes(email.trim().toLowerCase());
}

/** Se ADMIN_USER_IDS estiver configurado na Vercel, o login de admin também precisa ter um desses IDs. */
function isAllowedAdminUser(user) {
  const ids = (process.env.ADMIN_USER_IDS || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!ids.length) return true;
  return !!(user && typeof user.id === 'string' && ids.includes(user.id));
}

function cleanText(value, max) {
  if (typeof value !== 'string') return null;
  const v = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
  return v || null;
}

/** Valida os campos editáveis. Retorna { patch } ou { error }. */
function buildPatch(input) {
  const patch = {};
  if (input.status !== undefined) {
    if (!STATUSES.includes(input.status)) return { error: 'invalid_status' };
    patch.status = input.status;
  }
  if (input.assigned_partner !== undefined) patch.assigned_partner = cleanText(input.assigned_partner, 120);
  if (input.notes !== undefined) patch.notes = cleanText(input.notes, 2000);
  for (const field of ['first_contact_at', 'quoted_at', 'closed_at']) {
    if (input[field] === undefined) continue;
    if (input[field] !== null && (typeof input[field] !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(input[field]) || !Number.isFinite(Date.parse(input[field])))) return { error: 'invalid_date' };
    patch[field] = input[field] === null ? null : new Date(input[field]).toISOString();
  }
  if (input.service_value !== undefined) {
    if (input.service_value !== null && (typeof input.service_value !== 'number' || !Number.isFinite(input.service_value) || input.service_value < 0 || input.service_value > 10000000)) return { error: 'invalid_value' };
    patch.service_value = input.service_value;
  }
  if (Object.keys(patch).length === 0) return { error: 'nothing_to_update' };
  return { patch };
}


async function getRows(baseUrl, serviceKey, path) {
  const r = await fetch(`${baseUrl}/rest/v1/${path}`, { headers: supabaseHeaders(serviceKey) });
  if (!r.ok) throw new Error(`select_${r.status}`);
  return r.json();
}

function protocolFor(id) {
  return 'C16-' + String(id || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
}

function leadSummaryText(lead) {
  return [
    `Novo lead Clima16 (${protocolFor(lead.id)})`,
    `Cliente: ${lead.name}`,
    `WhatsApp: ${lead.phone}`,
    `Serviço: ${lead.service_type}`,
    `Bairro: ${lead.neighborhood || '—'}, Ribeirão Preto`,
    ...(lead.property_type ? [`Imóvel: ${lead.property_type}`] : []),
    ...(lead.btu ? [`Capacidade: ${lead.btu}`] : []),
    ...(lead.description ? [`Detalhes: ${lead.description}`] : [])
  ].join('\n');
}

function waLink(digits, text) {
  const d = String(digits || '').replace(/\D/g, '');
  const n = d.length <= 11 ? `55${d}` : d;
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

function buildPartnerEmail(lead, partner, hasAccess) {
  const rows = [
    ['Protocolo', protocolFor(lead.id)],
    ['Cliente', lead.name],
    ['WhatsApp', lead.phone],
    ['Serviço', lead.service_type],
    ['Bairro', `${lead.neighborhood || '—'}, Ribeirão Preto`],
    ['Imóvel', lead.property_type || '—'],
    ['Capacidade', lead.btu || '—'],
    ['Detalhes', lead.description || '—']
  ];
  const wa = waLink(lead.phone_digits, `Olá, ${lead.name}! Aqui é da ${partner.name}, recebi seu pedido de orçamento pelo Clima16 (${protocolFor(lead.id)}).`);
  const text = [`Olá, ${partner.name}!`, '', 'Você recebeu um novo pedido de orçamento pelo Clima16:', '', ...rows.map(([k, v]) => `${k}: ${v}`), '', `Chamar o cliente: ${wa}`, '', 'Entre em contato o quanto antes. O cliente pode estar comparando propostas.'].join('\n');
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
  <h2 style="color:#092B55;margin:0 0 8px">Novo pedido de orçamento</h2>
  <p style="margin:0 0 14px;color:#334155">Olá, ${escapeHtml(partner.name)}! Este pedido foi encaminhado a você pelo Clima16.</p>
  <table style="width:100%;border-collapse:collapse;font-size:14px">
    ${rows.map(([k, v]) => `<tr><td style="padding:6px 10px;color:#64748b;border-bottom:1px solid #e2e8f0;width:120px">${escapeHtml(k)}</td><td style="padding:6px 10px;border-bottom:1px solid #e2e8f0"><strong>${escapeHtml(v)}</strong></td></tr>`).join('')}
  </table>
  <p style="margin:18px 0"><a href="${escapeHtml(wa)}" style="background:#10b981;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:bold;display:inline-block">Chamar o cliente no WhatsApp</a></p>
  ${hasAccess ? '<p style="font-size:13px;color:#334155">Depois do contato, atualize o andamento na <a href="https://clima16.com.br/parceiro">Área do parceiro</a>.</p>' : ''}
  <p style="color:#94a3b8;font-size:12px">Entre em contato o quanto antes: o cliente pode estar comparando propostas. Clima16 · Ribeirão Preto.</p>
</div>`;
  return { subject: `Novo lead Clima16 — ${lead.service_type} (${lead.neighborhood || 'Ribeirão Preto'})`.slice(0, 200), text, html };
}

async function login(baseUrl, serviceKey, body, req) {
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!email || !password || password.length > 200) return { status: 400, json: { ok: false, error: 'invalid_credentials' } };

  const throttle = await loginThrottle(baseUrl, serviceKey, req, 'admin', email);
  if (throttle.blocked) return { status: 429, json: { ok: false, error: 'too_many_attempts' } };

  const authKey = process.env.SUPABASE_ANON_KEY || serviceKey;
  const res = await fetch(`${baseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: supabaseHeaders(authKey),
    body: JSON.stringify({ email, password })
  });
  if (res.status === 400 || res.status === 401 || res.status === 422) {
    await throttle.fail();
    return { status: 401, json: { ok: false, error: 'invalid_credentials' } };
  }
  if (!res.ok) {
    console.error('[admin] login_failed', res.status);
    return { status: 502, json: { ok: false, error: 'auth_unavailable' } };
  }
  const data = await res.json();
  if (!data || !data.access_token) return { status: 502, json: { ok: false, error: 'auth_unavailable' } };
  // A lista de admins é conferida depois da senha: mesma resposta e mesmo tempo para quem não é admin.
  if (!isAdminEmail(email) || !isAllowedAdminUser(data.user)) {
    await throttle.fail();
    return { status: 401, json: { ok: false, error: 'invalid_credentials' } };
  }
  return {
    status: 200,
    json: { ok: true, access_token: data.access_token, expires_in: data.expires_in || 3600, email }
  };
}

/** Confere o token no Supabase e o e-mail na lista de admins. */
async function verifyAdmin(req, baseUrl, serviceKey) {
  const header = req.headers.authorization || req.headers.Authorization || '';
  const m = /^Bearer\s+(\S+)$/i.exec(header);
  if (!m) return null;
  const authKey = process.env.SUPABASE_ANON_KEY || serviceKey;
  const res = await fetch(`${baseUrl}/auth/v1/user`, {
    headers: { apikey: authKey, Authorization: `Bearer ${m[1]}` }
  });
  if (!res.ok) return null;
  const user = await res.json();
  return user && isAdminEmail(user.email) && isAllowedAdminUser(user) ? user.email : null;
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
    console.error('[admin] missing_env');
    return res.status(500).json({ ok: false, error: 'server_not_configured' });
  }
  if (adminEmails().length === 0) {
    console.error('[admin] no_admin_emails');
    return res.status(500).json({ ok: false, error: 'server_not_configured' });
  }

  const body = parseBody(req);
  if (!body || typeof body.action !== 'string') return res.status(400).json({ ok: false, error: 'invalid_request' });

  try {
    if (body.action === 'login') {
      const out = await login(baseUrl, serviceKey, body, req);
      return res.status(out.status).json(out.json);
    }

    const admin = await verifyAdmin(req, baseUrl, serviceKey);
    if (!admin) return res.status(401).json({ ok: false, error: 'unauthorized' });

    if (body.action === 'retry_notifications') {
      if (typeof body.id !== 'string' || !UUID_RE.test(body.id)) return res.status(400).json({ ok: false, error: 'invalid_id' });
      const [lead] = await getRows(baseUrl, serviceKey, `leads?id=eq.${body.id}&select=*`);
      if (!lead) return res.status(404).json({ ok: false, error: 'not_found' });
      if (['duplicado', 'invalido'].includes(lead.status)) return res.status(409).json({ ok: false, error: 'invalid_lead' });
      const { deliverNotifications } = require('./leads')._internals;
      const result = await deliverNotifications(baseUrl, serviceKey, lead, lead, `retry-${Date.now()}`);
      return res.status(200).json({ ok: true, notifications: result });
    }

    if (body.action === 'list') {
      const r = await fetch(`${baseUrl}/rest/v1/leads?select=*&order=created_at.desc&limit=${LIST_LIMIT}`, {
        headers: supabaseHeaders(serviceKey)
      });
      if (!r.ok) {
        console.error('[admin] list_failed', r.status);
        return res.status(502).json({ ok: false, error: 'list_failed' });
      }
      return res.status(200).json({ ok: true, leads: await r.json(), admin });
    }

    if (body.action === 'create_manual') {
      // Pedido que chegou fora do site (WhatsApp, Instagram, telefone, indicação): entra no painel sem disparar avisos.
      const MANUAL_ORIGINS = ['whatsapp', 'instagram', 'telefone', 'indicacao'];
      if (!MANUAL_ORIGINS.includes(body.origin)) return res.status(400).json({ ok: false, error: 'invalid_origin' });
      if (body.consent !== true) return res.status(400).json({ ok: false, error: 'consent_required' });
      const { validate } = require('./leads')._internals;
      const checked = validate({
        name: body.name, phone: body.phone, email: body.email, service_type: body.service_type,
        neighborhood: body.neighborhood, property_type: body.property_type, description: body.description, consent: true,
        found_via: body.found_via
      });
      if (checked.error) return res.status(400).json({ ok: false, error: checked.error });
      if (!checked.value.found_via) delete checked.value.found_via;
      const now = new Date().toISOString();
      const r = await fetch(`${baseUrl}/rest/v1/leads`, {
        method: 'POST',
        headers: supabaseHeaders(serviceKey, { Prefer: 'return=representation' }),
        body: JSON.stringify({
          ...checked.value,
          utm_source: body.origin,
          utm_medium: 'manual',
          device: null,
          status: 'novo',
          consent: true,
          consent_at: now
        })
      });
      if (!r.ok) {
        console.error('[admin] create_manual_failed', r.status);
        return res.status(502).json({ ok: false, error: 'create_failed' });
      }
      const rows = await r.json();
      return res.status(200).json({ ok: true, lead: Array.isArray(rows) ? rows[0] : rows });
    }

    if (body.action === 'funnel') {
      // Funil do formulário (30 dias). Tabela criada por supabase/migrations/20261027_form_funnel.sql
      const since = encodeURIComponent(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      const r = await fetch(`${baseUrl}/rest/v1/form_funnel_events?select=event,entry,created_at&created_at=gte.${since}&order=created_at.desc&limit=10000`, {
        headers: supabaseHeaders(serviceKey)
      });
      if (!r.ok) {
        console.error('[admin] funnel_failed', r.status);
        return res.status(502).json({ ok: false, error: 'funnel_unavailable' });
      }
      const rows = await r.json();
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const counts = { d30: {}, d7: {}, home: {}, servico: {} };
      (Array.isArray(rows) ? rows : []).forEach((row) => {
        const ev = String(row.event || '');
        counts.d30[ev] = (counts.d30[ev] || 0) + 1;
        if (new Date(row.created_at).getTime() >= weekAgo) counts.d7[ev] = (counts.d7[ev] || 0) + 1;
        if (row.entry === 'servico' || row.entry === 'home') counts[row.entry][ev] = (counts[row.entry][ev] || 0) + 1;
      });
      return res.status(200).json({ ok: true, funnel: counts });
    }

    if (body.action === 'list_partners') {
      const r = await fetch(`${baseUrl}/rest/v1/partners?select=*&order=created_at.desc&limit=${LIST_LIMIT}`, {
        headers: supabaseHeaders(serviceKey)
      });
      if (!r.ok) {
        console.error('[admin] list_partners_failed', r.status);
        return res.status(502).json({ ok: false, error: 'list_failed' });
      }
      const partners = await r.json();
      // Último login no portal: vem do Supabase Auth (só para quem já tem acesso criado).
      const withAccess = (Array.isArray(partners) ? partners : [])
        .filter((p) => typeof p.auth_user_id === 'string' && UUID_RE.test(p.auth_user_id))
        .slice(0, 50);
      await Promise.all(withAccess.map(async (p) => {
        p.last_sign_in_at = null;
        try {
          const u = await fetch(`${baseUrl}/auth/v1/admin/users/${p.auth_user_id}`, {
            headers: supabaseHeaders(serviceKey),
            signal: AbortSignal.timeout(4000)
          });
          if (!u.ok) return;
          const data = await u.json();
          const user = data && data.user ? data.user : data;
          if (user && typeof user.last_sign_in_at === 'string' && !Number.isNaN(Date.parse(user.last_sign_in_at))) {
            p.last_sign_in_at = user.last_sign_in_at;
          }
        } catch { /* sem a data, o painel mostra "sem informação" */ }
      }));
      return res.status(200).json({ ok: true, partners });
    }

    if (body.action === 'delete_partner') {
      if (typeof body.id !== 'string' || !UUID_RE.test(body.id)) return res.status(400).json({ ok: false, error: 'invalid_id' });
      const [partner] = await getRows(baseUrl, serviceKey, `partners?id=eq.${body.id}&select=id,auth_user_id`);
      if (!partner) return res.status(404).json({ ok: false, error: 'not_found' });
      // Remove também o login do portal, se existir (falha aqui não impede a exclusão do cadastro).
      if (partner.auth_user_id) {
        try {
          const r = await fetch(`${baseUrl}/auth/v1/admin/users/${partner.auth_user_id}`, { method: 'DELETE', headers: supabaseHeaders(serviceKey) });
          if (!r.ok && r.status !== 404) console.error('[admin] delete_auth_user_failed', r.status);
        } catch (err) {
          console.error('[admin] delete_auth_user_error', err && err.message);
        }
      }
      const r = await fetch(`${baseUrl}/rest/v1/partners?id=eq.${body.id}`, { method: 'DELETE', headers: supabaseHeaders(serviceKey) });
      if (!r.ok) {
        console.error('[admin] delete_partner_failed', r.status);
        return res.status(502).json({ ok: false, error: 'delete_failed' });
      }
      return res.status(200).json({ ok: true });
    }

    if (body.action === 'update_partner') {
      if (typeof body.id !== 'string' || !UUID_RE.test(body.id)) return res.status(400).json({ ok: false, error: 'invalid_id' });
      const patch = {};
      if (body.status !== undefined) {
        if (!PARTNER_STATUSES.includes(body.status)) return res.status(400).json({ ok: false, error: 'invalid_status' });
        patch.status = body.status;
      }
      if (body.notes !== undefined) patch.notes = cleanText(body.notes, 2000);
      if (Object.keys(patch).length === 0) return res.status(400).json({ ok: false, error: 'nothing_to_update' });
      const r = await fetch(`${baseUrl}/rest/v1/partners?id=eq.${body.id}`, {
        method: 'PATCH',
        headers: supabaseHeaders(serviceKey, { Prefer: 'return=representation' }),
        body: JSON.stringify(patch)
      });
      if (!r.ok) {
        console.error('[admin] update_partner_failed', r.status);
        return res.status(502).json({ ok: false, error: 'update_failed' });
      }
      const rows = await r.json();
      return res.status(200).json({ ok: true, partner: Array.isArray(rows) ? rows[0] : rows });
    }

    if (body.action === 'dispatch') {
      if (typeof body.lead_id !== 'string' || !UUID_RE.test(body.lead_id) || typeof body.partner_id !== 'string' || !UUID_RE.test(body.partner_id)) {
        return res.status(400).json({ ok: false, error: 'invalid_id' });
      }
      const [lead] = await getRows(baseUrl, serviceKey, `leads?id=eq.${body.lead_id}&select=*`);
      const [partner] = await getRows(baseUrl, serviceKey, `partners?id=eq.${body.partner_id}&select=*`);
      if (!lead || !partner) return res.status(404).json({ ok: false, error: 'not_found' });
      if (partner.status !== 'aprovado') return res.status(409).json({ ok: false, error: 'partner_not_approved' });

      const upd = await fetch(`${baseUrl}/rest/v1/leads?id=eq.${lead.id}`, {
        method: 'PATCH',
        headers: supabaseHeaders(serviceKey, { Prefer: 'return=representation' }),
        body: JSON.stringify({
          partner_id: partner.id,
          assigned_partner: partner.name,
          status: 'encaminhado',
          partner_status: 'recebido',
          dispatched_at: new Date().toISOString()
        })
      });
      if (!upd.ok) {
        console.error('[admin] dispatch_failed', upd.status);
        return res.status(502).json({ ok: false, error: 'update_failed' });
      }
      const rows = await upd.json();

      let emailed = false;
      if (partner.email) {
        const { subject, text, html } = buildPartnerEmail(lead, partner, !!partner.auth_user_id);
        emailed = await postEmail({ to: [partner.email], subject, html, text, replyTo: (process.env.LEAD_NOTIFY_TO || '').split(',')[0].trim() || undefined, tag: 'admin', idempotencyKey: `${lead.id}/dispatch/${partner.id}/${new Date().toISOString().slice(0, 13)}` });
      }
      return res.status(200).json({
        ok: true,
        lead: Array.isArray(rows) ? rows[0] : rows,
        emailed,
        partner_whatsapp_url: waLink(partner.phone_digits, leadSummaryText(lead))
      });
    }

    if (body.action === 'create_partner_access') {
      if (typeof body.partner_id !== 'string' || !UUID_RE.test(body.partner_id)) return res.status(400).json({ ok: false, error: 'invalid_id' });
      const [partner] = await getRows(baseUrl, serviceKey, `partners?id=eq.${body.partner_id}&select=*`);
      if (!partner) return res.status(404).json({ ok: false, error: 'not_found' });
      if (partner.status !== 'aprovado') return res.status(409).json({ ok: false, error: 'partner_not_approved' });
      if (!partner.email) return res.status(422).json({ ok: false, error: 'partner_without_email' });
      // Um parceiro nunca pode ganhar login com o e-mail de um admin (viraria admin).
      if (isAdminEmail(partner.email)) return res.status(409).json({ ok: false, error: 'email_reserved' });

      const password = crypto.randomBytes(9).toString('base64url');
      if (partner.auth_user_id) {
        const r = await fetch(`${baseUrl}/auth/v1/admin/users/${partner.auth_user_id}`, {
          method: 'PUT',
          headers: supabaseHeaders(serviceKey),
          body: JSON.stringify({ password })
        });
        if (!r.ok) {
          console.error('[admin] reset_access_failed', r.status);
          return res.status(502).json({ ok: false, error: 'access_failed' });
        }
      } else {
        const r = await fetch(`${baseUrl}/auth/v1/admin/users`, {
          method: 'POST',
          headers: supabaseHeaders(serviceKey),
          body: JSON.stringify({ email: partner.email.toLowerCase(), password, email_confirm: true })
        });
        if (r.status === 422 || r.status === 409) return res.status(409).json({ ok: false, error: 'user_exists' });
        if (!r.ok) {
          console.error('[admin] create_access_failed', r.status);
          return res.status(502).json({ ok: false, error: 'access_failed' });
        }
        const created = await r.json();
        const userId = created.id || (created.user && created.user.id);
        if (!userId || !UUID_RE.test(userId)) return res.status(502).json({ ok: false, error: 'access_failed' });
        let linked;
        let linkedRows = [];
        try {
          linked = await fetch(`${baseUrl}/rest/v1/partners?id=eq.${partner.id}`, {
            method: 'PATCH',
            headers: supabaseHeaders(serviceKey, { Prefer: 'return=representation' }),
            body: JSON.stringify({ auth_user_id: userId, access_created_at: new Date().toISOString() })
          });
          linkedRows = linked.ok ? await linked.json() : [];
        } catch {
          // Um timeout não prova que a gravação falhou: confirma antes de desfazer.
          try {
            linkedRows = await getRows(baseUrl, serviceKey, `partners?id=eq.${partner.id}&select=id,auth_user_id`);
            linked = { ok: true };
          } catch { return res.status(502).json({ ok: false, error: 'access_link_unknown' }); }
        }
        if (!linked.ok || !Array.isArray(linkedRows) || !linkedRows.some(row => row.id === partner.id && row.auth_user_id === userId)) {
          const cleanup = await fetch(`${baseUrl}/auth/v1/admin/users/${userId}`, { method: 'DELETE', headers: supabaseHeaders(serviceKey) });
          if (!cleanup.ok) console.error('[admin] orphan_cleanup_failed', cleanup.status);
          return res.status(502).json({ ok: false, error: 'access_link_failed' });
        }
      }
      return res.status(200).json({ ok: true, email: partner.email, password });
    }

    if (body.action === 'update' || body.action === 'delete') {
      if (typeof body.id !== 'string' || !UUID_RE.test(body.id)) return res.status(400).json({ ok: false, error: 'invalid_id' });

      if (body.action === 'delete') {
        const r = await fetch(`${baseUrl}/rest/v1/leads?id=eq.${body.id}`, {
          method: 'DELETE',
          headers: supabaseHeaders(serviceKey)
        });
        if (!r.ok) {
          console.error('[admin] delete_failed', r.status);
          return res.status(502).json({ ok: false, error: 'delete_failed' });
        }
        return res.status(200).json({ ok: true });
      }

      const built = buildPatch(body);
      if (built.error) return res.status(400).json({ ok: false, error: built.error });
      const r = await fetch(`${baseUrl}/rest/v1/leads?id=eq.${body.id}`, {
        method: 'PATCH',
        headers: supabaseHeaders(serviceKey, { Prefer: 'return=representation' }),
        body: JSON.stringify(built.patch)
      });
      if (!r.ok) {
        console.error('[admin] update_failed', r.status);
        return res.status(502).json({ ok: false, error: 'update_failed' });
      }
      const rows = await r.json();
      return res.status(200).json({ ok: true, lead: Array.isArray(rows) ? rows[0] : rows });
    }

    return res.status(400).json({ ok: false, error: 'invalid_action' });
  } catch (err) {
    console.error('[admin] error', err && err.message);
    return res.status(502).json({ ok: false, error: 'upstream_error' });
  }
};

module.exports._internals = { buildPatch, isAdminEmail, STATUSES };
