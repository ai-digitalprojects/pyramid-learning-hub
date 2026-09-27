/* ============================================================
   icons.js — סמלים מקוריים (SVG inline)
   כל הצורות כאן נוצרו במיוחד לפרויקט הזה.
   ============================================================ */
(function (global) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  function svg(viewBox, cls, extra) {
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', viewBox);
    s.setAttribute('xmlns', NS);
    s.setAttribute('fill', 'none');
    s.setAttribute('aria-hidden', 'true');
    s.setAttribute('focusable', 'false');
    if (cls) s.setAttribute('class', cls);
    if (extra) Object.keys(extra).forEach(function (k) { s.setAttribute(k, extra[k]); });
    return s;
  }

  function path(d, attrs) {
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    if (attrs) Object.keys(attrs).forEach(function (k) { p.setAttribute(k, attrs[k]); });
    return p;
  }

  var Icons = {

    /** סמל המותג — פירמידה מרובעת עם קו גובה */
    brand: function (cls) {
      var s = svg('0 0 40 40', cls);
      // מעטפת
      s.appendChild(path('M20 4 L36 30 L4 30 Z', {
        fill: '#E0A32E', 'fill-opacity': '.9'
      }));
      // פאה קדמית מוצללת
      s.appendChild(path('M20 4 L20 30 L4 30 Z', {
        fill: '#F0BB55', 'fill-opacity': '.85'
      }));
      // צלע אחורית מקווקוות
      s.appendChild(path('M20 4 L28 25 L4 30', {
        stroke: '#FFFFFF', 'stroke-opacity': '.55',
        'stroke-width': '1.4', 'stroke-dasharray': '2.5 2.5', 'stroke-linejoin': 'round'
      }));
      // קו גובה
      s.appendChild(path('M20 4 L20 30', {
        stroke: '#16233A', 'stroke-opacity': '.75',
        'stroke-width': '1.4', 'stroke-dasharray': '3 2'
      }));
      // בסיס
      s.appendChild(path('M4 30 L36 30', {
        stroke: '#16233A', 'stroke-opacity': '.8', 'stroke-width': '2', 'stroke-linecap': 'round'
      }));
      return s;
    },

    /* ------------------------------------------------------------
       סמלי הניווט
       ------------------------------------------------------------
       ארבעה סמלי קו באותו משקל ובאותה מסגרת, כדי שייראו כמשפחה אחת.
       הצבע נלקח מ-currentColor, ולכן הם משתנים יחד עם מצב הקישור:
       רגיל, מעבר עכבר, עמוד פעיל ומיקוד מקלדת.
       ------------------------------------------------------------ */
    navStroke: function (cls, d) {
      var s = svg('0 0 24 24', cls);
      d.forEach(function (spec) {
        s.appendChild(path(spec, {
          stroke: 'currentColor',
          'stroke-width': '1.7',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round'
        }));
      });
      return s;
    },

    /** דף הבית — פירמידה עם פתח כניסה */
    navHome: function (cls) {
      return Icons.navStroke(cls, [
        'M12 3.6 L20.8 19.4 H3.2 Z',
        'M7.6 13.4 H16.4',
        'M10.1 19.4 v-3.1 a1.9 1.9 0 0 1 3.8 0 v3.1'
      ]);
    },

    /** מבחן הסיום — גביע */
    navExam: function (cls) {
      return Icons.navStroke(cls, [
        'M7.8 4.6 h8.4 v4.1 a4.2 4.2 0 0 1 -8.4 0 Z',
        'M7.8 5.8 H6 a2.1 2.1 0 0 0 0 4.2 h1.8',
        'M16.2 5.8 H18 a2.1 2.1 0 0 1 0 4.2 h-1.8',
        'M12 12.9 v3.2',
        'M9.6 16.1 h4.8 v3.3 h-4.8 Z',
        'M8.4 19.4 h7.2'
      ]);
    },

    /** ארגז הכלים — תיבה עם ידית */
    navToolbox: function (cls) {
      return Icons.navStroke(cls, [
        'M3.4 9.2 h17.2 v9.5 a1.1 1.1 0 0 1 -1.1 1.1 H4.5 a1.1 1.1 0 0 1 -1.1 -1.1 Z',
        'M8.9 9.2 V7.1 a1.5 1.5 0 0 1 1.5 -1.5 h3.2 a1.5 1.5 0 0 1 1.5 1.5 v2.1',
        'M3.4 13.6 h17.2',
        'M10.4 13.6 h3.2'
      ]);
    },

    /** ההתקדמות שלי — מדרגות עולות וכוכב בפסגה */
    navProgress: function (cls) {
      var s = Icons.navStroke(cls, [
        'M4 19.6 v-4.2 h3.7 v4.2 Z',
        'M10.15 19.6 v-7 h3.7 v7 Z',
        'M16.3 19.6 v-9.1 h3.7 v9.1 Z'
      ]);
      s.appendChild(path(
        'M18.15 3.1 l1.02 2.07 2.28.33 -1.65 1.61 .39 2.27 -2.04 -1.07 -2.04 1.07 .39 -2.27 -1.65 -1.61 2.28 -.33 Z',
        { fill: 'currentColor', stroke: 'none' }
      ));
      return s;
    },

    /** קישוט קווי גדול לכותרת */
    pyramidOutline: function (cls) {
      var s = svg('0 0 120 100', cls);
      s.appendChild(path('M60 8 L112 88 L8 88 Z', {
        stroke: '#FFFFFF', 'stroke-width': '3', 'stroke-linejoin': 'round'
      }));
      s.appendChild(path('M60 8 L60 88 M60 8 L86 74 L8 88', {
        stroke: '#FFFFFF', 'stroke-width': '2', 'stroke-dasharray': '5 5', 'stroke-linejoin': 'round'
      }));
      s.appendChild(path('M8 88 L86 74', {
        stroke: '#FFFFFF', 'stroke-width': '2', 'stroke-dasharray': '5 5'
      }));
      return s;
    }
  };

  global.App = global.App || {};
  global.App.icons = Icons;

})(window);
