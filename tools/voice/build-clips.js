#!/usr/bin/env node
/* Builds the clip lists for tools/voice/gen.py and the recording page (tools/rekam/):
     tools/voice/clips-huruf.json  (kept as is: the 167 hijaiyah sounds already in audio/huruf, from Baby Mo)
     tools/voice/clips-kata.json   every Arabic word / syllable the games say that has no clip in audio/huruf
                                   (sec "kata" → audio/extra/<id>.mp3, window.HJ_VOICE_EXTRA)
     tools/voice/clips-lines.json  every Indonesian and English line Mo says with A.talk
                                   (sec "lines" → audio/lines/<id>.mp3, window.HJ_LINES)
   and then runs build-rekam-data.js (tools/rekam/rekam-data.js).

   Arabic: read from the curriculum (like tools/check-curriculum.js: every level built 25 times). Qur'an text is
   NEVER put on a list: any text that is a Q(...) fragment, or part of a Qur'an item, is left out (murottal or a
   parent only), even when the same word also appears elsewhere.
   Lines: read in the real app in a browser (Playwright), in Indonesian and English:
     - the fixed lines A.talk speaks (the INSTR table and the "locked" / "fail" / "great" / "again2" words, the home
       greeting without a name),
     - every level's intro / sort line (tr(step.say)) over 25 builds, and the intro lines app.js adds itself,
     - then every level is played step by step with A.talk hooked, so anything the static list missed is added too.
   Lines with the child's name: "{k}" lines are listed in their no-name form ("Si kecil" / "Your child"), which is
   what plays before a name is set; with a name they use the phone's voice. The home greeting with the name
   ("Assalamu'alaikum, <name>!") is not listed (only "Assalamu'alaikum!" without a name).
   The text on a list is what A.talk really speaks: emoji and Arabic letters removed (js/audio.js A.lineText); the
   on-screen text is kept in "src" so a human reader can see it.

   Ids are stable: <sec>-<first 8 hex of sha1(lang + "|" + key text)>.
     (python3 -m http.server 8811 &)           # in the repo root
     node tools/voice/build-clips.js [http://127.0.0.1:8811/] */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { arKey, lineKey, spoken, speakable, norm } = require('./voicekey.js');
const ROOT = path.resolve(__dirname, '..', '..');
const BASE = process.argv[2] || 'http://127.0.0.1:8811/';
const sha = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 8);
const write = (f, rows) => fs.writeFileSync(path.join(__dirname, f), '[\n' + rows.map(x => JSON.stringify(x)).join(',\n') + '\n]\n');

/* ---------- Arabic words (node, like check-curriculum.js) ---------- */
function arabic() {
  const g = global; g.window = g; g.HJ = {}; g.localStorage = { getItem: () => null, setItem: () => {} };
  for (const f of ['audio/huruf/voice.js', 'js/letters.js', 'js/quran.js', 'js/curriculum.js']) eval(fs.readFileSync(path.join(ROOT, f), 'utf8'));
  const have = new Set(Object.keys(window.HIJ_VOICE).map(arKey));
  const quran = new Set(), seen = new Map();
  const isAr = t => typeof t === 'string' && /[؀-ۿ]/.test(t);
  function visit(it, where) {
    if (!it || typeof it !== 'object') return;
    const q = !!(it.quran || it.ref);
    [].concat(it.au || []).forEach(t => {
      if (!isAr(t)) return;
      const k = arKey(t);
      if (q) { quran.add(k); return; }
      if (!seen.has(k)) seen.set(k, { t: k, tr: it.tr || '', id: it.id || '', en: it.en || '', lv: new Set() });
      seen.get(k).lv.add(where);
    });
    if (it.parts) it.parts.forEach(p => visit(typeof p === 'string' ? { ar: p, au: p, quran: it.quran, ref: it.ref } : p, where));
  }
  Object.entries(HJ.data).forEach(([k, list]) => list.forEach(x => { if (x.full) { visit(x.full, k); visit(x.stop, k); x.wrong.forEach(w => visit(w, k)); } else visit(x, k); }));
  for (let r = 0; r < 25; r++) HJ.allLevels().forEach(lv => HJ.buildSteps(lv).forEach(st => {
    ['item', 'q', 'show', 'heard'].forEach(k => st[k] && [].concat(st[k]).forEach(x => visit(x, lv.id)));
    (st.options || []).concat(st.pool || [], st.items || [], [].concat(...(st.pairs || [])), (st.rounds || []).map(x => x.q)).forEach(x => visit(x, lv.id));
    if (st.note && st.note.name) visit({ ar: st.note.name, au: st.note.name }, lv.id);
  }));
  HJ.L.forEach(l => l.n && visit({ ar: l.n, au: l.n }, 'huruf'));          // letter names (trace says them)
  const lvOrder = HJ.allLevels().map(l => l.id);
  const rows = [...seen.values()].filter(x => !have.has(x.t) && !quran.has(x.t)).map(x => {
    const lv = [...x.lv].filter(v => lvOrder.includes(v)).sort((a, b) => lvOrder.indexOf(a) - lvOrder.indexOf(b));
    const first = lv[0] || [...x.lv][0], w = first && /^\d/.test(first) ? first.split('-')[0] : '';
    const mean = x.id ? (x.id === x.en || !x.en ? x.id : x.id + ' / ' + x.en) : '';
    return { id: 'kata-' + sha('ar|' + x.t), t: x.t, lang: 'ar', sec: 'kata', k: 'word', key: x.t,
      h: [x.tr, mean].filter(Boolean).join(' · '), g: w ? 'Jilid ' + w + ' / Book ' + w : 'Lain / Other', p: lv.length ? lv : [...x.lv] };
  });
  rows.sort((a, b) => a.g.localeCompare(b.g) || lvOrder.indexOf(a.p[0]) - lvOrder.indexOf(b.p[0]));
  const skippedQuran = [...quran].filter(k => !have.has(k)).length;
  return { rows, quran: quran.size, skippedQuran, have: have.size };
}

