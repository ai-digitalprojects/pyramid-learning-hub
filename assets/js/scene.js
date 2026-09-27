/* ============================================================
   scene.js — נוף המדבר של דף הבית
   ------------------------------------------------------------
   ציור מקורי לחלוטין, בנוי מצורות גאומטריות פשוטות בלבד: שמיים
   מדורגים, שלוש פירמידות, דיונות, דקלים ושמש. אין כאן תמונה, אין
   קובץ חיצוני ואין העתק של איור כלשהו.

   הנוף הוא קישוט בלבד. הוא נושא aria-hidden, וכל הטקסט שמעליו הוא
   טקסט אמיתי ב-HTML, כדי שקורא מסך יקרא את הכותרת ולא את הציור.
   ============================================================ */
(function (global) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  function e(tag, attrs) {
    var n = document.createElementNS(NS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }

  function stop(offset, color, opacity) {
    var s = e('stop', { offset: offset, 'stop-color': color });
    if (opacity !== undefined) s.setAttribute('stop-opacity', opacity);
    return s;
  }

  /** פירמידה: פאה מוארת ופאה מוצלת, עם שכבות אבן דקות */
  function pyramid(cx, baseY, halfWidth, height, light, dark, id) {
    var g = e('g', {});
    var apexY = baseY - height;
    g.appendChild(e('path', {
      d: 'M' + cx + ' ' + apexY + ' L' + (cx + halfWidth) + ' ' + baseY +
         ' L' + (cx - halfWidth) + ' ' + baseY + ' Z',
      fill: dark
    }));
    g.appendChild(e('path', {
      d: 'M' + cx + ' ' + apexY + ' L' + cx + ' ' + baseY +
         ' L' + (cx - halfWidth) + ' ' + baseY + ' Z',
      fill: light
    }));
    /* נדבכי האבן: קווים אופקיים דקים שנעשים צרים לכיוון הפסגה */
    for (var k = 1; k <= 4; k++) {
      var t = k / 5;
      var y = apexY + height * t;
      var w = halfWidth * t;
      g.appendChild(e('line', {
        x1: (cx - w).toFixed(1), y1: y.toFixed(1),
        x2: (cx + w).toFixed(1), y2: y.toFixed(1),
        stroke: dark, 'stroke-opacity': '.35', 'stroke-width': '1.5'
      }));
    }
    if (id) g.setAttribute('data-part', id);
    return g;
  }

  /** דקל: גזע מעוקל וכמה כפות */
  function palm(x, groundY, scale) {
    var g = e('g', { transform: 'translate(' + x + ' ' + groundY + ') scale(' + scale + ')' });
    g.appendChild(e('path', {
      d: 'M0 0 C -3 -18, 2 -34, -2 -50',
      stroke: '#7A5A2E', 'stroke-width': '5', fill: 'none', 'stroke-linecap': 'round'
    }));
    var fronds = [
      'M-2 -50 C -20 -58, -30 -50, -34 -42',
      'M-2 -50 C 14 -60, 26 -54, 31 -45',
      'M-2 -50 C -16 -66, -6 -74, 4 -76',
      'M-2 -50 C 10 -66, 22 -66, 28 -60',
      'M-2 -50 C -22 -50, -30 -42, -32 -34'
    ];
    fronds.forEach(function (d) {
      g.appendChild(e('path', {
        d: d, stroke: 'var(--palm)', 'stroke-width': '5',
        fill: 'none', 'stroke-linecap': 'round'
      }));
    });
    return g;
  }

  /**
   * נוף המדבר של הכותרת.
   * מוחזר SVG רספונסיבי שמתמתח לרוחב ההורה ונחתך בגובה לפי הצורך.
   */
  function desert() {
    var svg = e('svg', {
      viewBox: '0 0 1200 420',
      preserveAspectRatio: 'xMidYMid slice',
      class: 'scene',
      'aria-hidden': 'true',
      focusable: 'false'
    });

    var defs = e('defs', {});
    var sky = e('linearGradient', { id: 'sc-sky', x1: '0', y1: '0', x2: '0', y2: '1' });
    sky.appendChild(stop('0%', 'var(--sky-high)'));
    sky.appendChild(stop('100%', 'var(--sky-low)'));
    defs.appendChild(sky);

    var sand = e('linearGradient', { id: 'sc-sand', x1: '0', y1: '0', x2: '0', y2: '1' });
    sand.appendChild(stop('0%', 'var(--dune-far)'));
    sand.appendChild(stop('100%', 'var(--dune-near)'));
    defs.appendChild(sand);
    svg.appendChild(defs);

    svg.appendChild(e('rect', { x: '0', y: '0', width: '1200', height: '420', fill: 'url(#sc-sky)' }));

    /* שמש נמוכה ורכה */
    svg.appendChild(e('circle', { cx: '980', cy: '96', r: '46', fill: '#FFF1C9', opacity: '.85' }));
    svg.appendChild(e('circle', { cx: '980', cy: '96', r: '70', fill: '#FFF1C9', opacity: '.28' }));

    /* עננים דקים */
    [[170, 78, 1], [420, 56, .8], [760, 104, .65]].forEach(function (c) {
      var g = e('g', { opacity: '.55', transform: 'translate(' + c[0] + ' ' + c[1] + ') scale(' + c[2] + ')' });
      g.appendChild(e('ellipse', { cx: '0', cy: '0', rx: '54', ry: '13', fill: '#FFFFFF' }));
      g.appendChild(e('ellipse', { cx: '34', cy: '6', rx: '38', ry: '10', fill: '#FFFFFF' }));
      svg.appendChild(g);
    });

    /* רכס רחוק */
    svg.appendChild(e('path', {
      d: 'M0 250 L150 206 L300 246 L470 194 L640 244 L820 200 L1000 242 L1200 208 L1200 300 L0 300 Z',
      fill: 'var(--dune-far)', opacity: '.55'
    }));

    /* שלוש הפירמידות, הרחוקה חיוורת יותר */
    svg.appendChild(pyramid(300, 300, 96, 132, 'var(--stone)', 'var(--stone-shade)'));
    svg.appendChild(pyramid(470, 300, 62, 84, 'var(--stone)', 'var(--stone-shade)'));
    svg.appendChild(pyramid(660, 300, 130, 176, 'var(--stone)', 'var(--stone-shade)'));

    /* חולות הקדמה */
    svg.appendChild(e('path', {
      d: 'M0 300 C 220 282, 380 318, 600 300 C 820 282, 980 318, 1200 296 L1200 420 L0 420 Z',
      fill: 'url(#sc-sand)'
    }));
    svg.appendChild(e('path', {
      d: 'M0 352 C 260 334, 430 370, 700 350 C 930 334, 1060 364, 1200 348 L1200 420 L0 420 Z',
      fill: 'var(--dune-deep)', opacity: '.35'
    }));

    /* דקלים בשני הקצוות */
    svg.appendChild(palm(92, 372, 1.25));
    svg.appendChild(palm(158, 386, .92));
    svg.appendChild(palm(1108, 368, 1.18));

    return svg;
  }

  global.App = global.App || {};
  global.App.Scene = { desert: desert, pyramid: pyramid };

})(window);
