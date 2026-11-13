/* Baby Mo Hijaiyah — "juice": the small motions that make every tap feel good.
   burst()  : stars and dots pop out where the finger touched
   fly()    : a sparkle flies from the answer to a target (the progress bar, the star jar) and the target bounces
   banner() : a big "Combo x3!" / "Book unlocked!" banner that springs in and out
   countUp(): numbers that count up
   buzz()   : a tiny vibration on Android (iPhones ignore it)
   All effects are skipped when the phone asks for reduced motion. */
(function () {
  var J = {}, last = { x: innerWidth / 2, y: innerHeight / 2 };
  var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.addEventListener("pointerdown", function (e) { last = { x: e.clientX, y: e.clientY }; }, true);
  J.at = function () { return { x: last.x, y: last.y }; };
  var COL = ["#FFC93D", "#FF8FB1", "#5BE38A", "#7CC8FF", "#C9A7FF", "#FF9F45"];

  J.burst = function (x, y, n, big) {
    if (calm) return;
    if (x == null) { x = last.x; y = last.y; }
    n = n || 12;
    for (var i = 0; i < n; i++) {
      var star = i % 3 === 0, p = document.createElement("div");
      p.className = "jp" + (star ? " s" : "");
      if (star) p.innerHTML = HJ.art("star", big ? 26 : 18); else p.style.background = COL[i % COL.length];
      var a = (Math.PI * 2 * i) / n + Math.random() * .5, d = (big ? 90 : 60) + Math.random() * (big ? 70 : 40);
      p.style.left = x + "px"; p.style.top = y + "px";
      p.style.setProperty("--dx", Math.cos(a) * d + "px"); p.style.setProperty("--dy", Math.sin(a) * d - 20 + "px");
      p.style.setProperty("--r", (Math.random() * 360 - 180) + "deg");
      p.style.animationDuration = (520 + Math.random() * 260) + "ms";
      document.body.appendChild(p);
      setTimeout(function (q) { return function () { q.remove(); }; }(p), 900);
    }
  };

  J.fly = function (from, to, html, done) {
    if (!to) { done && done(); return; }
    var r = to.getBoundingClientRect(), tx = r.left + r.width / 2, ty = r.top + r.height / 2;
    if (calm) { J.bump(to); done && done(); return; }
    from = from || last;
    var f = document.createElement("div"); f.className = "jfly"; f.innerHTML = html || HJ.art("star", 26);
    f.style.left = from.x + "px"; f.style.top = from.y + "px"; document.body.appendChild(f);
    var t0 = performance.now(), dur = 620, cx = (from.x + tx) / 2 + (Math.random() * 80 - 40), cy = Math.min(from.y, ty) - 90;
    (function step(t) {
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 2.2), u = 1 - e;
      var x = u * u * from.x + 2 * u * e * cx + e * e * tx, y = u * u * from.y + 2 * u * e * cy + e * e * ty;
      f.style.transform = "translate(" + (x - from.x) + "px," + (y - from.y) + "px) scale(" + (1 - k * .45) + ") rotate(" + k * 300 + "deg)";
      if (k < 1) requestAnimationFrame(step); else { f.remove(); J.bump(to); done && done(); }
    })(t0);
  };

  J.bump = function (el) { if (!el) return; el.classList.remove("jbump"); void el.offsetWidth; el.classList.add("jbump"); };

  J.banner = function (html, cls) {
    var b = document.createElement("div"); b.className = "jbanner " + (cls || ""); b.innerHTML = html;
    document.body.appendChild(b);
    setTimeout(function () { b.classList.add("out"); }, 1100); setTimeout(function () { b.remove(); }, 1500);
  };

  J.countUp = function (el, from, to, ms) {
    if (calm || from === to) { el.textContent = to; return; }
    var t0 = performance.now(); ms = ms || 900;
    (function step(t) { var k = Math.min(1, (t - t0) / ms); el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step); })(t0);
  };

  J.buzz = function (p) { try { if (navigator.vibrate && HJ.store.get().settings.sfx !== false) navigator.vibrate(p); } catch (e) {} };

  HJ.juice = J;
})();
