(function(){
  var form = document.getElementById('aiLeadForm');
  var submit = document.getElementById('aiSubmit');
  var status = document.getElementById('aiStatus');
  var endpoint = 'https://formspree.io/f/maqzwlqy';

  if (typeof trackEvent === 'function') {
    trackEvent('ai_service_view', { service: 'ai_business_processes' });
  }

  document.addEventListener('click', function(event){
    var cta = event.target.closest('[data-ai-cta]');
    if (!cta || typeof trackEvent !== 'function') return;
    trackEvent('ai_consultation_click', {
      cta_location: cta.dataset.aiCta || '',
      cta_text: (cta.textContent || '').trim()
    });
  });

  if (!form) return;

  form.action = endpoint;
  form.method = 'POST';

  var started = false;
  form.addEventListener('focusin', function(){
    if (started) return;
    started = true;
    if (typeof trackEvent === 'function') trackEvent('ai_lead_form_start', { service: 'ai_business_processes' });
  });

  form.addEventListener('submit', async function(event){
    event.preventDefault();
    submit.disabled = true;
    submit.textContent = 'שולח...';
    status.style.display = 'none';

    var data = new FormData(form);
    var process = data.get('process_to_improve') || '';
    var company = data.get('company') || '';
    var employees = data.get('employees') || '';
    var currentUse = data.get('current_ai_use') || '';
    var phone = data.get('phone') || '';

    data.set('message', [
      'פנייה בנושא: הטמעת AI בתהליכי עבודה',
      'טלפון: ' + phone,
      'חברה: ' + company,
      'מספר עובדים: ' + employees,
      'שימוש נוכחי ב-AI: ' + currentUse,
      'התהליך שרוצים לשפר: ' + process
    ].join('\n'));
    data.set('_subject', 'פנייה חדשה מהאתר — הטמעת AI בתהליכי עבודה');
    data.set('service', 'הטמעת AI בתהליכי עבודה');

    if (typeof getTrackingParams === 'function') {
      var tracking = getTrackingParams();
      Object.keys(tracking || {}).forEach(function(key){
        if (tracking[key] !== undefined && tracking[key] !== '') data.set(key, tracking[key]);
      });
    }

    try {
      var response = await fetch(endpoint, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });
      var result = {};
      try { result = await response.json(); } catch (ignore) {}
      if (!response.ok) throw new Error((result && result.error) || 'form_submit_failed');

      submit.textContent = '✓ ההודעה נשלחה בהצלחה';
      submit.style.background = '#1a5c2a';
      status.style.display = 'block';
      status.style.color = 'var(--gold)';
      status.textContent = 'תודה שפנית! נחזור אליך בהקדם.';
      if (typeof trackEvent === 'function') {
        trackEvent('generate_lead', { method: 'ai_service_form', service: 'ai_business_processes' });
        trackEvent('ai_lead_submitted', { service: 'ai_business_processes', method: 'ai_service_form' });
      }
      form.reset();
    } catch (error) {
      submit.disabled = false;
      submit.textContent = 'שליחת בקשה ←';
      submit.style.background = '';
      status.style.display = 'block';
      status.style.color = '#b43c1e';
      status.textContent = 'אירעה שגיאה, נסו שוב או פנו אלינו בוואטסאפ.';
    }
  });
})();
