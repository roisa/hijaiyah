/* App Store kit content for Baby Mo Hijaiyah: banner captions, listing text (with Apple's limits),
   app facts, age rating, privacy, review notes and the submission checklist. Every claim here is
   checked against the game (tools/kit/build-kit.js fails if a listing field is over its limit). */

// One entry per screenshot/banner: which screen to capture, the caption in both languages, and the Mo pose (render 1)
const SHOTS = [
  { key: "home", mo: "pose-41",
    id: { k: "BABY MO HIJAIYAH", t1: "Belajar ngaji", t2: "sambil bermain", sub: "Dari alif sampai surat pendek, bersama Baby Mo", pills: ["Tanpa iklan", "Bisa offline"] },
    en: { k: "BABY MO HIJAIYAH", t1: "Learn to read", t2: "the Qur'an by playing", sub: "From alif to short surahs, with Baby Mo", pills: ["No ads", "Works offline"] } },
  { key: "learn", mo: "pose-08",
    id: { k: "TALAQQI", t1: "Dengar, tirukan,", t2: "lalu baca sendiri", sub: "Mo membaca dulu, si kecil menirukan — seperti di Ummi" },
    en: { k: "LISTEN & COPY", t1: "Listen, copy,", t2: "then read alone", sub: "Mo reads first, your child copies — the talaqqi way" } },
  { key: "train", mo: "idea",
    id: { k: "KERETA BACA", t1: "Membaca seperti", t2: "halaman Iqra", sub: "Dari kanan ke kiri, langsung bunyi tanpa dieja" },
    en: { k: "READING TRAIN", t1: "Read like a", t2: "real Iqra page", sub: "Right to left, sounding out without spelling" } },
  { key: "pop", mo: "yeyy",
    id: { k: "MINI-GAME", t1: "Ada game seru", t2: "di setiap langkah", sub: "Balon, jembatan, kereta, kartu memori & lainnya" },
    en: { k: "MINI-GAMES", t1: "A fun game", t2: "in every step", sub: "Balloons, bridges, trains, memory cards & more" } },
  { key: "map", mo: "pose-20",
    id: { k: "PETA BELAJAR", t1: "7 jilid,", t2: "77 level", sub: "Urutan Iqra dari alif sampai Al-Qur'an" },
    en: { k: "LEARNING MAP", t1: "7 books,", t2: "77 levels", sub: "The Iqra order, from alif to the Qur'an" } },
  { key: "results", mo: "wow",
    id: { k: "HADIAH", t1: "Bintang, stiker", t2: "& hari beruntun", sub: "Hadiah yang bikin si kecil ingin lanjut belajar" },
    en: { k: "REWARDS", t1: "Stars, stickers", t2: "& daily streaks", sub: "Rewards that make little ones want one more level" } },
  { key: "tajwid", mo: "ok",
    id: { k: "TAJWID", t1: "Tajwid jadi", t2: "mudah dan seru", sub: "Izhar, idgham, iqlab & ikhfa langsung di ayat Al-Qur'an" },
    en: { k: "TAJWID", t1: "Tajwid made", t2: "simple and fun", sub: "Izhar, idgham, iqlab & ikhfa inside real verses" } },
  { key: "ayah", mo: "thank-you",
    id: { k: "AL-QUR'AN", t1: "Baca surat", t2: "langsung dari mushaf", sub: "Al-Fatihah dan 14 surat Juz 'Amma, dengan murottal" },
    en: { k: "AL-QUR'AN", t1: "Read real surahs", t2: "from the mushaf", sub: "Al-Fatihah and 14 surahs of Juz 'Amma, with recitation" } },
  { key: "parents", mo: "yes",
    id: { k: "UNTUK ABI & UMI", t1: "Tashih bersama", t2: "Abi & Umi", sub: "Laporan belajar dan cek bacaan di setiap level" },
    en: { k: "FOR PARENTS", t1: "Check the reading", t2: "together", sub: "A progress report and a parent check in every level" } },
  { key: "dark", mo: "pose-12",
    id: { k: "UNTUK ABI & UMI", t1: "Aman untuk si kecil,", t2: "tanpa iklan & akun", sub: "Tanpa pelacakan · progres tersimpan di perangkat", pills: ["Tanpa iklan", "Tanpa akun", "Bisa offline"] },
    en: { k: "FOR PARENTS", t1: "Safe for kids,", t2: "no ads or accounts", sub: "No tracking · progress stays on the device", pills: ["No ads", "No account", "Offline"] } }
];

