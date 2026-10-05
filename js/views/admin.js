/**
 * Clima16 - Admin Lead Management Dashboard View (/admin)
 * Clean, reactive dashboard for monitoring, filtering, assigning, and exporting leads to CSV.
 */
import { db, STATUS_OPTIONS } from '../storage.js';
import { analytics } from '../analytics.js';

export function renderAdminView() {
  const stats = db.getDashboardStats();
  const leads = db.leads;
  const partners = db.partners;
  const recentEvents = analytics.getRecentEvents().slice(0, 15);

  return `
    <div class="bg-slate-100 min-h-screen py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-black text-navy">Painel de Gestão Clima16</h1>
              <span class="text-xs bg-blue-100 text-brand-blue font-bold px-2.5 py-0.5 rounded-full">Admin MVP</span>
            </div>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">
              Controle de solicitações de orçamentos e parceiros em Ribeirão Preto
            </p>
          </div>

          <div class="flex items-center gap-3 w-full sm:w-auto">
            <button id="btn-export-csv" class="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition-all">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Exportar Leads CSV
            </button>
            <a href="#/" class="text-xs font-semibold text-slate-600 hover:text-navy px-3 py-2 border border-slate-200 rounded-xl hover:bg-slate-50">
              Ver Site
            </a>
          </div>
        </div>

        <!-- Metric KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Leads Hoje</span>
              <span class="p-2 bg-blue-50 text-brand-blue rounded-xl text-xs font-bold">Hoje</span>
            </div>
            <div class="text-3xl font-extrabold text-navy mt-3">${stats.today}</div>
            <p class="text-xs text-slate-400 mt-1">Solicitações nas últimas 24h</p>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Últimos 7 Dias</span>
              <span class="p-2 bg-cyan-50 text-brand-cyan rounded-xl text-xs font-bold">7D</span>
            </div>
            <div class="text-3xl font-extrabold text-navy mt-3">${stats.sevenDays}</div>
            <p class="text-xs text-slate-400 mt-1">Média de demanda recente</p>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Últimos 30 Dias</span>
              <span class="p-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold">30D</span>
            </div>
            <div class="text-3xl font-extrabold text-navy mt-3">${stats.thirtyDays}</div>
            <p class="text-xs text-slate-400 mt-1">Volume acumulado</p>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Parceiros Cadastrados</span>
              <span class="p-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold">Rede RP</span>
            </div>
            <div class="text-3xl font-extrabold text-navy mt-3">${stats.partnersCount}</div>
            <p class="text-xs text-slate-400 mt-1">Técnicos & empresas</p>
          </div>

        </div>

        <!-- Breakdown Charts / Bars -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <!-- Services Breakdown -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 class="text-base font-bold text-navy mb-4">Leads por Tipo de Serviço</h3>
            <div class="space-y-3">
              ${Object.entries(stats.byService).map(([serv, count]) => {
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return `
                  <div>
                    <div class="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>${serv}</span>
                      <span>${count} (${pct}%)</span>
                    </div>
                    <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div class="h-full gradient-brand" style="width: ${pct}%"></div>
                    </div>
                  </div>
                `;
              }).join('') || '<p class="text-xs text-slate-400">Nenhum dado registrado.</p>'}
            </div>
          </div>

          <!-- Source Breakdown -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 class="text-base font-bold text-navy mb-4">Leads por Origem de Tráfego</h3>
            <div class="space-y-3">
              ${Object.entries(stats.bySource).map(([src, count]) => {
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return `
                  <div>
                    <div class="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span class="font-mono">${src}</span>
                      <span>${count} (${pct}%)</span>
                    </div>
                    <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div class="h-full bg-cyan-500" style="width: ${pct}%"></div>
                    </div>
                  </div>
                `;
              }).join('') || '<p class="text-xs text-slate-400">Nenhum dado registrado.</p>'}
            </div>
          </div>

        </div>

        <!-- Leads Table Section -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          <!-- Table Controls -->
          <div class="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-bold text-navy">Tabela de Solicitações</h2>
              <span class="text-xs text-slate-400 font-mono">(${leads.length} registros)</span>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <!-- Search -->
              <input type="text" id="admin-search-input" placeholder="Buscar por nome, fone ou bairro..." class="px-3.5 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:border-brand-blue" />
              
              <!-- Filter by status -->
              <select id="admin-filter-status" class="px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:border-brand-blue text-slate-700">
                <option value="">Todos os Status</option>
                ${STATUS_OPTIONS.map(st => `<option value="${st.id}">${st.label}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs sm:text-sm" id="admin-leads-table">
              <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th class="p-4">Data / ID</th>
                  <th class="p-4">Cliente / Contato</th>
                  <th class="p-4">Bairro (RP)</th>
                  <th class="p-4">Serviço / Detalhes</th>
                  <th class="p-4">Status</th>
                  <th class="p-4">Parceiro Atribuído</th>
                  <th class="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100" id="admin-leads-tbody">
                ${renderLeadsTableRows(leads, partners)}
              </tbody>
            </table>
          </div>

        </div>

        <!-- Real-time Analytics Event Stream -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold text-navy flex items-center gap-2">
              <span class="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
              Eventos de Conversão Recentes (Analytics / GTM)
            </h3>
            <span class="text-xs text-slate-400">Stream ao vivo</span>
          </div>

          <div class="space-y-2 max-h-60 overflow-y-auto font-mono text-xs text-slate-700">
            ${recentEvents.map(evt => `
              <div class="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-brand-blue">${evt.event}</span>
                  <span class="text-slate-400">|</span>
                  <span class="text-slate-500">${evt.device || 'desktop'}</span>
                  <span class="text-slate-400">|</span>
                  <span class="text-slate-600">${evt.utm_source || 'direto'}</span>
                </div>
                <span class="text-slate-400">${new Date(evt.timestamp).toLocaleTimeString('pt-BR')}</span>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    </div>
  `;
}

function renderLeadsTableRows(leads, partners) {
  if (leads.length === 0) {
    return `<tr><td colspan="7" class="p-8 text-center text-slate-400 text-sm">Nenhum lead encontrado com os filtros selecionados.</td></tr>`;
  }

  return leads.map(l => {
    const formattedDate = new Date(l.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    const statusObj = STATUS_OPTIONS.find(s => s.id === l.status) || STATUS_OPTIONS[0];

    return `
      <tr class="hover:bg-slate-50/80 transition-colors lead-row" data-id="${l.id}" data-name="${(l.name || '').toLowerCase()}" data-phone="${(l.phone || '').toLowerCase()}" data-neighborhood="${(l.neighborhood || '').toLowerCase()}" data-status="${l.status}">
        
        <td class="p-4">
          <div class="font-bold text-navy">${l.id}</div>
          <div class="text-slate-400 text-xs">${formattedDate}</div>
          <div class="text-[11px] text-slate-400 font-mono">${l.source || 'direct'}</div>
        </td>

        <td class="p-4">
          <div class="font-bold text-slate-800">${escapeHtml(l.name)}</div>
          <a href="https://wa.me/55${(l.phone || '').replace(/\D/g, '')}" target="_blank" class="text-emerald-700 font-medium hover:underline flex items-center gap-1 text-xs mt-0.5">
            ${escapeHtml(l.phone)}
          </a>
          ${l.email ? `<div class="text-slate-400 text-xs truncate max-w-[150px]">${escapeHtml(l.email)}</div>` : ''}
        </td>

        <td class="p-4">
          <span class="font-semibold text-slate-800">${escapeHtml(l.neighborhood)}</span>
          <div class="text-xs text-slate-400">${escapeHtml(l.city || 'Ribeirão Preto')}</div>
        </td>

        <td class="p-4">
          <div class="font-semibold text-brand-blue">${escapeHtml(l.service_type)}</div>
          <div class="text-xs text-slate-500">${escapeHtml(l.property_type)} • ${escapeHtml(l.btu || 'BTU N/I')}</div>
          ${l.description ? `<div class="text-xs text-slate-500 italic mt-1 max-w-xs truncate" title="${escapeHtml(l.description)}">${escapeHtml(l.description)}</div>` : ''}
        </td>

        <td class="p-4">
          <select class="admin-lead-status-select text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200 ${statusObj.color}" data-lead-id="${l.id}">
            ${STATUS_OPTIONS.map(st => `
              <option value="${st.id}" ${st.id === l.status ? 'selected' : ''}>${st.label}</option>
            `).join('')}
          </select>
        </td>

        <td class="p-4">
          <input type="text" class="admin-partner-input text-xs px-2.5 py-1 border border-slate-200 rounded-lg w-36" placeholder="Nome do parceiro..." value="${escapeHtml(l.partner_assigned || '')}" data-lead-id="${l.id}" />
        </td>

        <td class="p-4 text-right">
          <button class="btn-delete-lead text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors" data-lead-id="${l.id}" title="Excluir lead">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </td>

      </tr>
    `;
  }).join('');
}

export function initAdminEvents() {
  // Export CSV
  document.getElementById('btn-export-csv')?.addEventListener('click', () => {
    db.exportLeadsCSV();
  });

  // Filter & Search
  const searchInput = document.getElementById('admin-search-input');
  const filterStatus = document.getElementById('admin-filter-status');

  function filterTable() {
    const q = (searchInput?.value || '').toLowerCase().trim();
    const st = filterStatus?.value || '';

    document.querySelectorAll('.lead-row').forEach(row => {
      const name = row.getAttribute('data-name') || '';
      const phone = row.getAttribute('data-phone') || '';
      const neighborhood = row.getAttribute('data-neighborhood') || '';
      const rowStatus = row.getAttribute('data-status') || '';

      const matchesSearch = !q || name.includes(q) || phone.includes(q) || neighborhood.includes(q);
      const matchesStatus = !st || rowStatus === st;

      if (matchesSearch && matchesStatus) {
        row.classList.remove('hidden');
      } else {
        row.classList.add('hidden');
      }
    });
  }

  searchInput?.addEventListener('input', filterTable);
  filterStatus?.addEventListener('change', filterTable);

  // Status Change
  document.querySelectorAll('.admin-lead-status-select').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const leadId = sel.getAttribute('data-lead-id');
      const newStatus = e.target.value;
      db.updateLeadStatus(leadId, newStatus);
      const row = sel.closest('.lead-row');
      if (row) {
        row.setAttribute('data-status', newStatus);
      }
    });
  });

  // Partner Assignment
  document.querySelectorAll('.admin-partner-input').forEach(inp => {
    inp.addEventListener('change', (e) => {
      const leadId = inp.getAttribute('data-lead-id');
      const partnerName = e.target.value.trim();
      const currentStatus = inp.closest('.lead-row')?.querySelector('.admin-lead-status-select')?.value || 'Encaminhado';
      db.updateLeadStatus(leadId, currentStatus, partnerName);
    });
  });

  // Delete Lead
  document.querySelectorAll('.btn-delete-lead').forEach(btn => {
    btn.addEventListener('click', () => {
      const leadId = btn.getAttribute('data-lead-id');
      if (confirm(`Deseja realmente excluir a solicitação ${leadId}?`)) {
        db.deleteLead(leadId);
        btn.closest('.lead-row')?.remove();
      }
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
