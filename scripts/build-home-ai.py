from pathlib import Path

path = Path('index.html')
html = path.read_text(encoding='utf-8')

replacements = [
    (
        '    <li><a href="/services/">שירותים</a></li>\n    <li><a href="#process">תהליך</a></li>',
        '    <li><a href="/services/">שירותים</a></li>\n    <li><a href="/services/ai-business-processes/">AI לעסקים</a></li>\n    <li><a href="#process">תהליך</a></li>',
        'desktop navigation'
    ),
    (
        '  <a href="/services/" onclick="closeDrawer()">שירותים</a>\n  <a href="#process"  onclick="closeDrawer()">תהליך עבודה</a>',
        '  <a href="/services/" onclick="closeDrawer()">שירותים</a>\n  <a href="/services/ai-business-processes/" onclick="closeDrawer()">AI לעסקים</a>\n  <a href="#process"  onclick="closeDrawer()">תהליך עבודה</a>',
        'mobile navigation'
    ),
    (
        '<div class="hero-eyebrow">ייעוץ תהליכי · אוטומציה · CRM</div>',
        '<div class="hero-eyebrow">תהליכים · מערכות · אוטומציה · AI</div>',
        'hero eyebrow'
    ),
    (
        '<p class="hero-sub">GoFlow מאבחנת את צווארי הבקבוק, ממפה ומעצבת מחדש תהליכי עבודה ומשלבת טכנולוגיות חכמות — כדי שהארגון יעבוד בצורה יעילה, מדויקת ורגועה יותר.</p>',
        '<p class="hero-sub">GoFlow מאבחנת צווארי בקבוק, מתכננת מחדש תהליכי עבודה ומשלבת מערכות, אוטומציה ו־AI במקום שבו הם מפחיתים עומס, מונעים טעויות ומאפשרים לארגון לצמוח בלי כאוס.</p>',
        'hero description'
    ),
    (
        '      <a class="svc-item" href="/services/work-procedures/"><div class="svc-n">05</div><div class="svc-title">נהלים</div><p class="svc-desc">כתיבת נהלי עבודה ברורים ומעשיים שכל עובד יכול לעקוב אחריהם.</p></a>',
        '      <a class="svc-item" href="/services/ai-business-processes/"><div class="svc-n">05</div><div class="svc-title">הטמעת AI</div><p class="svc-desc">איתור תהליכים מתאימים, אפיון פתרונות AI, הגדרת בקרה אנושית וליווי ההקמה עד לשימוש בפועל.</p></a>\n      <a class="svc-item" href="/services/work-procedures/"><div class="svc-n">06</div><div class="svc-title">נהלים</div><p class="svc-desc">כתיבת נהלי עבודה ברורים ומעשיים שכל עובד יכול לעקוב אחריהם.</p></a>',
        'AI service card'
    ),
    (
        '<a class="svc-item" href="/services/process-consulting/"><div class="svc-n">06</div><div class="svc-title">ליווי</div>',
        '<a class="svc-item" href="/services/process-consulting/"><div class="svc-n">07</div><div class="svc-title">ליווי</div>',
        'service numbering 7'
    ),
    (
        '<a class="svc-item svc-full" href="/services/process-consulting/"><div class="svc-n">07</div><div class="svc-title">תקשורת בין צוותים</div>',
        '<a class="svc-item svc-full" href="/services/process-consulting/"><div class="svc-n">08</div><div class="svc-title">תקשורת בין צוותים</div>',
        'service numbering 8'
    ),
    (
        '<p class="step-desc">עיצוב תהליכים חדשים, בחירת כלים טכנולוגיים, כתיבת נהלים ברורים.</p>',
        '<p class="step-desc">עיצוב תהליכים חדשים, הגדרת אחריות ובחירת מערכות, אוטומציות ויכולות AI לפי הצורך.</p>',
        'process step'
    ),
]

for old, new, label in replacements:
    count = html.count(old)
    if count != 1:
        raise SystemExit(f'Guard failed for {label}: expected exactly 1 match, found {count}')
    html = html.replace(old, new, 1)

marker = '<!-- QUIZ -->'
if html.count(marker) != 1:
    raise SystemExit(f'Guard failed for AI section marker: expected exactly 1, found {html.count(marker)}')

ai_section = '''<!-- AI BUSINESS -->
<section id="ai-business" style="padding:clamp(3.5rem,7vw,6rem) 0;background:var(--paper-2)">
  <div class="container">
    <div class="fi" style="max-width:850px;margin:0 auto;text-align:center">
      <div class="eyebrow">AI בתהליכי עבודה</div>
      <h2>AI כבר קיים. השאלה היא האם הוא באמת עובד אצלכם.</h2>
      <div class="rule" style="margin:1.25rem auto"></div>
      <p class="lead" style="margin:0 auto 1.5rem">GoFlow הופכת שימוש אקראי ב־AI לתהליך עבודה מסודר, מבוקר ומדיד — כחלק מהמערכות והאחריות שכבר קיימות בארגון.</p>
      <a href="/services/ai-business-processes/" class="btn-gold" style="display:inline-block;text-decoration:none;padding:.85rem 1.5rem">לשירות AI לעסקים ←</a>
    </div>
  </div>
</section>

'''
html = html.replace(marker, ai_section + marker, 1)

# Prevent the old dynamic integration from duplicating homepage content.
html = html.replace('<script src="/assets/shared.js?v=12"></script>', '<script src="/assets/shared.js?v=13"></script>')

required = [
    'AI לעסקים',
    'id="ai-business"',
    'תהליכים · מערכות · אוטומציה · AI',
    'הטמעת AI',
]
for text in required:
    if text not in html:
        raise SystemExit(f'Post-build validation failed: missing {text}')

path.write_text(html, encoding='utf-8')
print('Homepage AI integration built and validated successfully.')
