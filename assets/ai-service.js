(function(){
  'use strict';

  var form = document.getElementById('aiLeadForm');
  var submit = document.getElementById('aiSubmit');
  var status = document.getElementById('aiStatus');
  var formspreeEndpoint = 'https://formspree.io/f/maqzwlqy';
  var sheetEndpoint = 'https://script.google.com/macros/s/AKfycbxYVmacixUKR071kabelmPep55790mmTFszMijZ9heSR9UFvdaqqvxhCv162q59zY6h/exec';

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

  form.action = formspreeEndpoint;
  form.method = 'POST';

  var started = false;
  form.addEventListener('focusin', function(){
    if (started) return;
    started = true;
    if (typeof trackEvent === 'function') trackEvent('ai_lead_form_start', { service: 'ai_business_processes' });
  });

  form.addEventListener('submit', async function(event){
    event.preventDefault();
    if (submit.disabled) return;

    submit.disabled = true;
    submit.textContent = 'שולח...';
    status.style.display = 'none';

    var data = new FormData(form);
    var process = String(data.get('process_to_improve') || '');
    var company = String(data.get('company') || '');
    var employees = String(data.get('employees') || '');
    var currentUse = String(data.get('current_ai_use') || '');
    var phone = String(data.get('phone') || '');
    var submittedAt = new Date().toISOString();
    var submissionId = 'ai_lead_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
    var summary = [
      'פנייה בנושא: הטמעת AI בתהליכי עבודה',
      'טלפון: ' + phone,
      'חברה: ' + company,
      'מספר עובדים: ' + employees,
      'שימוש נוכחי ב-AI: ' + currentUse,
      'התהליך שרוצים לשפר: ' + process
    ].join('\n');

    data.set('message', summary);
    data.set('quiz_summary', summary);
    data.set('_subject', 'פנייה חדשה מהאתר — הטמעת AI בתהליכי עבודה');
    data.set('service', 'הטמעת AI בתהליכי עבודה');
    data.set('source', 'ai_service_form');
    data.set('diagnosis_source', 'ai_service_form');
    data.set('form_source', 'ai_service_form');
    data.set('schema_version', 'goflow_lead_v1');
    data.set('lead_type', 'ai_implementation');
    data.set('lead_status', 'new');
    data.set('interaction_type', 'lead_submit');
    data.set('challenge', process);
    data.set('employee_count', employees);
    data.set('submission_id', submissionId);
    data.set('submitted_at', submittedAt);
    data.set('page_slug', 'ai-business-processes');
    data.set('page_url', window.location.href);
    data.set('page_path', window.location.pathname);
    data.set('page_hash', window.location.hash || '#ai-contact');

    var tracking = typeof getTrackingParams === 'function' ? getTrackingParams() : {};
    Object.keys(tracking || {}).forEach(function(key){
      if (tracking[key] !== undefined && tracking[key] !== '') data.set(key, tracking[key]);
    });
    data.set('attribution_json', JSON.stringify(tracking || {}));

    try {
      var response = await fetch(formspreeEndpoint, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });
      var result = {};
      try { result = await response.json(); } catch (ignore) {}
      if (!response.ok) throw new Error((result && result.error) || 'form_submit_failed');

      sendLeadToSheet(data);

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

  function sendLeadToSheet(formData){
    var iframeName = 'goflowAiLeadSheetFrame';
    var iframe = document.querySelector('iframe[name="' + iframeName + '"]');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.name = iframeName;
      iframe.hidden = true;
      document.body.appendChild(iframe);
    }

    var relayForm = document.createElement('form');
    relayForm.method = 'POST';
    relayForm.action = sheetEndpoint;
    relayForm.target = iframeName;
    relayForm.hidden = true;

    formData.forEach(function(value, key){
      var input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      relayForm.appendChild(input);
    });

    document.body.appendChild(relayForm);
    relayForm.submit();
    setTimeout(function(){ relayForm.remove(); }, 8000);
  }
})();
