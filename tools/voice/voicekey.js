/* Clip keys, shared by the build scripts (node). The same rules live in js/audio.js (clipFor / A.lineKey) and
   tools/voice/gen.py; tools/voice/test-keys.js checks that all three agree.
   Arabic clips (audio/huruf, audio/extra): Unicode NFC, tatweel removed, whitespace collapsed (harakat KEPT).
   Mo's lines (audio/lines): "<lang>|<normalised text>", where the text is what A.talk speaks (emoji and Arabic
   letters removed) normalised like Baby Mo's bm-voice.js: NFC, emoji / arrows / joiners removed, curly quotes
   straightened, dashes unified, whitespace collapsed, no space before , . ! ? ; : …, repeated end marks folded,
   leading / trailing punctuation trimmed, lower-cased. */
const EMO = /\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDC00-\uDEFF]|\uDB40[\uDC20-\uDC7F]|[\u2190-\u21FF\u2300-\u23FF\u25A0-\u25FF\u2600-\u27BF\u2B00-\u2BFF\uFE00-\uFE0F\u200D\u20E3\u00A9\u00AE\u2122\u2139\u3030\u303D\u3297\u3299]/g;
const EDGE = "\\s.,!?;:…،؛؟۔。'\"()\\[\\]\\-—•·*~_";
const LEAD = new RegExp('^[' + EDGE + ']+'), TRAIL = new RegExp('[' + EDGE + ']+$');
/* what js/audio.js A.talk hands to the speech engine: no emoji, no Arabic letters / harakat */
function spoken(t) { return String(t == null ? '' : t).replace(/[\u{1F300}-\u{1FAFF}☀-➿]/gu, '').replace(/[ء-يً-ْ]+/g, '').trim(); }
/* the text as it is sent to text-to-speech: no emoji, tidy spaces and punctuation (case kept) */
function speakable(t) {
  let s = String(t == null ? '' : t);
  try { s = s.normalize('NFC'); } catch (e) {}
  return s.replace(EMO, '').replace(/[‘’ʼ`´]/g, "'").replace(/[“”„«»]/g, '"').replace(/[‒–―]/g, '—')
    .replace(/\s+/g, ' ').replace(/ ([,.!?;:…])/g, '$1').replace(/\s*—\s*/g, ' — ')
    .replace(/([.!?…؟])[.!?…؟]+/g, '$1').trim();
}
function norm(t, lang) {
  let s = speakable(t).replace(/ـ/g, '');
  s = s.replace(LEAD, '').replace(TRAIL, '');
  return lang === 'ar' ? s : s.toLowerCase();
}
/* js/audio.js norm(): the key of HIJ_VOICE / HJ_VOICE_EXTRA */
function arKey(t) { return String(t || '').normalize('NFC').replace(/ـ/g, '').replace(/\s+/g, ' ').trim(); }
function lineKey(t, lang) { return (lang || 'id') + '|' + norm(spoken(t), lang || 'id'); }
module.exports = { norm, speakable, spoken, arKey, lineKey };
