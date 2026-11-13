#!/usr/bin/env bash
# Make Baby Mo Hijaiyah's voice clips in Google Cloud Shell (no API key needed: Cloud Shell is signed in) and push
# them to a new branch.
#   bash tools/voice/cloudshell.sh            -> every missing clip: Arabic words (audio/extra) + Mo's lines (audio/lines)
#   bash tools/voice/cloudshell.sh kata       -> only the Arabic words
#   bash tools/voice/cloudshell.sh lines      -> only Mo's Indonesian + English lines
#   bash tools/voice/cloudshell.sh <section> <voice>   e.g. lines ar-XA-Chirp3-HD-Kore (ID / EN use the same family)
# Default voice: Chirp3-HD Algenib, the Baby Mo voice. Clips already made, and real-voice recordings, are kept.
# BASE=<branch> starts from a branch other than main.
set -euo pipefail
MODE="${1:-all}"; VOICE="${2:-}"
case "$MODE" in all|kata|lines|huruf) ;; *) echo "usage: bash tools/voice/cloudshell.sh [all|kata|lines|huruf] [voice]" >&2; exit 2 ;; esac
echo "▶ Project: $(gcloud config get-value project 2>/dev/null)"
gcloud services enable texttospeech.googleapis.com speech.googleapis.com >/dev/null
git fetch -q origin && git checkout -q "${BASE:-main}" && git pull -q
ARGS=(); [ -n "$VOICE" ] && ARGS+=(--voice "$VOICE")
[ "$MODE" != "all" ] && ARGS+=(--only "$MODE")
python3 tools/voice/gen.py --dry-run "${ARGS[@]}" | grep -v '^   +'
python3 tools/voice/gen.py --test "${ARGS[@]}"
echo "▶ Making the clips (a few minutes)…"
python3 tools/voice/gen.py --check "${ARGS[@]}"
LOGIN="$(gh api user -q .login 2>/dev/null || echo babymo)"; UID_="$(gh api user -q .id 2>/dev/null || echo 0)"
G=(-c user.name="$LOGIN" -c user.email="${UID_}+${LOGIN}@users.noreply.github.com")
BR="voice-clips-$(date +%Y%m%d-%H%M)"; git checkout -q -b "$BR"
git "${G[@]}" add audio/huruf audio/extra audio/lines
[ -f tools/voice/check-report.json ] && git "${G[@]}" add tools/voice/check-report.json
git "${G[@]}" commit -q -m "Voice: Google TTS clips (${VOICE:-Chirp3-HD Algenib}, $MODE)"
git push -q -u origin "$BR"
echo ""
echo "✅ Done — pushed branch: $BR  (listen on tools/rekam/dengar.html, then merge)"
