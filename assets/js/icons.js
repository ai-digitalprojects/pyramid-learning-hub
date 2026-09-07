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
