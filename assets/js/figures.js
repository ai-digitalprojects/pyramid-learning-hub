/* ============================================================
   figures.js — איורים מורכבים לשאלות מילוליות
   ------------------------------------------------------------
   כשבעיה מדברת על שני גופים, איור אחד אינו מספיק. כאן מורכבים
   כמה גופים לכדי איור אחד עם כיתוב בעברית.

   הגופים עצמם נלקחים ממנוע הגאומטריה ומצוירים ב-solid-view,
   בדיוק כמו בכל שאר האתר, כדי שלא ייווצר ייצוג שני וסותר.
   ============================================================ */
(function (global) {
  'use strict';

  var App = global.App = global.App || {};

  function el(tag, attrs, children) { return App.UI.el(tag, attrs, children); }

  /** מצייר כמה גופים באותו קנה מידה, כדי שההשוואה ביניהם תהיה כנה */
  function sameScale(specs) {
    var SV = App.SolidView;
    var first = specs.map(function (sp) { return SV.create(sp); });
    var span = first.reduce(function (m, svg) {
      return Math.max(m, parseFloat(svg.getAttribute('data-span')) || 0);
    }, 0);
    return specs.map(function (sp) {
      var copy = {}; Object.keys(sp).forEach(function (k) { copy[k] = sp[k]; });
      copy.span = span;
      return SV.create(copy);
    });
  }

  /** גוף אחד עם כותרת מעליו וכיתוב מתחתיו */
  function panel(svg, title, caption) {
    return el('figure', { class: 'combo__part' }, [
      el('figcaption', { class: 'combo__title', text: title }),
      svg,
      caption ? el('p', { class: 'combo__note', text: caption }) : null
    ]);
  }

  /* ------------------------------------------------------------
     שתי אריזות פופקורן: אותו בסיס ואותו גובה, מחיר שונה
     ------------------------------------------------------------ */
  function twoPackets() {
    var G = App.Geometry;
    var opts = { view: 'front', size: 190, margin: 30 };

    var drawn = sameScale([
      { geometry: G.prism(4, { radius: 1, height: 1.5 }),
        view: opts.view, size: opts.size, margin: opts.margin,
        ariaLabel: 'אריזה בצורת תיבה, בסיס ריבועי וגובה זהים לאלה של הפירמידה שלצדה.' },
      { geometry: G.pyramid(4, { radius: 1, height: 1.5 }),
        view: opts.view, size: opts.size, margin: opts.margin,
        ariaLabel: 'אריזה בצורת פירמידה, עם אותו בסיס ריבועי ואותו גובה כמו התיבה שלצדה.' }
    ]);
    var box = drawn[0], pyr = drawn[1];

    return el('div', { class: 'combo', role: 'group',
      'aria-label': 'שתי אריזות פופקורן זו לצד זו: תיבה במחיר 24 שקלים ופירמידה במחיר 9 שקלים, שתיהן באותו בסיס ובאותו גובה.'
    }, [
      panel(box, 'אריזת תיבה', '24 שקלים'),
      panel(pyr, 'אריזת פירמידה', '9 שקלים')
    ]);
  }

  /* ------------------------------------------------------------
     מבנה משני חלקים: מנסרה ומעליה פירמידה
     ------------------------------------------------------------
     האיור מפרק את המבנה לשני חלקיו, וזה בדיוק הצעד הראשון בפתרון:
     מחשבים כל חלק בנפרד ואז מחברים.
     ------------------------------------------------------------ */
  function prismAndRoof() {
    var G = App.Geometry;
    var size = 190, margin = 34;

    /* הגבהים 5 ו-6 מצוירים ביחס הנכון ביניהם, ועל אותו בסיס */
    var parts = sameScale([
      { geometry: G.prism(4, { radius: 1, height: 1.0 }),
        view: 'front', size: size, margin: margin,
        show: { height: true },
        measures: { height: '5 ס״מ', baseArea: 'שטח הבסיס 40 סמ״ר' },
        ariaLabel: 'החלק התחתון של המבנה: מנסרה ששטח בסיסה 40 סמ״ר וגובהה 5 ס״מ.' },
      { geometry: G.pyramid(4, { radius: 1, height: 1.2 }),
        view: 'front', size: size, margin: margin,
        show: { height: true },
        measures: { height: '6 ס״מ', baseArea: 'אותו בסיס, 40 סמ״ר' },
        ariaLabel: 'החלק העליון של המבנה: פירמידה על אותו בסיס, 40 סמ״ר, וגובהה 6 ס״מ.' }
    ]);
    var body = parts[0], roof = parts[1];

    return el('div', { class: 'combo', role: 'group',
      'aria-label': 'המבנה מורכב משני חלקים: מנסרה למטה ופירמידה מעליה, שתיהן על אותו בסיס ששטחו 40 סמ״ר.'
    }, [
      el('p', { class: 'combo__lead', text: 'המבנה מורכב משני חלקים, זה מעל זה:' }),
      panel(roof, 'למעלה: פירמידה', 'גובה 6 ס״מ'),
      panel(body, 'למטה: מנסרה', 'גובה 5 ס״מ')
    ]);
  }

  App.Figures = {
    twoPackets: twoPackets,
    prismAndRoof: prismAndRoof
  };

})(window);
