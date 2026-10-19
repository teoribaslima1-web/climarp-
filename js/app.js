/**
 * Clima16 - Application Bootstrap
 */
import { renderHeader, initHeaderEvents } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { renderCookieBanner, initCookieBannerEvents } from './components/cookie-banner.js';
import { Router } from './router.js';
import { analytics } from './analytics.js';
import { initWeatherStrip } from './components/weather-strip.js';

// Expose analytics globally for inline onclick handlers
window.clima16Analytics = analytics;

document.addEventListener('DOMContentLoaded', () => {
  const headerMount = document.getElementById('header-mount');
  const appMount = document.getElementById('app-mount');
  const footerMount = document.getElementById('footer-mount');
  const bannerMount = document.getElementById('cookie-banner-mount');

  initWeatherStrip(document.getElementById('weather-mount'));

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
    document.getElementById('cookie-preferences')?.addEventListener('click', () => {
      bannerMount.innerHTML = renderCookieBanner(true);
      initCookieBannerEvents();
      document.getElementById('btn-reject-cookies')?.focus();
    });
  }

  // Cliques nos links do Instagram (rodapé, blog e confirmação) viram evento no GA4, se houver aceite.
  document.addEventListener('click', (e) => {
    const link = e.target.closest && e.target.closest('[data-instagram-follow]');
    if (link) window.clima16Analytics?.track('instagram_click', { origin: link.getAttribute('data-instagram-follow') });
  });

  if (appMount) {
    const router = new Router(appMount);
    router.init();
  }

});
