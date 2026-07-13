(function(){
  'use strict';

  var CLICK_WEBHOOK = 'https://script.google.com/macros/s/AKfycbwBupU9NsVFQD7G9eqWoNS8B6EVIBymSqp3WhykccnzbZwkz52pb-zvDkXj_QPfMgA/exec';

  document.addEventListener('click', function(event){
    var link = event.target.closest('a[data-measured-link]');
    if (!link || event.defaultPrevented) return;
    if (event.button && event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    var clickId = createClickId();
    var destination = new URL(link.href, window.location.href);
    var shouldPassClickId = link.getAttribute('data-pass-click-id') === 'true';
    var tracking = typeof getTrackingParams === 'function' ? getTrackingParams() : {};

    if (shouldPassClickId) destination.searchParams.set('click_id', clickId);

    var payload = new URLSearchParams({
      event_type: 'short_link_click',
      click_id: clickId,
      clicked_at: new Date().toISOString(),
      short_path: link.getAttribute('data-measured-path') || window.location.pathname,
      destination_url: destination.toString(),
      referrer: window.location.href,
      utm_source: tracking.utm_source || '',
      utm_medium: tracking.utm_medium || '',
      utm_campaign: tracking.utm_campaign || '',
      utm_content: tracking.utm_content || ''
    });

    sendClick(payload);

    if (shouldPassClickId && destination.origin === window.location.origin) {
      event.preventDefault();
      setTimeout(function(){ window.location.assign(destination.toString()); }, 120);
    }
  });

  function createClickId(){
    return 'clk_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
  }

  function sendClick(payload){
    try {
      fetch(CLICK_WEBHOOK, {
        method: 'POST',
        mode: 'no-cors',
        keepalive: true,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: payload.toString()
      });
    } catch (error) {}
  }
})();
