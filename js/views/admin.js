/**
 * Clima16 - Painel admin (/admin)
 * Login (Supabase Auth via /api/admin) + leads reais do banco.
 * O token fica só em sessionStorage (some ao fechar a aba). Nada de leads no navegador além da sessão aberta.
 */

const TOKEN_KEY = 'clima16_admin_token';

const STATUS = [
  { id: 'novo', label: 'Novo', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'em_contato', label: 'Em contato', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'encaminhado', label: 'Encaminhado', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'convertido', label: 'Convertido', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'perdido', label: 'Perdido', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { id: 'invalido', label: 'Não válido', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { id: 'duplicado', label: 'Duplicado', color: 'bg-rose-100 text-rose-800 border-rose-200' }
];

const PARTNER_STATUS = [
  { id: 'novo', label: 'Novo', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'em_analise', label: 'Em análise', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'aprovado', label: 'Aprovado', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'recusado', label: 'Recusado', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { id: 'duplicado', label: 'Duplicado', color: 'bg-rose-100 text-rose-800 border-rose-200' }
];

const PROGRESS_LABEL = { recebido: 'Recebido', em_atendimento: 'Em atendimento', fechado: 'Fechado', sem_resposta: 'Sem resposta' };

const state = { leads: [], partners: [], partnersError: false, email: '', search: '', status: '' };

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
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    res = await fetch('/api/admin', { method: 'POST', headers, body: JSON.stringify(payload), signal: controller.signal });
  } catch {
    return { ok: false, error: 'network' };
  } finally {
    clearTimeout(timer);
  }
  let data = null;
  try { data = await res.json(); } catch { /* resposta sem JSON */ }
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

export function renderAdminView() {
  return `<div id="admin-root" class="bg-slate-100 min-h-screen"></div>`;
}

export function initAdminEvents() {
  // Página interna: pede para buscadores não indexarem.
  let robots = document.querySelector('meta[name="robots"]');
  if (!robots) {
    robots = document.createElement('meta');
    robots.setAttribute('name', 'robots');
    document.head.appendChild(robots);
  }
  robots.setAttribute('content', 'noindex, nofollow');

  if (getToken()) {
    showLoading();
    loadLeads();
  } else {
    showLogin();
  }
}

function root() { return document.getElementById('admin-root'); }

function showLoading() {
  const r = root();
  if (r) r.innerHTML = `<div class="py-24 text-center text-slate-500 text-sm">Carregando leads…</div>`;
}

/* ---------------------------- Login ---------------------------- */

function showLogin(message = '') {
  const r = root();
  if (!r) return;
  r.innerHTML = `
    <div class="min-h-screen flex items-center justify-center px-4 py-12">
      <form id="admin-login-form" class="w-full max-w-sm bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5" autocomplete="on">
        <div>
          <h1 class="text-xl font-black text-navy">Painel Clima16</h1>
          <p class="text-xs text-slate-500 mt-1">Acesso restrito à equipe.</p>
        </div>
        <div>
          <label for="admin-email" class="block text-xs font-semibold text-slate-700 mb-1">E-mail</label>
          <input id="admin-email" type="email" required autocomplete="username" class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-brand-blue" />
        </div>
        <div>
          <label for="admin-password" class="block text-xs font-semibold text-slate-700 mb-1">Senha</label>
          <input id="admin-password" type="password" required autocomplete="current-password" class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-brand-blue" />
        </div>
        <p id="admin-login-error" class="text-xs text-rose-600 min-h-[1rem]" role="alert">${escapeHtml(message)}</p>
        <button id="admin-login-btn" type="submit" class="w-full gradient-brand text-white font-bold text-sm py-3 rounded-xl shadow-sm disabled:opacity-60">Entrar</button>
        <a href="/" class="block text-center text-xs text-slate-500 hover:text-navy">Voltar ao site</a>
      </form>
    </div>`;

  document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('admin-login-btn');
    const err = document.getElementById('admin-login-error');
    btn.disabled = true;
    btn.textContent = 'Entrando…';
    err.textContent = '';
    const out = await api({
      action: 'login',
      email: document.getElementById('admin-email').value,
      password: document.getElementById('admin-password').value
    }, false);
    if (out.ok && out.access_token) {
      setToken(out.access_token);
      state.email = out.email || '';
      showLoading();
      loadLeads();
      return;
    }
    btn.disabled = false;
    btn.textContent = 'Entrar';
    err.textContent = loginErrorText(out);
  });
}

