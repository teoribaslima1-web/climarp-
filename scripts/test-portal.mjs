// Testes das funções /api/portal (parceiro) e das ações de encaminhamento do /api/admin, com Supabase/Resend simulados.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const portal = require('../api/portal.js');
const admin = require('../api/admin.js');

const results = [];
async function test(name, fn) {
  try { await fn(); results.push([true, name]); } catch (err) { results.push([false, name, err]); }
}
function mockRes() {
  const res = { statusCode: 200, body: null, headers: {} };
  res.setHeader = (k, v) => { res.headers[k] = v; };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  return res;
}

const LEAD_ID = '3b6d1a2e-1111-4222-8333-444455556666';
const PARTNER_ID = '4b6d1a2e-1111-4222-8333-444455556666';
const OTHER_LEAD = '5b6d1a2e-1111-4222-8333-444455556666';
const AUTH_ID = '6b6d1a2e-1111-4222-8333-444455556666';

process.env.SUPABASE_URL = 'https://proj.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_test';
process.env.SUPABASE_ANON_KEY = 'sb_publishable_test';
process.env.LEAD_NOTIFY_TO = 'contato@clima16.com.br';
process.env.RESEND_API_KEY = 're_test';
process.env.LEAD_FROM = 'Clima16 <avisos@envio.clima16.com.br>';
delete process.env.ADMIN_EMAILS;

const lead = { id: LEAD_ID, name: 'Maria', phone: '(16) 99999-0000', phone_digits: '16999990000', service_type: 'Instalação', neighborhood: 'Centro', description: '<b>x</b>' };
let partner;
let calls;
function mockFetch(opts = {}) {
  partner = { id: PARTNER_ID, name: 'Marcos Refrigeração', email: 'marcos@x.com', phone_digits: '16988887777', status: 'aprovado', auth_user_id: null, ...(opts.partner || {}) };
  calls = [];
  globalThis.fetch = async (url, o = {}) => {
    calls.push({ url, opts: o });
    const json = (status, body) => ({ ok: status < 300, status, json: async () => body });
    const method = o.method || 'GET';
    if (url.includes('api.resend.com')) return json(200, { id: 'e' });
    if (url.includes('/auth/v1/token')) return JSON.parse(o.body).password === 'certa' ? json(200, { access_token: 'ptok' }) : json(400, {});
    if (url.endsWith('/auth/v1/user') && method === 'GET') {
      const bearer = o.headers.Authorization;
      if (bearer === 'Bearer ptok') return json(200, { email: opts.userEmail || 'Marcos@X.com' });
      if (bearer === 'Bearer atok') return json(200, { email: 'contato@clima16.com.br' });
      return json(401, {});
    }
    if (url.endsWith('/auth/v1/user') && method === 'PUT') return json(opts.pwStatus || 200, {});
    if (url.includes('/auth/v1/admin/users') && method === 'POST') return opts.userExists ? json(422, {}) : json(200, { id: AUTH_ID });
    if (url.includes('/auth/v1/admin/users/') && method === 'PUT') return json(200, {});
    if (url.includes('/auth/v1/admin/users/') && method === 'DELETE') return json(200, {});
    if (url.includes('/rest/v1/partners') && method === 'DELETE') return json(204, null);
    if (url.includes('/rest/v1/partners') && method === 'GET') {
      if (url.includes('email=ilike.')) return json(200, partner.status === 'aprovado' ? [partner] : []);
      return json(200, [partner]);
    }
    if (url.includes('/rest/v1/partners') && method === 'PATCH') return opts.linkFails ? json(500, {}) : json(200, [{ ...partner, ...JSON.parse(o.body) }]);
    if (url.includes('/rest/v1/leads') && method === 'GET') {
      if (url.includes('partner_id=eq.')) return json(200, [{ id: LEAD_ID, name: 'Maria', partner_status: 'recebido' }]);
      return json(200, [lead]);
    }
    if (url.includes('/rest/v1/leads') && method === 'PATCH') {
      if (url.includes(`id=eq.${OTHER_LEAD}`)) return json(200, []);
      return json(200, [{ ...lead, ...JSON.parse(o.body) }]);
    }
    return json(500, {});
  };
}
async function call(handler, body, token) {
  const res = mockRes();
  await handler({ method: 'POST', headers: token ? { authorization: `Bearer ${token}` } : {}, body }, res);
  return res;
}

