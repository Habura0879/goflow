from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import re


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.ids = set()
        self.forms = []
        self._current_form = None

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if values.get('id'):
            self.ids.add(values['id'])
        if tag == 'a' and values.get('href'):
            self.links.append(values['href'])
        if tag == 'form':
            self._current_form = {'id': values.get('id', ''), 'fields': []}
            self.forms.append(self._current_form)
        elif self._current_form is not None and tag in ('input', 'select', 'textarea'):
            self._current_form['fields'].append({
                'tag': tag,
                'name': values.get('name', ''),
                'required': 'required' in values,
            })

    def handle_endtag(self, tag):
        if tag == 'form':
            self._current_form = None


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'Guard failed for {label}: expected 1 match, found {count}')
    return text.replace(old, new, 1)


# Fix the AI service page navigation so it matches the rest of the site.
ai_path = Path('services/ai-business-processes/index.html')
ai_html = ai_path.read_text(encoding='utf-8')
if '<li><a href="/services/ai-business-processes/" class="active">AI לעסקים</a></li>' not in ai_html:
    ai_html = replace_once(
        ai_html,
        '<li><a href="/services/" class="active">שירותים</a></li><li><a href="/#process">תהליך</a></li>',
        '<li><a href="/services/">שירותים</a></li><li><a href="/services/ai-business-processes/" class="active">AI לעסקים</a></li><li><a href="/#process">תהליך</a></li>',
        'AI desktop navigation',
    )
if '<a href="/services/ai-business-processes/" onclick="closeDrawer()">AI לעסקים</a>' not in ai_html:
    ai_html = replace_once(
        ai_html,
        '<a href="/services/" onclick="closeDrawer()">שירותים</a><a href="/#process" onclick="closeDrawer()">תהליך עבודה</a>',
        '<a href="/services/" onclick="closeDrawer()">שירותים</a><a href="/services/ai-business-processes/" onclick="closeDrawer()">AI לעסקים</a><a href="/#process" onclick="closeDrawer()">תהליך עבודה</a>',
        'AI mobile navigation',
    )
ai_path.write_text(ai_html, encoding='utf-8')

# Remove the obsolete, non-functional cookie banner from the standalone 404 page.
error_path = Path('404.html')
error_html = error_path.read_text(encoding='utf-8')
error_html, removed = re.subn(
    r'\n<!-- COOKIE CONSENT BANNER -->.*?<div id="cookie-banner".*?</div>\s*</div>\s*',
    '\n',
    error_html,
    count=1,
    flags=re.S,
)
if removed not in (0, 1):
    raise SystemExit(f'Guard failed for 404 cookie banner: removed {removed}')
if 'id="cookie-banner"' in error_html:
    raise SystemExit('404 validation failed: obsolete cookie banner still exists')
error_path.write_text(error_html, encoding='utf-8')

# Validate key pages and internal links.
html_files = [p for p in Path('.').rglob('*.html') if 'oldsite' not in p.parts]
known_paths = {'/'}
for path in html_files:
    rel = path.as_posix()
    if rel == 'index.html':
        known_paths.add('/')
    elif rel.endswith('/index.html'):
        known_paths.add('/' + rel[:-10])
    else:
        known_paths.add('/' + rel)

errors = []
for path in html_files:
    text = path.read_text(encoding='utf-8')
    parser = PageParser()
    parser.feed(text)
    for href in parser.links:
        if href.startswith(('#', 'mailto:', 'tel:', 'javascript:', 'https://', 'http://')):
            if href.startswith('#') and href != '#' and href[1:] not in parser.ids:
                errors.append(f'{path}: missing local anchor target {href}')
            continue
        parsed = urlsplit(href)
        target = parsed.path
        if not target.startswith('/'):
            continue
        if target.startswith('/assets/') or Path('.' + target).is_file():
            continue
        normalized = target if target.endswith('/') else target + '/'
        if target not in known_paths and normalized not in known_paths:
            errors.append(f'{path}: missing internal target {target}')

# Product-critical form validation.
home = Path('index.html').read_text(encoding='utf-8')
required_home = [
    'id="contactForm"',
    'name="name"',
    'name="phone"',
    'name="email"',
    'name="interest"',
    'id="formMsg"',
]
for needle in required_home:
    if needle not in home:
        errors.append(f'index.html missing {needle}')
if not re.search(r'name="name"[^>]*required', home):
    errors.append('index.html name must be required')
if not re.search(r'name="phone"[^>]*required', home):
    errors.append('index.html phone must be required')
if re.search(r'name="email"[^>]*required', home):
    errors.append('index.html email must remain optional')

ai_html = ai_path.read_text(encoding='utf-8')
for needle in ['id="aiLeadForm"', 'id="aiStatus"', '/assets/ai-service.js', 'data-ai-cta']:
    if needle not in ai_html:
        errors.append(f'AI page missing {needle}')

ai_js = Path('assets/ai-service.js').read_text(encoding='utf-8')
for needle in ['if (!response.ok)', "trackEvent('ai_lead_submitted'", "trackEvent('generate_lead'", 'getTrackingParams']:
    if needle not in ai_js:
        errors.append(f'assets/ai-service.js missing {needle}')

shared_js = Path('assets/shared.js').read_text(encoding='utf-8')
for needle in ['utm_source', 'gclid', 'gbraid', 'wbraid', 'analytics_storage', 'ad_storage']:
    if needle not in shared_js:
        errors.append(f'assets/shared.js missing {needle}')

robots = Path('robots.txt').read_text(encoding='utf-8')
if 'Sitemap: https://goflow.co.il/sitemap.xml' not in robots:
    errors.append('robots.txt missing sitemap declaration')

htaccess = Path('.htaccess').read_text(encoding='utf-8')
if 'ErrorDocument 404 /404.html' not in htaccess:
    errors.append('.htaccess missing real 404 configuration')

error_html = error_path.read_text(encoding='utf-8')
for needle in ['noindex, follow', 'העמוד שחיפשת לא נמצא', 'href="/"']:
    if needle not in error_html:
        errors.append(f'404.html missing {needle}')

if errors:
    raise SystemExit('Phase 3 QA failed:\n- ' + '\n- '.join(errors))

print(f'Phase 3 launch QA passed across {len(html_files)} HTML files.')
