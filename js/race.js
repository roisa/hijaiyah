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
  var WORLDS = ["baby", 1, 2, 3, 4, "kasrah", "dhammah", "tanwin", "hill", "snow", "desert", "candy"], PER = 5, GATES = 8, GP_GATES = 10;
  // the bonus tracks: new places, letters from the books (snow = the look-alike letters, candy = a bit of everything)
  var EXTRA = {
    // for the littlest (about 2+): one big balloon with one letter, tap anywhere, always a turbo; 2 letters a race
    baby: { baby: 1, th: "rainbow", flag: "أ", bg: "stickers", name: ["Balap Balon · 2+", "Balloon Race · 2+"], icon: ["#FFD43B", "#FF5D73"] },
    hill: { src: [1], flag: "ح", bg: "w2", name: ["Bukit Hijau", "Green Hills"], icon: ["#8FE38A", "#3DB86B"] },
    snow: { src: [1], flag: "ث", bg: "w3", name: ["Negeri Salju", "Snowland"], icon: ["#BFE4FF", "#5BA8F0"], hard: 1 },
    desert: { src: [3], flag: "ص", bg: "w1", name: ["Gurun Pasir", "Desert Dunes"], icon: ["#FFD08A", "#F0903A"] },
    candy: { src: [1, 2, 3, 4], flag: "ق", bg: "stickers", name: ["Negeri Permen", "Candy Land"], icon: ["#FFB3E1", "#FF5FA2"] },
    // the vowel tracks: every letter with kasrah / dhammah / tanwin; from race 3 the other choices are the same letter
    // with a different vowel (بِ or بَ or بُ?) so the ear learns the harakat
    kasrah: { vow: "i", th: "rainbow", flag: "بِ", bg: "w3", name: ["Taman Pelangi · Kasrah", "Rainbow Park · Kasrah"], icon: ["#B8D8FF", "#9B6DFF"], vmix: ["a", "i", "u"], order: 1 },
    dhammah: { vow: "u", th: "space", flag: "بُ", bg: "w3", name: ["Luar Angkasa · Dhammah", "Outer Space · Dhammah"], icon: ["#5A3EA0", "#140C3A"], vmix: ["a", "i", "u"], order: 1 },
    tanwin: { tanwin: 1, th: "dino", flag: "بٌ", bg: "w4", name: ["Pulau Dino · Tanwin", "Dino Island · Tanwin"], icon: ["#8FE38A", "#FF8A3D"], vmix: ["an", "in", "un"] }
  };
  function wName(n) { return EXTRA[n] ? EXTRA[n].name[S.get().lang === "en" ? 1 : 0] : tr(HJ.worlds[n - 1].name); }
  function wIcon(n) {
    if (!EXTRA[n]) return HJ.wi(n, true).outerHTML;
    var c = EXTRA[n].icon, art = {
      hill: '<path d="M2 26 Q10 12 18 20 Q24 10 34 26Z" fill="#fff" opacity=".9"/><circle cx="27" cy="9" r="4" fill="#FFE27A"/>',
      snow: '<path d="M18 5v26M7 11l22 14M29 11L7 25" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="18" cy="18" r="3" fill="#fff"/>',
      desert: '<path d="M18 30V9M18 18h-6v-6M18 15h6v-5" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"/><path d="M3 31 Q18 24 33 31Z" fill="#fff" opacity=".7"/>',
      kasrah: '<path d="M4 26 A14 14 0 0 1 32 26" stroke="#FF5D73" stroke-width="3" fill="none"/><path d="M8 26 A10 10 0 0 1 28 26" stroke="#FFD43B" stroke-width="3" fill="none"/><path d="M12 26 A6 6 0 0 1 24 26" stroke="#22C06E" stroke-width="3" fill="none"/><path d="M12 31 L24 28" stroke="#fff" stroke-width="3" stroke-linecap="round"/>',
      dhammah: '<circle cx="15" cy="19" r="8" fill="#FFB86B"/><ellipse cx="15" cy="19" rx="13" ry="3.5" fill="none" stroke="#FFE27A" stroke-width="2" transform="rotate(-20 15 19)"/><circle cx="29" cy="8" r="1.6" fill="#fff"/><circle cx="6" cy="6" r="1.2" fill="#fff"/><path d="M28 18c4 0 4 6 0 6" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
      tanwin: '<path d="M6 28 Q10 16 20 18 Q24 8 30 10 Q28 14 26 14 Q24 22 22 28" fill="#fff"/><circle cx="28" cy="11.5" r="1.3" fill="#2A1F3D"/><path d="M9 7l8-2M9 11l8-2" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>',
      baby: '<ellipse cx="18" cy="14" rx="9" ry="11" fill="#fff"/><path d="M18 25 q-3 4 0 8" stroke="#fff" stroke-width="2" fill="none"/><text x="18" y="18" text-anchor="middle" font-size="12" font-weight="900" fill="#FF5D73" font-family="Nunito">2+</text>',
      candy: '<path d="M18 30V18" stroke="#fff" stroke-width="3"/><circle cx="18" cy="12" r="8" fill="#fff"/><path d="M18 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0" fill="none" stroke="#FF5FA2" stroke-width="2.5"/>'
    }[n];
    return '<span class="wi" style="background:linear-gradient(160deg,' + c[0] + "," + c[1] + ')"><svg viewBox="0 0 36 36" width="70%" height="70%" aria-hidden="true">' + art + "</svg></span>";
  }
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
    var X = EXTRA[n], pool;
    if (X && X.baby) {
      pool = worldPool(1);
      var L2 = [], bl = [];
      for (var bi = 0; bi < PER; bi++) L2.push({ id: n + "-" + (bi + 1), w: n, th: X.th, flag: pool[bi * 2].ar, baby: 1, i: bi, gp: false, targets: pool.slice(bi * 2, bi * 2 + 2), pool: pool.slice(0, 10), easy: true });
      L2.push({ id: n + "-gp", w: n, th: X.th, flag: "ب", baby: 1, i: PER, gp: true, targets: pool.slice(0, 10), pool: pool.slice(0, 10), easy: true });
      return (cache[n] = L2);
    }
    if (X && (X.vow || X.tanwin)) {
      var hasC = function (x) { return x && HJ.audio.hasClip(x.ar); };
      if (X.vow) pool = HJ.L.map(function (l) { return HJ.syl(l.k, X.vow); }).filter(hasC);            // in hijaiyah order
      else {
        var seenT = {}; pool = [];
        HJ.L.forEach(function (l) { ["an", "in", "un"].forEach(function (v) { var x = HJ.syl(l.k, v); if (hasC(x) && !seenT[x.ar]) { seenT[x.ar] = 1; pool.push(x); } }); });
        worldPool(4).forEach(function (x) { if (/[\u064B-\u064D]/.test(x.ar) && !seenT[x.ar]) { seenT[x.ar] = 1; pool.push(x); } });   // Book 4 tanwin words
      }
    } else if (X) {   // a mix from the books it draws on, in a fixed (seeded) order
      pool = []; X.src.forEach(function (b) { pool = pool.concat(worldPool(b)); });
      var h = function (s2) { var v = 0; for (var q = 0; q < s2.length; q++) v = (v * 31 + s2.charCodeAt(q)) >>> 0; return v; };
      pool = pool.map(function (x) { return { x: x, k: h(n + x.ar) }; }).sort(function (a, b) { return a.k - b.k; }).map(function (o) { return o.x; });
    } else pool = worldPool(n);
    var k = Math.ceil(pool.length / PER), list = [];
    for (var i = 0; i < PER; i++) {
      var chunk = pool.slice(i * k, (i + 1) * k);
      if (!chunk.length) chunk = pool.slice(-k);
      list.push({ id: n + "-" + (i + 1), w: n, th: X ? X.th || n : null, vmix: X && X.vmix && i >= 2 ? X.vmix : null, flag: X ? X.flag : null, i: i, gp: false, targets: chunk, pool: X && X.hard ? pool : pool.slice(0, Math.max((i + 1) * k, 6)), easy: n === 1 && i < 3 });
    }
    list.push({ id: n + "-gp", w: n, th: X ? X.th || n : null, vmix: X && X.vmix ? X.vmix : null, flag: X ? X.flag : null, i: PER, gp: true, targets: pool, pool: pool, easy: false });
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
    var b = im.box, c = document.createElement("canvas"); c.width = c.height = 128; var g = c.getContext("2d");
    var mo = k.indexOf("mo") === 0, side = b.w * (mo ? .66 : .74), cx = b.x + b.w / 2, cy = b.y + side * (mo ? .5 : .48);
    if (k === "ais") cx = b.x + b.w * .56;                              // her raised fist makes the picture wider on one side
    g.beginPath(); g.arc(64, 64, 64, 0, 7); g.clip(); g.fillStyle = mo ? "#CFEFFF" : k.indexOf("ais") === 0 ? "#FFE0EE" : "#DCE8FF"; g.fillRect(0, 0, 128, 128);
    g.drawImage(im, cx - side / 2, cy - side / 2, side, side, 0, 0, 128, 128);
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
    if (HJ.bg) HJ.bg(EXTRA[curW] ? EXTRA[curW].bg : "w" + curW);
    var top = el("div", "rm-top"), back = el("button", "nav-btn", HJ.ic("back"));
    back.setAttribute("aria-label", t("close")); back.onclick = function () { A.fx.tap(); HJ.go.home(); };
    top.appendChild(back); top.appendChild(el("div", "rm-title", "<b>" + esc(t("raceT")) + "</b><small>" + esc(t("raceSub")) + "</small>")); sc.appendChild(top);
    var body = el("main", "scroller rm-body"); sc.appendChild(body);
    // the karts on the start line
    var hero = el("div", "rm-hero", heroSvg()); body.appendChild(hero);
    load(function () { hero.innerHTML = heroSvg(); });
    // coins + the Garage
    var gbar = el("div", "rm-gbar", '<span class="rm-coins"><i class="rt-coin"></i><b>' + (S.get().coins || 0) + '</b></span>');
    var gb = el("button", "btn small rm-garage", HJ.ic("gear") + " " + esc(t("garage"))); gb.onclick = function () { A.fx.tap(); garage(); }; gbar.appendChild(gb);
    body.appendChild(gbar);
    var tabs = el("div", "rm-tabs");
    WORLDS.forEach(function (n) {
      var b = el("button", "rm-tab" + (n === curW ? " on" : "") + (EXTRA[n] ? " x" : ""), wIcon(n) + "<span>" + esc(EXTRA[n] ? wName(n) : t("book") + " " + n) + "</span>");
      b.onclick = function () { A.fx.tap(); open(n); }; tabs.appendChild(b);
    });
    body.appendChild(tabs);
    body.appendChild(el("div", "rm-wname", "<b>" + esc(wName(curW)) + "</b>" + (EXTRA[curW] ? ' <span class="rm-new">' + esc(t("raceNew")) + "</span>" : "")));
    // the tracks as a winding road: each race a stop, the Grand Prix a trophy at the end
    var list = el("div", "rm-map"), RS = races(curW), stepY = 112, mapH = RS.length * stepY + 30;
    list.style.height = mapH + "px";
    var pts = RS.map(function (r, i) { return { x: [28, 72, 50, 26, 70, 50][i % 6], y: 50 + i * stepY }; });
    var d = "M" + pts[0].x * 4 + " " + pts[0].y; for (var pi = 1; pi < pts.length; pi++) { var a0 = pts[pi - 1], b0 = pts[pi]; d += " C" + a0.x * 4 + " " + (a0.y + stepY * .55) + " " + b0.x * 4 + " " + (b0.y - stepY * .55) + " " + b0.x * 4 + " " + b0.y; }
    list.innerHTML = '<svg class="rm-road" viewBox="0 0 400 ' + mapH + '" preserveAspectRatio="none" aria-hidden="true"><path d="' + d + '" stroke="rgba(0,0,0,.12)" stroke-width="40" fill="none" stroke-linecap="round" transform="translate(0 5)"/><path d="' + d + '" stroke="#6B7488" stroke-width="38" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="#fff" stroke-width="3" stroke-dasharray="12 12" fill="none"/></svg>';
    var curI = -1; RS.forEach(function (r, i) { if (curI < 0 && isOpen(r) && !best(r.id)) curI = i; });
    RS.forEach(function (r, i) {
      var op = isOpen(r), bp = best(r.id), tm = (S.get().raceT || {})[r.id], P = pts[i];
      var c = el("button", "rm-stop" + (r.gp ? " gp" : "") + (op ? "" : " locked") + (bp ? " done" : "") + (i === curI ? " cur" : ""));
      c.style.left = P.x + "%"; c.style.top = P.y + "px";
      c.innerHTML = '<span class="rm-dot">' + (op ? (r.gp ? HJ.art("trophy", 34) : '<b>' + (i + 1) + "</b>") : HJ.ic("lock")) + (bp ? '<span class="rm-medal">' + cup(bp, 30) + "</span>" : "") + "</span>" +
        '<span class="rm-lbl"><b>' + esc(r.gp ? t("raceGP") : t("raceN", { n: i + 1 })) + "</b>" + (tm ? "<small>⏱ " + clock(tm) + "</small>" : '<small class="ar">' + r.targets.slice(0, 3).map(function (x) { return esc(x.ar); }).join(" ") + "</small>") + "</span>";
      c.setAttribute("aria-label", (r.gp ? t("raceGP") : t("raceN", { n: i + 1 })) + (bp ? " · " + t("place" + bp) : "") + (op ? "" : " · " + t("locked")));
      c.onclick = function () {
        A.unlock();
        if (!op) { A.fx.bad(); HJ.toast(HJ.ic("lock") + " " + esc(t("raceLocked"))); A.talk(t("raceLocked"), lang()); return; }
        A.fx.tap(); play(r);
      };
      list.appendChild(c);
      if (i === curI) { var kk = el("span", "rm-kart"); kk.innerHTML = '<svg viewBox="0 0 80 60" width="64" height="48" aria-hidden="true"><ellipse cx="40" cy="54" rx="30" ry="4" fill="rgba(0,0,0,.2)"/><rect x="6" y="32" width="14" height="20" rx="5" fill="#23262F"/><rect x="60" y="32" width="14" height="20" rx="5" fill="#23262F"/><path d="M14 46 Q12 22 28 20 H52 Q68 22 66 46Z" fill="#FF6B5B"/><circle cx="40" cy="14" r="11" fill="#FF6B5B"/><rect x="38" y="3" width="4" height="22" fill="#fff"/></svg>'; kk.style.left = P.x + "%"; kk.style.top = (P.y - 52) + "px"; list.appendChild(kk); }
    });
    body.appendChild(list);
    body.appendChild(el("p", "rm-note", esc(t("raceNote"))));
    A.talk(t("raceHow"), lang());
  }
  function clock(sec) { var m = Math.floor(sec / 60), s2 = Math.round(sec % 60); return m + ":" + (s2 < 10 ? "0" : "") + s2; }

  /* ---------- the Garage: coins buy paint and wheels ---------- */
  var SHOP = { paint: [["red", 0], ["orange", 30], ["yellow", 30], ["green", 40], ["blue", 40], ["purple", 50], ["pink", 50], ["gold", 120]], rim: [["classic", 0], ["star", 60], ["rainbow", 90]], horn: [["beep", 0], ["trumpet", 40], ["duck", 60]] };
  function gst() { var s = S.get(); s.garage = s.garage || { paint: "red", rim: "classic", owned: ["paint:red", "rim:classic"] }; if (!s.garage.horn) { s.garage.horn = "beep"; s.garage.owned.push("horn:beep"); } return s.garage; }
  function garage() {
    HJ.modal(function (p, close) {
      p.classList.add("garage");
      var G = gst();
      p.appendChild(el("h2", "", esc(t("garage"))));
      var coins = el("div", "rm-coins big", '<i class="rt-coin"></i><b>' + (S.get().coins || 0) + "</b>"); p.appendChild(coins);
      var cv = el("canvas", "gar-cv"); cv.width = 520; cv.height = 360; p.appendChild(cv);
      function draw() {
        var g = cv.getContext("2d"); g.clearRect(0, 0, cv.width, cv.height);
        var q = g.createLinearGradient(0, 0, 0, cv.height); q.addColorStop(0, "#BDE5FF"); q.addColorStop(1, "#EAF6FF"); g.fillStyle = q; g.fillRect(0, 0, cv.width, cv.height);
        g.fillStyle = "#6B7488"; g.beginPath(); g.moveTo(140, 200); g.lineTo(380, 200); g.lineTo(520, 360); g.lineTo(0, 360); g.closePath(); g.fill();
        HJ.race3d.drawKart(g, 260, 340, 250, { paint: HJ.race3d.PAINT[G.paint], rim: HJ.race3d.RIMS[G.rim], helmet: HJ.race3d.PAINT[G.paint], shirt: ["#43B85C", "#FF8A3D"], num: "1", hair: "#22252E", star: true }, {});
      }
      draw();
      [["paint", "garagePaint"], ["rim", "garageRims"], ["horn", "garageHorn"]].forEach(function (sec) {
        p.appendChild(el("div", "gar-h", esc(t(sec[1]))));
        var row = el("div", "gar-row");
        SHOP[sec[0]].forEach(function (it) {
          var key = sec[0] + ":" + it[0], own = G.owned.indexOf(key) >= 0, on = G[sec[0]] === it[0];
          var col = sec[0] === "paint" ? HJ.race3d.PAINT[it[0]] : sec[0] === "rim" ? HJ.race3d.RIMS[it[0]] : ["#7CC8FF", "#3D7BFF"];
          var face2 = sec[0] === "horn" ? '<i class="gar-horn" style="background:linear-gradient(160deg,' + col[0] + "," + col[1] + ')">' + esc(t("horn" + it[0])) + "</i>" : '<i style="background:linear-gradient(160deg,' + col[0] + "," + col[1] + ')"></i>';
          var b = el("button", "gar-it" + (on ? " on" : "") + (own ? "" : " shop"), face2 +
            (on ? '<small>' + HJ.ic("check") + "</small>" : own ? "" : '<small><i class="rt-coin"></i>' + it[1] + "</small>"));
          b.setAttribute("aria-label", it[0] + (own ? "" : " · " + it[1]));
          b.onclick = function () {
            A.unlock(); var st = S.get(); if (sec[0] === "horn") HJ.race3d.HORNS[it[0]](1);
            if (!own) {
              if ((st.coins || 0) < it[1]) { A.fx.bad(); HJ.toast('<i class="rt-coin"></i> ' + esc(t("garageNeed", { n: it[1] - (st.coins || 0) }))); A.talk(t("garageNeed", { n: it[1] - (st.coins || 0) }), lang()); return; }
              st.coins -= it[1]; G.owned.push(key); A.fx.unlock(); APP().confetti(30);
            } else A.fx.tap();
            G[sec[0]] = it[0]; S.save(); close(); garage();
          };
          row.appendChild(b);
        });
        p.appendChild(row);
      });
      var ok = el("button", "btn", t("next") + " " + HJ.ic("next")); ok.onclick = function () { close(); open(); }; p.appendChild(ok);
    });
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

  /* ---------- the race (engine in js/race3d.js) ---------- */
  var live = 0;
  function play(r) {
    if (S.overLimit()) return HJ.restScreen(function () { play(r); });
    var my = ++live;
    load(function () {
      if (my !== live) return;
      HJ.race3d.run(r, {
        face: face,
        faceOf: function (k) { return face({ mo: "moFace", yes: "moYes", oh: "moOh", win: "moWin" }[k] || "moFace"); },
        onQuit: function () { open(r.w); },
        onFinish: function (res) { reward(r, res); }
      });
    });
  }
  function reward(R, res) {
    var st = S.get(), old = best(R.id), nb = old ? Math.min(old, res.place) : res.place;
    rst()[R.id] = nb;
    var gain = (4 - nb) - (old ? 4 - old : 0);                         // stars: 3/2/1 for the place (once, can improve)
    if (gain > 0) st.bonus = (st.bonus || 0) + gain;
    st.coins = (st.coins || 0) + res.coins;                             // coins go to the Garage
    var bt = st.raceT = st.raceT || {}, rec = !bt[R.id] || res.time < bt[R.id]; if (rec) bt[R.id] = Math.round(res.time * 10) / 10;
    S.save();
    podium(R, res, gain, rec && old);
  }
  function podium(R, res, gain, record) {
    APP().confetti(res.place === 1 ? 90 : 40); A.fx.win();
    var IMGS = { mo: [IMG.moWin, "assets/mo/mo-ok.webp"], ais: [IMG.aisWin, IMG.ais], adam: [IMG.adamWin, IMG.adam] };
    HJ.modal(function (p, close) {
      p.classList.add("race-pod");
      p.appendChild(el("div", "kicker", esc(t("raceT")) + " · " + esc(R.gp ? t("raceGP") : t("raceN", { n: R.i + 1 }))));
      p.appendChild(el("h2", "", esc(t("place" + res.place))));
      var pod = el("div", "pod");
      [1, 0, 2].forEach(function (i) {
        var o = res.order[i], col = el("div", "pod-col p" + (i + 1) + (o.k === "mo" ? " me" : ""));
        var im = el("img", "mo-g"); im.alt = o.k === "mo" ? "Baby Mo" : o.k === "ais" ? "Ais" : "Kak Adam"; im.src = IMGS[o.k][i === 0 ? 0 : 1];
        col.appendChild(im); col.appendChild(el("div", "pod-step", "<b>" + (i + 1) + "</b>")); pod.appendChild(col);
      });
      p.appendChild(pod);
      var mm = Math.floor(res.time / 60), ss = Math.round(res.time % 60);
      p.appendChild(el("div", "row res-chips",
        '<span class="chip glass">' + cup(res.place, 24) + " " + esc(t("raceRight", { n: res.ok, m: res.total })) + "</span>" +
        '<span class="chip glass"><i class="rt-coin"></i> <b>+' + res.coins + "</b></span>" +
        (gain > 0 ? '<span class="chip glass">' + HJ.art("star", 20) + " <b>+" + gain + "</b></span>" : "") +
        '<span class="chip glass' + (record ? " lit" : "") + '">⏱ ' + mm + ":" + (ss < 10 ? "0" : "") + ss + (record ? " · " + esc(t("raceRecord")) : "") + "</span>"));
      var r = el("div", "row"), again = el("button", "btn ghost", HJ.ic("replay") + " " + t("again")), list = races(R.w), nx = list[R.i + 1];
      var go = el("button", "btn", (nx ? t("next") : t("raceMenu")) + " " + HJ.ic("next"));
      again.onclick = function () { close(); play(R); };
      go.onclick = function () { close(); if (nx) play(nx); else open(R.w); };
      r.appendChild(again); r.appendChild(go); p.appendChild(r);
      var menu = el("button", "btn small ghost", HJ.ic("map") + " " + t("raceMenu")); menu.onclick = function () { close(); open(R.w); }; p.appendChild(menu);
      A.talk(t("place" + res.place), lang());
    }, { sticky: true });
  }
  function flagSvg() { return '<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 2v17" stroke="#3A4256" stroke-width="2"/>' + [0, 1, 2, 3, 4, 5].map(function (i) { return '<rect x="' + (4 + (i % 3) * 4) + '" y="' + (2 + (i / 3 | 0) * 4) + '" width="4" height="4" fill="' + ((i + (i / 3 | 0)) % 2 ? "#222" : "#fff") + '"/>'; }).join("") + "</svg>"; }

  HJ.race = { open: open, card: card, races: races, play: function (id) { var w0 = String(id).split("-")[0], w = EXTRA[w0] ? w0 : +w0; races(w).forEach(function (r) { if (r.id === id) play(r); }); } };
})();
