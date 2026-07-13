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

required_article_markers = [
    '<html lang="he" dir="rtl">',
    '<link rel="canonical" href="https://goflow.co.il/blog/ai-crm-readiness/">',
    '<meta name="robots" content="index, follow">',
    '"@type":"Article"',
    '"datePublished":"2026-07-13"',
    '"articleSection":"AI"',
    '<span class="article-cat">AI</span>',
    '<link rel="stylesheet" href="/assets/shared.css?v=7">',
    '<link rel="stylesheet" href="/assets/blog.css?v=3">',
    '/services/ai-business-processes/',
    '/blog/automation-for-business/',
    '/blog/crm-requirements-checklist/',
]
for marker in required_article_markers:
    if marker not in article:
        raise SystemExit(f"Article validation failed: missing {marker}")

if article.count('<h1 class="article-title">') != 1:
    raise SystemExit("Article validation failed: expected one H1")

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

root = ET.fromstring(sitemap)
ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
urls = [node.text for node in root.findall("sm:url/sm:loc", ns)]
if "https://goflow.co.il/blog/ai-crm-readiness/" not in urls:
    raise SystemExit("Sitemap validation failed: article URL missing")

print("AI article, blog index and sitemap validated successfully.")
