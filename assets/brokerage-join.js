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
    function open(){
      previousFocus=document.activeElement;
      if(!overlay){
        overlay=document.createElement('div');
        overlay.className='goflow-join-overlay';
        overlay.hidden=true;
        overlay.innerHTML='<div class="goflow-join-dialog" role="dialog" aria-modal="true" aria-labelledby="goflow-join-title" aria-describedby="goflow-join-description"><button class="goflow-join-close" type="button" aria-label="סגירת הטופס">×</button><h2 class="goflow-join-heading" id="goflow-join-title">הצטרפו למאגר בעלי המידע של GoFlow</h2><p class="goflow-join-description" id="goflow-join-description">השאירו שם וטלפון ונחזור אליכם בדיסקרטיות. אין צורך בשם החברה או בהעברת קבצים. זו בקשת הצטרפות ראשונית, לא פרסום אוטומטי של מאגר.</p><iframe class="goflow-join-frame" title="טופס פנייה להצטרפות למאגר בעלי המידע" loading="eager"></iframe></div>';
        overlay.querySelector('iframe').src='/?service=data-commercialization&lead_embed=1';
        overlay.querySelector('.goflow-join-close').addEventListener('click',close);
        overlay.addEventListener('click',function(e){if(e.target===overlay)close()});
        document.body.appendChild(overlay);
      }
      overlay.hidden=false;
      document.body.classList.add('goflow-join-locked');
      overlay.querySelector('.goflow-join-close').focus();
    }
    triggers.forEach(function(trigger){
      trigger.addEventListener('click',function(e){e.preventDefault();open()});
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
