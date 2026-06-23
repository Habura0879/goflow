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
    setTimeout(applyDiagnosisFixes, 0);
  });

  function applyDiagnosisFixes(){
    var result = document.querySelector('[data-quiz="result-wrap"]');
    var actions = result && result.querySelector('.result-cta');
    var areas = result && result.querySelector('.result-areas');
    if (result && actions && areas) result.insertBefore(actions, areas);

    decorateField('name', true, '');
    decorateField('phone', true, '');
    decorateField('company', false, '(רשות)');
    bindMobileFormVisibility();
  }

  function bindMobileFormVisibility(){
    var toggle = document.querySelector('[data-quiz="lead-toggle"]');
    if (!toggle || toggle.getAttribute('data-mobile-form-bound') === 'true') return;
    toggle.setAttribute('data-mobile-form-bound', 'true');
    toggle.addEventListener('click', function(){
      if (window.matchMedia && !window.matchMedia('(max-width: 960px)').matches) return;
      setTimeout(scrollLeadFormIntoView, 80);
      setTimeout(scrollLeadFormIntoView, 380);
    });
  }

  function scrollLeadFormIntoView(){
    var form = document.querySelector('[data-quiz="lead-form"]');
    if (!form || form.hidden) return;
    var firstField = form.querySelector('input:not([type="hidden"]), textarea, select');
    var target = firstField || form;
    var viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    var desiredTop = Math.max(16, Math.min(110, Math.round(viewportHeight * 0.12)));
    var rect = target.getBoundingClientRect();
    var targetTop = Math.max(0, window.pageYOffset + rect.top - desiredTop);
    window.scrollTo({ top: targetTop, behavior: 'smooth' });
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
