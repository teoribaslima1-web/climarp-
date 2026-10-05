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
  }

  captureSessionMetadata() {
    const params = new URLSearchParams(window.location.search);
    const hashParams = window.location.hash.includes('?') 
      ? new URLSearchParams(window.location.hash.split('?')[1]) 
      : new URLSearchParams();

    // Prioritize URL query, then hash query, then fallback to stored session
    const existing = JSON.parse(sessionStorage.getItem('clima16_utm_session') || '{}');

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
      return JSON.parse(localStorage.getItem('clima16_analytics_events') || '[]');
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

    // Save locally for admin dashboard inspection
    this.eventLog.unshift(eventObject);
    if (this.eventLog.length > 200) {
      this.eventLog.pop();
    }
    try {
      localStorage.setItem('clima16_analytics_events', JSON.stringify(this.eventLog));
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
