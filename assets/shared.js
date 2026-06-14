// Mobile navigation drawer toggle functions
function toggleDrawer(){
  var h = document.getElementById('hbg');
  var d = document.getElementById('drawer');
  h.classList.toggle('open');
  d.classList.toggle('open');
  document.body.style.overflow = d.classList.contains('open') ? 'hidden' : '';
}

function closeDrawer(){
  document.getElementById('hbg').classList.remove('open');
  document.getElementById('drawer').classList.remove('open');
  document.body.style.overflow = '';
}

var goflowAnalyticsLoaded = false;

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
  ga.src = 'https://www.googletagmanager.com/gtag/js?id=G-E7Q866K3RX';
  document.head.appendChild(ga);
  gtag('js', new Date());
  gtag('config', 'G-E7Q866K3RX');
}

function closeCookieBanner(){
  localStorage.setItem('goflow_cookie_notice_acknowledged', 'true');
  localStorage.setItem('goflow_consent', 'granted');
  localStorage.removeItem('goflow_cookies_accepted');
  loadAnalytics();
  if (typeof gtag === 'function') {
    gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
  }
  var banner = document.getElementById('cookie-banner');
  if (banner) banner.classList.remove('show');
}

// Backward compatibility while cached pages are refreshed.
function setCookieConsent(){
  closeCookieBanner();
}

function trackEvent(name, params){
  if (typeof gtag === 'function') gtag('event', name, params || {});
}

document.addEventListener('DOMContentLoaded', function(){
  var banner = document.getElementById('cookie-banner');
  var choice = localStorage.getItem('goflow_consent');
  var acknowledged = localStorage.getItem('goflow_cookie_notice_acknowledged');
  if (choice === 'granted') {
    localStorage.setItem('goflow_cookie_notice_acknowledged', 'true');
    loadAnalytics();
  }
  if (banner && !acknowledged && choice !== 'granted') {
    setTimeout(function(){
      banner.classList.add('show');
    }, 600);
  }

  document.addEventListener('click', function(event){
    var link = event.target.closest('a[href]');
    if (!link) return;
    var href = link.getAttribute('href') || '';
    var method = '';
    if (href.indexOf('wa.me/') !== -1) method = 'whatsapp';
    else if (href.indexOf('tel:') === 0) method = 'phone';
    else if (href.indexOf('mailto:') === 0) method = 'email';
    if (method) trackEvent('generate_lead', { method: method });
  });
});
