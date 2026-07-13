from pathlib import Path

ARTICLE = Path("blog/ai-crm-readiness/index.html")
html = ARTICLE.read_text(encoding="utf-8")

old = '<a href="/services/ai-business-processes/" class="btn-gold">לבדיקת מוכנות ל-AI ←</a>'
new = '<a href="/services/ai-business-processes/?ref=article_ai_crm#ai-contact" class="btn-gold">לבדיקת התאמה ראשונית ל־AI ←</a>'

if new not in html:
    count = html.count(old)
    if count != 1:
        raise SystemExit(f"AI article CTA guard failed: expected 1 old CTA, found {count}")
    html = html.replace(old, new, 1)

if html.count(new) != 1:
    raise SystemExit("AI article CTA validation failed: expected exactly one direct form CTA")
if old in html:
    raise SystemExit("AI article CTA validation failed: old intermediate CTA still exists")

ARTICLE.write_text(html, encoding="utf-8")
print("AI article CTA now points directly to the existing AI form with source tracking.")
