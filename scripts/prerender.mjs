import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export async function prerender(root, template) {
  // Ambiente de build apenas: os renderizadores são os mesmos usados no navegador.
  const store = () => ({ getItem: () => null, setItem() {}, removeItem() {} });
  globalThis.localStorage = store();
  globalThis.sessionStorage = store();
  globalThis.window = { location: { search: '', hash: '', pathname: '/', href: 'https://clima16.com.br/' }, dataLayer: [] };
  globalThis.document = { referrer: '' };
  Object.defineProperty(globalThis, 'navigator', { value: { userAgent: 'build' }, configurable: true });
  const { ROUTE_META } = await import('../js/router.js');
  const { CONFIG } = await import('../js/config.js');
  const { BLOG_POSTS } = await import('../js/blog-data.js');
  const { renderHomeView } = await import('../js/views/home.js');
  const { renderServicePageView } = await import('../js/views/service-page.js');
  const { renderBlogView } = await import('../js/views/blog.js');
  const { renderPartnersView } = await import('../js/views/partners.js');
  const { renderBtuCalculatorView } = await import('../js/views/btu-calculator.js');
  const { renderPrivacyPolicyView, renderTermsView } = await import('../js/views/legal.js');
  const { renderHeader } = await import('../js/components/header.js');
  const { renderFooter } = await import('../js/components/footer.js');
  const { renderNotFoundView } = await import('../js/views/not-found.js');
  const pages = [
    ['/', renderHomeView(), ROUTE_META['/']],
    ...CONFIG.services.map(s => [`/${s.slug}`, renderServicePageView(s.slug), ROUTE_META[`/${s.slug}`]]),
    ['/blog', renderBlogView(), ROUTE_META['/blog']],
    ...BLOG_POSTS.map(p => [`/blog/${p.id}`, renderBlogView(p.id), { title: `${p.title} | Clima16`, description: p.summary }]),
    ['/para-profissionais', renderPartnersView(), ROUTE_META['/para-profissionais']],
    ['/calculadora-de-btus', renderBtuCalculatorView(), ROUTE_META['/calculadora-de-btus']],
    ['/politica-de-privacidade', renderPrivacyPolicyView(), ROUTE_META['/politica-de-privacidade']],
    ['/termos-de-uso', renderTermsView(), ROUTE_META['/termos-de-uso']],
    ['/como-funciona', renderHomeView(), ROUTE_META['/como-funciona']],
    ...['/admin', '/parceiro', '/solicitacao-recebida'].map(path => [path, '', ROUTE_META[path], true]),
    ['/404', renderNotFoundView(), { title: 'Página não encontrada | Clima16', description: 'Encontre serviços de climatização em Ribeirão Preto.' }, true]
  ];
  const escape = s => String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  for (const [path, content, meta, noindex] of pages) {
    let html = template
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(meta.title)}</title>`)
      .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${escape(meta.description)}" />`)
      .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="https://clima16.com.br${path}" />`)
      .replace(/<meta name="robots"[^>]*>/, `<meta name="robots" content="${noindex ? 'noindex, nofollow' : 'index, follow'}" />`)
      .replace(/<main id="app-mount"[^>]*><\/main>/, `<main id="app-mount" class="flex-1">${content}</main>`)
      .replace('<div id="header-mount"></div>', `<div id="header-mount">${renderHeader()}</div>`)
      .replace('<div id="footer-mount"></div>', `<div id="footer-mount">${renderFooter()}</div>`);
    html = html.replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${escape(meta.title)}" />`)
      .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${escape(meta.description)}" />`)
      .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="https://clima16.com.br${path}" />`);
    html = html.replace(/<meta name="title"[^>]*>/, `<meta name="title" content="${escape(meta.title)}" />`)
      .replace(/<meta property="twitter:title"[^>]*>/, `<meta property="twitter:title" content="${escape(meta.title)}" />`)
      .replace(/<meta property="twitter:description"[^>]*>/, `<meta property="twitter:description" content="${escape(meta.description)}" />`);
    if (!html.includes('name="robots"')) html = html.replace('</head>', `<meta name="robots" content="${noindex ? 'noindex, nofollow' : 'index, follow'}"></head>`);
    const dir = path === '/' ? join(root, 'dist') : join(root, 'dist', path.slice(1));
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), html);
  }
  return pages.length;
}
