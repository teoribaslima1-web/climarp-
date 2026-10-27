/**
 * Clima16 - POST /api/funnel
 * Conta em qual etapa do formulário de orçamento as pessoas chegam (funil).
 * Sem cookies e sem dados pessoais: não grava IP, nome, telefone nem identificador do visitante.
 * Só aceita valores de listas fixas. Responde 204 mesmo se o banco falhar: métrica nunca
 * atrapalha o pedido de orçamento.
 */
const { supabaseHeaders, parseBody, boundedFetch: fetch } = require('./_lib');

const EVENTS = ['inicio', 'servico', 'local', 'bairro', 'envio', 'enviado', 'whatsapp'];
const ENTRIES = ['home', 'servico'];
const DEVICES = ['mobile', 'desktop', 'tablet'];
const SERVICES = [
  'Instalação de ar-condicionado',
  'Manutenção de ar-condicionado',
  'Limpeza e higienização',
  'Ar-condicionado não está gelando',
  'Vazamento / gotejamento',
  'Recarga / avaliação de gás',
  'Outro serviço de ar-condicionado'
];

function toRow(body) {
  if (!body || !EVENTS.includes(body.event)) return null;
  const source = typeof body.source === 'string' && /^[a-z0-9._-]{1,40}$/i.test(body.source) ? body.source.toLowerCase() : null;
  return {
    event: body.event,
    entry: ENTRIES.includes(body.entry) ? body.entry : 'home',
    service: SERVICES.includes(body.service) ? body.service : null,
    step: Number.isInteger(body.step) && body.step >= 1 && body.step <= 4 ? body.step : null,
    device: DEVICES.includes(body.device) ? body.device : null,
    source
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }
  if (typeof req.body === 'string' && req.body.length > 1000) return res.status(413).json({ ok: false, error: 'too_large' });

  const row = toRow(parseBody(req));
  if (!row) return res.status(400).json({ ok: false, error: 'invalid_event' });

  const baseUrl = (process.env.SUPABASE_URL || '').replace(/\/+$/, '').replace(/\/rest\/v1$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (baseUrl && key) {
    try {
      const r = await fetch(`${baseUrl}/rest/v1/form_funnel_events`, {
        method: 'POST',
        headers: supabaseHeaders(key, { Prefer: 'return=minimal' }),
        body: JSON.stringify(row)
      });
      if (!r.ok) console.error('[funnel] insert_failed', r.status);
    } catch (err) {
      console.error('[funnel] insert_error', err && err.name);
    }
  }
  res.statusCode = 204;
  return res.end();
};

module.exports._internals = { toRow, EVENTS };
