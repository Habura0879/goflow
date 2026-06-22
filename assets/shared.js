function toggleDrawer(){
  var h = document.getElementById('hbg'), d = document.getElementById('drawer');
  if (!h || !d) return;
  h.classList.toggle('open'); d.classList.toggle('open');
  document.body.style.overflow = d.classList.contains('open') ? 'hidden' : '';
}
function closeDrawer(){
  var h = document.getElementById('hbg'), d = document.getElementById('drawer');
  if (h) h.classList.remove('open'); if (d) d.classList.remove('open');
  document.body.style.overflow = '';
}

var goflowGoogleLoaded = false;
var goflowGaMeasurementId = 'G-E7Q866K3RX';
// Add the IDs from Google Ads and Meta Events Manager before publishing.
var goflowGoogleAdsId = '';
var goflowMetaPixelId = '';

function hasGoogleAdsId(){ return /^AW-\d+$/.test(goflowGoogleAdsId); }
function hasMetaPixelId(){ return /^\d+$/.test(goflowMetaPixelId); }
function allConsent(){ return { analytics: true, marketing: true }; }
function essentialOnly(){ return { analytics: false, marketing: false }; }

function getConsentPreferences(){
  try {
    var saved = JSON.parse(localStorage.getItem('goflow_consent_preferences') || 'null');
    if (saved && typeof saved.analytics === 'boolean' && typeof saved.marketing === 'boolean') return saved;
  } catch(e) {}
  return localStorage.getItem('goflow_consent') === 'granted' ? allConsent() : essentialOnly();
}

