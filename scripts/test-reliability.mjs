import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const handler = require('../api/leads.js');
const admin = require('../api/admin.js');
const { normalizePhone } = require('../api/_lib.js');
let passed = 0;
async function test(name, fn) { await fn(); passed++; console.log(`OK   ${name}`); }
const id = '3b6d1a2e-1111-4222-8333-444455556666';
const body = { request_id: id, name: 'Teste', phone: '16999999999', service_type: 'Instalação', email: 'teste@example.com', consent: true };
const response = () => { const r = { statusCode: 200, setHeader() {}, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } }; return r; };
Object.assign(process.env, { SUPABASE_URL: 'https://test.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'sb_secret_fake', RESEND_API_KEY: 'fake', LEAD_FROM: 'Clima16 <avisos@envio.clima16.com.br>', LEAD_NOTIFY_TO: 'contato@clima16.com.br' });
const json = (data, status = 200) => ({ ok: status < 300, status, json: async () => data });

await test('duas requisições concorrentes com o mesmo ID salvam um lead e enviam um par de notificações', async () => {
  let stored; let inserts = 0; let emails = 0;
  globalThis.fetch = async (url, init = {}) => {
    if (url.includes('api.resend.com')) { emails++; return json({ id: 'mail' }); }
    if (init.method === 'PATCH') return json({});
    if (init.method === 'POST') {
      inserts++;
      if (stored) return json({}, 409);
      stored = { ...JSON.parse(init.body), created_at: new Date().toISOString() };
      return json([stored]);
    }
    if (url.includes('id=eq.')) return json(stored ? [stored] : []);
    return json([]);
  };
  const a = response(), b = response();
  await Promise.all([handler({ method: 'POST', headers: {}, body }, a), handler({ method: 'POST', headers: {}, body }, b)]);
  assert.equal(a.statusCode, 200); assert.equal(b.statusCode, 200);
  assert.equal(a.body.id, b.body.id); assert.equal(emails, 2); assert.equal(inserts, 2);
  assert.ok(a.body.replayed || b.body.replayed);
});
await test('falha ao registrar status de e-mail não invalida lead salvo', async () => {
  globalThis.fetch = async (url, init = {}) => {
    if (url.includes('api.resend.com')) return json({});
    if (init.method === 'PATCH') return json({}, 400);
    if (init.method === 'POST') return json([{ ...body, id, created_at: new Date().toISOString() }]);
    return json([]);
  };
  const res = response(); await handler({ method: 'POST', headers: {}, body }, res);
  assert.equal(res.statusCode, 200);
});
await test('reenvio de notificações exige autenticação administrativa', async () => {
  const res = response(); await admin({ method: 'POST', headers: {}, body: { action: 'retry_notifications', id } }, res);
  assert.equal(res.statusCode, 401);
});
await test('reenvio administrativo recupera as duas notificações e registra o resultado', async () => {
  let emailCount = 0, recorded;
  globalThis.fetch = async (url, init = {}) => {
    if (url.endsWith('/auth/v1/user')) return json({ email: 'contato@clima16.com.br' });
    if (url.includes('api.resend.com')) { emailCount++; return json({}); }
    if (url.includes('customer_notification_status=eq.sent')) return json([]);
    if (init.method === 'PATCH') { recorded = JSON.parse(init.body); return json({}); }
    return json([{ ...body, id, status: 'novo', phone_digits: '16999999999' }]);
  };
  const res = response(); await admin({ method: 'POST', headers: { authorization: 'Bearer admin' }, body: { action: 'retry_notifications', id } }, res);
  assert.equal(res.statusCode, 200); assert.equal(emailCount, 2);
  assert.equal(recorded.notification_status, 'sent'); assert.equal(res.body.notifications.recorded, true);
});
await test('campos comerciais rejeitam valores e datas inválidos', async () => {
  const patch = admin._internals.buildPatch;
  assert.equal(patch({ service_value: -1 }).error, 'invalid_value');
  assert.equal(patch({ first_contact_at: 'ontem' }).error, 'invalid_date');
  assert.equal(patch({ service_value: 250, first_contact_at: '2026-10-14T10:00:00-03:00' }).patch.first_contact_at, '2026-10-14T13:00:00.000Z');
  assert.equal(normalizePhone('+55 (16) 99999-9999'), '16999999999');
});

const store = () => { const values = new Map(); return { getItem: k => values.get(k) || null, setItem: (k,v) => values.set(k,v), removeItem: k => values.delete(k) }; };
globalThis.localStorage = store(); globalThis.sessionStorage = store();
localStorage.setItem('clima16_leads_db_v1', 'dados antigos');
globalThis.window = { location: { search: '', hash: '', pathname: '/', href: 'https://clima16.com.br/' }, dataLayer: [] };
globalThis.document = { referrer: '' };
Object.defineProperty(globalThis, 'navigator', { value: { userAgent: 'test' }, configurable: true });
sessionStorage.setItem('clima16_utm_session', 'json corrompido');
const { db } = await import('../js/storage.js');
await test('confirmação não guarda telefone, e-mail, descrição ou histórico e expira', async () => {
  db.createLead({ ...body, neighborhood: 'Centro', description: 'privado' }, id);
  const raw = sessionStorage.getItem('clima16_confirmation_v2');
  assert.ok(!raw.includes(body.phone)); assert.ok(!raw.includes(body.email)); assert.ok(!raw.includes('privado'));
  assert.equal(localStorage.getItem('clima16_leads_db_v1'), null);
  const data = JSON.parse(raw); data.expires_at = Date.now() - 1;
  sessionStorage.setItem('clima16_confirmation_v2', JSON.stringify(data));
  assert.equal(db.getLastSubmittedLead(), null);
});
await test('confirmação recuperada conta uma conversão por ID e duplicado não vira conversão', async () => {
  const { analytics } = await import('../js/analytics.js');
  db.createLead(body, id); db.createLead(body, id);
  assert.equal(analytics.eventLog.filter(e => e.event === 'form_complete').length, 1);
  db.createLead(body, 'other', true);
  assert.equal(analytics.eventLog.filter(e => e.event === 'form_complete').length, 1);
  assert.equal(analytics.eventLog.filter(e => e.event === 'form_duplicate').length, 1);
});
await test('páginas públicas saem com conteúdo e canonical próprios; páginas internas não indexam', async () => {
  const html = readFileSync('dist/instalacao-ar-condicionado-ribeirao-preto/index.html', 'utf8');
  assert.ok(html.includes('Instalação de ar-condicionado em'));
  assert.match(html, /rel="canonical" href="https:\/\/clima16.com.br\/instalacao-ar-condicionado-ribeirao-preto"/);
  assert.match(readFileSync('dist/admin/index.html', 'utf8'), /noindex, nofollow/);
  assert.match(readFileSync('dist/404/index.html', 'utf8'), /noindex, nofollow/);
});
console.log(`\n${passed}/${passed} testes de confiabilidade passaram`);
