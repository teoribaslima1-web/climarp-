import assert from 'node:assert/strict';

const store = () => {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
};
let scripts;
function environment(path = '/', consent = null) {
  scripts = [];
  globalThis.localStorage = store();
  globalThis.sessionStorage = store();
  if (consent !== null) localStorage.setItem('clima16_lgpd_consent', consent);
  globalThis.window = { location: { pathname: path, search: '', hash: '', href: `https://clima16.com.br${path}` }, dataLayer: [] };
  globalThis.document = { referrer: '', head: { appendChild: node => scripts.push(node) }, createElement: () => ({}) };
  Object.defineProperty(globalThis, 'navigator', { value: { userAgent: 'test' }, configurable: true });
}
environment();
const { AnalyticsTracker, analytics } = await import('../js/analytics.js');
let passed = 0;
const test = (name, run) => { run(); passed++; console.log(`OK   ${name}`); };

test('sem aceite não carrega scripts nem disponibiliza eventos para rastreadores', () => {
  environment();
  const tracker = new AnalyticsTracker();
  tracker.track('form_start');
  assert.equal(scripts.length, 0);
  assert.deepEqual(window.dataLayer, []);
});
test('aceite carrega uma vez e não reenvia os eventos anteriores', () => {
  environment();
  const tracker = new AnalyticsTracker();
  tracker.track('form_start');
  localStorage.setItem('clima16_lgpd_consent', 'true');
  tracker.loadTrackers(); tracker.loadTrackers();
  tracker.track('whatsapp_click', { origin: 'header' });
  assert.equal(scripts.length, 1);
  assert.match(scripts[0].src, /googletagmanager.com\/gtm.js/);
  assert.equal(window.dataLayer.filter(e => e.event === 'form_start').length, 0);
  assert.equal(window.dataLayer.filter(e => e.event === 'whatsapp_click').length, 1);
});
test('recusa e rotas privadas bloqueiam métricas mesmo com aceite anterior', () => {
  for (const path of ['/admin', '/admin/', '/parceiro', '/parceiro/acesso']) {
    environment(path, 'true');
    new AnalyticsTracker().track('whatsapp_click');
    assert.equal(scripts.length, 0);
    assert.deepEqual(window.dataLayer, []);
  }
  environment('/', 'false');
  new AnalyticsTracker().track('form_complete');
  assert.deepEqual(window.dataLayer, []);
});
test('armazenamento bloqueado mantém o site utilizável sem métricas externas', () => {
  environment();
  localStorage.getItem = () => { throw new Error('blocked'); };
  const tracker = new AnalyticsTracker();
  assert.doesNotThrow(() => tracker.track('form_complete'));
  assert.equal(scripts.length, 0);
  assert.deepEqual(window.dataLayer, []);
});
// O banner usa o tracker compartilhado pela aplicação.
environment('/', 'true');
const { renderCookieBanner, initCookieBannerEvents } = await import('../js/components/cookie-banner.js');
test('preferências permitem retirar aceite e descarregam scripts por recarga', () => {
  assert.equal(renderCookieBanner(), '');
  assert.match(renderCookieBanner(true), /Só essenciais/);
  let reject;
  let reloaded = false;
  document.getElementById = id => id === 'btn-reject-cookies'
    ? { addEventListener: (_, handler) => { reject = handler; } }
    : id === 'lgpd-cookie-banner' ? { remove() {} } : null;
  window.location.reload = () => { reloaded = true; };
  analytics.mode = 'gtm';
  initCookieBannerEvents();
  reject();
  assert.equal(localStorage.getItem('clima16_lgpd_consent'), 'false');
  assert.equal(reloaded, true);
});
console.log(`\n${passed}/${passed} testes de métricas passaram`);
