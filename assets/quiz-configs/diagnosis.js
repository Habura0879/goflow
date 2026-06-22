window.QUIZ_CONFIG = {
  quiz_id: 'diagnosis',
  quiz_name: 'האבחון התפעולי',
  intro_eyebrow: 'האבחון שלי',
  intro_title: 'האם הארגון שלכם זקוק לייעוץ תהליכי?',
  intro_subtitle: '8 שאלות קצרות. 3 דקות. תקבלו תשובה ישירה — איפה הארגון שלכם עומד ומה כדאי לתקן.',
  results_heading: 'האזורים שדורשים תשומת לב',
  whatsapp_phone: '9720547951161',
  whatsapp_button_text: 'שלחו לנו את התוצאות',
  formspree_endpoint: 'https://formspree.io/f/maqzwlqy',
  sheet_webhook_url: 'https://script.google.com/macros/s/AKfycbxQVBy5bUWZAwwjQWii_clzD6I2Q5Y4Qbwd6xSFbM8v3SpeV_LHO1mPlbG9frYr1mGl/exec',
  thresholds: { urgent: 0.6, medium: 0.35 },
  attention_thresholds: { urgent: 1, medium: 2, low: 1 },
  result_copy: {
    urgent: {
      badge: '⚠ דחוף — נדרש שינוי עכשיו',
      title: 'הארגון שלכם פועל על גבולות הכאוס.',
      sub: 'הניקוד שלכם מצביע על עומס תפעולי גבוה, תלויות מסוכנות ותהליכים שחיים בראשם של אנשים בודדים. כל אחד מהם לבד הוא בעיה — ביחד הם פצצה.',
      cta_title: 'בואו נדבר לפני שהשריפה הבאה מתחילה.',
      cta_text: 'פגישת אבחון קצרה — בלי עלות, בלי התחייבות. יוצאים עם תמונה ברורה.',
      whatsapp_intro: 'שלום GoFlow,%0Aמילאתי את האבחון באתר.%0Aאשמח לשמוע יותר.'
    },
    medium: {
      badge: 'ℹ יש מה לשפר — כדאי לפעול',
      title: 'יש לכם בסיס טוב — אבל יש בורות שמאטים אתכם.',
      sub: 'הארגון מתפקד, אבל ישנם אזורים שבהם אתם משלמים מחיר בזמן, בטעויות ובהזדמנויות שנפספסות. עם ליווי נכון אפשר לחסוך הרבה אנרגיה.',
      cta_title: 'נשמח לראות איפה אפשר לשחרר לכם עומס.',
      cta_text: 'שיחה קצרה — ובאים עם 2-3 המלצות מיידיות.',
      whatsapp_intro: 'שלום GoFlow,%0Aמילאתי את האבחון באתר.%0Aאשמח לשמוע יותר.'
    },
    low: {
      badge: '✓ תפעול מסודר יחסית',
      title: 'אתם בצד הטוב של המפה.',
      sub: 'הארגון שלכם עובד עם תהליכים סבירים. עדיין יש מקום לאופטימיזציה ולאוטומציות שיחסכו עוד זמן — אבל אין כאן מצב חירום.',
      cta_title: 'רוצים לראות מה עוד אפשר לייעל?',
      cta_text: 'שיחת ייעוץ קצרה — נגלה יחד את הפוטנציאל הנסתר.',
      whatsapp_intro: 'שלום GoFlow,%0Aמילאתי את האבחון באתר.%0Aאשמח לשמוע יותר.'
    }
  },
  form_copy: {
    toggle_open: 'השאירו פרטים',
    toggle_close: 'סגור טופס',
    title: 'רוצים שנחזור אליכם עם האבחון?',
    subtitle: 'השאירו פרטים ונקבל יחד עם הפנייה גם את תוצאת השאלון והתשובות שבחרתם.',
    submit_default: 'שליחת האבחון ←',
    submit_loading: 'שולח...',
    submit_success: '✓ האבחון נשלח',
    success_message: 'תודה. קיבלנו את הפרטים ואת תוצאת האבחון, ונחזור אליכם בהקדם.',
    error_message: 'אירעה שגיאה בשליחה. אפשר לשלוח דרך וואטסאפ.',
    network_error_message: 'בעיית תקשורת. אפשר לשלוח דרך וואטסאפ.'
  },
  fields: {
    name_label: 'שם מלא',
    name_placeholder: 'השם שלך',
    phone_label: 'טלפון',
    phone_placeholder: '054-0000000',
    email_label: 'אימייל',
    email_placeholder: 'example@email.com',
    company_label: 'שם חברה',
    company_placeholder: 'שם הארגון',
    challenge_label: 'מה האתגר המרכזי אצלכם היום?',
    challenge_placeholder: 'כתבו בקצרה מה הכי מפריע לתהליך לעבוד נכון'
  },
  questions: [
    {
      text: 'כמה עובדים יש בארגון שלכם?',
      dimension: 'scale',
      opts: [
        { label: 'עד 5 עובדים', score: 0 },
        { label: '6–20 עובדים', score: 1 },
        { label: '21–60 עובדים', score: 2 },
        { label: 'יותר מ-60 עובדים', score: 3 }
      ]
    },
    {
      text: 'כמה מחלקות / צוותים נפרדים יש שעובדים ביחד?',
      dimension: 'complexity',
      opts: [
        { label: 'צוות אחד — כולנו יחד', score: 0 },
        { label: '2–3 מחלקות', score: 1 },
        { label: '4–6 מחלקות', score: 2 },
        { label: '7 מחלקות ומעלה', score: 3 }
      ]
    },
    {
      text: 'איך מנהלים לקוחות ולידים — ממה שיצרו קשר עד לסגירה?',
      dimension: 'crm',
      opts: [
        { label: 'וואטסאפ / אקסל / זיכרון', score: 3 },
        { label: 'מערכת CRM אבל לא כולם משתמשים בה', score: 2 },
        { label: 'מערכת CRM — כולם עובדים איתה', score: 1 },
        { label: 'תהליך מסודר מקצה לקצה', score: 0 }
      ]
    },
    {
      text: 'מה קורה כשעובד מרכזי נעדר יום אחד?',
      dimension: 'dependency',
      opts: [
        { label: 'הכל נעצר — רק הוא יודע מה לעשות', score: 3 },
        { label: 'מסתדרים בקושי, מפספסים דברים', score: 2 },
        { label: 'מישהו ממלא מקום אבל זה לא חלק', score: 1 },
        { label: 'ממשיכים רגיל — יש תהליכים ברורים', score: 0 }
      ]
    },
    {
      text: 'כמה מהר מגיבים ללקוח שפנה לראשונה?',
      dimension: 'responsiveness',
      opts: [
        { label: 'כמה ימים — לפעמים נופל בין הכיסאות', score: 3 },
        { label: 'תוך שעות — תלוי מי זמין', score: 2 },
        { label: 'תוך שעה בדרך כלל', score: 1 },
        { label: 'תוך דקות — יש תהליך אוטומטי', score: 0 }
      ]
    },
    {
      text: 'האם יש נהלי עבודה כתובים שעובד חדש יכול ללמוד מהם?',
      dimension: 'procedures',
      opts: [
        { label: 'אין כלום — לומדים מהאוויר', score: 3 },
        { label: 'יש כמה דברים כתובים, לא מסודרים', score: 2 },
        { label: 'חלק מהתפקידים מתועדים', score: 1 },
        { label: 'יש נהלים ברורים לרוב התפקידים', score: 0 }
      ]
    },
    {
      text: 'האם מידע נופל בין צוותים — דברים שמישהו לא עדכן?',
      dimension: 'communication',
      opts: [
        { label: 'כן, כל הזמן — זה מקור תסכול יומי', score: 3 },
        { label: 'לפעמים, בעיקר בפרויקטים מורכבים', score: 2 },
        { label: 'מדי פעם, אנחנו כבר רגילים', score: 1 },
        { label: 'לא — יש ערוצי תקשורת סדורים', score: 0 }
      ]
    },
    {
      text: "כמה זמן בשבוע מנהלים מבלים ב'כיבוי שריפות' במקום עבודה אסטרטגית?",
      dimension: 'firefighting',
      opts: [
        { label: 'רוב השבוע — כמעט אין זמן לחשוב קדימה', score: 3 },
        { label: 'מחצית מהזמן בערך', score: 2 },
        { label: 'כמה שעות בשבוע', score: 1 },
        { label: 'מינימלי — יש שליטה על הסדר היום', score: 0 }
      ]
    }
  ],
  dims: {
    crm: {
      icon: '📊',
      title: 'ניהול לקוחות ו-CRM',
      desc: 'חסרה מערכת אחת שכולם עובדים איתה. לידים נאבדים, מעקב לא קבוע.'
    },
    dependency: {
      icon: '🔗',
      title: 'תלות באנשים',
      desc: 'תהליכים שחיים בראש של עובד ספציפי — סיכון מיידי לארגון.'
    },
    responsiveness: {
      icon: '⏱',
      title: 'מהירות תגובה ללקוח',
      desc: 'כל שעה שלקוח ממתין — פוטנציאל עסקי שנשחק.'
    },
    procedures: {
      icon: '📋',
      title: 'נהלים ותיעוד',
      desc: 'ללא נהלים כתובים כל עובד חדש מתחיל מאפס ועושה טעויות ישנות.'
    },
    communication: {
      icon: '💬',
      title: 'תקשורת בין מחלקות',
      desc: 'מידע שנופל בין צוותים = עבודה כפולה, לקוחות מתוסכלים.'
    },
    firefighting: {
      icon: '🚒',
      title: 'כיבוי שריפות',
      desc: 'כשהמנהל עסוק בשריפות הוא לא בונה. זה מעגל שחייבים לשבור.'
    }
  }
};
