/* Baby Mo Hijaiyah — screens. Same iOS layout as the Baby Mo app home:
   nav bar (star jar · title · settings) → scroll content → floating glass tab bar (Main · Peta · Stiker · Abi & Umi). */
(function () {
  var A = HJ.audio, S = HJ.store, t = HJ.t, tr = HJ.tr, el = HJ.el, esc = HJ.esc, ic = HJ.ic, J = HJ.juice;
  var app = document.getElementById("app");
  var MO = function (p) { return p.indexOf("mo2:") === 0 ? "assets/mo2/mo2-" + p.slice(4) + ".webp" : "assets/mo/mo-" + p + ".webp"; };
  var CHEER = ["yeyy", "pose-02", "wow", "ok", "pose-37", "alright", "pose-26"];
  var OOPS = ["pose-28", "pose-33", "pose-23"];
  var EN = function () { return S.get().lang === "en"; };

  /* per-book icon: gradient squircle + the book's sign on a white card (App Library style) */
  var WI = {
    1: { g: ["#34D399", "#065F46"], s: "أَ بَ" }, 2: { g: ["#A3E635", "#3F8F1F"], s: "بَتَ" },
    3: { g: ["#7DD3FC", "#2563EB"], s: "بِ بُ" }, 4: { g: ["#5EEAD4", "#0E7490"], s: "بٌ بْ" },
    5: { g: ["#C4B5FD", "#7C3AED"], s: "بَّ" }, 6: { g: ["#FDBA74", "#C2410C"], s: "نْ" },
    7: { g: ["#FDE68A", "#B7791F"], s: "قُرْآن" }
  };
  function wi(n, noEm) {
    var d = WI[n], e = el("span", "wi");
    e.style.background = "linear-gradient(160deg," + d.g[0] + "," + d.g[1] + ")";
    e.innerHTML = '<span class="card"><span style="color:' + d.g[1] + '">' + esc(d.s) + "</span></span>";
    return e;
  }
  HJ.wi = wi;

  /* ---------- theme ---------- */
  function applyTheme() {
    var m = S.get().theme, dark = m === "dark" || (m === "auto" && window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    document.documentElement.lang = S.get().lang;
    document.title = S.get().lang === "en" ? "Baby Mo Hijaiyah — learn to read the Qur'an" : "Baby Mo Hijaiyah — belajar membaca Al-Qur'an";
    var meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.content = dark ? "#0B1020" : "#F2F6FC";
  }
  applyTheme();
  if (window.matchMedia) try { matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme); } catch (e) {}

  // Mo picture; render 2 is shown upper body only (owner's art rule)
  function moImg(p, w) {
    var img = el("img"); img.src = MO(p); img.alt = "Baby Mo"; img.draggable = false;
    if (w) img.style.width = w;
    if (p.indexOf("mo2:") === 0) {
      var box = el("span", "upper"); box.appendChild(img);
      img.onload = function () { box.style.height = (img.getBoundingClientRect().height * 0.62) + "px"; };
      return box;
    }
    return img;
  }
  HJ.moImg = moImg;

  /* ---------- daily missions (Ummi: a little every day) ---------- */
  function today() { var d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  function missions() {
    var st = S.get();
    if (!st.daily || st.daily.date !== today()) { st.daily = { date: today(), done: {} }; S.save(); }
    return st.daily.done;
  }
  HJ.mission = function (k) { missions()[k] = 1; S.save(); };

  /* ---------- sheets + parental gate ---------- */
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
      p.appendChild(el("div", "kicker", ic("lock") + " " + esc(t("parents"))));
      p.appendChild(el("h2", "", esc(t("gateQ", { a: a, b: b }))));
      var g = el("div", "gate-nums");
      var opts = [ans]; while (opts.length < 5) { var x = ans + Math.floor(Math.random() * 9) - 4; if (x > 0 && opts.indexOf(x) < 0) opts.push(x); }
      HJ.util.shuffle(opts).forEach(function (n) {
        var bt = el("button", "", n); bt.onclick = function () { close(); if (n === ans) ok(); else A.fx.bad(); };
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

  /* ---------- shell ---------- */
  function bare() { A.stop(); app.innerHTML = ""; var s = el("div", "screen"); app.appendChild(s); return s; }
  var curScreen = null;
  function shell(tab, title) {
    curScreen = { home: home, map: map, stickers: stickers, parents: parents }[tab];
    var s = bare();
    var nb = el("header", "navbar");
    var jar = el("button", "star-jar", HJ.art("star", 30) + '<span>' + S.totalStars() + "</span>");
    jar.setAttribute("aria-label", t("stars")); jar.onclick = function () { A.fx.coin(); stickers(); };
    nb.appendChild(jar);
    nb.appendChild(el("div", "nav-title", esc(title || "")));
    var lp = el("button", "nav-btn lang-pill", HJ.flag(S.get().lang, 22) + "<b>" + S.get().lang.toUpperCase() + "</b>");
    lp.setAttribute("aria-label", t("language")); lp.onclick = function () { A.fx.tap(); setLang(S.get().lang === "en" ? "id" : "en", true); };
    nb.appendChild(lp);
    var gear = el("button", "nav-btn", ic("gear")); gear.setAttribute("aria-label", t("settings"));
    gear.onclick = function () { HJ.gate(parents); };
    nb.appendChild(gear);
    s.appendChild(nb);
    var sc = el("main", "scroller"); s.appendChild(sc);
    var tb = el("nav", "tabbar");
    [["home", "gamepad", t("tabHome"), home], ["map", "map", t("map"), map], ["stickers", "sticker", t("stickers"), stickers],
      ["parents", "family", t("tabParents"), function () { HJ.gate(parents); }]].forEach(function (x) {
      var b = el("button", "tab" + (x[0] === tab ? " on" : ""), ic(x[1]) + "<span>" + esc(x[2]) + "</span>");
      b.onclick = function () { A.unlock(); A.fx.tap(); if (x[0] !== tab || x[0] === "parents") x[3](); };
      tb.appendChild(b);
    });
    s.appendChild(tb);
    return sc;
  }

  function kindArt(lv) { return { review: "repeat", boss: "trophy", khatam: "cap", surah: "book" }[lv.kind] || "sparkle"; }
  function levelName(lv) {
    if (lv.kind === "surah") { var su = HJ.surah(lv.surah); return (EN() ? "Surah " : "Surat ") + tr(su.name); }
    return typeof lv.title === "string" ? lv.title : tr(lv.title);
  }

  /* ---------- HOME ---------- */
  function home() {
    var sc = shell("home", "Baby Mo Hijaiyah"), st = S.get();
    var pane = el("section", "has-scene"); sc.appendChild(pane);
    var scene = el("div", "pd-scene"); scene.innerHTML = window.HJ_SCENE || ""; scene.setAttribute("aria-hidden", "true"); pane.appendChild(scene);

    // Mo peeking + glass speech bubble
    var g = el("div", "mo-greet");
    var pic = el("button", "mo-pic"); pic.setAttribute("aria-label", "Baby Mo");
    var hr = new Date().getHours();
    var pose = hr < 11 ? "pose-05" : hr < 15 ? "pose-41" : hr < 18 ? "yes" : "pose-12";
    pic.appendChild(moImg(pose));
    pic.onclick = function () { A.unlock(); A.fx.pop(); var im = pic.querySelector("img"); im.src = MO(HJ.util.pick(CHEER)); A.talk(st.name ? t("hello", { n: st.name }) : "Assalamu'alaikum!", st.lang); };
    var bub = el("div", "mo-bub glass");
    bub.appendChild(el("div", "mo-hello", st.name ? "Assalamu'alaikum,<br><em>" + esc(st.name) + "</em>! " + HJ.art("hand", 26, "waving")
      : "Assalamu'alaikum! " + HJ.art("hand", 26, "waving")));
    bub.appendChild(el("div", "mo-sub", esc(greetLine(hr))));
    if (!st.name) { var chip = el("button", "chip", ic("user") + " " + esc(t("nameQ"))); chip.onclick = function () { nameSheet(home); }; bub.appendChild(chip); }
    g.appendChild(pic); g.appendChild(bub); pane.appendChild(g);

    // "now" card: continue where Ibra stopped
    var cur = S.current(), w = HJ.worlds[cur.w - 1];
    var done = w.levels.filter(function (l) { return st.stars[l.id]; }).length;
    var now = el("button", "hm-now glass");
    var tx = el("span", "hm-tx");
    tx.innerHTML = '<span class="hm-k">' + esc(t("continue")) + " · " + t("book") + " " + w.n + "</span><b>" + esc(tr(w.name)) + "</b>" +
      '<small><span class="ar" style="font-size:20px">' + esc(cur.kind === "surah" ? HJ.surah(cur.surah).arabicName : levelName(cur)) + "</span> · Level " + cur.id + "</small>" +
      '<span class="hm-bar"><i style="width:' + Math.round(done / w.levels.length * 100) + '%"></i></span>';
    now.appendChild(tx);
    now.appendChild(el("span", "hm-play", ic("play")));
    now.onclick = function () { A.unlock(); A.fx.tap(); levelSheet(cur); };
    pane.appendChild(now);

    // Misi Hari Ini
    var md = missions(), list = [
      { k: "level", icon: wi(cur.w, true), b: t("mLevel"), s: levelName(cur), go: function () { levelSheet(cur); } },
      { k: "review", img: "assets/icons/calendar.svg", b: t("daily"), s: t("dailySub"), go: startDaily },
      { k: "tashih", img: "assets/icons/child.svg", b: t("mTashih"), s: t("mTashihSub"), go: function () { levelSheet(cur); } }
    ];
    var nDone = list.filter(function (m) { return md[m.k]; }).length;
    var dm = el("section", "dm-card glass");
    var dateStr = new Date().toLocaleDateString(EN() ? "en-GB" : "id-ID", { weekday: "long", day: "numeric", month: "long" });
    var lit = st.streak.last === today();
    dm.innerHTML = '<div class="dm-head"><img class="dm-cal" src="assets/icons/mission.svg" alt=""><div class="dm-titles"><div class="dm-kicker">' + esc(dateStr) +
      '</div><div class="dm-title">' + esc(t("mission")) + '</div><div class="dm-sub">' + esc(nDone === 3 ? t("missionAll") : t("missionSub", { n: 3 - nDone })) +
      '</div></div><div class="dm-streak' + (lit ? "" : " off") + '"><span class="dm-fire">' + HJ.art("flame", 26) + '</span><span class="dm-sn">' + (st.streak.n || 0) + '</span><span class="dm-sl">' + esc(t("day")) + "</span></div></div>" +
      '<div class="dm-prog">' + list.map(function (m) { return "<i" + (md[m.k] ? ' class="on"' : "") + "></i>"; }).join("") + "</div>";
    var dl = el("div", "dm-list");
    list.forEach(function (m) {
      var r = el("button", "dm-row" + (md[m.k] ? " done" : ""));
      var art = el("span", "dm-art"); if (m.icon) art.appendChild(m.icon); else art.innerHTML = '<img src="' + m.img + '" alt="">';
      r.appendChild(art);
      r.appendChild(el("span", "dm-txt", "<b>" + esc(m.b) + "</b><small>" + esc(md[m.k] ? t("doneToday") : m.s) + "</small>"));
      r.appendChild(el("span", "dm-go", md[m.k] ? ic("check") : ic("play")));
      r.onclick = function () { A.unlock(); A.fx.tap(); m.go(); };
      dl.appendChild(r);
    });
    dm.appendChild(dl); pane.appendChild(dm);

    // the 7 books as app icons
    sc.appendChild(el("div", "sec-h", "<h3>" + esc(t("books")) + "</h3><small>" + S.totalStars() + " " + HJ.art("star", 16) + "</small>"));
    var grid = el("div", "icon-grid");
    HJ.worlds.forEach(function (w) {
      var locked = !S.unlocked(w.levels[0]), dn = w.levels.filter(function (l) { return st.stars[l.id]; }).length;
      var a = el("button", "app-icon" + (locked ? " locked" : ""));
      a.appendChild(wi(w.n));
      a.appendChild(el("div", "ai-label", esc(w.n < 7 ? t("book") + " " + w.n : "Al-Qur'an")));
      a.appendChild(el("div", "ai-sub", esc(tr(w.name))));
      if (locked) a.appendChild(el("span", "ai-badge", ic("lock")));
      else if (dn === w.levels.length) a.appendChild(el("span", "ai-badge ok", ic("check")));
      else if (dn) a.appendChild(el("span", "ai-badge", dn + "/" + w.levels.length));
      a.onclick = function () { A.unlock(); A.fx.tap(); map(w.n); };
      grid.appendChild(a);
    });
    // extra icons, like the Baby Mo grid
    [["assets/icons/calendar.svg", t("daily"), startDaily], ["assets/icons/sticker.svg", t("stickers"), stickers]].forEach(function (x) {
      var a = el("button", "app-icon", '<img class="sq" src="' + x[0] + '" alt=""><div class="ai-label">' + esc(x[1]) + "</div>");
      a.onclick = function () { A.unlock(); A.fx.tap(); x[2](); }; grid.appendChild(a);
    });
    sc.appendChild(grid);

    sc.appendChild(el("div", "foot", '<span class="ar">رَبِّ زِدْنِي عِلْمًا</span>' + esc(t("footDua"))));
  }
  function greetLine(hr) {
    if (hr < 11) return t("gMorning"); if (hr < 15) return t("gDay"); if (hr < 18) return t("gAfternoon"); return t("gNight");
  }

  /* ---------- MAP ---------- */
  function map(focusWorld) {
    var sc = shell("map", t("map")), st = S.get();
    sc.appendChild(el("div", "large-title", esc(t("mapTitle1")) + " <em>" + esc(t("mapTitle2")) + "</em>"));
    sc.appendChild(el("div", "large-sub", esc(t("mapSub"))));
    var cur = S.current(), curNode = null, focusEl = null;
    HJ.worlds.forEach(function (w) {
      var wLocked = !S.unlocked(w.levels[0]);
      var box = el("section", "world glass" + (wLocked ? " locked" : ""));
      var tint = el("div", "tint"); tint.style.background = "radial-gradient(120% 60% at 100% 0%," + WI[w.n].g[0] + "66, transparent 60%), radial-gradient(90% 50% at 0% 100%," + WI[w.n].g[0] + "44, transparent 70%)";
      box.appendChild(tint);
      var done = w.levels.filter(function (l) { return st.stars[l.id]; }).length, pct = done / w.levels.length;
      var wh = el("div", "wh"); wh.appendChild(wi(w.n));
      wh.appendChild(el("div", "", "<b>" + esc(tr(w.name)) + "</b><small>" + esc(tr(w.sub)) + "</small>"));
      var C = 2 * Math.PI * 19;
      wh.appendChild(el("span", "", '<svg class="ring" viewBox="0 0 46 46"><circle cx="23" cy="23" r="19" fill="none" stroke="rgba(120,120,128,.18)" stroke-width="6"/>' +
        '<circle cx="23" cy="23" r="19" fill="none" stroke="' + WI[w.n].g[1] + '" stroke-width="6" stroke-linecap="round" stroke-dasharray="' + (C * pct) + " " + C + '" transform="rotate(-90 23 23)"/>' +
        '<text x="23" y="27.5" text-anchor="middle" font-size="12" font-weight="900" fill="currentColor" font-family="Nunito">' + done + "</text></svg>"));
      box.appendChild(wh);
      box.appendChild(el("div", "goal", esc(tr(w.goal))));
      var path = el("div", "path");
      w.levels.forEach(function (lv, i) {
        var row = el("div", "node-row"), x = 50 + Math.sin(i * 0.9) * 26;
        var unl = S.unlocked(lv), stars = st.stars[lv.id] || 0, isBoss = lv.kind === "boss" || lv.kind === "khatam";
        var n = el("button", "node" + (stars ? " done" : "") + (!unl ? " lock" : "") + (lv === cur ? " cur" : "") + (isBoss ? " boss" : ""));
        n.style.left = x + "%";
        var label = lv.kind === "surah" ? HJ.surah(lv.surah).arabicName : (typeof lv.title === "string" ? lv.title : null);
        if (!unl) n.innerHTML = ic("lock");
        else if (isBoss || !label) n.innerHTML = HJ.art(kindArt(lv), isBoss ? 50 : 40);
        else n.innerHTML = '<span class="t ar">' + esc(label) + "</span>";
        if (stars) n.appendChild(el("span", "st", [0, 1, 2].map(function (i) { return HJ.art(i < stars ? "star" : "starOff", 13); }).join("") + (st.tashih[lv.id] ? HJ.art("check", 13) : "")));
        n.onclick = function () {
          A.unlock();
          if (!unl) { A.fx.bad(); n.classList.add("shake"); setTimeout(function () { n.classList.remove("shake"); }, 450); A.talk(t("locked"), st.lang); return; }
          A.fx.tap(); levelSheet(lv);
        };
        row.appendChild(n);
        if (st.justUnlocked === lv.id && unl) {
          n.classList.add("unlocking"); var keep = n.innerHTML; n.innerHTML = ic("lock");
          setTimeout(function () {
            n.innerHTML = keep; n.classList.add("opened"); A.fx.unlock();
            var r = n.getBoundingClientRect(); J.burst(r.left + r.width / 2, r.top + r.height / 2, 16, true); J.buzz(30);
          }, 900);
          delete st.justUnlocked; S.save();
        }
        if (lv === cur) { var mo = el("img", "map-mo"); mo.src = MO("pose-20"); mo.alt = ""; mo.style.left = "calc(" + x + "% + 36px)"; row.appendChild(mo); curNode = row; }
        path.appendChild(row);
      });
      box.appendChild(path);
      sc.appendChild(box);
      if (focusWorld === w.n) focusEl = box;
    });
    setTimeout(function () { (focusEl || curNode) && (focusEl || curNode).scrollIntoView({ block: focusEl ? "start" : "center" }); }, 60);
  }

  function levelSheet(lv) {
    var w = HJ.worlds[lv.w - 1];
    HJ.modal(function (p, close) {
      var top = el("div", "row"); top.appendChild(wi(w.n)); p.appendChild(top);
      p.appendChild(el("div", "kicker", esc(tr(w.name)) + " · Level " + lv.id));
      var isAr = lv.kind !== "surah" && typeof lv.title === "string";
      var h = el("h2", isAr ? "ar" : "", esc(levelName(lv))); if (isAr) h.style.fontSize = "44px"; p.appendChild(h);
      if (lv.kind === "surah") { var su = HJ.surah(lv.surah); var q = el("div", "qr", esc(su.arabicName)); q.style.fontSize = "34px"; p.appendChild(q); p.appendChild(el("p", "", esc(tr(su.meaning)) + " · " + su.ayahs.length + " " + (EN() ? "verses" : "ayat"))); }
      if (lv.say) p.appendChild(el("p", "", esc(tr(lv.say))));
      if (lv.kind === "boss") p.appendChild(el("p", "", HJ.art("heart", 22) + HJ.art("heart", 22) + HJ.art("heart", 22) + " " + esc(t("hearts"))));
      var stars = S.get().stars[lv.id] || 0;
      var bs = el("div", "bigstars"); for (var i = 0; i < 3; i++) bs.appendChild(el("span", i < stars ? "on" : "", HJ.art("star", 50))); p.appendChild(bs);
      var r = el("div", "row"), b = el("button", "btn big", ic("play") + " " + t("start")); b.onclick = function () { close(); runLevel(lv); };
      r.appendChild(b); p.appendChild(r);
    });
  }

  /* ---------- level runner ---------- */
  var runId = 0;
  function runLevel(lv, opts) {
    opts = opts || {};
    var steps = opts.steps || HJ.buildSteps(lv), idx = 0, mistakes = 0, hearts = 3, boss = lv.kind === "boss", my = ++runId;
    var s = bare();
    var top = el("div", "lv-top"), x = el("button", "nav-btn", ic("close")), bar = el("div", "bar", "<i></i>"), hz = el("div", "hearts glass");
    var goal = el("div", "bar-goal", HJ.art(boss ? "trophy" : "star", 30)), combo = 0, missed = [], replayed = false, collected = 0;
    x.setAttribute("aria-label", t("close"));
    var barWrap = el("div", "bar-wrap"); barWrap.appendChild(bar); barWrap.appendChild(goal);
    top.appendChild(x); top.appendChild(barWrap); if (boss) top.appendChild(hz);
    s.appendChild(top);
    var stage = el("div", "stage"); s.appendChild(stage);
    var bw = el("div", "bubble-wrap"), moI = el("img"), bub = el("div", "bubble glass"); moI.alt = "Baby Mo"; bw.appendChild(moI); bw.appendChild(bub);
    s.appendChild(bw);
    function drawHearts() { hz.innerHTML = [0, 1, 2].map(function (i) { return HJ.art(i < hearts ? "heart" : "heartOff", 24); }).join(""); }
    drawHearts();
    x.onclick = function () {
      HJ.modal(function (p, close) {
        p.appendChild(moImg("pose-23", "120px"));
        p.appendChild(el("h2", "", esc(t("quit"))));
        var r = el("div", "row"), y = el("button", "btn ghost", t("yesQuit")), n = el("button", "btn", t("keepPlaying"));
        y.onclick = function () { close(); runId++; opts.onExit ? opts.onExit() : map(lv.w); }; n.onclick = close;
        r.appendChild(y); r.appendChild(n); p.appendChild(r);
      });
    };
    var stepToken = 0, bubT = null;
    function mo(pose, text) {
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
      var step = steps[idx], g = HJ.games[step.type], nexted = false;
      var ctx = {
        stage: stage, lv: lv, step: step,
        alive: function () { return my === runId && tok === stepToken; },
        next: function () { if (nexted || !ctx.alive()) return; nexted = true; A.stop(); idx++; show(); },
        good: function (quiet) {
          A.fx.good(); combo++; collected++;
          if (!quiet) mo(HJ.util.pick(CHEER), HJ.util.pick([t("great"), t("good"), "Yeay!", "Masya Allah!"]));
          var p = J.at(); J.burst(p.x, p.y, 10); J.buzz(15);
          J.fly(p, bar.firstChild.getBoundingClientRect().width > 4 ? bar.firstChild : bar, HJ.art("sparkle", 24));
          if ([3, 5, 8, 12, 16].indexOf(combo) >= 0) {
            setTimeout(function () { if (!ctx.alive()) return; A.fx.combo(combo); J.banner(HJ.art("flame", 44) + "<b>" + esc(t("combo", { n: combo })) + "</b><small>" + esc(HJ.util.pick([t("great"), "Masya Allah!", t("good")])) + "</small>", "combo"); }, 350);
          }
        },
        cheer: function (txt, quiet) { if (!quiet) mo(HJ.util.pick(CHEER), txt || t("great")); J.burst(null, null, 16, true); },
        bad: function (soft, item, options) {
          A.fx.bad(); mo(HJ.util.pick(OOPS), t("oops")); combo = 0; J.buzz([20, 40, 20]);
          if (item && options && !replayed && missed.length < 3 && !missed.some(function (m) { return m.q.ar === item.ar; })) missed.push({ q: item, options: options });
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
    var finalStars = null;
    function finish() {
      // learning loop: what was missed comes back once, gently, before the level ends (no stars lost here)
      if (missed.length && !replayed && !opts.noReplay) {
        replayed = true; finalStars = boss ? hearts : (mistakes <= 1 ? 3 : mistakes <= 4 ? 2 : 1);
        steps.push({ type: "intro", mo: "pose-12", say: { id: "Yuk ulang yang tadi masih susah. Pasti bisa!", en: "Let's try the tricky ones again. You can do it!" }, short: 1 });
        missed.forEach(function (m) { steps.push({ type: "pick", q: m.q, options: HJ.util.shuffle(m.options), again: 1 }); });
        show(); return;
      }
      runId++;
      var stars = finalStars != null ? finalStars : boss ? hearts : (mistakes <= 1 ? 3 : mistakes <= 4 ? 2 : 1);
      if (opts.onDone) return opts.onDone(stars);
      var before = { total: S.totalStars(), streak: S.get().streak.n, streakDay: S.get().streak.last, worldDone: HJ.worlds[lv.w - 1].levels.filter(function (l) { return S.get().stars[l.id]; }).length,
        missions: Object.keys((S.get().daily || {}).done || {}).length };
      var first = S.finish(lv.id, stars);
      HJ.mission("level");
      var all = HJ.allLevels(), nxt = all[all.indexOf(lv) + 1];
      if (first && nxt) { S.get().justUnlocked = nxt.id; S.save(); }
      results(lv, stars, first, before);
    }
    show();
  }
  HJ.runLevel = runLevel;

  function failed(lv) {
    A.talk(t("fail"), S.get().lang);
    HJ.modal(function (p, close) {
      p.appendChild(moImg("pose-23", "130px"));
      p.appendChild(el("h2", "", esc(t("fail"))));
      var r = el("div", "row"), a = el("button", "btn", ic("replay") + " " + t("again")), m = el("button", "btn ghost", ic("map") + " " + t("map"));
      a.onclick = function () { close(); runLevel(lv); }; m.onclick = function () { close(); map(lv.w); };
      r.appendChild(m); r.appendChild(a); p.appendChild(r);
    }, { sticky: true });
  }

  function stickerEl(lv, got, big) {
    var w = WI[lv.w], art = null, face;
    if (lv.kind === "letters") face = HJ.syl(lv.letters[0], lv.v || "a").ar;
    else if (lv.kind === "surah") face = HJ.surah(lv.surah).arabicName;
    else if (typeof lv.title === "string") face = lv.title;
    else art = kindArt(lv);
    var e = el("div", "sticker" + (got ? "" : " no") + (big ? " big" : ""));
    if (got || big) e.innerHTML = art ? HJ.art(art, big ? 64 : 42) : '<span class="sf">' + esc(face) + "</span>";
    if (face && face.replace(/[\u064B-\u0652\s]/g, "").length > 3) e.classList.add("long");
    e.style.background = "linear-gradient(160deg," + w.g[0] + "," + w.g[1] + ")";
    return e;
  }

  function results(lv, stars, first, before) {
    A.fx.win(); confetti(70);
    before = before || { total: S.totalStars(), streak: S.get().streak.n, worldDone: 0, missions: 0 };
    var all = HJ.allLevels(), nxt = all[all.indexOf(lv) + 1], w = HJ.worlds[lv.w - 1], st = S.get();
    var worldDone = w.levels.filter(function (l) { return st.stars[l.id]; }).length, worldComplete = worldDone === w.levels.length && before.worldDone < w.levels.length;
    HJ.modal(function (p, close) {
      var m = moImg(HJ.util.pick(["yeyy", "pose-02", "wow", "pose-37"]), "150px"); m.classList.add("result-mo"); p.appendChild(m);
      p.appendChild(el("div", "kicker", esc(tr(w.name)) + " · Level " + lv.id));
      p.appendChild(el("h2", "", esc(t(stars === 3 ? "perfect" : "levelDone"))));
      var bs = el("div", "bigstars"); for (var i = 0; i < 3; i++) bs.appendChild(el("span", "", HJ.art("star", 54))); p.appendChild(bs);
      for (var j = 0; j < stars; j++) (function (j) { setTimeout(function () {
        bs.children[j].classList.add("on"); A.fx.star(j); J.buzz(20);
        var r = bs.children[j].getBoundingClientRect(); J.burst(r.left + r.width / 2, r.top + r.height / 2, 12, true);
      }, 450 + j * 420); })(j);
      // the totals move: stars, this book's progress, the streak
      var gained = S.totalStars() - before.total, chips = el("div", "row res-chips");
      var cs = el("span", "chip glass", HJ.art("star", 22) + ' <b class="n">' + before.total + "</b>" + (gained > 0 ? ' <span class="plus">+' + gained + "</span>" : ""));
      chips.appendChild(cs);
      var streakUp = st.streak.n > (before.streak || 0) || before.streakDay !== st.streak.last;
      var cf = el("span", "chip glass" + (streakUp ? " lit" : ""), HJ.art("flame", 22) + " <b>" + st.streak.n + "</b> " + esc(st.streak.n === 1 ? t("day1") : t("day")));
      chips.appendChild(cf); p.appendChild(chips);
      setTimeout(function () { J.countUp(cs.querySelector(".n"), before.total, S.totalStars(), 900); if (gained > 0) A.fx.coin(); if (streakUp) { J.bump(cf); A.fx.combo(3); } }, 450 + stars * 420);
      var wb = el("div", "res-world", '<div class="rw-h">' + wi(w.n, true).outerHTML + "<span><b>" + esc(tr(w.name)) + '</b><small><span class="wn">' + before.worldDone + "</span> / " + w.levels.length + "</small></span></div>" +
        '<div class="hm-bar"><i style="width:' + (before.worldDone / w.levels.length * 100) + '%"></i></div>');
      p.appendChild(wb);
      setTimeout(function () { wb.querySelector(".hm-bar i").style.width = (worldDone / w.levels.length * 100) + "%"; J.countUp(wb.querySelector(".wn"), before.worldDone, worldDone, 700); }, 700 + stars * 420);
      if (first) { var sh = el("p", "", "<b>" + esc(t("newSticker")) + "</b>"); p.appendChild(sh); var sk = stickerEl(lv, true, true); sk.classList.add("shine"); p.appendChild(sk); }
      if (worldComplete) {
        p.appendChild(el("div", "world-done", HJ.art("trophy", 46) + "<span><b>" + esc(t("bookDone", { b: tr(w.name) })) + "</b>" +
          (nxt ? "<small>" + esc(t("bookOpen", { b: tr(HJ.worlds[nxt.w - 1].name) })) + "</small>" : "") + "</span>"));
        setTimeout(function () { A.fx.unlock(); J.banner(HJ.art("trophy", 60) + "<b>" + esc(t("bookDone", { b: tr(w.name) })) + "</b>", "big"); confetti(120); }, 1600 + stars * 420);
      }
      var mNow = Object.keys((st.daily || {}).done || {}).length;
      if (mNow > (before.missions || 0)) setTimeout(function () { HJ.toast(HJ.art("check", 22) + " " + esc(t("missionDone", { n: mNow }))); }, 2400);
      var r = el("div", "row"), again = el("button", "btn ghost", ic("replay") + " " + t("again")), go = el("button", "btn", t("next") + " " + ic("next"));
      again.onclick = function () { close(); runLevel(lv); };
      go.onclick = function () { close(); if (nxt && S.unlocked(nxt)) { map(nxt.w); setTimeout(function () { levelSheet(nxt); }, 150); } else map(lv.w); };
      r.appendChild(again); r.appendChild(go); p.appendChild(r);
    }, { sticky: true });
    A.talk(t("great"), S.get().lang);
  }

  /* ---------- daily review ---------- */
  function startDaily() {
    var st = S.get(), done = HJ.allLevels().filter(function (l) { return st.stars[l.id]; });
    var pool = [];
    done.forEach(function (l) {
      if (l.kind === "letters") l.letters.forEach(function (k) { pool.push(HJ.syl(k, l.v || "a")); });
      else if (l.items) pool = pool.concat(l.items.slice(0, 6));
    });
    if (pool.length < 4) pool = pool.concat(["alif", "ba", "ta", "tsa"].map(function (k) { return HJ.syl(k, "a"); }));
    var seen = {}; pool = HJ.util.shuffle(pool).filter(function (x) { if (seen[x.ar]) return false; seen[x.ar] = 1; return true; }).slice(0, 14);
    var U = HJ.util, lv = { id: "daily", kind: "daily", w: 1 };
    function chainOf(n) { return HJ.chain(U.shuffle(pool).slice(0, n)); }
    var steps = [
      { type: "intro", mo: "pose-12", say: { id: "Murajaah! Kita ulang yang sudah {k} pelajari.", en: "Review! Let's repeat what {k} has learned." } },
      { type: "train", item: chainOf(4) },
      { type: "bridge", rounds: [0, 1, 2, 3].map(function () { var q = U.pick(pool); return { q: q, options: U.shuffle([q].concat(U.shuffle(pool.filter(function (x) { return x.ar !== q.ar; })).slice(0, 2))) }; }) },
      { type: "match", pairs: U.shuffle(pool).slice(0, 4).map(function (x) { return [x, x]; }) },
      { type: "train", item: chainOf(4) }
    ];
    runLevel(lv, { steps: steps, onExit: home, onDone: function () {
      var t0 = today();
      if (st.streak.last !== t0) { S.finish("_daily", 0); delete st.stars._daily; var i = st.stickers.indexOf("_daily"); if (i >= 0) st.stickers.splice(i, 1); st.plays--; }
      HJ.mission("review"); S.save();
      A.fx.win(); confetti(50);
      HJ.modal(function (p, close) {
        p.appendChild(moImg("yeyy", "150px"));
        p.appendChild(el("div", "kicker", esc(t("daily"))));
        p.appendChild(el("h2", "", HJ.art("flame", 30) + " " + (st.streak.n || 1) + " " + esc(t("streak"))));
        var r = el("div", "row"), b = el("button", "btn", t("done") + " " + ic("check")); b.onclick = function () { close(); home(); }; r.appendChild(b); p.appendChild(r);
      }, { sticky: true });
    } });
  }

  /* ---------- sticker book ---------- */
  function stickers() {
    var sc = shell("stickers", t("stickers")), st = S.get();
    var got = st.stickers.filter(function (id) { return HJ.level(id); }).length;
    sc.appendChild(el("div", "large-title", esc(t("stickerTitle1")) + " <em>" + esc(t("stickerTitle2")) + "</em>"));
    sc.appendChild(el("div", "large-sub", got + " / " + HJ.allLevels().length + " " + esc(t("stickers").toLowerCase())));
    HJ.worlds.forEach(function (w) {
      var have = w.levels.filter(function (l) { return st.stickers.indexOf(l.id) >= 0; }).length;
      sc.appendChild(el("div", "group-t", esc(tr(w.name)) + " · " + have + "/" + w.levels.length));
      var box = el("div", "list-group"), g = el("div", "sgrid");
      w.levels.forEach(function (lv) {
        var has = st.stickers.indexOf(lv.id) >= 0, e = stickerEl(lv, has);
        if (has) e.onclick = function () { A.fx.pop(); if (lv.kind === "letters") A.say(HJ.syl(lv.letters[0], lv.v || "a").au); };
        g.appendChild(e);
      });
      box.appendChild(g); sc.appendChild(box);
    });
  }

  /* ---------- parents (iOS Settings style) ---------- */
  function parents() {
    var sc = shell("parents", t("tabParents")), st = S.get();
    var pr = el("div", "profile");
    pr.innerHTML = '<div class="fam"><img src="assets/family/abi-wave.webp" alt="Abi"><img class="mo" src="assets/mo/mo-yes.webp" alt="Baby Mo"><img src="assets/family/umi-welcome.webp" alt="Umi"></div>' +
      "<h2>" + esc(st.name || t("kid")) + "</h2><p>" + HJ.art("star", 18) + " " + S.totalStars() + " " + esc(t("stars")) + " · " + HJ.art("flame", 18) + " " + (st.streak.n || 0) + " " + esc(t("streak")) + "</p>";
    sc.appendChild(pr);

    function row(iconHtml, cls, body, right, onclick) {
      var r = el(onclick ? "button" : "div", "lrow");
      r.appendChild(el("span", "lrow-icon " + (cls || ""), iconHtml));
      r.appendChild(el("span", "lrow-body", body));
      if (right) { if (typeof right === "string") r.appendChild(el("span", "lrow-val", right)); else r.appendChild(right); }
      if (onclick) { r.appendChild(el("span", "lrow-chev", ic("chevR"))); r.onclick = onclick; }
      return r;
    }
    // report
    sc.appendChild(el("div", "group-t", esc(t("progress"))));
    var g1 = el("div", "list-group");
    HJ.worlds.forEach(function (w) {
      var done = w.levels.filter(function (l) { return st.stars[l.id]; }).length, ts = w.levels.filter(function (l) { return st.tashih[l.id]; }).length;
      var ico = el("span", ""); ico.appendChild(wi(w.n, true));
      g1.appendChild(row(ico.innerHTML, "", esc(tr(w.name)) + '<small>' + done + "/" + w.levels.length + " level · " + ts + " tashih ✓</small>" +
        '<div class="pbar"><i style="width:' + (done / w.levels.length * 100) + '%"></i></div>', null, function () { map(w.n); }));
    });
    sc.appendChild(g1);
    var cur = S.current();
    sc.appendChild(el("div", "cur-text", (EN() ? "Now: " : "Sekarang: ") + "<b>" + esc(tr(HJ.worlds[cur.w - 1].name)) + " · " + esc(levelName(cur)) + "</b>"));

    // settings
    sc.appendChild(el("div", "group-t", esc(t("settings"))));
    var g2 = el("div", "list-group");
    var inp = el("input"); inp.type = "text"; inp.value = st.name; inp.maxLength = 20; inp.placeholder = t("namePh");
    inp.onchange = function () { S.set("name", inp.value.trim()); };
    g2.appendChild(row(ic("user"), "blue", esc(t("childName")), inp));
    function seg(icon, cls, label, key, opts) {
      var sg = el("div", "seg");
      opts.forEach(function (o) { var b = el("button", st[key] === o[0] ? "on" : "", esc(o[1])); b.onclick = function () { S.set(key, o[0]); applyTheme(); parents(); }; sg.appendChild(b); });
      g2.appendChild(row(icon, cls, esc(label), sg));
    }
    var lsg = el("div", "seg");
    [["id", "Indonesia"], ["en", "English"]].forEach(function (o) { var b = el("button", st.lang === o[0] ? "on" : "", HJ.flag(o[0], 16) + " " + o[1]); b.onclick = function () { setLang(o[0], true); }; lsg.appendChild(b); });
    g2.appendChild(row(ic("globe"), "teal", esc(t("language")) + "<small>" + esc(t("langNote")) + "</small>", lsg));
    seg('<img src="assets/icons/theme.svg" alt="">', "", t("theme"), "theme", [["auto", t("themeAuto")], ["light", t("themeLight")], ["dark", t("themeDark")]]);
    function tog(icon, cls, label, key, sub) {
      var sw = el("button", "switch" + (st.settings[key] ? " on" : "")); sw.setAttribute("role", "switch");
      sw.onclick = function () { S.setting(key, !st.settings[key]); sw.classList.toggle("on", st.settings[key]); A.fx.tap(); };
      g2.appendChild(row(icon, cls, esc(label) + (sub ? "<small>" + esc(sub) + "</small>" : ""), sw));
    }
    tog(ic("speaker"), "gold", t("moVoice"), "moVoice");
    tog('<img src="assets/icons/sound.svg" alt="">', "", t("sfx"), "sfx");
    tog(ic("textA"), "purple", t("latin"), "latin", t("latinSub"));
    if (!window.HJ_APP_BUILD) tog(ic("book"), "teal", t("cdn"), "cdn", t("cdnSub"));
    tog(ic("lock"), "gray", t("unlockAll"), "unlockAll", t("unlockSub"));
    sc.appendChild(g2);

    // curriculum
    sc.appendChild(el("div", "group-t", esc(t("curriculum"))));
    var g3 = el("div", "list-group");
    g3.appendChild(el("div", "cur-text", esc(t("method"))));
    HJ.worlds.forEach(function (w) {
      var ico = el("span", ""); ico.appendChild(wi(w.n, true));
      g3.appendChild(row(ico.innerHTML, "", esc(tr(w.name)) + "<small>" + esc(tr(w.goal)) + "</small>"));
    });
    sc.appendChild(g3);

    sc.appendChild(el("div", "group-t", ""));
    var g4 = el("div", "list-group");
    g4.appendChild(row(ic("trash"), "red", '<span style="color:#FF3B30">' + esc(t("reset")) + "</span>", null, function () {
      HJ.modal(function (p, close) {
        p.appendChild(el("h2", "", esc(t("reset"))));
        p.appendChild(el("p", "", esc(t("resetQ"))));
        var r = el("div", "row"), n = el("button", "btn ghost", t("close")), y = el("button", "btn red", ic("trash") + " " + t("reset"));
        n.onclick = close; y.onclick = function () { close(); S.reset(); parents(); };
        r.appendChild(n); r.appendChild(y); p.appendChild(r);
      });
    }));
    sc.appendChild(g4);
    sc.appendChild(el("div", "foot", "Baby Mo Hijaiyah · " + esc(t("privacy"))));
  }

  /* ---------- graduation certificate ---------- */
  HJ.showCert = function (done) {
    A.fx.win(); confetti(120);
    HJ.modal(function (p, close) {
      var c = el("div", "cert");
      c.appendChild(moImg("mo2:hug-quran", "150px"));
      c.appendChild(el("div", "kicker", "Baby Mo Hijaiyah"));
      c.appendChild(el("div", "", HJ.art("cap", 54))); c.appendChild(el("h2", "", esc(t("certTitle"))));
      c.appendChild(el("div", "nm", esc(S.get().name)));
      c.appendChild(el("p", "", esc(t("certBody"))));
      c.appendChild(el("p", "", new Date().toLocaleDateString(EN() ? "en-GB" : "id-ID", { day: "numeric", month: "long", year: "numeric" })));
      p.appendChild(c);
      var r = el("div", "row"), b = el("button", "btn big", HJ.art("trophy", 30) + " " + t("done")); b.onclick = function () { close(); done && done(); }; r.appendChild(b); p.appendChild(r);
    }, { sticky: true });
  };

  if (document.fonts && document.fonts.load) { document.fonts.load("40px 'Scheherazade New'", "بت"); document.fonts.load("40px 'Amiri Quran'", "بِسْمِ"); }
  /* ---------- language (Indonesian / English), like the Baby Mo app ---------- */
  function setLang(l, toastIt) {
    S.set("lang", l); S.set("langChosen", true);
    try { localStorage.setItem("bm_lang", l); } catch (e) {}
    applyTheme();
    if (toastIt) toast(HJ.flag(l, 22) + " " + esc(t("langToast")) + "<small>" + esc(t("langNote")) + "</small>");
    (curScreen || home)();
  }
  HJ.setLang = setLang;
  function toast(html) {
    var o = document.querySelector(".toast"); if (o) o.remove();
    var x = el("div", "toast glass", html); document.body.appendChild(x);
    setTimeout(function () { x.classList.add("out"); }, 2200); setTimeout(function () { x.remove(); }, 2700);
  }
  HJ.toast = toast;
  // first launch: choose the language (same screen as the Baby Mo app), then the child's name
  function langPicker(done) {
    var v = el("div", "lang-pick");
    v.innerHTML = '<img class="lp-logo" src="assets/brand/babymo-logo-512.png" alt="Baby Mo"><h1>Baby Mo <em>Hijaiyah</em></h1><p>Pilih Bahasa / Choose Language</p>';
    [["id", "Bahasa Indonesia", "Belajar membaca Al-Qur'an sambil bermain"], ["en", "English", "Learn to read the Qur'an through play"]].forEach(function (o) {
      var b = el("button", "lang-btn glass", HJ.flag(o[0], 44) + '<span class="lt"><b>' + o[1] + "</b><small>" + o[2] + "</small></span>" + ic("chevR"));
      if (S.get().lang === o[0]) b.classList.add("guess");
      b.onclick = function () { A.unlock(); A.fx.tap(); S.set("lang", o[0]); S.set("langChosen", true); try { localStorage.setItem("bm_lang", o[0]); } catch (e) {} applyTheme(); v.remove(); done(); };
      v.appendChild(b);
    });
    v.appendChild(el("div", "lp-ar ar", "ا ب ت ث ج ح خ"));
    document.body.appendChild(v);
  }
  function nameSheet(after) {
    HJ.modal(function (p, close) {
      p.appendChild(moImg("yes", "120px"));
      p.appendChild(el("h2", "", esc(t("nameQ"))));
      p.appendChild(el("p", "", esc(t("nameSub"))));
      var inp = el("input", "name-input"); inp.type = "text"; inp.maxLength = 20; inp.placeholder = t("namePh"); inp.value = S.get().name || "";
      p.appendChild(inp);
      var r = el("div", "row"), later = el("button", "btn ghost", t("later")), ok = el("button", "btn", ic("check") + " " + t("save"));
      later.onclick = function () { close(); after && after(); };
      ok.onclick = function () { S.set("name", inp.value.trim()); close(); A.fx.coin(); after && after(); };
      inp.onkeydown = function (e) { if (e.key === "Enter") ok.click(); };
      r.appendChild(later); r.appendChild(ok); p.appendChild(r);
      setTimeout(function () { try { inp.focus(); } catch (e) {} }, 350);
    });
  }
  HJ.nameSheet = nameSheet;

  HJ.go = { home: home, map: map, stickers: stickers, parents: parents };
  var q = location.hash.replace("#", "");
  if (q === "map") map(); else if (q === "stickers") stickers(); else if (q === "parents") parents();
  else if (q.indexOf("level=") === 0 && HJ.level(q.slice(6))) runLevel(HJ.level(q.slice(6))); else home();
  if (!S.get().langChosen) langPicker(function () { home(); if (!S.get().name) setTimeout(function () { nameSheet(home); }, 250); });

  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(function () {});
})();
