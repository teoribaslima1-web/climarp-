/**
 * Clima16 - GET /api/health
 * Chamado 1x por dia pelo agendamento (cron) da Vercel definido em vercel.json.
 * Faz uma consulta mínima ao Supabase para registrar atividade e evitar que o projeto
 * do plano gratuito seja pausado por inatividade. Não devolve nenhum dado do banco.
 *
 * Se a variável CRON_SECRET existir na Vercel, só aceita chamadas com
 * "Authorization: Bearer <CRON_SECRET>" (a própria Vercel envia esse cabeçalho no cron).
 */
const { supabaseHeaders, boundedFetch: fetch } = require('./_lib');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.authorization || req.headers.Authorization || '';
    if (auth !== `Bearer ${secret}`) return res.status(401).json({ ok: false, error: 'unauthorized' });
  }

  const baseUrl = (process.env.SUPABASE_URL || '').replace(/\/+$/, '').replace(/\/rest\/v1$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl || !key) return res.status(500).json({ ok: false, error: 'not_configured' });

  try {
    const r = await fetch(`${baseUrl}/rest/v1/leads?select=id&limit=1`, { headers: supabaseHeaders(key) });
    if (!r.ok) { console.error('[health] supabase', r.status); return res.status(502).json({ ok: false, error: 'unavailable' }); }
    return res.status(200).json({ ok: true, checked_at: new Date().toISOString() });
  } catch (err) {
    return res.status(502).json({ ok: false, error: 'unavailable' });
  }
};
