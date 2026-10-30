/* Unit smoke for brokerage modal behavior using Node built-ins only (no network). */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const callbacks={};
const selectors={};
const bodyClasses=new Set();
let activeElement=null;
function element(name){
  return {
    tagName:name, hidden:false, inert:false, attrs:{},listeners:{},href:'',
    getClientRects(){return [1];},
    closest(){return null;},
    addEventListener(type,handler){(this.listeners[type]??=[]).push(handler);},
    emit(type,payload){for(const cb of (this.listeners[type]||[]))cb(payload||{});},
    setAttribute(k,v){this.attrs[k]=v;},
    getAttribute(k){return this.attrs[k]??null;},
    removeAttribute(k){delete this.attrs[k];},
    focus(){activeElement=this;},
    querySelector(q){return selectors[q];},
    querySelectorAll(){return [];},
  };
}
const trigger=element('A');
const background=element('MAIN');
const scripts=element('SCRIPT');
const body={
  children:[background,scripts],
  classList:{
    add(k){bodyClasses.add(k);},
    remove(k){bodyClasses.delete(k);},
  },
  appendChild(el){this.children.push(el);},
};
const document={
  readyState:'complete',
  body,
  get activeElement(){return activeElement;},
  querySelector(q){return q==='[data-brokerage-join]'?trigger:null;},
  createElement(name){
    const overlay=element(name.toUpperCase());
    for(const key of ['.goflow-join-close','.goflow-join-back','#goflow-join-show-form','#goflow-join-title','#goflow-join-description','#goflow-join-whatsapp','#goflow-join-email','.goflow-join-form-panel','.goflow-join-choices','iframe'])selectors[key]=element('DIV');
    selectors['iframe'].tagName='IFRAME';
    overlay.querySelector=q=>selectors[q];
    return overlay;
  },
  addEventListener(type,handler){callbacks[type]=handler;},
};
const context={document,location:{search:''},URLSearchParams,encodeURIComponent};
vm.runInNewContext(fs.readFileSync('assets/brokerage-join.js','utf8'),context,{filename:'brokerage-join.js'});
assert.equal(typeof callbacks.click,'function','one delegated click handler is required');

const call=(intent)=>{
  trigger.getAttribute=k=>k==='data-brokerage-intent'?intent:null;
  let prevented=false;
  activeElement=trigger;
  callbacks.click({target:{closest:()=>trigger},button:0,metaKey:false,ctrlKey:false,shiftKey:false,altKey:false,defaultPrevented:false,preventDefault(){prevented=true;}});
  assert(prevented,'internal contact trigger must not navigate');
  return body.children.find(x=>x.className==='goflow-join-overlay');
};
let overlay=call('consultation');
assert(overlay && !overlay.hidden,'contact chooser opens in place');
assert(background.inert,'background is inert while dialog is open');
assert(selectors['#goflow-join-whatsapp'].href.startsWith('https://wa.me/972547951161?text='));
assert(selectors['#goflow-join-email'].href.startsWith('mailto:avi@goflow.co.il?subject='));
assert(selectors['.goflow-join-form-panel'].hidden,'do not load form until requested');
assert.equal(selectors['iframe'].getAttribute('src'),null);
selectors['#goflow-join-show-form'].emit('click');
assert(!selectors['.goflow-join-form-panel'].hidden,'inline form should be visible');
assert(selectors['.goflow-join-choices'].hidden,'choose one contact channel at a time');
assert(selectors['iframe'].getAttribute('src').includes('inquiry_intent=consultation'));
selectors['.goflow-join-back'].emit('click');
assert(selectors['.goflow-join-form-panel'].hidden);
selectors['.goflow-join-close'].emit('click');
assert(overlay.hidden && !background.inert && activeElement===trigger,'close restores state/focus');
assert.equal(selectors['iframe'].getAttribute('src'),null,'no stale form iframe when reopening');
overlay=call('registry');
assert.equal(body.children.filter(x=>x.className==='goflow-join-overlay').length,1,'do not duplicate overlay');
assert(selectors['#goflow-join-title'].textContent.includes('מאגר'));
assert(decodeURIComponent(selectors['#goflow-join-whatsapp'].href).includes('מאגר'));
assert(decodeURIComponent(selectors['#goflow-join-email'].href).includes('מאגר'));
selectors['#goflow-join-show-form'].emit('click');
assert(selectors['iframe'].getAttribute('src').includes('inquiry_intent=registry'));
callbacks.keydown({key:'Escape',preventDefault(){}});
assert(overlay.hidden && !background.inert,'Escape should close the dialog');
console.log('Three-channel brokerage chooser behavioral smoke passed.');
