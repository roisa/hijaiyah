/* Baby Mo Hijaiyah — learning tajwid before the quiz.
   Every rule first gets a little story with NUNI (a friendly nun sakinah, نْ) and MIMI (a friendly mim sakinah,
   مْ) meeting the letter that comes next, then three games that teach the rule by playing it:
     • rule    — the animated story, page by page (Mo tells it; tap to hear a real verse where it happens)
     • friends — "who are Nuni's friends for this rule?": tap every letter that triggers it (it says its name)
     • spot    — detective: a real verse piece; look at نْ / ـً ـٍ ـٌ / مْ and the letter after it, decide the rule
     • hold    — hold the button to hum "nnn" (ghunnah, 2 beats) or to stretch a long vowel (mad, 2 or 4–5 beats)
   The monsters (js/tajwid.js) come after, as practice once the rules make sense.
   Qur'an text only comes from the curriculum (exact fragments); its sound is the real recitation of that ayah. */
(function () {
  var A = HJ.audio, t = HJ.t, tr = HJ.tr, el = HJ.el, esc = HJ.esc, U = HJ.util, G = HJ.games;
  var T = function (id, en) { return { id: id, en: en }; };

  // the letters that decide each rule
  var L = function (s) { return s.split(" "); };
  var GROUPS = {
    izhar: L("ء ه ع ح غ خ"), idgham: L("ي ن م و ل ر"), iqlab: L("ب"),
    ikhfa: L("ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك"),
    "ikhfa-syafawi": L("ب"), "idgham-mimi": L("م"),
    qamariyah: L("ا ب غ ح ج ك و خ ف ع ق ي م ه"), syamsiyah: L("ت ث د ذ ر ز س ش ص ض ط ظ ل ن")
  };
  var ALL = L("ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي");
  GROUPS["izhar-syafawi"] = ALL.filter(function (c) { return c !== "ب" && c !== "م"; });
  var COL = { izhar: ["#FFD43B", "#F59F00"], idgham: ["#5AAEFF", "#2F7FE8"], iqlab: ["#34D07A", "#12A05A"], ikhfa: ["#B48CFF", "#7C52EC"],
    "ikhfa-syafawi": ["#B48CFF", "#7C52EC"], "idgham-mimi": ["#5AAEFF", "#2F7FE8"], "izhar-syafawi": ["#FFD43B", "#F59F00"],
    qamariyah: ["#9FB4FF", "#4F46E5"], syamsiyah: ["#FFB36B", "#F97316"], "mad-wajib": ["#FFB36B", "#EA580C"], "mad-jaiz": ["#5EEAD4", "#0F766E"] };
  var NAME = { izhar: T("Izhar", "Izhar"), idgham: T("Idgham", "Idgham"), iqlab: T("Iqlab", "Iqlab"), ikhfa: T("Ikhfa", "Ikhfa"),
    "ikhfa-syafawi": T("Ikhfa syafawi", "Ikhfa syafawi"), "idgham-mimi": T("Idgham mimi", "Idgham mimi"), "izhar-syafawi": T("Izhar syafawi", "Izhar syafawi"),
    qamariyah: T("Qamariyah", "Moon letter"), syamsiyah: T("Syamsiyah", "Sun letter") };
  // what the rule does, in a few words (shown after the detective decides)
  var DOES = { izhar: T("dibaca jelas", "said clearly"), idgham: T("masuk ke huruf berikutnya", "merges into the next letter"), iqlab: T("berubah jadi m", "turns into m"),
    ikhfa: T("samar sambil berdengung", "hidden, with a hum"), "ikhfa-syafawi": T("samar", "hidden"), "idgham-mimi": T("masuk, berdengung", "merges, with a hum"),
    "izhar-syafawi": T("dibaca jelas", "said clearly") };
  G.tajwidRules = { GROUPS: GROUPS, COL: COL, NAME: NAME };

  // what Mo SAYS: the Arabic letters in a line become their names ("ي ن م و" → "ya, nun, mim, wau"); the screen keeps the letters
  var SAYN = { "ء": ["hamzah", "hamzah"], "ا": ["alif", "alif"], "ه": ["ha", "ha"], "ع": ["'ain", "'ayn"], "ح": ["ha", "ḥa"], "غ": ["ghain", "ghayn"], "خ": ["kha", "kha"],
    "ي": ["ya", "ya"], "ن": ["nun", "nun"], "م": ["mim", "mim"], "و": ["wau", "waw"], "ل": ["lam", "lam"], "ر": ["ra", "ra"], "ب": ["ba", "ba"], "ق": ["qof", "qaf"], "د": ["dal", "dal"] };
  function voiceOf(text, lang) {
    var k = lang === "en" ? 1 : 0;
    return String(text).replace(/[\u0621-\u064A][\u064B-\u0652]*(?:\s+[\u0621-\u064A][\u064B-\u0652]*)*/g, function (m) {
      return m.trim().split(/\s+/).map(function (c) { var b = c.replace(/[\u064B-\u0652]/g, ""); return SAYN[b] ? SAYN[b][k] : ""; }).filter(Boolean).join(", ");
    }).replace(/\s+([,.:!?])/g, "$1").replace(/\s{2,}/g, " ").trim();
  }
  G.tajwidVoice = voiceOf;
  function nameOf(ch) { var l = HJ.BY[ch]; return l && l.n ? l.n : ch; }          // the letter's name (it has a clip)
  function sayName(ch) { A.say(ch === "ا" ? "أَلِف" : nameOf(ch)); }

  /* ---------- the characters ---------- */
  // Nuni: the letter nun as a little bowl creature with its dot, a sukun cap and big eyes. Mimi: the same idea for mim.
  function nuniSvg(kind) {
    var c = kind === "mim" ? ["#FF8FB1", "#E0457A"] : ["#5EEAD4", "#14B8A6"], u = "nu" + Math.random().toString(36).slice(2, 7);
    var body = kind === "mim"
      ? '<circle cx="50" cy="44" r="20" fill="url(#' + u + ')"/><path d="M50 62 C50 76 46 86 40 94" stroke="url(#' + u + ')" stroke-width="12" fill="none" stroke-linecap="round"/>'
      : '<path d="M14 40 C14 76 86 76 86 40" stroke="url(#' + u + ')" stroke-width="16" fill="none" stroke-linecap="round"/><circle cx="50" cy="26" r="8" fill="' + c[1] + '"/>';
    return '<svg class="nuni-svg" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c[0] + '"/><stop offset="1" stop-color="' + c[1] + '"/></linearGradient></defs>' +
      '<circle class="cap" cx="50" cy="6" r="6" fill="none" stroke="#FF8A3D" stroke-width="4"/>' + body +
      (kind === "mim" ? '<circle cx="43" cy="42" r="5" fill="#fff"/><circle cx="57" cy="42" r="5" fill="#fff"/><circle cx="44" cy="43" r="2.6" fill="#1D2433"/><circle cx="58" cy="43" r="2.6" fill="#1D2433"/><path d="M45 52 Q50 56 55 52" stroke="#1D2433" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
        : '<circle cx="34" cy="56" r="6" fill="#fff"/><circle cx="66" cy="56" r="6" fill="#fff"/><circle cx="35" cy="57" r="3" fill="#1D2433"/><circle cx="67" cy="57" r="3" fill="#1D2433"/><path d="M44 66 Q50 71 56 66" stroke="#1D2433" stroke-width="2.6" fill="none" stroke-linecap="round"/>') +
      "</svg>";
  }
  function friendEl(ch, col) {
    var f = el("div", "tj-friend", '<span class="ar">' + esc(ch) + '</span><i class="tj-eyes"><b></b><b></b></i>');
    if (col) f.style.background = "linear-gradient(160deg," + col[0] + "," + col[1] + ")";
    return f;
  }

  /* ---------- 1. the story: a scene, Mo tells it, tap to hear a real verse ---------- */
  // s.pages: [{ scene, who: "nun"|"mim", friend: "خ", rule, say: T(), ex: item }]
  G.rule = function (s, ctx) {
    var st = ctx.stage, pi = 0;
    st.classList.add("tj-stage");
    var title = el("div", "ask tj-title"), scene = el("div", "tj-scene glass"), cap = el("div", "tj-cap"), row = el("div", "row tj-row");
    var hear = el("button", "btn ghost small", HJ.ic("speaker") + " " + esc(t("tjHear"))), again = el("button", "btn ghost small", HJ.ic("replay") + " " + esc(t("tjAgain"))),
      next = el("button", "btn big", esc(t("next")) + " " + HJ.ic("next"));
    st.appendChild(title); st.appendChild(scene); st.appendChild(cap); row.appendChild(again); row.appendChild(hear); st.appendChild(row); st.appendChild(next);
    var dots = el("div", "tj-dots", s.pages.map(function () { return "<i></i>"; }).join("")); st.appendChild(dots);
    ctx.mo(null);
    function show() {
      var pg = s.pages[pi], col = COL[pg.rule] || ["#FFD43B", "#F59F00"];
      [].forEach.call(dots.children, function (d, i) { d.classList.toggle("on", i <= pi); });
      title.textContent = pg.title ? tr(pg.title) : (pg.rule && NAME[pg.rule] ? tr(NAME[pg.rule]) : "");
      scene.className = "tj-scene glass sc-" + pg.scene; scene.innerHTML = "";
      scene.style.setProperty("--tc1", col[0]); scene.style.setProperty("--tc2", col[1]);
      // right to left, as Arabic reads: Nuni on the right, the friend on the left
      var nuni = el("div", "tj-nuni " + (pg.who === "mim" ? "mim" : ""), nuniSvg(pg.who === "mim" ? "mim" : "nun"));
      scene.appendChild(nuni);
      if (pg.friend) {
        var f = friendEl(pg.friend, col); scene.appendChild(f);
        // merging: the friend letter takes a shaddah as Nuni goes into it (مّ)
        if (pg.scene === "merge") { var sh2 = el("span", "ar tj-fs", esc(pg.friend + "\u0651")); f.appendChild(sh2); f.classList.add("merging"); }
      }
      if (pg.scene === "hide") scene.appendChild(el("div", "tj-cloud"));
      if (pg.scene === "merge" || pg.scene === "hide" || pg.scene === "turn") scene.appendChild(el("div", "tj-hum", "n n n"));
      if (pg.scene === "turn") scene.appendChild(el("div", "tj-turn ar", "م"));
      if (pg.scene === "clear") scene.appendChild(el("div", "tj-spark", "n!"));
      if (pg.scene === "tanwin") { scene.innerHTML = ""; scene.appendChild(el("div", "tj-tanwin", '<span class="ar">بٌ</span><b>=</b><span class="ar">بُ</span><span class="ar tj-n">نْ</span>')); }
      if (pg.scene === "stretch") { scene.innerHTML = ""; scene.appendChild(el("div", "tj-stretch", '<span class="ar">' + esc(pg.word || "بَا") + '</span><i class="tj-band"></i><span class="tj-beats">' + new Array((pg.beats || 2) + 1).join("<b></b>") + "</span>")); }
      if (pg.scene === "groups") { scene.innerHTML = ""; var gw = el("div", "tj-groups"); (pg.groups || []).forEach(function (g2) { var c2 = COL[g2] || col; gw.appendChild(el("div", "tj-grp", "<b>" + esc(tr(NAME[g2])) + '</b><span class="ar">' + esc(GROUPS[g2].join(" ")) + "</span>")).style.background = "linear-gradient(160deg," + c2[0] + "," + c2[1] + ")"; }); scene.appendChild(gw); }
      cap.textContent = tr(pg.say);
      hear.style.display = pg.ex ? "" : "none";
      next.innerHTML = esc(pi < s.pages.length - 1 ? t("next") : t("tjGotIt")) + " " + HJ.ic(pi < s.pages.length - 1 ? "next" : "check");
      A.talk(voiceOf(tr(pg.say), HJ.store.get().lang), HJ.store.get().lang);
    }
    hear.onclick = function () {
      var pg = s.pages[pi]; if (!pg.ex) return; A.unlock();
      var box = scene.querySelector(".tj-ex") || scene.appendChild(el("div", "tj-ex")); box.innerHTML = ""; box.appendChild(HJ.arEl(pg.ex));
      A.say(pg.ex.au);
    };
    again.onclick = function () { A.fx.tap(); show(); };
    next.onclick = function () {
      A.unlock(); A.fx.tap();
      if (pi < s.pages.length - 1) { pi++; show(); }
      else { ctx.good(true); ctx.next(); }
    };
    show();
  };

  /* ---------- 2. find the friends: tap every letter that triggers the rule ---------- */
  // s: { rule, pool: [letters shown], say: T() }
  G.friends = function (s, ctx) {
    var st = ctx.stage, need = s.pool.filter(function (c) { return GROUPS[s.rule].indexOf(c) >= 0; }), got = 0, col = COL[s.rule];
    st.appendChild(el("div", "ask", esc(tr(s.say))));
    var who = el("div", "tj-who"); who.appendChild(el("div", "tj-nuni sm " + (/syafawi|mimi/.test(s.rule) ? "mim" : ""), nuniSvg(/syafawi|mimi/.test(s.rule) ? "mim" : "nun")));
    who.appendChild(el("div", "tj-who-t", "<b>" + esc(tr(NAME[s.rule])) + '</b><span class="tj-cnt">0 / ' + need.length + "</span>"));
    st.appendChild(who);
    var grid = el("div", "tj-grid"), hint = el("div", "tj-hint"), misses = 0;
    U.shuffle(s.pool).forEach(function (ch) {
      var b = el("button", "tj-letter", '<span class="ar">' + esc(ch) + "</span>"); b.setAttribute("aria-label", nameOf(ch));
      b.onclick = function () {
        A.unlock(); if (b.classList.contains("yes")) return;
        if (need.indexOf(ch) >= 0) {
          b.classList.add("yes"); b.style.background = "linear-gradient(160deg," + col[0] + "," + col[1] + ")"; got++;
          who.querySelector(".tj-cnt").textContent = got + " / " + need.length; A.fx.good(); sayName(ch); HJ.juice.bump(b);
          if (got >= need.length) { ctx.good(); setTimeout(function () { if (ctx.alive()) ctx.next(); }, 1300); }
        } else {
          b.classList.remove("no"); void b.offsetWidth; b.classList.add("no"); misses++; A.fx.bad();
          hint.textContent = t("tjNotFriend", { c: ch, r: tr(NAME[s.rule]) }); hint.classList.add("on");
          if (misses >= 3) grid.querySelectorAll(".tj-letter").forEach(function (x) { if (need.indexOf(x.textContent) >= 0 && !x.classList.contains("yes")) x.classList.add("hint"); });
        }
      };
      grid.appendChild(b);
    });
    st.appendChild(grid); st.appendChild(hint);
    ctx.mo("pose-08", tr(s.say));
  };

  /* ---------- 3. detective: نْ (or tanwin / مْ) + the next letter → which rule? ---------- */
  // s: { items: [Q fragments with .hl and .b], rules: [keys], kind: "nun"|"mim" }
  function clusters(str) { var out = []; String(str).replace(/\s+/g, "").replace(/([ء-يٱ])([ً-ٰٟ]*)/g, function (m) { out.push(m); return ""; }); return out; }
  G.spot = function (s, ctx) {
    var st = ctx.stage, ri = 0, wrong = 0;
    var ask = el("div", "ask"), card = el("button", "bigcard glass qq tj-verse"), eq = el("div", "tj-eq"), choices = el("div", "tj-choices"), why = el("div", "tj-why");
    st.appendChild(ask); st.appendChild(card); st.appendChild(eq); st.appendChild(choices); st.appendChild(why);
    var dots = el("div", "tj-dots", s.items.map(function () { return "<i></i>"; }).join("")); st.appendChild(dots);
    function round() {
      var it = s.items[ri], cl = clusters(it.hl || ""), a = cl[0] || "", b = cl[1] || ""; wrong = 0;
      [].forEach.call(dots.children, function (d, i) { d.classList.toggle("on", i < ri); d.classList.toggle("cur", i === ri); });
      ask.textContent = t(s.kind === "mim" ? "tjSpotMim" : "tjSpot");
      card.innerHTML = ""; card.appendChild(HJ.arEl(it)); card.appendChild(el("span", "tap", HJ.ic("speaker")));
      card.onclick = function () { A.unlock(); A.say(it.au); };
      // the two letters that decide it, right to left: the nun / tanwin / mim, then the letter after it
      eq.innerHTML = ""; eq.classList.remove("done");
      eq.appendChild(el("span", "tj-tile a ar", esc(a))); eq.appendChild(el("b", "", "+")); eq.appendChild(el("span", "tj-tile b ar", esc(b))); eq.appendChild(el("b", "", "=")); eq.appendChild(el("span", "tj-tile q", "?"));
      why.textContent = ""; why.className = "tj-why";
      choices.innerHTML = "";
      s.rules.forEach(function (k) {
        var col = COL[k], c = el("button", "tj-choice", "<b>" + esc(tr(NAME[k])) + "</b><small>" + esc(tr(DOES[k] || T("", ""))) + "</small>");
        c.style.background = "linear-gradient(160deg," + col[0] + "," + col[1] + ")";
        c.onclick = function () {
          A.unlock(); if (eq.classList.contains("done")) return;
          if (k === it.b) {
            eq.classList.add("done"); var q = eq.querySelector(".q"); q.textContent = tr(NAME[k]); q.style.background = "linear-gradient(160deg," + col[0] + "," + col[1] + ")";
            why.innerHTML = esc(t("tjWhy", { c: b.replace(/[ً-ٰٟ]/g, ""), r: tr(NAME[k]), d: tr(DOES[k] || T("", "")) })); why.className = "tj-why on";
            ctx.good(true); A.fx.good(); HJ.juice.bump(c); A.say(it.au);
            ri++; setTimeout(function () { if (!ctx.alive()) return; if (ri >= s.items.length) { A.fx.win(); ctx.next(); } else round(); }, 2600);
          } else {
            c.classList.remove("no"); void c.offsetWidth; c.classList.add("no"); A.fx.bad(); wrong++;
            why.innerHTML = esc(t("tjLook", { c: b.replace(/[ً-ٰٟ]/g, "") })); why.className = "tj-why on soft";
            eq.querySelector(".b").classList.remove("pulse"); void eq.offsetWidth; eq.querySelector(".b").classList.add("pulse");
            if (wrong >= 2) [].forEach.call(choices.children, function (x, i) { x.classList.toggle("hint", s.rules[i] === it.b); });
          }
        };
        choices.appendChild(c);
      });
      setTimeout(function () { if (ctx.alive()) A.say(it.au); }, 400);
    }
    ctx.mo(null);
    round();
  };

  /* ---------- 4. hold to hum (ghunnah) / hold to stretch (mad) ---------- */
  // s: { beats: 2 | [4,5], word: "…" (shown), mode: "hum"|"mad", times: 3 }
  var hum = null;
  function humOn(mode) {
    var c = A.ac(); if (!c || (HJ.store.get().settings || {}).sfx === false) return;
    var o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
    o.type = "triangle"; o.frequency.value = mode === "mad" ? 262 : 196; o2.type = "sine"; o2.frequency.value = 5; var g2 = c.createGain(); g2.gain.value = 4; o2.connect(g2); g2.connect(o.frequency);
    f.type = "lowpass"; f.frequency.value = mode === "mad" ? 1400 : 700; g.gain.value = 0.0001; o.connect(f); f.connect(g); g.connect(c.destination);
    o.start(); o2.start(); g.gain.setTargetAtTime(.12, c.currentTime, .05); hum = { o: o, o2: o2, g: g, c: c };
  }
  function humOff() { if (!hum) return; var h = hum; hum = null; h.g.gain.setTargetAtTime(.0001, h.c.currentTime, .04); setTimeout(function () { try { h.o.stop(); h.o2.stop(); } catch (e) {} }, 200); }
  G.hold = function (s, ctx) {
    var st = ctx.stage, BEAT = 520, ok = 0, rounds = s.times || 3, want = [].concat(s.beats), max = Math.max.apply(null, want);
    st.appendChild(el("div", "ask", esc(tr(s.say))));
    if (s.word) { var wc = el("button", "bigcard glass " + (s.word.quran ? "qq" : "wordy")); wc.appendChild(HJ.arEl(s.word)); wc.appendChild(el("span", "tap", HJ.ic("speaker"))); wc.onclick = function () { A.unlock(); A.say(s.word.au); }; st.appendChild(wc); }
    var meter = el("div", "tj-meter"), beats = [];
    for (var i = 0; i < max + 1; i++) { var bt = el("i", want.indexOf(i + 1) >= 0 ? "goal" : ""); beats.push(bt); meter.appendChild(bt); }
    st.appendChild(meter);
    var btn = el("button", "tj-hold", '<span class="tj-hold-ic">' + (s.mode === "mad" ? "〰" : "n") + "</span><b>" + esc(t(s.mode === "mad" ? "tjHoldMad" : "tjHoldHum")) + "</b>");
    var res = el("div", "tj-why"), stars = el("div", "tj-dots", new Array(rounds + 1).join("<i></i>"));
    st.appendChild(btn); st.appendChild(res); st.appendChild(stars);
    var t0 = 0, timer = 0, n = 0, down = false;
    function paint() { beats.forEach(function (b, i) { b.classList.toggle("on", i < n); }); }
    function start(e) {
      if (e) e.preventDefault(); if (down || ok >= rounds) return; A.unlock(); down = true; n = 0; paint(); t0 = performance.now(); btn.classList.add("on"); humOn(s.mode);
      (function tick() { if (!down) return; var k = Math.min(max + 1, Math.floor((performance.now() - t0) / BEAT) + 1); if (k !== n) { n = k; paint(); A.fx.step && A.fx.step(); } timer = requestAnimationFrame(tick); })();
    }
    function end(e) {
      if (!down) return; down = false; cancelAnimationFrame(timer); humOff(); btn.classList.remove("on");
      var got = Math.round((performance.now() - t0) / BEAT);
      if (want.indexOf(got) >= 0 || (got >= Math.min.apply(null, want) && got <= max)) {
        ok++; [].forEach.call(stars.children, function (x, i) { x.classList.toggle("on", i < ok); });
        res.textContent = t("tjHoldOk", { n: got }); res.className = "tj-why on"; A.fx.good(); ctx.good(true); HJ.juice.bump(btn);
        if (ok >= rounds) setTimeout(function () { if (ctx.alive()) { A.fx.win(); ctx.next(); } }, 1100);
      } else {
        res.textContent = t(got < Math.min.apply(null, want) ? "tjHoldMore" : "tjHoldLess", { n: want.join("–") }); res.className = "tj-why on soft"; A.fx.bad();
      }
      setTimeout(function () { n = 0; paint(); }, 900);
    }
    btn.addEventListener("pointerdown", start); btn.addEventListener("pointerup", end); btn.addEventListener("pointercancel", end); btn.addEventListener("pointerleave", end);
    ["touchstart", "touchmove"].forEach(function (k) { btn.addEventListener(k, function (e) { if (e.cancelable) e.preventDefault(); }, { passive: false }); });
    ctx.mo("pose-08", tr(s.say));
  };
  // a step that is left mid-hum must not keep humming
  var _stop = A.stop; A.stop = function () { humOff(); return _stop.apply(this, arguments); };
})();
