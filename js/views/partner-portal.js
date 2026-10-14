/**
 * Clima16 - Área do parceiro (/parceiro)
 * O técnico entra com e-mail e senha (criados pelo admin), vê só os leads encaminhados a ele
 * e atualiza o andamento. Token só em sessionStorage.
 */

const TOKEN_KEY = 'clima16_portal_token';

const PROGRESS = [
  { id: 'recebido', label: 'Recebido', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'em_atendimento', label: 'Em atendimento', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'fechado', label: 'Fechado (serviço feito)', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'sem_resposta', label: 'Cliente sem resposta', color: 'bg-slate-100 text-slate-700 border-slate-200' }
];

const state = { leads: [], partner: null };

function getToken() {
  try { return sessionStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; }
}
function setToken(t) {
  try { t ? sessionStorage.setItem(TOKEN_KEY, t) : sessionStorage.removeItem(TOKEN_KEY); } catch { /* sem storage */ }
}

async function api(payload, withToken = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (withToken) headers.Authorization = `Bearer ${getToken()}`;
  let res;
  try {
    res = await fetch('/api/portal', { method: 'POST', headers, body: JSON.stringify(payload) });
  } catch {
    return { ok: false, error: 'network' };
  }
  let data = null;
  try { data = await res.json(); } catch { /* sem JSON */ }
  if (!data) return { ok: false, error: 'bad_response', httpStatus: res.status };
  data.httpStatus = res.status;
  return data;
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderPartnerPortalView() {
  return `<div id="portal-root" class="bg-slate-100 min-h-screen"></div>`;
}

export function initPartnerPortalEvents() {
  if (getToken()) {
    showLoading();
    loadLeads();
  } else {
    showLogin();
  }
}

function root() { return document.getElementById('portal-root'); }

function showLoading() {
  const r = root();
  if (r) r.innerHTML = `<div class="py-24 text-center text-slate-500 text-sm">Carregando seus leads…</div>`;
}

function showLogin(message = '') {
  const r = root();
  if (!r) return;
  r.innerHTML = `
    <div class="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <form id="portal-login-form" class="w-full max-w-sm bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div>
          <h1 class="text-xl font-black text-navy">Área do parceiro</h1>
          <p class="text-xs text-slate-500 mt-1">Veja os pedidos encaminhados a você e atualize o andamento.</p>
        </div>
        <div>
          <label for="portal-email" class="block text-xs font-semibold text-slate-700 mb-1">E-mail</label>
          <input id="portal-email" type="email" required autocomplete="username" class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-brand-blue" />
        </div>
        <div>
          <label for="portal-password" class="block text-xs font-semibold text-slate-700 mb-1">Senha</label>
          <input id="portal-password" type="password" required autocomplete="current-password" class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-brand-blue" />
        </div>
        <p id="portal-login-error" class="text-xs text-rose-600 min-h-[1rem]" role="alert">${escapeHtml(message)}</p>
        <button id="portal-login-btn" type="submit" class="w-full gradient-brand text-white font-bold text-sm py-3 rounded-xl shadow-sm disabled:opacity-60">Entrar</button>
        <p class="text-xs text-slate-500 text-center">Ainda não é parceiro? <a href="/para-profissionais" class="text-brand-blue underline">Cadastre seu interesse</a>.</p>
      </form>
    </div>`;

  document.getElementById('portal-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('portal-login-btn');
    const err = document.getElementById('portal-login-error');
    btn.disabled = true;
    btn.textContent = 'Entrando…';
    err.textContent = '';
    const out = await api({
      action: 'login',
      email: document.getElementById('portal-email').value,
      password: document.getElementById('portal-password').value
    }, false);
    if (out.ok && out.access_token) {
      setToken(out.access_token);
      showLoading();
      loadLeads();
      return;
    }
    btn.disabled = false;
    btn.textContent = 'Entrar';
    err.textContent = out.error === 'invalid_credentials'
      ? 'E-mail ou senha incorretos, ou acesso ainda não liberado.'
      : out.error === 'network' ? 'Sem conexão. Tente novamente.' : 'Não foi possível entrar agora.';
  });
}

