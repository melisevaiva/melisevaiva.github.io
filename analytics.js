(function () {
  'use strict';

  var CONSENT_KEY = 'analytics_consent_v1';
  var POLICY_URL = '/privacy.html#analytics';
  var gaMeta = document.querySelector('meta[name="ga4-measurement-id"]');
  var ymMeta = document.querySelector('meta[name="yandex-metrika-id"]');
  var gaId = gaMeta ? gaMeta.content.trim() : '';
  var ymId = ymMeta ? ymMeta.content.trim() : '';
  var analyticsLoaded = false;

  function loadScript(src, onload) {
    var script = document.createElement('script');
    script.async = true;
    script.src = src;
    if (onload) script.onload = onload;
    document.head.appendChild(script);
  }

  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;

    if (/^G-[A-Z0-9]+$/.test(gaId)) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaId), function () {
        window.gtag('js', new Date());
        window.gtag('config', gaId, { anonymize_ip: true });
      });
    }

    if (/^\d{5,}$/.test(ymId)) {
      window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
      window.ym.l = 1 * new Date();
      loadScript('https://mc.yandex.ru/metrika/tag.js?id=' + encodeURIComponent(ymId));
      window.ym(Number(ymId), 'init', {
        ssr: true,
        clickmap: true,
        ecommerce: 'dataLayer',
        referrer: document.referrer,
        url: location.href,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true
      });
    }
  }

  function getChoice() {
    try { return window.localStorage.getItem(CONSENT_KEY); } catch (error) { return null; }
  }

  function saveChoice(value) {
    try { window.localStorage.setItem(CONSENT_KEY, value); } catch (error) { /* выбор действует до закрытия страницы */ }
  }

  function closeNotice() {
    var notice = document.getElementById('analytics-consent');
    if (notice) notice.remove();
  }

  function choose(value) {
    saveChoice(value);
    closeNotice();
    if (value === 'accepted') loadAnalytics();
  }

  function showNotice(force) {
    if (!force && getChoice()) return;
    closeNotice();

    var hasMobileNav = document.querySelector('.mobile-bottom-nav') && window.matchMedia('(max-width: 640px)').matches;
    var bottomOffset = hasMobileNav ? '5rem' : '1rem';
    var notice = document.createElement('section');
    notice.id = 'analytics-consent';
    notice.setAttribute('role', 'dialog');
    notice.setAttribute('aria-modal', 'false');
    notice.setAttribute('aria-labelledby', 'analytics-consent-title');
    notice.style.cssText = [
      'position:fixed', 'left:1rem', 'right:1rem', 'bottom:' + bottomOffset, 'z-index:10000',
      'max-width:48rem', 'margin-inline:auto', 'padding:1rem', 'background:#1a1a1a',
      'color:#f5f0e6', 'border:1px solid rgba(245,240,230,.24)',
      'font:400 14px/1.5 system-ui,sans-serif', 'box-shadow:0 16px 45px rgba(0,0,0,.3)'
    ].join(';');
    notice.innerHTML =
      '<strong id="analytics-consent-title" style="display:block;margin-bottom:.35rem">Файлы cookie</strong>' +
      '<p style="margin:0 0 .85rem">Сайт сохраняет необходимые настройки в вашем браузере. С вашего разрешения мы также используем Google Analytics и Яндекс.Метрику, чтобы понимать, какие страницы полезны посетителям. <a href="' + POLICY_URL + '" style="color:#e4b06f">Подробнее</a></p>' +
      '<div style="display:flex;flex-wrap:wrap;gap:.65rem">' +
      '<button type="button" data-consent="accepted" style="border:0;background:#c83232;color:#fff;padding:.7rem 1rem;font-weight:700;cursor:pointer">Разрешить аналитику</button>' +
      '<button type="button" data-consent="declined" style="border:1px solid rgba(245,240,230,.55);background:transparent;color:#f5f0e6;padding:.65rem 1rem;font-weight:700;cursor:pointer">Только необходимые</button>' +
      '</div>';
    notice.addEventListener('click', function (event) {
      var button = event.target.closest('[data-consent]');
      if (button) choose(button.getAttribute('data-consent'));
    });
    document.body.appendChild(notice);
  }

  function track(name, params) {
    if (getChoice() !== 'accepted') return;
    if (window.gtag && /^G-[A-Z0-9]+$/.test(gaId)) window.gtag('event', name, params || {});
    if (window.ym && /^\d{5,}$/.test(ymId)) window.ym(Number(ymId), 'reachGoal', name, params || {});
  }

  document.addEventListener('click', function (event) {
    var settings = event.target.closest('[data-analytics-settings]');
    if (settings) {
      event.preventDefault();
      showNotice(true);
      return;
    }

    var link = event.target.closest('a[href]');
    if (!link) return;
    var href = link.href;
    if (link.closest('.mobile-bottom-nav') || link.closest('.site-path-grid')) {
      track('internal_nav_click', { link_url: href, link_text: link.textContent.trim().slice(0, 80) });
    }
    if (href.indexOf('t.me/') !== -1) track('telegram_click', { link_url: href });
    if (href.indexOf('docs.google.com/forms') !== -1) track('lead_form_click', { link_url: href });
    if (href.indexOf('marketing_check_up_quiz_bot') !== -1) track('quiz_bot_click', { link_url: href });
  });

  window.showAnalyticsPreferences = function () { showNotice(true); };

  function start() {
    var choice = getChoice();
    if (choice === 'accepted') loadAnalytics();
    else if (!choice) showNotice(false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
