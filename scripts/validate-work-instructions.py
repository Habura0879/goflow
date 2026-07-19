from pathlib import Path

AGENTS = Path('AGENTS.md')
SKILL = Path('skills/goflow-social-campaigns/SKILL.md')
WORKFLOW = Path('.github/workflows/deploy.yml')

for path in (AGENTS, SKILL, WORKFLOW):
    if not path.exists():
        raise SystemExit(f'Work instructions validation failed: missing {path}')

agents = AGENTS.read_text(encoding='utf-8')
skill = SKILL.read_text(encoding='utf-8')
workflow = WORKFLOW.read_text(encoding='utf-8')

required_agents = [
    'skills/goflow-social-campaigns/SKILL.md',
    'לא להסתמך על זיכרון',
    'מחקר → ממצאים → חלופות → סיכונים → תוכנית → אישור → ביצוע → בדיקות → PR → מיזוג',
    'AGENTS.md ותיקיית `skills/` הם קבצי עבודה פנימיים',
]
for marker in required_agents:
    if marker not in agents:
        raise SystemExit(f'AGENTS validation failed: missing {marker}')

required_skill = [
    'name: goflow-social-campaigns',
    'assets/platform-short-link.js',
    'assets/measured-links.js',
    'getTrackingParams',
    'Formspree ראשון',
    'quiz_attempt_id',
    'lead_status=complete',
    'interaction_type=form_submit',
    'קליקים על קישורים',
    'לשונית `לידים`',
    'WhatsApp Status',
    'Facebook Story',
    'Facebook Post',
    'LinkedIn Post',
    '1080×1920',
    '1080×1350',
    'לא מזכירים CRM במסרים אלא אם נושא הקמפיין עצמו הוא CRM',
    'בדיקת קצה לקצה לפני פרסום',
    'קמפיין מלא, מדיד, ניתן לשחזור וללא פגיעה במסלולים קיימים',
]
for marker in required_skill:
    if marker not in skill:
        raise SystemExit(f'Campaign skill validation failed: missing {marker}')

if skill.count('utm_source') < 3 or skill.count('utm_medium') < 3:
    raise SystemExit('Campaign skill validation failed: UTM guidance is incomplete')
if skill.count('click_id') < 5:
    raise SystemExit('Campaign skill validation failed: click_id guidance is incomplete')

required_workflow = [
    'python3 scripts/validate-work-instructions.py',
    'AGENTS.md',
    'skills/**',
]
for marker in required_workflow:
    if marker not in workflow:
        raise SystemExit(f'Deploy workflow validation failed: missing {marker}')

validation_pos = workflow.index('python3 scripts/validate-work-instructions.py')
deploy_pos = workflow.index('uses: SamKirkland/FTP-Deploy-Action')
if validation_pos > deploy_pos:
    raise SystemExit('Deploy workflow validation failed: work instructions must be validated before FTP deploy')

exclude_pos = workflow.index('exclude: |')
for marker in ('AGENTS.md', 'skills/**'):
    if workflow.index(marker) < exclude_pos:
        raise SystemExit(f'Deploy workflow validation failed: {marker} must be inside the FTP exclude block')

print('GoFlow campaign work instructions validated and protected from public FTP deployment.')
