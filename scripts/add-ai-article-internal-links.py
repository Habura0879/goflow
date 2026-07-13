from pathlib import Path
import re


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"Guard failed for {label}: expected 1 match, found {count}")
    return text.replace(old, new, 1)


# Homepage: keep exactly six featured article cards by replacing an older CRM card.
home_path = Path("index.html")
home = home_path.read_text(encoding="utf-8")

home_intro_old = '<p class="lead" style="margin:0 auto">מאמרים מהשטח על ייעוץ תהליכי, אוטומציה, CRM ונהלי עבודה — בלי תיאוריה.</p>'
home_intro_new = '<p class="lead" style="margin:0 auto">מאמרים מהשטח על ייעוץ תהליכי, מערכות, אוטומציה, CRM ו־AI — בלי תיאוריה.</p>'
if home_intro_new not in home:
    home = replace_once(home, home_intro_old, home_intro_new, "homepage blog intro")

if 'href="/blog/ai-crm-readiness/"' not in home:
    card_pattern = re.compile(
        r'\n      <a href="/blog/crm-solves-nothing/" style="background:#fff;.*?\n      </a>\n',
        re.S,
    )
    card_new = '''
      <a href="/blog/ai-crm-readiness/" style="background:#fff;border:1px solid var(--border);border-radius:4px;overflow:hidden;text-decoration:none;display:flex;flex-direction:column;transition:transform .25s,box-shadow .25s" onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 28px rgba(30,27,22,.08)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
        <div style="height:3px;background:var(--gold)"></div>
        <div style="padding:1.5rem;flex:1;display:flex;flex-direction:column">
          <div style="font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:.75rem">AI · יולי 2026</div>
          <div style="font-family:var(--fd);font-size:1.1rem;font-weight:700;color:var(--ink);line-height:1.3;margin-bottom:.65rem">AI במערכות CRM — מה מגדירים לפני שנותנים למערכת לפעול</div>
          <p style="font-size:.86rem;color:var(--muted);line-height:1.75;flex:1">שבע החלטות שצריך לקבל לפני שנותנים ל־AI לעדכן מידע, לענות ולבצע פעולות.</p>
          <span style="display:inline-flex;align-items:center;gap:.4rem;margin-top:1.2rem;font-size:.78rem;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:var(--gold)">קרא עוד →</span>
        </div>
      </a>
'''
    home, count = card_pattern.subn(card_new, home, count=1)
    if count != 1:
        raise SystemExit(f"Guard failed for homepage article card: expected 1 match, found {count}")

for marker in [
    'href="/blog/ai-crm-readiness/"',
    'AI · יולי 2026',
    'מערכות, אוטומציה, CRM ו־AI',
]:
    if marker not in home:
        raise SystemExit(f"Homepage validation failed: missing {marker}")
home_path.write_text(home, encoding="utf-8")


# AI service page: add a contextual link to the new guide.
ai_path = Path("services/ai-business-processes/index.html")
ai_html = ai_path.read_text(encoding="utf-8")
ai_old = '<p>כאשר אין תהליך מוסכם, המידע אינו אמין, אין גורם אחראי או שטעות עלולה לגרום נזק משמעותי, קודם מסדרים את התהליך ומגדירים בקרה.</p>'
ai_new = ai_old + '<p>להרחבה, קראו את המדריך: <a href="/blog/ai-crm-readiness/">מה חייבים להגדיר לפני שנותנים ל־AI לפעול בתוך מערכת CRM</a>.</p>'
if ai_new not in ai_html:
    ai_html = replace_once(ai_html, ai_old, ai_new, "AI service contextual article link")
if ai_html.count('href="/blog/ai-crm-readiness/"') != 1:
    raise SystemExit("AI service validation failed: expected one article link")
ai_path.write_text(ai_html, encoding="utf-8")


# CRM service page: add the guide beside the existing AI service link.
crm_path = Path("services/crm-consulting/index.html")
crm_html = crm_path.read_text(encoding="utf-8")
crm_old = '<div class="service-related"><a href="/services/ai-business-processes/">לשירות הטמעת AI בתהליכי עבודה ←</a></div>'
crm_new = '<div class="service-related"><a href="/services/ai-business-processes/">לשירות הטמעת AI בתהליכי עבודה ←</a><a href="/blog/ai-crm-readiness/">למדריך: מה מגדירים לפני שנותנים ל־AI לפעול ←</a></div>'
if crm_new not in crm_html:
    crm_html = replace_once(crm_html, crm_old, crm_new, "CRM service article link")
if crm_html.count('href="/blog/ai-crm-readiness/"') != 1:
    raise SystemExit("CRM service validation failed: expected one article link")
crm_path.write_text(crm_html, encoding="utf-8")

print("AI article internal links applied and validated.")
