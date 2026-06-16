// Drawer
function toggleDrawer(){
  document.getElementById('hbg').classList.toggle('open');
  document.getElementById('drawer').classList.toggle('open');
  document.body.style.overflow = document.getElementById('drawer').classList.contains('open') ? 'hidden' : '';
}
function closeDrawer(){
  document.getElementById('hbg').classList.remove('open');
  document.getElementById('drawer').classList.remove('open');
  document.body.style.overflow = '';
}

// Fade in
const obs = new IntersectionObserver(entries => {
  entries.forEach((e,i) => {
    if(e.isIntersecting){ setTimeout(()=>e.target.classList.add('on'), i*80); obs.unobserve(e.target); }
  });
}, {threshold:0.08});
document.querySelectorAll('.fi').forEach(el=>obs.observe(el));

// Counter
const cObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(!entry.isIntersecting) return;
    entry.target.querySelectorAll('[data-target]').forEach(n => {
      const t = parseInt(n.dataset.target); let c=0;
      const iv = setInterval(()=>{ c=Math.min(c+t/50,t); n.textContent=Math.round(c); if(c>=t)clearInterval(iv); },25);
    });
    cObs.unobserve(entry.target);
  });
},{threshold:0.3});
const sg=document.querySelector('.stats-grid');
if(sg) cObs.observe(sg);

// Contact form
document.getElementById('contactForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const msg = document.getElementById('formMsg');
  btn.textContent = 'שולח...';
  btn.disabled = true;

  const data = new FormData(this);
  try {
    const res  = await fetch('https://formspree.io/f/maqzwlqy', { method: 'POST', body: data, headers: { 'Accept': 'application/json' } });
    const json = await res.json();
    if (res.ok) {
      btn.textContent = '✓ ההודעה נשלחה בהצלחה';
      btn.style.background = '#1a5c2a';
      msg.style.display = 'block';
      msg.style.color = 'var(--gold)';
      msg.textContent = 'תודה שפנית! נחזור אליך בהקדם.';
      if (typeof trackEvent === 'function') trackEvent('generate_lead', { method: 'contact_form' });
      this.reset();
    } else {
      btn.textContent = 'שליחה ←';
      btn.disabled = false;
      msg.style.display = 'block';
      msg.style.color = '#b43c1e';
      msg.textContent = 'אירעה שגיאה, נסו שוב.';
    }
  } catch(err) {
    btn.textContent = 'שליחה ←';
    btn.disabled = false;
    msg.style.display = 'block';
    msg.style.color = '#b43c1e';
    msg.textContent = 'בעיית תקשורת — נסו שוב.';
  }
});

// Nav highlight
window.addEventListener('scroll',()=>{
  document.querySelectorAll('section[id]').forEach(sec=>{
    if(window.scrollY>=sec.offsetTop-100){
      document.querySelectorAll('.nav-links a,.drawer a').forEach(a=>{
        a.style.color=a.getAttribute('href')==='#'+sec.id?'var(--ink)':'';
      });
    }
  });
});

