/* ============================================================
   activities/compare.js — פעילות 2.3: מנסרה ופירמידה
   ------------------------------------------------------------
   חוקרים זו לצד זו: אותו בסיס, אותו גובה.
   הנפחים מחושבים במנוע הגאומטריה, ולכן היחס שמופיע
   על המסך הוא תוצאה אמיתית ולא מספר שנכתב מראש.
   ============================================================ */
(function (global) {
  'use strict';

  var App = global.App = global.App || {};
  App.activities = App.activities || {};

  App.activities['2.3'] = function (mount, act, unit) {
    var UI = App.UI, Kit = App.Kit, G = App.Geometry, SV = App.SolidView, el = UI.el;
    var state = { step: 'explore', n: 4, h: 1.5, revealed: false };

    function fmt(x) { return (Math.round(x * 100) / 100).toFixed(2); }

    function renderExplore() {
      var stage = el('div', { class: 'compare-grid' });
      var readout = el('div', { class: 'readout', 'aria-live': 'polite' });
      var revealBtn;

      function draw() {
        var pyr = G.pyramid(state.n, { radius: 1, height: state.h });
        var pri = G.prism(state.n, { radius: 1, height: state.h });

        UI.clear(stage);
        stage.appendChild(el('div', { class: 'compare-cell' }, [
          el('h3', { text: 'מנסרה' }),
          SV.create({ geometry: pri, view: 'front', size: 210 })
        ]));
        stage.appendChild(el('div', { class: 'compare-cell' }, [
          el('h3', { text: 'פירמידה' }),
          SV.create({ geometry: pyr, view: 'front', size: 210, show: { height: true } })
        ]));

        UI.clear(readout);
        readout.appendChild(el('div', { class: 'readout__item' }, [
          document.createTextNode('שטח הבסיס (זהה לשניהם): '),
          el('span', { class: 'readout__value', text: fmt(pyr.metrics.baseArea) })
        ]));
        readout.appendChild(el('div', { class: 'readout__item' }, [
          document.createTextNode('נפח המנסרה: '),
          el('span', { class: 'readout__value', text: fmt(pri.metrics.volume) })
        ]));
        readout.appendChild(el('div', { class: 'readout__item' }, [
          document.createTextNode('נפח הפירמידה: '),
          el('span', { class: 'readout__value', text: fmt(pyr.metrics.volume) })
        ]));
        if (state.revealed) {
          readout.appendChild(el('div', { class: 'readout__item',
            style: 'background:var(--gold-wash);border-color:var(--gold)' }, [
            document.createTextNode('היחס ביניהם: '),
            el('span', { class: 'readout__value',
              text: fmt(pri.metrics.volume / pyr.metrics.volume) })
          ]));
        }
      }

      function slider(labelText, min, max, step, value, onInput) {
        return el('div', { class: 'control-group' }, [
          el('label', { class: 'control-group__label', text: labelText }),
          el('input', {
            type: 'range', min: String(min), max: String(max), step: String(step),
            value: String(value), 'aria-label': labelText,
            oninput: function () { onInput(parseFloat(this.value)); }
          })
        ]);
      }

      revealBtn = el('button', {
        type: 'button', class: 'btn btn--gold',
        onclick: function () { state.revealed = true; draw(); UI.announce('היחס בין הנפחים הוצג.'); }
      }, [document.createTextNode('הראו לי את היחס')]);

      draw();

      UI.clear(mount);
      mount.appendChild(el('div', { class: 'stack' }, [
        el('div', { class: 'panel' }, [
          el('p', { class: 'activity-intro__text', text: act.lead })
        ]),
        el('div', { class: 'explore-controls' }, [
          slider('מספר צלעות הבסיס', 3, 8, 1, state.n, function (v) { state.n = v; draw(); }),
          slider('גובה', 0.8, 2.6, 0.1, state.h, function (v) { state.h = v; draw(); })
        ]),
        stage,
        readout,
        el('div', { class: 'btn-row btn-row--center' }, [revealBtn]),
        el('div', { class: 'btn-row btn-row--center' }, [
          el('button', {
            type: 'button', class: 'btn btn--unit-2 btn--lg',
            onclick: function () { state.step = 'quiz'; render(); }
          }, [
            document.createTextNode('לשאלות '),
            el('span', { 'aria-hidden': 'true', text: '←' })
          ])
        ])
      ]));
      /* הכפתור שממשיך הלאה במסך הזה */
      App.Kit.markNext(mount, '.btn--lg');

    }

    function render() {
      if (state.step === 'explore') { renderExplore(); UI.scrollTop(); return; }
      Kit.quiz({ mount: mount, act: act, unit: unit, questions: act.questions, result: act.result });
    }

    render();
  };

})(window);
