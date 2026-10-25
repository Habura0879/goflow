#!/usr/bin/env python3
"""Verify GoFlow's separated brokerage and consulting worlds, lead funnels and durable rollback."""
from pathlib import Path
from html.parser import HTMLParser
import re

HOME = Path("index.html").read_text(encoding="utf-8")
PAGE = Path("services/data-commercialization/index.html").read_text(encoding="utf-8")
HUB = Path("services/index.html").read_text(encoding="utf-8")
CONSULT = Path("services/process-consulting/index.html").read_text(encoding="utf-8")
SERVICES_CSS = Path("assets/services.css").read_text(encoding="utf-8")
CSS = Path("assets/home.css").read_text(encoding="utf-8")
CONSULT_CSS = Path("assets/consulting-landing.css").read_text(encoding="utf-8")
JS = Path("assets/home.js").read_text(encoding="utf-8")
ROLLBACK = Path("docs/rollback-to-original-site-2026-10.md").read_text(encoding="utf-8")
WORKFLOW = Path(".github/workflows/deploy.yml").read_text(encoding="utf-8")

def require(condition, message):
    if not condition:
        raise SystemExit("GoFlow two-business-world validation failed: " + message)

class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.h1s = 0
        self.forms = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"):
            self.ids.append(a["id"])
        if tag == "h1":
            self.h1s += 1
        if tag == "form":
            self.forms.append(a.get("id"))

hp, cp, dp = PageParser(), PageParser(), PageParser()
hp.feed(HOME)
cp.feed(CONSULT)
dp.feed(PAGE)

require(hp.h1s == cp.h1s == dp.h1s == 1, "each landing page must have one H1")
require(len(hp.ids) == len(set(hp.ids)), "duplicate IDs on brokerage home")
require(len(cp.ids) == len(set(cp.ids)), "duplicate IDs on consultation landing")
require(hp.forms.count("contactForm") == cp.forms.count("contactForm") == 1, "both worlds need one working contact form")
for anchor in ("hero", "data-opportunity", "data-fit", "data-journey", "data-trust", "data-questions", "contact"):
    require(anchor in hp.ids, "brokerage home missing " + anchor)
for anchor in ("hero", "problem", "ai-home-intro", "quiz", "services", "process", "why", "stats", "blog", "about", "contact"):
    require(anchor in cp.ids, "consulting page missing " + anchor)
for anchor in ("problem", "ai-home-intro", "quiz", "services", "process", "why", "stats", "blog", "about"):
    require(anchor not in hp.ids, "consulting-only section incorrectly remains in brokerage home: " + anchor)
for anchor in ("data-opportunity", "data-fit", "data-journey", "data-trust", "data-questions"):
    require(anchor not in cp.ids, "brokerage-only section moved into consulting world: " + anchor)
require([HOME.index('id="' + a + '"') for a in ("hero", "data-opportunity", "data-fit", "data-journey", "data-trust", "data-questions", "contact")] == sorted(HOME.index('id="' + a + '"') for a in ("hero", "data-opportunity", "data-fit", "data-journey", "data-trust", "data-questions", "contact")), "brokerage sections have unexpected order")
require(len(re.findall(r'class="brokerage-step-num"', HOME)) == 7, "brokerage homepage must display all seven established steps")
require("מהבדיקה הראשונית לעסקה אפשרית" in HOME and "תיאור כללי של סוג המידע" in HOME, "brokerage education and safety copy is incomplete")
require("GoFlow · תיווך במאגרי מידע מישראל לעולם" in HOME and "הזדמנויות בשוק המידע העולמי" in HOME, "independent brokerage international value proposition missing from home")
require("GoFlow בוחנת עבור בעלי חברות וארגונים בישראל אפשרויות לתיווך במאגרי מידע" in HOME, "new homepage message missing")
require(HOME.count("<details>") >= 5 and HOME.count("<summary>") >= 5, "brochure FAQ must work without extra JavaScript")
require("אין התחייבות למציאת רוכש" in HOME and "עצם סגירת החברה אינה מקנה" in HOME, "brokerage FAQ and process must avoid overpromising")
require('.brokerage-faq{' in CSS and '.brokerage-steps{' in CSS and '.brokerage-fit-grid{' in CSS and '.brokerage-trust{' in CSS, "new sections must follow the existing GoFlow responsive design")

require(HOME.count('class="brokerage-feature-icon"') == 4, "the four fit indicators need distinct accessible decorative icons")
require(HOME.count('class="brokerage-trust-icon"') == 3, "the three privacy points need visual anchors")
require(HOME.count('class="brokerage-partner-identity"') == 1, "international market identity diagram must remain visually intact")
require('class="brokerage-partner-connection"' in HOME and '<strong>בעלי מידע</strong>' in HOME and '<strong>שוק בינלאומי</strong>' in HOME, "independent Israel-to-world visual missing")
require('.brokerage-steps li:not(:last-child)::after{' in CSS, "seven stages must be connected as a chronological timeline")
require('.brokerage-step-num{' in CSS and 'border-radius:50%' in CSS, "timeline visual numbering missing")
require('.brokerage-faq summary::before{' in CSS and '.brokerage-faq details[open]' in CSS, "questions must have visible numbers and an open state")
require('.brokerage-trust .brokerage-lead{color:rgba(247,244,238,.85)' in CSS, "contrast of trust section text is insufficient")
require('grid-template-columns:47px minmax(0,1fr)' in CSS, "narrow viewport timeline could overflow")
require('.brokerage-feature-icon svg{' in CSS, "lightweight vector icon style missing")
require('.brokerage-section{padding:3.5rem 1.5rem}' in CSS, "mobile horizontal margins must not regress")

