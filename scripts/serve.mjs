import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
const require = createRequire(import.meta.url);
const root = resolve('dist');
const fixtures = process.argv.includes('--fixtures');
const port = fixtures ? 3001 : 3000;
if (!existsSync(root)) throw new Error('Execute npm run build antes de iniciar.');
if (fixtures) {
  // Ambiente descartável local: nenhuma chamada externa, nenhum envio real.
  Object.assign(process.env, { SUPABASE_URL: 'https://fixture.invalid', SUPABASE_SERVICE_ROLE_KEY: 'sb_secret_fixture', SUPABASE_ANON_KEY: 'sb_publishable_fixture', ADMIN_EMAILS: 'admin@example.com', RESEND_API_KEY: 'fixture', LEAD_FROM: 'Clima16 <fixture@example.com>', LEAD_NOTIFY_TO: 'admin@example.com' });
  const leads = [], partners = [], funnelEvents = [];
  globalThis.fetch = async (raw, init = {}) => {
    const url = new URL(raw), method = init.method || 'GET';
    const data = init.body ? JSON.parse(init.body) : {};
    const result = (body, status = 200) => ({ ok: status < 300, status, json: async () => body });
    if (url.hostname === 'api.resend.com') return result({ id: randomUUID() });
    if (url.hostname !== 'fixture.invalid') throw new Error('external_network_disabled');
    if (url.pathname.endsWith('/auth/v1/token')) return data.email === 'admin@example.com' && data.password === 'test-local' ? result({ access_token: 'fixture-admin', expires_in: 3600 }) : result({}, 400);
    if (url.pathname.endsWith('/auth/v1/user')) return init.headers.Authorization === 'Bearer fixture-admin' ? result({ email: 'admin@example.com' }) : result({}, 401);
    const table = url.pathname.endsWith('/leads') ? leads : url.pathname.endsWith('/partners') ? partners : url.pathname.endsWith('/form_funnel_events') ? funnelEvents : null;
    if (!table) throw new Error('fixture_route_missing');
    const selected = table.filter(row => [...url.searchParams].every(([key, val]) => {
      if (val.startsWith('eq.')) return String(row[key]) === val.slice(3);
      if (val.startsWith('gte.')) return String(row[key]) >= val.slice(4);
      if (val.startsWith('in.(')) return val.slice(4, -1).split(',').includes(String(row[key]));
      return true;
    }));
    if (method === 'GET') return result(selected);
    if (method === 'POST') {
      if (data.id && table.some(row => row.id === data.id)) return result({}, 409);
      const row = { id: randomUUID(), created_at: new Date().toISOString(), first_contact_at: null, quoted_at: null, closed_at: null, service_value: null, notification_status: 'unknown', ...data };
      table.push(row); return result([row]);
    }
    if (method === 'PATCH') { selected.forEach(row => Object.assign(row, data)); return result(selected); }
    return result({}, 405);
  };
}
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css', '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml', '.xml':'application/xml', '.txt':'text/plain', '.webp':'image/webp' };
createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, `http://127.0.0.1:${port}`).pathname);
  if (/^\/api\/(leads|partners|admin|portal|funnel)$/.test(path)) {
    let body = '';
    for await (const chunk of req) { body += chunk; if (body.length > 32000) { res.writeHead(413); res.end(); return; } }
    req.body = body;
    res.status = code => { res.statusCode = code; return res; };
    res.json = value => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(value)); return res; };
    try { await require(`../api/${path.split('/').pop()}.js`)(req, res); }
    catch { if (!res.writableEnded) res.status(500).json({ ok:false, error:'local_error' }); }
    return;
  }
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
  let file = resolve(root, '.' + path);
  if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403); res.end(); return; }
  if (existsSync(file) && statSync(file).isDirectory()) file = resolve(file, 'index.html');
  if (!existsSync(file) && /^\/(formulario|servicos|como-funciona|faq|cobertura|calculadora)$/.test(path)) file = resolve(root, 'index.html');
  if (!existsSync(file)) { file = resolve(root, '404/index.html'); res.statusCode = 404; }
  res.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream');
  res.end(req.method === 'HEAD' ? '' : readFileSync(file));
}).listen(port, '127.0.0.1', () => console.log(`Clima16 local: http://127.0.0.1:${port}${fixtures ? ' (teste descartável; login admin@example.com / test-local)' : ''}`));
