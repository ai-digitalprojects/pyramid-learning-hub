/* ============================================================
   activities/parts.js — פעילות 1.1: מהי פירמידה?
   ------------------------------------------------------------
   מבנה: חקירה חופשית → סיור מודרך על ששת החלקים →
          שמונה שאלות מנוקדות → מסך סיכום.
   האיור הוא SVG אינטראקטיבי (parts-diagram.js). אין Three.js.
   ============================================================ */
(function (global) {
  'use strict';

  var App = global.App = global.App || {};
  App.activities = App.activities || {};

  App.activities['1.1'] = function (mount, act, unit) {
    var UI = App.UI, Store = App.Store, PD = App.PartsDiagram, el = UI.el;

    var state = { step: 'explore', view: 'front', tourIndex: 0, qIndex: 0, answers: [], picked: null };

    /* ------------------------------------------------------------
       בורר התצוגות — משותף לכל המסכים
       ------------------------------------------------------------ */
    function viewSwitcher(onChange) {
      var group = el('div', {
        class: 'view-switch', role: 'group', 'aria-label': 'בחירת זווית מבט'
      }, PD.viewOrder.map(function (key) {
        var active = state.view === key;
        return el('button', {
          type: 'button',
          class: 'view-btn' + (active ? ' view-btn--active' : ''),
          'aria-pressed': active ? 'true' : 'false',
          onclick: function () {
            if (state.view === key) return;
            state.view = key;
            onChange();
          }
        }, [ document.createTextNode(PD.views[key].label) ]);
      }));
      return group;
    }

    function viewHint() {
      return el('p', { class: 'view-hint', text: PD.views[state.view].hint });
    }

    /* ============================================================
       מסך 1 — חקירה חופשית
       ============================================================ */
    function renderExplore() {
      var picked = el('div', { class: 'part-readout', 'aria-live': 'polite' });

      function showPart(part) {
        UI.clear(picked);
        if (!part) {
          picked.appendChild(el('p', { class: 'part-readout__empty',
            text: 'לחצו על חלק כלשהו באיור — ונגלה יחד איך הוא נקרא.' }));
          return;
        }
        var info = act.parts[part];
        picked.appendChild(el('div', { class: 'part-readout__card' }, [
          el('h3', { class: 'part-readout__name', text: info.name }),
          el('p', { text: info.desc })
        ]));
      }

      var stage = el('div', { class: 'diagram-stage' });

      /* מצייר מחדש עם סימון החלק שנבחר, ומחזיר את המיקוד לאותו חלק
         כדי שמשתמשי מקלדת לא יאבדו את מקומם. */
      function drawStage(focusSelector) {
        UI.clear(stage);
        stage.appendChild(PD.create({
          view: state.view,
          interactive: true,
          highlight: state.picked ? { part: state.picked.part, index: state.picked.index } : null,
          onPick: function (part, index) {
            state.picked = { part: part, index: index };
            showPart(part);
            drawStage('[data-part="' + part + '"]' +
              (index === undefined || index === null ? '' : '[data-index="' + index + '"]'));
          }
        }));
        if (focusSelector) {
          var target = stage.querySelector('.pp-hit' + focusSelector);
          if (target) target.focus();
        }
      }

      drawStage(null);
      showPart(state.picked ? state.picked.part : null);

      UI.clear(mount);
      mount.appendChild(el('div', { class: 'stack' }, [
        el('div', { class: 'panel' }, [
          el('p', { class: 'activity-intro__text', text: act.lead })
        ]),
        viewSwitcher(function () { render(); }),
        viewHint(),
        stage,
        picked,
        el('div', { class: 'btn-row btn-row--center' }, [
          el('button', {
            type: 'button', class: 'btn btn--unit-1 btn--lg',
            onclick: function () { state.step = 'tour'; state.tourIndex = 0; render(); }
          }, [
            document.createTextNode('להסבר המודרך '),
            el('span', { 'aria-hidden': 'true', text: '←' })
          ])
        ])
      ]));
    }

    /* ============================================================
       מסך 2 — סיור מודרך
       ============================================================ */
    function renderTour() {
      var stepData = act.tour[state.tourIndex];
      var isLast = state.tourIndex === act.tour.length - 1;
      state.view = stepData.view;

      var svg = PD.create({
        view: stepData.view,
        interactive: false,
        highlight: { part: stepData.part, index: stepData.index }
      });

      var nextBtn = el('button', {
        type: 'button', class: 'btn btn--unit-1 btn--lg',
        onclick: function () {
          if (isLast) { state.step = 'quiz'; state.qIndex = 0; state.answers = []; }
          else { state.tourIndex += 1; }
          render();
        }
      }, [
        document.createTextNode(isLast ? 'לתרגול ' : 'הבא '),
        el('span', { 'aria-hidden': 'true', text: '←' })
      ]);

      var prevBtn = state.tourIndex > 0
        ? el('button', {
            type: 'button', class: 'btn btn--ghost btn--lg',
            onclick: function () { state.tourIndex -= 1; render(); }
          }, [
            el('span', { 'aria-hidden': 'true', text: '→' }),
            document.createTextNode(' הקודם')
          ])
        : null;

      UI.clear(mount);
      mount.appendChild(el('div', { class: 'stack' }, [
        el('div', { class: 'quiz-head' }, [
          el('div', { class: 'quiz-head__count' }, [
            document.createTextNode('שלב '),
            UI.num(state.tourIndex + 1),
            document.createTextNode(' מתוך '),
            UI.num(act.tour.length)
          ]),
          el('div', { class: 'quiz-dots', 'aria-hidden': 'true' }, act.tour.map(function (_, i) {
            return el('span', { class: 'quiz-dot' + (i <= state.tourIndex ? ' quiz-dot--ok' : '') +
              (i === state.tourIndex ? ' quiz-dot--current' : '') });
          }))
        ]),
        el('div', { class: 'diagram-stage' }, [svg]),
        el('div', { class: 'panel tour-card' }, [
          el('h3', { text: stepData.title }),
          el('p', { class: 'tour-card__text', text: stepData.text })
        ]),
        el('div', { class: 'btn-row btn-row--center' }, [prevBtn, nextBtn])
      ]));

      UI.announce(stepData.title + '. ' + stepData.text);
    }

    /* ============================================================
       מסך 3 — תרגול
       ============================================================ */
    function renderQuestion() {
      var q = act.questions[state.qIndex];
      var isLast = state.qIndex === act.questions.length - 1;
      var answered = false;
      state.view = q.view;

      var feedback = el('div', { class: 'feedback-slot', 'aria-live': 'polite' });
      var stage = el('div', { class: 'diagram-stage' });
      var optionsRow = null;

      /* ---------- שאלת לחיצה ---------- */
      function buildClickQuestion() {
        UI.clear(stage);
        stage.appendChild(PD.create({
          view: q.view, interactive: true,
          onPick: function (part, index, label) {
            if (answered) return;
            answered = true;
            var correct = part === q.target;
            state.answers[state.qIndex] = { correct: correct, picked: part };
            UI.clear(stage);
            stage.appendChild(PD.create({
              view: q.view, interactive: false,
              highlight: { part: part, index: index }
            }));
            showFeedback(correct, part, label);
          }
        }));
      }

      /* ---------- שאלת התאמה ---------- */
      function buildMatchQuestion() {
        UI.clear(stage);
        stage.appendChild(PD.create({
          view: q.view, interactive: false,
          highlight: { part: q.target, index: q.index }
        }));

        var correctName = act.parts[q.target].name;

        optionsRow = el('div', { class: 'option-grid' }, q.options.map(function (opt) {
          return el('button', {
            type: 'button', class: 'answer-btn answer-btn--sm',
            onclick: function () {
              if (answered) return;
              answered = true;
              var correct = opt === correctName;
              state.answers[state.qIndex] = { correct: correct, picked: opt };

              [].forEach.call(optionsRow.children, function (b) {
                b.disabled = true;
                b.setAttribute('aria-disabled', 'true');
                if (b.textContent.trim() === correctName) {
                  b.classList.add(correct ? 'answer-btn--correct' : 'answer-btn--is-answer');
                  b.querySelector('.answer-btn__mark').textContent = '✔';
                }
              });
              if (!correct) {
                this.classList.add('answer-btn--wrong');
                this.querySelector('.answer-btn__mark').textContent = '✘';
              }
              showFeedbackMatch(correct, opt, correctName);
            }
          }, [
            el('span', { class: 'answer-btn__mark', 'aria-hidden': 'true' }),
            el('span', { class: 'answer-btn__label', text: opt })
          ]);
        }));
      }

      /* ---------- משוב ---------- */
      function nextButton() {
        var b = el('button', {
          type: 'button', class: 'btn btn--unit-1 btn--lg',
          onclick: function () {
            if (isLast) { state.step = 'result'; } else { state.qIndex += 1; }
            render();
          }
        }, [
          document.createTextNode((isLast ? 'לסיכום הפעילות ' : 'לשאלה הבאה ')),
          el('span', { 'aria-hidden': 'true', text: '←' })
        ]);
        return b;
      }

      function renderFeedbackBox(correct, title, bodyNodes) {
        var btn = nextButton();
        UI.clear(feedback);
        feedback.appendChild(el('div', { class: 'feedback feedback--' + (correct ? 'ok' : 'no') }, [
          el('div', { class: 'feedback__head' }, [
            el('span', { class: 'feedback__icon', 'aria-hidden': 'true', text: correct ? '✔' : '✘' }),
            el('h3', { class: 'feedback__title', text: title })
          ])
        ].concat(bodyNodes).concat([
          el('div', { class: 'btn-row btn-row--center' }, [btn])
        ])));
        btn.focus();
      }

      function showFeedback(correct, picked, label) {
        var want = act.parts[q.target];
        var got = act.parts[picked];

        var body = [ el('p', { class: 'feedback__why' }, [
          document.createTextNode('לחצתם על '),
          el('strong', { text: got.name }),
          document.createTextNode(' — ' + got.desc)
        ]) ];

        if (!correct) {
          body.push(el('p', { class: 'feedback__note' }, [
            el('strong', { text: 'התבקשתם ללחוץ על ' + want.name + ': ' }),
            document.createTextNode(want.desc)
          ]));
        }

        renderFeedbackBox(correct,
          (correct ? 'נכון — ' : 'לא זה החלק — ') + got.name, body);
      }

      function showFeedbackMatch(correct, picked, correctName) {
        var want = act.parts[q.target];
        var body = [ el('p', { class: 'feedback__why' }, [
          document.createTextNode('החלק המסומן הוא '),
          el('strong', { text: want.name }),
          document.createTextNode(' — ' + want.desc)
        ]) ];

        if (!correct) {
          body.push(el('p', { class: 'feedback__note' }, [
            el('strong', { text: 'בחרתם ' + picked + '. ' }),
            document.createTextNode('שימו לב להבדל: ' + want.name + ' הוא החלק שמסומן כאן באיור.')
          ]));
        }

        renderFeedbackBox(correct,
          (correct ? 'נכון — ' : 'לא מדויק — ') + correctName, body);
      }

      /* ---------- הרכבה ---------- */
      if (q.type === 'click') buildClickQuestion(); else buildMatchQuestion();

      var blocks = [
        el('div', { class: 'quiz-head' }, [
          el('div', { class: 'quiz-head__count' }, [
            document.createTextNode('שאלה '),
            UI.num(state.qIndex + 1),
            document.createTextNode(' מתוך '),
            UI.num(act.questions.length)
          ]),
          el('div', {
            class: 'quiz-dots', role: 'img',
            'aria-label': 'ענית על ' + state.answers.filter(Boolean).length +
                          ' שאלות מתוך ' + act.questions.length
          }, act.questions.map(function (_, i) {
            var a = state.answers[i];
            return el('span', { class: 'quiz-dot' + (i === state.qIndex ? ' quiz-dot--current' : '') +
              (a ? (a.correct ? ' quiz-dot--ok' : ' quiz-dot--no') : '') });
          }))
        ]),
        el('div', { class: 'panel quiz-card' }, [
          el('h2', { class: 'quiz-question', text: q.prompt }),
          q.type === 'click'
            ? el('p', { class: 'quiz-sub', text: 'אפשר ללחוץ על האיור, או לנווט בו עם מקש Tab ולבחור באמצעות Enter.' })
            : null
        ]),
        stage
      ];

      if (optionsRow) blocks.push(optionsRow);
      blocks.push(feedback);

      UI.clear(mount);
      mount.appendChild(el('div', { class: 'stack' }, blocks));
    }

    /* ============================================================
       מסך 4 — סיכום
       ============================================================ */
    function renderResult() {
      var score = state.answers.filter(function (a) { return a && a.correct; }).length;
      var max = act.questions.length;
      var conf = act.result;

      var rec = Store.recordAttempt(act.id, score, max);
      var message = score >= max - 1 ? conf.high : (score >= conf.reviewThreshold ? conf.mid : conf.low);

      var missed = act.questions.filter(function (_, i) {
        return state.answers[i] && !state.answers[i].correct;
      }).map(function (q) { return act.parts[q.target]; });

      var uniqueMissed = [];
      missed.forEach(function (p) {
        if (uniqueMissed.indexOf(p) === -1) uniqueMissed.push(p);
      });

      var blocks = [
        el('div', { class: 'panel result-card' }, [
          el('div', { class: 'result-score' }, [
            UI.num(score), document.createTextNode(' מתוך '), UI.num(max)
          ]),
          el('p', { class: 'result-message', text: message })
        ])
      ];

      if (uniqueMissed.length) {
        blocks.push(el('div', { class: 'panel' }, [
          el('h3', { text: 'כדאי לחזור על' }),
          el('ul', { class: 'concept-list concept-list--review' }, uniqueMissed.map(function (p) {
            return el('li', {}, [
              el('span', { class: 'concept-list__tick', 'aria-hidden': 'true', text: '●' }),
              el('strong', { text: p.name + ': ' }),
              document.createTextNode(p.desc)
            ]);
          }))
        ]));
      }

      if (score < conf.reviewThreshold) {
        blocks.push(el('div', { class: 'notice notice--warn' }, [
          el('span', { class: 'notice__icon', 'aria-hidden': 'true', text: '📘' }),
          el('p', { text: conf.reviewText })
        ]));
      }

      if (rec.attempts > 1) {
        blocks.push(el('p', { class: 'result-best' }, [
          document.createTextNode('ניסיון מספר '),
          UI.num(rec.attempts),
          document.createTextNode('. התוצאה הטובה ביותר שלכם: '),
          UI.num(rec.best + ' מתוך ' + rec.max)
        ]));
      }

      blocks.push(el('div', { class: 'btn-row btn-row--center' }, [
        el('button', {
          type: 'button', class: 'btn btn--unit-1 btn--lg',
          onclick: function () { state.step = 'quiz'; state.qIndex = 0; state.answers = []; render(); }
        }, [ document.createTextNode('נסו שוב') ]),
        el('button', {
          type: 'button', class: 'btn btn--ghost btn--lg',
          onclick: function () { state.step = 'tour'; state.tourIndex = 0; render(); }
        }, [ document.createTextNode('חזרה להסבר') ]),
        el('a', { class: 'btn btn--ghost btn--lg', href: '#/unit/' + unit.id },
          [ document.createTextNode('חזרה ליחידה') ])
      ]));

      UI.clear(mount);
      mount.appendChild(el('div', { class: 'stack' }, blocks));
      UI.announce('סיימתם את הפעילות. התוצאה: ' + score + ' מתוך ' + max);
    }

    /* ============================================================ */
    function render() {
      if (state.step === 'explore') renderExplore();
      else if (state.step === 'tour') renderTour();
      else if (state.step === 'quiz') renderQuestion();
      else renderResult();
      UI.scrollTop();
    }

    render();
  };

})(window);
