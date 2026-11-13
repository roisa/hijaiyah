/* Baby Mo Hijaiyah — optional nature sounds (parents' setting, off by default). No music: a soft breeze made from
   filtered noise, birds chirping now and then by day, crickets in the evening. Everything is synthesised with
   WebAudio (no files). It plays quietly on the menus and even quieter inside a level, and stops when the app is hidden. */
(function () {
  var ctx = null, master = null, noiseSrc = null, timer = null, on = false, duckT = null;
  function setting() { var s = HJ.store && HJ.store.get(); return !!(s && s.settings && s.settings.nature); }
  function ac() {
    if (ctx) return ctx;
    var C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
    ctx = new C(); master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination); return ctx;
  }
  function breeze() {
    var c = ctx, len = c.sampleRate * 4, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0), b0 = 0, b1 = 0, b2 = 0;
    for (var i = 0; i < len; i++) { var w = Math.random() * 2 - 1; b0 = .997 * b0 + w * .029; b1 = .985 * b1 + w * .032; b2 = .95 * b2 + w * .048; d[i] = (b0 + b1 + b2) * .35; }   // soft pink-ish noise
    noiseSrc = c.createBufferSource(); noiseSrc.buffer = buf; noiseSrc.loop = true;
    var lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 520;
    var g = c.createGain(); g.gain.value = .32;
    var lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = .07; lg.gain.value = .18; lfo.connect(lg); lg.connect(g.gain); lfo.start();   // the breeze swells slowly
    var lfo2 = c.createOscillator(), lg2 = c.createGain(); lfo2.frequency.value = .045; lg2.gain.value = 220; lfo2.connect(lg2); lg2.connect(lp.frequency); lfo2.start();
    noiseSrc.connect(lp); lp.connect(g); g.connect(master); noiseSrc.start();
  }
  function chirp(t0) {             // a little bird: 2–5 quick rising/falling whistles
    var c = ctx, n = 2 + (Math.random() * 4 | 0), base = 2600 + Math.random() * 1400, pan = c.createStereoPanner ? c.createStereoPanner() : null;
    if (pan) { pan.pan.value = Math.random() * 1.6 - .8; pan.connect(master); }
    for (var i = 0; i < n; i++) {
      var t = t0 + i * (.09 + Math.random() * .05), o = c.createOscillator(), g = c.createGain(), up = Math.random() < .6;
      o.type = "sine"; o.frequency.setValueAtTime(base * (up ? .8 : 1.15), t); o.frequency.exponentialRampToValueAtTime(base * (up ? 1.25 : .75), t + .07);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.05, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + .08);
      o.connect(g); g.connect(pan || master); o.start(t); o.stop(t + .1);
    }
  }
  function cricket(t0) {           // evening: a soft cricket trill
    var c = ctx, o = c.createOscillator(), g = c.createGain(), am = c.createOscillator(), ag = c.createGain(), dur = .5 + Math.random() * .5;
    o.frequency.value = 4300 + Math.random() * 300; am.frequency.value = 28; ag.gain.value = .5; am.connect(ag); ag.connect(g.gain);
    g.gain.setValueAtTime(.0001, t0); g.gain.linearRampToValueAtTime(.018, t0 + .05); g.gain.linearRampToValueAtTime(.0001, t0 + dur);
    o.connect(g); g.connect(master); o.start(t0); am.start(t0); o.stop(t0 + dur + .05); am.stop(t0 + dur + .05);
  }
  function loop() {
    if (!on || !ctx) return;
    var h = new Date().getHours(), night = h >= 18 || h < 5;
    if (night) { cricket(ctx.currentTime + .05); if (Math.random() < .5) cricket(ctx.currentTime + .7); }
    else chirp(ctx.currentTime + .05);
    timer = setTimeout(loop, (night ? 2500 : 4000) + Math.random() * (night ? 3000 : 6000));
  }
  function level() { var inLevel = !!document.querySelector(".lv-top"); return inLevel ? .35 : .9; }
  function fade(v, s) { if (!master) return; var t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(v, t + (s || 1.2)); }
  function start() {
    if (on || !ac()) return; on = true;
    if (ctx.state === "suspended") ctx.resume().catch(function () {});
    if (!noiseSrc) breeze();
    fade(level(), 2); clearTimeout(timer); timer = setTimeout(loop, 1500);
    clearInterval(duckT); duckT = setInterval(function () { if (on) fade(level(), .8); }, 1500);
  }
  function stop() { if (!on) return; on = false; clearTimeout(timer); clearInterval(duckT); fade(0, .6); }
  function sync() { if (setting() && document.visibilityState === "visible") start(); else stop(); }
  // browsers only start audio after a tap: try on every tap until it runs
  document.addEventListener("pointerdown", function () { if (setting() && !on) sync(); else if (ctx && ctx.state === "suspended" && on) ctx.resume().catch(function () {}); }, true);
  document.addEventListener("visibilitychange", sync);
  HJ.ambience = { sync: sync, on: function () { return on; } };
})();
