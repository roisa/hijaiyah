#!/usr/bin/env python3
"""Make Baby Mo Hijaiyah's voice clips with Google Cloud Text-to-Speech, in the same voice as the Baby Mo app
(Chirp3-HD "Algenib": ar-XA-Chirp3-HD-Algenib, id-ID-Chirp3-HD-Algenib, en-US-Chirp3-HD-Algenib), then
(optionally) check each new clip with Google Speech-to-Text.

Clip lists (tools/voice/build-clips.js makes the last two from the game itself):
  clips-huruf.json  167 hijaiyah sounds already in audio/huruf (sec "huruf"; only made when a file is missing)
  clips-kata.json   Arabic words / syllables the games say that have no clip yet (sec "kata")
  clips-lines.json  every Indonesian and English line Mo says (sec "lines")
  Qur'an text is never on a list: verses are murottal only.
Output:
  audio/huruf/<id>.mp3 + voice.js  -> window.HIJ_VOICE      = {arabic text: "file.mp3?v=algenib"}
  audio/extra/<id>.mp3 + voice.js  -> window.HJ_VOICE_EXTRA = {arabic text: "file.mp3?v=algenib"}
  audio/lines/<id>.mp3 + voice.js  -> window.HJ_LINES       = {"id|<normalised text>": "file.mp3?v=algenib", "en|…": …}
js/audio.js plays these (Arabic: clipFor; Mo's lines: A.talk) and uses the phone's voice when there is no clip.
The ?v= tag is the voice ("algenib"), or recN for a real-voice recording (tools/voice/import-recordings.sh).
Recordings (?v=rec…) are never replaced, not even with --force (only --replace-recorded does that).

Auth (any one):
  - Google Cloud Shell / a signed-in gcloud: nothing to set (uses `gcloud auth print-access-token` and the
    current project for quota), or
  - GOOGLE_TTS_API_KEY environment variable (an API key with Text-to-Speech enabled, sent as ?key=), or
  - GOOGLE_ACCESS_TOKEN (+ GOOGLE_CLOUD_PROJECT), or
  - a network secret on the cloud environment that injects X-Goog-Api-Key for texttospeech.googleapis.com.

Usage:
  python3 tools/voice/gen.py --test                  # one clip per language: checks the credentials and voices
  python3 tools/voice/gen.py                         # every missing clip (resumes: files already made are kept)
  python3 tools/voice/gen.py --only kata,lines       # some sections: huruf, kata, lines
  python3 tools/voice/gen.py --check                 # + speech-to-text check of the new clips (check-report.json)
  python3 tools/voice/gen.py --force --only lines    # remake clips that exist (never the recordings)
  python3 tools/voice/gen.py --dry-run               # list what a run would make — no credentials, no API calls
  python3 tools/voice/gen.py --manifest              # only rewrite the three voice.js files from the files on disk
  python3 tools/voice/gen.py --voice ar-XA-Chirp3-HD-Kore [--voice-id id-ID-…] [--voice-en en-US-…]
"""
import argparse, base64, json, os, re, subprocess, sys, time, unicodedata, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
HERE = os.path.join(ROOT, "tools", "voice")
DEFAULT_VOICE = "ar-XA-Chirp3-HD-Algenib"
LANG_CODE = {"ar": "ar-XA", "en": "en-US", "id": "id-ID"}     # text-to-speech
STT_CODE = {"ar": "ar-SA", "en": "en-US", "id": "id-ID"}      # speech-to-text check

# section -> (folder, manifest variable, title, clip list)
SECTIONS = {
    "huruf": ("audio/huruf", "HIJ_VOICE", "Arabic clips for Pulau Hijaiyah: Arabic text -> file", "clips-huruf.json"),
    "kata":  ("audio/extra", "HJ_VOICE_EXTRA", "Arabic word clips for the games: Arabic text -> file", "clips-kata.json"),
    "lines": ("audio/lines", "HJ_LINES", "Mo's Indonesian / English lines: \"lang|normalised text\" -> file", "clips-lines.json"),
}

