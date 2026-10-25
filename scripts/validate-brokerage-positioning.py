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
for anchor in ("hero", "data-opportunity", "contact"):
    require(anchor in hp.ids, "brokerage home missing " + anchor)
for anchor in ("hero", "problem", "ai-home-intro", "quiz", "services", "process", "why", "stats", "blog", "about", "contact"):
    require(anchor in cp.ids, "consulting page missing " + anchor)
for anchor in ("problem", "ai-home-intro", "quiz", "services", "process", "why", "stats", "blog", "about"):
    require(anchor not in hp.ids, "consulting-only section incorrectly remains in brokerage home: " + anchor)
require("data-opportunity" not in cp.ids, "brokerage-only market sectors moved into consulting world")

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
require('/assets/home.css?v=9' in HOME, "original brokerage style path must be preserved")
require('GoFlow בישראל, בשיתוף SellSideData' in PAGE, "international cooperation copy changed")
require("שותפי הפניה" not in HOME and "שותפי הפניה" not in CONSULT and "שותפי הפניה" not in PAGE and "שותפי הפניה" not in HUB, "referral partners are out of scope")
require(len(re.findall(r'class="service-step"', PAGE)) == 7, "brokerage seven phases missing")
require('אין התחייבות לעסקה' in PAGE and 'מידע אישי מזהה' in PAGE, "brokerage legal disclaimers missing")
require("backup/site-before-data-redesign-2026-10-24" in ROLLBACK and "18b1f87b91019783e92ffc6b2006c1e92d5d6250" in ROLLBACK, "original rollback checkpoint changed")
require("branches:\n      - main" in WORKFLOW, "main-only deployment trigger changed")
require(not any('<input type="file"' in p for p in (HOME, CONSULT, PAGE)), "no raw data uploads on contact forms")
print("GoFlow brokerage and consulting worlds fully separated; both forms, quiz, links and rollback preserved.")
