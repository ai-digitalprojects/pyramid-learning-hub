/* ============================================================
   views/hub.js — דף הבית
   ============================================================ */
(function (global) {
  'use strict';

  var App = global.App = global.App || {};
  App.views = App.views || {};

  App.views.hub = function (mount) {
    var UI = App.UI, Store = App.Store, D = global.PyramidData;
    var S = D.strings, el = UI.el;

    var units = [D.unit1, D.unit2];

    var hero = el('section', { class: 'hero' }, [
      el('p', { class: 'hero__eyebrow', text: S.site.eyebrow }),
      el('h1', { text: S.site.title }),
      el('p', { class: 'hero__sub', text: S.site.subtitle }),
      el('p', { class: 'hero__meta', text: S.site.meta }),
      App.icons.pyramidOutline('hero__deco')
    ]);

    /* ---------- כרטיסי היחידות ---------- */
    var unitCards = units.map(function (u) {
      var pct = Store.unitPercent(u.activities);
      var done = Store.countDone(u.activities);
      var started = done > 0;

      var card = el('a', {
        class: 'card card--unit-' + u.id,
        href: '#/unit/' + u.id
      }, [
        el('div', { class: 'card__icon', 'aria-hidden': 'true', text: u.icon }),
        el('h3', { class: 'card__title', text: u.short + ': ' + u.title }),
        el('p',  { class: 'card__desc', text: u.lead }),
        UI.progressBar(pct, 'unit-' + u.id,
          done + ' מתוך ' + u.activities.length + ' פעילויות'),
        el('span', {
          class: 'btn btn--unit-' + u.id + ' btn--block',
          'aria-hidden': 'true',
          text: started ? S.actions.continue : S.actions.start
        })
      ]);
      return card;
    });

    /* ---------- כרטיסים נוספים ---------- */
    var extras = [
      el('a', { class: 'card card--gold', href: '#/toolbox' }, [
        el('div', { class: 'card__icon', 'aria-hidden': 'true', text: '🧰' }),
        el('h3', { class: 'card__title', text: S.nav.toolbox }),
        el('p',  { class: 'card__desc',
          text: 'מודל תלת־ממדי חופשי, פריסות וכרטיס הנוסחה. פתוח תמיד, גם באמצע פעילות.' }),
        el('span', { class: 'btn btn--gold btn--block', 'aria-hidden': 'true', text: S.actions.open })
      ]),
      el('a', { class: 'card card--gold', href: '#/progress' }, [
        el('div', { class: 'card__icon', 'aria-hidden': 'true', text: '⭐' }),
        el('h3', { class: 'card__title', text: S.nav.progress }),
        el('p',  { class: 'card__desc', text: 'כל מה שהשלמתם, במקום אחד.' }),
        el('span', { class: 'btn btn--ghost btn--block', 'aria-hidden': 'true', text: S.actions.open })
      ]),
      el('a', { class: 'card card--gold', href: '#/final' }, [
        el('div', { class: 'card__icon', 'aria-hidden': 'true', text: D.finalExam.icon }),
        el('h3', { class: 'card__title', text: D.finalExam.title }),
        el('p',  { class: 'card__desc', text: D.finalExam.desc }),
        el('span', { class: 'btn btn--ghost btn--block', 'aria-hidden': 'true', text: S.actions.open })
      ])
    ];

    UI.clear(mount);
    mount.appendChild(el('div', { class: 'page' }, [
      hero,
      el('div', { class: 'section-head' }, [
        el('h2', { text: S.hub.unitsHeading }),
        el('span', { class: 'section-head__note', text: S.hub.unitsNote })
      ]),
      el('div', { class: 'card-grid' }, unitCards),
      el('div', { class: 'section-head' }, [ el('h2', { text: S.hub.extrasHeading }) ]),
      el('div', { class: 'card-grid' }, extras)
    ]));

    App.setTitle(S.site.title);
    App.setNavCurrent('home');
  };

})(window);
