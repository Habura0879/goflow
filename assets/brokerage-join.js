/* Brokerage join: a single modal shell displaying the EXISTING homepage Formspree form. */
(function(){
  'use strict';
  if(new URLSearchParams(location.search).get('lead_embed')==='1')return;
  function start(){
    var triggers=document.querySelectorAll('[data-brokerage-join]');
    if(!triggers.length)return;
    var overlay=null,previousFocus=null;
    function close(){
      if(!overlay||overlay.hidden)return;
      overlay.hidden=true;
      document.body.classList.remove('goflow-join-locked');
      if(previousFocus&&typeof previousFocus.focus==='function')previousFocus.focus();
    }
    function open(intent){
      previousFocus=document.activeElement;
      if(!overlay){
        overlay=document.createElement('div');
        overlay.className='goflow-join-overlay';
        overlay.hidden=true;
        overlay.innerHTML='<div class="goflow-join-dialog" role="dialog" aria-modal="true" aria-labelledby="goflow-join-title" aria-describedby="goflow-join-description"><button class="goflow-join-close" type="button" aria-label="סגירת הטופס">×</button><h2 class="goflow-join-heading" id="goflow-join-title">בואו נבדוק יחד את הפוטנציאל של המידע שלכם</h2><p class="goflow-join-description" id="goflow-join-description">שיחה ראשונית ללא התחייבות. השאירו שם וטלפון ונחזור אליכם בדיסקרטיות, בלי צורך למסור קבצים או את שם החברה.</p><iframe class="goflow-join-frame" title="טופס פנייה לבירור מידע עסקי" loading="eager"></iframe></div>';
        overlay.querySelector('iframe').src='/?service=data-commercialization&lead_embed=1';
        overlay.querySelector('.goflow-join-close').addEventListener('click',close);
        overlay.addEventListener('click',function(e){if(e.target===overlay)close()});
        document.body.appendChild(overlay);
      }
      var registry=intent==='registry';
      overlay.querySelector('#goflow-join-title').textContent=registry?'מעוניינים להצטרף למאגר בעלי המידע?':'בואו נבדוק יחד את הפוטנציאל של המידע שלכם';
      overlay.querySelector('#goflow-join-description').textContent=registry?'השאירו שם וטלפון לבדיקת אפשרות הצטרפות למאגר. אין התחייבות לעסקה, ואין צורך למסור קבצים או את שם החברה.':'שיחה ראשונית ללא התחייבות או הצטרפות למאגר. השאירו שם וטלפון ונחזור אליכם בדיסקרטיות.';
      overlay.querySelector('iframe').title=registry?'טופס בקשת הצטרפות למאגר':'טופס בקשה לשיחה ראשונית';
      overlay.querySelector('iframe').src='/?service=data-commercialization&lead_embed=1&inquiry_intent='+(registry?'registry':'consultation');
      overlay.hidden=false;
      document.body.classList.add('goflow-join-locked');
      overlay.querySelector('.goflow-join-close').focus();
    }
    // Delegate at document level so the existing measured-links listener runs first.
    document.addEventListener('click',function(e){
      var trigger=e.target.closest&&e.target.closest('[data-brokerage-join]');
      if(!trigger||e.defaultPrevented)return;
      if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
      e.preventDefault();
      open(trigger.getAttribute('data-brokerage-intent'));
    });
    document.addEventListener('keydown',function(e){
      if(!overlay||overlay.hidden)return;
      if(e.key==='Escape'){e.preventDefault();close()}
      if(e.key==='Tab'){
        var closeButton=overlay.querySelector('.goflow-join-close');
        var frame=overlay.querySelector('iframe');
        if(e.shiftKey&&document.activeElement===closeButton){e.preventDefault();frame.focus()}
        else if(!e.shiftKey&&document.activeElement===frame){e.preventDefault();closeButton.focus()}
      }
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
  else start();
})();
