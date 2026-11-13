/* Baby Mo Hijaiyah — the mini-games. Each one draws a step into ctx.stage and calls
   ctx.good() / ctx.bad() / ctx.next(). See app.js runLevel() for ctx. */
(function () {
  var A = HJ.audio, t = HJ.t, tr = HJ.tr, U = HJ.util;
  var COLORS = ["#FF6B6B", "#FFB800", "#3FBF86", "#3B7DD8", "#9A7AF0", "#FF8FB1", "#0EA5B7", "#F2994A"];

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function arHtml(it) {
    var s = esc(it.ar);
    if (it.hl && it.ar.indexOf(it.hl) >= 0) s = s.replace(esc(it.hl), '<span class="hl">' + esc(it.hl) + "</span>");
    return s;
  }
  function arEl(it, cls) { var e = el("div", "ar " + (cls || ""), arHtml(it)); return e; }
  function isWordy(it) { return (it.ar || "").replace(/[ً-ْ\s]/g, "").length > 2; }
  function latinEl(it) { return HJ.store.get().settings.latin && it.tr ? el("div", "lat", esc(HJ.latinFor(it.tr, HJ.store.get().lang))) : el("div"); }
  function sizeCls(it) { return it.quran ? "q" : isWordy(it) ? "w" : ""; }
  function speakerBtn(fn) { var b = el("button", "speaker", HJ.ic("speaker")); b.setAttribute("aria-label", t("listen")); b.onclick = function () { A.fx.tap(); fn(); }; return b; }
  function add(p) { for (var i = 1; i < arguments.length; i++) if (arguments[i]) p.appendChild(arguments[i]); return p; }
  function after(ctx, ms, fn) { setTimeout(function () { if (ctx.alive()) fn(); }, ms); }

  var G = {};

  /* Mo introduces the level */
  G.intro = function (s, ctx) {
    var st = ctx.stage;
    var big = HJ.moImg(s.mo && s.mo.indexOf("mo2:") === 0 ? s.mo : (s.mo || "pose-41"), "150px"); big.classList.add("intro-mo"); st.appendChild(big);
    add(st, el("div", "ask", esc(tr(s.say))));
    if (s.show && s.show.length) {
      var row = el("div", "row");
      s.show.forEach(function (it) {
        var c = el("button", "tile " + sizeCls(it)); c.appendChild(arEl(it));
        c.onclick = function () { A.say(it.au); }; row.appendChild(c);
      });
      st.appendChild(row);
    }
    var b = el("button", "btn big", HJ.ic("play") + " " + t("start")); b.onclick = function () { A.fx.tap(); ctx.next(); };
    st.appendChild(b);
    ctx.mo(null);
    A.talk(tr(s.say), HJ.store.get().lang);
  };

  /* Talaqqi: listen, then copy (3 times) */
  G.learn = function (s, ctx) {
    var it = s.item, st = ctx.stage, heard = 0, said = 0;
    if (s.note && s.note.from) {
      var from = el("div", "row"); from.appendChild(el("div", "bigcard qq")).appendChild(arEl(s.note.from));
      from.appendChild(el("div", "count", HJ.ic("next") + " " + HJ.art("hand", 30)));
      st.appendChild(from);
    }
    add(st, el("div", "ask", t("tapHear")));
    var card = el("button", "bigcard glass " + (it.quran ? "qq" : isWordy(it) ? "wordy" : ""));
    card.appendChild(arEl(it)); card.appendChild(latinEl(it)); card.appendChild(el("span", "tap", HJ.ic("speaker")));
    st.appendChild(card);
    var dots = el("div", "dots", "<i></i><i></i><i></i>");
    var lbl = el("div", "sub", t("copy3"));
    var nextB = el("button", "btn", t("next") + " " + HJ.ic("next")); nextB.style.visibility = "hidden";
    var said3 = el("button", "btn gold small", HJ.ic("bubble") + " " + (HJ.store.get().lang === "en" ? "I said it!" : "Aku sudah baca!"));
    // talaqqi rhythm: Mo says it → the child says it → taps → Mo says it again … three times
    function ready(on) { said3.disabled = !on; said3.classList.toggle("wait", !on); if (on) HJ.juice.bump(said3); }
    function play() {
      ready(false); card.classList.add("speaking");
      A.say(it.au).then(function () { card.classList.remove("speaking"); heard++; if (ctx.alive() && said < 3) { ready(true); ctx.mo("pose-12", t("yourTurnSay")); } });
    }
    card.onclick = function () { A.fx.tap(); play(); };
    said3.onclick = function () {
      if (said >= 3 || said3.disabled) return; said++; A.fx.coin();
      dots.children[said - 1].classList.add("on"); HJ.juice.burst(null, null, 8);
      if (said === 3) { ready(false); ctx.cheer(); nextB.style.visibility = "visible"; HJ.juice.bump(nextB); }
      else { ready(false); after(ctx, 700, play); }
    };
    ready(false);
    add(st, dots, el("div", "row"));
    var r = st.lastChild; r.appendChild(said3); st.appendChild(recorder(it.au, { onDone: function () { if (said < 3) { said3.disabled = false; said3.onclick(); } } }));
    if (s.note && s.note.name) {
      var nm = el("button", "chip", HJ.ic("tag") + " " + t("letterName") + ": <span class='ar' style='font-size:22px'>" + esc(s.note.name) + "</span> " + esc(s.note.nameK ? HJ.letterName(s.note.nameK, HJ.store.get().lang) : ""));
      nm.onclick = function () { A.say(s.note.name); };
      st.appendChild(nm);
    }
    nextB.onclick = function () { ctx.next(); };
    st.appendChild(nextB);
    ctx.mo("pose-12", t("listenFirst"));
    after(ctx, 450, play);
  };

  // record + play back my own voice (local only)
  // record + play back my own voice (local only): the "Mo is listening" widget from js/voice.js
  function recorder(au, opts) { return HJ.voice ? HJ.voice.widget(Object.assign({ au: au, compact: true }, opts || {})) : el("span"); }
  G.recorder = recorder;

  /* Trace the letter */
  G.trace = function (s, ctx) {
    var st = ctx.stage;
    add(st, el("div", "ask", t("trace")));
    var wrap = el("div", "trace-wrap glass"), cv = el("canvas"), meter = el("div", "meter", "<i></i>");
    wrap.appendChild(cv); st.appendChild(wrap); st.appendChild(meter);
    var skip = el("button", "btn small ghost", HJ.ic("skip") + " " + t("skip")); skip.onclick = function () { ctx.next(); }; st.appendChild(skip);
    ctx.mo("pose-08", t("trace"));
    var dpr = Math.min(2, window.devicePixelRatio || 1), W, H, g, mask, total = 0, hit = {}, nhit = 0, done = false;
    function setup() {
      var r = wrap.getBoundingClientRect(); W = Math.round(r.width * dpr); H = Math.round(r.height * dpr);
      cv.width = W; cv.height = H; g = cv.getContext("2d");
      var m = document.createElement("canvas"); m.width = W; m.height = H; var mg = m.getContext("2d");
      mg.fillStyle = "#000"; mg.textAlign = "center"; mg.textBaseline = "middle";
      mg.font = Math.round(H * 0.62) + "px 'Scheherazade New', serif";
      mg.fillText(s.glyph, W / 2, H * 0.47);
      mask = mg.getImageData(0, 0, W, H).data; total = 0;
      for (var y = 0; y < H; y += 6) for (var x = 0; x < W; x += 6) if (mask[(y * W + x) * 4 + 3] > 100) total++;
      draw();
    }
    function draw() {
      g.clearRect(0, 0, W, H);
      g.fillStyle = document.documentElement.getAttribute("data-theme") === "dark" ? "rgba(255,255,255,.22)" : "rgba(21,34,48,.16)";
      g.textAlign = "center"; g.textBaseline = "middle"; g.font = Math.round(H * 0.62) + "px 'Scheherazade New', serif";
      g.fillText(s.glyph, W / 2, H * 0.47);
    }
    var last = null;
    function pt(e) { var r = cv.getBoundingClientRect(), p = e.touches ? e.touches[0] : e; return { x: (p.clientX - r.left) * dpr, y: (p.clientY - r.top) * dpr }; }
    function paint(p) {
      g.strokeStyle = COLORS[(nhit / 12 | 0) % COLORS.length]; g.lineWidth = 26 * dpr; g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); g.moveTo((last || p).x, (last || p).y); g.lineTo(p.x, p.y); g.stroke(); last = p;
      var R = 13 * dpr;
      for (var y = Math.floor((p.y - R) / 6) * 6; y <= p.y + R; y += 6) for (var x = Math.floor((p.x - R) / 6) * 6; x <= p.x + R; x += 6) {
        if (x < 0 || y < 0 || x >= W || y >= H) continue;
        var k = x + "," + y; if (hit[k]) continue;
        if (mask[(y * W + x) * 4 + 3] > 100) { hit[k] = 1; nhit++; }
      }
      var pct = Math.min(1, nhit / (total * 0.6)); meter.firstChild.style.width = (pct * 100) + "%";
      if (pct >= 1 && !done) { done = true; A.fx.win(); ctx.cheer(t("great")); A.say(s.glyph === "ا" ? "أَلِف" : (HJ.BY[s.glyph] || {}).n || s.glyph); after(ctx, 1300, ctx.next); }
    }
    function down(e) { e.preventDefault(); last = null; paint(pt(e)); cv.onpointermove = function (ev) { paint(pt(ev)); }; }
    cv.onpointerdown = down;
    cv.onpointerup = cv.onpointerleave = function () { cv.onpointermove = null; last = null; };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { setTimeout(setup, 30); });
  };

  /* Listen and choose */
  G.pick = function (s, ctx) {
    var st = ctx.stage, locked = false, wrong = 0, right = null;
    add(st, el("div", "ask", esc(s.again ? t("again2") : s.ask ? tr(s.ask) : t("whichOne"))));
    if (s.show) { var sc = el("div", "bigcard glass qq"); sc.appendChild(arEl(s.show)); st.appendChild(sc); }
    else st.appendChild(speakerBtn(function () { A.say(s.q.au); }));
    var opts = el("div", "opts");
    s.options.forEach(function (o) {
      var b = el("button", "tile " + sizeCls(o)); b.appendChild(arEl(o));
      if (o.ar === s.q.ar) right = b;
      b.onclick = function () {
        if (locked) return;
        if (o.ar === s.q.ar) {
          locked = true; b.classList.remove("hint"); b.classList.add("ok"); ctx.good();
          A.say(o.au); after(ctx, 1200, ctx.next);
        } else {
          b.classList.add("no"); setTimeout(function () { b.classList.remove("no"); }, 450);
          ctx.bad(!!s.again, s.q, s.options); after(ctx, 500, function () { A.say(s.q.au); });
          if (++wrong >= 2 && right) right.classList.add("hint");   // gentle help, never stuck
        }
      };
      opts.appendChild(b);
    });
    st.appendChild(opts);
    ctx.mo("pose-36", s.show ? null : t("whichOne"));
    if (!s.show) after(ctx, 350, function () { A.say(s.q.au); });
  };

  /* Is this the right sound? */
  G.yesno = function (s, ctx) {
    var st = ctx.stage, locked = false, same = s.item.ar === s.heard.ar;
    add(st, el("div", "ask", t("isRight")));
    var card = el("button", "bigcard glass " + (s.item.quran ? "qq" : isWordy(s.item) ? "wordy" : "")); card.appendChild(arEl(s.item));
    card.onclick = function () { A.say(s.heard.au); };
    st.appendChild(card);
    var row = el("div", "row"), y = el("button", "btn big", HJ.ic("check") + " " + t("yes")), n = el("button", "btn big red", HJ.ic("close") + " " + t("no"));
    function ans(v, b) {
      if (locked) return;
      if (v === same) {
        locked = true; ctx.good();
        after(ctx, 300, function () { if (!same) A.say(s.item.au); });
        after(ctx, same ? 1000 : 1700, ctx.next);
      } else {
        // no coin-flip second try: show the right answer, let him hear both, then go on (it comes back at the end)
        locked = true; b.classList.add("shake"); setTimeout(function () { b.classList.remove("shake"); }, 450);
        ctx.bad(false, s.item, [s.item, s.heard].filter(function (x, i, a) { return a.findIndex(function (y) { return y.ar === x.ar; }) === i; }));
        (same ? y : n).classList.add("hintb");
        after(ctx, 500, function () { A.say(same ? s.item.au : [s.heard.au, s.item.au]); });
        after(ctx, 2600, ctx.next);
      }
    }
    y.onclick = function () { ans(true, y); }; n.onclick = function () { ans(false, n); };
    row.appendChild(y); row.appendChild(n); st.appendChild(row);
    ctx.mo("pose-36", null);
    after(ctx, 350, function () { A.say(s.heard.au); });
  };

  /* Balloon pop */
  G.pop = function (s, ctx) {
    var st = ctx.stage, need = 4, got = 0, timer = null;
    var head = el("div", "row"), cnt = el("div", "count glass", HJ.art("balloon", 24) + " 0 / " + need);
    head.appendChild(speakerBtn(function () { A.say(s.q.au); }));
    var tg = el("div", "tile mystery"); tg.style.minHeight = "70px"; tg.innerHTML = '<span class="qm">?</span>'; tg.style.pointerEvents = "none";
    head.appendChild(tg); head.appendChild(cnt);
    add(st, el("div", "ask", t("popIt")), head);
    var sky = el("div", "sky"); st.appendChild(sky);
    ctx.mo("yes", null);
    var n = 0, lastTarget = 0, pause = 0, again = setInterval(function () { if (!ctx.alive()) { clearInterval(again); return; } A.say(s.q.au); }, 5200);
    function spawn() {
      if (!ctx.alive()) { clearInterval(timer); return; }
      n++;
      var isT = (n - lastTarget >= 2) || Math.random() < 0.4;
      var it = isT ? s.q : U.pick(s.pool.filter(function (x) { return x.ar !== s.q.ar; }).concat([s.q]));
      if (it.ar === s.q.ar) lastTarget = n;
      var b = el("button", "balloon " + (isWordy(it) ? "w" : ""));
      var BC = (HJ.prize && HJ.prize.balloons()) || COLORS; b.style.background = BC[n % BC.length];
      b.style.left = (5 + Math.random() * 70) + "%";
      b.style.animationDuration = (6.5 + Math.random() * 2.5) + "s";
      b.appendChild(arEl(it));
      b.onpointerdown = function (e) {
        e.preventDefault(); if (b.classList.contains("burst") || performance.now() < pause) return;
        if (it.ar === s.q.ar) {
          if (got === 0) { tg.innerHTML = ""; tg.appendChild(arEl(s.q)); tg.classList.add("revealed"); }
          b.classList.add("burst"); A.fx.pop(); got++; cnt.innerHTML = HJ.art("balloon", 24) + " " + got + " / " + need; A.say(it.au);
          if (got >= need) { clearInterval(timer); clearInterval(again); ctx.cheer(t("great")); A.fx.win(); after(ctx, 1200, ctx.next); }
        } else { b.classList.add("shake"); pause = performance.now() + 900; ctx.bad(true, s.q, s.pool.slice(0, 3).some(function (x) { return x.ar === s.q.ar; }) ? s.pool.slice(0, 3) : [s.q].concat(s.pool.filter(function (x) { return x.ar !== s.q.ar; }).slice(0, 2)));
          A.say([it.au, s.q.au]); }
      };
      b.addEventListener("animationend", function (e) { if (e.animationName === "rise" || e.animationName === "burst") b.remove(); });
      sky.appendChild(b);
    }
    after(ctx, 300, function () { A.say(s.q.au); });
    spawn(); timer = setInterval(spawn, 1050);
  };

  /* Reading train: listen (cars light up), then the child reads, tapping car by car */
  G.train = function (s, ctx) {
    var st = ctx.stage, parts = s.item.parts || s.item.au.map(function (a) { return { ar: a, au: a }; });
    var phase = 0, idx = 0;
    var ask = el("div", "ask", t("listenFirst"));
    var track = el("div", "track"), train = el("div", "train");
    train.appendChild(el("div", "engine-wrap", HJ.engine()));
    var cars = parts.map(function (p, i) {
      var c = el("button", "car " + (isWordy(p) || p.quran ? "w" : "")); c.appendChild(arEl(p));
      c.onclick = function () {
        if (phase !== 1) { A.say(p.au); return; }
        if (i !== idx) { A.fx.tap(); return; }
        c.classList.remove("next"); c.classList.add("read"); A.fx.step(); A.say(p.au);
        idx++;
        if (idx < cars.length) cars[idx].classList.add("next");
        else { phase = 2; ctx.cheer(t("great")); after(ctx, 900, function () { A.fx.whoosh(); train.classList.add("go"); }); after(ctx, 2300, ctx.next); }
      };
      return c;
    });
    cars.forEach(function (c) { train.appendChild(c); });
    track.appendChild(train);
    // long chains: shrink the whole train so every carriage stays on screen
    function fitTrain() { train.style.scale = ""; var w = 28; [].forEach.call(train.children, function (c) { w += c.offsetWidth + 8; }); var k = (track.clientWidth - 12) / w; if (k < 1) { train.style.scale = Math.max(0.55, k).toFixed(3); train.style.transformOrigin = "50% 100%"; } }
    setTimeout(fitTrain, 0); (document.fonts && document.fonts.ready || Promise.resolve()).then(function () { if (ctx.alive()) fitTrain(); });
    var row = el("div", "row"), lb = el("button", "btn gold", HJ.ic("speaker") + " " + t("listen"));
    var tl = latinEl(s.item);
    add(st, ask, track, tl, row);
    row.appendChild(lb);
    st.appendChild(recorder(typeof s.item.au === "string" ? s.item.au : null));
    var go = el("button", "btn", HJ.ic("bubble") + " " + (HJ.store.get().lang === "en" ? "My turn" : "Giliranku")); go.style.display = "none"; row.appendChild(go);
    function listen() {
      phase = 0; var my = {};
      var i = 0;
      (function step() {
        if (!ctx.alive()) return;
        cars.forEach(function (c, j) { c.classList.toggle("on", j === i); });
        if (i >= cars.length) { go.style.display = ""; return; }
        A.say(parts[i].au).then(function (ok) { if (ok === false) return; i++; setTimeout(step, 220); });
      })();
    }
    lb.onclick = function () { A.fx.tap(); listen(); };
    go.onclick = function () {
      A.stop(); phase = 1; idx = 0; cars.forEach(function (c) { c.classList.remove("on", "read", "next"); });
      cars[0].classList.add("next"); ask.textContent = t("yourTurn"); go.style.display = "none"; ctx.mo("pose-15", t("tapSlow"));
    };
    ctx.mo("pose-12", t("listenFirst"));
    after(ctx, 400, listen);
  };

  /* Bridge: every right answer drops a plank, Mo walks across (right → left, the way we read) */
  G.bridge = function (s, ctx) {
    var st = ctx.stage, r = 0, n = s.rounds.length;
    add(st, el("div", "ask", t("bridge")));
    var river = el("div", "river"); river.innerHTML = '<div class="waves"></div><div class="bank r"></div><div class="bank l"></div>';
    var planks = el("div", "planks"); for (var i = 0; i < n; i++) planks.appendChild(el("div", "plank"));
    river.appendChild(planks);
    var mo = el("img", "bridge-mo"); mo.src = "assets/mo/mo-run.webp"; mo.style.right = "1%"; mo.style.transform = "scaleX(-1)"; river.appendChild(mo);
    var chest = el("div", "chest", HJ.art("gift", 46)); river.appendChild(chest);
    var spk = speakerBtn(function () { A.say(s.rounds[r].q.au); });
    var opts = el("div", "opts");
    add(st, river, spk, opts);
    ctx.mo(null);
    function round() {
      var R = s.rounds[r], locked = false, wrong = 0, right = null; opts.innerHTML = "";
      R.options.forEach(function (o) {
        var b = el("button", "tile " + sizeCls(o)); b.appendChild(arEl(o));
        if (o.ar === R.q.ar) right = b;
        b.onclick = function () {
          if (locked) return;
          if (o.ar === R.q.ar) {
            locked = true; b.classList.remove("hint"); b.classList.add("ok"); ctx.good(true); A.say(o.au);
            planks.children[r].classList.add("set"); HJ.juice.bump(mo);
            r++;
            mo.style.right = (15 + (70 * r / n) - 6) + "%";
            if (r >= n) { after(ctx, 800, function () { mo.style.right = "84%"; chest.innerHTML = HJ.art("sparkle", 46) + HJ.art("gift", 46); ctx.cheer(t("great")); A.fx.win(); }); after(ctx, 2100, ctx.next); }
            else after(ctx, 900, round);
          } else { b.classList.add("no"); setTimeout(function () { b.classList.remove("no"); }, 450); ctx.bad(false, R.q, R.options); after(ctx, 450, function () { A.say(R.q.au); });
            if (++wrong >= 2 && right) right.classList.add("hint"); }
        };
        opts.appendChild(b);
      });
      after(ctx, 300, function () { A.say(R.q.au); });
    }
    round();
  };

  /* Memory match: pairs that sound the same */
  G.match = function (s, ctx) {
    var st = ctx.stage, cards = [], open = [], got = 0, busy = false;
    add(st, el("div", "ask", t("match")));
    s.pairs.forEach(function (p, i) { cards.push({ it: p[0], k: i }); cards.push({ it: p[1], k: i }); });
    cards = U.shuffle(cards);
    var grid = el("div", "grid" + (cards.length <= 6 ? " c3" : ""));
    cards.forEach(function (c) {
      var m = el("button", "mcard " + (isWordy(c.it) || c.it.quran ? "w" : "")), inn = el("div", "in");
      inn.appendChild(el("div", "f", HJ.art("star", 40))); var b = el("div", "b");
      if (c.it.soundOnly) { b.classList.add("snd"); b.innerHTML = HJ.ic("speaker"); } else b.appendChild(arEl(c.it));
      inn.appendChild(b); m.appendChild(inn);
      var listenGame = s.pairs.some(function (p) { return p[1].soundOnly; });
      m.onclick = function () {
        if (busy || m.classList.contains("flip")) return;
        m.classList.add("flip"); A.fx.tap(); if (c.it.soundOnly || !listenGame) A.say(c.it.au); open.push({ m: m, c: c });
        if (open.length === 2) {
          busy = true;
          var a = open[0], z = open[1];
          if (a.c.k === z.c.k) {
            setTimeout(function () { a.m.classList.add("got"); z.m.classList.add("got"); A.fx.good(); A.say(a.c.it.au); var r = z.m.getBoundingClientRect(); HJ.juice.burst(r.left + r.width / 2, r.top + r.height / 2, 10); open = []; busy = false; got++;
              if (got === s.pairs.length) { ctx.cheer(t("great")); A.fx.win(); after(ctx, 1200, ctx.next); } }, 500);
          } else setTimeout(function () { a.m.classList.remove("flip"); z.m.classList.remove("flip"); open = []; busy = false; }, 1100);
        }
      };
      grid.appendChild(m);
    });
    st.appendChild(grid);
    ctx.mo("pose-36", null);
  };

  /* Build a word from its syllables (right to left) */
  G.build = function (s, ctx) {
    var st = ctx.stage, it = s.item, parts = it.parts, idx = 0;
    add(st, el("div", "ask", t("build")));
    var top = el("div", "row"); top.appendChild(speakerBtn(function () { A.say(it.au); }));
    st.appendChild(top);
    var slots = el("div", "slots"); parts.forEach(function () { slots.appendChild(el("div", "slot")); });
    var tiles = el("div", "opts");
    U.shuffle(parts.map(function (p, i) { return { p: p, i: i }; })).forEach(function (o) {
      var b = el("button", "tile"); b.appendChild(arEl({ ar: o.p }));
      b.onclick = function () {
        if (o.p === parts[idx]) {
          var sl = slots.children[idx]; sl.classList.add("fill"); sl.appendChild(arEl({ ar: o.p })); b.classList.add("used");
          A.fx.good(); A.say(o.p); idx++;
          if (idx === parts.length) { after(ctx, 700, function () { A.say(it.au); ctx.cheer(t("great")); }); after(ctx, 2000, ctx.next); }
        } else { b.classList.add("no"); setTimeout(function () { b.classList.remove("no"); }, 450); ctx.bad(); }
      };
      tiles.appendChild(b);
    });
    add(st, slots, latinEl(it), tiles);
    ctx.mo("idea", t("build"));
    after(ctx, 300, function () { A.say(it.au); });
  };

  /* Sort into buckets */
  G.sort = function (s, ctx) {
    var st = ctx.stage, i = 0;
    add(st, el("div", "ask", esc(s.say ? tr(s.say) : t("sortIt"))));
    var holder = el("div", "row"), bk = el("div", "buckets");
    if (s.buckets.length === 3) bk.style.gridTemplateColumns = "repeat(3,1fr)";
    var counts = {};
    var btns = s.buckets.map(function (b) {
      counts[b.k] = 0;
      var x = el("button", "bucket glass", (b.art ? HJ.art(b.art, 30) + "<br>" : "") + esc(tr(b.label)) + '<span class="n">0</span>'); x.dataset.k = b.k; bk.appendChild(x); return x;
    });
    add(st, holder, bk);
    ctx.mo("pose-36", null);
    function show() {
      holder.innerHTML = "";
      var it = s.items[i], c = el("button", "bigcard glass " + (it.quran ? "qq" : "wordy")); c.appendChild(arEl(it)); c.appendChild(latinEl(it));
      c.onclick = function () { A.say(it.au); };
      holder.appendChild(c);
      A.say(it.au);
      var locked = false;
      btns.forEach(function (b) {
        b.onclick = function () {
          if (locked) return;
          if (b.dataset.k === it.b) {
            locked = true; b.classList.add("ok"); ctx.good(); counts[it.b]++; b.querySelector(".n").textContent = counts[it.b];
            setTimeout(function () { b.classList.remove("ok"); }, 600);
            i++; if (i >= s.items.length) { after(ctx, 700, function () { ctx.cheer(t("great")); A.fx.win(); }); after(ctx, 1600, ctx.next); }
            else after(ctx, 800, show);
          } else { b.classList.add("no"); setTimeout(function () { b.classList.remove("no"); }, 450); ctx.bad(); }
        };
      });
    }
    show();
  };

  /* ---------- Qur'an ---------- */
  function surahOf(slug) { return HJ.surah(slug); }
  function ayahOf(slug, n) { return surahOf(slug).ayahs.filter(function (a) { return a.n === n; })[0]; }
  function arabicNum(n) { return String(n).replace(/\d/g, function (d) { return "٠١٢٣٤٥٦٧٨٩"[d]; }); }
  function playAyah(slug, n, box) {
    var s = surahOf(slug), a = ayahOf(slug, n);
    box && box.classList.add("playing");
    return A.ayah(s.number, n, a.ar).then(function () { box && box.classList.remove("playing"); });
  }
  HJ.playAyah = playAyah;

  G.ayah = function (s, ctx) {
    var st = ctx.stage, a = ayahOf(s.s, s.a), su = surahOf(s.s), lang = HJ.store.get().lang;
    add(st, el("div", "sub", esc(su.name[lang] || su.name.id) + " · " + (lang === "en" ? "verse " : "ayat ") + s.a + " / " + su.ayahs.length));
    var box = el("div", "mushaf");
    box.innerHTML = '<div class="qr">' + esc(a.ar) + ' <span class="ayno">﴿' + arabicNum(s.a) + "﴾</span></div>" +
      (HJ.store.get().settings.latin ? '<div class="tl">' + esc(a.tr) + "</div>" : "") + '<div class="tr">' + esc(a[lang] || a.id) + "</div>";
    box.onclick = function () { playAyah(s.s, s.a, box); };
    st.appendChild(box);
    var row = el("div", "row"), lb = el("button", "btn gold", HJ.ic("speaker") + " " + t("listen"));
    lb.onclick = function () { playAyah(s.s, s.a, box); };
    var nx = el("button", "btn", t("next") + " " + HJ.ic("next")); nx.onclick = function () { ctx.next(); };
    row.appendChild(lb); row.appendChild(nx); st.appendChild(recorder(null));
    st.appendChild(row);
    ctx.mo("mo2:read-book", t("ayahListen"));
    after(ctx, 400, function () { playAyah(s.s, s.a, box); });
  };

  G.ayahbuild = function (s, ctx) {
    var st = ctx.stage, a = ayahOf(s.s, s.a), words = a.ar.split(" ").filter(function (w) { return w && w !== "ۚ" && w !== "ۖ"; }), idx = 0;
    add(st, el("div", "ask", t("ayahBuild")));
    var top = el("div", "row"); var box = null;
    top.appendChild(speakerBtn(function () { playAyah(s.s, s.a); })); st.appendChild(top);
    var slots = el("div", "slots q"); words.forEach(function () { slots.appendChild(el("div", "slot")); });
    var tiles = el("div", "opts");
    U.shuffle(words.map(function (w, i) { return { w: w, i: i }; })).forEach(function (o) {
      var b = el("button", "tile qw"); b.appendChild(el("div", "ar", esc(o.w)));
      b.onclick = function () {
        if (o.w === words[idx]) {
          var sl = slots.children[idx]; sl.classList.add("fill"); sl.appendChild(el("div", "ar", esc(o.w))); b.classList.add("used"); A.fx.good(); idx++;
          if (idx === words.length) { ctx.cheer(t("great")); A.fx.win(); after(ctx, 600, function () { playAyah(s.s, s.a); }); after(ctx, 1800, function () {
            var nx = el("button", "btn", t("next") + " " + HJ.ic("next")); nx.onclick = function () { ctx.next(); }; st.appendChild(nx); }); }
        } else { b.classList.add("no"); setTimeout(function () { b.classList.remove("no"); }, 450); ctx.bad(); }
      };
      tiles.appendChild(b);
    });
    add(st, slots, tiles);
    ctx.mo("idea", null);
  };

  G.ayahfill = function (s, ctx) {
    var st = ctx.stage, su = surahOf(s.s), a = ayahOf(s.s, s.a), words = a.ar.split(" ");
    var cand = words.map(function (w, i) { return i; }).filter(function (i) { return words[i].replace(/[ً-ْٰۚۖ]/g, "").length >= 2; });
    var hole = U.pick(cand.length ? cand : [0]), ans = words[hole];
    var pool = []; su.ayahs.forEach(function (x) { x.ar.split(" ").forEach(function (w) { if (w !== ans && w.length > 2 && pool.indexOf(w) < 0 && !/[ۚۖ]/.test(w)) pool.push(w); }); });
    var opts = U.shuffle([ans].concat(U.shuffle(pool).slice(0, 2)));
    add(st, el("div", "ask", t("ayahFill")));
    var box = el("div", "mushaf small");
    var q = el("div", "qr"); q.innerHTML = words.map(function (w, i) { return i === hole ? '<span class="blank">&nbsp;</span>' : esc(w); }).join(" ") + ' <span class="ayno">﴿' + arabicNum(s.a) + "﴾</span>";
    box.appendChild(q); st.appendChild(box);
    var row = el("div", "opts"), locked = false;
    opts.forEach(function (w) {
      var b = el("button", "tile qw"); b.appendChild(el("div", "ar", esc(w)));
      b.onclick = function () {
        if (locked) return;
        if (w === ans) { locked = true; b.classList.add("ok"); ctx.good(); q.querySelector(".blank").outerHTML = '<span class="hl">' + esc(ans) + "</span>";
          var t0 = Date.now(); playAyah(s.s, s.a, box).then(function () { after(ctx, Math.max(300, 1500 - (Date.now() - t0)), ctx.next); }); after(ctx, 15000, function () { ctx.next(); }); }
        else { b.classList.add("no"); setTimeout(function () { b.classList.remove("no"); }, 450); ctx.bad(); }
      };
      row.appendChild(b);
    });
    st.appendChild(row);
    st.appendChild(speakerBtn(function () { playAyah(s.s, s.a, box); }));
    ctx.mo("pose-36", null);
  };

  /* Whole surah page + tashih by a parent */
  G.surahread = function (s, ctx) {
    var st = ctx.stage, su = surahOf(s.s), lang = HJ.store.get().lang;
    add(st, el("div", "ask", t("surahRead") + ": " + esc(su.name[lang] || su.name.id)));
    var box = el("div", "mushaf"), page = el("div", "qr surah-page");
    var spans = su.ayahs.map(function (a) { var sp = el("span", "", esc(a.ar) + ' <span class="ayno">﴿' + arabicNum(a.n) + "﴾</span> "); page.appendChild(sp); return sp; });
    if (su.slug !== "al-fatihah") box.appendChild(el("div", "qr", "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ")).style.cssText = "font-size:26px;opacity:.8";
    box.appendChild(page); st.appendChild(box);
    var endChk = function () { page.classList.toggle("end", page.scrollTop + page.clientHeight >= page.scrollHeight - 6); };
    page.addEventListener("scroll", endChk); setTimeout(endChk, 60);
    var row = el("div", "row"), all = el("button", "btn gold", HJ.ic("speaker") + " " + t("listenAll")), playing = false;
    all.onclick = function () {
      if (playing) { A.stop(); playing = false; spans.forEach(function (x) { x.classList.remove("on"); }); return; }
      playing = true; var i = 0;
      (function nx() {
        if (!ctx.alive() || !playing || i >= su.ayahs.length) { playing = false; spans.forEach(function (x) { x.classList.remove("on"); }); return; }
        spans.forEach(function (x, j) { x.classList.toggle("on", j === i); });
        spans[i].scrollIntoView({ block: "nearest", behavior: "smooth" });
        playAyah(su.slug, su.ayahs[i].n).then(function () { i++; setTimeout(nx, 300); });
      })();
    };
    var ts = el("button", "btn", HJ.ic("check") + " " + t("tashih"));
    ts.onclick = function () {
      A.stop(); playing = false;
      HJ.gate(function () {
        HJ.modal(function (p, close) {
          p.appendChild(el("div", "kicker", t("parents"))); p.appendChild(el("h2", "", t("tashih")));
          p.appendChild(el("p", "", esc(t("tashihHint"))));
          var r = el("div", "row"), f = el("button", "btn gold", HJ.art("star", 24) + " " + t("fluent")), pr = el("button", "btn ghost", t("practice"));
          f.onclick = function () { HJ.store.get().tashih[ctx.lv.id] = 1; HJ.store.save(); HJ.mission && HJ.mission("tashih"); close(); ctx.next(); };
          pr.onclick = function () { close(); ctx.bad(true); ctx.next(); };
          r.appendChild(f); r.appendChild(pr); p.appendChild(r);
        });
      });
    };
    row.appendChild(all); row.appendChild(ts); st.appendChild(recorder(null));
    st.appendChild(row);
    ctx.mo("mo2:hug-quran", null);
  };

  /* Ummi-style tashih for a set of items: the child reads them alone, a parent ticks */
  G.tashih = function (s, ctx) {
    var st = ctx.stage, okN = 0;
    add(st, el("div", "ask", t("tashih")), el("div", "sub", esc(tr(s.say)) + " " + esc(t("tashihHint"))));
    var grid = el("div", "tgrid");
    s.items.forEach(function (it) {
      var c = el("button", "titem " + (it.quran ? "q" : "")); c.appendChild(arEl(it));
      var timer = null;
      c.onclick = function () { c.classList.toggle("ok"); A.fx.tap(); okN = grid.querySelectorAll(".ok").length; };
      c.oncontextmenu = function (e) { e.preventDefault(); A.say(it.au); };
      grid.appendChild(c);
    });
    st.appendChild(grid);
    var row = el("div", "row"), all = el("button", "btn gold", HJ.art("star", 24) + " " + t("allGood")), sk = el("button", "btn ghost small", HJ.ic("skip") + " " + t("skip"));
    var hint = el("button", "btn ghost small", HJ.ic("bulb") + " " + t("hint"));
    hint.onclick = function () { A.say(s.items.map(function (x) { return x.au; })); };
    all.onclick = function () { HJ.gate(function () { HJ.store.get().tashih[ctx.lv.id] = 1; HJ.store.save(); HJ.mission && HJ.mission("tashih"); ctx.cheer(t("great")); A.fx.win(); after(ctx, 900, ctx.next); }); };
    sk.onclick = function () { ctx.next(); };
    row.appendChild(all); row.appendChild(hint); row.appendChild(sk);
    st.appendChild(row);
    ctx.mo("thank-you", null);
  };

  G.khatam = function (s, ctx) { HJ.showCert(function () { ctx.next(); }); };

  HJ.games = G; HJ.el = el; HJ.esc = esc; HJ.arEl = arEl;
})();
