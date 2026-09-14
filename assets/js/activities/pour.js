/* ============================================================
   activities/pour.js — פעילות 2.4: למה מחלקים בשלוש?
   ------------------------------------------------------------
   קודם משערים, ורק אז בודקים: ממלאים את הפירמידה ושופכים
   לתוך המנסרה, עד שהיא מתמלאת. ההשערה נרשמת ואינה מנוקדת —
   הטעות בשלב הזה היא חלק מהלמידה.
   ============================================================ */
(function (global) {
  'use strict';

  var App = global.App = global.App || {};
  App.activities = App.activities || {};

  App.activities['2.4'] = function (mount, act, unit) {
    var UI = App.UI, Kit = App.Kit, G = App.Geometry, SV = App.SolidView, el = UI.el;
    var state = { step: 'predict', guess: null, fills: 0, running: false };

    var N = 4, H = 1.6;
    var PYR = G.pyramid(N, { radius: 1, height: H });
    var PRI = G.prism(N, { radius: 1, height: H });

    /* ---------- שלב 1: השערה ---------- */
    function renderPredict() {
      var p = act.predict;
      var feedback = el('div', { class: 'feedback-slot', 'aria-live': 'polite' });

      var options = el('div', { class: 'option-grid' }, p.options.map(function (text, i) {
        return el('button', {
          type: 'button', class: 'answer-btn answer-btn--sm',
          onclick: function () {
            if (state.guess !== null) return;
            state.guess = i;
            [].forEach.call(options.children, function (b) {
              b.disabled = true; b.setAttribute('aria-disabled', 'true');
            });
            this.classList.add('answer-btn--correct');
            this.querySelector('.answer-btn__mark').textContent = '✓';

            UI.clear(feedback);
            feedback.appendChild(el('div', { class: 'feedback feedback--ok' }, [
              el('div', { class: 'feedback__head' }, [
                el('span', { class: 'feedback__icon', 'aria-hidden': 'true', text: '💭' }),
                el('h3', { class: 'feedback__title', text: 'ההשערה נרשמה' })
              ]),
              el('p', { class: 'feedback__why', text: p.afterText }),
              el('div', { class: 'btn-row btn-row--center' }, [
                el('button', {
                  type: 'button', class: 'btn btn--unit-2 btn--lg',
                  onclick: function () { state.step = 'experiment'; render(); }
                }, [
                  document.createTextNode('בודקים בפועל '),
                  el('span', { 'aria-hidden': 'true', text: '←' })
                ])
              ])
            ]));
            UI.announce(p.afterText);
          }
        }, [
          el('span', { class: 'answer-btn__mark', 'aria-hidden': 'true' }),
          el('span', { class: 'answer-btn__label', text: text })
        ]);
      }));

      UI.clear(mount);
      mount.appendChild(el('div', { class: 'stack' }, [
        el('div', { class: 'panel' }, [
          el('h2', { text: p.title }),
          el('p', { class: 'activity-intro__text', text: p.text })
        ]),
        el('div', { class: 'compare-grid' }, [
          el('div', { class: 'compare-cell' }, [
            el('h3', { text: 'פירמידה' }),
            SV.create({ geometry: PYR, view: 'front', size: 200 })
          ]),
          el('div', { class: 'compare-cell' }, [
            el('h3', { text: 'מנסרה' }),
            SV.create({ geometry: PRI, view: 'front', size: 200 })
          ])
        ]),
        el('div', { class: 'panel quiz-card' }, [
          el('h2', { class: 'quiz-question', text: p.question })
        ]),
        options,
        feedback
      ]));
    }

    /* ---------- שלב 2: הניסוי ---------- */
    function renderExperiment() {
      var p = act.predict;
      var barWrap = el('div', { class: 'pour-jar', role: 'img',
        'aria-label': 'המנסרה ריקה' });
      var fill = el('div', { class: 'pour-jar__fill' });
      barWrap.appendChild(fill);

      var countLine = el('p', { class: 'view-hint', 'aria-live': 'polite',
        text: 'המנסרה ריקה. שפכו לתוכה פירמידה אחת.' });
      var pourBtn, nextWrap = el('div', { class: 'btn-row btn-row--center' });

      function setFill() {
        var pct = Math.min(100, state.fills * (100 / 3));
        fill.style.blockSize = pct + '%';
        barWrap.setAttribute('aria-label',
          state.fills === 0 ? 'המנסרה ריקה' : ('המנסרה מלאה ב-' + Math.round(pct) + ' אחוזים'));
      }

      function finish() {
        var correctGuess = state.guess === p.answerIndex;
        countLine.textContent = 'המנסרה מלאה! נדרשו בדיוק שלוש פירמידות.';
        pourBtn.disabled = true;
        pourBtn.setAttribute('aria-disabled', 'true');

        UI.clear(nextWrap);
        nextWrap.appendChild(el('div', { class: 'feedback feedback--ok', style: 'inline-size:100%' }, [
          el('div', { class: 'feedback__head' }, [
            el('span', { class: 'feedback__icon', 'aria-hidden': 'true', text: '✔' }),
            el('h3', { class: 'feedback__title',
              text: correctGuess ? p.praise : 'שלוש פירמידות מילאו את המנסרה' })
          ]),
          el('p', { class: 'feedback__why',
            text: 'מילאנו את הפירמידה שלוש פעמים ושפכנו למנסרה — והיא התמלאה בדיוק. מכאן שנפח הפירמידה הוא שליש מנפח המנסרה, וזו הסיבה שבנוסחה מחלקים ב-3.' }),
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
        UI.announce('המנסרה התמלאה אחרי שלוש שפיכות.');
      }

      pourBtn = el('button', {
        type: 'button', class: 'btn btn--unit-2 btn--lg',
        onclick: function () {
          if (state.running || state.fills >= 3) return;
          state.running = true;
          var reduce = global.matchMedia &&
            global.matchMedia('(prefers-reduced-motion: reduce)').matches;
          var step = function () {
            state.fills += 1;
            setFill();
            countLine.textContent = state.fills < 3
              ? ('שפכנו ' + state.fills + ' פירמידות. המנסרה עדיין לא מלאה.')
              : 'המנסרה מלאה!';
            state.running = false;
            if (state.fills >= 3) finish();
          };
          if (reduce) { step(); } else { global.setTimeout(step, 420); }
        }
      }, [document.createTextNode('שפכו פירמידה אחת')]);

      setFill();

      UI.clear(mount);
      mount.appendChild(el('div', { class: 'stack' }, [
        el('div', { class: 'panel' }, [
          el('h2', { text: 'בודקים בפועל' }),
          el('p', { text: 'לחצו שוב ושוב ומלאו את המנסרה. ספרו כמה פירמידות נדרשו.' })
        ]),
        el('div', { class: 'compare-grid' }, [
          el('div', { class: 'compare-cell' }, [
            el('h3', { text: 'פירמידה' }),
            SV.create({ geometry: PYR, view: 'front', size: 190 })
          ]),
          el('div', { class: 'compare-cell' }, [
            el('h3', { text: 'מנסרה' }),
            barWrap
          ])
        ]),
        countLine,
        el('div', { class: 'btn-row btn-row--center' }, [pourBtn]),
        nextWrap
      ]));
    }

    function render() {
      if (state.step === 'predict') { renderPredict(); UI.scrollTop(); return; }
      if (state.step === 'experiment') { renderExperiment(); UI.scrollTop(); return; }
      Kit.quiz({ mount: mount, act: act, unit: unit, questions: act.questions, result: act.result });
    }

    render();
  };

})(window);
