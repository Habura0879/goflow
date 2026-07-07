from pathlib import Path
import re


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
    desktop_nav = re.search(r'<ul class="(?:site-nav-links|nav-links)">(.*?)</ul>', text, flags=re.S)
    if not desktop_nav:
        raise SystemExit(f'Guard failed for {label} desktop nav container')
    if '/services/ai-business-processes/' not in desktop_nav.group(1):
        pattern = r'(<li><a href="/services/"(?: class="active")?>שירותים</a></li>)'
        text, count = re.subn(pattern, r'\1<li><a href="/services/ai-business-processes/">AI לעסקים</a></li>', text, count=1)
        if count != 1:
            raise SystemExit(f'Guard failed for {label} desktop nav')

    drawer = re.search(r'<div class="drawer" id="drawer">(.*?)</div>', text, flags=re.S)
    if not drawer:
        raise SystemExit(f'Guard failed for {label} mobile nav container')
    if '/services/ai-business-processes/' not in drawer.group(1):
        needle = '<a href="/services/" onclick="closeDrawer()">שירותים</a>'
        if text.count(needle) != 1:
            raise SystemExit(f'Guard failed for {label} mobile nav')
        text = text.replace(needle, needle + '<a href="/services/ai-business-processes/" onclick="closeDrawer()">AI לעסקים</a>', 1)
    return text

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

path = 'index.html'
html = read(path)

name_source = '<div class="frow"><label>שם מלא</label><input type="text" name="name" placeholder="הכניסו את שמכם" required></div>'
name_and_phone = '<div class="frow"><label for="contact-name">שם מלא <span class="required-mark" aria-hidden="true">*</span></label><input id="contact-name" type="text" name="name" placeholder="הכניסו את שמכם" autocomplete="name" required></div>\n          <div class="frow"><label for="contact-phone">טלפון <span class="required-mark" aria-hidden="true">*</span></label><input id="contact-phone" type="tel" name="phone" placeholder="050-0000000" inputmode="tel" autocomplete="tel" dir="ltr" required></div>'
html = replace_once(html, name_source, name_and_phone, 'homepage required name and phone fields')

email_source = '<div class="frow"><label>אימייל</label><input type="email" name="email" placeholder="example@email.com" dir="ltr" required></div>'
email_optional = '<div class="frow"><label>אימייל <span class="optional-label">(לא חובה)</span></label><input type="email" name="email" placeholder="example@email.com" autocomplete="email" dir="ltr"></div>'
html = replace_once(html, email_source, email_optional, 'homepage optional email')

message_source = '<div class="frow"><label>הודעה</label><textarea name="message" placeholder="ספרו לנו קצת על הארגון והאתגרים" required></textarea></div>'
message_optional = '<div class="frow"><label>הודעה <span class="optional-label">(לא חובה)</span></label><textarea name="message" placeholder="ספרו לנו קצת על הארגון והאתגרים"></textarea></div>'
html = replace_once(html, message_source, message_optional, 'homepage optional message')

if 'name="interest"' not in html:
    marker = name_and_phone
    block = '<div class="frow"><label for="interest">במה תרצו להתמקד? <span class="optional-label">(לא חובה)</span></label><select id="interest" name="interest"><option value="">בחרו</option><option>תהליך עבודה</option><option>CRM או מערכת ניהול</option><option>אוטומציה</option><option>הטמעת AI</option><option>עדיין לא ברור</option></select></div>\n          '
    html = insert_before_once(html, marker, block, 'homepage interest field')

if 'id="stage2-form-style"' not in html:
    style = '<style id="stage2-form-style">.frow select{width:100%;background:var(--paper);border:1px solid var(--border);border-radius:var(--r);color:var(--ink);font-family:var(--fb);font-size:1rem;padding:.75rem 1rem;outline:none;transition:border-color .2s;direction:rtl;min-height:48px}.frow select:focus{border-color:var(--border-g)}.required-mark{color:#b42318;font-weight:700;margin-inline-start:.18rem}.optional-label{font-size:.72em;letter-spacing:0;text-transform:none;font-weight:400;color:var(--muted)}</style>\n'
    html = insert_before_once(html, '</head>', style, 'homepage form styles')

if 'אין להזין בטופס מידע אישי, סודי או רגיש.' not in html:
    marker = '<button type="submit" class="btn-submit" id="submitBtn">שליחה ←</button>'
    html = insert_before_once(html, marker, '<p class="form-note">אין להזין בטופס מידע אישי, סודי או רגיש.</p>\n          ', 'homepage privacy note')
write(path, html)

path = 'privacy/index.html'
html = read(path)
html = add_nav_links(html, 'privacy')
if 'data-ai-privacy="true"' not in html:
    marker = '    <h2 class="section-title">7. יצירת קשר</h2>'
    block = '    <h2 class="section-title" data-ai-privacy="true">7. פניות ותהליכים בנושא AI</h2>\n    <p class="body-text">בטפסים ובשיחות התאמה ניתן למסור תיאור כללי של תהליך העבודה והאתגר העסקי. אין להזין מידע אישי, סודי, רפואי, כספי או מידע מזהה של לקוחות ועובדים. המידע שנמסר משמש לבדיקת התאמה וליצירת קשר, ועשוי לעבור דרך ספקי טפסים ומדידה חיצוניים בהתאם להעדפות הקוקיז שנבחרו.</p>\n\n'
    html = insert_before_once(html, marker, block, 'privacy AI section')
    html = replace_once(html, marker, '    <h2 class="section-title">8. יצירת קשר</h2>', 'privacy contact numbering')
write(path, html)

checks = {
    'about/index.html': ['יועץ תהליכים והטמעת טכנולוגיה, אוטומציה ו־AI', 'מחברים טכנולוגיה נכון'],
    'index.html': ['name="phone"', 'CRM או מערכת ניהול', 'required-mark', 'name="email" placeholder="example@email.com" autocomplete="email" dir="ltr">', 'name="message" placeholder="ספרו לנו קצת על הארגון והאתגרים"></textarea>', 'אין להזין בטופס מידע אישי, סודי או רגיש.'],
    'privacy/index.html': ['data-ai-privacy="true"', '8. יצירת קשר'],
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
