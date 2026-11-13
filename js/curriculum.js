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
  function Q(ar, s, a, tr, hl, extra) { var o = { ar: ar, tr: tr, au: ar, ref: [s, a], hl: hl, quran: 1 }; for (var k in extra || {}) o[k] = extra[k]; (HJ.QTEXT = HJ.QTEXT || {})[String(ar).normalize("NFC").replace(/\u0640/g, "").replace(/\s+/g, " ").trim()] = 1; return o; }
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
    st.push(S.pop(pick(nw), pool));
    st.push(S.train(randChain(pool, Math.min(4, 3 + pool.length / 8 | 0), nw)));
    if (!lv.noTrace && newK[1]) st.push(S.trace(BY[newK[1]].c));
    else st.push(S.yesno(pick(nw), pool));
    st.push(S.bridge(pool, nw, 3));
    if (pool.length >= 4) {
      var ps = shuffle(uniqBy(nw.concat(shuffle(pool)), function (x) { return x.ar; })).slice(0, 4);
      st.push(S.match(ps.map(function (x) { return [x, { ar: x.ar, au: x.au, soundOnly: 1 }]; })));   // hear the sound, find the letter
    } else st.push(S.train(randChain(pool, Math.min(5, 3 + pool.length / 8 | 0), nw)));
    return st;
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
    Q("لَمْ يَلِدْ وَلَمْ يُولَدْ", "al-ikhlas", 3, "lam yalid wa lam yuulad", "دْ"),
    Q("أَلَمْ يَجْعَلْ", "al-fil", 2, "alam yaj'al", "جْ"),
    Q("الْأَبْتَرُ", "al-kautsar", 3, "al-abtar", "بْ"),
    Q("أَطْعَمَهُمْ", "quraisy", 4, "ath'amahum", "طْ"),
    Q("يَدْخُلُونَ", "an-nasr", 2, "yadkhuluuna", "دْ"),
    Q("الْفَلَقِ", "al-falaq", 1, "al-falaq (berhenti: al-falaq)", "قِ")
  ];
  var J4LIN = [
    W("بَيْتٌ", "baitun", "rumah", "house"), Q("مِنْ خَوْفٍ", "quraisy", 4, "min khoufin", "وْ"), Q("قُرَيْشٍ", "quraisy", 1, "quroisyin", "يْ"),
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
  function sortSteps(lv) {
    var items = lv.items, st = [S.intro(lv.mo || "idea", lv.say)];
    (lv.explain || []).forEach(function (e) { st.push(S.learn(e.item, e.note)); });
    st.push(S.sort(lv.buckets, shuffle(items).slice(0, Math.min(6, items.length)), lv.sortSay));
    st.push(S.pick(pick(items), items));
    st.push(S.train(chain(shuffle(items).slice(0, 2))));
    st.push(S.sort(lv.buckets, shuffle(items).slice(0, Math.min(6, items.length)), lv.sortSay));
    st.push(S.bridge(items, null, 4));
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
  function lvl(w, o) { o.w = w.n; o.id = w.n + "-" + (w.levels.length + 1); w.levels.push(o); return o; }

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
  lvl(w2, { kind: "words", title: "بَتَ", items: J2W.slice(0, 5), mo: "idea",
    say: T("Huruf bisa bergandengan tangan! Bentuknya berubah sedikit, tapi bunyinya sama.", "Letters can hold hands! They change shape a little, but sound the same."),
    learnFirst: [J("بَتَ", "bata"), J("كَتَبَ", "kataba", "menulis", "wrote")] });
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
  lvl(w3, { kind: "mad", title: "بِي بُو",
    items: ["ba","ta","nun","mim","lam","sin","qof","ro"].map(function (k) { return syl(k, "ii"); }).concat(["ba","ta","nun","mim","lam","sin","qof","ro"].map(function (k) { return syl(k, "uu"); })),
    say: T("Kasrah lalu ya → panjang: bii. Dhammah lalu wau → panjang: buu.", "Kasrah then ya → long: bii. Dhammah then waw → long: buu.") });
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
  lvl(w4, { kind: "words", title: "قُطْبُ جَدْ", items: J4QAL,
    say: T("Huruf ق ط ب ج د kalau mati dibaca memantul: qalqalah! Seperti bola memantul.", "ق ط ب ج د bounce when they have sukun: qalqalah! Like a ball."),
    learnFirst: [W("أَقْ", "aq"), W("أَبْ", "ab"), W("أَدْ", "ad")] });
  lvl(w4, { kind: "words", title: "بَيْ بَوْ", items: J4LIN, say: T("Fathah lalu wau atau ya mati: dibaca lembut, ai / au.", "Fathah then a still waw or ya: read softly, ai / au.") });
  lvl(w4, { kind: "boss", title: T("Ujian Jilid 4", "Book 4 Test"), items: J4TAN.concat(J4SUK).concat(J4LIN) });

  /* Jilid 5 — Kota Tasydid */
  var w5 = world({ n: 5, key: "tasydid", emoji: "🏙️", color: "#8B5CF6", bg: "linear-gradient(180deg,#DCCBFF,#9A7AF0)",
    name: T("Kota Tasydid", "Tasydid Town"), sub: T("Jilid 5 · tasydid, ghunnah, alif lam, waqaf", "Book 5 · shaddah, ghunnah, al-, stopping"),
    goal: T("Membaca tasydid, dengung (ghunnah), alif lam qamariyah & syamsiyah, lafaz Allah, dan cara berhenti (waqaf).",
      "Read shaddah, the nasal ghunnah, the two kinds of al-, the word Allah, and how to stop (waqaf).") });
  lvl(w5, { kind: "words", title: "رَبِّ", items: J5TAS, say: T("Tanda seperti huruf w kecil namanya tasydid: hurufnya dibaca dua kali, ditekan!", "The little w is shaddah: the letter is doubled, pressed!") });
  lvl(w5, { kind: "words", title: "إِنَّ", items: J5GHU, say: T("نّ dan مّ yang bertasydid dibaca berdengung (ghunnah) 2 ketukan. Nnnn!", "Doubled نّ and مّ hum for 2 beats (ghunnah). Nnnn!") });
  lvl(w5, { kind: "words", title: "الْقَمَرُ", items: J5AL.filter(function (x) { return x.b === QAM; }), say: T("Alif lam qamariyah: lam-nya dibaca jelas. Al-qomar!", "Moon letters: the lam is clear. Al-qamar!") });
  lvl(w5, { kind: "words", title: "الشَّمْسُ", items: J5AL.filter(function (x) { return x.b === SYM; }), say: T("Alif lam syamsiyah: lam-nya hilang, huruf berikutnya ditasydid. Asy-syams!", "Sun letters: the lam disappears, the next letter doubles. Ash-shams!") });
  var BQS = [{ k: QAM, art: "moon", label: T("Qamariyah (lam jelas)", "Moon letters (clear lam)") }, { k: SYM, art: "sun", label: T("Syamsiyah (lam hilang)", "Sun letters (silent lam)") }];
  lvl(w5, { kind: "sort", title: "الْ", items: J5AL, buckets: BQS, say: T("Bulan atau matahari? Kelompokkan!", "Moon or sun? Sort them!") });
  lvl(w5, { kind: "sort", title: "اللَّهُ", items: J5JAL,
    buckets: [{ k: TAF, label: T("Tebal (tafkhim)", "Full (tafkhim)") }, { k: TAR, label: T("Tipis (tarqiq)", "Light (tarqiq)") }],
    say: T("Lafaz Allah dibaca tebal setelah a / u, dan tipis setelah i.", "Allah is read full after a / u, and light after i.") });
  lvl(w5, { kind: "waqaf", title: "أَحَدْ", say: T("Waqaf = berhenti. Di akhir ayat, harakat terakhir dimatikan.", "Waqaf = stopping. At the end of a verse, the last vowel goes still.") });
  lvl(w5, { kind: "boss", title: T("Ujian Jilid 5", "Book 5 Test"), items: J5TAS.concat(J5GHU).concat(J5AL) });

  /* Jilid 6 — Istana Tajwid */
  var w6 = world({ n: 6, key: "tajwid", emoji: "🏰", color: "#E0892B", bg: "linear-gradient(180deg,#FFE0B5,#F2A54A)",
    name: T("Istana Tajwid", "Tajwid Palace"), sub: T("Jilid 6 · hukum nun & mim mati, mad", "Book 6 · nun & mim rules, mad"),
    goal: T("Mengenal hukum nun mati & tanwin (izhar, idgham, iqlab, ikhfa), mim mati, dan mad wajib & jaiz langsung di ayat Al-Qur'an.",
      "Meet the rules of nun sakinah & tanwin (izhar, idgham, iqlab, ikhfa), mim sakinah, and the long mads — inside real verses.") });
  var BNUN = [{ k: IZ, label: T("Izhar (jelas)", "Izhar (clear)") }, { k: IDG, label: T("Idgham (masuk)", "Idgham (merge)") },
    { k: IQL, label: T("Iqlab (jadi m)", "Iqlab (to m)") }, { k: IKH, label: T("Ikhfa (samar)", "Ikhfa (hidden)") }];
  var by = function (list, b) { return list.filter(function (x) { return x.b === b; }); };
  lvl(w6, { kind: "words", title: "مِنْ خَوْفٍ", items: by(J6NUN, IZ), say: T("Izhar: nun mati/tanwin bertemu ء ه ع ح غ خ → dibaca JELAS.", "Izhar: before ء ه ع ح غ خ the n is CLEAR.") });
  lvl(w6, { kind: "words", title: "مِنْ مَسَدٍ", items: by(J6NUN, IDG), say: T("Idgham: bertemu ي ن م و (berdengung) atau ل ر (tanpa dengung) → nun masuk ke huruf berikutnya.", "Idgham: before ي ن م و (with hum) or ل ر (no hum) the n merges in.") });
  lvl(w6, { kind: "words", title: "لَيُنْبَذَنَّ", items: by(J6NUN, IQL).concat(by(J6MIM, IKS)), say: T("Iqlab: nun mati bertemu ب → berubah jadi bunyi m.", "Iqlab: before ب the n turns into m.") });
  lvl(w6, { kind: "words", title: "مِنْ شَرِّ", items: by(J6NUN, IKH), say: T("Ikhfa: bertemu 15 huruf lainnya → dibaca samar sambil berdengung.", "Ikhfa: before the other 15 letters the n is hidden, with a hum.") });
  lvl(w6, { kind: "sort", title: "نْ ـًـٍـٌ", items: J6NUN, buckets: BNUN, say: T("Hukum apa ini? Masukkan ke kotak yang benar!", "Which rule? Put it in the right box!") });
  lvl(w6, { kind: "sort", title: "مْ", items: J6MIM,
    buckets: [{ k: IKS, label: T("Ikhfa syafawi (مْ ب)", "Ikhfa syafawi (مْ ب)") }, { k: IDM, label: T("Idgham mimi (مْ م)", "Idgham mimi (مْ م)") }, { k: IZS, label: T("Izhar syafawi (lainnya)", "Izhar syafawi (others)") }],
    say: T("Mim mati: bertemu ب samar, bertemu م masuk, selain itu jelas.", "Mim sakinah: hidden before ب, merged into م, clear before the rest.") });
  lvl(w6, { kind: "sort", title: "جَاءَ", items: J6MAD,
    buckets: [{ k: MW, label: T("Mad wajib (satu kata)", "Mad wajib (same word)") }, { k: MJ, label: T("Mad jaiz (beda kata)", "Mad jaiz (next word)") }],
    say: T("Mad bertemu hamzah: di kata yang sama = wajib (5 ketukan), di kata berikutnya = jaiz.", "A long vowel before hamzah: same word = wajib (5 beats), next word = jaiz.") });
  lvl(w6, { kind: "boss", title: T("Ujian Jilid 6", "Book 6 Test"), items: J6NUN.concat(J6MIM).concat(J6MAD),
    extra: function () { return [S.sort(BNUN, shuffle(J6NUN).slice(0, 6))]; } });

  /* Jilid 7 — Gerbang Al-Qur'an */
  var w7 = world({ n: 7, key: "quran", emoji: "🕌", color: "#C9A227", bg: "linear-gradient(180deg,#FFF3C4,#E9C25A)",
    name: T("Gerbang Al-Qur'an", "Qur'an Gate"), sub: T("Al-Qur'an · Al-Fatihah & Juz 'Amma", "Al-Qur'an · Al-Fatihah & Juz 'Amma"),
    goal: T("Membaca surat-surat pendek langsung dari mushaf: dengar murottal, susun ayat, baca sendiri, lalu tashih oleh Abi/Umi.",
      "Read short surahs straight from the mushaf: hear the recitation, build the verses, read alone, then a check by Abi/Umi.") });
  ["al-fatihah","al-ikhlas","an-nas","al-falaq","al-kautsar","al-asr","an-nasr","quraisy","al-lahab","al-fil","al-kafirun","al-maun","al-humazah","at-takatsur","al-qariah"]
    .forEach(function (slug) { lvl(w7, { kind: "surah", surah: slug, title: null }); });
  lvl(w7, { kind: "khatam", title: T("Wisuda!", "Graduation!") });

  // the level kinds that need a pool of items from letters
  HJ.surah = function (slug) { return (window.HJ_QURAN || []).filter(function (s) { return s.slug === slug; })[0]; };
  HJ.worlds = worlds;
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
    }
    return [];
  };
})();
