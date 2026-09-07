/* ============================================================
   router.js — ניתוב לפי hash
   ------------------------------------------------------------
   כתובות:
     #/                 דף הבית
     #/unit/1           יחידה
     #/activity/1.4     פעילות
     #/toolbox          ארגז הכלים
     #/progress         ההתקדמות שלי
     #/final            מבחן סיום
   שימוש ב-hash מאפשר פרסום ב-GitHub Pages בלי הגדרות שרת,
   ושומר על תקינות כפתור "אחורה" בדפדפן.
   ============================================================ */
(function (global) {
  'use strict';

  var routes = [];
  var notFoundHandler = null;
  var current = null;

  function add(pattern, handler) {
    // '/unit/:id' → רגקס עם קבוצות בשם
    var names = [];
    var regexSrc = '^' + pattern.replace(/:[A-Za-z_]+/g, function (m) {
      names.push(m.slice(1));
      return '([^/]+)';
    }) + '$';
    routes.push({ re: new RegExp(regexSrc), names: names, handler: handler, pattern: pattern });
  }

  function parseHash() {
    var h = global.location.hash || '#/';
    var path = h.replace(/^#/, '');
    if (path === '' || path === '/') return '/';
    return path.replace(/\/+$/, '') || '/';
  }

  function resolve() {
    var path = parseHash();
    current = path;

    for (var i = 0; i < routes.length; i++) {
      var m = path.match(routes[i].re);
      if (m) {
        var params = {};
        for (var j = 0; j < routes[i].names.length; j++) {
          params[routes[i].names[j]] = decodeURIComponent(m[j + 1]);
        }
        routes[i].handler(params, path);
        return;
      }
    }
    if (notFoundHandler) notFoundHandler(path);
  }

  var Router = {
    add: add,
    notFound: function (fn) { notFoundHandler = fn; },
    start: function () {
      global.addEventListener('hashchange', resolve);
      if (!global.location.hash) {
        // ללא ניווט בהיסטוריה — כדי ש"אחורה" לא ייתקע בדף ריק
        global.location.replace(global.location.pathname + global.location.search + '#/');
      }
      resolve();
    },
    go: function (path) {
      if (parseHash() === path) { resolve(); return; }
      global.location.hash = path;
    },
    current: function () { return current; }
  };

  global.App = global.App || {};
  global.App.Router = Router;

})(window);
