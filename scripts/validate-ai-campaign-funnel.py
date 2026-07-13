from pathlib import Path
import re

ARTICLE = Path('blog/ai-crm-readiness/index.html').read_text(encoding='utf-8')
SERVICE = Path('services/ai-business-processes/index.html').read_text(encoding='utf-8')
SOCIAL_CSS = Path('assets/social.css').read_text(encoding='utf-8')
BLOG_CSS = Path('assets/blog.css').read_text(encoding='utf-8')
MEASURED_JS = Path('assets/measured-links.js').read_text(encoding='utf-8')

CLICK_WEBHOOK = 'https://script.google.com/macros/s/AKfycbwBupU9NsVFQD7G9eqWoNS8B6EVIBymSqp3WhykccnzbZwkz52pb-zvDkXj_QPfMgA/exec'
LEAD_WEBHOOK = 'https://script.google.com/macros/s/AKfycbxYVmacixUKR071kabelmPep55790mmTFszMijZ9heSR9UFvdaqqvxhCv162q59zY6h/exec'

if '.wa-float[href*="AI%20"]' in SOCIAL_CSS or '.wa-float[href*="AI%20"]::before' in SOCIAL_CSS:
    raise SystemExit('AI funnel validation failed: duplicate WhatsApp pseudo-icon rule still exists')

required_service = [
    '/assets/social.css?v=2',
    '/assets/ai-service.js?v=2',
    'id="aiLeadForm"',
    'id="ai-contact"',
]
for marker in required_service:
    if marker not in SERVICE:
        raise SystemExit(f'AI service validation failed: missing {marker}')

required_article = [
    '/assets/social.css?v=2',
    '/assets/blog.css?v=4',
    '/assets/measured-links.js?v=1',
    'class="article-cta ai-article-cta"',
    'data-measured-link="article_ai_form"',
    'data-measured-path="/blog/ai-crm-readiness/#cta-ai-form"',
    'data-pass-click-id="true"',
    'class="cta-arrow" aria-hidden="true"',
    'data-measured-link="article_ai_whatsapp"',
    'data-measured-path="/blog/ai-crm-readiness/#cta-whatsapp"',
]
for marker in required_article:
    if marker not in ARTICLE:
        raise SystemExit(f'AI article funnel validation failed: missing {marker}')

for label, html in [('service', SERVICE), ('article', ARTICLE)]:
    matches = re.findall(r'<a class="wa-float"[^>]*>(.*?)</a>', html, re.S)
    if len(matches) != 1:
        raise SystemExit(f'{label} WhatsApp validation failed: expected one floating link, found {len(matches)}')
    if matches[0].count('<svg') != 1:
        raise SystemExit(f'{label} WhatsApp validation failed: expected exactly one inline SVG')

required_measured_js = [
    f"var CLICK_WEBHOOK = '{CLICK_WEBHOOK}';",
    "a[data-measured-link]",
    "data-measured-path",
    "data-pass-click-id",
    "event_type: 'short_link_click'",
    "short_path: link.getAttribute('data-measured-path')",
    "destination_url: destination.toString()",
    "destination.searchParams.set('click_id', clickId)",
    "keepalive: true",
]
for marker in required_measured_js:
    if marker not in MEASURED_JS:
        raise SystemExit(f'Measured links validation failed: missing {marker}')
if LEAD_WEBHOOK in MEASURED_JS:
    raise SystemExit('Measured links validation failed: click tracker must not use the leads webhook')

required_blog_css = [
    '.ai-article-cta .btn-gold{white-space:nowrap',
    '.ai-article-cta .btn-gold .cta-arrow',
    '@media(max-width:560px)',
]
for marker in required_blog_css:
    if marker not in BLOG_CSS:
        raise SystemExit(f'AI CTA CSS validation failed: missing {marker}')

if ARTICLE.count('data-measured-link="article_ai_form"') != 1:
    raise SystemExit('AI funnel validation failed: expected one measured form CTA')
if ARTICLE.count('data-measured-link="article_ai_whatsapp"') != 1:
    raise SystemExit('AI funnel validation failed: expected one measured WhatsApp CTA')

print('AI campaign funnel validated: one icon, compact CTA, measured links and isolated endpoints.')
