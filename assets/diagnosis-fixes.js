(function(){
  'use strict';

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
