/**
 * Helpers compartilhados pelas funções em /api (arquivo com "_" no início não vira endpoint na Vercel).
 */
const crypto = require('node:crypto');

async function boundedFetch(url, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try { return await fetch(url, { ...init, signal: init.signal || controller.signal }); }
  finally { clearTimeout(timer); }
}

function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return /^55\d{10,11}$/.test(digits) ? digits.slice(2) : digits;
}

function clean(value, max) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

function cleanMultiline(value, max) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  return (req.headers['x-real-ip'] || (req.socket && req.socket.remoteAddress) || '').toString();
}

function hashIp(ip) {
  if (!ip) return null;
  const salt = process.env.IP_HASH_SALT || 'clima16';
  return crypto.createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS_PER_EMAIL = 8;
const MAX_FAILS_PER_IP = 30;

function hashKey(value) {
  const salt = process.env.IP_HASH_SALT || 'clima16';
  return crypto.createHash('sha256').update(`${salt}:login:${value}`).digest('hex');
}

/**
 * Limita tentativas de login (tabela auth_failures). Falha "aberta": se a tabela não existir
 * ou o Supabase falhar, não bloqueia ninguém — só deixa de contar.
 */
async function loginThrottle(baseUrl, key, req, scope, email) {
  const ipHash = hashKey(`${scope}:ip:${clientIp(req)}`);
  const emailHash = hashKey(`${scope}:email:${String(email || '').toLowerCase()}`);
  const since = encodeURIComponent(new Date(Date.now() - LOGIN_WINDOW_MS).toISOString());
  async function count(col, value, limit) {
    const r = await boundedFetch(`${baseUrl}/rest/v1/auth_failures?select=id&${col}=eq.${value}&created_at=gte.${since}&limit=${limit}`, {
      headers: supabaseHeaders(key)
    });
    if (!r.ok) return 0;
    const rows = await r.json();
    return Array.isArray(rows) ? rows.length : 0;
  }
  let blocked = false;
  try {
    blocked = (await count('email_hash', emailHash, MAX_FAILS_PER_EMAIL)) >= MAX_FAILS_PER_EMAIL
      || (await count('ip_hash', ipHash, MAX_FAILS_PER_IP)) >= MAX_FAILS_PER_IP;
  } catch { blocked = false; }
  return {
    blocked,
    async fail() {
      try {
        await boundedFetch(`${baseUrl}/rest/v1/auth_failures`, {
          method: 'POST',
          headers: supabaseHeaders(key, { Prefer: 'return=minimal' }),
          body: JSON.stringify({ scope, ip_hash: ipHash, email_hash: emailHash })
        });
      } catch { /* só registro */ }
    }
  };
}

function supabaseHeaders(key, extra = {}) {
  const headers = { apikey: key, 'Content-Type': 'application/json', ...extra };
  if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`;
  return headers;
}

function parseBody(req) {
  const body = req.body;
  if (!body) return null;
  if (typeof body === 'string') {
    try { return JSON.parse(body); } catch { return null; }
  }
  return typeof body === 'object' ? body : null;
}

async function postEmail({ to, subject, html, text, replyTo, tag = 'api', idempotencyKey }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.LEAD_FROM;
  if (!apiKey || !from || !to || !to.length) return false;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const payload = { from, to, subject, html, text };
    if (replyTo) payload.reply_to = replyTo;
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}) },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    if (!res.ok) console.error(`[${tag}] resend_failed`, res.status);
    return res.ok;
  } catch (err) {
    console.error(`[${tag}] resend_error`, err && err.name);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { loginThrottle, clean, cleanMultiline, escapeHtml, clientIp, hashIp, supabaseHeaders, parseBody, postEmail, boundedFetch, normalizePhone };
