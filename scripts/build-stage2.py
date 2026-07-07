from pathlib import Path


def read(path):
    return Path(path).read_text(encoding='utf-8')


def write(path, text):
    Path(path).write_text(text, encoding='utf-8')


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'Guard failed for {label}: expected 1 match, found {count}')
    return text.replace(old, new, 1)


def insert_before_once(text, marker, block, label):
    count = text.count(marker)
    if count != 1:
        raise SystemExit(f'Guard failed for {label}: expected 1 marker, found {count}')
    return text.replace(marker, block + marker, 1)


def add_nav_links(text, label):
    if '/services/ai-business-processes/' not in text:
        desktop_variants = [
            ('<li><a href="/services/">שירותים</a></li>', '<li><a href="/services/">שירותים</a></li><li><a href="/services/ai-business-processes/">AI לעסקים</a></li>'),
            ('    <li><a href="/services/">שירותים</a></li>', '    <li><a href="/services/">שירותים</a></li>\n    <li><a href="/services/ai-business-processes/">AI לעסקים</a></li>'),
        ]
        changed = False
        for old, new in desktop_variants:
            if old in text:
                text = text.replace(old, new, 1)
                changed = True
                break
        if not changed:
            raise SystemExit(f'Guard failed for {label} desktop nav')

    drawer_needles = [
        '<a href="/services/" onclick="closeDrawer()">שירותים</a>',
        '<a href="/services/" onclick="closeDrawer()">שירותים</a>',
    ]
    if text.count('/services/ai-business-processes/') < 2:
        changed = False
        for old in drawer_needles:
            if old in text:
                text = text.replace(old, old + '<a href="/services/ai-business-processes/" onclick="closeDrawer()">AI לעסקים</a>', 1)
                changed = True
                break
        if not changed:
            raise SystemExit(f'Guard failed for {label} mobile nav')
    return text

# About page: direct positioning, metadata and copy.
path = 'about/index.html'
html = read(path)
html = add_nav_links(html, 'about')
html = replace_once(html,
    '<title>מי עומד מאחורי GoFlow — אבי עמר | ייעוץ תהליכי ואוטומציה</title>',
    '<title>אבי עמר — יועץ תהליכים, אוטומציה ו־AI | GoFlow</title>',
    'about title')
html = replace_once(html,
    '<meta name="description" content="אבי עמר — יועץ תפעול, תהליכים ואוטומציה. סמנכ״ל תפעול לשעבר, מקים GoFlow. עוזר לעסקים לזהות איפה העבודה נתקעת ולבנות תהליכים שמחזיקים לאורך זמן.">',
    '<meta name="description" content="אבי עמר — יועץ תהליכים והטמעת טכנולוגיה, אוטומציה ו־AI. מחבר בין הצורך העסקי, תהליך העבודה והטכנולוגיה עד לפתרון שעובד בפועל.">',
    'about description')
html = html.replace('יועץ תפעול, תהליכים ואוטומציה', 'יועץ תהליכים והטמעת טכנולוגיה, אוטומציה ו־AI')
html = replace_once(html,
    '<p class="about-text">ב־GoFlow אני עוזר לעסקים וארגונים לזהות איפה העבודה נתקעת, לסדר אחריות, לבנות תהליכי עבודה ברורים, ולחבר נכון בין אנשים, מחלקות, מערכות ואוטומציות.</p>',
    '<p class="about-text">ב־GoFlow אני עוזר לעסקים וארגונים לזהות איפה העבודה נתקעת, לסדר אחריות, לבנות תהליכי עבודה ברורים ולחבר נכון בין אנשים, מחלקות, מערכות, אוטומציות ויכולות AI.</p><p class="about-text">אני מחבר בין הצורך העסקי, תהליך העבודה והטכנולוגיה — כולל שילוב יכולות AI במקום שבו הן מייצרות ערך אמיתי, נשארות בשליטה אנושית וניתנות למדידה.</p>',
    'about AI paragraph')
html = replace_once(html,
    '<h3>מחברים ומאטמטים נכון</h3>\n          <p>רק אחרי שהתהליך ברור — מחליטים מה נכון לחבר בין מערכות ומה נכון להפוך לאוטומטי.</p>',
    '<h3>מחברים טכנולוגיה נכון</h3>\n          <p>רק אחרי שהתהליך ברור מחליטים מה נכון לנהל במערכת, מה להפוך לאוטומטי ואיפה AI יכול לתת ערך אמיתי.</p>',
    'about method')
