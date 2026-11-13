# Baby Mo Hijaiyah

Game belajar membaca huruf hijaiyah sampai Al-Qur'an bersama Baby Mo — dibuat untuk Ibra.
Web dulu (mudah dicek di HP/laptop), lalu jadi aplikasi iOS & Android dengan Capacitor (sama seperti Baby Mo app).

**Kurikulum lengkap & ide game:** [docs/CURRICULUM.md](docs/CURRICULUM.md) — 7 dunia, 77 level, dari أَ بَ sampai surat-surat Juz 'Amma.

## Coba di komputer

```bash
npm start            # python3 -m http.server 8811
# buka http://localhost:8811  (di HP: http://<ip-laptop>:8811)
```

Tips: di **Abi & Umi** (jawab soal penjumlahan) ada *Buka semua level* untuk mencoba semua jilid langsung.
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
