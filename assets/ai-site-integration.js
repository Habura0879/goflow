(function(){
  function addNavLink(){
    document.querySelectorAll('.site-nav-links,.nav-links').forEach(function(list){
      if (list.querySelector('a[href="/services/ai-business-processes/"]')) return;
      var serviceLink = Array.from(list.querySelectorAll('a')).find(function(a){ return a.getAttribute('href') === '/services/'; });
      if (!serviceLink) return;
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '/services/ai-business-processes/';
      a.textContent = 'AI לעסקים';
      li.appendChild(a);
      serviceLink.closest('li').insertAdjacentElement('afterend', li);
    });
    document.querySelectorAll('.drawer').forEach(function(drawer){
      if (drawer.querySelector('a[href="/services/ai-business-processes/"]')) return;
      var serviceLink = drawer.querySelector('a[href="/services/"]');
      if (!serviceLink) return;
      var a = document.createElement('a');
      a.href = '/services/ai-business-processes/';
      a.textContent = 'AI לעסקים';
      a.onclick = closeDrawer;
      serviceLink.insertAdjacentElement('afterend', a);
    });
  }

  function trackAiLinks(){
    document.addEventListener('click', function(event){
      var link = event.target.closest('a[href="/services/ai-business-processes/"]');
      if (!link || typeof trackEvent !== 'function') return;
      trackEvent('ai_service_link_click', {
        source_path: window.location.pathname,
        link_text: (link.textContent || '').trim()
      });
    });
  }

  function updateHome(){
    if (window.location.pathname !== '/') return;
    var eyebrow = document.querySelector('.hero-eyebrow');
    if (eyebrow) eyebrow.textContent = 'תהליכים · מערכות · אוטומציה · AI';
    var sub = document.querySelector('.hero-sub');
    if (sub) sub.textContent = 'GoFlow מאבחנת צווארי בקבוק, מתכננת מחדש תהליכי עבודה ומשלבת מערכות, אוטומציה ו־AI במקום שבו הם מפחיתים עומס, מונעים טעויות ומאפשרים לארגון לצמוח בלי כאוס.';

    var list = document.querySelector('#services .svc-list');
    if (list && !list.querySelector('[data-ai-home-card]')) {
      var card = document.createElement('a');
      card.className = 'svc-item';
      card.href = '/services/ai-business-processes/';
      card.setAttribute('data-ai-home-card','true');
      card.innerHTML = '<div class="svc-n">05</div><div class="svc-title">הטמעת AI</div><p class="svc-desc">איתור תהליכים מתאימים, אפיון פתרונות AI, הגדרת בקרה אנושית וליווי ההקמה עד לשימוש בפועל.</p>';
      var cards = list.querySelectorAll('.svc-item');
      if (cards[4]) list.insertBefore(card, cards[4]); else list.appendChild(card);
      list.querySelectorAll('.svc-item .svc-n').forEach(function(n,i){ n.textContent = String(i+1).padStart(2,'0'); });
    }

    var processText = document.querySelector('#process .step-col:nth-child(2) .step-desc');
    if (processText) processText.textContent = 'עיצוב תהליכים חדשים, הגדרת אחריות ובחירת מערכות, אוטומציות ויכולות AI לפי הצורך.';

    var problem = document.getElementById('problem');
    var quiz = document.getElementById('quiz');
    if (problem && quiz && !document.getElementById('ai-home-intro')) {
      var section = document.createElement('section');
      section.id = 'ai-home-intro';
      section.style.cssText = 'padding:clamp(3.5rem,7vw,6rem) 0;background:var(--paper-2)';
      section.innerHTML = '<div class="container"><div class="fi on" style="max-width:850px;margin:0 auto;text-align:center"><div class="eyebrow">AI בתהליכי עבודה</div><h2>AI כבר קיים. השאלה היא האם הוא באמת עובד אצלכם.</h2><div class="rule" style="margin:1.25rem auto"></div><p class="lead" style="margin:0 auto 1.5rem">GoFlow הופכת שימוש אקראי ב־AI לתהליך עבודה מסודר, מבוקר ומדיד — כחלק מהמערכות והאחריות שכבר קיימות בארגון.</p><a href="/services/ai-business-processes/" class="btn-gold" style="display:inline-block;text-decoration:none;padding:.85rem 1.5rem">לשירות AI לעסקים ←</a></div></div>';
      quiz.parentNode.insertBefore(section, quiz);
    }

    var aboutText = document.querySelector('#about .about-text, #about p[style*="margin-bottom:2rem"]');
    if (aboutText && aboutText.textContent.indexOf('AI') === -1) {
      aboutText.textContent = 'ב־GoFlow אני עוזר לעסקים לזהות איפה העבודה נתקעת, לסדר אחריות, לבנות תהליכי עבודה ברורים ולחבר נכון בין אנשים, מערכות, אוטומציות ויכולות AI.';
    }

    var form = document.getElementById('contactForm');
    if (form && !form.querySelector('[name="interest"]')) {
      var first = form.querySelector('.frow');
      var row = document.createElement('div');
      row.className = 'frow';
      row.innerHTML = '<label>במה תרצו להתמקד?</label><select name="interest" required><option value="">בחרו</option><option>תהליך עבודה</option><option>CRM או מערכת</option><option>אוטומציה</option><option>הטמעת AI</option><option>עדיין לא ברור</option></select>';
      if (first) first.insertAdjacentElement('afterend', row); else form.prepend(row);
      var note = document.createElement('p');
      note.className = 'form-note';
      note.textContent = 'אין להזין בטופס מידע אישי, סודי או רגיש.';
      form.appendChild(note);
    }
  }

  function updateAbout(){
    if (window.location.pathname !== '/about/' && window.location.pathname !== '/about') return;
    document.title = 'אבי עמר — יועץ תהליכים, אוטומציה ו־AI | GoFlow';
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.content = 'אבי עמר — יועץ תהליכים והטמעת טכנולוגיה, אוטומציה ו־AI. מחבר בין הצורך העסקי, תהליך העבודה והטכנולוגיה עד לפתרון שעובד בפועל.';
    var subtitle = document.querySelector('.about-header .subtitle');
    if (subtitle) subtitle.textContent = 'יועץ תהליכים והטמעת טכנולוגיה, אוטומציה ו־AI';
    var bio = document.querySelector('.about-bio');
    if (bio && !bio.querySelector('[data-ai-about]')) {
      var p = document.createElement('p');
      p.className = 'about-text';
      p.setAttribute('data-ai-about','true');
      p.textContent = 'אני מחבר בין הצורך העסקי, תהליך העבודה והטכנולוגיה — כולל שילוב יכולות AI במקום שבו הן מייצרות ערך אמיתי, נשארות בשליטה אנושית וניתנות למדידה.';
      bio.appendChild(p);
    }
    var img = document.querySelector('.about-photo');
    if (img) img.alt = 'אבי עמר — מייסד GoFlow, יועץ תהליכים, אוטומציה ו־AI';
  }

  function addRelatedBlock(path, title, text){
    if (window.location.pathname !== path && window.location.pathname !== path.slice(0,-1)) return;
    var main = document.querySelector('main');
    if (!main || main.querySelector('[data-ai-related]')) return;
    var cta = main.querySelector('.service-cta');
    var section = document.createElement('section');
    section.className = 'service-section tint';
    section.setAttribute('data-ai-related','true');
    section.innerHTML = '<div class="service-section-inner"><h2>'+title+'</h2><div class="service-copy"><p>'+text+'</p></div><div class="service-related"><a href="/services/ai-business-processes/">לשירות הטמעת AI בתהליכי עבודה ←</a></div></div>';
    if (cta) main.insertBefore(section, cta); else main.appendChild(section);
  }

  function updatePrivacy(){
    if (window.location.pathname !== '/privacy/' && window.location.pathname !== '/privacy') return;
    var main = document.querySelector('main');
    if (!main || main.querySelector('[data-ai-privacy]')) return;
    var section = document.createElement('section');
    section.setAttribute('data-ai-privacy','true');
    section.innerHTML = '<h2>פניות ותהליכים בנושא AI</h2><p>בטפסים ובשיחות התאמה ניתן למסור תיאור כללי של תהליך העבודה והאתגר העסקי. אין להזין מידע אישי, סודי, רפואי, כספי או מידע מזהה של לקוחות ועובדים. המידע שנמסר משמש לבדיקת התאמה וליצירת קשר, ועשוי לעבור דרך ספקי טפסים ומדידה חיצוניים בהתאם להעדפות הקוקיז שנבחרו.</p>';
    main.appendChild(section);
  }

  function init(){
    addNavLink();
    trackAiLinks();
    updateHome();
    updateAbout();
    addRelatedBlock('/services/business-automation/','אוטומציה או AI?','אוטומציה מתאימה כאשר אפשר להגדיר כלל קבוע. AI מתאים כאשר צריך להבין טקסט, מסמך או מידע שאינו אחיד. לעיתים הפתרון הנכון משלב ביניהם.');
    addRelatedBlock('/services/crm-consulting/','AI בתוך תהליך CRM','יכולות AI יכולות לסכם פניות, לזהות מידע חסר ולהציע את הפעולה הבאה — אך הן אינן מחליפות תהליך מכירה ושירות מוגדר היטב.');
    addRelatedBlock('/services/process-consulting/','היכן AI יכול לתמוך בתהליך?','לאחר שמגדירים את העבודה והאחריות, בודקים אילו פעולות כדאי לנהל במערכת, להפוך לאוטומטיות או לתמוך בהן באמצעות AI.');
    addRelatedBlock('/services/work-procedures/','נהלים לשימוש מבוקר ב־AI','כאשר עובדים משתמשים ב־AI, הנוהל צריך להגדיר איזה מידע מותר להזין, מה חייבים לבדוק, מי מאשר ואיפה נשמרת התוצאה.');
    updatePrivacy();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
