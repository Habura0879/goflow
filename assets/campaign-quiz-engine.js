(function(){
  'use strict';

  function initQuizEngine(){
    var config = window.QUIZ_CONFIG || null;
    var root = document.querySelector('[data-quiz-app]');
    if (!config || !root) return;

    var source = getDiagnosisSource(config);
    var storageKey = 'goflow_diagnosis_state_' + source;
    var state = loadState() || createInitialState();
    var dom = bindDom(root);

    renderStaticCopy();
    attachEvents();
    emit('diagnosis_page_view');
    hydrate();

    function createInitialState(){
      return {
        currentQ: 0,
        answerDetails: [],
        started: false,
        startedAt: '',
        completedAt: '',
        attemptId: createAttemptId(),
        latestSummary: '',
        latestTrackingData: {},
        completeTracked: false,
        resultViewedTracked: false,
        leadSubmitted: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
    }

    function createAttemptId(){
      return 'diag_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
    }

    function loadState(){
      try {
        var saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
        if (!saved || typeof saved !== 'object') return null;
        if (!saved.updatedAt || Date.now() - saved.updatedAt > 24 * 60 * 60 * 1000) {
          sessionStorage.removeItem(storageKey);
          return null;
        }
        return Object.assign(createInitialState(), saved);
      } catch(e) { return null; }
    }

    function persistState(){
      state.updatedAt = Date.now();
      try {
        sessionStorage.setItem(storageKey, JSON.stringify({
          currentQ: state.currentQ,
          answerDetails: state.answerDetails,
          started: state.started,
          startedAt: state.startedAt,
          completedAt: state.completedAt,
          attemptId: state.attemptId,
          latestSummary: state.latestSummary,
          latestTrackingData: state.latestTrackingData,
          completeTracked: state.completeTracked,
          resultViewedTracked: state.resultViewedTracked,
          leadSubmitted: state.leadSubmitted,
          createdAt: state.createdAt,
          updatedAt: state.updatedAt
        }));
      } catch(e) {}
    }

    function clearState(){
      try { sessionStorage.removeItem(storageKey); } catch(e) {}
    }

    function resetState(){
      state = createInitialState();
      clearState();
      persistState();
    }

    function bindDom(scope){
      return {
        introEyebrow: find(scope, 'intro-eyebrow'), introTitle: find(scope, 'intro-title'), introSubtitle: find(scope, 'intro-subtitle'),
        progressWrap: find(scope, 'progress-wrap'), progressText: find(scope, 'progress-text'), progressPct: find(scope, 'progress-pct'), progressBar: find(scope, 'progress-bar'),
        questionWrap: find(scope, 'question-wrap'), qCard: find(scope, 'question-card'), qNum: find(scope, 'question-number'), qText: find(scope, 'question-text'), qOptions: find(scope, 'question-options'),
        btnBack: find(scope, 'back-button'), btnNext: find(scope, 'next-button'), resultWrap: find(scope, 'result-wrap'), resultHeader: find(scope, 'result-header'),
        resultBadge: find(scope, 'result-badge'), resultTitle: find(scope, 'result-title'), resultSub: find(scope, 'result-sub'), resultRecommendation: find(scope, 'result-recommendation'),
        resultAreasTitle: find(scope, 'result-areas-title'), areaCards: find(scope, 'result-area-cards'), ctaTitle: find(scope, 'result-cta-title'), ctaSub: find(scope, 'result-cta-text'),
        waBtn: find(scope, 'whatsapp-button'), phoneBtn: find(scope, 'phone-button'), leadToggle: find(scope, 'lead-toggle'), restartBtn: find(scope, 'restart-button'),
        leadForm: find(scope, 'lead-form'), leadFormTitle: find(scope, 'lead-form-title'), leadFormSubtitle: find(scope, 'lead-form-subtitle'), leadSubmit: find(scope, 'lead-submit'),
        leadMsg: find(scope, 'lead-message'), quizSummaryField: find(scope, 'quiz-summary-field'), sourceField: find(scope, 'quiz-source-field')
      };
    }

    function find(scope, key){ return scope.querySelector('[data-quiz="' + key + '"]'); }

    function renderStaticCopy(){
      setText(dom.introEyebrow, config.intro_eyebrow);
      setText(dom.introTitle, config.intro_title);
      setText(dom.introSubtitle, config.intro_subtitle);
      setText(dom.resultAreasTitle, config.results_heading || 'הנושאים שעלו באבחון');
      setText(dom.leadFormTitle, config.form_copy.title);
      setText(dom.leadFormSubtitle, config.form_copy.subtitle);
      setText(dom.leadToggle, config.form_copy.toggle_open);
      setText(dom.leadSubmit, config.form_copy.submit_default);
      if (dom.sourceField) dom.sourceField.value = source;
      setFieldCopy('name', config.fields.name_label, config.fields.name_placeholder);
      setFieldCopy('phone', config.fields.phone_label, config.fields.phone_placeholder);
      setFieldCopy('email', config.fields.email_label, config.fields.email_placeholder);
      setFieldCopy('company', config.fields.company_label, config.fields.company_placeholder);
      setFieldCopy('employee_count', config.fields.employee_count_label, config.fields.employee_count_placeholder);
    }

    function setText(node, value){ if (node) node.textContent = value || ''; }
    function setFieldCopy(name, label, placeholder){
      var field = dom.leadForm && dom.leadForm.querySelector('[name="' + name + '"]');
      if (!field) return;
      var row = field.closest('.frow'); var labelNode = row && row.querySelector('label');
      if (labelNode) labelNode.textContent = label || '';
      field.placeholder = placeholder || '';
    }

    function attachEvents(){
      if (dom.btnNext) dom.btnNext.addEventListener('click', nextQuestion);
      if (dom.btnBack) dom.btnBack.addEventListener('click', previousQuestion);
      if (dom.leadToggle) dom.leadToggle.addEventListener('click', toggleLeadForm);
      if (dom.restartBtn) dom.restartBtn.addEventListener('click', restartQuiz);
      if (dom.waBtn) dom.waBtn.addEventListener('click', function(){ emit('diagnosis_whatsapp_clicked', { method: 'whatsapp' }); });
      if (dom.phoneBtn) dom.phoneBtn.addEventListener('click', function(){ emit('diagnosis_phone_clicked', { method: 'phone' }); });
      if (dom.leadForm) dom.leadForm.addEventListener('submit', submitLeadForm);
    }

    function hydrate(){
      if (state.currentQ >= config.questions.length) { showResult(false); return; }
      renderQuestion();
    }

    function renderQuestion(){
      var q = getQuestion(state.currentQ);
      if (!q) return;
      setText(dom.qNum, 'שאלה ' + (state.currentQ + 1));
      setText(dom.qText, q.text);
      setText(dom.progressText, 'שאלה ' + (state.currentQ + 1) + ' מתוך ' + config.questions.length);
      var pct = Math.round((state.currentQ / config.questions.length) * 100);
      dom.progressBar.style.width = pct + '%'; setText(dom.progressPct, pct + '%');
      dom.qOptions.innerHTML = '';
      var existing = state.answerDetails[state.currentQ];
      q.opts.forEach(function(option, index){
        var opt = document.createElement('button');
        opt.type = 'button'; opt.className = 'quiz-opt'; opt.setAttribute('aria-pressed', existing && existing.optionIndex === index ? 'true' : 'false');
        opt.innerHTML = '<span class="quiz-opt-dot" aria-hidden="true"></span><span class="quiz-opt-text"></span>';
        opt.querySelector('.quiz-opt-text').textContent = option.label;
        if (existing && existing.optionIndex === index) opt.classList.add('selected');
        opt.addEventListener('click', function(){ selectAnswer(q, option, index, opt); });
        dom.qOptions.appendChild(opt);
      });
      dom.btnNext.classList.toggle('active', !!existing);
      dom.btnNext.disabled = !existing;
      if (dom.btnBack) { dom.btnBack.hidden = state.currentQ === 0; dom.btnBack.disabled = state.currentQ === 0; }
    }

    function getQuestion(index){
      var q = config.questions[index];
      if (index === 0 && config.first_question_by_source && config.first_question_by_source[source]) {
        return Object.assign({}, q, config.first_question_by_source[source]);
      }
      return q;
    }

    function selectAnswer(question, option, optionIndex, clickedNode){
      if (!state.started) { state.started = true; state.startedAt = new Date().toISOString(); emit('diagnosis_started'); }
      Array.prototype.forEach.call(dom.qOptions.querySelectorAll('.quiz-opt'), function(node){ node.classList.remove('selected'); node.setAttribute('aria-pressed', 'false'); });
      clickedNode.classList.add('selected'); clickedNode.setAttribute('aria-pressed', 'true');
      state.answerDetails[state.currentQ] = {
        number: state.currentQ + 1, question: question.text, answer: option.label, optionIndex: optionIndex,
        score: Number(option.score || 0), dimensions: option.dimensions || question.dimensions || []
      };
      persistState(); dom.btnNext.classList.add('active'); dom.btnNext.disabled = false;
      emit('diagnosis_question_answered', { question_number: state.currentQ + 1, answer_score: option.score, answer_label: option.label });
      if (state.currentQ === 3) emit('diagnosis_midpoint', { question_number: 4 });
    }

    function nextQuestion(){
      if (!state.answerDetails[state.currentQ]) return;
      state.currentQ += 1; persistState();
      if (state.currentQ < config.questions.length) renderQuestion(); else showResult(true);
    }

    function previousQuestion(){
      if (state.currentQ < 1) return;
      state.currentQ -= 1; persistState(); renderQuestion();
    }

    function restartQuiz(){
      resetState();
      dom.progressWrap.style.display = ''; dom.questionWrap.style.display = ''; dom.resultWrap.classList.remove('show');
      if (dom.leadForm) { dom.leadForm.reset(); dom.leadForm.hidden = true; }
      if (dom.leadMsg) dom.leadMsg.hidden = true;
      setText(dom.leadToggle, config.form_copy.toggle_open);
      if (dom.leadSubmit) { dom.leadSubmit.disabled = false; setText(dom.leadSubmit, config.form_copy.submit_default); }
      renderQuestion();
    }

    function showResult(trackCompletion){
      var result = calculateResult(); var copy = config.results[result.type];
      dom.progressBar.style.width = '100%'; setText(dom.progressPct, '100%'); dom.progressWrap.style.display = 'none'; dom.questionWrap.style.display = 'none';
      dom.resultHeader.className = 'result-header category-result';
      setText(dom.resultBadge, 'תוצאת האבחון'); setText(dom.resultTitle, copy.title); setText(dom.resultSub, copy.text); setText(dom.resultRecommendation, copy.recommendation);
      setText(dom.resultAreasTitle, 'מה כדאי לבדוק קודם');
      dom.areaCards.innerHTML = buildAreaCards(result.ranked, result.type);
      var areasSection = dom.areaCards && dom.areaCards.closest('.result-areas');
      if (areasSection) areasSection.hidden = !result.ranked.length;
      if (!state.completedAt) state.completedAt = new Date().toISOString();
      var totalScore = state.answerDetails.filter(Boolean).reduce(function(total, answer){ return total + Number(answer.score || 0); }, 0);
      var maxScore = config.questions.reduce(function(total, question){
        return total + Math.max.apply(null, question.opts.map(function(option){ return Number(option.score || 0); }));
      }, 0);
      var scorePercent = maxScore ? Math.round((totalScore / maxScore) * 100) : 0;
      state.latestTrackingData = {
        result_type: result.type, result_level: result.type, result_title: copy.title, result_badge: copy.title,
        score_total: totalScore, score_max: maxScore, score_percent: scorePercent,
        category_scores: JSON.stringify(result.scores), top_areas: result.ranked.map(function(item){ return item.meta.title; }).join(', '),
        worst_dimension: result.type, started_at: state.startedAt, completed_at: state.completedAt
      };
      state.latestSummary = buildSummary(result, copy); persistState();
      if (dom.quizSummaryField) dom.quizSummaryField.value = state.latestSummary;
      updateWhatsappLink(result, copy); dom.resultWrap.classList.add('show');
      if (trackCompletion && !state.completeTracked) { state.completeTracked = true; persistState(); emit('diagnosis_completed'); }
      if (!state.resultViewedTracked) { state.resultViewedTracked = true; persistState(); emit('diagnosis_result_viewed'); }
      window.scrollTo({ top: Math.max(dom.resultWrap.getBoundingClientRect().top + window.pageYOffset - 80, 0), behavior: 'auto' });
    }

    function calculateResult(){
      if (config.result_mode === 'level') return calculateLevelResult();
      var scores = {}; Object.keys(config.categories).forEach(function(key){ scores[key] = 0; });
      state.answerDetails.filter(Boolean).forEach(function(answer){
        (answer.dimensions || []).forEach(function(key){ if (Object.prototype.hasOwnProperty.call(scores, key)) scores[key] += Number(answer.score || 0); });
      });
      var order = config.category_priority || Object.keys(config.categories);
      var ranked = Object.keys(config.categories).map(function(key){ return { key: key, score: scores[key], meta: config.categories[key] }; })
        .sort(function(a,b){ return b.score - a.score || order.indexOf(a.key) - order.indexOf(b.key); });
      var primary = ranked[0];
      var secondaryOrder = (config.secondary_emphasis && config.secondary_emphasis[source]) || order;
      var secondary = ranked.slice(1).sort(function(a,b){ return b.score - a.score || secondaryOrder.indexOf(a.key) - secondaryOrder.indexOf(b.key); });
      return { type: primary.key, scores: scores, ranked: [primary].concat(secondary).slice(0, 3) };
    }

    function calculateLevelResult(){
      var total = state.answerDetails.filter(Boolean).reduce(function(sum, answer){ return sum + Number(answer.score || 0); }, 0);
      var max = config.questions.reduce(function(sum, question){
        return sum + Math.max.apply(null, question.opts.map(function(option){ return Number(option.score || 0); }));
      }, 0);
      var ratio = max ? total / max : 0;
      var thresholds = config.level_thresholds || { high: 0.67, medium: 0.34 };
      var type = ratio >= thresholds.high ? 'high' : ratio >= thresholds.medium ? 'medium' : 'low';
      return { type: type, scores: { total: total, max: max, percent: Math.round(ratio * 100) }, ranked: [] };
    }

    function buildAreaCards(areas, primary){
      return areas.map(function(area){
        var suffix = area.key === primary ? ' area-card-primary' : '';
        return '<div class="area-card' + suffix + '"><div class="area-icon">' + escapeHtml(area.meta.icon) + '</div><div class="area-title">' + escapeHtml(area.meta.title) + '</div><div class="area-desc">' + escapeHtml(area.key === primary ? area.meta.priority_desc : area.meta.desc) + '</div></div>';
      }).join('');
    }

    function buildSummary(result, copy){
      var lines = [
        'מקור אבחון: ' + source, 'מזהה מילוי: ' + state.attemptId, 'עמוד: ' + window.location.pathname,
        'תוצאה מרכזית: ' + result.type, 'כותרת תוצאה: ' + copy.title,
        'ציוני קטגוריות: ' + JSON.stringify(result.scores), 'התחלה: ' + state.startedAt, 'השלמה: ' + state.completedAt, ''
      ];
      state.answerDetails.filter(Boolean).forEach(function(item){ lines.push(item.number + '. ' + item.question); lines.push('תשובה: ' + item.answer + ' | ציון: ' + item.score); });
      return lines.join('\n');
    }

    function updateWhatsappLink(result, copy){
      if (!dom.waBtn) return;
      var message = ['שלום GoFlow,', 'השלמתי אבחון ' + source + '.', 'התוצאה: ' + copy.title, 'מזהה מילוי: ' + state.attemptId, '', 'אשמח לשיחת בדיקה.'].join('\n');
      dom.waBtn.href = 'https://wa.me/' + config.whatsapp_phone + '?text=' + encodeURIComponent(message);
    }

    function toggleLeadForm(){
      if (!dom.leadForm) return;
      dom.leadForm.hidden = !dom.leadForm.hidden;
      setText(dom.leadToggle, dom.leadForm.hidden ? config.form_copy.toggle_open : config.form_copy.toggle_close);
      if (!dom.leadForm.hidden) { emit('diagnosis_form_opened'); var first = dom.leadForm.querySelector('[name="name"]'); if (first) first.focus({ preventScroll: true }); }
    }

    function submitLeadForm(event){
      event.preventDefault();
      if (state.leadSubmitted || dom.leadSubmit.disabled) return;
      dom.leadSubmit.disabled = true; setText(dom.leadSubmit, config.form_copy.submit_loading); if (dom.leadMsg) dom.leadMsg.hidden = true;
      var data = new FormData(dom.leadForm);
      ['name','phone','company','email','employee_count'].forEach(function(key){ if (!data.has(key)) data.append(key, ''); });
      appendData(data, 'diagnosis_source', source); appendData(data, 'page_slug', getPageSlug()); appendData(data, 'page_url', window.location.href);
      appendData(data, 'page_path', window.location.pathname); appendData(data, 'page_hash', window.location.hash || '');
      appendData(data, 'source', 'campaign_diagnosis'); appendData(data, 'challenge', state.latestTrackingData.result_title || '');
      appendData(data, 'quiz_id', config.quiz_id); appendData(data, 'quiz_attempt_id', state.attemptId); appendData(data, 'result_type', state.latestTrackingData.result_type || '');
      appendData(data, 'result_level', state.latestTrackingData.result_level || ''); appendData(data, 'result_badge', state.latestTrackingData.result_badge || '');
      appendData(data, 'score_total', state.latestTrackingData.score_total || ''); appendData(data, 'score_max', state.latestTrackingData.score_max || ''); appendData(data, 'score_percent', state.latestTrackingData.score_percent || '');
      appendData(data, 'top_areas', state.latestTrackingData.top_areas || ''); appendData(data, 'worst_dimension', state.latestTrackingData.worst_dimension || '');
      appendData(data, 'category_scores', state.latestTrackingData.category_scores || ''); appendData(data, 'quiz_summary', state.latestSummary || ''); appendData(data, 'message', state.latestSummary || '');
      appendData(data, 'started_at', state.startedAt || ''); appendData(data, 'completed_at', state.completedAt || ''); appendData(data, 'submitted_at', new Date().toISOString());
      Object.keys(getRouteTrackingParams()).forEach(function(key){ appendData(data, key, getRouteTrackingParams()[key]); });
      fetch(config.formspree_endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } }).then(function(response){
        if (!response.ok) throw new Error('FORM_SUBMIT_FAILED');
        sendLeadToSheet(data); state.leadSubmitted = true; clearState();
        showLeadSuccess();
        var leadEventData = { submitted_at: new Date().toISOString() };
        emit('diagnosis_lead_submitted', leadEventData, { skipAnalytics: true });
        fireSuccessfulLeadConversions(leadEventData);
      }).catch(function(){
        dom.leadSubmit.disabled = false; setText(dom.leadSubmit, config.form_copy.submit_default); dom.leadMsg.hidden = false; dom.leadMsg.textContent = config.form_copy.error_message;
      });
    }

    function showLeadSuccess(){
      if (!dom.leadForm) return;
      if (dom.leadToggle) dom.leadToggle.hidden = true;
      dom.leadForm.hidden = false;
      dom.leadForm.innerHTML = '<section class="lead-success" role="status"><h3>הפרטים התקבלו</h3><p>תודה. קיבלנו את הפרטים ואת תוצאת האבחון ונחזור אליכם בהקדם.</p></section>';
    }

    function appendData(data, key, value){ data.set(key, value == null ? '' : String(value)); }
    function sendLeadToSheet(formData){
      if (!config.sheet_webhook_url) return;
      var iframeName = 'goflowDiagnosisSheetFrame'; var iframe = document.querySelector('iframe[name="' + iframeName + '"]');
      if (!iframe) { iframe = document.createElement('iframe'); iframe.name = iframeName; iframe.hidden = true; document.body.appendChild(iframe); }
      var form = document.createElement('form'); form.method = 'POST'; form.action = config.sheet_webhook_url; form.target = iframeName; form.hidden = true;
      formData.forEach(function(value, key){ var input = document.createElement('input'); input.type = 'hidden'; input.name = key; input.value = value; form.appendChild(input); });
      document.body.appendChild(form); form.submit(); setTimeout(function(){ form.remove(); }, 8000);
    }

    function getDiagnosisSource(config){
      var query = new URLSearchParams(window.location.search).get('diagnosis_source');
      var allowed = ['automation','crm','operations','general'];
      return allowed.indexOf(query) !== -1 ? query : (config.diagnosis_source || 'general');
    }

    function getRouteTrackingParams(){
      var search = new URLSearchParams(window.location.search), params = { diagnosis_source: source };
      ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','src','group','post_id','ref'].forEach(function(key){
        var stored = ''; try { stored = sessionStorage.getItem('goflow_' + key) || ''; } catch(e) {}
        var value = search.get(key) || stored || '';
        if (value) { params[key] = value; try { sessionStorage.setItem('goflow_' + key, value); } catch(e) {} }
      });
      return params;
    }

    function getPageSlug(){ return window.location.pathname.replace(/^\/+|\/+$/g, '') || 'diagnosis'; }
    function getTrackingData(extra){
      return Object.assign({ diagnosis_source: source, page_slug: getPageSlug(), page_path: window.location.pathname, quiz_id: config.quiz_id, quiz_attempt_id: state.attemptId }, getRouteTrackingParams(), state.latestTrackingData || {}, extra || {});
    }
    function fireSuccessfulLeadConversions(extra){
      var conversionKey = 'goflow_diagnosis_conversion_' + state.attemptId;
      try { if (sessionStorage.getItem(conversionKey) === 'sent') return; } catch(e) {}
      if (typeof window.gtag !== 'function') return;
      var consent = typeof window.getConsentPreferences === 'function' ? window.getConsentPreferences() : { analytics: true, marketing: true };
      if (!consent.analytics && !consent.marketing) return;
      var payload = getTrackingData(extra);
      if (consent.analytics) window.gtag('event', 'diagnosis_lead_submitted', payload);
      if (consent.marketing) window.gtag('event', 'conversion', {
          send_to: 'AW-18240730464/-j_nCO_92cMcEODq7flD',
          value: 1.0,
          currency: 'ILS'
        });
      try { sessionStorage.setItem(conversionKey, 'sent'); } catch(e) {}
    }

    function emit(eventName, extra, options){
      var payload = getTrackingData(extra); if (!(options && options.skipAnalytics) && typeof window.trackEvent === 'function') window.trackEvent(eventName, payload);
      window.dataLayer = window.dataLayer || []; window.dataLayer.push(Object.assign({ event: eventName }, payload));
      if (new URLSearchParams(window.location.search).get('diagnosis_debug') === '1') {
        var root = document.documentElement;
        var events = (root.getAttribute('data-diagnosis-events') || '').split(',').filter(Boolean);
        events.push(eventName);
        root.setAttribute('data-diagnosis-events', events.join(','));
        root.setAttribute('data-diagnosis-last-event', eventName);
      }
    }
    function escapeHtml(value){ return String(value || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
  }

  document.addEventListener('DOMContentLoaded', initQuizEngine);
})();