const LISTING = {
  name: { lim: 30, id: "Baby Mo Hijaiyah: Ngaji Anak", en: "Baby Mo Hijaiyah: Read Quran" },
  subtitle: { lim: 30, id: "Iqra, Tajwid & Surat Pendek", en: "Arabic Letters, Iqra & Tajwid" },
  promo: { lim: 170,
    id: "Dari alif sampai Al-Fatihah: 77 level seru bersama Baby Mo. Urutan Iqra, kebiasaan Ummi, tanpa iklan, tanpa akun, dan bisa tanpa internet.",
    en: "From alif to Al-Fatihah: 77 playful levels with Baby Mo. The Iqra order with Ummi habits — no ads, no account, and it works offline." },
  keywords: { lim: 100, bytes: true,
    id: "iqro,iqra,hijaiyah,mengaji,ngaji,huruf arab,tajwid,alquran,juz amma,ummi,tpa,paud,anak muslim",
    en: "quran,arabic,alphabet,alif ba ta,iqra,tajwid,muslim kids,noorani,qaida,juz amma,hijaiyah,islamic" },
  desc: { lim: 4000,
    id: `Baby Mo Hijaiyah mengajak si kecil belajar membaca Al-Qur'an dari huruf pertama sampai surat-surat pendek — sambil bermain bersama Baby Mo.

Urutan materinya mengikuti Iqra jilid 1–6 (langsung bunyi, tanpa dieja, langkah kecil), ditambah kebiasaan baik metode Ummi: talaqqi (Mo membaca, si kecil menirukan), murajaah harian, dan tashih bersama Abi/Umi sebelum naik level.

7 JILID, 77 LEVEL
• Jilid 1 · Pulau Fathah — 28 huruf berharakat fathah
• Jilid 2 · Hutan Sambung — huruf bersambung dan bacaan panjang
• Jilid 3 · Gunung Kasrah-Dhammah — bunyi i dan u, mad
• Jilid 4 · Lautan Tanwin & Sukun — an in un, huruf mati, qalqalah
• Jilid 5 · Kota Tasydid — tasydid, ghunnah, alif lam, lafaz Allah, waqaf
• Jilid 6 · Istana Tajwid — hukum nun & mim mati, mad, langsung di ayat Al-Qur'an
• Al-Qur'an · Al-Fatihah dan 14 surat Juz 'Amma, lalu wisuda dengan sertifikat

GAME DI SETIAP LANGKAH
Tebalkan huruf, pecahkan balon, naik kereta baca, bantu Mo menyeberang jembatan, cari pasangan kartu, susun kata dan ayat, kelompokkan hukum tajwid — semuanya dengan suara Arab yang direkam.

HADIAH YANG BIKIN SEMANGAT
Bintang di setiap level, buku stiker, kombo, peta pulau yang terbuka satu per satu, misi harian, hari beruntun, dan ujian jilid dengan 3 hati. Yang tadi salah diulang lagi dengan lembut di akhir level.

UNTUK ABI & UMI
• Laporan belajar per jilid dan tashih (cek bacaan) di setiap level
• Bahasa Indonesia dan English, tampilan terang dan gelap
• Tanpa iklan, tanpa akun, tanpa pelacakan — progres hanya tersimpan di perangkat
• Area orang tua dilindungi gerbang orang tua
• Bisa dimainkan tanpa internet

Teks Al-Qur'an mengikuti penulisan Mushaf Madinah.`,
    en: `Baby Mo Hijaiyah helps children learn to read the Qur'an, from the very first letter to short surahs — by playing with Baby Mo.

The lessons follow the Iqra order, books 1–6 (sounds first, no spelling out, small steps), with the good habits of the Ummi method: talaqqi (Mo reads, your child copies), a little daily review, and a reading check with a parent before moving on.

7 BOOKS, 77 LEVELS
• Book 1 · Fathah Island — all 28 letters with fathah
• Book 2 · Joining Forest — joined letters and the long vowel
• Book 3 · Kasrah-Dhammah Mountain — i and u sounds, mad
• Book 4 · Tanwin & Sukun Sea — an in un, sukun, qalqalah
• Book 5 · Tasydid Town — shaddah, ghunnah, al-, the word Allah, stopping
• Book 6 · Tajwid Palace — nun and mim rules and mad, inside real verses
• Al-Qur'an · Al-Fatihah and 14 surahs of Juz 'Amma, then a graduation certificate

A GAME IN EVERY STEP
Trace letters, pop balloons, ride the reading train, help Mo cross the bridge, match cards, build words and verses, sort the tajwid rules — all with recorded Arabic audio.

REWARDS THAT KEEP THEM GOING
Stars in every level, a sticker book, combos, an island map that opens step by step, daily missions, streaks, and book tests with 3 hearts. Anything missed comes back gently at the end of the level.

FOR PARENTS
• A progress report for every book and a reading check in every level
• English and Bahasa Indonesia, light and dark mode
• No ads, no account, no tracking — progress stays on the device
• Parent area behind a parental gate
• Works offline

The Qur'an text follows the Madinah Mushaf spelling.` },
  whatsNew: { lim: 4000, id: "Versi pertama Baby Mo Hijaiyah. Selamat belajar!", en: "The first version of Baby Mo Hijaiyah. Happy learning!" }
};

