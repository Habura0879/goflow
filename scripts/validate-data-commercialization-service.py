from pathlib import Path
import json
import re

PAGE = Path("services/data-commercialization/index.html").read_text(encoding="utf-8")
CSS = Path("assets/data-service.css").read_text(encoding="utf-8")
HUB = Path("services/index.html").read_text(encoding="utf-8")
HOME = Path("index.html").read_text(encoding="utf-8")
HOME_JS = Path("assets/home.js").read_text(encoding="utf-8")
if '/assets/home.js?v=14' not in HOME:
    raise SystemExit("Service funnel validation failed: homepage must load the refreshed context script")
SITEMAP = Path("sitemap.xml").read_text(encoding="utf-8")

for marker in [
    '<html lang="he" dir="rtl">',
    '<title>תיווך ומסחור מידע עסקי לחברות AI | GoFlow</title>',
    '<link rel="canonical" href="https://goflow.co.il/services/data-commercialization/">',
    '<h1>המידע העסקי שצברתם במשך שנים עשוי להיות שווה כסף</h1>',
    'href="/?service=data-commercialization#contact"',
    'data-measured-link',
    'נושא הפנייה יסומן מראש.',
    'מידע אישי מזהה',
    'אין התחייבות לעסקה',
    'GoFlow אינה מקבלת את המידע',
    'תיווך מקצועי וליווי מסחרי',
    '/assets/measured-links.js?v=1',
]:
    if marker not in PAGE:
        raise SystemExit(f"Service page validation failed: missing {marker}")
if PAGE.count("<h1") != 1:
    raise SystemExit("Service page validation failed: expected exactly one H1")
if re.search(r'<input[^>]+type=["\']file', PAGE, re.I):
    raise SystemExit("Service page validation failed: file upload is forbidden")
if "<form" in PAGE or "data-service.js" in PAGE:
    raise SystemExit("Service page validation failed: page-specific form or handler must not be added")
if "formspree.io" in PAGE or "script.google.com/macros" in PAGE:
    raise SystemExit("Service page validation failed: form endpoints must stay in shared site flow")
json_ld = re.findall(r'<script type="application/ld\+json">([\s\S]*?)</script>', PAGE)
if len(json_ld) != 1:
    raise SystemExit("Service page validation failed: expected one JSON-LD block")
try:
    structured = json.loads(json_ld[0])
except json.JSONDecodeError as error:
    raise SystemExit(f"Service page JSON-LD is invalid: {error}")
if not any(item.get("@type") == "Service" for item in structured.get("@graph", [])):
    raise SystemExit("Service page validation failed: Service schema is missing")
if not any(item.get("@type") == "BreadcrumbList" for item in structured.get("@graph", [])):
    raise SystemExit("Service page validation failed: BreadcrumbList is missing")

route = "https://goflow.co.il/services/data-commercialization/"
relative_route = route.replace("https://goflow.co.il", "")
if SITEMAP.count(f"<loc>{route}</loc>") != 1:
    raise SystemExit("Service SEO validation failed: route must appear once in sitemap")
if relative_route not in HUB or relative_route not in HOME:
    raise SystemExit("Service SEO validation failed: internal links are missing")
if '<option value="מסחור מידע עסקי לחברות AI">תיווך בעסקאות מידע עסקי</option>' not in HOME:
    raise SystemExit("Service funnel validation failed: existing contact form must classify this service")
for marker in [
    "params.get('service') !== 'data-commercialization'",
    "interest.value = option.value || option.textContent",
    "function isDataCommercializationContactForm()",
    "data_commercialization_form_start",
    "data_commercialization_lead_submitted",
    "בלי פרטים אישיים או רגישים",
    "אין לשלוח קבצים או מידע גולמי, אישי, סודי או רגיש.",
]:
    if marker not in HOME_JS:
        raise SystemExit(f"Service funnel validation failed: missing contextual form behavior {marker}")
success_branch = HOME_JS.split("if (res.ok) {", 1)[1].split("} else {", 1)[0]
if HOME_JS.count("trackEvent('data_commercialization_lead_submitted'") != 1 or "trackEvent('data_commercialization_lead_submitted'" not in success_branch:
    raise SystemExit("Service funnel validation failed: data lead event must fire once and only after successful submission")

service_numbers = re.findall(r"class=\"svc-n\">(\\d+)</div>", HOME)
if len(service_numbers) != len(set(service_numbers)):
    raise SystemExit("Service funnel validation failed: homepage service numbers must be unique")
for marker in [".data-service", "max-width:700px", ".data-faq"]:
    if marker not in CSS:
        raise SystemExit(f"Service style validation failed: missing {marker}")

for marker in ['https://wa.me/972547951161?text=', 'תיווך בעסקאות מידע עסקי', 'בעל המידע מתקשר ישירות', 'אין לנו גישה עצמאית']:
    if marker not in PAGE:
        raise SystemExit(f"Service brokerage validation failed: missing {marker}")
if 'https://wa.me/9720547951161?' in PAGE:
    raise SystemExit("Service WhatsApp validation failed: incorrect international phone number")
for filename, needles in {
    'blog/ai-ready-business-data/index.html': ['GoFlow מסייעת באיתור רוכשים', 'בלי לשלוח קבצים'],
    'blog/business-data-value/index.html': ['תיווך ומסחור מידע עסקי', 'אינה מחזיקה במידע'],
    'blog/database-transfer-privacy/index.html': ['מי עושה מה בעסקת מידע?', 'GoFlow פועלת כמתווכת עסקית'],
    'services/index.html': ['תיווך בעסקאות מידע עסקי'],
    'index.html': ['תיווך בעסקאות מידע עסקי'],
}.items():
    doc = Path(filename).read_text(encoding='utf-8')
    for needle in needles:
        if needle not in doc:
            raise SystemExit(f"Brokerage content validation failed: {filename} missing {needle}")

print("Data brokerage page, shared contact routing, articles, internal links and sitemap validated.")
