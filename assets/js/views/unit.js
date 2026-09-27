/* ============================================================
   views/unit.js — דף יחידה עם רשימת הפעילויות
   ============================================================ */
(function (global) {
  'use strict';

  var App = global.App = global.App || {};
  App.views = App.views || {};

  App.views.unit = function (mount, params) {
    var UI = App.UI, Store = App.Store, D = global.PyramidData;
    var S = D.strings, el = UI.el;

    var unit = params.id === '2' ? D.unit2 : (params.id === '1' ? D.unit1 : null);
    if (!unit) { App.views.notFound(mount); return; }

    var pct = Store.unitPercent(unit.activities);
    var done = Store.countDone(unit.activities);

    var banner = el('div', { class: 'unit-banner unit-banner--' + unit.id }, [
      el('div', { class: 'unit-banner__icon', 'aria-hidden': 'true', text: unit.icon }),
      el('div', { class: 'unit-banner__body' }, [
        el('h1', { text: unit.short + ': ' + unit.title }),
        el('p', { text: unit.lead })
      ]),
      el('div', {}, [ UI.progressRing(pct, 'unit-' + unit.id) ])
    ]);

    var list = el('div', { class: 'stack' }, unit.activities.map(function (act, i) {
      var rec = Store.getActivity(act.id);
      // מספר אחד מבודד מכיווניות — פיצול לשלושה צמתים היה מתהפך ל־"8 / 7"
      var scoreLine = (rec.state === 'done' && act.scored && rec.max)
        ? el('span', { class: 'section-head__note' }, [
            UI.num(rec.score + ' / ' + rec.max)
          ])
        : null;

      return el('a', {
        class: 'activity-card activity-card--' + unit.id,
        href: '#/activity/' + act.id
      }, [
        el('div', { class: 'activity-card__num', 'aria-hidden': 'true', text: act.id }),
        el('div', { class: 'activity-card__body' }, [
          el('div', { class: 'activity-card__title' }, [
            el('span', { 'aria-hidden': 'true', text: act.icon + ' ' }),
            document.createTextNode(act.title)
          ]),
          el('p', { class: 'activity-card__desc', text: act.desc })
        ]),
        el('div', { class: 'activity-card__meta' }, [
          UI.stateChip(rec.state),
          scoreLine
        ])
      ]);
    }));

    UI.clear(mount);
    mount.appendChild(el('div', { class: 'page' }, [
      el('div', { class: 'btn-row', style: 'margin-block-end:var(--sp-4)' }, [
        el('a', { class: 'btn btn--ghost', href: '#/' }, [
          el('span', { 'aria-hidden': 'true', text: '→' }),
          document.createTextNode(' ' + S.actions.backHome)
        ])
      ]),
      banner,
      el('div', { class: 'section-head' }, [
        el('h2', { text: 'הפעילויות ביחידה' }),
        el('span', { class: 'section-head__note' }, [
          document.createTextNode('הושלמו '),
          UI.num(done),
          document.createTextNode(' מתוך '),
          UI.num(unit.activities.length)
        ])
      ]),
      list
    ]));

    App.setTitle(unit.short + ': ' + unit.title);
    App.setNavCurrent(null);
  };

})(window);
