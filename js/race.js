/* Baby Mo Hijaiyah — Balap Hijaiyah (Hijaiyah Race).
   Mo drives a go-kart against Ais and Kak Adam. Before each gate Mo hears a sound ("ba!"); three letter signs come
   down the three lanes; drive through the right one → turbo, a wrong one → a little slower (never a crash, never
   "game over"). 4 worlds that follow Books 1–4 (Books 5–6 use Qur'an words, which stay in the calm learning path),
   each with 5 races and a Grand Prix. Open to everyone; inside a world each race opens the next one.
   Canvas for the road, DOM for the menu, the top bar, the countdown and the podium.
   HJ.race.open() → the race menu, HJ.race.card() → the home card. */
(function () {
  var A = HJ.audio, S = HJ.store, t = HJ.t, tr = HJ.tr, U = HJ.util, J = HJ.juice;
  var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function APP() { return HJ._app; }
  function lang() { return S.get().lang; }
  function dark() { return document.documentElement.getAttribute("data-theme") === "dark"; }

  /* ---------- content: the races follow Books 1–4 ---------- */
  var WORLDS = [1, 2, 3, 4], PER = 5, GATES = 8, GP_GATES = 10;
  function worldPool(n) {
    var w = HJ.worlds[n - 1], seen = {}, out = [];
    w.levels.forEach(function (l) {
      var it = l.letters ? l.letters.map(function (k) { return HJ.syl(k, l.v || "a"); }) : (l.items || []);
      it.forEach(function (x) {
        if (!x || !x.ar || !x.au || x.quran || (HJ.QTEXT && HJ.QTEXT[x.ar.normalize("NFC")]) || seen[x.ar]) return;
        seen[x.ar] = 1; out.push(x);
      });
    });
    return out;
  }
  var cache = {};
  function races(n) {
    if (cache[n]) return cache[n];
    var pool = worldPool(n), k = Math.ceil(pool.length / PER), list = [];
    for (var i = 0; i < PER; i++) {
      var chunk = pool.slice(i * k, (i + 1) * k);
      if (!chunk.length) chunk = pool.slice(-k);
      list.push({ id: n + "-" + (i + 1), w: n, i: i, gp: false, targets: chunk, pool: pool.slice(0, Math.max((i + 1) * k, 6)), easy: n === 1 && i < 3 });
    }
    list.push({ id: n + "-gp", w: n, i: PER, gp: true, targets: pool, pool: pool, easy: false });
    return (cache[n] = list);
  }
  function rst() { var s = S.get(); s.race = s.race || {}; return s.race; }
  function best(id) { return rst()[id] || 0; }
  function allOpen() { var s = S.get().settings || {}; return !!(s.arcadeAll || s.unlockAll); }
  function isOpen(r) { if (r.i === 0 || allOpen()) return true; var prev = races(r.w)[r.i - 1]; return best(prev.id) > 0; }

  /* ---------- pictures ---------- */
  var IMG = {
    mo: "assets/mo/mo-pose-23.webp", moYes: "assets/mo/mo-yes.webp", moOh: "assets/mo/mo-pose-33.webp", moFace: "assets/mo/mo-pose-41.webp",
    ais: "assets/family/ais-cheer.webp", adam: "assets/family/adam-drive.webp",
    moWin: "assets/mo/mo-yeyy.webp", aisWin: "assets/family/ais-joy.webp", adamWin: "assets/family/adam-win.webp"
  };
  var pics = {}, faces = {};
  function load(cb) {
    var keys = Object.keys(IMG), left = keys.length;
    keys.forEach(function (k) {
      if (pics[k] && pics[k].ok) { if (!--left) cb(); return; }
      var im = new Image(); im.onload = function () { im.ok = true; im.box = inkBox(im); if (!--left) cb(); }; im.onerror = function () { if (!--left) cb(); };
      im.src = IMG[k]; pics[k] = im;
    });
  }
  // the painted part of a picture (art has empty margins), so drivers sit right in the seat
  function inkBox(im) {
    try {
      var c = document.createElement("canvas"), w = c.width = 120, h = c.height = Math.round(120 * im.naturalHeight / im.naturalWidth), g = c.getContext("2d");
      g.drawImage(im, 0, 0, w, h); var d = g.getImageData(0, 0, w, h).data, x0 = w, y0 = h, x1 = 0, y1 = 0;
      for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 60) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      var s = im.naturalWidth / w; return { x: x0 * s, y: y0 * s, w: (x1 - x0) * s, h: (y1 - y0) * s };
    } catch (e) { return { x: 0, y: 0, w: im.naturalWidth, h: im.naturalHeight }; }
  }
  // a round face picture for the top bar
  function face(k) {
    if (faces[k]) return faces[k];
    var im = pics[k]; if (!im || !im.ok) return "";
    var b = im.box, c = document.createElement("canvas"); c.width = c.height = 96; var g = c.getContext("2d");
    var side = b.w * (k === "moFace" ? .62 : .7), cx = b.x + b.w * (k === "ais" ? .5 : .5), cy = b.y + side * .5;
    g.beginPath(); g.arc(48, 48, 48, 0, 7); g.clip(); g.fillStyle = k === "moFace" ? "#CFEFFF" : k === "ais" ? "#FFE0EE" : "#DCE8FF"; g.fillRect(0, 0, 96, 96);
    g.drawImage(im, cx - side / 2, cy - side / 2, side, side, 0, 0, 96, 96);
    return (faces[k] = c.toDataURL());
  }

  /* ---------- the look of each world (day / night) ---------- */
  var LOOK = {
    1: { sky: [["#8FD3FF", "#E8F7FF"], ["#101A44", "#2C3576"]], far: [["#7FD4EE", "#46B6DD"], ["#24407A", "#172B57"]], ground: [["#FFE7AE", "#F6CF82"], ["#5E557E", "#433C60"]], deco: "palm" },
    2: { sky: [["#A8E6C8", "#F0FFF6"], ["#0E2230", "#1E3A48"]], far: [["#7ED39B", "#4FB679"], ["#1F4A42", "#163A34"]], ground: [["#8BD67A", "#5DB85C"], ["#2E5A4A", "#22463A"]], deco: "tree" },
    3: { sky: [["#B8C6FF", "#F2F0FF"], ["#13183E", "#2B2E66"]], far: [["#A9B4E8", "#8794D8"], ["#2C3268", "#20264F"]], ground: [["#B5E3A5", "#88C982"], ["#34504E", "#273F3D"]], deco: "pine" },
    4: { sky: [["#5FC8E8", "#2D8FC4"], ["#0A1E3C", "#06132A"]], far: [["#3BA6CF", "#2585B5"], ["#0F2C52", "#0A2142"]], ground: [["#F3D9A0", "#E2BE7C"], ["#3C3F5E", "#2C2F48"]], deco: "coral" }
  };
  var KART = { mo: ["#FF6B5B", "#E2412F"], ais: ["#FF8FC8", "#E05A9E"], adam: ["#5B9BFF", "#2F6BE0"] };

  /* ---------- menu ---------- */
  var curW = 1;
  function open(w) {
    if (w) curW = w;
    var app = document.getElementById("app"); app.innerHTML = "";
    var sc = el("div", "screen race-menu"); app.appendChild(sc);
    if (HJ.bg) HJ.bg("w" + curW);
    var top = el("div", "rm-top"), back = el("button", "nav-btn", HJ.ic("back"));
    back.setAttribute("aria-label", t("close")); back.onclick = function () { A.fx.tap(); HJ.go.home(); };
    top.appendChild(back); top.appendChild(el("div", "rm-title", "<b>" + esc(t("raceT")) + "</b><small>" + esc(t("raceSub")) + "</small>")); sc.appendChild(top);
    var body = el("main", "scroller rm-body"); sc.appendChild(body);
    // the karts on the start line
    var hero = el("div", "rm-hero", heroSvg()); body.appendChild(hero);
    load(function () { hero.innerHTML = heroSvg(); });
    var tabs = el("div", "rm-tabs");
    WORLDS.forEach(function (n) {
      var w = HJ.worlds[n - 1], b = el("button", "rm-tab" + (n === curW ? " on" : ""), HJ.wi(n, true).outerHTML + "<span>" + esc(t("book")) + " " + n + "</span>");
      b.onclick = function () { A.fx.tap(); open(n); }; tabs.appendChild(b);
    });
    body.appendChild(tabs);
    body.appendChild(el("div", "rm-wname", "<b>" + esc(tr(HJ.worlds[curW - 1].name)) + "</b>"));
    var list = el("div", "rm-list");
    races(curW).forEach(function (r) {
      var op = isOpen(r), bp = best(r.id);
      var c = el("button", "rm-race" + (r.gp ? " gp" : "") + (op ? "" : " locked"));
      var preview = r.targets.slice(0, 3).map(function (x) { return '<span class="ar">' + esc(x.ar) + "</span>"; }).join("");
      c.innerHTML = '<span class="rm-n">' + (r.gp ? HJ.art("trophy", 30) : r.i + 1) + "</span>" +
        '<span class="rm-tx"><b>' + esc(r.gp ? t("raceGP") : t("raceN", { n: r.i + 1 })) + '</b><span class="rm-pre">' + preview + "</span></span>" +
        '<span class="rm-cup">' + (op ? (bp ? cup(bp, 34) : '<span class="rm-go">' + HJ.ic("play") + "</span>") : HJ.ic("lock")) + "</span>";
      c.setAttribute("aria-label", (r.gp ? t("raceGP") : t("raceN", { n: r.i + 1 })) + (bp ? " · " + t("place" + bp) : "") + (op ? "" : " · " + t("locked")));
      c.onclick = function () {
        A.unlock();
        if (!op) { A.fx.bad(); HJ.toast(HJ.ic("lock") + " " + esc(t("raceLocked"))); A.talk(t("raceLocked"), lang()); return; }
        A.fx.tap(); play(r);
      };
      list.appendChild(c);
    });
    body.appendChild(list);
    body.appendChild(el("p", "rm-note", esc(t("raceNote"))));
    A.talk(t("raceHow"), lang());
  }
  function cup(place, size) {
    var c = ["#FFC21A", "#C9D3E3", "#E0915A"][place - 1], d = ["#D98A00", "#8E9BB0", "#A65A2A"][place - 1], s = size || 30;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 40 40" aria-hidden="true"><path d="M11 6h18v6c0 7-4 12-9 12s-9-5-9-12z" fill="' + c + '" stroke="' + d + '" stroke-width="2"/>' +
      '<path d="M11 9H6c0 5 2 8 6 9M29 9h5c0 5-2 8-6 9" fill="none" stroke="' + d + '" stroke-width="2.4" stroke-linecap="round"/><rect x="17" y="24" width="6" height="6" fill="' + d + '"/><rect x="12" y="30" width="16" height="5" rx="2" fill="' + c + '" stroke="' + d + '" stroke-width="2"/>' +
      '<text x="20" y="18" text-anchor="middle" font-size="10" font-weight="900" fill="' + d + '" font-family="Fredoka One, Nunito">' + place + "</text></svg>";
  }
  // a small kart drawing for the menu and the home card (Mo's face from the picture)
  function heroSvg() {
    return '<svg viewBox="0 0 360 120" aria-hidden="true"><defs><linearGradient id="rhr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5A6275"/><stop offset="1" stop-color="#3A4256"/></linearGradient></defs>' +
      '<rect x="0" y="78" width="360" height="34" rx="10" fill="url(#rhr)"/><path d="M0 95 H360" stroke="#fff" stroke-width="3" stroke-dasharray="18 14" opacity=".6"/>' +
      '<g transform="translate(300 52)">' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (i) { return '<rect x="' + (i % 2) * 8 + '" y="' + (i >> 1) * 8 + '" width="8" height="8" fill="' + ((i + (i >> 1)) % 2 ? "#222" : "#fff") + '"/>'; }).join("") + "</g>" +
      kartSvg(40, 50, KART.adam, "adam", .8) + kartSvg(122, 52, KART.ais, "ais", .9) + kartSvg(204, 50, KART.mo, "mo", 1) + "</svg>";
  }
  function kartSvg(x, y, col, k, s) {
    // the driver: the top half of the picture's painted part (a nested svg crops it), sitting in the seat
    var im = pics[k], drv = "";
    if (im && im.ok) { var b = im.box, h = b.h * .5, dw = 46, dh = dw * h / b.w;
      drv = '<svg x="2" y="' + ((k === "mo" ? 2 : 8) - dh) + '" width="' + dw + '" height="' + dh + '" viewBox="' + b.x + " " + b.y + " " + b.w + " " + h + '"><image href="' + IMG[k] + '" width="' + im.naturalWidth + '" height="' + im.naturalHeight + '"/></svg>'; }
    return '<g transform="translate(' + x + " " + y + ") scale(" + s + ')">' + drv +
      '<path d="M-6 20 Q-6 6 10 4 L46 2 Q66 2 72 16 L74 26 L-6 26Z" fill="' + col[0] + '" stroke="' + col[1] + '" stroke-width="2.5"/>' +
      '<circle cx="8" cy="28" r="9" fill="#2A2F3D"/><circle cx="8" cy="28" r="3.5" fill="#C9D3E3"/><circle cx="60" cy="28" r="9" fill="#2A2F3D"/><circle cx="60" cy="28" r="3.5" fill="#C9D3E3"/></g>';
  }

  /* ---------- the home card ---------- */
  function card() {
    var c = el("button", "race-card");
    load(function () { var a = c.querySelector(".rc-art"); if (a) a.innerHTML = heroSvg(); });
    c.innerHTML = '<span class="rc-art">' + heroSvg() + '</span><span class="rc-tx"><b>' + esc(t("raceT")) + "</b><small>" + esc(t("raceSub")) + '</small></span><span class="rc-go">' + HJ.ic("play") + "</span>";
    c.onclick = function () { A.unlock(); A.fx.tap(); open(); };
    return c;
  }

  /* ---------- the race ---------- */
  var live = 0;
  function play(r) {
    if (S.overLimit()) return HJ.restScreen(function () { play(r); });
    var my = ++live;
    load(function () { if (my === live) start(r, my); });
  }

  function start(R, my) {
    var app = document.getElementById("app"); app.innerHTML = ""; A.stop();
    if (HJ.bg) HJ.bg(null);
    var sc = el("div", "screen race"); app.appendChild(sc);
    // top bar (".lv-top" so play time is counted like a level)
    var top = el("div", "lv-top race-top"), x = el("button", "nav-btn", HJ.ic("close"));
    x.setAttribute("aria-label", t("close"));
    var mini = el("div", "rt-track", '<i class="rt-line"></i><span class="rt-flag">' + flagSvg() + "</span>");
    var who = ["ais", "adam", "moFace"].map(function (k) { var h = el("span", "rt-head " + k); h.style.backgroundImage = "url(" + face(k) + ")"; mini.appendChild(h); return h; });
    var spk = el("button", "nav-btn rt-spk", HJ.ic("speaker")); spk.setAttribute("aria-label", t("listen"));
    var starN = el("span", "rt-stars", HJ.art("star", 22) + "<b>0</b>");
    top.appendChild(x); top.appendChild(mini); top.appendChild(spk); top.appendChild(starN); sc.appendChild(top);
    var wrap = el("div", "race-stage"), cv = el("canvas", "race-cv"); wrap.appendChild(cv); sc.appendChild(wrap);
    var tipEl = el("div", "race-tip glass", esc(t("raceHow"))); wrap.appendChild(tipEl);
    var g = cv.getContext("2d"), W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1);
    function size() { var b = wrap.getBoundingClientRect(); W = b.width; H = b.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); g.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); window.addEventListener("resize", size);

    var L = LOOK[R.w], night = dark() ? 1 : 0;
    // track: gates every 4 units, start 4.5, finish after the last gate
    var nG = R.gp ? GP_GATES : GATES, gates = [], targets = U.shuffle(R.targets.slice());
    while (targets.length < nG) targets = targets.concat(U.shuffle(R.targets.slice()));
    for (var i = 0; i < nG; i++) {
      var q = targets[i], opts = distract(q, R), lanes = U.shuffle([0, 1, 2]);
      gates.push({ d: 4.5 + i * 4, q: q, opts: [opts[0], opts[1], opts[2]], good: -1, lanes: lanes, said: false, done: false, hit: 0 });
      // put the right answer in a random lane
      var arr = [q, opts[1], opts[2]], laneOf = U.shuffle([0, 1, 2]); gates[i].signs = []; gates[i].good = laneOf[0];
      for (var j = 0; j < 3; j++) gates[i].signs[laneOf[j]] = arr[j];
    }
    var LEN = 4.5 + (nG - 1) * 4 + 4;
    // the stars on the road, between gates
    var stars = [];
    for (i = 0; i < nG - 1; i++) stars.push({ d: 4.5 + i * 4 + 2, lane: Math.floor(Math.random() * 3), got: false });
    // rivals: tuned so a child who gets about 6 of 8 right wins, 3–5 → 2nd
    var k = LEN / 38;
    var riv = [
      { k: "ais", lane: 0, d: 0, ly: 0, sp: LEN / (39 * k) * (R.gp ? 1.02 : 1), ph: 1.3, tFin: 0 },
      { k: "adam", lane: 2, d: 0, ly: 2, sp: LEN / (35.2 * k) * (R.gp ? 1.02 : 1), ph: 0.2, tFin: 0 }
    ];
    var mo = { lane: 1, ly: 1, d: 0, v: 0, boost: 0, slow: 0, pose: "mo", poseT: 0, tFin: 0, shake: 0 };
    var phase = "count", tRace = 0, last = 0, got = 0, okN = 0, parts = [], spokeAt = -1, finished = false, curGate = null;
    HJ._race = { gates: gates, mo: mo, phase: function () { return phase; } };   // for tests

    function distract(q, R) {
      var cz = R.easy && q.k ? HJ.cousins(q.k) || [] : [];
      var cands = U.shuffle(R.pool.filter(function (x) { return x.ar !== q.ar && cz.indexOf(x.k) < 0; }));
      if (cands.length < 2) cands = cands.concat(U.shuffle(worldPool(R.w).filter(function (x) { return x.ar !== q.ar; })));
      return [q, cands[0], cands[1]];
    }

    // geometry
    function geo() {
      var roadTop = H * .46, roadH = H * .44, laneH = roadH / 3;
      return { roadTop: roadTop, roadH: roadH, laneH: laneH, x0: W * .2, ppu: (W * .8 + 70) / 3.6 };
    }
    function laneY(l, G) { return G.roadTop + (l + .5) * G.laneH; }
    function laneScale(l) { return .86 + l * .09; }

    /* --- drawing --- */
    function bg(G, cam) {
      var sky = g.createLinearGradient(0, 0, 0, G.roadTop); sky.addColorStop(0, L.sky[night][0]); sky.addColorStop(1, L.sky[night][1]);
      g.fillStyle = sky; g.fillRect(0, 0, W, G.roadTop + 2);
      if (night) { g.fillStyle = "rgba(255,246,200,.8)"; for (var s = 0; s < 26; s++) { var sx = ((s * 97.3 - cam * 3) % (W + 20) + W + 20) % (W + 20) - 10, sy = (s * 53.7) % (G.roadTop * .7); g.fillRect(sx, sy, 1.6, 1.6); } }
      // sun / moon
      g.fillStyle = night ? "#F4F1FF" : "#FFD43B"; g.beginPath(); g.arc(W * .84, G.roadTop * .26, Math.min(W, H) * .055, 0, 7); g.fill();
      if (night) { g.fillStyle = L.sky[1][0]; g.beginPath(); g.arc(W * .84 + 9, G.roadTop * .26 - 6, Math.min(W, H) * .05, 0, 7); g.fill(); }
      // clouds / bubbles drift
      g.fillStyle = R.w === 4 ? "rgba(255,255,255,.35)" : night ? "rgba(120,120,190,.35)" : "rgba(255,255,255,.9)";
      for (var c = 0; c < 4; c++) {
        var cx = ((c * 173 - cam * 8) % (W + 160) + W + 160) % (W + 160) - 80, cy = G.roadTop * (.18 + (c % 2) * .2);
        if (R.w === 4) { for (var b = 0; b < 4; b++) { g.beginPath(); g.arc(cx + b * 9, cy + ((tRace * 30 + b * 40 + c * 70) % (G.roadTop)) * -1 + G.roadTop, 4 + b, 0, 7); g.fill(); } }
        else { g.beginPath(); g.ellipse(cx, cy, 34, 12, 0, 0, 7); g.arc(cx - 12, cy - 6, 13, 0, 7); g.arc(cx + 10, cy - 10, 16, 0, 7); g.fill(); }
      }
      // far layer
      var fg = g.createLinearGradient(0, G.roadTop * .55, 0, G.roadTop); fg.addColorStop(0, L.far[night][0]); fg.addColorStop(1, L.far[night][1]); g.fillStyle = fg;
      g.beginPath(); g.moveTo(0, G.roadTop);
      for (var x = 0; x <= W + 20; x += 20) {
        var u = (x + cam * 15) / 90, h = R.w === 3 ? Math.abs(((u % 2) + 2) % 2 - 1) * G.roadTop * .32 + G.roadTop * .08 : (Math.sin(u) * .5 + .5) * G.roadTop * .12 + G.roadTop * .06;
        g.lineTo(x, G.roadTop * .9 - h);
      }
      g.lineTo(W, G.roadTop); g.closePath(); g.fill();
      if (R.w === 3 && !night) { g.fillStyle = "rgba(255,255,255,.75)"; for (x = 0; x <= W + 180; x += 180) { var px = x - ((cam * 15) % 180), py = G.roadTop * .9 - G.roadTop * .4 + 2; g.beginPath(); g.moveTo(px - 14, py + 16); g.lineTo(px, py); g.lineTo(px + 14, py + 16); g.closePath(); g.fill(); } }
      // roadside strip + decorations
      var gg = g.createLinearGradient(0, G.roadTop - 16, 0, G.roadTop); gg.addColorStop(0, L.ground[night][0]); gg.addColorStop(1, L.ground[night][1]);
      g.fillStyle = gg; g.fillRect(0, G.roadTop - 16, W, 18);
      for (var dk = 0; dk < 7; dk++) { var dx = ((dk * 140 - cam * G.ppu * .55) % (W + 140) + W + 140) % (W + 140) - 70; deco(L.deco, dx, G.roadTop - 10, 1); }
      // bottom verge
      g.fillStyle = gg; g.fillRect(0, G.roadTop + G.roadH, W, H - G.roadTop - G.roadH);
      for (dk = 0; dk < 6; dk++) { var bx = ((dk * 170 + 60 - cam * G.ppu * 1.15) % (W + 170) + W + 170) % (W + 170) - 85; flower(bx, G.roadTop + G.roadH + (H - G.roadTop - G.roadH) * .55); }
    }
    function deco(kind, x, y, s) {
      g.save(); g.translate(x, y); g.scale(s, s);
      var leaf = night ? "#2E6F6A" : "#3CC377";
      if (kind === "palm") {
        g.strokeStyle = night ? "#6B5070" : "#C98B50"; g.lineWidth = 6; g.lineCap = "round"; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-4, -30, 6, -58); g.stroke();
        g.strokeStyle = leaf; g.lineWidth = 7; [[-26, -50], [26, -54], [-18, -70], [20, -72], [0, -76]].forEach(function (p) { g.beginPath(); g.moveTo(6, -58); g.quadraticCurveTo((6 + p[0]) / 2, p[1] - 10, p[0], p[1]); g.stroke(); });
      } else if (kind === "tree") {
        g.fillStyle = night ? "#5A4560" : "#9C6A3E"; g.fillRect(-4, -26, 8, 26);
        g.fillStyle = leaf; g.beginPath(); g.arc(0, -40, 20, 0, 7); g.arc(-14, -30, 13, 0, 7); g.arc(14, -30, 13, 0, 7); g.fill();
        if (!night) { g.fillStyle = "#FF6B6B"; g.beginPath(); g.arc(-6, -44, 3, 0, 7); g.arc(8, -34, 3, 0, 7); g.fill(); }
      } else if (kind === "pine") {
        g.fillStyle = night ? "#5A4560" : "#8A5A3A"; g.fillRect(-3, -14, 6, 14);
        g.fillStyle = night ? "#2B5A55" : "#2FA06A"; [[0, -70, 16], [0, -50, 20], [0, -30, 24]].forEach(function (p) { g.beginPath(); g.moveTo(p[0] - p[2], p[1] + 24); g.lineTo(p[0], p[1]); g.lineTo(p[0] + p[2], p[1] + 24); g.closePath(); g.fill(); });
      } else {
        g.strokeStyle = night ? "#7A4A8A" : "#FF7A8A"; g.lineWidth = 6; g.lineCap = "round";
        [[0, -40], [-14, -30], [14, -34]].forEach(function (p) { g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(p[0] / 2, p[1] / 2, p[0], p[1]); g.stroke(); });
        g.strokeStyle = night ? "#2E6F6A" : "#3CC377"; g.lineWidth = 4; g.beginPath(); g.moveTo(26, 0); g.quadraticCurveTo(20 + Math.sin(tRace * 2) * 4, -24, 28, -46); g.stroke();
      }
      g.restore();
    }
    function flower(x, y) {
      g.fillStyle = night ? "#3C8F77" : "#2FA25B"; g.fillRect(x - 1, y - 8, 2, 8);
      g.fillStyle = night ? "#C9A7FF" : ["#FF8FB1", "#FFFFFF", "#FFB86B"][Math.abs(Math.round(x)) % 3];
      for (var a = 0; a < 5; a++) { g.beginPath(); g.arc(x + Math.sin(a * 1.26) * 4, y - 10 - Math.cos(a * 1.26) * 4, 3, 0, 7); g.fill(); }
      g.fillStyle = "#FFE27A"; g.beginPath(); g.arc(x, y - 10, 2.2, 0, 7); g.fill();
    }
    function road(G, cam) {
      var rg = g.createLinearGradient(0, G.roadTop, 0, G.roadTop + G.roadH);
      if (R.w === 4) { rg.addColorStop(0, night ? "#4A4F78" : "#E9CF96"); rg.addColorStop(1, night ? "#3A3E62" : "#D9B676"); }
      else { rg.addColorStop(0, night ? "#3D4560" : "#6B7488"); rg.addColorStop(1, night ? "#2C3248" : "#4E566A"); }
      g.fillStyle = rg; g.fillRect(0, G.roadTop, W, G.roadH);
      // kerbs
      var off = (cam * G.ppu) % 36;
      for (var x = -36; x < W + 36; x += 36) { g.fillStyle = "#FF5D5D"; g.fillRect(x - off, G.roadTop - 4, 18, 7); g.fillRect(x - off + 18, G.roadTop + G.roadH - 3, 18, 7); g.fillStyle = "#fff"; g.fillRect(x - off + 18, G.roadTop - 4, 18, 7); g.fillRect(x - off, G.roadTop + G.roadH - 3, 18, 7); }
      // lane lines
      g.fillStyle = R.w === 4 ? "rgba(255,255,255,.55)" : "rgba(255,255,255,.75)"; var o2 = (cam * G.ppu) % 44;
      for (var l = 1; l < 3; l++) for (x = -44; x < W + 44; x += 44) g.fillRect(x - o2, G.roadTop + l * G.laneH - 2, 24, 4);
      // start and finish lines
      [0.6, LEN].forEach(function (d) { var sx = G.x0 + 40 + (d - cam) * G.ppu; if (sx < -30 || sx > W + 30) return; for (var yy = 0; yy < G.roadH; yy += 10) for (var c = 0; c < 2; c++) { g.fillStyle = ((yy / 10) + c) % 2 ? "#222" : "#fff"; g.fillRect(sx + c * 10, G.roadTop + yy, 10, 10); } });
      var fx = G.x0 + 40 + (LEN - cam) * G.ppu;
      if (fx > -60 && fx < W + 80) { g.fillStyle = "#3A4256"; g.fillRect(fx - 3, G.roadTop - 70, 6, 70); g.fillRect(fx + 17, G.roadTop - 70, 6, 70);
        g.fillStyle = "#FF5D73"; rr(fx - 30, G.roadTop - 92, 80, 26, 8); g.fill(); g.fillStyle = "#fff"; g.font = "900 13px Fredoka One, Nunito"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(t("raceFinish"), fx + 10, G.roadTop - 79); }
    }
    function rr(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
    function signs(G, cam) {
      gates.forEach(function (gt) {
        var sx = G.x0 + 40 + (gt.d - cam) * G.ppu; if (sx < -80 || sx > W + 80) return;
        for (var l = 0; l < 3; l++) {
          var y = laneY(l, G), s = laneScale(l), bw = Math.min(G.laneH * 1.05, 84) * s, bh = G.laneH * .78 * s, item = gt.signs[l];
          var state = gt.done ? (l === gt.good ? "good" : l === gt.picked ? "bad" : "") : "";
          g.save(); g.translate(sx, y);
          if (state === "bad") g.translate(Math.sin(tRace * 40) * 3, 0);
          // posts + board
          g.fillStyle = "rgba(0,0,0,.18)"; g.beginPath(); g.ellipse(0, G.laneH * .38, bw * .45, 5, 0, 0, 7); g.fill();
          g.fillStyle = "#8A6A45"; g.fillRect(-bw / 2 + 4, -bh / 2, 5, G.laneH * .86); g.fillRect(bw / 2 - 9, -bh / 2, 5, G.laneH * .86);
          var bc = state === "good" ? "#22C06E" : state === "bad" ? "#FF6B6B" : ["#FFD43B", "#7CC8FF", "#C9A7FF"][l];
          g.fillStyle = bc; rr(-bw / 2, -bh / 2 - bh * .25, bw, bh, 12); g.fill();
          g.fillStyle = "rgba(255,255,255,.9)"; rr(-bw / 2 + 5, -bh / 2 - bh * .25 + 5, bw - 10, bh - 10, 9); g.fill();
          g.fillStyle = "#1E2A3A"; g.textAlign = "center"; g.textBaseline = "alphabetic";
          var fs = item.ar.replace(/[ً-ْ]/g, "").length > 2 ? bh * .4 : bh * .62;
          g.font = fs + "px 'Scheherazade New', serif"; g.direction = "rtl";
          var m = g.measureText(item.ar), mid = m.actualBoundingBoxAscent != null ? (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2 : fs * .3;
          if (m.width > bw - 16) { g.font = (fs * (bw - 16) / m.width) + "px 'Scheherazade New', serif"; m = g.measureText(item.ar); mid = m.actualBoundingBoxAscent != null ? (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2 : fs * .3; }
          g.fillText(item.ar, 0, -bh * .25 + mid);
          g.direction = "ltr";
          if (state === "good") { g.fillStyle = "#fff"; g.font = "900 16px Nunito"; g.fillText("✓", bw / 2 - 12, -bh / 2 - bh * .25 + 14); }
          g.restore();
        }
      });
    }
    function starsDraw(G, cam) {
      stars.forEach(function (s) {
        if (s.got) return; var sx = G.x0 + 40 + (s.d - cam) * G.ppu; if (sx < -30 || sx > W + 30) return;
        var y = laneY(s.lane, G) + Math.sin(tRace * 4 + s.d) * 4, r = 12 * laneScale(s.lane);
        g.fillStyle = "#FFC21A"; g.strokeStyle = "#E08600"; g.lineWidth = 2; g.beginPath();
        for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr2 = i % 2 ? r * .45 : r; g.lineTo(sx + Math.cos(a) * rr2, y + Math.sin(a) * rr2); }
        g.closePath(); g.fill(); g.stroke();
      });
    }
    function kart(who, sx, ly, G, pose, boost, bump) {
      var y = laneY(0, G) + ly * G.laneH, s = laneScale(ly) * Math.min(1.1, G.laneH / 82), col = KART[who === "mo" ? "mo" : who];
      var im = pics[who === "mo" ? pose : who];
      g.save(); g.translate(sx, y + G.laneH * .22 + Math.sin(tRace * 18 + sx) * (boost ? 1.4 : .6) + bump); g.scale(s, s);
      // shadow
      g.fillStyle = "rgba(0,0,0,.22)"; g.beginPath(); g.ellipse(4, 14, 52, 7, 0, 0, 7); g.fill();
      // boost flame / exhaust
      if (boost) { g.fillStyle = "rgba(255,170,40,.85)"; g.beginPath(); g.moveTo(-50, -6); g.lineTo(-74 - Math.random() * 10, -1); g.lineTo(-50, 4); g.closePath(); g.fill(); g.fillStyle = "rgba(255,240,140,.9)"; g.beginPath(); g.moveTo(-50, -3); g.lineTo(-62 - Math.random() * 6, -1); g.lineTo(-50, 2); g.closePath(); g.fill(); }
      // driver (upper body from the picture)
      if (im && im.ok) {
        var b = im.box, ch = b.h * .5, dw = 50, dh = dw * ch / b.w;
        g.drawImage(im, b.x, b.y, b.w, ch, -22, -14 - dh, dw, dh);
      }
      // body
      g.fillStyle = col[0]; g.strokeStyle = col[1]; g.lineWidth = 3; g.lineJoin = "round";
      g.beginPath(); g.moveTo(-48, 2); g.quadraticCurveTo(-48, -14, -30, -16); g.lineTo(18, -18); g.quadraticCurveTo(44, -18, 52, -4); g.lineTo(54, 6); g.lineTo(-48, 6); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "rgba(255,255,255,.35)"; g.beginPath(); g.moveTo(-36, -10); g.lineTo(14, -12); g.lineTo(12, -8); g.lineTo(-36, -6); g.closePath(); g.fill();
      // number plate / front bumper
      g.fillStyle = "#fff"; rr(30, -10, 16, 11, 4); g.fill(); g.fillStyle = col[1]; g.font = "900 9px Nunito"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(who === "mo" ? "1" : who === "ais" ? "2" : "3", 38, -4.5);
      // steering wheel
      g.strokeStyle = "#2A2F3D"; g.lineWidth = 3; g.beginPath(); g.moveTo(10, -16); g.lineTo(18, -26); g.stroke(); g.beginPath(); g.ellipse(18, -27, 3, 7, .4, 0, 7); g.stroke();
      // wheels
      [-30, 34].forEach(function (wx) {
        g.fillStyle = "#2A2F3D"; g.beginPath(); g.arc(wx, 8, 12, 0, 7); g.fill(); g.fillStyle = "#C9D3E3"; g.beginPath(); g.arc(wx, 8, 5, 0, 7); g.fill();
        g.strokeStyle = "#8E9BB0"; g.lineWidth = 2; var a = tRace * 20; g.beginPath(); g.moveTo(wx + Math.cos(a) * 5, 8 + Math.sin(a) * 5); g.lineTo(wx - Math.cos(a) * 5, 8 - Math.sin(a) * 5); g.stroke();
      });
      g.restore();
    }
    function particles(dt) {
      parts = parts.filter(function (p) { p.t += dt; return p.t < p.life; });
      parts.forEach(function (p) { var k = p.t / p.life; g.globalAlpha = 1 - k; g.fillStyle = p.c; g.beginPath(); g.arc(p.x + p.vx * p.t, p.y + p.vy * p.t + 60 * p.t * p.t, p.r * (1 - k * .5), 0, 7); g.fill(); });
      g.globalAlpha = 1;
    }
    function burst(x, y, c, n) { for (var i = 0; i < (n || 14); i++) { var a = Math.random() * 7, s = 60 + Math.random() * 120; parts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, r: 3 + Math.random() * 4, t: 0, life: .7 + Math.random() * .4, c: c || ["#FFC93D", "#FF8FB1", "#5BE38A", "#7CC8FF"][i % 4] }); } }

    /* --- the loop --- */
    function frame(now) {
      if (my !== live || !document.body.contains(cv)) return;
      var dt = Math.min(.05, last ? (now - last) / 1000 : 0); last = now;
      var G = geo();
      if (phase === "race" || phase === "end") {
        tRace += dt;
        // Mo's speed: 1 unit/s, turbo 1.5×, slow 0.6×
        var v = 1; if (mo.boost > 0) { v = 1.5; mo.boost -= dt; } else if (mo.slow > 0) { v = .6; mo.slow -= dt; }
        if (phase === "end") v = Math.max(.25, (mo.v || 1) - dt * .5);
        mo.v = v; mo.d += v * dt;
        riv.forEach(function (rv) { rv.d += rv.sp * (1 + .12 * Math.sin(tRace * .8 + rv.ph)) * dt; if (!rv.tFin && rv.d >= LEN) rv.tFin = tRace; });
        // rivals change lanes now and then, keeping out of Mo's way
        riv.forEach(function (rv) {
          if (Math.random() < dt * .25) { var near = Math.abs(rv.d - mo.d) < 1.4, choices = [0, 1, 2].filter(function (l) { return !near || l !== mo.lane; }).filter(function (l) { return riv.every(function (o) { return o === rv || o.lane !== l || Math.abs(o.d - rv.d) > 1.2; }); }); if (choices.length) rv.lane = U.pick(choices); }
          rv.ly += (rv.lane - rv.ly) * Math.min(1, dt * 5);
        });
        mo.ly += (mo.lane - mo.ly) * Math.min(1, dt * 9);
        if (mo.poseT > 0) { mo.poseT -= dt; if (mo.poseT <= 0) mo.pose = "mo"; }
        if (phase === "race") gateLogic(G);
        // stars
        stars.forEach(function (s) { if (!s.got && Math.abs(s.d - mo.d - .35) < .25 && Math.round(mo.ly) === s.lane) { s.got = true; got++; starN.querySelector("b").textContent = got; A.fx.coin(); J.bump(starN); burst(G.x0 + 40, laneY(s.lane, G), "#FFC21A", 10); } });
        if (phase === "race" && mo.d >= LEN) finish();
      }
      var cam = mo.d;
      g.clearRect(0, 0, W, H);
      bg(G, cam); road(G, cam); starsDraw(G, cam);
      // karts drawn back to front (top lane first)
      var all = riv.map(function (rv) { return { who: rv.k, x: G.x0 + (rv.d - cam) * G.ppu, ly: rv.ly }; });
      all.push({ who: "mo", x: G.x0, ly: mo.ly, me: 1 });
      // signs for the lanes behind each kart are drawn before it
      signs(G, cam);
      all.sort(function (a, b) { return a.ly - b.ly; }).forEach(function (k) { if (k.x < -90 || k.x > W + 90) return; kart(k.who, k.x, k.ly, G, k.me ? mo.pose : null, k.me ? mo.boost > 0 : false, k.me && mo.shake > 0 ? Math.sin(tRace * 50) * 2 : 0); });
      if (mo.shake > 0) mo.shake -= dt;
      particles(dt);
      // the top bar track
      var pos = function (d) { return Math.max(0, Math.min(1, d / LEN)); };
      who[0].style.left = (pos(riv[0].d) * 100) + "%"; who[1].style.left = (pos(riv[1].d) * 100) + "%"; who[2].style.left = (pos(mo.d) * 100) + "%";
      requestAnimationFrame(frame);
    }
    function gateLogic(G) {
      gates.forEach(function (gt) {
        if (gt.done) return;
        var sx = G.x0 + 40 + (gt.d - mo.d) * G.ppu;
        // the sound, as the gate comes into view
        if (!gt.said && sx < W + 30) { gt.said = true; curGate = gt; sayTarget(); }
        if (mo.d + .32 >= gt.d) {
          gt.done = true; gt.picked = Math.round(mo.ly);
          var y = laneY(gt.picked, G);
          if (gt.picked === gt.good) {
            okN++; mo.boost = 1.6; mo.slow = 0; mo.pose = "moYes"; mo.poseT = 1.4; A.fx.combo(okN); J.buzz(15); burst(G.x0 + 40, y, null, 18);
            if (okN === 3 || okN === 6) HJ.toast(HJ.art("flame", 22) + " " + esc(t("raceTurbo")));
          } else {
            mo.slow = 1.2; mo.boost = 0; mo.pose = "moOh"; mo.poseT = 1.2; mo.shake = .35; A.fx.bad(); J.buzz([20, 30, 20]);
            if (gt.q.k) S.addMiss && S.addMiss(gt.q);
            setTimeout(function () { if (my === live) A.say(gt.q.au); }, 350);
          }
        }
      });
    }
    function sayTarget() { if (curGate && !curGate.done) { spk.classList.remove("ping"); void spk.offsetWidth; spk.classList.add("ping"); A.say(curGate.q.au); } }

    /* --- controls: tap a lane (or a sign), swipe up/down, arrow keys --- */
    function laneAt(clientY) { var b = cv.getBoundingClientRect(), G = geo(), y = clientY - b.top; if (y < G.roadTop - G.laneH * .6) return null; return Math.max(0, Math.min(2, Math.floor((y - G.roadTop) / G.laneH))); }
    var sy = null;
    cv.addEventListener("pointerdown", function (e) { A.unlock(); sy = e.clientY; var l = laneAt(e.clientY); if (l != null && phase === "race") { if (l !== mo.lane) A.fx.step(); mo.lane = l; tipEl.classList.add("gone"); } });
    cv.addEventListener("pointerup", function (e) { if (sy != null && phase === "race") { var d = e.clientY - sy; if (Math.abs(d) > 40) { mo.lane = Math.max(0, Math.min(2, mo.lane + (d > 0 ? 1 : -1))); } } sy = null; });
    function key(e) { if (phase !== "race") return; if (e.key === "ArrowUp") mo.lane = Math.max(0, mo.lane - 1); if (e.key === "ArrowDown") mo.lane = Math.min(2, mo.lane + 1); }
    document.addEventListener("keydown", key);
    spk.onclick = function () { A.unlock(); A.fx.tap(); sayTarget(); };
    x.onclick = function () {
      HJ.modal(function (p, close) {
        p.appendChild(APP().moImg("pose-23", "120px"));
        p.appendChild(el("h2", "", esc(t("quit"))));
        var r = el("div", "row"), y = el("button", "btn ghost", t("yesQuit")), n = el("button", "btn", t("keepPlaying"));
        y.onclick = function () { close(); stop(); open(R.w); }; n.onclick = close;
        r.appendChild(y); r.appendChild(n); p.appendChild(r);
      });
    };
    function stop() { live++; document.removeEventListener("keydown", key); window.removeEventListener("resize", size); A.stop(); }

    /* --- countdown: three lights, each says a sound from this race --- */
    var cd = el("div", "race-count", '<div class="rc-lights"><i></i><i></i><i></i></div><b class="rc-say"></b>'); wrap.appendChild(cd);
    var sounds = U.shuffle(R.targets.slice()).slice(0, 3);
    A.talk(t("raceReady"), lang());
    var ci = 0;
    function light() {
      if (my !== live) return;
      if (ci < 3) {
        cd.querySelectorAll("i")[ci].classList.add("on"); var it = sounds[ci % sounds.length];
        cd.querySelector(".rc-say").innerHTML = '<span class="ar">' + esc(it.ar) + "</span>"; A.fx.note(ci);
        A.say(it.au).then(function () { setTimeout(light, 380); }); ci++; return;
      }
      cd.querySelectorAll("i").forEach(function (i) { i.classList.add("go"); });
      cd.querySelector(".rc-say").textContent = t("raceGo"); A.fx.unlock(); J.buzz(30);
      phase = "race"; setTimeout(function () { cd.classList.add("out"); }, 600); setTimeout(function () { cd.remove(); }, 1000);
    }
    setTimeout(light, 900);
    requestAnimationFrame(frame);

    /* --- finish: places, stars, the podium --- */
    function finish() {
      phase = "end"; mo.tFin = tRace; A.fx.win();
      // rivals that haven't crossed yet: their finishing time from their pace
      riv.forEach(function (rv) { if (!rv.tFin) rv.tFin = tRace + (LEN - rv.d) / rv.sp; });
      var place = 1 + riv.filter(function (rv) { return rv.tFin < mo.tFin; }).length;
      var st = S.get(), old = best(R.id), nb = old ? Math.min(old, place) : place;
      rst()[R.id] = nb;
      var gain = (4 - nb) - (old ? 4 - old : 0) + Math.floor(got / 3);   // stars: 3/2/1 for the place (once, improvable) + 1 per 3 road stars
      if (gain > 0) st.bonus = (st.bonus || 0) + gain;
      S.save();
      setTimeout(function () { if (my === live) podium(R, place, gain); }, 1400);
    }
    function podium(R, place, gain) {
      stop(); APP().confetti(place === 1 ? 90 : 40);
      var order = [{ k: "mo", t: mo.tFin }].concat(riv.map(function (rv) { return { k: rv.k, t: rv.tFin }; })).sort(function (a, b) { return a.t - b.t; });
      HJ.modal(function (p, close) {
        p.classList.add("race-pod");
        p.appendChild(el("div", "kicker", esc(t("raceT")) + " · " + esc(R.gp ? t("raceGP") : t("raceN", { n: R.i + 1 }))));
        p.appendChild(el("h2", "", esc(t("place" + place)) + " " + (place === 1 ? "🏆" : "")));
        var pod = el("div", "pod");
        [1, 0, 2].forEach(function (i) {
          var o = order[i], col = el("div", "pod-col p" + (i + 1) + (o.k === "mo" ? " me" : ""));
          var im = el("img", "mo-g"); im.alt = o.k === "mo" ? "Baby Mo" : o.k === "ais" ? "Ais" : "Kak Adam";
          im.src = o.k === "mo" ? (i === 0 ? IMG.moWin : "assets/mo/mo-ok.webp") : o.k === "ais" ? (i === 0 ? IMG.aisWin : IMG.ais) : (i === 0 ? IMG.adamWin : IMG.adam);
          col.appendChild(im); col.appendChild(el("div", "pod-step", "<b>" + (i + 1) + "</b>")); pod.appendChild(col);
        });
        p.appendChild(pod);
        p.appendChild(el("div", "row res-chips", '<span class="chip glass">' + cup(Math.min(3, place), 26) + " " + esc(t("raceRight", { n: okN, m: gates.length })) + '</span><span class="chip glass">' + HJ.art("star", 22) + " <b>" + (gain > 0 ? "+" + gain : got) + "</b></span>"));
        var r = el("div", "row"), again = el("button", "btn ghost", HJ.ic("replay") + " " + t("again")), list = races(R.w), nx = list[R.i + 1];
        var go = el("button", "btn", (nx ? t("next") : t("raceMenu")) + " " + HJ.ic("next"));
        again.onclick = function () { close(); play(R); };
        go.onclick = function () { close(); if (nx) play(nx); else open(R.w); };
        r.appendChild(again); r.appendChild(go); p.appendChild(r);
        var menu = el("button", "btn small ghost", HJ.ic("map") + " " + t("raceMenu")); menu.onclick = function () { close(); open(R.w); }; p.appendChild(menu);
        A.talk(t("place" + place), lang());
      }, { sticky: true });
    }
  }
  function flagSvg() { return '<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 2v17" stroke="#3A4256" stroke-width="2"/>' + [0, 1, 2, 3, 4, 5].map(function (i) { return '<rect x="' + (4 + (i % 3) * 4) + '" y="' + (2 + (i / 3 | 0) * 4) + '" width="4" height="4" fill="' + ((i + (i / 3 | 0)) % 2 ? "#222" : "#fff") + '"/>'; }).join("") + "</svg>"; }

  HJ.race = { open: open, card: card, races: races, play: function (id) { var w = +String(id).split("-")[0]; races(w).forEach(function (r) { if (r.id === id) play(r); }); } };
})();
