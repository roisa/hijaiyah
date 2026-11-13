/* Baby Mo Hijaiyah — screens: home, map, level, results, stickers, parents. */
(function () {
  var A = HJ.audio, S = HJ.store, t = HJ.t, tr = HJ.tr, el = HJ.el, esc = HJ.esc;
  var app = document.getElementById("app");
  var MO = function (p) { return p.indexOf("mo2:") === 0 ? "assets/mo2/mo2-" + p.slice(4) + ".webp" : "assets/mo/mo-" + p + ".webp"; };
  var CHEER = ["yeyy", "pose-02", "wow", "ok", "pose-37", "alright", "pose-26"];
  var OOPS = ["pose-28", "pose-33", "pose-23"];

  /* ---------- theme ---------- */
  function applyTheme() {
    var m = S.get().theme, dark = m === "dark" || (m === "auto" && window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    document.documentElement.lang = S.get().lang;
  }
  applyTheme();
  if (window.matchMedia) try { matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme); } catch (e) {}

  // Mo image; render 2 is shown upper body only (owner's art rule)
  function moImg(p, w) {
    var img = el("img"); img.src = MO(p); img.alt = "Baby Mo"; img.draggable = false;
    if (p.indexOf("mo2:") === 0) {
      var box = el("span", "upper"); if (w) { img.style.width = w; }
      box.style.height = "auto"; box.appendChild(img);
      img.onload = function () { box.style.height = (img.getBoundingClientRect().height * 0.62) + "px"; };
      return box;
    }
    if (w) img.style.width = w;
    return img;
  }
  HJ.moImg = moImg;

  /* ---------- modal + parental gate ---------- */
  HJ.modal = function (build, opts) {
    var v = el("div", "veil"), p = el("div", "panel"); v.appendChild(p); document.body.appendChild(v);
    function close() { v.remove(); }
    if (!(opts && opts.sticky)) v.onclick = function (e) { if (e.target === v) close(); };
    build(p, close);
    return close;
  };
  HJ.gate = function (ok) {
    var a = 3 + Math.floor(Math.random() * 6), b = 4 + Math.floor(Math.random() * 5), ans = a + b;
    HJ.modal(function (p, close) {
      p.appendChild(el("h2", "", "🔒 " + t("parents")));
      p.appendChild(el("p", "", esc(t("gateQ", { a: a, b: b }))));
      var g = el("div", "gate-nums");
      var opts = [ans]; while (opts.length < 5) { var x = ans + Math.floor(Math.random() * 9) - 4; if (x > 0 && opts.indexOf(x) < 0) opts.push(x); }
      HJ.util.shuffle(opts).forEach(function (n) {
        var bt = el("button", "", n); bt.onclick = function () { close(); if (n === ans) ok(); };
        g.appendChild(bt);
      });
      p.appendChild(g);
    });
  };

  function confetti(n) {
    var C = ["#FF6B6B", "#FFB800", "#3FBF86", "#3B7DD8", "#9A7AF0", "#FF8FB1"];
    for (var i = 0; i < (n || 60); i++) {
      var c = el("div", "confetti"); c.style.left = Math.random() * 100 + "vw"; c.style.background = C[i % C.length];
      c.style.animationDuration = (1.8 + Math.random() * 1.8) + "s"; c.style.animationDelay = Math.random() * 0.5 + "s";
      document.body.appendChild(c); setTimeout(function (x) { return function () { x.remove(); }; }(c), 4200);
    }
  }
  HJ.confetti = confetti;

  function clear() { A.stop(); app.innerHTML = ""; var s = el("div", "screen"); app.appendChild(s); return s; }

  /* ---------- home ---------- */
  function home() {
    var s = clear(); s.classList.add("home");
    var st = S.get();
    s.appendChild(el("div", "hijaiyah-ring", "ا ب ت ث ج ح خ د ذ ر ز س"));
    var logo = el("img", "logo"); logo.src = "assets/brand/babymo-logo.png"; logo.alt = "Baby Mo"; s.appendChild(logo);
    s.appendChild(el("h1", "", "Baby Mo <span>Hijaiyah</span>"));
    var hero = el("img", "hero"); hero.src = "assets/mo/mo-pose-41.webp"; hero.alt = "Baby Mo"; s.appendChild(hero);
    s.appendChild(el("p", "", "<b>" + esc(t("hello", { n: st.name })) + "</b><br>" + esc(t("hello2"))));
    var chips = el("div", "row");
    chips.appendChild(el("span", "chip", "⭐ " + S.totalStars()));
    chips.appendChild(el("span", "chip", "🔥 " + (st.streak.n || 0) + " " + esc(t("streak"))));
    s.appendChild(chips);
    var row = el("div", "row");
    var play = el("button", "btn big", "▶ " + t("play")); play.onclick = function () { A.unlock(); A.fx.tap(); A.talk(t("hello", { n: st.name }), st.lang); map(); };
    row.appendChild(play); s.appendChild(row);
    var row2 = el("div", "row");
    var daily = el("button", "btn gold", "🔁 " + t("daily")); daily.onclick = function () { A.unlock(); startDaily(); };
    var stick = el("button", "btn ghost", "🌟 " + t("stickers")); stick.onclick = function () { stickers(); };
    var par = el("button", "btn ghost", "👨‍👩‍👦 " + t("parents")); par.onclick = function () { HJ.gate(parents); };
    row2.appendChild(daily); row2.appendChild(stick); row2.appendChild(par); s.appendChild(row2);
  }

  function nav(on) {
    var n = el("div", "nav");
    [["map", "🗺️", map], ["stickers", "🌟", stickers], ["parents", "👨‍👩‍👦", function () { HJ.gate(parents); }]].forEach(function (x) {
      var b = el("button", x[0] === on ? "on" : "", "<span>" + x[1] + "</span>" + esc(t(x[0]))); b.onclick = function () { A.fx.tap(); x[2](); }; n.appendChild(b);
    });
    return n;
  }
  function topbar(title, back) {
    var tb = el("div", "topbar");
    var b = el("button", "icon-btn", "🏠"); b.setAttribute("aria-label", t("back")); b.onclick = back || home; tb.appendChild(b);
    tb.appendChild(el("h2", "grow", esc(title)));
    tb.appendChild(el("span", "chip", "⭐ " + S.totalStars()));
    return tb;
  }

  /* ---------- map ---------- */
  var DECO = { fathah: ["🌴", "🐚", "🦀", "⛵"], sambung: ["🌳", "🍄", "🦋", "🐿️"], kasrah: ["⛰️", "🌲", "🦅", "☁️"], tanwin: ["🐠", "🐬", "🫧", "🐙"],
    tasydid: ["🏠", "🚌", "🌇", "🎈"], tajwid: ["🏰", "🚩", "💎", "🦁"], quran: ["🕌", "🌙", "⭐", "📖"] };
  function map() {
    var s = clear(), st = S.get();
    s.appendChild(topbar(t("map")));
    var m = el("div", "map"); s.appendChild(m);
    var cur = S.current(), curNode = null;
    HJ.worlds.forEach(function (w) {
      var first = w.levels[0], wLocked = !S.unlocked(first);
      var box = el("div", "world" + (wLocked ? " locked" : "")); box.style.background = w.bg;
      for (var d = 0; d < 6; d++) {
        var de = el("div", "deco", DECO[w.key][d % 4]); de.style.left = (d % 2 ? 78 + Math.random() * 12 : 2 + Math.random() * 10) + "%";
        de.style.top = (14 + d * 14 + Math.random() * 6) + "%"; box.appendChild(de);
      }
      var done = w.levels.filter(function (l) { return st.stars[l.id]; }).length;
      var wh = el("div", "wh", '<span class="em">' + w.emoji + "</span><div><b>" + esc(tr(w.name)) + "</b><small>" + esc(tr(w.sub)) + " · " + done + "/" + w.levels.length + "</small></div>");
      box.appendChild(wh);
      box.appendChild(el("div", "goal", "🎯 " + esc(tr(w.goal))));
      var path = el("div", "path");
      w.levels.forEach(function (lv, i) {
        var row = el("div", "node-row"), x = 50 + Math.sin(i * 0.9) * 28;
        var unl = S.unlocked(lv), stars = st.stars[lv.id] || 0, isBoss = lv.kind === "boss" || lv.kind === "khatam";
        var n = el("button", "node" + (stars ? " done" : "") + (!unl ? " lock" : "") + (lv === cur ? " cur" : "") + (isBoss ? " boss" : ""));
        n.style.left = x + "%";
        var label = lv.kind === "surah" ? HJ.surah(lv.surah).arabicName : (typeof lv.title === "string" ? lv.title : null);
        if (!unl) n.innerHTML = '<span class="ic">🔒</span>';
        else if (lv.icon && !label) n.innerHTML = '<span class="ic">' + lv.icon + "</span>";
        else if (label) n.innerHTML = '<span class="t ar">' + esc(label) + "</span>";
        else n.innerHTML = '<span class="ic">' + (lv.icon || "⭐") + "</span>";
        if (unl && isBoss && lv.icon) n.innerHTML = '<span class="ic">' + lv.icon + "</span>";
        if (stars) n.appendChild(el("span", "st", "⭐⭐⭐".slice(0, stars * 2) + (st.tashih[lv.id] ? "✅" : "")));
        n.onclick = function () {
          A.unlock();
          if (!unl) { A.fx.bad(); n.classList.add("shake"); setTimeout(function () { n.classList.remove("shake"); }, 450); A.talk(t("locked"), st.lang); return; }
          A.fx.tap(); levelIntro(lv);
        };
        row.appendChild(n);
        if (lv === cur) { var mo = el("img", "map-mo"); mo.src = MO("pose-20"); mo.style.left = "calc(" + x + "% + 30px)"; mo.style.top = "18px"; row.appendChild(mo); curNode = row; }
        path.appendChild(row);
      });
      box.appendChild(path);
      m.appendChild(box);
    });
    s.appendChild(nav("map"));
    if (curNode) setTimeout(function () { curNode.scrollIntoView({ block: "center" }); }, 60);
  }

  function levelName(lv) {
    if (lv.kind === "surah") { var su = HJ.surah(lv.surah); return (S.get().lang === "en" ? "Surah " : "Surat ") + tr(su.name); }
    return typeof lv.title === "string" ? lv.title : tr(lv.title);
  }
  function levelIntro(lv) {
    var w = HJ.worlds[lv.w - 1];
    HJ.modal(function (p, close) {
      p.appendChild(el("div", "sub", w.emoji + " " + esc(tr(w.name)) + " · " + (S.get().lang === "en" ? "Level " : "Level ") + lv.id));
      var h = el("h2", lv.kind === "surah" ? "" : "ar", esc(levelName(lv))); h.style.fontSize = "40px"; p.appendChild(h);
      if (lv.kind === "surah") { var su = HJ.surah(lv.surah); p.appendChild(el("div", "qr", esc(su.arabicName))).style.fontSize = "34px"; p.appendChild(el("p", "", esc(tr(su.meaning)) + " · " + su.ayahs.length + " ayat")); }
      if (lv.say) p.appendChild(el("p", "", esc(tr(lv.say))));
      if (lv.kind === "boss") p.appendChild(el("p", "", "❤️❤️❤️ " + esc(t("hearts"))));
      var stars = S.get().stars[lv.id] || 0;
      var bs = el("div", "bigstars"); for (var i = 0; i < 3; i++) bs.appendChild(el("span", i < stars ? "on" : "", "⭐")); p.appendChild(bs);
      var b = el("button", "btn big", "▶ " + t("start")); b.onclick = function () { close(); runLevel(lv); }; p.appendChild(b);
    });
  }

  /* ---------- level runner ---------- */
  var runId = 0;
  function runLevel(lv, opts) {
    opts = opts || {};
    var steps = opts.steps || HJ.buildSteps(lv), idx = 0, mistakes = 0, hearts = 3, boss = lv.kind === "boss", my = ++runId;
    var s = clear();
    var top = el("div", "lv-top"), x = el("button", "icon-btn", "✖"), bar = el("div", "bar", "<i></i>"), hz = el("div", "hearts");
    top.appendChild(x); top.appendChild(bar); if (boss) top.appendChild(hz);
    s.appendChild(top);
    var stage = el("div", "stage"); s.appendChild(stage);
    var bw = el("div", "bubble-wrap"), moI = el("img"), bub = el("div", "bubble"); moI.alt = "Baby Mo"; bw.appendChild(moI); bw.appendChild(bub);
    s.appendChild(bw);
    function drawHearts() { hz.textContent = "❤️❤️❤️".slice(0, hearts * 2) + "🤍🤍🤍".slice(0, (3 - hearts) * 2); }
    drawHearts();
    x.onclick = function () {
      HJ.modal(function (p, close) {
        p.appendChild(el("h2", "", t("quit")));
        var r = el("div", "row"), y = el("button", "btn red", t("yesQuit")), n = el("button", "btn", t("keepPlaying"));
        y.onclick = function () { close(); runId++; opts.onExit ? opts.onExit() : map(); }; n.onclick = close;
        r.appendChild(n); r.appendChild(y); p.appendChild(r);
      });
    };
    var stepToken = 0, bubT = null;
    function mo(pose, text, big) {
      if (pose === null) { bw.style.display = "none"; return; }
      bw.style.display = "";
      if (pose) { if (pose.indexOf("mo2:") === 0) { bw.style.display = "none"; return; } moI.src = MO(pose); }
      moI.classList.remove("hop"); void moI.offsetWidth; moI.classList.add("hop");
      if (text) { bub.textContent = text; bub.classList.add("on"); clearTimeout(bubT); bubT = setTimeout(function () { bub.classList.remove("on"); }, 2600); }
      else bub.classList.remove("on");
    }
    function show() {
      if (my !== runId) return;
      stage.innerHTML = ""; var tok = ++stepToken;
      bar.firstChild.style.width = (idx / steps.length * 100) + "%";
      if (idx >= steps.length) return finish();
      var step = steps[idx], g = HJ.games[step.type];
      var nexted = false;
      var ctx = {
        stage: stage, lv: lv, step: step,
        alive: function () { return my === runId && tok === stepToken; },
        next: function () { if (nexted || !ctx.alive()) return; nexted = true; A.stop(); idx++; show(); },
        good: function () { A.fx.good(); mo(HJ.util.pick(CHEER), HJ.util.pick([t("great"), t("good"), "Yeay!", "Masya Allah!"])); },
        cheer: function (txt) { mo(HJ.util.pick(CHEER), txt || t("great")); },
        bad: function (soft) {
          A.fx.bad(); mo(HJ.util.pick(OOPS), t("oops"));
          if (soft) return;
          mistakes++;
          if (boss) { hearts--; drawHearts(); hz.classList.add("shake"); setTimeout(function () { hz.classList.remove("shake"); }, 450); if (hearts <= 0) { runId++; A.fx.lose(); failed(lv); } }
        },
        mo: mo
      };
      bw.style.display = ""; HJ._ctx = ctx;
      if (!g) { ctx.next(); return; }
      g(step, ctx);
    }
    function finish() {
      runId++;
      var stars = boss ? hearts : (mistakes <= 1 ? 3 : mistakes <= 4 ? 2 : 1);
      if (opts.onDone) return opts.onDone(stars);
      var first = S.finish(lv.id, stars);
      results(lv, stars, first);
    }
    show();
  }
  HJ.runLevel = runLevel;

  function failed(lv) {
    A.talk(t("fail"), S.get().lang);
    HJ.modal(function (p, close) {
      p.appendChild(moImg("pose-23", "140px"));
      p.appendChild(el("h2", "", t("fail")));
      var r = el("div", "row"), a = el("button", "btn", "🔁 " + t("again")), m = el("button", "btn ghost", "🗺️ " + t("map"));
      a.onclick = function () { close(); runLevel(lv); }; m.onclick = function () { close(); map(); };
      r.appendChild(m); r.appendChild(a); p.appendChild(r);
    }, { sticky: true });
  }

  function stickerFor(lv) {
    var w = HJ.worlds[lv.w - 1];
    var face = lv.kind === "letters" ? HJ.syl(lv.letters[0], "a").ar : lv.kind === "surah" ? "📖" : lv.icon || w.emoji;
    return { face: face, color: w.color, ar: lv.kind === "letters" };
  }
  function stickerEl(lv, got) {
    var sd = stickerFor(lv), e = el("div", "sticker" + (got ? "" : " no"), esc(sd.face)); e.style.background = sd.color;
    if (!sd.ar) e.style.fontFamily = "var(--ui)";
    return e;
  }

  function results(lv, stars, first) {
    A.fx.win(); confetti(70);
    var all = HJ.allLevels(), nxt = all[all.indexOf(lv) + 1];
    HJ.modal(function (p, close) {
      p.appendChild(moImg(HJ.util.pick(["yeyy", "pose-02", "wow", "pose-37"]), "150px")).classList.add("result-mo");
      p.appendChild(el("h2", "", t("levelDone")));
      var bs = el("div", "bigstars"); for (var i = 0; i < 3; i++) bs.appendChild(el("span", "", "⭐")); p.appendChild(bs);
      for (var j = 0; j < stars; j++) (function (j) { setTimeout(function () { bs.children[j].classList.add("on"); A.fx.star(j); }, 400 + j * 350); })(j);
      if (first) { p.appendChild(el("p", "", "<b>" + esc(t("newSticker")) + "</b>")); p.appendChild(stickerEl(lv, true)); }
      var w = HJ.worlds[lv.w - 1];
      if (lv === w.levels[w.levels.length - 1] && lv.kind === "boss") p.appendChild(el("p", "", "🏆 " + esc(tr(w.name)) + " ✓"));
      var r = el("div", "row"), again = el("button", "btn ghost", "🔁 " + t("again")), go = el("button", "btn", t("next") + " ▶");
      again.onclick = function () { close(); runLevel(lv); };
      go.onclick = function () { close(); if (nxt && S.unlocked(nxt)) levelIntroOnMap(nxt); else map(); };
      r.appendChild(again); r.appendChild(go); p.appendChild(r);
    }, { sticky: true });
    A.talk(t("great"), S.get().lang);
  }
  function levelIntroOnMap(lv) { map(); setTimeout(function () { levelIntro(lv); }, 120); }

  /* ---------- daily review (Ummi: murajaah every day) ---------- */
  function startDaily() {
    var st = S.get(), done = HJ.allLevels().filter(function (l) { return st.stars[l.id]; });
    var pool = [];
    done.forEach(function (l) {
      if (l.kind === "letters") l.letters.forEach(function (k) { pool.push(HJ.syl(k, l.v || "a")); });
      else if (l.items) pool = pool.concat(l.items.slice(0, 6));
    });
    if (pool.length < 4) pool = pool.concat(["alif", "ba", "ta", "tsa"].map(function (k) { return HJ.syl(k, "a"); }));
    pool = HJ.util.shuffle(pool).slice(0, 14);
    var U = HJ.util;
    var lv = { id: "daily", kind: "daily", w: 1 };
    function chainOf(n) { var a = U.shuffle(pool).slice(0, n); return HJ.chain(a); }
    var steps = [
      { type: "intro", mo: "pose-12", say: { id: "Murajaah! Kita ulang yang sudah Ibra pelajari.", en: "Review! Let's repeat what you've learned." } },
      { type: "train", item: chainOf(4) },
      { type: "bridge", rounds: [0, 1, 2, 3].map(function () { var q = U.pick(pool); return { q: q, options: U.shuffle([q].concat(U.shuffle(pool.filter(function (x) { return x.ar !== q.ar; })).slice(0, 2))) }; }) },
      { type: "match", pairs: U.shuffle(pool).slice(0, 4).map(function (x) { return [x, x]; }) },
      { type: "train", item: chainOf(4) }
    ];
    // de-duplicate match pairs
    var seen = {}; steps[3].pairs = steps[3].pairs.filter(function (p) { if (seen[p[0].ar]) return false; seen[p[0].ar] = 1; return true; });
    runLevel(lv, { steps: steps, onExit: home, onDone: function (stars) {
      S.finish("daily-" + new Date().toDateString(), 0); delete st.stars["daily-" + new Date().toDateString()];
      var i = st.stickers.indexOf("daily-" + new Date().toDateString()); if (i >= 0) st.stickers.splice(i, 1); S.save();
      A.fx.win(); confetti(50);
      HJ.modal(function (p, close) {
        p.appendChild(moImg("yeyy", "150px"));
        p.appendChild(el("h2", "", "🔥 " + (st.streak.n || 1) + " " + esc(t("streak"))));
        var b = el("button", "btn", t("map") + " ▶"); b.onclick = function () { close(); map(); }; p.appendChild(b);
      }, { sticky: true });
    } });
  }

  /* ---------- sticker book ---------- */
  function stickers() {
    var s = clear(), st = S.get();
    s.appendChild(topbar("🌟 " + t("stickers")));
    var b = el("div", "sbook");
    HJ.worlds.forEach(function (w) {
      b.appendChild(el("h3", "", w.emoji + " " + esc(tr(w.name))));
      var g = el("div", "sgrid");
      w.levels.forEach(function (lv) {
        var e = stickerEl(lv, st.stickers.indexOf(lv.id) >= 0);
        if (st.stickers.indexOf(lv.id) >= 0 && lv.kind === "letters") e.onclick = function () { A.say(HJ.syl(lv.letters[0], "a").au); };
        g.appendChild(e);
      });
      b.appendChild(g);
    });
    s.appendChild(b);
    s.appendChild(nav("stickers"));
  }

  /* ---------- parents ---------- */
  function parents() {
    var s = clear(), st = S.get();
    s.appendChild(topbar("👨‍👩‍👦 " + t("parents")));
    var pp = el("div", "pp"); s.appendChild(pp);
    var fam = el("div", "row"); [["assets/family/abi-wave.webp"], ["assets/family/umi-welcome.webp"]].forEach(function (f) { var i = el("img"); i.src = f[0]; i.style.height = "120px"; fam.appendChild(i); });
    pp.appendChild(fam);

    // report
    var rep = el("div", "sect"); rep.appendChild(el("h3", "", "📊 " + t("progress")));
    rep.appendChild(el("div", "cur-j", "⭐ " + S.totalStars() + " " + t("stars") + " · 🔥 " + (st.streak.n || 0) + " " + t("streak") + " · ▶ " + st.plays + "×"));
    HJ.worlds.forEach(function (w) {
      var done = w.levels.filter(function (l) { return st.stars[l.id]; }).length, ts = w.levels.filter(function (l) { return st.tashih[l.id]; }).length;
      var r = el("div", "prow", "<span>" + w.emoji + "</span><span style='min-width:120px;font-weight:800'>" + esc(tr(w.name)) + "</span>");
      var pb = el("div", "pbar", "<i style='width:" + (done / w.levels.length * 100) + "%'></i>"); r.appendChild(pb);
      r.appendChild(el("span", "", done + "/" + w.levels.length + " · ✅" + ts));
      rep.appendChild(r);
    });
    var cur = S.current(), cw = HJ.worlds[cur.w - 1];
    rep.appendChild(el("p", "cur-j", "▶ " + (S.get().lang === "en" ? "Now: " : "Sekarang: ") + "<b>" + esc(tr(cw.name)) + " · " + esc(levelName(cur)) + "</b>"));
    pp.appendChild(rep);

    // settings
    var set = el("div", "sect"); set.appendChild(el("h3", "", "⚙️ " + t("settings")));
    var nameRow = el("div", "setrow", "<span>" + esc(t("childName")) + "</span>"), inp = el("input"); inp.type = "text"; inp.value = st.name; inp.maxLength = 20;
    inp.onchange = function () { S.set("name", inp.value.trim() || "Ibra"); }; nameRow.appendChild(inp); set.appendChild(nameRow);
    function seg(label, key, opts) {
      var r = el("div", "setrow", "<span>" + esc(label) + "</span>"), sg = el("div", "seg");
      opts.forEach(function (o) {
        var b = el("button", st[key] === o[0] ? "on" : "", esc(o[1]));
        b.onclick = function () { S.set(key, o[0]); applyTheme(); parents(); }; sg.appendChild(b);
      });
      r.appendChild(sg); set.appendChild(r);
    }
    seg(t("language"), "lang", [["id", "Indonesia"], ["en", "English"]]);
    seg(t("theme"), "theme", [["auto", t("themeAuto")], ["light", t("themeLight")], ["dark", t("themeDark")]]);
    function tog(label, key) {
      var r = el("div", "setrow", "<span>" + esc(label) + "</span>"), b = el("button", "tog" + (st.settings[key] ? " on" : ""));
      b.onclick = function () { S.setting(key, !st.settings[key]); b.classList.toggle("on", st.settings[key]); };
      r.appendChild(b); set.appendChild(r);
    }
    tog(t("moVoice"), "moVoice"); tog(t("sfx"), "sfx"); tog(t("latin"), "latin");
    if (!window.HJ_APP_BUILD) tog(t("cdn"), "cdn");
    tog(t("unlockAll"), "unlockAll");
    var rr = el("div", "setrow", "<span>" + esc(t("reset")) + "</span>"), rb = el("button", "btn small red", "🗑");
    rb.onclick = function () { if (confirm(t("resetQ"))) { S.reset(); parents(); } }; rr.appendChild(rb); set.appendChild(rr);
    pp.appendChild(set);

    // curriculum
    var cu = el("div", "sect"); cu.appendChild(el("h3", "", "📚 " + t("curriculum")));
    cu.appendChild(el("p", "cur-j", S.get().lang === "en"
      ? "Method: the Iqra order (sound first, read straight away, small steps) with Ummi habits — talaqqi (listen → copy), daily murajaah, and a tashih check by a parent before moving on. Book 7 is reading real surahs."
      : "Metode: urutan Iqra (langsung bunyi tanpa dieja, langkah kecil) dengan kebiasaan Ummi — talaqqi (dengar → tirukan), murajaah harian, dan tashih oleh Abi/Umi sebelum naik level. Jilid 7 membaca surat-surat pendek."));
    HJ.worlds.forEach(function (w) {
      cu.appendChild(el("div", "cur-j", "<p style='margin-top:8px'><b>" + w.emoji + " " + esc(tr(w.name)) + "</b> — " + esc(tr(w.sub)) + "<br>" + esc(tr(w.goal)) + "</p>"));
    });
    pp.appendChild(cu);
    s.appendChild(nav("parents"));
  }

  /* ---------- graduation certificate ---------- */
  HJ.showCert = function (done) {
    A.fx.win(); confetti(120);
    HJ.modal(function (p, close) {
      var c = el("div", "cert");
      c.appendChild(moImg("mo2:hug-quran", "150px"));
      c.appendChild(el("h2", "", "🎓 " + esc(t("certTitle"))));
      c.appendChild(el("div", "nm", esc(S.get().name)));
      c.appendChild(el("p", "", esc(t("certBody"))));
      c.appendChild(el("p", "", "Baby Mo Hijaiyah · " + new Date().toLocaleDateString(S.get().lang === "en" ? "en-GB" : "id-ID")));
      p.appendChild(c);
      var b = el("button", "btn big", "🏆 " + t("done")); b.onclick = function () { close(); done && done(); }; p.appendChild(b);
    }, { sticky: true });
  };

  // first-time font warmup for the tracing canvas
  if (document.fonts && document.fonts.load) { document.fonts.load("40px 'Scheherazade New'", "بت"); document.fonts.load("40px 'Amiri Quran'", "بِسْمِ"); }
  HJ.go = { home: home, map: map, stickers: stickers, parents: parents };
  var q = location.hash.replace("#", "");
  if (q === "map") map(); else if (q.indexOf("level=") === 0 && HJ.level(q.slice(6))) runLevel(HJ.level(q.slice(6))); else home();

  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(function () {});
})();
