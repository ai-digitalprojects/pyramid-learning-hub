/* ============================================================
   activities/guided.js — פעילות 2.7: תרגול מודרך
   ------------------------------------------------------------
   שלושה תרגילים, ובכל אחד שלושה שלבים נבדקים:
   שטח הבסיס → הכפלה בגובה → חילוק בשלוש.
   שלב שגוי אינו נועל: מקבלים הסבר וממשיכים לנסות,
   והניקוד נקבע לפי הניסיון הראשון בכל שלב.
   ============================================================ */
(function (global) {
  'use strict';

  var App = global.App = global.App || {};
  App.activities = App.activities || {};

  App.activities['2.7'] = function (mount, act, unit) {
    var UI = App.UI, Kit = App.Kit, el = UI.el;

    var totalSteps = act.problems.reduce(function (s, p) { return s + p.steps.length; }, 0);
    var state = { p: 0, s: 0, first: {}, solved: {} };

    function key(p, s) { return p + '-' + s; }

    function render() {
      if (state.p >= act.problems.length) { renderResult(); return; }

      var prob = act.problems[state.p];
      var step = prob.steps[state.s];
      var k = key(state.p, state.s);
      var isLastStep = state.s === prob.steps.length - 1;
      var isLastProblem = state.p === act.problems.length - 1;

      var doneCount = Object.keys(state.solved).length;
      var pct = Math.round((doneCount / totalSteps) * 100);

      var feedback = el('div', { class: 'feedback-slot', 'aria-live': 'polite' });
      var input = el('input', {
        type: 'text', inputmode: 'decimal', class: 'num-input',
        'aria-label': 'התשובה שלכם', autocomplete: 'off'
      });

      function advance() {
        if (isLastStep) { state.p += 1; state.s = 0; } else { state.s += 1; }
        render();
      }

      function submit() {
        var raw = (input.value || '').trim().replace(',', '.');
        if (raw === '') { input.focus(); return; }
        var val = parseFloat(raw);
        if (isNaN(val)) {
          show(false, 'לא הצלחנו לקרוא את התשובה', 'כתבו מספר בלבד, למשל 36.');
          return;
        }
        var correct = Math.abs(val - step.answer) < 1e-9;
        if (state.first[k] === undefined) state.first[k] = correct;

        if (correct) {
          state.solved[k] = true;
          show(true, 'נכון', step.why);
        } else {
          var msg = null;
          (step.checks || []).forEach(function (c) {
            if (msg === null && Math.abs(val - c.value) < 1e-9) msg = c.text;
          });
          show(false, 'עוד לא', msg || ('בדקו שוב את החישוב. ' + (step.hint || '')));
          input.value = ''; input.focus();
        }
      }

      function show(ok, title, text) {
        var tail = ok
          ? [el('div', { class: 'btn-row btn-row--center' }, [
              el('button', {
                type: 'button', class: 'btn btn--unit-2 btn--lg', onclick: advance
              }, [
                document.createTextNode(
                  isLastStep ? (isLastProblem ? 'לסיכום הפעילות ' : 'לתרגיל הבא ') : 'לשלב הבא '),
                el('span', { 'aria-hidden': 'true', text: '←' })
              ])
            ])]
          : [el('p', { class: 'feedback__retry', text: 'נסו שוב — תקנו את המספר ולחצו בדיקה.' })];

        UI.clear(feedback);
        feedback.appendChild(el('div', { class: 'feedback feedback--' + (ok ? 'ok' : 'no') }, [
          el('div', { class: 'feedback__head' }, [
            el('span', { class: 'feedback__icon', 'aria-hidden': 'true', text: ok ? '✔' : '✘' }),
            el('h3', { class: 'feedback__title', text: title })
          ]),
          el('p', { class: 'feedback__why', text: text })
        ].concat(tail)));

        if (ok) { var b = feedback.querySelector('.btn'); if (b) b.focus(); }
        UI.announce((ok ? 'נכון. ' : 'עוד לא. ') + text);
      }

      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); submit(); }
      });

      var stepDots = el('div', { class: 'quiz-dots', role: 'img',
        'aria-label': 'שלב ' + (state.s + 1) + ' מתוך ' + prob.steps.length
      }, prob.steps.map(function (_, i) {
        return el('span', { class: 'quiz-dot' + (i === state.s ? ' quiz-dot--current' : '') +
          (state.solved[key(state.p, i)] ? ' quiz-dot--ok' : '') });
      }));

      UI.clear(mount);
      mount.appendChild(el('div', { class: 'stack' }, [
        el('div', { class: 'quiz-progress' }, [
          el('div', { class: 'quiz-head' }, [
            el('div', { class: 'quiz-head__count' }, [
              document.createTextNode('תרגיל '), UI.num(state.p + 1),
              document.createTextNode(' מתוך '), UI.num(act.problems.length),
              document.createTextNode(' · שלב '), UI.num(state.s + 1),
              document.createTextNode(' מתוך '), UI.num(prob.steps.length)
            ]),
            stepDots
          ]),
          el('div', { class: 'progress__track', role: 'progressbar',
            'aria-valuenow': pct, 'aria-valuemin': '0', 'aria-valuemax': '100',
            'aria-label': 'התקדמות בפעילות' }, [
            el('div', { class: 'progress__fill progress__fill--unit-2', style: 'inline-size:' + pct + '%' })
          ])
        ]),
        el('div', { class: 'panel' }, [
          el('h3', { text: prob.title }),
          el('p', { text: prob.text })
        ]),
        prob.figure ? el('div', { class: 'diagram-stage' }, [Kit.buildFigure(prob.figure)]) : null,
        el('div', { class: 'panel quiz-card' }, [
          el('h2', { class: 'quiz-question', text: step.prompt }),
          step.hint ? el('p', { class: 'quiz-sub', text: step.hint }) : null
        ]),
        el('div', { class: 'numeric-row' }, [
          el('div', { class: 'numeric-field' }, [
            input,
            step.unit ? el('span', { class: 'numeric-unit', text: step.unit }) : null
          ]),
          el('button', { type: 'button', class: 'btn btn--unit-2', onclick: submit },
            [document.createTextNode('בדיקה')])
        ]),
        feedback
      ]));

      UI.scrollTop();
    }

    function renderResult() {
      var score = 0;
      Object.keys(state.first).forEach(function (k) { if (state.first[k]) score += 1; });

      var concepts = [];
      act.problems.forEach(function (p, pi) {
        p.steps.forEach(function (s, si) {
          concepts.push({
            concept: si === 0 ? 'חישוב שטח הבסיס'
              : (si === 1 ? 'הכפלת שטח הבסיס בגובה' : 'החילוק בשלוש'),
            correct: state.first[key(pi, si)] === true
          });
        });
      });

      Kit.resultScreen({
        mount: mount, act: act, unit: unit,
        score: score, max: totalSteps,
        result: act.result,
        concepts: concepts,
        onRetry: function () { state = { p: 0, s: 0, first: {}, solved: {} }; render(); }
      });
    }

    render();
  };

})(window);
