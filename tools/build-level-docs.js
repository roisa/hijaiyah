#!/usr/bin/env node
/* Writes docs/LEVELS.id.md and docs/LEVELS.en.md: every book and level, in Indonesian and in English,
   straight from js/curriculum.js (so the documents never drift from the game). */
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
global.window = global; global.HJ = {}; global.localStorage = { getItem: () => null, setItem: () => {} };
global.navigator = { language: "en" };
for (const f of ["audio/huruf/voice.js", "js/letters.js", "js/quran.js", "js/curriculum.js"]) eval(fs.readFileSync(path.join(root, f), "utf8"));
const K = {
  id: { letters: "Huruf baru", review: "Ulangan", boss: "Ujian (3 hati + tashih)", words: "Kata", mad: "Bacaan khusus", sort: "Kelompokkan", waqaf: "Waqaf", surah: "Surat", khatam: "Wisuda" },
  en: { letters: "New letters", review: "Review", boss: "Test (3 hearts + parent check)", words: "Words", mad: "Special reading", sort: "Sort", waqaf: "Stopping", surah: "Surah", khatam: "Graduation" }
};
const H = {
  id: { title: "Baby Mo Hijaiyah — Daftar Level", intro: "Dibuat otomatis dari js/curriculum.js (`node tools/build-level-docs.js`).", book: "Jilid", lv: "Level", what: "Isi", kind: "Jenis", ay: "ayat" },
  en: { title: "Baby Mo Hijaiyah — All Levels", intro: "Generated from js/curriculum.js (`node tools/build-level-docs.js`).", book: "Book", lv: "Level", what: "Content", kind: "Type", ay: "verses" }
};
for (const L of ["id", "en"]) {
  const h = H[L]; let o = `# ${h.title}\n\n${h.intro}\n`;
  for (const w of HJ.worlds) {
    o += `\n## ${h.book} ${w.n} — ${w.name[L]} (${w.levels.length} ${L === "en" ? "levels" : "level"})\n${w.sub[L]}\n\n${w.goal[L]}\n\n| ${h.lv} | ${h.what} | ${h.kind} |\n|---|---|---|\n`;
    for (const l of w.levels) {
      let t;
      if (l.kind === "surah") { const s = HJ.surah(l.surah); t = `${L === "en" ? "Surah" : "Surat"} ${s.name[L]} (${s.ayahs.length} ${h.ay})`; }
      else t = typeof l.title === "string" ? l.title : l.title[L];
      if (l.say && l.kind !== "surah") t += " — " + l.say[L].replace(/\{k\}/g, L === "en" ? "your child" : "si kecil");
      o += `| ${l.id} | ${t.replace(/\|/g, "/")} | ${K[L][l.kind]} |\n`;
    }
  }
  fs.writeFileSync(path.join(root, `docs/LEVELS.${L}.md`), o);
}
console.log("docs/LEVELS.id.md, docs/LEVELS.en.md");
