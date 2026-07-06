(function(){
  var form = document.getElementById('aiLeadForm');
  var submit = document.getElementById('aiSubmit');
  var status = document.getElementById('aiStatus');

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
    if (typeof getTrackingParams === 'function') {
      var tracking = getTrackingParams();
      Object.keys(tracking || {}).forEach(function(key){
        if (tracking[key] !== undefined && tracking[key] !== '') data.append(key, tracking[key]);
      });
    }

    try {
      var response = await fetch('https://formspree.io/f/maqzwlqy', {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) throw new Error('form_submit_failed');

      submit.textContent = '✓ הבקשה נשלחה';
      status.style.display = 'block';
      status.style.color = 'var(--gold)';
      status.textContent = 'תודה. נחזור אליכם לבדיקת התאמה.';
      if (typeof trackEvent === 'function') {
        trackEvent('ai_lead_submitted', {
          service: 'ai_business_processes',
          method: 'ai_service_form'
        });
      }
      form.reset();
    } catch (error) {
      submit.disabled = false;
      submit.textContent = 'שליחת בקשה ←';
      status.style.display = 'block';
      status.style.color = '#b43c1e';
      status.textContent = 'השליחה לא הושלמה. אפשר לנסות שוב או לפנות בוואטסאפ.';
    }
  });
})();
