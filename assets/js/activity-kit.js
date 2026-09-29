/* ============================================================
   activity-kit.js — מנוע הפעילויות המשותף
   ------------------------------------------------------------
   מרכז את חוזה הלמידה של האתר כולו:
     • משוב מיידי וספציפי, לעולם לא "נכון" או "לא נכון" בלבד
     • אחרי טעות השאלה נשארת פתוחה ואפשר לנסות שוב
     • "לשאלה הבאה" מופיע רק אחרי תשובה נכונה
     • הניקוד נקבע לפי הניסיון הראשון בלבד
     • כל גרירה נתמכת גם בהקשה-ואז-הקשה
     • מקלדת, עכבר ומגע — כולם עובדים
   ============================================================ */
(function (global) {
  'use strict';

  var App = global.App = global.App || {};

  /* ============================================================
     רצף הפעילויות באתר — לניווט "הבא" ו"הקודם"
     ============================================================ */
  function sequence() {
    var D = global.PyramidData;
    var list = [];
    [D.unit1, D.unit2].forEach(function (u) {
      u.activities.forEach(function (a) { list.push({ unit: u, act: a }); });
    });
    return list;
  }

  function neighbours(actId) {
    var seq = sequence();
    var i = -1;
    seq.forEach(function (e, k) { if (e.act.id === actId) i = k; });
    return {
      index: i,
      prev: i > 0 ? seq[i - 1] : null,
      next: i >= 0 && i < seq.length - 1 ? seq[i + 1] : null,
      isLastOverall: i === seq.length - 1
    };
  }

  /* ============================================================
     סרגל ניווט תחתון — מופיע בכל עמוד פעילות
     ============================================================ */
  function activityNav(act, unit) {
    var el = App.UI.el;
    var nb = neighbours(act.id);
    var row = el('nav', { class: 'activity-nav', 'aria-label': 'ניווט בין פעילויות' });

    if (nb.prev) {
      row.appendChild(el('a', {
        class: 'activity-nav__btn', href: '#/activity/' + nb.prev.act.id
      }, [
        el('span', { 'aria-hidden': 'true', text: '→' }),
        el('span', { class: 'activity-nav__text' }, [
          el('span', { class: 'activity-nav__label', text: 'לפעילות הקודמת' }),
          el('span', { class: 'activity-nav__title', text: nb.prev.act.title })
        ])
      ]));
    }

    row.appendChild(el('a', {
      class: 'activity-nav__btn activity-nav__btn--mid', href: '#/unit/' + unit.id
    }, [
      el('span', { 'aria-hidden': 'true', text: '☰' }),
      el('span', { class: 'activity-nav__text' }, [
        el('span', { class: 'activity-nav__label', text: 'חזרה ליחידה' })
      ])
    ]));

    if (nb.next) {
      row.appendChild(el('a', {
        class: 'activity-nav__btn', href: '#/activity/' + nb.next.act.id
      }, [
        el('span', { class: 'activity-nav__text' }, [
          el('span', { class: 'activity-nav__label', text: 'לפעילות הבאה' }),
          el('span', { class: 'activity-nav__title', text: nb.next.act.title })
        ]),
        el('span', { 'aria-hidden': 'true', text: '←' })
      ]));
    } else {
      row.appendChild(el('a', {
        class: 'activity-nav__btn', href: '#/final'
      }, [
        el('span', { class: 'activity-nav__text' }, [
          el('span', { class: 'activity-nav__label', text: 'למבחן הסיום' })
        ]),
        el('span', { 'aria-hidden': 'true', text: '←' })
      ]));
    }
    return row;
  }

  /* ============================================================
     בניית האיור לפי מפרט
     ============================================================ */
  function buildFigure(spec, handlers) {
    if (!spec) return null;
    var G = App.Geometry, SV = App.SolidView, NV = App.NetView;
    handlers = handlers || {};

    if (typeof spec === 'function') return spec(handlers);

    if (spec.kind === 'solid') {
      return SV.create({
        geometry: spec.body === 'prism'
          ? G.prism(spec.n || 4, { radius: 1, height: spec.height || 1.5 })
          : G.pyramid(spec.n || 4, { radius: 1, height: spec.height || 1.5 }),
        view: spec.view || 'front',
        size: spec.size || 232,
        show: spec.show || {},
        labels: spec.labels,
        measures: spec.measures,
        interactive: !!handlers.onPick,
        pickable: spec.pickable,
        onPick: handlers.onPick,
        ariaLabel: spec.ariaLabel
      });
    }
    // גופים מיוחדים שאינם פירמידה משוכללת (חרוט, תיבה, פירמידה קטומה…)
    if (spec.kind === 'shape') {
      return App.Shapes.build(spec.id, spec.ariaLabel);
    }
    if (spec.kind === 'net') {
      return NV.netSvg({ n: spec.n || 4, variant: spec.variant, size: spec.size || 200,
        ariaLabel: spec.ariaLabel });
    }
    if (spec.kind === 'fold') {
      return NV.foldSvg({ n: spec.n || 4, t: spec.t || 0, size: spec.size || 220 });
    }
    return null;
  }

  /* ============================================================
     רכיבי קלט — כל אחד מחזיר { node, reset, lock }
     ומדווח דרך onAnswer(value, meta)
     ============================================================ */
  var Inputs = {};

  /* ---------- בחירה מרובה ---------- */
  Inputs.choice = function (q, onAnswer) {
    var el = App.UI.el;
    var disabled = {};
    var wrap = el('div', { class: q.wide ? 'option-grid option-grid--wide' : 'option-grid' });

    q.options.forEach(function (opt) {
      var btn = el('button', {
        type: 'button', class: 'answer-btn answer-btn--sm', 'data-id': opt.id,
        onclick: function () {
          if (disabled[opt.id]) return;
          onAnswer(opt.id, { button: btn });
        }
      }, [
        el('span', { class: 'answer-btn__mark', 'aria-hidden': 'true' }),
        el('span', { class: 'answer-btn__label', text: opt.text })
      ]);
      wrap.appendChild(btn);
    });

    return {
      node: wrap,
      markWrong: function (id) {
        disabled[id] = true;
        var b = wrap.querySelector('[data-id="' + id + '"]');
        if (b) {
          b.disabled = true; b.setAttribute('aria-disabled', 'true');
          b.classList.add('answer-btn--wrong');
          b.querySelector('.answer-btn__mark').textContent = '✘';
        }
      },
      markCorrect: function (id) {
        var b = wrap.querySelector('[data-id="' + id + '"]');
        if (b) {
          b.classList.add('answer-btn--correct');
          b.querySelector('.answer-btn__mark').textContent = '✔';
        }
        [].forEach.call(wrap.children, function (x) {
          x.disabled = true; x.setAttribute('aria-disabled', 'true');
        });
      }
    };
  };

  /* ---------- קלט מספרי ---------- */
  Inputs.numeric = function (q, onAnswer) {
    var el = App.UI.el;
    var input = el('input', {
      type: 'text', inputmode: 'decimal', class: 'num-input',
      'aria-label': q.inputLabel || 'התשובה שלכם',
      autocomplete: 'off'
    });
    var btn = el('button', { type: 'button', class: 'btn btn--unit-' + (q.unitId || 2),
      onclick: submit }, [document.createTextNode('בדיקה')]);

    function submit() {
      var raw = (input.value || '').trim().replace(',', '.');
      if (raw === '') { input.focus(); return; }
      var val = parseFloat(raw);
      if (isNaN(val)) { onAnswer(NaN, { raw: raw }); return; }
      onAnswer(val, { raw: raw });
    }

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); submit(); }
    });

    var row = el('div', { class: 'numeric-row' }, [
      el('div', { class: 'numeric-field' }, [
        input,
        q.unit ? el('span', { class: 'numeric-unit', text: q.unit }) : null
      ]),
      btn
    ]);

    return {
      node: row,
      focus: function () { input.focus(); },
      clear: function () { input.value = ''; input.focus(); },
      lock: function () { input.disabled = true; btn.disabled = true; }
    };
  };

  /* ---------- התאמה: הקשה ואז הקשה ---------- */
  Inputs.match = function (q, onAnswer) {
    var el = App.UI.el;
    var selected = null;
    var solved = {};

    var left = el('div', { class: 'match-col', role: 'group', 'aria-label': q.leftLabel || 'פריטים' });
    var right = el('div', { class: 'match-col', role: 'group', 'aria-label': q.rightLabel || 'תשובות' });

    function makeCard(item, side) {
      var body = item.figure ? buildFigure(item.figure) : null;
      var card = el('button', {
        type: 'button', class: 'match-card', 'data-id': item.id, 'data-side': side,
        'aria-label': item.alt || item.text || item.id,
        onclick: function () { pick(item, side, card); }
      }, [
        body,
        item.text ? el('span', { class: 'match-card__text', text: item.text }) : null
      ]);
      return card;
    }

    function clearSel() {
      [].forEach.call(left.children, function (c) { c.classList.remove('match-card--sel'); });
      [].forEach.call(right.children, function (c) { c.classList.remove('match-card--sel'); });
      selected = null;
    }

    function pick(item, side, card) {
      if (solved[item.id]) return;
      if (!selected) {
        selected = { item: item, side: side, card: card };
        card.classList.add('match-card--sel');
        App.UI.announce('נבחר: ' + (item.text || item.alt || ''));
        return;
      }
      if (selected.side === side) {       // החלפת בחירה באותו צד
        clearSel();
        selected = { item: item, side: side, card: card };
        card.classList.add('match-card--sel');
        return;
      }
      var a = selected, b = { item: item, side: side, card: card };
      clearSel();
      onAnswer({ a: a, b: b }, {
        lockPair: function () {
          solved[a.item.id] = true; solved[b.item.id] = true;
          a.card.classList.add('match-card--done');
          b.card.classList.add('match-card--done');
          a.card.disabled = true; b.card.disabled = true;
          a.card.setAttribute('aria-disabled', 'true');
          b.card.setAttribute('aria-disabled', 'true');
        },
        allSolved: function () {
          return q.pairs.every(function (p) { return solved[p.left.id]; });
        }
      });
    }

    q.pairs.forEach(function (p) { left.appendChild(makeCard(p.left, 'left')); });
    var shuffled = q.pairs.map(function (p) { return p.right; });
    shuffled.sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    shuffled.forEach(function (r) { right.appendChild(makeCard(r, 'right')); });

    return {
      node: el('div', { class: 'match-grid' }, [
        el('p', { class: 'quiz-sub', text: 'לחצו על פריט בצד אחד, ואז על הפריט המתאים בצד השני.' }),
        el('div', { class: 'match-cols' }, [left, right])
      ])
    };
  };

  /* ---------- מיון לתאים: הקשה ואז הקשה ---------- */
  Inputs.sort = function (q, onAnswer) {
    var el = App.UI.el;
    var selected = null;
    var placed = {};

    var pool = el('div', { class: 'sort-pool', role: 'group', 'aria-label': 'פריטים למיון' });
    var bins = el('div', { class: 'sort-bins' });

    function itemCard(it) {
      return el('button', {
        type: 'button', class: 'sort-item', 'data-id': it.id,
        'aria-label': it.alt || it.text,
        onclick: function () { selectItem(it, this); }
      }, [ it.figure ? buildFigure(it.figure) : null,
           it.text ? el('span', { class: 'sort-item__text', text: it.text }) : null ]);
    }

    function selectItem(it, node) {
      if (placed[it.id]) return;
      [].forEach.call(pool.children, function (c) { c.classList.remove('sort-item--sel'); });
      if (selected && selected.it.id === it.id) { selected = null; return; }
      selected = { it: it, node: node };
      node.classList.add('sort-item--sel');
      App.UI.announce('נבחר: ' + (it.text || it.alt) + '. עכשיו בחרו את התא המתאים.');
    }

    q.bins.forEach(function (bin) {
      var drop = el('button', {
        type: 'button', class: 'sort-bin', 'data-bin': bin.id,
        onclick: function () {
          if (!selected) {
            App.UI.announce('קודם בחרו פריט מהרשימה.');
            return;
          }
          var sel = selected;
          selected = null;
          [].forEach.call(pool.children, function (c) { c.classList.remove('sort-item--sel'); });
          onAnswer({ item: sel.it, bin: bin }, {
            accept: function () {
              placed[sel.it.id] = bin.id;
              sel.node.disabled = true;
              sel.node.setAttribute('aria-disabled', 'true');
              sel.node.classList.add('sort-item--done');
              drop.querySelector('.sort-bin__count').textContent =
                String(Object.keys(placed).filter(function (k) { return placed[k] === bin.id; }).length);
            },
            allPlaced: function () { return q.items.every(function (x) { return placed[x.id]; }); }
          });
        }
      }, [
        el('span', { class: 'sort-bin__name', text: bin.text }),
        el('span', { class: 'sort-bin__count', text: '0' })
      ]);
      bins.appendChild(drop);
    });

    q.items.forEach(function (it) { pool.appendChild(itemCard(it)); });

    return {
      node: el('div', { class: 'sort-wrap' }, [
        el('p', { class: 'quiz-sub', text: 'לחצו על גוף, ואז על התא שאליו הוא שייך.' }),
        pool, bins
      ])
    };
  };

  /* ---------- בניית נוסחה / סידור אריחים ---------- */
  Inputs.build = function (q, onAnswer) {
    var el = App.UI.el, UI = App.UI;
    var slots = [];
    var chosen = [];

    /* הנוסחה שנבנית נקראת משמאל לימין. dir מפורש על השורה עושה את
       סדר המשבצות על המסך זהה לסדר שבו התלמיד הניח אותן ולסדר ה-DOM,
       ולכן גם קורא מסך מקריא אותה באותו סדר. הטקסט העברי בתוך כל
       משבצת ממשיך להיקרא מימין לשמאל כרגיל. */
    var slotRow = el('div', {
      class: 'build-slots', dir: 'ltr',
      role: 'group', 'aria-label': 'הנוסחה שאתם בונים'
    });
    var tileRow = el('div', { class: 'build-tiles', role: 'group', 'aria-label': 'אריחים לבחירה' });

    function refresh() {
      App.UI.clear(slotRow);
      for (var i = 0; i < q.answer.length; i++) {
        (function (i) {
          var v = chosen[i];
          slotRow.appendChild(el('button', {
            type: 'button',
            class: 'build-slot' + (v ? ' build-slot--filled' : ''),
            'aria-label': v ? ('משבצת ' + (i + 1) + ': ' + v.text + '. לחצו כדי להסיר.')
                            : ('משבצת ' + (i + 1) + ' ריקה'),
            onclick: function () {
              if (!v) return;
              chosen.splice(i, 1);
              refresh();
            }
          }, [ document.createTextNode(v ? v.text : '') ]));
        })(i);
      }
      var check = el('button', {
        type: 'button', class: 'btn btn--unit-2',
        disabled: chosen.length !== q.answer.length ? true : null,
        onclick: function () { onAnswer(chosen.map(function (c) { return c.id; }), {}); }
      }, [document.createTextNode('בדיקה')]);
      slotRow.appendChild(check);
    }

    q.tiles.forEach(function (t) {
      tileRow.appendChild(el('button', {
        type: 'button', class: 'build-tile', 'data-id': t.id,
        onclick: function () {
          if (chosen.length >= q.answer.length) return;
          chosen.push(t);
          refresh();
        }
      }, [UI.math(t.text)]));
    });

    refresh();

    return {
      node: el('div', { class: 'build-wrap' }, [
        el('p', { class: 'quiz-sub', text: 'לחצו על האריחים לפי הסדר הנכון. לחיצה על משבצת מלאה מסירה אותה.' }),
        slotRow, tileRow
      ]),
      reset: function () { chosen = []; refresh(); }
    };
  };

  /* ------------------------------------------------------------
     סימון הצעד הבא במסך שנבנה ביד
     ------------------------------------------------------------
     מקבל את אזור התוכן ומסמן בו את הכפתור הראשון שתואם לבורר. כך גם
     הפעילויות שנכתבו בנפרד מצייתות לאותו כלל: כפתור זוהר אחד בלבד,
     ורק כשיש באמת צעד הבא.
     ------------------------------------------------------------ */
  function markNext(root, selector) {
    if (!root) { App.clearCta(); return null; }
    var node = root.querySelector(selector || '.btn--lg');
    if (node) App.cta(node); else App.clearCta();
    return node;
  }

  /* ============================================================
     מסך סיכום משותף — לכל הפעילויות, גם המותאמות אישית
     opts = { mount, act, unit, score, max, result, concepts[], onRetry }
     ============================================================ */
  function resultScreen(opts) {
    var el = App.UI.el, UI = App.UI, Store = App.Store;
    var score = opts.score, max = opts.max, cfgResult = opts.result || {};
    var rec = Store.recordAttempt(opts.act.id, score, max);
    var nb = neighbours(opts.act.id);
    var threshold = cfgResult.reviewThreshold || Math.ceil(max * 0.75);

    var msg;
    if (score === max) msg = cfgResult.perfect || cfgResult.high;
    else if (score >= max - 1) msg = cfgResult.high;
    else if (score >= threshold) msg = cfgResult.mid;
    else msg = cfgResult.low;

    var blocks = [
      el('div', { class: 'panel result-card' }, [
        el('div', { class: 'result-score' }, [
          UI.num(score), document.createTextNode(' מתוך '), UI.num(max)
        ]),
        el('p', { class: 'result-message', text: msg })
      ])
    ];

    var concepts = opts.concepts || [];
    var missed = concepts.filter(function (c) { return c.concept && !c.correct; })
      .map(function (c) { return c.concept; });
    var uniqueMissed = missed.filter(function (c, k) { return missed.indexOf(c) === k; });

    if (uniqueMissed.length) {
      blocks.push(el('div', { class: 'panel' }, [
        el('h3', { text: 'כדאי לחזור על' }),
        el('ul', { class: 'concept-list concept-list--review' }, uniqueMissed.map(function (c) {
          return el('li', {}, [
            el('span', { class: 'concept-list__tick', 'aria-hidden': 'true', text: '●' }),
            UI.math(c)
          ]);
        }))
      ]));
    } else {
      var all = concepts.filter(function (c) { return c.concept; }).map(function (c) { return c.concept; });
      var uniq = all.filter(function (c, k) { return all.indexOf(c) === k; });
      if (uniq.length) {
        blocks.push(el('div', { class: 'panel' }, [
          el('h3', { text: 'מה שהבנתם' }),
          el('ul', { class: 'concept-list' }, uniq.map(function (c) {
            return el('li', {}, [
              el('span', { class: 'concept-list__tick', 'aria-hidden': 'true', text: '✔' }),
              UI.math(c)
            ]);
          }))
        ]));
      }
    }

    if (score < threshold && cfgResult.reviewText) {
      blocks.push(el('div', { class: 'notice notice--warn' }, [
        el('span', { class: 'notice__icon', 'aria-hidden': 'true', text: '📘' }),
        el('p', { text: cfgResult.reviewText })
      ]));
    }

    if (rec.attempts > 1) {
      blocks.push(el('p', { class: 'result-best' }, [
        document.createTextNode('ניסיון מספר '), UI.num(rec.attempts),
        document.createTextNode('. התוצאה הטובה ביותר שלכם: '),
        UI.num(rec.best), document.createTextNode(' מתוך '), UI.num(rec.max)
      ]));
    }

    /* --- ההמשך: התלמיד בוחר, האתר לא מעביר לבד --- */
    var primary;
    if (nb.next) {
      var isUnitEnd = nb.next.unit.id !== opts.unit.id;
      primary = el('a', {
        class: 'btn btn--unit-' + nb.next.unit.id + ' btn--lg btn--wide',
        href: '#/activity/' + nb.next.act.id
      }, [
        el('span', { class: 'btn__stack' }, [
          el('span', { class: 'btn__label', text: isUnitEnd ? 'ליחידה הבאה' : 'לפעילות הבאה' }),
          el('span', { class: 'btn__sub',
            text: (isUnitEnd ? nb.next.unit.short + ': ' : '') + nb.next.act.title })
        ]),
        el('span', { 'aria-hidden': 'true', text: '←' })
      ]);
    } else {
      primary = el('a', { class: 'btn btn--gold btn--lg btn--wide', href: '#/final' }, [
        el('span', { class: 'btn__stack' }, [
          el('span', { class: 'btn__label', text: 'למבחן הסיום' }),
          el('span', { class: 'btn__sub', text: 'סיימתם את כל הפעילויות' })
        ]),
        el('span', { 'aria-hidden': 'true', text: '←' })
      ]);
    }

    var secondary = [];
    if (nb.prev) {
      secondary.push(el('a', { class: 'btn btn--ghost btn--lg',
        href: '#/activity/' + nb.prev.act.id }, [
        el('span', { 'aria-hidden': 'true', text: '→' }),
        el('span', { class: 'btn__stack' }, [
          el('span', { class: 'btn__label', text: 'לפעילות הקודמת' }),
          el('span', { class: 'btn__sub', text: nb.prev.act.title })
        ])
      ]));
    }
    if (opts.onRetry) {
      secondary.push(el('button', {
        type: 'button', class: 'btn btn--ghost btn--lg', onclick: opts.onRetry
      }, [document.createTextNode('נסו שוב')]));
    }
    secondary.push(el('a', { class: 'btn btn--ghost btn--lg', href: '#/unit/' + opts.unit.id },
      [document.createTextNode('חזרה ליחידה')]));

    blocks.push(el('div', { class: 'result-actions' }, [
      primary,
      el('div', { class: 'btn-row btn-row--center' }, secondary)
    ]));

    /* ------------------------------------------------------------
       השלמת יחידה
       ------------------------------------------------------------
       אם התחנה הזאת היא שסגרה את היחידה, מסך הסיום החגיגי נפתח מעל
       הסיכום הרגיל. הוא מופיע פעם אחת בלבד: הסימון נשמר, ולכן רענון
       או כניסה חוזרת לא יריצו אותו שוב.
       ------------------------------------------------------------ */
    var celebration = null;
    if (Store.countDone(opts.unit.activities) === opts.unit.activities.length &&
        !Store.unitCelebrated(opts.unit.id)) {
      Store.markUnitCelebrated(opts.unit.id);
      Store.flushNow();
      celebration = App.Celebrate.unitScreen(opts.unit, {
        href: nb.next ? '#/activity/' + nb.next.act.id : '#/final',
        label: nb.next ? 'ממשיכים במסע' : 'למבחן הסיום'
      });
    }

    UI.clear(opts.mount);
    var page = el('div', { class: 'stack' }, blocks);
    if (celebration) opts.mount.appendChild(celebration);
    opts.mount.appendChild(page);

    /* כפתור אחד זוהר במסך: אם יש חגיגה, הוא שלה. */
    App.cta(celebration ? celebration.querySelector('.btn') : primary);

    UI.announce('סיימתם את הפעילות. התוצאה: ' + score + ' מתוך ' + max);
    UI.scrollTop();
    return rec;
  }

  /* ============================================================
     מנוע השאלות
     ============================================================ */
  function quiz(cfg) {
    var el = App.UI.el, UI = App.UI, Store = App.Store;
    var mount = cfg.mount, act = cfg.act, unit = cfg.unit;
    var questions = cfg.questions;

    var state = {
      step: cfg.intro ? 'intro' : 'quiz',
      i: 0,
      answers: [],      // { correct: firstAttemptCorrect, attempts, solved }
      done: []          // solved flag per question
    };

    /* ---------- מסך פתיחה ---------- */
    function renderIntro() {
      var blocks = [];
      if (cfg.intro.title) blocks.push(el('h2', { text: cfg.intro.title }));
      if (cfg.intro.text) blocks.push(el('p', { class: 'activity-intro__text', text: cfg.intro.text }));
      if (cfg.intro.figure) {
        blocks.push(el('figure', { class: 'shape-figure' }, [buildFigure(cfg.intro.figure)]));
      }
      if (cfg.intro.bullets) {
        blocks.push(el('ul', {}, cfg.intro.bullets.map(function (b) { return el('li', { text: b }); })));
      }

      var startBtn = el('button', {
        type: 'button', class: 'btn btn--unit-' + unit.id + ' btn--lg',
        onclick: function () { state.step = 'quiz'; render(); }
      }, [
        document.createTextNode((cfg.intro.startLabel || 'מתחילים') + ' '),
        el('span', { 'aria-hidden': 'true', text: '←' })
      ]);

      UI.clear(mount);
      mount.appendChild(el('div', { class: 'stack' }, [
        el('div', { class: 'panel' }, blocks),
        el('div', { class: 'btn-row btn-row--center' }, [startBtn])
      ]));

      App.cta(startBtn);
    }

    /* בזמן ששאלה פתוחה ועדיין לא נענתה, אין באתר צעד הבא לסמן */

    /* ---------- כותרת התקדמות ---------- */
    function progressHead() {
      var doneCount = state.answers.filter(Boolean).length;
      var pct = Math.round((state.i / questions.length) * 100);
      return el('div', { class: 'quiz-progress' }, [
        el('div', { class: 'quiz-head' }, [
          el('div', { class: 'quiz-head__count' }, [
            document.createTextNode('שאלה '), UI.num(state.i + 1),
            document.createTextNode(' מתוך '), UI.num(questions.length)
          ]),
          el('div', {
            class: 'quiz-dots', role: 'img',
            'aria-label': 'נפתרו ' + doneCount + ' שאלות מתוך ' + questions.length
          }, questions.map(function (_, k) {
            var a = state.answers[k];
            return el('span', {
              class: 'quiz-dot' + (k === state.i ? ' quiz-dot--current' : '') +
                (a ? (a.correct ? ' quiz-dot--ok' : ' quiz-dot--no') : '')
            });
          }))
        ]),
        el('div', {
          class: 'progress__track', role: 'progressbar',
          'aria-valuenow': pct, 'aria-valuemin': '0', 'aria-valuemax': '100',
          'aria-label': 'התקדמות בפעילות'
        }, [
          el('div', { class: 'progress__fill progress__fill--unit-' + unit.id,
            style: 'inline-size:' + pct + '%' })
        ])
      ]);
    }

    /* ---------- מסך שאלה ---------- */
    function renderQuestion() {
      var q = questions[state.i];
      var isLast = state.i === questions.length - 1;
      var solved = !!state.done[state.i];

      var feedback = el('div', { class: 'feedback-slot', 'aria-live': 'polite' });
      var figureHolder = el('div', { class: 'diagram-stage' });
      var inputHolder = el('div', { class: 'input-slot' });
      var control = null;
      var figSvg = null;

      function record(correct) {
        if (!state.answers[state.i]) {
          state.answers[state.i] = { correct: correct, attempts: 1 };
        } else {
          state.answers[state.i].attempts += 1;
        }
      }

      function solve() {
        state.done[state.i] = true;
        solved = true;
      }

      function showFeedback(correct, title, bodyNodes, retryText) {
        var tail;
        if (correct) {
          var nextBtn = el('button', {
            type: 'button', class: 'btn btn--unit-' + unit.id + ' btn--lg',
            onclick: function () {
              if (isLast) { state.step = 'result'; } else { state.i += 1; }
              render();
            }
          }, [
            document.createTextNode((isLast ? 'לסיכום הפעילות ' : 'לשאלה הבאה ')),
            el('span', { 'aria-hidden': 'true', text: '←' })
          ]);
          tail = [el('div', { class: 'btn-row btn-row--center' }, [nextBtn])];
          /* עכשיו, ורק עכשיו, יש צעד הבא ברור */
          global.setTimeout(function () { App.cta(nextBtn); }, 0);
        } else {
          /* תשובה שגויה: אין צעד הבא, ולכן אין כפתור זוהר */
          App.clearCta();
          tail = [el('p', { class: 'feedback__retry',
            text: retryText || 'נסו שוב. אפשר לבחור תשובה אחרת.' })];
        }

        UI.clear(feedback);
        feedback.appendChild(el('div', { class: 'feedback feedback--' + (correct ? 'ok' : 'no') }, [
          el('div', { class: 'feedback__head' }, [
            el('span', { class: 'feedback__icon', 'aria-hidden': 'true', text: correct ? '✔' : '✘' }),
            el('h3', { class: 'feedback__title', text: title })
          ])
        ].concat(bodyNodes).concat(tail)));

        if (correct) {
          var b = feedback.querySelector('.btn');
          if (b) b.focus();
        }
        UI.announce((correct ? 'נכון. ' : 'לא מדויק. ') + title);
      }

      function para(text) { return el('p', { class: 'feedback__why', text: text }); }
      function note(text) {
        return el('p', { class: 'feedback__note' }, [
          el('strong', { text: 'שימו לב: ' }), UI.math(text)
        ]);
      }

      /* ---- לפי סוג השאלה ---- */
      function setupChoice() {
        control = Inputs.choice(q, function (id, meta) {
          var correct = id === q.answer;
          record(correct);
          if (correct) {
            control.markCorrect(id);
            solve();
            showFeedback(true, q.correctTitle || 'נכון',
              [para(q.why.correct)].concat(q.why.note ? [note(q.why.note)] : []));
          } else {
            control.markWrong(id);
            var w = (q.why.wrong && q.why.wrong[id]) || q.why.fallback ||
              'זו אינה התשובה הנכונה.';
            showFeedback(false, 'לא מדויק', [para(w)]);
          }
          void meta;
        });
        inputHolder.appendChild(control.node);
      }

      function setupNumeric() {
        control = Inputs.numeric(q, function (val) {
          if (isNaN(val)) {
            record(false);
            showFeedback(false, 'לא הצלחנו לקרוא את התשובה',
              [para('כתבו מספר בלבד, למשל 24. אפשר להשתמש בנקודה עשרונית.')]);
            return;
          }
          var tol = q.tolerance === undefined ? 1e-9 : q.tolerance;
          var correct = Math.abs(val - q.answer) <= tol;
          record(correct);
          if (correct) {
            control.lock(); solve();
            showFeedback(true, 'נכון',
              [para(q.why.correct)].concat(q.why.note ? [note(q.why.note)] : []));
          } else {
            var msg = q.why.fallback || 'התשובה אינה נכונה.';
            if (q.why.checks) {
              for (var k = 0; k < q.why.checks.length; k++) {
                if (Math.abs(val - q.why.checks[k].value) <= tol) { msg = q.why.checks[k].text; break; }
              }
            }
            showFeedback(false, 'עוד לא', [para(msg)], 'נסו שוב. תקנו את המספר ולחצו בדיקה.');
            control.clear();
          }
        });
        inputHolder.appendChild(control.node);
      }

      function setupPick() {
        figSvg = buildFigure(q.figure, {
          onPick: function (part, index) {
            if (solved) return;
            var correct = q.targetIndex === undefined
              ? part === q.target
              : (part === q.target && index === q.targetIndex);
            record(correct);
            App.SolidView.highlight(figSvg, part, index);
            if (correct) {
              App.SolidView.lock(figSvg);
              solve();
              showFeedback(true, (q.partNames && q.partNames[part]) ? ('נכון: ' + q.partNames[part].name) : 'נכון',
                [para(q.why.correct)].concat(q.why.note ? [note(q.why.note)] : []));
            } else {
              var info = q.partNames && q.partNames[part];
              var body = [para(info
                ? 'בחרתם ' + info.name + '' + info.desc
                : 'זה אינו החלק שחיפשנו.')];
              if (q.why.wanted) body.push(note(q.why.wanted));
              showFeedback(false, info ? ('לא זה החלק: ' + info.name) : 'לא זה החלק', body,
                'נסו שוב. לחצו על חלק אחר.');
            }
          }
        });
        figureHolder.appendChild(figSvg);
      }

      function setupMatch() {
        control = Inputs.match(q, function (sel, api) {
          var a = sel.a.side === 'left' ? sel.a.item : sel.b.item;
          var b = sel.a.side === 'left' ? sel.b.item : sel.a.item;
          var pair = null;
          q.pairs.forEach(function (p) { if (p.left.id === a.id) pair = p; });
          var correct = pair && pair.right.id === b.id;
          record(correct);
          if (correct) {
            api.lockPair();
            if (api.allSolved()) {
              solve();
              showFeedback(true, 'כל ההתאמות נכונות',
                [para(q.why.correct)].concat(q.why.note ? [note(q.why.note)] : []));
            } else {
              UI.clear(feedback);
              feedback.appendChild(el('div', { class: 'feedback feedback--ok' }, [
                el('div', { class: 'feedback__head' }, [
                  el('span', { class: 'feedback__icon', 'aria-hidden': 'true', text: '✔' }),
                  el('h3', { class: 'feedback__title', text: 'התאמה נכונה' })
                ]),
                para((pair && pair.why) || 'יפה. המשיכו להתאמה הבאה.')
              ]));
              UI.announce('התאמה נכונה. המשיכו.');
            }
          } else {
            var w = (pair && pair.wrongWhy) || q.why.fallback || 'ההתאמה הזאת אינה נכונה.';
            showFeedback(false, 'לא מתאים', [para(w)], 'נסו שוב. בחרו זוג אחר.');
          }
        });
        inputHolder.appendChild(control.node);
      }

      function setupSort() {
        control = Inputs.sort(q, function (sel, api) {
          var correct = sel.item.bin === sel.bin.id;
          record(correct);
          if (correct) {
            api.accept();
            if (api.allPlaced()) {
              solve();
              showFeedback(true, 'מיינתם הכול נכון',
                [para(q.why.correct)].concat(q.why.note ? [note(q.why.note)] : []));
            } else {
              UI.clear(feedback);
              feedback.appendChild(el('div', { class: 'feedback feedback--ok' }, [
                el('div', { class: 'feedback__head' }, [
                  el('span', { class: 'feedback__icon', 'aria-hidden': 'true', text: '✔' }),
                  el('h3', { class: 'feedback__title', text: 'נכון: ' + sel.item.text })
                ]),
                para(sel.item.why || '')
              ]));
              UI.announce('נכון. המשיכו לגוף הבא.');
            }
          } else {
            showFeedback(false, 'לא שם: ' + sel.item.text,
              [para(sel.item.whyWrong || 'הגוף הזה שייך לתא השני.')],
              'נסו שוב. בחרו את הגוף ואז את התא הנכון.');
          }
        });
        inputHolder.appendChild(control.node);
      }

      function setupBuild() {
        control = Inputs.build(q, function (ids) {
          var correct = ids.length === q.answer.length &&
            ids.every(function (v, k) { return v === q.answer[k]; });
          record(correct);
          if (correct) {
            solve();
            showFeedback(true, 'הנוסחה נכונה',
              [para(q.why.correct)].concat(q.why.note ? [note(q.why.note)] : []));
          } else {
            showFeedback(false, 'עוד לא',
              [para(q.why.fallback || 'הסדר אינו נכון. חשבו: מה מחשבים קודם ומה בסוף.')],
              'נסו שוב. הסירו אריחים וסדרו מחדש.');
            control.reset();
          }
        });
        inputHolder.appendChild(control.node);
      }

      var setups = {
        choice: setupChoice, numeric: setupNumeric, pick: setupPick,
        match: setupMatch, sort: setupSort, build: setupBuild
      };

      if (q.figure && q.type !== 'pick') {
        figureHolder.appendChild(buildFigure(q.figure));
      }
      (setups[q.type] || setupChoice)();

      var blocks = [
        progressHead(),
        el('div', { class: 'panel quiz-card' }, [
          el('h2', { class: 'quiz-question', text: q.prompt }),
          q.hint ? el('p', { class: 'quiz-sub', text: q.hint }) : null,
          q.srHint ? el('p', { class: 'sr-only', text: q.srHint }) : null
        ])
      ];
      if (figureHolder.childNodes.length) blocks.push(figureHolder);
      if (inputHolder.childNodes.length) blocks.push(inputHolder);
      blocks.push(feedback);
      if (q.reminder) {
        blocks.push(el('details', { class: 'reminder' }, [
          el('summary', { text: 'תזכורת' }), el('p', { text: q.reminder })
        ]));
      }

      // מעבר לשאלה קודמת — התשובות שנפתרו נשמרות
      if (state.i > 0) {
        blocks.push(el('div', { class: 'btn-row' }, [
          el('button', {
            type: 'button', class: 'btn btn--ghost',
            onclick: function () { state.i -= 1; render(); }
          }, [
            el('span', { 'aria-hidden': 'true', text: '→' }),
            document.createTextNode(' לשאלה הקודמת')
          ])
        ]));
      }

      UI.clear(mount);
      mount.appendChild(el('div', { class: 'stack' }, blocks));

      // שאלה שכבר נפתרה — מציגים אותה פתורה, עם מעבר קדימה
      if (solved) {
        if (q.type === 'pick' && figSvg) App.SolidView.lock(figSvg);
        if (control && control.lock) control.lock();
        showFeedback(true, 'כבר פתרתם את השאלה הזאת',
          [para('אפשר להמשיך הלאה, או לחזור אחורה ולהסתכל שוב.')]);
      }
    }

    /* ---------- מסך סיכום ---------- */
    function renderResult() {
      var score = state.answers.filter(function (a) { return a && a.correct; }).length;
      resultScreen({
        mount: mount, act: act, unit: unit,
        score: score, max: questions.length,
        result: cfg.result,
        concepts: questions.map(function (q, k) {
          return { concept: q.concept, correct: state.answers[k] && state.answers[k].correct };
        }),
        onRetry: function () {
          state.i = 0; state.answers = []; state.done = [];
          state.step = 'quiz'; render();
        }
      });
    }

    function render() {
      if (state.step === 'intro') renderIntro();
      else if (state.step === 'quiz') renderQuestion();
      else renderResult();
      UI.scrollTop();
    }

    render();
  }

  App.Kit = {
    markNext: markNext,
    sequence: sequence,
    neighbours: neighbours,
    activityNav: activityNav,
    buildFigure: buildFigure,
    resultScreen: resultScreen,
    Inputs: Inputs,
    quiz: quiz
  };

})(window);
