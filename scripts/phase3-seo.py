from pathlib import Path

checks = {
    'index.html': [
        'GoFlow מסייעת לעסקים וארגונים למפות תהליכי עבודה',
        'הטמעת AI בתהליכי עבודה',
        'יועץ תהליכים והטמעת טכנולוגיה, אוטומציה ו־AI',
        'ייעוץ תהליכי, מערכות, אוטומציה והטמעת AI לארגונים בישראל',
    ],
    'about/index.html': [
        '"הטמעת AI בתהליכי עבודה"',
        'יועץ תהליכים והטמעת טכנולוגיה, אוטומציה ו־AI',
    ],
    'services/ai-business-processes/index.html': [
        'twitter:card',
        'BusinessAudience',
        'הטמעת AI בתהליכי עבודה | GoFlow',
    ],
    'sitemap.xml': [
        '<loc>https://goflow.co.il/services/ai-business-processes/</loc>',
        '<lastmod>2026-07-07</lastmod>',
    ],
}

for path, required in checks.items():
    text = Path(path).read_text(encoding='utf-8')
    for needle in required:
        if needle not in text:
            raise SystemExit(f'Phase 3 SEO validation failed: {path} missing {needle}')

print('Phase 3 SEO source validation passed. No files were modified.')
