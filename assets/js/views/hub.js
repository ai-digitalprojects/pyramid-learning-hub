/* ============================================================
   views/hub.js — דף הבית
   ------------------------------------------------------------
   האיורים שבדף הזה הם קובצי תמונה ב-assets/img. הם שכבה ויזואלית
   בלבד: אין בהם טקסט, וכל כותרת, תיאור, מספר התקדמות וכפתור נשארים
   טקסט HTML אמיתי מעליהם.

   איור שנושא מידע מקבל טקסט חלופי בעברית. איור שהוא קישוט בלבד מקבל
   alt ריק, כדי שקורא מסך לא יקריא אותו פעמיים.

   כל היחידות וכל התחנות פתוחות תמיד. אין כאן נעילה ואין סדר מחייב.
   ============================================================ */
(function (global) {
  'use strict';

  var App = global.App = global.App || {};
  App.views = App.views || {};

  var IMG = 'assets/img/';

  App.views.hub = function (mount) {
    var UI = App.UI, Store = App.Store, D = global.PyramidData;
    var S = D.strings, el = UI.el;

    var units = [D.unit1, D.unit2];

    /** תמונה עם טקסט חלופי מפורש. alt ריק = קישוט בלבד. */
    function img(file, alt, cls, opts) {
      opts = opts || {};
      return el('img', {
        class: cls,
        src: IMG + file,
        alt: alt || '',
        width: opts.w || null,
        height: opts.h || null,
        loading: opts.eager ? null : 'lazy',
        decoding: 'async',
        draggable: 'false'
      });
    }

    /* ------------------------------------------------------------
       הכותרת הגדולה
       ------------------------------------------------------------
       שלוש שכבות: נוף המדבר, דמות החוקר, והטקסט מעליהם. הנוף נחתך
       לפי הצורך ואינו נמתח, והטקסט יושב במרכז שנשאר פנוי באיור.
       ------------------------------------------------------------ */
    var hero = el('section', { class: 'hero' }, [
      el('div', { class: 'hero__scene' }, [
        img('hero-desert.webp', '', 'hero__bg', { w: 1916, h: 821, eager: true })
      ]),
      img('hero-explorer.webp',
        'ילד חוקר כורע על ברך, עם כובע ותרמיל, ובוחן אבן מגולפת דרך זכוכית מגדלת.',
        'hero__explorer', { w: 900, h: 1200, eager: true }),
      el('div', { class: 'hero__body' }, [
        el('h1', { class: 'hero__title', text: S.site.title }),
        el('p', { class: 'hero__sub', text: S.site.heroLead }),
        el('p', { class: 'hero__meta', text: S.site.meta })
      ]),
      /* פתק פפירוס עם משפט העידוד */
      el('p', { class: 'hero__note', text: S.site.heroNote }),
      /* סמל בית הספר, בפינה הנגדית לפתק */
      img('school-logo.webp',
        'סמל בית ספר גבים באר שבע, חינוך למצוינות לספורט ולמדעי הבריאות.',
        'hero__logo', { w: 380, h: 440, eager: true })
    ]);

    /* ---------- כרטיסי היחידות ---------- */
    function dots(done, total) {
      var wrap = el('div', {
        class: 'dots',
        role: 'img',
        'aria-label': done + ' מתוך ' + total + ' ' + S.hub.stationsDone
      });
      for (var i = 0; i < total; i++) {
        wrap.appendChild(el('span', {
          class: 'dots__dot' + (i < done ? ' dots__dot--on' : ''),
          'aria-hidden': 'true'
        }));
      }
      return wrap;
    }

    var UNIT_ART = {
      1: { file: 'card-unit1.webp',
           alt: 'ילד חוקר בוחן דרך זכוכית מגדלת דגם של פירמידה, ומאחוריו פירמידות במדבר.' },
      2: { file: 'card-unit2.webp',
           alt: 'שני ילדים בוחנים קוביות שקופות זוהרות ופירמידה זוהרת, ומאחוריהם פירמידות בשעת דמדומים.' }
    };

    var unitCards = units.map(function (u) {
      var total = u.activities.length;
      var done = Store.countDone(u.activities);
      var complete = done === total;
      var art = UNIT_ART[u.id];

      var label = complete ? S.actions.review
                : done > 0 ? S.actions.continue + ' ' + u.short
                : S.actions.start + ' ' + u.short;

      var cta = el('span', {
        class: 'btn btn--unit-' + u.id + ' btn--lg btn--block' + (complete ? ' btn--done' : ''),
        'aria-hidden': 'true',
        text: complete ? S.actions.completed : label
      });

      return el('a', {
        class: 'unit-card unit-card--' + u.id,
        href: '#/unit/' + u.id,
        'aria-label': u.short + ': ' + u.title + '. ' +
          done + ' מתוך ' + total + ' ' + S.hub.stationsDone + '.'
      }, [
        el('span', { class: 'unit-card__art' }, [
          img(art.file, art.alt, 'unit-card__img', { w: 1280, h: 800 }),
          el('span', { class: 'unit-card__badge', 'aria-hidden': 'true' }, [
            el('span', { class: 'unit-card__badge-word', text: 'יחידה' }),
            el('span', { class: 'unit-card__badge-num' }, [UI.num(u.id)])
          ])
        ]),
        el('div', { class: 'unit-card__body' }, [
          el('h3', { class: 'unit-card__title', text: u.title }),
          el('p', { class: 'unit-card__count' }, [
            UI.num(total), document.createTextNode(' ' + S.hub.stations)
          ]),
          el('p', { class: 'unit-card__desc', text: u.lead }),
          /* כל מספר מבודד בנפרד. מספר אחד שעוטף גם את המילה "מתוך"
             היה נקרא הפוך בתוך פסקה בעברית. */
          el('p', { class: 'unit-card__done' }, [
            UI.num(done),
            document.createTextNode(' מתוך '),
            UI.num(total),
            document.createTextNode(' ' + S.hub.stationsDone)
          ]),
          dots(done, total),
          cta
        ])
      ]);
    });

    /* ---------- שלוש הכניסות הנוספות ---------- */
    function extra(href, file, alt, title, desc, variant) {
      return el('a', { class: 'mini-card', href: href }, [
        el('span', { class: 'mini-card__art' }, [
          img(file, alt, 'mini-card__img', { w: 600, h: 600 })
        ]),
        el('h3', { class: 'mini-card__title', text: title }),
        el('p', { class: 'mini-card__desc', text: desc }),
        el('span', {
          class: 'btn btn--ghost mini-card__btn' + (variant ? ' mini-card__btn--' + variant : ''),
          'aria-hidden': 'true', text: S.actions.open
        })
      ]);
    }

    var extras = [
      extra('#/toolbox', 'card-toolbox.webp',
        'ארגז כלים פתוח ובו סרגל, מד זווית, מחוגה, עפרונות ומגילה.',
        S.nav.toolbox,
        'דפי עזר, מודל תלת־ממדי, פריסות וכרטיס הנוסחה. פתוח תמיד, גם באמצע תחנה.', 'unit-1'),
      extra('#/progress', 'card-progress.webp',
        'שלוש מדרגות אבן עולות, ועל הגבוהה שבהן כוכב זהב.',
        S.nav.progress,
        'עקבו אחרי ההישגים שלכם ותראו כמה כבר התקדמתם במסע.', 'gold'),
      extra('#/final', 'card-exam.webp',
        'גביע זהב מעוטר בפירמידות, ניצב על בסיס אבן.',
        D.finalExam.title, D.finalExam.desc, 'unit-2')
    ];

    UI.clear(mount);
    mount.appendChild(el('div', { class: 'page page--hub' }, [
      hero,
      el('div', { class: 'section-head section-head--ornate' }, [
        el('h2', { text: S.hub.unitsHeading }),
        el('span', { class: 'section-head__note', text: S.hub.unitsNote })
      ]),
      el('div', { class: 'unit-grid' }, unitCards),
      el('div', { class: 'section-head' }, [el('h2', { text: S.hub.extrasHeading })]),
      el('div', { class: 'mini-grid' }, extras),
      /* פס הסיום: רקע פפירוס מצויר, והמשפט עצמו טקסט אמיתי מעליו */
      el('div', { class: 'sand-band' }, [
        el('p', { class: 'sand-band__text', text: S.hub.quote })
      ])
    ]));

    /* ------------------------------------------------------------
       הכפתור המרכזי של דף הבית: היחידה שבה התלמיד באמצע. אם שתיהן
       הושלמו, או ששתיהן טרם התחילו, הסימון עובר ליחידה הראשונה
       שעדיין לא הושלמה. כפתור אחד בלבד, לעולם לא יותר.
       ------------------------------------------------------------ */
    var pick = null;
    for (var i = 0; i < units.length; i++) {
      var doneN = Store.countDone(units[i].activities);
      if (doneN > 0 && doneN < units[i].activities.length) { pick = i; break; }
    }
    if (pick === null) {
      for (var j = 0; j < units.length; j++) {
        if (Store.countDone(units[j].activities) < units[j].activities.length) { pick = j; break; }
      }
    }
    if (pick !== null) {
      App.cta(unitCards[pick].querySelector('.btn'));
    } else {
      App.cta(mount.querySelector('.mini-card:last-child .btn'));
    }

    App.setTitle(S.site.title);
    App.setNavCurrent('home');
  };

})(window);
