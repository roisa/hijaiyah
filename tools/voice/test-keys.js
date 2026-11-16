#!/usr/bin/env node
/* Checks that js/audio.js (what the game looks up), tools/voice/voicekey.js (build scripts) and tools/voice/gen.py
   (what goes into the voice.js manifests) make the same key for every clip on the lists, plus some tricky lines.
     node tools/voice/test-keys.js */
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const V = require('./voicekey.js');
const ROOT = path.resolve(__dirname, '..', '..');
global.window = global; global.HJ = {};
eval(fs.readFileSync(path.join(ROOT, 'js/audio.js'), 'utf8'));
const A = HJ.audio;
const read = f => JSON.parse(fs.readFileSync(path.join(__dirname, f), 'utf8'));
const lines = read('clips-lines.json'), kata = read('clips-kata.json');
const extra = ['☀️ Selamat pagi!  Ayo… 💧', '“Bagus!” — kata Mo!!', 'Huruf ا د ذ tidak mau', 'MASYA ALLAH, HEBAT!', "Let's go?!"]
  .flatMap(t => [{ t, lang: 'id' }, { t, lang: 'en' }]);
const rows = lines.map(x => ({ t: x.src || x.t, lang: x.lang, want: x.key })).concat(extra);
// python: gen.py's norm on A.lineText (emoji / Arabic stripped exactly as the game does) and ar_key
const py = JSON.parse(execFileSync('python3', ['-c', `
import json, sys, importlib.util
spec = importlib.util.spec_from_file_location("gen", ${JSON.stringify(path.join(__dirname, 'gen.py'))}); g = importlib.util.module_from_spec(spec); spec.loader.exec_module(g)
d = json.load(sys.stdin)
print(json.dumps({"l": [r["lang"] + "|" + g.norm(r["s"], r["lang"]) for r in d["l"]], "a": [g.ar_key(t) for t in d["a"]]}, ensure_ascii=False))
`], { input: JSON.stringify({ l: rows.map(r => ({ s: A.lineText(r.t), lang: r.lang })), a: kata.map(x => x.t) }) }).toString());
let bad = 0;
rows.forEach((r, i) => {
  const js = A.lineKey(r.t, r.lang), vk = V.lineKey(r.t, r.lang);
  if (js !== vk || js !== py.l[i] || (r.want && r.want !== js)) { bad++; console.log('LINE MISMATCH', JSON.stringify({ text: r.t, audio_js: js, voicekey: vk, gen_py: py.l[i], list: r.want })); }
});
window.HJ_VOICE_EXTRA = {};
kata.forEach((x, i) => {
  window.HJ_VOICE_EXTRA = {}; window.HJ_VOICE_EXTRA[py.a[i]] = x.id + '.mp3';
  if (V.arKey(x.t) !== py.a[i] || x.key !== py.a[i] || A.clipUrl(x.t) !== 'audio/extra/' + x.id + '.mp3') { bad++; console.log('ARABIC MISMATCH', x.id, x.t); }
});
console.log(bad ? `${bad} mismatches` : `keys agree: ${rows.length} lines and ${kata.length} Arabic words (js/audio.js = voicekey.js = gen.py)`);
process.exit(bad ? 1 : 0);
