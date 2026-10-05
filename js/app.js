/**
 * Clima16 - Application Bootstrap
 */
import { renderHeader, initHeaderEvents } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { renderCookieBanner, initCookieBannerEvents } from './components/cookie-banner.js';
import { Router } from './router.js';
import { analytics } from './analytics.js';

// Expose analytics globally for inline onclick handlers
window.clima16Analytics = analytics;

document.addEventListener('DOMContentLoaded', () => {
  const headerMount = document.getElementById('header-mount');
  const appMount = document.getElementById('app-mount');
  const footerMount = document.getElementById('footer-mount');
  const bannerMount = document.getElementById('cookie-banner-mount');

  if (headerMount) {
    headerMount.innerHTML = renderHeader();
    initHeaderEvents();
  }

  if (footerMount) {
    footerMount.innerHTML = renderFooter();
  }

  if (bannerMount) {
    bannerMount.innerHTML = renderCookieBanner();
    initCookieBannerEvents();
  }

  if (appMount) {
    const router = new Router(appMount);
    router.init();
  }

});
