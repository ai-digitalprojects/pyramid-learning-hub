/* ============================================================
   views/misc.js — ארגז הכלים, מבחן הסיום, דף שגיאה
   שלב 1: מסגרות בלבד.
   ============================================================ */
(function (global) {
  'use strict';

  var App = global.App = global.App || {};
  App.views = App.views || {};

  function backRow(label, href) {
    var el = App.UI.el;
    return el('div', { class: 'btn-row', style: 'margin-block-end:var(--sp-4)' }, [
      el('a', { class: 'btn btn--ghost', href: href }, [
        el('span', { 'aria-hidden': 'true', text: '→' }),
        document.createTextNode(' ' + label)
      ])
    ]);
  }

  /* ---------- ארגז הכלים ---------- */
  App.views.toolbox = function (mount) {
    var UI = App.UI, S = global.PyramidData.strings, el = UI.el;

    UI.clear(mount);
    mount.appendChild(el('div', { class: 'page' }, [
      backRow(S.actions.backHome, '#/'),
      el('h1', { text: S.nav.toolbox }),
      el('p', { class: 'card__desc',
        text: 'כאן אפשר יהיה לשחק עם מודל תלת־ממדי, לפרוש אותו ולקפל אותו בחזרה, ולראות את כרטיס הנוסחה — בכל רגע, גם באמצע פעילות.' }),
      el('div', { class: 'notice notice--build' }, [
        el('span', { class: 'notice__icon', 'aria-hidden': 'true', text: '🚧' }),
        el('div', {}, [
          el('h3', { style: 'margin-block-end:var(--sp-1)', text: 'ארגז הכלים בבנייה' }),
          el('p', { text: 'המודל התלת־ממדי ייבנה בשלב הבא של הפיתוח.' })
        ])
      ])
    ]));

    App.setTitle(S.nav.toolbox);
    App.setNavCurrent('toolbox');
  };

  /* ---------- מבחן סיום ---------- */
  App.views.final = function (mount) {
    var UI = App.UI, D = global.PyramidData, S = D.strings, el = UI.el;
    var exam = D.finalExam;

    UI.clear(mount);
    mount.appendChild(el('div', { class: 'page' }, [
      backRow(S.actions.backHome, '#/'),
      el('div', { class: 'unit-banner', style: 'background:var(--gold-wash);border-inline-start:6px solid var(--gold)' }, [
        el('div', { class: 'unit-banner__icon', 'aria-hidden': 'true', text: exam.icon }),
        el('div', { class: 'unit-banner__body' }, [
          el('h1', { text: exam.title }),
          el('p', { text: exam.desc })
        ])
      ]),
      el('div', { class: 'panel' }, [
        el('h3', { text: 'איך המבחן עובד' }),
        el('ul', {}, [
          el('li', {}, [ document.createTextNode('במבחן '), UI.num(exam.itemCount), document.createTextNode(' שאלות משתי היחידות.') ]),
          el('li', { text: 'על כל שאלה עונים פעם אחת בלבד, בלי רמזים.' }),
          el('li', {}, [ document.createTextNode('כדי לקבל תעודת סיום צריך '), UI.num(exam.passCount), document.createTextNode(' תשובות נכונות מתוך '), UI.num(exam.itemCount), document.createTextNode('.') ]),
          el('li', { text: 'מי שלא עבר מקבל סיכום ידידותי עם הנושאים שכדאי לחזור עליהם, ואפשר לגשת למבחן שוב.' })
        ])
      ]),
      el('div', { class: 'notice notice--build', style: 'margin-block-start:var(--sp-5)' }, [
        el('span', { class: 'notice__icon', 'aria-hidden': 'true', text: '🚧' }),
        el('div', {}, [
          el('h3', { style: 'margin-block-end:var(--sp-1)', text: 'המבחן בבנייה' }),
          el('p', { text: 'המבחן ייבנה אחרי שתי היחידות, בשלב 5 של הפיתוח.' })
        ])
      ])
    ]));

    App.setTitle(exam.title);
    App.setNavCurrent(null);
  };

  /* ---------- דף לא נמצא ---------- */
  App.views.notFound = function (mount) {
    var UI = App.UI, S = global.PyramidData.strings, el = UI.el;

    UI.clear(mount);
    mount.appendChild(el('div', { class: 'page' }, [
      el('h1', { text: S.notFound.title }),
      el('p', { text: S.notFound.body }),
      el('div', { class: 'btn-row' }, [
        el('a', { class: 'btn btn--primary', href: '#/', text: S.actions.backHome })
      ])
    ]));

    App.setTitle(S.notFound.title);
    App.setNavCurrent(null);
  };

})(window);
