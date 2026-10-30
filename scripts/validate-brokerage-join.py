#!/usr/bin/env python3
"""Regressions: reuse the one original contact form across brokerage content pages."""
from pathlib import Path
from html.parser import HTMLParser
home=Path('index.html').read_text(encoding='utf-8')
service=Path('services/data-commercialization/index.html').read_text(encoding='utf-8')
blogs=[Path('blog/business-data-value/index.html'),Path('blog/ai-ready-business-data/index.html'),Path('blog/database-transfer-privacy/index.html')]
css=Path('assets/brokerage-join.css').read_text(encoding='utf-8')
js=Path('assets/brokerage-join.js').read_text(encoding='utf-8')
homejs=Path('assets/home.js').read_text(encoding='utf-8')
class Elements(HTMLParser):
    def __init__(self): super().__init__();self.forms=[];self.buttons=0
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if tag=='form':self.forms.append(attrs.get('id'))
        if 'data-brokerage-join' in attrs:self.buttons+=1
def check(ok,msg):
    if not ok:raise SystemExit('Brokerage join regression: '+msg)
pages=[Path('index.html'),Path('services/data-commercialization/index.html'),*blogs]
for page in pages:
    s=page.read_text(encoding='utf-8')
    parsed=Elements();parsed.feed(s)
    check(s.count('/assets/brokerage-join.css?v=2')==1,str(page)+' missing or duplicate modal style')
    check(s.count('/assets/brokerage-join.js?v=2')==1,str(page)+' missing or duplicate modal script')
    check(parsed.buttons>=1,str(page)+' missing join trigger')
    check(parsed.forms==(['contactForm'] if page==Path('index.html') else []),str(page)+' must reuse original form, not clone forms')
check("lead_embed')==='1'" in home,'embed view must be explicit')
check('html.goflow-join-embed body > :not(#contact)' in css,'embed view not isolated')
check("frame.src = '/?service=data-commercialization&lead_embed=1&inquiry_intent='" in js,'iframe must reuse existing homepage contact flow with intent')
check('aria-modal="true"' in js and "event.key === 'Escape'" in js and 'previousFocus.focus()' in js,'accessible close and focus restoration missing')
check('https://formspree.io/f/maqzwlqy' in homejs,'existing form backend changed')
check(js.count('document.createElement(\'div\')')==1,'only one shared dialog shell should be created')
check(js.count('<iframe class="goflow-join-frame"')==1,'only one iframe may reuse the single existing form')
check(js.count('<form')==0,'modal must not clone or create a new contact form')
for method in ('whatsapp','email','form'):
    check('data-join-method="'+method+'"' in js,'missing three-channel choice: '+method)
check("'mailto:avi@goflow.co.il?subject='" in js,'email action must open the approved mailbox via visitor mail app')
check("'https://wa.me/972547951161?text='" in js,'WhatsApp action must open official contact with prefilling')
check("'registry'" in js and "'consultation'" in js,'both contact intents must be preserved')
check('brokerage_contact_method_selected' in js,'method-choice analytics event missing')
check('getFocusable()' in js and 'frame.contentDocument' in js,'focus containment must include embedded form')
check('.goflow-join-methods[hidden]' in css and '.goflow-join-form-panel[hidden]' in css,'hidden views must be visually hidden')
check('https://formspree.io/' not in js,'UI modal must never create a second form delivery backend')
check('form-handler.php' not in js,'old unsafe backend must not be reused')
check('data_commercialization_lead_submitted' in homejs,'existing event missing')
check('href="/services/process-consulting/"' in home,'consulting tab lost')
check('GoFlow_full_logo_black_transparent_1200px.png' in service,'original branding lost')
check('name="phone"' in home and 'name="name"' in home and 'name="email"' in home,'existing contact fields missing')
check('name="company"' not in home,'company must not be mandatory')
# Spacing contract: section boundaries must not accumulate oversized vertical whitespace.
homecss=Path('assets/home.css').read_text(encoding='utf-8')
servicecss=Path('assets/data-service.css').read_text(encoding='utf-8')
check('.brokerage-section{padding:clamp(2.5rem,4vw,3.5rem)' in homecss,'brokerage sections should share compact vertical rhythm')
check('.brokerage-section{padding:2.5rem 1.5rem}' in homecss,'mobile brokerage section rhythm missing')
check('.data-opportunity{padding:clamp(2.75rem,4.5vw,4rem)' in homecss,'data opportunity section still too tall')
check('.data-service .service-section{padding-block:clamp(2.5rem,4vw,3.5rem)}' in servicecss,'service page has oversized section spacing')
check('id="data-owners-registry"' in home and 'id="data-owners-registry"' in service,'registry sections missing after spacing change')
print('Brokerage join regression passed on five pages, with one existing contact form.')
