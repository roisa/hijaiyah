#!/usr/bin/env bash
# Downloads the murottal (one mp3 per ayah) for the surahs in Jilid 7 into audio/quran/, so the game plays
# a real qari offline and the app never calls a third-party server (Kids Category).
# Default reciter: Mahmoud Khalil Al-Husary (murattal, the classic teaching recitation), from everyayah.com.
# Check the reciter's licence before shipping to the App Store / Play Store.
# Usage: tools/fetch-murottal.sh [Husary_128kbps | Husary_Muallim_128kbps | Alafasy_128kbps | Minshawy_Murattal_128kbps]
set -euo pipefail
cd "$(dirname "$0")/.."
R="${1:-Husary_128kbps}"
mkdir -p audio/quran
# surah number : ayah count (Al-Fatihah, Al-Ikhlas, An-Nas, Al-Falaq, Al-Kautsar, Al-Asr, An-Nasr, Quraisy,
# Al-Lahab, Al-Fil, Al-Kafirun, Al-Ma'un, Al-Humazah, At-Takatsur, Al-Qari'ah)
for sa in 1:7 112:4 114:6 113:5 108:3 103:3 110:3 106:4 111:5 105:5 109:6 107:7 104:9 102:8 101:11; do
  s=${sa%%:*}; n=${sa##*:}
  for a in $(seq 1 "$n"); do
    f=$(printf "%03d%03d.mp3" "$s" "$a")
    [ -s "audio/quran/$f" ] && continue
    curl -fsSL --retry 3 -o "audio/quran/$f" "https://everyayah.com/data/$R/$f" && echo "ok $f" || echo "FAILED $f"
  done
done
echo "Done. Run: node tools/build-sw.js  (adds the files to the offline cache)"