/* ---------- a literal declared in a file: `var NAME = { … };` → source text ---------- */
function literal(file, name) {
  const s = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const m = new RegExp('(?:var|let|const)\\s+' + name + '\\s*=\\s*').exec(s);
  if (!m) throw new Error(file + ': no ' + name);
  let i = m.index + m[0].length, depth = 0, q = null; const start = i;
  for (; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === '`') q = c;
    else if (c === '[' || c === '{') depth++;
    else if (c === ']' || c === '}') { depth--; if (!depth) return s.slice(start, i + 1); }
  }
  throw new Error(file + ': unterminated ' + name);
}

/* ---------- Mo's lines (the real app in a browser) ---------- */
async function lines() {
  const { chromium } = require('playwright');
  const appSrc = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
  const INSTR = literal('js/app.js', 'INSTR');
  // the intro lines app.js adds itself: { type: "intro", …, say: { id: "…", en: "…" } }
  const appIntros = [...appSrc.matchAll(/type:\s*"intro"[^}]*?say:\s*(\{\s*id:\s*"(?:[^"\\]|\\.)*",\s*en:\s*"(?:[^"\\]|\\.)*"\s*\})/g)].map(m => m[1]);
  // the home greeting without a name: A.talk(st.name ? t("hello", …) : "<this>", …)
  const hello = (/A\.talk\(st\.name \? t\("hello"[^)]*\) : ("(?:[^"\\]|\\.)*")/.exec(appSrc) || [])[1];
  if (!hello) console.warn('warning: the home greeting (app.js A.talk(st.name ? … : "…")) was not found');
  const br = await chromium.launch();
  const found = new Map(), notes = { played: 0, levels: 0, hooked: 0, extra: [], named: new Set() };
  for (const M of ['id', 'en']) {
    const ctx = await br.newContext(); const p = await ctx.newPage();
    p.on('pageerror', e => console.error(M, 'page error:', e.message));
    await p.addInitScript(M => { try { localStorage.setItem('bmh_v1', JSON.stringify({ lang: M, langChosen: true, name: '', settings: { unlockAll: true, moVoice: true } })); } catch (e) {} }, M);
    await p.goto(BASE + 'index.html', { waitUntil: 'load' }); await p.waitForTimeout(600);
    const got = await p.evaluate(async ([M, INSTR, appIntros, hello]) => {
      const S = HJ.store, A = HJ.audio, out = [];
      S.get().lang = M; S.get().name = '';
      const add = (txt, g, how) => { if (txt) out.push({ text: txt, lang: M, g, how }); };
      const I = (0, eval)('(' + INSTR + ')');
      Object.keys(I).forEach(k => add(HJ.t(I[k]), 'petunjuk / instructions', 'INSTR.' + k));
      ['again2', 'locked', 'fail', 'great'].forEach(k => add(HJ.t(k), k === 'again2' ? 'petunjuk / instructions' : 'umpan balik / feedback', 'W.' + k));
      if (hello) add((0, eval)(hello), 'sapaan / greeting', 'home');
      appIntros.forEach(s => add(HJ.tr((0, eval)('(' + s + ')')), 'pembuka / intro', 'app.js intro'));
      for (let r = 0; r < 25; r++) HJ.allLevels().forEach(lv => HJ.buildSteps(lv).forEach(st => {
        if (st.type === 'intro' && st.say) add(HJ.tr(st.say), 'pembuka level / level intro', 'level ' + lv.id);
        if (st.type === 'sort' && st.say) add(HJ.tr(st.say), 'petunjuk / instructions', 'level ' + lv.id + ' sort');
      }));
      // play every level step by step with A.talk hooked: what does it really say?
      const real = A.talk, heard = [];
      A.talk = function (text, lang) { heard.push({ text: String(text), lang: lang || 'id' }); return Promise.resolve(); };
      const say = A.say; A.say = function () { return Promise.resolve(true); };
      let played = 0;
      for (const lv of HJ.allLevels()) {
        try {
          HJ.runLevel(lv, { noLimit: true, noReplay: true });
          for (let i = 0; i < 80; i++) { await new Promise(r => setTimeout(r, 5)); const c = HJ._ctx; if (!c || !c.alive()) break; c.next(); }
          played++;
        } catch (e) { out.push({ err: lv.id + ': ' + e.message }); }
        document.querySelectorAll('.veil').forEach(x => x.remove());
      }
      A.talk = real; A.say = say;
      heard.forEach(h => out.push({ text: h.text, lang: h.lang, g: 'dari permainan / heard while playing', how: 'played', played: true }));
      return { out, played, levels: HJ.allLevels().length, key: out.map(x => x.text ? [A.lineText(x.text), A.lineKey(x.text, x.lang)] : null) };
    }, [M, INSTR, appIntros, hello]);
    await ctx.close();
    notes.played += got.played; notes.levels = got.levels;
    got.out.forEach((x, i) => {
      if (x.err) { console.warn('  level error', x.err); return; }
      const [txt, k] = got.key[i];
      if (k !== lineKey(x.text, x.lang)) throw new Error('key mismatch (js/audio.js vs voicekey.js): ' + k + ' / ' + lineKey(x.text, x.lang));
      if (!norm(txt, x.lang)) return;
      if (x.played) { notes.hooked++; if (found.has(k)) return; notes.extra.push(k); }
      if (!found.has(k)) found.set(k, { id: 'lines-' + sha(k), t: speakable(txt), lang: x.lang, sec: 'lines', k: 'line', key: k,
        h: x.g, g: (x.lang === 'id' ? 'Mo — Indonesia' : 'Mo — English'), src: x.text !== txt ? x.text : undefined, p: [] });
      const it = found.get(k); if (!it.p.includes(x.how)) it.p.push(x.how);
    });
  }
  await br.close();
  const rows = [...found.values()].sort((a, b) => (a.lang === b.lang ? 0 : a.lang === 'id' ? -1 : 1));
  return { rows, notes };
}

