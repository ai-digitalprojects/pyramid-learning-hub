/* ============================================================
   views/misc.js — דף שגיאה
   ארגז הכלים ומבחן הסיום עברו לקבצים משלהם.
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
