/**
 * Clima16 - Pré-preenchimento do formulário de orçamento
 * Permite que chips do hero, calculadora de BTUs e bairros abram o formulário já preenchido.
 */
const KEY = 'clima16_prefill';

export function savePrefill(data) {
  try { sessionStorage.setItem(KEY, JSON.stringify(data)); } catch { /* sem storage */ }
}

export function takePrefill() {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    sessionStorage.removeItem(KEY);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Pede um orçamento com dados pré-preenchidos.
 * Se o formulário já está na página, aplica na hora; senão vai para a home e o formulário lê ao iniciar.
 */
export function requestQuote(data) {
  savePrefill(data);
  if (document.getElementById('orcamento-form')) {
    window.dispatchEvent(new CustomEvent('clima16:prefill'));
    document.getElementById('orcamento-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    window.location.hash = '#/formulario';
  }
}

/** Liga qualquer elemento com data-quote / data-quote-neighborhood a requestQuote. */
export function initQuoteTriggers(root = document) {
  root.querySelectorAll('[data-quote]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const service = el.getAttribute('data-quote');
      window.clima16Analytics?.track('quick_service_click', { service, origin: el.getAttribute('data-origin') || 'chip' });
      requestQuote(service ? { service } : {});
    });
  });
  root.querySelectorAll('[data-quote-neighborhood]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const neighborhood = el.getAttribute('data-quote-neighborhood');
      window.clima16Analytics?.track('neighborhood_click', { neighborhood });
      requestQuote({ neighborhood });
    });
  });
}