# ---------- credentials (looked up only when the API is really called) ----------
KEY = os.environ.get("GOOGLE_TTS_API_KEY", "").strip()
_auth = None
def auth():
    global _auth
    if _auth is None:
        token = os.environ.get("GOOGLE_ACCESS_TOKEN", "").strip()
        project = os.environ.get("GOOGLE_CLOUD_PROJECT", "").strip() or os.environ.get("DEVSHELL_PROJECT_ID", "").strip()
        if not KEY and not token and os.environ.get("NO_GCLOUD") != "1":
            token = _gcloud("auth", "print-access-token")
            if token and not project:
                project = _gcloud("config", "get-value", "project")
        _auth = (token, project)
    return _auth

def _gcloud(*args):
    try:
        r = subprocess.run(["gcloud", *args], capture_output=True, text=True, timeout=60)
        return r.stdout.strip() if r.returncode == 0 else ""
    except Exception:
        return ""

AUTH_HELP = """No working Google credentials, so no clip was made.
Use one of:
  - Google Cloud Shell (https://shell.cloud.google.com): bash tools/voice/cloudshell.sh   (signed in already), or
  - gcloud auth login && gcloud config set project <your-project>, then run this again, or
  - export GOOGLE_TTS_API_KEY=<an API key with the Cloud Text-to-Speech API enabled>, then run this again.
(--dry-run lists the clips without any credentials.)"""

def call(url, body):
    headers = {"Content-Type": "application/json"}
    token, project = auth()
    if KEY:
        url += ("&" if "?" in url else "?") + "key=" + KEY
    elif token:
        headers["Authorization"] = "Bearer " + token
        if project:
            headers["x-goog-user-project"] = project
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers=headers)
    for attempt in range(4):
        try:
            return json.load(urllib.request.urlopen(req, timeout=40))
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors="replace")[:400]
            if e.code in (429, 500, 503) and attempt < 3:
                time.sleep(2 ** attempt); continue
            # an API that was *just* enabled answers 403 for a few minutes while it switches on — wait and retry
            if e.code == 403 and ("has not been used" in msg or "SERVICE_DISABLED" in msg) and attempt < 3:
                for w in range(12):
                    print(f"   …Google is still switching the API on, waiting ({(w+1)*15}s)", flush=True)
                    time.sleep(15)
                    try:
                        return json.load(urllib.request.urlopen(req, timeout=40))
                    except urllib.error.HTTPError as e2:
                        if e2.code != 403: raise
                continue
            if e.code in (401, 403):
                how = "API key (GOOGLE_TTS_API_KEY)" if KEY else "gcloud / access token" if token else "none found (no GOOGLE_TTS_API_KEY, no signed-in gcloud)"
                raise SystemExit(f"AUTH ERROR — HTTP {e.code} from {url.split('?')[0]}\nCredentials used: {how}\n"
                                 f"Google said: {msg.strip()[:300]}\n\n{AUTH_HELP}")
            raise SystemExit(f"HTTP {e.code} from {url.split('?')[0]}:\n{msg}")
        except urllib.error.URLError as e:
            if attempt < 3:
                time.sleep(2 ** attempt); continue
            raise SystemExit(f"Network error: {e}")

def synth(text, lang, voice):
    body = {"input": {"text": speakable(text)}, "voice": {"languageCode": LANG_CODE[lang], "name": voice},
            "audioConfig": {"audioEncoding": "MP3", "sampleRateHertz": 24000}}   # Chirp voices: natural speed, no speakingRate
    r = call("https://texttospeech.googleapis.com/v1/text:synthesize", body)
    return base64.b64decode(r["audioContent"])

def transcribe(mp3, lang):
    body = {"config": {"encoding": "MP3", "sampleRateHertz": 24000, "languageCode": STT_CODE[lang], "maxAlternatives": 3},
            "audio": {"content": base64.b64encode(mp3).decode()}}
    r = call("https://speech.googleapis.com/v1p1beta1/speech:recognize", body)
    return [a.get("transcript", "") for res in r.get("results", []) for a in res.get("alternatives", [])]