function updateGoogleConsent(preferences){
  if (typeof gtag !== 'function') return;
  gtag('consent', 'update', {
    analytics_storage: preferences.analytics ? 'granted' : 'denied',
    ad_storage: preferences.marketing ? 'granted' : 'denied',
    ad_user_data: preferences.marketing ? 'granted' : 'denied',
    ad_personalization: preferences.marketing ? 'granted' : 'denied'
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

function loadGoogleTools(preferences){
  if (!preferences.analytics && !preferences.marketing) return;
  if (!goflowGoogleLoaded) {
    goflowGoogleLoaded = true;
    var gtm = document.createElement('script');
    gtm.async = true; gtm.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-TLRMPC48';
    document.head.appendChild(gtm);
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var ga = document.createElement('script');
    ga.async = true; ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + goflowGaMeasurementId;
    document.head.appendChild(ga);
    gtag('js', new Date());
  }
  if (preferences.analytics) gtag('config', goflowGaMeasurementId);
  if (preferences.marketing && hasGoogleAdsId()) gtag('config', goflowGoogleAdsId);
  if (preferences.marketing) loadMetaPixel();
}

function saveConsentPreferences(preferences){
  localStorage.setItem('goflow_cookie_notice_acknowledged', 'true');
  localStorage.setItem('goflow_consent', preferences.analytics || preferences.marketing ? 'custom' : 'denied');
  localStorage.setItem('goflow_consent_preferences', JSON.stringify(preferences));
  localStorage.removeItem('goflow_cookies_accepted');
  updateGoogleConsent(preferences);
  loadGoogleTools(preferences);
  hideCookieBanner();
}

function acceptAllCookies(){ saveConsentPreferences(allConsent()); }
function rejectNonEssentialCookies(){ saveConsentPreferences(essentialOnly()); }
function closeCookieBanner(){ acceptAllCookies(); }
function setCookieConsent(){ acceptAllCookies(); }
function hideCookieBanner(){ var banner = document.getElementById('cookie-banner'); if (banner) banner.classList.remove('show'); }

function trackEvent(name, params){
  if (!getConsentPreferences().analytics || typeof gtag !== 'function') return;
  gtag('event', name, Object.assign({}, getTrackingParams(), params || {}));
}
function getTrackingParams(){
  var query = new URLSearchParams(window.location.search), keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var params = { page_path: window.location.pathname, page_hash: window.location.hash || '' };
  keys.forEach(function(key){
    var stored = ''; try { stored = sessionStorage.getItem('goflow_' + key) || ''; } catch(e) {}
    var value = query.get(key) || stored || '';
    if (value) { params[key] = value; try { sessionStorage.setItem('goflow_' + key, value); } catch(e) {} }
  });
  return params;
}

function injectConsentStyles(){
  if (document.getElementById('goflow-consent-styles')) return;
  var styles = document.createElement('style'); styles.id = 'goflow-consent-styles';
  styles.textContent = '.cookie-banner{padding:.9rem clamp(1.25rem,5vw,4rem)}.cookie-banner-inner{max-width:1200px;display:flex;align-items:center;gap:1.5rem}.cookie-banner-text{flex:1;margin:0}.cookie-banner-actions{display:flex;align-items:stretch;gap:.65rem;flex-shrink:0}.cookie-banner-btn{min-width:112px;padding:.65rem 1.35rem;display:flex;align-items:center;justify-content:center;text-align:center;line-height:1.25}.cookie-banner-btn-secondary{background:#fff;color:var(--ink);border-color:#fff}.cookie-banner-btn-secondary:hover{background:#f1eee8;border-color:#f1eee8;color:var(--ink)}.cookie-preferences{display:none;max-width:760px;margin:0 auto}.cookie-preferences.show{display:block}.cookie-preferences-title{font-size:1.05rem;margin:0 0 .35rem}.cookie-preferences-intro{margin:0 0 .8rem;color:rgba(247,244,238,.82);font-size:.88rem;line-height:1.55}.cookie-preference-row{display:flex;justify-content:space-between;gap:1rem;align-items:center;padding:.75rem 0;border-top:1px solid rgba(247,244,238,.18)}.cookie-preference-row:last-of-type{border-bottom:1px solid rgba(247,244,238,.18)}.cookie-preference-row strong,.cookie-preference-row span{display:block}.cookie-preference-row span{font-size:.79rem;color:rgba(247,244,238,.76);margin-top:.15rem;line-height:1.45}.cookie-switch{width:44px;height:24px;appearance:none;border:0;border-radius:99px;background:#888;position:relative;cursor:pointer;flex-shrink:0}.cookie-switch:after{content:"";position:absolute;width:18px;height:18px;right:3px;top:3px;border-radius:50%;background:#fff;transition:transform .18s}.cookie-switch:checked{background:var(--gold)}.cookie-switch:checked:after{transform:translateX(-20px)}.cookie-switch:disabled{background:#687068;cursor:not-allowed}.cookie-preferences-actions{display:flex;gap:.65rem;margin-top:1rem;justify-content:flex-start}@media(max-width:700px){.cookie-banner{padding:1.15rem 1.25rem}.cookie-banner-inner{flex-direction:column;align-items:stretch;gap:.9rem}.cookie-banner-text{text-align:center;line-height:1.7}.cookie-banner-actions,.cookie-preferences-actions{width:100%;justify-content:center;gap:.55rem}.cookie-banner-actions .cookie-banner-btn{flex:1 1 0;min-width:0;min-height:56px;padding:.65rem .35rem;white-space:normal}.cookie-preferences-actions .cookie-banner-btn{flex:1;min-height:46px}.cookie-preference-row{align-items:flex-start}}';
  document.head.appendChild(styles);
}

function preferenceRow(title, description, enabled, locked){
  var row = document.createElement('label'); row.className = 'cookie-preference-row';
  var copy = document.createElement('div'), heading = document.createElement('strong'), text = document.createElement('span');
  heading.textContent = title; text.textContent = description; copy.append(heading, text);
  var toggle = document.createElement('input'); toggle.type = 'checkbox'; toggle.className = 'cookie-switch'; toggle.checked = enabled; toggle.disabled = locked;
  row.append(copy, toggle); return { row: row, toggle: toggle };
}

function showPreferences(banner){
  banner.querySelector('.cookie-banner-inner').style.display = 'none';
  banner.querySelector('.cookie-preferences').classList.add('show');
}

function renderCookieBanner(banner){
  injectConsentStyles(); banner.innerHTML = '';
  var inner = document.createElement('div'); inner.className = 'cookie-banner-inner';
  var text = document.createElement('p'); text.className = 'cookie-banner-text';
  text.append('אנחנו משתמשים בקוקיז חיוניים כדי שהאתר יעבוד בצורה טובה. באישור שלך, נוכל להשתמש גם בקוקיז למדידה ולשיפור התוכן והשירותים שלנו. ');
  var link = document.createElement('a'); link.className = 'cookie-policy-link'; link.href = '/privacy/'; link.textContent = 'למדיניות הפרטיות'; text.appendChild(link);
  var actions = document.createElement('div'); actions.className = 'cookie-banner-actions';
  var reject = document.createElement('button'); reject.type = 'button'; reject.className = 'cookie-banner-btn cookie-banner-btn-secondary'; reject.textContent = 'דחיית הלא־חיוניות'; reject.addEventListener('click', rejectNonEssentialCookies);
  var preferences = document.createElement('button'); preferences.type = 'button'; preferences.className = 'cookie-banner-btn cookie-banner-btn-secondary'; preferences.textContent = 'העדפות'; preferences.addEventListener('click', function(){ showPreferences(banner); });
  var accept = document.createElement('button'); accept.type = 'button'; accept.className = 'cookie-banner-btn'; accept.textContent = 'אישור הכול'; accept.addEventListener('click', acceptAllCookies);
  actions.append(accept, preferences, reject); inner.append(text, actions);

  var panel = document.createElement('section'); panel.className = 'cookie-preferences'; panel.setAttribute('aria-label', 'העדפות קוקיז');
  var title = document.createElement('h2'); title.className = 'cookie-preferences-title'; title.textContent = 'העדפות קוקיז';
  var intro = document.createElement('p'); intro.className = 'cookie-preferences-intro'; intro.textContent = 'בחרו אילו סוגי קוקיז להפעיל. עוגיות חיוניות נשארות פעילות כדי שהאתר יעבוד.';
  var saved = getConsentPreferences();
  var essential = preferenceRow('חיוניות', 'נדרשות לתפעול תקין של האתר.', true, true);
  var analytics = preferenceRow('מדידה', 'Google Analytics למדידת שימוש, תנועה והמרות.', saved.analytics, false);
  var marketing = preferenceRow('פרסום ושיווק', 'Google Ads ו-Meta Pixel לפרסום מותאם ושיווק מחדש.', saved.marketing, false);
  var saveActions = document.createElement('div'); saveActions.className = 'cookie-preferences-actions';
  var save = document.createElement('button'); save.type = 'button'; save.className = 'cookie-banner-btn'; save.textContent = 'שמירת הבחירה'; save.addEventListener('click', function(){ saveConsentPreferences({ analytics: analytics.toggle.checked, marketing: marketing.toggle.checked }); });
  var cancel = document.createElement('button'); cancel.type = 'button'; cancel.className = 'cookie-banner-btn cookie-banner-btn-secondary'; cancel.textContent = 'חזרה'; cancel.addEventListener('click', function(){ panel.classList.remove('show'); inner.style.display = ''; });
  saveActions.append(cancel, save); panel.append(title, intro, essential.row, analytics.row, marketing.row, saveActions);
  banner.append(inner, panel);
}

document.addEventListener('DOMContentLoaded', function(){
  var banner = document.getElementById('cookie-banner');
  if (banner) renderCookieBanner(banner);
  var acknowledged = localStorage.getItem('goflow_cookie_notice_acknowledged') === 'true';
  var preferences = getConsentPreferences();
  updateGoogleConsent(preferences);
  if (acknowledged) loadGoogleTools(preferences);
  else if (banner) setTimeout(function(){ banner.classList.add('show'); }, 600);
  document.addEventListener('click', function(event){
    var link = event.target.closest('a[href]'); if (!link) return;
    var href = link.getAttribute('href') || '', method = href.indexOf('wa.me/') !== -1 ? 'whatsapp' : href.indexOf('tel:') === 0 ? 'phone' : href.indexOf('mailto:') === 0 ? 'email' : '';
    if (!method) return;
    trackEvent('generate_lead', { method: method });
    if (getConsentPreferences().marketing && typeof window.fbq === 'function') window.fbq('track', 'Contact', { method: method });
  });
});
