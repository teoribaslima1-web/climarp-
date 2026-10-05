/**
 * ClimaRP - Partner Registration Modal & Form Component
 * Dedicated flow for air conditioning technicians and HVAC companies in Ribeirão Preto.
 */
import { CONFIG } from '../config.js';
import { db } from '../storage.js';
import { analytics } from '../analytics.js';

export function renderPartnerModal() {
  return `
    <div id="partner-modal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm hidden flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 my-8 relative animate-float-none">
        
        <!-- Close Button -->
        <button id="close-partner-modal" class="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <div class="text-left mb-6">
          <span class="inline-block text-xs font-bold tracking-wider text-brand-blue uppercase bg-blue-50 px-3 py-1 rounded-full mb-2">
            Rede de Parceiros Regionais
          </span>
          <h3 class="text-2xl font-bold text-navy">Cadastre seu interesse como parceiro</h3>
          <p class="text-xs sm:text-sm text-slate-600 mt-1">
            Receba solicitações de clientes em Ribeirão Preto que precisam de instalação, manutenção e higienização.
          </p>
        </div>

        <form id="partner-form" onsubmit="return false;" class="space-y-4 text-left">
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Nome ou Empresa <span class="text-rose-500">*</span></label>
              <input type="text" id="partner-name" placeholder="Ex: Marcos Refrigeração" class="w-full px-3.5 py-2.5 border-2 border-slate-200 focus:border-brand-blue rounded-xl text-sm font-medium" required />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">WhatsApp Comercial <span class="text-rose-500">*</span></label>
              <input type="tel" id="partner-phone" placeholder="(16) 99999-9999" class="w-full px-3.5 py-2.5 border-2 border-slate-200 focus:border-brand-blue rounded-xl text-sm font-medium" required />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">E-mail</label>
              <input type="email" id="partner-email" placeholder="contato@empresa.com.br" class="w-full px-3.5 py-2.5 border-2 border-slate-200 focus:border-brand-blue rounded-xl text-sm" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Cidade Principal</label>
              <input type="text" id="partner-city" value="Ribeirão Preto – SP" class="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-sm font-semibold text-slate-700" />
            </div>
          </div>

          <!-- Services Checkboxes -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Serviços que você executa: <span class="text-rose-500">*</span></label>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <label class="flex items-center gap-2 p-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
                <input type="checkbox" value="Instalação" class="partner-service-check text-brand-blue rounded" checked />
                <span>Instalação</span>
              </label>
              <label class="flex items-center gap-2 p-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
                <input type="checkbox" value="Manutenção" class="partner-service-check text-brand-blue rounded" checked />
                <span>Manutenção</span>
              </label>
              <label class="flex items-center gap-2 p-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
                <input type="checkbox" value="Higienização" class="partner-service-check text-brand-blue rounded" checked />
                <span>Higienização</span>
              </label>
              <label class="flex items-center gap-2 p-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
                <input type="checkbox" value="Comercial" class="partner-service-check text-brand-blue rounded" />
                <span>Comercial</span>
              </label>
              <label class="flex items-center gap-2 p-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
                <input type="checkbox" value="Residencial" class="partner-service-check text-brand-blue rounded" checked />
                <span>Residencial</span>
              </label>
              <label class="flex items-center gap-2 p-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
                <input type="checkbox" value="Outros" class="partner-service-check text-brand-blue rounded" />
                <span>Outros</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">CNPJ <span class="text-slate-400 font-normal lowercase">(opcional)</span></label>
            <input type="text" id="partner-cnpj" placeholder="00.000.000/0001-00" class="w-full px-3.5 py-2.5 border-2 border-slate-200 focus:border-brand-blue rounded-xl text-sm" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Conte brevemente sobre seu trabalho</label>
            <textarea id="partner-bio" rows="2" placeholder="Experiência, marcas com as quais trabalha, ferramentas, etc..." class="w-full px-3.5 py-2 border-2 border-slate-200 focus:border-brand-blue rounded-xl text-sm"></textarea>
          </div>

          <div id="partner-success-msg" class="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-medium hidden">
            ✓ Cadastro de interesse enviado com sucesso! Entraremos em contato para validar os dados.
          </div>

          <div class="pt-2 flex justify-end gap-3">
            <button type="button" id="btn-cancel-partner" class="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
            <button type="button" id="btn-submit-partner" class="gradient-brand text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow hover:shadow-md">
              Cadastrar interesse
            </button>
          </div>
        </form>

      </div>
    </div>
  `;
}

export function initPartnerModalEvents() {
  const modal = document.getElementById('partner-modal');
  const closeBtn = document.getElementById('close-partner-modal');
  const cancelBtn = document.getElementById('btn-cancel-partner');
  const submitBtn = document.getElementById('btn-submit-partner');

  function closeModal() {
    modal?.classList.add('hidden');
  }

  function openModal() {
    modal?.classList.remove('hidden');
  }

  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);

  // Trigger buttons
  document.querySelectorAll('.open-partner-modal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  submitBtn?.addEventListener('click', () => {
    const name = document.getElementById('partner-name')?.value.trim();
    const phone = document.getElementById('partner-phone')?.value.trim();
    const email = document.getElementById('partner-email')?.value.trim();
    const city = document.getElementById('partner-city')?.value.trim();
    const cnpj = document.getElementById('partner-cnpj')?.value.trim();
    const bio = document.getElementById('partner-bio')?.value.trim();

    const selectedServices = Array.from(document.querySelectorAll('.partner-service-check:checked')).map(cb => cb.value);

    if (!name || !phone) {
      alert('Por favor, preencha pelo menos Nome e WhatsApp para contato.');
      return;
    }

    db.createPartner({
      name,
      company: name,
      phone,
      email,
      city,
      services: selectedServices,
      cnpj,
      bio
    });

    const successBox = document.getElementById('partner-success-msg');
    if (successBox) {
      successBox.classList.remove('hidden');
      setTimeout(() => {
        closeModal();
        successBox.classList.add('hidden');
        document.getElementById('partner-form')?.reset();
      }, 2000);
    }
  });
}
