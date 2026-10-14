// Testes da função /api/admin com Supabase simulado (sem rede, sem chaves reais).
// Rode com: npm test
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const handler = require('../api/admin.js');

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

const ID = '3b6d1a2e-1111-4222-8333-444455556666';
process.env.SUPABASE_URL = 'https://proj.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_test';
process.env.SUPABASE_ANON_KEY = 'sb_publishable_test';
process.env.LEAD_NOTIFY_TO = 'contato@clima16.com.br';
delete process.env.ADMIN_EMAILS;

let calls;
function mockFetch(userEmail = 'contato@clima16.com.br') {
  calls = [];
  globalThis.fetch = async (url, opts = {}) => {
    calls.push({ url, opts });
    const json = (status, body) => ({ ok: status < 300, status, json: async () => body });
    if (url.includes('/auth/v1/token')) {
      const b = JSON.parse(opts.body);
      return b.password === 'certa' ? json(200, { access_token: 'tok123', expires_in: 3600 }) : json(400, { error: 'invalid_grant' });
    }
    if (url.includes('/auth/v1/user')) {
      return opts.headers.Authorization === 'Bearer tok123' ? json(200, { email: userEmail }) : json(401, {});
    }
    if (/\/rest\/v1\/(leads|partners)/.test(url) && (opts.method || 'GET') === 'GET') return json(200, [{ id: ID, name: 'A' }]);
    if (opts.method === 'PATCH') return json(200, [{ id: ID, ...JSON.parse(opts.body) }]);
    if (opts.method === 'DELETE') return json(204, null);
    return json(500, {});
  };
}

async function call(body, token) {
  const res = mockRes();
  const headers = token ? { authorization: `Bearer ${token}` } : {};
  await handler({ method: 'POST', headers, body }, res);
  return res;
}

await test('GET é rejeitado com 405', async () => {
  const res = mockRes();
  await handler({ method: 'GET', headers: {}, body: null }, res);
  assert.equal(res.statusCode, 405);
});

await test('login com senha certa devolve token; usa a chave pública', async () => {
  mockFetch();
  const res = await call({ action: 'login', email: 'Contato@Clima16.com.br', password: 'certa' });
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.access_token, 'tok123');
  assert.equal(calls[0].opts.headers.apikey, 'sb_publishable_test');
});

await test('login com senha errada devolve 401 invalid_credentials', async () => {
  mockFetch();
  const res = await call({ action: 'login', email: 'contato@clima16.com.br', password: 'errada' });
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.error, 'invalid_credentials');
});

await test('e-mail fora da lista nem chega ao Supabase e responde igual', async () => {
  mockFetch();
  const res = await call({ action: 'login', email: 'intruso@x.com', password: 'certa' });
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.error, 'invalid_credentials');
  assert.equal(calls.length, 0);
});

await test('list sem token devolve 401', async () => {
  mockFetch();
  const res = await call({ action: 'list' });
  assert.equal(res.statusCode, 401);
});

await test('list com token inválido devolve 401 e não toca na tabela', async () => {
  mockFetch();
  const res = await call({ action: 'list' }, 'falso');
  assert.equal(res.statusCode, 401);
  assert.ok(!calls.some((c) => c.url.includes('/rest/v1/leads')));
});

await test('token válido de usuário que não é admin devolve 401', async () => {
  mockFetch('outro@x.com');
  const res = await call({ action: 'list' }, 'tok123');
  assert.equal(res.statusCode, 401);
});

await test('list com token de admin devolve os leads usando a chave de serviço', async () => {
  mockFetch();
  const res = await call({ action: 'list' }, 'tok123');
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.leads.length, 1);
  const rest = calls.find((c) => c.url.includes('/rest/v1/leads'));
  assert.equal(rest.opts.headers.apikey, 'sb_secret_test');
});

await test('update muda status e parceiro', async () => {
  mockFetch();
  const res = await call({ action: 'update', id: ID, status: 'em_contato', assigned_partner: ' João ' }, 'tok123');
  assert.equal(res.statusCode, 200);
  const patch = calls.find((c) => c.opts.method === 'PATCH');
  assert.deepEqual(JSON.parse(patch.opts.body), { status: 'em_contato', assigned_partner: 'João' });
});

await test('update rejeita status inválido, id inválido e pedido vazio', async () => {
  mockFetch();
  assert.equal((await call({ action: 'update', id: ID, status: 'xyz' }, 'tok123')).body.error, 'invalid_status');
  assert.equal((await call({ action: 'update', id: "1;drop", status: 'novo' }, 'tok123')).body.error, 'invalid_id');
  assert.equal((await call({ action: 'update', id: ID }, 'tok123')).body.error, 'nothing_to_update');
  assert.ok(!calls.some((c) => c.opts.method === 'PATCH'));
});

await test('delete remove o lead pelo id', async () => {
  mockFetch();
  const res = await call({ action: 'delete', id: ID }, 'tok123');
  assert.equal(res.statusCode, 200);
  assert.ok(calls.some((c) => c.opts.method === 'DELETE' && c.url.endsWith(`id=eq.${ID}`)));
});

await test('list_partners e update_partner funcionam só para admin', async () => {
  mockFetch();
  assert.equal((await call({ action: 'list_partners' })).statusCode, 401);
  const list = await call({ action: 'list_partners' }, 'tok123');
  assert.equal(list.statusCode, 200);
  assert.ok(Array.isArray(list.body.partners));
  const upd = await call({ action: 'update_partner', id: ID, status: 'aprovado' }, 'tok123');
  assert.equal(upd.statusCode, 200);
  const patch = calls.find((c) => c.opts.method === 'PATCH');
  assert.ok(patch.url.includes('/rest/v1/partners?id=eq.'));
  assert.deepEqual(JSON.parse(patch.opts.body), { status: 'aprovado' });
  assert.equal((await call({ action: 'update_partner', id: ID, status: 'convertido' }, 'tok123')).body.error, 'invalid_status');
});

await test('ADMIN_EMAILS tem prioridade sobre LEAD_NOTIFY_TO', async () => {
  process.env.ADMIN_EMAILS = 'teo@syspec.com.br, outro@x.com';
  mockFetch('teo@syspec.com.br');
  const res = await call({ action: 'list' }, 'tok123');
  assert.equal(res.statusCode, 200);
  mockFetch();
  assert.equal((await call({ action: 'login', email: 'contato@clima16.com.br', password: 'certa' })).statusCode, 401);
  delete process.env.ADMIN_EMAILS;
});

await test('sem variáveis de ambiente responde 500', async () => {
  const keep = process.env.SUPABASE_URL;
  delete process.env.SUPABASE_URL;
  const res = await call({ action: 'list' }, 'tok123');
  assert.equal(res.statusCode, 500);
  process.env.SUPABASE_URL = keep;
});

let failed = 0;
for (const [ok, name, err] of results) {
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}`);
  if (!ok) { failed++; console.log('     ', err && err.message); }
}
console.log(`\n${results.length - failed}/${results.length} testes passaram (admin)`);
process.exit(failed ? 1 : 0);
