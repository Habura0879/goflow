(function(){
  'use strict';

  var WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxYVmacixUKR071kabelmPep55790mmTFszMijZ9heSR9UFvdaqqvxhCv162q59zY6h/exec';

  if (window.QUIZ_CONFIG) {
    window.QUIZ_CONFIG.sheet_webhook_url = WEBHOOK_URL;
  }

  document.addEventListener('DOMContentLoaded', function(){
    var config = window.QUIZ_CONFIG || {};
    config.sheet_webhook_url = WEBHOOK_URL;

    var result = document.querySelector('[data-quiz="result-wrap"]');
    if (!result) return;

    var observer = new MutationObserver(function(){
      if (result.classList.contains('show')) sendQuizCompletion(config);
    });

    observer.observe(result, { attributes: true, attributeFilter: ['class'] });
    if (result.classList.contains('show')) sendQuizCompletion(config);
  });

  function sendQuizCompletion(config){
    var source = getDiagnosisSource(config);
    var state = getDiagnosisState(source);
    if (!state || !state.attemptId || !state.completedAt) return;

    var sentKey = 'goflow_sheet_quiz_complete_sent_' + state.attemptId;
    try {
      if (sessionStorage.getItem(sentKey) === 'sent') return;
      sessionStorage.setItem(sentKey, 'sent');
    } catch(e) {}

    var data = new FormData();
    var tracking = state.latestTrackingData || {};
    var submittedAt = state.completedAt || new Date().toISOString();

    appendData(data, 'diagnosis_source', source);
    appendData(data, 'source', source);
    appendData(data, 'page_slug', getPageSlug());
    appendData(data, 'page_url', window.location.href);
    appendData(data, 'page_path', window.location.pathname);
    appendData(data, 'page_hash', window.location.hash || '');
    appendData(data, 'quiz_id', config.quiz_id || '');
    appendData(data, 'quiz_attempt_id', state.attemptId);
    appendData(data, 'result_type', tracking.result_type || '');
    appendData(data, 'result_level', tracking.result_level || '');
    appendData(data, 'result_title', tracking.result_title || '');
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
    appendData(data, 'message', state.latestSummary || '');
    appendData(data, 'started_at', state.startedAt || '');
    appendData(data, 'completed_at', state.completedAt || '');
    appendData(data, 'submitted_at', submittedAt);
    appendData(data, 'lead_status', 'partial');
    appendData(data, 'interaction_type', 'quiz_complete');
    appendData(data, 'lead_type', 'diagnosis_quiz_complete');

    var routeParams = getRouteTrackingParams(source);
    Object.keys(routeParams).forEach(function(key){
      appendData(data, key, routeParams[key]);
    });

    try {
      submitToWebhook(data, config.sheet_webhook_url || WEBHOOK_URL);
    } catch(e) {
      try { sessionStorage.removeItem(sentKey); } catch(ignore) {}
    }
  }

  function submitToWebhook(formData, url){
    var iframeName = 'goflowDiagnosisCompletionFrame';
    var iframe = document.querySelector('iframe[name="' + iframeName + '"]');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.name = iframeName;
      iframe.hidden = true;
      document.body.appendChild(iframe);
    }

    var form = document.createElement('form');
    form.method = 'POST';
    form.action = url;
    form.target = iframeName;
    form.hidden = true;

    formData.forEach(function(value, key){
      var input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    setTimeout(function(){ form.remove(); }, 8000);
  }

  function getDiagnosisSource(config){
    var query = new URLSearchParams(window.location.search).get('diagnosis_source');
    var allowed = ['automation', 'crm', 'operations', 'general'];
    return allowed.indexOf(query) !== -1 ? query : (config.diagnosis_source || 'general');
  }

  function getDiagnosisState(source){
    try {
      return JSON.parse(sessionStorage.getItem('goflow_diagnosis_state_' + source) || 'null');
    } catch(e) {
      return null;
    }
  }

  function getRouteTrackingParams(source){
    var search = new URLSearchParams(window.location.search);
    var params = { diagnosis_source: source };

    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'src', 'group', 'post_id', 'ref'].forEach(function(key){
      var stored = '';
      try { stored = sessionStorage.getItem('goflow_' + key) || ''; } catch(e) {}
      var value = search.get(key) || stored || '';
      if (value) params[key] = value;
    });

    return params;
  }

  function getPageSlug(){
    return window.location.pathname.replace(/^\/+|\/+$/g, '') || 'diagnosis';
  }

  function appendData(data, key, value){
    data.set(key, value == null ? '' : String(value));
  }
})();
