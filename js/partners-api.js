/**
 * Clima16 - Envio do cadastro de parceiros para /api/partners (compartilhado pelo modal e pela página).
 */
import { analytics } from './analytics.js';

export const HONEYPOT_HTML = (id) => `
  <div style="position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden" aria-hidden="true">
    <label>Não preencha este campo <input type="text" id="${id}" name="website" tabindex="-1" autocomplete="off" /></label>
  </div>`;

export const CONSENT_HTML = (id) => `
  <label class="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
    <input type="checkbox" id="${id}" class="mt-0.5 text-brand-blue rounded" />
    <span>Concordo em ser contatado pelo Clima16 e com o tratamento dos meus dados conforme a
      <a href="/politica-de-privacidade" class="text-brand-blue underline">Política de Privacidade</a>. <span class="text-rose-500">*</span></span>
  </label>`;

const ERRORS = {
  invalid_name: 'Informe seu nome ou o nome da empresa.',
  invalid_phone: 'Informe um WhatsApp válido, com DDD.',
  invalid_email: 'O e-mail informado não parece válido.',
  invalid_services: 'Marque pelo menos um serviço.',
  invalid_cnpj: 'O CNPJ deve ter 14 números (ou deixe em branco).',
  consent_required: 'Marque a caixa de concordância para enviar.',
  too_many_requests: 'Muitas tentativas seguidas. Tente novamente mais tarde.'
};

/**
 * Envia o cadastro. Retorna true em caso de sucesso; em erro mostra a mensagem em errorBox e retorna false.
 */
export async function submitPartner(data, button, errorBox) {
  if (button?.disabled) return false;
  const showError = (msg) => {
    if (errorBox) {
      errorBox.textContent = msg;
      errorBox.classList.remove('hidden');
    }
    return false;
  };
  if (errorBox) errorBox.classList.add('hidden');

  const session = analytics.getSession ? analytics.getSession() : {};
  const label = button ? button.textContent : '';
  if (button) {
    button.disabled = true;
    button.textContent = 'Enviando…';
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch('/api/partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, utm_source: session.utm_source, device: session.device }),
      signal: controller.signal
    });
    let body = null;
    try { body = await res.json(); } catch { /* sem JSON */ }
    if (res.ok && body && body.ok) {
      analytics.track('professional_signup', { services: (data.services || []).join(',') });
      return true;
    }
    return showError((body && ERRORS[body.error]) || 'Não foi possível enviar agora. Tente novamente ou fale conosco pelo WhatsApp.');
  } catch {
    return showError('Sem conexão. Tente novamente em instantes.');
  } finally {
    clearTimeout(timer);
    if (button) {
      button.disabled = false;
      button.textContent = label;
    }
  }
}
