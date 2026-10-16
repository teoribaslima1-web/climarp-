// Auditoria somente de leitura. Padrão: dist/. --live: páginas públicas de produção.
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
const live = process.argv.includes('--live');
const base = 'https://clima16.com.br';
async function read(path) {
  if (live) {
    const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(15000) });
    return { status: response.status, text: await response.text(), headers: response.headers };
  }
  let file = resolve('dist', `.${path}`);
  if (!/\.[a-z0-9]+$/i.test(path)) file = resolve(file, 'index.html');
  return { status: existsSync(file) ? 200 : 404, text: existsSync(file) ? readFileSync(file, 'utf8') : '', headers: new Headers() };
}
const checks = [];
const check = (name, ok, detail = '') => checks.push({ name, ok: !!ok, detail });
const robots = await read('/robots.txt');
check('robots.txt disponível e aponta para sitemap', robots.status === 200 && robots.text.includes(`${base}/sitemap.xml`));
const sitemap = await read('/sitemap.xml');
const urls = [...sitemap.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
check('sitemap disponível com URLs únicas do domínio', sitemap.status === 200 && urls.length > 5 && new Set(urls).size === urls.length && urls.every(url => url.startsWith(`${base}/`)));
const titles = new Set();
for (const url of urls) {
  const path = new URL(url).pathname;
  const page = await read(path);
  const title = page.text.match(/<title>(.*?)<\/title>/s)?.[1];
  check(`${path}: HTTP 200, título único, descrição, H1 e canonical`, page.status === 200 && title && !titles.has(title)
    && /<meta name="description" content="[^"]+"/.test(page.text) && /<h1\b/.test(page.text)
    && page.text.includes(`rel="canonical" href="${url}"`) && !/<meta name="robots" content="noindex/.test(page.text));
  titles.add(title);
}
const home = await read('/');
check('tag existente de verificação Google preservada', /name="google-site-verification" content="[^"]+"/.test(home.text));
if (!live) {
  const structured = JSON.parse(home.text.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] || '{}');
  check('dados estruturados descrevem a plataforma sem ofertas próprias', structured['@graph']?.some(item => item['@type'] === 'Organization') && !home.text.includes('"priceRange"') && !home.text.includes('"makesOffer"'));
  check('imagem de compartilhamento existe no build', existsSync(resolve('dist/assets/og-image.png')));
}
check('sitemap exclui rotas internas e confirmação', !urls.some(url => /^\/(admin|parceiro|solicitacao-recebida|404)(\/|$)/.test(new URL(url).pathname)));
for (const path of ['/admin', '/parceiro', '/solicitacao-recebida', '/404']) {
  const page = await read(path);
  check(`${path}: noindex`, /name="robots" content="noindex/.test(page.text) || (page.headers.get('x-robots-tag') || '').includes('noindex'));
  if (live && ['/admin', '/parceiro'].includes(path)) check(`${path}: CSP privada publicada`, (page.headers.get('content-security-policy') || '').includes("script-src 'self'"));
}
console.log(JSON.stringify({ mode: live ? 'produção' : 'build local', checked_at: new Date().toISOString(), public_pages: urls.length, passed: checks.filter(c => c.ok).length, total: checks.length, checks }, null, 2));
if (checks.some(c => !c.ok)) process.exitCode = 1;
