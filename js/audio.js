/* Baby Mo Hijaiyah — sound.
   Arabic: recorded clip (audio/huruf, the same Google voice as the Baby Mo app) → phone's Arabic voice.
   Qur'an verses: murottal file audio/quran/SSSAAA.mp3 (tools/fetch-murottal.sh) → on the web only, the
   everyayah.com stream → phone voice as the very last resort.
   Mo's lines: the phone's Indonesian / English voice (can be switched off by the parent).
   Effects are synthesised with WebAudio, so there are no extra files. */
(function () {
  var A = {}, cur = null, seqToken = 0;
  var ctx = null;
  function ac() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; } }
    if (ctx && ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  A.unlock = function () { ac(); };

  function norm(t) { return String(t || "").normalize("NFC").replace(/ـ/g, "").replace(/\s+/g, " ").trim(); }
  function clipFor(t) {
    t = norm(t);
    var m = window.HIJ_VOICE, m2 = window.HJ_VOICE_EXTRA;
    if (m && m[t]) return "audio/huruf/" + m[t];
    if (m2 && m2[t]) return "audio/extra/" + m2[t];
    return null;
  }
  A.hasClip = function (t) { return !!clipFor(t); };

  var voices = [];
  function loadVoices() { try { voices = speechSynthesis.getVoices() || []; } catch (e) {} }
  if (window.speechSynthesis) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
  function voiceFor(lang) {
    var v = voices.filter(function (x) { return x.lang && x.lang.toLowerCase().indexOf(lang) === 0; });
    // prefer good local voices (Majed / Maged on Apple, Google on Android)
    v.sort(function (a, b) { return (b.localService ? 1 : 0) - (a.localService ? 1 : 0); });
    return v[0] || null;
  }
  function tts(text, lang, rate) {
    return new Promise(function (res) {
      if (!window.speechSynthesis) return setTimeout(res, 400);
      try {
        var u = new SpeechSynthesisUtterance(text);
        u.lang = lang === "ar" ? "ar-SA" : lang === "en" ? "en-US" : "id-ID";
        var v = voiceFor(lang === "ar" ? "ar" : lang); if (v) u.voice = v;
        u.rate = rate || (lang === "ar" ? 0.75 : 1.0); u.pitch = lang === "ar" ? 1 : 1.15;
        var done = false, fin = function () { if (!done) { done = true; res(); } };
        u.onend = fin; u.onerror = fin;
        setTimeout(fin, 1500 + text.length * 220);
        speechSynthesis.speak(u);
      } catch (e) { res(); }
    });
  }
  function playUrl(url, rate) {
    return new Promise(function (res, rej) {
      var a = new Audio(url); cur = a;
      a.playbackRate = rate || 1;
      a.onended = function () { res(); };
      a.onerror = function () { rej(new Error("audio")); };
      var p = a.play(); if (p && p.catch) p.catch(rej);
    });
  }
  A.stop = function () {
    seqToken++;
    if (cur) { try { cur.pause(); } catch (e) {} cur = null; }
    try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) {}
  };

  // say one Arabic text
  function sayOne(t) {
    var c = clipFor(t);
    if (c) return playUrl(c).catch(function () { return tts(t, "ar"); });
    return tts(t, "ar");
  }

  // au: "text" | ["text", …] (read one by one, onEach(i) for highlighting)
  A.say = function (au, onEach, gap) {
    A.stop();
    var my = ++seqToken;
    var list = Array.isArray(au) ? au : [au];
    var i = 0;
    return new Promise(function (res) {
      function next() {
        if (my !== seqToken) return res(false);
        if (i >= list.length) { onEach && onEach(-1); return res(true); }
        onEach && onEach(i);
        sayOne(list[i]).then(function () { i++; setTimeout(next, list.length > 1 ? (gap || 260) : 0); });
      }
      next();
    });
  };

  // Murottal for one ayah
  A.reciter = "Husary_128kbps";
  A.ayahFile = function (sNum, aNum) { return ("00" + sNum).slice(-3) + ("00" + aNum).slice(-3) + ".mp3"; };
  A.ayah = function (sNum, aNum, text) {
    A.stop();
    var f = A.ayahFile(sNum, aNum), my = ++seqToken;
    var local = "audio/quran/" + f, cdn = "https://everyayah.com/data/" + A.reciter + "/" + f;
    var allowCdn = !window.HJ_APP_BUILD && (HJ.store ? HJ.store.get().settings.cdn !== false : true);
    return playUrl(local).catch(function () {
      if (my !== seqToken) return;
      if (allowCdn) return playUrl(cdn).catch(function () { return tts(text, "ar", 0.7); });
      return tts(text, "ar", 0.7);
    });
  };

  // Mo talks (Indonesian / English)
  A.talk = function (text, lang) {
    if (HJ.store && HJ.store.get().settings.moVoice === false) return Promise.resolve();
    if (!text) return Promise.resolve();
    A.stop();
    var t = String(text).replace(/[\u{1F300}-\u{1FAFF}☀-➿]/gu, "").replace(/[ء-يً-ْ]+/g, "").trim();
    return tts(t, lang || "id", 1.02);
  };

  /* ---------- effects ---------- */
  function tone(f, d, type, vol, when, slide) {
    var c = ac(); if (!c) return;
    if (HJ.store && HJ.store.get().settings.sfx === false) return;
    var t = c.currentTime + (when || 0), o = c.createOscillator(), g = c.createGain();
    o.type = type || "sine"; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.18, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + 0.02);
  }
  A.fx = {
    tap: function () { tone(660, 0.07, "triangle", 0.12); },
    good: function () { tone(784, 0.12, "triangle", 0.2); tone(1175, 0.18, "triangle", 0.18, 0.09); },
    bad: function () { tone(240, 0.22, "sawtooth", 0.07, 0, 150); },
    pop: function () { tone(500, 0.08, "square", 0.08, 0, 1200); tone(900, 0.06, "sine", 0.12, 0.03); },
    coin: function () { tone(988, 0.08, "square", 0.08); tone(1319, 0.2, "square", 0.08, 0.07); },
    step: function () { tone(330, 0.05, "triangle", 0.1); },
    whoosh: function () { tone(300, 0.25, "sine", 0.08, 0, 900); },
    win: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.22, "triangle", 0.18, i * 0.12); }); tone(1319, 0.5, "triangle", 0.16, 0.5); },
    star: function (i) { tone(880 + i * 220, 0.2, "triangle", 0.18); },
    combo: function (n) { var b = 523 + Math.min(n, 12) * 30; [0, 4, 7, 12].forEach(function (s, i) { tone(b * Math.pow(2, s / 12), 0.16, "triangle", 0.15, i * 0.07); }); },
    unlock: function () { tone(392, 0.12, "square", 0.07); tone(784, 0.1, "triangle", 0.16, 0.1); [1047, 1319, 1568].forEach(function (f, i) { tone(f, 0.25, "triangle", 0.14, 0.22 + i * 0.09); }); },
    sparkle: function () { tone(1568, 0.08, "sine", 0.08); tone(2093, 0.1, "sine", 0.06, 0.05); },
    lose: function () { [440, 392, 330].forEach(function (f, i) { tone(f, 0.25, "triangle", 0.14, i * 0.18); }); }
  };

  /* ---------- record yourself (stays on the device, never uploaded) ---------- */
  var rec = null, chunks = [], stream = null;
  A.canRecord = function () { return !!(navigator.mediaDevices && window.MediaRecorder); };
  A.recStart = function () {
    A.stop();
    return navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) {
      stream = s; chunks = [];
      rec = new MediaRecorder(s);
      rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
      rec.start();
    });
  };
  A.recStop = function () {
    return new Promise(function (res) {
      if (!rec) return res(null);
      rec.onstop = function () {
        var blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
        stream && stream.getTracks().forEach(function (t) { t.stop(); });
        rec = null; res(URL.createObjectURL(blob));
      };
      rec.stop();
    });
  };
  A.playUrl = function (u) { A.stop(); return playUrl(u).catch(function () {}); };

  window.HJ = window.HJ || {}; HJ.audio = A;
})();