require('href="/?service=data-commercialization#contact"' in HOME, "brokerage CTA no longer reaches its form")
require('href="/services/process-consulting/"' in HOME, "consulting tab missing on brokerage page")
require('class="business-selector-choice is-selected" href="/"' in HOME, "brokerage must be selected by default")
require('class="business-selector-choice is-selected" href="/services/process-consulting/"' in CONSULT, "consulting tab must be selected in consulting page")
require('href="/"' in CONSULT, "consulting to brokerage tab missing")
require('class="business-selector-tabs"' in HOME and 'class="business-selector-tabs"' in CONSULT, "visible dual tabs must appear in both worlds")
require(HOME.index('class="business-selector"') < HOME.index("<h1"), "brokerage tabs must appear above hero H1")
require(CONSULT.index('class="business-selector"') < CONSULT.index("<h1"), "consulting tabs must appear above hero H1")
require("תהליכים נכונים.<br><em>תוצאות אמיתיות.</em>" in CONSULT, "original consulting hero title not retained")
require("GoFlow מאבחנת צווארי בקבוק, מתכננת מחדש תהליכי עבודה" in CONSULT, "original consultation message removed")
require("המנכ״לים שמגיעים אלינו לא צריכים עוד רעיון." in CONSULT, "old consulting content was not migrated")
require('id="quizEngine"' in CONSULT and 'id="quizLeadForm"' in CONSULT, "functional 8-question organizational diagnosis missing")
require('data-ai-related="true"' in CONSULT, "unique consultation service details not preserved")
require("מוכנים להוריד עומס ולהחזיר שליטה לארגון?" in CONSULT, "organizational consulting contact message missing")
require("רוצים לבדוק את הפוטנציאל של המידע שלכם?" in HOME, "brokerage contact message missing")
require("<option>מסחור מידע עסקי לחברות AI</option>" in HOME, "brokerage lead classification missing")
require("<option>מסחור מידע עסקי לחברות AI</option>" not in CONSULT, "brokerage selection must not appear in consulting lead form")
require('name="phone"' in HOME and 'name="phone"' in CONSULT, "contact phone fields missing")
require('id="interest"' in HOME and 'id="interest"' in CONSULT, "lead form classification fields missing")
require('/assets/home.js?v=15' in HOME and '/assets/home.js?v=15' in CONSULT, "both funnels must load the new shared script")
require("if (!document.getElementById('quizEngine')) return;" in JS, "brokerage page must not crash when consulting-only diagnosis is absent")
require("data_commercialization_form_start" in JS and "data_commercialization_lead_submitted" in JS, "brokerage analytics events lost")
require("location.replace('/services/process-consulting/' + location.hash)" in HOME, "historical consulting deep links no longer resolve")
require("params.get('service') !== 'data-commercialization'" in HOME, "legacy consulting-contact redirect must exclude brokerage leads")
require('/assets/consulting-landing.css?v=1' in CONSULT and '.consulting-hero{' in CONSULT_CSS, "separate consulting layout style missing")
require('.data-opportunity-grid' in CSS and '#data-opportunity{padding-right:1.5rem;padding-left:1.5rem}' in CSS, "mobile sector spacing regressed")
require('/assets/home.css?v=11' in HOME, "new brokerage visual styles must be cache-busted")
require('GoFlow — החיבור שלכם לשוק המידע הבינלאומי' in PAGE, "independent brokerage message on service page missing")
require("GoFlow מלווה בעלי חברות וארגונים בישראל בבחינת אפשרויות לתיווך במאגרי מידע" in PAGE, "service page independent operation description missing")
require(not any(re.search(r"sellsidedata", p, flags=re.I) for p in (HOME, PAGE, CONSULT, HUB)), "external partner name or hyperlink still exists on public brokerage pages")
require(HOME.count('class="brokerage-partner"') == 1, "original styled market bridge panel removed")
require('<section class="service-section tint" aria-labelledby="international-data-title">' in PAGE, "original service-page layout missing")
require("שותפי הפניה" not in HOME and "שותפי הפניה" not in CONSULT and "שותפי הפניה" not in PAGE and "שותפי הפניה" not in HUB, "referral partners are out of scope")
require(len(re.findall(r'class="service-step"', PAGE)) == 7, "brokerage seven phases missing")
require('אין התחייבות לעסקה' in PAGE and 'מידע אישי מזהה' in PAGE, "brokerage legal disclaimers missing")
require("backup/site-before-data-redesign-2026-10-24" in ROLLBACK and "18b1f87b91019783e92ffc6b2006c1e92d5d6250" in ROLLBACK, "original rollback checkpoint changed")
require("branches:\n      - main" in WORKFLOW, "main-only deployment trigger changed")
require(not any('<input type="file"' in p for p in (HOME, CONSULT, PAGE)), "no raw data uploads on contact forms")
print("GoFlow brokerage and consulting worlds fully separated; both forms, quiz, links and rollback preserved.")
