(function(){
  'use strict';

  var pendingCompleteLead = null;

  window.dataLayer = window.dataLayer || [];
  var originalPush = window.dataLayer.push.bind(window.dataLayer);
  window.dataLayer.push = function(){
    var item = arguments.length === 1 ? arguments[0] : null;
    if (item && Object.prototype.toString.call(item) === '[object Object]' && item.event === 'diagnosis_lead_submitted') return window.dataLayer.length;
    return originalPush.apply(window.dataLayer, arguments);
  };

  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(initDiagnosisResultExperience, 0);
  });

  function initDiagnosisResultExperience(){
    decorateField('name', true, '');
    decorateField('phone', true, '');
    decorateField('company', false, '(רשות)');
    bindLeadPersistence();

    var result = document.querySelector('[data-quiz="result-wrap"]');
    if (!result) return;

    var observer = new MutationObserver(function(){
      if (result.classList.contains('show')) applyCompletedResultLayout(result);
    });
    observer.observe(result, { attributes: true, attributeFilter: ['class'] });

    if (result.classList.contains('show')) applyCompletedResultLayout(result);
    bindFocusedFieldVisibility();
    bindVisualViewportState();
  }

  function applyCompletedResultLayout(result){
    if (result.getAttribute('data-completed-layout') === 'true') return;
    result.setAttribute('data-completed-layout', 'true');

    var actions = result.querySelector('.result-cta');
    var areas = result.querySelector('.result-areas');
    var form = result.querySelector('[data-quiz="lead-form"]');
    var toggle = result.querySelector('[data-quiz="lead-toggle"]');
    var whatsapp = result.querySelector('[data-quiz="whatsapp-button"]');
    var phone = result.querySelector('[data-quiz="phone-button"]');
    var restart = result.querySelector('[data-quiz="restart-button"]');
    var actionCopy = result.querySelector('.result-cta-text');
    var buttons = result.querySelector('.result-cta-btns');

    if (actions && areas) result.insertBefore(actions, areas);
    if (toggle) toggle.hidden = true;
    if (phone) phone.hidden = true;
    if (actionCopy) actionCopy.hidden = true;

    if (form) {
      form.hidden = false;
      form.classList.add('diagnosis-lead-form-open');
      var title = form.querySelector('[data-quiz="lead-form-title"]');
      var subtitle = form.querySelector('[data-quiz="lead-form-subtitle"]');
      var submit = form.querySelector('[data-quiz="lead-submit"]');
      if (title) title.textContent = 'רוצים שנעבור איתכם על תוצאת האבחון?';
      if (subtitle) subtitle.textContent = 'השאירו פרטים, נעבור על התוצאה ונחזור אליכם עם כיוון ברור למה כדאי לטפל קודם.';
      if (submit) submit.textContent = 'שליחת הפרטים';

      if (whatsapp) {
        whatsapp.classList.add('diagnosis-whatsapp-adaptive');
        whatsapp.setAttribute('aria-label', 'שליחת תוצאת האבחון ב-WhatsApp');
        var whatsappText = whatsapp.querySelector('span');
        if (whatsappText) whatsappText.textContent = 'מעדיפים WhatsApp?';
        var subtitleNode = form.querySelector('[data-quiz="lead-form-subtitle"]');
        if (subtitleNode && subtitleNode.parentNode) subtitleNode.parentNode.insertBefore(whatsapp, subtitleNode.nextSibling);
      }
    }

    if (buttons && !buttons.querySelector(':not([hidden])')) buttons.hidden = true;

    if (restart) {
      restart.classList.add('diagnosis-restart-bottom');
      restart.textContent = 'ביצוע האבחון מחדש';
      result.appendChild(restart);
    }

    document.documentElement.classList.add('diagnosis-result-complete');
  }

  function bindLeadPersistence(){
    var whatsapp = document.querySelector('[data-quiz="whatsapp-button"]');
    var form = document.querySelector('[data-quiz="lead-form"]');

    if (whatsapp && whatsapp.getAttribute('data-partial-lead-bound') !== 'true') {
      whatsapp.setAttribute('data-partial-lead-bound', 'true');
      whatsapp.addEventListener('click', function(){
        sendWhatsappPartialLead();
      }, true);
    }

    if (form && form.getAttribute('data-complete-lead-bound') !== 'true') {
      form.setAttribute('data-complete-lead-bound', 'true');
      form.addEventListener('submit', function(){
        var config = window.QUIZ_CONFIG || {};
        var source = getDiagnosisSource(config);
        var state = getDiagnosisState(source);
        if (state && state.attemptId) setHiddenField(form, 'quiz_attempt_id', state.attemptId);
        setHiddenField(form, 'lead_status', 'complete');
        setHiddenField(form, 'interaction_type', 'form_submit');
        setHiddenField(form, 'whatsapp_clicked_at', getSavedWhatsappClickTime());
        pendingCompleteLead = captureCompleteLead(form, config, source, state);
      }, true);
    }

    if (form && form.getAttribute('data-complete-success-bound') !== 'true') {
      form.setAttribute('data-complete-success-bound', 'true');
      var successObserver = new MutationObserver(function(){
        if (form.querySelector('.lead-success')) sendCompleteLeadAfterFormspreeSuccess();
      });
      successObserver.observe(form, { childList: true, subtree: true });
    }
  }

  function captureCompleteLead(form, config, source, state){
    if (!config.sheet_webhook_url || !state || !state.attemptId) return null;
    var values = {};
    ['name','phone','company','email','employee_count'].forEach(function(key){
      var field = form.querySelector('[name="' + key + '"]');
      values[key] = field ? field.value : '';
    });
    return {
      webhookUrl: config.sheet_webhook_url,
      config: config,
      source: source,
      state: JSON.parse(JSON.stringify(state)),
      values: values,
      routeParams: getRouteTrackingParams(source),
      whatsappClickedAt: getSavedWhatsappClickTime()
    };
  }

  function sendCompleteLeadAfterFormspreeSuccess(){
    var snapshot = pendingCompleteLead;
    if (!snapshot || !snapshot.state || !snapshot.state.attemptId) return;

    var attemptId = snapshot.state.attemptId;
    var sentKey = 'goflow_complete_sheet_sent_' + attemptId;
    try { if (sessionStorage.getItem(sentKey) === 'sent') return; } catch(e) {}

    var data = new FormData();
    var tracking = snapshot.state.latestTrackingData || {};
    var submittedAt = new Date().toISOString();

    Object.keys(snapshot.values || {}).forEach(function(key){ appendData(data, key, snapshot.values[key]); });
    appendData(data, 'diagnosis_source', snapshot.source);
    appendData(data, 'page_slug', getPageSlug());
    appendData(data, 'page_url', window.location.href);
    appendData(data, 'page_path', window.location.pathname);
    appendData(data, 'page_hash', window.location.hash || '');
    appendData(data, 'schema_version', 'goflow_lead_v1');
    appendData(data, 'lead_type', 'diagnosis');
    appendData(data, 'source', 'campaign_diagnosis');
    appendData(data, 'landing_id', getPageSlug());
    appendData(data, 'landing_name', (snapshot.config.landing && snapshot.config.landing.label) || 'GoFlow');
    appendData(data, 'questionnaire_id', snapshot.config.quiz_id || '');
    appendData(data, 'questionnaire_name', snapshot.config.quiz_name || snapshot.config.quiz_id || '');
    appendData(data, 'questionnaire_version', snapshot.config.questionnaire_version || '1');
    appendData(data, 'result_model', snapshot.config.result_mode || 'category');
    appendData(data, 'quiz_id', snapshot.config.quiz_id || '');
    appendData(data, 'quiz_attempt_id', attemptId);
    appendData(data, 'result_type', tracking.result_type || '');
    appendData(data, 'result_level', tracking.result_level || '');
    appendData(data, 'result_badge', tracking.result_badge || '');
    appendData(data, 'challenge', tracking.result_title || '');
    appendData(data, 'score_total', tracking.score_total || '');
    appendData(data, 'score_max', tracking.score_max || '');
    appendData(data, 'score_percent', tracking.score_percent || '');
    appendData(data, 'top_areas', tracking.top_areas || '');
    appendData(data, 'worst_dimension', tracking.worst_dimension || '');
    appendData(data, 'category_scores', tracking.category_scores || '');
    appendData(data, 'answers_json', JSON.stringify((snapshot.state.answerDetails || []).filter(Boolean)));
    appendData(data, 'result_data_json', JSON.stringify(tracking));
    appendData(data, 'attribution_json', JSON.stringify(snapshot.routeParams || {}));
    appendData(data, 'quiz_summary', snapshot.state.latestSummary || '');
    appendData(data, 'message', snapshot.state.latestSummary || '');
    appendData(data, 'started_at', snapshot.state.startedAt || '');
    appendData(data, 'completed_at', snapshot.state.completedAt || '');
    appendData(data, 'submitted_at', submittedAt);
    appendData(data, 'lead_status', 'complete');
    appendData(data, 'interaction_type', 'form_submit');
    appendData(data, 'whatsapp_clicked_at', snapshot.whatsappClickedAt || '');

    Object.keys(snapshot.routeParams || {}).forEach(function(key){ appendData(data, key, snapshot.routeParams[key]); });

    try { sessionStorage.setItem(sentKey, 'sent'); } catch(e) {}
    sendSheetWebhook(snapshot.webhookUrl, data);
    pendingCompleteLead = null;
  }

  function sendWhatsappPartialLead(){
    var config = window.QUIZ_CONFIG || {};
    if (!config.sheet_webhook_url) return;

    var source = getDiagnosisSource(config);
    var state = getDiagnosisState(source);
    if (!state || !state.attemptId) return;

    var clickedAt = new Date().toISOString();
    try { sessionStorage.setItem('goflow_whatsapp_clicked_at_' + state.attemptId, clickedAt); } catch(e) {}

    var data = new FormData();
    var tracking = state.latestTrackingData || {};
    var form = document.querySelector('[data-quiz="lead-form"]');

    if (form) {
      ['name','phone','company','email','employee_count'].forEach(function(key){
        var field = form.querySelector('[name="' + key + '"]');
        appendData(data, key, field ? field.value : '');
      });
    }

    appendData(data, 'diagnosis_source', source);
    appendData(data, 'page_slug', getPageSlug());
    appendData(data, 'page_url', window.location.href);
    appendData(data, 'page_path', window.location.pathname);
    appendData(data, 'page_hash', window.location.hash || '');
    appendData(data, 'quiz_id', config.quiz_id || '');
    appendData(data, 'quiz_attempt_id', state.attemptId);
    appendData(data, 'result_type', tracking.result_type || '');
    appendData(data, 'result_level', tracking.result_level || '');
    appendData(data, 'result_badge', tracking.result_badge || '');
    appendData(data, 'score_total', tracking.score_total || '');
    appendData(data, 'score_max', tracking.score_max || '');
    appendData(data, 'score_percent', tracking.score_percent || '');
    appendData(data, 'top_areas', tracking.top_areas || '');
    appendData(data, 'worst_dimension', tracking.worst_dimension || '');
    appendData(data, 'category_scores', tracking.category_scores || '');
    appendData(data, 'answers_json', JSON.stringify((state.answerDetails || []).filter(Boolean)));
    appendData(data, 'result_data_json', JSON.stringify(tracking));
    appendData(data, 'quiz_summary', state.latestSummary || '');
    appendData(data, 'lead_status', 'partial');
    appendData(data, 'interaction_type', 'whatsapp_click');
    appendData(data, 'whatsapp_clicked_at', clickedAt);
    appendData(data, 'lead_type', 'diagnosis_whatsapp_click');
    appendData(data, 'submitted_at', clickedAt);

    var routeParams = getRouteTrackingParams(source);
    Object.keys(routeParams).forEach(function(key){ appendData(data, key, routeParams[key]); });
    sendSheetWebhook(config.sheet_webhook_url, data);
  }

  function sendSheetWebhook(url, data){
    var beaconSent = false;
    try {
      if (navigator.sendBeacon) beaconSent = navigator.sendBeacon(url, data);
    } catch(e) {}

    if (!beaconSent) {
      try {
        fetch(url, {
          method: 'POST',
          body: data,
          keepalive: true,
          mode: 'no-cors'
        }).catch(function(){});
      } catch(e) {}
    }
  }

  function getDiagnosisSource(config){
    var query = new URLSearchParams(window.location.search).get('diagnosis_source');
    var allowed = ['automation','crm','operations','general'];
    return allowed.indexOf(query) !== -1 ? query : (config.diagnosis_source || 'general');
  }

  function getDiagnosisState(source){
    try {
      return JSON.parse(sessionStorage.getItem('goflow_diagnosis_state_' + source) || 'null');
    } catch(e) { return null; }
  }

  function getRouteTrackingParams(source){
    var search = new URLSearchParams(window.location.search);
    var params = { diagnosis_source: source };
    ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid'].forEach(function(key){
      var stored = '';
      try { stored = sessionStorage.getItem('goflow_' + key) || ''; } catch(e) {}
      var value = search.get(key) || stored || '';
      if (value) params[key] = value;
    });
    return params;
  }

  function getSavedWhatsappClickTime(){
    var config = window.QUIZ_CONFIG || {};
    var source = getDiagnosisSource(config);
    var state = getDiagnosisState(source);
    if (!state || !state.attemptId) return '';
    try { return sessionStorage.getItem('goflow_whatsapp_clicked_at_' + state.attemptId) || ''; } catch(e) { return ''; }
  }

  function getPageSlug(){
    return window.location.pathname.replace(/^\/+|\/+$/g, '') || 'diagnosis';
  }

  function appendData(data, key, value){
    data.set(key, value == null ? '' : String(value));
  }

  function setHiddenField(form, name, value){
    var field = form.querySelector('input[type="hidden"][name="' + name + '"]');
    if (!field) {
      field = document.createElement('input');
      field.type = 'hidden';
      field.name = name;
      form.appendChild(field);
    }
    field.value = value == null ? '' : String(value);
  }

  function bindFocusedFieldVisibility(){
    var form = document.querySelector('[data-quiz="lead-form"]');
    if (!form || form.getAttribute('data-focus-scroll-bound') === 'true') return;
    form.setAttribute('data-focus-scroll-bound', 'true');
    form.addEventListener('focusin', function(event){
      if (!isMobileViewport()) return;
      setTimeout(function(){ scrollFieldAboveKeyboard(event.target); }, 100);
      setTimeout(function(){ scrollFieldAboveKeyboard(event.target); }, 420);
    });
  }

  function scrollFieldAboveKeyboard(field){
    if (!field || typeof field.getBoundingClientRect !== 'function') return;
    var viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    var desiredTop = Math.max(18, Math.min(96, Math.round(viewportHeight * 0.12)));
    var rect = field.getBoundingClientRect();
    var targetTop = Math.max(0, window.pageYOffset + rect.top - desiredTop);
    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  }

  function bindVisualViewportState(){
    if (!window.visualViewport || window.visualViewport.__goflowDiagnosisBound) return;
    window.visualViewport.__goflowDiagnosisBound = true;
    var baseHeight = window.visualViewport.height;
    window.visualViewport.addEventListener('resize', function(){
      var keyboardOpen = window.visualViewport.height < baseHeight * 0.76;
      document.documentElement.classList.toggle('diagnosis-keyboard-open', keyboardOpen);
      if (!keyboardOpen) baseHeight = Math.max(baseHeight, window.visualViewport.height);
    });
  }

  function isMobileViewport(){
    return !window.matchMedia || window.matchMedia('(max-width: 960px)').matches;
  }

  function decorateField(name, required, suffix){
    var field = document.querySelector('[data-quiz="lead-form"] [name="' + name + '"]');
    if (!field) return;
    var row = field.closest('.frow');
    var label = row && row.querySelector('label');
    if (!label) return;

    var oldMarker = label.querySelector('[data-field-marker]');
    if (oldMarker) oldMarker.remove();

    if (required) {
      field.required = true;
      field.setAttribute('aria-required', 'true');
      var requiredMarker = document.createElement('span');
      requiredMarker.className = 'field-required-marker';
      requiredMarker.setAttribute('aria-hidden', 'true');
      requiredMarker.setAttribute('data-field-marker', 'required');
      requiredMarker.textContent = '*';
      label.appendChild(requiredMarker);
      return;
    }

    field.required = false;
    field.removeAttribute('required');
    field.removeAttribute('aria-required');
    var optionalMarker = document.createElement('span');
    optionalMarker.className = 'field-optional-marker';
    optionalMarker.setAttribute('data-field-marker', 'optional');
    optionalMarker.textContent = suffix;
    label.appendChild(optionalMarker);
  }
})();