function loginErrorText(out) {
  if (out.error === 'invalid_credentials') return 'E-mail ou senha incorretos.';
  if (out.error === 'auth_unavailable') return 'Serviço de login indisponível. Tente novamente em alguns minutos.';
  if (out.error === 'too_many_attempts') return 'Muitas tentativas. Aguarde 15 minutos e tente de novo.';
  if (out.error === 'server_not_configured') return 'Painel indisponível no momento.';
  if (out.error === 'network') return 'Sem conexão. Tente novamente.';
  return 'Não foi possível entrar agora.';
}

function logout(message = '') {
  setToken('');
  state.leads = [];
  showLogin(message);
}

/* ---------------------------- Dados ---------------------------- */

async function loadLeads() {
  const out = await api({ action: 'list' });
  if (out.httpStatus === 401) return logout('Sessão expirada. Entre novamente.');
  if (!out.ok) {
    const r = root();
    if (r) r.innerHTML = `<div class="py-24 text-center text-sm text-rose-600">Não foi possível carregar os leads. <button id="admin-retry" class="underline font-semibold">Tentar de novo</button></div>`;
    document.getElementById('admin-retry')?.addEventListener('click', () => { showLoading(); loadLeads(); });
    return;
  }
  state.leads = Array.isArray(out.leads) ? out.leads : [];
  if (out.admin) state.email = out.admin;
  const pOut = await api({ action: 'list_partners' });
  state.partnersError = !pOut.ok;
  state.partners = pOut.ok && Array.isArray(pOut.partners) ? pOut.partners : [];
  renderDashboard();
}

function computeStats(leads) {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const real = leads.filter((l) => l.status !== 'duplicado' && l.status !== 'invalido');
  const within = (l, ms) => now - new Date(l.created_at).getTime() <= ms;
  const byService = {};
  const bySource = {};
  real.forEach((l) => {
    byService[l.service_type || '—'] = (byService[l.service_type || '—'] || 0) + 1;
    const src = l.utm_source || 'direto';
    bySource[src] = (bySource[src] || 0) + 1;
  });
  return {
    total: real.length,
    today: real.filter((l) => within(l, day)).length,
    sevenDays: real.filter((l) => within(l, 7 * day)).length,
    thirtyDays: real.filter((l) => within(l, 30 * day)).length,
    waiting: leads.filter((l) => l.status === 'novo').length,
    byService,
    bySource,
    contacted: real.filter(l => l.first_contact_at).length,
    quoted: real.filter(l => l.quoted_at).length,
    closed: real.filter(l => l.closed_at || l.status === 'convertido' || l.partner_status === 'fechado').length,
    serviceValue: real.reduce((total, l) => total + (l.closed_at || l.status === 'convertido' || l.partner_status === 'fechado' ? Number(l.service_value) || 0 : 0), 0)
  };
}

/* ---------------------------- Dashboard ---------------------------- */

function kpi(label, value, hint) {
  return `
    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">${label}</span>
      <div class="text-3xl font-extrabold text-navy mt-3">${value}</div>
      <p class="text-xs text-slate-400 mt-1">${hint}</p>
    </div>`;
}

function bars(map, total, barClass) {
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return '<p class="text-xs text-slate-400">Nenhum dado registrado.</p>';
  return entries.map(([k, count]) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return `
      <div>
        <div class="flex justify-between text-xs font-semibold text-slate-700 mb-1">
          <span>${escapeHtml(k)}</span><span>${count} (${pct}%)</span>
        </div>
        <div class="h-2 bg-slate-100 rounded-full overflow-hidden"><div class="h-full ${barClass}" style="width:${pct}%"></div></div>
      </div>`;
  }).join('');
}

