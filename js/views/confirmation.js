/**
 * Clima16 - Confirmation Page View (/solicitacao-recebida)
 * Mostra o resumo do pedido, o que acontece depois e um botão de WhatsApp imediato.
 */
import { db } from '../storage.js';
import { CONFIG } from '../config.js';

const NEXT_STEPS = [
  { title: 'Pedido recebido', text: 'Seu pedido já está registrado com o protocolo abaixo.', done: true },
  { title: 'Entramos em contato', text: 'Vamos falar com você pelo WhatsApp para confirmar os detalhes do serviço.' },
  { title: 'Você compara e decide', text: 'Seu pedido pode ser encaminhado a profissionais da região. Você escolhe livremente, sem compromisso.' }
];

function buildWhatsappUrl(lead) {
  const lines = [
    `Olá! Acabei de fazer um pedido no Clima16${lead.id ? ` (protocolo ${lead.id})` : ''}.`,
    `Serviço: ${lead.service_type}`,
    `Bairro: ${lead.neighborhood}`
  ];
  if (lead.btu && !['N/A', 'Não informado'].includes(lead.btu)) lines.push(`Capacidade: ${lead.btu}`);
  lines.push('Podem me ajudar?');
  return `https://wa.me/${CONFIG.brand.whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
}

export function renderConfirmationView() {
  const lastLead = db.getLastSubmittedLead() || {
    name: 'Cliente',
    service_type: 'Climatização',
    neighborhood: 'Ribeirão Preto',
    id: ''
  };
  const waUrl = buildWhatsappUrl(lastLead);
  const firstName = String(lastLead.name || 'Cliente').trim().split(/\s+/)[0];

  return `
    <div class="bg-slate-50 min-h-[80vh] flex items-center justify-center py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-xl w-full bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl text-center relative overflow-hidden">

        <div class="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-sm animate-pop-in">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
        </div>

        <span class="inline-block text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full mb-3">✓ Solicitação Recebida</span>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-navy mb-2">Obrigado, ${escapeHtml(firstName)}!</h1>
        <p class="text-sm text-slate-600 mb-6">Quer agilizar? Fale com a gente agora pelo WhatsApp.</p>

        <!-- WhatsApp imediato -->
        <a href="${waUrl}" target="_blank" rel="noopener noreferrer" data-wa-confirmation class="flex items-center justify-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base px-6 py-4 rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all">
          <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
          Falar no WhatsApp agora
        </a>

        <div class="my-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left text-sm space-y-1.5">
          <div class="text-slate-500 text-xs uppercase tracking-wider font-semibold">Resumo do pedido</div>
          <div class="text-slate-800"><strong>Serviço:</strong> ${escapeHtml(lastLead.service_type)}</div>
          <div class="text-slate-800"><strong>Localização:</strong> ${escapeHtml(lastLead.neighborhood)}, Ribeirão Preto – SP</div>
          ${lastLead.btu && !['N/A', 'Não informado'].includes(lastLead.btu) ? `<div class="text-slate-800"><strong>Capacidade:</strong> ${escapeHtml(lastLead.btu)}</div>` : ''}
          ${lastLead.id ? `<div class="text-slate-400 text-xs font-mono pt-1">Protocolo: ${escapeHtml(lastLead.id)}</div>` : ''}
        </div>

        <!-- O que acontece agora -->
        <div class="text-left">
          <h2 class="text-sm font-extrabold text-navy uppercase tracking-wider mb-4">O que acontece agora</h2>
          <ol class="space-y-4">
            ${NEXT_STEPS.map((st, i) => `
              <li class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-extrabold ${st.done ? 'bg-emerald-500 text-white' : 'bg-blue-50 text-brand-blue border border-blue-100'}">${st.done ? '✓' : i + 1}</div>
                <div>
                  <div class="text-sm font-bold text-navy">${st.title}</div>
                  <div class="text-xs sm:text-sm text-slate-600 leading-relaxed">${st.text}</div>
                </div>
              </li>`).join('')}
          </ol>
        </div>

        <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="#/" class="w-full sm:w-auto gradient-brand text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow hover:shadow-md transition-all text-center">Voltar para o início</a>
          <a href="#/blog" class="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-6 py-3.5 rounded-xl transition-all text-center">Ver dicas no Blog</a>
        </div>

        <div class="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-400">Clima16 • Marketplace de Climatização em Ribeirão Preto – SP</div>
      </div>
    </div>
  `;
}

export function initConfirmationEvents() {
  document.querySelector('[data-wa-confirmation]')?.addEventListener('click', () => {
    window.clima16Analytics?.track('whatsapp_click', { origin: 'confirmation' });
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
