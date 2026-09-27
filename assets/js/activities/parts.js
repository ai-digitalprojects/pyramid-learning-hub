/* ============================================================
   activities/parts.js — פעילות 1.1: מהי פירמידה?
   ------------------------------------------------------------
   חקירה חופשית → סיור מודרך על ששת החלקים → שמונה שאלות → סיכום.
   האיור נבנה ממנוע הגאומטריה המשותף (App.SolidView), ולכן
   הוא תמיד תואם לפריסה, לקיפול ולספירות שביתר האתר.
   ============================================================ */
(function (global) {
  'use strict';

  var App = global.App = global.App || {};
  App.activities = App.activities || {};

  App.activities['1.1'] = function (mount, act, unit) {
    var UI = App.UI, Kit = App.Kit, SV = App.SolidView, G = App.Geometry, el = UI.el;

    var BODY = G.pyramid(4, { radius: 1, height: 1.5 });
    var state = { step: 'explore', view: 'front', tourIndex: 0, qIndex: 0, answers: [], picked: null };

    function diagram(o) {
      o = o || {};
      return SV.create({
        geometry: BODY,
        view: o.view || state.view,
        size: 240,
        interactive: !!o.onPick,
        highlight: o.highlight,
        onPick: o.onPick
      });
    }

    /* ---------- בורר זווית המבט ---------- */
    function viewSwitcher(onChange) {
      return el('div', { class: 'view-switch', role: 'group', 'aria-label': 'בחירת זווית מבט' },
        SV.viewOrder.map(function (key) {
          var active = state.view === key;
          return el('button', {
            type: 'button',
            class: 'view-btn' + (active ? ' view-btn--active' : ''),
            'aria-pressed': active ? 'true' : 'false',
            onclick: function () { if (state.view !== key) { state.view = key; onChange(); } }
          }, [document.createTextNode(SV.VIEWS[key].label)]);
        }));
    }

    /* ============================================================
       מסך 1 — חקירה חופשית
       ============================================================ */
    function renderExplore() {
      var readout = el('div', { class: 'part-readout', 'aria-live': 'polite' });
      var stage = el('div', { class: 'diagram-stage' });

      function showPart(part) {
        UI.clear(readout);
        if (!part) {
          readout.appendChild(el('p', { class: 'part-readout__empty',
            text: 'לחצו על חלק כלשהו באיור, ונגלה יחד איך הוא נקרא.' }));
          return;
        }
        var info = act.parts[part];
        readout.appendChild(el('div', { class: 'part-readout__card' }, [
          el('h3', { class: 'part-readout__name', text: info.name }),
          el('p', { text: info.desc })
        ]));
      }

      function draw(focusSel) {
        UI.clear(stage);
        var svg = diagram({
          highlight: state.picked ? { part: state.picked.part, index: state.picked.index } : null,
          onPick: function (part, index) {
            state.picked = { part: part, index: index };
            showPart(part);
            draw('[data-part="' + part + '"]' +
              (index === undefined || index === null ? '' : '[data-index="' + index + '"]'));
          }
        });
        stage.appendChild(svg);
        if (focusSel) {
          var t = stage.querySelector('.pp-hit' + focusSel);
          if (t && t.focus) t.focus();
        }
      }

      draw(null);
      showPart(state.picked ? state.picked.part : null);

      UI.clear(mount);
      mount.appendChild(el('div', { class: 'stack' }, [
        el('div', { class: 'panel' }, [
          el('p', { class: 'activity-intro__text', text: act.lead })
        ]),
        viewSwitcher(function () { render(); }),
        el('p', { class: 'view-hint', text: SV.VIEWS[state.view].hint }),
        stage,
        readout,
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
      var s = act.tour[state.tourIndex];
      var isLast = state.tourIndex === act.tour.length - 1;
      state.view = s.view;

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

      var prevBtn = state.tourIndex > 0 ? el('button', {
        type: 'button', class: 'btn btn--ghost btn--lg',
        onclick: function () { state.tourIndex -= 1; render(); }
      }, [
        el('span', { 'aria-hidden': 'true', text: '→' }),
        document.createTextNode(' הקודם')
      ]) : null;

      UI.clear(mount);
      mount.appendChild(el('div', { class: 'stack' }, [
        el('div', { class: 'quiz-head' }, [
          el('div', { class: 'quiz-head__count' }, [
            document.createTextNode('שלב '), UI.num(state.tourIndex + 1),
            document.createTextNode(' מתוך '), UI.num(act.tour.length)
          ]),
          el('div', { class: 'quiz-dots', 'aria-hidden': 'true' }, act.tour.map(function (_, i) {
            return el('span', { class: 'quiz-dot' + (i <= state.tourIndex ? ' quiz-dot--ok' : '') +
              (i === state.tourIndex ? ' quiz-dot--current' : '') });
          }))
        ]),
        el('div', { class: 'diagram-stage' }, [
          diagram({ view: s.view, highlight: { part: s.part, index: s.index } })
        ]),
        el('div', { class: 'panel tour-card' }, [
          el('h3', { text: s.title }),
          el('p', { class: 'tour-card__text', text: s.text })
        ]),
        el('div', { class: 'btn-row btn-row--center' }, [prevBtn, nextBtn])
      ]));

      UI.announce(s.title + '. ' + s.text);
    }

    /* ============================================================
       מסך 3 — תרגול
       ============================================================ */
    function renderQuestion() {
      var q = act.questions[state.qIndex];
      var isLast = state.qIndex === act.questions.length - 1;
      var solved = false;
      state.view = q.view;

      var feedback = el('div', { class: 'feedback-slot', 'aria-live': 'polite' });
      var stage = el('div', { class: 'diagram-stage' });
      var optionsRow = null;
      var svg = null;

      function record(correct) {
        if (!state.answers[state.qIndex]) {
          state.answers[state.qIndex] = { correct: correct, attempts: 1 };
        } else {
          state.answers[state.qIndex].attempts += 1;
        }
      }

      function nextButton() {
        return el('button', {
          type: 'button', class: 'btn btn--unit-1 btn--lg',
          onclick: function () {
            if (isLast) { state.step = 'result'; } else { state.qIndex += 1; }
            render();
          }
        }, [
          document.createTextNode(isLast ? 'לסיכום הפעילות ' : 'לשאלה הבאה '),
          el('span', { 'aria-hidden': 'true', text: '←' })
        ]);
      }

      function box(correct, title, body, retryText) {
        var tail = correct
          ? [el('div', { class: 'btn-row btn-row--center' }, [nextButton()])]
          : [el('p', { class: 'feedback__retry', text: retryText || act.retryHint })];
        UI.clear(feedback);
        feedback.appendChild(el('div', { class: 'feedback feedback--' + (correct ? 'ok' : 'no') }, [
          el('div', { class: 'feedback__head' }, [
            el('span', { class: 'feedback__icon', 'aria-hidden': 'true', text: correct ? '✔' : '✘' }),
            el('h3', { class: 'feedback__title', text: title })
          ])
        ].concat(body).concat(tail)));
        if (correct) { var b = feedback.querySelector('.btn'); if (b) b.focus(); }
      }

      function para(t) { return el('p', { class: 'feedback__why', text: t }); }

      /* ---- שאלת לחיצה על האיור ---- */
      function buildClick() {
        svg = diagram({
          onPick: function (part, index) {
            if (solved) return;
            var correct = part === q.target;
            record(correct);
            SV.highlight(svg, part, index);

            var got = act.parts[part], want = act.parts[q.target];
            if (correct) {
              solved = true;
              SV.lock(svg);
              box(true, 'נכון: ' + got.name, [
                el('p', { class: 'feedback__why' }, [
                  document.createTextNode('לחצתם על '),
                  el('strong', { text: got.name }),
                  document.createTextNode(': ' + got.desc)
                ])
              ]);
              UI.announce('נכון. ' + got.name);
            } else {
              box(false, 'לא זה החלק: ' + got.name, [
                el('p', { class: 'feedback__why' }, [
                  document.createTextNode('לחצתם על '),
                  el('strong', { text: got.name }),
                  document.createTextNode(': ' + got.desc)
                ]),
                el('p', { class: 'feedback__note' }, [
                  el('strong', { text: 'התבקשתם ללחוץ על ' + want.name + ': ' }),
                  document.createTextNode(want.desc)
                ])
              ]);
              UI.announce('לא זה החלק. ' + act.retryHint);
            }
          }
        });
        stage.appendChild(svg);
      }

      /* ---- שאלת התאמת שם לחלק מסומן ---- */
      function buildMatch() {
        stage.appendChild(diagram({ highlight: { part: q.target, index: q.index } }));
        var want = act.parts[q.target];

        optionsRow = el('div', { class: 'option-grid' }, q.options.map(function (opt) {
          return el('button', {
            type: 'button', class: 'answer-btn answer-btn--sm',
            onclick: function () {
              if (solved) return;
              var correct = opt === want.name;
              record(correct);
              if (correct) {
                solved = true;
                [].forEach.call(optionsRow.children, function (b) {
                  b.disabled = true; b.setAttribute('aria-disabled', 'true');
                });
                this.classList.add('answer-btn--correct');
                this.querySelector('.answer-btn__mark').textContent = '✔';
                box(true, 'נכון: ' + want.name, [
                  el('p', { class: 'feedback__why' }, [
                    document.createTextNode('החלק המסומן הוא '),
                    el('strong', { text: want.name }),
                    document.createTextNode(': ' + want.desc)
                  ])
                ]);
              } else {
                this.disabled = true; this.setAttribute('aria-disabled', 'true');
                this.classList.add('answer-btn--wrong');
                this.querySelector('.answer-btn__mark').textContent = '✘';
                box(false, 'לא מדויק: ' + opt, [
                  para('זה אינו החלק המסומן באיור. הסתכלו שוב על הסימון ובחרו אפשרות אחרת.')
                ], 'נסו שוב. בחרו אפשרות אחרת.');
              }
            }
          }, [
            el('span', { class: 'answer-btn__mark', 'aria-hidden': 'true' }),
            el('span', { class: 'answer-btn__label', text: opt })
          ]);
        }));
      }

      if (q.type === 'click') buildClick(); else buildMatch();

      var pct = Math.round((state.qIndex / act.questions.length) * 100);
      var blocks = [
        el('div', { class: 'quiz-progress' }, [
          el('div', { class: 'quiz-head' }, [
            el('div', { class: 'quiz-head__count' }, [
              document.createTextNode('שאלה '), UI.num(state.qIndex + 1),
              document.createTextNode(' מתוך '), UI.num(act.questions.length)
            ]),
            el('div', { class: 'quiz-dots', role: 'img',
              'aria-label': 'נפתרו ' + state.answers.filter(Boolean).length +
                            ' שאלות מתוך ' + act.questions.length
            }, act.questions.map(function (_, i) {
              var a = state.answers[i];
              return el('span', { class: 'quiz-dot' + (i === state.qIndex ? ' quiz-dot--current' : '') +
                (a ? (a.correct ? ' quiz-dot--ok' : ' quiz-dot--no') : '') });
            }))
          ]),
          el('div', { class: 'progress__track', role: 'progressbar',
            'aria-valuenow': pct, 'aria-valuemin': '0', 'aria-valuemax': '100',
            'aria-label': 'התקדמות בפעילות' }, [
            el('div', { class: 'progress__fill progress__fill--unit-1', style: 'inline-size:' + pct + '%' })
          ])
        ]),
        el('div', { class: 'panel quiz-card' }, [
          el('h2', { class: 'quiz-question', text: q.prompt }),
          q.type === 'click' ? el('p', { class: 'quiz-sub', text: act.clickHint }) : null,
          q.type === 'click' ? el('p', { class: 'sr-only', text: act.keyboardHint }) : null
        ]),
        stage
      ];
      if (optionsRow) blocks.push(optionsRow);
      blocks.push(feedback);

      if (state.qIndex > 0) {
        blocks.push(el('div', { class: 'btn-row' }, [
          el('button', { type: 'button', class: 'btn btn--ghost',
            onclick: function () { state.qIndex -= 1; render(); } }, [
            el('span', { 'aria-hidden': 'true', text: '→' }),
            document.createTextNode(' לשאלה הקודמת')
          ])
        ]));
      }

      UI.clear(mount);
      mount.appendChild(el('div', { class: 'stack' }, blocks));
    }

    /* ============================================================
       מסך 4 — סיכום
       ============================================================ */
    function renderResult() {
      var score = state.answers.filter(function (a) { return a && a.correct; }).length;
      Kit.resultScreen({
        mount: mount, act: act, unit: unit,
        score: score, max: act.questions.length,
        result: act.result,
        concepts: act.questions.map(function (q, i) {
          return {
            concept: act.parts[q.target] ? act.parts[q.target].name : null,
            correct: state.answers[i] && state.answers[i].correct
          };
        }),
        onRetry: function () {
          state.step = 'quiz'; state.qIndex = 0; state.answers = []; render();
        }
      });
    }

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
