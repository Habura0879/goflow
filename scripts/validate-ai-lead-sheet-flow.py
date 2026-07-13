from pathlib import Path

AI_JS = Path('assets/ai-service.js')
AI_PAGE = Path('services/ai-business-processes/index.html')

js = AI_JS.read_text(encoding='utf-8')
page = AI_PAGE.read_text(encoding='utf-8')

required_js_markers = [
    "var formspreeEndpoint = 'https://formspree.io/f/maqzwlqy';",
    "var sheetEndpoint = 'https://script.google.com/macros/s/AKfycbxYVmacixUKR071kabelmPep55790mmTFszMijZ9heSR9UFvdaqqvxhCv162q59zY6h/exec';",
    "data.set('source', 'ai_service_form');",
    "data.set('diagnosis_source', 'ai_service_form');",
    "data.set('lead_type', 'ai_implementation');",
    "data.set('lead_status', 'complete');",
    "data.set('interaction_type', 'form_submit');",
    "data.set('challenge', process);",
    "data.set('submitted_at', submittedAt);",
    "data.set('submission_id', submissionId);",
    "data.set('quiz_attempt_id', submissionId);",
    "data.set('quiz_summary', summary);",
    "data.set('attribution_json', JSON.stringify(tracking || {}));",
    "sendLeadToSheet(data);",
    "relayForm.action = sheetEndpoint;",
    "relayForm.target = iframeName;",
    "relayForm.submit();",
    "trackEvent('ai_lead_submitted'",
]

for marker in required_js_markers:
    if marker not in js:
        raise SystemExit(f'AI lead sheet validation failed: missing {marker}')

for obsolete in [
    "data.set('lead_status', 'new');",
    "data.set('interaction_type', 'lead_submit');",
]:
    if obsolete in js:
        raise SystemExit(f'AI lead sheet validation failed: obsolete marker still exists: {obsolete}')

required_page_markers = [
    'id="aiLeadForm"',
    'name="lead_type" value="ai_implementation"',
    'name="name" required',
    'name="phone" type="tel" required',
    'name="email" type="email" required',
    'name="process_to_improve" required',
    '/assets/ai-service.js?v=2',
]
for marker in required_page_markers:
    if marker not in page:
        raise SystemExit(f'AI lead form validation failed: missing {marker}')

attempt_id_assignment = js.index("data.set('quiz_attempt_id', submissionId);")
response_guard = js.index("if (!response.ok)")
sheet_send = js.index('sendLeadToSheet(data);')
success_message = js.index("submit.textContent = '✓ ההודעה נשלחה בהצלחה';")

if not attempt_id_assignment < response_guard < sheet_send < success_message:
    raise SystemExit(
        'AI lead sheet validation failed: quiz_attempt_id must be set before Formspree, '
        'and the sheet write must happen only after Formspree success and before the success UI'
    )

if js.count('sendLeadToSheet(data);') != 1:
    raise SystemExit('AI lead sheet validation failed: expected exactly one sheet write call')
if js.count("relayForm.action = sheetEndpoint;") != 1:
    raise SystemExit('AI lead sheet validation failed: expected exactly one central sheet endpoint relay')
if "fetch(sheetEndpoint" in js:
    raise SystemExit('AI lead sheet validation failed: do not add a parallel fetch path to the Apps Script webhook')

print('AI lead flow validated: Apps Script contract, attribution and Formspree-first order are correct.')
