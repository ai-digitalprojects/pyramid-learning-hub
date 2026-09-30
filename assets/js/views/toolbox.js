/* ============================================================
   views/toolbox.js — ארגז הכלים
   ------------------------------------------------------------
   ארבעה כלים: מודל תלת־ממדי, פריסה וקיפול, כרטיס הנוסחה ומילון.
   המודל התלת־ממדי משתמש ב-Three.js המאוחסן בתוך הפרויקט.
   אם אין WebGL — מוצג בדיוק אותו מודל ב-SVG, עם אותם מתגים
   ואותם נתונים, כך שהכלי עובד במלואו בכל מקרה.
   ============================================================ */
(function (global) {
  'use strict';

  var App = global.App = global.App || {};
  App.views = App.views || {};

  var THREE_URL = 'assets/js/vendor/three.min.js';
  var ORBIT_URL = 'assets/js/vendor/OrbitControls.js';
  var threeState = 'idle';   // idle | loading | ready | failed

  function webglAvailable() {
    try {
      var c = document.createElement('canvas');
      return !!(global.WebGLRenderingContext &&
        (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) { return false; }
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('failed: ' + src)); };
      document.body.appendChild(s);
    });
  }

  function ensureThree() {
    if (threeState === 'ready') return Promise.resolve(true);
    if (threeState === 'failed') return Promise.resolve(false);
    threeState = 'loading';
    return loadScript(THREE_URL)
      .then(function () { return loadScript(ORBIT_URL); })
      .then(function () { threeState = 'ready'; return true; })
      .catch(function () { threeState = 'failed'; return false; });
  }

  App.views.toolbox = function (mount) {
    var UI = App.UI, G = App.Geometry, SV = App.SolidView, NV = App.NetView, el = UI.el;
    var S = global.PyramidData.strings;

    var state = {
      tab: 'model',
      n: 4, h: 1.5,
      show: { base: true, faces: true, edges: true, vertices: true, height: false },
      view: 'front',
      foldT: 0,
      three: null
    };

    var content = el('div', { class: 'stack' });

    /* ============================================================
       כלי 1 — המודל
       ============================================================ */
    function buildModelTool() {
      var stage = el('div', { class: 'diagram-stage' });
      var readout = el('div', { class: 'readout', 'aria-live': 'polite' });
      var modeNote = el('p', { class: 'view-hint' });

      function geometry() { return G.pyramid(state.n, { radius: 1, height: state.h }); }

      function updateReadout() {
        var g = geometry();
        UI.clear(readout);
        [['שם', g.names.pyramid], ['פאות', g.counts.faces],
         ['צלעות', g.counts.edges], ['קודקודים', g.counts.vertices]
        ].forEach(function (pair) {
          readout.appendChild(el('div', { class: 'readout__item' }, [
            document.createTextNode(pair[0] + ': '),
            el('span', { class: 'readout__value', text: String(pair[1]) })
          ]));
        });
      }

      function drawSvg() {
        UI.clear(stage);
        stage.appendChild(SV.create({
          geometry: geometry(), view: state.view, size: 280,
          show: {
            faces: state.show.faces,
            edges: state.show.edges,
            vertices: state.show.vertices,
            height: state.show.height
          }
        }));
        // "הצג בסיס" מנוהל כאן, כי הבסיס מצויר תמיד ברנדרר
        var baseEl = stage.querySelector('polygon[data-vis-part="base"]');
        if (baseEl) baseEl.style.display = state.show.base ? '' : 'none';
      }

      function drawThree() {
        var T = global.THREE;
        var g = geometry();
        UI.clear(stage);

        var host = el('div', { class: 'three-host' });
        stage.appendChild(host);

        var w = host.clientWidth || 320, h = 300;
        var scene = new T.Scene();
        var camera = new T.PerspectiveCamera(42, w / h, 0.1, 100);
        camera.position.set(3.2, 2.4, 3.2);

        var renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, 2));
        renderer.setSize(w, h);
        host.appendChild(renderer.domElement);
        renderer.domElement.setAttribute('aria-hidden', 'true');

        scene.add(new T.AmbientLight(0xffffff, 0.85));
        var dir = new T.DirectionalLight(0xffffff, 0.5);
        dir.position.set(3, 5, 2);
        scene.add(dir);

        var yOffset = -g.height / 3;
        var group = new T.Group();
        group.position.y = yOffset;
        scene.add(group);

        // פאות צדדיות
        var pos = [];
        for (var i = 0; i < g.n; i++) {
          var a = g.baseVertices[i], b = g.baseVertices[(i + 1) % g.n];
          pos.push(g.apex[0], g.apex[1], g.apex[2], a[0], a[1], a[2], b[0], b[1], b[2]);
        }
        var fg = new T.BufferGeometry();
        fg.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
        fg.computeVertexNormals();
        var faces = new T.Mesh(fg, new T.MeshStandardMaterial({
          color: 0x1f8a8c, transparent: true, opacity: 0.42, side: T.DoubleSide,
          roughness: 0.85, metalness: 0
        }));
        group.add(faces);

        // בסיס
        var bp = [];
        for (i = 1; i < g.n - 1; i++) {
          bp.push(g.baseVertices[0][0], 0, g.baseVertices[0][2],
                  g.baseVertices[i][0], 0, g.baseVertices[i][2],
                  g.baseVertices[i + 1][0], 0, g.baseVertices[i + 1][2]);
        }
        var bg = new T.BufferGeometry();
        bg.setAttribute('position', new T.Float32BufferAttribute(bp, 3));
        bg.computeVertexNormals();
        var baseMesh = new T.Mesh(bg, new T.MeshStandardMaterial({
          color: 0xe0a32e, transparent: true, opacity: 0.6, side: T.DoubleSide,
          roughness: 0.9, metalness: 0
        }));
        group.add(baseMesh);

        // צלעות
        var ep = [];
        for (i = 0; i < g.n; i++) {
          var p1 = g.baseVertices[i], p2 = g.baseVertices[(i + 1) % g.n];
          ep.push(p1[0], p1[1], p1[2], p2[0], p2[1], p2[2]);
          ep.push(g.apex[0], g.apex[1], g.apex[2], p1[0], p1[1], p1[2]);
        }
        var eg = new T.BufferGeometry();
        eg.setAttribute('position', new T.Float32BufferAttribute(ep, 3));
        var edges = new T.LineSegments(eg, new T.LineBasicMaterial({ color: 0x16233a }));
        group.add(edges);

        // קודקודים
        var verts = new T.Group();
        var sph = new T.SphereGeometry(0.055, 14, 10);
        g.baseVertices.forEach(function (v) {
          var m = new T.Mesh(sph, new T.MeshStandardMaterial({ color: 0x16233a }));
          m.position.set(v[0], v[1], v[2]);
          verts.add(m);
        });
        var apexDot = new T.Mesh(new T.SphereGeometry(0.075, 14, 10),
          new T.MeshStandardMaterial({ color: 0xb4451e }));
        apexDot.position.set(0, g.height, 0);
        verts.add(apexDot);
        group.add(verts);

        // גובה
        var hg = new T.BufferGeometry();
        hg.setAttribute('position', new T.Float32BufferAttribute(
          [0, g.height, 0, 0, 0, 0], 3));
        var heightLine = new T.Line(hg, new T.LineDashedMaterial({
          color: 0xb4451e, dashSize: 0.12, gapSize: 0.08, linewidth: 2
        }));
        heightLine.computeLineDistances();
        group.add(heightLine);

        function applyToggles() {
          faces.visible = state.show.faces;
          baseMesh.visible = state.show.base;
          edges.visible = state.show.edges;
          verts.visible = state.show.vertices;
          heightLine.visible = state.show.height;
        }
        applyToggles();

        var controls = new T.OrbitControls(camera, renderer.domElement);
        controls.enablePan = false;
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.minDistance = 2.2;
        controls.maxDistance = 8;
        controls.minPolarAngle = 0.15;
        controls.maxPolarAngle = Math.PI / 2 + 0.25;
        controls.target.set(0, 0, 0);

        var alive = true;
        var lastW = 0, lastH = 0;

        /* גודל הבד נקבע רק אחרי שהוא מחובר לעמוד, ולכן נמדד בכל פריים.
           כך הוא גם מתאים את עצמו לסיבוב המסך ולשינוי גודל החלון. */
        function fit() {
          var cw = host.clientWidth || 320;
          var ch = Math.max(240, Math.min(360, Math.round(cw * 0.72)));
          if (cw === lastW && ch === lastH) return;
          lastW = cw; lastH = ch;
          host.style.blockSize = ch + 'px';
          camera.aspect = cw / ch;
          camera.updateProjectionMatrix();
          renderer.setSize(cw, ch);   // מעדכן גם את ה-CSS של הבד
        }

        /* הלולאה מתחילה לפני שהבד מחובר לעמוד, ולכן עוצרים רק
           אחרי שהוא היה מחובר פעם אחת ואז הוסר. */
        var attachedOnce = false;
        function tick() {
          if (!alive) return;
          var inDoc = document.body.contains(renderer.domElement);
          if (inDoc) attachedOnce = true;
          if (attachedOnce && !inDoc) { alive = false; renderer.dispose(); return; }
          if (inDoc) {
            fit();
            controls.update();
            renderer.render(scene, camera);
          }
          global.requestAnimationFrame(tick);
        }
        tick();

        state.three = { applyToggles: applyToggles, stop: function () { alive = false; } };

        // תיאור טקסטואלי — קוראי מסך מקבלים את אותו מידע
        stage.appendChild(el('p', { class: 'sr-only', text: SV.create ? '' : '' }));
        stage.appendChild(el('p', {
          class: 'sr-only',
          text: g.names.pyramid + ': ' + g.counts.faces + ' פאות, ' +
                g.counts.edges + ' צלעות ו-' + g.counts.vertices + ' קודקודים.'
        }));
      }

      function redraw() {
        if (state.three) { state.three.stop(); state.three = null; }
        if (threeState === 'ready') {
          try { drawThree(); modeNote.textContent = 'אפשר לסובב את המודל בגרירה, ולהתקרב בגלגלת או בצביטה.'; return; }
          catch (e) { threeState = 'failed'; }
        }
        drawSvg();
        modeNote.textContent = threeState === 'failed'
          ? 'המודל מוצג כשרטוט. בחרו זווית מבט בכפתורים שמעל.'
          : SV.VIEWS[state.view].hint;
      }

      function refresh() { updateReadout(); redraw(); }

      /* --- מתגים --- */
      function toggle(key, label) {
        return el('label', { class: 'toggle' }, [
          el('input', {
            type: 'checkbox', checked: state.show[key] ? 'checked' : null,
            onchange: function () {
              state.show[key] = this.checked;
              if (state.three) state.three.applyToggles(); else redraw();
            }
          }),
          el('span', { text: label })
        ]);
      }

      var viewButtons = el('div', { class: 'view-switch', role: 'group',
        'aria-label': 'זווית מבט (בתצוגת שרטוט)' },
        SV.viewOrder.map(function (k) {
          return el('button', {
            type: 'button', class: 'view-btn' + (state.view === k ? ' view-btn--active' : ''),
            'aria-pressed': state.view === k ? 'true' : 'false',
            onclick: function () { state.view = k; refreshTab(); }
          }, [document.createTextNode(SV.VIEWS[k].label)]);
        }));

      var panel = el('div', { class: 'stack' }, [
        el('div', { class: 'explore-controls' }, [
          el('div', { class: 'control-group' }, [
            el('label', { class: 'control-group__label', text: 'מספר צלעות הבסיס' }),
            el('input', {
              type: 'range', min: '3', max: '8', step: '1', value: String(state.n),
              'aria-label': 'מספר צלעות הבסיס',
              oninput: function () { state.n = parseInt(this.value, 10); refresh(); }
            })
          ]),
          el('div', { class: 'control-group' }, [
            el('label', { class: 'control-group__label', text: 'גובה' }),
            el('input', {
              type: 'range', min: '0.6', max: '2.8', step: '0.1', value: String(state.h),
              'aria-label': 'גובה הפירמידה',
              oninput: function () { state.h = parseFloat(this.value); refresh(); }
            })
          ])
        ]),
        el('div', { class: 'toggle-row', role: 'group', 'aria-label': 'מה להציג' }, [
          toggle('base', 'בסיס'), toggle('faces', 'מעטפת'),
          toggle('edges', 'צלעות'), toggle('vertices', 'קודקודים'),
          toggle('height', 'גובה')
        ]),
        stage, modeNote, readout
      ]);

      // תצוגת שרטוט זקוקה לכפתורי זווית; תצוגת תלת־ממד לא
      if (threeState !== 'ready') panel.insertBefore(viewButtons, stage);

      updateReadout();
      redraw();
      return panel;
    }

    /* ============================================================
       כלי 2 — פריסה וקיפול
       ============================================================ */
    function buildNetTool() {
      var stage = el('div', { class: 'diagram-stage' });
      var caption = el('p', { class: 'view-hint', 'aria-live': 'polite' });

      function draw() {
        UI.clear(stage);
        stage.appendChild(NV.foldSvg({ n: state.n, t: state.foldT, size: 280 }));
        var pct = Math.round(state.foldT * 100);
        caption.textContent = pct === 0 ? 'הפריסה פתוחה לגמרי.'
          : (pct === 100 ? 'הפירמידה סגורה.' : 'מקופל ב-' + pct + ' אחוזים.');
      }

      draw();

      return el('div', { class: 'stack' }, [
        el('div', { class: 'explore-controls' }, [
          el('div', { class: 'control-group' }, [
            el('label', { class: 'control-group__label', text: 'מספר צלעות הבסיס' }),
            el('input', {
              type: 'range', min: '3', max: '8', step: '1', value: String(state.n),
              'aria-label': 'מספר צלעות הבסיס',
              oninput: function () { state.n = parseInt(this.value, 10); draw(); }
            })
          ]),
          el('div', { class: 'control-group' }, [
            el('label', { class: 'control-group__label', text: 'מידת הקיפול' }),
            el('input', {
              type: 'range', min: '0', max: '100', step: '1',
              value: String(Math.round(state.foldT * 100)),
              'aria-label': 'מידת הקיפול באחוזים',
              oninput: function () { state.foldT = parseInt(this.value, 10) / 100; draw(); }
            })
          ])
        ]),
        stage, caption,
        el('div', { class: 'panel' }, [
          el('p', { text: 'בפריסה של פירמידה יש מצולע אחד, הבסיס, ומכל צלע שלו יוצא משולש. מספר המשולשים שווה תמיד למספר צלעות הבסיס.' })
        ])
      ]);
    }

    /* ------------------------------------------------------------
       נוסחה שנקראת משמאל לימין בתוך דף בעברית
       ------------------------------------------------------------
       dir לבדו אינו מספיק: שתי מילים עבריות סמוכות מצטרפות לרצף אחד
       שנקרא מימין לשמאל, והאיברים מתחלפים ביניהם.

       לכן כל אסימון בנוסחה הוא אלמנט נפרד, והשורה כולה היא inline-flex
       בכיוון שמאל־לימין. סדר האיברים נקבע אז על ידי סדר ה-DOM בלבד,
       בלי תלות באלגוריתם הדו־כיווני. מה שכתוב ראשון מופיע שמאלי ביותר,
       וזה גם הסדר שקורא מסך מקריא.
       ------------------------------------------------------------ */
    function ltrFormula(left, right, divisor, result, operator) {
      function tok(t, cls) { return el('span', { class: cls || 'formula-tok', text: t }); }
      function term(t) { return el('bdi', { class: 'formula-term', text: t }); }

      var parts = [];
      /* נוסחה שלמה פותחת בגודל שאותו מחשבים, ואחריו סימן שוויון */
      if (result) { parts.push(term(result), tok('=', 'formula-op')); }
      parts.push(
        tok('('),
        term(left),
        /* סימן הכפל הוא ×, אלא אם הקורא ביקש סימן אחר */
        tok(operator || '×', 'formula-op'),
        term(right),
        tok(')'),
        tok(':', 'formula-op'),
        tok(divisor)
      );
      return el('span', {
        class: 'formula-ltr' + (result ? ' formula-ltr--wrap' : ''),
        dir: 'ltr'
      }, parts);
    }

    /* ============================================================
       כלי 3 — כרטיס הנוסחה
       ============================================================ */
    function buildFormulaTool() {
      return el('div', { class: 'stack' }, [
        el('div', { class: 'panel formula-card' }, [
          el('h2', { text: 'נפח פירמידה' }),
          el('p', { class: 'formula-line' }, [ltrFormula('שטח הבסיס', 'גובה', '3')]),
          el('p', { text: 'מכפילים את שטח הבסיס בגובה האנכי, ומחלקים את התוצאה בשלוש.' })
        ]),
        el('div', { class: 'panel' }, [
          el('h3', { text: 'למה מחלקים בשלוש?' }),
          el('p', { text: 'פירמידה תופסת שליש מנפח המנסרה שיש לה אותו בסיס ואותו גובה. שלוש פירמידות ממלאות מנסרה אחת בדיוק.' }),
          el('p', { class: 'formula-secondary',
            text: 'אפשר לחשוב על זה גם כך: נפח הפירמידה הוא שליש מנפח המנסרה.' })
        ]),
        el('div', { class: 'panel' }, [
          el('h3', { text: 'שטחי בסיס נפוצים' }),
          el('ul', {}, [
            el('li', { text: 'ריבוע: צלע × צלע' }),
            el('li', { text: 'מלבן: אורך × רוחב' }),
            /* שלוש שורות נפרדות: הכותרת בעברית, הנוסחה לבדה,
               ואותה נוסחה במילים.

               כיוון ויישור הם שני דברים נפרדים. השורות עצמן
               נשארות בכיוון הדף, מימין לשמאל, ולכן שלושתן נצמדות
               לאותו קצה ימני. רק הנוסחה עצמה נשאת dir משלה, והיא
               קופסה שבתוך השורה ולא השורה כולה, ולכן היא נשארת
               מתחת לכותרת ולא נדחפת לקצה השמאלי של הכרטיס. */
            el('li', { class: 'formula-entry' }, [
              el('p', { class: 'formula-entry__label', text: 'משולש:' }),
              /* סדר האסימונים משמאל לימין לפי דף המורה:
                 ( גובה לצלע x צלע ) : 2
                 הכפל הוא חילופי, ולכן הסדר הזה שקול לקודמו.
                 סימן הכפל כאן הוא x לטינית קטנה, כפי שכתוב שם. */
              el('p', { class: 'formula-entry__formula' }, [
                ltrFormula('גובה לצלע', 'צלע', '2', null, 'x')
              ]),
              el('p', {
                class: 'formula-entry__words',
                text: 'כופלים את האורך של צלע המשולש באורך הגובה לאותה צלע ומחלקים את התוצאה ב־2.'
              })
            ])
          ])
        ]),
        el('div', { class: 'notice' }, [
          el('span', { class: 'notice__icon', 'aria-hidden': 'true', text: '📏' }),
          el('p', { text: 'הגובה בנוסחה הוא תמיד הגובה האנכי, הקטע שיוצר זווית ישרה עם הבסיס. לא הצלע הצדדית ולא גובה הפאה.' })
        ])
      ]);
    }

    /* ============================================================
       כלי 4 — מילון מונחים
       ============================================================ */
    function buildGlossaryTool() {
      var terms = [
        ['בסיס', 'המצולע שהפירמידה עומדת עליו. הוא קובע את שם הפירמידה.'],
        ['פאה צדדית', 'משולש שעולה מצלע של הבסיס אל קודקוד הראש.'],
        ['מעטפת', 'כל הפאות הצדדיות יחד, בלי הבסיס.'],
        ['צלע בסיס', 'צלע של המצולע שבתחתית.'],
        ['צלע צדדית', 'צלע שמחברת קודקוד של הבסיס אל קודקוד הראש.'],
        ['קודקוד הראש', 'הנקודה שבה נפגשות כל הפאות הצדדיות.'],
        ['גובה הפירמידה', 'המרחק האנכי מקודקוד הראש אל מישור הבסיס. משמש בחישוב הנפח.'],
        ['פריסה', 'הצורה השטוחה שמתקבלת כשפותחים את הפירמידה על המישור.']
      ];
      return el('div', { class: 'panel' }, [
        el('h2', { text: 'מילון מונחים' }),
        el('dl', { class: 'glossary' }, terms.reduce(function (acc, t) {
          acc.push(el('dt', { text: t[0] }));
          acc.push(el('dd', { text: t[1] }));
          return acc;
        }, []))
      ]);
    }

    /* ============================================================
       לשוניות
       ============================================================ */
    var TABS = [
      { id: 'model', label: 'מודל תלת־ממדי', build: buildModelTool },
      { id: 'net', label: 'פריסה וקיפול', build: buildNetTool },
      { id: 'formula', label: 'כרטיס הנוסחה', build: buildFormulaTool },
      { id: 'glossary', label: 'מילון', build: buildGlossaryTool }
    ];

    function refreshTab() {
      if (state.three) { state.three.stop(); state.three = null; }
      UI.clear(content);
      var t = TABS.filter(function (x) { return x.id === state.tab; })[0] || TABS[0];
      content.appendChild(t.build());
      var buttons = mount.querySelectorAll('.tab-btn');
      [].forEach.call(buttons, function (b) {
        var on = b.getAttribute('data-tab') === state.tab;
        b.classList.toggle('tab-btn--active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    }

    var tabBar = el('div', { class: 'tab-bar', role: 'tablist', 'aria-label': 'כלים' },
      TABS.map(function (t) {
        return el('button', {
          type: 'button', class: 'tab-btn', role: 'tab', 'data-tab': t.id,
          'aria-selected': state.tab === t.id ? 'true' : 'false',
          onclick: function () { state.tab = t.id; refreshTab(); }
        }, [document.createTextNode(t.label)]);
      }));

    UI.clear(mount);
    mount.appendChild(el('div', { class: 'page' }, [
      el('div', { class: 'btn-row', style: 'margin-block-end:var(--sp-4)' }, [
        el('a', { class: 'btn btn--ghost', href: '#/' }, [
          el('span', { 'aria-hidden': 'true', text: '→' }),
          document.createTextNode(' ' + S.actions.backHome)
        ])
      ]),
      el('h1', { text: S.nav.toolbox }),
      el('p', { class: 'card__desc',
        text: 'כלי עזר שאפשר לפתוח בכל רגע, גם באמצע פעילות.' }),
      tabBar,
      content
    ]));

    refreshTab();

    // הטעינה של Three.js מתרחשת ברקע; אם היא מצליחה, המודל משודרג
    if (webglAvailable()) {
      ensureThree().then(function (ok) {
        if (ok && state.tab === 'model') refreshTab();
      });
    } else {
      threeState = 'failed';
    }

    App.setTitle(S.nav.toolbox);
    App.setNavCurrent('toolbox');
  };

})(window);
