// Testes do /api/health (cron que mantém o Supabase ativo), com Supabase simulado.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const handler = require('../api/health.js');

const results = [];
async function test(name, fn) { try { await fn(); results.push([true, name]); } catch (e) { results.push([false, name, e]); } }
function mockRes() {
  const res = { statusCode: 200, body: null, headers: {} };
  res.setHeader = (k, v) => { res.headers[k] = v; };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  return res;
}
async function call(req) { const res = mockRes(); await handler({ method: 'GET', headers: {}, ...req }, res); return res; }
let calls;
function mockFetch(status = 200) {
  calls = [];
  globalThis.fetch = async (url, o = {}) => { calls.push({ url, o }); return { ok: status < 300, status, json: async () => [{ id: 'x' }] }; };
}
process.env.SUPABASE_URL = 'https://proj.supabase.co/rest/v1';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_test';

await test('health: consulta 1 linha de leads e não devolve dados', async () => {
  delete process.env.CRON_SECRET; mockFetch();
  const res = await call({});
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.ok, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://proj.supabase.co/rest/v1/leads?select=id&limit=1');
  assert.ok(!JSON.stringify(res.body).includes('"id"'));
});
await test('health: com CRON_SECRET exige o Bearer certo', async () => {
  process.env.CRON_SECRET = 's3cr3t'; mockFetch();
  assert.equal((await call({})).statusCode, 401);
  assert.equal((await call({ headers: { authorization: 'Bearer errado' } })).statusCode, 401);
  assert.equal(calls.length, 0);
  assert.equal((await call({ headers: { authorization: 'Bearer s3cr3t' } })).statusCode, 200);
  delete process.env.CRON_SECRET;
});
await test('health: erro do Supabase vira 502 e POST é recusado', async () => {
  mockFetch(503);
  assert.equal((await call({})).statusCode, 502);
  assert.equal((await call({ method: 'POST' })).statusCode, 405);
});

let failed = 0;
for (const [ok, name, err] of results) { console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}`); if (!ok) { failed++; console.log('     ', err && err.message); } }
console.log(`\n${results.length - failed}/${results.length} testes passaram (health)`);
process.exit(failed ? 1 : 0);
