from pathlib import Path
import json
import re

PAGE = Path("services/data-commercialization/index.html").read_text(encoding="utf-8")
JS = Path("assets/data-service.js").read_text(encoding="utf-8")
CSS = Path("assets/data-service.css").read_text(encoding="utf-8")
HUB = Path("services/index.html").read_text(encoding="utf-8")
HOME = Path("index.html").read_text(encoding="utf-8")
SITEMAP = Path("sitemap.xml").read_text(encoding="utf-8")

required_page = [
    '<html lang="he" dir="rtl">',
    '<title>מסחור מידע עסקי לחברות AI | GoFlow</title>',
    '<link rel="canonical" href="https://goflow.co.il/services/data-commercialization/">',
    '<meta name="robots" content="index, follow">',
    '<h1>האם המידע של הארגון שלכם יכול לעניין חברות AI?</h1>',
    'id="dataServiceLeadForm"',
    'name="lead_type" value="data_commercialization"',
    'אין להזין פרטי לקוחות, עובדים או מטופלים',
    'אין התחייבות לעסקה',
    '/assets/data-service.js?v=1',
    '/assets/measured-links.js?v=1',
]
for marker in required_page:
    if marker not in PAGE:
        raise SystemExit(f"Service page validation failed: missing {marker}")
if PAGE.count("<h1") != 1:
    raise SystemExit("Service page validation failed: expected exactly one H1")
if re.search(r'<input[^>]+type=["\']file', PAGE, re.I):
    raise SystemExit("Service page validation failed: file upload is forbidden")
if "data-service.css?v=1" not in PAGE:
    raise SystemExit("Service page validation failed: page CSS is missing")
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

for marker in [
    "https://formspree.io/f/maqzwlqy",
    "https://script.google.com/macros/s/AKfycbxYVmacixUKR071kabelmPep55790mmTFszMijZ9heSR9UFvdaqqvxhCv162q59zY6h/exec",
    "data.set('lead_type','data_commercialization');",
    "data.set('source','data_commercialization_form');",
    "data.set('attribution_json',JSON.stringify(tracking||{}));",
]:
    if marker not in JS:
        raise SystemExit(f"Service form validation failed: missing {marker}")
formspree_success = JS.index("if(!response.ok)")
sheet_write = JS.index("sendLeadToSheet(data);")
success_ui = JS.index("submit.textContent='✓ הבקשה נשלחה';")
if not formspree_success < sheet_write < success_ui:
    raise SystemExit("Service form validation failed: lead sheet must follow Formspree success")
if JS.count("sendLeadToSheet(data);") != 1 or "fetch(sheetEndpoint" in JS:
    raise SystemExit("Service form validation failed: unexpected secondary sheet path")

route = "https://goflow.co.il/services/data-commercialization/"
if SITEMAP.count(f"<loc>{route}</loc>") != 1:
    raise SystemExit("Service SEO validation failed: route must appear once in sitemap")
if route.replace("https://goflow.co.il", "") not in HUB or route.replace("https://goflow.co.il", "") not in HOME:
    raise SystemExit("Service SEO validation failed: internal links are missing")
for marker in [".data-service", "max-width:700px", ".data-form-grid"]:
    if marker not in CSS:
        raise SystemExit(f"Service style validation failed: missing {marker}")

print("Data commercialization page, form flow, internal links and sitemap validated.")
