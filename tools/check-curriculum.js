#!/usr/bin/env node
/* Checks the curriculum and lists the Arabic sounds that still need a recorded clip.
   - every Qur'an fragment (Q(...) in js/curriculum.js) must be an exact substring of its ayah in js/quran.js
   - every "hl" (highlight) must be inside its text
   - writes tools/clips-needed.json: Arabic texts the game speaks that have no recorded clip yet, in the same
     {id, t, lang, sec, h} shape as babymo-app/tools/voice/clips.json, so gen.py can voice them.
   Usage: node tools/check-curriculum.js */
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const root = path.join(__dirname, "..");
global.window = global; global.HJ = {};
global.localStorage = { getItem: () => null, setItem: () => {} };
for (const f of ["audio/huruf/voice.js", "js/letters.js", "js/quran.js", "js/curriculum.js"]) eval(fs.readFileSync(path.join(root, f), "utf8"));
const Q = window.HJ_QURAN, errs = [];
const ayah = (s, a) => { const su = Q.find(x => x.slug === s); return su && su.ayahs.find(x => x.n === a); };
const items = new Map();
function visit(it, where) {
  if (!it || typeof it !== "object") return;
  if (it.ref) {
    const a = ayah(it.ref[0], it.ref[1]);
    if (!a) errs.push(`${where}: no ayah ${it.ref}`);
    else if (a.ar.indexOf(it.ar) < 0) errs.push(`${where}: "${it.ar}" is not in ${it.ref.join(":")} "${a.ar}"`);
  }
  if (it.hl && it.ar && it.ar.indexOf(it.hl) < 0) errs.push(`${where}: highlight "${it.hl}" not in "${it.ar}"`);
  const au = it.au;
  [].concat(au || []).forEach(t => { if (typeof t === "string" && /[؀-ۿ]/.test(t)) items.set(t.normalize("NFC"), where); });
}
Object.entries(HJ.data).forEach(([k, list]) => list.forEach(x => { if (x.full) { visit(x.full, k); visit(x.stop, k); x.wrong.forEach(w => visit(w, k)); } else visit(x, k); }));
// build every level a few times to collect what it can say
for (let r = 0; r < 25; r++) HJ.allLevels().forEach(lv => HJ.buildSteps(lv).forEach(st => {
  ["item", "q", "show", "heard"].forEach(k => st[k] && visit(st[k], lv.id));
  (st.options || []).concat(st.pool || [], st.items || [], [].concat(...(st.pairs || [])), (st.rounds || []).map(x => x.q)).forEach(x => visit(x, lv.id));
  if (st.item && st.item.parts) st.item.parts.forEach(p => visit(typeof p === "string" ? { ar: p, au: p } : p, lv.id));
  if (st.note && st.note.name) visit({ ar: st.note.name, au: st.note.name }, lv.id);
}));
const missing = [...items.keys()].filter(t => !window.HIJ_VOICE[t]);
const out = missing.map(t => ({ id: "hx-" + crypto.createHash("sha1").update("ar|" + t).digest("hex").slice(0, 8), t, lang: "ar", sec: "hijaiyah-game", h: items.get(t) }));
fs.writeFileSync(path.join(__dirname, "clips-needed.json"), JSON.stringify(out, null, 1));
console.log(`levels: ${HJ.allLevels().length}, Arabic sounds: ${items.size}, recorded: ${items.size - missing.length}, need a clip: ${missing.length} (tools/clips-needed.json)`);
if (errs.length) { console.error("ERRORS:\n" + [...new Set(errs)].join("\n")); process.exit(1); }
console.log("Qur'an fragments: all exact ✓");
