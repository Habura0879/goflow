(function(){
  'use strict';

  var config = window.GOFLOW_SHORT_LINK || {};
  var clickWebhook = 'https://script.google.com/macros/s/AKfycbwBupU9NsVFQD7G9eqWoNS8B6EVIBymSqp3WhykccnzbZwkz52pb-zvDkXj_QPfMgA/exec';
  var required = ['destination', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];

  for (var i = 0; i < required.length; i += 1) {
    if (!config[required[i]]) return;
  }

  var target = new URL(config.destination, window.location.origin);
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach(function(key){
    target.searchParams.set(key, config[key]);
  });
  new URLSearchParams(window.location.search).forEach(function(value, key){
    target.searchParams.set(key, value);
  });
  if (window.location.hash) target.hash = window.location.hash;

  var clickId = 'clk_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
  target.searchParams.set('click_id', clickId);

  var payload = new URLSearchParams({
    event_type: 'short_link_click',
    click_id: clickId,
    clicked_at: new Date().toISOString(),
    short_path: window.location.pathname,
    destination_url: target.toString(),
    referrer: document.referrer || '',
    utm_source: target.searchParams.get('utm_source') || '',
    utm_medium: target.searchParams.get('utm_medium') || '',
    utm_campaign: target.searchParams.get('utm_campaign') || '',
    utm_content: target.searchParams.get('utm_content') || ''
  });

  try {
    fetch(clickWebhook, {
      method: 'POST',
      mode: 'no-cors',
      keepalive: true,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: payload.toString()
    });
  } catch (error) {}

  setTimeout(function(){
    window.location.replace(target.toString());
  }, 120);
})();
