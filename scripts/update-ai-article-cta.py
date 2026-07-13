from pathlib import Path

ARTICLE = Path("blog/ai-crm-readiness/index.html")
html = ARTICLE.read_text(encoding="utf-8")

legacy_cta = '<a href="/services/ai-business-processes/" class="btn-gold">לבדיקת מוכנות ל-AI ←</a>'
current_cta = '<a href="/services/ai-business-processes/?ref=article_ai_crm#ai-contact" class="btn-gold">לבדיקת התאמה ראשונית ל־AI ←</a>'
final_cta = '<a href="/services/ai-business-processes/?ref=article_ai_crm#ai-contact" class="btn-gold" data-measured-link="article_ai_form" data-measured-path="/blog/ai-crm-readiness/#cta-ai-form" data-pass-click-id="true"><span>לבדיקת התאמה ל־AI</span><span class="cta-arrow" aria-hidden="true">←</span></a>'

if final_cta not in html:
    candidates = [candidate for candidate in (current_cta, legacy_cta) if candidate in html]
    if len(candidates) != 1:
        raise SystemExit(
            "AI article CTA guard failed: expected exactly one supported source CTA, "
            f"found {len(candidates)}"
        )
    source = candidates[0]
    if html.count(source) != 1:
        raise SystemExit("AI article CTA guard failed: source CTA must appear exactly once")
    html = html.replace(source, final_cta, 1)

if html.count(final_cta) != 1:
    raise SystemExit("AI article CTA validation failed: expected exactly one final measured CTA")
if legacy_cta in html or current_cta in html:
    raise SystemExit("AI article CTA validation failed: an obsolete CTA still exists")

ARTICLE.write_text(html, encoding="utf-8")
print("AI article CTA is compact, measurable and points directly to the existing AI form.")
