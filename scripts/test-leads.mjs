// Testes da função /api/leads com Supabase e Resend simulados (sem rede, sem chaves reais).
// Rode com: npm test
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const handler = require('../api/leads.js');

const results = [];
async function test(name, fn) {
  try {
    await fn();
    results.push([true, name]);
  } catch (err) {
    results.push([false, name, err]);
  }
}

function mockRes() {
  const res = { statusCode: 200, body: null, headers: {} };
  res.setHeader = (k, v) => { res.headers[k] = v; };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  return res;
}

const validBody = () => ({
  name: 'João Silva',
  phone: '(16) 99999-9999',
  email: 'joao@example.com',
  service_type: 'Instalação de ar-condicionado',
  property_type: 'Apartamento',
  has_equipment: 'Sim',
  btu: '12.000 BTUs',
  neighborhood: 'Jardim Paulistano',
  description: 'Preciso instalar no 3º andar',
  consent: true,
  website: '',
  utm_source: 'google',
  device: 'mobile'
});

const req = (body, extra = {}) => ({
  method: 'POST',
  headers: { 'x-forwarded-for': '203.0.113.7, 10.0.0.1' },
  body,
  ...extra
});

function setEnv(full = true) {
  process.env.SUPABASE_URL = full ? 'https://proj.supabase.co/' : '';
  process.env.SUPABASE_SERVICE_ROLE_KEY = full ? 'sb_secret_test' : '';
  process.env.RESEND_API_KEY = 're_test';
  process.env.LEAD_NOTIFY_TO = 'contato@clima16.com.br';
  process.env.LEAD_FROM = 'Clima16 <avisos@envio.clima16.com.br>';
}

// fetch simulado: registra chamadas e responde conforme as opções
function installFetch({ recent = [], dup = [], insertOk = true, emailOk = true, selectThrows = false } = {}) {
  const calls = [];
  global.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    const u = String(url);
    const json = (data, ok = true, status = 200) => ({ ok, status, json: async () => data });
    if (u.includes('/rest/v1/leads?') && (init.method || 'GET') === 'GET') {
      if (selectThrows) throw new Error('network');
      return json(u.includes('ip_hash=') ? recent : dup);
    }
    if (u.endsWith('/rest/v1/leads') && init.method === 'POST') {
      return insertOk
        ? json([{ id: 'lead-1', created_at: new Date().toISOString() }])
        : json({ message: 'boom' }, false, 500);
    }
    if (u.startsWith('https://api.resend.com/emails')) return emailOk ? json({ id: 'e1' }) : json({}, false, 422);
    throw new Error('unexpected fetch ' + u);
  };
  return calls;
}

const insertCall = (calls) => calls.find((c) => c.url.endsWith('/rest/v1/leads') && c.init.method === 'POST');
const emailCall = (calls) => calls.find((c) => c.url.includes('api.resend.com'));

await test('rejeita método diferente de POST', async () => {
  setEnv(); installFetch();
  const res = mockRes();
  await handler({ method: 'GET', headers: {} }, res);
  assert.equal(res.statusCode, 405);
});

await test('honeypot preenchido: responde ok e NÃO salva', async () => {
  setEnv(); const calls = installFetch();
  const res = mockRes();
  await handler(req({ ...validBody(), website: 'http://spam.com' }), res);
  assert.equal(res.statusCode, 200);
  assert.equal(calls.length, 0);
});

await test('telefone inválido -> 422', async () => {
  setEnv(); installFetch();
  const res = mockRes();
  await handler(req({ ...validBody(), phone: '123' }), res);
  assert.equal(res.statusCode, 422);
  assert.equal(res.body.error, 'invalid_phone');
});

await test('sem consentimento LGPD -> 422', async () => {
  setEnv(); installFetch();
  const res = mockRes();
  await handler(req({ ...validBody(), consent: false }), res);
  assert.equal(res.statusCode, 422);
  assert.equal(res.body.error, 'consent_required');
});

await test('e-mail inválido -> 422', async () => {
  setEnv(); installFetch();
  const res = mockRes();
  await handler(req({ ...validBody(), email: 'sem-arroba' }), res);
  assert.equal(res.statusCode, 422);
});

await test('sem variáveis do Supabase -> 500 sem vazar detalhes', async () => {
  setEnv(false); installFetch();
  const res = mockRes();
  await handler(req(validBody()), res);
  assert.equal(res.statusCode, 500);
  assert.equal(res.body.error, 'server_not_configured');
});

