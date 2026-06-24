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
    loadScript('https://mc.yandex.ru/metrika/tag.js');
    window.ym(Number(ymId), 'init', {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: false
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
    if (href.includes('t.me/')) track('telegram_click', { link_url: href });
    if (href.includes('docs.google.com/forms')) track('lead_form_click', { link_url: href });
    if (href.includes('marketing_check_up_quiz_bot')) track('quiz_bot_click', { link_url: href });
  });
})();
