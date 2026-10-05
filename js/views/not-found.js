/**
 * Clima16 - 404 Not Found View
 */
export function renderNotFoundView() {
  return `
    <div class="min-h-[70vh] flex items-center justify-center bg-slate-50 py-16 px-4">
      <div class="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
        <div class="text-6xl font-black text-brand-blue mb-4">404</div>
        <h1 class="text-2xl font-extrabold text-navy mb-2">Página não encontrada</h1>
        <p class="text-sm text-slate-600 mb-6">
          A página ou serviço que você procura não está disponível ou mudou de endereço.
        </p>
        <a href="#/" class="gradient-brand text-white font-bold text-sm px-6 py-3 rounded-xl inline-block shadow">
          Voltar para o Início
        </a>
      </div>
    </div>
  `;
}