await test('lead válido: salva como "novo", com consentimento e sem IP em texto', async () => {
  setEnv(); const calls = installFetch();
  const res = mockRes();
  await handler(req(validBody()), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.ok, true);
  const ins = insertCall(calls);
  assert.ok(ins.url.startsWith('https://proj.supabase.co/rest/v1/leads'));
  assert.equal(ins.init.headers.apikey, 'sb_secret_test');
  assert.equal(ins.init.headers.Authorization, undefined); // chave nova não vai em Authorization
  const row = JSON.parse(ins.init.body);
  assert.equal(row.status, 'novo');
  assert.equal(row.phone_digits, '16999999999');
  assert.equal(row.consent, true);
  assert.ok(row.consent_at);
  assert.ok(/^[0-9a-f]{64}$/.test(row.ip_hash));
  assert.ok(!ins.init.body.includes('203.0.113.7'));
});

await test('envia e-mail para contato@clima16.com.br com assunto do serviço', async () => {
  setEnv(); const calls = installFetch();
  await handler(req(validBody()), mockRes());
  const mail = JSON.parse(emailCall(calls).init.body);
  assert.deepEqual(mail.to, ['contato@clima16.com.br']);
  assert.equal(mail.subject, '🔵 Novo orçamento Clima16 — Instalação de ar-condicionado');
  assert.ok(mail.text.includes('Jardim Paulistano'));
});

await test('HTML do e-mail escapa conteúdo malicioso', async () => {
  setEnv(); const calls = installFetch();
  await handler(req({ ...validBody(), name: '<script>alert(1)</script> Zé' }), mockRes());
  const mail = JSON.parse(emailCall(calls).init.body);
  assert.ok(!mail.html.includes('<script>'));
  assert.ok(mail.html.includes('&lt;script&gt;'));
});

await test('quebra de linha no serviço não vira cabeçalho do e-mail', async () => {
  setEnv(); const calls = installFetch();
  await handler(req({ ...validBody(), service_type: 'Instalação\r\nBcc: x@y.com' }), mockRes());
  const mail = JSON.parse(emailCall(calls).init.body);
  assert.ok(!/[\r\n]/.test(mail.subject));
});

await test('telefone repetido em 24h: salva como "duplicado" e não manda e-mail', async () => {
  setEnv(); const calls = installFetch({ dup: [{ id: 'old' }] });
  const res = mockRes();
  await handler(req(validBody()), res);
  assert.equal(res.statusCode, 200);
  assert.equal(JSON.parse(insertCall(calls).init.body).status, 'duplicado');
  assert.equal(emailCall(calls), undefined);
});

await test('muitos envios do mesmo IP -> 429 e nada é salvo', async () => {
  setEnv(); const calls = installFetch({ recent: new Array(10).fill({ id: 'x' }) });
  const res = mockRes();
  await handler(req(validBody()), res);
  assert.equal(res.statusCode, 429);
  assert.equal(insertCall(calls), undefined);
});

await test('falha nas checagens antispam não impede salvar o lead', async () => {
  setEnv(); const calls = installFetch({ selectThrows: true });
  const res = mockRes();
  await handler(req(validBody()), res);
  assert.equal(res.statusCode, 200);
  assert.ok(insertCall(calls));
});

await test('falha ao salvar -> 502 e nenhum e-mail', async () => {
  setEnv(); const calls = installFetch({ insertOk: false });
  const res = mockRes();
  await handler(req(validBody()), res);
  assert.equal(res.statusCode, 502);
  assert.equal(emailCall(calls), undefined);
});

await test('falha no e-mail não derruba o lead (continua 200)', async () => {
  setEnv(); installFetch({ emailOk: false });
  const res = mockRes();
  await handler(req(validBody()), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.ok, true);
});

await test('chave antiga (JWT) também vai em Authorization', async () => {
  setEnv(); process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOi.fake.jwt';
  const calls = installFetch();
  await handler(req(validBody()), mockRes());
  assert.equal(insertCall(calls).init.headers.Authorization, 'Bearer eyJhbGciOi.fake.jwt');
});

let failed = 0;
for (const [ok, name, err] of results) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) { failed++; console.log('      ' + (err && err.message)); }
}
console.log(`\n${results.length - failed}/${results.length} testes passaram`);
process.exit(failed ? 1 : 0);
