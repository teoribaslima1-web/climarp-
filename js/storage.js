import { analytics } from './analytics.js';

const KEY = 'clima16_confirmation_v2';
const TTL = 30 * 60 * 1000;
let confirmation = null;

// Remove o histórico legado; o banco é a única fonte de dados operacionais.
for (const key of ['clima16_leads_db_v1', 'clima16_partners_db_v1', 'clima16_last_submitted_lead']) {
  try { localStorage.removeItem(key); } catch { /* armazenamento indisponível */ }
}

export const db = {
  createLead(form, serverId, duplicate = false) {
    confirmation = {
      id: serverId ? 'C16-' + String(serverId).replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase() : '',
      name: String(form.name || '').trim().split(/\s+/)[0],
      service_type: form.service_type,
      neighborhood: form.neighborhood,
      btu: form.btu,
      expires_at: Date.now() + TTL
    };
    try { sessionStorage.setItem(KEY, JSON.stringify(confirmation)); } catch { /* usa memória */ }
    const eventKey = `clima16_conversion_${serverId}`;
    let counted = false;
    try { counted = sessionStorage.getItem(eventKey) === 'true'; } catch { /* sem armazenamento */ }
    if (!counted) {
      analytics.track(duplicate ? 'form_duplicate' : 'form_complete', { lead_id: confirmation.id, service: form.service_type });
      try { sessionStorage.setItem(eventKey, 'true'); } catch { /* sem armazenamento */ }
    }
    return confirmation;
  },
  getLastSubmittedLead() {
    try { confirmation = JSON.parse(sessionStorage.getItem(KEY) || 'null') || confirmation; } catch { /* usa memória */ }
    if (!confirmation || !Number.isFinite(confirmation.expires_at) || confirmation.expires_at <= Date.now()) {
      confirmation = null;
      try { sessionStorage.removeItem(KEY); } catch { /* sem armazenamento */ }
    }
    return confirmation;
  }
};
