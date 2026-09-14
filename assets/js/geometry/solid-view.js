/* ============================================================
   solid-view.js — מציג גופים ב-SVG מתוך מנוע הגאומטריה
   ------------------------------------------------------------
   מקבל גוף מ-App.Geometry ומצייר אותו בהיטל אורתוגרפי,
   כולל הסתרת קווים אחוריים, סימון חלקים, ואזורי לחיצה שקופים.
   אותם נתונים בדיוק משמשים גם את המודל התלת־ממדי ואת הפריסה,
   ולכן הספירות והצורות אינן יכולות לסתור זו את זו.
   ============================================================ */
(function (global) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  /* זוויות מבט מוכנות */
  var VIEWS = {
    front: { yaw: 0,            pitch: 0.34, label: 'מבט מלפנים',
             hint: 'כך רואים את הפירמידה כשהיא עומדת מולנו על הבסיס.' },
    side:  { yaw: Math.PI / 2,  pitch: 0.16, label: 'מבט מהצד',
             hint: 'מבט כמעט בגובה השולחן. הבסיס נראה שטוח יותר, והמשולשים בולטים.' },
    top:   { yaw: 0,            pitch: 1.4,  label: 'מבט מלמעלה',
             hint: 'מלמעלה רואים את מצולע הבסיס, וקודקוד הראש נמצא בדיוק במרכזו.' }
  };

  function make(tag, attrs) {
    var n = document.createElementNS(NS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (attrs[k] !== null && attrs[k] !== undefined) n.setAttribute(k, attrs[k]);
    });
    return n;
  }

  /* ---------- אלגברה ---------- */
  function rot(p, yaw, pitch) {
    var x = p[0], y = p[1], z = p[2];
    var cy = Math.cos(yaw), sy = Math.sin(yaw);
    var x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
    var cp = Math.cos(pitch), sp = Math.sin(pitch);
    var y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
    return [x1, y2, z2];
  }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function cross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function norm(a) {
    var L = Math.sqrt(dot(a, a)) || 1;
    return [a[0] / L, a[1] / L, a[2] / L];
  }
  function avg(pts) {
    var s = [0, 0, 0];
    pts.forEach(function (p) { s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; });
    return [s[0] / pts.length, s[1] / pts.length, s[2] / pts.length];
  }

  /* ------------------------------------------------------------
     בניית תיאור הגוף: קודקודים, פאות וצלעות, בצורה אחידה
     לפירמידה ולמנסרה.
     ------------------------------------------------------------ */
  function describe(g) {
    var verts = [], faces = [], edges = [];
    var n = g.n, i;

    if (g.kind === 'pyramid') {
      for (i = 0; i < n; i++) verts.push({ p: g.baseVertices[i], part: 'base-vertex', index: i });
      verts.push({ p: g.apex, part: 'apex', index: null });
      var apexIdx = n;

      faces.push({ idx: [], part: 'base', index: null, pts: g.baseVertices.slice() });
      for (i = 0; i < n; i++) {
        faces.push({
          part: 'face', index: i,
          pts: [g.apex, g.baseVertices[i], g.baseVertices[(i + 1) % n]]
        });
      }
      for (i = 0; i < n; i++) {
        edges.push({
          part: 'base-edge', index: i,
          a: g.baseVertices[i], b: g.baseVertices[(i + 1) % n],
          faces: ['base', 'face' + i]
        });
      }
      for (i = 0; i < n; i++) {
        edges.push({
          part: 'lateral-edge', index: i,
          a: g.apex, b: g.baseVertices[i],
          faces: ['face' + ((i - 1 + n) % n), 'face' + i]
        });
      }
      void apexIdx;
    } else {
      for (i = 0; i < n; i++) verts.push({ p: g.baseVertices[i], part: 'base-vertex', index: i });
      for (i = 0; i < n; i++) verts.push({ p: g.topVertices[i], part: 'top-vertex', index: i });

      faces.push({ part: 'base', index: null, pts: g.baseVertices.slice() });
      faces.push({ part: 'top', index: null, pts: g.topVertices.slice() });
      for (i = 0; i < n; i++) {
        faces.push({
          part: 'face', index: i,
          pts: [g.baseVertices[i], g.baseVertices[(i + 1) % n],
                g.topVertices[(i + 1) % n], g.topVertices[i]]
        });
      }
      for (i = 0; i < n; i++) {
        edges.push({ part: 'base-edge', index: i, a: g.baseVertices[i], b: g.baseVertices[(i + 1) % n],
          faces: ['base', 'face' + i] });
        edges.push({ part: 'top-edge', index: i, a: g.topVertices[i], b: g.topVertices[(i + 1) % n],
          faces: ['top', 'face' + i] });
        edges.push({ part: 'lateral-edge', index: i, a: g.baseVertices[i], b: g.topVertices[i],
          faces: ['face' + ((i - 1 + n) % n), 'face' + i] });
      }
    }
    return { verts: verts, faces: faces, edges: edges };
  }

  /* ------------------------------------------------------------
     יצירת האיור
     ------------------------------------------------------------ */
  function create(opts) {
    opts = opts || {};
    var g = opts.geometry;
    var viewKey = opts.view || 'front';
    var view = VIEWS[viewKey] || VIEWS.front;
    var yaw = opts.yaw === undefined ? view.yaw : opts.yaw;
    var pitch = opts.pitch === undefined ? view.pitch : opts.pitch;
    var S = opts.size || 232;
    var show = opts.show || {};
    var d = describe(g);
    var segs = {};   // קטעי מדידה הניתנים לבחירה (גובה הפירמידה, גובה הפאה)

    var centre = avg(d.verts.map(function (v) { return v.p; }));

    /* --- הטלה --- */
    var rotated = d.verts.map(function (v) { return rot(sub(v.p, centre), yaw, pitch); });
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    rotated.forEach(function (p) {
      if (p[0] < minX) minX = p[0]; if (p[0] > maxX) maxX = p[0];
      if (-p[1] < minY) minY = -p[1]; if (-p[1] > maxY) maxY = -p[1];
    });
    var span = Math.max(maxX - minX, maxY - minY) || 1;
    var margin = opts.margin === undefined ? 26 : opts.margin;
    var scale = (S - margin * 2) / span;
    var cx = S / 2 - ((minX + maxX) / 2) * scale;
    var cy = S / 2 - ((minY + maxY) / 2) * scale;

    function proj(p3) {
      var r = rot(sub(p3, centre), yaw, pitch);
      return [cx + r[0] * scale, cy - r[1] * scale, r[2]];
    }
    function pt(p3) { var q = proj(p3); return q[0].toFixed(2) + ',' + q[1].toFixed(2); }

    /* --- אילו פאות גלויות --- */
    var faceVisible = {};
    var faceDepth = {};
    d.faces.forEach(function (f) {
      var key = f.part === 'face' ? 'face' + f.index : f.part;
      var nrm = norm(cross(sub(f.pts[1], f.pts[0]), sub(f.pts[2], f.pts[0])));
      // מכוונים את הנורמל החוצה מהגוף
      if (dot(nrm, sub(avg(f.pts), centre)) < 0) nrm = [-nrm[0], -nrm[1], -nrm[2]];
      var rn = rot(nrm, yaw, pitch);
      faceVisible[key] = rn[2] > 0.0001;
      faceDepth[key] = rot(sub(avg(f.pts), centre), yaw, pitch)[2];
      f.key = key;
      f.visible = faceVisible[key];
      f.depth = faceDepth[key];
    });

    var svg = make('svg', {
      viewBox: '0 0 ' + S + ' ' + S,
      class: 'solid-view' + (opts.className ? ' ' + opts.className : ''),
      role: opts.interactive ? 'group' : 'img'
    });
    if (!opts.interactive) {
      svg.setAttribute('aria-label', opts.ariaLabel || defaultAria(g, view));
    }

    /* --- פאות, מהרחוקה לקרובה ---
       הבסיס מצויר תמיד, גם כשהוא פונה מאיתנו: כך רואים אותו מבעד
       למעטפת השקופה־למחצה, כמקובל בשרטוט גופים, והוא נשאר בר־לחיצה. */
    if (show.faces !== false) {
      d.faces.slice().sort(function (a, b) { return a.depth - b.depth; }).forEach(function (f) {
        if (!f.visible && f.part !== 'base' && f.part !== 'top') return;
        var cls = f.part === 'base' ? 'pp-base' : (f.part === 'top' ? 'pp-base' : 'pp-face');
        var poly = make('polygon', { points: f.pts.map(pt).join(' '), class: cls });
        poly.setAttribute('data-vis-part', f.part);
        if (f.index !== null && f.index !== undefined) poly.setAttribute('data-vis-index', f.index);
        svg.appendChild(poly);
      });
    }

    /* --- צלעות: רציפות אם נוגעות בפאה גלויה, אחרת מקווקוות --- */
    if (show.edges !== false) {
      var gEdges = make('g', {});
      d.edges.forEach(function (e) {
        var vis = e.faces.some(function (k) { return faceVisible[k]; });
        var a = proj(e.a), b = proj(e.b);
        var line = make('line', {
          x1: a[0].toFixed(2), y1: a[1].toFixed(2),
          x2: b[0].toFixed(2), y2: b[1].toFixed(2),
          class: 'pp-edge pp-edge--' + (e.part === 'lateral-edge' ? 'lateral' : 'base') +
                 (vis ? '' : ' pp-edge--hidden')
        });
        line.setAttribute('data-vis-part', e.part);
        line.setAttribute('data-vis-index', e.index);
        e.visible = vis;
        gEdges.appendChild(line);
      });
      svg.appendChild(gEdges);
    }

    /* --- קו הגובה האנכי + סימן הזווית הישרה --- */
    if (show.height) {
      var foot = [0, 0, 0];
      var apexP = g.kind === 'pyramid' ? g.apex : [0, g.height, 0];
      var fa = proj(foot), ap = proj(apexP);
      var gh = make('g', { class: 'height-mark' });
      var hLine = make('line', {
        x1: ap[0].toFixed(2), y1: ap[1].toFixed(2),
        x2: fa[0].toFixed(2), y2: fa[1].toFixed(2),
        class: 'pp-height'
      });
      hLine.setAttribute('data-vis-part', 'height');
      gh.appendChild(hLine);
      segs.height = { a: apexP, b: foot };
      // סימן זווית ישרה בבסיס הגובה
      var toB = proj(g.baseVertices[0]);
      var ux = (toB[0] - fa[0]), uy = (toB[1] - fa[1]);
      var uL = Math.hypot(ux, uy) || 1; ux /= uL; uy /= uL;
      var vx = (ap[0] - fa[0]), vy = (ap[1] - fa[1]);
      var vL = Math.hypot(vx, vy) || 1; vx /= vL; vy /= vL;
      var m = 9;
      gh.appendChild(make('path', {
        d: 'M ' + (fa[0] + ux * m).toFixed(2) + ' ' + (fa[1] + uy * m).toFixed(2) +
           ' L ' + (fa[0] + ux * m + vx * m).toFixed(2) + ' ' + (fa[1] + uy * m + vy * m).toFixed(2) +
           ' L ' + (fa[0] + vx * m).toFixed(2) + ' ' + (fa[1] + vy * m).toFixed(2),
        class: 'right-angle'
      }));
      gh.appendChild(make('circle', { cx: fa[0].toFixed(2), cy: fa[1].toFixed(2), r: 2.6, class: 'pp-foot' }));
      svg.appendChild(gh);
    }

    /* --- גובה הפאה הצדדית (אפותם הפאה) --- */
    if (show.slant !== undefined && show.slant !== false && g.kind === 'pyramid') {
      var si = show.slant | 0;
      var a1 = g.baseVertices[si], b1 = g.baseVertices[(si + 1) % g.n];
      var mid = [(a1[0] + b1[0]) / 2, 0, (a1[2] + b1[2]) / 2];
      var p1 = proj(g.apex), p2 = proj(mid);
      var sLine = make('line', {
        x1: p1[0].toFixed(2), y1: p1[1].toFixed(2),
        x2: p2[0].toFixed(2), y2: p2[1].toFixed(2),
        class: 'pp-slant'
      });
      sLine.setAttribute('data-vis-part', 'slant');
      svg.appendChild(sLine);
      segs.slant = { a: g.apex, b: mid };
    }

    /* --- קודקודים --- */
    if (show.vertices !== false) {
      var gv = make('g', {});
      d.verts.forEach(function (v) {
        var p = proj(v.p);
        var c = make('circle', {
          cx: p[0].toFixed(2), cy: p[1].toFixed(2),
          r: v.part === 'apex' ? 5.2 : 4,
          class: v.part === 'apex' ? 'pp-apex' : 'pp-vertex'
        });
        c.setAttribute('data-vis-part', v.part);
        if (v.index !== null && v.index !== undefined) c.setAttribute('data-vis-index', v.index);
        gv.appendChild(c);
      });
      svg.appendChild(gv);
    }

    if (opts.highlight) highlight(svg, opts.highlight.part, opts.highlight.index);

    /* --- תוויות טקסט --- */
    if (opts.labels && opts.labels.length) {
      var gl = make('g', {});
      opts.labels.forEach(function (L) {
        var p = proj(L.at);
        var t = make('text', {
          x: (p[0] + (L.dx || 0)).toFixed(2),
          y: (p[1] + (L.dy || 0)).toFixed(2),
          class: 'sv-label', 'text-anchor': L.anchor || 'middle', direction: 'rtl'
        });
        t.textContent = L.text;
        gl.appendChild(t);
      });
      svg.appendChild(gl);
    }

    if (!opts.interactive) return svg;

    /* ------------------------------------------------------------
       אזורי לחיצה — בצורת החלק עצמו, שקופים לחלוטין.
       צלעות וקודקודים מקבלים אזור רחב יותר לנוחות מגע,
       אך הוא אינו נראה על המסך.
       ------------------------------------------------------------ */
    var gHit = make('g', { class: 'pp-hits' });

    function hit(node, part, index, label) {
      node.setAttribute('class', 'pp-hit');
      node.setAttribute('tabindex', '0');
      node.setAttribute('role', 'button');
      node.setAttribute('aria-label', label);
      node.setAttribute('data-part', part);
      if (index !== null && index !== undefined) node.setAttribute('data-index', index);

      var sel = '[data-vis-part="' + part + '"]' +
        (index === null || index === undefined ? '' : '[data-vis-index="' + index + '"]');
      function visual() { return svg.querySelector(sel); }
      function on()  { var e = visual(); if (e) e.classList.add('pp-hover'); }
      function off() { var e = visual(); if (e) e.classList.remove('pp-hover'); }

      node.addEventListener('mouseenter', on);
      node.addEventListener('mouseleave', off);
      node.addEventListener('focus', function () { var e = visual(); if (e) e.classList.add('pp-focus'); on(); });
      node.addEventListener('blur',  function () { var e = visual(); if (e) e.classList.remove('pp-focus'); off(); });

      function fire(ev) {
        ev.preventDefault(); ev.stopPropagation();
        if (opts.onPick) opts.onPick(part, index, label);
      }
      node.addEventListener('click', fire);
      node.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar') fire(ev);
      });
      gHit.appendChild(node);
    }

    var partNames = {
      'base': 'הבסיס', 'top': 'הבסיס העליון', 'face': 'פאה צדדית',
      'base-edge': 'צלע בסיס', 'top-edge': 'צלע עליונה', 'lateral-edge': 'צלע צדדית',
      'base-vertex': 'קודקוד בסיס', 'top-vertex': 'קודקוד עליון', 'apex': 'קודקוד הראש',
      'height': 'גובה הפירמידה', 'slant': 'גובה הפאה הצדדית'
    };

    var want = opts.pickable || ['base', 'face', 'base-edge', 'lateral-edge', 'base-vertex', 'apex'];
    function wants(p) { return want.indexOf(p) >= 0; }

    /* הבסיס ראשון — הוא הגדול ביותר, ולכן נשאר מתחת לכל השאר.
       אחריו הפאות הצדדיות הגלויות, מהרחוקה לקרובה. */
    d.faces.filter(function (f) { return f.part === 'base' || f.part === 'top'; })
      .forEach(function (f) {
        if (!wants(f.part)) return;
        hit(make('polygon', { points: f.pts.map(pt).join(' ') }), f.part, f.index, partNames[f.part]);
      });

    d.faces.filter(function (f) { return f.part === 'face'; })
      .sort(function (a, b) { return a.depth - b.depth; })
      .forEach(function (f) {
        if (!f.visible || !wants(f.part)) return;
        hit(make('polygon', { points: f.pts.map(pt).join(' ') }), f.part, f.index,
          partNames[f.part] + ' מספר ' + (f.index + 1));
      });

    d.edges.forEach(function (e) {
      if (!e.visible || !wants(e.part)) return;
      var a = proj(e.a), b = proj(e.b);
      hit(make('line', {
        x1: a[0].toFixed(2), y1: a[1].toFixed(2), x2: b[0].toFixed(2), y2: b[1].toFixed(2)
      }), e.part, e.index, partNames[e.part] + ' מספר ' + (e.index + 1));
    });

    // קטעי מדידה — גובה הפירמידה וגובה הפאה הצדדית
    Object.keys(segs).forEach(function (key) {
      if (!wants(key)) return;
      var a = proj(segs[key].a), b = proj(segs[key].b);
      hit(make('line', {
        x1: a[0].toFixed(2), y1: a[1].toFixed(2), x2: b[0].toFixed(2), y2: b[1].toFixed(2)
      }), key, null, partNames[key]);
    });

    d.verts.forEach(function (v) {
      if (!wants(v.part)) return;
      var p = proj(v.p);
      hit(make('circle', { cx: p[0].toFixed(2), cy: p[1].toFixed(2), r: v.part === 'apex' ? 16 : 15 }),
        v.part, v.index,
        partNames[v.part] + (v.index === null || v.index === undefined ? '' : ' מספר ' + (v.index + 1)));
    });

    svg.appendChild(gHit);
    return svg;
  }

  function defaultAria(g, view) {
    if (g.kind === 'prism') {
      return g.names.prism + ' ב' + view.label + '. ' +
        g.counts.faces + ' פאות, ' + g.counts.edges + ' צלעות ו-' + g.counts.vertices + ' קודקודים.';
    }
    return g.names.pyramid + ' ב' + view.label + '. בסיס ' + g.names.base +
      ', ' + g.n + ' פאות צדדיות משולשות, וקודקוד ראש אחד. סך הכול ' +
      g.counts.faces + ' פאות, ' + g.counts.edges + ' צלעות ו-' + g.counts.vertices + ' קודקודים.';
  }

  /** מסמן את החלק עצמו — לא סימן נפרד */
  function highlight(svg, part, index) {
    [].forEach.call(svg.querySelectorAll('.pp-hl'), function (n) { n.classList.remove('pp-hl'); });
    if (!part) return;
    var sel = '[data-vis-part="' + part + '"]' +
      (index === null || index === undefined ? '' : '[data-vis-index="' + index + '"]');
    [].forEach.call(svg.querySelectorAll(sel), function (n) { n.classList.add('pp-hl'); });
  }

  function lock(svg) {
    var layer = svg.querySelector('.pp-hits');
    if (!layer) return;
    layer.setAttribute('class', 'pp-hits pp-hits--off');
    [].forEach.call(layer.childNodes, function (n) {
      if (n.setAttribute) n.setAttribute('tabindex', '-1');
    });
  }

  global.App = global.App || {};
  global.App.SolidView = {
    VIEWS: VIEWS,
    viewOrder: ['front', 'side', 'top'],
    create: create,
    highlight: highlight,
    lock: lock,
    describe: describe
  };

})(window);
