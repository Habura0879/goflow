#!/usr/bin/env python3
"""Guard the reversible, brokerage-led GoFlow homepage without new infrastructure."""
from pathlib import Path
from html.parser import HTMLParser
import re

HOME = Path("index.html").read_text(encoding="utf-8")
PAGE = Path("services/data-commercialization/index.html").read_text(encoding="utf-8")
HUB = Path("services/index.html").read_text(encoding="utf-8")
CONSULT = Path("services/process-consulting/index.html").read_text(encoding="utf-8")
SERVICES_CSS = Path("assets/services.css").read_text(encoding="utf-8")
CSS = Path("assets/home.css").read_text(encoding="utf-8")
ROLLBACK = Path("docs/rollback-to-original-site-2026-10.md").read_text(encoding="utf-8")
WORKFLOW = Path(".github/workflows/deploy.yml").read_text(encoding="utf-8")


def require(condition, message):
    if not condition:
        raise SystemExit("GoFlow brokerage positioning validation failed: " + message)


class AnchorParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.links = []
        self.h1s = 0
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"):
            self.ids.append(a["id"])
        if tag == "a" and "href" in a:
            self.links.append(a["href"])
        if tag == "h1":
            self.h1s += 1


hp = AnchorParser()
hp.feed(HOME)
dp = AnchorParser()
dp.feed(PAGE)
for anchor in ("hero", "problem", "ai-home-intro", "quiz", "services", "process", "contact", "data-opportunity"):
    require(anchor in hp.ids, f"homepage anchor {anchor} missing")
require(len(hp.ids) == len(set(hp.ids)), "duplicate homepage anchor IDs")
require(hp.h1s == 1 and dp.h1s == 1, "expected one H1 on each landing page")
require(HOME.index('id="hero"') < HOME.index('id="data-opportunity"') < HOME.index('id="problem"'), "brokerage introduction order is broken")
require('href="/?service=data-commercialization#contact"' in HOME, "brokerage contextual contact CTA missing")
require('href="/services/process-consulting/"' in HOME, "organizational consulting path removed")
require('name="phone"' in HOME and '<option>מסחור מידע עסקי לחברות AI</option>' in HOME, "original lead form changed unexpectedly")
require('href="/services/ai-business-processes/"' in HOME, "existing AI consultancy content removed")
require("מידע חברתי" in PAGE and "כלכלה וכספים" in PAGE and "מסחר ושירות" in PAGE and "חינוך, ארכיונים ומחקר" in PAGE, "broad info categories missing")
require(len(re.findall(r'class="service-step"', PAGE)) == 7, "service page must reflect exactly seven brokerage phases")
require("התהליך מוצג לצורך המחשה בלבד" in PAGE, "transaction flexibility disclaimer missing")
require("אין התחייבות לעסקה" in PAGE and "מידע אישי מזהה" in PAGE, "legal and privacy notices absent")
require("שותפי הפניה" not in HOME and "שותפי הפניה" not in PAGE and "שותפי הפניה" not in HUB, "referral partner content is out of scope")
require(".data-opportunity-grid" in CSS, "scoped mobile-aware homepage styles missing")
require('class="business-selector"' in HOME and 'class="business-selector-choice is-selected"' in HOME, "homepage must show two business options with brokerage as default")
require('/assets/home.css?v=9' in HOME and '/assets/home.css?v=8' not in HOME, "home stylesheet version must change to prevent old mobile CSS cache")
require('class="business-selector-tabs"' in HOME, "business options must render as styled tabs")
require('#hero .business-selector-tabs{' in CSS, "the tabs must have dedicated hero-only styles")
require('#hero .business-selector-choice.is-selected strong,#hero .business-selector-choice.is-selected span{color:#1e1b16}' in CSS, "selected gold tab text must remain readable")
require('#data-opportunity{padding-inline:clamp(1.5rem,5vw,4rem)' in CSS, "business data section must have explicit inset independent of cached old section rules")
require('#data-opportunity{padding-right:1.5rem;padding-left:1.5rem}' in CSS, "mobile business data section must retain left and right margins")

