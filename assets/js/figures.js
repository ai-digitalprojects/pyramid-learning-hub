/* ============================================================
   figures.js — איורים מורכבים לשאלות מילוליות
   ------------------------------------------------------------
   כשבעיה מדברת על שני גופים, איור אחד אינו מספיק. כאן מורכבים
   כמה גופים לכדי איור אחד עם כיתוב בעברית.

   רוב הגופים באתר מצוירים על ידי מנוע הגאומטריה. שני האיורים כאן
   מצוירים בקואורדינטות מפורשות, באותו היטל אלכסוני ובאותן מחלקות
   עיצוב כמו shapes.js, מפני שהם מראים דברים שהמנוע אינו יודע לצייר:
   אריזה אמיתית ולא גוף חשוף, וגוף אחד שמונח על גוף אחר.

   כל הצורות כאן מקוריות. אין כאן תמונה חיצונית ואין העתק של איור.
   ============================================================ */
(function (global) {
  'use strict';

  var App = global.App = global.App || {};
  var NS = 'http://www.w3.org/2000/svg';

  function el(tag, attrs, children) { return App.UI.el(tag, attrs, children); }

  function svgRoot(viewBox, label, cls) {
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', viewBox);
    s.setAttribute('class', 'solid-svg' + (cls ? ' ' + cls : ''));
    s.setAttribute('role', 'img');
    s.setAttribute('aria-label', label || '');
    return s;
  }

  function node(tag, attrs) {
    var n = document.createElementNS(NS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }

  function poly(points, cls, extra) {
    var attrs = { points: points.map(function (p) { return p[0] + ',' + p[1]; }).join(' '), class: cls };
    if (extra) Object.keys(extra).forEach(function (k) { attrs[k] = extra[k]; });
    return node('polygon', attrs);
  }

  function line(a, b, hidden, cls) {
    return node('line', {
      x1: a[0], y1: a[1], x2: b[0], y2: b[1],
      class: (cls || 'sv-edge') + (hidden ? ' sv-edge--hidden' : '')
    });
  }

  function text(pt, str, cls, anchor) {
    var t = node('text', {
      x: pt[0], y: pt[1], class: cls || 'sv-measure',
      'text-anchor': anchor || 'middle', direction: 'rtl'
    });
    t.textContent = str;
    return t;
  }

  function addAll(svg, nodes) {
    nodes.forEach(function (n) { if (n) svg.appendChild(n); });
    return svg;
  }

  /** גוף אחד עם כותרת מעליו וכיתוב מתחתיו */
  function panel(svg, title, caption) {
    return el('figure', { class: 'combo__part' }, [
      el('figcaption', { class: 'combo__title', text: title }),
      svg,
      caption ? el('p', { class: 'combo__note', text: caption }) : null
    ]);
  }

  /* ------------------------------------------------------------
     פופקורן
     ------------------------------------------------------------
     גרעינים מצוירים כאשכול עיגולים קטנים. הם יושבים מעל פתח האריזה
     וגולשים מעט החוצה, כדי שיהיה ברור שזו אריזת מזון ולא גוף הנדסי.
     ------------------------------------------------------------ */
  function popcorn(cluster) {
    var g = node('g', { class: 'pop-corn' });
    cluster.forEach(function (c) {
      g.appendChild(node('circle', { cx: c[0], cy: c[1], r: c[2], class: 'pop-kernel' }));
    });
    return g;
  }

  /** פסים אנכיים על חזית האריזה, כמו על שקית פופקורן */
  function stripes(x0, x1, yTop, yBottom, count, skew) {
    var g = node('g', { class: 'pop-stripes' });
    var step = (x1 - x0) / count;
    for (var i = 1; i < count; i += 2) {
      var a = x0 + step * i, b = x0 + step * (i + 1);
      g.appendChild(poly([
        [a, yTop], [b, yTop],
        [b + (skew || 0), yBottom], [a + (skew || 0), yBottom]
      ], 'pop-stripe'));
    }
    return g;
  }

  /* ------------------------------------------------------------
     שאלה 3 — שתי אריזות פופקורן
     ------------------------------------------------------------
     אותו בסיס ואותו גובה, צורה שונה ומחיר שונה. שתיהן מצוירות
     כאריזות סגורות ומורכבות, ולא כגוף חשוף או כפריסה פתוחה.
     ------------------------------------------------------------ */

  /** אריזה בצורת תיבה: קופסת פופקורן עם דש פתוח וגרעינים בפתח */
  function boxPacket() {
    var label = 'אריזת פופקורן בצורת תיבה: קופסה מלבנית מפוספסת, פתוחה מלמעלה, ' +
                'וגרעיני פופקורן גולשים מעל הפתח.';
    /* פתח האריזה למעלה, בסיס מלבני למטה, בהיטל אלכסוני */
    var oTL = [52, 74],  oTR = [148, 74],  oBR = [176, 56],  oBL = [80, 56];   // פתח
    var bTL = [62, 176], bTR = [138, 176], bBR = [160, 160], bBL = [84, 160];  // בסיס

    return addAll(svgRoot('0 0 230 200', label), [
      /* גרעינים מאחורי שפת הפתח */
      popcorn([[86, 46, 9], [108, 38, 11], [130, 44, 9], [148, 52, 7], [70, 56, 7]]),

      /* דופן ימין (הרחוקה) ואז החזית, כדי שהחזית תכסה כמו שצריך */
      poly([oTR, oBR, bBR, bTR], 'sv-face'),
      poly([oTL, oTR, bTR, bTL], 'pop-front'),
      stripes(52, 148, 74, 176, 7, 10),

      /* פתח האריזה */
      poly([oTL, oTR, oBR, oBL], 'sv-base'),

      /* גרעינים שגולשים מלפנים */
      popcorn([[64, 68, 8], [96, 62, 10], [126, 66, 8]]),

      line(oTL, oTR), line(oTR, oBR), line(oBR, oBL, true), line(oBL, oTL, true),
      line(oTL, bTL), line(oTR, bTR), line(oBR, bBR),
      line(bTL, bTR), line(bTR, bBR), line(bBR, bBL, true), line(bBL, bTL, true),
      line(oBL, bBL, true)
    ]);
  }

  /** פסים שמתכנסים אל קודקוד הפירמידה, כמו על אריזה מחודדת */
  function fanStripes(apex, x0, x1, yBase, count) {
    var g = node('g', { class: 'pop-stripes' });
    var step = (x1 - x0) / count;
    for (var i = 0; i < count; i += 2) {
      g.appendChild(poly([
        apex, [x0 + step * i, yBase], [x0 + step * (i + 1), yBase]
      ], 'pop-stripe'));
    }
    return g;
  }

  /** אריזה בצורת פירמידה: אותו בסיס ואותו גובה, קודקוד למעלה */
  function pyramidPacket() {
    var label = 'אריזת פופקורן בצורת פירמידה: אריזה מפוספסת עם בסיס מרובע ' +
                'וקודקוד למעלה, ולרגליה כמה גרעיני פופקורן.';
    var bTL = [62, 176], bTR = [138, 176], bBR = [160, 160], bBL = [84, 160];
    var apex = [111, 56];

    return addAll(svgRoot('0 0 230 200', label), [
      poly([apex, bTR, bBR], 'sv-face'),
      poly([apex, bTL, bTR], 'pop-front'),
      /* הפסים מתכנסים אל הקודקוד, ולכן הם נשארים בתוך הפאה */
      fanStripes(apex, 62, 138, 176, 5),

      poly([bTL, bTR, bBR, bBL], 'sv-base'),

      line(apex, bTL), line(apex, bTR), line(apex, bBR),
      line(apex, bBL, true),
      line(bTL, bTR), line(bTR, bBR), line(bBR, bBL, true), line(bBL, bTL, true),
      node('circle', { cx: apex[0], cy: apex[1], r: 4, class: 'sv-apex' }),

      /* גרעינים שנשפכו לרגלי האריזה */
      popcorn([[42, 180, 8], [28, 172, 6], [52, 168, 6], [176, 178, 7], [192, 170, 6]])
    ]);
  }

  function twoPackets() {
    return el('div', { class: 'combo', role: 'group',
      'aria-label': 'שתי אריזות פופקורן זו לצד זו, שתיהן באותו בסיס ובאותו גובה: ' +
                    'אריזה בצורת תיבה במחיר 24 שקלים, ואריזה בצורת פירמידה במחיר 9 שקלים.'
    }, [
      panel(boxPacket(), 'אריזת תיבה', '24 שקלים'),
      panel(pyramidPacket(), 'אריזת פירמידה', '9 שקלים')
    ]);
  }

  /* ------------------------------------------------------------
     שאלה 4 — מבנה אחד משני חלקים
     ------------------------------------------------------------
     המנסרה והפירמידה מצוירות יחד, זו על גבי זו, על אותו מלבן בסיס.
     כך רואים בבירור שהבסיס משותף ושגובה הפירמידה גדול במעט מגובה
     המנסרה. הגבהים מצוירים ביחס הנכון ביניהם: 60 פיקסלים מול 72,
     בדיוק היחס שבין 5 ס״מ ל-6 ס״מ.
     ------------------------------------------------------------ */
  function prismAndRoof() {
    var label = 'מבנה אחד המורכב משני חלקים זה על גבי זה: מנסרה בתחתית, ' +
                'שגובהה 5 ס״מ, ומעליה פירמידה על אותו בסיס בדיוק, שגובהה 6 ס״מ, ' +
                'מעט יותר. שטח הבסיס המשותף 40 סמ״ר.';

    /* בסיס המנסרה */
    var bTL = [58, 250], bTR = [170, 250], bBR = [206, 226], bBL = [94, 226];
    /* פאת המעבר: תקרת המנסרה, והיא גם בסיס הפירמידה */
    var mTL = [58, 190], mTR = [170, 190], mBR = [206, 166], mBL = [94, 166];
    /* קודקוד הפירמידה: 72 פיקסלים מעל מרכז פאת המעבר */
    var apex = [132, 106];

    var prismH = [[132, 178], [132, 238]];   /* קו גובה המנסרה */
    var pyrH   = [[132, 106], [132, 178]];   /* קו גובה הפירמידה */

    return addAll(svgRoot('0 0 300 290', label, 'combo__stack'), [
      /* --- המנסרה --- */
      poly([mTR, mBR, bBR, bTR], 'sv-face'),
      poly([mTL, mTR, bTR, bTL], 'sv-face'),
      poly([bTL, bTR, bBR, bBL], 'sv-base'),

      /* --- הפירמידה, יושבת בדיוק על פאת המעבר --- */
      poly([apex, mTR, mBR], 'sv-face'),
      poly([apex, mTL, mTR], 'sv-face'),

      /* פאת המעבר מודגשת: זה הבסיס המשותף לשני החלקים */
      poly([mTL, mTR, mBR, mBL], 'sv-base', { 'fill-opacity': '.5' }),

      /* קווים נסתרים */
      line(mBL, mTL, true), line(mBL, mBR, true), line(apex, mBL, true),
      line(bBL, bTL, true), line(bBL, bBR, true), line(mBL, bBL, true),

      /* קווים גלויים */
      line(apex, mTL), line(apex, mTR), line(apex, mBR),
      line(mTL, mTR), line(mTR, mBR),
      line(mTL, bTL), line(mTR, bTR), line(mBR, bBR),
      line(bTL, bTR), line(bTR, bBR),
      node('circle', { cx: apex[0], cy: apex[1], r: 4, class: 'sv-apex' }),

      /* --- הגבהים, זה מעל זה, כדי שההפרש ייראה --- */
      node('line', { x1: pyrH[0][0], y1: pyrH[0][1], x2: pyrH[1][0], y2: pyrH[1][1], class: 'pp-height' }),
      node('line', { x1: prismH[0][0], y1: prismH[0][1], x2: prismH[1][0], y2: prismH[1][1], class: 'pp-height' }),
      node('line', { x1: 236, y1: 106, x2: 236, y2: 178, class: 'sv-leader' }),
      node('line', { x1: 236, y1: 178, x2: 236, y2: 250, class: 'sv-leader' }),
      node('line', { x1: 216, y1: 106, x2: 252, y2: 106, class: 'sv-leader' }),
      node('line', { x1: 216, y1: 178, x2: 252, y2: 178, class: 'sv-leader' }),
      node('line', { x1: 216, y1: 250, x2: 252, y2: 250, class: 'sv-leader' }),
      text([268, 146], '6 ס״מ', 'sv-measure'),
      text([268, 218], '5 ס״מ', 'sv-measure'),

      text([132, 278], 'שטח הבסיס 40 סמ״ר', 'sv-measure')
    ]);
  }

  App.Figures = {
    twoPackets: twoPackets,
    prismAndRoof: prismAndRoof
  };

})(window);
