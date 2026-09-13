/* ============================================================
   store.js — שמירת התקדמות מקומית
   ------------------------------------------------------------
   • localStorage בלבד. שום נתון לא עוזב את המכשיר.
   • החלטה D6: שם התלמיד/ה אינו נשמר כאן לעולם.
   • כל גישה עטופה ב-try/catch; אם האחסון חסום — עוברים לזיכרון בלבד.
   ============================================================ */
(function (global) {
  'use strict';

  var KEY = 'gevim.pyramid.progress.v1';
  var SCHEMA_VERSION = 1;

  var memoryOnly = false;   // true אם localStorage אינו זמין
  var cache = null;
  var writeTimer = null;

  /* ---------- ברירת מחדל ---------- */
  function blank() {
    return {
      version: SCHEMA_VERSION,
      createdAt: new Date().toISOString(),
      activities: {},                       // { "1.4": {state, score, max, firstAttempt, attempts, updatedAt} }
      flags: { videoQuestionPassed: false },
      final: { best: null, last: null, attempts: 0, passed: false, takenAt: null },
      badge: { earned: false, earnedAt: null }
    };
  }

  /* ---------- בדיקת זמינות אחסון ---------- */
  function storageAvailable() {
    try {
      var probe = '__gevim_probe__';
      global.localStorage.setItem(probe, '1');
      global.localStorage.removeItem(probe);
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ---------- הגירות בין גרסאות סכימה ----------
     כרגע יש גרסה אחת בלבד. הפונקציה קיימת כדי שהתקדמות של תלמיד
     תשרוד עדכון עתידי של האתר. */
  function migrate(data) {
    if (!data || typeof data !== 'object') return blank();
    if (typeof data.version !== 'number') return blank();
    // if (data.version === 1) { ...הגירה ל-2... }
    if (data.version > SCHEMA_VERSION) return blank();  // נשמר בגרסה חדשה יותר
    var fresh = blank();
    return {
      version: SCHEMA_VERSION,
      createdAt: data.createdAt || fresh.createdAt,
      activities: data.activities && typeof data.activities === 'object' ? data.activities : {},
      flags: Object.assign({}, fresh.flags, data.flags || {}),
      final: Object.assign({}, fresh.final, data.final || {}),
      badge: Object.assign({}, fresh.badge, data.badge || {})
    };
  }

  /* ---------- קריאה ---------- */
  function load() {
    if (cache) return cache;
    if (memoryOnly) { cache = blank(); return cache; }
    try {
      var raw = global.localStorage.getItem(KEY);
      cache = raw ? migrate(JSON.parse(raw)) : blank();
    } catch (e) {
      cache = blank();
    }
    return cache;
  }

  /* ---------- כתיבה (מושהית) ---------- */
  function flush() {
    if (memoryOnly || !cache) return;
    try {
      global.localStorage.setItem(KEY, JSON.stringify(cache));
    } catch (e) {
      memoryOnly = true;                    // מלא, או חסום באמצע ההפעלה
      notify('storage-lost');
    }
  }

  function save() {
    if (writeTimer) clearTimeout(writeTimer);
    writeTimer = setTimeout(flush, 500);
  }

  /* ---------- מנוי לשינויים ---------- */
  var listeners = [];
  function notify(reason) {
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](reason); } catch (e) { /* מאזין תקול לא יפיל את האתר */ }
    }
  }

  /* ============================================================
     API ציבורי
     ============================================================ */
  var Store = {

    SCHEMA_VERSION: SCHEMA_VERSION,

    init: function () {
      memoryOnly = !storageAvailable();
      load();
      // כתיבה אחרונה כשעוזבים את הדף, כדי לא לאבד 500 מ״ש אחרונות
      global.addEventListener('visibilitychange', function () {
        if (global.document.visibilityState === 'hidden') flush();
      });
      global.addEventListener('pagehide', flush);
      return this;
    },

    isMemoryOnly: function () { return memoryOnly; },

    onChange: function (fn) { if (typeof fn === 'function') listeners.push(fn); },

    all: function () { return load(); },

    /* ---------- פעילות בודדת ---------- */
    getActivity: function (id) {
      var a = load().activities[id];
      return a || { state: 'todo', score: 0, max: 0, firstAttempt: null, attempts: 0, updatedAt: null };
    },

    /** state: 'todo' | 'doing' | 'done' */
    setActivity: function (id, patch) {
      var data = load();
      var cur = data.activities[id] || {
        state: 'todo', score: 0, max: 0, firstAttempt: null, attempts: 0, updatedAt: null
      };
      data.activities[id] = Object.assign({}, cur, patch, { updatedAt: new Date().toISOString() });
      save();
      notify('activity:' + id);
      return data.activities[id];
    },

    markDone: function (id, score, max) {
      return this.setActivity(id, {
        state: 'done',
        score: typeof score === 'number' ? score : 0,
        max: typeof max === 'number' ? max : 0
      });
    },

    /** כתיבה מיידית לאחסון, בלי להמתין להשהיה. */
    flushNow: function () {
      if (writeTimer) { clearTimeout(writeTimer); writeTimer = null; }
      flush();
    },

    /**
     * רישום ניסיון שהושלם בפעילות מנוקדת.
     * שומר: מצב השלמה, הציון האחרון, הציון הטוב ביותר ומספר הניסיונות.
     * `score` המוצג ברשימות הוא הציון הטוב ביותר.
     */
    recordAttempt: function (id, score, max) {
      var data = load();
      var cur = data.activities[id] || {};
      var best = (typeof cur.best === 'number') ? Math.max(cur.best, score) : score;
      var first = (typeof cur.firstAttempt === 'number') ? cur.firstAttempt : score;

      data.activities[id] = {
        state: 'done',
        score: best,                 // מוצג ברשימת הפעילויות ובדף ההתקדמות
        max: max,
        best: best,
        last: score,
        lastMax: max,
        firstAttempt: first,
        attempts: (cur.attempts || 0) + 1,
        updatedAt: new Date().toISOString()
      };

      save();
      this.flushNow();               // השלמת פעילות נשמרת מיד, לא בהשהיה
      notify('activity:' + id);
      return data.activities[id];
    },

    clearActivity: function (id) {
      var data = load();
      delete data.activities[id];
      save();
      notify('activity:' + id);
    },

    /* ---------- דגלים ---------- */
    getFlag: function (name) { return !!load().flags[name]; },
    setFlag: function (name, value) {
      load().flags[name] = !!value;
      save();
      notify('flag:' + name);
    },

    /* ---------- מבחן הסיום ---------- */
    recordFinal: function (score, max, passCount) {
      var data = load();
      var passed = score >= passCount;
      data.final.last = { score: score, max: max, at: new Date().toISOString() };
      if (data.final.best === null || score > data.final.best.score) {
        data.final.best = { score: score, max: max, at: new Date().toISOString() };
      }
      data.final.attempts += 1;
      data.final.takenAt = new Date().toISOString();
      if (passed) {
        data.final.passed = true;
        if (!data.badge.earned) {
          data.badge.earned = true;
          data.badge.earnedAt = new Date().toISOString();
        }
      }
      save();
      notify('final');
      return { passed: passed, best: data.final.best, attempts: data.final.attempts };
    },

    /* ---------- סיכומים ---------- */
    /** אחוז השלמה עבור רשימת פעילויות (0–100). */
    unitPercent: function (activities) {
      if (!activities || !activities.length) return 0;
      var data = load();
      var done = 0;
      for (var i = 0; i < activities.length; i++) {
        var rec = data.activities[activities[i].id];
        if (rec && rec.state === 'done') done++;
      }
      return Math.round((done / activities.length) * 100);
    },

    countDone: function (activities) {
      var data = load(), n = 0;
      for (var i = 0; i < activities.length; i++) {
        var rec = data.activities[activities[i].id];
        if (rec && rec.state === 'done') n++;
      }
      return n;
    },

    /* ---------- איפוס ---------- */
    reset: function () {
      cache = blank();
      if (!memoryOnly) {
        try { global.localStorage.removeItem(KEY); } catch (e) { /* אין מה לעשות */ }
      }
      notify('reset');
    }
  };

  global.App = global.App || {};
  global.App.Store = Store;

})(window);