(function(){

var questions = [
  {
    text: "כמה עובדים יש בארגון שלכם?",
    dimension: "scale",
    opts: [
      { label: "עד 5 עובדים", score: 0 },
      { label: "6–20 עובדים", score: 1 },
      { label: "21–60 עובדים", score: 2 },
      { label: "יותר מ-60 עובדים", score: 3 }
    ]
  },
  {
    text: "כמה מחלקות / צוותים נפרדים יש שעובדים ביחד?",
    dimension: "complexity",
    opts: [
      { label: "צוות אחד — כולנו יחד", score: 0 },
      { label: "2–3 מחלקות", score: 1 },
      { label: "4–6 מחלקות", score: 2 },
      { label: "7 מחלקות ומעלה", score: 3 }
    ]
  },
  {
    text: "איך מנהלים לקוחות ולידים — ממה שיצרו קשר עד לסגירה?",
    dimension: "crm",
    opts: [
      { label: "וואטסאפ / אקסל / זיכרון", score: 3 },
      { label: "מערכת CRM אבל לא כולם משתמשים בה", score: 2 },
      { label: "מערכת CRM — כולם עובדים איתה", score: 1 },
      { label: "תהליך מסודר מקצה לקצה", score: 0 }
    ]
  },
  {
    text: "מה קורה כשעובד מרכזי נעדר יום אחד?",
    dimension: "dependency",
    opts: [
      { label: "הכל נעצר — רק הוא יודע מה לעשות", score: 3 },
      { label: "מסתדרים בקושי, מפספסים דברים", score: 2 },
      { label: "מישהו ממלא מקום אבל זה לא חלק", score: 1 },
      { label: "ממשיכים רגיל — יש תהליכים ברורים", score: 0 }
    ]
  },
  {
    text: "כמה מהר מגיבים ללקוח שפנה לראשונה?",
    dimension: "responsiveness",
    opts: [
      { label: "כמה ימים — לפעמים נופל בין הכיסאות", score: 3 },
      { label: "תוך שעות — תלוי מי זמין", score: 2 },
      { label: "תוך שעה בדרך כלל", score: 1 },
      { label: "תוך דקות — יש תהליך אוטומטי", score: 0 }
    ]
  },
  {
    text: "האם יש נהלי עבודה כתובים שעובד חדש יכול ללמוד מהם?",
    dimension: "procedures",
    opts: [
      { label: "אין כלום — לומדים מהאוויר", score: 3 },
      { label: "יש כמה דברים כתובים, לא מסודרים", score: 2 },
      { label: "חלק מהתפקידים מתועדים", score: 1 },
      { label: "יש נהלים ברורים לרוב התפקידים", score: 0 }
    ]
  },
  {
    text: "האם מידע נופל בין צוותים — דברים שמישהו לא עדכן?",
    dimension: "communication",
    opts: [
      { label: "כן, כל הזמן — זה מקור תסכול יומי", score: 3 },
      { label: "לפעמים, בעיקר בפרויקטים מורכבים", score: 2 },
      { label: "מדי פעם, אנחנו כבר רגילים", score: 1 },
      { label: "לא — יש ערוצי תקשורת סדורים", score: 0 }
    ]
  },
  {
    text: "כמה זמן בשבוע מנהלים מבלים ב'כיבוי שריפות' במקום עבודה אסטרטגית?",
    dimension: "firefighting",
    opts: [
      { label: "רוב השבוע — כמעט אין זמן לחשוב קדימה", score: 3 },
      { label: "מחצית מהזמן בערך", score: 2 },
      { label: "כמה שעות בשבוע", score: 1 },
      { label: "מינימלי — יש שליטה על הסדר היום", score: 0 }
    ]
  }
];

var dims = {
  crm:           { icon: "📊", title: "ניהול לקוחות ו-CRM",       desc: "חסרה מערכת אחת שכולם עובדים איתה. לידים נאבדים, מעקב לא קבוע." },
  dependency:    { icon: "🧩", title: "תלות באנשים",              desc: "תהליכים שחיים בראש של עובד ספציפי — סיכון מיידי לארגון." },
  responsiveness:{ icon: "⏱", title: "מהירות תגובה ללקוח",       desc: "כל שעה שלקוח ממתין — פוטנציאל עסקי שנשחק." },
  procedures:    { icon: "📋", title: "נהלים ותיעוד",              desc: "ללא נהלים כתובים כל עובד חדש מתחיל מאפס ועושה טעויות ישנות." },
  communication: { icon: "💬", title: "תקשורת בין מחלקות",        desc: "מידע שנופל בין צוותים = עבודה כפולה, לקוחות מתוסכלים." },
  firefighting:  { icon: "🔥", title: "כיבוי שריפות",             desc: "כשהמנהל עסוק בשריפות הוא לא בונה. זה מעגל שחייבים לשבור." }
};

var answers = {};
var answerDetails = [];
var currentQ = 0;
var latestQuizSummary = '';

function renderQ(){
  var q = questions[currentQ];
  document.getElementById('qNum').textContent   = 'שאלה ' + (currentQ+1);
  document.getElementById('qText').textContent  = q.text;
  document.getElementById('progressText').textContent = 'שאלה ' + (currentQ+1) + ' מתוך ' + questions.length;
  var pct = Math.round((currentQ / questions.length) * 100);
  document.getElementById('progressBar').style.width = pct + '%';
  document.getElementById('progressPct').textContent = pct + '%';

  var optWrap = document.getElementById('qOptions');
  optWrap.innerHTML = '';
  q.opts.forEach(function(o, i){
    var div = document.createElement('div');
    div.className = 'quiz-opt';
    div.innerHTML = '<div class="quiz-opt-dot"></div><div class="quiz-opt-text">' + o.label + '</div>';
    div.onclick = function(){
      document.querySelectorAll('.quiz-opt').forEach(function(el){ el.classList.remove('selected'); });
      div.classList.add('selected');
      answers[q.dimension] = o.score;
      answerDetails[currentQ] = {
        number: currentQ + 1,
        question: q.text,
        answer: o.label,
        dimension: q.dimension,
        score: o.score
      };
      document.getElementById('btnNext').classList.add('active');
    };
    optWrap.appendChild(div);
  });

  document.getElementById('btnNext').classList.remove('active');

  var card = document.getElementById('qCard');
  card.style.animation = 'none';
  card.offsetHeight;
  card.style.animation = '';
}

window.nextQ = function(){
  currentQ++;
  if(currentQ < questions.length){
    renderQ();
  } else {
    showResult();
  }
};

window.restartQuiz = function(){
  answers = {}; answerDetails = []; currentQ = 0; latestQuizSummary = '';
  document.getElementById('progressWrap').style.display = '';
  document.getElementById('questionWrap').style.display = '';
  document.getElementById('quizResult').classList.remove('show');
  var quizLeadForm = document.getElementById('quizLeadForm');
  if (quizLeadForm) quizLeadForm.reset();
  var quizLeadMsg = document.getElementById('quizLeadMsg');
  if (quizLeadMsg) quizLeadMsg.style.display = 'none';
  renderQ();
};

function buildQuizSummary(data){
  var lines = [
    'מקור: שאלון אבחון תפעולי באתר',
    'רמת תוצאה: ' + data.badge,
    'ניקוד: ' + data.total + '/' + data.maxScore + ' (' + Math.round(data.pct * 100) + '%)',
    'אזורים לשיפור: ' + (data.dimLabels || 'לא זוהו אזורים חריגים'),
    '',
    'תשובות:'
  ];
  answerDetails.forEach(function(item){
    if (!item) return;
    lines.push(item.number + '. ' + item.question);
    lines.push('תשובה: ' + item.answer + ' | ציון: ' + item.score);
  });
  return lines.join('\n');
}

function showResult(){
  document.getElementById('progressBar').style.width = '100%';
  document.getElementById('progressPct').textContent = '100%';
  document.getElementById('progressWrap').style.display = 'none';
  document.getElementById('questionWrap').style.display = 'none';

  var total = Object.values(answers).reduce(function(a,b){ return a+b; }, 0);
  var maxScore = questions.length * 3;
  var pct = total / maxScore;

  var level, badge, title, sub, ctaTitle, ctaSub;
  if(pct >= 0.60){
    level='urgent';
    badge='⚠ דחוף — נדרש שינוי עכשיו';
    title='הארגון שלכם פועל על גבולות הכאוס.';
    sub='הניקוד שלכם מצביע על עומס תפעולי גבוה, תלויות מסוכנות ותהליכים שחיים בראשם של אנשים בודדים. כל אחד מהם לבד הוא בעיה — ביחד הם פצצה.';
    ctaTitle='בואו נדבר לפני שהשריפה הבאה מתחילה.';
    ctaSub='פגישת אבחון קצרה — בלי עלות, בלי התחייבות. יוצאים עם תמונה ברורה.';
  } else if(pct >= 0.35){
    level='medium';
    badge='◎ יש מה לשפר — כדאי לפעול';
    title='יש לכם בסיס טוב — אבל יש בורות שמאטים אתכם.';
    sub='הארגון מתפקד, אבל ישנם אזורים שבהם אתם משלמים מחיר בזמן, בטעויות ובהזדמנויות שנפספסות. עם ליווי נכון אפשר לחסוך הרבה אנרגיה.';
    ctaTitle='נשמח לראות איפה אפשר לשחרר לכם עומס.';
    ctaSub='שיחה קצרה — ובאים עם 2-3 המלצות מיידיות.';
  } else {
    level='low';
    badge='✓ תפעול מסודר יחסית';
    title='אתם בצד הטוב של המפה.';
    sub='הארגון שלכם עובד עם תהליכים סבירים. עדיין יש מקום לאופטימיזציה ולאוטומציות שיחסכו עוד זמן — אבל אין כאן מצב חירום.';
    ctaTitle='רוצים לראות מה עוד אפשר לייעל?';
    ctaSub='שיחת ייעוץ קצרה — נגלה יחד את הפוטנציאל הנסתר.';
  }

  document.getElementById('resultHeader').className = 'result-header ' + level;
  document.getElementById('resultBadge').className  = 'result-badge ' + level;
  document.getElementById('resultBadge').textContent = badge;
  document.getElementById('resultTitle').textContent = title;
  document.getElementById('resultSub').textContent   = sub;
  document.getElementById('ctaTitle').textContent    = ctaTitle;
  document.getElementById('ctaSub').textContent      = ctaSub;

  // area cards — show worst dimensions
  var scored = Object.entries(answers)
    .filter(function(e){ return dims[e[0]]; })
    .sort(function(a,b){ return b[1]-a[1]; });

  var threshold = pct >= 0.60 ? 1 : 2;
  var toShow = scored.filter(function(e){ return e[1] >= threshold; }).slice(0,4);
  if(toShow.length === 0) toShow = scored.slice(0,2);

  var cards = '';
  toShow.forEach(function(e){
    var d = dims[e[0]];
    cards += '<div class="area-card"><div class="area-icon">'+d.icon+'</div><div class="area-title">'+d.title+'</div><div class="area-desc">'+d.desc+'</div></div>';
  });
  document.getElementById('areaCards').innerHTML = cards;

  // build WA message with results
  var dimLabels = toShow.map(function(e){ return dims[e[0]].title; }).join(', ');
  latestQuizSummary = buildQuizSummary({
    badge: badge,
    total: total,
    maxScore: maxScore,
    pct: pct,
    dimLabels: dimLabels
  });
  var quizSummaryField = document.getElementById('quizSummaryField');
  if (quizSummaryField) quizSummaryField.value = latestQuizSummary;
  var waMsg = encodeURIComponent(
    'שלום GoFlow,\n' +
    'מילאתי את האבחון באתר.\n' +
    'רמה: ' + badge + '\n' +
    'אזורים לשיפור: ' + dimLabels + '\n\n' +
    'אשמח לשמוע יותר.'
  );
  document.getElementById('waBtn').href = 'https://wa.me/9720547951161?text=' + waMsg;

  document.getElementById('quizResult').classList.add('show');
  if (typeof trackEvent === 'function') trackEvent('quiz_complete', { result_level: level });
}

var quizLeadForm = document.getElementById('quizLeadForm');
if (quizLeadForm) {
  quizLeadForm.addEventListener('submit', async function(e){
    e.preventDefault();
    var btn = document.getElementById('quizLeadSubmit');
    var msg = document.getElementById('quizLeadMsg');
    var summary = document.getElementById('quizSummaryField');
    if (summary && !summary.value) summary.value = latestQuizSummary;

    btn.textContent = 'שולח...';
    btn.disabled = true;
    msg.style.display = 'none';

    var data = new FormData(this);
    data.append('message', latestQuizSummary || 'נשלח ליד מסיום שאלון, אך סיכום השאלון לא נטען.');

    try {
      var res = await fetch('https://formspree.io/f/maqzwlqy', {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        btn.textContent = '✓ האבחון נשלח';
        btn.style.background = '#1a5c2a';
        msg.style.display = 'block';
        msg.style.color = 'var(--gold)';
        msg.textContent = 'תודה. קיבלנו את הפרטים ואת תוצאת האבחון.';
        if (typeof trackEvent === 'function') trackEvent('generate_lead', { method: 'quiz_form' });
        this.reset();
        if (summary) summary.value = latestQuizSummary;
      } else {
        btn.textContent = 'שליחת האבחון ←';
        btn.disabled = false;
        msg.style.display = 'block';
        msg.style.color = '#b43c1e';
        msg.textContent = 'אירעה שגיאה בשליחה. אפשר לשלוח דרך וואטסאפ.';
      }
    } catch(err) {
      btn.textContent = 'שליחת האבחון ←';
      btn.disabled = false;
      msg.style.display = 'block';
      msg.style.color = '#b43c1e';
      msg.textContent = 'בעיית תקשורת. אפשר לשלוח דרך וואטסאפ.';
    }
  });
}

renderQ();
})();
