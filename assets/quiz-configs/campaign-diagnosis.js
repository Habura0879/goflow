window.CAMPAIGN_DIAGNOSIS = {
  quiz_id: 'campaign_diagnosis_v1',
  quiz_name: 'אבחון תפעולי לקמפיינים',
  whatsapp_phone: '9720547951161',
  formspree_endpoint: 'https://formspree.io/f/maqzwlqy',
  sheet_webhook_url: 'https://script.google.com/macros/s/AKfycbxYVmacixUKR071kabelmPep55790mmTFszMijZ9heSR9UFvdaqqvxhCv162q59zY6h/exec',
  category_priority: ['process', 'responsibility', 'system', 'adoption', 'manual'],
  categories: {
    process: { icon: '◌', title: 'תהליך עבודה', desc: 'כדאי לחדד את רצף העבודה ואת נקודות המעבר בין שלבים.', priority_desc: 'זו נקודת המוצא: מיפוי תהליך, הגדרת שלבים ואחריות לפני בחירת כלי.' },
    system: { icon: '◈', title: 'מערכת ומידע', desc: 'כדאי לוודא שיש מקור מידע מרכזי ותמונת מצב שאפשר לסמוך עליה.', priority_desc: 'המערכת והמידע מפוזרים או אינם תומכים בעבודה היומיומית מספיק.' },
    adoption: { icon: '↗', title: 'הטמעה ושימוש', desc: 'כדאי לבדוק האם הצוות משתמש במערכת כחלק מהעבודה השוטפת.', priority_desc: 'יש פער בין המערכת לבין העבודה בפועל; הצוות זקוק לתהליך שימוש ברור.' },
    manual: { icon: '⌁', title: 'עבודה ידנית', desc: 'כדאי לזהות פעולות חוזרות שאפשר לצמצם או להפוך לאוטומטיות.', priority_desc: 'יותר מדי זמן מושקע בפעולות ידניות, עדכונים והעברת מידע בין כלים.' },
    responsibility: { icon: '◎', title: 'אחריות ומעקב', desc: 'כדאי להגדיר בעלות ברורה ומעקב משותף על משימות ופניות.', priority_desc: 'משימות ופניות עלולות להיתקע במעברים; נדרשים בעלות וסטטוס ברורים.' }
  },
  results: {
    process: {
      title: 'האתגר המרכזי: תהליך העבודה עדיין לא מוגדר מספיק',
      text: 'לפי התשובות שלך, הבעיה המרכזית אינה בהכרח חוסר במערכת, אלא חוסר בדרך עבודה ברורה ועקבית. כאשר האחריות, השלבים והמעברים בין עובדים אינם מוגדרים, גם מערכת טובה לא תפתור את הבעיה לבדה.',
      recommendation: 'הצעד הראשון המומלץ: למפות את התהליך, להגדיר אחריות ולבנות דרך עבודה ברורה לפני בחירת פתרון טכנולוגי.'
    },
    system: {
      title: 'האתגר המרכזי: המערכת אינה תומכת מספיק בעבודה בפועל',
      text: 'נראה שהמידע והעבודה מפוזרים בין כמה כלים, או שהמערכת הקיימת אינה נותנת תמונת מצב מלאה. במצב כזה נוצרים כפילויות, חוסר עקביות ותלות בכלים חיצוניים.',
      recommendation: 'הצעד הראשון המומלץ: לבדוק אם המערכת דורשת התאמה, חיבור למערכות אחרות או החלפה — לאחר אפיון מסודר של הצרכים.'
    },
    adoption: {
      title: 'האתגר המרכזי: המערכת קיימת, אבל אינה חלק אמיתי משיטת העבודה',
      text: 'לפי התשובות שלך, יש פער בין המערכת לבין ההתנהלות היומיומית. כאשר עובדים עוקפים את המערכת, משתמשים רק בחלק ממנה או חוזרים לאקסל ולווטסאפ, המידע אינו אמין והמערכת אינה מייצרת שליטה.',
      recommendation: 'הצעד הראשון המומלץ: לבדוק את התאמת המערכת לתהליך, להגדיר שימוש מחייב ולבנות הטמעה שמתאימה לעבודה בפועל.'
    },
    manual: {
      title: 'האתגר המרכזי: יותר מדי עבודה מתבצעת ידנית',
      text: 'נראה שחלק משמעותי מהזמן מושקע בהעתקות, עדכונים, תזכורות והעברת מידע בין כלים. עבודה כזו מגדילה סיכון לטעויות ומונעת מהצוות להתמקד במשימות החשובות.',
      recommendation: 'הצעד הראשון המומלץ: לזהות אילו פעולות חוזרות על עצמן, אילו מהן ניתנות לצמצום, ורק אז להחליט מה נכון להפוך לאוטומטי.'
    },
    responsibility: {
      title: 'האתגר המרכזי: אין מספיק בהירות לגבי אחריות ומעקב',
      text: 'לפי התשובות שלך, משימות ופניות עלולות להיתקע במעברים בין עובדים או מחלקות. כאשר לא ברור מי אחראי ומה הסטטוס, נוצרים עיכובים, טעויות ותלות במנהל.',
      recommendation: 'הצעד הראשון המומלץ: להגדיר בעל תפקיד אחראי לכל שלב, כללי העברה ברורים ותמונת מצב משותפת.'
    }
  },
  form_copy: {
    title: 'רוצה שנעבור יחד על התוצאה ונבדוק מה כדאי לתקן קודם?',
    subtitle: 'בשיחת בדיקה קצרה נבין אם הבעיה נמצאת בתהליך, במערכת, בהטמעה או בחלוקת האחריות — ומה נכון לעשות לפני שמתחילים להוציא כסף על פתרון.',
    toggle_open: 'לקבלת שיחת בדיקה קצרה', toggle_close: 'סגירת הטופס', submit_default: 'לקבלת שיחת בדיקה קצרה', submit_loading: 'שולחים…', submit_success: 'הפרטים התקבלו',
    success_message: 'תודה. קיבלנו את הפרטים ואת תוצאת האבחון ונחזור אליכם בהקדם.', error_message: 'השליחה לא הושלמה. נסו שוב או שלחו לנו את התוצאה בוואטסאפ.'
  },
  fields: {
    name_label: 'שם מלא', name_placeholder: 'השם שלך', phone_label: 'טלפון', phone_placeholder: '054-0000000',
    company_label: 'שם העסק', company_placeholder: 'שם העסק', email_label: 'דואר אלקטרוני (רשות)', email_placeholder: 'example@email.com',
    employee_count_label: 'מספר עובדים (רשות)', employee_count_placeholder: 'למשל 12'
  },
  first_question_by_source: {
    automation: { text: 'איזו עבודה ידנית חוזרת על עצמה אצלכם הכי הרבה?' },
    crm: { text: 'איפה מתנהל רוב המידע על לידים, לקוחות ופניות?' },
    operations: { text: 'איפה משימות, פניות ועדכונים נוטים להיתקע?' },
    general: { text: 'איפה מתנהל רוב המידע השוטף בעסק?' }
  },
  secondary_emphasis: {
    automation: ['manual', 'process', 'adoption', 'system', 'responsibility'],
    crm: ['system', 'adoption', 'responsibility', 'process', 'manual'],
    operations: ['responsibility', 'process', 'manual', 'system', 'adoption'],
    general: ['process', 'responsibility', 'system', 'adoption', 'manual']
  },
  questions: [
    { text: 'איפה מתנהל רוב המידע השוטף בעסק?', dimensions: ['system','process'], opts: [
      { label: 'במערכת מרכזית אחת', score: 0 }, { label: 'בכמה מערכות שונות', score: 1 }, { label: 'בווטסאפ, דואר אלקטרוני ואקסל', score: 3 }, { label: 'בעיקר בזיכרון ובשיחות', score: 4 }, { label: 'לא בטוח', score: 2 }
    ] },
    { text: 'כאשר משימה או פנייה עוברת בין עובדים, האם תמיד ברור מי אחראי להמשך?', dimensions: ['responsibility'], opts: [
      { label: 'תמיד', score: 0 }, { label: 'בדרך כלל', score: 1 }, { label: 'לפעמים', score: 2 }, { label: 'לעיתים קרובות לא', score: 3 }, { label: 'כמעט אף פעם לא', score: 4 }
    ] },
    { text: 'האם משימות, פניות או בקשות נופלות בין הכיסאות?', dimensions: ['responsibility','process'], opts: [
      { label: 'כמעט אף פעם', score: 0 }, { label: 'לעיתים רחוקות', score: 1 }, { label: 'לפעמים', score: 2 }, { label: 'לעיתים קרובות', score: 3 }, { label: 'זו בעיה קבועה', score: 4 }
    ] },
    { text: 'כמה מהעבודה השוטפת כוללת העתקות, הזנות כפולות, תזכורות או עדכונים ידניים?', dimensions: ['manual'], opts: [
      { label: 'כמעט כלום', score: 0 }, { label: 'מעט', score: 1 }, { label: 'חלק משמעותי', score: 2 }, { label: 'הרבה', score: 3 }, { label: 'רוב העבודה', score: 4 }
    ] },
    { text: 'אם קיימת מערכת, עד כמה הצוות באמת משתמש בה?', dimensions: ['system','adoption'], opts: [
      { label: 'אין מערכת', score: 3 }, { label: 'כולם משתמשים באופן עקבי', score: 0 }, { label: 'רוב העובדים משתמשים', score: 1 }, { label: 'משתמשים רק בחלק מהמערכת', score: 2 }, { label: 'עוקפים את המערכת ועובדים בכלים אחרים', score: 4 }
    ] },
    { text: 'האם ניתן לקבל תמונת מצב עדכנית בלי לפנות לכמה עובדים?', dimensions: ['system','process'], opts: [
      { label: 'כן, באופן מיידי', score: 0 }, { label: 'בדרך כלל', score: 1 }, { label: 'רק לאחר איסוף מידע', score: 2 }, { label: 'זה דורש הרבה בדיקות', score: 3 }, { label: 'אין תמונת מצב אמינה', score: 4 }
    ] },
    { text: 'מה קורה כאשר עובד מרכזי נעדר?', dimensions: ['responsibility','process'], opts: [
      { label: 'העבודה ממשיכה כרגיל', score: 0 }, { label: 'יש האטה קלה', score: 1 }, { label: 'נוצר בלבול', score: 2 }, { label: 'משימות נעצרות', score: 3 }, { label: 'רק אותו אדם יודע מה קורה', score: 4 }
    ] },
    { text: 'כאשר רוצים לשפר תהליך או להכניס מערכת, האם מוגדר מראש איך העבודה אמורה להתנהל?', dimensions: ['process','adoption'], opts: [
      { label: 'כן, יש תהליך ברור ומתועד', score: 0 }, { label: 'יש כיוון כללי', score: 1 }, { label: 'חלקית בלבד', score: 2 }, { label: 'מתחילים מהכלי ומחליטים תוך כדי', score: 3 }, { label: 'אין תהליך מוגדר', score: 4 }
    ] }
  ]
};

window.createCampaignDiagnosisConfig = function(pageConfig){
  var base = window.CAMPAIGN_DIAGNOSIS;
  return Object.assign({}, base, pageConfig || {}, {
    quiz_id: base.quiz_id,
    questions: base.questions,
    categories: base.categories,
    results: base.results,
    category_priority: base.category_priority,
    fields: base.fields,
    form_copy: base.form_copy,
    first_question_by_source: base.first_question_by_source
  });
};