require(HOME.index('class="business-selector"') < HOME.index("<h1"), "business choice selector must appear above homepage H1")
require('href="/services/process-consulting/"' in HOME.split('class="business-selector"', 1)[1].split('</div>', 1)[0], "consulting must be selectable at the top")
require('href="/"' in HOME.split('class="business-selector"', 1)[1].split('</div>', 1)[0], "brokerage tab must return to the default brokerage homepage")
require('href="/services/process-consulting/"' in CONSULT.split('class="business-selector"', 1)[1].split('</div>', 2)[0], "consulting tab must remain available when consulting is active")
require('href="/"' in CONSULT.split('class="business-selector"', 1)[1].split('</div>', 2)[0], "consulting page must offer a tab back to brokerage")
require('class="business-selector-choice is-selected" href="/services/process-consulting/"' in CONSULT, "consulting tab must be active on consulting page")
require('class="business-selector-choice is-selected" href="/"' in HOME, "brokerage tab must be active on brokerage page")
require(CONSULT.count('<h1>') == 1 and 'תהליכים נכונים.<br><em>תוצאות אמיתיות.</em>' in CONSULT, "original GoFlow consulting hero heading must be restored")
require('GoFlow מאבחנת צווארי בקבוק, מתכננת מחדש תהליכי עבודה' in CONSULT, "original consulting subheading must be restored")
require('/assets/services.css?v=8' in CONSULT, "consulting page must request corrected cache-busted palette")
require('.service-hero.consulting-hero{' in SERVICES_CSS and '.consulting-hero .business-selector-tabs{' in SERVICES_CSS, "consulting hero must use matching tab styling with distinct accent")
require('linear-gradient(132deg,var(--ink-2) 10%,var(--ink-3) 60%,var(--ink) 100%)' in SERVICES_CSS, "consulting hero must use GoFlow charcoal palette, no turquoise")
require('.consulting-hero .business-selector-choice.is-selected{background:var(--paper-2);border-color:var(--gold-l)' in SERVICES_CSS, "consulting active tab must use GoFlow cream/gold rather than turquoise")
require('.consulting-hero .service-btn{border-radius:2px;min-height:46px;background:var(--gold);border-color:var(--gold)' in SERVICES_CSS, "consulting call to action must use original GoFlow gold")
require(not any(c in SERVICES_CSS for c in ('#a2d4c9','#c3e3da','#b7d6ce','#91c5bd','#202c2c','#263433','#172321')), "old turquoise colors must not remain in stylesheet")
require('href="/#quiz"' in CONSULT and 'href="/#contact"' in CONSULT, "consulting diagnostic and contact routes must remain available")
require("לא רק תכנון והנדסה" not in HOME, "outdated architecture-first negative framing remains")
require('.data-opportunity{padding:clamp(3.5rem,7vw,6.5rem) clamp(1.5rem,5vw,4rem)' in CSS, "the mobile data section must preserve horizontal page gutters")
require('GoFlow בישראל, בשיתוף SellSideData' in PAGE, "the Israeli collaboration needs contextual framing")
require('איני שולח מידע גולמי בשלב זה' not in PAGE, "obsolete WhatsApp template closing sentence remains")
require("%D7%90%D7%99%D7%A0%D7%99%20%D7%A9%D7%95%D7%9C%D7%97" not in PAGE, "obsolete encoded WhatsApp sentence remains")

require("backup/site-before-data-redesign-2026-10-24" in ROLLBACK and "18b1f87b91019783e92ffc6b2006c1e92d5d6250" in ROLLBACK, "permanent baseline not documented")
require("branches:\n      - main" in WORKFLOW, "deployment trigger changed unexpectedly")
require(not any('<input type="file"' in p for p in (HOME, PAGE)), "do not collect business or sensitive source files through site forms")
print("GoFlow brokerage positioning, broad coverage, consulting continuity and long-term rollback guard passed.")
