/**
 * Clima16 - LGPD Cookie Banner Component
 * Transparent, non-intrusive cookie consent.
 */
export function renderCookieBanner() {
  const hasConsented = localStorage.getItem('clima16_lgpd_consent');
  if (hasConsented) return '';

  return `
    <div id="lgpd-cookie-banner" class="fixed bottom-4 left-4 right-4 md:left-8 md:right-auto md:max-w-md z-50 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-slate-200 transition-all duration-300">
      <div class="flex items-start gap-3">
        <div class="p-2 bg-blue-50 text-brand-blue rounded-xl shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        </div>
        <div class="flex-1 text-xs text-slate-600 leading-relaxed">
          <p class="font-bold text-navy text-sm mb-1">Privacidade & Cookies (LGPD)</p>
          Utilizamos cookies essenciais e métricas anônimas para proporcionar uma experiência ágil de solicitação de orçamentos e aprimorar nossa plataforma.
          <a href="#/politica-de-privacidade" class="text-brand-blue underline hover:text-blue-700 block mt-1">Conheça nossa Política de Privacidade</a>
        </div>
      </div>
      <div class="mt-3 flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
        <button id="btn-accept-cookies" class="gradient-brand text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all">
          Aceitar e Continuar
        </button>
      </div>
    </div>
  `;
}

export function initCookieBannerEvents() {
  const acceptBtn = document.getElementById('btn-accept-cookies');
  const banner = document.getElementById('lgpd-cookie-banner');

  acceptBtn?.addEventListener('click', () => {
    localStorage.setItem('clima16_lgpd_consent', 'true');
    banner?.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(() => {
      banner?.remove();
    }, 300);
  });
}
