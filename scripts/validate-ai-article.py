from pathlib import Path
import json
import re
import xml.etree.ElementTree as ET

ARTICLE = Path("blog/ai-crm-readiness/index.html")
BLOG_INDEX = Path("blog/index.html")
SITEMAP = Path("sitemap.xml")

article = ARTICLE.read_text(encoding="utf-8")
blog_index = BLOG_INDEX.read_text(encoding="utf-8")
sitemap = SITEMAP.read_text(encoding="utf-8")

direct_cta = '<a href="/services/ai-business-processes/?ref=article_ai_crm#ai-contact" class="btn-gold" data-measured-link="article_ai_form" data-measured-path="/blog/ai-crm-readiness/#cta-ai-form" data-pass-click-id="true"><span>לבדיקת התאמה ל־AI</span><span class="cta-arrow" aria-hidden="true">←</span></a>'
legacy_cta = '<a href="/services/ai-business-processes/" class="btn-gold">לבדיקת מוכנות ל-AI ←</a>'
previous_cta = '<a href="/services/ai-business-processes/?ref=article_ai_crm#ai-contact" class="btn-gold">לבדיקת התאמה ראשונית ל־AI ←</a>'

required_article_markers = [
    '<html lang="he" dir="rtl">',
    '<link rel="canonical" href="https://goflow.co.il/blog/ai-crm-readiness/">',
    '<meta name="robots" content="index, follow">',
    '"@type":"Article"',
    '"datePublished":"2026-07-13"',
    '"articleSection":"AI"',
    '<span class="article-cat">AI</span>',
    '<link rel="stylesheet" href="/assets/shared.css?v=7">',
    '<link rel="stylesheet" href="/assets/social.css?v=2">',
    '<link rel="stylesheet" href="/assets/blog.css?v=4">',
    '<script src="/assets/measured-links.js?v=1"></script>',
    '<div class="article-cta ai-article-cta">',
    direct_cta,
    'class="btn-wa" data-measured-link="article_ai_whatsapp" data-measured-path="/blog/ai-crm-readiness/#cta-whatsapp"',
    '/blog/automation-for-business/',
    '/blog/crm-requirements-checklist/',
]
for marker in required_article_markers:
    if marker not in article:
        raise SystemExit(f"Article validation failed: missing {marker}")

if article.count('<h1 class="article-title">') != 1:
    raise SystemExit("Article validation failed: expected one H1")
if article.count(direct_cta) != 1:
    raise SystemExit("Article validation failed: expected one compact measured AI form CTA")
if legacy_cta in article or previous_cta in article:
    raise SystemExit("Article validation failed: an obsolete AI CTA still exists")
if article.count('data-measured-link="article_ai_whatsapp"') != 1:
    raise SystemExit("Article validation failed: expected one measured WhatsApp CTA")

float_match = re.search(r'<a class="wa-float"[^>]*>(.*?)</a>', article, re.S)
if not float_match or float_match.group(1).count('<svg') != 1:
    raise SystemExit("Article validation failed: floating WhatsApp link must contain exactly one SVG")

for raw in re.findall(r'<script type="application/ld\+json">(.*?)</script>', article, re.S):
    json.loads(raw)

required_index_markers = [
    "filter('AI')",
    'href="/blog/ai-crm-readiness/"',
    'data-cat="AI"',
    '<span class="post-cat-tag">AI</span>',
]
for marker in required_index_markers:
    if marker not in blog_index:
        raise SystemExit(f"Blog index validation failed: missing {marker}")


def validate_short_link(path, public_url, source, medium):
    html = Path(path).read_text(encoding="utf-8")
    required_markers = [
        '<meta name="robots" content="noindex,nofollow">',
        f'<meta property="og:url" content="{public_url}">',
        "var WEBHOOK = 'https://script.google.com/macros/s/AKfycbwBupU9NsVFQD7G9eqWoNS8B6EVIBymSqp3WhykccnzbZwkz52pb-zvDkXj_QPfMgA/exec';",
        f"utm_source: '{source}'",
        f"utm_medium: '{medium}'",
        "utm_campaign: 'organic_content'",
        "utm_content: 'ai_crm_article_day1'",
        "var target = new URL('/blog/ai-crm-readiness/', window.location.origin);",
        "event_type: 'short_link_click'",
        "short_path: window.location.pathname",
        "destination_url: target.toString()",
        "window.location.replace(target.toString())",
    ]
    for marker in required_markers:
        if marker not in html:
            raise SystemExit(f"Short-link validation failed for {path}: missing {marker}")


validate_short_link(
    "ai-crm/index.html",
    "https://goflow.co.il/ai-crm/",
    "whatsapp",
    "status",
)
validate_short_link(
    "ai-fb-story/index.html",
    "https://goflow.co.il/ai-fb-story/",
    "facebook",
    "story",
)

root = ET.fromstring(sitemap)
ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
urls = [node.text for node in root.findall("sm:url/sm:loc", ns)]
if "https://goflow.co.il/blog/ai-crm-readiness/" not in urls:
    raise SystemExit("Sitemap validation failed: article URL missing")

print("AI article, compact measured CTAs, WhatsApp and Facebook Story short links, blog index and sitemap validated successfully.")
