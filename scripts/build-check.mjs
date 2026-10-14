// Verificação de build do Clima16 (site estático, sem dependências).
// Falha (exit 1) se algum módulo JS tiver erro de sintaxe, import quebrado
// ou se o index.html apontar para um arquivo inexistente.
import { readFileSync, existsSync, readdirSync, statSync, copyFileSync, rmSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { writeFileSync } from 'node:fs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const jsFiles = [...walk(join(root, 'js')), ...walk(join(root, 'api'))].filter((f) => f.endsWith('.js'));
for (const f of jsFiles) {
  const r = spawnSync(process.execPath, ['--check', '--input-type=module'], { input: readFileSync(f) });
  if (r.status !== 0) errors.push(`Sintaxe inválida: ${f}\n${r.stderr}`);
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(/(?:import|export)[^'"]*?from\s+['"](\.[^'"]+)['"]/g)) {
    if (!existsSync(resolve(dirname(f), m[1]))) errors.push(`Import quebrado em ${f}: ${m[1]}`);
  }
}

for (const f of jsFiles) {
  const src = readFileSync(f, 'utf8');
  if (/href=["']#\//.test(src)) errors.push(`Link antigo com #/ em ${f} (use href="/rota")`);
  if (/(?:src|href)=["']assets\//.test(src)) errors.push(`Caminho relativo de asset em ${f} (use /assets/...)`);
}

const html = readFileSync(join(root, 'index.html'), 'utf8');
for (const m of html.matchAll(/(?:src|href|content)=["'](?!https?:|#|data:|mailto:|tel:)([^"']+\.(?:js|css|png|jpg|svg|ico|webp))["']/g)) {
  if (!existsSync(join(root, m[1]))) errors.push(`index.html referencia arquivo inexistente: ${m[1]}`);
}
for (const f of ['api/leads.js', 'api/admin.js', 'api/partners.js', 'api/portal.js', 'api/_lib.js', 'css/tailwind.css', 'robots.txt', 'assets/logo.png', 'assets/logo-wordmark.png', 'assets/favicon.png', 'css/styles.css', 'js/app.js']) {
  if (!existsSync(join(root, f))) errors.push(`Arquivo obrigatório ausente: ${f}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

// Monta a pasta publicada (dist/): só o site, sem scripts, SQL, testes ou configs.
try { rmSync(join(root, 'dist'), { recursive: true, force: true }); } catch { /* sobrescreve abaixo */ }
mkdirSync(join(root, 'dist'), { recursive: true });
function copyInto(src, dest) {
  if (statSync(src).isDirectory()) {
    mkdirSync(dest, { recursive: true });
    for (const name of readdirSync(src)) copyInto(join(src, name), join(dest, name));
  } else {
    copyFileSync(src, dest); // sobrescreve no lugar, sem apagar
  }
}
for (const item of ['index.html', 'robots.txt', 'css', 'js', 'assets']) {
  copyInto(join(root, item), join(root, 'dist', item));
}

// Sitemap gerado a partir das rotas reais (páginas de serviço, blog e páginas fixas).
const { CONFIG } = await import(pathToFileURL(join(root, 'js', 'config.js')).href);
const { BLOG_POSTS } = await import(pathToFileURL(join(root, 'js', 'blog-data.js')).href);
const SITE = 'https://clima16.com.br';
const urls = [
  ['/', '1.0'],
  ...CONFIG.services.map((s) => [`/${s.slug}`, '0.9']),
  ['/calculadora-de-btus', '0.8'],
  ['/para-profissionais', '0.7'],
  ['/blog', '0.7'],
  ...BLOG_POSTS.map((p) => [`/blog/${p.id}`, '0.6']),
  ['/politica-de-privacidade', '0.3'],
  ['/termos-de-uso', '0.3']
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
  .map(([p, prio]) => `  <url>\n    <loc>${SITE}${p}</loc>\n    <priority>${prio}</priority>\n  </url>`)
  .join('\n')}\n</urlset>\n`;
writeFileSync(join(root, 'sitemap.xml'), sitemap);
writeFileSync(join(root, 'dist', 'sitemap.xml'), sitemap);

console.log(`Build OK: ${jsFiles.length} módulos JS validados, index.html e assets conferidos, dist/ gerado.`);
