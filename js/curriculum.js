/* Baby Mo Hijaiyah — the whole path from the first letter to reading Al-Qur'an.
   7 worlds ("jilid"): the Iqra 1–6 order (sound first, one small step per page, read alone right away)
   with Ummi's habits on top (talaqqi: listen → imitate; a little review every day; a "tashih" check by
   Abi/Umi before moving on), then a 7th world of real surahs.
   Each level is a recipe; HJ.buildSteps() turns it into fresh rounds every time it is played. */
(function () {
  var syl = HJ.syl, chain = HJ.chain, BY = HJ.BY, M = HJ.M;

  /* ---------- small helpers ---------- */
  function rnd(n) { return Math.floor(Math.random() * n); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pick(a) { return a[rnd(a.length)]; }
  function uniqBy(a, f) { var s = {}, o = []; a.forEach(function (x) { var k = f(x); if (!s[k]) { s[k] = 1; o.push(x); } }); return o; }
  function W(ar, tr, id, en, extra) { var o = { ar: ar, tr: tr, au: ar, id: id, en: en || id }; for (var k in extra || {}) o[k] = extra[k]; return o; }
  // A Qur'an fragment: must be an exact substring of ayah (s, a) in js/quran.js (tools/check-curriculum.js checks it)
  function Q(ar, s, a, tr, hl, extra) { var o = { ar: ar, tr: tr, au: ar, ref: [s, a], hl: hl, quran: 1 }; for (var k in extra || {}) o[k] = extra[k]; (HJ.QTEXT = HJ.QTEXT || {})[String(ar).normalize("NFC").replace(/\u0640/g, "").replace(/\s+/g, " ").trim()] = HJ.QTEXT[String(ar).normalize("NFC").replace(/\u0640/g, "").replace(/\s+/g, " ").trim()] || [s, a]; return o; }   // remembers its ayah (for the recitation)
  function T(id, en) { return { id: id, en: en || id }; }

  // options for a "listen and choose" round: the answer plus fair distractors (look-alikes first)
  function optionsFor(ans, pool, n, same) {
    n = n || 3;
    var others = pool.filter(function (x) { return x.ar !== ans.ar; });
    if (ans.k && !same) {
      var cz = HJ.cousins(ans.k);
      var tricky = others.filter(function (x) { return cz.indexOf(x.k) >= 0; });
      others = shuffle(tricky).concat(shuffle(others.filter(function (x) { return tricky.indexOf(x) < 0; })));
    } else others = shuffle(others);
    others = uniqBy(others, function (x) { return x.ar; });
    // only letters the child has already met: borrow other letters only when the pool has a single one
    // (the very first level, alif & ba, is a 2-way choice on purpose — it's for meeting the letters, not testing them)
    if (ans.k && ans.v && others.length < 1) {
      var extra = HJ.cousins(ans.k).concat(HJ.L.map(function (l) { return l.k; })).map(function (k) { return syl(k, ans.v); })
        .filter(function (x) { return x.ar !== ans.ar && !others.some(function (o) { return o.ar === x.ar; }); });
      others = others.concat(extra.slice(0, n - 1 - others.length));
    }
    return shuffle([ans].concat(others.slice(0, n - 1)));
  }

  /* ---------- step builders (each returns one step object; games.js draws it) ---------- */
  var S = {
    intro: function (mo, say, show) { return { type: "intro", mo: mo, say: say, show: show }; },
    learn: function (item, note) { return { type: "learn", item: item, note: note }; },
    trace: function (glyph) { return { type: "trace", glyph: glyph }; },
    pick: function (ans, pool, n) { return { type: "pick", q: ans, options: optionsFor(ans, pool, n) }; },
    yesno: function (shown, pool) {
      var same = Math.random() < 0.5, heard = shown;
      if (!same) { var o = optionsFor(shown, pool, 2); heard = o[0].ar === shown.ar ? o[1] : o[0]; if (!heard) heard = shown; }
      return { type: "yesno", item: shown, heard: heard };
    },
    pop: function (target, pool) { return { type: "pop", q: target, pool: optionsFor(target, pool, 5) }; },
    train: function (ch) { return { type: "train", item: ch }; },
    bridge: function (pool, focus, n) {
      var rounds = []; n = n || 4;
      for (var i = 0; i < n; i++) { var a = pick(focus && focus.length && i % 2 === 0 ? focus : pool); rounds.push({ q: a, options: optionsFor(a, pool, 3) }); }
      return { type: "bridge", rounds: rounds };
    },
    match: function (pairs) { return { type: "match", pairs: pairs }; },
    build: function (item) { return { type: "build", item: item }; },
    sort: function (buckets, items, say) { return { type: "sort", buckets: buckets, items: shuffle(items), say: say }; },
    ayah: function (s, a) { return { type: "ayah", s: s, a: a }; },
    ayahbuild: function (s, a) { return { type: "ayahbuild", s: s, a: a }; },
    ayahfill: function (s, a) { return { type: "ayahfill", s: s, a: a }; },
    tashih: function (items, say) { return { type: "tashih", items: items, say: say }; }
  };

  /* ---------- Jilid 1: letters with fathah ---------- */
  var J1_GROUPS = [["alif","ba"],["ta","tsa"],["jim","hha"],["kho","dal"],["dzal","ro"],["zai","sin"],["syin","shod"],
    ["dhod","tho"],["zho","ain"],["ghin","fa"],["qof","kaf"],["lam","mim"],["nun","wau"],["ha","ya"]];

  function lettersUpTo(gi) { var o = []; for (var i = 0; i <= gi; i++) o = o.concat(J1_GROUPS[i]); return o; }
  function fat(keys, v) { return keys.map(function (k) { return syl(k, v || "a"); }); }
  function randChain(pool, len, focus) {
    var parts = [];
    for (var i = 0, g = 0; i < len && g < 50; g++) {
      var x = focus && i % 2 === 0 ? pick(focus) : pick(pool);
      if (parts.length && parts[parts.length - 1].ar === x.ar) continue;
      parts.push(x); i++;
    }
    // never the same syllable three times in a row
    return chain(parts);
  }

  function letterSteps(lv) {
    var newK = lv.letters, poolK = lv.pool, vow = lv.v || "a";
    var nw = fat(newK, vow), pool = fat(poolK.length > 1 ? poolK : newK.concat(["ba", "ta"]), vow);
    var st = [S.intro("pose-41", lv.say || T("Ayo kenalan dengan huruf baru!", "Let's meet new letters!"), nw)];
    nw.forEach(function (it) { st.push(S.learn(it, { name: BY[it.k].n, nameK: it.k })); });
    // 10 steps at most (was 12): short enough for a 4–5 year old's attention, every game type still visits often
    if (!lv.noTrace) st.push(S.trace(BY[newK[0]].seat ? "ا" : BY[newK[0]].c));
    st.push(S.pick(pick(nw), pool));
    // a "play" game in the middle of every level (Feed Mo / bubbles / shadows), so it never feels like a worksheet
    var play = playStep(lv, pool, nw);
    if (pool.length >= 4 && play && levelNo(lv) % 2 === 0) st.push(play); else st.push(S.pop(pick(nw), pool));
    if (pool.length < 4 && play) st.push(play);
    else st.push(S.train(randChain(pool, Math.min(4, 3 + pool.length / 8 | 0), nw)));
    if (!lv.noTrace && newK[1]) st.push(S.trace(BY[newK[1]].c));
    else st.push(S.yesno(pick(nw), pool));
    st.push(S.bridge(pool, nw, 3));
    if (pool.length >= 4) {
      var ps = shuffle(uniqBy(nw.concat(shuffle(pool)), function (x) { return x.ar; })).slice(0, 4);
      st.push(S.match(ps.map(function (x) { return [x, { ar: x.ar, au: x.au, soundOnly: 1 }]; })));   // hear the sound, find the letter
    } else st.push(S.train(randChain(pool, Math.min(5, 3 + pool.length / 8 | 0), nw)));
    return st;
  }

  function levelNo(lv) { return parseInt(String(lv.id).split("-")[1], 10) || 0; }
  function playStep(lv, pool, nw) {
    if (!HJ.toddlerSteps) return null;
    var kinds = pool.length >= 3 ? ["feed", "bubbles", "shadow"] : ["feed", "bubbles"];
    var k = kinds[levelNo(lv) % kinds.length];
    // the new letters come first, so the game practises what was just learned
    var P = uniqBy(shuffle(nw).concat(shuffle(pool)), function (x) { return x.ar; });
    var s = HJ.toddlerSteps(k, P)[0];
    if (s && s.rounds) s.rounds.forEach(function (r, i) { if (i < nw.length && nw[i]) { var q = nw[i]; if (r.options.some(function (o) { return o.ar === q.ar; })) r.q = q; } });
    return s || null;
  }

  function reviewSteps(lv) {
    var pool = (lv.items || fat(lv.pool, lv.v));
    var st = [S.intro("pose-12", lv.say || T("Waktunya mengulang! Baca pelan-pelan ya.", "Review time! Read slowly."))];
    for (var i = 0; i < 2; i++) st.push(S.train(lv.mkChain ? lv.mkChain() : randChain(pool, 4)));
    st.push(S.bridge(pool, null, 5));
    st.push(S.pop(pick(pool), pool));
    st.push(S.pick(pick(pool), pool, 4));
    st.push(S.match(uniqBy(shuffle(pool), function (x) { return x.ar; }).slice(0, 4).map(function (x) { return [x, lv.pairTwin ? lv.pairTwin(x) : { ar: x.ar, au: x.au, soundOnly: 1 }]; })));
    st.push(S.train(lv.mkChain ? lv.mkChain() : randChain(pool, 5)));
    st.push(S.tashih(shuffle(pool).slice(0, 6), T("{k} membaca, Abi/Umi mendengarkan.", "{k} reads, a parent listens.")));
    return st;
  }

  function bossSteps(lv) {
    if (lv.lesson) return lv.lesson();
    var pool = lv.items || fat(lv.pool, lv.v);
    var st = [S.intro("pose-37", T("Ujian Jilid! Ada 3 hati. Hati-hati ya!", "Book test! You have 3 hearts. Be careful!"))];
    for (var i = 0; i < 3; i++) st.push(S.pick(pick(pool), pool, 4));
    st.push(S.yesno(pick(pool), pool));
    st.push(S.train(lv.mkChain ? lv.mkChain() : randChain(pool, pool[0].ar.length > 3 ? 3 : 5)));
    st.push(S.bridge(pool, null, 5));
    if (lv.extra) st = st.concat(lv.extra());
    st.push(S.yesno(pick(pool), pool));
    st.push(S.train(lv.mkChain ? lv.mkChain() : randChain(pool, pool[0].ar.length > 3 ? 3 : 6)));
    st.push(S.tashih(shuffle(pool).slice(0, 8), T("Tashih: {k} membaca, Abi/Umi menilai.", "Reading check: {k} reads, a parent listens.")));
    return st;
  }

  /* ---------- word lists ---------- */
  // Jilid 2: joined letters, fathah only (real words; meanings for the parent)
  function J(ar, tr, id, en) { var o = W(ar, tr, id, en); o.parts = splitSyl(ar); o.au = o.parts.length > 1 ? ar : ar; return o; }
  // split a fully vowelled word into its letter+mark syllables (for building and syllable-by-syllable audio)
  function splitSyl(ar) {
    var out = [], cur = "";
    for (var i = 0; i < ar.length; i++) {
      var ch = ar[i], code = ch.charCodeAt(0);
      var isMark = (code >= 0x064B && code <= 0x0652) || code === 0x0670;
      if (!isMark && cur) {
        // a bare alif / waw / ya after a vowel lengthens it: keep it with the syllable before
        var prevMark = cur[cur.length - 1];
        if ((ch === "ا" && prevMark === M.FATHAH) || (ch === "ي" && prevMark === M.KASRAH) || (ch === "و" && prevMark === M.DHAMMAH) ||
            (ch === "ا" && prevMark === M.FATHATAIN)) { cur += ch; continue; }
        out.push(cur); cur = "";
      }
      cur += ch;
    }
    if (cur) out.push(cur);
    return out;
  }

  var J2W = [
    J("كَتَبَ", "kataba", "menulis", "wrote"), J("ذَهَبَ", "dzahaba", "pergi", "went"), J("جَلَسَ", "jalasa", "duduk", "sat"),
    J("فَتَحَ", "fataḥa", "membuka", "opened"), J("خَلَقَ", "kholaqo", "menciptakan", "created"), J("نَصَرَ", "nashoro", "menolong", "helped"),
    J("أَكَلَ", "akala", "makan", "ate"), J("سَأَلَ", "sa-ala", "bertanya", "asked"), J("رَجَعَ", "roja'a", "kembali", "returned"),
    J("صَدَقَ", "shodaqo", "berkata benar", "told the truth"), J("حَمَلَ", "ḥamala", "membawa", "carried"), J("دَخَلَ", "dakhola", "masuk", "entered"),
    J("خَرَجَ", "khoroja", "keluar", "went out"), J("شَكَرَ", "syakaro", "bersyukur", "gave thanks"), J("صَبَرَ", "shobaro", "bersabar", "was patient"),
    J("غَفَرَ", "ghofaro", "mengampuni", "forgave"), J("وَجَدَ", "wajada", "menemukan", "found"), J("كَسَبَ", "kasaba", "berusaha", "earned"),
    J("حَسَدَ", "ḥasada", "iri", "envied"), J("وَقَبَ", "waqoba", "datang (gelap)", "came (darkness)")
  ];
  var J2MAD = [
    J("قَالَ", "qoola", "berkata", "said"), J("نَامَ", "naama", "tidur", "slept"), J("كَانَ", "kaana", "adalah", "was"),
    J("سَارَ", "saaro", "berjalan", "walked"), J("زَارَ", "zaaro", "berkunjung", "visited"), J("صَامَ", "shooma", "berpuasa", "fasted"),
    J("قَامَ", "qooma", "berdiri", "stood up"), J("خَافَ", "khoofa", "takut", "was afraid"), J("طَارَ", "thooro", "terbang", "flew"),
    J("سَالَ", "saala", "mengalir", "flowed")
  ];
  var J3W = [
    J("كُتِبَ", "kutiba", "ditulis", "was written"), J("سَمِعَ", "sami'a", "mendengar", "heard"), J("عَلِمَ", "'alima", "mengetahui", "knew"),
    J("شَرِبَ", "syariba", "minum", "drank"), J("لَعِبَ", "la'iba", "bermain", "played"), J("رَكِبَ", "rokiba", "naik", "rode"),
    J("حَفِظَ", "ḥafizho", "menghafal", "memorised"), J("فَرِحَ", "fariḥa", "gembira", "was happy"), J("حَسُنَ", "ḥasuna", "menjadi baik", "became good"),
    J("كَبُرَ", "kaburo", "menjadi besar", "grew big"), J("خُلِقَ", "khuliqo", "diciptakan", "was created"), J("رُزِقَ", "ruziqo", "diberi rezeki", "was given provision")
  ];
  var J3MAD = [
    J("قِيلَ", "qiila", "dikatakan", "it was said"), J("يَقُولُ", "yaquulu", "dia berkata", "he says"), J("يَكُونُ", "yakuunu", "menjadi", "becomes"),
    J("فِيهِ", "fiihi", "di dalamnya", "in it"), J("دِينِي", "diinii", "agamaku", "my religion"), J("نُوحِي", "nuuḥii", "Kami wahyukan", "We reveal"),
    J("سُورَةُ", "suurotu", "surat", "surah"), J("جِيدِهَا", "jiidihaa", "lehernya", "her neck")
  ];
  var J4TAN = [
    W("كِتَابٌ", "kitaabun", "buku", "book"), W("بَيْتٌ", "baitun", "rumah", "house"), W("قَلَمٌ", "qolamun", "pena", "pen"),
    W("أَسَدٌ", "asadun", "singa", "lion"), W("سَمَكٌ", "samakun", "ikan", "fish"), W("قَمَرٌ", "qomarun", "bulan", "moon"),
    W("جَمَلٌ", "jamalun", "unta", "camel"), W("بَابٌ", "baabun", "pintu", "door"), W("فِيلٌ", "fiilun", "gajah", "elephant"),
    W("شَمْسٌ", "syamsun", "matahari", "sun"),
    W("كِتَابًا", "kitaaban", "sebuah buku", "a book"), W("قَلَمًا", "qolaman", "sebuah pena", "a pen"), W("بَيْتًا", "baitan", "sebuah rumah", "a house"),
    W("كِتَابٍ", "kitaabin", "buku", "book"), W("قَلَمٍ", "qolamin", "pena", "pen"), W("بَيْتٍ", "baitin", "rumah", "house")
  ];
  var J4SUK = [
    W("مِنْ", "min", "dari", "from"), W("قُلْ", "qul", "katakanlah", "say"), W("لَمْ", "lam", "tidak", "did not"), W("هَلْ", "hal", "apakah", "is it"),
    W("بَلْ", "bal", "bahkan", "rather"), W("أَنْتَ", "anta", "kamu", "you"), W("قَدْ", "qod", "sungguh", "indeed"), W("مَنْ", "man", "siapa", "who"),
    W("يَعْلَمُ", "ya'lamu", "dia mengetahui", "he knows"), W("أَمْسِ", "amsi", "kemarin", "yesterday"), W("اِجْلِسْ", "ijlis", "duduklah", "sit down"),
    W("يَسْمَعُ", "yasma'u", "dia mendengar", "he hears")
  ];
  var J4QAL = [
    Q("يَدْخُلُونَ", "an-nasr", 2, "yadkhuluuna", "دْ"),
    Q("أَطْعَمَهُمْ", "quraisy", 4, "ath'amahum", "طْ"),
    Q("أَلَمْ يَجْعَلْ", "al-fil", 2, "alam yaj'al", "جْ"),
    Q("لَمْ يَلِدْ وَلَمْ يُولَدْ", "al-ikhlas", 3, "lam yalid wa lam yuulad", "دْ"),
    Q("الْأَبْتَرُ", "al-kautsar", 3, "al-abtar", "بْ"),
    Q("الْفَلَقِ", "al-falaq", 1, "al-falaq (berhenti: al-falaq)", "قِ")
  ];
  var J4LIN = [
    W("بَيْتٌ", "baitun", "rumah", "house"), W("لَيْلٌ", "lailun", "malam", "night"), W("يَوْمٌ", "yaumun", "hari", "day"),
    W("زَيْتٌ", "zaitun", "minyak", "oil"), W("مَوْزٌ", "mauzun", "pisang", "banana"), Q("مِنْ خَوْفٍ", "quraisy", 4, "min khoufin", "وْ"), Q("قُرَيْشٍ", "quraisy", 1, "quroisyin", "يْ"),
    Q("وَالصَّيْفِ", "quraisy", 2, "wash-shoifi", "يْ"), Q("سَوْفَ تَعْلَمُونَ", "at-takatsur", 3, "saufa ta'lamuun", "وْ"),
    Q("يَوْمِ الدِّينِ", "al-fatihah", 4, "yaumid-diin", "وْ"), Q("عَيْنَ الْيَقِينِ", "at-takatsur", 7, "'ainal-yaqiin", "يْ")
  ];
  // Jilid 5 (all from the surahs in js/quran.js, so the text is exact)
  var J5TAS = [
    Q("رَبِّ الْعَالَمِينَ", "al-fatihah", 2, "robbil-'aalamiin", "بِّ"), Q("إِيَّاكَ", "al-fatihah", 5, "iyyaaka", "يَّ"),
    Q("فَسَبِّحْ", "an-nasr", 3, "fa sabbiḥ", "بِّ"), Q("تَوَّابًا", "an-nasr", 3, "tawwaabaa", "وَّ"), Q("كَلَّا", "at-takatsur", 3, "kallaa", "لَّ"),
    Q("وَعَدَّدَهُ", "al-humazah", 2, "wa 'addadah", "دَّ"), Q("فَصَلِّ", "al-kautsar", 2, "fa sholli", "لِّ"), Q("حَتَّىٰ", "at-takatsur", 2, "ḥattaa", "تَّ")
  ];
  var J5GHU = [
    Q("إِنَّا", "al-kautsar", 1, "innaa", "نَّ"), Q("إِنَّ", "al-kautsar", 3, "inna", "نَّ"), Q("النَّاسِ", "an-nas", 1, "an-naas", "نَّ"),
    Q("ثُمَّ", "at-takatsur", 4, "tsumma", "مَّ"), Q("فَأَمَّا", "al-qariah", 6, "fa ammaa", "مَّ"), Q("الْجِنَّةِ", "an-nas", 6, "al-jinnati", "نَّ"),
    Q("الْخَنَّاسِ", "an-nas", 4, "al-khonnaas", "نَّ"), Q("فَأُمُّهُ", "al-qariah", 9, "fa ummuhu", "مُّ")
  ];
  var QAM = "qamariyah", SYM = "syamsiyah";
  var J5AL = [
    Q("الْحَمْدُ", "al-fatihah", 2, "al-ḥamdu", "لْ", { b: QAM }), Q("الْعَالَمِينَ", "al-fatihah", 2, "al-'aalamiin", "لْ", { b: QAM }),
    Q("الْفَلَقِ", "al-falaq", 1, "al-falaq", "لْ", { b: QAM }), Q("الْعَصْرِ", "al-asr", 1, "al-'ashr", "لْ", { b: QAM }),
    Q("الْفِيلِ", "al-fil", 1, "al-fiil", "لْ", { b: QAM }), Q("الْبَيْتِ", "quraisy", 3, "al-baiti", "لْ", { b: QAM }),
    Q("الْكَوْثَرَ", "al-kautsar", 1, "al-kautsar", "لْ", { b: QAM }), Q("الْقَارِعَةُ", "al-qariah", 1, "al-qoori'ah", "لْ", { b: QAM }),
    Q("النَّاسِ", "an-nas", 1, "an-naas", "نَّ", { b: SYM }), Q("الرَّحِيمِ", "al-fatihah", 1, "ar-roḥiim", "رَّ", { b: SYM }),
    Q("الدِّينِ", "al-fatihah", 4, "ad-diin", "دِّ", { b: SYM }), Q("الصَّمَدُ", "al-ikhlas", 2, "ash-shomad", "صَّ", { b: SYM }),
    Q("الصِّرَاطَ", "al-fatihah", 6, "ash-shiroth", "صِّ", { b: SYM }), Q("التَّكَاثُرُ", "at-takatsur", 1, "at-takaatsur", "تَّ", { b: SYM }),
    Q("الضَّالِّينَ", "al-fatihah", 7, "adh-dhoolliin", "ضَّ", { b: SYM }), Q("الشِّتَاءِ", "quraisy", 2, "asy-syitaa-i", "شِّ", { b: SYM })
  ];
  var TAF = "tafkhim", TAR = "tarqiq";
  var J5JAL = [
    Q("قُلْ هُوَ اللَّهُ أَحَدٌ", "al-ikhlas", 1, "qul huwallaahu aḥad", "اللَّهُ", { b: TAF }), Q("اللَّهُ الصَّمَدُ", "al-ikhlas", 2, "allaahush-shomad", "اللَّهُ", { b: TAF }),
    Q("نَصْرُ اللَّهِ", "an-nasr", 1, "nashrullaah", "اللَّهِ", { b: TAF }), Q("نَارُ اللَّهِ", "al-humazah", 6, "naarullaah", "اللَّهِ", { b: TAF }),
    Q("بِسْمِ اللَّهِ", "al-fatihah", 1, "bismillaah", "اللَّهِ", { b: TAR }), Q("الْحَمْدُ لِلَّهِ", "al-fatihah", 2, "alḥamdu lillaah", "لِلَّهِ", { b: TAR }),
    Q("فِي دِينِ اللَّهِ", "an-nasr", 2, "fii diinillaah", "اللَّهِ", { b: TAR })
  ];
  // Waqaf: how the last word sounds when we stop
  var J5WAQ = [
    { full: Q("أَحَدٌ", "al-ikhlas", 1, "aḥadun"), stop: W("أَحَدْ", "aḥad"), wrong: [W("أَحَدَا", "aḥadaa"), W("أَحَدِ", "aḥadi")] },
    { full: Q("الْفَلَقِ", "al-falaq", 1, "al-falaqi"), stop: W("الْفَلَقْ", "al-falaq"), wrong: [W("الْفَلَقَ", "al-falaqo"), W("الْفَلَقُ", "al-falaqu")] },
    { full: Q("الْعَصْرِ", "al-asr", 1, "al-'ashri"), stop: W("الْعَصْرْ", "al-'ashr"), wrong: [W("الْعَصْرَا", "al-'ashroo"), W("الْعَصْرُ", "al-'ashru")] },
    { full: Q("الصَّمَدُ", "al-ikhlas", 2, "ash-shomadu"), stop: W("الصَّمَدْ", "ash-shomad"), wrong: [W("الصَّمَدَ", "ash-shomada"), W("الصَّمَدِي", "ash-shomadii")] },
    { full: Q("الْكَوْثَرَ", "al-kautsar", 1, "al-kautsaro"), stop: W("الْكَوْثَرْ", "al-kautsar"), wrong: [W("الْكَوْثَرِ", "al-kautsari"), W("الْكَوْثَرُو", "al-kautsaruu")] },
    { full: Q("تَوَّابًا", "an-nasr", 3, "tawwaaban"), stop: W("تَوَّابَا", "tawwaabaa"), wrong: [W("تَوَّابْ", "tawwaab"), W("تَوَّابِ", "tawwaabi")] }
  ];
  // Jilid 6: tajwid inside real verses
  var IZ = "izhar", IDG = "idgham", IQL = "iqlab", IKH = "ikhfa";
  var J6NUN = [
    Q("أَنْعَمْتَ", "al-fatihah", 7, "an'amta", "نْعَ", { b: IZ }), Q("حَاسِدٍ إِذَا", "al-falaq", 5, "ḥaasidin idzaa", "دٍ إِ", { b: IZ }),
    Q("كُفُوًا أَحَدٌ", "al-ikhlas", 4, "kufuwan aḥad", "وًا أَ", { b: IZ }), Q("مِنْ خَوْفٍ", "quraisy", 4, "min khouf", "نْ خَ", { b: IZ }),
    Q("نَارٌ حَامِيَةٌ", "al-qariah", 11, "naarun ḥaamiyah", "رٌ حَ", { b: IZ }), Q("يَوْمَئِذٍ عَنِ", "at-takatsur", 8, "yauma-idzin 'anin", "ذٍ عَ", { b: IZ }),
    Q("حَبْلٌ مِنْ مَسَدٍ", "al-lahab", 5, "ḥablum mim masad", "لٌ مِ", { b: IDG }), Q("أَبِي لَهَبٍ وَتَبَّ", "al-lahab", 1, "abii lahabiw wa tabb", "بٍ وَ", { b: IDG }),
    Q("مَالًا وَعَدَّدَهُ", "al-humazah", 2, "maalaw wa 'addadah", "لًا وَ", { b: IDG }), Q("وَيْلٌ لِكُلِّ", "al-humazah", 1, "wailul likulli", "لٌ لِ", { b: IDG }),
    Q("عِيشَةٍ رَاضِيَةٍ", "al-qariah", 7, "'iisyatir roodhiyah", "ةٍ رَ", { b: IDG }), Q("يَكُنْ لَهُ", "al-ikhlas", 4, "yakul lahu", "نْ لَ", { b: IDG }),
    Q("لَيُنْبَذَنَّ", "al-humazah", 4, "layumbadzanna", "نْبَ", { b: IQL }),
    Q("مِنْ شَرِّ", "al-falaq", 2, "min syarri", "نْ شَ", { b: IKH }), Q("أَنْتُمْ", "al-kafirun", 3, "antum", "نْتُ", { b: IKH }),
    Q("مَنْ ثَقُلَتْ", "al-qariah", 6, "man tsaqulat", "نْ ثَ", { b: IKH }), Q("عَنْ صَلَاتِهِمْ", "al-maun", 5, "'an sholaatihim", "نْ صَ", { b: IKH }),
    Q("مِنْ جُوعٍ", "quraisy", 4, "min juu'", "نْ جُ", { b: IKH }), Q("مِنْ سِجِّيلٍ", "al-fil", 4, "min sijjiil", "نْ سِ", { b: IKH })
  ];
  var IKS = "ikhfa-syafawi", IDM = "idgham-mimi", IZS = "izhar-syafawi";
  var J6MIM = [
    Q("تَرْمِيهِمْ بِحِجَارَةٍ", "al-fil", 4, "tarmiihim biḥijaaroh", "مْ بِ", { b: IKS }),
    Q("أَطْعَمَهُمْ مِنْ جُوعٍ", "quraisy", 4, "ath'amahum min juu'", "مْ مِ", { b: IDM }),
    Q("لَكُمْ دِينُكُمْ", "al-kafirun", 6, "lakum diinukum", "مْ دِ", { b: IZS }), Q("عَلَيْهِمْ غَيْرِ", "al-fatihah", 7, "'alaihim ghoiri", "مْ غَ", { b: IZS }),
    Q("أَلَمْ تَرَ", "al-fil", 1, "alam taro", "مْ تَ", { b: IZS }), Q("أَنْعَمْتَ", "al-fatihah", 7, "an'amta", "مْتَ", { b: IZS }),
    Q("هُمْ عَنْ", "al-maun", 5, "hum 'an", "مْ عَ", { b: IZS })
  ];
  var MW = "mad-wajib", MJ = "mad-jaiz";
  var J6MAD = [
    Q("إِذَا جَاءَ", "an-nasr", 1, "idzaa jaa-a", "جَاءَ", { b: MW }), Q("الشِّتَاءِ", "quraisy", 2, "asy-syitaa-i", "تَاءِ", { b: MW }),
    Q("يُرَاءُونَ", "al-maun", 6, "yuroo-uun", "رَاءُ", { b: MW }),
    Q("إِنَّا أَعْطَيْنَاكَ", "al-kautsar", 1, "innaa a'thoinaak", "نَّا أَ", { b: MJ }), Q("قُلْ يَا أَيُّهَا", "al-kafirun", 1, "qul yaa ayyuhaa", "يَا أَ", { b: MJ }),
    Q("وَمَا أَدْرَاكَ", "al-humazah", 5, "wa maa adrooka", "مَا أَ", { b: MJ })
  ];

  function itemsFrom(list) { return list.map(function (x) { return x; }); }
  function wordSteps(lv) {
    var items = lv.items, st = [S.intro(lv.mo || "pose-08", lv.say)];
    if (items[0] && items[0].quran) return quranWordSteps(lv, st);
    var seen = {};
    if (lv.learnFirst) lv.learnFirst.forEach(function (it) { seen[it.ar] = 1; st.push(S.learn(it, it.note)); });
    var nL = lv.nLearn != null ? lv.nLearn : (lv.learnFirst ? 1 : 3);
    shuffle(items).filter(function (it) { return !seen[it.ar]; }).slice(0, nL).forEach(function (it) { st.push(S.learn(it)); });
    st.push(S.pick(pick(items), items));
    if (items[0].parts) st.push(S.build(pick(items.filter(function (x) { return x.parts && x.parts.length >= 2 && x.parts.length <= 5; }))));
    st.push(S.pop(pick(items), items));
    if (items[0].parts) {
      st.push(S.match(shuffle(items).slice(0, 3).map(function (x) { return [{ ar: x.parts.join("  "), au: x.au, tr: x.tr, sep: 1 }, x]; })));
    } else st.push(S.match(shuffle(items).slice(0, 3).map(function (x) { return [x, x]; })));
    st.push(S.bridge(items, null, 4));
    if (items[0].parts) st.push(S.build(pick(items.filter(function (x) { return x.parts && x.parts.length >= 2 && x.parts.length <= 5; }))));
    st.push(S.train(chain(shuffle(items).slice(0, 3))));
    if (lv.sortBy) st.push(S.sort(lv.sortBy, shuffle(items).slice(0, 6), lv.sortSay));
    st.push(S.tashih(shuffle(items).slice(0, 5), T("{k} membaca sendiri, Abi/Umi mendengarkan.", "{k} reads alone, a parent listens.")));
    return st;
  }
  // Qur'an pieces (Books 5–6): hear the real recitation while the piece glows, read it, play with it by sight
  function quranWordSteps(lv, st) {
    var items = lv.items, seen = {};
    (lv.learnFirst || []).forEach(function (it) { seen[it.ar] = 1; st.push(S.learn(it, it.note)); });
    shuffle(items).filter(function (it) { return !seen[it.ar]; }).slice(0, lv.nLearn != null ? lv.nLearn : 3).forEach(function (it) { st.push(S.learn(it)); });
    st.push(S.match(shuffle(items).slice(0, 3).map(function (x) { return [x, x]; })));
    st.push(S.train(chain(shuffle(items).slice(0, 2))));
    if (lv.sortBy) st.push(S.sort(lv.sortBy, shuffle(items).slice(0, 6), lv.sortSay));
    st.push(S.tashih(shuffle(items).slice(0, 5), T("{k} membaca sendiri, Abi/Umi mendengarkan.", "{k} reads alone, a parent listens.")));
    return st;
  }
  function sortSteps(lv) {
    var items = lv.items, st = [S.intro(lv.mo || "idea", lv.say)];
    (lv.explain || []).forEach(function (e) { st.push(S.learn(e.item, e.note)); });
    st.push(S.sort(lv.buckets, shuffle(items).slice(0, Math.min(6, items.length)), lv.sortSay));
    if (!items[0].quran) st.push(S.pick(pick(items), items));
    st.push(S.train(chain(shuffle(items).slice(0, 2))));
    st.push(S.sort(lv.buckets, shuffle(items).slice(0, Math.min(6, items.length)), lv.sortSay));
    if (!items[0].quran) st.push(S.bridge(items, null, 4));
    st.push(S.tashih(shuffle(items).slice(0, 5), T("{k} membaca, Abi/Umi mendengarkan.", "{k} reads, a parent listens.")));
    return st;
  }
  function waqafSteps(lv) {
    var st = [S.intro("pose-15", lv.say)];
    J5WAQ.slice(0, 2).forEach(function (w) { st.push(S.learn(w.stop, { from: w.full })); });
    shuffle(J5WAQ).forEach(function (w) {
      st.push({ type: "pick", q: w.stop, show: w.full, ask: T("Kalau berhenti di sini, bacanya…", "If we stop here, we read…"), options: shuffle([w.stop].concat(w.wrong)) });
    });
    st.push(S.tashih(J5WAQ.map(function (w) { return w.full; }), T("Baca kata ini lalu berhenti dengan benar.", "Read and stop correctly.")));
    return st;
  }
  function surahSteps(lv) {
    var s = HJ.surah(lv.surah), n = s.ayahs.length, st = [S.intro("mo2:hug-quran", lv.say || T("Ayo baca Surat " + s.name.id + "!", "Let's read Surah " + s.name.en + "!"))];
    // listen to two verses, then play with one of them — so he never gets more than two "listen" screens in a row
    s.ayahs.forEach(function (a, i) {
      st.push(S.ayah(s.slug, a.n));
      if (i % 2 === 1) {
        var prev = s.ayahs[i - 1], pickA = [prev, a].filter(function (x) { return x.ar.split(" ").length >= 3; });
        var g = pickA.length ? pickA[rnd(pickA.length)] : a;
        st.push(g.ar.split(" ").length >= 3 && i % 4 === 1 ? S.ayahbuild(s.slug, g.n) : S.ayahfill(s.slug, g.n));
      }
    });
    if (s.ayahs.length % 2 === 1 && s.ayahs.length > 1) { var lastA = s.ayahs[s.ayahs.length - 1]; st.push(lastA.ar.split(" ").length >= 3 ? S.ayahbuild(s.slug, lastA.n) : S.ayahfill(s.slug, lastA.n)); }
    st.push({ type: "surahread", s: s.slug });
    return st;
  }

  /* ---------- the 7 worlds ---------- */
  var worlds = [];
  function world(o) { o.levels = []; worlds.push(o); return o; }
  // ids follow the order on the map; "ins" levels were added later, so the ids levels had before (oldId) can be mapped
  // to the new ones and a child's stars stay on the right level (HJ.store.migrateIds)
  function lvl(w, o) {
    o.w = w.n; o.id = w.n + "-" + (w.levels.length + 1);
    if (!o.ins) { w._o = (w._o || 0) + 1; if (!o.oldId) o.oldId = w.n + "-" + w._o; }
    w.levels.push(o); return o;
  }

  /* Jilid 1 — Pulau Fathah */
  var w1 = world({ n: 1, key: "fathah", emoji: "🏝️", color: "#1FA971", bg: "linear-gradient(180deg,#9BE7C4,#3FBF86)",
    name: T("Pulau Fathah", "Fathah Island"), sub: T("Jilid 1 · 28 huruf berharakat fathah", "Book 1 · 28 letters with fathah"),
    goal: T("Mengenal dan membaca 28 huruf hijaiyah berharakat fathah, satu per satu, tanpa dieja.",
      "Know and read all 28 letters with fathah, one by one, without spelling them out.") });
  J1_GROUPS.forEach(function (g, gi) {
    var nm = g.map(function (k) { return syl(k, "a").ar; }).join("  ");
    lvl(w1, { kind: "letters", letters: g, pool: lettersUpTo(gi), title: nm,
      say: T("Huruf baru: " + g.map(function (k) { return BY[k].id; }).join(" & ") + ". Dengar, lalu tirukan ya!",
        "New letters: " + g.map(function (k) { return BY[k].en; }).join(" & ") + ". Listen, then copy me!") });
    if (gi === 3 || gi === 7 || gi === 10 || gi === 13) lvl(w1, { kind: "review", pool: lettersUpTo(gi), title: T("Ulangan", "Review") });
  });
  lvl(w1, { kind: "boss", pool: lettersUpTo(13), title: T("Ujian Jilid 1", "Book 1 Test") });

  /* Jilid 2 — Hutan Sambung */
  var w2 = world({ n: 2, key: "sambung", emoji: "🌳", color: "#3E9B3A", bg: "linear-gradient(180deg,#C8F0A8,#6CC24A)",
    name: T("Hutan Sambung", "Joining Forest"), sub: T("Jilid 2 · huruf bersambung & mad", "Book 2 · joined letters & long a"),
    goal: T("Membaca huruf yang bersambung (awal, tengah, akhir) dan bacaan panjang 2 ketukan (mad): بَا.",
      "Read joined letters (start, middle, end) and the 2-beat long vowel (mad): بَا.") });
  function joinedChain(keys) {
    return function () {
      var a = []; for (var i = 0; i < 3; i++) { var p = []; var n = 2 + rnd(2); for (var j = 0; j < n; j++) p.push(syl(pick(keys), "a")); a.push(p); }
      var parts = a.map(function (p) { return { ar: p.map(function (x) { return x.ar; }).join(""), tr: p.map(function (x) { return x.tr; }).join(""), au: p.map(function (x) { return x.au; }) }; });
      return { ar: parts.map(function (x) { return x.ar; }).join("   "), tr: parts.map(function (x) { return x.tr; }).join(" - "), au: [].concat.apply([], parts.map(function (x) { return x.au; })), parts: parts };
    };
  }
  var ALLK = HJ.L.map(function (l) { return l.k; });
  // two letters hold hands first, then three
  var J2TWO = [["بَتَ","bata"],["تَبَ","taba"],["نَبَ","naba"],["كَتَ","kata"],["لَمَ","lama"],["سَلَ","sala"],["فَتَ","fata"],["مَعَ","ma'a"],["جَبَ","jaba"],["هَلَ","hala"]]
    .map(function (x) { return J(x[0], x[1]); });
  lvl(w2, { kind: "words", title: "بَتَ", items: J2TWO, mo: "idea", ins: 1,
    say: T("Huruf bisa bergandengan tangan! Bentuknya berubah sedikit, tapi bunyinya sama.", "Letters can hold hands! They change shape a little, but sound the same."),
    learnFirst: [J("بَتَ", "bata"), J("تَبَ", "taba")] });
  lvl(w2, { kind: "words", title: "كَتَبَ", items: J2W.slice(0, 5),
    say: T("Sekarang tiga huruf bergandengan!", "Now three letters hold hands!"),
    learnFirst: [J("كَتَبَ", "kataba", "menulis", "wrote")] });
  lvl(w2, { kind: "words", title: "جَلَسَ", items: J2W.slice(3, 9), say: T("Baca kata bersambung ini ya.", "Read these joined words.") });
  lvl(w2, { kind: "words", title: "صَدَقَ", items: J2W.slice(8, 14), say: T("Huruf tebal: kho, sho, dho, tho, zho, gho, qo, ro.", "Heavy letters: kho, sho, dho, tho, zho, gho, qo, ro.") });
  lvl(w2, { kind: "words", title: "صَبَرَ", items: J2W.slice(13, 20), say: T("Kata-kata yang baik: sabar, syukur, jujur!", "Good words: patient, thankful, truthful!") });
  lvl(w2, { kind: "review", title: T("Ulangan", "Review"), items: J2W, mkChain: joinedChain(ALLK),
    pairTwin: function (x) { return { ar: x.parts.join("  "), au: x.au, tr: x.tr, sep: 1 }; } });
  lvl(w2, { kind: "words", title: "دَرَسَ", items: [J("دَرَسَ", "darosa", "belajar", "studied"), J("وَرَدَ", "warada", "datang", "arrived"),
      J("زَرَعَ", "zaro'a", "menanam", "planted"), J("ذَكَرَ", "dzakaro", "mengingat", "remembered"), J("رَزَقَ", "rozaqo", "memberi rezeki", "provided"), J("وَعَدَ", "wa'ada", "berjanji", "promised")],
    say: T("Huruf ا د ذ ر ز و tidak mau digandeng dari kiri. Lihat jaraknya!", "ا د ذ ر ز و never join to the next letter. Look at the gap!") });
  var MADS = ["ba","ta","sin","nun","mim","lam","kaf","qof","ro","ya"].map(function (k) { return syl(k, "aa"); });
  lvl(w2, { kind: "mad", title: "بَا", items: MADS.concat(fat(["ba","ta","sin","nun","mim","lam","kaf","qof","ro","ya"])),
    say: T("Ada alif setelah fathah? Bacanya panjang 2 ketukan: baa!", "An alif after fathah? Read it long, 2 beats: baa!") });
  lvl(w2, { kind: "words", title: "قَالَ", items: J2MAD, say: T("Kata dengan bacaan panjang (mad).", "Words with a long vowel (mad).") });
  lvl(w2, { kind: "boss", title: T("Ujian Jilid 2", "Book 2 Test"), items: J2W.concat(J2MAD), mkChain: joinedChain(ALLK) });

  /* Jilid 3 — Gunung Kasrah & Dhammah */
  var w3 = world({ n: 3, key: "kasrah", emoji: "⛰️", color: "#3B7DD8", bg: "linear-gradient(180deg,#BFE0FF,#5A9BEA)",
    name: T("Gunung Kasrah-Dhammah", "Kasrah-Dhammah Mountain"), sub: T("Jilid 3 · bunyi i dan u", "Book 3 · i and u sounds"),
    goal: T("Membaca harakat kasrah (i) dan dhammah (u), lalu mad panjang بِي dan بُو.", "Read kasrah (i) and dhammah (u), then the long بِي and بُو.") });
  var KI = ["alif","ba","ta","tsa","jim","hha","kho","dal","dzal","ro","zai","sin","syin","shod"], KI2 = ["dhod","tho","zho","ain","ghin","fa","qof","kaf","lam","mim","nun","wau","ha","ya"];
  lvl(w3, { kind: "letters", letters: ["ba", "ta"], pool: KI, v: "i", noTrace: 1, title: "بِ",
    say: T("Garis di BAWAH huruf namanya kasrah. Bunyinya i: bi, ti!", "A line UNDER the letter is kasrah. It sounds i: bi, ti!") });
  lvl(w3, { kind: "review", pool: KI, v: "i", title: "اِ - صِ" });
  lvl(w3, { kind: "review", pool: KI2, v: "i", title: "ضِ - يِ" });
  lvl(w3, { kind: "letters", letters: ["ba", "ta"], pool: KI, v: "u", noTrace: 1, title: "بُ",
    say: T("Tanda seperti koma kecil di ATAS huruf namanya dhammah. Bunyinya u: bu, tu!", "A little curl ON TOP is dhammah. It sounds u: bu, tu!") });
  lvl(w3, { kind: "review", pool: KI.concat(KI2), v: "u", title: "اُ - يُ" });
  var MIX3 = []; ALLK.forEach(function (k) { ["a","i","u"].forEach(function (v) { MIX3.push(syl(k, v)); }); });
  lvl(w3, { kind: "words", title: "بَ بِ بُ", items: shuffle(MIX3).slice(0, 18), nLearn: 0,
    learnFirst: [syl("ba","a"), syl("ba","i"), syl("ba","u")].map(function (x) { x.note = {}; return x; }),
    say: T("A, i, u! Dengarkan baik-baik, harakat mana yang dibaca?", "A, i, u! Listen carefully — which mark is it?") });
  lvl(w3, { kind: "words", title: "كُتِبَ", items: J3W, say: T("Kata dengan fathah, kasrah dan dhammah.", "Words with fathah, kasrah and dhammah.") });
  var K3M = ["ba","ta","nun","mim","lam","sin","qof","ro"];
  lvl(w3, { kind: "mad", title: "بِي", items: K3M.map(function (k) { return syl(k, "ii"); }).concat(fat(K3M, "i")),
    say: T("Kasrah lalu ya: dibaca panjang 2 ketukan, bii!", "Kasrah then ya: read it long, 2 beats, bii!") });
  lvl(w3, { kind: "mad", title: "بُو", ins: 1, items: K3M.map(function (k) { return syl(k, "uu"); }).concat(K3M.map(function (k) { return syl(k, "ii"); }).slice(0, 4)),
    say: T("Dhammah lalu wau: dibaca panjang 2 ketukan, buu!", "Dhammah then waw: read it long, 2 beats, buu!") });
  lvl(w3, { kind: "words", title: "يَقُولُ", items: J3MAD, say: T("Kata dengan bacaan panjang.", "Words with long vowels.") });
  lvl(w3, { kind: "boss", title: T("Ujian Jilid 3", "Book 3 Test"), items: J3W.concat(J3MAD).concat(shuffle(MIX3).slice(0, 10)) });

  /* Jilid 4 — Lautan Tanwin & Sukun */
  var w4 = world({ n: 4, key: "tanwin", emoji: "🌊", color: "#0EA5B7", bg: "linear-gradient(180deg,#B5F1F7,#2BB8C9)",
    name: T("Lautan Tanwin & Sukun", "Tanwin & Sukun Sea"), sub: T("Jilid 4 · an in un, huruf mati, qalqalah", "Book 4 · an in un, sukun, qalqalah"),
    goal: T("Membaca tanwin (an, in, un), huruf mati (sukun), qalqalah yang memantul, dan bacaan lin (ai, au).",
      "Read tanwin (an, in, un), letters with sukun, bouncing qalqalah and the soft ai / au.") });
  var TANS = ["dal","kaf","ro","mim","lam","ba","ta","sin"].map(function (k) { return syl(k, "un"); });
  lvl(w4, { kind: "mad", title: "بٌ بٍ بًا",
    items: TANS.concat(["ba","ta","nun","mim"].map(function (k) { return syl(k, "an"); })).concat(["ba","ta","nun","mim"].map(function (k) { return syl(k, "in"); })),
    say: T("Harakat dobel namanya tanwin. Bunyinya an, in, un — ada n kecil di akhir!", "Double marks are tanwin: an, in, un — a little n at the end!") });
  lvl(w4, { kind: "words", title: "كِتَابٌ", items: J4TAN, say: T("Benda-benda dengan tanwin!", "Things with tanwin!") });
  var SUKS = ["ba","ta","dal","ro","sin","mim","nun","lam","kaf","qof"].map(function (k) {
    var s = syl("alif", "a"), b = BY[k]; return { ar: s.ar + b.c + M.SUKUN, tr: "a" + b.cons, k: k, au: s.ar + b.c + M.SUKUN };
  });
  lvl(w4, { kind: "mad", title: "أَبْ", items: SUKS,
    say: T("Bulatan kecil di atas huruf namanya sukun. Hurufnya mati: dibaca menempel ke huruf sebelumnya — ab!", "The little circle is sukun: the letter has no vowel and joins the one before — ab!") });
  lvl(w4, { kind: "words", title: "مِنْ قُلْ", items: J4SUK, say: T("Kata pendek dengan huruf mati.", "Short words with sukun.") });
  function sukAfter(base, k) { var b = BY[k]; return { ar: base.ar + b.c + M.SUKUN, tr: base.tr + b.cons, k: k, au: base.ar + b.c + M.SUKUN }; }
  var QALS = ["qof","tho","ba","jim","dal"].map(function (k) { return sukAfter(syl("alif", "a"), k); })
    .concat(["qof","tho","ba","jim","dal"].map(function (k) { return sukAfter(syl("alif", "i"), k); }));
  lvl(w4, { kind: "mad", title: "أَقْ", items: QALS, ins: 1,
    say: T("Huruf ق ط ب ج د kalau mati dibaca memantul: qalqalah! Seperti bola memantul.", "ق ط ب ج د bounce when they have sukun: qalqalah! Like a ball.") });
  lvl(w4, { kind: "words", title: "قَدْ", items: J4QAL,
    say: T("Sekarang cari pantulannya di ayat Al-Qur'an!", "Now find the bounce in real Qur'an verses!") });
  var LINS = ["ba","ta","lam","kho","ain"].map(function (k) { var s = syl(k, "a"); return { ar: s.ar + "ي" + M.SUKUN, tr: s.tr.replace(/[ao]$/, "") + (BY[k].heavy ? "oi" : "ai"), k: k, au: s.ar + "ي" + M.SUKUN }; })
    .concat(["ba","qof","ya","kho","lam"].map(function (k) { var s = syl(k, "a"); return { ar: s.ar + "و" + M.SUKUN, tr: s.tr.replace(/[ao]$/, "") + (BY[k].heavy ? "ou" : "au"), k: k, au: s.ar + "و" + M.SUKUN }; }));
  lvl(w4, { kind: "mad", title: "بَيْ بَوْ", items: LINS, ins: 1, say: T("Fathah lalu wau atau ya mati: dibaca lembut, ai / au.", "Fathah then a still waw or ya: read softly, ai / au.") });
  lvl(w4, { kind: "words", title: "خَوْفٍ", items: J4LIN, say: T("Bacaan lembut ai / au di dalam kata dan ayat.", "The soft ai / au inside words and verses.") });
  lvl(w4, { kind: "boss", title: T("Ujian Jilid 4", "Book 4 Test"), items: J4TAN.concat(J4SUK).concat(J4LIN) });

  /* Jilid 5 — Kota Tasydid */
  var w5 = world({ n: 5, key: "tasydid", emoji: "🏙️", color: "#8B5CF6", bg: "linear-gradient(180deg,#DCCBFF,#9A7AF0)",
    name: T("Kota Tasydid", "Tasydid Town"), sub: T("Jilid 5 · tasydid, ghunnah, alif lam, waqaf", "Book 5 · shaddah, ghunnah, al-, stopping"),
    goal: T("Membaca tasydid, dengung (ghunnah), alif lam qamariyah & syamsiyah, lafaz Allah, dan cara berhenti (waqaf).",
      "Read shaddah, the nasal ghunnah, the two kinds of al-, the word Allah, and how to stop (waqaf).") });
  var TASS = ["ba","ta","dal","ro","sin","lam","kaf","qof"].map(function (k) { var a = syl("alif", "a"), b = BY[k], ar = (a.ar + b.c + M.SHADDA + M.FATHAH).normalize("NFC");
    return { ar: ar, tr: "a" + b.cons + b.cons + (b.heavy ? "o" : "a"), k: k, au: ar }; });
  lvl(w5, { kind: "mad", title: "أَبَّ", items: TASS, ins: 1, say: T("Tanda seperti huruf w kecil namanya tasydid: hurufnya dibaca dua kali, ditekan!", "The little w is shaddah: the letter is doubled, pressed!") });
  lvl(w5, { kind: "words", title: "رَبِّ", items: J5TAS, say: T("Tasydid di dalam ayat Al-Qur'an. Tekan hurufnya!", "Shaddah inside real verses. Press the letter!") });
  lvl(w5, { kind: "words", title: "إِنَّ", items: J5GHU, say: T("نّ dan مّ yang bertasydid dibaca berdengung (ghunnah) 2 ketukan. Nnnn!", "Doubled نّ and مّ hum for 2 beats (ghunnah). Nnnn!") });
  var AL_Q = J5AL.filter(function (x) { return x.b === QAM; }), AL_S = J5AL.filter(function (x) { return x.b === SYM; });
  function alLesson(items, rule, say, page2) {
    return function () {
      return [{ type: "rule", pages: [{ scene: "meet", who: "nun", friend: "ل", rule: rule, title: T("Alif Lam", "Al-"), say: say, ex: items[0] }, page2, { scene: "groups", groups: [QAM, SYM], say: T("14 huruf qamariyah, 14 huruf syamsiyah. Yuk cari teman-temannya!", "14 moon letters, 14 sun letters. Let's find them!") }] },
        { type: "friends", rule: rule, pool: shuffle(rule === QAM ? AL_Q_POOL : AL_S_POOL), say: rule === QAM ? T("Cari huruf-huruf qamariyah (lam dibaca jelas)!", "Find the moon letters (the lam is clear)!") : T("Cari huruf-huruf syamsiyah (lam hilang)!", "Find the sun letters (the lam goes silent)!") }]
        .concat(shuffle(items).slice(0, 3).map(function (it) { return S.learn(it); }))
        .concat([S.match(shuffle(items).slice(0, 3).map(function (x) { return [x, x]; })), S.tashih(shuffle(items).slice(0, 5), T("{k} membaca sendiri, Abi/Umi mendengarkan.", "{k} reads alone, a parent listens."))]);
    };
  }
  var AL_Q_POOL = "ا ب ج ح خ ع ف ق ك ت س ش ر ن".split(" "), AL_S_POOL = "ت س ش ص د ر ن ل ب ج ق ع ه م".split(" ");
  lvl(w5, { kind: "lesson", title: "الْقَمَرُ", items: AL_Q, lesson: alLesson(AL_Q, QAM, T("Alif lam qamariyah: lam-nya dibaca jelas, seperti bulan yang terang. Al-qomar!", "Moon letters: the lam is said clearly, bright like the moon. Al-qamar!"),
    { scene: "clear", who: "nun", friend: "ق", rule: QAM, title: T("Qamariyah", "Moon letters"), say: T("Bertemu ق, lam tetap terdengar.", "Before ق the lam is heard."), ex: AL_Q[7] }) });
  lvl(w5, { kind: "lesson", title: "الشَّمْسُ", items: AL_S, lesson: alLesson(AL_S, SYM, T("Alif lam syamsiyah: lam-nya hilang, seperti bintang yang tertutup cahaya matahari. Asy-syams!", "Sun letters: the lam disappears, like a star in the sunlight. Ash-shams!"),
    { scene: "merge", who: "nun", friend: "ن", rule: SYM, title: T("Syamsiyah", "Sun letters"), say: T("Bertemu ن, lam masuk dan hurufnya ditasydid.", "Before ن the lam merges and the letter doubles."), ex: AL_S[0] }) });
  var BQS = [{ k: QAM, art: "moon", label: T("Qamariyah (lam jelas)", "Moon letters (clear lam)") }, { k: SYM, art: "sun", label: T("Syamsiyah (lam hilang)", "Sun letters (silent lam)") }];
  lvl(w5, { kind: "sort", title: "الْ", items: J5AL, buckets: BQS, say: T("Bulan atau matahari? Kelompokkan!", "Moon or sun? Sort them!") });
  lvl(w5, { kind: "sort", title: "اللَّهُ", items: J5JAL,
    buckets: [{ k: TAF, label: T("Tebal (tafkhim)", "Full (tafkhim)") }, { k: TAR, label: T("Tipis (tarqiq)", "Light (tarqiq)") }],
    say: T("Lafaz Allah dibaca tebal setelah a / u, dan tipis setelah i.", "Allah is read full after a / u, and light after i.") });
  lvl(w5, { kind: "waqaf", title: "أَحَدْ", say: T("Waqaf = berhenti. Di akhir ayat, harakat terakhir dimatikan.", "Waqaf = stopping. At the end of a verse, the last vowel goes still.") });
  lvl(w5, { kind: "boss", title: T("Ujian Jilid 5", "Book 5 Test"), items: J5TAS.concat(J5GHU).concat(J5AL), lesson: function () { return [
    S.intro("pose-37", T("Ujian Kota Tasydid! Bismillah!", "Tasydid Town test! Bismillah!")),
    S.sort(BQS, shuffle(J5AL).slice(0, 6)), S.match(shuffle(J5TAS.concat(J5GHU)).slice(0, 3).map(function (x) { return [x, x]; })),
    S.sort([{ k: TAF, label: T("Tebal (tafkhim)", "Full (tafkhim)") }, { k: TAR, label: T("Tipis (tarqiq)", "Light (tarqiq)") }], shuffle(J5JAL).slice(0, 5)),
    S.train(chain(shuffle(J5TAS).slice(0, 2))), S.tashih(shuffle(J5TAS.concat(J5GHU, J5AL)).slice(0, 8), T("Tashih: {k} membaca, Abi/Umi menilai.", "Reading check: {k} reads, a parent listens."))]; } });

  /* Jilid 6 — Istana Tajwid */
  var w6 = world({ n: 6, key: "tajwid", emoji: "🏰", color: "#E0892B", bg: "linear-gradient(180deg,#FFE0B5,#F2A54A)",
    name: T("Istana Tajwid", "Tajwid Palace"), sub: T("Jilid 6 · hukum nun & mim mati, mad", "Book 6 · nun & mim rules, mad"),
    goal: T("Mengenal hukum nun mati & tanwin (izhar, idgham, iqlab, ikhfa), mim mati, dan mad wajib & jaiz langsung di ayat Al-Qur'an.",
      "Meet the rules of nun sakinah & tanwin (izhar, idgham, iqlab, ikhfa), mim sakinah, and the long mads — inside real verses.") });
  var BNUN = [{ k: IZ, label: T("Izhar (jelas)", "Izhar (clear)") }, { k: IDG, label: T("Idgham (masuk)", "Idgham (merge)") },
    { k: IQL, label: T("Iqlab (jadi m)", "Iqlab (to m)") }, { k: IKH, label: T("Ikhfa (samar)", "Ikhfa (hidden)") }];
  var BMIM = [{ k: IKS, label: T("Ikhfa syafawi (مْ ب)", "Ikhfa syafawi (مْ ب)") }, { k: IDM, label: T("Idgham mimi (مْ م)", "Idgham mimi (مْ م)") }, { k: IZS, label: T("Izhar syafawi (lainnya)", "Izhar syafawi (others)") }];
  var BMAD = [{ k: MW, label: T("Mad wajib (satu kata)", "Mad wajib (same word)") }, { k: MJ, label: T("Mad jaiz (beda kata)", "Mad jaiz (next word)") }];
  var by = function (list, b) { return list.filter(function (x) { return x.b === b; }); };
  var ex = function (list, ar) { return list.filter(function (x) { return x.ar === ar; })[0]; };
  var READ = T("{k} membaca sendiri, Abi/Umi mendengarkan.", "{k} reads alone, a parent listens.");
  var POOL12 = function (rule, others) { return shuffle(GROUPS6[rule]).slice(0, 6).concat(shuffle(others).slice(0, 6)); };
  var GROUPS6 = { izhar: "ء ه ع ح غ خ".split(" "), idgham: "ي ن م و ل ر".split(" "), ikhfa: "ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك".split(" ") };
  function spot(list, n, kind) { return { type: "spot", items: shuffle(list).slice(0, n), rules: kind === "mim" ? [IKS, IDM, IZS] : uniqBy(list, function (x) { return x.b; }).map(function (x) { return x.b; }).sort(function (a, b) { return [IZ, IDG, IQL, IKH].indexOf(a) - [IZ, IDG, IQL, IKH].indexOf(b); }), kind: kind || "nun" }; }
  function hold(beats, word, mode, say) { return { type: "hold", beats: beats, word: word, mode: mode || "hum", say: say, times: 3 }; }
  var HUM2 = T("Tahan tombolnya sambil berdengung “nnn” selama 2 ketukan!", "Hold the button and hum “nnn” for 2 beats!");

  lvl(w6, { kind: "lesson", title: "نْ", lesson: function () { return [
    { type: "rule", pages: [
      { scene: "meet", who: "nun", title: T("Kenalan dengan Nuni!", "Meet Nuni!"), say: T("Ini Nuni, nun mati: huruf nun dengan sukun di atasnya. Nuni tidak punya harakat, jadi bunyinya hanya n.", "This is Nuni, a resting nun: a nun with a sukun on top. Nuni has no vowel, so it just says n.") },
      { scene: "tanwin", title: T("Tanwin juga Nuni", "Tanwin is Nuni too"), say: T("Tanwin, dua harakat kecil di akhir kata, bunyinya juga n: bun sama dengan bu-n. Jadi tanwin juga Nuni!", "Tanwin, the double vowel at the end of a word, also says n: bun is bu-n. So tanwin is Nuni too!") },
      { scene: "meet", who: "nun", friend: "خ", rule: IZ, title: T("Nuni bertemu teman", "Nuni meets a friend"), say: T("Nuni selalu bertemu huruf sesudahnya. Huruf itulah yang menentukan cara membaca Nuni!", "Nuni always meets the letter after it. That letter decides how we read Nuni!"), ex: ex(J6NUN, "مِنْ خَوْفٍ") },
      { scene: "groups", groups: [IZ, IDG, IQL, IKH], title: T("4 cara membaca Nuni", "4 ways to read Nuni"), say: T("Ada empat cara: Izhar jelas, Idgham masuk, Iqlab jadi m, dan Ikhfa samar. Kita pelajari satu per satu!", "There are four ways: Izhar clear, Idgham merge, Iqlab turns into m, and Ikhfa hidden. Let's learn them one by one!") }] }]
    .concat([ex(J6NUN, "مِنْ خَوْفٍ"), ex(J6NUN, "يَكُنْ لَهُ"), ex(J6NUN, "مِنْ شَرِّ")].map(function (it) { return S.learn(it); }))
    .concat([S.tashih(J6NUN.slice(0, 5), READ)]); } });

  lvl(w6, { kind: "lesson", title: "مِنْ خَوْفٍ", lesson: function () { return [
    { type: "rule", pages: [
      { scene: "meet", who: "nun", friend: "خ", rule: IZ, say: T("Nuni bertemu huruf tenggorokan: ء ه ع ح غ خ. Huruf-huruf ini jauh di dalam tenggorokan.", "Nuni meets a throat letter: ء ه ع ح غ خ. These letters live deep in the throat.") },
      { scene: "clear", who: "nun", friend: "خ", rule: IZ, say: T("Karena jauh, Nuni dibaca JELAS, tanpa dengung. Itu namanya Izhar.", "Because they're far away, Nuni is said CLEARLY, no hum. That is Izhar."), ex: ex(J6NUN, "مِنْ خَوْفٍ") },
      { scene: "groups", groups: [IZ], say: T("Ingat enam teman Izhar: hamzah, ha, 'ain, ha, ghain, kha.", "Remember Izhar's six friends: hamzah, ha, 'ayn, ḥa, ghayn, kha.") }] },
    { type: "friends", rule: IZ, pool: POOL12(IZ, "ب ت س ش ك ق ف د ل م".split(" ")), say: T("Cari keenam teman Izhar!", "Find Izhar's six friends!") },
    spot(by(J6NUN, IZ).concat(by(J6NUN, IKH).slice(0, 2)), 5),
    S.learn(ex(J6NUN, "أَنْعَمْتَ")), S.tashih(by(J6NUN, IZ), READ)]; } });

  lvl(w6, { kind: "lesson", title: "مِنْ مَسَدٍ", lesson: function () { return [
    { type: "rule", pages: [
      { scene: "merge", who: "nun", friend: "م", rule: IDG, say: T("Nuni bertemu ي ن م و: Nuni MASUK ke huruf itu sambil berdengung 2 ketukan. Itu Idgham.", "Nuni meets ي ن م و: Nuni MERGES into it, humming for 2 beats. That is Idgham."), ex: ex(J6NUN, "حَبْلٌ مِنْ مَسَدٍ") },
      { scene: "merge", who: "nun", friend: "ل", rule: IDG, say: T("Bertemu ل atau ر, Nuni juga masuk, tapi TANPA dengung.", "Before ل or ر, Nuni merges too, but WITHOUT a hum."), ex: ex(J6NUN, "يَكُنْ لَهُ") },
      { scene: "groups", groups: [IDG], say: T("Enam teman Idgham: ya, nun, mim, wau (berdengung), lam dan ra (tanpa dengung).", "Idgham's six friends: ya, nun, mim, waw (with a hum), lam and ra (no hum).") }] },
    { type: "friends", rule: IDG, pool: POOL12(IDG, "ء ه ع ح ب ت ش ك ق ف".split(" ")), say: T("Cari keenam teman Idgham!", "Find Idgham's six friends!") },
    hold(2, ex(J6NUN, "حَبْلٌ مِنْ مَسَدٍ"), "hum", HUM2),
    spot(by(J6NUN, IDG).concat(by(J6NUN, IZ).slice(0, 2)), 5),
    S.tashih(by(J6NUN, IDG), READ)]; } });

  lvl(w6, { kind: "lesson", title: "لَيُنْبَذَنَّ", lesson: function () { return [
    { type: "rule", pages: [
      { scene: "turn", who: "nun", friend: "ب", rule: IQL, say: T("Nuni bertemu ب: Nuni BERUBAH menjadi bunyi m, sambil berdengung. Itu Iqlab.", "Nuni meets ب: Nuni TURNS INTO an m sound, with a hum. That is Iqlab."), ex: ex(J6NUN, "لَيُنْبَذَنَّ") },
      { scene: "groups", groups: [IQL], say: T("Teman Iqlab cuma satu: ba. Di mushaf ada mim kecil di atas nun sebagai tanda.", "Iqlab has just one friend: ba. In the mushaf a small mim sits on the nun as a sign.") }] },
    hold(2, ex(J6NUN, "لَيُنْبَذَنَّ"), "hum", HUM2),
    spot(by(J6NUN, IQL).concat(by(J6NUN, IZ).slice(0, 2), by(J6NUN, IDG).slice(0, 2)), 5),
    S.learn(ex(J6NUN, "لَيُنْبَذَنَّ")), S.tashih(by(J6NUN, IQL).concat(by(J6NUN, IDG).slice(0, 2)), READ)]; } });

  lvl(w6, { kind: "lesson", title: "مِنْ شَرِّ", lesson: function () { return [
    { type: "rule", pages: [
      { scene: "hide", who: "nun", friend: "ش", rule: IKH, say: T("Nuni bertemu 15 huruf lainnya: Nuni bersembunyi, dibaca SAMAR sambil berdengung. Itu Ikhfa.", "Nuni meets the other 15 letters: Nuni hides, said SOFTLY with a hum. That is Ikhfa."), ex: ex(J6NUN, "مِنْ شَرِّ") },
      { scene: "groups", groups: [IZ, IDG, IQL, IKH], say: T("Sekarang semua lengkap: Izhar jelas, Idgham masuk, Iqlab jadi m, Ikhfa samar!", "Now we have them all: Izhar clear, Idgham merge, Iqlab to m, Ikhfa hidden!") }] },
    { type: "friends", rule: IKH, pool: POOL12(IKH, "ء ه ع ح غ خ ي ن م و ل ر ب".split(" ")), say: T("Cari teman-teman Ikhfa!", "Find Ikhfa's friends!") },
    hold(2, ex(J6NUN, "مِنْ شَرِّ"), "hum", HUM2),
    spot(J6NUN, 6),
    S.tashih(by(J6NUN, IKH), READ)]; } });

  lvl(w6, { kind: "lesson", title: "نْ ـًـٍـٌ", lesson: function () { return [S.intro("idea", T("Sekarang monster-monster tajwid lapar! Ingat teman-teman Nuni, lalu beri makan monster yang benar.", "Now the tajwid monsters are hungry! Remember Nuni's friends, then feed the right monster.")),
    spot(J6NUN, 4), S.sort(BNUN, shuffle(J6NUN).slice(0, 6)), spot(J6NUN, 3), S.sort(BNUN, shuffle(J6NUN).slice(0, 6)), S.tashih(shuffle(J6NUN).slice(0, 5), READ)]; } });

  lvl(w6, { kind: "lesson", title: "مْ", lesson: function () { return [
    { type: "rule", pages: [
      { scene: "meet", who: "mim", title: T("Kenalan dengan Mimi!", "Meet Mimi!"), say: T("Ini Mimi, mim mati. Mimi juga punya tiga cara dibaca, tergantung huruf sesudahnya.", "This is Mimi, a resting mim. Mimi also has three ways to be read, depending on the next letter.") },
      { scene: "hide", who: "mim", friend: "ب", rule: IKS, say: T("Bertemu ب: Mimi samar sambil berdengung. Ikhfa syafawi.", "Before ب: Mimi is soft, with a hum. Ikhfa syafawi."), ex: ex(J6MIM, "تَرْمِيهِمْ بِحِجَارَةٍ") },
      { scene: "merge", who: "mim", friend: "م", rule: IDM, say: T("Bertemu م: Mimi masuk, berdengung. Idgham mimi.", "Before م: Mimi merges, humming. Idgham mimi."), ex: ex(J6MIM, "أَطْعَمَهُمْ مِنْ جُوعٍ") },
      { scene: "clear", who: "mim", friend: "د", rule: IZS, say: T("Bertemu huruf lainnya: Mimi dibaca jelas. Izhar syafawi.", "Before any other letter: Mimi is clear. Izhar syafawi."), ex: ex(J6MIM, "لَكُمْ دِينُكُمْ") }] },
    spot(J6MIM, 5, "mim"),
    S.sort(BMIM, shuffle(J6MIM).slice(0, 6), T("Mim mati: bertemu ب samar, bertemu م masuk, selain itu jelas.", "Mim sakinah: hidden before ب, merged into م, clear before the rest.")),
    S.tashih(J6MIM.slice(0, 5), READ)]; } });

  lvl(w6, { kind: "lesson", title: "جَاءَ", lesson: function () { return [
    { type: "rule", pages: [
      { scene: "stretch", word: "قَالَ", beats: 2, rule: MJ, title: T("Mad: bacaan panjang", "Mad: long vowels"), say: T("Huruf mad membuat bacaan panjang seperti karet ditarik: biasanya 2 ketukan. Qoola!", "A mad letter stretches the sound like a rubber band: usually 2 beats. Qaala!") },
      { scene: "stretch", word: "جَاءَ", beats: 5, rule: MW, title: T("Mad wajib", "Mad wajib"), say: T("Kalau sesudah mad ada hamzah di KATA YANG SAMA, tarik lebih panjang: 4 sampai 5 ketukan. Itu mad wajib.", "If a hamzah follows the mad in the SAME word, stretch longer: 4 to 5 beats. That is mad wajib."), ex: ex(J6MAD, "إِذَا جَاءَ") },
      { scene: "stretch", word: "يَا أَيُّهَا", beats: 4, rule: MJ, title: T("Mad jaiz", "Mad jaiz"), say: T("Kalau hamzahnya ada di KATA BERIKUTNYA, itu mad jaiz: boleh 2 sampai 5 ketukan, ikuti guru ngajimu.", "If the hamzah is in the NEXT word, that is mad jaiz: 2 to 5 beats, follow your teacher."), ex: ex(J6MAD, "قُلْ يَا أَيُّهَا") }] },
    hold(2, J2MAD[0], "mad", T("Tarik bacaan qoola 2 ketukan: tahan tombolnya!", "Stretch qaala for 2 beats: hold the button!")),
    hold([4, 5], ex(J6MAD, "إِذَا جَاءَ"), "mad", T("Mad wajib: tahan 4 sampai 5 ketukan!", "Mad wajib: hold for 4 to 5 beats!")),
    S.sort(BMAD, J6MAD, T("Hamzah di kata yang sama atau kata berikutnya?", "Is the hamzah in the same word or the next one?")),
    S.tashih(J6MAD, READ)]; } });

  lvl(w6, { kind: "boss", title: T("Ujian Jilid 6", "Book 6 Test"), items: J6NUN.concat(J6MIM).concat(J6MAD), lesson: function () { return [
    S.intro("pose-37", T("Ujian Istana Tajwid! Ingat Nuni, Mimi, dan mad. Bismillah!", "Tajwid Palace test! Remember Nuni, Mimi and the mads. Bismillah!")),
    spot(J6NUN, 4), S.sort(BNUN, shuffle(J6NUN).slice(0, 6)), spot(J6MIM, 3, "mim"), S.sort(BMAD, J6MAD), hold([4, 5], ex(J6MAD, "إِذَا جَاءَ"), "mad", T("Mad wajib: tahan 4 sampai 5 ketukan!", "Mad wajib: hold for 4 to 5 beats!")),
    S.tashih(shuffle(J6NUN.concat(J6MIM)).slice(0, 8), T("Tashih: {k} membaca, Abi/Umi menilai.", "Reading check: {k} reads, a parent listens."))]; } });

  /* Jilid 7 — Gerbang Al-Qur'an */
  var w7 = world({ n: 7, key: "quran", emoji: "🕌", color: "#C9A227", bg: "linear-gradient(180deg,#FFF3C4,#E9C25A)",
    name: T("Gerbang Al-Qur'an", "Qur'an Gate"), sub: T("Al-Qur'an · Al-Fatihah & Juz 'Amma", "Al-Qur'an · Al-Fatihah & Juz 'Amma"),
    goal: T("Membaca surat-surat pendek langsung dari mushaf: dengar murottal, susun ayat, baca sendiri, lalu tashih oleh Abi/Umi.",
      "Read short surahs straight from the mushaf: hear the recitation, build the verses, read alone, then a check by Abi/Umi.") });
  var OLD7 = ["al-fatihah","al-ikhlas","an-nas","al-falaq","al-kautsar","al-asr","an-nasr","quraisy","al-lahab","al-fil","al-kafirun","al-maun","al-humazah","at-takatsur","al-qariah"];
  ["al-ikhlas","al-kautsar","al-asr","an-nasr","al-falaq","an-nas","al-fatihah","quraisy","al-lahab","al-fil","al-kafirun","al-maun","at-takatsur","al-humazah","al-qariah"]
    .forEach(function (slug) { lvl(w7, { kind: "surah", surah: slug, title: null, oldId: "7-" + (OLD7.indexOf(slug) + 1) }); });
  lvl(w7, { kind: "khatam", title: T("Wisuda!", "Graduation!"), oldId: "7-16" });

  // the level kinds that need a pool of items from letters
  HJ.surah = function (slug) { return (window.HJ_QURAN || []).filter(function (s) { return s.slug === slug; })[0]; };
  HJ.worlds = worlds;
  // the map was smoothed (Nov 2026): move saved stars from the old level numbers to the new ones
  var IDMAP = {}; worlds.forEach(function (w) { w.levels.forEach(function (l) { if (l.oldId && l.oldId !== l.id) IDMAP[l.oldId] = l.id; }); });
  HJ.ID_MAP = IDMAP;
  if (HJ.store && HJ.store.migrateIds) HJ.store.migrateIds(IDMAP, 2);
  HJ.allLevels = function () { return [].concat.apply([], worlds.map(function (w) { return w.levels; })); };
  HJ.level = function (id) { return HJ.allLevels().filter(function (l) { return l.id === id; })[0]; };
  HJ.splitSyl = splitSyl;
  HJ.util = { shuffle: shuffle, pick: pick, rnd: rnd, T: T };
  HJ.data = { J2W: J2W, J2MAD: J2MAD, J3W: J3W, J3MAD: J3MAD, J4TAN: J4TAN, J4SUK: J4SUK, J4QAL: J4QAL, J4LIN: J4LIN,
    J5TAS: J5TAS, J5GHU: J5GHU, J5AL: J5AL, J5JAL: J5JAL, J5WAQ: J5WAQ, J6NUN: J6NUN, J6MIM: J6MIM, J6MAD: J6MAD };

  HJ.buildSteps = function (lv) {
    switch (lv.kind) {
      case "letters": return letterSteps(lv);
      case "review": return reviewSteps(lv);
      case "boss": return bossSteps(lv);
      case "words": return wordSteps(lv);
      case "mad": return wordSteps(Object.assign({ nLearn: 4 }, lv));
      case "sort": return sortSteps(lv);
      case "waqaf": return waqafSteps(lv);
      case "surah": return surahSteps(lv);
      case "khatam": return [{ type: "khatam" }];
      case "lesson": return lv.lesson();
    }
    return [];
  };
})();
