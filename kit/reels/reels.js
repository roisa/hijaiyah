/* Baby Mo Hijaiyah — the reels. EDIT ME to make new reels.
   Each reel is a little script: [seconds, action, …]. Copy a reel, give it a new id, change the words, poses and
   timing, then preview it in the kit's reel editor (kit/reels/editor.html) or render MP4s with
   `node tools/reels/render.js <id>`. All actions are listed at the top of kit/reels/engine.js.
   Poses (render 1, kit/reels/art/): pose-41 (arms wide), yes (wave), yeyy (cheer), pose-02 (jump), wow, pose-37 (excited),
   ok, idea, thank-you, pose-12 (sitting), pose-08 (pointing), pose-20 (flying), alright, pose-05 (shy hello), run,
   pose-26, pose-33 (shrug), pose-36 (thinking). Also mo2-hug-quran (render 2, shown upper body only), abi-wave, umi-welcome.
   Themes: mint, sun, sky, pink, grape, gold, night. Times are in seconds; dur = length of the reel. */
window.REELS = [
  { id: "hello", name: "Kenalan dengan Baby Mo", theme: "mint", dur: 14, cover: 4.2,
    caption: {
      id: "Assalamu'alaikum! Kenalan yuk dengan Baby Mo Hijaiyah — belajar ngaji dari alif sampai Al-Qur'an sambil bermain. Tanpa iklan, bisa offline. 🌙\n#BabyMo #BelajarNgaji #Iqro #HurufHijaiyah #AnakMuslim",
      en: "Assalamu'alaikum! Meet Baby Mo Hijaiyah — learn to read the Qur'an from alif, by playing. No ads, works offline. 🌙\n#BabyMo #LearnQuran #ArabicAlphabet #MuslimKids #Iqra" },
    steps: [
      [0, "mo", "pose-41", "in-left"],
      [0.5, "title", { id: ["Assalamu'alaikum!", "Aku Baby Mo"], en: ["Assalamu'alaikum!", "I'm Baby Mo"] }],
      [1.2, "say", { id: "Yuk belajar ngaji bareng!", en: "Let's learn to read the Qur'an!" }],
      [1.4, "letters"],
      [3.4, "say", null],
      [3.4, "title", { id: ["Belajar ngaji", "sambil bermain"], en: ["Learn to read", "by playing"] }],
      [3.5, "phone", { screen: "home" }],
      [3.8, "mo", "wow", "jump"],
      [5.2, "tap", ".hm-play"],
      [6.6, "tap", "start"],
      [8.0, "tap", "start"],
      [9.0, "mo", "yeyy", "jump"],
      [9.1, "say", { id: "Bismillah, mulai!", en: "Bismillah, let's go!" }],
      [11.0, "say", null],
      [11.0, "cta"],
      [11.1, "mo", "pose-41", "pop"],
      [11.3, "confetti"]
    ] },

  { id: "trace", name: "Menulis huruf dengan benar", theme: "sky", dur: 14.5, cover: 9.0,
    caption: {
      id: "Menulis huruf hijaiyah dengan cara yang benar ✍️ Ikuti titik hijau dan panahnya — tulisan si kecil berubah jadi huruf emas! ✨\n#BabyMo #MenulisHijaiyah #BelajarNgaji #AnakMuslim",
      en: "Trace Arabic letters the right way ✍️ Follow the green dot and the arrows — your child's writing turns into a golden letter! ✨\n#BabyMo #ArabicAlphabet #MuslimKids #LearnQuran" },
    steps: [
      [0, "mo", "pose-08", "in-left"],
      [0.3, "title", { id: ["Menulis huruf", "dengan benar"], en: ["Write each letter", "the right way"] }],
      [0.5, "phone", { steps: [{ type: "trace", glyph: "ج" }] }],
      [1.4, "say", { id: "Ikuti panahnya!", en: "Follow the arrows!" }],
      [3.0, "say", null],
      [3.0, "trace", "jim", 3.6],
      [7.0, "mo", "wow", "jump"],
      [8.6, "mo", "yeyy", "jump"],
      [8.7, "say", { id: "Jadi emas! Masya Allah!", en: "It turned gold! Masha Allah!" }],
      [8.8, "burst", 540, 1150],
      [11.4, "say", null],
      [11.4, "cta"],
      [11.5, "mo", "pose-02", "jump"],
      [11.7, "confetti"]
    ] },

  { id: "pop", name: "Pecahkan balon huruf", theme: "pink", dur: 15, cover: 7.5, side: "right",
    caption: {
      id: "Dengar, lalu pecahkan balon hurufnya! 🎈 Si kecil belajar mendengar bunyi huruf hijaiyah sambil main.\n#BabyMo #BelajarNgaji #HurufHijaiyah #GameEdukasi",
      en: "Listen, then pop the right letter balloon! 🎈 Kids learn the sounds of the Arabic letters while they play.\n#BabyMo #ArabicLetters #MuslimKids #LearningGames" },
    steps: [
      [0, "mo", "yeyy", "in-right"],
      [0.3, "title", { id: ["Pecahkan", "balon hurufnya!"], en: ["Pop the", "letter balloons!"] }],
      [0.5, "phone", { level: "1-8", at: "pop", hold: true }],
      [1.4, "say", { id: "Dengar, lalu pecahkan!", en: "Listen, then pop it!" }],
      [2.6, "tap", "speaker"],
      [3.4, "say", null],
      [3.6, "pop", 4],
      [6.0, "mo", "pose-37", "jump"],
      [9.8, "mo", "wow", "jump"],
      [10.0, "big", { id: "Hebat!", en: "Great!" }, "balloon"],
      [12.0, "cta"],
      [12.1, "mo", "yeyy", "pop"],
      [12.3, "confetti"]
    ] },

  { id: "train", name: "Kereta baca", theme: "sun", dur: 15.5, cover: 8,
    caption: {
      id: "Tuut tuut! 🚂 Naik kereta baca: dengar dulu, lalu baca sendiri gerbong demi gerbong — dari kanan ke kiri, seperti halaman Iqra.\n#BabyMo #Iqro #BelajarMembacaAlquran #AnakMuslim",
      en: "Choo choo! 🚂 The reading train: listen first, then read it yourself carriage by carriage — right to left, like an Iqra page.\n#BabyMo #Iqra #LearnToReadQuran #MuslimKids" },
    steps: [
      [0, "mo", "idea", "in-left"],
      [0.3, "title", { id: ["Naik kereta", "baca!"], en: ["All aboard the", "reading train!"] }],
      [0.5, "phone", { level: "1-8", at: "train", hold: true }],
      [1.2, "say", { id: "Dengar dulu, lalu baca", en: "Listen first, then read" }],
      [5.6, "say", null],
      [5.8, "train"],
      [7.0, "mo", "pose-08", "wave"],
      [11.0, "mo", "yeyy", "jump"],
      [11.1, "big", { id: "Tuut tuut!", en: "Choo choo!" }, "star"],
      [12.8, "cta"],
      [12.9, "mo", "pose-41", "pop"],
      [13.1, "confetti"]
    ] },

  { id: "bridge", name: "Bantu Mo menyeberang", theme: "mint", dur: 14, cover: 7,
    caption: {
      id: "Bantu Baby Mo menyeberang sungai! 🌉 Setiap jawaban benar = satu papan jembatan. Di ujungnya ada hadiah 🎁\n#BabyMo #HurufHijaiyah #BelajarNgaji #GameAnak",
      en: "Help Baby Mo cross the river! 🌉 Every right answer adds a plank to the bridge — and there's a gift at the end 🎁\n#BabyMo #ArabicAlphabet #MuslimKids #KidsGames" },
    steps: [
      [0, "mo", "run", "in-left"],
      [0.3, "title", { id: ["Bantu Mo", "menyeberang!"], en: ["Help Mo", "cross the river!"] }],
      [0.5, "phone", { level: "1-8", at: "bridge", hold: true }],
      [1.3, "say", { id: "Pilih papan yang benar!", en: "Pick the right plank!" }],
      [2.6, "say", null],
      [2.6, "bridge"],
      [5.0, "mo", "pose-37", "jump"],
      [9.6, "mo", "yeyy", "jump"],
      [9.7, "big", { id: "Yeay! Hadiah!", en: "Yay! A gift!" }, "gift"],
      [11.4, "cta"],
      [11.5, "mo", "pose-02", "jump"],
      [11.7, "confetti"]
    ] },

  { id: "rewards", name: "Bintang dan stiker", theme: "gold", dur: 12.5, cover: 5.5, side: "right",
    caption: {
      id: "Bintang ⭐ stiker 🌟 dan hari beruntun 🔥 — hadiah kecil yang bikin si kecil semangat lanjut belajar setiap hari.\n#BabyMo #BelajarNgaji #AnakMuslim #Murajaah",
      en: "Stars ⭐ stickers 🌟 and daily streaks 🔥 — small rewards that keep little ones learning every day.\n#BabyMo #LearnQuran #MuslimKids" },
    steps: [
      [0, "mo", "pose-12", "in-right"],
      [0.3, "title", { id: ["Kumpulkan bintang", "& stiker!"], en: ["Collect stars", "& stickers!"] }],
      [0.5, "phone", { level: "1-8" }],
      [2.2, "finish"],
      [3.0, "mo", "wow", "jump"],
      [3.2, "say", { id: "Bintang tiga!", en: "Three stars!" }],
      [3.6, "burst", 540, 1250],
      [5.6, "mo", "yeyy", "jump"],
      [5.7, "say", { id: "Stiker baru!", en: "A new sticker!" }],
      [6.2, "confetti"],
      [9.4, "say", null],
      [9.4, "cta"],
      [9.5, "mo", "pose-41", "pop"]
    ] },

  { id: "map", name: "7 jilid, 77 level", theme: "grape", dur: 13.5, cover: 3.5,
    caption: {
      id: "7 jilid, 77 level 🗺️ Urutan Iqra dari huruf alif sampai membaca surat-surat pendek Al-Qur'an, ditambah kebiasaan baik metode Ummi.\n#BabyMo #Iqro #MetodeUmmi #BelajarNgaji",
      en: "7 books, 77 levels 🗺️ The Iqra order from the letter alif all the way to reading short surahs, with the good habits of the Ummi method.\n#BabyMo #Iqra #LearnQuran #MuslimKids" },
    steps: [
      [0, "mo", "pose-20", "in-left"],
      [0.3, "title", { id: ["7 jilid,", "77 level"], en: ["7 books,", "77 levels"] }],
      [0.5, "sub", { id: "Dari alif sampai Al-Qur'an", en: "From alif to the Qur'an" }],
      [0.6, "phone", { screen: "map" }],
      [1.6, "say", { id: "Ayo bertualang!", en: "Adventure time!" }],
      [3.6, "tap", ".node.cur"],
      [5.4, "tap", "start"],
      [6.6, "mo", "pose-41", "jump"],
      [6.7, "say", { id: "Bismillah!", en: "Bismillah!" }],
      [7.4, "letters"],
      [10.4, "say", null],
      [10.4, "cta"],
      [10.5, "mo", "yeyy", "jump"],
      [10.7, "confetti"]
    ] },

  { id: "quran", name: "Baca Al-Qur'an dari mushaf", theme: "gold", dur: 16, cover: 2.5, side: "right",
    caption: {
      id: "Dari huruf alif sampai membaca Al-Fatihah 📖 Dengar murottal, susun ayatnya, lalu baca sendiri dan tashih bersama Abi/Umi.\n#BabyMo #AlFatihah #JuzAmma #BelajarNgaji #AnakMuslim",
      en: "From alif to reading Al-Fatihah 📖 Hear the recitation, build the verse, then read it yourself and check it with a parent.\n#BabyMo #AlFatihah #JuzAmma #LearnQuran #MuslimKids" },
    steps: [
      [0, "mo", "mo2-hug-quran", "in-right"],
      [0.3, "title", { id: ["Baca Al-Qur'an", "dari mushaf"], en: ["Read the Qur'an", "from the mushaf"] }],
      [0.5, "phone", { level: "7-1", at: "ayah", unlockAll: true }],
      [1.4, "say", { id: "Bismillah…", en: "Bismillah…" }],
      [4.0, "say", null],
      [4.0, "tap", "next"],
      [6.4, "tap", "next"],
      [7.6, "say", { id: "Susun ayatnya!", en: "Build the verse!" }],
      [8.0, "build"],
      [11.6, "mo", "mo2-hug-quran", "jump"],
      [11.7, "say", { id: "Masya Allah!", en: "Masha Allah!" }],
      [11.8, "burst", 540, 1150],
      [13.4, "say", null],
      [13.4, "cta"],
      [13.6, "confetti"]
    ] },

  { id: "combo", name: "Kombo berturut-turut", theme: "pink", dur: 13.5, cover: 6.8,
    caption: {
      id: "Benar, benar, benar — KOMBO! 🔥 Setiap jawaban benar ada bintang dan efek seru, dan yang salah diulang lagi dengan lembut.\n#BabyMo #HurufHijaiyah #BelajarNgaji #GameEdukasi",
      en: "Right, right, right — COMBO! 🔥 Every right answer brings stars and fun effects, and anything missed comes back gently.\n#BabyMo #ArabicLetters #MuslimKids #LearningGames" },
    steps: [
      [0, "mo", "pose-37", "in-left"],
      [0.3, "title", { id: ["Benar terus,", "kombo!"], en: ["Right again,", "combo!"] }],
      [0.5, "phone", { picks: ["ba", "ta", "jim", "dal", "sin"] }],
      [1.6, "tap", "answer"],
      [3.3, "tap", "answer"],
      [4.9, "tap", "answer"],
      [5.6, "mo", "yeyy", "jump"],
      [5.7, "big", { id: "3x berturut-turut!", en: "3 in a row!" }, "flame"],
      [6.6, "tap", "answer"],
      [8.2, "tap", "answer"],
      [9.0, "mo", "wow", "spin"],
      [9.1, "big", { id: "5x! Masya Allah!", en: "5 in a row!" }, "flame"],
      [10.8, "cta"],
      [10.9, "mo", "pose-02", "jump"],
      [11.1, "confetti"]
    ] },

  { id: "parents", name: "Untuk Abi & Umi", theme: "night", dur: 13, cover: 3,
    caption: {
      id: "Untuk Abi & Umi 💚 Tanpa iklan, tanpa akun, tanpa pelacakan. Laporan belajar, tashih di setiap level, Bahasa Indonesia & English, dan bisa offline.\n#BabyMo #ParentingIslami #AplikasiAnakMuslim #BelajarNgaji",
      en: "For parents 💚 No ads, no account, no tracking. Progress reports, a reading check in every level, English & Bahasa Indonesia, and it works offline.\n#BabyMo #MuslimParenting #MuslimKids #LearnQuran" },
    steps: [
      [0, "mo", "abi-wave", "in-left"],
      [0.3, "title", { id: ["Aman untuk si kecil,", "tanpa iklan & akun"], en: ["Safe for kids,", "no ads or accounts"] }],
      [0.5, "sub", { id: "Laporan belajar · tashih · bisa offline", en: "Progress report · reading checks · offline" }],
      [0.6, "phone", { screen: "parents", dark: true }],
      [1.6, "say", { id: "Abi bisa lihat laporannya", en: "See your child's progress" }],
      [4.4, "say", null],
      [4.5, "side", "right"],
      [4.5, "mo", "umi-welcome", "in-right"],
      [5.0, "say", { id: "Tanpa iklan, tanpa akun", en: "No ads, no account" }],
      [7.6, "say", null],
      [7.7, "side", "left"],
      [7.7, "mo", "pose-41", "in-left"],
      [8.0, "say", { id: "Bahasa Indonesia & English!", en: "English & Bahasa Indonesia!" }],
      [10.4, "say", null],
      [10.4, "cta"],
      [10.6, "confetti"]
    ] }
];
