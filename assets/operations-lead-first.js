(function(){
  'use strict';

  var root = document.getElementById('campaign-landing');
  var quizConfig = window.QUIZ_CONFIG || {};
  var campaignConfig = window.CAMPAIGN_DIAGNOSIS || {};
  if (!root || !quizConfig.landing || !campaignConfig.formspree_endpoint) return;

  var hero = root.querySelector('.landing-hero');
  var heroInner = root.querySelector('.landing-hero-inner');
  var copy = root.querySelector('.landing-copy');
  var quizShell = root.querySelector('.landing-quiz-shell');
  if (!hero || !heroInner || !copy || !quizShell) return;

  var leadSheetWebhook = 'https://script.google.com/macros/s/AKfycbxYVmacixUKR071kabelmPep55790mmTFszMijZ9heSR9UFvdaqqvxhCv162q59zY6h/exec';
  var phoneDisplay = '054-795-1161';
  var whatsappText = 'שלום GoFlow, הגעתי מאבחון התפעול ואשמח לשיחת בדיקה קצרה.';

  document.body.classList.add('operations-lead-first');
  document.title = 'GoFlow | אבחון תפעולי ושיחת בדיקה';

  var badge = root.querySelector('.landing-badge');
  if (badge) badge.textContent = 'תפעול ותהליכים';

  copy.innerHTML = [
    '<div class="eyebrow">שיחת בדיקה קצרה לעסק או לארגון</div>',
    '<h1>העבודה מתקדמת, אבל כל משימה דורשת תזכורת, מעקב והתערבות של מנהל?</h1>',
    '<div class="rule"></div>',
    '<p>בשיחת בדיקה קצרה נזהה היכן משימות, פניות ועדכונים נתקעים, מי אחראי בכל שלב, ומה צריך להסדיר כדי שהעבודה תזרום בלי לרדוף אחרי אנשים.</p>',
    '<div class="operations-trust"><strong>אבי עמר | ייעוץ תהליכי, תפעול ואוטומציה</strong><br>לפני שמוסיפים עוד כלי או עוד עובד — מסדרים את דרך העבודה.</div>'
  ].join('');

  var actions = document.createElement('section');
  actions.className = 'operations-actions';
  actions.id = 'operations-contact';
  actions.innerHTML = [
    '<h2>לבדיקת מצב התפעול אצלכם</h2>',
    '<p>השאירו שם וטלפון ונחזור לשיחת בדיקה קצרה של 15–20 דקות, ללא עלות וללא התחייבות.</p>',
    '<form id="operations-top-lead-form">',
      '<div class="operations-lead-grid">',
        '<div><label for="operations-top-name">שם</label><input id="operations-top-name" name="name" type="text" autocomplete="name" required></div>',
        '<div><label for="operations-top-phone">טלפון</label><input id="operations-top-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" dir="ltr" required></div>',
      '</div>',
      '<button class="operations-lead-submit" type="submit">לקבלת שיחת בדיקה קצרה</button>',
      '<p class="operations-lead-meta">בשליחת הפרטים אני מאשר/ת ל־GoFlow ליצור איתי קשר בנוגע לפנייה.</p>',
      '<p id="operations-lead-status" class="operations-lead-status" hidden></p>',
    '</form>',
    '<div class="operations-contact-sep">או צרו קשר עכשיו</div>',
    '<div class="operations-contact-buttons">',
      '<a class="operations-phone" id="operations-phone-link" href="tel:0547951161" data-measured-link="operations_top_phone" data-measured-path="/operations-diagnosis/#top-phone">להתקשר עכשיו</a>',
      '<a class="operations-whatsapp" id="operations-whatsapp-link" href="https://wa.me/972547951161?text=' + encodeURIComponent(whatsappText) + '" target="_blank" rel="noopener" data-measured-link="operations_top_whatsapp" data-measured-path="/operations-diagnosis/#top-whatsapp">שליחת הודעה ב־WhatsApp</a>',
    '</div>',
    '<a class="operations-quiz-link" href="#quiz-root" data-measured-link="operations_start_quiz" data-measured-path="/operations-diagnosis/#start-quiz">מעדיפים לבדוק לבד קודם? התחילו אבחון תפעולי קצר של 8 שאלות</a>'
  ].join('');
  heroInner.appendChild(actions);

  var quizSection = document.createElement('section');
  quizSection.className = 'operations-quiz-section';
  quizSection.innerHTML = [
    '<div class="operations-quiz-inner">',
      '<div class="operations-quiz-intro">',
        '<div class="eyebrow">אבחון עצמי קצר</div>',
        '<h2>איפה העבודה נתקעת?</h2>',
        '<p>8 שאלות קצרות, כ־60 שניות, ותוצאה מיידית.</p>',
      '</div>',
    '</div>'
  ].join('');
  quizSection.querySelector('.operations-quiz-inner').appendChild(quizShell);
  hero.insertAdjacentElement('afterend', quizSection);

  var footer = root.querySelector('.landing-disclaimer');
  if (footer) footer.textContent = 'האבחון נועד לספק כיוון ראשוני ואינו מחליף אפיון מקצועי של תהליך העבודה.';

  function tracking(){
    var params = typeof window.getTrackingParams === 'function' ? window.getTrackingParams() : {};
    params.diagnosis_source = 'operations';
    params.landing_variant = 'lead_first';
    params.page_slug = 'operations-diagnosis';
    return params;
  }

  function emit(name, extra){
    var payload = Object.assign({}, tracking(), extra || {});
    if (typeof window.trackEvent === 'function') window.trackEvent(name, payload);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: name }, payload));
  }

  function addAll(data, object){
    Object.keys(object || {}).forEach(function(key){
      data.set(key, object[key] == null ? '' : String(object[key]));
    });
  }

  function sendToSheet(data){
    try {
      var frameName = 'goflowOperationsLeadSheetFrame';
      var frame = document.querySelector('iframe[name="' + frameName + '"]');
      if (!frame) {
        frame = document.createElement('iframe');
        frame.name = frameName;
        frame.hidden = true;
        document.body.appendChild(frame);
      }
      var relay = document.createElement('form');
      relay.method = 'POST';
      relay.action = leadSheetWebhook;
      relay.target = frameName;
      relay.hidden = true;
      data.forEach(function(value, key){
        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        relay.appendChild(input);
      });
      document.body.appendChild(relay);
      relay.submit();
      setTimeout(function(){ relay.remove(); }, 8000);
    } catch (error) {}
  }

  var form = document.getElementById('operations-top-lead-form');
  var status = document.getElementById('operations-lead-status');
  var started = false;

  if (form) {
    form.addEventListener('focusin', function(){
      if (started) return;
      started = true;
      emit('operations_top_form_started');
    });

    form.addEventListener('submit', function(event){
      event.preventDefault();
      var button = form.querySelector('button[type="submit"]');
      if (!button || button.disabled) return;

      button.disabled = true;
      button.textContent = 'שולחים…';
      status.hidden = true;
      status.classList.remove('is-error');

      var data = new FormData(form);
      var submissionId = 'ops_lead_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
      var submittedAt = new Date().toISOString();
      var summary = [
        'פנייה בנושא: תפעול ותהליכי עבודה',
        'שם: ' + String(data.get('name') || ''),
        'טלפון: ' + String(data.get('phone') || ''),
        'בקשה: שיחת בדיקה קצרה לזיהוי עיכובים, אחריות לא ברורה וחוסר מעקב'
      ].join('\n');

      addAll(data, tracking());
      data.set('_subject', 'פנייה חדשה מהאתר — תפעול ותהליכי עבודה');
      data.set('message', summary);
      data.set('quiz_summary', summary);
      data.set('service', 'ייעוץ תפעולי ותהליכי עבודה');
      data.set('lead_type', 'quick_contact');
      data.set('source', 'campaign_operations_lead_first');
      data.set('form_source', 'campaign_operations_lead_first');
      data.set('diagnosis_source', 'operations');
      data.set('landing_variant', 'lead_first');
      data.set('landing_id', 'operations-diagnosis');
      data.set('landing_name', 'אבחון תפעולי — טופס ראשון');
      data.set('page_path', window.location.pathname);
      data.set('page_url', window.location.href);
      data.set('source_page', window.location.pathname);
      data.set('submitted_at', submittedAt);
      data.set('schema_version', 'goflow_lead_v1');
      data.set('challenge', 'בקשה לשיחת בדיקה בנושא תפעול ותהליכי עבודה');
      data.set('submission_id', submissionId);
      data.set('quiz_attempt_id', submissionId);
      data.set('lead_status', 'complete');
      data.set('interaction_type', 'form_submit');

      fetch(campaignConfig.formspree_endpoint, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      }).then(function(response){
        if (!response.ok) throw new Error('form_submit_failed');
        sendToSheet(data);
        emit('operations_top_form_submitted', { quiz_attempt_id: submissionId });
        form.innerHTML = '<section class="operations-lead-success" role="status"><h3>הפרטים התקבלו</h3><p>תודה. נחזור אליכם בהקדם לשיחת בדיקה קצרה.</p></section>';
      }).catch(function(){
        button.disabled = false;
        button.textContent = 'לקבלת שיחת בדיקה קצרה';
        status.hidden = false;
        status.classList.add('is-error');
        status.textContent = 'השליחה לא הושלמה. אפשר לנסות שוב או ליצור קשר בטלפון או ב־WhatsApp.';
      });
    });

    emit('operations_top_form_view');
  }

  var phoneLink = document.getElementById('operations-phone-link');
  if (phoneLink) phoneLink.addEventListener('click', function(){ emit('operations_top_phone_clicked', { phone: phoneDisplay }); });

  var whatsappLink = document.getElementById('operations-whatsapp-link');
  if (whatsappLink) whatsappLink.addEventListener('click', function(){ emit('operations_top_whatsapp_clicked'); });

  var quizLink = root.querySelector('.operations-quiz-link');
  if (quizLink) quizLink.addEventListener('click', function(){
    emit('operations_top_quiz_clicked');
    setTimeout(function(){ quizShell.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 0);
  });
})();
