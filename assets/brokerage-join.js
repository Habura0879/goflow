/* One accessible contact chooser for all brokerage pages; reuses the homepage's only form. */
(function(){
  'use strict';
  if (new URLSearchParams(location.search).get('lead_embed') === '1') return;

  function init(){
    if (!document.querySelector('[data-brokerage-join]')) return;
    var overlay=null, previousFocus=null, inerted=[], activeIntent='consultation';
    function focusable(container){
      return Array.prototype.filter.call(container.querySelectorAll('button:not([disabled]),a[href],iframe:not([hidden]),input:not([disabled]),textarea:not([disabled]),select:not([disabled])'),function(el){
        return !el.closest('[hidden]') && el.getClientRects().length>0;
      });
    }
    function restoreBackground(){
      inerted.forEach(function(item){item.element.inert=item.wasInert;});
      inerted=[];
      document.body.classList.remove('goflow-join-locked');
    }
    function close(){
      if (!overlay || overlay.hidden) return;
      overlay.hidden=true;
      restoreBackground();
      if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
    }
    function build(){
      overlay=document.createElement('div');
      overlay.className='goflow-join-overlay';
      overlay.hidden=true;
      overlay.innerHTML=[
        '<div class="goflow-join-dialog" role="dialog" aria-modal="true" aria-labelledby="goflow-join-title" aria-describedby="goflow-join-description">',
          '<button class="goflow-join-close" type="button" aria-label="סגירת חלון דרכי הפנייה">×</button>',
          '<h2 class="goflow-join-heading" id="goflow-join-title"></h2>',
          '<p class="goflow-join-description" id="goflow-join-description"></p>',
          '<div class="goflow-join-choices">',
            '<a class="goflow-join-option" id="goflow-join-whatsapp" target="_blank" rel="noopener"><span class="goflow-join-option-icon" aria-hidden="true">◉</span><span class="goflow-join-option-copy"><strong>שליחת הודעת WhatsApp</strong><small>נפתחת שיחה עם הודעה מוכנה לעריכה</small></span><span class="goflow-join-chevron" aria-hidden="true">‹</span></a>',
            '<a class="goflow-join-option" id="goflow-join-email"><span class="goflow-join-option-icon" aria-hidden="true">✉</span><span class="goflow-join-option-copy"><strong>שליחת אימייל</strong><small>נפתחת הודעה באפליקציית המייל שלכם</small></span><span class="goflow-join-chevron" aria-hidden="true">‹</span></a>',
            '<button class="goflow-join-option" id="goflow-join-show-form" type="button"><span class="goflow-join-option-icon" aria-hidden="true">✎</span><span class="goflow-join-option-copy"><strong>השארת פרטים ונחזור אליכם</strong><small>שם וטלפון בלבד, ללא התחייבות</small></span><span class="goflow-join-chevron" aria-hidden="true">‹</span></button>',
          '</div>',
          '<div class="goflow-join-form-panel" hidden>',
            '<button type="button" class="goflow-join-back">חזרה לדרכי הפנייה</button>',
            '<iframe class="goflow-join-frame" title="טופס יצירת קשר" loading="eager"></iframe>',
          '</div>',
          '<p class="goflow-join-footnote">אין צורך לשלוח קבצים או לחשוף את שם החברה. הצטרפות למאגר אינה תנאי לפנייה.</p>',
        '</div>'
      ].join('');
      overlay.querySelector('.goflow-join-close').addEventListener('click',close);
      overlay.querySelector('.goflow-join-back').addEventListener('click',function(){showForm(false);});
      overlay.querySelector('#goflow-join-show-form').addEventListener('click',function(){showForm(true);});
      overlay.addEventListener('click',function(e){if (e.target===overlay)close();});
      document.body.appendChild(overlay);
      var frame=overlay.querySelector('iframe');
      frame.addEventListener('load',function(){
        try {
          var doc=frame.contentDocument;
          if (!doc) return;
          doc.addEventListener('keydown',function(e){
            if (e.key==='Escape'){e.preventDefault();close();return;}
            if (e.key!=='Tab')return;
            var items=focusable(doc);
            if (!items.length)return;
            if (e.shiftKey && doc.activeElement===items[0]){
              e.preventDefault();overlay.querySelector('.goflow-join-back').focus();
            } else if (!e.shiftKey && doc.activeElement===items[items.length-1]){
              e.preventDefault();overlay.querySelector('.goflow-join-close').focus();
            }
          });
        } catch (error) { /* The iframe is same-origin; links remain usable if embedding is blocked. */ }
      });
    }
    function showForm(yes){
      var panel=overlay.querySelector('.goflow-join-form-panel');
      var choices=overlay.querySelector('.goflow-join-choices');
      panel.hidden=!yes;
      choices.hidden=yes;
      if (yes){
        var frame=panel.querySelector('iframe');
        var src='/?service=data-commercialization&lead_embed=1&inquiry_intent='+activeIntent;
        if (frame.getAttribute('src')!==src)frame.setAttribute('src',src);
        overlay.querySelector('.goflow-join-back').focus();
      } else {
        overlay.querySelector('#goflow-join-show-form').focus();
      }
    }
    function open(intent){
      if (!overlay) build();
      previousFocus=document.activeElement;
      activeIntent=intent==='registry'?'registry':'consultation';
      var registry=activeIntent==='registry';
      overlay.querySelector('#goflow-join-title').textContent=registry?'מתעניינים בהצטרפות למאגר בעלי המידע?':'בואו נדבר על המידע שלכם';
      overlay.querySelector('#goflow-join-description').textContent=registry?'אפשר לבקש להיכלל במאגר בעלי המידע של GoFlow, ללא התחייבות לעסקה. בחרו כיצד נוח לכם לפנות.':'רוצים לבדוק איזה פוטנציאל יש למידע שלכם? שיחה ראשונית בלי התחייבות ובלי צורך להצטרף למאגר. בחרו את הדרך הנוחה לכם.';
      var wa=registry?'שלום GoFlow, אשמח לברר לגבי הצטרפות למאגר בעלי המידע.':'שלום GoFlow, אשמח לשיחת בירור לגבי המידע העסקי שברשותי.';
      overlay.querySelector('#goflow-join-whatsapp').href='https://wa.me/972547951161?text='+encodeURIComponent(wa);
      var subject=registry?'GoFlow — בקשת בירור הצטרפות למאגר בעלי מידע':'GoFlow — בקשה לשיחת בירור על מידע עסקי';
      overlay.querySelector('#goflow-join-email').href='mailto:avi@goflow.co.il?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(wa+'\n\nשם ופרטי קשר: ');
      overlay.querySelector('.goflow-join-form-panel').hidden=true;
      overlay.querySelector('.goflow-join-choices').hidden=false;
      overlay.hidden=false;
      document.body.classList.add('goflow-join-locked');
      inerted=[];
      Array.prototype.forEach.call(document.body.children,function(element){
        if (element===overlay || element.tagName==='SCRIPT')return;
        inerted.push({element:element,wasInert:element.inert===true});
        element.inert=true;
      });
      overlay.querySelector('.goflow-join-close').focus();
    }
    document.addEventListener('click',function(e){
      var target=e.target.closest&&e.target.closest('[data-brokerage-join]');
      if (!target || e.defaultPrevented || e.button!==0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)return;
      e.preventDefault();
      open(target.getAttribute('data-brokerage-intent'));
    });
    document.addEventListener('keydown',function(e){
      if (!overlay || overlay.hidden)return;
      if (e.key==='Escape'){e.preventDefault();close();return;}
      if (e.key!=='Tab')return;
      var items=focusable(overlay);
      if (!items.length)return;
      if (e.shiftKey && document.activeElement===items[0]){
        e.preventDefault();items[items.length-1].focus();
      } else if (!e.shiftKey && document.activeElement===items[items.length-1]){
        e.preventDefault();items[0].focus();
      }
    });
  }
  if (document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
