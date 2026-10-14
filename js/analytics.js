/**
 * Clima16 - Analytics & Conversion Tracking Module
 * Captures UTM parameters, device info, referrer, and handles standard conversion events.
 */
import { CONFIG } from './config.js';

class AnalyticsTracker {
  constructor() {
    this.sessionData = this.captureSessionMetadata();
    this.eventLog = this.loadEventLog();
    this.initializeDataLayer();
    this.mode = null; // 'gtm' | 'direct' | null (nenhum ID real configurado ou sem consentimento)
    this.loadTrackers();
  }

  /**
   * Carrega GTM (ou GA4 + Meta Pixel direto) SOMENTE depois do aceite do banner LGPD
   * e SOMENTE se o ID em js/config.js for real (placeholders como GTM-XXXXXXX são ignorados).
   * Com GTM configurado, GA4 e Meta Pixel devem ser criados dentro do GTM (evita contar em dobro).
   */
  loadTrackers() {
    if (this.mode) return;
    const cfg = CONFIG.analytics || {};
    if (!cfg.enabled) return;
    try {
      if (localStorage.getItem('clima16_lgpd_consent') !== 'true') return;
    } catch { return; }

    const gtm = /^GTM-[A-Z0-9]{4,10}$/.test(cfg.gtmId || '') && !/^GTM-X+$/.test(cfg.gtmId) ? cfg.gtmId : null;
    const ga4 = /^G-[A-Z0-9]{6,12}$/.test(cfg.ga4Id || '') && !/^G-X+$/.test(cfg.ga4Id) ? cfg.ga4Id : null;
    const pixel = /^\d{10,20}$/.test(cfg.metaPixelId || '') ? cfg.metaPixelId : null;

    const addScript = (src) => {
      const el = document.createElement('script');
      el.async = true;
      el.src = src;
      document.head.appendChild(el);
    };

    if (gtm) {
      window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      addScript(`https://www.googletagmanager.com/gtm.js?id=${gtm}`);
      this.mode = 'gtm';
      return;
    }

    if (ga4) {
      window.gtag = function gtag() { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', ga4);
      addScript(`https://www.googletagmanager.com/gtag/js?id=${ga4}`);
      this.mode = 'direct';
    }

    if (pixel) {
      /* eslint-disable */
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      /* eslint-enable */
      window.fbq('init', pixel);
      window.fbq('track', 'PageView');
      this.mode = 'direct';
    }
  }

  /** Eventos enviados direto (só quando não há GTM). */
  sendDirect(eventName, payload) {
    if (this.mode !== 'direct') return;
    try {
      if (window.gtag) window.gtag('event', eventName, payload);
      if (window.fbq) {
        if (eventName === 'form_complete') window.fbq('track', 'Lead');
        else if (eventName === 'professional_signup') window.fbq('track', 'CompleteRegistration');
        else if (eventName === 'whatsapp_click') window.fbq('track', 'Contact');
      }
    } catch { /* métricas nunca quebram o site */ }
  }

  captureSessionMetadata() {
    const params = new URLSearchParams(window.location.search);
    const hashParams = window.location.hash.includes('?') 
      ? new URLSearchParams(window.location.hash.split('?')[1]) 
      : new URLSearchParams();

    // Prioritize URL query, then hash query, then fallback to stored session
    let existing = {};
    try { existing = JSON.parse(sessionStorage.getItem('clima16_utm_session') || '{}') || {}; } catch { /* sessão bloqueada/corrompida */ }

    const sessionData = {
      utm_source: params.get('utm_source') || hashParams.get('utm_source') || existing.utm_source || 'direct',
      utm_medium: params.get('utm_medium') || hashParams.get('utm_medium') || existing.utm_medium || 'none',
      utm_campaign: params.get('utm_campaign') || hashParams.get('utm_campaign') || existing.utm_campaign || '',
      utm_content: params.get('utm_content') || hashParams.get('utm_content') || existing.utm_content || '',
      utm_term: params.get('utm_term') || hashParams.get('utm_term') || existing.utm_term || '',
      gclid: params.get('gclid') || hashParams.get('gclid') || existing.gclid || '',
      fbclid: params.get('fbclid') || hashParams.get('fbclid') || existing.fbclid || '',
      referrer: document.referrer || existing.referrer || 'direct',
      entry_page: existing.entry_page || window.location.pathname + window.location.hash,
      device: this.detectDevice(),
      timestamp: new Date().toISOString()
    };

    try {
      sessionStorage.setItem('clima16_utm_session', JSON.stringify(sessionData));
    } catch (e) {
      console.warn('SessionStorage unavailable', e);
    }

    return sessionData;
  }

  detectDevice() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  initializeDataLayer() {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'clima16_initialized',
      utm: this.sessionData
    });
  }

  loadEventLog() {
    try {
      localStorage.removeItem('clima16_analytics_events');
      const events = JSON.parse(sessionStorage.getItem('clima16_analytics_events') || '[]');
      return Array.isArray(events) ? events : [];
    } catch {
      return [];
    }
  }

  track(eventName, payload = {}) {
    const eventObject = {
      id: 'evt_' + Math.random().toString(36).substr(2, 9),
      event: eventName,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      device: this.sessionData.device,
      utm_source: this.sessionData.utm_source,
      utm_medium: this.sessionData.utm_medium,
      utm_campaign: this.sessionData.utm_campaign,
      ...payload
    };

    // Push to browser dataLayer for GTM / GA4 / Meta Pixel
    window.dataLayer.push(eventObject);
    this.sendDirect(eventName, { ...payload });

    // Save locally for admin dashboard inspection
    this.eventLog.unshift(eventObject);
    if (this.eventLog.length > 200) {
      this.eventLog.pop();
    }
    try {
      sessionStorage.setItem('clima16_analytics_events', JSON.stringify(this.eventLog));
    } catch (e) {
      console.warn('Local storage error', e);
    }

    return eventObject;
  }

  getSession() {
    return this.sessionData;
  }

  getRecentEvents() {
    return this.eventLog;
  }
}

export const analytics = new AnalyticsTracker();
