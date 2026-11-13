#!/usr/bin/env bash
# Put real-voice recordings from the recording page (tools/rekam/ → "Download ZIP") into the game.
#   bash tools/voice/import-recordings.sh ~/Downloads/hijaiyah-rekaman-20261113-1530.zip
#   DRY_RUN=1 bash tools/voice/import-recordings.sh <zip>      # only list what would change
#   TAG=rec5 bash tools/voice/import-recordings.sh <zip>       # force one ?v= tag for every clip
# For each take audio/<folder>/<id>.wav in the ZIP (folder = huruf, extra or lines) it
#   1. converts it to the game's file audio/<folder>/<id>.mp3 (24 kHz mono 64 kbps MP3, overwriting the TTS clip):
#        ffmpeg -i <id>.wav -ac 1 -ar 24000 -codec:a libmp3lame -b:a 64k audio/<folder>/<id>.mp3
#   2. sets that clip's ?v= tag in audio/<folder>/voice.js to rec1 (then rec2, rec3 … on later imports), adding the
#      entry if TTS never made that clip, so phones and the service worker fetch the new audio.
# The keys never change, so a partly recorded set mixes real-voice and TTS clips; gen.py never replaces ?v=rec… files.
# Needs ffmpeg (with libmp3lame) and python3.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ZIP="${1:-}"
[ -n "$ZIP" ] && [ -f "$ZIP" ] || { echo "usage: bash tools/voice/import-recordings.sh <hijaiyah-rekaman-….zip>" >&2; exit 2; }
command -v ffmpeg >/dev/null || { echo "ffmpeg is needed (brew install ffmpeg / apt-get install ffmpeg)" >&2; exit 2; }
ZIP="$(cd "$(dirname "$ZIP")" && pwd)/$(basename "$ZIP")"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
python3 -I -m zipfile -e "$ZIP" "$TMP"          # zipfile drops absolute paths and ".." parts
LISTS=("$ROOT/tools/voice/clips-huruf.json" "$ROOT/tools/voice/clips-kata.json" "$ROOT/tools/voice/clips-lines.json")

IDS=(); N=0
while IFS= read -r -d '' F; do
  REL="${F#"$TMP"/}"; DIR="$(dirname "$REL")"; NAME="$(basename "$REL")"; ID="${NAME%.*}"
  case "$DIR" in audio/huruf|audio/extra|audio/lines) ;; *) echo "skip $REL (not in audio/huruf, audio/extra or audio/lines)"; continue ;; esac
  [[ "$ID" =~ ^[A-Za-z0-9_-]+$ ]] || { echo "skip $REL (odd file name)"; continue; }
  grep -q "\"id\": *\"$ID\"" "${LISTS[@]}" || { echo "skip $REL (no such clip id in tools/voice/clips-*.json)"; continue; }
  OUT="$ROOT/$DIR/$ID.mp3"
  if [ -n "${DRY_RUN:-}" ]; then echo "would make $DIR/$ID.mp3 from $NAME"; else
    ffmpeg -nostdin -v error -y -i "$F" -ac 1 -ar 24000 -codec:a libmp3lame -b:a 64k "$OUT"
    echo "made $DIR/$ID.mp3"
  fi
  IDS+=("$ID"); N=$((N+1))
done < <(find "$TMP/audio" -type f \( -name '*.wav' -o -name '*.m4a' -o -name '*.webm' -o -name '*.ogg' -o -name '*.mp3' \) -print0 2>/dev/null | sort -z)

[ "$N" -gt 0 ] || { echo "no recordings found in $ZIP"; exit 1; }

if [ -n "${DRY_RUN:-}" ]; then
  echo "(dry run) would set ?v=${TAG:-recN} for: ${IDS[*]}"
else
  NO_GCLOUD=1 python3 "$ROOT/tools/voice/gen.py" --mark-recorded "${IDS[@]}" ${TAG:+--tag "$TAG"}
fi

echo ""
echo "✅ $N recording(s) ${DRY_RUN:+(dry run) }in place. Next:"
echo "   1. listen: python3 -m http.server 8811, then open http://127.0.0.1:8811/tools/rekam/dengar.html (and play the game)"
echo "   2. git add audio/huruf audio/extra audio/lines && git commit -m 'Voice: real-voice recordings' && git push"
echo "   3. npm run sw (bump VERSION in tools/build-sw.js first) before shipping, as for any release"