(async () => {
  const A = arabic();
  write('clips-kata.json', A.rows);
  console.log(`clips-kata.json: ${A.rows.length} Arabic words/syllables without a clip (${A.have} in audio/huruf already; ` +
    `${A.skippedQuran} Qur'an fragments without a clip left out — never TTS)`);
  const L = await lines();
  const ids = new Set(L.rows.map(x => x.id)); if (ids.size !== L.rows.length) throw new Error('id clash');
  write('clips-lines.json', L.rows);
  const nid = L.rows.filter(x => x.lang === 'id').length, nen = L.rows.length - nid;
  console.log(`clips-lines.json: ${L.rows.length} lines (${nid} ID + ${nen} EN), ${L.rows.reduce((n, x) => n + x.t.length, 0)} characters`);
  console.log(`  played ${L.notes.played} level runs (${L.notes.levels} levels × 2 languages), A.talk heard ${L.notes.hooked} times; ` +
    `${L.notes.extra.length} lines found only by playing${L.notes.extra.length ? ': ' + L.notes.extra.join(' · ') : ''}`);
  const huruf = JSON.parse(fs.readFileSync(path.join(__dirname, 'clips-huruf.json'), 'utf8'));
  console.log(`clips-huruf.json: ${huruf.length} hijaiyah sounds (unchanged)`);
  require('./build-rekam-data.js');
})().catch(e => { console.error(e); process.exit(1); });
