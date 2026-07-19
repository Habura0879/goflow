from pathlib import Path

PAGE = Path('operations-diagnosis/index.html').read_text(encoding='utf-8')
LEAD_JS = Path('assets/operations-lead-first.js').read_text(encoding='utf-8')
LEAD_CSS = Path('assets/operations-lead-first.css').read_text(encoding='utf-8')
SHORT_JS = Path('assets/platform-short-link.js').read_text(encoding='utf-8')

CLICK_WEBHOOK = 'https://script.google.com/macros/s/AKfycbwBupU9NsVFQD7G9eqWoNS8B6EVIBymSqp3WhykccnzbZwkz52pb-zvDkXj_QPfMgA/exec'
LEAD_WEBHOOK = 'https://script.google.com/macros/s/AKfycbxYVmacixUKR071kabelmPep55790mmTFszMijZ9heSR9UFvdaqqvxhCv162q59zY6h/exec'

required_page_markers = [
    '<link rel="canonical" href="https://goflow.co.il/operations-diagnosis/">',
    '/assets/operations-lead-first.css?v=1',
    '/assets/campaign-landing.js?v=3',
    '/assets/operations-lead-first.js?v=1',
    '/assets/measured-links.js?v=1',
    '/assets/campaign-quiz-engine.js?v=9',
]
for marker in required_page_markers:
    if marker not in PAGE:
        raise SystemExit(f'Operations page validation failed: missing {marker}')

landing_pos = PAGE.index('/assets/campaign-landing.js?v=3')
lead_first_pos = PAGE.index('/assets/operations-lead-first.js?v=1')
measured_pos = PAGE.index('/assets/measured-links.js?v=1')
engine_pos = PAGE.index('/assets/campaign-quiz-engine.js?v=9')
if not landing_pos < lead_first_pos < measured_pos < engine_pos:
    raise SystemExit('Operations page validation failed: renderer, lead-first adapter, measurement and quiz engine order is incorrect')

required_lead_js = [
    f"var leadSheetWebhook = '{LEAD_WEBHOOK}';",
    "document.body.classList.add('operations-lead-first');",
    "id=\"operations-top-lead-form\"",
    "data-measured-path=\"/operations-diagnosis/#top-phone\"",
    "data-measured-path=\"/operations-diagnosis/#top-whatsapp\"",
    "data-measured-path=\"/operations-diagnosis/#start-quiz\"",
    "data.set('source', 'campaign_operations_lead_first');",
    "data.set('diagnosis_source', 'operations');",
    "data.set('landing_variant', 'lead_first');",
    "data.set('quiz_attempt_id', submissionId);",
    "data.set('lead_status', 'complete');",
    "data.set('interaction_type', 'form_submit');",
    "fetch(campaignConfig.formspree_endpoint",
    "sendToSheet(data);",
    "operations_top_form_submitted",
]
for marker in required_lead_js:
    if marker not in LEAD_JS:
        raise SystemExit(f'Operations lead-first validation failed: missing {marker}')

attempt_pos = LEAD_JS.index("data.set('quiz_attempt_id', submissionId);")
formspree_pos = LEAD_JS.index('fetch(campaignConfig.formspree_endpoint')
sheet_pos = LEAD_JS.index('sendToSheet(data);')
success_pos = LEAD_JS.index("form.innerHTML = '<section class=\"operations-lead-success\"")
if not attempt_pos < formspree_pos < sheet_pos < success_pos:
    raise SystemExit('Operations lead flow validation failed: ID, Formspree, sheet and success order is incorrect')
if LEAD_JS.count('sendToSheet(data);') != 1:
    raise SystemExit('Operations lead flow validation failed: expected one sheet write call')
if 'fetch(leadSheetWebhook' in LEAD_JS:
    raise SystemExit('Operations lead flow validation failed: do not add a parallel fetch path to the lead webhook')
if 'CRM' in LEAD_JS:
    raise SystemExit('Operations messaging validation failed: CRM must not appear in operations lead-first messaging')

required_css = [
    '.operations-lead-first .landing-hero-inner',
    '.operations-actions',
    '.operations-lead-grid',
    '.operations-quiz-section',
    '@media(max-width:600px)',
]
for marker in required_css:
    if marker not in LEAD_CSS:
        raise SystemExit(f'Operations CSS validation failed: missing {marker}')

required_short_js = [
    "var config = window.GOFLOW_SHORT_LINK || {};",
    f"var clickWebhook = '{CLICK_WEBHOOK}';",
    "event_type: 'short_link_click'",
    "short_path: window.location.pathname",
    "destination_url: target.toString()",
    "target.searchParams.set('click_id', clickId)",
    "window.location.replace(target.toString())",
]
for marker in required_short_js:
    if marker not in SHORT_JS:
        raise SystemExit(f'Platform short-link validation failed: missing {marker}')
if LEAD_WEBHOOK in SHORT_JS:
    raise SystemExit('Platform short-link validation failed: click redirects must not use the lead webhook')

short_links = [
    ('ops-wa/index.html', 'https://goflow.co.il/ops-wa/', 'whatsapp', 'status'),
    ('ops-fb-story/index.html', 'https://goflow.co.il/ops-fb-story/', 'facebook', 'story'),
    ('ops-fb-post/index.html', 'https://goflow.co.il/ops-fb-post/', 'facebook', 'post'),
    ('ops-linkedin/index.html', 'https://goflow.co.il/ops-linkedin/', 'linkedin', 'post'),
]
for path, public_url, source, medium in short_links:
    html = Path(path).read_text(encoding='utf-8')
    markers = [
        '<meta name="robots" content="noindex,nofollow">',
        f'<meta property="og:url" content="{public_url}">',
        "destination: '/operations-diagnosis/'",
        f"utm_source: '{source}'",
        f"utm_medium: '{medium}'",
        "utm_campaign: 'organic_diagnosis'",
        "utm_content: 'operations_day3'",
        '/assets/platform-short-link.js?v=1',
    ]
    for marker in markers:
        if marker not in html:
            raise SystemExit(f'Operations short-link validation failed for {path}: missing {marker}')
    if 'CRM' in html:
        raise SystemExit(f'Operations messaging validation failed for {path}: CRM must not appear')

print('Operations funnel validated: lead-first page, Formspree-first lead flow, measured CTAs and four isolated platform links.')
