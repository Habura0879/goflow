/* Single brokerage contact chooser. Reuses the EXISTING homepage form in its iframe. */
(function () {
  'use strict';
  // The embedded homepage is only a form host, never a second chooser.
  if (new URLSearchParams(location.search).get('lead_embed') === '1') return;

  function init() {
    if (!document.querySelector('[data-brokerage-join]')) return;

    var overlay = null;
    var previousFocus = null;
    var currentIntent = 'consultation';

    function emitSelection(method) {
      // Only intent/method metadata, never names, phone numbers, or message content.
      if (typeof window.trackEvent === 'function') {
        window.trackEvent('brokerage_contact_method_selected', {
          method: method,
          inquiry_intent: currentIntent
        });
      }
    }

    function getFocusable() {
      return Array.prototype.filter.call(
        overlay.querySelectorAll('button:not([disabled]),a[href],iframe'),
        function (node) { return !node.closest('[hidden]'); }
      );
    }

    function close() {
      if (!overlay || overlay.hidden) return;
      overlay.hidden = true;
      document.body.classList.remove('goflow-join-locked');
      // Drop any unsent contact details from the embedded form.
      var frame = overlay.querySelector('.goflow-join-frame');
      frame.removeAttribute('src');
      frame.dataset.intent = '';
      if (previousFocus && typeof previousFocus.focus === 'function' &&
          document.contains(previousFocus)) previousFocus.focus();
    }

    function showChoices(restoreFocus) {
      var methods = overlay.querySelector('.goflow-join-methods');
      var formPanel = overlay.querySelector('.goflow-join-form-panel');
      methods.hidden = false;
      formPanel.hidden = true;
      if (restoreFocus) methods.querySelector('[data-join-method="form"]').focus();
    }

    function showForm() {
      var frame = overlay.querySelector('.goflow-join-frame');
      var formPanel = overlay.querySelector('.goflow-join-form-panel');
      var methods = overlay.querySelector('.goflow-join-methods');
      methods.hidden = true;
      formPanel.hidden = false;
      frame.title = currentIntent === 'registry' ?
        'טופס בקשה להצטרפות למאגר בעלי המידע' :
        'טופס בקשה לשיחת בירור ראשונית';
      if (frame.dataset.intent !== currentIntent) {
        frame.dataset.intent = currentIntent;
        frame.src = '/?service=data-commercialization&lead_embed=1&inquiry_intent=' + currentIntent;
      }
      emitSelection('form');
      formPanel.querySelector('.goflow-join-back').focus();
    }

    function createOverlay() {
      overlay = document.createElement('div');
      overlay.className = 'goflow-join-overlay';
      overlay.hidden = true;
      overlay.innerHTML = [
        '<div class="goflow-join-dialog" role="dialog" aria-modal="true" aria-labelledby="goflow-join-title" aria-describedby="goflow-join-description">',
        '<button class="goflow-join-close" type="button" aria-label="סגירת חלון יצירת קשר">×</button>',
        '<h2 class="goflow-join-heading" id="goflow-join-title"></h2>',
        '<p class="goflow-join-description" id="goflow-join-description"></p>',
        '<div class="goflow-join-methods" aria-label="בחירת אופן פנייה">',
        '<a class="goflow-join-choice goflow-join-wa" data-join-method="whatsapp" href="https://wa.me/972547951161" target="_blank" rel="noopener noreferrer">',
        '<span class="goflow-join-choice-icon" aria-hidden="true">◉</span>',
        '<span class="goflow-join-choice-copy"><strong>שליחת WhatsApp</strong><small>נפתח צ׳אט עם הודעה מוכנה. אתם בוחרים אם לשלוח.</small></span>',
        '<span aria-hidden="true" class="goflow-join-chevron">←</span></a>',
        '<a class="goflow-join-choice" data-join-method="email" href="mailto:avi@goflow.co.il">',
        '<span class="goflow-join-choice-icon" aria-hidden="true">✉</span>',
        '<span class="goflow-join-choice-copy"><strong>שליחת אימייל</strong><small>נפתחת הודעה מוכנה באפליקציית הדואר שלכם.</small></span>',
        '<span aria-hidden="true" class="goflow-join-chevron">←</span></a>',
        '<button class="goflow-join-choice" data-join-method="form" type="button">',
        '<span class="goflow-join-choice-icon" aria-hidden="true">✎</span>',
        '<span class="goflow-join-choice-copy"><strong>השאירו פרטים ונחזור אליכם</strong><small>שם וטלפון בלבד, ללא צורך לשלוח קבצים.</small></span>',
        '<span aria-hidden="true" class="goflow-join-chevron">←</span></button>',
        '<p class="goflow-join-privacy">פנייה ראשונית בלבד, ללא התחייבות. אין צורך למסור את שם החברה או להצטרף למאגר.</p>',
        '</div>',
        '<div class="goflow-join-form-panel" hidden>',
        '<button class="goflow-join-back" type="button">→ חזרה לאפשרויות הפנייה</button>',
        '<iframe class="goflow-join-frame" title="טופס יצירת קשר" loading="eager"></iframe>',
        '</div></div>'
      ].join('');
      overlay.querySelector('.goflow-join-close').addEventListener('click', close);
      overlay.querySelector('.goflow-join-back').addEventListener('click', function () {
        showChoices(true);
      });
      overlay.querySelector('[data-join-method="form"]').addEventListener('click', showForm);
      ['whatsapp', 'email'].forEach(function (method) {
        overlay.querySelector('[data-join-method="' + method + '"]').addEventListener('click', function () {
          emitSelection(method);
        });
      });
      overlay.addEventListener('click', function (event) {
        if (event.target === overlay) close();
      });
      var frame = overlay.querySelector('.goflow-join-frame');
      // The iframe is same-origin. Escape and edge-Tab work even when focus is inside the form.
      frame.addEventListener('load', function () {
        try {
          var innerDocument = frame.contentDocument;
          if (!innerDocument) return;
          innerDocument.addEventListener('keydown', function (event) {
            if (overlay.hidden) return;
            if (event.key === 'Escape') {
              event.preventDefault();
              close();
            }
            if (event.key !== 'Tab') return;
            var candidates = Array.prototype.filter.call(
              innerDocument.querySelectorAll('input:not([type="hidden"]), textarea, select, button, a[href]'),
              function (node) { return !node.disabled && node.getClientRects().length > 0; }
            );
            if (!candidates.length) return;
            if (event.shiftKey && innerDocument.activeElement === candidates[0]) {
              event.preventDefault();
              overlay.querySelector('.goflow-join-back').focus();
            } else if (!event.shiftKey && innerDocument.activeElement === candidates[candidates.length - 1]) {
              event.preventDefault();
              overlay.querySelector('.goflow-join-close').focus();
            }
          });
        } catch (error) {
          // The main dialog still offers an always-visible close button.
        }
      });
      document.body.appendChild(overlay);
    }

    function open(intent) {
      if (!overlay) createOverlay();
      previousFocus = document.activeElement;
      currentIntent = intent === 'registry' ? 'registry' : 'consultation';
      var registry = currentIntent === 'registry';
      overlay.querySelector('#goflow-join-title').textContent = registry ?
        'מתעניינים בהצטרפות למאגר בעלי המידע?' :
        'בואו נדבר על המידע שלכם';
      overlay.querySelector('#goflow-join-description').textContent = registry ?
        'אפשר לבדוק הצטרפות למאגר להזדמנויות עתידיות, או פשוט לשאול אותנו. אין התחייבות לעסקה.' :
        'רוצים לבדוק מה אפשר לקבל עבור המידע שצברתם? בחרו את דרך הפנייה הנוחה לכם, ללא התחייבות.';
      var intro = registry ?
        'שלום GoFlow, אשמח לברר אפשרות להצטרפות למאגר בעלי המידע שלכם.' :
        'שלום GoFlow, אשמח לשיחת בירור על הפוטנציאל של המידע העסקי שלנו.';
      var subject = registry ?
        'GoFlow — בירור הצטרפות למאגר בעלי מידע' :
        'GoFlow — בקשה לשיחה על מידע עסקי';
      overlay.querySelector('[data-join-method="whatsapp"]').href =
        'https://wa.me/972547951161?text=' + encodeURIComponent(intro);
      overlay.querySelector('[data-join-method="email"]').href =
        'mailto:avi@goflow.co.il?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(intro + '\n\n');
      showChoices(false);
      overlay.hidden = false;
      document.body.classList.add('goflow-join-locked');
      overlay.querySelector('.goflow-join-close').focus();
    }

    // Shared delegated handler: existing on-page and measured CTA attributes remain intact.
    document.addEventListener('click', function (event) {
      var trigger = event.target.closest && event.target.closest('[data-brokerage-join]');
      if (!trigger || event.defaultPrevented) return;
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      open(trigger.getAttribute('data-brokerage-intent'));
    });
    document.addEventListener('keydown', function (event) {
      if (!overlay || overlay.hidden) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      } else if (event.key === 'Tab') {
        var focusable = getFocusable();
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
