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

function setCookieConsent(choice){
  var granted = choice === 'granted';
  localStorage.setItem('goflow_consent', granted ? 'granted' : 'denied');
  localStorage.removeItem('goflow_cookies_accepted');
  if (granted) loadAnalytics();
  if (typeof gtag === 'function') {
    gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
  }
  var banner = document.getElementById('cookie-banner');
  if (banner) banner.classList.remove('show');
}

// Backward compatibility for cached HTML.
function closeCookieBanner(){
  setCookieConsent('granted');
}

function trackEvent(name, params){
  if (typeof gtag === 'function') gtag('event', name, params || {});
}

document.addEventListener('DOMContentLoaded', function(){
  var banner = document.getElementById('cookie-banner');
  var choice = localStorage.getItem('goflow_consent');
  if (choice === 'granted') loadAnalytics();
  if (banner && !choice) {
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