function renderDashboard() {
  const r = root();
  if (!r) return;
  const stats = computeStats(state.leads);

  r.innerHTML = `
    <div class="py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 class="text-2xl font-black text-navy">Painel de Gestão Clima16</h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">Leads reais do banco · ${escapeHtml(state.email)}</p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <button id="admin-refresh" class="text-xs font-semibold text-slate-600 hover:text-navy px-3 py-2 border border-slate-200 rounded-xl hover:bg-slate-50">Atualizar</button>
            <button id="btn-export-csv" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm">Exportar CSV</button>
            <a href="/" class="text-xs font-semibold text-slate-600 hover:text-navy px-3 py-2 border border-slate-200 rounded-xl hover:bg-slate-50">Ver site</a>
            <button id="admin-logout" class="text-xs font-semibold text-rose-600 hover:text-rose-700 px-3 py-2 border border-rose-200 rounded-xl hover:bg-rose-50">Sair</button>
          </div>
        </div>

        <div id="admin-notice" class="hidden p-4 rounded-2xl border text-sm" role="status"></div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${kpi('Leads 24h', stats.today, 'Últimas 24 horas')}
          ${kpi('Últimos 7 dias', stats.sevenDays, 'Sem duplicados/inválidos')}
          ${kpi('Últimos 30 dias', stats.thirtyDays, 'Volume acumulado')}
          ${kpi('Aguardando contato', stats.waiting, 'Leads com status "Novo"')}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
            <h3 class="text-base font-bold text-navy mb-3">Resultados comerciais registrados</h3>
            <p class="text-sm text-slate-600">Contatos: ${stats.contacted} · Orçamentos: ${stats.quoted} · Fechamentos: ${stats.closed} · Valor dos serviços fechados: ${stats.serviceValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            <p class="text-xs text-slate-400 mt-2">Valor dos serviços é do parceiro, não receita da Clima16. Campos sem feedback permanecem sem resultado.</p>
          </div>
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 class="text-base font-bold text-navy mb-4">Leads por serviço</h3>
            <div class="space-y-3">${bars(stats.byService, stats.total, 'gradient-brand')}</div>
          </div>
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 class="text-base font-bold text-navy mb-4">Leads por origem</h3>
            <div class="space-y-3">${bars(stats.bySource, stats.total, 'bg-cyan-500')}</div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-bold text-navy">Solicitações</h2>
              <span class="text-xs text-slate-400 font-mono" id="admin-count"></span>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <input type="text" id="admin-search-input" placeholder="Buscar por nome, fone ou bairro..." value="${escapeHtml(state.search)}" class="px-3.5 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:border-brand-blue" />
              <select id="admin-filter-status" class="px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700">
                <option value="">Todos os status</option>
                ${STATUS.map((s) => `<option value="${s.id}" ${state.status === s.id ? 'selected' : ''}>${s.label}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs sm:text-sm">
              <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th class="p-4">Data</th>
                  <th class="p-4">Cliente / contato</th>
                  <th class="p-4">Bairro</th>
                  <th class="p-4">Serviço / detalhes</th>
                  <th class="p-4">Status</th>
                  <th class="p-4">Parceiro</th>
                  <th class="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100" id="admin-leads-tbody"></tbody>
            </table>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-slate-100 flex items-center gap-2">
            <h2 class="text-lg font-bold text-navy">Parceiros (cadastros de interesse)</h2>
            <span class="text-xs text-slate-400 font-mono">(${state.partners.length})</span>
          </div>
          ${state.partnersError ? '<p class="p-5 text-xs text-rose-600">Não foi possível carregar os parceiros. Confira se a tabela "partners" foi criada no Supabase (rode o supabase/schema.sql).</p>' : ''}
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs sm:text-sm">
              <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th class="p-4">Data</th>
                  <th class="p-4">Parceiro / contato</th>
                  <th class="p-4">Serviços</th>
                  <th class="p-4">Sobre</th>
                  <th class="p-4">Status</th>
                  <th class="p-4">Acesso ao portal</th>
                  <th class="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100" id="admin-partners-tbody"></tbody>
            </table>
          </div>
        </div>

      </div>
    </div>`;

  renderRows();
  renderPartnerRows();
  bindDashboard();
}

function renderPartnerRows() {
  const tbody = document.getElementById('admin-partners-tbody');
  if (!tbody) return;
  if (!state.partners.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-slate-400 text-sm">Nenhum cadastro de parceiro ainda.</td></tr>`;
    return;
  }
  tbody.innerHTML = state.partners.map((p) => {
    const when = new Date(p.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
    const st = PARTNER_STATUS.find((s) => s.id === p.status) || PARTNER_STATUS[0];
    const digits = (p.phone_digits || '').replace(/\D/g, '');
    const wa = `https://wa.me/${digits.length <= 11 ? '55' + digits : digits}`;
    return `
      <tr class="hover:bg-slate-50/80">
        <td class="p-4 text-slate-500 text-xs">${when}</td>
        <td class="p-4">
          <div class="font-bold text-slate-800">${escapeHtml(p.name)}</div>
          <a href="${wa}" target="_blank" rel="noopener" class="text-emerald-700 font-medium hover:underline text-xs">${escapeHtml(p.phone)}</a>
          ${p.email ? `<div class="text-slate-400 text-xs">${escapeHtml(p.email)}</div>` : ''}
          ${p.cnpj ? `<div class="text-slate-400 text-xs font-mono">CNPJ ${escapeHtml(p.cnpj)}</div>` : ''}
        </td>
        <td class="p-4 text-xs text-slate-700">${escapeHtml((p.services || []).join(', '))}<div class="text-slate-400">${escapeHtml(p.city || '')}</div></td>
        <td class="p-4 text-xs text-slate-500 max-w-xs whitespace-pre-line">${escapeHtml(p.bio || '—')}</td>
        <td class="p-4">
          <select class="admin-partner-status text-xs font-bold px-2.5 py-1 rounded-lg border ${st.color}" data-id="${escapeHtml(p.id)}">
            ${PARTNER_STATUS.map((s) => `<option value="${s.id}" ${s.id === p.status ? 'selected' : ''}>${s.label}</option>`).join('')}
          </select>
        </td>
        <td class="p-4 text-xs">
          ${p.status !== 'aprovado' ? '<span class="text-slate-400">Aprove para liberar</span>'
            : !p.email ? '<span class="text-slate-400">Sem e-mail cadastrado</span>'
            : `<button class="admin-access-btn font-semibold text-brand-blue hover:underline" data-id="${escapeHtml(p.id)}">${p.auth_user_id ? 'Redefinir senha' : 'Criar acesso'}</button>`}
        </td>
        <td class="p-4 text-right">
          <button class="admin-partner-delete text-slate-400 hover:text-rose-600 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-rose-50" data-id="${escapeHtml(p.id)}">Excluir</button>
        </td>
      </tr>`;
  }).join('');
}

