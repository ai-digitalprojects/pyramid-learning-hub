/* ============================================================
   יחידה 1 — הכרת הפירמידה
   שלב 1: מטא-נתונים של הפעילויות בלבד.
   הפריטים (שאלות, מסיחים ומשוב) יתווספו בשלב 3 בשדה `items`.
   ============================================================ */
window.PyramidData = window.PyramidData || {};

window.PyramidData.unit1 = {
  id: 1,
  slug: 'unit-1',
  title: 'הכרת הפירמידה',
  short: 'יחידה 1',
  icon: '🔺',
  lead: 'מה הופך גוף לפירמידה, מאילו חלקים היא בנויה, ואיך היא נראית כשפורשים אותה על המישור.',
  activities: [
    {
      id: '1.1',
      title: 'מהי פירמידה?',
      desc: 'מסתובבים סביב פירמידה ומכירים את החלקים שלה.',
      icon: '👀',
      kind: 'explore',
      scored: false,
      maxScore: 0,
      items: []
    },
    {
      id: '1.2',
      title: 'פירמידה או לא פירמידה?',
      desc: 'ממיינים גופים ומגלים מה בדיוק הופך גוף לפירמידה.',
      icon: '🗂️',
      kind: 'sort',
      scored: true,
      maxScore: 8,
      items: []
    },
    {
      id: '1.3',
      title: 'סוגי פירמידות לפי הבסיס',
      desc: 'משנים את צורת הבסיס ומגלים איך נקבע שם הפירמידה.',
      icon: '🔶',
      kind: 'explore-match',
      scored: true,
      maxScore: 5,
      items: []
    },
    {
      id: '1.4',
      title: 'מרכיבי הפירמידה',
      desc: 'מצמידים שמות לחלקים: בסיס, מעטפת, פאות, צלעות וקודקוד הראש.',
      icon: '🏷️',
      kind: 'label',
      scored: true,
      maxScore: 6,
      items: []
    },
    {
      id: '1.5',
      title: 'חוקרים את הקשרים',
      desc: 'ממלאים טבלה ומגלים כללים בין צלעות הבסיס לפאות, לצלעות ולקודקודים.',
      icon: '🔍',
      kind: 'table',
      scored: true,
      maxScore: 15,
      items: []
    },
    {
      id: '1.6',
      title: 'פירמידה והפריסה שלה',
      desc: 'מתאימים לכל פירמידה את הפריסה שלה, ומזהים פריסות שאינן מתאימות.',
      icon: '🧩',
      kind: 'match',
      scored: true,
      maxScore: 4,
      items: []
    },
    {
      id: '1.7',
      title: 'מקפלים את הפריסה',
      desc: 'צופים איך פריסה שטוחה מתקפלת ונסגרת לפירמידה.',
      icon: '📐',
      kind: 'fold',
      scored: false,
      maxScore: 0,
      items: []
    },
    {
      id: '1.8',
      title: 'נכון או לא נכון?',
      desc: 'מחליטים אם המשפט נכון, ובוחרים את ההסבר המתאים.',
      icon: '⚖️',
      kind: 'true-false',
      scored: true,
      maxScore: 8,
      items: []
    },
    {
      id: '1.9',
      title: 'בדקו את עצמכם — יחידה 1',
      desc: 'שמונה שאלות לסיכום כל מה שלמדנו ביחידה.',
      icon: '✅',
      kind: 'quiz',
      scored: true,
      maxScore: 8,
      items: []
    }
  ]
};
