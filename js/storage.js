/**
 * Clima16 - Storage & Lead Database Engine
 * Manages Leads, Partners, and CSV exports with local persistence.
 */
import { analytics } from './analytics.js';

const STORAGE_KEYS = {
  LEADS: 'clima16_leads_db_v1',
  PARTNERS: 'clima16_partners_db_v1',
  LAST_LEAD: 'clima16_last_submitted_lead'
};

export const STATUS_OPTIONS = [
  { id: 'Novo', label: 'Novo', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'Em contato', label: 'Em contato', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'Encaminhado', label: 'Encaminhado', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'Convertido', label: 'Convertido', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'Não válido', label: 'Não válido', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { id: 'Duplicado', label: 'Duplicado', color: 'bg-rose-100 text-rose-800 border-rose-200' }
];

class StorageEngine {
  constructor() {
    this.leads = this.loadLeads();
    this.partners = this.loadPartners();
    if (this.leads.length === 0) {
      this.seedInitialDemoData();
    }
  }

  loadLeads() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEADS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  loadPartners() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PARTNERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveLeads() {
    try {
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(this.leads));
    } catch (e) {
      console.error('Failed to save leads to storage', e);
    }
  }

  savePartners() {
    try {
      localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(this.partners));
    } catch (e) {
      console.error('Failed to save partners to storage', e);
    }
  }

  createLead(formData, serverId = null) {
    const session = analytics.getSession();
    const protocol = serverId ? 'C16-' + String(serverId).replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase() : null;
    const newLead = {
      id: protocol || 'LEAD-' + Math.floor(100000 + Math.random() * 900000),
      created_at: new Date().toISOString(),
      name: formData.name || '',
      phone: formData.phone || '',
      email: formData.email || '',
      city: 'Ribeirão Preto',
      state: 'SP',
      neighborhood: formData.neighborhood || '',
      service_type: formData.service_type || 'Geral',
      property_type: formData.property_type || 'Residencial',
      has_equipment: formData.has_equipment || 'Não informado',
      btu: formData.btu || 'N/A',
      description: formData.description || '',
      source: session.utm_source || 'direct',
      utm_source: session.utm_source || 'direct',
      utm_medium: session.utm_medium || 'none',
      utm_campaign: session.utm_campaign || '',
      entry_page: session.entry_page || '/',
      device: session.device || 'desktop',
      status: 'Novo',
      partner_assigned: null,
      notes: ''
    };

    this.leads.unshift(newLead);
    this.saveLeads();

    try {
      localStorage.setItem(STORAGE_KEYS.LAST_LEAD, JSON.stringify(newLead));
    } catch (e) {
      console.warn(e);
    }

    analytics.track('form_complete', {
      lead_id: newLead.id,
      service: newLead.service_type,
      neighborhood: newLead.neighborhood
    });

    return newLead;
  }

  getLastSubmittedLead() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAST_LEAD);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  updateLeadStatus(id, newStatus, partnerName = null) {
    const lead = this.leads.find(l => l.id === id);
    if (lead) {
      lead.status = newStatus;
      if (partnerName !== null) {
        lead.partner_assigned = partnerName;
      }
      this.saveLeads();
      return true;
    }
    return false;
  }

  deleteLead(id) {
    this.leads = this.leads.filter(l => l.id !== id);
    this.saveLeads();
  }

  createPartner(partnerData) {
    const newPartner = {
      id: 'PAR-' + Math.floor(10000 + Math.random() * 90000),
      created_at: new Date().toISOString(),
      name: partnerData.name || '',
      company: partnerData.company || '',
      phone: partnerData.phone || '',
      email: partnerData.email || '',
      city: partnerData.city || 'Ribeirão Preto',
      services: partnerData.services || [],
      cnpj: partnerData.cnpj || '',
      bio: partnerData.bio || '',
      status: 'Aguardando Contato'
    };

    this.partners.unshift(newPartner);
    this.savePartners();

    analytics.track('professional_signup', {
      partner_id: newPartner.id,
      name: newPartner.name
    });

    return newPartner;
  }

  getDashboardStats() {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const leadsToday = this.leads.filter(l => l.created_at.slice(0, 10) === todayStr).length;
    const leads7d = this.leads.filter(l => new Date(l.created_at) >= sevenDaysAgo).length;
    const leads30d = this.leads.filter(l => new Date(l.created_at) >= thirtyDaysAgo).length;

    // By Service
    const byService = {};
    this.leads.forEach(l => {
      byService[l.service_type] = (byService[l.service_type] || 0) + 1;
    });

    // By Source
    const bySource = {};
    this.leads.forEach(l => {
      const src = l.utm_source || 'Direto';
      bySource[src] = (bySource[src] || 0) + 1;
    });

    // By Status
    const byStatus = {};
    this.leads.forEach(l => {
      byStatus[l.status] = (byStatus[l.status] || 0) + 1;
    });

    return {
      total: this.leads.length,
      today: leadsToday,
      sevenDays: leads7d,
      thirtyDays: leads30d,
      partnersCount: this.partners.length,
      byService,
      bySource,
      byStatus
    };
  }

  exportLeadsCSV() {
    if (this.leads.length === 0) {
      alert('Nenhum lead para exportar no momento.');
      return;
    }

    const headers = [
      'ID',
      'Data/Hora',
      'Nome',
      'WhatsApp',
      'E-mail',
      'Cidade',
      'Bairro',
      'Serviço',
      'Tipo de Imóvel',
      'Possui Aparelho',
      'Capacidade (BTU)',
      'Descrição',
      'Origem (UTM Source)',
      'Campanha (UTM Campaign)',
      'Dispositivo',
      'Status',
      'Parceiro Atribuído'
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = this.leads.map(l => [
      escapeCsv(l.id),
      escapeCsv(new Date(l.created_at).toLocaleString('pt-BR')),
      escapeCsv(l.name),
      escapeCsv(l.phone),
      escapeCsv(l.email),
      escapeCsv(l.city),
      escapeCsv(l.neighborhood),
      escapeCsv(l.service_type),
      escapeCsv(l.property_type),
      escapeCsv(l.has_equipment),
      escapeCsv(l.btu),
      escapeCsv(l.description),
      escapeCsv(l.utm_source),
      escapeCsv(l.utm_campaign),
      escapeCsv(l.device),
      escapeCsv(l.status),
      escapeCsv(l.partner_assigned || 'Não atribuído')
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_clima16_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  seedInitialDemoData() {
    const demoLeads = [
      {
        id: 'LEAD-849201',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        name: 'Carlos Henrique Mendes',
        phone: '(16) 99871-4421',
        email: 'carlos.mendes@email.com',
        city: 'Ribeirão Preto',
        state: 'SP',
        neighborhood: 'Jardim Botânico',
        service_type: 'Instalação de ar-condicionado',
        property_type: 'Apartamento',
        has_equipment: 'Sim, já tenho o aparelho',
        btu: '12.000 BTUs',
        description: 'Preciso instalar split no quarto do casal. Condomínio exige dreno embutido.',
        source: 'google_cpc',
        utm_source: 'google_cpc',
        utm_medium: 'cpc',
        utm_campaign: 'instalacao_rp_fundo_funil',
        entry_page: '/instalacao-ar-condicionado-ribeirao-preto',
        device: 'mobile',
        status: 'Novo',
        partner_assigned: null,
        notes: ''
      },
      {
        id: 'LEAD-849195',
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        name: 'Fernanda Paiva Silveira',
        phone: '(16) 99123-8876',
        email: 'fernanda.ps@empresa.com.br',
        city: 'Ribeirão Preto',
        state: 'SP',
        neighborhood: 'Nova Aliança',
        service_type: 'Limpeza e higienização',
        property_type: 'Empresa / escritório',
        has_equipment: 'Sim, já tenho o aparelho',
        btu: '24.000 BTUs',
        description: 'Higienização de 2 aparelhos na recepção da clínica.',
        source: 'instagram_ads',
        utm_source: 'instagram_ads',
        utm_medium: 'social_paid',
        utm_campaign: 'higienizacao_verao',
        entry_page: '/limpeza-ar-condicionado-ribeirao-preto',
        device: 'mobile',
        status: 'Encaminhado',
        partner_assigned: 'Refrigeração Ribeirão Clima',
        notes: ''
      },
      {
        id: 'LEAD-849180',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        name: 'Rodrigo Alcantara',
        phone: '(16) 99765-1122',
        email: 'rodrigo.alc@gmail.com',
        city: 'Ribeirão Preto',
        state: 'SP',
        neighborhood: 'Alto da Boa Vista',
        service_type: 'Ar-condicionado não está gelando',
        property_type: 'Casa',
        has_equipment: 'Sim, já tenho o aparelho',
        btu: '18.000 BTUs',
        description: 'Aparelho liga, ventila mas não gela nada. Suspeita de gás.',
        source: 'google_organico',
        utm_source: 'google_organico',
        utm_medium: 'organic',
        utm_campaign: 'seo_local',
        entry_page: '/ar-condicionado-nao-gela-ribeirao-preto',
        device: 'desktop',
        status: 'Convertido',
        partner_assigned: 'RP Climatizações Pro',
        notes: ''
      }
    ];

    const demoPartners = [
      {
        id: 'PAR-10492',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        name: 'Marcos Vinícius Refrigeração',
        company: 'MV Clima & Engenharia Térmica',
        phone: '(16) 99788-9900',
        email: 'contato@mvclima.com.br',
        city: 'Ribeirão Preto',
        services: ['Instalação', 'Manutenção', 'Higienização', 'Comercial', 'Residencial'],
        cnpj: '34.567.890/0001-12',
        bio: 'Técnico há 8 anos na região da zona sul e centro de RP.',
        status: 'Ativo'
      }
    ];

    this.leads = demoLeads;
    this.partners = demoPartners;
    this.saveLeads();
    this.savePartners();
  }
}

export const db = new StorageEngine();
