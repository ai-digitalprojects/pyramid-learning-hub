/* ============================================================
   views/activity.js — מסגרת פעילות
   ------------------------------------------------------------
   שלב 1: המסגרת בלבד — כותרת, ניווט ומצב.
   התוכן האינטראקטיבי ייבנה בשלבים 3–4 לפי `act.kind`.
   ============================================================ */
(function (global) {
  'use strict';

  var App = global.App = global.App || {};
  App.views = App.views || {};

  function findActivity(id) {
    var D = global.PyramidData;
    var units = [D.unit1, D.unit2];
    for (var u = 0; u < units.length; u++) {
      for (var i = 0; i < units[u].activities.length; i++) {
        if (units[u].activities[i].id === id) {
          return { unit: units[u], act: units[u].activities[i], index: i };
        }
      }
    }
    return null;
  }

  App.views.activity = function (mount, params) {
    var UI = App.UI, Store = App.Store, D = global.PyramidData;
    var S = D.strings, el = UI.el;

    var found = findActivity(params.id);
    if (!found) { App.views.notFound(mount); return; }

    var unit = found.unit, act = found.act;
    var rec = Store.getActivity(act.id);

    /* ---------- ניווט בין פעילויות ---------- */
    var prev = unit.activities[found.index - 1];
    var next = unit.activities[found.index + 1];

    var nav = el('div', { class: 'btn-row', style: 'margin-block-end:var(--sp-4)' }, [
      el('a', { class: 'btn btn--ghost', href: '#/unit/' + unit.id }, [
        el('span', { 'aria-hidden': 'true', text: '→' }),
        document.createTextNode(' ' + S.actions.backToUnit)
      ])
    ]);

    /* ---------- כותרת ---------- */
    var head = el('div', { class: 'unit-banner unit-banner--' + unit.id }, [
      el('div', { class: 'unit-banner__icon', 'aria-hidden': 'true', text: act.icon }),
      el('div', { class: 'unit-banner__body' }, [
        el('h1', {}, [
          el('span', { class: 'num', style: 'color:var(--text-muted)', text: act.id + '  ' }),
          document.createTextNode(act.title)
        ]),
        el('p', { text: act.desc })
      ]),
      el('div', {}, [ UI.stateChip(rec.state) ])
    ]);

    /* ---------- הודעת בנייה ---------- */
    var buildNotice = el('div', { class: 'notice notice--build' }, [
      el('span', { class: 'notice__icon', 'aria-hidden': 'true', text: '🚧' }),
      el('div', {}, [
        el('h3', { style: 'margin-block-end:var(--sp-1)', text: S.build.title }),
        el('p', { text: S.build.body })
      ])
    ]);

    /* ---------- כלי בדיקה זמני (יוסר בשלב 3) ---------- */
    var chipHolder = el('span', {}, [ UI.stateChip(rec.state) ]);

    function refreshChip() {
      var r = Store.getActivity(act.id);
      UI.clear(chipHolder);
      chipHolder.appendChild(UI.stateChip(r.state));
    }

    var devPanel = el('div', { class: 'panel no-print', style: 'margin-block-start:var(--sp-5)' }, [
      el('h3', { text: S.build.devTitle }),
      el('p', { class: 'card__desc', text: S.build.devBody }),
      el('div', { class: 'btn-row' }, [
        el('button', {
          type: 'button',
          class: 'btn btn--unit-' + unit.id,
          onclick: function () {
            Store.markDone(act.id, act.maxScore, act.maxScore);
            refreshChip();
            UI.toast('הפעילות סומנה כהושלמה');
          }
        }, [ document.createTextNode(S.build.devMark) ]),
        el('button', {
          type: 'button',
          class: 'btn btn--ghost',
          onclick: function () {
            Store.clearActivity(act.id);
            refreshChip();
            UI.toast('הסימון בוטל');
          }
        }, [ document.createTextNode(S.build.devClear) ]),
        chipHolder
      ])
    ]);

    /* ---------- הבא / הקודם ---------- */
    var stepRow = el('div', { class: 'btn-row', style: 'margin-block-start:var(--sp-6)' }, []);
    if (prev) {
      stepRow.appendChild(el('a', { class: 'btn btn--ghost', href: '#/activity/' + prev.id }, [
        el('span', { 'aria-hidden': 'true', text: '→' }),
        document.createTextNode(' ' + prev.title)
      ]));
    }
    if (next) {
      stepRow.appendChild(el('a', { class: 'btn btn--unit-' + unit.id, href: '#/activity/' + next.id }, [
        document.createTextNode(next.title + ' '),
        el('span', { 'aria-hidden': 'true', text: '←' })
      ]));
    }

    UI.clear(mount);
    mount.appendChild(el('div', { class: 'page' }, [ nav, head, buildNotice, devPanel, stepRow ]));

    App.setTitle(act.title);
    App.setNavCurrent(null);
  };

})(window);
