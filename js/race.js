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
  // the learning path, easiest first: letters → fathah → kasrah → dhammah → tanwin → joined words → … → mixes
  // four stages, like the books: letters → vowel marks (each on its own track) → reading words → the champion mix
  var STAGES = [
    { n: ["Huruf", "Letters"], w: ["baby", 1, "snow"] },
    { n: ["Harakat", "Vowel marks"], w: ["kasrah", "dhammah", "desert", "tanwin", "hill"] },
    { n: ["Kata", "Words"], w: [2, 3, 4] },
    { n: ["Juara", "Champion"], w: ["candy"] }
  ];
  var WORLDS = [].concat.apply([], STAGES.map(function (g) { return g.w; })), PER = 5, GATES = 8, GP_GATES = 10;
  // every track: the place (its look) · what it teaches, and the book it belongs to
  var TRACK = {
    baby: { p: ["Balap Balon", "Balloon Race"], t: ["Kenal huruf · 2+", "First letters · 2+"], j: "2+" },
    1: { p: ["Pantai", "Beach"], t: ["Fathah", "Fathah"], j: "1" },
    snow: { p: ["Negeri Salju", "Snowland"], t: ["Huruf mirip", "Look-alike letters"], j: "1" },
    kasrah: { p: ["Taman Pelangi", "Rainbow Park"], t: ["Kasrah", "Kasrah"], j: "3" },
    dhammah: { p: ["Luar Angkasa", "Outer Space"], t: ["Dhammah", "Dhammah"], j: "3" },
    desert: { p: ["Gurun Pasir", "Desert Dunes"], t: ["Mad · bacaan panjang", "Mad · long vowels"], j: "2–3" },
    tanwin: { p: ["Pulau Dino", "Dino Island"], t: ["Tanwin", "Tanwin"], j: "4" },
    hill: { p: ["Bukit Hijau", "Green Hills"], t: ["Sukun", "Sukun"], j: "4" },
    2: { p: ["Hutan", "Forest"], t: ["Kata bersambung", "Joined words"], j: "2" },
    3: { p: ["Gunung", "Mountain"], t: ["Kata kasrah & dhammah", "Words with i & u"], j: "3" },
    4: { p: ["Laut", "Sea"], t: ["Kata tanwin & sukun", "Tanwin & sukun words"], j: "4" },
    candy: { p: ["Negeri Permen", "Candy Land"], t: ["Campuran juara", "Champion mix"], j: "1–4" }
  };
  function L01() { return S.get().lang === "en" ? 1 : 0; }
  function tPlace(n) { return TRACK[n].p[L01()]; }
  function tTopic(n) { return TRACK[n].t[L01()]; }
  function stageOf(n) { for (var i = 0; i < STAGES.length; i++) if (STAGES[i].w.indexOf(n) >= 0) return i; return 0; }
  function trackDone(n) { var L3 = races(n); return best(L3[L3.length - 1].id) > 0; }
  function trackWon(n) { return races(n).filter(function (r) { return best(r.id) > 0; }).length; }
  // the recommended next track: the first unfinished one in order. The Balloon Race is for the littlest, so once
  // anything else has been raced it is skipped
  function nextTrack() {
    var any = WORLDS.some(function (n) { return n !== "baby" && trackWon(n); });
    for (var i = 0; i < WORLDS.length; i++) { var n = WORLDS[i]; if (n === "baby") continue; if (!trackDone(n)) return n; }
    return any ? "candy" : 1;
  }
  // the bonus tracks: new places, letters from the books (snow = the look-alike letters, candy = a bit of everything)
  var EXTRA = {
    // for the littlest (about 2+): one big balloon with one letter, tap anywhere, always a turbo; 2 letters a race
    baby: { baby: 1, th: "rainbow", flag: "أ", bg: "stickers", name: ["Balap Balon · 2+", "Balloon Race · 2+"], icon: ["#FFD43B", "#FF5D73"] },
    // sukun: the letter stops (أَبْ, مِنْ, خُبْز) — the hilly road
    hill: { sukun: 1, flag: "أَبْ", bg: "w2", name: ["Bukit Hijau · Sukun", "Green Hills · Sukun"], icon: ["#8FE38A", "#3DB86B"] },
    // the wrong signs are the look-alike letters (ب ت ث, ج ح خ, د ذ…), so the eye learns the dots
    snow: { src: [1], flag: "ث", bg: "w3", name: ["Negeri Salju · Huruf Mirip", "Snowland · Look-alikes"], icon: ["#BFE4FF", "#5BA8F0"], hard: 1, alike: 1 },
    // mad: short or long? بَ or بَا — the long desert road; from race 3 the short one of the same letter is a choice
    desert: { mad: 1, flag: "بَا", bg: "w1", name: ["Gurun Pasir · Mad", "Desert Dunes · Mad"], icon: ["#FFD08A", "#F0903A"], vmix: ["a", "aa", "i", "ii", "u", "uu"] },
    candy: { src: [1, 2, 3, 4], flag: "ق", bg: "stickers", name: ["Negeri Permen", "Candy Land"], icon: ["#FFB3E1", "#FF5FA2"] },
    // the vowel tracks: every letter with kasrah / dhammah / tanwin; from race 3 the other choices are the same letter
    // with a different vowel (بِ or بَ or بُ?) so the ear learns the harakat
    kasrah: { vow: "i", th: "rainbow", flag: "بِ", bg: "w3", name: ["Taman Pelangi · Kasrah", "Rainbow Park · Kasrah"], icon: ["#B8D8FF", "#9B6DFF"], vmix: ["a", "i", "u"], order: 1 },
    dhammah: { vow: "u", th: "space", flag: "بُ", bg: "w3", name: ["Luar Angkasa · Dhammah", "Outer Space · Dhammah"], icon: ["#5A3EA0", "#140C3A"], vmix: ["a", "i", "u"], order: 1 },
    tanwin: { tanwin: 1, th: "dino", flag: "بٌ", bg: "w4", name: ["Pulau Dino · Tanwin", "Dino Island · Tanwin"], icon: ["#8FE38A", "#FF8A3D"], vmix: ["an", "in", "un"] }
  };
  // what each track teaches (shown on the track and in the result)
  var GOAL = {
    baby: ["Kenal huruf: satu balon, satu huruf", "Meet the letters: one balloon, one letter"],
    1: ["28 huruf hijaiyah berharakat fathah (a)", "All 28 letters with fathah (a)"],
    kasrah: ["Harakat kasrah (i), lalu bedakan a · i · u", "Kasrah (i), then hear a · i · u apart"],
    dhammah: ["Harakat dhammah (u), lalu bedakan a · i · u", "Dhammah (u), then hear a · i · u apart"],
    tanwin: ["Tanwin: an · in · un", "Tanwin: an · in · un"],
    2: ["Huruf bersambung jadi kata", "Joined letters make words"],
    3: ["Kasrah & dhammah di dalam kata", "Kasrah & dhammah inside words"],
    4: ["Tanwin & sukun di dalam kata", "Tanwin & sukun inside words"],
    hill: ["Sukun: hurufnya berhenti — ab, min, qul", "Sukun: the letter stops — ab, min, qul"],
    snow: ["Huruf mirip: ب ت ث · ج ح خ · د ذ", "Look-alike letters: ب ت ث · ج ح خ · د ذ"],
    desert: ["Mad: pendek atau panjang? ba · baa", "Mad: short or long? ba · baa"],
    candy: ["Campuran semua bunyi Jilid 1–4", "A mix of every sound from Books 1–4"]
  };
  function goal(n) { var g = GOAL[n]; return g ? g[S.get().lang === "en" ? 1 : 0] : ""; }
  // a sound counts as mastered once it has been driven through correctly twice
  function mstore() { var s = S.get(); s.raceM = s.raceM || {}; return s.raceM; }
  function mastered(x) { return (mstore()[x.ar] || 0) >= 2; }
  function trackPool(n) { var L2 = races(n); return L2[L2.length - 1].pool; }
  function wName(n) { return TRACK[n] ? tPlace(n) + " · " + tTopic(n) : tr(HJ.worlds[n - 1].name); }
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
    if (X && X.sukun) {                       // letter + sukun: أَبْ … then short words with sukun from the books
      var seenS = {}; pool = [];
      HJ.L.forEach(function (l) { if (l.k === "alif") return; var x = { ar: "أَ" + l.c + "\u0652", tr: "a" + l.cons, k: l.k, au: "أَ" + l.c + "\u0652" }; if (HJ.audio.hasClip(x.ar)) { seenS[x.ar] = 1; pool.push(x); } });
      [2, 3, 4].forEach(function (b) { worldPool(b).forEach(function (x) { if (/\u0652/.test(x.ar) && !/[\u064B-\u064D]/.test(x.ar) && !seenS[x.ar] && HJ.audio.hasClip(x.ar)) { seenS[x.ar] = 1; pool.push(x); } }); });
    } else if (X && X.mad) {                 // بَا بِي بُو, letter by letter in hijaiyah order
      pool = []; HJ.L.forEach(function (l) { ["aa", "ii", "uu"].forEach(function (v) { var x = HJ.syl(l.k, v); if (HJ.audio.hasClip(x.ar)) pool.push(x); }); });
    } else if (X && (X.vow || X.tanwin)) {
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
      list.push({ hint: n === 1 || i < 2, alike: X && X.alike, mad: X && X.mad, id: n + "-" + (i + 1), w: n, th: X ? X.th || n : null, vmix: X && X.vmix && i >= 2 ? X.vmix : null, flag: X ? X.flag : null, i: i, gp: false, targets: chunk, pool: X && X.hard ? pool : pool.slice(0, Math.max((i + 1) * k, 6)), easy: n === 1 && i < 3 });
    }
    list.push({ alike: X && X.alike, mad: X && X.mad, id: n + "-gp", w: n, th: X ? X.th || n : null, vmix: X && X.vmix ? X.vmix : null, flag: X ? X.flag : null, i: PER, gp: true, targets: pool, pool: pool, easy: false });
    return (cache[n] = list);
  }
  function rst() {
    var s = S.get(); s.race = s.race || {};
    if (!s.raceV2) { s.raceV2 = 1; Object.keys(s.race).forEach(function (k) { if (/^(hill|desert)-/.test(k)) { delete s.race[k]; if (s.raceT) delete s.raceT[k]; } }); }
    return s.race;
  }
  function best(id) { return rst()[id] || 0; }
  function allOpen() { var s = S.get().settings || {}; return !!(s.arcadeAll || s.unlockAll); }
  function isOpen(r) { if (r.i === 0 || allOpen()) return true; var prev = races(r.w)[r.i - 1]; return best(prev.id) > 0; }

  /* ---------- pictures ---------- */
  var IMG = {
    mo: "assets/mo/mo-pose-41.webp", moYes: "assets/mo/mo-yes.webp", moOh: "assets/mo/mo-pose-33.webp", moFace: "assets/mo/mo-pose-41.webp",
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
  var curW = null;
  function open(w) {
    if (w) curW = w; if (curW == null || WORLDS.indexOf(curW) < 0) curW = nextTrack();
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
    // the learning path: 4 stages; the tracks of the open stage as cards; the recommended next one is marked
    var nx = nextTrack(), stI = stageOf(curW), path = el("section", "rpath");
    var stg = el("div", "rp-stages"); stg.setAttribute("role", "tablist");
    STAGES.forEach(function (g, gi) {
      var done = g.w.filter(trackDone).length, b = el("button", "rp-st" + (gi === stI ? " on" : "") + (done === g.w.length ? " full" : ""),
        '<i>' + (done === g.w.length ? HJ.ic("check") : gi + 1) + "</i><b>" + esc(g.n[L01()]) + "</b><small>" + done + "/" + g.w.length + "</small>");
      b.setAttribute("role", "tab"); b.setAttribute("aria-selected", gi === stI ? "true" : "false");
      b.onclick = function () { A.fx.tap(); var pick = g.w.filter(function (n) { return n !== "baby" && !trackDone(n); })[0]; open(g.w.indexOf(nx) >= 0 ? nx : pick != null ? pick : g.w[0]); };
      stg.appendChild(b);
    });
    path.appendChild(stg);
    var row = el("div", "rp-tracks");
    STAGES[stI].w.forEach(function (n) {
      var won = trackWon(n), tot = races(n).length, dn = trackDone(n);
      var c = el("button", "rp-card" + (n === curW ? " on" : "") + (dn ? " done" : "") + (n === nx ? " next" : ""),
        (n === nx ? '<em class="rp-next">' + esc(t("raceNext")) + "</em>" : "") +
        '<span class="rp-top"><i class="rp-n">' + (WORLDS.indexOf(n) + 1) + "</i>" + wIcon(n) + (dn ? '<i class="rp-ok">' + HJ.ic("check") + "</i>" : "") + "</span>" +
        "<b>" + esc(tTopic(n)) + "</b><small>" + esc(tPlace(n)) + "</small>" +
        '<span class="rp-meta"><span class="rp-j">' + esc(n === "baby" ? "2+" : t("book") + " " + TRACK[n].j) + '</span><span class="rp-cups">' + cup(1, 14) + " " + won + "/" + tot + "</span></span>");
      c.setAttribute("aria-label", tTopic(n) + " · " + tPlace(n) + " · " + won + "/" + tot + (n === nx ? " · " + t("raceNext") : ""));
      c.onclick = function () { A.fx.tap(); open(n); };
      row.appendChild(c);
    });
    path.appendChild(row); body.appendChild(path);
    setTimeout(function () { var on = row.querySelector(".rp-card.on"); if (on && on.offsetLeft + on.offsetWidth > row.clientWidth) row.scrollLeft = on.offsetLeft - 16; }, 0);
    body.appendChild(el("div", "rm-wname", "<b>" + esc(tTopic(curW)) + "</b><small>" + esc(tPlace(curW)) + "</small>"));
    // the track's goal and how many of its sounds are mastered (tap a sound to hear it)
    var tp = trackPool(curW), mN = tp.filter(mastered).length;
    var gcard = el("div", "rm-goal glass", '<div class="rg-h">' + HJ.art("sparkle", 20) + "<b>" + esc(t("raceGoal")) + "</b><span>" + esc(goal(curW)) + "</span></div>" +
      '<div class="rg-bar"><i style="width:' + Math.round(mN / Math.max(1, tp.length) * 100) + '%"></i></div><small>' + esc(t("raceMastered", { n: mN, m: tp.length })) + "</small>");
    var chips = el("div", "rg-chips");
    tp.slice(0, 40).forEach(function (x) { var cc = el("button", "rg-c ar" + (mastered(x) ? " ok" : (mstore()[x.ar] ? " half" : "")), esc(x.ar)); cc.onclick = function () { A.unlock(); A.say(x.au); }; chips.appendChild(cc); });
    gcard.appendChild(chips); body.appendChild(gcard);
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
        '<span class="rm-lbl"><b>' + esc(r.gp ? t("raceGP") : t("raceN", { n: i + 1 })) + "</b>" +
        '<small class="rm-g">' + esc(r.gp ? t("raceGoalGP") : r.mad ? t("raceGoalM") : r.alike ? t("raceGoalA") : r.vmix ? t(r.vmix[0] === "an" ? "raceGoalT" : "raceGoalV") : r.baby ? t("raceGoalB") : t("raceGoalL")) + "</small>" +
        '<small class="ar">' + r.targets.slice(0, r.gp ? 4 : 5).map(function (x) { return esc(x.ar); }).join(" ") + "</small>" + (tm ? "<small>⏱ " + clock(tm) + "</small>" : "") + "</span>";
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
  var SHOP = { paint: [["red", 0], ["orange", 30], ["yellow", 30], ["green", 40], ["blue", 40], ["purple", 50], ["pink", 50], ["gold", 120]], rim: [["classic", 0], ["star", 60], ["rainbow", 90]], horn: [["beep", 0], ["trumpet", 40], ["duck", 60]], body: [["kart", 0], ["racer", 80], ["bubble", 100], ["monster", 150]] };
  function gst() { var s = S.get(); s.garage = s.garage || { paint: "red", rim: "classic", owned: ["paint:red", "rim:classic"] }; if (!s.garage.horn) { s.garage.horn = "beep"; s.garage.owned.push("horn:beep"); } if (!s.garage.body) { s.garage.body = "kart"; s.garage.owned.push("body:kart"); } return s.garage; }
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
        HJ.race3d.drawKart(g, 260, G.body === "monster" ? 352 : 340, G.body === "bubble" ? 220 : 250, { body: G.body, paint: HJ.race3d.PAINT[G.paint], rim: HJ.race3d.RIMS[G.rim], helmet: HJ.race3d.PAINT[G.paint], shirt: ["#43B85C", "#FF8A3D"], num: "1", hair: "#22252E", star: true }, {});
      }
      draw();
      [["body", "garageBody"], ["paint", "garagePaint"], ["rim", "garageRims"], ["horn", "garageHorn"]].forEach(function (sec) {
        p.appendChild(el("div", "gar-h", esc(t(sec[1]))));
        var row = el("div", "gar-row");
        SHOP[sec[0]].forEach(function (it) {
          var key = sec[0] + ":" + it[0], own = G.owned.indexOf(key) >= 0, on = G[sec[0]] === it[0];
          var col = sec[0] === "paint" ? HJ.race3d.PAINT[it[0]] : sec[0] === "rim" ? HJ.race3d.RIMS[it[0]] : ["#7CC8FF", "#3D7BFF"];
          var face2 = sec[0] === "body" ? '<i class="gar-body">' + bodyIcon(it[0]) + "</i>" : sec[0] === "horn" ? '<i class="gar-horn" style="background:linear-gradient(160deg,' + col[0] + "," + col[1] + ')">' + esc(t("horn" + it[0])) + "</i>" : '<i style="background:linear-gradient(160deg,' + col[0] + "," + col[1] + ')"></i>';
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
  function bodyIcon(k) {
    var c = document.createElement("canvas"); c.width = c.height = 120; var g = c.getContext("2d");
    HJ.race3d.drawKart(g, 60, k === "monster" ? 116 : 108, k === "bubble" ? 74 : 84, { body: k, paint: HJ.race3d.PAINT[gst().paint], rim: HJ.race3d.RIMS[gst().rim], helmet: HJ.race3d.PAINT[gst().paint], shirt: ["#43B85C", "#FF8A3D"], num: "1", hair: "#22252E", star: true }, {});
    return '<img src="' + c.toDataURL() + '" alt="">';
  }
  function cup(place, size) {
    var c = ["#FFC21A", "#C9D3E3", "#E0915A"][place - 1], d = ["#D98A00", "#8E9BB0", "#A65A2A"][place - 1], s = size || 30;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 40 40" aria-hidden="true"><path d="M11 6h18v6c0 7-4 12-9 12s-9-5-9-12z" fill="' + c + '" stroke="' + d + '" stroke-width="2"/>' +
      '<path d="M11 9H6c0 5 2 8 6 9M29 9h5c0 5-2 8-6 9" fill="none" stroke="' + d + '" stroke-width="2.4" stroke-linecap="round"/><rect x="17" y="24" width="6" height="6" fill="' + d + '"/><rect x="12" y="30" width="16" height="5" rx="2" fill="' + c + '" stroke="' + d + '" stroke-width="2"/>' +
      '<text x="20" y="18" text-anchor="middle" font-size="10" font-weight="900" fill="' + d + '" font-family="Fredoka One, Nunito">' + place + "</text></svg>";
  }
  // a small kart drawing for the menu and the home card (Mo's face from the picture)
  // the race menu / home banner: a sunny track seen from the side — hills, a grandstand with bunting, a two-lane road
  // with kerbs, the three karts racing (Kak Adam and Ais on the far lane, Mo leading on the near lane) and a proper
  // checkered finish arch over the road
  function heroSvg() {
    var u = "rh" + (++heroN), chk = function (x, y, w, h, n2, m2) { var o = ""; for (var r = 0; r < m2; r++) for (var c = 0; c < n2; c++) o += '<rect x="' + (x + c * w / n2) + '" y="' + (y + r * h / m2) + '" width="' + (w / n2 + .2) + '" height="' + (h / m2 + .2) + '" fill="' + ((r + c) % 2 ? "#232733" : "#fff") + '"/>'; return o; };
    var flags = ""; for (var f = 0; f < 18; f++) flags += '<path d="M' + (8 + f * 15) + " " + (30 + Math.sin(f * .9) * 1.5) + " l7 0 l-3.5 8z" + '" fill="' + ["#FF5D73", "#FFD43B", "#3D9BFF", "#22C06E", "#9B6DFF"][f % 5] + '"/>';
    return '<svg viewBox="0 0 360 150" aria-hidden="true"><defs>' +
      '<linearGradient id="' + u + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FD3FF"/><stop offset="1" stop-color="#E4F5FF"/></linearGradient>' +
      '<linearGradient id="' + u + 'r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6B7488"/><stop offset="1" stop-color="#4E566A"/></linearGradient></defs>' +
      '<rect width="360" height="150" fill="url(#' + u + 's)"/>' +
      '<circle cx="320" cy="26" r="13" fill="#FFD43B"/><circle cx="320" cy="26" r="20" fill="#FFD43B" opacity=".25"/>' +
      '<g fill="#fff" opacity=".9"><ellipse cx="60" cy="18" rx="18" ry="6"/><circle cx="54" cy="14" r="7"/><circle cx="64" cy="12" r="8"/><ellipse cx="200" cy="14" rx="14" ry="5"/><circle cx="204" cy="10" r="6"/></g>' +
      '<path d="M0 70 Q60 46 120 64 T240 60 T360 66 V82 H0Z" fill="#9AD9A0"/><path d="M0 76 Q90 60 180 72 T360 72 V84 H0Z" fill="#7CC97F"/>' +
      // a little grandstand with bunting
      '<rect x="6" y="38" width="270" height="34" rx="4" fill="#E9E3F7"/><rect x="6" y="38" width="270" height="6" fill="#FF5D73"/>' +
      '<path d="M8 30 Q140 42 274 30" stroke="#8E9BB0" stroke-width="1" fill="none"/>' + flags +
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(function (i) { return '<circle cx="' + (18 + i * 15.5) + '" cy="' + (54 + (i % 2) * 8) + '" r="4.2" fill="' + ["#F2C9A0", "#E0A97E", "#C98B63"][i % 3] + '"/><rect x="' + (14 + i * 15.5) + '" y="' + (58 + (i % 2) * 8) + '" width="8" height="7" rx="3" fill="' + ["#3D9BFF", "#FF8FB1", "#22C06E", "#FFB000", "#9B6DFF"][i % 5] + '"/>'; }).join("") +
      // the road: kerbs, two lanes
      '<rect x="0" y="82" width="360" height="5" fill="#fff"/>' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (i) { return '<rect x="' + i * 32 + '" y="82" width="16" height="5" fill="#FF5D5D"/>'; }).join("") +
      '<rect x="0" y="87" width="360" height="56" fill="url(#' + u + 'r)"/>' +
      '<path class="hk-dash" d="M0 115 H400" stroke="#fff" stroke-width="3" stroke-dasharray="18 14" opacity=".7"/>' +
      '<rect x="0" y="143" width="360" height="7" fill="#fff"/>' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (i) { return '<rect x="' + (i * 32 + 16) + '" y="143" width="16" height="7" fill="#FF5D5D"/>'; }).join("") +
      // the finish line on the road and the arch over it
      chk(300, 87, 12, 56, 2, 8) +
      '<rect x="296" y="40" width="5" height="104" rx="2" fill="#5A6275"/><rect x="311" y="40" width="5" height="104" rx="2" fill="#5A6275"/>' +
      '<rect x="282" y="34" width="48" height="16" rx="4" fill="#FF5D73"/><text x="306" y="45.5" text-anchor="middle" font-size="8.5" font-weight="900" fill="#fff" font-family="Fredoka One, Nunito">FINISH</text>' +
      chk(282, 50, 48, 6, 8, 1) +
      // the karts: far lane (Kak Adam, Ais), near lane (Mo, in front)
      // all three in one row on the far lane, Mo leading toward the finish, Ais a little behind
      '<g class="hk hk2">' + kartSvg(44, 92, KART.ais, "ais", .58) + '</g>' +
      '<g class="hk hk1">' + kartSvg(136, 95, KART.adam, "adam", .62) + '</g>' +
      speed(226, 99) + '<g class="hk hk3">' + kartSvg(226, 95, KART.mo, "mo", .62) + "</g></svg>";
  }
  var heroN = 0;
  function speed(x, y) { return '<g stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".75"><path d="M' + (x - 34) + " " + (y - 6) + " h22" + '"/><path d="M' + (x - 44) + " " + (y + 2) + " h28" + '"/><path d="M' + (x - 30) + " " + (y + 10) + " h18" + '"/></g>'; }
  // a face, cut round from the original picture (transparent around it), for the drivers' open-face helmets
  var hfaces = {};
  function hface(k) {
    if (hfaces[k]) return hfaces[k];
    var im = pics[k]; if (!im || !im.ok) return "";
    var b = im.box, c = document.createElement("canvas"); c.width = c.height = 128; var g = c.getContext("2d");
    // [size, x, y] of the face as parts of the picture's painted box; a 4th value 1 = size from the height (poses with arms out)
    var F = window.__hf || { mo: [.52, .5, .24], moWin: [.42, .47, .23, 1], ais: [.66, .6, .31], adam: [.54, .48, .21] }, fz = F[k] || [.5, .5, .25];
    var side = (fz[3] ? b.h : b.w) * fz[0], cx = b.x + b.w * fz[1], cy = b.y + b.h * fz[2];
    g.beginPath(); g.arc(64, 64, 64, 0, 7); g.clip(); g.drawImage(im, cx - side / 2, cy - side / 2, side, side, 0, 0, 128, 128);
    return (hfaces[k] = c.toDataURL());
  }
  // a go-kart seen from the side, driving right: big rear wheel, smaller front wheel, a low chassis, the driver in a
  // racing pose (leaning forward, both hands on the wheel) wearing an open-face helmet with their own face in it
  var SHIRT = { mo: ["#43B85C", "#2F9A47"], ais: ["#C9A7FF", "#9B6DFF"], adam: ["#3D7BFF", "#2A5FD0"] };
  function kartSvg(x, y, col, k, s) {
    var sh = SHIRT[k], hc = { mo: ["#FF6B5B", "#C9372A"], ais: ["#FF8FC8", "#D9579A"], adam: ["#5B9BFF", "#2F6BE0"] }[k], u = "kf" + k + (++heroN), f = hface(k === "mo" ? "moWin" : k);   // Mo drives with his big happy grin
    return '<g transform="translate(' + x + " " + y + ") scale(" + s + ')">' +
      '<defs><clipPath id="' + u + '"><circle cx="41" cy="-17" r="8.6"/></clipPath></defs>' +
      '<ellipse cx="38" cy="38" rx="46" ry="4.5" fill="rgba(0,0,0,.22)"/>' +
      // seat back and the driver's body: torso leaning forward, an arm reaching to the wheel
      '<path d="M18 22 L21 0 Q23 -5 28 -4 L32 18Z" fill="#2A2F3D"/>' +
      '<path d="M27 18 Q25 2 31 -3 Q38 -8 46 -4 Q51 0 50 8 L50 20Z" fill="' + sh[0] + '"/>' +
      '<path d="M44 0 Q54 4 62 1" stroke="' + sh[1] + '" stroke-width="6" stroke-linecap="round" fill="none"/>' +
      '<circle cx="63" cy="0" r="4.2" fill="#fff" stroke="#D7DEE8" stroke-width="1"/>' +
      // steering column and wheel
      '<path d="M58 14 L64 2" stroke="#3A3F4C" stroke-width="3" stroke-linecap="round"/><ellipse cx="65" cy="0" rx="2.4" ry="7" fill="none" stroke="#2A2F3D" stroke-width="2.6" transform="rotate(-20 65 0)"/>' +
      // the chassis: low, with a raised nose, a side pod with the number, a bumper and a rear spoiler
      '<path d="M-6 26 L-4 14 Q0 10 10 10 L26 12 L52 12 Q60 8 70 10 L84 14 Q90 16 90 22 L90 26Z" fill="' + col[0] + '" stroke="' + col[1] + '" stroke-width="2.2" stroke-linejoin="round"/>' +
      '<path d="M4 15 L46 16" stroke="#fff" stroke-width="2.2" opacity=".45" stroke-linecap="round"/>' +
      '<circle cx="34" cy="19" r="5.2" fill="#fff"/><text x="34" y="21.8" text-anchor="middle" font-size="7" font-weight="900" fill="' + col[1] + '" font-family="Nunito">' + ({ mo: 1, ais: 2, adam: 3 }[k]) + "</text>" +
      '<rect x="86" y="18" width="7" height="8" rx="2" fill="#3A3F4C"/>' +
      '<path d="M-10 4 L2 4 L2 8 L-8 8Z" fill="' + col[1] + '"/><path d="M-3 8 L-2 14" stroke="#3A3F4C" stroke-width="2"/>' +
      // wheels: big at the back, small at the front, with hubs that look like they turn
      '<g class="hk-wheel"><circle cx="8" cy="27" r="12" fill="#23262F"/><circle cx="8" cy="27" r="5.5" fill="#C9D3E3"/><path d="M8 21.5 V32.5 M2.5 27 H13.5" stroke="#8E9BB0" stroke-width="1.6"/></g>' +
      '<g class="hk-wheel"><circle cx="74" cy="29" r="9.5" fill="#23262F"/><circle cx="74" cy="29" r="4.2" fill="#C9D3E3"/><path d="M74 24.8 V33.2 M69.8 29 H78.2" stroke="#8E9BB0" stroke-width="1.4"/></g>' +
      // the head: their face in an open-face racing helmet
      (f ? '<image href="' + f + '" x="32.4" y="-25.6" width="17.2" height="17.2" clip-path="url(#' + u + ')"/>' : '<circle cx="41" cy="-17" r="8.6" fill="#F2C9A0"/>') +
      // an open-face helmet: the shell round the face, thicker on top, a chin strap
      // helmet: a shell round the face, thicker at the back and top, a short visor peak, a chin strap
      '<path fill-rule="evenodd" d="M40 -29.5 a12 12 0 1 1 0 24 a12 12 0 1 1 0 -24 Z M41 -25.6 a8.6 8.6 0 1 0 0 17.2 a8.6 8.6 0 1 0 0 -17.2 Z" fill="' + hc[0] + '"/>' +
      '<path d="M29 -23 Q38 -32 51 -25 L53 -22 Q42 -27 31 -20Z" fill="' + hc[1] + '"/>' +
      '<path d="M40 -29.5 a12 12 0 0 1 10 5" stroke="#fff" stroke-width="2.2" fill="none" opacity=".65" stroke-linecap="round"/>' +
      '<path d="M35 -9.5 Q41 -6 47 -9.5" stroke="' + hc[1] + '" stroke-width="1.6" fill="none"/>' +
      (k === "mo" ? '<path d="M30.5 -26 l1 2 2.2 .3 -1.6 1.5 .4 2.2 -2 -1.1 -2 1.1 .4 -2.2 -1.6 -1.5 2.2 -.3z" fill="#FFD43B"/>' : "") +
      "</g>";
  }

  /* ---------- the home card ---------- */
  function card() {
    var c = el("button", "race-card featured");
    function fill(a) { if (!a) return; a.innerHTML = heroSvg(); var sv = a.querySelector("svg"); if (sv) sv.setAttribute("preserveAspectRatio", "xMidYMax slice"); }
    load(function () { fill(c.querySelector(".rc-art")); });
    var cups = cupCount();
    c.innerHTML = '<span class="rc-flag">' + HJ.art("star", 16) + " " + esc(t("featured")) + '</span><span class="rc-art">' + heroSvg() + '</span><span class="rc-tx"><b>' + esc(t("raceT")) + "</b><small>" + esc(t("raceSub")) + "</small>" +
      (cups.all ? '<span class="rc-cups"><span>' + cup(1, 20) + "<b>" + cups.all + '</b></span><span><i class="rt-coin"></i><b>' + (S.get().coins || 0) + "</b></span></span>" : "") +
      '</span><span class="rc-go">' + HJ.ic("play") + "</span>";
    fill(c.querySelector(".rc-art"));
    c.onclick = function () { A.unlock(); A.fx.tap(); open(); };
    return c;
  }

  function cupCount() { var r = rst(), o = { 1: 0, 2: 0, 3: 0, all: 0 }; Object.keys(r).forEach(function (k) { if (r[k]) { o[r[k]]++; o.all++; } }); return o; }
  // the trophy shelf (sticker book): every track, a cup per race won, the best Grand Prix time
  function shelf() {
    var box = el("section", "tz-card glass rshelf"), cups = cupCount(), r = rst(), bt = S.get().raceT || {};
    box.appendChild(el("div", "rs-h", "<b>" + esc(t("raceShelf")) + "</b><small>" + cup(1, 18) + " " + cups[1] + " · " + cup(2, 18) + " " + cups[2] + " · " + cup(3, 18) + " " + cups[3] + "</small>"));
    var grid = el("div", "rs-grid");
    WORLDS.forEach(function (n) {
      var list = races(n), got = list.filter(function (x) { return r[x.id]; }).length, gp = list[list.length - 1];
      var row = el("button", "rs-row" + (got ? "" : " none"), wIcon(n) + '<span class="rs-name"><b>' + esc(wName(n)) + '</b><span class="rs-cups">' +
        list.map(function (x) { return r[x.id] ? cup(r[x.id], x.gp ? 26 : 20) : '<i class="rs-empty' + (x.gp ? " gp" : "") + '"></i>'; }).join("") + "</span></span>" +
        (bt[gp.id] ? '<small class="rs-t">⏱ ' + clock(bt[gp.id]) + "</small>" : ""));
      row.onclick = function () { A.unlock(); A.fx.tap(); open(n); };
      grid.appendChild(row);
    });
    box.appendChild(grid);
    return box;
  }

  /* ---------- the race (engine in js/race3d.js) ---------- */
  var live = 0;
  function play(r) {
    if (S.overLimit()) return HJ.restScreen(function () { play(r); });
    if (HJ.music) HJ.music.stop();
    var my = ++live;
    load(function () {
      if (my !== live) return;
      HJ.race3d.run(r, {
        face: face,
        faceOf: function (k) { return face({ mo: "moFace", yes: "moYes", oh: "moOh", win: "moWin" }[k] || "moFace"); },
        onQuit: function () { open(r.w); },
        onRestart: function () { play(r); },
        onFinish: function (res) { reward(r, res); }
      });
    });
  }
  function reward(R, res) {
    if (R.practice) {                                                   // a practice lap: coins and learned sounds, no cup
      var st0 = S.get(); st0.coins = (st0.coins || 0) + res.coins;
      var M0 = mstore(); (res.items || []).forEach(function (it) { if (it.ok) M0[it.q.ar] = (M0[it.q.ar] || 0) + 1; });
      S.save(); podium(R, res, 0, false); return;
    }
    var st = S.get(), old = best(R.id), nb = old ? Math.min(old, res.place) : res.place;
    rst()[R.id] = nb;
    var gain = (4 - nb) - (old ? 4 - old : 0);                         // stars: 3/2/1 for the place (once, can improve)
    if (gain > 0) st.bonus = (st.bonus || 0) + gain;
    st.coins = (st.coins || 0) + res.coins;                             // coins go to the Garage
    var M = mstore(); (res.items || []).forEach(function (it) { if (it.ok) M[it.q.ar] = (M[it.q.ar] || 0) + 1; });
    var bt = st.raceT = st.raceT || {}, rec = !bt[R.id] || res.time < bt[R.id]; if (rec) bt[R.id] = Math.round(res.time * 10) / 10;
    S.save();
    podium(R, res, gain, rec && old);
    if (HJ.badges) setTimeout(HJ.badges.check, 2600);
  }
  function podium(R, res, gain, record) {
    APP().confetti(res.place === 1 ? 90 : 40); A.fx.win();
    var IMGS = { mo: [IMG.moWin, "assets/mo/mo-ok.webp"], ais: [IMG.aisWin, IMG.ais], adam: [IMG.adamWin, IMG.adam] };
    HJ.modal(function (p, close) {
      p.classList.add("race-pod");
      p.appendChild(el("div", "kicker", esc(t("raceT")) + " · " + esc(R.practice ? t("racePracticeT") : R.gp ? t("raceGP") : t("raceN", { n: R.i + 1 }))));
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
      // the sounds of this race: green = right, orange = practise again; tap one to hear it
      var seen = {}, its = (res.items || []).filter(function (it) { if (seen[it.q.ar]) { if (!it.ok) seen[it.q.ar].ok = false; return false; } seen[it.q.ar] = it = { q: it.q, ok: it.ok }; return true; }).map(function (it) { return seen[it.q.ar]; });
      if (its.length) {
        var lw = el("div", "pod-learn", "<b>" + esc(t("raceLearned")) + "</b>"), lc = el("div", "rg-chips");
        its.forEach(function (it) { var cc = el("button", "rg-c ar " + (it.ok ? "ok" : "again"), esc(it.q.ar)); cc.onclick = function () { A.unlock(); A.say(it.q.au); }; lc.appendChild(cc); });
        lw.appendChild(lc); var miss = its.filter(function (it) { return !it.ok; }).length;
        lw.appendChild(el("small", "", esc(miss ? t("raceAgainN", { n: miss }) : t("raceAllRight"))));
        if (miss && !R.baby) {                                          // one short lap with just the sounds that were missed
          var prc = el("button", "btn small pod-prac", HJ.ic("replay") + " " + esc(t("racePractice")));
          prc.onclick = function () {
            close(); var ms = its.filter(function (it) { return !it.ok; }).map(function (it) { return it.q; });
            play({ id: R.id + "-p", w: R.w, th: R.th, flag: ms[0].ar, hint: true, i: R.i, gp: false, targets: ms, pool: R.pool, easy: R.easy, practice: 1, vmix: R.vmix });
          };
          lw.appendChild(prc);
        }
        p.appendChild(lw);
      }
      var r = el("div", "row"), again = el("button", "btn ghost", HJ.ic("replay") + " " + t("again")), list = races(R.w), nx = R.practice ? list[R.i] : list[R.i + 1];
      var go = el("button", "btn", (nx ? t("next") : t("raceMenu")) + " " + HJ.ic("next"));
      again.onclick = function () { close(); play(R); };
      go.onclick = function () { close(); if (nx) play(nx); else open(R.w); };
      r.appendChild(again); r.appendChild(go); p.appendChild(r);
      var menu = el("button", "btn small ghost", HJ.ic("map") + " " + t("raceMenu")); menu.onclick = function () { close(); open(R.w); }; p.appendChild(menu);
      A.talk(t("place" + res.place), lang());
    }, { sticky: true });
  }
  function flagSvg() { return '<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 2v17" stroke="#3A4256" stroke-width="2"/>' + [0, 1, 2, 3, 4, 5].map(function (i) { return '<rect x="' + (4 + (i % 3) * 4) + '" y="' + (2 + (i / 3 | 0) * 4) + '" width="4" height="4" fill="' + ((i + (i / 3 | 0)) % 2 ? "#222" : "#fff") + '"/>'; }).join("") + "</svg>"; }

  HJ.race = { open: open, card: card, races: races, shelf: shelf, play: function (id) { var w0 = String(id).split("-")[0], w = EXTRA[w0] ? w0 : +w0; races(w).forEach(function (r) { if (r.id === id) play(r); }); } };
})();
