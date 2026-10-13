from pathlib import Path
import json
import re

PAGE = Path("services/data-commercialization/index.html").read_text(encoding="utf-8")
CSS = Path("assets/data-service.css").read_text(encoding="utf-8")
HUB = Path("services/index.html").read_text(encoding="utf-8")
HOME = Path("index.html").read_text(encoding="utf-8")
HOME_JS = Path("assets/home.js").read_text(encoding="utf-8")
SITEMAP = Path("sitemap.xml").read_text(encoding="utf-8")

for marker in [
    '<html lang="he" dir="rtl">',
    '<title>מסחור מידע עסקי לחברות AI | GoFlow</title>',
    '<link rel="canonical" href="https://goflow.co.il/services/data-commercialization/">',
    '<h1>האם המידע של הארגון שלכם יכול לעניין חברות AI?</h1>',
    'href="/?service=data-commercialization#contact"',
    'data-measured-link',
    'נושא הפנייה יסומן מראש בטופס',
    'מידע אישי מזהה',
    'אין התחייבות לעסקה',
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
if "<option>מסחור מידע עסקי לחברות AI</option>" not in HOME:
    raise SystemExit("Service funnel validation failed: existing contact form must classify this service")
for marker in [
    "params.get('service') !== 'data-commercialization'",
    "interest.value = option.value || option.textContent",
    "בלי פרטים אישיים או רגישים",
    "אין לשלוח קבצים או מידע גולמי, אישי, סודי או רגיש.",
]:
    if marker not in HOME_JS:
        raise SystemExit(f"Service funnel validation failed: missing contextual form behavior {marker}")
service_numbers = re.findall(r"class=\"svc-n\">(\\d+)</div>", HOME)
if len(service_numbers) != len(set(service_numbers)):
    raise SystemExit("Service funnel validation failed: homepage service numbers must be unique")
for marker in [".data-service", "max-width:700px", ".data-faq"]:
    if marker not in CSS:
        raise SystemExit(f"Service style validation failed: missing {marker}")

print("Data commercialization page, shared contact routing, internal links and sitemap validated.")
