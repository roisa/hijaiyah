/* Baby Mo Hijaiyah — "fun pass": things that make a level feel like an adventure, not a worksheet.
   track() : the progress bar becomes a little road; Mo runs along it toward a gift box, one hop per step
   bonus() : once per level, half way, a 7-second "Catch the stars!" break (just fun, nothing to get wrong)
   gift()  : at the end of a level the gift box at the end of the road is opened (3 taps) → a different surprise
             each time: Mo's dance party, fireworks, or a balloon rain to pop
   All of it is skipped or made still when the phone asks for reduced motion. */
(function () {
  var A = HJ.audio, t = HJ.t, J = HJ.juice, U = HJ.util;
  var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function lang() { return HJ.store.get().lang; }
  var MO = "assets/mo/mo-";

  /* ---------- Mo's face for the road: cut from the render 1 picture, centred on his face (made once) ---------- */
  var faceCache = null;
  function faceUrl(cb) {
    if (faceCache) return cb(faceCache);
    var im = new Image();
    im.onload = function () {
      try {
        var W0 = im.naturalWidth, H0 = im.naturalHeight, c = document.createElement("canvas"); c.width = 120; c.height = Math.round(120 * H0 / W0);
        var g = c.getContext("2d"); g.drawImage(im, 0, 0, c.width, c.height);
        var d = g.getImageData(0, 0, c.width, c.height).data, top = c.height, x0 = c.width, x1 = 0;
        for (var y = 0; y < c.height; y++) for (var x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 60) { if (y < top) top = y; }
        // the head is the top ~30% of the figure; find its width on the row through the eyes
        var row = top + Math.round(c.height * .12);
        for (x = 0; x < c.width; x++) if (d[(row * c.width + x) * 4 + 3] > 60) { if (x < x0) x0 = x; if (x > x1) x1 = x; }
        var k = W0 / c.width, side = (x1 - x0) * k * 1.12, cx = (x0 + x1) / 2 * k, cy = top * k + side * .5;
        var o = document.createElement("canvas"); o.width = o.height = 128; var q = o.getContext("2d");
        var bgr = q.createLinearGradient(0, 0, 0, 128); bgr.addColorStop(0, "#BFE6FF"); bgr.addColorStop(1, "#E9F7FF");
        q.beginPath(); q.arc(64, 64, 64, 0, 7); q.clip(); q.fillStyle = bgr; q.fillRect(0, 0, 128, 128);
        q.drawImage(im, cx - side / 2, cy - side / 2, side, side, 0, 0, 128, 128);
        faceCache = o.toDataURL();
      } catch (e) { faceCache = MO + "pose-41.webp"; }
      cb(faceCache);
    };
    im.onerror = function () { cb(MO + "pose-41.webp"); };
    im.src = MO + "pose-41.webp";
  }

  /* ---------- the road ---------- */
  function track(boss) {
    var w = el("div", "road"), n = 0;
    w.innerHTML = '<div class="road-in"><div class="road-line"><i></i></div><div class="road-dots"></div>' +
      '<div class="road-mo"><span class="rm-head"></span><i class="rm-tail"></i></div></div>' +
      '<div class="road-end">' + HJ.art(boss ? "trophy" : "gift", 34) + "</div>";
    faceUrl(function (u) { var h = w.querySelector(".rm-head"); if (h) h.style.backgroundImage = "url(" + u + ")"; });
    var fill = w.querySelector(".road-line i"), mo = w.querySelector(".road-mo"), dots = w.querySelector(".road-dots"), end = w.querySelector(".road-end");
    function dotsFor(total) {
      if (dots.childElementCount === total) return;
      dots.innerHTML = "";
      for (var i = 1; i < total; i++) { var d = el("i"); d.style.left = (i / total * 100) + "%"; dots.appendChild(d); }
    }
    return {
      el: w, end: end, fill: fill,
      set: function (idx, total) {
        dotsFor(total);
        var f = Math.max(0, Math.min(1, idx / total));
        fill.style.width = (f * 100) + "%"; mo.style.left = (f * 100) + "%";
        [].forEach.call(dots.children, function (d, i) { d.classList.toggle("on", i + 1 <= idx); });
        if (idx > n) { mo.classList.remove("jump"); void mo.offsetWidth; mo.classList.add("jump"); }
        n = idx;
        if (f >= 1) end.classList.add("reached");
      }
    };
  }

  /* ---------- the mid-level break: catch the stars ---------- */
  function bonus(done) {
    var layer = el("div", "bonus"), got = 0, over = false, timers = [];
    var head = el("div", "bonus-h", '<b>' + esc(t("bonusT")) + '</b><span class="bonus-n">' + HJ.art("star", 26) + " <span>0</span></span>");
    var mo = el("img", "bonus-mo mo-g"); mo.src = MO + "yeyy.webp"; mo.alt = "";
    layer.appendChild(head); layer.appendChild(mo);
    document.body.appendChild(layer);
    A.fx.whoosh(); A.talk(t("bonusT"), lang());
    var num = head.querySelector(".bonus-n span");
    function drop() {
      if (over) return;
      var s = el("button", "bonus-star", HJ.art(Math.random() < .18 ? "heart" : "star", 64));
      s.setAttribute("aria-label", t("stars"));
      s.style.left = (8 + Math.random() * 74) + "vw";
      var dur = 3.6 + Math.random() * 1.6; s.style.animationDuration = dur + "s";
      s.onpointerdown = function (e) {
        e.preventDefault(); if (s.classList.contains("got") || over) return;
        s.classList.add("got"); got++; num.textContent = got; A.fx.note(got); J.burst(e.clientX, e.clientY, 10, true); J.buzz(12); J.bump(head.querySelector(".bonus-n"));
        if (got % 4 === 0) { mo.src = MO + U.pick(["wow", "pose-02", "yeyy", "pose-37"]) + ".webp"; mo.classList.remove("hop"); void mo.offsetWidth; mo.classList.add("hop"); }
        setTimeout(function () { s.remove(); }, 260);
      };
      layer.appendChild(s);
      setTimeout(function () { s.remove(); }, dur * 1000 + 50);
    }
    if (calm) {      // still version: six stars to tap, no falling
      for (var i = 0; i < 6; i++) { drop(); }
      [].forEach.call(layer.querySelectorAll(".bonus-star"), function (s, i) { s.style.top = (22 + (i % 3) * 22) + "vh"; s.style.left = (14 + (i / 3 | 0) * 44 + (i % 3) * 8) + "vw"; });
    } else for (var k = 0; k < 15; k++) timers.push(setTimeout(drop, 150 + k * 420));
    timers.push(setTimeout(finish, calm ? 9000 : 7400));
    function finish() {
      if (over) return; over = true; timers.forEach(clearTimeout);
      layer.classList.add("end");
      head.innerHTML = "<b>" + esc(got ? t("bonusDone", { n: got }) : t("great")) + "</b>";
      mo.src = MO + "yeyy.webp"; A.fx.win(); A.talk(got ? t("bonusDone", { n: got }) : t("great"), lang());
      setTimeout(function () { layer.classList.add("out"); }, 1500);
      setTimeout(function () { layer.remove(); done && done(got); }, 1900);
    }
    return { stop: function () { over = true; timers.forEach(clearTimeout); layer.remove(); } };
  }

  /* ---------- the gift at the end of the road ---------- */
  var SURPRISE = ["dance", "fireworks", "balloons"];
  function gift(done) {
    var st = HJ.store.get(), kind = SURPRISE[(st.gifts = (st.gifts || 0) + 1) % SURPRISE.length]; HJ.store.save();
    var taps = 0, opened = false;
    HJ.modal(function (p, close) {
      p.classList.add("gift-pop");
      p.appendChild(el("h2", "", esc(t("giftT"))));
      var box = el("button", "gift-box", HJ.art("gift", 170)); box.setAttribute("aria-label", t("giftT")); p.appendChild(box);
      var dots = el("div", "co-dots", "<i></i><i></i><i></i>"); p.appendChild(dots);
      var stage = el("div", "gift-stage"); p.appendChild(stage);
      var go = el("button", "btn big", t("next") + " " + HJ.ic("next")); go.style.visibility = "hidden"; p.appendChild(go);
      go.onclick = function () { close(); done(); };
      A.talk(t("giftT"), lang());
      box.onclick = function () {
        if (opened) return;
        taps++; A.fx.coin(); J.buzz(18);
        dots.children[taps - 1].classList.add("on");
        box.classList.remove("wob"); void box.offsetWidth; box.classList.add("wob");
        if (taps < 3) return;
        opened = true; box.classList.add("opened"); A.fx.unlock();
        setTimeout(function () { box.style.display = "none"; dots.style.display = "none"; reveal(); }, 380);
      };
      function reveal() {
        p.querySelector("h2").textContent = t("gift_" + kind);
        A.talk(t("gift_" + kind), lang());
        if (kind === "dance") {
          var m = el("img", "gift-dance"); m.alt = "Baby Mo"; m.src = MO + "yeyy.webp"; stage.appendChild(m);
          var poses = ["yeyy", "pose-02", "wow", "pose-37", "alright", "pose-26", "yes", "pose-41"], i = 0;
          var iv = setInterval(function () {
            if (!document.body.contains(m)) return clearInterval(iv);
            m.src = MO + poses[++i % poses.length] + ".webp"; A.fx.note(i);
            m.classList.remove("d1", "d2"); void m.offsetWidth; m.classList.add(i % 2 ? "d1" : "d2");
            if (i % 3 === 0) J.burst(innerWidth / 2, innerHeight / 2 - 60, 12, true);
          }, 520);
          setTimeout(show, 1600);
        } else if (kind === "fireworks") {
          var m2 = el("img", "gift-dance small"); m2.alt = "Baby Mo"; m2.src = MO + "wow.webp"; stage.appendChild(m2);
          var n = 0, fw = setInterval(function () {
            if (!document.body.contains(m2) || n++ > 9) return clearInterval(fw);
            var r = p.getBoundingClientRect();
            J.burst(r.left + 40 + Math.random() * (r.width - 80), r.top + 60 + Math.random() * 160, 18, true); A.fx.sparkle();
          }, 330);
          setTimeout(show, 1400);
        } else {
          stage.classList.add("gift-sky"); var popped = 0, total = 7;
          var cols = (HJ.prize && HJ.prize.balloons()) || ["#FF6B6B", "#FFB800", "#3FBF86", "#3B7DD8", "#9A7AF0"];
          for (var b = 0; b < total; b++) (function (b) {
            var bl = el("button", "gift-balloon"); bl.setAttribute("aria-label", "balloon");
            bl.style.left = (6 + b * 13) + "%"; bl.style.animationDelay = (b * .18) + "s"; bl.style.setProperty("--c", cols[b % cols.length]);
            bl.onpointerdown = function (e) {
              e.preventDefault(); if (bl.classList.contains("pop")) return;
              bl.classList.add("pop"); popped++; A.fx.pop(); J.burst(e.clientX, e.clientY, 10); J.buzz(10);
              if (popped === total) { A.fx.win(); J.burst(e.clientX, e.clientY, 20, true); }
            };
            stage.appendChild(bl);
          })(b);
          setTimeout(show, 1200);
        }
      }
      function show() { go.style.visibility = "visible"; J.bump(go); }
    }, { sticky: true });
  }

  HJ.fun = { track: track, bonus: bonus, gift: gift };
})();