function visibleLeads() {
  const q = state.search.toLowerCase().trim();
  const qDigits = q.replace(/\D/g, '');
  return state.leads.filter((l) => {
    if (state.status && l.status !== state.status) return false;
    if (!q) return true;
    return (l.name || '').toLowerCase().includes(q)
      || (l.neighborhood || '').toLowerCase().includes(q)
      || (qDigits && (l.phone_digits || '').includes(qDigits));
  });
}

function protocolFor(id) {
  return 'C16-' + String(id || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
}

function renderRows() {
  const tbody = document.getElementById('admin-leads-tbody');
  if (!tbody) return;
  const leads = visibleLeads();
  const count = document.getElementById('admin-count');
  if (count) count.textContent = `(${leads.length} de ${state.leads.length})`;

  if (!leads.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-slate-400 text-sm">Nenhum lead encontrado.</td></tr>`;
    return;
  }

  const approved = state.partners.filter((p) => p.status === 'aprovado');
  tbody.innerHTML = leads.map((l) => {
    const when = new Date(l.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
    const st = STATUS.find((s) => s.id === l.status) || STATUS[0];
    const digits = (l.phone_digits || '').replace(/\D/g, '');
    const wa = `https://wa.me/${digits.length <= 11 ? '55' + digits : digits}`;
    return `
      <tr class="hover:bg-slate-50/80" data-id="${escapeHtml(l.id)}">
        <td class="p-4">
          <div class="font-bold text-navy font-mono text-xs">${protocolFor(l.id)}</div>
          <div class="text-slate-400 text-xs">${when}</div>
          <div class="text-[11px] text-slate-400 font-mono">${escapeHtml(l.utm_source || 'direto')}</div>
        </td>
        <td class="p-4">
          <div class="font-bold text-slate-800">${escapeHtml(l.name)}</div>
          <a href="${wa}" target="_blank" rel="noopener" class="text-emerald-700 font-medium hover:underline text-xs">${escapeHtml(l.phone)}</a>
          ${l.email ? `<div class="text-slate-400 text-xs truncate max-w-[160px]">${escapeHtml(l.email)}</div>` : ''}
        </td>
        <td class="p-4">
          <span class="font-semibold text-slate-800">${escapeHtml(l.neighborhood || '—')}</span>
          <div class="text-xs text-slate-400">${escapeHtml(l.city || '')}</div>
        </td>
        <td class="p-4">
          <div class="font-semibold text-brand-blue">${escapeHtml(l.service_type)}</div>
          <div class="text-xs text-slate-500">${escapeHtml([l.property_type, l.btu].filter(Boolean).join(' • ') || '—')}</div>
          ${l.description ? `<div class="text-xs text-slate-500 italic mt-1 max-w-xs whitespace-pre-line">${escapeHtml(l.description)}</div>` : ''}
        </td>
        <td class="p-4">
          <select class="admin-status text-xs font-bold px-2.5 py-1 rounded-lg border ${st.color}" data-id="${escapeHtml(l.id)}">
            ${STATUS.map((s) => `<option value="${s.id}" ${s.id === l.status ? 'selected' : ''}>${s.label}</option>`).join('')}
          </select>
        </td>
        <td class="p-4">
          <input type="text" maxlength="120" class="admin-partner text-xs px-2.5 py-1 border border-slate-200 rounded-lg w-36" placeholder="Nome do parceiro..." value="${escapeHtml(l.assigned_partner || '')}" data-id="${escapeHtml(l.id)}" />
          ${approved.length ? `<select class="admin-dispatch mt-1.5 text-xs px-2 py-1 border border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold rounded-lg w-36" data-id="${escapeHtml(l.id)}">
            <option value="">${l.partner_id ? 'Reencaminhar a…' : 'Encaminhar a…'}</option>
            ${approved.map((p) => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.name)}</option>`).join('')}
          </select>` : ''}
          ${l.partner_id ? `<div class="text-[11px] text-slate-500 mt-1">Andamento: <strong>${escapeHtml(PROGRESS_LABEL[l.partner_status] || '—')}</strong></div>` : ''}
        </td>
        <td class="p-4 text-right">
          <button class="admin-result block text-brand-blue text-xs font-semibold mb-2" data-id="${escapeHtml(l.id)}">Resultado comercial</button>
          <div class="text-[11px] text-slate-500 mb-1">Aviso: ${escapeHtml(({ sent: 'enviado', failed: 'falhou', unknown: 'não verificado' })[l.notification_status] || 'não verificado')}</div>
          <div class="text-[11px] text-slate-500 mb-1">Cliente: ${escapeHtml(({ sent: 'enviado', failed: 'falhou', not_applicable: 'sem e-mail', unknown: 'não verificado' })[l.customer_notification_status] || 'não verificado')}</div>
          ${!['duplicado', 'invalido'].includes(l.status) ? `<button class="admin-retry-mail block text-brand-blue text-xs font-semibold mb-2" data-id="${escapeHtml(l.id)}">Reenviar confirmação e aviso</button>` : ''}
          <button class="admin-delete text-slate-400 hover:text-rose-600 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-rose-50" data-id="${escapeHtml(l.id)}">Excluir</button>
        </td>
      </tr>`;
  }).join('');
}

function showNotice(html, kind = 'ok') {
  const box = document.getElementById('admin-notice');
  if (!box) return;
  const tone = kind === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-800';
  box.className = `p-4 rounded-2xl border text-sm ${tone}`;
  box.innerHTML = html;
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function bindDashboard() {
  document.getElementById('admin-logout')?.addEventListener('click', () => logout());
  document.getElementById('admin-refresh')?.addEventListener('click', () => { showLoading(); loadLeads(); });
  document.getElementById('btn-export-csv')?.addEventListener('click', exportCsv);

  document.getElementById('admin-search-input')?.addEventListener('input', (e) => {
    state.search = e.target.value;
    renderRows();
  });
  document.getElementById('admin-filter-status')?.addEventListener('change', (e) => {
    state.status = e.target.value;
    renderRows();
  });

  document.getElementById('admin-partners-tbody')?.addEventListener('click', async (e) => {
    const del = e.target.closest('.admin-partner-delete');
    if (del) {
      const target = state.partners.find((p) => p.id === del.getAttribute('data-id'));
      if (!target) return;
      if (!confirm(`Excluir definitivamente o parceiro "${target.name}"? Se ele tiver acesso ao portal, o login também será removido. Não dá para desfazer.`)) return;
      const out = await api({ action: 'delete_partner', id: target.id });
      if (out.httpStatus === 401) return logout('Sessão expirada. Entre novamente.');
      if (!out.ok) return showNotice('Não foi possível excluir o parceiro. Tente novamente.', 'error');
      state.partners = state.partners.filter((p) => p.id !== target.id);
      state.leads.forEach((l) => { if (l.partner_id === target.id) l.partner_id = null; });
      renderDashboard();
      return showNotice(`Parceiro <strong>${escapeHtml(target.name)}</strong> excluído.`);
    }
    const btn = e.target.closest('.admin-access-btn');
    if (!btn) return;
    const partner = state.partners.find((p) => p.id === btn.getAttribute('data-id'));
    if (!partner) return;
    const reset = !!partner.auth_user_id;
    if (!confirm(reset ? `Gerar uma nova senha temporária para ${partner.name}? A senha atual deixa de valer.` : `Criar acesso ao portal para ${partner.name} (${partner.email})?`)) return;
    const out = await api({ action: 'create_partner_access', partner_id: partner.id });
    if (out.httpStatus === 401) return logout('Sessão expirada. Entre novamente.');
    if (!out.ok) {
      const msg = out.error === 'email_reserved'
        ? 'Esse e-mail é de um administrador do painel e não pode virar login de parceiro. Peça outro e-mail ao parceiro.'
        : out.error === 'user_exists'
        ? 'Já existe um usuário com esse e-mail no Supabase (criado fora do painel). Apague-o em Authentication → Users e tente de novo.'
        : 'Não foi possível criar o acesso. Tente novamente.';
      return showNotice(msg, 'error');
    }
    partner.auth_user_id = partner.auth_user_id || 'ok';
    renderPartnerRows();
    const msg = `Olá, ${partner.name}! Seu acesso à Área do parceiro Clima16 está pronto.\nEndereço: https://clima16.com.br/parceiro\nE-mail: ${out.email}\nSenha temporária: ${out.password}\nTroque a senha no primeiro acesso.`;
    const digits = (partner.phone_digits || '').replace(/\D/g, '');
    const wa = `https://wa.me/${digits.length <= 11 ? '55' + digits : digits}?text=${encodeURIComponent(msg)}`;
    showNotice(`Acesso ${reset ? 'redefinido' : 'criado'} para <strong>${escapeHtml(partner.name)}</strong>. E-mail: <strong>${escapeHtml(out.email)}</strong> · Senha temporária: <code class="font-mono font-bold select-all">${escapeHtml(out.password)}</code> (aparece só agora). <a class="underline font-semibold" target="_blank" rel="noopener" href="${escapeHtml(wa)}">Enviar pelo WhatsApp</a>`);
  });

  document.getElementById('admin-partners-tbody')?.addEventListener('change', async (e) => {
    const el = e.target;
    if (!el.classList.contains('admin-partner-status')) return;
    const partner = state.partners.find((p) => p.id === el.getAttribute('data-id'));
    if (!partner) return;
    const previous = partner.status;
    partner.status = el.value;
    const out = await api({ action: 'update_partner', id: partner.id, status: el.value });
    if (out.httpStatus === 401) return logout('Sessão expirada. Entre novamente.');
    if (!out.ok) {
      partner.status = previous;
      alert('Não foi possível salvar o status. Tente novamente.');
    }
    renderPartnerRows();
  });

  const tbody = document.getElementById('admin-leads-tbody');
  tbody?.addEventListener('change', async (e) => {
    const el = e.target;
    const id = el.getAttribute('data-id');
    const lead = state.leads.find((l) => l.id === id);
    if (!lead) return;

    if (el.classList.contains('admin-dispatch')) {
      const partner = state.partners.find((p) => p.id === el.value);
      el.value = '';
      if (!partner) return;
      if (!confirm(`Encaminhar o lead ${protocolFor(id)} (${lead.name}) para ${partner.name}? O parceiro receberá os dados do cliente.`)) return;
      const out = await api({ action: 'dispatch', lead_id: id, partner_id: partner.id });
      if (out.httpStatus === 401) return logout('Sessão expirada. Entre novamente.');
      if (!out.ok) return showNotice('Não foi possível encaminhar o lead. Tente novamente.', 'error');
      Object.assign(lead, out.lead || {});
      renderRows();
      const mailInfo = out.emailed
        ? `E-mail enviado para ${escapeHtml(partner.email)}.`
        : (partner.email ? 'O envio do e-mail falhou.' : 'Esse parceiro não tem e-mail cadastrado.');
      showNotice(`<strong>${escapeHtml(lead.name)}</strong> encaminhado para <strong>${escapeHtml(partner.name)}</strong>. ${mailInfo} <a class="underline font-semibold" target="_blank" rel="noopener" href="${escapeHtml(out.partner_whatsapp_url)}">Abrir WhatsApp do parceiro com o lead pronto</a>`);
      return;
    }

    if (el.classList.contains('admin-status')) {
      const previous = lead.status;
      lead.status = el.value;
      const out = await api({ action: 'update', id, status: el.value });
      if (out.httpStatus === 401) return logout('Sessão expirada. Entre novamente.');
      if (!out.ok) {
        lead.status = previous;
        alert('Não foi possível salvar o status. Tente novamente.');
      }
      renderRows();
    } else if (el.classList.contains('admin-partner')) {
      const value = el.value.trim();
      const out = await api({ action: 'update', id, assigned_partner: value });
      if (out.httpStatus === 401) return logout('Sessão expirada. Entre novamente.');
      if (out.ok) lead.assigned_partner = value || null;
      else alert('Não foi possível salvar o parceiro. Tente novamente.');
    }
  });

  tbody?.addEventListener('click', async (e) => {
    const retry = e.target.closest('.admin-retry-mail');
    if (retry) {
      if (!confirm('Reenviar o aviso interno e a confirmação ao cliente?')) return;
      retry.disabled = true;
      const id = retry.getAttribute('data-id');
      const out = await api({ action: 'retry_notifications', id });
      if (out.httpStatus === 401) return logout('Sessão expirada. Entre novamente.');
      retry.disabled = false;
      if (!out.ok) return showNotice('Não foi possível reenviar. Tente novamente.', 'error');
      const n = out.notifications;
      Object.assign(state.leads.find(l => l.id === id) || {}, n);
      renderRows();
      const failed = n.notification_status === 'failed' || n.customer_notification_status === 'failed';
      return showNotice(`${failed ? 'Um ou mais envios falharam; confira a configuração do e-mail.' : 'E-mails reenviados.'}${n.recorded ? '' : ' O resultado não foi registrado no banco; a atualização de banco está pendente.'}`, failed ? 'error' : 'ok');
    }
    const result = e.target.closest('.admin-result');
    if (result) return showCommercialResult(state.leads.find(l => l.id === result.getAttribute('data-id')));
    const btn = e.target.closest('.admin-delete');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    if (!confirm(`Excluir definitivamente a solicitação ${protocolFor(id)}? Não dá para desfazer.`)) return;
    const out = await api({ action: 'delete', id });
    if (out.httpStatus === 401) return logout('Sessão expirada. Entre novamente.');
    if (out.ok) {
      state.leads = state.leads.filter((l) => l.id !== id);
      renderDashboard();
    } else {
      alert('Não foi possível excluir. Tente novamente.');
    }
  });
}

function showCommercialResult(lead) {
  if (!lead) return;
  if (!Object.hasOwn(lead, 'first_contact_at')) return showNotice('Os campos comerciais aguardam a atualização do banco.', 'error');
  const dateInput = (field, label) => `<label class="block mb-3">${label}<input name="${field}" type="datetime-local" class="block border rounded-lg p-2 w-full" value="${lead[field] ? new Date(new Date(lead[field]).getTime() - 3 * 3600000).toISOString().slice(0, 16) : ''}"></label>`;
  const modal = document.createElement('dialog');
  modal.className = 'rounded-2xl p-6 max-w-md w-full shadow-xl';
  modal.innerHTML = `<form><h2 class="text-lg font-bold mb-4">Resultado ${protocolFor(lead.id)}</h2><p class="text-xs mb-4">Horários de Ribeirão Preto (UTC−3).</p>${dateInput('first_contact_at', 'Primeiro contato')}${dateInput('quoted_at', 'Orçamento emitido')}${dateInput('closed_at', 'Fechamento')}<label class="block mb-3">Valor do serviço (R$)<input name="service_value" type="number" min="0" max="10000000" step="0.01" class="block border rounded-lg p-2 w-full" value="${escapeHtml(lead.service_value ?? '')}"></label><label class="block mb-4">Observações<textarea name="notes" maxlength="2000" class="block border rounded-lg p-2 w-full">${escapeHtml(lead.notes || '')}</textarea></label><p role="alert" class="text-rose-600 text-sm"></p><button type="submit" class="gradient-brand text-white rounded-lg px-4 py-2">Salvar</button><button type="button" data-close class="ml-4">Cancelar</button></form>`;
  document.body.appendChild(modal);
  modal.addEventListener('close', () => modal.remove());
  modal.querySelector('[data-close]').addEventListener('click', () => modal.close());
  modal.querySelector('form').addEventListener('submit', async e => {
    e.preventDefault();
    const values = new FormData(e.target);
    const patch = { action: 'update', id: lead.id, notes: values.get('notes'), service_value: values.get('service_value') === '' ? null : Number(values.get('service_value')) };
    for (const field of ['first_contact_at', 'quoted_at', 'closed_at']) patch[field] = values.get(field) ? new Date(`${values.get(field)}:00-03:00`).toISOString() : null;
    const btn = modal.querySelector('[type="submit"]');
    btn.disabled = true;
    const out = await api(patch);
    btn.disabled = false;
    if (out.httpStatus === 401) { modal.close(); return logout('Sessão expirada. Entre novamente.'); }
    if (!out.ok) { modal.querySelector('[role="alert"]').textContent = 'Não foi possível salvar. Tente novamente.'; return; }
    Object.assign(lead, out.lead);
    modal.close();
    renderDashboard();
    showNotice('Resultado comercial salvo.');
  });
  modal.showModal();
}

function exportCsv() {
  const header = ['Protocolo', 'Data', 'Nome', 'Telefone', 'E-mail', 'Bairro', 'Serviço', 'Imóvel', 'BTU', 'Descrição', 'Status', 'Parceiro', 'Andamento do parceiro', 'Origem', 'Primeiro contato', 'Orçamento emitido', 'Fechamento', 'Valor do serviço', 'Aviso interno', 'Confirmação cliente'];
  // Evita injeção de fórmula ao abrir no Excel (=, +, -, @).
  const cell = (v) => {
    let s = String(v ?? '').replace(/\r?\n/g, ' ');
    if (/^[=+\-@]/.test(s)) s = "'" + s;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const rows = visibleLeads().map((l) => [
    protocolFor(l.id),
    new Date(l.created_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
    l.name, l.phone, l.email, l.neighborhood, l.service_type, l.property_type, l.btu, l.description,
    (STATUS.find((s) => s.id === l.status) || {}).label || l.status,
    l.assigned_partner, PROGRESS_LABEL[l.partner_status] || '', l.utm_source || 'direto',
    l.first_contact_at, l.quoted_at, l.closed_at, l.service_value, l.notification_status, l.customer_notification_status
  ]);
  const csv = '﻿' + [header, ...rows].map((r) => r.map(cell).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `leads_clima16_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
