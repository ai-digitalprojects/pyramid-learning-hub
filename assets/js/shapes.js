/* ============================================================
   shapes.js — איורים מקוריים של גופים (SVG סטטי)
   ------------------------------------------------------------
   כל הקואורדינטות חושבו במיוחד לפרויקט הזה.
   ההיטל הוא היטל אלכסוני: הבסיס נראה כמקבילית/מצולע "שטוח",
   קווים נסתרים מצוירים מקווקו — כמקובל בשרטוט גופים.
   אין כאן Three.js ואין תלות חיצונית כלשהי.
   ============================================================ */
(function (global) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  function svgRoot(viewBox, label) {
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', viewBox);
    s.setAttribute('class', 'solid-svg');
    s.setAttribute('role', 'img');
    s.setAttribute('aria-label', label || '');
    return s;
  }

  function poly(points, cls) {
    var p = document.createElementNS(NS, 'polygon');
    p.setAttribute('points', points.map(function (pt) { return pt[0] + ',' + pt[1]; }).join(' '));
    p.setAttribute('class', cls);
    return p;
  }

  function line(a, b, hidden) {
    var l = document.createElementNS(NS, 'line');
    l.setAttribute('x1', a[0]); l.setAttribute('y1', a[1]);
    l.setAttribute('x2', b[0]); l.setAttribute('y2', b[1]);
    l.setAttribute('class', 'sv-edge' + (hidden ? ' sv-edge--hidden' : ''));
    return l;
  }

  function pathEl(d, cls) {
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    p.setAttribute('class', cls);
    return p;
  }

  function dot(pt, r) {
    var c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', pt[0]); c.setAttribute('cy', pt[1]);
    c.setAttribute('r', r || 4);
    c.setAttribute('class', 'sv-apex');
    return c;
  }

  function text(pt, str, anchor) {
    var t = document.createElementNS(NS, 'text');
    t.setAttribute('x', pt[0]); t.setAttribute('y', pt[1]);
    t.setAttribute('text-anchor', anchor || 'middle');
    t.setAttribute('class', 'sv-label');
    t.setAttribute('direction', 'rtl');
    t.textContent = str;
    return t;
  }

  function addAll(svg, nodes) {
    nodes.forEach(function (n) { if (n) svg.appendChild(n); });
    return svg;
  }

  /* ============================================================
     1. פירמידה מרובעת — בסיס ריבוע
     ============================================================ */
  /* הבסיס מצויר כמקבילית שצלע שלה פונה אלינו — כך אין אף צלע צדדית
     אנכית שעלולה להיראות בטעות כמו קו הגובה. */
  function squarePyramid(label) {
    var bl = [46, 158], br = [150, 158], tr = [178, 130], tl = [74, 130], A = [112, 38];
    return addAll(svgRoot('0 0 200 180', label), [
      poly([bl, br, tr, tl], 'sv-base'),
      poly([A, bl, br], 'sv-face'),
      poly([A, br, tr], 'sv-face'),
      line(A, tl, true), line(tl, tr, true), line(tl, bl, true),
      line(A, bl), line(A, br), line(A, tr),
      line(bl, br), line(br, tr),
      dot(A)
    ]);
  }

  /* ============================================================
     2. מנסרה משולשת — שני בסיסים משולשים, פאות צדדיות מלבנים
     ============================================================ */
  function triangularPrism(label) {
    var bL = [48, 155], bR = [152, 155], bB = [100, 136];
    var tL = [48, 78],  tR = [152, 78],  tB = [100, 59];
    return addAll(svgRoot('0 0 200 180', label), [
      poly([tL, tR, tB], 'sv-base'),
      poly([bL, bR, tR, tL], 'sv-face'),
      line(bB, bL, true), line(bB, bR, true), line(bB, tB, true),
      line(bL, bR), line(bL, tL), line(bR, tR),
      line(tL, tR), line(tR, tB), line(tB, tL)
    ]);
  }

  /* ============================================================
     3. חרוט — בסיס עיגול, מעטפת מעוגלת
     ============================================================ */
  function cone(label) {
    var A = [100, 34], lft = [42, 140], rgt = [158, 140];
    return addAll(svgRoot('0 0 200 180', label), [
      pathEl('M 42 140 A 58 19 0 0 1 158 140 L 100 34 Z', 'sv-face'),
      pathEl('M 42 140 A 58 19 0 0 0 158 140', 'sv-edge sv-edge--hidden'),
      pathEl('M 42 140 A 58 19 0 0 1 158 140', 'sv-edge'),
      line(A, lft), line(A, rgt),
      dot(A)
    ]);
  }

  /* ============================================================
     4. פירמידה משולשת — בסיס משולש, ארבע פאות בסך הכול
     ============================================================ */
  function triangularPyramid(label) {
    var L = [48, 150], R = [152, 150], B = [112, 120], A = [100, 34];
    return addAll(svgRoot('0 0 200 180', label), [
      poly([L, R, B], 'sv-base'),
      poly([A, L, R], 'sv-face'),
      line(A, B, true), line(L, B, true), line(R, B, true),
      line(A, L), line(A, R), line(L, R),
      dot(A)
    ]);
  }

  /* ============================================================
     5. פירמידה מחומשת — בסיס מחומש, חמישה משולשים
     ============================================================ */
  /* המחומש מסובב כך שצלע פונה אלינו, ולא קודקוד. */
  function pentagonalPyramid(label) {
    var fL = [63.6, 147.8], fR = [136.4, 147.8], rt = [159, 123.2],
        bk = [100, 108], lf = [41, 123.2], A = [104, 26];
    return addAll(svgRoot('0 0 200 180', label), [
      poly([lf, fL, fR, rt, bk], 'sv-base'),
      poly([A, lf, fL], 'sv-face'),
      poly([A, fL, fR], 'sv-face'),
      poly([A, fR, rt], 'sv-face'),
      line(A, bk, true), line(rt, bk, true), line(bk, lf, true),
      line(A, lf), line(A, fL), line(A, fR), line(A, rt),
      line(lf, fL), line(fL, fR), line(fR, rt),
      dot(A)
    ]);
  }

  /* ============================================================
     6. תיבה — שש פאות מלבניות
     ============================================================ */
  function rectangularPrism(label) {
    var fTL = [42, 86], fTR = [148, 86], fBR = [148, 158], fBL = [42, 158];
    var bTL = [72, 60], bTR = [178, 60], bBR = [178, 132], bBL = [72, 132];
    return addAll(svgRoot('0 0 200 180', label), [
      poly([fTL, fTR, bTR, bTL], 'sv-base'),
      poly([fTL, fTR, fBR, fBL], 'sv-face'),
      poly([fTR, fBR, bBR, bTR], 'sv-face'),
      line(bBL, bTL, true), line(bBL, bBR, true), line(fBL, bBL, true),
      line(fTL, fTR), line(fTR, fBR), line(fBR, fBL), line(fBL, fTL),
      line(fTL, bTL), line(fTR, bTR), line(fBR, bBR),
      line(bTL, bTR), line(bTR, bBR)
    ]);
  }

  /* ============================================================
     7. פירמידה קטומה — אין קודקוד ראש, הפאות הצדדיות טרפזים
     ============================================================ */
  function truncatedPyramid(label) {
    var bl = [38, 166], br = [158, 166], tr = [188, 136], tl = [68, 136];
    var ul = [75.5, 98.5], ur = [135.5, 98.5], uur = [150.5, 83.5], uul = [90.5, 83.5];
    return addAll(svgRoot('0 0 200 190', label), [
      poly([bl, br, tr, tl], 'sv-base'),
      poly([ul, ur, uur, uul], 'sv-base'),
      poly([bl, br, ur, ul], 'sv-face'),
      poly([br, tr, uur, ur], 'sv-face'),
      line(tl, tr, true), line(tl, bl, true), line(tl, uul, true),
      line(bl, br), line(br, tr),
      line(bl, ul), line(br, ur), line(tr, uur),
      line(ul, ur), line(ur, uur), line(uur, uul), line(uul, ul)
    ]);
  }

  /* ============================================================
     8. פירמידה משופעת — קודקוד הראש אינו מעל מרכז הבסיס
     ============================================================ */
  /* אותו בסיס בדיוק כמו בפירמידה המרובעת, אבל קודקוד הראש הוזז הצידה
     ואינו נמצא מעל מרכז הבסיס. */
  function obliqueSquarePyramid(label) {
    var bl = [46, 158], br = [150, 158], tr = [178, 130], tl = [74, 130], A = [172, 40];
    return addAll(svgRoot('0 0 210 180', label), [
      poly([bl, br, tr, tl], 'sv-base'),
      poly([A, bl, br], 'sv-face'),
      poly([A, br, tr], 'sv-face'),
      line(A, tl, true), line(tl, tr, true), line(tl, bl, true),
      line(A, bl), line(A, br), line(A, tr),
      line(bl, br), line(br, tr),
      dot(A)
    ]);
  }

  /* ============================================================
     איור ההסבר — פירמידה מרובעת עם תוויות
     ============================================================ */
  function labelledPyramid(label) {
    var bl = [120, 196], br = [250, 196], tr = [285, 162], tl = [155, 162], A = [202, 64];
    var svg = svgRoot('0 0 420 250', label);
    svg.setAttribute('class', 'solid-svg solid-svg--wide');
    return addAll(svg, [
      poly([bl, br, tr, tl], 'sv-base'),
      poly([A, bl, br], 'sv-face'),
      poly([A, br, tr], 'sv-face'),
      line(A, tl, true), line(tl, tr, true), line(tl, bl, true),
      line(A, bl), line(A, br), line(A, tr),
      line(bl, br), line(br, tr),
      dot(A, 5),

      pathEl('M 276 54 L 212 62', 'sv-leader'),
      text([336, 50], 'קודקוד הראש'),

      pathEl('M 300 148 L 218 142', 'sv-leader'),
      text([354, 152], 'פאה צדדית'),

      pathEl('M 86 212 L 152 194', 'sv-leader'),
      text([58, 218], 'בסיס')
    ]);
  }

  global.App = global.App || {};
  global.App.Shapes = {
    'square-pyramid':      squarePyramid,
    'triangular-prism':    triangularPrism,
    'cone':                cone,
    'triangular-pyramid':  triangularPyramid,
    'pentagonal-pyramid':  pentagonalPyramid,
    'rectangular-prism':   rectangularPrism,
    'truncated-pyramid':   truncatedPyramid,
    'oblique-pyramid':     obliqueSquarePyramid,
    'labelled-pyramid':    labelledPyramid,

    /** בונה איור לפי מזהה; מחזיר null אם המזהה לא קיים */
    build: function (id, label) {
      var fn = this[id];
      return typeof fn === 'function' ? fn(label) : null;
    }
  };

})(window);
