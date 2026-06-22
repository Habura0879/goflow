(function(){
  'use strict';

  function initQuizEngine(){
    var config = window.QUIZ_CONFIG || null;
    var root = document.querySelector('[data-quiz-app]');
    if (!config || !root) return;

    var storageKey = 'goflow_quiz_state_' + config.quiz_id;
    var fieldKeys = ['name', 'phone', 'email', 'company', 'challenge'];
    var state = loadState() || createInitialState();
    var dom = bindDom(root);

    renderStaticCopy();
    attachEvents();
    trackPageView();
    hydrate();

    function createInitialState(){
      return {
        currentQ: 0,
        answerDetails: [],
        started: false,
        attemptId: createAttemptId(),
        latestSummary: '',
        latestTrackingData: {},
        completeTracked: false,
        leadSubmitted: false
      };
    }

    function createAttemptId(){
      return 'qa_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
    }

    function loadState(){
      try {
        var saved = sessionStorage.getItem(storageKey);
        if (!saved) return null;
        var parsed = JSON.parse(saved);
        if (!parsed || typeof parsed !== 'object') return null;
        return Object.assign(createInitialState(), parsed);
      } catch(e) {
        return null;
      }
    }

    function persistState(){
      try {
        sessionStorage.setItem(storageKey, JSON.stringify({
          currentQ: state.currentQ,
          answerDetails: state.answerDetails,
          started: state.started,
          attemptId: state.attemptId,
          latestSummary: state.latestSummary,
          latestTrackingData: state.latestTrackingData,
          completeTracked: state.completeTracked,
          leadSubmitted: state.leadSubmitted
        }));
      } catch(e) {}
    }

    function resetState(){
      state = createInitialState();
      try { sessionStorage.removeItem(storageKey); } catch(e) {}
      persistState();
    }

    function bindDom(scope){
      return {
        introEyebrow: find(scope, 'intro-eyebrow'),
        introTitle: find(scope, 'intro-title'),
        introSubtitle: find(scope, 'intro-subtitle'),
        progressWrap: find(scope, 'progress-wrap'),
        progressText: find(scope, 'progress-text'),
        progressPct: find(scope, 'progress-pct'),
        progressBar: find(scope, 'progress-bar'),
        questionWrap: find(scope, 'question-wrap'),
        qCard: find(scope, 'question-card'),
        qNum: find(scope, 'question-number'),
        qText: find(scope, 'question-text'),
        qOptions: find(scope, 'question-options'),
        btnNext: find(scope, 'next-button'),
        resultWrap: find(scope, 'result-wrap'),
        resultHeader: find(scope, 'result-header'),
        resultBadge: find(scope, 'result-badge'),
        resultTitle: find(scope, 'result-title'),
        resultSub: find(scope, 'result-sub'),
        resultAreasTitle: find(scope, 'result-areas-title'),
        areaCards: find(scope, 'result-area-cards'),
        ctaTitle: find(scope, 'result-cta-title'),
        ctaSub: find(scope, 'result-cta-text'),
        waBtn: find(scope, 'whatsapp-button'),
        leadToggle: find(scope, 'lead-toggle'),
        restartBtn: find(scope, 'restart-button'),
        leadForm: find(scope, 'lead-form'),
        leadFormTitle: find(scope, 'lead-form-title'),
        leadFormSubtitle: find(scope, 'lead-form-subtitle'),
        leadSubmit: find(scope, 'lead-submit'),
        leadMsg: find(scope, 'lead-message'),
        quizSummaryField: find(scope, 'quiz-summary-field'),
        sourceField: find(scope, 'quiz-source-field')
      };
    }

    function find(scope, key){
      return scope.querySelector('[data-quiz="' + key + '"]');
    }

    function renderStaticCopy(){
      if (dom.introEyebrow) dom.introEyebrow.textContent = config.intro_eyebrow || '';
      if (dom.introTitle) dom.introTitle.textContent = config.intro_title || '';
      if (dom.introSubtitle) dom.introSubtitle.textContent = config.intro_subtitle || '';
      if (dom.resultAreasTitle) dom.resultAreasTitle.textContent = config.results_heading || 'האזורים שדורשים תשומת לב';
      if (dom.leadFormTitle) dom.leadFormTitle.textContent = config.form_copy.title;
      if (dom.leadFormSubtitle) dom.leadFormSubtitle.textContent = config.form_copy.subtitle;
      if (dom.leadToggle) dom.leadToggle.textContent = config.form_copy.toggle_open;
      if (dom.leadSubmit) dom.leadSubmit.textContent = config.form_copy.submit_default;
      if (dom.sourceField) dom.sourceField.value = 'quiz_result';
      if (dom.waBtn) {
        var waLabel = dom.waBtn.querySelector('span');
        if (waLabel) waLabel.textContent = config.whatsapp_button_text || 'שלחו לנו את התוצאות';
      }
      hydrateFieldCopy();
    }

    function hydrateFieldCopy(){
      setFieldCopy('name', config.fields.name_label, config.fields.name_placeholder);
      setFieldCopy('phone', config.fields.phone_label, config.fields.phone_placeholder);
      setFieldCopy('email', config.fields.email_label, config.fields.email_placeholder);
      setFieldCopy('company', config.fields.company_label, config.fields.company_placeholder);
      setFieldCopy('challenge', config.fields.challenge_label, config.fields.challenge_placeholder);
    }

    function setFieldCopy(fieldName, labelText, placeholderText){
      var field = dom.leadForm ? dom.leadForm.querySelector('[name="' + fieldName + '"]') : null;
      if (!field) return;
      var row = field.closest('.frow');
      var label = row ? row.querySelector('label') : null;
      if (label) label.textContent = labelText || '';
      field.placeholder = placeholderText || '';
    }

    function attachEvents(){
      if (dom.btnNext) dom.btnNext.addEventListener('click', nextQuestion);
      if (dom.leadToggle) dom.leadToggle.addEventListener('click', toggleLeadForm);
      if (dom.restartBtn) dom.restartBtn.addEventListener('click', restartQuiz);
      if (dom.waBtn) dom.waBtn.addEventListener('click', function(){
        trackEvent('quiz_whatsapp_click', getTrackingData({ method: 'whatsapp' }));
      });
      if (dom.leadForm) dom.leadForm.addEventListener('submit', submitLeadForm);
    }

    function hydrate(){
      if (state.currentQ >= config.questions.length) {
        showResult(false);
        return;
      }
      renderQuestion();
    }

    function renderQuestion(){
      var q = config.questions[state.currentQ];
      if (!q) return;

      dom.qNum.textContent = 'שאלה ' + (state.currentQ + 1);
      dom.qText.textContent = q.text;
      dom.progressText.textContent = 'שאלה ' + (state.currentQ + 1) + ' מתוך ' + config.questions.length;

      var pct = Math.round((state.currentQ / config.questions.length) * 100);
      dom.progressBar.style.width = pct + '%';
      dom.progressPct.textContent = pct + '%';

      dom.qOptions.innerHTML = '';
      var existing = state.answerDetails[state.currentQ];

      q.opts.forEach(function(option, index){
        var opt = document.createElement('div');
        opt.className = 'quiz-opt';
        opt.innerHTML = '<div class="quiz-opt-dot"></div><div class="quiz-opt-text"></div>';
        opt.querySelector('.quiz-opt-text').textContent = option.label;
        if (existing && existing.optionIndex === index) opt.classList.add('selected');
        opt.addEventListener('click', function(){
          if (!state.started) {
            state.started = true;
            trackEvent('quiz_start', getTrackingData());
          }
          selectAnswer(q, option, index, opt);
        });
        dom.qOptions.appendChild(opt);
      });

      dom.btnNext.classList.toggle('active', !!existing);
    }

    function selectAnswer(question, option, optionIndex, clickedNode){
      Array.prototype.forEach.call(dom.qOptions.querySelectorAll('.quiz-opt'), function(node){
        node.classList.remove('selected');
      });
      clickedNode.classList.add('selected');

      state.answerDetails[state.currentQ] = {
        number: state.currentQ + 1,
        question: question.text,
        answer: option.label,
        dimension: question.dimension,
        score: option.score,
        optionIndex: optionIndex
      };

      dom.btnNext.classList.add('active');
      persistState();

      trackEvent('quiz_answer', getTrackingData({
        question_number: state.currentQ + 1,
        question_dimension: question.dimension,
        answer_score: option.score,
        answer_label: option.label
      }));
    }

    function nextQuestion(){
      if (!state.answerDetails[state.currentQ]) return;
      trackEvent('quiz_next', getTrackingData({ question_number: state.currentQ + 1 }));
      state.currentQ += 1;
      persistState();
      if (state.currentQ < config.questions.length) renderQuestion();
      else showResult(true);
    }

    function restartQuiz(){
      trackEvent('quiz_restart', getTrackingData());
      resetState();
      dom.progressWrap.style.display = '';
      dom.questionWrap.style.display = '';
      dom.resultWrap.classList.remove('show');
      if (dom.leadForm) {
        dom.leadForm.reset();
        dom.leadForm.hidden = true;
      }
      if (dom.leadMsg) dom.leadMsg.style.display = 'none';
      if (dom.leadToggle) dom.leadToggle.textContent = config.form_copy.toggle_open;
      if (dom.leadSubmit) {
        dom.leadSubmit.textContent = config.form_copy.submit_default;
        dom.leadSubmit.disabled = false;
        dom.leadSubmit.style.background = '';
      }
      renderQuestion();
    }

    function toggleLeadForm(){
      if (!dom.leadForm) return;
      dom.leadForm.hidden = !dom.leadForm.hidden;
      dom.leadToggle.textContent = dom.leadForm.hidden ? config.form_copy.toggle_open : config.form_copy.toggle_close;
      trackEvent(dom.leadForm.hidden ? 'quiz_lead_form_close' : 'quiz_lead_form_open', getTrackingData());
      if (!dom.leadForm.hidden) {
        if (dom.quizSummaryField && !dom.quizSummaryField.value) dom.quizSummaryField.value = state.latestSummary || '';
        var firstField = dom.leadForm.querySelector('input[name="name"]');
        if (firstField) setTimeout(function(){ firstField.focus({ preventScroll: true }); }, 0);
      }
    }

    function showResult(trackCompletion){
      var resultData = calculateResult();
      var resultCopy = config.result_copy[resultData.level] || config.result_copy.low;
      var areaHeading = config.results_heading || 'האזורים שדורשים תשומת לב';

      dom.progressBar.style.width = '100%';
      dom.progressPct.textContent = '100%';
      dom.progressWrap.style.display = 'none';
      dom.questionWrap.style.display = 'none';

      dom.resultHeader.className = 'result-header ' + resultData.level;
      dom.resultBadge.className = 'result-badge ' + resultData.level;
      dom.resultBadge.textContent = resultCopy.badge || '';
      dom.resultTitle.textContent = resultCopy.title || '';
      dom.resultSub.textContent = resultCopy.sub || '';
      dom.resultAreasTitle.textContent = areaHeading;
      dom.ctaTitle.textContent = resultCopy.cta_title || '';
      dom.ctaSub.textContent = resultCopy.cta_text || '';
      dom.areaCards.innerHTML = buildAreaCards(resultData.areas);

      state.latestTrackingData = {
        result_level: resultData.level,
        result_badge: resultCopy.badge || '',
        score_total: resultData.total,
        score_max: resultData.maxScore,
        score_percent: resultData.percent,
        top_areas: resultData.areaLabels,
        worst_dimension: resultData.worstDimension
      };
      state.latestSummary = buildSummary(resultData, resultCopy);
      if (dom.quizSummaryField) dom.quizSummaryField.value = state.latestSummary;
      persistState();

      updateWhatsappLink(resultData, resultCopy);
      dom.resultWrap.classList.add('show');

      if (trackCompletion && !state.completeTracked) {
        state.completeTracked = true;
        persistState();
        sendQuizSnapshotToSheet('quiz_complete');
        trackEvent('quiz_complete', getTrackingData());
        pushToDataLayer('quiz_complete', {
          quiz_id: config.quiz_id,
          level: resultData.level,
          src: getRouteTrackingParams().src || ''
        });
      }

      var resultTop = dom.resultWrap.getBoundingClientRect().top + window.pageYOffset - (window.innerWidth <= 768 ? 150 : 110);
      window.scrollTo({ top: Math.max(resultTop, 0), behavior: 'auto' });
    }

    function calculateResult(){
      var answerDetails = state.answerDetails.filter(Boolean);
      var total = answerDetails.reduce(function(sum, item){ return sum + Number(item.score || 0); }, 0);
      var maxScore = config.questions.length * 3;
      var pct = maxScore ? (total / maxScore) : 0;
      var level = pct >= config.thresholds.urgent ? 'urgent' : pct >= config.thresholds.medium ? 'medium' : 'low';
      var grouped = {};

      answerDetails.forEach(function(item){
        if (!grouped[item.dimension]) grouped[item.dimension] = { score: 0, count: 0 };
        grouped[item.dimension].score += Number(item.score || 0);
        grouped[item.dimension].count += 1;
      });

      var attentionThreshold = config.attention_thresholds[level] || 1;
      var areas = Object.keys(grouped)
        .filter(function(key){ return config.dims[key]; })
        .map(function(key){
          return {
            key: key,
            score: grouped[key].score,
            count: grouped[key].count,
            average: grouped[key].score / grouped[key].count,
            meta: config.dims[key]
          };
        })
        .sort(function(a, b){ return b.score - a.score || b.average - a.average; });

      var filteredAreas = areas.filter(function(area){ return area.score >= attentionThreshold; }).slice(0, 4);
      if (!filteredAreas.length) filteredAreas = areas.slice(0, 2);

      return {
        level: level,
        total: total,
        maxScore: maxScore,
        percent: Math.round(pct * 100),
        areas: filteredAreas,
        areaLabels: filteredAreas.map(function(area){ return area.meta.title; }).join(', '),
        worstDimension: filteredAreas.length ? filteredAreas[0].key : ''
      };
    }

    function buildAreaCards(areas){
      return areas.map(function(area){
        return '<div class="area-card"><div class="area-icon">' + escapeHtml(area.meta.icon || '') + '</div><div class="area-title">' + escapeHtml(area.meta.title || '') + '</div><div class="area-desc">' + escapeHtml(area.meta.desc || '') + '</div></div>';
      }).join('');
    }

    function buildSummary(resultData, resultCopy){
      var lines = [
        'מקור: שאלון אבחון תפעולי באתר',
        'שאלון: ' + (config.quiz_name || config.quiz_id),
        'מזהה מילוי: ' + state.attemptId,
        'רמת תוצאה: ' + (resultCopy.badge || ''),
        'ניקוד: ' + resultData.total + '/' + resultData.maxScore + ' (' + resultData.percent + '%)',
        'אזורים לשיפור: ' + (resultData.areaLabels || 'לא זוהו אזורים חריגים'),
        ''
      ];
      state.answerDetails.filter(Boolean).forEach(function(item){
        lines.push(item.number + '. ' + item.question);
        lines.push('תשובה: ' + item.answer + ' | ציון: ' + item.score);
      });
      return lines.join('\n');
    }

    function updateWhatsappLink(resultData, resultCopy){
      var message = [
        'שלום GoFlow,',
        'מילאתי את האבחון באתר.',
        'רמה: ' + (resultCopy.badge || ''),
        'אזורים לשיפור: ' + (resultData.areaLabels || ''),
        '',
        'אשמח לשמוע יותר.'
      ].join('\n');
      dom.waBtn.href = 'https://wa.me/' + config.whatsapp_phone + '?text=' + encodeURIComponent(message);
    }

    function submitLeadForm(event){
      event.preventDefault();
      if (state.leadSubmitted || dom.leadSubmit.disabled) return;

      dom.leadSubmit.textContent = config.form_copy.submit_loading;
      dom.leadSubmit.disabled = true;
      dom.leadMsg.style.display = 'none';
      if (dom.quizSummaryField && !dom.quizSummaryField.value) dom.quizSummaryField.value = state.latestSummary || '';

      var data = new FormData(dom.leadForm);
      fieldKeys.forEach(function(key){
        if (!data.has(key)) data.append(key, '');
      });

      sendQuizSnapshotToSheet('quiz_lead', data);
      trackEvent('quiz_lead_form_submit_attempt', getTrackingData({ method: 'quiz_form' }));

      fetch(config.formspree_endpoint, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      }).then(function(response){
        if (!response.ok) throw new Error('FORM_SUBMIT_FAILED');

        state.leadSubmitted = true;
        persistState();
        dom.leadSubmit.textContent = config.form_copy.submit_success;
        dom.leadSubmit.style.background = '#1a5c2a';
        dom.leadMsg.style.display = 'block';
        dom.leadMsg.style.color = 'var(--gold)';
        dom.leadMsg.textContent = config.form_copy.success_message;
        dom.leadForm.reset();
        if (dom.quizSummaryField) dom.quizSummaryField.value = state.latestSummary || '';
        trackEvent('quiz_lead_form_submit_success', getTrackingData({ method: 'quiz_form' }));
        trackEvent('generate_lead', getTrackingData({ method: 'quiz_form' }));
        pushToDataLayer('quiz_lead_submit', {
          quiz_id: config.quiz_id,
          level: state.latestTrackingData.result_level || '',
          src: getRouteTrackingParams().src || ''
        });
      }).catch(function(error){
        dom.leadSubmit.textContent = config.form_copy.submit_default;
        dom.leadSubmit.disabled = false;
        dom.leadMsg.style.display = 'block';
        dom.leadMsg.style.color = '#b43c1e';
        dom.leadMsg.textContent = error && error.message === 'FORM_SUBMIT_FAILED'
          ? config.form_copy.error_message
          : config.form_copy.network_error_message;
        trackEvent('quiz_lead_form_submit_error', getTrackingData({ method: 'quiz_form' }));
      });
    }

    function sendQuizLeadToSheet(formData){
      if (!config.sheet_webhook_url) return;
      var iframeName = config.quiz_id + 'SheetSubmitFrame';
      var iframe = document.querySelector('iframe[name="' + iframeName + '"]');
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.name = iframeName;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
      }

      var form = document.createElement('form');
      form.method = 'POST';
      form.action = config.sheet_webhook_url;
      form.target = iframeName;
      form.style.display = 'none';

      formData.forEach(function(value, key){
        appendField(form, key, value);
      });
      appendField(form, 'submitted_at', new Date().toISOString());

      document.body.appendChild(form);
      form.submit();
      setTimeout(function(){
        if (form.parentNode) form.parentNode.removeChild(form);
      }, 8000);
    }

    function sendQuizSnapshotToSheet(snapshotType, formData){
      var data = formData || new FormData();
      setFormValue(data, 'source', snapshotType);
      setFormValue(data, 'quiz_id', config.quiz_id);
      setFormValue(data, 'quiz_name', config.quiz_name || config.quiz_id);
      setFormValue(data, 'quiz_attempt_id', state.attemptId);
      setFormValue(data, 'quiz_summary', state.latestSummary || '');
      setFormValue(data, 'message', state.latestSummary || 'השאלון הושלם ללא סיכום זמין.');

      var tracking = getTrackingData();
      Object.keys(tracking).forEach(function(key){
        setFormValue(data, key, tracking[key]);
      });
      sendQuizLeadToSheet(data);
    }

    function setFormValue(formData, key, value){
      if (typeof formData.set === 'function') formData.set(key, value == null ? '' : String(value));
      else formData.append(key, value == null ? '' : String(value));
    }

    function appendField(form, key, value){
      var input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value == null ? '' : String(value);
      form.appendChild(input);
    }

    function getRouteTrackingParams(){
      var search = new URLSearchParams(window.location.search);
      var params = {};
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'src', 'group', 'post_id', 'ref'].forEach(function(key){
        var stored = '';
        try { stored = sessionStorage.getItem('goflow_' + key) || ''; } catch(e) {}
        var value = search.get(key) || stored || '';
        if (value) {
          params[key] = value;
          try { sessionStorage.setItem('goflow_' + key, value); } catch(e) {}
        }
      });
      return params;
    }

    function getTrackingData(extra){
      return Object.assign({
        quiz_id: config.quiz_id,
        quiz_name: config.quiz_name || config.quiz_id,
        quiz_question_count: config.questions.length,
        quiz_attempt_id: state.attemptId
      }, getRouteTrackingParams(), state.latestTrackingData || {}, extra || {});
    }

    function trackPageView(){
      trackEvent('quiz_view', getTrackingData());
      pushToDataLayer('quiz_view', {
        quiz_id: config.quiz_id,
        src: getRouteTrackingParams().src || ''
      });
    }

    function trackEvent(name, params){
      if (typeof window.trackEvent === 'function') window.trackEvent(name, params);
    }

    function pushToDataLayer(eventName, data){
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({ event: eventName }, data || {}));
    }

    function escapeHtml(value){
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
  }

  document.addEventListener('DOMContentLoaded', initQuizEngine);
})();
