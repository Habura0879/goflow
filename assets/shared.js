// Mobile navigation drawer toggle functions
function toggleDrawer(){
  var h = document.getElementById('hbg');
  var d = document.getElementById('drawer');
  if (!h || !d) return;
  h.classList.toggle('open');
  d.classList.toggle('open');
  document.body.style.overflow = d.classList.contains('open') ? 'hidden' : '';
}

function closeDrawer(){
  var h = document.getElementById('hbg');
  var d = document.getElementById('drawer');
  if (h) h.classList.remove('open');
  if (d) d.classList.remove('open');
  document.body.style.overflow = '';
}

var goflowAnalyticsLoaded = false;
var goflowGaMeasurementId = 'G-E7Q866K3RX';
// Add the IDs from Google Ads and Meta Events Manager before publishing.
var goflowGoogleAdsId = '';
var goflowMetaPixelId = '';

function hasGoogleAdsId(){ return /^AW-\d+$/.test(goflowGoogleAdsId); }
function hasMetaPixelId(){ return /^\d+$/.test(goflowMetaPixelId); }

function grantTrackingConsent(){
  if (typeof gtag !== 'function') return;
  gtag('consent', 'update', {
    analytics_storage: 'granted',
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted'
  });
}

function denyTrackingConsent(){
  if (typeof gtag !== 'function') return;
  gtag('consent', 'update', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });
}

function loadMetaPixel(){
  if (!hasMetaPixelId() || typeof window.fbq === 'function') return;
  !function(f,b,e,v,n,t,s){
    if(f.fbq)return;n=f.fbq=function(){n.callMethod ? n.callMethod.apply(n,arguments) : n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)
  }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init', goflowMetaPixelId);
  window.fbq('track', 'PageView');
}

function loadAnalytics(){
  if (goflowAnalyticsLoaded) return;
  goflowAnalyticsLoaded = true;
  var gtm = document.createElement('script');
  gtm.async = true;
  gtm.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-TLRMPC48';
  document.head.appendChild(gtm);
  window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });

  var ga = document.createElement('script');
  ga.async = true;
  ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + goflowGaMeasurementId;
  document.head.appendChild(ga);
  gtag('js', new Date());
  gtag('config', goflowGaMeasurementId);
  if (hasGoogleAdsId()) gtag('config', goflowGoogleAdsId);
  loadMetaPixel();
}

function acceptCookieConsent(){
  localStorage.setItem('goflow_cookie_notice_acknowledged', 'true');
  localStorage.setItem('goflow_consent', 'granted');
  localStorage.removeItem('goflow_cookies_accepted');
  grantTrackingConsent();
  loadAnalytics();
  hideCookieBanner();
}

function rejectCookieConsent(){
  localStorage.setItem('goflow_cookie_notice_acknowledged', 'true');
  localStorage.setItem('goflow_consent', 'denied');
  localStorage.removeItem('goflow_cookies_accepted');
  denyTrackingConsent();
  hideCookieBanner();
}

function hideCookieBanner(){
  var banner = document.getElementById('cookie-banner');
  if (banner) banner.classList.remove('show');
}

// Kept for existing inline buttons on older cached HTML.
function closeCookieBanner(){ acceptCookieConsent(); }
function setCookieConsent(){ acceptCookieConsent(); }

function trackEvent(name, params){
  if (localStorage.getItem('goflow_consent') !== 'granted' || typeof gtag !== 'function') return;
  var enriched = Object.assign({}, getTrackingParams(), params || {});
  gtag('event', name, enriched);
}

function getTrackingParams(){
  var query = new URLSearchParams(window.location.search);
  var keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var params = { page_path: window.location.pathname, page_hash: window.location.hash || '' };
  keys.forEach(function(key){
    var stored = '';
    try { stored = sessionStorage.getItem('goflow_' + key) || ''; } catch(e) {}
    var value = query.get(key) || stored || '';
    if (value) {
      params[key] = value;
      try { sessionStorage.setItem('goflow_' + key, value); } catch(e) {}
    }
  });
  return params;
}

function renderCookieBanner(banner){
  if (!document.getElementById('goflow-consent-styles')) {
    var styles = document.createElement('style');
    styles.id = 'goflow-consent-styles';
    styles.textContent = '.cookie-banner{padding:.9rem clamp(1.25rem,5vw,4rem)}.cookie-banner-inner{max-width:1200px;display:flex;align-items:center;gap:1.5rem}.cookie-banner-text{flex:1;margin:0}.cookie-banner-actions{display:flex;align-items:center;gap:.65rem;flex-shrink:0}.cookie-banner-btn{min-width:112px;padding:.65rem 1.35rem}.cookie-banner-btn-secondary{background:#fff;color:var(--ink);border-color:#fff}.cookie-banner-btn-secondary:hover{background:#f1eee8;border-color:#f1eee8;color:var(--ink)}@media(max-width:700px){.cookie-banner{padding:1.15rem 1.25rem}.cookie-banner-inner{flex-direction:column;align-items:stretch;gap:.9rem}.cookie-banner-text{text-align:center;line-height:1.7}.cookie-banner-actions{width:100%;justify-content:center;gap:.55rem}.cookie-banner-btn{flex:1;min-width:0;padding:.8rem .75rem}}';
    document.head.appendChild(styles);
  }
  banner.innerHTML = '';
  var inner = document.createElement('div');
  inner.className = 'cookie-banner-inner';
  var text = document.createElement('p');
  text.className = 'cookie-banner-text';
  text.append('נשתמש בקוקיז לניתוח השימוש באתר, למדידת קמפיינים ולהצגת פרסום מותאם ב-Google וב-Meta — רק אם תאשרו. ');
  var link = document.createElement('a');
  link.className = 'cookie-policy-link';
  link.href = '/privacy/';
  link.textContent = 'למדיניות הפרטיות';
  text.appendChild(link);
  var actions = document.createElement('div');
  actions.className = 'cookie-banner-actions';
  var reject = document.createElement('button');
  reject.type = 'button'; reject.className = 'cookie-banner-btn cookie-banner-btn-secondary'; reject.textContent = 'דחה';
  reject.addEventListener('click', rejectCookieConsent);
  var accept = document.createElement('button');
  accept.type = 'button'; accept.className = 'cookie-banner-btn'; accept.textContent = 'מסכים';
  accept.addEventListener('click', acceptCookieConsent);
  actions.append(reject, accept);
  inner.append(text, actions);
  banner.appendChild(inner);
}

document.addEventListener('DOMContentLoaded', function(){
  var banner = document.getElementById('cookie-banner');
  if (banner) renderCookieBanner(banner);
  var choice = localStorage.getItem('goflow_consent');
  if (choice === 'granted') {
    grantTrackingConsent();
    loadAnalytics();
  } else {
    denyTrackingConsent();
    if (banner && choice !== 'denied') setTimeout(function(){ banner.classList.add('show'); }, 600);
  }

  document.addEventListener('click', function(event){
    var link = event.target.closest('a[href]');
    if (!link) return;
    var href = link.getAttribute('href') || '';
    var method = href.indexOf('wa.me/') !== -1 ? 'whatsapp' : href.indexOf('tel:') === 0 ? 'phone' : href.indexOf('mailto:') === 0 ? 'email' : '';
    if (!method) return;
    trackEvent('generate_lead', { method: method });
    if (localStorage.getItem('goflow_consent') === 'granted' && typeof window.fbq === 'function') window.fbq('track', 'Contact', { method: method });
  });
});
