/* ============================================================
   activities/video.js — פעילות 2.5: סרטון נפח פירמידה
   ------------------------------------------------------------
   הסרטון מוטמע בגרסת הפרטיות של יוטיוב (youtube-nocookie).
   הוא אינו יורד ואינו מאוחסן אצלנו.
   אם הרשת חוסמת אותו — יש תקציר כתוב, והפעילות ממשיכה לעבוד.
   שאלת ההבנה היא השער אל התרגול.
   ============================================================ */
(function (global) {
  'use strict';

  var App = global.App = global.App || {};
  App.activities = App.activities || {};

  App.activities['2.5'] = function (mount, act, unit) {
    var UI = App.UI, Kit = App.Kit, Store = App.Store, el = UI.el;
    var V = act.video;
    var state = { answered: false, correct: false, attempts: 0 };

    function render() {
      var feedback = el('div', { class: 'feedback-slot', 'aria-live': 'polite' });
      var gateWrap = el('div', { class: 'btn-row btn-row--center' });

      /* --- נגן --- */
      var frame = el('div', { class: 'video-frame' });
      var iframe = el('iframe', {
        src: 'https://www.youtube-nocookie.com/embed/' + V.youtubeId + '?rel=0&modestbranding=1&hl=he',
        title: V.title,
        allow: 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
        referrerpolicy: 'strict-origin-when-cross-origin',
        allowfullscreen: 'true',
        loading: 'lazy'
      });
      frame.appendChild(iframe);

      /* --- שאלת ההבנה --- */
      var options = el('div', { class: 'option-grid option-grid--wide' }, V.options.map(function (opt) {
        return el('button', {
          type: 'button', class: 'answer-btn answer-btn--sm', 'data-id': opt.id,
          onclick: function () {
            if (state.correct) return;
            state.attempts += 1;
            var isRight = opt.id === V.answer;
            if (state.attempts === 1) state.answered = isRight;

            if (isRight) {
              state.correct = true;
              [].forEach.call(options.children, function (b) {
                b.disabled = true; b.setAttribute('aria-disabled', 'true');
              });
              this.classList.add('answer-btn--correct');
              this.querySelector('.answer-btn__mark').textContent = '✔';
              showFeedback(true, V.why.correct);
              unlock();
            } else {
              this.disabled = true; this.setAttribute('aria-disabled', 'true');
              this.classList.add('answer-btn--wrong');
              this.querySelector('.answer-btn__mark').textContent = '✘';
              showFeedback(false, V.why.wrong[opt.id]);
            }
          }
        }, [
          el('span', { class: 'answer-btn__mark', 'aria-hidden': 'true' }),
          el('span', { class: 'answer-btn__label', text: opt.text })
        ]);
      }));

      function showFeedback(ok, text) {
        UI.clear(feedback);
        feedback.appendChild(el('div', { class: 'feedback feedback--' + (ok ? 'ok' : 'no') }, [
          el('div', { class: 'feedback__head' }, [
            el('span', { class: 'feedback__icon', 'aria-hidden': 'true', text: ok ? '✔' : '✘' }),
            el('h3', { class: 'feedback__title', text: ok ? 'נכון' : 'לא מדויק' })
          ]),
          el('p', { class: 'feedback__why', text: text }),
          ok ? null : el('p', { class: 'feedback__retry', text: 'נסו שוב — בחרו אפשרות אחרת.' })
        ]));
        UI.announce((ok ? 'נכון. ' : 'לא מדויק. ') + text);
      }

      function unlock() {
        // רק כאן נפתח השער אל התרגול
        Store.setFlag('videoQuestionPassed', true);
        UI.clear(gateWrap);
        var btn = el('button', {
          type: 'button', class: 'btn btn--unit-2 btn--lg btn--wide',
          onclick: function () {
            Kit.resultScreen({
              mount: mount, act: act, unit: unit,
              score: state.answered ? 1 : 0, max: 1,
              result: act.result,
              concepts: [{ concept: 'הנתונים הדרושים לחישוב נפח',
                           correct: state.answered }],
              onRetry: function () { state = { answered: false, correct: false, attempts: 0 }; render(); }
            });
          }
        }, [
          el('span', { class: 'btn__stack' }, [
            el('span', { class: 'btn__label', text: V.unlockLabel })
          ]),
          el('span', { 'aria-hidden': 'true', text: '←' })
        ]);
        gateWrap.appendChild(btn);
        btn.focus();
      }

      UI.clear(mount);
      mount.appendChild(el('div', { class: 'stack' }, [
        el('div', { class: 'panel' }, [
          el('h2', { text: V.title }),
          el('p', { class: 'activity-intro__text', text: V.before })
        ]),
        frame,
        el('div', { class: 'notice' }, [
          el('span', { class: 'notice__icon', 'aria-hidden': 'true', text: 'ℹ️' }),
          el('p', { text: V.blockedNotice })
        ]),
        el('details', { class: 'reminder' }, [
          el('summary', { text: V.summaryTitle }),
          el('p', { text: V.summary })
        ]),
        el('div', { class: 'panel quiz-card' }, [
          el('h2', { class: 'quiz-question', text: V.question })
        ]),
        options,
        feedback,
        gateWrap
      ]));
    }

    render();
  };

})(window);
