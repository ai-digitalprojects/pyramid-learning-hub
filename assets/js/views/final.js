/* ============================================================
   views/final.js — מבחן סיום, סקירה ותעודה
   ------------------------------------------------------------
   12 שאלות · עוברים עם 9 · תשובה אחת לכל שאלה בניסיון.
   אחרי הסקירה אפשר לגשת שוב.
   שם התלמיד/ה נשאל רק במסך התעודה ואינו נשמר באחסון המקומי.
   ============================================================ */
(function (global) {
  'use strict';

  var App = global.App = global.App || {};
  App.views = App.views || {};

  App.views.final = function (mount) {
    var UI = App.UI, Kit = App.Kit, Store = App.Store, el = UI.el;
    var D = global.PyramidData, S = D.strings, EX = D.finalExam;

    var state = { step: 'intro', i: 0, answers: [], order: null };

    /* סדר השאלות משתנה בין ניסיונות, כדי שמבחן חוזר
       יהיה בדיקה אמיתית ולא זיכרון של הסדר. */
    function makeOrder() {
      var idx = EX.questions.map(function (_, k) { return k; });
      for (var i = idx.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = idx[i]; idx[i] = idx[j]; idx[j] = t;
      }
      return idx;
    }

    function q(i) { return EX.questions[state.order[i]]; }

    /* ============================================================
       מסך פתיחה
       ============================================================ */
    function renderIntro() {
      var data = Store.all().final;
      var blocks = [
        el('div', { class: 'unit-banner', style: 'background:var(--gold-wash);border-inline-start:6px solid var(--gold)' }, [
          el('div', { class: 'unit-banner__icon', 'aria-hidden': 'true', text: EX.icon }),
          el('div', { class: 'unit-banner__body' }, [
            el('h1', { text: EX.title }),
            el('p', { text: EX.desc })
          ])
        ]),
        el('div', { class: 'panel' }, [
          el('h3', { text: 'איך המבחן עובד' }),
          el('ul', {}, EX.rules.map(function (r) { return el('li', { text: r }); }))
        ])
      ];

      if (data.attempts > 0) {
        blocks.push(el('p', { class: 'result-best' }, [
          document.createTextNode('ניגשתם כבר '), UI.num(data.attempts),
          document.createTextNode(' פעמים. התוצאה הטובה ביותר: '),
          UI.num(data.best.score + ' מתוך ' + data.best.max)
        ]));
      }

      var readiness = unitReadiness();
      if (!readiness.ready) {
        blocks.push(el('div', { class: 'notice' }, [
          el('span', { class: 'notice__icon', 'aria-hidden': 'true', text: 'ℹ️' }),
          el('p', { text: 'עוד לא סיימתם את כל הפעילויות (' + readiness.done +
            ' מתוך ' + readiness.total + '). אפשר לגשת למבחן בכל מקרה, אבל כדאי קודם להשלים אותן.' })
        ]));
      }

      blocks.push(el('div', { class: 'btn-row btn-row--center' }, [
        el('button', {
          type: 'button', class: 'btn btn--gold btn--lg',
          onclick: function () {
            state.order = makeOrder(); state.i = 0; state.answers = [];
            state.step = 'exam'; render();
          }
        }, [
          document.createTextNode((data.attempts > 0 ? EX.messages.retake : 'מתחילים את המבחן') + ' '),
          el('span', { 'aria-hidden': 'true', text: '←' })
        ]),
        el('a', { class: 'btn btn--ghost btn--lg', href: '#/' },
          [document.createTextNode(EX.messages.backHome)])
      ]));

      if (Store.all().badge.earned) {
        blocks.push(el('div', { class: 'btn-row btn-row--center' }, [
          el('button', {
            type: 'button', class: 'btn btn--ghost btn--lg',
            onclick: function () { state.step = 'certificate'; render(); }
          }, [document.createTextNode(EX.messages.toCertificate)])
        ]));
      }

      UI.clear(mount);
      mount.appendChild(el('div', { class: 'page stack' }, blocks));
    }

    function unitReadiness() {
      var all = D.unit1.activities.concat(D.unit2.activities);
      return { done: Store.countDone(all), total: all.length,
               ready: Store.countDone(all) === all.length };
    }

    /* ============================================================
       מסך שאלה — תשובה אחת, בלי משוב מיידי
       ============================================================ */
    function renderQuestion() {
      var item = q(state.i);
      var isLast = state.i === EX.questions.length - 1;
      var pct = Math.round((state.i / EX.questions.length) * 100);
      var chosen = null;

      var optionsRow = el('div', { class: item.wide ? 'option-grid option-grid--wide' : 'option-grid' },
        item.options.map(function (opt) {
          return el('button', {
            type: 'button', class: 'answer-btn answer-btn--sm', 'data-id': opt.id,
            onclick: function () {
              chosen = opt.id;
              [].forEach.call(optionsRow.children, function (b) {
                b.classList.remove('answer-btn--chosen');
                b.setAttribute('aria-pressed', 'false');
              });
              this.classList.add('answer-btn--chosen');
              this.setAttribute('aria-pressed', 'true');
              submitBtn.disabled = false;
              UI.announce('נבחר: ' + opt.text);
            }
          }, [
            el('span', { class: 'answer-btn__mark', 'aria-hidden': 'true' }),
            el('span', { class: 'answer-btn__label', text: opt.text })
          ]);
        }));

      var submitBtn = el('button', {
        type: 'button', class: 'btn btn--gold btn--lg', disabled: true,
        onclick: function () {
          if (!chosen) return;
          state.answers[state.i] = { picked: chosen, correct: chosen === item.answer };
          if (isLast) { state.step = 'review'; } else { state.i += 1; }
          render();
        }
      }, [
        document.createTextNode(isLast ? 'סיום המבחן ' : 'לשאלה הבאה '),
        el('span', { 'aria-hidden': 'true', text: '←' })
      ]);

      var blocks = [
        el('div', { class: 'quiz-progress' }, [
          el('div', { class: 'quiz-head' }, [
            el('div', { class: 'quiz-head__count' }, [
              document.createTextNode('שאלה '), UI.num(state.i + 1),
              document.createTextNode(' מתוך '), UI.num(EX.questions.length)
            ]),
            el('div', { class: 'quiz-dots', role: 'img',
              'aria-label': 'ענית על ' + state.answers.filter(Boolean).length +
                            ' שאלות מתוך ' + EX.questions.length
            }, EX.questions.map(function (_, k) {
              return el('span', { class: 'quiz-dot' + (k === state.i ? ' quiz-dot--current' : '') +
                (state.answers[k] ? ' quiz-dot--ok' : '') });
            }))
          ]),
          el('div', { class: 'progress__track', role: 'progressbar',
            'aria-valuenow': pct, 'aria-valuemin': '0', 'aria-valuemax': '100',
            'aria-label': 'התקדמות במבחן' }, [
            el('div', { class: 'progress__fill', style: 'inline-size:' + pct + '%' })
          ])
        ]),
        el('div', { class: 'panel quiz-card' }, [
          el('h2', { class: 'quiz-question', text: item.prompt }),
          el('p', { class: 'quiz-sub', text: 'בחרו תשובה ואז לחצו על הכפתור. במבחן אין ניסיון שני.' })
        ])
      ];

      if (item.figure) {
        blocks.push(el('div', { class: 'diagram-stage' }, [Kit.buildFigure(item.figure)]));
      }
      blocks.push(optionsRow);
      blocks.push(el('div', { class: 'btn-row btn-row--center' }, [submitBtn]));

      UI.clear(mount);
      mount.appendChild(el('div', { class: 'page stack' }, blocks));
      UI.scrollTop();
    }

    /* ============================================================
       מסך סקירה
       ============================================================ */
    function renderReview() {
      var score = state.answers.filter(function (a) { return a && a.correct; }).length;
      var max = EX.questions.length;
      var res = Store.recordFinal(score, max, EX.passCount);
      var passed = res.passed;

      var weakTopics = [];
      state.answers.forEach(function (a, k) {
        if (a && !a.correct) {
          var t = q(k).topic;
          if (weakTopics.indexOf(t) === -1) weakTopics.push(t);
        }
      });

      var blocks = [
        el('div', { class: 'panel result-card' }, [
          el('div', { class: 'result-score' }, [
            UI.num(score), document.createTextNode(' מתוך '), UI.num(max)
          ]),
          el('p', { class: 'result-message',
            text: passed ? EX.messages.pass : EX.messages.fail }),
          el('p', { class: 'result-best' }, [
            document.createTextNode('ציון עובר: '), UI.num(EX.passCount),
            document.createTextNode(' מתוך '), UI.num(max)
          ])
        ])
      ];

      if (weakTopics.length) {
        blocks.push(el('div', { class: 'panel' }, [
          el('h3', { text: EX.messages.topicsTitle }),
          el('ul', { class: 'concept-list concept-list--review' }, weakTopics.map(function (t) {
            return el('li', {}, [
              el('span', { class: 'concept-list__tick', 'aria-hidden': 'true', text: '●' }),
              UI.math(t)
            ]);
          }))
        ]));
      }

      /* --- סקירה מלאה של כל שאלה --- */
      var reviewList = el('div', { class: 'stack' }, state.answers.map(function (a, k) {
        var item = q(k);
        var picked = item.options.filter(function (o) { return o.id === a.picked; })[0];
        var right = item.options.filter(function (o) { return o.id === item.answer; })[0];
        return el('div', { class: 'panel review-item review-item--' + (a.correct ? 'ok' : 'no') }, [
          el('div', { class: 'feedback__head' }, [
            el('span', { class: 'feedback__icon', 'aria-hidden': 'true', text: a.correct ? '✔' : '✘' }),
            el('h3', { class: 'feedback__title' }, [
              document.createTextNode('שאלה '), UI.num(k + 1),
              document.createTextNode(' · ' + item.topic)
            ])
          ]),
          el('p', { text: item.prompt }),
          el('p', { class: 'review-answer' }, [
            el('strong', { text: 'התשובה שלכם: ' }),
            UI.math(picked ? picked.text : 'לא נבחרה תשובה')
          ]),
          a.correct ? null : el('p', { class: 'review-answer' }, [
            el('strong', { text: 'התשובה הנכונה: ' }),
            UI.math(right ? right.text : 'לא זמינה')
          ]),
          el('p', { class: 'feedback__note' }, [UI.math(item.why)])
        ]);
      }));

      blocks.push(el('div', { class: 'section-head' }, [el('h2', { text: EX.messages.reviewTitle })]));
      blocks.push(reviewList);

      var actions = [];
      if (passed) {
        actions.push(el('button', {
          type: 'button', class: 'btn btn--gold btn--lg btn--wide',
          onclick: function () { state.step = 'certificate'; render(); }
        }, [
          el('span', { class: 'btn__stack' }, [
            el('span', { class: 'btn__label', text: EX.messages.toCertificate }),
            el('span', { class: 'btn__sub', text: 'עברתם בהצלחה' })
          ]),
          el('span', { 'aria-hidden': 'true', text: '←' })
        ]));
      }
      actions.push(el('div', { class: 'btn-row btn-row--center' }, [
        el('button', {
          type: 'button', class: 'btn btn--ghost btn--lg',
          onclick: function () {
            state.order = makeOrder(); state.i = 0; state.answers = [];
            state.step = 'exam'; render();
          }
        }, [document.createTextNode(EX.messages.retake)]),
        el('a', { class: 'btn btn--ghost btn--lg', href: '#/unit/1' },
          [document.createTextNode('חזרה לפעילויות')]),
        el('a', { class: 'btn btn--ghost btn--lg', href: '#/' },
          [document.createTextNode(EX.messages.backHome)])
      ]));

      blocks.push(el('div', { class: 'result-actions' }, actions));

      UI.clear(mount);
      mount.appendChild(el('div', { class: 'page stack' }, blocks));
      UI.announce('סיימתם את המבחן. התוצאה: ' + score + ' מתוך ' + max);
      UI.scrollTop();
    }

    /* ============================================================
       תעודת סיום
       ------------------------------------------------------------
       שדה השם הוא רשות, והוא אינו נשמר באחסון המקומי (החלטה D6).
       ============================================================ */
    function renderCertificate() {
      var C = EX.certificate;
      var best = Store.all().final.best;
      var nameOut = el('p', { class: 'cert__name', text: C.anonymous });

      var nameInput = el('input', {
        type: 'text', class: 'cert__input', id: 'cert-name',
        placeholder: C.namePlaceholder, autocomplete: 'off', maxlength: '30',
        oninput: function () {
          var v = (this.value || '').trim();
          nameOut.textContent = v === '' ? C.anonymous : v;
        }
      });

      var today = new Date();
      var dateText = today.getDate() + '.' + (today.getMonth() + 1) + '.' + today.getFullYear();

      UI.clear(mount);
      mount.appendChild(el('div', { class: 'page stack' }, [
        el('div', { class: 'panel no-print' }, [
          el('label', { class: 'control-group__label', for: 'cert-name', text: C.nameLabel }),
          nameInput,
          el('p', { class: 'quiz-sub', text: C.nameNote })
        ]),
        el('div', { class: 'certificate' }, [
          el('div', { class: 'cert__badge', 'aria-hidden': 'true', text: '🏅' }),
          el('p', { class: 'cert__eyebrow', text: C.subtitle }),
          el('h1', { class: 'cert__title', text: C.title }),
          nameOut,
          el('p', { class: 'cert__body', text: C.body }),
          el('p', { class: 'cert__meta' }, [
            document.createTextNode(C.school + ' · '),
            el('bdi', { class: 'num', text: dateText })
          ]),
          best ? el('p', { class: 'cert__score' }, [
            document.createTextNode('תוצאת המבחן: '),
            UI.num(best.score + ' מתוך ' + best.max)
          ]) : null
        ]),
        el('div', { class: 'btn-row btn-row--center no-print' }, [
          el('button', {
            type: 'button', class: 'btn btn--gold btn--lg',
            onclick: function () { global.print(); }
          }, [document.createTextNode(C.printLabel)]),
          el('a', { class: 'btn btn--ghost btn--lg', href: '#/progress' },
            [document.createTextNode(S.nav.progress)]),
          el('a', { class: 'btn btn--ghost btn--lg', href: '#/' },
            [document.createTextNode(EX.messages.backHome)])
        ])
      ]));
      UI.scrollTop();
    }

    function render() {
      if (state.step === 'intro') renderIntro();
      else if (state.step === 'exam') renderQuestion();
      else if (state.step === 'review') renderReview();
      else renderCertificate();
      App.setTitle(EX.title);
      App.setNavCurrent(null);
    }

    render();
  };

})(window);
