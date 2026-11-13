/* Baby Mo Hijaiyah — the 28 letters and the helpers that build syllables.
   Arabic text here is checked by tools/check-curriculum.js (clips, marks). */
(function () {
  var FATHAH = "َ", KASRAH = "ِ", DHAMMAH = "ُ", SUKUN = "ْ", SHADDA = "ّ",
      FATHATAIN = "ً", KASRATAIN = "ٍ", DHAMMATAIN = "ٌ";

  // c: the letter, n: its name (recorded clip), cons: Latin consonant (Indonesian style),
  // heavy: read with a full mouth (Indonesian books write "o" for its fathah),
  // nojoin: never joins to the next letter (Iqra 2 note)
  var L = [
    { k: "alif", c: "ا", seat: "أ", n: "أَلِف", cons: "", id: "Alif" , nojoin: 1 },
    { k: "ba",   c: "ب", n: "بَاء",  cons: "b",  id: "Ba" },
    { k: "ta",   c: "ت", n: "تَاء",  cons: "t",  id: "Ta" },
    { k: "tsa",  c: "ث", n: "ثَاء",  cons: "ts", id: "Tsa" },
    { k: "jim",  c: "ج", n: "جِيم",  cons: "j",  id: "Jim" },
    { k: "hha",  c: "ح", n: "حَاء",  cons: "ḥ",  id: "Ḥa" },
    { k: "kho",  c: "خ", n: "خَاء",  cons: "kh", id: "Kho", heavy: 1 },
    { k: "dal",  c: "د", n: "دَال",  cons: "d",  id: "Dal", nojoin: 1 },
    { k: "dzal", c: "ذ", n: "ذَال",  cons: "dz", id: "Dzal", nojoin: 1 },
    { k: "ro",   c: "ر", n: "رَاء",  cons: "r",  id: "Ro", heavy: 1, nojoin: 1 },
    { k: "zai",  c: "ز", n: "زَاي",  cons: "z",  id: "Zai", nojoin: 1 },
    { k: "sin",  c: "س", n: "سِين",  cons: "s",  id: "Sin" },
    { k: "syin", c: "ش", n: "شِين",  cons: "sy", id: "Syin" },
    { k: "shod", c: "ص", n: "صَاد",  cons: "sh", id: "Shod", heavy: 1 },
    { k: "dhod", c: "ض", n: "ضَاد",  cons: "dh", id: "Dhod", heavy: 1 },
    { k: "tho",  c: "ط", n: "طَاء",  cons: "th", id: "Tho", heavy: 1 },
    { k: "zho",  c: "ظ", n: "ظَاء",  cons: "zh", id: "Zho", heavy: 1 },
    { k: "ain",  c: "ع", n: "عَيْن", cons: "'",  id: "'Ain" },
    { k: "ghin", c: "غ", n: "غَيْن", cons: "gh", id: "Ghoin", heavy: 1 },
    { k: "fa",   c: "ف", n: "فَاء",  cons: "f",  id: "Fa" },
    { k: "qof",  c: "ق", n: "قَاف",  cons: "q",  id: "Qof", heavy: 1 },
    { k: "kaf",  c: "ك", n: "كَاف",  cons: "k",  id: "Kaf" },
    { k: "lam",  c: "ل", n: "لَام",  cons: "l",  id: "Lam" },
    { k: "mim",  c: "م", n: "مِيم",  cons: "m",  id: "Mim" },
    { k: "nun",  c: "ن", n: "نُون",  cons: "n",  id: "Nun" },
    { k: "wau",  c: "و", n: "وَاو",  cons: "w",  id: "Wau", nojoin: 1 },
    { k: "ha",   c: "ه", n: "هَاء",  cons: "h",  id: "Ha" },
    { k: "ya",   c: "ي", n: "يَاء",  cons: "y",  id: "Ya" }
  ];
  // English names (international spelling) next to the Indonesian ones
  var EN = { alif: "Alif", ba: "Ba", ta: "Ta", tsa: "Tha", jim: "Jim", hha: "Ḥa", kho: "Kha", dal: "Dal", dzal: "Dhal", ro: "Ra",
    zai: "Zay", sin: "Sin", syin: "Shin", shod: "Ṣad", dhod: "Ḍad", tho: "Ṭa", zho: "Ẓa", ain: "'Ayn", ghin: "Ghayn", fa: "Fa",
    qof: "Qaf", kaf: "Kaf", lam: "Lam", mim: "Mim", nun: "Nun", wau: "Waw", ha: "Ha", ya: "Ya" };
  var BY = {};
  L.forEach(function (l, i) { l.i = i; l.en = EN[l.k]; BY[l.k] = l; BY[l.c] = l; });

  // Letters that look alike (dots) or sound alike — used to pick fair "tricky" distractors
  var LOOK = [["ba","ta","tsa","nun","ya"],["jim","hha","kho"],["dal","dzal"],["ro","zai"],["sin","syin"],
    ["shod","dhod"],["tho","zho"],["ain","ghin"],["fa","qof"],["kaf","lam"],["ha","alif"],["wau","ro"],["mim","fa"]];
  var SOUND = [["alif","ain"],["hha","ha"],["tsa","sin","shod"],["dzal","zai","zho"],["ta","tho"],["dal","dhod"],
    ["kaf","qof"],["kho","ha"],["ghin","ro"]];
  function cousins(k) {
    var out = [];
    LOOK.concat(SOUND).forEach(function (g) { if (g.indexOf(k) >= 0) g.forEach(function (x) { if (x !== k && out.indexOf(x) < 0) out.push(x); }); });
    return out;
  }

  var MARK = { a: FATHAH, i: KASRAH, u: DHAMMAH, s: SUKUN, an: FATHATAIN, in: KASRATAIN, un: DHAMMATAIN };

  // One syllable: letter key + vowel (a, i, u, aa, ii, uu, an, in, un)
  function syl(k, v) {
    var l = BY[k], base = l.seat || l.c;
    v = v || "a";
    var ar;
    if (v === "aa") ar = base + FATHAH + "ا";
    else if (v === "ii") ar = base + KASRAH + "ي";
    else if (v === "uu") ar = base + DHAMMAH + "و";
    else if (v === "an") ar = base + FATHATAIN + (k === "alif" ? "" : "ا");
    else ar = base + MARK[v];
    return { ar: ar, tr: latin(k, v), k: k, v: v, au: ar };
  }
  function latin(k, v) {
    var l = BY[k], c = l.cons;
    var vow = { a: l.heavy ? "o" : "a", i: "i", u: "u", aa: l.heavy ? "oo" : "aa", ii: "ii", uu: "uu",
      an: l.heavy ? "on" : "an", in: "in", un: "un" }[v] || "a";
    return c + vow;
  }

  // A chain of syllables read the Iqra way, right to left, with a space between them
  function chain(list) {
    return { ar: list.map(function (s) { return s.ar; }).join("  "), tr: list.map(function (s) { return s.tr; }).join(" - "),
      au: list.map(function (s) { return s.au; }), parts: list };
  }

  /* Latin hints are written the Indonesian way (ts, dz, sy, sh, kho…). For English we convert them to the
     usual international spelling: ث th, ذ dh, ش sh, ص ṣ, ض ḍ, ط ṭ, ظ ẓ, and the "o" of heavy letters back to "a". */
  var ID2EN = { ts: "th", dz: "dh", sy: "sh", sh: "ṣ", dh: "ḍ", th: "ṭ", zh: "ẓ", kh: "kh", gh: "gh", oo: "aa", o: "a" };
  function latinFor(tr, lang) {
    if (!tr || lang !== "en") return tr;
    return String(tr).replace(/ts|dz|sy|sh|dh|th|zh|kh|gh|oo|o/g, function (m) { return ID2EN[m]; });
  }
  function letterName(k, lang) { var l = BY[k]; return l ? (lang === "en" ? l.en : l.id) : ""; }

  window.HJ = window.HJ || {};
  HJ.latinFor = latinFor; HJ.letterName = letterName;
  HJ.L = L; HJ.BY = BY; HJ.syl = syl; HJ.chain = chain; HJ.cousins = cousins; HJ.latin = latin;
  HJ.M = { FATHAH: FATHAH, KASRAH: KASRAH, DHAMMAH: DHAMMAH, SUKUN: SUKUN, SHADDA: SHADDA,
    FATHATAIN: FATHATAIN, KASRATAIN: KASRATAIN, DHAMMATAIN: DHAMMATAIN };
})();