def bare(s): return re.sub(r"[ً-ٰٟـ\s]", "", s)
def loose(s): return re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFD", s).lower())
def heard_ok(text, alts, lang):
    f = bare if lang == "ar" else loose
    t = f(text)
    return any(f(a) and (f(a) in t or t in f(a)) for a in alts)

# ---------- keys: the same rules as js/audio.js and tools/voice/voicekey.js (tools/voice/test-keys.js) ----------
EMO = re.compile("[\U0001F000-\U0001FAFF\U000E0020-\U000E007F\u2190-\u21FF\u2300-\u23FF\u25A0-\u25FF"
                 "\u2600-\u27BF\u2B00-\u2BFF\uFE00-\uFE0F\u200D\u20E3\u00A9\u00AE\u2122\u2139\u3030\u303D\u3297\u3299]")
EDGE = "\\s.,!?;:…،؛؟۔。'\"()\\[\\]\\-—•·*~_"
LEAD = re.compile("^[" + EDGE + "]+")
TRAIL = re.compile("[" + EDGE + "]+$")

def speakable(t):
    """the text as it is sent to text-to-speech: no emoji, tidy spaces and punctuation (case kept)"""
    s = EMO.sub("", unicodedata.normalize("NFC", str(t)))
    s = re.sub("[‘’ʼ`´]", "'", s); s = re.sub("[“”„«»]", '"', s); s = re.sub("[‒–―]", "—", s)
    s = re.sub(r"\s+", " ", s); s = re.sub(r" ([,.!?;:…])", r"\1", s); s = re.sub(r"\s*—\s*", " — ", s)
    s = re.sub("([.!?…؟])[.!?…؟]+", r"\1", s)
    return s.strip()

def norm(t, lang):
    s = speakable(t).replace("ـ", "")
    s = TRAIL.sub("", LEAD.sub("", s))
    return s if lang == "ar" else s.lower()

def ar_key(t):
    """js/audio.js norm(): NFC, no tatweel, whitespace collapsed"""
    return re.sub(r"\s+", " ", unicodedata.normalize("NFC", str(t)).replace("ـ", "")).strip()

def key_of(x):
    if x["sec"] == "huruf":
        return x["t"]                      # audio/huruf/voice.js: the plain text, as before
    if x["sec"] == "kata":
        k = ar_key(x["t"])
    else:
        k = x["lang"] + "|" + norm(x["t"], x["lang"])
    if x.get("key") and x["key"] != k:
        raise SystemExit(f"key mismatch for {x['id']}: list has {x['key']!r}, gen.py makes {k!r} (run node tools/voice/test-keys.js)")
    return k

def tag(voice):
    return voice.split("-")[-1].lower()   # new voice -> new URL (no stale cached audio)

def family(voice, lang):
    """ar-XA-Chirp3-HD-Algenib -> en-US-Chirp3-HD-Algenib / id-ID-Chirp3-HD-Algenib"""
    parts = voice.split("-")
    return "-".join(LANG_CODE[lang].split("-") + parts[2:]) if len(parts) > 2 else voice

def load(sec):
    p = os.path.join(HERE, SECTIONS[sec][3])
    items = json.load(open(p, encoding="utf-8")) if os.path.exists(p) else []
    for x in items:
        x.setdefault("lang", "ar"); x["sec"] = sec
    return items

def read_manifest(sec):
    try:
        s = open(os.path.join(ROOT, SECTIONS[sec][0], "voice.js"), encoding="utf-8").read()
        m = re.search(r"=\s*(\{.*\})\s*;?\s*$", s, re.S)
        return json.loads(m.group(1)) if m else {}
    except Exception:
        return {}

def file_ok(fp):
    return os.path.exists(fp) and os.path.getsize(fp) > 500

