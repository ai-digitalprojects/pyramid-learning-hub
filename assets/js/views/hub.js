/* ============================================================
   views/hub.js — דף הבית
   ------------------------------------------------------------
   הכותרת הגדולה היא נוף מדבר מצויר (scene.js), ומעליו טקסט אמיתי.
   מתחתיו שתי יחידות המסע, ואז שלוש הכניסות הנוספות.

   כל היחידות וכל התחנות פתוחות תמיד. אין כאן נעילה ואין סדר מחייב,
   ולכן אין גם שום כפתור חסום.
   ============================================================ */
(function (global) {
  'use strict';

  var App = global.App = global.App || {};
  App.views = App.views || {};

  App.views.hub = function (mount) {
    var UI = App.UI, Store = App.Store, D = global.PyramidData;
    var S = D.strings, el = UI.el;

    var units = [D.unit1, D.unit2];

    /* ---------- הכותרת הגדולה ---------- */
    var hero = el('section', { class: 'hero' }, [
      App.Scene.desert(),
      el('div', { class: 'hero__body' }, [
        el('h1', { class: 'hero__title', text: S.site.title }),
        el('p', { class: 'hero__sub', text: S.site.heroLead }),
        el('p', { class: 'hero__meta', text: S.site.meta })
      ]),
      /* פתק פפירוס עם משפט העידוד */
      el('p', { class: 'hero__note', text: S.site.heroNote })
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

    var unitCards = units.map(function (u) {
      var total = u.activities.length;
      var done = Store.countDone(u.activities);
      var complete = done === total;

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
        el('span', { class: 'unit-card__badge', 'aria-hidden': 'true' }, [
          el('span', { class: 'unit-card__badge-word', text: 'יחידה' }),
          el('span', { class: 'unit-card__badge-num' }, [UI.num(u.id)])
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
    function extra(href, glyph, title, desc, variant) {
      return el('a', { class: 'mini-card', href: href }, [
        el('div', { class: 'mini-card__glyph', 'aria-hidden': 'true', text: glyph }),
        el('h3', { class: 'mini-card__title', text: title }),
        el('p', { class: 'mini-card__desc', text: desc }),
        el('span', {
          class: 'btn btn--ghost mini-card__btn' + (variant ? ' mini-card__btn--' + variant : ''),
          'aria-hidden': 'true', text: S.actions.open
        })
      ]);
    }

    var extras = [
      extra('#/toolbox', '🧰', S.nav.toolbox,
        'דפי עזר, מודל תלת־ממדי, פריסות וכרטיס הנוסחה. פתוח תמיד, גם באמצע תחנה.', 'unit-1'),
      extra('#/progress', '⭐', S.nav.progress,
        'עקבו אחרי ההישגים שלכם ותראו כמה כבר התקדמתם במסע.', 'gold'),
      extra('#/final', D.finalExam.icon, D.finalExam.title,
        D.finalExam.desc, 'unit-2')
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
      el('p', { class: 'sand-band', text: S.hub.quote })
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
