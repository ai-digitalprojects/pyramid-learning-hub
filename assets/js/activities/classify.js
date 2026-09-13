/* ============================================================
   activities/classify.js — פעילות 1.2: פירמידה או לא פירמידה?
   ------------------------------------------------------------
   מבנה: מסך הסבר → שמונה שאלות מנוקדות → מסך סיכום.
   אין Three.js; כל האיורים הם SVG סטטי מ-shapes.js.
   ============================================================ */
(function (global) {
  'use strict';

  var App = global.App = global.App || {};
  App.activities = App.activities || {};

  App.activities['1.2'] = function (mount, act, unit) {
    var UI = App.UI, Store = App.Store, el = UI.el;
    var S = global.PyramidData.strings;

    var items = act.items;
    var state = { step: 'intro', index: 0, answers: [] };

    /* ============================================================
       מסך ההסבר
       ============================================================ */
    function renderIntro() {
      var fig = App.Shapes.build(act.intro.shape, act.intro.shapeAlt);

      UI.clear(mount);
      mount.appendChild(el('div', { class: 'stack' }, [
        el('div', { class: 'panel activity-intro' }, [
          el('h2', { text: 'מה זו פירמידה?' }),
          el('p', { class: 'activity-intro__text', text: act.intro.text }),
          el('figure', { class: 'shape-figure' }, [
            fig,
            el('figcaption', { class: 'sr-only', text: act.intro.shapeAlt })
          ])
        ]),
        el('div', { class: 'btn-row btn-row--center' }, [
          el('button', {
            type: 'button', class: 'btn btn--unit-1 btn--lg',
            onclick: function () { state.step = 'quiz'; state.index = 0; state.answers = []; render(); }
          }, [
            document.createTextNode(act.intro.startLabel + ' '),
            el('span', { 'aria-hidden': 'true', text: '←' })
          ])
        ])
      ]));
    }

    /* ============================================================
       מסך שאלה
       ============================================================ */
    function renderQuestion() {
      var item = items[state.index];
      var answered = state.answers[state.index];
      var qNum = state.index + 1;
      var isLast = state.index === items.length - 1;

      var fig = App.Shapes.build(item.shape, item.alt);

      /* --- התקדמות בתוך הפעילות --- */
      var head = el('div', { class: 'quiz-head' }, [
        el('div', { class: 'quiz-head__count' }, [
          document.createTextNode('שאלה '),
          UI.num(qNum),
          document.createTextNode(' מתוך '),
          UI.num(items.length)
        ]),
        el('div', {
          class: 'quiz-dots', role: 'img',
          'aria-label': 'ענית על ' + state.answers.filter(Boolean).length + ' שאלות מתוך ' + items.length
        }, items.map(function (_, i) {
          var a = state.answers[i];
          var cls = 'quiz-dot';
          if (i === state.index) cls += ' quiz-dot--current';
          if (a) cls += a.correct ? ' quiz-dot--ok' : ' quiz-dot--no';
          return el('span', { class: cls, 'aria-hidden': 'true' });
        }))
      ]);

      /* --- שאלה --- */
      var question = el('div', { class: 'panel quiz-card' }, [
        el('h2', { class: 'quiz-question', text: 'האם הגוף הזה הוא פירמידה?' }),
        el('figure', { class: 'shape-figure' }, [
          fig,
          el('figcaption', { class: 'sr-only', text: item.alt })
        ])
      ]);

      /* --- כפתורי תשובה --- */
      var btnYes, btnNo;

      function answerButton(label, value) {
        return el('button', {
          type: 'button',
          class: 'answer-btn',
          'data-value': value ? 'yes' : 'no',
          onclick: function () { choose(value); }
        }, [
          el('span', { class: 'answer-btn__mark', 'aria-hidden': 'true' }),
          el('span', { class: 'answer-btn__label', text: label })
        ]);
      }

      btnYes = answerButton('פירמידה', true);
      btnNo  = answerButton('לא פירמידה', false);

      var answers = el('div', { class: 'answer-grid' }, [btnYes, btnNo]);

      /* --- אזור משוב --- */
      var feedback = el('div', { class: 'feedback-slot', 'aria-live': 'polite' });

      /* --- תזכורת מתקפלת --- */
      var reminder = el('details', { class: 'reminder' }, [
        el('summary', { text: 'תזכורת: מה זו פירמידה?' }),
        el('p', { text: act.reminder })
      ]);

      UI.clear(mount);
      mount.appendChild(el('div', { class: 'stack' }, [head, question, answers, feedback, reminder]));

      /* --- בחירת תשובה --- */
      function choose(value) {
        if (state.answers[state.index]) return;      // נעילה: אין שינוי תשובה

        var correct = value === item.answer;
        state.answers[state.index] = { value: value, correct: correct };

        [btnYes, btnNo].forEach(function (b) {
          b.disabled = true;
          b.setAttribute('aria-disabled', 'true');
        });

        var chosen = value ? btnYes : btnNo;
        var right  = item.answer ? btnYes : btnNo;

        chosen.classList.add(correct ? 'answer-btn--correct' : 'answer-btn--wrong');
        chosen.querySelector('.answer-btn__mark').textContent = correct ? '✔' : '✘';
        if (!correct) {
          right.classList.add('answer-btn--is-answer');
          right.querySelector('.answer-btn__mark').textContent = '✔';
        }

        renderFeedback(correct);
      }

      function renderFeedback(correct) {
        var nextLabel = isLast ? 'לסיכום הפעילות' : 'לשאלה הבאה';

        var nextBtn = el('button', {
          type: 'button', class: 'btn btn--unit-1 btn--lg',
          onclick: function () {
            if (isLast) { state.step = 'result'; }
            else { state.index += 1; }
            render();
          }
        }, [
          document.createTextNode(nextLabel + ' '),
          el('span', { 'aria-hidden': 'true', text: '←' })
        ]);

        UI.clear(feedback);
        feedback.appendChild(
          el('div', { class: 'feedback feedback--' + (correct ? 'ok' : 'no') }, [
            el('div', { class: 'feedback__head' }, [
              el('span', { class: 'feedback__icon', 'aria-hidden': 'true', text: correct ? '✔' : '✘' }),
              el('h3', { class: 'feedback__title',
                text: (correct ? 'תשובה נכונה — ' : 'לא מדויק — ') + item.name })
            ]),
            el('p', { class: 'feedback__why', text: item.why }),
            el('p', { class: 'feedback__note' }, [
              el('strong', { text: 'שימו לב: ' }),
              document.createTextNode(item.note)
            ]),
            el('div', { class: 'btn-row btn-row--center' }, [nextBtn])
          ])
        );

        // מיקוד עובר לכפתור ההמשך — ניווט מקלדת רציף
        nextBtn.focus();
      }

      // חזרה לשאלה שכבר נענתה (למשל בניווט אחורה) — שחזור המצב
      if (answered) { choose(answered.value); }
    }

    /* ============================================================
       מסך סיכום
       ============================================================ */
    function renderResult() {
      var score = state.answers.filter(function (a) { return a && a.correct; }).length;
      var max = items.length;
      var conf = act.result;

      var rec = Store.recordAttempt(act.id, score, max);

      var message = score >= max - 1 ? conf.high : (score >= conf.reviewThreshold ? conf.mid : conf.low);

      var understood = items.filter(function (_, i) {
        return state.answers[i] && state.answers[i].correct;
      }).map(function (it) { return it.concept; });
      var uniqueUnderstood = understood.filter(function (c, i) { return understood.indexOf(c) === i; });

      var missed = items.filter(function (_, i) {
        return state.answers[i] && !state.answers[i].correct;
      });

      var blocks = [];

      /* --- ציון --- */
      blocks.push(el('div', { class: 'panel result-card' }, [
        el('div', { class: 'result-score' }, [
          UI.num(score),
          document.createTextNode(' מתוך '),
          UI.num(max)
        ]),
        el('p', { class: 'result-message', text: message })
      ]));

      /* --- מה הבנתם --- */
      if (uniqueUnderstood.length) {
        blocks.push(el('div', { class: 'panel' }, [
          el('h3', { text: 'מה שהבנתם' }),
          el('ul', { class: 'concept-list' }, uniqueUnderstood.map(function (c) {
            return el('li', {}, [
              el('span', { class: 'concept-list__tick', 'aria-hidden': 'true', text: '✔' }),
              document.createTextNode(c)
            ]);
          }))
        ]));
      }

      /* --- מה כדאי לחזור עליו --- */
      if (missed.length) {
        blocks.push(el('div', { class: 'panel' }, [
          el('h3', { text: 'כדאי לחזור על' }),
          el('ul', { class: 'concept-list concept-list--review' }, missed.map(function (it) {
            return el('li', {}, [
              el('span', { class: 'concept-list__tick', 'aria-hidden': 'true', text: '●' }),
              el('strong', { text: it.name + ': ' }),
              document.createTextNode(it.note)
            ]);
          }))
        ]));
      }

      /* --- המלצת חזרה --- */
      if (score < conf.reviewThreshold) {
        blocks.push(el('div', { class: 'notice notice--warn' }, [
          el('span', { class: 'notice__icon', 'aria-hidden': 'true', text: '📘' }),
          el('p', { text: conf.reviewText })
        ]));
      }

      /* --- שיא אישי --- */
      if (rec.attempts > 1) {
        blocks.push(el('p', { class: 'result-best' }, [
          document.createTextNode('ניסיון מספר '),
          UI.num(rec.attempts),
          document.createTextNode('. התוצאה הטובה ביותר שלכם: '),
          UI.num(rec.best + ' מתוך ' + rec.max)
        ]));
      }

      /* --- פעולות --- */
      blocks.push(el('div', { class: 'btn-row btn-row--center' }, [
        el('button', {
          type: 'button', class: 'btn btn--unit-1 btn--lg',
          onclick: function () { state.step = 'quiz'; state.index = 0; state.answers = []; render(); }
        }, [ document.createTextNode('נסו שוב') ]),
        el('a', { class: 'btn btn--ghost btn--lg', href: '#/unit/' + unit.id },
          [ document.createTextNode('חזרה ליחידה') ])
      ]));

      UI.clear(mount);
      mount.appendChild(el('div', { class: 'stack' }, blocks));

      UI.announce('סיימתם את הפעילות. התוצאה: ' + score + ' מתוך ' + max);
    }

    /* ============================================================
       ניתוב פנימי
       ============================================================ */
    function render() {
      if (state.step === 'intro') renderIntro();
      else if (state.step === 'quiz') renderQuestion();
      else renderResult();
      UI.scrollTop();
    }

    render();
  };

})(window);