def write_manifest(sec, items, voices, new_tags=None):
    """<folder>/voice.js: every clip of the list that is on disk -> "<id>.mp3?v=<tag>". The tag is the one just
    given (made / recorded now), else the one already in the manifest, else the voice's. Entries of the old
    manifest whose file is still on disk but that are no longer on a list are kept."""
    folder, var, title, _ = SECTIONS[sec]
    old = read_manifest(sec)
    old_tag = {str(v).split("?")[0]: (str(v).partition("?v=")[2] or "") for v in old.values()}
    new_tags = new_tags or {}
    man = {}
    for k, v in old.items():
        f = str(v).split("?")[0]
        if file_ok(os.path.join(ROOT, folder, f)):
            man[k] = v
    for x in items:
        fn = x["id"] + ".mp3"
        if not file_ok(os.path.join(ROOT, folder, fn)):
            continue
        t = new_tags.get(x["id"]) or old_tag.get(fn) or tag(voices[x["lang"]])
        man[key_of(x)] = fn + "?v=" + t
    if man == old and os.path.exists(os.path.join(ROOT, folder, "voice.js")):
        return False
    os.makedirs(os.path.join(ROOT, folder), exist_ok=True)
    with open(os.path.join(ROOT, folder, "voice.js"), "w", encoding="utf-8") as f:
        f.write(f"/* {title} (generated by tools/voice/gen.py, voices {voices['ar']}, {voices['id']}, {voices['en']}) */\n")
        f.write(f"window.{var}=" + json.dumps(man, ensure_ascii=False) + ";\n")
    print(f"wrote {folder}/voice.js ({len(man)} clips)")
    return True

def recorded(sec):
    """ids whose manifest tag is ?v=rec… (a real-voice recording)"""
    return {str(v).split("?")[0][:-4] for v in read_manifest(sec).values() if str(v).partition("?v=")[2].startswith("rec")}

def mark_recorded(ids, voices, force_tag=""):
    """called by import-recordings.sh after it converted <id>.wav -> <id>.mp3: bump each id's tag to rec<N+1>"""
    changed = 0
    for sec in SECTIONS:
        items = load(sec)
        by = {x["id"]: x for x in items}
        mine = [i for i in ids if i in by]
        if not mine:
            continue
        old = read_manifest(sec)
        tags = {}
        for i in mine:
            cur = [str(v).partition("?v=")[2] for v in old.values() if str(v).split("?")[0] == i + ".mp3"]
            n = max([int(m.group(1)) for t in cur for m in [re.fullmatch(r"rec(\d+)", t)] if m] or [0])
            tags[i] = force_tag or "rec%d" % (n + 1)
            print(f"  {SECTIONS[sec][0]}/{i}.mp3  ?v={cur[0] if cur else '(new)'} -> ?v={tags[i]}")
            changed += 1
        write_manifest(sec, items, voices, tags)
    unknown = [i for i in ids if not any(i in {x['id'] for x in load(s)} for s in SECTIONS)]
    for i in unknown:
        print(f"  note: {i} is not on any clip list (skipped)")
    print(f"updated the tags of {changed} clips")

