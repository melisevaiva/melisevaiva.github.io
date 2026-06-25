(function () {
  const gaMeta = document.querySelector('meta[name="ga4-measurement-id"]');
  const ymMeta = document.querySelector('meta[name="yandex-metrika-id"]');
  const gaId = gaMeta ? gaMeta.content.trim() : '';
  const ymId = ymMeta ? ymMeta.content.trim() : '';

  function loadScript(src, onload) {
    const script = document.createElement('script');
    script.async = true;
    script.src = src;
    if (onload) script.onload = onload;
    document.head.appendChild(script);
  }

  if (/^G-[A-Z0-9]+$/.test(gaId)) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaId), function () {
      window.gtag('js', new Date());
      window.gtag('config', gaId);
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

  function track(name, params) {
    if (window.gtag && /^G-[A-Z0-9]+$/.test(gaId)) {
      window.gtag('event', name, params || {});
    }
    if (window.ym && /^\d{5,}$/.test(ymId)) {
      window.ym(Number(ymId), 'reachGoal', name, params || {});
    }
  }

  document.addEventListener('click', function (event) {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const href = link.href;
    if (link.closest('.mobile-bottom-nav') || link.closest('.site-path-grid')) {
      track('internal_nav_click', { link_url: href, link_text: link.textContent.trim().slice(0, 80) });
    }
    if (href.includes('t.me/')) track('telegram_click', { link_url: href });
    if (href.includes('docs.google.com/forms')) track('lead_form_click', { link_url: href });
    if (href.includes('marketing_check_up_quiz_bot')) track('quiz_bot_click', { link_url: href });
  });

  function showAnalyticsNotice() {
    try {
      if (window.localStorage && window.localStorage.getItem('analytics_notice_ack') === '1') return;
    } catch (error) {
      return;
    }

    const hasMobileNav = document.querySelector('.mobile-bottom-nav') && window.matchMedia('(max-width: 640px)').matches;
    const bottomOffset = hasMobileNav ? '5rem' : '1rem';
    const notice = document.createElement('div');
    notice.setAttribute('role', 'status');
    notice.style.cssText = [
      'position:fixed',
      'left:1rem',
      'right:1rem',
      'bottom:' + bottomOffset,
      'z-index:300',
      'max-width:44rem',
      'margin-inline:auto',
      'display:flex',
      'gap:.85rem',
      'align-items:center',
      'justify-content:space-between',
      'padding:.85rem 1rem',
      'background:#1a1a1a',
      'color:#f5f0e6',
      'border:1px solid rgba(245,240,230,.18)',
      'font:400 13px/1.45 system-ui,sans-serif',
      'box-shadow:0 16px 45px rgba(0,0,0,.24)'
    ].join(';');
    notice.innerHTML = '<span>Сайт использует аналитику и cookies, чтобы видеть посещения, клики и заявки. <a href="/privacy.html" style="color:#d4a574">Подробнее</a></span><button type="button" style="border:0;background:#c83232;color:#f5f0e6;padding:.55rem .8rem;font-weight:700;cursor:pointer">OK</button>';
    notice.querySelector('button').addEventListener('click', function () {
      try {
        window.localStorage.setItem('analytics_notice_ack', '1');
      } catch (error) {
        // Ignore storage failures.
      }
      notice.remove();
    });
    document.body.appendChild(notice);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showAnalyticsNotice);
  } else {
    showAnalyticsNotice();
  }
})();
