# GoFlow — Project Context

## פרטי הפרויקט
- **אתר:** https://goflow.co.il
- **תיקייה מקומית:** `C:\goflow.co.il\goflow.co.il\public_html`
- **GitHub:** https://github.com/Habura0879/goflow (ענף: `main`)
- **Deploy:** אוטומטי — כל push ל-`main` עולה לשרת דרך GitHub Actions + FTP

## Deploy
```bash
git add -A
git commit -m "תיאור השינוי"
git push origin main
```
זהו. השרת מתעדכן תוך ~2 דקות.

## מבנה קבצים
```
public_html/
├── index.html                  ← דף הבית (כל CSS+JS inline)
├── assets/
│   ├── shared.css              ← nav, footer, WA, global (משותף לכל הדפים)
│   └── blog.css                ← סגנונות תוכן בלוג בלבד
├── blog/
│   ├── index.html              ← אינדקס הבלוג
│   ├── 5-signs-you-need-process-consulting/index.html
│   ├── crm-for-business-2026/index.html
│   ├── automation-for-business/index.html
│   └── work-procedures-guide/index.html
├── GoFlow_full_logo_black_transparent_1200px.png  ← לוגו על רקע בהיר
├── GoFlow_full_logo_white_transparent_1200px.png  ← לוגו על רקע כהה
├── GoFlow_icon_transparent_256x256.png            ← favicon
├── sitemap.xml
└── robots.txt
```

## עיצוב — צבעים
```css
--ink:     #1e1b16   /* כמעט שחור */
--paper:   #f7f4ee   /* קרם רקע */
--paper-2: #eeebe3   /* קרם כהה יותר */
--gold:    #b8832a   /* זהב ראשי */
--gold-l:  #d4a84b   /* זהב בהיר */
--muted:   #7a7268   /* אפור */
```

## עיצוב — פונטים
```css
--fd: 'Frank Ruhl Libre','Playfair Display',Georgia,serif  /* כותרות */
--fb: 'Rubik',system-ui,sans-serif                         /* גוף */
```
Google Fonts URL:
```
family=Frank+Ruhl+Libre:wght@400;700;900&family=Playfair+Display:wght@700;900&family=Rubik:wght@300;400;500
```

## תבנית דפים
כל הדפים (בית + בלוג) משתמשים באותו nav ו-footer מ-`assets/shared.css`:
- **Nav:** `<nav class="site-nav">` + לוגו שחור
- **Footer:** `<footer class="site-footer">` + לוגו שחור
- **WA Button:** fixed bottom-left, `class="wa-float"`
- **WhatsApp:** https://wa.me/9720547951161

## דף הבית (index.html)
- Hero עם וידאו Vimeo ברקע (ID: 1140542510)
- סקשנים: Hero, Problem, Services, Process, Why, Quiz, Stats, Blog, Contact, Footer
- צור קשר: Formspree `https://formspree.io/f/maqzwlqy`
- nav: `<nav>` עם `.logo`, `.nav-links`, `.nav-cta`

## בלוג
- 4 פוסטים קיימים
- כל פוסט מקשר ל-`/assets/shared.css` + `/assets/blog.css`
- זמן קריאה: מחושב אוטומטית ב-JS לפי מספר מילים ÷ 200
- הוספת פוסט חדש: צור תיקייה חדשה ב-`blog/` עם `index.html`, הוסף כרטיס ב-`blog/index.html` ובסקשן הבלוג ב-`index.html`, עדכן `sitemap.xml`

## שרת
- DirectAdmin shared hosting
- PHP זמין, shell_exec מנוטרל
- FTP credentials: ב-GitHub Secrets (FTP_HOST, FTP_USERNAME, FTP_PASSWORD)

## כללי עבודה
1. שינויים קטנים — Edit tool
2. שינויים גדולים — PowerShell לכמה קבצים בו-זמנית
3. תמיד push אחרי שינוי
4. לוגו: תמיד PNG מהתיקייה, לא SVG ידני