def main():
    ap = argparse.ArgumentParser(description="Make the game's voice clips with Google Cloud Text-to-Speech.")
    ap.add_argument("--voice", default=DEFAULT_VOICE, help="Arabic voice (default %(default)s)")
    ap.add_argument("--voice-en", help="English voice (default: the Arabic voice's family in en-US)")
    ap.add_argument("--voice-id", help="Indonesian voice (default: the Arabic voice's family in id-ID)")
    ap.add_argument("--only", help="comma list of sections: huruf, kata, lines")
    ap.add_argument("--check", action="store_true", help="speech-to-text check of the clips made in this run")
    ap.add_argument("--test", action="store_true", help="make one clip per language (not saved) to check the credentials")
    ap.add_argument("--force", action="store_true", help="remake clips that already exist (never the recordings)")
    ap.add_argument("--replace-recorded", action="store_true", help="with --force: also replace real-voice recordings (?v=rec…)")
    ap.add_argument("--dry-run", action="store_true", help="only list the clips that would be made (no credentials, no API calls)")
    ap.add_argument("--manifest", action="store_true", help="only rewrite the voice.js files from the files on disk")
    ap.add_argument("--mark-recorded", nargs="+", metavar="ID", help=argparse.SUPPRESS)   # used by import-recordings.sh
    ap.add_argument("--tag", default="", help=argparse.SUPPRESS)
    a = ap.parse_args()
    voices = {"ar": a.voice, "en": a.voice_en or family(a.voice, "en"), "id": a.voice_id or family(a.voice, "id")}
    if a.mark_recorded:
        return mark_recorded(a.mark_recorded, voices, a.tag)
    secs = list(SECTIONS)
    if a.only:
        secs = [s.strip() for s in a.only.split(",") if s.strip()]
        bad = [s for s in secs if s not in SECTIONS]
        if bad: raise SystemExit(f"--only: unknown section {bad[0]!r} (huruf, kata, lines)")
    if a.manifest:
        for sec in SECTIONS: write_manifest(sec, load(sec), voices)
        return
    def todo(sec):
        folder = SECTIONS[sec][0]; rec = set() if a.replace_recorded else recorded(sec)
        return [x for x in load(sec) if not file_ok(os.path.join(ROOT, folder, x["id"] + ".mp3")) or (a.force and x["id"] not in rec)]
    if a.dry_run:
        n = 0
        for sec in secs:
            items, td = load(sec), todo(sec)
            for x in items: key_of(x)          # the keys must agree with js/audio.js
            print(f"[{sec}] {len(items)} clips, {len(items) - len(td)} already made, {len(td)} to make  -> {SECTIONS[sec][0]}/")
            for x in td:
                print(f"   + {SECTIONS[sec][0]}/{x['id']}.mp3  {x['lang']}  {voices[x['lang']]}  {speakable(x['t'])[:70]}  ({x.get('h','')[:40]})")
            n += len(td)
        print(f"dry run: {n} clips would be made, {sum(len(speakable(x['t'])) for s in secs for x in todo(s))} characters (nothing was sent)")
        return
    if a.test:
        sample = {"ar": "كَتَبَ", "id": "Masya Allah, hebat!", "en": "Masha Allah, great!"}
        for l in ("ar", "id", "en"):
            mp3 = synth(sample[l], l, voices[l])
            print(f"OK — {voices[l]}: got {len(mp3)} bytes of audio for {sample[l]}")
        return
    report, made = [], 0
    for sec in secs:
        folder = SECTIONS[sec][0]; d = os.path.join(ROOT, folder); os.makedirs(d, exist_ok=True)
        items = load(sec); want = {x["id"] for x in todo(sec)}; new_tags = {}
        for i, x in enumerate(items, 1):
            key_of(x)
            if x["id"] not in want:
                continue
            fp = os.path.join(d, x["id"] + ".mp3")
            mp3 = synth(x["t"], x["lang"], voices[x["lang"]])
            open(fp, "wb").write(mp3); made += 1; new_tags[x["id"]] = tag(voices[x["lang"]])
            line = f"[{sec} {i}/{len(items)}] {x['lang']} {speakable(x['t'])[:70]}  {len(mp3)}B"
            if a.check:
                alts = transcribe(mp3, x["lang"]); ok = heard_ok(x["t"], alts, x["lang"])
                line += f"  heard={alts[:2]}  {'OK' if ok else 'CHECK'}"
                report.append({"id": x["id"], "text": x["t"], "lang": x["lang"], "sec": sec, "heard": alts, "ok": ok, "file": f"{folder}/{x['id']}.mp3"})
            print(line, flush=True)
        write_manifest(sec, items, voices, new_tags)
    print(f"made {made} new clips")
    if report:
        p = os.path.join(HERE, "check-report.json")
        try:
            prev = [r for r in json.load(open(p, encoding="utf-8")) if r.get("file") not in {x["file"] for x in report}]
        except Exception:
            prev = []
        json.dump(prev + report, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        bad = [r for r in report if not r["ok"]]
        for r in bad:
            print(f"   CHECK {r['lang']} {r['text'][:70]}  heard={r['heard'][:1]}")
        print(f"\nspeech check: {len(report)-len(bad)} OK, {len(bad)} to listen to (tools/voice/check-report.json, tools/rekam/dengar.html)")

if __name__ == "__main__":
    main()
