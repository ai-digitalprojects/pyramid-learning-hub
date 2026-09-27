/* ============================================================
   activities/fold.js — פעילות 1.7: מקפלים את הפריסה
   ------------------------------------------------------------
   חוקרים את הקיפול במחוון, ואז עונים על שלוש שאלות.
   הקיפול מחושב במנוע הגאומטריה: פרמטר יחיד מ-0 עד 1,
   וכל המשולשים מסתובבים סביב צלעות הבסיס שלהם.
   ============================================================ */
(function (global) {
  'use strict';

  var App = global.App = global.App || {};
  App.activities = App.activities || {};

  App.activities['1.7'] = function (mount, act, unit) {
    var UI = App.UI, Kit = App.Kit, NV = App.NetView, el = UI.el;
    var state = { step: 'explore', n: 4, t: 0, played: false };

    function renderExplore() {
      var stage = el('div', { class: 'diagram-stage' });
      var caption = el('p', { class: 'view-hint', 'aria-live': 'polite' });
      var slider, playBtn, timer = null;

      function draw() {
        UI.clear(stage);
        stage.appendChild(NV.foldSvg({ n: state.n, t: state.t, size: 250 }));
        var pct = Math.round(state.t * 100);
        caption.textContent = pct === 0
          ? 'הפריסה פתוחה לגמרי על המישור.'
          : (pct === 100
            ? 'הפירמידה סגורה. כל המשולשים נפגשו בקודקוד אחד.'
            : 'הפריסה מקופלת ב-' + pct + ' אחוזים.');
      }

      function setT(v) {
        state.t = Math.max(0, Math.min(1, v));
        if (slider) slider.value = String(Math.round(state.t * 100));
        draw();
        if (state.t >= 0.999) state.played = true;
      }

      function stopPlay() {
        if (timer) { clearInterval(timer); timer = null; }
        if (playBtn) playBtn.textContent = '▶ הריצו את הקיפול';
      }

      function play() {
        var reduce = global.matchMedia &&
          global.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) { setT(1); return; }      // בלי תנועה: קופצים לסוף
        if (timer) { stopPlay(); return; }
        setT(0);
        playBtn.textContent = '⏸ עצרו';
        timer = setInterval(function () {
          setT(state.t + 0.02);
          if (state.t >= 1) stopPlay();
        }, 40);
      }

      slider = el('input', {
        type: 'range', min: '0', max: '100', value: String(Math.round(state.t * 100)),
        'aria-label': 'מידת הקיפול באחוזים',
        oninput: function () { stopPlay(); setT(parseInt(this.value, 10) / 100); }
      });

      playBtn = el('button', {
        type: 'button', class: 'btn btn--unit-1',
        onclick: play
      }, [document.createTextNode('▶ הריצו את הקיפול')]);

      var baseButtons = el('div', { class: 'view-switch', role: 'group', 'aria-label': 'בחירת בסיס' },
        [3, 4, 5, 6].map(function (k) {
          return el('button', {
            type: 'button',
            class: 'view-btn' + (state.n === k ? ' view-btn--active' : ''),
            'aria-pressed': state.n === k ? 'true' : 'false',
            onclick: function () { stopPlay(); state.n = k; render(); }
          }, [document.createTextNode(App.Geometry.names(k).base)]);
        }));

      draw();

      UI.clear(mount);
      mount.appendChild(el('div', { class: 'stack' }, [
        el('div', { class: 'panel' }, [
          el('p', { class: 'activity-intro__text', text: act.lead })
        ]),
        baseButtons,
        stage,
        caption,
        el('div', { class: 'explore-controls' }, [
          el('div', { class: 'control-group' }, [
            el('label', { class: 'control-group__label', text: 'מידת הקיפול' }),
            slider
          ]),
          playBtn
        ]),
        el('div', { class: 'btn-row btn-row--center' }, [
          el('button', {
            type: 'button', class: 'btn btn--unit-1 btn--lg',
            onclick: function () { stopPlay(); state.step = 'quiz'; render(); }
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
      Kit.quiz({
        mount: mount, act: act, unit: unit,
        questions: act.questions,
        result: act.result
      });
    }

    render();
  };

})(window);
