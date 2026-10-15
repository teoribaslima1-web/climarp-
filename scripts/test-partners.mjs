// Testes da função /api/partners com Supabase e Resend simulados (sem rede, sem chaves reais).
// Rode com: npm test
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const handler = require('../api/partners.js');

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

process.env.SUPABASE_URL = 'https://proj.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_test';
process.env.RESEND_API_KEY = 're_test';
process.env.LEAD_FROM = 'Clima16 <avisos@envio.clima16.com.br>';
process.env.LEAD_NOTIFY_TO = 'contato@clima16.com.br';

const validBody = () => ({
  name: 'Marcos Refrigeração',
  phone: '(16) 99999-9999',
  email: 'marcos@example.com',
  city: 'Ribeirão Preto – SP',
  services: ['Instalação', 'Manutenção'],
  cnpj: '12.345.678/0001-90',
  bio: 'Dez anos de experiência',
  consent: true,
  website: ''
});

let calls;
function mockFetch({ recentCount = 0, duplicate = false, insertStatus = 201 } = {}) {
  calls = [];
  globalThis.fetch = async (url, opts = {}) => {
    calls.push({ url, opts });
    const json = (status, body) => ({ ok: status < 300, status, json: async () => body });
    if (url.includes('api.resend.com')) return json(200, { id: 'e1' });
    if (url.includes('/rest/v1/partners') && (opts.method || 'GET') === 'GET') {
      if (url.includes('ip_hash=')) return json(200, Array.from({ length: recentCount }, (_, i) => ({ id: i })));
      return json(200, duplicate ? [{ id: 'x' }] : []);
    }
    if (url.includes('/rest/v1/partners') && opts.method === 'POST') {
      return json(insertStatus, [{ id: 'p-1', created_at: new Date().toISOString() }]);
    }
    return json(500, {});
  };
}

async function post(body, headers = {}) {
  const res = mockRes();
  await handler({ method: 'POST', headers: { 'x-forwarded-for': '1.2.3.4', ...headers }, body }, res);
  return res;
}
const inserts = () => calls.filter((c) => c.url.includes('/rest/v1/partners') && c.opts.method === 'POST');
const emails = () => calls.filter((c) => c.url.includes('api.resend.com'));

await test('GET é rejeitado com 405', async () => {
  const res = mockRes();
  await handler({ method: 'GET', headers: {}, body: null }, res);
  assert.equal(res.statusCode, 405);
});

await test('cadastro válido salva e envia o e-mail de aviso', async () => {
  mockFetch();
  const res = await post(validBody());
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.ok, true);
  assert.equal(inserts().length, 1);
  const saved = JSON.parse(inserts()[0].opts.body);
  assert.equal(saved.phone_digits, '16999999999');
  assert.equal(saved.cnpj, '12345678000190');
  assert.deepEqual(saved.services, ['Instalação', 'Manutenção']);
  assert.equal(saved.status, 'novo');
  assert.equal(emails().length, 1);
  const mail = JSON.parse(emails()[0].opts.body);
  assert.deepEqual(mail.to, ['contato@clima16.com.br']);
  assert.match(mail.subject, /Novo parceiro/);
});

await test('região atendida é salva com a apresentação e enviada no aviso sem exigir coluna nova', async () => {
  mockFetch();
  const res = await post({ ...validBody(), coverage: 'Zona Sul e Bonfim Paulista' });
  assert.equal(res.statusCode, 200);
  const saved = JSON.parse(inserts()[0].opts.body);
  assert.equal(saved.bio, 'Regiões atendidas: Zona Sul e Bonfim Paulista\n\nDez anos de experiência');
  assert.equal(saved.coverage, undefined);
  assert.match(JSON.parse(emails()[0].opts.body).text, /Zona Sul e Bonfim Paulista/);
});

await test('limita região e apresentação preservando ambos no cadastro', async () => {
  mockFetch();
  await post({ ...validBody(), coverage: 'Z'.repeat(800), bio: 'B'.repeat(2000) });
  const saved = JSON.parse(inserts()[0].opts.body);
  assert.equal(saved.bio, `Regiões atendidas: ${'Z'.repeat(400)}\n\n${'B'.repeat(1000)}`);
});

await test('honeypot preenchido finge sucesso sem salvar', async () => {
  mockFetch();
  const res = await post({ ...validBody(), website: 'http://spam' });
  assert.equal(res.statusCode, 200);
  assert.equal(calls.length, 0);
});

await test('valida nome, telefone, e-mail, serviços, CNPJ e consentimento', async () => {
  mockFetch();
  assert.equal((await post({ ...validBody(), name: 'A' })).body.error, 'invalid_name');
  assert.equal((await post({ ...validBody(), phone: '123' })).body.error, 'invalid_phone');
  assert.equal((await post({ ...validBody(), email: 'xx' })).body.error, 'invalid_email');
  assert.equal((await post({ ...validBody(), services: [] })).body.error, 'invalid_services');
  assert.equal((await post({ ...validBody(), services: ['Hackear'] })).body.error, 'invalid_services');
  assert.equal((await post({ ...validBody(), cnpj: '123' })).body.error, 'invalid_cnpj');
  assert.equal((await post({ ...validBody(), consent: false })).body.error, 'consent_required');
  assert.equal(inserts().length, 0);
});

await test('CNPJ e e-mail são opcionais', async () => {
  mockFetch();
  const res = await post({ ...validBody(), cnpj: '', email: '' });
  assert.equal(res.statusCode, 200);
  const saved = JSON.parse(inserts()[0].opts.body);
  assert.equal(saved.cnpj, null);
  assert.equal(saved.email, null);
});

await test('telefone repetido em 7 dias entra como duplicado e não envia e-mail', async () => {
  mockFetch({ duplicate: true });
  const res = await post(validBody());
  assert.equal(res.statusCode, 200);
  assert.equal(JSON.parse(inserts()[0].opts.body).status, 'duplicado');
  assert.equal(emails().length, 0);
});

await test('muitos cadastros do mesmo IP devolvem 429', async () => {
  mockFetch({ recentCount: 5 });
  const res = await post(validBody());
  assert.equal(res.statusCode, 429);
  assert.equal(inserts().length, 0);
});

await test('falha ao gravar devolve 502 e não envia e-mail', async () => {
  mockFetch({ insertStatus: 500 });
  const res = await post(validBody());
  assert.equal(res.statusCode, 502);
  assert.equal(emails().length, 0);
});

await test('HTML do e-mail escapa conteúdo do usuário', async () => {
  mockFetch();
  await post({ ...validBody(), name: '<script>x</script>', bio: '<img src=x onerror=1>' });
  const mail = JSON.parse(emails()[0].opts.body);
  assert.ok(!mail.html.includes('<script>'));
  assert.ok(!mail.html.includes('<img'));
});

await test('sem variáveis de ambiente responde 500', async () => {
  const keep = process.env.SUPABASE_URL;
  delete process.env.SUPABASE_URL;
  mockFetch();
  const res = await post(validBody());
  assert.equal(res.statusCode, 500);
  process.env.SUPABASE_URL = keep;
});

let failed = 0;
for (const [ok, name, err] of results) {
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}`);
  if (!ok) { failed++; console.log('     ', err && err.message); }
}
console.log(`\n${results.length - failed}/${results.length} testes passaram (parceiros)`);
process.exit(failed ? 1 : 0);
