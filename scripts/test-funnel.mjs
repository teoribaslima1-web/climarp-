// Testes do /api/funnel (funil do formulário, sem dados pessoais), com Supabase simulado.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const handler = require('../api/funnel.js');

const results = [];
async function test(name, fn) { try { await fn(); results.push([true, name]); } catch (e) { results.push([false, name, e]); } }
function mockRes() {
  const res = { statusCode: 200, body: null, headers: {}, ended: false };
  res.setHeader = (k, v) => { res.headers[k] = v; };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  res.end = () => { res.ended = true; return res; };
  return res;
}
async function call(req) { const res = mockRes(); await handler({ method: 'POST', headers: {}, ...req }, res); return res; }
let calls;
function mockFetch(status = 201) {
  calls = [];
  globalThis.fetch = async (url, o = {}) => { calls.push({ url, o }); return { ok: status < 300, status, json: async () => ({}) }; };
}
process.env.SUPABASE_URL = 'https://proj.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_test';

await test('funnel: grava só campos de listas fixas', async () => {
  mockFetch();
  const res = await call({ body: JSON.stringify({ event: 'local', entry: 'servico', service: 'Limpeza e higienização', step: 2, device: 'mobile', source: 'Google', name: 'João', phone: '16999999999' }) });
  assert.equal(res.statusCode, 204);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://proj.supabase.co/rest/v1/form_funnel_events');
  const row = JSON.parse(calls[0].o.body);
  assert.deepEqual(row, { event: 'local', entry: 'servico', service: 'Limpeza e higienização', step: 2, device: 'mobile', source: 'google' });
});
await test('funnel: descarta valores fora da lista', async () => {
  mockFetch();
  const res = await call({ body: { event: 'bairro', entry: 'x', service: '<script>', step: 9, device: 'tv', source: 'a b<c' } });
  assert.equal(res.statusCode, 204);
  assert.deepEqual(JSON.parse(calls[0].o.body), { event: 'bairro', entry: 'home', service: null, step: null, device: null, source: null });
});
await test('funnel: evento inválido ou método errado não grava', async () => {
  mockFetch();
  assert.equal((await call({ body: { event: 'drop table' } })).statusCode, 400);
  assert.equal((await call({ method: 'GET' })).statusCode, 405);
  assert.equal((await call({ body: 'x'.repeat(2000) })).statusCode, 413);
  assert.equal(calls.length, 0);
});
await test('funnel: falha do banco não vira erro para o visitante', async () => {
  mockFetch(500);
  assert.equal((await call({ body: { event: 'inicio' } })).statusCode, 204);
  globalThis.fetch = async () => { throw new Error('offline'); };
  assert.equal((await call({ body: { event: 'inicio' } })).statusCode, 204);
});

let failed = 0;
for (const [ok, name, e] of results) { console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}`); if (!ok) { failed++; console.error(e); } }
if (failed) process.exit(1);
console.log(`\n${results.length} testes do funil passaram.`);
