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
    check(s.count('/assets/brokerage-join.css?v=1')==1,str(page)+' missing or duplicate modal style')
    check(s.count('/assets/brokerage-join.js?v=1')==1,str(page)+' missing or duplicate modal script')
    check(parsed.buttons>=1,str(page)+' missing join trigger')
    check(parsed.forms==(['contactForm'] if page==Path('index.html') else []),str(page)+' must reuse original form, not clone forms')
check("lead_embed')==='1'" in home,'embed view must be explicit')
check('html.goflow-join-embed body > :not(#contact)' in css,'embed view not isolated')
check("overlay.querySelector('iframe').src='/?service=data-commercialization&lead_embed=1'" in js,'iframe must reuse existing homepage contact flow')
check('aria-modal="true"' in js and "e.key==='Escape'" in js and "previousFocus.focus()" in js,'accessible close and focus restoration missing')
check('https://formspree.io/f/maqzwlqy' in homejs,'existing form backend changed')
check('data_commercialization_lead_submitted' in homejs,'existing event missing')
check('href="/services/process-consulting/"' in home,'consulting tab lost')
check('GoFlow_full_logo_black_transparent_1200px.png' in service,'original branding lost')
check('name="phone"' in home and 'name="name"' in home and 'name="email"' in home,'existing contact fields missing')
check('name="company"' not in home,'company must not be mandatory')
print('Brokerage join regression passed on five pages, with one existing contact form.')
