/**
 * Clima16 - Footer Component
 * Clean, institutional, LGPD compliant footer with regional scope.
 */
import { CONFIG } from '../config.js';

export function renderFooter() {
  const currentYear = new Date().getFullYear();

  return `
    <footer class="bg-slate-900 text-slate-400 border-t border-slate-800 pt-16 pb-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          <!-- Column 1: Brand Info -->
          <div class="lg:col-span-2 space-y-4">
            <a href="#/" class="inline-block">
              <img src="assets/logo-wordmark.png" alt="Clima16" class="h-12 w-auto object-contain bg-white rounded-xl px-3 py-2" />
            </a>
            <p class="text-slate-300 text-sm leading-relaxed max-w-sm">
              O Clima16 facilita a conexão entre pessoas procurando serviços de climatização e profissionais da região de Ribeirão Preto.
            </p>
            <div class="flex flex-col gap-2 pt-1">
              <a href="https://wa.me/${CONFIG.brand.whatsappNumber}?text=${encodeURIComponent(CONFIG.brand.whatsappDefaultMessage)}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>Atendimento via WhatsApp</span>
              </a>
              <div class="flex items-center gap-2 text-xs font-semibold text-cyan-400 bg-slate-800/80 px-3 py-1.5 rounded-full w-fit">
                <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                Atendimento inicial: Ribeirão Preto – SP
              </div>
            </div>
          </div>

          <!-- Column 2: Serviços -->
          <div class="space-y-3">
            <h4 class="text-sm font-semibold text-white tracking-wider uppercase">Serviços em RP</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#/instalacao-ar-condicionado-ribeirao-preto" class="hover:text-white transition-colors">Instalação de Ar-Condicionado</a></li>
              <li><a href="#/manutencao-ar-condicionado-ribeirao-preto" class="hover:text-white transition-colors">Manutenção e Reparos</a></li>
              <li><a href="#/limpeza-ar-condicionado-ribeirao-preto" class="hover:text-white transition-colors">Limpeza e Higienização</a></li>
              <li><a href="#/ar-condicionado-nao-gela-ribeirao-preto" class="hover:text-white transition-colors">Ar Não Está Gelando</a></li>
            </ul>
          </div>

          <!-- Column 3: Navegação -->
          <div class="space-y-3">
            <h4 class="text-sm font-semibold text-white tracking-wider uppercase">Plataforma</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#/calculadora-de-btus" class="hover:text-white transition-colors">Calculadora de BTUs</a></li>
              <li><a href="#/como-funciona" class="hover:text-white transition-colors">Como funciona</a></li>
              <li><a href="#/para-profissionais" class="hover:text-white transition-colors">Para Profissionais & Empresas</a></li>
              <li><a href="#/blog" class="hover:text-white transition-colors">Blog & Dicas Técnicas</a></li>
              <li><a href="#/faq" class="hover:text-white transition-colors">Dúvidas Frequentes</a></li>
            </ul>
          </div>

          <!-- Column 4: Legal & Transparência -->
          <div class="space-y-3">
            <h4 class="text-sm font-semibold text-white tracking-wider uppercase">Transparência</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#/politica-de-privacidade" class="hover:text-white transition-colors">Política de Privacidade</a></li>
              <li><a href="#/termos-de-uso" class="hover:text-white transition-colors">Termos de Uso</a></li>
              <li><a href="#/admin" class="hover:text-cyan-400 transition-colors flex items-center gap-1.5"><span class="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span> Gestão de Leads</a></li>
            </ul>
          </div>

        </div>

        <!-- Sub-footer -->
        <div class="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© ${currentYear} Clima16. Todos os direitos reservados. Ribeirão Preto – SP.</p>
          <div class="flex items-center gap-6">
            <span>Marketplace local de climatização</span>
            <span>Fotos: <a href="https://www.pexels.com/@aleks89" target="_blank" rel="noopener noreferrer" class="hover:text-slate-400 underline">Aleks89</a> e Neosiam / <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" class="hover:text-slate-400 underline">Pexels</a></span>
            <a href="#/politica-de-privacidade" class="hover:text-slate-400">Privacidade LGPD</a>
          </div>
        </div>

      </div>
    </footer>
  `;
}
