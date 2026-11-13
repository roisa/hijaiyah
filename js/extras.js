/* Baby Mo Hijaiyah — extras: the Treasure Chest (a chest every 10 stars, each with a prize that changes how a game
   looks: train colours, balloon sets, writing ink), Free Play (replay favourite games with learned letters, no stars),
   and the parents' weekly report. Screens come from js/app.js through HJ._app (shell, moImg, confetti, home…).
   Prizes are cosmetic only; nothing here is bought, and nothing leaves the device. */
(function () {
  var S = HJ.store, t = HJ.t, tr = HJ.tr, A = function () { return HJ.audio; };
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var APP = function () { return HJ._app; };
  var EVERY = 10;

  /* ---------- prizes ---------- */
  var SETS = {
    train: { label: "pTrain", items: {
      classic: { n: "prClassic", body: ["#FF8A80", "#E5394B"], cab: ["#7CC8FF", "#2B7BE4"] },
      ocean: { n: "prOcean", body: ["#5EEAD4", "#0E7490"], cab: ["#FDE68A", "#D97706"] },
      gold: { n: "prGold", body: ["#FFE680", "#D99A00"], cab: ["#FF8A80", "#E5394B"] },
      galaxy: { n: "prGalaxy", body: ["#C4B5FD", "#6D28D9"], cab: ["#F9A8D4", "#DB2777"] } } },
    balloons: { label: "pBalloons", items: {
      classic: { n: "prRainbow", c: ["#FF6B6B", "#FFB800", "#3FBF86", "#3B7DD8", "#9A7AF0", "#FF8FB1", "#0EA5B7", "#F2994A"] },
      pastel: { n: "prPastel", c: ["#F472B6", "#60A5FA", "#34D399", "#F5B400", "#A78BFA", "#FB923C"] },
      ocean: { n: "prOcean", c: ["#38BDF8", "#0EA5E9", "#14B8A6", "#6366F1", "#22D3EE", "#2563EB"] },
      gold: { n: "prSilver", c: ["#F5B700", "#D99A00", "#AEB7C4", "#F2C94C", "#8E9AAB", "#E0A100"] } } },
    ink: { label: "pInk", items: {
      classic: { n: "prRainbow", c: ["#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981"] },
      gold: { n: "prGold", c: ["#F59E0B", "#E8A000", "#D97706", "#FBBF24"] },
      galaxy: { n: "prGalaxy", c: ["#7C3AED", "#2563EB", "#DB2777", "#0EA5E9"] },
      candy: { n: "prCandy", c: ["#EC4899", "#F472B6", "#FB7185", "#F59E0B"] } } }
  };
  // the order chests give prizes in (a mix, so every kind of game changes early)
  var ORDER = ["train:ocean", "balloons:pastel", "ink:gold", "train:gold", "balloons:ocean", "ink:galaxy", "train:galaxy", "balloons:gold", "ink:candy"];
  function st() { var s = S.get(); s.owned = s.owned || []; s.equip = s.equip || {}; s.chest = s.chest || 0; return s; }
  function cur(kind) { var s = st(), k = s.equip[kind]; return SETS[kind].items[k] && (k === "classic" || s.owned.indexOf(kind + ":" + k) >= 0) ? SETS[kind].items[k] : SETS[kind].items.classic; }
  HJ.prize = {
    train: function () { return cur("train"); },
    balloons: function () { return cur("balloons").c; },
    ink: function () { return cur("ink").c; }
  };

  /* ---------- art ---------- */
  var uid = 0;
  function chestSvg(size, open) {
    var u = "ch" + (++uid);
    return '<svg class="chest-svg" width="' + size + '" height="' + size + '" viewBox="0 0 120 120" aria-hidden="true"><defs>' +
      '<linearGradient id="' + u + 'w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9824A"/><stop offset="1" stop-color="#8A4E22"/></linearGradient>' +
      '<linearGradient id="' + u + 'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF3A6"/><stop offset=".5" stop-color="#FFC21A"/><stop offset="1" stop-color="#D98A00"/></linearGradient>' +
      '<radialGradient id="' + u + 'l" cx=".5" cy=".6" r=".6"><stop offset="0" stop-color="#FFF7C2"/><stop offset="1" stop-color="#FFD84D" stop-opacity="0"/></radialGradient></defs>' +
      '<ellipse cx="60" cy="108" rx="44" ry="7" fill="rgba(0,0,0,.18)"/>' +
      (open ? '<circle cx="60" cy="52" r="46" fill="url(#' + u + 'l)"/>' : "") +
      '<rect x="16" y="54" width="88" height="50" rx="10" fill="url(#' + u + 'w)" stroke="#5E3312" stroke-width="3"/>' +
      '<rect x="16" y="54" width="88" height="11" fill="url(#' + u + 'g)" stroke="#8A5200" stroke-width="2.5"/>' +
      '<rect x="27" y="54" width="10" height="50" fill="url(#' + u + 'g)" stroke="#8A5200" stroke-width="2"/><rect x="83" y="54" width="10" height="50" fill="url(#' + u + 'g)" stroke="#8A5200" stroke-width="2"/>' +
      '<g class="chest-lid"' + (open ? ' transform="translate(0 -22) rotate(-14 20 54)"' : "") + '><path d="M16 56 V42 C16 22 104 22 104 42 V56 Z" fill="url(#' + u + 'w)" stroke="#5E3312" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M27 56 V32 M37 56 V28 M83 56 V28 M93 56 V32" stroke="url(#' + u + 'g)" stroke-width="10"/><path d="M22 38 C34 28 86 28 98 38" stroke="#fff" stroke-width="3" opacity=".35" fill="none" stroke-linecap="round"/></g>' +
      '<rect x="50" y="58" width="20" height="22" rx="5" fill="url(#' + u + 'g)" stroke="#8A5200" stroke-width="2.5"/><circle cx="60" cy="67" r="3.4" fill="#5E3312"/><rect x="58.5" y="68" width="3" height="7" rx="1.5" fill="#5E3312"/>' +
      '<path d="M24 74 C40 70 50 78 70 74" stroke="#fff" stroke-width="2.5" opacity=".18" fill="none"/></svg>';
  }
  function prizeArt(kind, key, size) {
    var it = SETS[kind].items[key], u = "pz" + (++uid), s = size || 56;
    if (kind === "train") return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 96 76" aria-hidden="true"><defs><linearGradient id="' + u + 'a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + it.body[0] + '"/><stop offset="1" stop-color="' + it.body[1] + '"/></linearGradient><linearGradient id="' + u + 'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + it.cab[0] + '"/><stop offset="1" stop-color="' + it.cab[1] + '"/></linearGradient></defs>' +
      '<rect x="66" y="16" width="12" height="16" rx="3" fill="#3A4256"/><rect x="8" y="30" width="72" height="30" rx="10" fill="url(#' + u + 'a)"/><rect x="8" y="12" width="32" height="30" rx="8" fill="url(#' + u + 'b)"/><rect x="14" y="18" width="20" height="14" rx="5" fill="#E9F6FF"/>' +
      '<circle cx="24" cy="62" r="9" fill="#3A4256"/><circle cx="24" cy="62" r="3.5" fill="#C9D3E3"/><circle cx="62" cy="62" r="9" fill="#3A4256"/><circle cx="62" cy="62" r="3.5" fill="#C9D3E3"/><rect x="14" y="36" width="56" height="5" rx="2.5" fill="#fff" opacity=".35"/></svg>';
    if (kind === "balloons") return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 80 80" aria-hidden="true">' + [[22, 30, 0], [52, 26, 1], [38, 42, 2]].map(function (b) {
      return '<path d="M' + b[0] + " " + (b[1] + 17) + " q -3 12 2 22" + '" stroke="rgba(0,0,0,.3)" stroke-width="1.4" fill="none"/><ellipse cx="' + b[0] + '" cy="' + b[1] + '" rx="14" ry="17" fill="' + it.c[b[2]] + '"/><ellipse cx="' + (b[0] - 5) + '" cy="' + (b[1] - 7) + '" rx="4" ry="6" fill="#fff" opacity=".45"/>';
    }).join("") + "</svg>";
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 80 80" aria-hidden="true"><defs><linearGradient id="' + u + '" x1="0" y1="0" x2="1" y2="0">' + it.c.map(function (c, i) { return '<stop offset="' + (i / (it.c.length - 1)) + '" stop-color="' + c + '"/>'; }).join("") +
      '</linearGradient></defs><path d="M12 52 C22 20 34 64 44 36 S62 22 68 30" stroke="url(#' + u + ')" stroke-width="11" fill="none" stroke-linecap="round"/><circle cx="68" cy="30" r="4" fill="#fff" opacity=".8"/></svg>';
  }

  /* ---------- chest logic ---------- */
  function earned() { return Math.floor(S.totalStars() / EVERY); }
  function ready() { return Math.max(0, earned() - st().chest); }
  function toNext() { return EVERY - (S.totalStars() % EVERY); }
  function nextPrize() { var s = st(); for (var i = 0; i < ORDER.length; i++) if (s.owned.indexOf(ORDER[i]) < 0) return ORDER[i]; return null; }

  function chestCard() {
    var r = ready(), c = el("button", "chest-card glass" + (r ? " ready" : ""));
    var left = toNext(), pct = Math.round((EVERY - left) / EVERY * 100);
    c.innerHTML = '<span class="cc-art">' + chestSvg(64) + "</span>" +
      '<span class="cc-tx"><b>' + esc(t("chestT")) + (r > 1 ? ' <span class="cc-n">×' + r + "</span>" : "") + "</b><small>" + esc(r ? t("chestReady") : left === 1 ? t("chestSub1") : t("chestSub", { n: left })) + "</small>" +
      (r ? "" : '<span class="hm-bar"><i style="width:' + pct + '%"></i></span>') + "</span>" +
      (r ? '<span class="cc-go">' + esc(t("chestOpen")) + "</span>" : '<span class="cc-star">' + HJ.art("star", 28) + "</span>");
    c.onclick = function () { A().unlock(); A().fx.tap(); if (ready()) openChest(); else APP().stickers(); };
    return c;
  }

  function openChest() {
    var taps = 0, opened = false;
    HJ.modal(function (p, close) {
      p.classList.add("chest-open");
      var mo = APP().moImg("wow", "96px"); mo.classList.add("co-mo"); p.appendChild(mo);
      var h = el("h2", "", esc(t("chestTap"))); p.appendChild(h);
      A().talk(t("chestTap"), S.get().lang);
      var box = el("button", "co-chest", chestSvg(190)); box.setAttribute("aria-label", t("chestOpen")); p.appendChild(box);
      var dots = el("div", "co-dots", "<i></i><i></i><i></i>"); p.appendChild(dots);
      box.onclick = function () {
        if (opened) return;
        taps++; A().fx.coin(); HJ.juice.buzz(20);
        dots.children[taps - 1] && dots.children[taps - 1].classList.add("on");
        box.classList.remove("wob"); void box.offsetWidth; box.classList.add("wob");
        if (taps < 3) return;
        opened = true; reveal();
      };
      function reveal() {
        var s = st(); s.chest++;
        var pr = nextPrize(), kind, key;
        if (pr) { kind = pr.split(":")[0]; key = pr.split(":")[1]; s.owned.push(pr); }
        else s.bonus = (s.bonus || 0) + 2;
        S.save();
        box.innerHTML = chestSvg(190, true); box.classList.add("opened");
        A().fx.win(); APP().confetti(60);
        var r = box.getBoundingClientRect(); HJ.juice.burst(r.left + r.width / 2, r.top + r.height * .35, 22, true);
        mo.src = mo.src.replace(/mo-[a-z0-9-]+\.webp/, "mo-yeyy.webp");
        setTimeout(function () {
          dots.remove(); h.textContent = pr ? t("chestGot") : t("chestAll");
          var card = el("div", "co-prize");
          A().talk(pr ? t("chestGot") + " " + t(SETS[kind].label) + " " + t(SETS[kind].items[key].n) + "!" : t("chestStars"), S.get().lang);
          if (pr) {
            card.innerHTML = '<span class="cp-art">' + prizeArt(kind, key, 92) + '</span><b>' + esc(t(SETS[kind].label)) + " · " + esc(t(SETS[kind].items[key].n)) + "</b>";
          } else card.innerHTML = '<span class="cp-art">' + HJ.art("star", 72) + '</span><b>' + esc(t("chestStars")) + "</b>";
          box.replaceWith(card);
          var row = el("div", "row");
          if (pr) {
            var later = el("button", "btn ghost", esc(t("chestLater"))), use = el("button", "btn", HJ.ic("check") + " " + esc(t("chestUse")));
            later.onclick = function () { close(); APP().home(); };
            use.onclick = function () { S.get().equip[kind] = key; S.save(); A().fx.sparkle(); close(); HJ.toast(HJ.art("sparkle", 22) + " " + esc(t("tOn"))); APP().home(); };
            row.appendChild(later); row.appendChild(use);
          } else { var ok = el("button", "btn", HJ.ic("check") + " " + esc(t("done"))); ok.onclick = function () { close(); APP().home(); }; row.appendChild(ok); }
          p.appendChild(row);
        }, 900);
      }
    }, { sticky: true });
  }

  /* ---------- the treasures collection (Sticker tab) ---------- */
  function treasures(sc) {
    var s = st();
    sc.appendChild(el("div", "group-t", esc(t("treasures"))));
    var box = el("div", "list-group tr-box");
    box.appendChild(el("div", "tr-sub", esc(t("treasuresSub"))));
    box.appendChild(chestCard());
    Object.keys(SETS).forEach(function (kind) {
      var row = el("div", "tz-row");
      row.appendChild(el("div", "tr-k", esc(t(SETS[kind].label))));
      var g = el("div", "tr-items");
      Object.keys(SETS[kind].items).forEach(function (key) {
        var own = key === "classic" || s.owned.indexOf(kind + ":" + key) >= 0, on = own && (s.equip[kind] || "classic") === key;
        var b = el("button", "tr-item" + (own ? "" : " no") + (on ? " on" : ""), '<span class="ti-art">' + prizeArt(kind, key, 44) + "</span><small>" + esc(own ? t(SETS[kind].items[key].n) : "?") + "</small>");
        b.onclick = function () {
          if (!own) { A().fx.bad(); HJ.toast(HJ.art("gift", 22) + " " + esc(t("tLocked"))); return; }
          S.get().equip[kind] = key; S.save(); A().fx.pop(); APP().stickers();
        };
        g.appendChild(b);
      });
      row.appendChild(g); box.appendChild(row);
    });
    sc.appendChild(box);
  }

  /* ---------- Free Play ---------- */
  var GAMES = [["pop", "gPop", "balloon", "#FF8FB1", "#E5396B"], ["train", "gTrain", null, "#7CC8FF", "#2563EB"], ["bridge", "gBridge", "link", "#5EEAD4", "#0E7490"],
    ["match", "gMatch", "sparkle", "#C4B5FD", "#7C3AED"], ["trace", "gTrace", "hand", "#FDE68A", "#D97706"], ["pick", "gPick", "wave", "#86EFAC", "#15803D"],
    ["build", "gBuild", "book", "#FDBA74", "#C2410C"], ["sort", "gSort", "gift", "#F9A8D4", "#BE185D"], ["yesno", "gYesno", "check", "#93C5FD", "#1D4ED8"]];
  // parents can open every Free Play game (Parents → "Open all games"; "Unlock all levels" does it too)
  function allOpen() { var se = S.get().settings || {}; return !!(se.arcadeAll || se.unlockAll); }
  // little ones' games (3–4): always open; letters = the ones learned so far, at least the first 8 (all 28 when opened)
  var TODDLER = [["bubbles", "gBubbles", "#9BE7FF", "#3B82F6"], ["paint", "gPaint", "#FFB4C8", "#E5396B"], ["feed", "gFeed", "#FFD66B", "#F08C00"], ["shadow", "gShadow", "#B9A6FF", "#6D28D9"]];
  function tArt(k) {
    if (k === "bubbles") return '<svg width="54" height="54" viewBox="0 0 60 60"><circle cx="22" cy="36" r="16" fill="rgba(255,255,255,.35)" stroke="#fff" stroke-width="3"/><circle cx="42" cy="20" r="11" fill="rgba(255,255,255,.35)" stroke="#fff" stroke-width="3"/><circle cx="46" cy="44" r="6" fill="rgba(255,255,255,.35)" stroke="#fff" stroke-width="2.5"/><ellipse cx="16" cy="30" rx="4" ry="3" fill="#fff"/></svg>';
    if (k === "paint") return '<svg width="54" height="54" viewBox="0 0 60 60"><path d="M10 46 L38 18 L46 26 L18 54 Z" fill="#FFD43B" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><path d="M38 18 L44 8 L54 16 L46 26 Z" fill="#fff"/><path d="M6 56 C10 48 16 48 18 54 Z" fill="#fff"/><circle cx="16" cy="18" r="6" fill="#34C759" stroke="#fff" stroke-width="2.5"/><circle cx="48" cy="44" r="5" fill="#3B82F6" stroke="#fff" stroke-width="2.5"/></svg>';
    if (k === "feed") return '<svg width="54" height="54" viewBox="0 0 100 100"><path d="M52 20 C54 10 60 6 66 5" stroke="#6B4423" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M56 16 C66 6 80 8 84 14 C74 20 64 20 56 16 Z" fill="#3FBF5A"/><circle cx="50" cy="58" r="38" fill="#FF4D4D" stroke="#fff" stroke-width="5"/><ellipse cx="36" cy="40" rx="9" ry="6" fill="#fff" opacity=".6"/><text x="50" y="76" text-anchor="middle" font-size="44" font-family="Scheherazade New, serif" fill="#fff">بَ</text></svg>';
    return '<svg width="54" height="54" viewBox="0 0 60 60"><rect x="4" y="22" width="26" height="30" rx="8" fill="rgba(30,20,80,.45)"/><rect x="30" y="8" width="26" height="30" rx="8" fill="#fff"/><text x="43" y="32" text-anchor="middle" font-size="24" font-family="Scheherazade New, serif" fill="#6D28D9">ب</text><text x="17" y="46" text-anchor="middle" font-size="24" font-family="Scheherazade New, serif" fill="rgba(255,255,255,.5)">ب</text></svg>';
  }
  function toddlerPool() {
    var s = S.get(), ks = [];
    HJ.allLevels().forEach(function (l) { if (l.kind === "letters" && (s.stars[l.id] || allOpen())) l.letters.forEach(function (k) { if (ks.indexOf(k) < 0) ks.push(k); }); });
    HJ.L.forEach(function (l) { if (ks.length < 8 && ks.indexOf(l.k) < 0) ks.push(l.k); });
    return ks.map(function (k) { return HJ.syl(k, "a"); });
  }
  function stepsOf(type) {
    var s = S.get(), out = [], firstLv = null;
    HJ.allLevels().forEach(function (l) {
      var steps; try { steps = HJ.buildSteps(l); } catch (e) { return; }
      var has = steps.filter(function (x) { return x.type === type && !x.again; });
      if (!has.length) return;
      if (!firstLv) firstLv = l;
      if (s.stars[l.id] || allOpen()) out = out.concat(has);
    });
    return { steps: out, first: firstLv };
  }
  function arcadeRow(sc) {
    sc.appendChild(el("div", "sec-h arc", "<h3>" + esc(t("arcade")) + "</h3><small>" + esc(t("arcadeSub")) + "</small>"));
    var strip = el("div", "arcade");
    TODDLER.forEach(function (g) {
      var b = el("button", "ar-tile td");
      b.style.background = "linear-gradient(160deg," + g[2] + "," + g[3] + ")";
      b.innerHTML = '<span class="at-age">3+</span><span class="at-art">' + tArt(g[0]) + "</span><b>" + esc(t(g[1])) + "</b>";
      b.onclick = function () { A().unlock(); A().fx.tap(); play(g[0]); };
      strip.appendChild(b);
    });
    GAMES.forEach(function (g) {
      var info = stepsOf(g[0]), open = info.steps.length > 0;
      if (!info.first) return;
      var b = el("button", "ar-tile" + (open ? "" : " locked"));
      b.style.background = "linear-gradient(160deg," + g[3] + "," + g[4] + ")";
      b.innerHTML = '<span class="at-art">' + (g[2] ? HJ.art(g[2], 46) : HJ.engine()) + "</span><b>" + esc(t(g[1])) + "</b>" +
        (open ? "" : "<small>" + HJ.ic("lock") + " " + esc(t("arcadeLock", { b: info.first.id })) + "</small>");
      b.onclick = function () { A().unlock(); if (!open) { A().fx.bad(); HJ.toast(HJ.ic("lock") + " " + esc(t("arcadeAsk"))); A().talk(t("arcadeAsk"), S.get().lang); return; } A().fx.tap(); play(g[0]); };
      strip.appendChild(b);
    });
    sc.appendChild(strip);
  }
  function play(type) {
    var steps;
    if (TODDLER.some(function (g) { return g[0] === type; })) steps = HJ.toddlerSteps(type, toddlerPool());
    else {
      var pool = HJ.util.shuffle(stepsOf(type).steps.slice()), n = type === "match" || type === "trace" || type === "sort" ? 2 : 4;
      steps = pool.slice(0, n).map(function (x) { return JSON.parse(JSON.stringify(x)); });
    }
    if (!steps.length) return;
    HJ.runLevel({ id: "_arcade", kind: "arcade", w: 1 }, { steps: steps, noReplay: true, onExit: APP().home, onDone: function () {
      A().fx.win(); APP().confetti(50);
      HJ.modal(function (p, close) {
        p.appendChild(APP().moImg(HJ.util.pick(["yeyy", "pose-02", "pose-37"]), "140px"));
        p.appendChild(el("div", "kicker", esc(t("arcade"))));
        p.appendChild(el("h2", "", esc(t("arcadeDone"))));
        A().talk(t("arcadeDone"), S.get().lang);
        // the fun jar: every 3 Free Play rounds → +1 star (at most 3 a day), so little ones also reach treasure chests
        var s0 = S.get(), d0 = S.dayKey(new Date()); if (!s0.fun || s0.fun.d !== d0) s0.fun = { d: d0, n: 0, st: 0 };
        s0.fun.n++; var fill = s0.fun.n % 3 || 3, gotStar = fill === 3 && s0.fun.st < 3;
        if (gotStar) { s0.fun.st++; s0.bonus = (s0.bonus || 0) + 1; }
        S.save();
        var jar = el("div", "fun-jar" + (gotStar ? " full" : ""));
        jar.innerHTML = '<span class="fj-k">' + esc(t("funJar")) + "</span>" + [0, 1, 2].map(function (i) { return '<i class="' + (i < fill ? "on" : "") + (i === fill - 1 ? " new" : "") + '">' + HJ.art("star", 22) + "</i>"; }).join("") +
          (gotStar ? '<b class="fj-plus">+1 ' + HJ.art("star", 22) + "</b>" : "");
        p.appendChild(jar);
        p.appendChild(el("p", "ar-note", esc(gotStar ? t("funJarFull") : s0.fun.st >= 3 && fill === 3 ? t("funJarMax") : t("funJarSub", { n: 3 - fill }))));
        if (gotStar) setTimeout(function () { A().fx.star(2); }, 500);
        var r = el("div", "row"), home = el("button", "btn ghost", esc(t("done"))), again = el("button", "btn", HJ.ic("replay") + " " + esc(t("arcadeAgain")));
        home.onclick = function () { close(); APP().home(); }; again.onclick = function () { close(); play(type); };
        r.appendChild(home); r.appendChild(again); p.appendChild(r);
      });
    } });
  }

  /* ---------- weekly report (parents) ---------- */
  function weekly(sc) {
    var s = S.get(), now = new Date(), dow = (now.getDay() + 6) % 7, days = [], sum = { ms: 0, lv: 0, nw: 0, ts: 0 }, played = 0;
    for (var i = 0; i < 7; i++) {
      var d = new Date(now); d.setDate(now.getDate() - dow + i);
      var lg = (s.log || {})[S.dayKey(d)] || null, on = !!(lg && (lg.ms > 30000 || lg.lv));
      if (lg && i <= dow) { sum.ms += lg.ms; sum.lv += lg.lv; sum.nw += lg.nw; sum.ts += lg.ts; }
      if (on && i <= dow) played++;
      days.push({ d: d, on: on && i <= dow, today: i === dow, future: i > dow });
    }
    var mins = Math.round(sum.ms / 60000), lang = s.lang === "en" ? "en-GB" : "id-ID";
    sc.appendChild(el("div", "group-t", esc(t("week"))));
    var box = el("div", "list-group wk");
    box.appendChild(el("div", "wk-days", days.map(function (x) {
      return '<span class="wk-d' + (x.on ? " on" : "") + (x.today ? " today" : "") + (x.future ? " fut" : "") + '"><i>' + (x.on ? HJ.ic("check") : x.d.getDate()) + "</i><small>" + esc(x.d.toLocaleDateString(lang, { weekday: "short" })) + "</small></span>";
    }).join("")));
    box.appendChild(el("div", "wk-sum", esc(t("wkDays", { n: played }))));
    box.appendChild(el("div", "wk-stats", [[mins, "wkMin", "flame"], [sum.lv, "wkLv", "trophy"], [sum.nw, "wkNew", "medal"], [sum.ts, "wkTs", "check"]].map(function (x) {
      return '<span class="wk-s">' + HJ.art(x[2], 26) + "<b>" + x[0] + "</b><small>" + esc(t(x[1])) + "</small></span>";
    }).join("")));
    // letters to practise
    var weak = S.weak(14).slice(0, 6);
    var wb = el("div", "wk-weak");
    wb.appendChild(el("div", "wk-wt", "<b>" + esc(t("weakT")) + "</b><small>" + esc(weak.length ? t("weakSub") : t("weakNone")) + "</small>"));
    if (weak.length) {
      var chips = el("div", "wk-chips");
      weak.forEach(function (x) {
        var c = el("button", "wk-chip", '<span class="ar">' + esc(x.ar) + "</span><small>" + esc(t("weakTimes", { n: x.n })) + "</small>");
        c.onclick = function () { A().unlock(); A().say(x.au || x.ar); };
        chips.appendChild(c);
      });
      wb.appendChild(chips);
      var go = el("button", "btn small", HJ.ic("play") + " " + esc(t("weakGo"))); go.onclick = function () { practice(weak); };
      var gr = el("div", "wk-btns"); gr.appendChild(go); wb.appendChild(gr);
    }
    box.appendChild(wb);
    var cur = S.current(), w = HJ.worlds[cur.w - 1];
    var text = t("wkText", { k: s.name || t("kid"), d: played, m: mins, l: sum.lv, s: sum.nw, t: sum.ts, now: tr(w.name) + " · Level " + cur.id });
    var row = el("div", "wk-btns"), sh = el("button", "btn small", HJ.ic("next") + " " + esc(t("wkShare"))), wa = el("button", "btn small ghost", HJ.ic("bubble") + " " + esc(t("wkWa")));
    sh.onclick = function () {
      if (navigator.share) { navigator.share({ text: text }).catch(function () {}); return; }
      copy(text);
    };
    wa.onclick = function () { window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank", "noopener"); };
    row.appendChild(sh); if (!window.HJ_APP_BUILD) row.appendChild(wa);
    box.appendChild(row);
    sc.appendChild(box);
  }
  // a short practice of the mixed-up letters: hear it → pick it among its look-alikes, then a yes/no round
  function practice(weak) {
    var U = HJ.util, items = weak.map(function (x) { return { ar: x.ar, au: x.au || x.ar, k: x.k, v: x.v, tr: x.tr }; });
    function opts(q) {
      var o = [q];
      if (q.k) HJ.cousins(q.k).concat(HJ.L.map(function (l) { return l.k; })).forEach(function (k) { var y = HJ.syl(k, q.v || "a"); if (o.length < 3 && !o.some(function (z) { return z.ar === y.ar; })) o.push(y); });
      items.forEach(function (y) { if (o.length < 3 && !o.some(function (z) { return z.ar === y.ar; })) o.push(y); });
      return U.shuffle(o);
    }
    var steps = [{ type: "intro", mo: "pose-12", say: { id: t("practiceSay"), en: t("practiceSay") } }];
    items.forEach(function (q) { steps.push({ type: "pick", q: q, options: opts(q) }); });
    U.shuffle(items.slice()).slice(0, 3).forEach(function (q) { var o = opts(q); steps.push({ type: "pick", q: q, options: o }); });
    HJ.runLevel({ id: "_practice", kind: "practice", w: 1 }, { steps: steps, noReplay: true, onExit: APP().home, onDone: function () {
      var s = S.get(); s.practiced = s.practiced || {}; items.forEach(function (x) { s.practiced[x.ar] = Date.now(); }); S.save();
      A().fx.win(); APP().confetti(50); A().talk(t("practiceDone"), s.lang);
      HJ.modal(function (p, close) {
        p.appendChild(APP().moImg("yeyy", "140px")); p.appendChild(el("div", "kicker", esc(t("practiceT")))); p.appendChild(el("h2", "", esc(t("practiceDone"))));
        var r = el("div", "row"), ok = el("button", "btn", HJ.ic("check") + " " + esc(t("done"))); ok.onclick = function () { close(); APP().home(); }; r.appendChild(ok); p.appendChild(r);
      });
    } });
  }
  function copy(text) {
    var done = function () { HJ.toast(HJ.art("check", 22) + " " + esc(t("wkCopied"))); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
    else { var ta = el("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); done(); } catch (e) {} ta.remove(); }
  }

  HJ.extras = { practice: practice, chestCard: chestCard, openChest: openChest, treasures: treasures, arcadeRow: arcadeRow, weekly: weekly, chestReady: ready, playArcade: play };
})();
