/* Baby Mo Hijaiyah — reel engine.
   Plays one reel (from reels.js) on a 1080 × 1920 stage: pastel background, big title, Baby Mo (render 1) jumping,
   cheering and talking, star bursts and confetti, and a phone running the REAL game, played by an animated finger.
   Used three ways: the live player (reel.html?reel=trace&lang=id), the editor (index.html) and the MP4 renderer
   (tools/reels/render.js, which records the stage and adds sound effects from REEL.log).

   A reel is { id, theme, dur, cover, steps: [[time, action, ...args], …] }. Actions:
     ["mo", pose, how]          Baby Mo appears / changes pose. how: "in-left" | "in-right" | "jump" | "wave" | "spin" | "out"
     ["say", {id, en}]          speech bubble next to Mo (null hides it)
     ["title", {id:[l1,l2], en:[l1,l2]}]   big two-line headline (second line in colour); null hides it
     ["sub", {id, en}]          small line under the title
     ["phone", setup]           show the phone with the game; setup: {screen:"home"|"map"|"stickers"|"parents"} or {level:"1-3", at:"pick", hold:true}
                                (hold = stay on that game) or {steps:[…]} or {picks:["ba","ta",…]} (a quick quiz); add dark:true for dark mode
     ["phone-out"]              hide the phone
     ["tap", target]            the finger taps: "answer" (right answer), "wrong", "speaker", "next", "start", a CSS selector
     ["trace", letterKey, secs] the finger writes a letter in the tracing game
     ["pop", n]                 pop n target balloons
     ["train"]                  read the train car by car
     ["bridge"]                 cross the whole bridge
     ["finish"]                 jump to the end of the level (results: stars, sticker)
     ["burst", x, y]            stars burst (stage coordinates 0–1080 / 0–1920); ["confetti"]; ["letters"] floating letters
     ["big", {id, en}, art]     a big springy word in the middle ("3 in a row!") with an art icon
     ["cta"]                    the end card: logo, app name, "Coba sekarang / Try it now"
   Every action also writes REEL.log so the renderer can add the right sound at the right time. */
