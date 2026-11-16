/* Baby Mo Hijaiyah — soft lesson music.
   A quiet music-box loop (pentatonic, slow) while a lesson is open. It sinks to almost nothing whenever Mo or a
   letter is speaking, so the sounds stay clear. Parents can turn it off (Parents → "Lesson music").
   HJ.music.play() / HJ.music.stop(). Made with Web Audio, no files. */
(function () {
  var A = HJ.audio, S = HJ.store, on = false, timer = null, out = null, next = 0, i = 0, speaking = 0;
  var VOL = .045, DUCK = .006;
  function ac() { return A.ac && A.ac(); }
  function allowed() { var s = (S.get().settings || {}); return s.lessonMusic !== false && s.sfx !== false; }
  // C major pentatonic, a gentle 4-bar tune over soft root notes
  var MEL = [[0, 2], [4, 1], [7, 1], [9, 2], [7, 2], [4, 2], [2, 2], [4, 4], [0, 2], [2, 1], [4, 1], [7, 2], [9, 1], [7, 1], [4, 4], [2, 2], [0, 6]];
  var BASS = [0, 9, 5, 7];
  function note(c, f, t0, d, vol, type) {
    var o = c.createOscillator(), g = c.createGain(); o.type = type || "sine"; o.frequency.value = f;
    g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + .02); g.gain.exponentialRampToValueAtTime(.0001, t0 + d);
    o.connect(g); g.connect(out); o.start(t0); o.stop(t0 + d + .05);
  }
  var beat = 60 / 76 / 2, bar = 0, mi = 0, mt = 0;
  function sched() {
    var c = ac(); if (!c || !on) return;
    while (next < c.currentTime + .4) {
      // melody (music box: a sine with a soft overtone)
      if (mt <= 0) { var m = MEL[mi % MEL.length], f = 523.25 * Math.pow(2, m[0] / 12); note(c, f, next, beat * m[1] * 1.6, .5, "sine"); note(c, f * 2, next, beat * .8, .12, "triangle"); mt = m[1]; mi++; }
      mt--;
      // soft bass every bar
      if (i % 8 === 0) { note(c, 130.81 * Math.pow(2, BASS[bar % 4] / 12), next, beat * 7, .35, "triangle"); bar++; }
      i++; next += beat;
    }
  }
  function level() { if (!out) return; var c = ac(); out.gain.setTargetAtTime(speaking > 0 ? DUCK : VOL, c.currentTime, .12); }
  function play() {
    if (on || !allowed()) return;
    var c = ac(); if (!c) return;
    out = c.createGain(); out.gain.value = .0001; out.connect(c.destination);
    var dl = c.createDelay(); dl.delayTime.value = .32; var fb = c.createGain(); fb.gain.value = .28; out.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(c.destination);
    on = true; next = c.currentTime + .2; i = 0; mi = 0; mt = 0; bar = 0; timer = setInterval(sched, 100); sched(); level();
  }
  function stop() {
    if (!on) return; on = false; clearInterval(timer); var o = out, c = ac(); out = null;
    if (o && c) { o.gain.setTargetAtTime(.0001, c.currentTime, .15); setTimeout(function () { try { o.disconnect(); } catch (e) {} }, 800); }
  }
  // duck under every spoken sound
  function wrap(name) {
    var f = A[name]; if (!f) return;
    A[name] = function () {
      var p = f.apply(A, arguments); speaking++; level();
      var done = function () { speaking = Math.max(0, speaking - 1); level(); };
      if (p && p.then) p.then(done, done); else setTimeout(done, 800);
      return p;
    };
  }
  ["say", "talk", "sayNow"].forEach(wrap);
  HJ.music = { play: play, stop: stop, sync: function () { if (!allowed()) stop(); } };
})();
