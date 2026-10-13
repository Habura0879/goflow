(function(){
  'use strict';
  var form=document.getElementById('dataServiceLeadForm');
  var submit=document.getElementById('dataSubmit');
  var status=document.getElementById('dataStatus');
  var formspreeEndpoint='https://formspree.io/f/maqzwlqy';
  var sheetEndpoint='https://script.google.com/macros/s/AKfycbxYVmacixUKR071kabelmPep55790mmTFszMijZ9heSR9UFvdaqqvxhCv162q59zY6h/exec';
  if(!form||!submit||!status)return;
  form.action=formspreeEndpoint;
  form.method='POST';
  form.addEventListener('focusin',function(){
    if(typeof trackEvent==='function')trackEvent('data_service_form_start',{service:'data_commercialization'});
  },{once:true});
  form.addEventListener('submit',async function(event){
    event.preventDefault();
    if(submit.disabled)return;
    submit.disabled=true;
    submit.textContent='שולח...';
    status.style.display='none';
    var data=new FormData(form);
    var overview=String(data.get('data_overview')||'').trim();
    var summary=[
      'פנייה בנושא: מסחור מידע עסקי לחברות AI',
      'חברה: '+String(data.get('company')||''),
      'מצב החברה: '+String(data.get('organization_status')||''),
      'שנות פעילות: '+String(data.get('years_active')||''),
      'מספר עובדים בשיא הפעילות: '+String(data.get('employee_count')||''),
      'סוג מידע כללי: '+String(data.get('data_category')||''),
      'תיאור כללי: '+overview
    ].join('\n');
    var submittedAt=new Date().toISOString();
    var submissionId='data_lead_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,10);
    data.set('message',summary);
    data.set('quiz_summary',summary);
    data.set('_subject','פנייה חדשה מהאתר — מסחור מידע עסקי');
    data.set('service','מסחור מידע עסקי לחברות AI');
    data.set('source','data_commercialization_form');
    data.set('form_source','data_commercialization_form');
    data.set('diagnosis_source','data_commercialization_form');
    data.set('schema_version','goflow_lead_v1');
    data.set('lead_type','data_commercialization');
    data.set('lead_status','complete');
    data.set('interaction_type','form_submit');
    data.set('challenge',overview);
    data.set('submitted_at',submittedAt);
    data.set('submission_id',submissionId);
    data.set('quiz_attempt_id',submissionId);
    data.set('page_slug','data-commercialization');
    data.set('page_url',window.location.href);
    data.set('page_path',window.location.pathname);
    data.set('page_hash',window.location.hash||'#data-contact');
    var tracking=typeof getTrackingParams==='function'?getTrackingParams():{};
    Object.keys(tracking||{}).forEach(function(key){
      if(tracking[key]!==undefined&&tracking[key]!=='')data.set(key,tracking[key]);
    });
    data.set('attribution_json',JSON.stringify(tracking||{}));
    try{
      var response=await fetch(formspreeEndpoint,{method:'POST',body:data,headers:{'Accept':'application/json'}});
      var result={};
      try{result=await response.json()}catch(ignore){}
      if(!response.ok)throw new Error((result&&result.error)||'form_submit_failed');
      sendLeadToSheet(data);
      submit.textContent='✓ הבקשה נשלחה';
      status.style.display='block';
      status.style.color='var(--ink)';
      status.textContent='תודה. נחזור אליכם לשיחת היכרות. אין צורך לשלוח מידע או קבצים.';
      if(typeof trackEvent==='function')trackEvent('generate_lead',{method:'data_commercialization_form',service:'data_commercialization'});
      form.reset();
    }catch(error){
      submit.disabled=false;
      submit.textContent='שליחת בקשה לשיחת היכרות ←';
      status.style.display='block';
      status.style.color='#b43c1e';
      status.textContent='לא הצלחנו לשלוח את הבקשה. נסו שוב או פנו אלינו בוואטסאפ.';
    }
  });
  function sendLeadToSheet(formData){
    var iframeName='goflowDataLeadSheetFrame';
    var iframe=document.querySelector('iframe[name="'+iframeName+'"]');
    if(!iframe){
      iframe=document.createElement('iframe');
      iframe.name=iframeName;
      iframe.hidden=true;
      document.body.appendChild(iframe);
    }
    var relayForm=document.createElement('form');
    relayForm.method='POST';
    relayForm.action=sheetEndpoint;
    relayForm.target=iframeName;
    relayForm.hidden=true;
    formData.forEach(function(value,key){
      var input=document.createElement('input');
      input.type='hidden';
      input.name=key;
      input.value=value;
      relayForm.appendChild(input);
    });
    document.body.appendChild(relayForm);
    relayForm.submit();
    window.setTimeout(function(){relayForm.remove()},8000);
  }
})();
