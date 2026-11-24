/* Baby Mo Hijaiyah — "Feed the Tajwid Monsters!" (replaces the plain sorting boxes) and the Reading Stage (tashih).
   Monsters: every tajwid rule is a little creature with its own colour and belly symbol. A verse piece floats in
   like a cookie (the letters that decide the rule glow); the child feeds it to the right monster. Right: the
   monster chomps, its eyes go happy, its counter goes up. Wrong: that monster shakes its head and tells its own
   rule ("I'm Iqlab: nun meets ب"), so a mistake still teaches; after two misses the right monster wiggles.
   Monsters' eyes follow the cookie. */
(function () {
  var A = HJ.audio, t = HJ.t, tr = HJ.tr, el = HJ.el, esc = HJ.esc, U = HJ.util;
  var T = function (id, en) { return { id: id, en: en }; };
  // the look and the "who am I" line of every rule
  var RULES = {
    izhar: { art: "sun", c: ["#FFE27A", "#FFAA00"], hint: T("Aku Izhar: nun mati/tanwin bertemu ء ه ع ح غ خ → dibaca JELAS", "I'm Izhar: n before ء ه ع ح غ خ → say it CLEARLY") },
    idgham: { art: "link", c: ["#7CC8FF", "#2B7BE4"], hint: T("Aku Idgham: bertemu ي ن م و ل ر → nun MASUK ke huruf berikutnya", "I'm Idgham: before ي ن م و ل ر → the n MERGES in") },
    iqlab: { art: "repeat", c: ["#5BE38A", "#12A15A"], hint: T("Aku Iqlab: bertemu ب → nun BERUBAH jadi m", "I'm Iqlab: before ب → the n TURNS INTO m") },
    ikhfa: { art: "moon", c: ["#C9A7FF", "#7C3AED"], hint: T("Aku Ikhfa: bertemu huruf lainnya → nun SAMAR sambil berdengung", "I'm Ikhfa: before the other letters → the n is HIDDEN, humming") },
    "ikhfa-syafawi": { art: "moon", c: ["#C9A7FF", "#7C3AED"], hint: T("Aku Ikhfa Syafawi: مْ bertemu ب → samar", "I'm Ikhfa Syafawi: مْ before ب → hidden") },
    "idgham-mimi": { art: "link", c: ["#7CC8FF", "#2B7BE4"], hint: T("Aku Idgham Mimi: مْ bertemu م → masuk", "I'm Idgham Mimi: مْ before م → merges") },
    "izhar-syafawi": { art: "sun", c: ["#FFE27A", "#FFAA00"], hint: T("Aku Izhar Syafawi: مْ bertemu huruf lain → jelas", "I'm Izhar Syafawi: مْ before other letters → clear") },
    qamariyah: { art: "moon", c: ["#9FB4FF", "#4F46E5"], hint: T("Aku Bulan: lam-nya dibaca jelas — al-qomar", "I'm the Moon: the lam is said clearly — al-qamar") },
    syamsiyah: { art: "sun", c: ["#FFC27A", "#F97316"], hint: T("Aku Matahari: lam-nya hilang, huruf berikutnya ditasydid — asy-syams", "I'm the Sun: the lam is silent, the next letter doubles — ash-shams") },
    tafkhim: { art: "balloon", c: ["#FF9DBA", "#E11D48"], hint: T("Aku Tebal: sebelumnya a / u → Allah dibaca tebal", "I'm Full: after a / u → Allah is read full") },
    tarqiq: { art: "sparkle", c: ["#B9F6E6", "#14B8A6"], hint: T("Aku Tipis: sebelumnya i → dibaca tipis", "I'm Light: after i → read light") },
    "mad-wajib": { art: "flame", c: ["#FFC27A", "#EA580C"], hint: T("Aku Mad Wajib: mad dan hamzah di SATU kata → panjang", "I'm Mad Wajib: long vowel + hamzah in ONE word → long") },
    "mad-jaiz": { art: "wave", c: ["#5EEAD4", "#0F766E"], hint: T("Aku Mad Jaiz: hamzah ada di kata BERIKUTNYA", "I'm Mad Jaiz: the hamzah is in the NEXT word") }
  };
  var SHAPES = ["M50 8 C78 8 92 30 92 56 C92 84 74 96 50 96 C26 96 8 84 8 56 C8 30 22 8 50 8z",
    "M50 6 C70 6 94 22 92 52 C90 82 76 96 50 96 C24 96 10 82 8 52 C6 22 30 6 50 6z",
    "M50 10 C84 4 96 34 92 60 C88 88 70 96 50 96 C30 96 12 88 8 60 C4 34 16 4 50 10z",
    "M50 8 C76 10 94 28 94 54 C94 86 72 96 50 96 C28 96 6 86 6 54 C6 28 24 6 50 8z"];
  var uid = 0;
  function monsterSvg(rule, i) {
    var R = RULES[rule] || { c: ["#ddd", "#999"] }, u = "mg" + (++uid), sh = SHAPES[i % SHAPES.length];
    var horns = i % 2 ? '<path d="M28 18 L22 2 L38 14z M72 18 L78 2 L62 14z" fill="' + R.c[1] + '"/>' : '<circle cx="50" cy="4" r="6" fill="' + R.c[0] + '"/><path d="M50 8v8" stroke="' + R.c[1] + '" stroke-width="4"/>';
    return '<svg class="mon-svg" viewBox="0 0 100 104"><defs><radialGradient id="' + u + '" cx=".35" cy=".25" r=".9"><stop offset="0" stop-color="' + R.c[0] + '"/><stop offset="1" stop-color="' + R.c[1] + '"/></radialGradient></defs>' +
      horns + '<path d="' + sh + '" fill="url(#' + u + ')"/><ellipse cx="34" cy="30" rx="14" ry="7" fill="#fff" opacity=".35"/>' +
      '<g class="eyes"><circle cx="35" cy="40" r="11" fill="#fff"/><circle cx="65" cy="40" r="11" fill="#fff"/><circle class="pu" cx="35" cy="41" r="5.5" fill="#1D2433"/><circle class="pu" cx="65" cy="41" r="5.5" fill="#1D2433"/>' +
      '<circle class="gl" cx="37" cy="38" r="1.8" fill="#fff"/><circle class="gl" cx="67" cy="38" r="1.8" fill="#fff"/></g>' +
      '<path class="happy" d="M26 41 Q35 31 44 41 M56 41 Q65 31 74 41" stroke="#1D2433" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<path class="mouth" d="M36 60 Q50 72 64 60" stroke="#1D2433" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<ellipse class="open" cx="50" cy="64" rx="15" ry="11" fill="#3B1020"/><ellipse class="open" cx="50" cy="69" rx="8" ry="4" fill="#FF6B8A"/>' +
      '<circle cx="22" cy="54" r="5" fill="#FF8FB1" opacity=".55"/><circle cx="78" cy="54" r="5" fill="#FF8FB1" opacity=".55"/></svg>';
  }

  HJ.games.sort = function (s, ctx) {
    var st = ctx.stage, i = 0, misses = 0, fed = {};
    st.classList.add("mon-stage");
    st.appendChild(el("div", "ask", esc(t("feed"))));
    var cookieWrap = el("div", "cookie-wrap"), hint = el("div", "mon-hint");
    st.appendChild(cookieWrap); st.appendChild(hint);
    var grid = el("div", "mon-grid n" + s.buckets.length), mons = s.buckets.map(function (b, bi) {
      var R = RULES[b.k] || {}, m = el("button", "mon");
      m.innerHTML = '<span class="mon-body">' + monsterSvg(b.k, bi) + '<span class="belly">' + (R.art ? HJ.art(R.art, 30) : "") + "</span>" +
        '<span class="mon-n">0</span><span class="mon-say"></span></span><span class="mon-name">' + esc(tr(b.label)) + "</span>";
      m.dataset.k = b.k; fed[b.k] = 0; grid.appendChild(m); return m;
    });
    st.appendChild(grid);
    ctx.mo(null);
    // the monsters' eyes follow the cookie
    function look() {
      var c = cookieWrap.querySelector(".cookie"); if (!c) return; var cr = c.getBoundingClientRect(), cx = cr.left + cr.width / 2, cy = cr.top + cr.height / 2;
      mons.forEach(function (m) { var r = m.getBoundingClientRect(), dx = cx - (r.left + r.width / 2), dy = cy - (r.top + r.height * .4), d = Math.hypot(dx, dy) || 1;
        [].forEach.call(m.querySelectorAll(".pu,.gl"), function (p) { p.style.transform = "translate(" + (dx / d * 4) + "px," + (dy / d * 4) + "px)"; }); });
    }
    function show() {
      var it = s.items[i]; misses = 0; hint.textContent = ""; hint.className = "mon-hint";
      cookieWrap.innerHTML = "";
      var c = el("button", "cookie " + (it.quran ? "q" : "")); c.appendChild(HJ.arEl(it));
      if (HJ.store.get().settings.latin && it.tr) c.appendChild(el("div", "lat", esc(HJ.latinFor(it.tr, HJ.store.get().lang))));
      c.appendChild(el("span", "tap", HJ.ic("speaker")));
      c.onclick = function () { A.say(it.au); };
      cookieWrap.appendChild(c);
      cookieWrap.appendChild(el("div", "cookie-dots", s.items.map(function (x, j) { return '<i class="' + (j < i ? "on" : j === i ? "cur" : "") + '"></i>'; }).join("")));
      setTimeout(look, 60); A.say(it.au);
      var locked = false;
      mons.forEach(function (m) {
        m.classList.remove("hintme", "no");
        m.onclick = function () {
          if (locked) return;
          var k = m.dataset.k;
          if (k === it.b) {
            locked = true; feed(c, m, function () {
              fed[k]++; m.querySelector(".mon-n").textContent = fed[k]; m.classList.add("show-n");
              ctx.good(true); var r = m.getBoundingClientRect(); HJ.juice.burst(r.left + r.width / 2, r.top + r.height * .45, 12);
              say(m, t("yum")); i++;
              if (i >= s.items.length) { setTimeout(function () { if (!ctx.alive()) return; grid.classList.add("party"); HJ.juice.banner(HJ.art("trophy", 46) + "<b>" + esc(t("allFed")) + "</b>", "big"); A.fx.win(); }, 500); setTimeout(function () { if (ctx.alive()) ctx.next(); }, 2200); }
              else setTimeout(function () { if (ctx.alive()) show(); }, 700);
            });
          } else {
            misses++; m.classList.remove("no"); void m.offsetWidth; m.classList.add("no"); c.classList.add("wobble"); setTimeout(function () { c.classList.remove("wobble"); }, 500);
            say(m, t("notMe")); hint.innerHTML = esc(tr((RULES[k] || {}).hint || "")); hint.className = "mon-hint on";
            ctx.bad(false, null, null); ctx.mo(null);            // the monsters do the talking here
            if (misses >= 2) mons.forEach(function (x) { x.classList.toggle("hintme", x.dataset.k === it.b); });
          }
        };
      });
    }
    function say(m, txt) { var b = m.querySelector(".mon-say"); b.textContent = txt; b.classList.remove("on"); void b.offsetWidth; b.classList.add("on"); }
    // the cookie flies into the monster's mouth, the monster chomps
    function feed(c, m, done) {
      var a = c.getBoundingClientRect(), b = m.querySelector(".mon-body").getBoundingClientRect();
      m.classList.add("open"); A.fx.whoosh();
      c.style.transition = "transform .45s cubic-bezier(.5,-0.3,.7,1), opacity .45s"; c.style.transform = "translate(" + (b.left + b.width / 2 - (a.left + a.width / 2)) + "px," + (b.top + b.height * .62 - (a.top + a.height / 2)) + "px) scale(.15) rotate(25deg)"; c.style.opacity = ".2";
      setTimeout(function () { m.classList.remove("open"); m.classList.add("chomp"); A.fx.pop(); setTimeout(function () { A.fx.pop(); }, 160); setTimeout(function () { m.classList.remove("chomp"); }, 700); done(); }, 450);
    }
    show();
  };

  /* ---------- Reading Stage (tashih): pick a card, read it to Mo, get stars; a grown-up confirms ---------- */
  HJ.games.tashih = function (s, ctx) {
    var st = ctx.stage, cur = 0, got = {};
    st.classList.add("rs-stage");
    var top = el("div", "rs-top"); top.appendChild(HJ.moImg("pose-12", "86px")); top.appendChild(el("div", "", "<b>" + esc(t("stage")) + "</b><small>" + esc(tr(s.say)) + " " + esc(t("stageHint")) + "</small>"));
    st.appendChild(top);
    var spot = el("div", "rs-spot"), cards = el("div", "rs-cards");
    st.appendChild(spot); st.appendChild(cards);
    var PAL = [["#FFE7A3", "#FFC94D"], ["#C9F2DD", "#5BE38A"], ["#D6E8FF", "#7CC8FF"], ["#FFD6E3", "#FF8FB1"], ["#E9DDFF", "#C9A7FF"], ["#D2F7F1", "#5EEAD4"]];
    var cardEls = s.items.map(function (it, i) {
      var c = el("button", "rs-card " + (it.quran ? "q" : "")); c.style.background = "linear-gradient(160deg," + PAL[i % PAL.length][0] + "," + PAL[i % PAL.length][1] + ")";
      c.appendChild(HJ.arEl(it)); c.appendChild(el("span", "rs-st", ""));
      c.onclick = function () { A.fx.tap(); pick(i); };
      cards.appendChild(c); return c;
    });
    function pick(i) {
      cur = i; cardEls.forEach(function (c, j) { c.classList.toggle("on", j === i); });
      var it = s.items[i]; spot.innerHTML = "";
      var big = el("div", "rs-big " + (it.quran ? "q" : "")); big.appendChild(HJ.arEl(it)); spot.appendChild(big);
      var w = HJ.voice.widget({ au: it.au, big: true, onDone: function (stars) {
        got[i] = Math.max(got[i] || 0, stars);
        cardEls[i].querySelector(".rs-st").innerHTML = [0, 1, 2].map(function (k) { return HJ.art(k < got[i] ? "star" : "starOff", 14); }).join("");
        cardEls[i].classList.add("read");
        var next = s.items.findIndex(function (x, j) { return !got[j]; });
        if (next >= 0) setTimeout(function () { if (ctx.alive() && cur === i) pick(next); }, 3600);
      } });
      spot.appendChild(w);
    }
    var row = el("div", "row"), all = el("button", "btn gold", HJ.art("star", 24) + " " + t("allGood")), sk = el("button", "btn ghost small", HJ.ic("skip") + " " + t("skip")), hint = el("button", "btn ghost small", HJ.ic("bulb") + " " + t("hint"));
    hint.onclick = function () { A.say(s.items[cur].au); };
    all.onclick = function () { HJ.gate(function () { HJ.store.get().tashih[ctx.lv.id] = 1; HJ.store.save(); HJ.mission && HJ.mission("tashih"); ctx.cheer(t("great")); A.fx.win(); setTimeout(function () { if (ctx.alive()) ctx.next(); }, 900); }); };
    sk.onclick = function () { ctx.next(); };
    row.appendChild(all); row.appendChild(hint); row.appendChild(sk); st.appendChild(row);
    ctx.mo(null);
    pick(0);
  };
})();
