# Voice clips (one voice for the whole game, like the Baby Mo app)

`js/audio.js` plays a clip file when there is one and falls back to the phone's voice when there is none:

- **Arabic** (`A.say`): `audio/huruf/voice.js` (`window.HIJ_VOICE`, the 167 hijaiyah sounds from Baby Mo) and
  `audio/extra/voice.js` (`window.HJ_VOICE_EXTRA`, the Arabic words), keyed by the Arabic text (NFC, no tatweel).
- **Mo's lines** (`A.talk`, Indonesian / English): `audio/lines/voice.js` (`window.HJ_LINES`), keyed
  `"<lang>|<normalised text>"` — the text A.talk speaks (emoji and Arabic letters removed), normalised like Baby Mo's
  `bm-voice.js` (NFC, emoji removed, quotes / dashes unified, spaces collapsed, edge punctuation trimmed, lower case).
  The promise still resolves when the speech ends (or when `A.stop()` cuts it), and "Mo talks" off in the parent
  settings still silences Mo.
- **Qur'an verses are never TTS**: murottal (`audio/quran`) or a parent. No Qur'an text is on any list here.

`audio/extra/voice.js` and `audio/lines/voice.js` ship empty, so the game works the same before any clip exists.
Voice: Google Chirp3-HD **Algenib** (`ar-XA-Chirp3-HD-Algenib`, `id-ID-Chirp3-HD-Algenib`, `en-US-Chirp3-HD-Algenib`),
the Baby Mo voice. Links carry `?v=algenib` (TTS) or `?v=rec1`, `rec2`… (a real-voice recording) so phones refetch.

## Clip lists

| file | section | what | folder |
|---|---|---|---|
| `clips-huruf.json` | `huruf` | 167 hijaiyah sounds (letter names, syllables, harakat names, words, Bismillah) — already made | `audio/huruf` |
| `clips-kata.json` | `kata` | 146 Arabic words / syllables the games say that have no clip (Qur'an fragments left out) | `audio/extra` |
| `clips-lines.json` | `lines` | 168 lines Mo says: 84 Indonesian + 84 English | `audio/lines` |

Ids are stable: `<sec>-<sha1(lang|text)[:8]>` (`kata-72fb6542`, `lines-5db9baec`; the huruf ids are Baby Mo's).
Rebuild the lists after changing the curriculum or what Mo says (needs Playwright and the game served locally):

```bash
python3 -m http.server 8811 &              # in the repo root
node tools/voice/build-clips.js            # writes clips-kata.json, clips-lines.json and tools/rekam/rekam-data.js
node tools/voice/test-keys.js              # js/audio.js, voicekey.js and gen.py make the same keys
```

`build-clips.js` reads the Arabic from the curriculum (every level built 25 times, like `check-curriculum.js`), and
Mo's lines from the real app in both languages (the INSTR table, the feedback words, every level's intro / sort line,
the intro lines app.js adds), then plays every level step by step with `A.talk` hooked to catch anything else.
Lines with the child's name: `{k}` lines are listed in their no-name form ("Si kecil" / "Your child"), which is what
plays until a name is set; once the child has a name those few lines use the phone's voice. The home greeting with the
name ("Assalamu'alaikum, <name>!") is not listed — only "Assalamu'alaikum!" (no name). Lines whose on-screen text
has Arabic letters keep that text in `src` (the recording page shows it), because A.talk drops the Arabic letters.

## Make the TTS clips (Google Cloud)

**In Google Cloud Shell** (https://shell.cloud.google.com, signed in — no key needed):

```bash
git clone https://github.com/roisa/hijaiyah.git && cd hijaiyah     # once; afterwards: cd hijaiyah
bash tools/voice/cloudshell.sh            # every missing clip (kata + lines), checks them, pushes voice-clips-<date>
bash tools/voice/cloudshell.sh lines      # only Mo's lines   (or: kata)
```

**Anywhere else** with an API key (Cloud Text-to-Speech API enabled; Speech-to-Text too for `--check`), or a signed-in `gcloud`:

```bash
export GOOGLE_TTS_API_KEY=…               # or: gcloud auth login && gcloud config set project <project>
python3 tools/voice/gen.py --test         # one clip per language — confirms the credentials and the voices
python3 tools/voice/gen.py                # every missing clip (resumes: files already made are kept)
python3 tools/voice/gen.py --check        # + speech-to-text check of the new clips (tools/voice/check-report.json)
python3 tools/voice/gen.py --only lines   # sections: huruf, kata, lines
python3 tools/voice/gen.py --force --only kata   # remake existing TTS clips (recordings ?v=rec… are always kept)
python3 tools/voice/gen.py --dry-run      # what a run would make — no credentials, no API calls
python3 tools/voice/gen.py --manifest     # only rewrite the voice.js files from the mp3s on disk
```

Without working credentials gen.py stops with an `AUTH ERROR` and these instructions. It writes
`audio/<folder>/<id>.mp3` and `audio/<folder>/voice.js`. Listen on `tools/rekam/dengar.html`.

## Real voice: record, export, import

1. Open the recording page — https://roisa.github.io/hijaiyah/tools/rekam/ (locally
   http://127.0.0.1:8811/tools/rekam/). Web only: in the iOS / Android app it only says "Hanya di web" and never asks for
   the microphone (and `tools/build-app.js` does not copy `tools/` into the app).
2. Pick a group (Huruf to re-record · Kata Arab · Mo's lines ID · Mo's lines EN), tap the red button (desktop: Space),
   read, tap again, listen, Approve (Enter). Takes are trimmed, high-passed and loudness-matched (−19 LUFS, peaks ≤ −1 dBFS,
   24 kHz mono WAV) and kept in the browser (IndexedDB `bmh-rekam`) until exported. "Clip sekarang" plays the current
   TTS clip as a reference when there is one.
3. "Unduh ZIP / Download ZIP" → `hijaiyah-rekaman-<date>.zip` with `audio/<folder>/<id>.wav` + `rekam-manifest.json`.
4. In the repo:

```bash
bash tools/voice/import-recordings.sh ~/Downloads/hijaiyah-rekaman-20261113-1530.zip   # DRY_RUN=1 to preview
#  per take: ffmpeg -i <id>.wav -ac 1 -ar 24000 -codec:a libmp3lame -b:a 64k audio/<folder>/<id>.mp3
#  and its ?v= tag in audio/<folder>/voice.js → rec1 (then rec2 …); entries are added if TTS never made that clip
git add audio/huruf audio/extra audio/lines && git commit -m "Voice: real-voice recordings"
```

Keys never change, so recorded and TTS clips mix freely and you can record more later in any order; gen.py never
replaces `?v=rec…` files (only `--force --replace-recorded`). Before shipping: bump VERSION in `tools/build-sw.js`,
then `npm run sw` (the hijaiyah sounds in `audio/huruf` are precached; the `audio/extra` and `audio/lines` mp3s are
cached the first time they play, by their full `?v=` URL).
