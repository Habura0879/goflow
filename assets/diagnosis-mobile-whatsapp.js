(function(){
  'use strict';

  document.addEventListener('DOMContentLoaded', initMobileWhatsapp);

  function initMobileWhatsapp(){
    var config = window.QUIZ_CONFIG || {};
    var original = document.querySelector('[data-quiz="whatsapp-button"]');
    var result = document.querySelector('[data-quiz="result-wrap"]');
    if (!original || !result || !config.whatsapp_phone) return;

    var source = getDiagnosisSource(config);
    var floating = document.createElement('a');
    floating.className = 'diagnosis-mobile-wa-float';
    floating.target = '_blank';
    floating.rel = 'noopener';
    floating.setAttribute('aria-label', 'יצירת קשר עם GoFlow ב-WhatsApp');
    floating.innerHTML = '<span class="diagnosis-mobile-wa-label">WhatsApp</span>';
    floating.href = buildGenericWhatsappUrl(config.whatsapp_phone, source);
    document.body.appendChild(floating);

    floating.addEventListener('click', function(event){
      if (result.classList.contains('show') && original.href) {
        event.preventDefault();
        original.click();
        return;
      }

      pushEvent('diagnosis_whatsapp_clicked', {
        method: 'whatsapp',
        placement: 'mobile_floating_entry',
        diagnosis_source: source
      });
    });

    var observer = new MutationObserver(function(){
      if (!result.classList.contains('show')) return;
      window.setTimeout(function(){
        if (original.href) floating.href = original.href;
        floating.setAttribute('aria-label', 'שליחת תוצאת האבחון ב-WhatsApp');
        floating.classList.remove('diagnosis-mobile-wa-attention');
        void floating.offsetWidth;
        floating.classList.add('diagnosis-mobile-wa-attention');
      }, 0);
    });

    observer.observe(result, { attributes: true, attributeFilter: ['class'] });

    if (result.classList.contains('show')) {
      if (original.href) floating.href = original.href;
      floating.setAttribute('aria-label', 'שליחת תוצאת האבחון ב-WhatsApp');
    }
  }

  function buildGenericWhatsappUrl(phone, source){
    var labels = {
      automation: 'אוטומציה עסקית',
      crm: 'CRM וניהול לידים',
      operations: 'תפעול ותהליכי עבודה',
      general: 'תהליכים ומערכות'
    };
    var message = [
      'שלום GoFlow,',
      'הגעתי דרך הקמפיין בנושא ' + (labels[source] || labels.general) + '.',
      'אשמח לבדוק אם תוכלו לעזור לי.'
    ].join('\n');
    return 'https://wa.me/' + normalizePhone(phone) + '?text=' + encodeURIComponent(message);
  }

  function normalizePhone(phone){
    return String(phone || '').replace(/\D/g, '').replace(/^9720/, '972');
  }

  function getDiagnosisSource(config){
    var query = new URLSearchParams(window.location.search).get('diagnosis_source');
    var allowed = ['automation','crm','operations','general'];
    return allowed.indexOf(query) !== -1 ? query : (config.diagnosis_source || 'general');
  }

  function pushEvent(name, data){
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: name }, data || {}));
  }
})();