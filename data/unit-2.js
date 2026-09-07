/* ============================================================
   יחידה 2 — חישוב נפח פירמידה
   שלב 1: מטא-נתונים של הפעילויות בלבד.
   הפריטים (שאלות, מסיחים ומשוב) יתווספו בשלב 4 בשדה `items`.
   ============================================================ */
window.PyramidData = window.PyramidData || {};

window.PyramidData.unit2 = {
  id: 2,
  slug: 'unit-2',
  title: 'חישוב נפח פירמידה',
  short: 'יחידה 2',
  icon: '📦',
  lead: 'מהו הגובה הנכון, למה מחלקים בשלוש, ואיך מחשבים נפח של פירמידה בעולם האמיתי.',
  activities: [
    {
      id: '2.1',
      title: 'גובה הפירמידה',
      desc: 'מזהים את הגובה ומבדילים בינו לבין צלע צדדית.',
      icon: '📏',
      kind: 'identify',
      scored: true,
      maxScore: 4,
      items: []
    },
    {
      id: '2.2',
      title: 'שטח הבסיס',
      desc: 'מחשבים את שטח הבסיס בפירמידות עם בסיסים שונים.',
      icon: '⬛',
      kind: 'numeric',
      scored: true,
      maxScore: 4,
      items: []
    },
    {
      id: '2.3',
      title: 'מנסרה ופירמידה — השוואה',
      desc: 'משווים בין שני גופים עם בסיס זהה וגובה זהה.',
      icon: '⚖️',
      kind: 'compare',
      scored: false,
      maxScore: 0,
      items: []
    },
    {
      id: '2.4',
      title: 'למה מחלקים בשלוש?',
      desc: 'משערים כמה פעמים הפירמידה ממלאת את המנסרה, ואז בודקים.',
      icon: '💧',
      kind: 'predict',
      scored: true,
      maxScore: 1,
      items: []
    },
    {
      id: '2.5',
      title: 'סרטון: נפח פירמידה',
      desc: 'צופים בסרטון קצר ועונים על שאלה אחת לפני שממשיכים לתרגול.',
      icon: '🎬',
      kind: 'video',
      scored: true,
      maxScore: 1,
      gate: true,
      items: []
    },
    {
      id: '2.6',
      title: 'בונים את הנוסחה',
      desc: 'מרכיבים בעצמכם את הנוסחה לחישוב נפח הפירמידה.',
      icon: '🧮',
      kind: 'formula',
      scored: true,
      maxScore: 1,
      items: []
    },
    {
      id: '2.7',
      title: 'תרגול מודרך',
      desc: 'מחשבים נפח צעד אחר צעד, עם בדיקה בכל שלב.',
      icon: '🪜',
      kind: 'guided',
      scored: true,
      maxScore: 9,
      items: []
    },
    {
      id: '2.8',
      title: 'תרגול עצמאי',
      desc: 'שישה תרגילים לחישוב נפח, בלי הכוונה.',
      icon: '✏️',
      kind: 'numeric',
      scored: true,
      maxScore: 6,
      items: []
    },
    {
      id: '2.9',
      title: 'מה חסר?',
      desc: 'מוצאים נתון חסר כשהנפח כבר ידוע.',
      icon: '❓',
      kind: 'numeric',
      scored: true,
      maxScore: 4,
      items: []
    },
    {
      id: '2.10',
      title: 'בעיות מהחיים',
      desc: 'פותרים בעיות מהעולם שסביבנו: אריזות, נרות, עציצים ומבנים.',
      icon: '🌍',
      kind: 'word-problems',
      scored: true,
      maxScore: 5,
      items: []
    },
    {
      id: '2.11',
      title: 'בדקו את עצמכם — יחידה 2',
      desc: 'שמונה שאלות לסיכום כל מה שלמדנו ביחידה.',
      icon: '✅',
      kind: 'quiz',
      scored: true,
      maxScore: 8,
      items: []
    }
  ]
};

/* ============================================================
   מבחן הסיום (החלטה D8)
   ============================================================ */
window.PyramidData.finalExam = {
  id: 'final',
  title: 'מבחן סיום',
  short: 'מבחן סיום',
  icon: '🏅',
  desc: 'שתים־עשרה שאלות משתי היחידות. על כל שאלה עונים פעם אחת.',
  itemCount: 12,
  passCount: 9,
  passPercent: 75,
  items: []
};