// ------------------------------ portal ------------------------------
await test('portal: login de parceiro aprovado devolve token', async () => {
  mockFetch();
  const res = await call(portal, { action: 'login', email: 'MARCOS@x.com', password: 'certa' });
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.access_token, 'ptok');
});

await test('portal: senha errada e e-mail sem parceiro respondem igual (401)', async () => {
  mockFetch();
  assert.equal((await call(portal, { action: 'login', email: 'marcos@x.com', password: 'errada' })).body.error, 'invalid_credentials');
  mockFetch({ partner: { status: 'novo' } });
  const res = await call(portal, { action: 'login', email: 'marcos@x.com', password: 'certa' });
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.error, 'invalid_credentials');
});

await test('portal: list exige token e filtra por partner_id, sem campos internos', async () => {
  mockFetch();
  assert.equal((await call(portal, { action: 'list' })).statusCode, 401);
  const res = await call(portal, { action: 'list' }, 'ptok');
  assert.equal(res.statusCode, 200);
  const q = calls.find((c) => c.url.includes('partner_id=eq.')).url;
  assert.ok(q.includes(`partner_id=eq.${PARTNER_ID}`));
  assert.ok(!q.includes('ip_hash') && !q.includes('utm_') && !q.includes('notes'));
});

await test('portal: parceiro não aprovado ou token de outro tipo de usuário é barrado', async () => {
  mockFetch({ partner: { status: 'recusado' } });
  assert.equal((await call(portal, { action: 'list' }, 'ptok')).statusCode, 401);
  mockFetch();
  assert.equal((await call(portal, { action: 'list' }, 'atok')).statusCode, 401);
});

await test('portal: update_status só altera o lead do próprio parceiro', async () => {
  mockFetch();
  const ok = await call(portal, { action: 'update_status', id: LEAD_ID, partner_status: 'fechado' }, 'ptok');
  assert.equal(ok.statusCode, 200);
  const patch = calls.find((c) => c.opts.method === 'PATCH');
  assert.ok(patch.url.includes(`partner_id=eq.${PARTNER_ID}`));
  assert.deepEqual(JSON.parse(patch.opts.body), { partner_status: 'fechado' });
  assert.equal((await call(portal, { action: 'update_status', id: OTHER_LEAD, partner_status: 'fechado' }, 'ptok')).statusCode, 404);
  assert.equal((await call(portal, { action: 'update_status', id: LEAD_ID, partner_status: 'convertido' }, 'ptok')).body.error, 'invalid_status');
  assert.equal((await call(portal, { action: 'update_status', id: 'x;y', partner_status: 'fechado' }, 'ptok')).body.error, 'invalid_id');
});

await test('portal: change_password exige 8+ caracteres e usa o token do usuário', async () => {
  mockFetch();
  assert.equal((await call(portal, { action: 'change_password', password: 'curta' }, 'ptok')).body.error, 'weak_password');
  const ok = await call(portal, { action: 'change_password', password: 'senha-bem-forte' }, 'ptok');
  assert.equal(ok.statusCode, 200);
  const put = calls.find((c) => c.opts.method === 'PUT');
  assert.equal(put.opts.headers.Authorization, 'Bearer ptok');
});

// ------------------------------ admin: encaminhar ------------------------------
await test('admin: dispatch atualiza o lead, avisa o parceiro por e-mail e devolve link do WhatsApp', async () => {
  mockFetch();
  const res = await call(admin, { action: 'dispatch', lead_id: LEAD_ID, partner_id: PARTNER_ID }, 'atok');
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.emailed, true);
  assert.match(res.body.partner_whatsapp_url, /^https:\/\/wa\.me\/5516988887777\?text=/);
  const patch = calls.find((c) => c.opts.method === 'PATCH');
  const sent = JSON.parse(patch.opts.body);
  assert.equal(sent.partner_id, PARTNER_ID);
  assert.equal(sent.status, 'encaminhado');
  assert.equal(sent.partner_status, 'recebido');
  const mail = JSON.parse(calls.find((c) => c.url.includes('api.resend.com')).opts.body);
  assert.deepEqual(mail.to, ['marcos@x.com']);
  assert.ok(!mail.html.includes('<b>x</b>'), 'HTML escapado');
});

await test('admin: dispatch sem e-mail do parceiro não envia e-mail mas encaminha', async () => {
  mockFetch({ partner: { email: null } });
  const res = await call(admin, { action: 'dispatch', lead_id: LEAD_ID, partner_id: PARTNER_ID }, 'atok');
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.emailed, false);
  assert.ok(!calls.some((c) => c.url.includes('api.resend.com')));
});

