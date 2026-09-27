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

  /* ------------------------------------------------------------
     הכפתור המרכזי של המסך
     ------------------------------------------------------------
     בכל מסך יש בדיוק כפתור זוהר אחד, זה שאומר "זה הצעד הבא שלי".
     אם כמה כפתורים יזהרו, הסימן יאבד את משמעותו, ולכן הסימון נשלט
     מכאן ולא מתוך כל מסך בנפרד: כל קריאה מכבה את הקודם.
     ------------------------------------------------------------ */
  App.cta = function (node) {
    var prev = doc.querySelectorAll('.btn--cta');
    for (var i = 0; i < prev.length; i++) prev[i].classList.remove('btn--cta');
    if (node && node.classList) node.classList.add('btn--cta');
    return node;
  };

  /** מכבה את הזוהר בלי לסמן כפתור אחר */
  App.clearCta = function () { App.cta(null); };

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
    var D = global.PyramidData, S = D.strings;

    /* ------------------------------------------------------------
       סדר הפריטים בכותרת
       ------------------------------------------------------------
       הסדר נקבע: שלום תלמיד/ה, ההתקדמות שלי, ארגז הכלים, מבחן סיום,
       דף הבית. במסך רחב זה הסדר משמאל לימין, ובמסך צר מלמעלה למטה.

       כדי שהסדר לא יתהפך בגלל שהדף כולו בכיוון ימין־לשמאל, שורת
       הכותרת מסודרת בכיוון שמאל־לימין (ראו .site-header__inner
       ב-home.css), וכל פריט בתוכה מחזיר לעצמו כיוון עברי. כך סדר
       ה-DOM, הסדר על המסך וסדר מקש Tab זהים לחלוטין.
       ------------------------------------------------------------ */

    /* ברכה בלבד. אין כאן שם, אין הרשמה ואין שמירה של שום פרט אישי.
       זו אינה קישור ואינה כפתור, ולכן היא גם לא נראית כזאת. */
    var hello = el('p', { class: 'site-hello' }, [
      el('span', { class: 'site-hello__text', text: S.site.greeting })
    ]);

    /* הסמל מצויר ב-SVG ויורש את צבע הקישור, ולכן הוא משתנה יחד איתו
       במעבר עכבר, בעמוד הפעיל ובמיקוד מקלדת. */
    function pill(href, key, icon, label) {
      return el('a', { class: 'nav-btn', href: href, 'data-nav': key }, [
        App.icons[icon]('nav-btn__icon'),
        el('span', { class: 'nav-btn__label', text: label })
      ]);
    }

    var nav = el('nav', { class: 'site-nav', 'aria-label': 'ניווט ראשי' }, [
      pill('#/progress', 'progress', 'navProgress', S.nav.progress),
      pill('#/toolbox', 'toolbox', 'navToolbox', S.nav.toolbox),
      pill('#/final', 'final', 'navExam', D.finalExam.title),
      pill('#/', 'home', 'navHome', S.nav.home)
    ]);

    var brand = el('a', { class: 'brand', href: '#/' }, [
      App.icons.brand('brand__mark'),
      el('span', { class: 'brand__text' }, [
        el('span', { class: 'brand__title', text: S.site.title }),
        el('span', { class: 'brand__sub', text: S.site.tagline })
      ])
    ]);

    doc.getElementById('site-header').appendChild(
      el('div', { class: 'site-header__inner' }, [hello, nav, brand])
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

  /* ------------------------------------------------------------
     שבב המצב בראש עמוד הפעילות
     ------------------------------------------------------------
     מאזין אחד לכל האתר, שנרשם פעם אחת באתחול. רישום מאזין בכל
     כניסה לעמוד פעילות היה מצטבר בלי סוף.
     ------------------------------------------------------------ */
  function watchActivityState() {
    App.Store.onChange(function (reason) {
      if (String(reason).indexOf('activity:') !== 0) return;
      var id = String(reason).slice('activity:'.length);
      var slot = doc.querySelector('.unit-banner__state[data-state-for="' + id + '"]');
      if (!slot) return;
      App.UI.clear(slot);
      slot.appendChild(App.UI.stateChip(App.Store.getActivity(id).state));
    });
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
        if (h1) App.UI.announce(App.UI.readable(h1));
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
    watchActivityState();

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
