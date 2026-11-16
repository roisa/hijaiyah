#!/usr/bin/env node
/* Builds js/quran.js from the short surahs in babymo-web (lib/content/surah.ts), so the Arabic text is the
   same, letter for letter, as on babymo.id. Usage: node tools/build-quran.js [path/to/babymo-web] */
const fs = require("fs"), path = require("path");
const web = process.argv[2] || path.join(__dirname, "../../babymo-web");
const WANT = ["al-fatihah","al-ikhlas","an-nas","al-falaq","al-kautsar","al-asr","an-nasr","quraisy","al-lahab",
  "al-fil","al-kafirun","al-maun","al-humazah","at-takatsur","al-qariah"];
let list;
const ts = path.join(web, "lib/content/surah.ts");
if (fs.existsSync(ts)) {
  let s = fs.readFileSync(ts, "utf8").replace(/^import.*$/m, "");
  s = s.slice(0, s.indexOf("];", s.indexOf("surahList")) + 2).replace(/export const (\w+)\s*:\s*[\w\[\]<>]+\s*=/g, "exports.$1=");
  const m = {}; new Function("exports", s)(m);
  list = m.surahList.map(x => ({ slug: x.slug, number: x.number, name: x.name, arabicName: x.arabicName, meaning: x.meaning,
    ayahs: x.ayahs.map(a => ({ n: a.number, ar: a.arabic, tr: a.transliteration, id: a.translation.id, en: a.translation.en })) }));
  fs.writeFileSync(path.join(__dirname, "surah-source.json"), JSON.stringify(list.filter(x => WANT.includes(x.slug))));
} else {
  list = JSON.parse(fs.readFileSync(path.join(__dirname, "surah-source.json"), "utf8"));
}
const out = WANT.map(w => list.find(x => x.slug === w)).filter(Boolean);
fs.writeFileSync(path.join(__dirname, "../js/quran.js"),
  "/* Short surahs, copied exactly from babymo-web lib/content/surah.ts by tools/build-quran.js — do not edit by hand. */\n" +
  "window.HJ_QURAN=" + JSON.stringify(out, null, 0).replace(/\},\{"slug"/g, '},\n{"slug"') + ";\n");
console.log("js/quran.js:", out.map(x => x.slug + "(" + x.ayahs.length + ")").join(" "));
