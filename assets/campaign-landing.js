(function(){
  'use strict';
  var config = window.QUIZ_CONFIG;
  var root = document.getElementById('campaign-landing');
  if (!config || !config.landing || !root) return;
  var landing = config.landing;
  document.title = 'GoFlow | ' + landing.label;
  root.innerHTML = [
    '<header class="landing-header">',
      '<div class="landing-header-inner">',
        '<div class="landing-logo" role="img" aria-label="GoFlow">',
          '<img src="/GoFlow_full_logo_white_transparent_1200px.png" alt="GoFlow" width="1200" height="292">',
        '</div>',
        '<div class="landing-badge">', escapeHtml(landing.label), '</div>',
      '</div>',
    '</header>',
    '<main class="landing-hero">',
      '<div class="landing-hero-inner">',
        '<section class="landing-copy" aria-labelledby="landing-title">',
          '<div class="eyebrow">אבחון תפעולי קצר</div>',
          '<h1 id="landing-title">', landing.title, '</h1>',
          '<div class="rule"></div>',
          '<p>', escapeHtml(landing.description), '</p>',
          '<button class="landing-hero-cta" type="button" data-landing-start> ', escapeHtml(landing.cta), ' </button>',
          '<div class="landing-meta"><span>8 שאלות</span><span>כ־60 שניות</span><span>תוצאה מיידית</span><span>ללא עלות</span></div>',
          '<p class="landing-note">בלי התחייבות. בסיום תדעו מהו האתגר המרכזי ומה כדאי לבדוק קודם.</p>',
        '</section>',
        '<section class="landing-quiz-shell" id="quiz-root" data-quiz-app aria-label="אבחון תפעולי">',
          '<div class="quiz-intro"><div class="eyebrow" data-quiz="intro-eyebrow"></div><h2 data-quiz="intro-title"></h2><div class="rule"></div><p class="lead" data-quiz="intro-subtitle"></p></div>',
          '<div class="quiz-progress-wrap" data-quiz="progress-wrap" aria-label="התקדמות באבחון"><div class="quiz-progress-label"><span data-quiz="progress-text"></span><span data-quiz="progress-pct"></span></div><div class="quiz-bar-bg"><div class="quiz-bar-fill" data-quiz="progress-bar" style="width:0%"></div></div></div>',
          '<div data-quiz="question-wrap"><div class="quiz-card" data-quiz="question-card"><div class="quiz-q-num" data-quiz="question-number"></div><div class="quiz-q-text" data-quiz="question-text"></div><div class="quiz-options" data-quiz="question-options"></div><div class="quiz-nav"><button class="btn-restart quiz-btn-back" data-quiz="back-button" type="button">חזרה</button><button class="quiz-btn-next" data-quiz="next-button" type="button" disabled>המשך</button></div></div></div>',
          '<div class="quiz-result" data-quiz="result-wrap" aria-live="polite"><div class="result-header" data-quiz="result-header"><div class="result-badge" data-quiz="result-badge"></div><div class="result-title" data-quiz="result-title"></div><div class="result-sub" data-quiz="result-sub"></div><p class="result-recommendation" data-quiz="result-recommendation"></p></div><div class="result-areas"><h3 data-quiz="result-areas-title"></h3><div class="area-cards" data-quiz="result-area-cards"></div></div><div class="result-cta"><div class="result-cta-text"><h3 data-quiz="result-cta-title">רוצים שנעבור יחד על התוצאה?</h3><p data-quiz="result-cta-text">בשיחת בדיקה קצרה נבין מה נכון לתקן קודם.</p></div><div class="result-cta-btns"><button class="btn-quiz-form" data-quiz="lead-toggle" type="button"></button><a class="btn-wa" data-quiz="whatsapp-button" target="_blank" rel="noopener"><span>שליחת התוצאה בוואטסאפ</span></a><a class="btn-phone" data-quiz="phone-button" href="tel:0547951161"><span>דברו איתנו</span></a><button class="btn-restart" data-quiz="restart-button" type="button">התחלה מחדש</button></div><form class="quiz-lead-form" data-quiz="lead-form" hidden><h3 data-quiz="lead-form-title"></h3><p data-quiz="lead-form-subtitle"></p><div class="quiz-lead-grid"><div class="frow"><label>שם מלא</label><input type="text" name="name" autocomplete="name" required></div><div class="frow"><label>טלפון</label><input type="tel" name="phone" autocomplete="tel" inputmode="tel" dir="ltr" required></div><div class="frow"><label>שם העסק</label><input type="text" name="company" autocomplete="organization" required></div><div class="frow"><label>דואר אלקטרוני</label><input type="email" name="email" autocomplete="email" dir="ltr"></div><div class="frow"><label>מספר עובדים</label><input type="number" name="employee_count" inputmode="numeric" min="1"></div></div><input type="hidden" name="quiz_summary" data-quiz="quiz-summary-field"><input type="hidden" name="diagnosis_source" data-quiz="quiz-source-field"><p class="form-consent">בשליחת הפרטים אני מאשר/ת ל־GoFlow ליצור איתי קשר בנוגע לתוצאה. <a href="/privacy/" target="_blank" rel="noopener">למדיניות הפרטיות</a></p><button type="submit" class="btn-submit" data-quiz="lead-submit"></button><p class="form-note" data-quiz="lead-message" hidden></p></form></div></div>',
        '</section>',
      '</div>',
    '</main>',
    '<footer class="landing-footer"><p class="landing-disclaimer">האבחון נועד לספק כיוון ראשוני ואינו מחליף אפיון מקצועי.</p></footer>'
  ].join('');
  var start = root.querySelector('[data-landing-start]');
  if (start) start.addEventListener('click', function(){
    var target = document.getElementById('quiz-root');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  function escapeHtml(value){ return String(value || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
})();
