/* ============================================================
   parts-diagram.js — פירמידה מרובעת אינטראקטיבית (SVG בלבד)
   ------------------------------------------------------------
   שלוש תצוגות: מלפנים, מהצד, מלמעלה.
   כל חלק ניתן לסימון, ללחיצה ולמיקוד מקלדת.
   אין Three.js ואין תלות חיצונית.
   ============================================================ */
(function (global) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  /* ------------------------------------------------------------
     גאומטריה לכל תצוגה.
     סדר קודקודי הבסיס קבוע: 0 קדמי-שמאלי, 1 קדמי-ימני,
     2 אחורי-ימני, 3 אחורי-שמאלי — כך שאותה לוגיקה עובדת בכולן.
     ------------------------------------------------------------ */
  var VIEWS = {
    front: {
      label: 'מבט מלפנים',
      base: [[52, 168], [158, 168], [186, 140], [80, 140]],
      apex: [119, 46],
      hiddenBaseEdges: [2, 3],
      hiddenLateralEdges: [3],
      visibleFaces: [0, 1],
      hint: 'כך רואים את הפירמידה כשהיא עומדת מולנו על הבסיס.'
    },
    side: {
      label: 'מבט מהצד',
      base: [[46, 166], [174, 166], [186, 150], [58, 150]],
      apex: [116, 54],
      hiddenBaseEdges: [2, 3],
      hiddenLateralEdges: [3],
      visibleFaces: [0, 1],
      hint: 'מבט כמעט בגובה השולחן. הבסיס נראה שטוח יותר, והמשולשים בולטים.'
    },
    top: {
      label: 'מבט מלמעלה',
      base: [[60, 170], [170, 170], [170, 60], [60, 60]],
      apex: [115, 115],
      hiddenBaseEdges: [],
      hiddenLateralEdges: [],
      visibleFaces: [0, 1, 2, 3],
      hint: 'מלמעלה רואים את הריבוע של הבסיס, וקודקוד הראש נמצא בדיוק במרכזו.'
    }
  };

  function pt(p) { return p[0] + ',' + p[1]; }

  function make(tag, attrs) {
    var n = document.createElementNS(NS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }

  /**
   * יוצר את האיור.
   * opts = {
   *   view:        'front' | 'side' | 'top'
   *   interactive: boolean  — האם החלקים ניתנים ללחיצה ולמיקוד
   *   highlight:   { part: 'base'|'face'|'base-edge'|'lateral-edge'|'apex'|'base-vertex', index: n }
   *   onPick:      function(part, index)
   * }
   */
  function create(opts) {
    opts = opts || {};
    var v = VIEWS[opts.view] || VIEWS.front;
    var B = v.base, A = v.apex;
    var hl = opts.highlight || null;

    var svg = make('svg', {
      viewBox: '0 0 232 210',
      class: 'parts-svg',
      role: opts.interactive ? 'group' : 'img'
    });
    if (!opts.interactive) {
      svg.setAttribute('aria-label', 'פירמידה מרובעת ב' + v.label +
        '. בסיס מרובע, ארבע פאות צדדיות משולשות, וקודקוד ראש אחד.');
    }

    function isHl(part, index) {
      if (!hl || hl.part !== part) return false;
      return hl.index === undefined || hl.index === null || hl.index === index;
    }

    /* ---------- שכבה 1: פאות ---------- */
    var gFaces = make('g', {});
    v.visibleFaces.forEach(function (i) {
      gFaces.appendChild(make('polygon', {
        points: [pt(A), pt(B[i]), pt(B[(i + 1) % 4])].join(' '),
        class: 'pp-face' + (isHl('face', i) ? ' pp-hl' : '')
      }));
    });
    svg.appendChild(gFaces);

    /* ---------- שכבה 2: הבסיס ---------- */
    svg.appendChild(make('polygon', {
      points: B.map(pt).join(' '),
      class: 'pp-base' + (isHl('base') ? ' pp-hl' : '')
    }));

    /* ---------- שכבה 3: צלעות ---------- */
    var gEdges = make('g', {});
    for (var i = 0; i < 4; i++) {
      var a = B[i], b = B[(i + 1) % 4];
      gEdges.appendChild(make('line', {
        x1: a[0], y1: a[1], x2: b[0], y2: b[1],
        class: 'pp-edge pp-edge--base' +
          (v.hiddenBaseEdges.indexOf(i) >= 0 ? ' pp-edge--hidden' : '') +
          (isHl('base-edge', i) ? ' pp-hl' : '')
      }));
    }
    for (i = 0; i < 4; i++) {
      gEdges.appendChild(make('line', {
        x1: A[0], y1: A[1], x2: B[i][0], y2: B[i][1],
        class: 'pp-edge pp-edge--lateral' +
          (v.hiddenLateralEdges.indexOf(i) >= 0 ? ' pp-edge--hidden' : '') +
          (isHl('lateral-edge', i) ? ' pp-hl' : '')
      }));
    }
    svg.appendChild(gEdges);

    /* ---------- שכבה 4: קודקודים ---------- */
    var gVerts = make('g', {});
    for (i = 0; i < 4; i++) {
      gVerts.appendChild(make('circle', {
        cx: B[i][0], cy: B[i][1], r: 4.5,
        class: 'pp-vertex' + (isHl('base-vertex', i) ? ' pp-hl' : '')
      }));
    }
    gVerts.appendChild(make('circle', {
      cx: A[0], cy: A[1], r: 6,
      class: 'pp-apex' + (isHl('apex') ? ' pp-hl' : '')
    }));
    svg.appendChild(gVerts);

    /* ------------------------------------------------------------
       אזורי הלחיצה הם כפתורי HTML אמיתיים המונחים מעל האיור.
       ב-SVG טהור מיקוד המקלדת אינו נתמך באופן אחיד בכל הדפדפנים,
       וכפתור HTML מקבל מיקוד, הפעלה במקלדת וסימון מיקוד בלי תלות במנוע.
       הוא גם מבטיח מטרת מגע של 44 פיקסלים לפחות.
       ------------------------------------------------------------ */
    var wrap = document.createElement('div');
    wrap.className = 'diagram-wrap';
    wrap.appendChild(svg);
    if (!opts.interactive) return wrap;

    var VB_W = 232, VB_H = 210;

    function centroid(pts) {
      var sx = 0, sy = 0;
      pts.forEach(function (p) { sx += p[0]; sy += p[1]; });
      return [sx / pts.length, sy / pts.length];
    }
    function mid(a, b) { return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }

    var layer = document.createElement('div');
    layer.className = 'pp-hits';

    function hit(center, part, index, label) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pp-hit';
      btn.setAttribute('aria-label', label);
      btn.dataset.part = part;
      if (index !== null && index !== undefined) btn.dataset.index = index;
      // קואורדינטות ה-SVG הן פיזיות (משמאל), ולכן left/top ולא inset-inline —
      // ‎inset-inline-start היה מתהפך לימין בעמוד RTL.
      btn.style.left = (center[0] / VB_W * 100) + '%';
      btn.style.top = (center[1] / VB_H * 100) + '%';
      btn.addEventListener('click', function () {
        if (opts.onPick) opts.onPick(part, index, label);
      });
      layer.appendChild(btn);
    }

    var bc = centroid(B);
    // עוגן הבסיס מוסט מהמרכז, כדי שלא יתנגש בקודקוד הראש במבט מלמעלה
    hit([bc[0] + 0.5 * (B[3][0] - bc[0]), bc[1] + 0.5 * (B[3][1] - bc[1])],
      'base', null, 'בסיס הפירמידה');

    v.visibleFaces.forEach(function (i) {
      hit(centroid([A, B[i], B[(i + 1) % 4]]), 'face', i, 'פאה צדדית מספר ' + (i + 1));
    });

    for (i = 0; i < 4; i++) {
      if (v.hiddenBaseEdges.indexOf(i) >= 0) continue;
      hit(mid(B[i], B[(i + 1) % 4]), 'base-edge', i, 'צלע בסיס מספר ' + (i + 1));
    }

    for (i = 0; i < 4; i++) {
      if (v.hiddenLateralEdges.indexOf(i) >= 0) continue;
      hit(mid(A, B[i]), 'lateral-edge', i, 'צלע צדדית מספר ' + (i + 1));
    }

    for (i = 0; i < 4; i++) {
      hit(B[i], 'base-vertex', i, 'קודקוד בסיס מספר ' + (i + 1));
    }

    hit(A, 'apex', null, 'קודקוד הראש');

    wrap.appendChild(layer);
    return wrap;
  }

  global.App = global.App || {};
  global.App.PartsDiagram = {
    views: VIEWS,
    viewOrder: ['front', 'side', 'top'],
    create: create
  };

})(window);
