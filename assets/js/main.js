/* ============================================================
   main.js — הרכבת האתר
   ============================================================ */
(function (global) {
  'use strict';

  var App = global.App = global.App || {};
  var doc = global.document;

  /* ---------- כותרת הדף ---------- */
  App.setTitle = function (pageTitle) {
    var site = global.PyramidData.strings.site.title;
    doc.title = pageTitle && pageTitle !== site ? (pageTitle + ' · ' + site) : site;
  };

  /* ---------- סימון פריט הניווט הפעיל ---------- */
  App.setNavCurrent = function (key) {
    var links = doc.querySelectorAll('.site-nav .nav-btn');
    for (var i = 0; i < links.length; i++) {
      if (key && links[i].getAttribute('data-nav') === key) {
        links[i].setAttribute('aria-current', 'page');
      } else {
        links[i].removeAttribute('aria-current');
      }
    }
  };

  /* ---------- בניית הכותרת העליונה ---------- */
  function buildHeader() {
    var UI = App.UI, el = UI.el;
    var S = global.PyramidData.strings;

    var brand = el('a', { class: 'brand', href: '#/' }, [
      App.icons.brand('brand__mark'),
      el('span', { class: 'brand__text' }, [
        el('span', { class: 'brand__title', text: S.site.title }),
        el('span', { class: 'brand__sub', text: S.site.meta })
      ])
    ]);

    var nav = el('nav', { class: 'site-nav', 'aria-label': 'ניווט ראשי' }, [
      el('a', { class: 'nav-btn', href: '#/', 'data-nav': 'home' }, [
        el('span', { 'aria-hidden': 'true', text: '🏠' }), document.createTextNode(' ' + S.nav.home)
      ]),
      el('a', { class: 'nav-btn', href: '#/toolbox', 'data-nav': 'toolbox' }, [
        el('span', { 'aria-hidden': 'true', text: '🧰' }), document.createTextNode(' ' + S.nav.toolbox)
      ]),
      el('a', { class: 'nav-btn', href: '#/progress', 'data-nav': 'progress' }, [
        el('span', { 'aria-hidden': 'true', text: '⭐' }), document.createTextNode(' ' + S.nav.progress)
      ])
    ]);

    doc.getElementById('site-header').appendChild(
      el('div', { class: 'site-header__inner' }, [brand, nav])
    );
  }

  /* ---------- בניית הכותרת התחתונה ---------- */
  function buildFooter() {
    var el = App.UI.el;
    var S = global.PyramidData.strings;
    doc.getElementById('site-footer').appendChild(
      el('div', {}, [
        el('p', { text: S.footer.line1 }),
        el('p', { text: S.footer.line2 })
      ])
    );
  }

  /* ---------- מסלולים ---------- */
  function buildRoutes(mount) {
    var R = App.Router;

    function render(fn) {
      return function (params) {
        fn(mount, params || {});
        App.UI.scrollTop();
        // הכרזה לקוראי מסך על מעבר מסך
        var h1 = mount.querySelector('h1');
        if (h1) App.UI.announce(h1.textContent);
      };
    }

    R.add('/',                render(App.views.hub));
    R.add('/unit/:id',        render(App.views.unit));
    R.add('/activity/:id',    render(App.views.activity));
    R.add('/toolbox',         render(App.views.toolbox));
    R.add('/progress',        render(App.views.progress));
    R.add('/final',           render(App.views.final));
    R.notFound(render(App.views.notFound));
  }

  /* ---------- אתחול ---------- */
  function boot() {
    if (!global.PyramidData || !global.PyramidData.strings) {
      doc.getElementById('app').innerHTML =
        '<div class="page"><div class="notice notice--warn">' +
        '<p>שגיאה בטעינת קובצי התוכן. ודאו שכל הקבצים בתיקייה נמצאים במקומם.</p></div></div>';
      return;
    }

    App.Store.init();
    buildHeader();
    buildFooter();

    var mount = doc.getElementById('app');
    buildRoutes(mount);
    App.Router.start();

    // הודעה חד־פעמית אם האחסון חסום
    if (App.Store.isMemoryOnly()) {
      global.setTimeout(function () {
        App.UI.toast(global.PyramidData.strings.progress.storageOff);
      }, 900);
    }
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})(window);
