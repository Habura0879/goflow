from pathlib import Path


def update_file(path, replacements, required):
    file_path = Path(path)
    text = file_path.read_text(encoding='utf-8')
    for old, new, label in replacements:
        count = text.count(old)
        if count != 1:
            raise SystemExit(f'Guard failed for {path} / {label}: expected 1 match, found {count}')
        text = text.replace(old, new, 1)
    for needle in required:
        if needle not in text:
            raise SystemExit(f'Validation failed for {path}: missing {needle}')
    file_path.write_text(text, encoding='utf-8')


update_file(
    'index.html',
    [
        (
            '<meta name="description" content="GoFlow — ייעוץ תהליכי ואפיון CRM לעסקים בישראל. מיפוי תהליכי עבודה, בניית נהלים, תכנון אוטומציות והכנת מסמכי אפיון למיישם.">',
            '<meta name="description" content="GoFlow מסייעת לעסקים וארגונים למפות תהליכי עבודה, לאפיין מערכות CRM, לתכנן אוטומציות ולהטמיע יכולות AI בצורה מבוקרת ומדידה.">',
            'meta description'
        ),
        (
            '<meta property="og:description" content="GoFlow מאבחנת צווארי בקבוק, בונה תהליכים שעובדים ומאפיינת מערכות ואוטומציות בהתאם לצורכי העסק.">',
            '<meta property="og:description" content="GoFlow מאבחנת צווארי בקבוק ובונה תהליכים שמשלבים מערכות, אוטומציה ו־AI בהתאם לצורכי העסק.">',
            'open graph description'
        ),
        (
            '<meta name="twitter:description" content="ייעוץ תהליכי, אוטומציה ו-CRM לעסקים שרוצים לצמוח בלי כאוס.">',
            '<meta name="twitter:description" content="ייעוץ תהליכי, מערכות, אוטומציה והטמעת AI לעסקים שרוצים לצמוח בלי כאוס.">',
            'twitter description'
        ),
        (
            '"description": "ייעוץ תהליכי, תכנון אוטומציה ואפיון CRM לארגונים — מאבחון ועד מסמך דרישות וליווי היישום.",',
            '"description": "ייעוץ תהליכי, אפיון מערכות, תכנון אוטומציה והטמעת AI לארגונים — מאבחון ועד ליווי היישום.",',
            'professional service description'
        ),
        (
            '    "CRM",\n    "נהלי עבודה"',
            '    "CRM",\n    "הטמעת AI בתהליכי עבודה",\n    "נהלי עבודה"',
            'professional service types'
        ),
        (
            '"jobTitle": "יועץ תפעול, תהליכים ואוטומציה",',
            '"jobTitle": "יועץ תהליכים והטמעת טכנולוגיה, אוטומציה ו־AI",',
            'founder job title'
        ),
        (
            '"description": "ייעוץ תהליכי, אוטומציה ו-CRM לארגונים בישראל",',
            '"description": "ייעוץ תהליכי, מערכות, אוטומציה והטמעת AI לארגונים בישראל",',
            'website description'
        ),
        (
            '    "אפיון מערכות CRM",\n    "כתיבת נהלי עבודה",',
            '    "אפיון מערכות CRM",\n    "הטמעת AI בתהליכי עבודה",\n    "כתיבת נהלי עבודה",',
            'organization knows about AI'
        ),
    ],
    [
        'הטמעת AI בתהליכי עבודה',
        'יועץ תהליכים והטמעת טכנולוגיה, אוטומציה ו־AI',
    ]
)

update_file(
    'about/index.html',
    [
        (
            '    "אפיון מערכות CRM",\n    "כתיבת נהלי עבודה"',
            '    "אפיון מערכות CRM",\n    "הטמעת AI בתהליכי עבודה",\n    "כתיבת נהלי עבודה"',
            'person knows about AI'
        ),
    ],
    ['"הטמעת AI בתהליכי עבודה"']
)

update_file(
    'services/ai-business-processes/index.html',
    [
        (
            '<meta property="og:image" content="https://goflow.co.il/og-image.jpg">',
            '<meta property="og:image" content="https://goflow.co.il/og-image.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="הטמעת AI בתהליכי עבודה | GoFlow"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="הטמעת AI בתהליכי עבודה | GoFlow"><meta name="twitter:description" content="לא עוד כלי AI. תהליך עבודה מסודר, מבוקר ומדיד."><meta name="twitter:image" content="https://goflow.co.il/og-image.jpg"><meta name="twitter:image:alt" content="הטמעת AI בתהליכי עבודה | GoFlow">',
            'social metadata'
        ),
        (
            '"description":"איתור תהליכים מתאימים, הגדרת מידע ובקרה אנושית, אפיון וליווי ההטמעה עד לשימוש בפועל."',
            '"description":"איתור תהליכים מתאימים, הגדרת מידע ובקרה אנושית, אפיון וליווי ההטמעה עד לשימוש בפועל.","audience":{"@type":"BusinessAudience","audienceType":"עסקים וארגונים"},"category":"ייעוץ תהליכי והטמעת בינה מלאכותית"',
            'service schema audience'
        ),
    ],
    [
        'twitter:card',
        'BusinessAudience',
        'הטמעת AI בתהליכי עבודה | GoFlow',
    ]
)

sitemap = Path('sitemap.xml')
text = sitemap.read_text(encoding='utf-8')
urls_to_update = [
    'https://goflow.co.il/',
    'https://goflow.co.il/about/',
    'https://goflow.co.il/services/',
    'https://goflow.co.il/services/process-consulting/',
    'https://goflow.co.il/services/business-automation/',
    'https://goflow.co.il/services/ai-business-processes/',
    'https://goflow.co.il/services/crm-consulting/',
    'https://goflow.co.il/services/work-procedures/',
]
for url in urls_to_update:
    start = text.find(f'<loc>{url}</loc>')
    if start == -1:
        raise SystemExit(f'Sitemap guard failed: missing {url}')
    end = text.find('</url>', start)
    block = text[start:end]
    import re
    updated, count = re.subn(r'<lastmod>[^<]+</lastmod>', '<lastmod>2026-07-07</lastmod>', block, count=1)
    if count != 1:
        raise SystemExit(f'Sitemap guard failed: missing lastmod for {url}')
    text = text[:start] + updated + text[end:]

if text.count('<lastmod>2026-07-07</lastmod>') < len(urls_to_update):
    raise SystemExit('Sitemap validation failed')
sitemap.write_text(text, encoding='utf-8')

print('Phase 3 SEO migration completed and validated.')
