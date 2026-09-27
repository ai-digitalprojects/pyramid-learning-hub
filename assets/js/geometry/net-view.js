/* ============================================================
   net-view.js — פריסות וקיפול, מתוך אותו מנוע גאומטריה
   ------------------------------------------------------------
   הפריסה, הקיפול והמודל המרחבי נבנים כולם מ-App.Geometry,
   ולכן הם תמיד מתאימים זה לזה.
   ============================================================ */
(function (global) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  function make(tag, attrs) {
    var n = document.createElementNS(NS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (attrs[k] !== null && attrs[k] !== undefined) n.setAttribute(k, attrs[k]);
    });
    return n;
  }

  function fit(points, S, margin) {
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    points.forEach(function (p) {
      if (p[0] < minX) minX = p[0]; if (p[0] > maxX) maxX = p[0];
      if (p[1] < minY) minY = p[1]; if (p[1] > maxY) maxY = p[1];
    });
    var span = Math.max(maxX - minX, maxY - minY) || 1;
    var scale = (S - margin * 2) / span;
    return {
      scale: scale,
      cx: S / 2 - ((minX + maxX) / 2) * scale,
      cy: S / 2 - ((minY + maxY) / 2) * scale
    };
  }

  /* ------------------------------------------------------------
     פריסה שטוחה
     opts: { n, variant, size, interactive, ariaLabel }
     variant: 'valid' | 'missing-flap' | 'wrong-base' | 'double-flap' | 'prism'
     הווריאנטים השגויים נוצרים בשינוי מכוון של פריסה תקינה,
     כך שכל מסיח מייצג טעות מוכרת ולא צורה אקראית.
     ------------------------------------------------------------ */
  function netSvg(opts) {
    opts = opts || {};
    var n = opts.n || 4;
    var S = opts.size || 200;
    var variant = opts.variant || 'valid';
    var G = global.App.Geometry;

    var data = G.net(n, { radius: 1, height: opts.height || 1.4 });
    var base = data.basePolygon;
    var flaps = data.flaps.slice();

    if (variant === 'missing-flap') flaps = flaps.slice(0, n - 1);
    if (variant === 'double-flap') {
      // שני משולשים על אותה צלע — לא ניתן לקיפול
      var extra = Object.assign({}, flaps[0]);
      var f0 = flaps[0];
      var dx = f0.tip[0] - f0.hinge[0], dy = f0.tip[1] - f0.hinge[1];
      extra.tip = [f0.hinge[0] - dx * 0.9, f0.hinge[1] - dy * 0.9];
      flaps = flaps.concat([extra]);
    }
    if (variant === 'wrong-base') {
      // בסיס בעל מספר צלעות אחר ממספר המשולשים
      var other = G.net(n === 4 ? 5 : 4, { radius: 1, height: opts.height || 1.4 });
      base = other.basePolygon;
    }

    var all = base.slice();
    flaps.forEach(function (f) { all.push(f.tip); });
    var t = fit(all, S, 14);
    function P(p) { return (t.cx + p[0] * t.scale).toFixed(2) + ',' + (t.cy + p[1] * t.scale).toFixed(2); }

    var svg = make('svg', {
      viewBox: '0 0 ' + S + ' ' + S,
      class: 'net-svg' + (opts.className ? ' ' + opts.className : ''),
      role: 'img',
      'aria-label': opts.ariaLabel || describeNet(n, variant)
    });

    svg.appendChild(make('polygon', { points: base.map(P).join(' '), class: 'pp-base' }));
    flaps.forEach(function (f) {
      svg.appendChild(make('polygon', {
        points: [P(f.a), P(f.b), P(f.tip)].join(' '), class: 'pp-face'
      }));
    });
    // קווי הקיפול
    base.forEach(function (p, i) {
      var q = base[(i + 1) % base.length];
      svg.appendChild(make('line', {
        x1: P(p).split(',')[0], y1: P(p).split(',')[1],
        x2: P(q).split(',')[0], y2: P(q).split(',')[1],
        class: 'pp-edge pp-fold-line'
      }));
    });
    flaps.forEach(function (f) {
      svg.appendChild(make('polyline', {
        points: [P(f.a), P(f.tip), P(f.b)].join(' '),
        class: 'pp-edge', fill: 'none'
      }));
    });
    return svg;
  }

  function describeNet(n, variant) {
    var G = global.App.Geometry;
    var nm = G.names(n);
    if (variant === 'missing-flap') {
      return 'פריסה ובה ' + nm.base + ' ורק ' + (n - 1) + ' משולשים, חסר משולש אחד.';
    }
    if (variant === 'double-flap') {
      return 'פריסה ובה ' + nm.base + ' ו-' + (n + 1) + ' משולשים, כששניים מהם יוצאים מאותה צלע.';
    }
    if (variant === 'wrong-base') {
      return 'פריסה שבה מספר המשולשים אינו מתאים למספר צלעות הבסיס.';
    }
    return 'פריסה של ' + nm.pyramid + ': ' + nm.base + ' במרכז, ומכל צלע שלו יוצא משולש. סך הכול ' + n + ' משולשים.';
  }

  /* ------------------------------------------------------------
     קיפול: אותו t לכל המשולשים, מ-0 (פרוס) עד 1 (סגור)
     ------------------------------------------------------------ */
  function foldSvg(opts) {
    opts = opts || {};
    var n = opts.n || 4;
    var t = Math.max(0, Math.min(1, opts.t === undefined ? 0 : opts.t));
    var S = opts.size || 220;
    var G = global.App.Geometry;
    var data = G.net(n, { radius: 1, height: opts.height || 1.4 });
    var g = data.geometry;

    // המצלמה מתרוממת ככל שהקיפול מתקדם: מלמעלה (פריסה) אל מבט שלושת־רבעי
    var pitch = 1.45 - 1.11 * t;
    var yaw = 0;

    var base3 = g.baseVertices;
    var tips = [];
    for (var i = 0; i < n; i++) tips.push(G.foldTip(data, i, t));

    function rot(p) {
      var x = p[0], y = p[1], z = p[2];
      var cy = Math.cos(yaw), sy = Math.sin(yaw);
      var x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
      var cp = Math.cos(pitch), sp = Math.sin(pitch);
      return [x1, y * cp - z1 * sp, y * sp + z1 * cp];
    }

    var all2 = [];
    base3.concat(tips).forEach(function (p) { var r = rot(p); all2.push([r[0], -r[1]]); });
    var tr = fit(all2, S, 16);
    function P(p3) {
      var r = rot(p3);
      return [(tr.cx + r[0] * tr.scale), (tr.cy - r[1] * tr.scale), r[2]];
    }
    function S2(p3) { var q = P(p3); return q[0].toFixed(2) + ',' + q[1].toFixed(2); }

    var svg = make('svg', {
      viewBox: '0 0 ' + S + ' ' + S,
      class: 'net-svg fold-svg',
      role: 'img',
      'aria-label': foldAria(n, t)
    });

    svg.appendChild(make('polygon', { points: base3.map(S2).join(' '), class: 'pp-base' }));

    // המשולשים מהרחוק לקרוב, כדי שהחפיפה תיראה נכון
    var order = [];
    for (i = 0; i < n; i++) {
      order.push({ i: i, depth: P(tips[i])[2] });
    }
    order.sort(function (a, b) { return a.depth - b.depth; });
    order.forEach(function (o) {
      var i2 = o.i;
      svg.appendChild(make('polygon', {
        points: [S2(base3[i2]), S2(base3[(i2 + 1) % n]), S2(tips[i2])].join(' '),
        class: 'pp-face'
      }));
      svg.appendChild(make('polyline', {
        points: [S2(base3[i2]), S2(tips[i2]), S2(base3[(i2 + 1) % n])].join(' '),
        class: 'pp-edge', fill: 'none'
      }));
    });

    for (i = 0; i < n; i++) {
      svg.appendChild(make('line', {
        x1: P(base3[i])[0].toFixed(2), y1: P(base3[i])[1].toFixed(2),
        x2: P(base3[(i + 1) % n])[0].toFixed(2), y2: P(base3[(i + 1) % n])[1].toFixed(2),
        class: 'pp-edge pp-fold-line'
      }));
    }
    return svg;
  }

  function foldAria(n, t) {
    var G = global.App.Geometry;
    var nm = G.names(n);
    if (t <= 0.02) return 'הפריסה של ' + nm.pyramid + ' פתוחה לגמרי על המישור.';
    if (t >= 0.98) return nm.pyramid + ' סגורה לגמרי; כל המשולשים נפגשים בקודקוד הראש.';
    return 'הפריסה של ' + nm.pyramid + ' מקופלת בכ-' + Math.round(t * 100) + ' אחוזים.';
  }

  global.App = global.App || {};
  global.App.NetView = {
    netSvg: netSvg,
    foldSvg: foldSvg,
    describeNet: describeNet
  };

})(window);
