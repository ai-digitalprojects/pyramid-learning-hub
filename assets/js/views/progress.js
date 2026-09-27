/* ============================================================
   views/progress.js — ההתקדמות שלי
   ------------------------------------------------------------
   מציג התקדמות בשתי היחידות ובמבחן הסיום.
   הנתונים נקראים מהאחסון המקומי בלבד; שום דבר אינו נשלח החוצה.
   ============================================================ */
(function (global) {
  'use strict';

  var App = global.App = global.App || {};
  App.views = App.views || {};

  App.views.progress = function (mount) {
    var UI = App.UI, Store = App.Store, D = global.PyramidData;
    var S = D.strings, el = UI.el;

    var units = [D.unit1, D.unit2];
    var allActs = units[0].activities.concat(units[1].activities);
    var totalDone = Store.countDone(allActs);
    var overall = Math.round((totalDone / allActs.length) * 100);
    var data = Store.all();
    var EX = D.finalExam;

    /* ---------- טבעות ---------- */
    var rings = el('div', { class: 'stat-grid' }, [
      el('div', { class: 'stat' }, [
        UI.progressRing(overall),
        el('div', { class: 'stat__label', text: S.progress.overall })
      ]),
      el('div', { class: 'stat' }, [
        UI.progressRing(Store.unitPercent(units[0].activities), 'unit-1'),
        el('div', { class: 'stat__label', text: S.progress.unit1 })
      ]),
      el('div', { class: 'stat' }, [
        UI.progressRing(Store.unitPercent(units[1].activities), 'unit-2'),
        el('div', { class: 'stat__label', text: S.progress.unit2 })
      ]),
      el('div', { class: 'stat' }, [
        el('div', { class: 'stat__value', text: totalDone + '/' + allActs.length }),
        el('div', { class: 'stat__label', text: S.progress.activities })
      ])
    ]);

    /* ---------- מבחן הסיום ---------- */
    var finalPanel;
    if (data.final.attempts === 0) {
      finalPanel = el('div', { class: 'panel' }, [
        el('h3', { text: EX.title }),
        el('p', { class: 'card__desc', text: 'עוד לא ניגשתם למבחן הסיום.' }),
        el('a', { class: 'btn btn--gold', href: '#/final' }, [document.createTextNode('למבחן הסיום')])
      ]);
    } else {
      var b = data.final.best;
      finalPanel = el('div', { class: 'panel' }, [
        el('h3', { text: EX.title }),
        el('p', {}, [
          document.createTextNode('התוצאה הטובה ביותר: '),
          UI.num(b.score + ' מתוך ' + b.max),
          document.createTextNode('  ·  ניסיונות: '),
          UI.num(data.final.attempts)
        ]),
        el('p', {}, [
          data.final.passed
            ? el('span', { class: 'chip chip--done' }, [
                el('span', { 'aria-hidden': 'true', text: '✔' }),
                el('span', { text: 'עברתם' })
              ])
            : el('span', { class: 'chip chip--todo' }, [
                el('span', { 'aria-hidden': 'true', text: '○' }),
                el('span', { text: 'עוד לא עברתם' })
              ])
        ]),
        el('div', { class: 'btn-row' }, [
          el('a', { class: 'btn btn--gold', href: '#/final' },
            [document.createTextNode(data.final.passed ? 'לתעודה ולמבחן חוזר' : 'למבחן חוזר')])
        ])
      ]);
    }

    /* ---------- תג ההישג ---------- */
    var badgePanel = data.badge.earned
      ? el('div', { class: 'panel badge-panel' }, [
          el('div', { class: 'badge-panel__icon', 'aria-hidden': 'true', text: '🏅' }),
          el('div', {}, [
            el('h3', { text: 'תעודת סיום' }),
            el('p', { text: 'סיימתם את המסע אל הפירמידה. אפשר לפתוח ולהדפיס את התעודה.' }),
            el('a', { class: 'btn btn--gold', href: '#/final' },
              [document.createTextNode('לתעודה')])
          ])
        ])
      : null;

    /* ---------- טבלה מפורטת ---------- */
    var rows = [];
    units.forEach(function (u) {
      u.activities.forEach(function (act) {
        var rec = Store.getActivity(act.id);
        rows.push(el('tr', {}, [
          el('td', {}, [
            el('a', { href: '#/activity/' + act.id }, [
              el('span', { class: 'num', text: act.id }),
              document.createTextNode('  ' + act.title)
            ])
          ]),
          el('td', { text: u.short }),
          el('td', {}, [UI.stateChip(rec.state)]),
          el('td', {}, [
            (rec.state === 'done' && act.scored && rec.max)
              ? el('span', {}, [UI.num(rec.score + ' / ' + rec.max)])
              : el('span', { class: 'num', text: S.progress.noScore })
          ]),
          el('td', {}, [
            rec.attempts ? UI.num(String(rec.attempts)) : el('span', { class: 'num', text: '0' })
          ])
        ]));
      });
    });

    var table = el('div', { class: 'table-wrap' }, [
      el('table', { class: 'data' }, [
        el('thead', {}, [
          el('tr', {}, [
            el('th', { scope: 'col', text: S.progress.tableHeadAct }),
            el('th', { scope: 'col', text: S.progress.tableHeadUnit }),
            el('th', { scope: 'col', text: S.progress.tableHeadState }),
            el('th', { scope: 'col', text: S.progress.tableHeadScore }),
            el('th', { scope: 'col', text: 'ניסיונות' })
          ])
        ]),
        el('tbody', {}, rows)
      ])
    ]);

    var deviceNote = el('div', { class: 'notice' }, [
      el('span', { class: 'notice__icon', 'aria-hidden': 'true', text: 'ℹ️' }),
      el('p', { text: S.progress.deviceNote })
    ]);

    var storageWarn = Store.isMemoryOnly()
      ? el('div', { class: 'notice notice--warn' }, [
          el('span', { class: 'notice__icon', 'aria-hidden': 'true', text: '⚠️' }),
          el('p', { text: S.progress.storageOff })
        ])
      : null;

    var actions = el('div', { class: 'btn-row no-print', style: 'margin-block-start:var(--sp-5)' }, [
      el('button', { type: 'button', class: 'btn btn--ghost',
        onclick: function () { global.print(); } }, [document.createTextNode(S.actions.print)]),
      el('button', {
        type: 'button', class: 'btn btn--danger',
        onclick: function () {
          if (global.confirm(S.progress.resetConfirm)) {
            Store.reset();
            UI.toast(S.progress.resetDone);
            App.views.progress(mount);
          }
        }
      }, [document.createTextNode(S.actions.reset)])
    ]);

    UI.clear(mount);
    mount.appendChild(el('div', { class: 'page' }, [
      el('div', { class: 'btn-row no-print', style: 'margin-block-end:var(--sp-4)' }, [
        el('a', { class: 'btn btn--ghost', href: '#/' }, [
          el('span', { 'aria-hidden': 'true', text: '→' }),
          document.createTextNode(' ' + S.actions.backHome)
        ])
      ]),
      el('h1', { text: S.progress.title }),
      el('p', { class: 'card__desc', text: S.progress.lead }),
      storageWarn,
      rings,
      badgePanel,
      el('div', { class: 'section-head' }, [el('h2', { text: 'מבחן הסיום' })]),
      finalPanel,
      el('div', { class: 'section-head' }, [el('h2', { text: 'פירוט לפי פעילות' })]),
      table,
      el('div', { style: 'margin-block-start:var(--sp-5)' }, [deviceNote]),
      actions
    ]));

    App.setTitle(S.progress.title);
    App.setNavCurrent('progress');
  };

})(window);