const FACTS = [
  ["Primary language", "Indonesian", "App Information", "Add English (U.S.) as a second localization."],
  ["Bundle ID", "id.babymo.hijaiyah", "App Information (from Xcode, capacitor.config.json)"],
  ["SKU", "babymo-hijaiyah-ios-001", "New App form (any unique code)"],
  ["Version", "1.0", "Version (MARKETING_VERSION in Xcode)"],
  ["Primary category", "Education", "App Information → Category"],
  ["Secondary category", "Games — subcategories: Educational, Family", "App Information → Category"],
  ["Kids Category", "Yes — Ages 5 and Under (or 6–8; choose one band)", "App Information → Age Rating → Made for Kids", "The game is built for about 4–7 years old."],
  ["Support URL", "https://babymo.id/support/", "Version → Support URL (required)"],
  ["Marketing URL", "https://roisa.github.io/hijaiyah/", "Version → Marketing URL", "Or a babymo.id page once there is one."],
  ["Privacy Policy URL", "https://babymo.id/privacy/", "App Privacy → Privacy Policy URL", "Add a short Baby Mo Hijaiyah section to that page (see checklist)."],
  ["Copyright", "2026 Ibra Creative", "Version → Copyright", "Apple adds the © sign."],
  ["Price", "Free", "Pricing and Availability"],
  ["Sign-in required for review", "No — the app has no accounts", "App Review Information → Sign-In Information (uncheck)"]
];

const AGE = [
  ["Cartoon or fantasy violence", "None"], ["Realistic violence", "None"], ["Prolonged graphic or sadistic violence", "None"],
  ["Profanity or crude humor", "None"], ["Mature or suggestive themes", "None"], ["Horror or fear themes", "None"],
  ["Medical or treatment information", "None"], ["Alcohol, tobacco or drug use or references", "None"],
  ["Sexual content or nudity", "None"], ["Simulated gambling", "None"], ["Contests", "None"],
  ["Unrestricted web access", "No"], ["User-generated content", "No"], ["Messaging and chat", "No"],
  ["Advertising", "No"], ["Parental controls", "No"], ["Age assurance", "No"]
];

const PRIVACY = [
  ["Do you or your third-party partners collect data from this app?", "No — Data Not Collected"],
  ["Microphone", "Used only for \"Record me\": the child hears their own voice right away. The recording stays in memory, is never saved or sent, and disappears when the screen closes — so it is not \"collected\"."],
  ["Child's name, stars, stickers, progress", "Stored only on the device (local storage); never sent anywhere"],
  ["Analytics, ads, third-party SDKs", "None"],
  ["Network", "None in the app build: the recitation audio is bundled (the web version may stream it)"]
];

const REVIEW_NOTES = `Baby Mo Hijaiyah is a free app that teaches children (about 4–7 years old) to read Arabic letters up to short surahs of the Qur'an, as a game. There are no accounts, ads, in-app purchases, chat or social features.

• No login: open the app, choose Bahasa Indonesia or English, optionally type the child's first name (stored only on the device), and play.
• To see later levels quickly: Parents tab (answer the grown-up sum) → Settings → "Unlock all levels".
• Microphone (optional): only for the "Record me" button, so the child can hear their own reading. The recording is kept in memory, never saved or uploaded. If permission is denied, everything else works.
• Arabic audio plays recordings bundled with the app, with the device's speech voice as a fallback. The Qur'an recitation for the surah levels is bundled too.
• No analytics or third-party SDKs; the app makes no network requests. The parent area is behind a parental gate (a maths question for grown-ups).
• Works fully offline.

Privacy policy: https://babymo.id/privacy/ · Support: https://babymo.id/support/`;

const CHECK = [
  ["Download the recitation and check its licence", "Run tools/fetch-murottal.sh (Syaikh Al-Husary by default) and confirm the reciter's licence allows use in an app. Then npm run sw."],
  ["Ustadz / qari review", "Have a teacher check the Qur'an text, the tajwid examples (Jilid 4–6) and the recorded letters before release."],
  ["Record the missing word clips", "tools/clips-needed.json lists 225 Arabic words that still use the phone's voice; voice them with babymo-app/tools/voice/gen.py."],
  ["Build the app", "npm run build:app → dist/ (no streaming), then npm i -D @capacitor/cli @capacitor/core @capacitor/ios @capacitor/android, npx cap add ios, npx cap sync ios."],
  ["Info.plist", "NSMicrophoneUsageDescription: \"Baby Mo Hijaiyah uses the microphone only so your child can hear their own reading. Nothing is saved or sent.\" · ITSAppUsesNonExemptEncryption = NO · portrait only."],
  ["Add the app to the privacy policy", "Add a short Baby Mo Hijaiyah section to babymo.id/privacy: no data collected, microphone only for local playback."],
  ["Test on a real iPhone and iPad", "Airplane mode, deny the microphone once, switch ID/EN and light/dark, play one level of every book."],
  ["Archive and upload", "Xcode → Product → Archive → Distribute App → App Store Connect."],
  ["Screenshots and artwork", "iPhone 1206 × 2622 and iPad 13\" 2064 × 2752 for both languages (banners or plain), plus the header and search artwork."],
  ["Age rating, Kids Category, App Privacy", "Use the answers on this page. The rating should come out as 4+; choose one Kids age band."],
  ["Manual release", "Version Release → Manually release this version."]
];

module.exports = { SHOTS, LISTING, FACTS, AGE, PRIVACY, REVIEW_NOTES, CHECK };
