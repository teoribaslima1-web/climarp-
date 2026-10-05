/**
 * Clima16 - Confirmation Page View (/solicitacao-recebida)
 * Conversion landing page displaying submitted lead summary and tracking scripts.
 */
import { db } from '../storage.js';
import { analytics } from '../analytics.js';

export function renderConfirmationView() {
  const lastLead = db.getLastSubmittedLead() || {
    name: 'Cliente',
    service_type: 'Climatização',
    neighborhood: 'Ribeirão Preto',
    id: 'LEAD-CONFIRMED'
  };

  return `
    <div class="bg-slate-50 min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl text-center relative overflow-hidden">
        
        <!-- Top Green Accent Glow -->
        <div class="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
        </div>

        <span class="inline-block text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full mb-3">
          ✓ Solicitação Recebida
        </span>

        <h1 class="text-2xl sm:text-3xl font-extrabold text-navy mb-2">
          Obrigado, ${escapeHtml(lastLead.name)}!
        </h1>

        <div class="my-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left text-sm space-y-2">
          <div class="text-slate-500 text-xs uppercase tracking-wider font-semibold">Resumo do Pedido</div>
          <div class="text-slate-800">
            <strong>Serviço:</strong> ${escapeHtml(lastLead.service_type)}
          </div>
          <div class="text-slate-800">
            <strong>Localização:</strong> ${escapeHtml(lastLead.neighborhood)}, Ribeirão Preto – SP
          </div>
          <div class="text-slate-400 text-xs font-mono pt-1">
            Protocolo: ${escapeHtml(lastLead.id)}
          </div>
        </div>

        <p class="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
          Sua solicitação poderá ser encaminhada a profissionais ou empresas da região interessados em atender o serviço. Fique atento ao seu WhatsApp!
        </p>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="#/" class="w-full sm:w-auto gradient-brand text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow hover:shadow-md transition-all text-center">
            Voltar para o início
          </a>
          <a href="#/blog" class="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-6 py-3.5 rounded-xl transition-all text-center">
            Ver dicas no Blog
          </a>
        </div>

        <div class="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-400">
          Clima16 • Marketplace de Climatização em Ribeirão Preto – SP
        </div>

      </div>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
