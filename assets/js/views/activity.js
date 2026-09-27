/* ============================================================
   views/activity.js — מסגרת הפעילות
   ------------------------------------------------------------
   כל פעילות מקבלת: כותרת, תוכן, וסרגל ניווט תחתון קבוע.
   התוכן מגיע ממימוש מותאם (App.activities) או, ברוב המקרים,
   ממנוע הפעילויות הכללי לפי הנתונים שבקובצי התוכן.
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
    var UI = App.UI, Store = App.Store, Kit = App.Kit;
    var D = global.PyramidData, S = D.strings, el = UI.el;

    var found = findActivity(params.id);
    if (!found) { App.views.notFound(mount); return; }

    var unit = found.unit, act = found.act;
    var rec = Store.getActivity(act.id);

    /* ---------- כותרת ---------- */
    var head = el('div', { class: 'unit-banner unit-banner--' + unit.id }, [
      el('div', { class: 'unit-banner__icon', 'aria-hidden': 'true', text: act.icon }),
      el('div', { class: 'unit-banner__body' }, [
        el('h1', {}, [UI.numTitle(act.id, act.title, 'num-title--head')]),
        el('p', { text: act.desc })
      ]),
      /* מסומן במזהה התחנה. מאזין יחיד ב-main.js מרענן את השבב ברגע
         שהתחנה נרשמת כהושלמה, כדי שלא יישאר כתוב "לא התחלתם" מעל
         מסך סיכום של פעילות שזה עתה הסתיימה. */
      el('div', { class: 'unit-banner__state', 'data-state-for': act.id },
        [ UI.stateChip(rec.state) ])
    ]);

    var topRow = el('div', { class: 'btn-row', style: 'margin-block-end:var(--sp-4)' }, [
      el('a', { class: 'btn btn--ghost', href: '#/unit/' + unit.id }, [
        el('span', { 'aria-hidden': 'true', text: '→' }),
        document.createTextNode(' ' + S.actions.backToUnit)
      ])
    ]);

    UI.clear(mount);
    var page = el('div', { class: 'page' }, [topRow, head]);
    var slot = el('div', { class: 'activity-body' });
    page.appendChild(slot);
    page.appendChild(Kit.activityNav(act, unit));
    mount.appendChild(page);

    /* ---------- התוכן ---------- */
    var impl = App.activities && App.activities[act.id];
    if (typeof impl === 'function') {
      impl(slot, act, unit);
    } else if (act.questions && act.questions.length) {
      Kit.quiz({
        mount: slot, act: act, unit: unit,
        questions: act.questions,
        intro: act.intro,
        result: act.result || {}
      });
    } else {
      slot.appendChild(el('div', { class: 'notice notice--build' }, [
        el('span', { class: 'notice__icon', 'aria-hidden': 'true', text: '🚧' }),
        el('div', {}, [
          el('h3', { style: 'margin-block-end:var(--sp-1)', text: S.build.title }),
          el('p', { text: S.build.body })
        ])
      ]));
    }

    App.setTitle(act.title);
    App.setNavCurrent(null);
  };

})(window);
