/* ============================================================
   ui.js — עזרי תצוגה משותפים
   יצירת אלמנטים, הכרזות לקוראי מסך, טוסט, טבעת התקדמות.
   ============================================================ */
(function (global) {
  'use strict';

  var doc = global.document;

  /** יצירת אלמנט: el('div', {class:'x'}, [child, 'text']) */
  function el(tag, attrs, children) {
    var node = doc.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') node.className = v;
        else if (k === 'text') {
          // תגיות שאינן יכולות להכיל צאצאים מקבלות טקסט פשוט
          if (tag === 'option' || tag === 'title' || tag === 'textarea') node.textContent = v;
          else { node.textContent = ''; node.appendChild(math(v)); }
        }
        else if (k === 'html') node.innerHTML = v;
        else if (k.indexOf('on') === 0 && typeof v === 'function') {
          node.addEventListener(k.slice(2).toLowerCase(), v);
        } else node.setAttribute(k, v === true ? '' : v);
      });
    }
    if (children) {
      (Array.isArray(children) ? children : [children]).forEach(function (c) {
        if (c === null || c === undefined || c === false) return;
        node.appendChild(typeof c === 'string' ? doc.createTextNode(c) : c);
      });
    }
    return node;
  }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  /** מספר מבודד מכיווניות, כדי שלא יתהפך בתוך טקסט עברי */
  function num(value) {
    return el('bdi', { class: 'num', text: String(value) });
  }

  /* ------------------------------------------------------------
     מספר תחנה לצד שמה
     ------------------------------------------------------------
     "2.10" ו-"בעיות מהחיים" הם שני כיוונים שונים. המספר חייב להישאר
     משמאל לימין, השם מימין לשמאל, והרווח ביניהם חייב להיות אמיתי.

     רווח מוקלד נבלע על גבול הבידוד הדו־כיווני ואינו נראה, ולכן המרווח
     כאן הוא gap של CSS בין שני אלמנטים נפרדים. שניהם באותה שורה, ולכן
     המספר לא יישאר לבדו בסוף שורה.
     ------------------------------------------------------------ */
  function numTitle(id, title, cls) {
    /* המרווח הוא מבני, ולכן אין בטקסט עצמו תו רווח. כדי שקורא מסך
       וכל קוד שקורא טקסט יקבלו בכל זאת מחרוזת תקינה, השם הנגיש נשמר
       במפורש. */
    return el('span', {
      class: 'num-title' + (cls ? ' ' + cls : ''),
      'data-readable': String(id) + ' ' + String(title)
    }, [
      el('bdi', { class: 'num num-title__num', text: String(id) }),
      el('span', { class: 'num-title__text', text: String(title) })
    ]);
  }

  /** טקסט קריא של צומת: מצרף מקטעים שנפרדים במבנה ולא ברווח מוקלד */
  function readable(node) {
    if (!node) return '';
    var parts = [];
    [].forEach.call(node.querySelectorAll('[data-readable]'), function (n) {
      parts.push(n.getAttribute('data-readable'));
    });
    if (parts.length) return parts.join('. ');
    return node.textContent;
  }

  /* ------------------------------------------------------------
     תרגילי חשבון בתוך משפט בעברית
     ------------------------------------------------------------
     בפסקה בעברית הסימנים ×, :, = ו-+ הם תווים ניטרליים: האלגוריתם
     הדו־כיווני נותן להם את כיוון הפסקה, ולכן תרגיל כמו 90 : 3 = 30
     היה מוצג הפוך. תרגיל נכתב תמיד משמאל לימין.

     הפונקציה מאתרת רצף שכולו ספרות, סימני פעולה וסוגריים, ועוטפת אותו
     ב-bdi עם כיוון שמאל־לימין. מילה בעברית קוטעת את הרצף, ולכן נוסחה
     מילולית כמו (שטח הבסיס × גובה) : 3 נשארת בכיוון הפסקה, כרצוי.
     ------------------------------------------------------------ */
  var MATH_RUN = /[0-9\u00D7\u00F7:=+\-.,\s()]+/g;
  var STARTS   = /[0-9(]/;
  var ENDS     = /[0-9)]/;
  var HAS_OP   = /[\u00D7\u00F7:=]/;

  /** תיבת תרגיל: bdi עם כיוון קבוע, בלי לעבור שוב דרך el */
  function mathBox(text) {
    var node = doc.createElement('bdi');
    node.className = 'math';
    node.setAttribute('dir', 'ltr');
    node.textContent = text;
    return node;
  }

  /** מחזיר רשימת מקטעים, או null כשאין בטקסט תרגיל כזה */
  function mathSplit(str) {
    var parts = [], last = 0, m;
    MATH_RUN.lastIndex = 0;
    while ((m = MATH_RUN.exec(str)) !== null) {
      var raw = m[0], a = 0, b = raw.length;
      while (a < b && !STARTS.test(raw.charAt(a))) a++;
      while (b > a && !ENDS.test(raw.charAt(b - 1))) b--;
      var core = raw.slice(a, b);
      if (core.length < 3 || !HAS_OP.test(core)) continue;
      var from = m.index + a, to = m.index + b;
      if (from > last) parts.push(str.slice(last, from));
      parts.push(mathBox(core));
      last = to;
    }
    if (!parts.length) return null;
    if (last < str.length) parts.push(str.slice(last));
    return parts;
  }

  /** צומת טקסט שבו כל תרגיל חשבון מבודד לכיוון שמאל־לימין */
  function math(str) {
    str = String(str);
    var parts = mathSplit(str);
    if (!parts) return doc.createTextNode(str);
    var frag = doc.createDocumentFragment();
    parts.forEach(function (p) {
      frag.appendChild(typeof p === 'string' ? doc.createTextNode(p) : p);
    });
    return frag;
  }

  /* ------------------------------------------------------------
     תרגיל שנקרא משמאל לימין בתוך דף בעברית
     ------------------------------------------------------------
     dir לבדו אינו מספיק: שני איברים סמוכים שאינם ספרות
     מצטרפים לרצף אחד ומתחלפים ביניהם. לכן כל אסימון
     הוא אלמנט נפרד בשורת inline-flex, והסדר על המסך הוא
     סדר ה-DOM בלבד. מה שכתוב ראשון מופיע שמאלי ביותר, וזה
     גם הסדר שקורא מסך מקריא.

     מקבל רשימת אסימונים, למשל ['9', '×', '3', '=', '27', '₪'].
     ------------------------------------------------------------ */
  var OPERATOR = /^[=+−×÷:-]$/;

  function equation(tokens) {
    return el('span', { class: 'formula-ltr', dir: 'ltr' },
      tokens.map(function (t) {
        var text = String(t);
        return el('span', {
          class: OPERATOR.test(text) ? 'formula-tok formula-op' : 'formula-tok',
          text: text
        });
      }));
  }

  /** הכרזה לקוראי מסך (aria-live) */
  function announce(message) {
    var region = doc.getElementById('a11y-announcer');
    if (!region) return;
    region.textContent = '';
    // דחייה קצרה מכריחה קוראי מסך להקריא גם טקסט זהה לקודם
    global.setTimeout(function () { region.textContent = message; }, 60);
  }

  /** הודעה קצרה וחולפת */
  var toastTimer = null;
  function toast(message) {
    var node = doc.getElementById('toast');
    if (!node) return;
    node.textContent = message;
    node.setAttribute('data-show', 'true');
    announce(message);
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = global.setTimeout(function () {
      node.setAttribute('data-show', 'false');
    }, 2600);
  }

  /** פס התקדמות */
  function progressBar(percent, variant, label) {
    var pct = Math.max(0, Math.min(100, percent));
    var fillClass = 'progress__fill' +
      (pct === 100 ? ' progress__fill--done' : (variant ? ' progress__fill--' + variant : ''));

    return el('div', { class: 'progress' }, [
      el('div', { class: 'progress__label' }, [
        el('span', { text: label || '' }),
        el('span', {}, [num(pct + '%')])
      ]),
      el('div', {
        class: 'progress__track',
        role: 'progressbar',
        'aria-valuenow': pct,
        'aria-valuemin': '0',
        'aria-valuemax': '100',
        'aria-label': label || 'התקדמות'
      }, [
        el('div', { class: fillClass, style: 'inline-size:' + pct + '%' })
      ])
    ]);
  }

  /** טבעת התקדמות (SVG) */
  function progressRing(percent, variant) {
    var pct = Math.max(0, Math.min(100, percent));
    var r = 34, c = 2 * Math.PI * r;
    var offset = c * (1 - pct / 100);
    var NS = 'http://www.w3.org/2000/svg';

    var svg = doc.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'ring');
    svg.setAttribute('viewBox', '0 0 88 88');
    svg.setAttribute('width', '88');
    svg.setAttribute('height', '88');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'הושלמו ' + pct + ' אחוזים');

    function circle(cls, dash, off) {
      var el2 = doc.createElementNS(NS, 'circle');
      el2.setAttribute('class', cls);
      el2.setAttribute('cx', '44');
      el2.setAttribute('cy', '44');
      el2.setAttribute('r', String(r));
      el2.setAttribute('fill', 'none');
      el2.setAttribute('stroke-width', '9');
      el2.setAttribute('stroke-linecap', 'round');
      if (dash) { el2.setAttribute('stroke-dasharray', String(dash)); }
      if (off !== undefined) { el2.setAttribute('stroke-dashoffset', String(off)); }
      return el2;
    }

    svg.appendChild(circle('ring__track'));
    var fill = circle('ring__fill' + (variant ? ' ring__fill--' + variant : ''), c, offset);
    // ‎-90° כדי שהמילוי יתחיל מלמעלה
    fill.setAttribute('transform', 'rotate(-90 44 44)');
    svg.appendChild(fill);

    var text = doc.createElementNS(NS, 'text');
    text.setAttribute('class', 'ring__text');
    text.setAttribute('x', '44');
    text.setAttribute('y', '49');
    text.setAttribute('text-anchor', 'middle');
    text.textContent = pct + '%';
    svg.appendChild(text);

    return svg;
  }

  /** תג מצב */
  function stateChip(state) {
    var S = global.PyramidData.strings.states;
    var map = {
      todo:   { cls: 'chip--todo',   text: S.todo },
      doing:  { cls: 'chip--doing',  text: S.doing },
      done:   { cls: 'chip--done',   text: S.done },
      locked: { cls: 'chip--locked', text: S.locked }
    };
    var conf = map[state] || map.todo;
    return el('span', { class: 'chip ' + conf.cls }, [
      el('span', { 'aria-hidden': 'true', text: state === 'done' ? '✔' : (state === 'doing' ? '◐' : '○') }),
      el('span', { text: conf.text })
    ]);
  }

  /** גלילה לראש הדף בכל מעבר מסך */
  function scrollTop() {
    global.scrollTo({ top: 0, behavior: 'auto' });
  }

  global.App = global.App || {};
  global.App.UI = {
    el: el,
    clear: clear,
    num: num,
    numTitle: numTitle,
    readable: readable,
    math: math,
    equation: equation,
    announce: announce,
    toast: toast,
    progressBar: progressBar,
    progressRing: progressRing,
    stateChip: stateChip,
    scrollTop: scrollTop
  };

})(window);
