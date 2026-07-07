from pathlib import Path
import runpy
import shutil

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
        '<p class="hero-sub">GoFlow מאבחנת את צווארי הבקבוק, ממפה ומעצבת מחדש תהליכים, משלבת טכנולוגיות חכמות ויוצרת זרימת עבודה יעילה שמסירה עומסים, מונעת טעויות ומאפשרת לארגון לצמוח בלי כאוס.</p>',
        '<p class="hero-sub">GoFlow מאבחנת צווארי בקבוק, מתכננת מחדש תהליכי עבודה ומשלבת מערכות, אוטומציה ו־AI במקום שבו הם מפחיתים עומס, מונעים טעויות ומאפשרים לארגון לצמוח בלי כאוס.</p>',
        'hero description'
    ),
    (
        '      <a class="svc-item" href="/services/work-procedures/"><div class="svc-n">05</div><div class="svc-title">נהלים</div><p class="svc-desc">כתיבת נהלי עבודה ברורים ומעשיים שכל עובד יכול לעקוב אחריהם.</p></a>',
        '      <a class="svc-item" data-ai-home-card="true" href="/services/ai-business-processes/"><div class="svc-n">05</div><div class="svc-title">הטמעת AI</div><p class="svc-desc">איתור תהליכים מתאימים, אפיון פתרונות AI, הגדרת בקרה אנושית וליווי ההקמה עד לשימוש בפועל.</p></a>\n      <a class="svc-item" href="/services/work-procedures/"><div class="svc-n">06</div><div class="svc-title">נהלים</div><p class="svc-desc">כתיבת נהלי עבודה ברורים ומעשיים שכל עובד יכול לעקוב אחריהם.</p></a>',
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
<style>
  #ai-home-intro{padding:clamp(3.5rem,7vw,6rem) 0;background:var(--paper-2);overflow:hidden}
  #ai-home-intro .ai-home-inner{max-width:850px;margin:0 auto;text-align:center;padding-inline:clamp(1rem,4vw,2rem)}
  #ai-home-intro h2{max-width:760px;margin-inline:auto;font-size:clamp(2.2rem,5vw,4.4rem);line-height:1.08;overflow-wrap:anywhere}
  #ai-home-intro .lead{max-width:760px;margin:0 auto 1.5rem;line-height:1.8}
  @media(max-width:700px){
    #ai-home-intro h2{font-size:clamp(2rem,10vw,2.8rem);line-height:1.15;word-break:normal;overflow-wrap:break-word}
    #ai-home-intro .lead{font-size:1.05rem;line-height:1.75}
    #ai-home-intro .btn-gold{width:min(100%,360px);box-sizing:border-box}
  }
</style>
<section id="ai-home-intro">
  <div class="container">
    <div class="fi ai-home-inner">
      <div class="eyebrow">AI בתהליכי עבודה</div>
      <h2>AI כבר קיים. השאלה היא האם הוא באמת עובד אצלכם.</h2>
      <div class="rule" style="margin:1.25rem auto"></div>
      <p class="lead">GoFlow הופכת שימוש אקראי ב־AI לתהליך עבודה מסודר, מבוקר ומדיד — כחלק מהמערכות והאחריות שכבר קיימות בארגון.</p>
      <a href="/services/ai-business-processes/" class="btn-gold" style="display:inline-block;text-decoration:none;padding:.85rem 1.5rem">לשירות AI לעסקים ←</a>
    </div>
  </div>
</section>

'''
html = html.replace(marker, ai_section + marker, 1)

html = html.replace('<script src="/assets/shared.js?v=12"></script>', '<script src="/assets/shared.js?v=13"></script>')

required = [
    'AI לעסקים',
    'id="ai-home-intro"',
    'תהליכים · מערכות · אוטומציה · AI',
    'data-ai-home-card="true"',
]
for text in required:
    if text not in html:
        raise SystemExit(f'Post-build validation failed: missing {text}')

path.write_text(html, encoding='utf-8')
print('Homepage AI integration built and validated successfully.')

runpy.run_path('scripts/build-stage2.py', run_name='__main__')

# Keep mobile select options fully Hebrew to avoid mixed RTL/LTR rendering.
html = path.read_text(encoding='utf-8')
html = html.replace('<option>CRM או מערכת ניהול</option>', '<option>מערכת לניהול לקוחות</option>')
html = html.replace('<option>הטמעת AI</option>', '<option>הטמעת בינה מלאכותית</option>')
if '<option>מערכת לניהול לקוחות</option>' not in html or '<option>הטמעת בינה מלאכותית</option>' not in html:
    raise SystemExit('Post-build validation failed for fully Hebrew contact form options')
path.write_text(html, encoding='utf-8')

shutil.rmtree('scripts')
print('Build scripts removed from deployment copy.')