html = html.replace('alt="אבי עמר — מייסד GoFlow, יועץ תפעול ותהליכים"', 'alt="אבי עמר — מייסד GoFlow, יועץ תהליכים, אוטומציה ו־AI"')
write(path, html)

# Direct related blocks on service pages.
service_blocks = {
    'services/business-automation/index.html': ('אוטומציה או AI?', 'אוטומציה מתאימה כאשר אפשר להגדיר כלל קבוע. AI מתאים כאשר צריך להבין טקסט, מסמך או מידע שאינו אחיד. לעיתים הפתרון הנכון משלב ביניהם.'),
    'services/crm-consulting/index.html': ('AI בתוך תהליך CRM', 'יכולות AI יכולות לסכם פניות, לזהות מידע חסר ולהציע את הפעולה הבאה — אך הן אינן מחליפות תהליך מכירה ושירות מוגדר היטב.'),
    'services/process-consulting/index.html': ('היכן AI יכול לתמוך בתהליך?', 'לאחר שמגדירים את העבודה והאחריות, בודקים אילו פעולות כדאי לנהל במערכת, להפוך לאוטומטיות או לתמוך בהן באמצעות AI.'),
    'services/work-procedures/index.html': ('נהלים לשימוש מבוקר ב־AI', 'כאשר עובדים משתמשים ב־AI, הנוהל צריך להגדיר איזה מידע מותר להזין, מה חייבים לבדוק, מי מאשר ואיפה נשמרת התוצאה.'),
}
for path, (title, body) in service_blocks.items():
    html = read(path)
    html = add_nav_links(html, path)
    if 'data-ai-related="true"' not in html:
        block = f'<section class="service-section tint" data-ai-related="true"><div class="service-section-inner"><h2>{title}</h2><div class="service-copy"><p>{body}</p></div><div class="service-related"><a href="/services/ai-business-processes/">לשירות הטמעת AI בתהליכי עבודה ←</a></div></div></section>\n'
        html = insert_before_once(html, '<section class="service-cta">', block, f'{path} AI block')
    write(path, html)

# General contact form: direct interest field and privacy warning.
path = 'index.html'
html = read(path)
if 'name="interest"' not in html:
    marker = '<div class="frow">\n          <label for="name">שם מלא</label>'
    block = '<div class="frow">\n          <label for="interest">במה תרצו להתמקד?</label>\n          <select id="interest" name="interest" required><option value="">בחרו</option><option>תהליך עבודה</option><option>CRM או מערכת</option><option>אוטומציה</option><option>הטמעת AI</option><option>עדיין לא ברור</option></select>\n        </div>\n        '
    html = insert_before_once(html, marker, block, 'homepage interest field')
if 'אין להזין בטופס מידע אישי, סודי או רגיש.' not in html:
    html = insert_before_once(html, '<button type="submit"', '<p class="form-note">אין להזין בטופס מידע אישי, סודי או רגיש.</p>\n        ', 'homepage privacy note')
write(path, html)

# Privacy page: direct AI section.
path = 'privacy/index.html'
html = read(path)
html = add_nav_links(html, 'privacy')
if 'data-ai-privacy="true"' not in html:
    block = '<section data-ai-privacy="true"><h2>פניות ותהליכים בנושא AI</h2><p>בטפסים ובשיחות התאמה ניתן למסור תיאור כללי של תהליך העבודה והאתגר העסקי. אין להזין מידע אישי, סודי, רפואי, כספי או מידע מזהה של לקוחות ועובדים. המידע שנמסר משמש לבדיקת התאמה וליצירת קשר, ועשוי לעבור דרך ספקי טפסים ומדידה חיצוניים בהתאם להעדפות הקוקיז שנבחרו.</p></section>\n'
    html = insert_before_once(html, '</main>', block, 'privacy AI section')
write(path, html)

# Final validation.
checks = {
    'about/index.html': ['יועץ תהליכים והטמעת טכנולוגיה, אוטומציה ו־AI', 'מחברים טכנולוגיה נכון'],
    'index.html': ['name="interest"', 'אין להזין בטופס מידע אישי, סודי או רגיש.'],
    'privacy/index.html': ['data-ai-privacy="true"'],
}
for path, needles in checks.items():
    text = read(path)
    for needle in needles:
        if needle not in text:
            raise SystemExit(f'Post-build validation failed for {path}: missing {needle}')
for path in service_blocks:
    if 'data-ai-related="true"' not in read(path):
        raise SystemExit(f'Post-build validation failed for {path}')
print('Stage 2 direct HTML integration built and validated successfully.')
