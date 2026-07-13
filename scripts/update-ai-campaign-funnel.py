from pathlib import Path
import re

SERVICE_PAGE = Path('services/ai-business-processes/index.html')
ARTICLE_PAGE = Path('blog/ai-crm-readiness/index.html')

WHATSAPP_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>'


def replace_version(text, old, new, label):
    if new in text:
        return text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label} guard failed: expected one {old}, found {count}')
    return text.replace(old, new, 1)


def replace_once_if_missing(text, old, new, label):
    if new in text:
        return text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label} guard failed: expected one source marker, found {count}')
    return text.replace(old, new, 1)


# Service page: use fresh CSS/JS assets and keep one real WhatsApp icon.
service = SERVICE_PAGE.read_text(encoding='utf-8')
service = replace_version(service, '/assets/social.css?v=1', '/assets/social.css?v=2', 'service social CSS version')
service = replace_version(service, '/assets/ai-service.js?v=1', '/assets/ai-service.js?v=2', 'AI service JS version')

service_float_pattern = re.compile(r'(<a class="wa-float"[^>]*>)(.*?)(</a>)', re.S)
service_float_matches = list(service_float_pattern.finditer(service))
if len(service_float_matches) != 1:
    raise SystemExit(f'service WhatsApp float guard failed: expected one anchor, found {len(service_float_matches)}')
service_float = service_float_matches[0]
service_float_body = service_float.group(2)
if '<svg' not in service_float_body:
    replacement = service_float.group(1) + WHATSAPP_SVG + service_float.group(3)
    service = service[:service_float.start()] + replacement + service[service_float.end():]

SERVICE_PAGE.write_text(service, encoding='utf-8')

# Article: fresh styles, scoped compact CTA and measured form/WhatsApp links.
article = ARTICLE_PAGE.read_text(encoding='utf-8')
article = replace_version(article, '/assets/social.css?v=1', '/assets/social.css?v=2', 'article social CSS version')
article = replace_version(article, '/assets/blog.css?v=3', '/assets/blog.css?v=4', 'article blog CSS version')
article = replace_once_if_missing(
    article,
    '<div class="article-cta">',
    '<div class="article-cta ai-article-cta">',
    'AI article CTA scope',
)
article = replace_once_if_missing(
    article,
    'class="btn-wa"',
    'class="btn-wa" data-measured-link="article_ai_whatsapp" data-measured-path="/blog/ai-crm-readiness/#cta-whatsapp"',
    'AI article WhatsApp measurement',
)
article = replace_once_if_missing(
    article,
    '<script src="/assets/shared.js?v=12"></script>',
    '<script src="/assets/shared.js?v=12"></script>\n<script src="/assets/measured-links.js?v=1"></script>',
    'measured links script include',
)

ARTICLE_PAGE.write_text(article, encoding='utf-8')

# Final guards: one floating icon per page and exactly one measured CTA of each type.
for label, html in (('service', service), ('article', article)):
    float_match = re.search(r'<a class="wa-float"[^>]*>(.*?)</a>', html, re.S)
    if not float_match:
        raise SystemExit(f'{label} validation failed: floating WhatsApp link missing')
    if float_match.group(1).count('<svg') != 1:
        raise SystemExit(f'{label} validation failed: expected exactly one floating WhatsApp SVG')

if article.count('data-measured-link="article_ai_form"') != 1:
    raise SystemExit('article validation failed: expected one measured form CTA')
if article.count('data-measured-link="article_ai_whatsapp"') != 1:
    raise SystemExit('article validation failed: expected one measured WhatsApp CTA')
if article.count('/assets/measured-links.js?v=1') != 1:
    raise SystemExit('article validation failed: expected one measured-links script include')

print('AI campaign funnel pages updated with fresh assets, one WhatsApp icon and measured CTAs.')
