/* ============================================================
   celebrate.js — מסך הסיום של יחידה
   ------------------------------------------------------------
   כשהתלמיד משלים את כל תחנות היחידה, נפתח מסך שבו פירמידה נבנית
   נדבך אחרי נדבך מלמטה למעלה, הפסגה נדלקת בזהב, וקונפטי קצר יורד.

   המסך מופיע פעם אחת בלבד לכל יחידה. הסימון נשמר ב-Store, ולכן
   רענון הדף או כניסה חוזרת אינם מפעילים אותו שוב.

   מי שביקש פחות תנועה מקבל את אותו מסך בדיוק, בלי אנימציה ובלי
   קונפטי: הפירמידה כבר בנויה והפסגה כבר זוהרת.
   ============================================================ */
(function (global) {
  'use strict';

  var App = global.App = global.App || {};
  var NS = 'http://www.w3.org/2000/svg';
  var doc = global.document;

  function reducedMotion() {
    try {
      return global.matchMedia &&
             global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) { return false; }
  }

  function e(tag, attrs) {
    var n = doc.createElementNS(NS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }

  /* ------------------------------------------------------------
     הפירמידה הנבנית
     ------------------------------------------------------------
     שבעה נדבכים. כל נדבך הוא טרפז ברוחב יורד, והם מופיעים מלמטה
     למעלה בזה אחר זה. הפסגה היא הנדבך האחרון, והיא זו שמקבלת את
     הזוהר.
     ------------------------------------------------------------ */
  function buildingPyramid(still) {
    var LAYERS = 7;
    var W = 300, H = 210, baseY = 190, apexY = 26;
    var halfBase = 126;

    var svg = e('svg', {
      viewBox: '0 0 ' + W + ' ' + H,
      class: 'celebrate__pyramid',
      'aria-hidden': 'true',
      focusable: 'false'
    });

    var glow = e('radialGradient', { id: 'cel-glow' });
    glow.appendChild(e('stop', { offset: '0%', 'stop-color': '#FFE9A8', 'stop-opacity': '.95' }));
    glow.appendChild(e('stop', { offset: '100%', 'stop-color': '#FFE9A8', 'stop-opacity': '0' }));
    var defs = e('defs', {});
    defs.appendChild(glow);
    svg.appendChild(defs);

    /* צל קצר על הקרקע */
    svg.appendChild(e('ellipse', {
      cx: W / 2, cy: baseY + 8, rx: halfBase + 10, ry: 9,
      fill: 'var(--stone-shade)', opacity: '.3'
    }));

    var step = (baseY - apexY) / LAYERS;
    for (var i = 0; i < LAYERS; i++) {
      var yBottom = baseY - step * i;
      var yTop = baseY - step * (i + 1);
      var wBottom = halfBase * (1 - i / LAYERS);
      var wTop = halfBase * (1 - (i + 1) / LAYERS);
      var cx = W / 2;

      var layer = e('path', {
        d: 'M' + (cx - wBottom) + ' ' + yBottom +
           ' L' + (cx + wBottom) + ' ' + yBottom +
           ' L' + (cx + wTop) + ' ' + yTop +
           ' L' + (cx - wTop) + ' ' + yTop + ' Z',
        fill: i % 2 ? 'var(--stone)' : 'var(--stone-shade)',
        stroke: 'var(--dune-deep)', 'stroke-width': '1',
        class: 'celebrate__layer'
      });
      if (!still) {
        /* כל נדבך נכנס אחרי זה שמתחתיו */
        layer.style.animationDelay = (0.18 * i).toFixed(2) + 's';
      } else {
        layer.style.opacity = '1';
        layer.style.transform = 'none';
      }
      svg.appendChild(layer);
    }

    /* הילת הפסגה */
    var halo = e('circle', {
      cx: W / 2, cy: apexY + 4, r: 40,
      fill: 'url(#cel-glow)', class: 'celebrate__halo'
    });
    if (!still) halo.style.animationDelay = (0.18 * LAYERS + 0.1).toFixed(2) + 's';
    else halo.style.opacity = '1';
    svg.appendChild(halo);

    var cap = e('circle', {
      cx: W / 2, cy: apexY + 4, r: 7,
      fill: 'var(--gold)', stroke: 'var(--gold-deep)', 'stroke-width': '2',
      class: 'celebrate__cap'
    });
    if (!still) cap.style.animationDelay = (0.18 * LAYERS).toFixed(2) + 's';
    else cap.style.opacity = '1';
    svg.appendChild(cap);

    return svg;
  }

  /** קונפטי קצר: פיסות קטנות שנושרות פעם אחת ונעלמות */
  function confetti() {
    var wrap = App.UI.el('div', { class: 'confetti', 'aria-hidden': 'true' });
    var colours = ['var(--gold)', 'var(--unit-1)', 'var(--unit-2)', 'var(--success)', 'var(--stone)'];
    for (var i = 0; i < 26; i++) {
      var bit = App.UI.el('i', { class: 'confetti__bit' });
      bit.style.insetInlineStart = (3 + (i * 3.7) % 94).toFixed(1) + '%';
      bit.style.background = colours[i % colours.length];
      bit.style.animationDelay = (i % 9 * 0.09).toFixed(2) + 's';
      bit.style.transform = 'rotate(' + ((i * 47) % 360) + 'deg)';
      wrap.appendChild(bit);
    }
    /* הקונפטי חי כשתי שניות ואז יורד מהמסך לגמרי */
    global.setTimeout(function () {
      if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
    }, 3200);
    return wrap;
  }

  /**
   * מסך הסיום של יחידה.
   * unit  — היחידה שהושלמה
   * next  — { href, label } לאן ממשיכים
   */
  function unitScreen(unit, next) {
    var el = App.UI.el;
    var S = global.PyramidData.strings;
    var still = reducedMotion();

    var panel = el('section', {
      class: 'celebrate' + (still ? ' celebrate--still' : ''),
      role: 'group',
      'aria-label': S.celebrate.title + ' ' + unit.title
    }, [
      still ? null : confetti(),
      buildingPyramid(still),
      el('h2', { class: 'celebrate__title', text: S.celebrate.title }),
      el('p', { class: 'celebrate__unit', text: unit.short + ': ' + unit.title }),
      el('p', { class: 'celebrate__note', text: S.celebrate.note }),
      el('a', {
        class: 'btn btn--gold btn--lg celebrate__btn',
        href: next.href
      }, [doc.createTextNode(next.label)])
    ]);

    App.UI.announce(S.celebrate.title);
    return panel;
  }

  App.Celebrate = {
    unitScreen: unitScreen,
    buildingPyramid: buildingPyramid
  };

})(window);