function logout(message = '') {
  setToken('');
  state.leads = [];
  state.partner = null;
  showLogin(message);
}

async function loadLeads() {
  const out = await api({ action: 'list' });
  if (out.httpStatus === 401) return logout('Sessão expirada. Entre novamente.');
  if (!out.ok) {
    const r = root();
    if (r) r.innerHTML = `<div class="py-24 text-center text-sm text-rose-600">Não foi possível carregar. <button id="portal-retry" class="underline font-semibold">Tentar de novo</button></div>`;
    document.getElementById('portal-retry')?.addEventListener('click', () => { showLoading(); loadLeads(); });
    return;
  }
  state.leads = Array.isArray(out.leads) ? out.leads : [];
  state.partner = out.partner || null;
  renderDashboard();
}

function waUrl(lead) {
  const digits = (lead.phone_digits || '').replace(/\D/g, '');
  const n = digits.length <= 11 ? `55${digits}` : digits;
  const text = `Olá, ${lead.name}! Aqui é ${state.partner ? state.partner.name : 'o parceiro'}, recebi seu pedido de orçamento pelo Clima16. Podemos conversar?`;
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}

function renderDashboard() {
  const r = root();
  if (!r) return;
  const open = state.leads.filter((l) => l.partner_status === 'recebido').length;
  const ongoing = state.leads.filter((l) => l.partner_status === 'em_atendimento').length;
  const done = state.leads.filter((l) => l.partner_status === 'fechado').length;

  r.innerHTML = `
    <div class="py-8">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 class="text-2xl font-black text-navy">Olá, ${escapeHtml(state.partner ? state.partner.name : '')}</h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">Pedidos de orçamento encaminhados a você pelo Clima16.</p>
          </div>
          <div class="flex items-center gap-3">
            <button id="portal-refresh" class="text-xs font-semibold text-slate-600 px-3 py-2 border border-slate-200 rounded-xl hover:bg-slate-50">Atualizar</button>
            <button id="portal-toggle-pw" class="text-xs font-semibold text-slate-600 px-3 py-2 border border-slate-200 rounded-xl hover:bg-slate-50">Trocar senha</button>
            <button id="portal-logout" class="text-xs font-semibold text-rose-600 px-3 py-2 border border-rose-200 rounded-xl hover:bg-rose-50">Sair</button>
          </div>
        </div>

        <form id="portal-pw-form" class="hidden bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-end gap-3">
          <div class="flex-1">
            <label for="portal-new-pw" class="block text-xs font-semibold text-slate-700 mb-1">Nova senha (mínimo 8 caracteres)</label>
            <input id="portal-new-pw" type="password" minlength="8" maxlength="72" autocomplete="new-password" required class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm" />
          </div>
          <button type="submit" class="gradient-brand text-white font-bold text-sm px-5 py-2.5 rounded-xl">Salvar senha</button>
          <p id="portal-pw-msg" class="text-xs min-h-[1rem]" role="status"></p>
        </form>

        <div class="grid grid-cols-3 gap-4">
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm"><div class="text-xs font-bold text-slate-500 uppercase tracking-wider">Novos</div><div class="text-3xl font-extrabold text-navy mt-2">${open}</div></div>
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm"><div class="text-xs font-bold text-slate-500 uppercase tracking-wider">Em atendimento</div><div class="text-3xl font-extrabold text-navy mt-2">${ongoing}</div></div>
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm"><div class="text-xs font-bold text-slate-500 uppercase tracking-wider">Fechados</div><div class="text-3xl font-extrabold text-navy mt-2">${done}</div></div>
        </div>

        <div id="portal-list" class="space-y-4"></div>
      </div>
    </div>`;

  renderList();
  bind();
}