(function () {
  var R = window.REEL = { log: [], lang: "id", playing: false };
  var stage, bg, titleEl, subEl, moWrap, moImg, bubble, phone, frame, finger, fxLayer, cta, t0 = 0, timers = [];
  var THEMES = {
    mint: ["#DDF7EA", "#E6F1FF", "#12A15A", "#0A9488"], sun: ["#FFF1D2", "#FFE3EC", "#E8590C", "#FF4F7B"],
    sky: ["#DFF0FF", "#EDE7FF", "#2F6FEA", "#8B5CF6"], pink: ["#FFE5EE", "#FFF4D6", "#FF4F7B", "#FF9500"],
    grape: ["#EEE7FF", "#E0F4FF", "#7C3AED", "#2F6FEA"], gold: ["#FFF6DA", "#E9F7EF", "#B7791F", "#12A15A"],
    night: ["#1A2050", "#132B45", "#FFD66B", "#6EE7B7"]
  };
  var tr = function (o) { return !o ? "" : typeof o === "string" ? o : (o[R.lang] || o.id || ""); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function now() { return (performance.now() - t0) / 1000; }
  function log(k, extra) { R.log.push({ t: +now().toFixed(3), k: k, x: extra }); }
  function art(n, s) { return window.HJ && HJ.art ? HJ.art(n, s) : ""; }

  /* ---------- stage ---------- */
  function build(root) {
    root.innerHTML = "";
    stage = el("div", "stage"); root.appendChild(stage);
    bg = el("div", "bg"); stage.appendChild(bg);
    var deco = el("div", "deco"); "ا ب ت ث ج ح خ د ذ ر ز س ش ص".split(" ").forEach(function (c, i) {
      var s = el("span", "ar", c); s.style.left = (6 + (i * 37) % 88) + "%"; s.style.top = (8 + (i * 53) % 84) + "%"; s.style.animationDelay = (-i * 0.7) + "s"; deco.appendChild(s); });
    stage.appendChild(deco);
    titleEl = el("div", "title"); stage.appendChild(titleEl);
    subEl = el("div", "sub"); stage.appendChild(subEl);
    phone = el("div", "phone off"); frame = el("iframe"); frame.setAttribute("scrolling", "no"); phone.appendChild(frame); phone.appendChild(el("div", "island")); stage.appendChild(phone);
    moWrap = el("div", "mo off"); moImg = el("img"); moImg.alt = "Baby Mo"; moWrap.appendChild(moImg); stage.appendChild(moWrap);
    bubble = el("div", "bubble off"); stage.appendChild(bubble);
    fxLayer = el("div", "fx"); stage.appendChild(fxLayer);
    finger = el("img", "finger off"); finger.src = "../../assets/icons/tap-hand.svg"; finger.alt = ""; stage.appendChild(finger);
    cta = el("div", "cta off"); stage.appendChild(cta);
  }
  function theme(name) {
    var g = THEMES[name] || THEMES.mint;
    bg.style.background = "radial-gradient(120% 60% at 0% 0%," + g[0] + ",transparent 70%),radial-gradient(120% 60% at 100% 100%," + g[1] + ",transparent 70%)," + (name === "night" ? "#0E1530" : "#F6F8FC");
    stage.classList.toggle("dark", name === "night");
    stage.style.setProperty("--c1", g[2]); stage.style.setProperty("--c2", g[3]);
  }

  /* ---------- the game inside the phone ---------- */
  var G = function () { return frame.contentWindow && frame.contentWindow.HJ; };
  function loadGame(setup) {
    return new Promise(function (res) {
      frame.onload = function () {
        var w = frame.contentWindow;
        w.localStorage.clear();
        var s = w.HJ.store.get(); s.lang = R.lang; s.langChosen = true; s.name = R.lang === "en" ? "Zayd" : "Ibra"; s.theme = setup.dark ? "dark" : "light";
        s.settings.moVoice = false; s.settings.sfx = false; s.settings.cdn = false; s.settings.unlockAll = !!setup.unlockAll;
        var d = new Date(), today = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
        (setup.done || ["1-1", "1-2", "1-3", "1-4", "1-5", "1-6", "1-7"]).forEach(function (id, i) { s.stars[id] = i % 3 === 1 ? 2 : 3; s.stickers.push(id); });
        s.streak = { last: today, n: 4 }; s.daily = { date: today, done: { level: 1 } };
        s.seen = { pick: 1, yesno: 1, pop: 1, train: 1, bridge: 1, match: 1, build: 1, sort: 1, learn: 1, trace: 1, ayahbuild: 1, ayahfill: 1 };
        w.HJ.store.save();
        frame.onload = function () {
          var H = w.HJ;
          w.document.documentElement.style.setProperty("scrollbar-width", "none");
          H.toast = function () {};                       // no pop-up notes inside reels
          var st2 = w.document.createElement("style"); st2.textContent = ".bubble-wrap{display:none!important}"; w.document.head.appendChild(st2);   // the big reel Mo does the talking
          if (setup.picks) {                              // a quick-fire quiz: one "which one did Mo read?" per letter
            var U = H.util, all = H.L.map(function (l) { return l.k; });
            setup.steps = setup.picks.map(function (k) {
              var q = H.syl(k, "a"), o = H.cousins(k).concat(U.shuffle(all)).filter(function (x) { return x !== k; }).slice(0, 2).map(function (x) { return H.syl(x, "a"); });
              return { type: "pick", q: q, options: U.shuffle([q].concat(o)) };
            });
          }
          if (setup.screen) H.go[setup.screen]();
          else if (setup.level || setup.steps) {
            H.runLevel(setup.level ? H.level(setup.level) : H.level("1-1"), setup.steps ? { steps: setup.steps, noReplay: true } : undefined);
            if (setup.at) skipTo(setup.at);
            if (setup.hold && H._ctx) H._ctx.next = function () {};   // stay on this game until the reel ends
          }
          setTimeout(res, 350);
        };
        w.location.reload();
      };
      frame.src = "../../index.html?reel=1";
    });
  }
  function skipTo(type) { var H = G(); for (var i = 0; i < 25 && H._ctx && H._ctx.alive() && H._ctx.step.type !== type; i++) H._ctx.next(); }
  // a point inside the game → stage coordinates (the phone screen is scaled)
  function toStage(r) {
    var pr = frame.getBoundingClientRect(), sr = stage.getBoundingClientRect(), k = pr.width / 390, ks = 1080 / sr.width;
    return { x: (pr.left - sr.left + (r.left + r.width / 2) * k) * ks, y: (pr.top - sr.top + (r.top + r.height / 2) * k) * ks };
  }
  function moveFinger(p, ms) {
    finger.classList.remove("off");
    finger.style.transition = "transform " + (ms || 380) + "ms cubic-bezier(.3,.7,.3,1)";
    finger.style.transform = "translate(" + (p.x - 30) + "px," + (p.y - 14) + "px)";
  }
  function press() { finger.classList.remove("press"); void finger.offsetWidth; finger.classList.add("press"); }
  function fire(node, x, y) {
    var w = frame.contentWindow, o = { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 1, isPrimary: true, view: w };
    node.dispatchEvent(new w.PointerEvent("pointerdown", o)); node.dispatchEvent(new w.PointerEvent("pointerup", o)); node.dispatchEvent(new w.MouseEvent("click", o));
  }
  function find(target) {
    var H = G(), d = frame.contentDocument, st = H && H._ctx && H._ctx.step;
    if (target === "answer" || target === "wrong") {
      var q = st && (st.q || (st.rounds && st.rounds[d.querySelectorAll(".plank.set").length] || {}).q);
      var tiles = [].slice.call(d.querySelectorAll(".opts .tile:not(.used)"));
      if (st && st.type === "yesno") { var same = st.item.ar === st.heard.ar; return d.querySelectorAll(".row .btn.big")[(target === "answer") === same ? 0 : 1]; }
      return tiles.filter(function (t) { return q && ((t.textContent === q.ar) === (target === "answer")); })[0] || tiles[0];
    }
    if (target === "speaker") return d.querySelector(".stage .speaker");
    if (target === "start") return d.querySelector(".stage .btn.big") || d.querySelector(".panel .btn.big");
    if (target === "next") return [].slice.call(d.querySelectorAll(".btn")).filter(function (b) { return /Lanjut|Next/.test(b.textContent); }).pop();
    return d.querySelector(target);
  }
  function tap(target) {
    var node = typeof target === "string" ? find(target) : target; if (!node) return;
    var r = node.getBoundingClientRect(), p = toStage(r);
    moveFinger(p);
    timers.push(setTimeout(function () { press(); log(target === "wrong" ? "bad" : "tap"); fire(node, r.left + r.width / 2, r.top + r.height / 2); if (target === "answer") setTimeout(function () { log("good"); }, 60); }, 420));
  }
  function traceLetter(k, secs) {
    var H = G(), d = frame.contentDocument, ink = d.querySelector(".tr-ink"); if (!ink) return;
    var ns = "http://www.w3.org/2000/svg", svg = d.createElementNS(ns, "svg"); d.body.appendChild(svg);
    var strokes = H.strokes(k).map(function (s) {
      if (typeof s !== "string") return { dot: s.d };
      var pe = d.createElementNS(ns, "path"); pe.setAttribute("d", s); svg.appendChild(pe);
      var L = pe.getTotalLength(), o = []; for (var i = 0; i <= 60; i++) { var q = pe.getPointAtLength(L * i / 60); o.push([q.x, q.y]); } return { pts: o };
    }); svg.remove();
    var r = ink.getBoundingClientRect(), W = r.width, w = frame.contentWindow, per = (secs || 3) * 1000 / strokes.length;
    var P = function (u, v) { return { x: r.left + u / 100 * W, y: r.top + v / 100 * W }; };
    strokes.forEach(function (s, si) {
      timers.push(setTimeout(function () {
        if (s.dot) { var p = P(s.dot[0], s.dot[1]); moveFinger(toStage({ left: p.x, top: p.y, width: 0, height: 0 }), 300); timers.push(setTimeout(function () { press(); log("pop"); fire(ink, p.x, p.y); }, 320)); return; }
        var p0 = P(s.pts[0][0], s.pts[0][1]); moveFinger(toStage({ left: p0.x, top: p0.y, width: 0, height: 0 }), 300);
        timers.push(setTimeout(function () {
          var o = { bubbles: true, clientX: p0.x, clientY: p0.y, pointerId: 1, isPrimary: true, view: w }; ink.dispatchEvent(new w.PointerEvent("pointerdown", o)); log("draw");
          var i = 1, n = s.pts.length, step = Math.max(12, (per - 420) / n);
          (function mv() {
            if (i >= n) { ink.dispatchEvent(new w.PointerEvent("pointerup", o)); return; }
            var q = P(s.pts[i][0] + Math.sin(i) * .6, s.pts[i][1] + Math.cos(i) * .6); i++;
            ink.dispatchEvent(new w.PointerEvent("pointermove", { bubbles: true, clientX: q.x, clientY: q.y, pointerId: 1, isPrimary: true, view: w }));
            finger.style.transition = "transform " + step + "ms linear"; var sp = toStage({ left: q.x, top: q.y, width: 0, height: 0 }); finger.style.transform = "translate(" + (sp.x - 30) + "px," + (sp.y - 14) + "px)";
            timers.push(setTimeout(mv, step));
          })();
        }, 330));
      }, si * per));
    });
  }
  function popBalloons(n) {
    var d = frame.contentDocument, H = G(), left = n || 4;
    (function look() {
      if (left <= 0 || !H._ctx || !H._ctx.step || H._ctx.step.type !== "pop") return;
      var q = H._ctx.step.q.ar, b = [].slice.call(d.querySelectorAll(".balloon:not(.burst)")).filter(function (x) { var r = x.getBoundingClientRect(); return x.textContent === q && r.top > 160 && r.top < 700; })[0];
      if (b) { tap(b); left--; timers.push(setTimeout(function () { log("pop"); }, 430)); timers.push(setTimeout(look, 900)); } else timers.push(setTimeout(look, 250));
    })();
  }
  function rideTrain() {
    var d = frame.contentDocument;
    var go = [].slice.call(d.querySelectorAll(".row .btn")).filter(function (b) { return /Giliranku|My turn/.test(b.textContent); })[0];
    var start = function () {
      var cars = [].slice.call(d.querySelectorAll(".car"));
      cars.forEach(function (c, i) { timers.push(setTimeout(function () { tap(c); }, 700 + i * 820)); });
      timers.push(setTimeout(function () { log("whoosh"); }, 700 + cars.length * 820 + 900));
    };
    if (go) { go.style.display = ""; tap(go); timers.push(setTimeout(start, 500)); } else start();
  }
  function crossBridge() {
    var H = G(), n = (H._ctx && H._ctx.step.rounds || []).length;
    for (var i = 0; i < n; i++) timers.push(setTimeout(function () { tap("answer"); }, 300 + i * 1150));
    timers.push(setTimeout(function () { log("win"); }, 300 + n * 1150 + 600));
  }
  function buildAyah() {
    var H = G(), d = frame.contentDocument, st = H._ctx && H._ctx.step; if (!st || st.type !== "ayahbuild") return;
    var a = H.surah(st.s).ayahs.filter(function (x) { return x.n === st.a; })[0], words = a.ar.split(" ").filter(function (w) { return w && w !== "ۚ" && w !== "ۖ"; });
    words.forEach(function (wd, i) { timers.push(setTimeout(function () {
      var t = [].slice.call(d.querySelectorAll(".tile.qw:not(.used)")).filter(function (x) { return x.textContent === wd; })[0]; if (t) tap(t); }, i * 900)); });
    timers.push(setTimeout(function () { log("win"); }, words.length * 900 + 500));
  }
  function finishLevel() { var H = G(); for (var i = 0; i < 40 && H._ctx && H._ctx.alive(); i++) H._ctx.next(); log("win"); timers.push(setTimeout(function () { log("star"); }, 500)); timers.push(setTimeout(function () { log("star"); }, 920)); timers.push(setTimeout(function () { log("star"); }, 1340)); }

  /* ---------- Mo, words and effects ---------- */
  function mo(pose, how) {
    if (how === "out") { moWrap.className = "mo off"; return; }
    var src = pose.indexOf("mo2-") === 0 || pose.indexOf("abi") === 0 || pose.indexOf("umi") === 0 ? "art/" + pose + ".webp" : "art/mo-" + pose + ".png";
    moImg.src = src; moWrap.classList.toggle("upper", pose.indexOf("mo2-") === 0);   // render 2 only upper body (art rule)
    moWrap.className = "mo " + (moWrap.classList.contains("upper") ? "upper " : "") + (how || "jump") + " " + (R.moSide || "left");
    void moWrap.offsetWidth; moWrap.classList.add("go");
    log(how === "jump" || how === "spin" ? "boing" : "whoosh");
  }
  function say(o) { if (!o) { bubble.className = "bubble off"; return; } bubble.innerHTML = esc(tr(o)); bubble.className = "bubble " + (R.moSide || "left"); void bubble.offsetWidth; bubble.classList.add("go"); log("pop"); }
  function title(o) {
    if (!o) { titleEl.className = "title off"; return; }
    var l = o[R.lang] || o.id; titleEl.innerHTML = "<span>" + esc(l[0]) + "</span><em>" + esc(l[1] || "") + "</em>";
    titleEl.className = "title"; void titleEl.offsetWidth; titleEl.classList.add("go"); log("whoosh");
  }
  function sub(o) { subEl.innerHTML = o ? esc(tr(o)) : ""; subEl.className = "sub" + (o ? " go" : ""); }
  function burst(x, y, n) {
    for (var i = 0; i < (n || 16); i++) {
      var p = el("div", "p" + (i % 3 ? "" : " s"), i % 3 ? "" : art("star", 54)); if (i % 3) p.style.background = ["#FFC93D", "#FF8FB1", "#5BE38A", "#7CC8FF", "#C9A7FF"][i % 5];
      var a = Math.PI * 2 * i / (n || 16), dd = 160 + Math.random() * 140;
      p.style.left = x + "px"; p.style.top = y + "px"; p.style.setProperty("--dx", Math.cos(a) * dd + "px"); p.style.setProperty("--dy", Math.sin(a) * dd + "px");
      fxLayer.appendChild(p); setTimeout(function (q) { return function () { q.remove(); }; }(p), 1100);
    }
    log("sparkle");
  }
  function confetti() {
    for (var i = 0; i < 90; i++) { var c = el("div", "cf"); c.style.left = Math.random() * 100 + "%"; c.style.background = ["#FF6B6B", "#FFB800", "#3FBF86", "#3B7DD8", "#9A7AF0", "#FF8FB1"][i % 6];
      c.style.animationDuration = (1.8 + Math.random() * 1.6) + "s"; c.style.animationDelay = Math.random() * .4 + "s"; fxLayer.appendChild(c); setTimeout(function (q) { return function () { q.remove(); }; }(c), 4000); }
    log("win");
  }
  function letters() {
    var L = "أَ بَ تَ ثَ جَ حَ خَ دَ رَ سَ شَ صَ عَ فَ قَ كَ لَ مَ نَ هَ يَ".split(" ");
    L.forEach(function (c, i) { var s = el("div", "fl ar", c); s.style.left = (4 + Math.random() * 86) + "%"; s.style.animationDelay = (i * 0.12) + "s"; s.style.color = ["#12A15A", "#2F6FEA", "#FF4F7B", "#E8590C", "#7C3AED"][i % 5];
      fxLayer.appendChild(s); setTimeout(function () { s.remove(); }, 5200); });
    log("sparkle");
  }
  function big(o, a) { var b = el("div", "big", (a ? art(a, 120) : "") + "<b>" + esc(tr(o)) + "</b>"); fxLayer.appendChild(b); setTimeout(function () { b.classList.add("out"); }, 1300); setTimeout(function () { b.remove(); }, 1800); log("combo"); }
  function showCta() {
    cta.innerHTML = '<img class="logo" src="../../assets/brand/icon-buddy-512.png" alt=""><h2>Baby Mo <em>Hijaiyah</em></h2>' +
      "<p>" + esc(R.lang === "en" ? "Learn to read the Qur'an through play" : "Belajar ngaji sambil bermain") + "</p>" +
      '<div class="pills"><span>' + esc(R.lang === "en" ? "No ads" : "Tanpa iklan") + "</span><span>" + esc(R.lang === "en" ? "Works offline" : "Bisa offline") + "</span><span>ID · EN</span></div>" +
      '<div class="go-btn">' + esc(R.lang === "en" ? "Try it now" : "Coba sekarang") + "</div>";
    cta.className = "cta"; void cta.offsetWidth; cta.classList.add("go"); log("win");
  }

  var ACT = {
    mo: function (a) { mo(a[0], a[1]); }, say: function (a) { say(a[0]); }, title: function (a) { title(a[0]); }, sub: function (a) { sub(a[0]); },
    phone: function (a) { phone.className = "phone"; void phone.offsetWidth; phone.classList.add("go"); log("whoosh"); },
    "phone-out": function () { phone.className = "phone off"; finger.classList.add("off"); },
    tap: function (a) { tap(a[0]); }, trace: function (a) { traceLetter(a[0], a[1]); }, pop: function (a) { popBalloons(a[0]); },
    train: function () { rideTrain(); }, build: function () { buildAyah(); }, bridge: function () { crossBridge(); }, finish: function () { finishLevel(); },
    next: function () { var H = G(); H && H._ctx && H._ctx.next(); },
    finger: function (a) { finger.classList.toggle("off", a[0] === false); },
    burst: function (a) { burst(a[0] == null ? 540 : a[0], a[1] == null ? 960 : a[1], a[2]); }, confetti: function () { confetti(); },
    letters: function () { letters(); }, big: function (a) { big(a[0], a[1]); }, cta: function () { phone.className = "phone off"; finger.classList.add("off"); title(null); sub(null); bubble.className = "bubble off"; showCta(); },
    side: function (a) { R.moSide = a[0]; }
  };

  /* ---------- play ---------- */
  R.play = function (root, reel, lang) {
    timers.forEach(clearTimeout); timers = [];
    R.lang = lang || "id"; R.log = []; R.reel = reel; R.moSide = reel.side || "left"; R.done = false;
    build(root); theme(reel.theme);
    // the phone's game must be ready before the clock starts
    var setup = (reel.steps.filter(function (s) { return s[1] === "phone"; })[0] || [])[2];
    var ready = setup ? loadGame(setup) : Promise.resolve();
    return ready.then(function () {
      t0 = performance.now(); R.startWall = Date.now(); R.playing = true;
      reel.steps.forEach(function (s) { timers.push(setTimeout(function () { var f = ACT[s[1]]; try { f && f(s.slice(2)); } catch (e) { console.warn(s, e); } }, s[0] * 1000)); });
      return new Promise(function (res) { timers.push(setTimeout(function () { R.playing = false; R.done = true; res(R.log); }, (reel.dur || 12) * 1000)); });
    });
  };
  R.stop = function () { timers.forEach(clearTimeout); timers = []; R.playing = false; };
})();
