/* ============================================================
   pyramid-geometry.js — מקור האמת הגאומטרי היחיד של האתר
   ------------------------------------------------------------
   כל הייצוגים — מודל תלת־ממדי, איור SVG, פריסה, אנימציית קיפול,
   ומספרי הפאות/הצלעות/הקודקודים — נגזרים מכאן.
   כך הם לא יכולים לסתור זה את זה.

   מערכת הצירים: הבסיס במישור y=0, קודקוד הראש ב-(0, h, 0).
   ============================================================ */
(function (global) {
  'use strict';

  var TAU = Math.PI * 2;

  /* ------------------------------------------------------------
     שמות הפירמידות בעברית לפי מספר צלעות הבסיס
     ------------------------------------------------------------ */
  var BASE_NAMES = {
    3: { base: 'משולש',  pyramid: 'פירמידה משולשת',  prism: 'מנסרה משולשת' },
    4: { base: 'מרובע',  pyramid: 'פירמידה מרובעת',  prism: 'מנסרה מרובעת' },
    5: { base: 'מחומש',  pyramid: 'פירמידה מחומשת',  prism: 'מנסרה מחומשת' },
    6: { base: 'משושה',  pyramid: 'פירמידה משושה',   prism: 'מנסרה משושה' },
    7: { base: 'משובע',  pyramid: 'פירמידה משובעת',  prism: 'מנסרה משובעת' },
    8: { base: 'מתומן',  pyramid: 'פירמידה מתומנת',  prism: 'מנסרה מתומנת' }
  };

  function names(n) { return BASE_NAMES[n] || BASE_NAMES[4]; }

  /* ------------------------------------------------------------
     בניית פירמידה בעלת בסיס מצולע משוכלל בעל n צלעות
     ------------------------------------------------------------ */
  function pyramid(n, opts) {
    opts = opts || {};
    n = Math.max(3, Math.min(8, n | 0));
    var R = opts.radius === undefined ? 1 : opts.radius;   // רדיוס הבסיס
    var h = opts.height === undefined ? 1.6 : opts.height;  // גובה הפירמידה
    // סיבוב הבסיס כך שצלע פונה אל הצופה (ולא קודקוד) — קריא יותר בשרטוט
    var phase = opts.phase === undefined ? (Math.PI / n) + Math.PI / 2 : opts.phase;

    var baseVertices = [];
    for (var i = 0; i < n; i++) {
      var a = phase + (i / n) * TAU;
      baseVertices.push([R * Math.cos(a), 0, R * Math.sin(a)]);
    }
    var apex = [0, h, 0];

    var baseEdges = [], lateralEdges = [], lateralFaces = [];
    for (i = 0; i < n; i++) {
      baseEdges.push([i, (i + 1) % n]);
      lateralEdges.push(i);
      lateralFaces.push([i, (i + 1) % n]);
    }

    var sideLength = 2 * R * Math.sin(Math.PI / n);
    var apothem = R * Math.cos(Math.PI / n);            // מרכז → אמצע צלע
    var baseArea = 0.5 * n * sideLength * apothem;
    var slantHeight = Math.sqrt(h * h + apothem * apothem);   // גובה פאה צדדית
    var lateralEdgeLen = Math.sqrt(h * h + R * R);            // אורך צלע צדדית

    return {
      kind: 'pyramid',
      n: n,
      radius: R,
      height: h,
      phase: phase,
      baseVertices: baseVertices,
      apex: apex,
      baseEdges: baseEdges,
      lateralEdges: lateralEdges,
      lateralFaces: lateralFaces,
      counts: { vertices: n + 1, edges: 2 * n, faces: n + 1 },
      euler: (n + 1) + (n + 1) - (2 * n),   // F + V − E, תמיד 2
      metrics: {
        sideLength: sideLength,
        apothem: apothem,
        baseArea: baseArea,
        slantHeight: slantHeight,
        lateralEdge: lateralEdgeLen,
        volume: baseArea * h / 3
      },
      names: names(n)
    };
  }

  /* ------------------------------------------------------------
     מנסרה ישרה מעל אותו בסיס — להשוואת נפחים ביחידה 2
     ------------------------------------------------------------ */
  function prism(n, opts) {
    var p = pyramid(n, opts);
    var top = p.baseVertices.map(function (v) { return [v[0], p.height, v[2]]; });
    return {
      kind: 'prism',
      n: p.n,
      radius: p.radius,
      height: p.height,
      baseVertices: p.baseVertices,
      topVertices: top,
      counts: { vertices: 2 * p.n, edges: 3 * p.n, faces: p.n + 2 },
      euler: (p.n + 2) + (2 * p.n) - (3 * p.n),
      metrics: {
        baseArea: p.metrics.baseArea,
        volume: p.metrics.baseArea * p.height
      },
      names: p.names
    };
  }

  /* ------------------------------------------------------------
     פריסה: הבסיס במרכז, ומכל צלע בסיס יוצא משולש החוצה.
     מחזיר קואורדינטות דו־ממדיות בלבד — אותו מקור נתונים
     משמש גם את אנימציית הקיפול.
     ------------------------------------------------------------ */
  function net(n, opts) {
    var g = pyramid(n, opts);
    var R = g.radius, sl = g.metrics.slantHeight, ap = g.metrics.apothem;

    // מצולע הבסיס במישור הפריסה (אותו מצולע, במבט על)
    var basePts = g.baseVertices.map(function (v) { return [v[0], v[2]]; });

    var flaps = [];
    for (var i = 0; i < n; i++) {
      var a = basePts[i], b = basePts[(i + 1) % n];
      var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      var len = Math.sqrt(mx * mx + my * my) || 1;
      var ux = mx / len, uy = my / len;            // כיוון החוצה מהמרכז
      // קודקוד המשולש נמצא במרחק הגובה של הפאה מאמצע הצלע
      flaps.push({
        edgeIndex: i,
        a: a, b: b,
        tip: [mx + ux * sl, my + uy * sl],
        hinge: [mx, my]
      });
    }

    return {
      n: n,
      basePolygon: basePts,
      flaps: flaps,
      slantHeight: sl,
      apothem: ap,
      radius: R,
      geometry: g
    };
  }

  /* ------------------------------------------------------------
     קיפול: פרמטר יחיד t בין 0 (פרוס) ל-1 (סגור).
     כל משולש מסתובב סביב צלע הבסיס שלו בזווית t·θ,
     כאשר θ היא הזווית הדו־מישורית הסופית.
     מחזיר את מיקום קודקוד המשולש בתלת־ממד.
     ------------------------------------------------------------ */
  function foldTip(netData, flapIndex, t) {
    var f = netData.flaps[flapIndex];
    var ap = netData.apothem, sl = netData.slantHeight;
    var h = netData.geometry.height;

    /* הווקטור מציר הקיפול (אמצע צלע הבסיס) אל קודקוד המשולש מתחיל
       שכוב החוצה באורך sl, ומסתובב סביב הציר בזווית theta:
         מרחק החוצה = sl·cos(theta)   ,   גובה = sl·sin(theta)
       בסוף הקיפול הקודקוד חייב להגיע אל הציר (מרחק כולל 0) ולגובה h,
       ולכן cos(thetaFinal) = −ap/sl. מכאן: */
    var thetaFinal = Math.PI - Math.atan2(h, ap);
    var theta = thetaFinal * t;

    var out = ap + sl * Math.cos(theta);
    var up = sl * Math.sin(theta);

    var mx = f.hinge[0], my = f.hinge[1];
    var len = Math.sqrt(mx * mx + my * my) || 1;
    var ux = mx / len, uy = my / len;

    return [ux * out, up, uy * out];
  }

  /* ------------------------------------------------------------
     עזרי חישוב לפעילויות יחידה 2
     ------------------------------------------------------------ */
  function pyramidVolume(baseArea, height) { return baseArea * height / 3; }
  function prismVolume(baseArea, height) { return baseArea * height; }

  /** שטח מצולע משוכלל לפי אורך צלע */
  function regularPolygonArea(n, side) {
    return (n * side * side) / (4 * Math.tan(Math.PI / n));
  }

  /* ------------------------------------------------------------
     בדיקה עצמית — נקראת בבדיקות, לא בזמן ריצה רגיל
     ------------------------------------------------------------ */
  function selfTest() {
    var problems = [];
    for (var n = 3; n <= 8; n++) {
      var g = pyramid(n);
      if (g.counts.vertices !== n + 1) problems.push('n=' + n + ' vertices');
      if (g.counts.edges !== 2 * n) problems.push('n=' + n + ' edges');
      if (g.counts.faces !== n + 1) problems.push('n=' + n + ' faces');
      if (g.euler !== 2) problems.push('n=' + n + ' euler=' + g.euler);
      if (g.baseVertices.length !== n) problems.push('n=' + n + ' baseVertices');
      if (g.lateralFaces.length !== n) problems.push('n=' + n + ' lateralFaces');
      // הגובה האנכי חייב להיות קטן מהצלע הצדדית ומגובה הפאה
      if (!(g.height < g.metrics.slantHeight)) problems.push('n=' + n + ' height>=slant');
      if (!(g.metrics.slantHeight < g.metrics.lateralEdge)) problems.push('n=' + n + ' slant>=lateralEdge');
      // נפח הפירמידה = שליש מנפח המנסרה
      var pr = prism(n);
      var ratio = pr.metrics.volume / g.metrics.volume;
      if (Math.abs(ratio - 3) > 1e-9) problems.push('n=' + n + ' ratio=' + ratio);
      // הפריסה: מספר הדשים שווה למספר צלעות הבסיס
      var nt = net(n);
      if (nt.flaps.length !== n) problems.push('n=' + n + ' flaps');
      // קיפול מלא מחזיר את כל הקודקודים לאותה נקודה (קודקוד הראש)
      var tip0 = foldTip(nt, 0, 1), tip1 = foldTip(nt, 1 % n, 1);
      var d = Math.sqrt(Math.pow(tip0[0] - tip1[0], 2) + Math.pow(tip0[1] - tip1[1], 2) +
                        Math.pow(tip0[2] - tip1[2], 2));
      if (d > 1e-9) problems.push('n=' + n + ' fold tips differ by ' + d.toFixed(6));
      if (Math.abs(tip0[1] - g.height) > 1e-9) problems.push('n=' + n + ' fold height');
    }
    return problems;
  }

  global.App = global.App || {};
  global.App.Geometry = {
    pyramid: pyramid,
    prism: prism,
    net: net,
    foldTip: foldTip,
    names: names,
    pyramidVolume: pyramidVolume,
    prismVolume: prismVolume,
    regularPolygonArea: regularPolygonArea,
    selfTest: selfTest
  };

})(window);
