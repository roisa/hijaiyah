/* Baby Mo Hijaiyah — "Mo is listening!": record your own reading, hear it back, compare with Mo.
   • hands-free: listens to the room for a moment (noise floor), starts when the child speaks, stops after a short
     silence (or on a tap); quiet voices are boosted (auto gain), so soft little voices count
   • live dancing bars while speaking; the recording is trimmed (no silence before/after)
   • playback: "my voice", "compare" (Mo, then me) and a funny voice
   • "Mo listened" stars: compares the RHYTHM and LENGTH (loudness envelope) of the child's reading with Mo's
     recorded clip — it can't judge exact Arabic pronunciation (no offline phone tool can), so it is generous with
     an Indonesian accent and never says "wrong"; the parent's tashih stays the real check
   • nothing is saved or sent anywhere: the audio lives in memory and is gone when the screen closes */
(function () {
  var A = HJ.audio, t = HJ.t, el = HJ.el, esc = HJ.esc;
  var ctx = null, stream = null;
  function ac() { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === "suspended") ctx.resume(); return ctx; }
  var ok = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && (window.AudioContext || window.webkitAudioContext));

  /* ---------- analysis helpers ---------- */
  function rmsFrames(data, sr, ms) {
    var n = Math.max(1, Math.round(sr * (ms || 20) / 1000)), out = [];
    for (var i = 0; i + n <= data.length; i += n) { var s = 0; for (var j = i; j < i + n; j++) s += data[j] * data[j]; out.push(Math.sqrt(s / n)); }
    return out;
  }
  function trim(data, sr, thr) {
    var f = rmsFrames(data, sr, 20), n = Math.round(sr * 0.02), a = -1, b = -1;
    for (var i = 0; i < f.length; i++) if (f[i] > thr) { if (a < 0) a = i; b = i; }
    if (a < 0) return null;
    var pad = 6; a = Math.max(0, a - pad); b = Math.min(f.length - 1, b + pad);
    return data.slice(a * n, (b + 1) * n);
  }
  function envelope(data, sr) {
    var f = rmsFrames(data, sr, 20), m = Math.max.apply(null, f) || 1;
    return f.map(function (x) { return Math.pow(x / m, 0.6); });    // a little compression: shape matters more than volume
  }
  function resample(e, n) { var o = []; for (var i = 0; i < n; i++) { var p = i * (e.length - 1) / (n - 1), a = Math.floor(p), k = p - a; o.push(e[a] * (1 - k) + (e[a + 1] || e[a]) * k); } return o; }
  // dynamic time warping: how similar the two envelopes are even if one is a bit slower here or there
  function dtw(x, y) {
    var n = x.length, m = y.length, D = [], w = Math.max(6, Math.abs(n - m) + 8);
    for (var i = 0; i <= n; i++) { D.push(new Float32Array(m + 1).fill(Infinity)); }
    D[0][0] = 0;
    for (i = 1; i <= n; i++) for (var j = Math.max(1, i - w); j <= Math.min(m, i + w); j++) {
      var c = Math.abs(x[i - 1] - y[j - 1]); D[i][j] = c + Math.min(D[i - 1][j], D[i][j - 1], D[i - 1][j - 1]);
    }
    return D[n][m] / (n + m);
  }
  var refCache = {};
  function refClip(au) {
    if (typeof au !== "string") return Promise.resolve(null);
    var url = A.clipUrl && A.clipUrl(au); if (!url) return Promise.resolve(null);
    if (refCache[url]) return refCache[url];
    return (refCache[url] = fetch(url).then(function (r) { return r.arrayBuffer(); }).then(function (b) {
      return new Promise(function (res) { ac().decodeAudioData(b, res, function () { res(null); }); });
    }).then(function (buf) {
      if (!buf) return null; var d = buf.getChannelData(0), tr = trim(d, buf.sampleRate, 0.02) || d;
      return { env: envelope(tr, buf.sampleRate), dur: tr.length / buf.sampleRate };
    }).catch(function () { return null; }));
  }
  function score(kid, ref) {
    if (!ref) return { stars: kid.dur > 0.25 ? 3 : 2, tip: null, compared: false };
    var ratio = kid.dur / ref.dur, sim = 1 - dtw(resample(kid.env, 48), resample(ref.env, 48)) * 1.6;
    var stars = sim > 0.62 && ratio > 0.55 && ratio < 2.1 ? 3 : sim > 0.45 && ratio > 0.4 && ratio < 2.8 ? 2 : 1;
    var tip = ratio < 0.55 ? "tipLonger" : ratio > 2.1 ? "tipShorter" : stars < 3 ? "tipClearer" : null;
    return { stars: stars, tip: tip, sim: sim, ratio: ratio, compared: true };
  }

  /* ---------- the widget ---------- */
  // HJ.voice.widget({ au: "بَ", big: true, onDone: function (stars) {} }) → element
  function widget(o) {
    o = o || {};
    var w = el("div", "vw" + (o.big ? " big" : "") + (o.compact ? " compact" : ""));
    if (!ok) { w.classList.add("nomic"); return w; }
    var mic = el("button", "vw-mic", HJ.ic("mic") + '<span class="vw-ring"></span>'), lbl = el("span", "vw-lbl", esc(t("micTap")));
    var bars = el("canvas", "vw-bars"), res = el("div", "vw-res");
    mic.setAttribute("aria-label", t("record"));
    var head = el("div", "vw-head"); head.appendChild(mic); head.appendChild(lbl); head.appendChild(bars);
    w.appendChild(head); w.appendChild(res);
    var state = "idle", kidBuf = null, raf = 0, stopFn = null;

    function drawBars(levels) {
      var dpr = Math.min(2, window.devicePixelRatio || 1), W = bars.clientWidth * dpr, H = bars.clientHeight * dpr; if (!W) return;
      bars.width = W; bars.height = H; var g = bars.getContext("2d"), n = levels.length, bw = W / n;
      levels.forEach(function (v, i) { var h = Math.max(3 * dpr, v * H); g.fillStyle = "hsl(" + (150 + i * 9) + ",80%,55%)"; g.beginPath();
        if (g.roundRect) g.roundRect(i * bw + bw * .18, (H - h) / 2, bw * .64, h, bw * .3); else g.rect(i * bw + bw * .18, (H - h) / 2, bw * .64, h); g.fill(); });
    }
    drawBars(new Array(16).fill(0.05));

    function start() {
      if (state === "rec") { stopFn && stopFn("tap"); return; }
      A.stop(); A.unlock(); state = "rec"; res.innerHTML = ""; w.classList.add("rec"); w.classList.remove("done");
      lbl.textContent = t("micListen"); o.onStart && o.onStart();
      navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }).then(function (s) {
        stream = s; var c = ac(), src = c.createMediaStreamSource(s), an = c.createAnalyser(), proc = c.createScriptProcessor(2048, 1, 1);
        an.fftSize = 512; src.connect(an); src.connect(proc); var mute = c.createGain(); mute.gain.value = 0; proc.connect(mute); mute.connect(c.destination);
        var chunks = [], t0 = performance.now(), noise = [], thr = 0.015, spoke = false, lastVoice = 0, voiced = 0, fd = new Uint8Array(an.frequencyBinCount);
        proc.onaudioprocess = function (e) {
          var d = e.inputBuffer.getChannelData(0); chunks.push(new Float32Array(d));
          var s2 = 0; for (var i = 0; i < d.length; i++) s2 += d[i] * d[i]; var r = Math.sqrt(s2 / d.length), now = performance.now() - t0;
          if (now < 300) { noise.push(r); thr = Math.max(0.012, (noise.reduce(function (a, b) { return a + b; }, 0) / noise.length) * 3.2); return; }   // the room's noise
          if (r > thr) { voiced++; if (voiced >= 2) { spoke = true; lastVoice = now; } } else voiced = 0;
          if (spoke && now - lastVoice > 900) finish("silence");          // stopped talking
          else if (!spoke && now > 5500) finish("none");                   // heard nothing
          else if (now > 8000) finish("max");
        };
        (function meter() { an.getByteFrequencyData(fd); var L = []; for (var i = 0; i < 16; i++) { var v = 0; for (var j = 0; j < 6; j++) v += fd[2 + i * 6 + j]; L.push(Math.min(1, v / 6 / 170)); } drawBars(L); raf = requestAnimationFrame(meter); })();
        var ended = false;
        function finish(why) {
          if (ended) return; ended = true; cancelAnimationFrame(raf);
          proc.onaudioprocess = null; try { src.disconnect(); proc.disconnect(); } catch (x) {}
          s.getTracks().forEach(function (tk) { tk.stop(); }); stream = null; w.classList.remove("rec"); state = "idle";
          var len = chunks.reduce(function (a, b) { return a + b.length; }, 0), all = new Float32Array(len), off = 0;
          chunks.forEach(function (ch) { all.set(ch, off); off += ch.length; });
          var tr = trim(all.subarray(Math.round(c.sampleRate * 0.25)), c.sampleRate, thr);
          if (!tr || tr.length < c.sampleRate * 0.15) { lbl.textContent = t("micNone"); A.fx.bad(); w.classList.add("shakeit"); setTimeout(function () { w.classList.remove("shakeit"); }, 450); drawBars(new Array(16).fill(0.05)); return; }
          kidBuf = c.createBuffer(1, tr.length, c.sampleRate); kidBuf.copyToChannel ? kidBuf.copyToChannel(tr, 0) : kidBuf.getChannelData(0).set(tr);
          var kid = { env: envelope(tr, c.sampleRate), dur: tr.length / c.sampleRate };
          lbl.textContent = t("micThinking");
          refClip(o.au).then(function (ref) { show(kid, ref, score(kid, ref)); });
        }
        stopFn = finish;
      }).catch(function () { state = "idle"; w.classList.remove("rec"); w.classList.add("nomic"); lbl.textContent = t("micBlocked"); });
    }
    function play(rate) { if (!kidBuf) return; A.stop(); var c = ac(), s = c.createBufferSource(); s.buffer = kidBuf; s.playbackRate.value = rate || 1; s.connect(c.destination); s.start(); return new Promise(function (r) { s.onended = r; }); }
    function show(kid, ref, sc) {
      w.classList.add("done"); lbl.textContent = t(sc.stars === 3 ? "micGreat" : sc.stars === 2 ? "micGood" : "micTry");
      res.innerHTML = "";
      // Mo's wave and my wave, one above the other
      var cv = el("canvas", "vw-wave"); res.appendChild(cv);
      requestAnimationFrame(function () {
        var dpr = Math.min(2, window.devicePixelRatio || 1), W = cv.clientWidth * dpr, H = cv.clientHeight * dpr; cv.width = W; cv.height = H; var g = cv.getContext("2d");
        function wave(e, y0, h, col, rainbow) { var n = 44, r = resample(e, n), bw = W / n; r.forEach(function (v, i) { var hh = Math.max(2 * dpr, v * h); g.fillStyle = rainbow ? "hsl(" + (i * 8 + 180) + ",85%,58%)" : col; g.fillRect(i * bw + bw * .15, y0 - hh / 2, bw * .7, hh); }); }
        if (ref) { wave(ref.env, H * .27, H * .42, "#22C06E"); g.fillStyle = "rgba(120,120,128,.5)"; g.font = (10 * dpr) + "px Nunito"; g.fillText("Mo", 2 * dpr, 11 * dpr); }
        wave(kid.env, ref ? H * .74 : H / 2, ref ? H * .42 : H * .8, null, true); g.fillStyle = "rgba(120,120,128,.6)"; g.font = (10 * dpr) + "px Nunito"; g.fillText(t("me"), 2 * dpr, H - 4 * dpr);
      });
      var stars = el("div", "vw-stars", [0, 1, 2].map(function (i) { return HJ.art(i < sc.stars ? "star" : "starOff", o.big ? 34 : 26); }).join("") + (sc.tip ? '<small>' + esc(t(sc.tip)) + "</small>" : ""));
      res.appendChild(stars);
      [].forEach.call(stars.querySelectorAll("svg"), function (s, i) { s.style.animationDelay = (i * .18) + "s"; });
      var row = el("div", "vw-btns"), me = el("button", "chip", HJ.ic("play") + " " + esc(t("myVoice"))), cmp = el("button", "chip", HJ.ic("speaker") + " " + esc(t("compare"))),
        fun = el("button", "chip fun", HJ.art("balloon", 18) + " " + esc(t("funnyVoice")));
      me.onclick = function () { play(1); }; fun.onclick = function () { play(1.55); };
      cmp.onclick = function () { A.say(o.au).then(function () { setTimeout(function () { play(1); }, 250); }); };
      row.appendChild(me); if (o.au && typeof o.au === "string") row.appendChild(cmp); row.appendChild(fun); res.appendChild(row);
      if (sc.stars === 3) { A.fx.win(); var r = stars.getBoundingClientRect(); HJ.juice && HJ.juice.burst(r.left + r.width / 2, r.top + r.height / 2, 14); } else A.fx.good();
      setTimeout(function () { play(1); }, 450);           // hear yourself right away — kids love it
      o.onDone && o.onDone(sc.stars, sc);
    }
    mic.onclick = function () { A.fx.tap(); start(); };
    w.stop = function () { stopFn && state === "rec" && stopFn("tap"); };
    return w;
  }

  HJ.voice = { widget: widget, ok: ok, _score: score, _envelope: envelope, _trim: trim };
})();