await test('admin: dispatch recusa parceiro não aprovado, ids ruins e quem não é admin', async () => {
  mockFetch({ partner: { status: 'novo' } });
  assert.equal((await call(admin, { action: 'dispatch', lead_id: LEAD_ID, partner_id: PARTNER_ID }, 'atok')).body.error, 'partner_not_approved');
  assert.equal((await call(admin, { action: 'dispatch', lead_id: 'x', partner_id: PARTNER_ID }, 'atok')).body.error, 'invalid_id');
  mockFetch();
  assert.equal((await call(admin, { action: 'dispatch', lead_id: LEAD_ID, partner_id: PARTNER_ID }, 'ptok')).statusCode, 401);
});

await test('admin: create_partner_access cria usuário com senha temporária e vincula', async () => {
  mockFetch();
  const res = await call(admin, { action: 'create_partner_access', partner_id: PARTNER_ID }, 'atok');
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.email, 'marcos@x.com');
  assert.ok(res.body.password.length >= 10);
  const post = calls.find((c) => c.opts.method === 'POST' && c.url.includes('/auth/v1/admin/users'));
  const sent = JSON.parse(post.opts.body);
  assert.equal(sent.email_confirm, true);
  assert.equal(sent.password, res.body.password);
  assert.ok(calls.some((c) => c.opts.method === 'PATCH' && c.url.includes('/rest/v1/partners')));
});

await test('admin: create_partner_access redefine a senha se já existe vínculo e valida pré-requisitos', async () => {
  mockFetch({ partner: { auth_user_id: 'auth-1' } });
  const res = await call(admin, { action: 'create_partner_access', partner_id: PARTNER_ID }, 'atok');
  assert.equal(res.statusCode, 200);
  assert.ok(calls.some((c) => c.opts.method === 'PUT' && c.url.endsWith('/auth/v1/admin/users/auth-1')));
  mockFetch({ partner: { email: null } });
  assert.equal((await call(admin, { action: 'create_partner_access', partner_id: PARTNER_ID }, 'atok')).body.error, 'partner_without_email');
  mockFetch({ partner: { status: 'novo' } });
  assert.equal((await call(admin, { action: 'create_partner_access', partner_id: PARTNER_ID }, 'atok')).body.error, 'partner_not_approved');
  mockFetch({ userExists: true });
  assert.equal((await call(admin, { action: 'create_partner_access', partner_id: PARTNER_ID }, 'atok')).body.error, 'user_exists');
});

await test('admin: delete_partner remove o cadastro e o login do portal', async () => {
  mockFetch({ partner: { auth_user_id: 'auth-1' } });
  const res = await call(admin, { action: 'delete_partner', id: PARTNER_ID }, 'atok');
  assert.equal(res.statusCode, 200);
  assert.ok(calls.some((c) => c.opts.method === 'DELETE' && c.url.endsWith('/auth/v1/admin/users/auth-1')));
  assert.ok(calls.some((c) => c.opts.method === 'DELETE' && c.url.endsWith(`/rest/v1/partners?id=eq.${PARTNER_ID}`)));
  assert.equal((await call(admin, { action: 'delete_partner', id: PARTNER_ID })).statusCode, 401);
  assert.equal((await call(admin, { action: 'delete_partner', id: 'x' }, 'atok')).body.error, 'invalid_id');
  assert.equal((await call(admin, { action: 'delete_partner', id: PARTNER_ID }, 'ptok')).statusCode, 401);
});

await test('admin: falha no vínculo remove o usuário recém-criado e não entrega senha', async () => {
  mockFetch({ linkFails: true });
  const res = await call(admin, { action: 'create_partner_access', partner_id: PARTNER_ID }, 'atok');
  assert.equal(res.statusCode, 502);
  assert.equal(res.body.error, 'access_link_failed');
  assert.equal(res.body.password, undefined);
  assert.ok(calls.some(c => c.opts.method === 'DELETE' && c.url.endsWith(`/auth/v1/admin/users/${AUTH_ID}`)));
});

let failed = 0;
for (const [ok, name, err] of results) {
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}`);
  if (!ok) { failed++; console.log('     ', err && err.message); }
}
console.log(`\n${results.length - failed}/${results.length} testes passaram (portal e encaminhamento)`);
process.exit(failed ? 1 : 0);