function renderList() {
  const list = document.getElementById('portal-list');
  if (!list) return;
  if (!state.leads.length) {
    list.innerHTML = `<div class="bg-white p-10 rounded-2xl border border-slate-200 text-center text-sm text-slate-500">Nenhum pedido encaminhado a você por enquanto. Assim que houver um, ele aparece aqui e chega no seu e-mail.</div>`;
    return;
  }
  list.innerHTML = state.leads.map((l) => {
    const st = PROGRESS.find((p) => p.id === l.partner_status) || PROGRESS[0];
    const when = l.dispatched_at
      ? new Date(l.dispatched_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
      : '';
    return `
      <article class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div class="space-y-1.5 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <h2 class="text-base font-bold text-slate-900">${escapeHtml(l.name)}</h2>
            <span class="text-xs text-slate-400">Recebido em ${escapeHtml(when)}</span>
          </div>
          <div class="text-sm text-brand-blue font-semibold">${escapeHtml(l.service_type)}</div>
          <div class="text-xs text-slate-600">${escapeHtml([l.neighborhood, 'Ribeirão Preto'].filter(Boolean).join(', '))}${l.property_type ? ` · ${escapeHtml(l.property_type)}` : ''}${l.btu ? ` · ${escapeHtml(l.btu)}` : ''}</div>
          ${l.description ? `<p class="text-xs text-slate-500 italic whitespace-pre-line">${escapeHtml(l.description)}</p>` : ''}
          <div class="text-xs text-slate-600">${escapeHtml(l.phone)}${l.email ? ` · ${escapeHtml(l.email)}` : ''}</div>
        </div>
        <div class="flex sm:flex-col gap-3 sm:items-end shrink-0">
          <a href="${escapeHtml(waUrl(l))}" target="_blank" rel="noopener" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-sm text-center">Chamar no WhatsApp</a>
          <select class="portal-status text-xs font-bold px-2.5 py-2 rounded-lg border ${st.color}" data-id="${escapeHtml(l.id)}" aria-label="Andamento">
            ${PROGRESS.map((p) => `<option value="${p.id}" ${p.id === l.partner_status ? 'selected' : ''}>${p.label}</option>`).join('')}
          </select>
        </div>
      </article>`;
  }).join('');
}

function bind() {
  document.getElementById('portal-logout')?.addEventListener('click', () => logout());
  document.getElementById('portal-refresh')?.addEventListener('click', () => { showLoading(); loadLeads(); });
  document.getElementById('portal-toggle-pw')?.addEventListener('click', () => {
    document.getElementById('portal-pw-form')?.classList.toggle('hidden');
  });

  document.getElementById('portal-pw-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('portal-pw-msg');
    const input = document.getElementById('portal-new-pw');
    msg.textContent = 'Salvando…';
    msg.className = 'text-xs text-slate-500';
    const out = await api({ action: 'change_password', password: input.value });
    if (out.httpStatus === 401) return logout('Sessão expirada. Entre novamente.');
    if (out.ok) {
      msg.textContent = 'Senha atualizada.';
      msg.className = 'text-xs text-emerald-700 font-semibold';
      input.value = '';
    } else {
      msg.textContent = out.error === 'weak_password' ? 'Senha fraca ou curta demais. Use 8+ caracteres.' : 'Não foi possível salvar agora.';
      msg.className = 'text-xs text-rose-600';
    }
  });

  document.getElementById('portal-list')?.addEventListener('change', async (e) => {
    const el = e.target;
    if (!el.classList.contains('portal-status')) return;
    const lead = state.leads.find((l) => l.id === el.getAttribute('data-id'));
    if (!lead) return;
    const previous = lead.partner_status;
    lead.partner_status = el.value;
    const out = await api({ action: 'update_status', id: lead.id, partner_status: el.value });
    if (out.httpStatus === 401) return logout('Sessão expirada. Entre novamente.');
    if (!out.ok) {
      lead.partner_status = previous;
      alert('Não foi possível salvar o andamento. Tente novamente.');
    }
    renderDashboard();
  });
}
