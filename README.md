# Baby Mo Hijaiyah

**English · [Bahasa Indonesia](#bahasa-indonesia)**

A game that teaches children to read Arabic letters all the way to reading the Qur'an, with Baby Mo.
Works in **English and Bahasa Indonesia**: first launch asks for the language (like the Baby Mo app), and the
EN/ID pill in the top bar switches everything at once — menus, instructions, Mo's voice, letter names, Latin hints
(international spelling in English: th, dh, sh, ṣ, ḍ, ṭ, ẓ), surah names and verse translations.

- 7 books, 77 levels: the Iqra order (sounds first, small steps) with Ummi habits (listen → copy, daily review,
  a parent check before moving on), then a Qur'an book with Al-Fatihah and 14 Juz 'Amma surahs.
- All levels: [docs/LEVELS.en.md](docs/LEVELS.en.md) · method and game design: [docs/CURRICULUM.md](docs/CURRICULUM.md)
- **Play online:** https://roisa.github.io/hijaiyah/ (published automatically from this repo)
- **App Store kit:** https://roisa.github.io/hijaiyah/kit/ — screenshots, banners, artwork and listing text (`node tools/kit/build-kit.js` remakes it)
- **Reels:** 10 promo reels (9:16, ID + EN) on the kit page; edit them in https://roisa.github.io/hijaiyah/kit/reels/editor.html or `kit/reels/reels.js`, render with `node tools/reels/render.js`
- Run locally: `npm start`, open http://localhost:8811 · checks: `npm run check`
- Kids Category ready: no ads, no tracking, progress stays on the device, parent area behind a parental gate.

---

<a id="bahasa-indonesia"></a>
## Baby Mo Hijaiyah (Bahasa Indonesia)

Game belajar membaca huruf hijaiyah sampai Al-Qur'an bersama Baby Mo — dibuat untuk Ibra.
Web dulu (mudah dicek di HP/laptop), lalu jadi aplikasi iOS & Android dengan Capacitor (sama seperti Baby Mo app).

**Kurikulum lengkap & ide game:** [docs/CURRICULUM.md](docs/CURRICULUM.md) · semua level: [docs/LEVELS.id.md](docs/LEVELS.id.md) — 7 dunia, 77 level, dari أَ بَ sampai surat-surat Juz 'Amma.

## Coba online

https://roisa.github.io/hijaiyah/ — diperbarui otomatis setiap ada perubahan (GitHub Actions → `gh-pages`).

## Coba di komputer

```bash
npm start            # python3 -m http.server 8811
# buka http://localhost:8811  (di HP: http://<ip-laptop>:8811)
```

Bahasa: saat pertama dibuka ada pilihan Bahasa Indonesia / English; tombol ID/EN di atas mengganti semuanya.
Tips: di **Orang Tua** (jawab soal penjumlahan) ada *Buka semua level* untuk mencoba semua jilid langsung.
`#map` atau `#level=5-5` di URL langsung membuka peta / level tertentu.

## Struktur

| | |
|---|---|
| `index.html`, `css/app.css` | Halaman & tampilan (terang + gelap) |
| `js/letters.js` | 28 huruf, nama, latin, huruf mirip, pembuat suku kata |
| `js/curriculum.js` | Semua jilid & level (resep → langkah acak setiap main) |
| `js/games.js` | Mini-game: talaqqi, tebalkan, pilih, benar/salah, balon, kereta, jembatan, memory, susun, kelompok, mushaf, tashih |
| `js/app.js` | Beranda, peta, jalannya level, hasil & stiker, area orang tua (dengan gerbang orang tua), sertifikat |
| `js/audio.js` | Rekaman suara → suara HP; murottal; efek suara; rekam suara sendiri (tidak diunggah) |
| `js/quran.js` | Dibuat oleh `tools/build-quran.js` dari babymo-web — jangan diedit manual |
| `assets/` | Baby Mo render 1, render 2 (hanya badan atas), Abi & Umi, logo, font — dari babymo-app |
| `audio/huruf/` | Rekaman huruf & kata dari babymo-app (`hijaiyah-voice`) |

## Alat

```bash
npm run check                 # cek potongan ayat persis + daftar suara yang belum direkam (tools/clips-needed.json)
tools/fetch-murottal.sh       # unduh murottal Jilid 7 ke audio/quran/
npm run sw                    # perbarui daftar file offline (sw.js) — naikkan VERSION saat rilis
node tools/build-quran.js ../babymo-web   # ambil ulang teks surat
```

## Jadi aplikasi iOS / Android

```bash
tools/fetch-murottal.sh && npm run build:app    # dist/ tanpa streaming pihak ketiga
npm i -D @capacitor/cli @capacitor/core @capacitor/ios @capacitor/android
npx cap add ios && npx cap add android && npx cap sync
```
Tambahkan `NSMicrophoneUsageDescription` (fitur "Rekam suaraku") di Info.plist. Kategori Anak: tidak ada iklan, tidak ada
pelacakan, progres hanya di perangkat, area orang tua di balik gerbang orang tua.
