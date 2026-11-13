/* Baby Mo Hijaiyah — progress (on this device only) and the interface words in Indonesian and English. */
(function () {
  var KEY = "bmh_v1";
  // first language guess: the phone's language (Indonesian → id, anything else → en); the picker confirms it
  var navLang = ((navigator.languages && navigator.languages[0]) || navigator.language || "en").toLowerCase();
  var DEF = { name: "", lang: /^(id|ms)/.test(navLang) ? "id" : "en", langChosen: false, theme: "auto", stars: {}, tashih: {}, stickers: [], streak: { last: "", n: 0 }, plays: 0, limit: "0", playDay: { d: "", ms: 0 }, log: {}, chest: 0, owned: [], equip: { train: "classic", balloons: "classic", ink: "classic" },
    settings: { moVoice: true, sfx: true, latin: true, cdn: true, unlockAll: false, nature: false, arcadeAll: false } };
  var st;
  function load() {
    try { st = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { st = null; }
    if (!st) st = JSON.parse(JSON.stringify(DEF));
    for (var k in DEF) if (st[k] === undefined) st[k] = JSON.parse(JSON.stringify(DEF[k]));
    for (var s in DEF.settings) if (st.settings[s] === undefined) st.settings[s] = DEF.settings[s];
    // same site as the Baby Mo app? reuse the language already chosen there
    if (!st.langChosen) { try { var bm = localStorage.getItem("bm_lang"); if (bm === "id" || bm === "en") { st.lang = bm; st.langChosen = true; } } catch (e) {} }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  load();

  function today() { var d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  var store = {
    get: function () { return st; },
    save: save,
    set: function (k, v) { st[k] = v; save(); },
    setting: function (k, v) { st.settings[k] = v; save(); },
    reset: function () { var keep = { name: st.name, lang: st.lang, langChosen: st.langChosen, settings: st.settings }; st = JSON.parse(JSON.stringify(DEF)); Object.assign(st, keep); save(); },
    finish: function (id, stars) {
      var first = !st.stars[id];
      st.stars[id] = Math.max(st.stars[id] || 0, stars);
      if (first && st.stickers.indexOf(id) < 0) st.stickers.push(id);
      st.plays++;
      if (id.charAt(0) !== "_") { var lg = this.logDay(); lg.lv++; if (first) lg.nw++; }
      var t = today();
      if (st.streak.last !== t) {
        var y = new Date(); y.setDate(y.getDate() - 1);
        var ys = y.getFullYear() + "-" + (y.getMonth() + 1) + "-" + y.getDate();
        st.streak.n = st.streak.last === ys ? st.streak.n + 1 : 1; st.streak.last = t;
      }
      save(); return first;
    },
    playMs: function () { var t = today(); if (st.playDay.d !== t) st.playDay = { d: t, ms: 0 }; return st.playDay.ms; },
    addPlay: function (ms) { this.playMs(); st.playDay.ms += ms; this.logDay().ms += ms; save(); },
    // letters/words the child got wrong (for "letters to practise"): per day counts + what to replay, kept 30 days
    addMiss: function (it) {
      if (!it || !it.ar || it.quran) return;
      var d = today(); st.miss = st.miss || {}; st.missMeta = st.missMeta || {};
      var m = st.miss[d] = st.miss[d] || {}; m[it.ar] = (m[it.ar] || 0) + 1;
      st.missMeta[it.ar] = { au: it.au, k: it.k, v: it.v, tr: it.tr, t: Date.now() };
      var ks = Object.keys(st.miss); if (ks.length > 30) { var f = function (k) { var x = k.split("-"); return +x[0] * 10000 + +x[1] * 100 + +x[2]; }; ks.sort(function (a, b) { return f(a) - f(b); }).slice(0, ks.length - 30).forEach(function (k) { delete st.miss[k]; }); }
      save();
    },
    weak: function (days) {
      var tot = {}, now = new Date(), pr = st.practiced || {};
      for (var i = 0; i < (days || 14); i++) { var d = new Date(now); d.setDate(now.getDate() - i); var m = (st.miss || {})[this.dayKey(d)]; if (m) for (var a in m) tot[a] = (tot[a] || 0) + m[a]; }
      return Object.keys(tot).filter(function (a) { var mm = (st.missMeta || {})[a]; return mm && !(pr[a] && pr[a] >= mm.t); })
        .sort(function (a, b) { return tot[b] - tot[a]; }).map(function (a) { var mm = st.missMeta[a]; return { ar: a, au: mm.au, k: mm.k, v: mm.v, tr: mm.tr, n: tot[a] }; });
    },
    // a small per-day log for the parents' weekly report (kept 60 days)
    dayKey: function (d) { return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); },
    logDay: function (d) {
      d = d || today(); st.log = st.log || {};
      if (!st.log[d]) { st.log[d] = { ms: 0, lv: 0, nw: 0, ts: 0 }; var ks = Object.keys(st.log); if (ks.length > 60) ks.sort(function (a, b) { var f = function (k) { var x = k.split("-"); return +x[0] * 10000 + +x[1] * 100 + +x[2]; }; return f(a) - f(b); }).slice(0, ks.length - 60).forEach(function (k) { delete st.log[k]; }); }
      return st.log[d];
    },
    overLimit: function () { var m = +st.limit || 0; return m > 0 && this.playMs() >= m * 60000; },
    totalStars: function () { var n = st.bonus || 0; for (var k in st.stars) if (k.charAt(0) !== "_") n += st.stars[k]; return n; },
    unlocked: function (lv) {
      if (st.settings.unlockAll) return true;
      var all = HJ.allLevels(), i = all.indexOf(lv);
      return i <= 0 || !!st.stars[all[i - 1].id];
    },
    current: function () {
      var all = HJ.allLevels();
      for (var i = 0; i < all.length; i++) if (!st.stars[all[i].id]) return all[i];
      return all[all.length - 1];
    }
  };

  /* interface words */
  var W = {
    chooseLang: ["Pilih Bahasa / Choose Language", "Pilih Bahasa / Choose Language"],
    langIdSub: ["Belajar membaca Al-Qur'an sambil bermain", "Belajar membaca Al-Qur'an sambil bermain"],
    langEnSub: ["Learn to read the Qur'an through play", "Learn to read the Qur'an through play"],
    nameQ: ["Siapa nama si kecil?", "What's your little one's name?"], nameSub: ["Mo mau kenalan!", "Mo wants to say hi!"],
    namePh: ["Nama si kecil", "Child's name"], save: ["Simpan", "Save"], later: ["Nanti saja", "Maybe later"],
    kid: ["Si kecil", "Your child"], langToast: ["Bahasa Indonesia", "English"], langNote: ["Semua game, suara Mo dan terjemahan ikut berubah", "Games, Mo's voice and translations all switch"],
    traceStart: ["Mulai dari titik hijau, ikuti panahnya", "Start at the green dot and follow the arrows"],
    traceFollow: ["Ikuti jalannya ya", "Stay on the road"], traceDot: ["Sekarang ketuk titiknya", "Now tap the dot"],
    traceNext: ["Bagus! Garis berikutnya", "Great! Next line"], traceWatch: ["Lihat caranya", "Show me"],
    traceNeat: ["Masya Allah, rapi sekali!", "Masha Allah, so neat!"], traceGood: ["Bagus! Ayo lebih rapi lagi", "Good! Try it even neater"],
    writeAgain: ["Tulis lagi", "Write again"],
    limit: ["Batas waktu main", "Play-time limit"], limitSub: ["Mo mengajak istirahat setelah waktunya habis", "Mo suggests a break when time is up"], limitOff: ["Mati", "Off"],
    restH: ["Waktunya istirahat, {k}!", "Time for a break, {k}!"], restH0: ["Waktunya istirahat!", "Time for a break!"], restP: ["Matanya istirahat dulu ya. Hari ini sudah belajar {m} menit. Mo bangga! Sampai nanti, insya Allah.", "Let's rest our eyes. You learned for {m} minutes today. Mo is so proud! See you later, insya Allah."],
    restOk: ["Oke, sampai nanti!", "Okay, see you later!"], restMore: ["Orang tua: tambah 10 menit", "Grown-up: 10 more minutes"],
    nextSticker: ["Stiker berikutnya!", "Next sticker!"],
    chestT: ["Peti Harta", "Treasure Chest"], chestSub: ["{n} bintang lagi untuk peti berikutnya", "{n} more stars to the next chest"], chestSub1: ["1 bintang lagi untuk peti berikutnya", "1 more star to the next chest"],
    chestReady: ["Petinya siap dibuka!", "Your chest is ready!"], chestOpen: ["Buka!", "Open!"], chestTap: ["Ketuk petinya 3 kali!", "Tap the chest 3 times!"],
    chestGot: ["Kamu dapat:", "You found:"], chestUse: ["Pakai sekarang!", "Use it now!"], chestLater: ["Nanti saja", "Later"],
    chestStars: ["2 bintang bonus!", "2 bonus stars!"], chestAll: ["Semua harta sudah terkumpul. Masya Allah!", "You've collected every treasure. Masha Allah!"],
    treasures: ["Harta Karunku", "My Treasures"], treasuresSub: ["Ketuk untuk memakai. Buka peti untuk mendapat yang baru.", "Tap one to use it. Open chests to find new ones."],
    tLocked: ["Buka peti untuk mendapatkannya", "Open a chest to find this one"], tOn: ["Dipakai!", "Now using it!"],
    pTrain: ["Kereta", "Train"], pBalloons: ["Balon", "Balloons"], pInk: ["Tinta menulis", "Writing ink"],
    prClassic: ["Klasik", "Classic"], prOcean: ["Samudra", "Ocean"], prGold: ["Emas", "Gold"], prGalaxy: ["Galaksi", "Galaxy"], prPastel: ["Pastel", "Pastel"], prCandy: ["Permen", "Candy"], prSilver: ["Emas & perak", "Gold & silver"], prRainbow: ["Pelangi", "Rainbow"],
    arcade: ["Main Bebas", "Free Play"], arcadeSub: ["Main game favorit dengan huruf yang sudah kamu pelajari", "Play your favourite games with letters you've learned"],
    arcadeLock: ["Terbuka setelah level {b}", "Opens after level {b}"], arcadeDone: ["Seru sekali!", "That was fun!"], arcadeAgain: ["Main lagi!", "Play again!"], arcadeNoStars: ["Main Bebas untuk latihan, bintang didapat di peta", "Free Play is practice; stars are earned on the map"],
    funJar: ["Toples seru", "Fun jar"], funJarSub: ["{n} permainan lagi untuk 1 bintang", "{n} more games for a star"], funJarFull: ["Toplesnya penuh! 1 bintang untukmu", "The jar is full! A star for you"],
    funJarMax: ["Hari ini 3 bintang sudah didapat. Lanjut besok ya!", "You got 3 jar stars today. More tomorrow!"],
    weakT: ["Perlu dilatih", "Letters to practise"], weakSub: ["Yang paling sering tertukar 2 minggu terakhir. Ketuk untuk mendengar.", "Mixed up most in the last 2 weeks. Tap one to hear it."],
    weakNone: ["Belum ada yang perlu dilatih. Masya Allah!", "Nothing to practise yet. Masha Allah!"], weakGo: ["Latih sekarang", "Practise now"], weakTimes: ["{n}× salah", "missed {n}×"],
    practiceT: ["Latihan huruf tricky", "Tricky letters practice"], practiceSay: ["Ayo latihan huruf yang tadi tertukar. Pelan-pelan ya!", "Let's practise the letters that got mixed up. Nice and slow!"],
    practiceDone: ["Latihan selesai! Makin lancar!", "Practice done! Getting better!"],
    iSaid: ["Aku sudah baca!", "I said it!"],
    nudge: ["Ayo, kamu pasti bisa!", "Come on, you can do it!"],
    gBubbles: ["Gelembung", "Bubbles"], gPaint: ["Warnai huruf", "Paint a letter"], gFeed: ["Suapi Mo", "Feed Mo"], gShadow: ["Cari bayangan", "Find the shadow"],
    arcadeAsk: ["Minta Abi/Umi membuka semua game di menu Orang Tua", "Ask a grown-up to open all games in Parents"],
    arcadeAll: ["Buka semua game Main Bebas", "Open all Free Play games"], arcadeAllSub: ["Untuk anak prasekolah yang ingin langsung bermain", "For preschoolers who just want to play"],
    tdBubbles: ["Pecahkan gelembungnya!", "Pop the bubbles!"], tdPaint: ["Warnai hurufnya dengan jarimu!", "Colour the letter with your finger!"],
    feedAsk: ["Mo lapar! Berikan buah yang ini ke Mo", "Mo is hungry! Give Mo this fruit"], tdShadow: ["Geser hurufnya ke bayangannya!", "Drag the letter to its shadow!"],
    gPop: ["Balon", "Balloons"], gTrain: ["Kereta", "Train"], gBridge: ["Jembatan", "Bridge"], gMatch: ["Kartu kembar", "Memory"], gTrace: ["Menulis", "Tracing"], gPick: ["Tebak bunyi", "Sound quiz"], gBuild: ["Susun kata", "Word builder"], gSort: ["Monster tajwid", "Tajwid monsters"], gYesno: ["Benar atau salah", "Right or wrong"],
    week: ["Minggu ini", "This week"], wkMin: ["menit belajar", "minutes learning"], wkLv: ["level selesai", "levels done"], wkNew: ["stiker baru", "new stickers"], wkTs: ["tashih", "reading checks"],
    wkDays: ["{n} dari 7 hari", "{n} of 7 days"], wkShare: ["Bagikan laporan", "Share report"], wkWa: ["WhatsApp", "WhatsApp"], wkCopied: ["Laporan disalin", "Report copied"],
    wkText: ["Laporan Baby Mo Hijaiyah minggu ini untuk {k}: {d} hari belajar, {m} menit, {l} level selesai, {s} stiker baru, {t} tashih. Sekarang di {now}.", "Baby Mo Hijaiyah weekly report for {k}: {d} days of learning, {m} minutes, {l} levels done, {s} new stickers, {t} reading checks. Now at {now}."],
    nature: ["Suara alam", "Nature sounds"], natureSub: ["Angin, burung dan jangkrik yang lembut. Tanpa musik.", "Soft breeze, birds and crickets. No music."],
    yourTurnSay: ["Giliranmu! Ucapkan, lalu ketuk", "Your turn! Say it, then tap"],
    micTap: ["Ketuk mic, lalu baca", "Tap the mic, then read"], micListen: ["Mo mendengarkan… ayo baca!", "Mo is listening… read now!"],
    micNone: ["Mo belum dengar. Coba lebih keras ya!", "Mo didn't hear you. A bit louder!"], micThinking: ["Mo sedang mendengar…", "Mo is listening back…"],
    micBlocked: ["Mic belum diizinkan — minta Abi/Umi ya", "The microphone is off — ask a parent"],
    micGreat: ["Mirip sekali! Masya Allah!", "So close to Mo! Masha Allah!"], micGood: ["Bagus! Hampir sama", "Good! Almost the same"], micTry: ["Ayo coba sekali lagi!", "Let's try once more!"],
    tipLonger: ["Coba baca sedikit lebih panjang", "Try it a little longer"], tipShorter: ["Coba sedikit lebih cepat", "Try it a little quicker"],
    tipClearer: ["Coba lebih jelas dan keras", "Try it louder and clearer"], me: ["Aku", "Me"], compare: ["Bandingkan", "Compare"], funnyVoice: ["Suara lucu", "Funny voice"],
    stage: ["Panggung Baca", "Reading Stage"], stageHint: ["Pilih kartu, ketuk mic, lalu baca. Mo ikut mendengarkan!", "Pick a card, tap the mic and read. Mo listens too!"],
    feed: ["Kasih makan monster tajwid!", "Feed the tajwid monsters!"], notMe: ["Bukan aku!", "Not me!"], yum: ["Nyam!", "Yum!"], allFed: ["Semua monster kenyang!", "All monsters are full!"],
    book: ["Jilid", "Book"], combo: ["{n}x berturut-turut!", "{n} in a row!"], perfect: ["Sempurna!", "Perfect!"],
    bookDone: ["{b} selesai!", "{b} complete!"], bookOpen: ["{b} sekarang terbuka", "{b} is now open"],
    missionDone: ["Misi selesai · {n}/3", "Mission done · {n}/3"], again2: ["Coba sekali lagi", "One more try"],
    tabHome: ["Main", "Play"], tabParents: ["Orang Tua", "Parents"], continue: ["Lanjut belajar", "Keep learning"],
    mLevel: ["Main 1 level", "Play 1 level"], mTashih: ["Tashih bersama Abi/Umi", "Reading check with a parent"],
    mTashihSub: ["Baca sendiri, Abi/Umi mencentang", "Read alone, a parent ticks"],
    mission: ["Misi Hari Ini", "Today's Missions"], missionAll: ["Semua misi selesai! Masya Allah", "All missions done! Masha Allah"],
    missionSub: ["Selesaikan {n} misi lagi", "{n} missions to go"], missionSub1: ["Selesaikan 1 misi lagi", "1 mission to go"], streak1: ["hari berturut-turut", "day in a row"], bonusStar: ["bintang murajaah", "review star"], bonusStar2: ["bintang tashih", "reading-check star"], day: ["hari", "days"], day1: ["hari", "day"], doneToday: ["Selesai hari ini ✓", "Done today ✓"],
    books: ["Jilid Belajar", "Books"], footDua: ["Ya Rabbku, tambahkanlah ilmu kepadaku", "My Lord, increase me in knowledge"],
    gMorning: ["Selamat pagi! Yuk mulai ngaji, Bismillah.", "Good morning! Let's start, Bismillah."],
    gDay: ["Siang ini kita belajar huruf baru, yuk!", "Let's learn a new letter this afternoon!"],
    gAfternoon: ["Sore yang seru untuk membaca, ayo!", "A lovely afternoon to read, come on!"],
    gNight: ["Sebelum tidur, murajaah sebentar yuk.", "A little review before bed?"],
    mapTitle1: ["Peta", "Learning"], mapTitle2: ["Belajar", "Map"], mapSub: ["7 jilid · dari alif sampai Al-Qur'an", "7 books · from alif to the Qur'an"],
    stickerTitle1: ["Buku", "Sticker"], stickerTitle2: ["Stiker", "Book"],
    latinSub: ["Tampilkan bacaan latin kecil", "Show small Latin spelling"], cdnSub: ["Putar murottal dari internet bila belum diunduh", "Stream recitation when not downloaded"],
    unlockSub: ["Untuk mencoba semua jilid", "To try every book"],
    method: ["Urutan Iqra (langsung bunyi, langkah kecil) dengan kebiasaan Ummi: talaqqi (dengar → tirukan), murajaah harian, dan tashih oleh Abi/Umi sebelum naik level. Jilid 7 membaca surat-surat pendek.",
      "Iqra order (sounds first, small steps) with Ummi habits: talaqqi (listen → copy), daily review, and a parent check before moving on. Book 7 is reading short surahs."],
    privacy: ["Tanpa iklan · progres hanya di perangkat ini", "No ads · progress stays on this device"],
    play: ["Ayo Main!", "Let's Play!"], hello: ["Assalamu'alaikum, {n}!", "Assalamu'alaikum, {n}!"],
    hello2: ["Ayo belajar membaca Al-Qur'an bersama Baby Mo!", "Let's learn to read the Qur'an with Baby Mo!"],
    daily: ["Murajaah Harian", "Daily Review"], dailySub: ["5 menit mengulang, biar makin lancar", "5 minutes of review, every day"],
    stickers: ["Stiker", "Stickers"], map: ["Peta", "Map"], parents: ["Abi & Umi", "Parents"], nameSaved: ["Nama tersimpan", "Name saved"],
    start: ["Mulai!", "Start!"], next: ["Lanjut", "Next"], again: ["Ulangi", "Again"], listen: ["Dengar", "Listen"],
    yourTurn: ["Giliranmu! Ketuk tiap gerbong sambil membaca →", "Your turn! Tap each carriage as you read →"],
    listenFirst: ["Dengarkan dulu, lalu tirukan", "Listen first, then copy"],
    tapHear: ["Ketuk huruf untuk mendengar", "Tap the letter to hear it"], copy3: ["Tirukan 3 kali!", "Say it 3 times!"],
    letterName: ["Nama hurufnya", "Letter name"], trace: ["Tebalkan hurufnya dengan jarimu!", "Trace the letter with your finger!"],
    whichOne: ["Mana yang Mo baca?", "Which one did Mo read?"], isRight: ["Apakah bunyinya benar?", "Is this the right sound?"],
    yes: ["Benar", "Right"], no: ["Salah", "Wrong"], popIt: ["Pecahkan balon", "Pop the balloons"],
    bridge: ["Bantu Mo menyeberang! Pilih papan yang benar", "Help Mo cross! Pick the right plank"],
    match: ["Cari pasangannya!", "Find the pairs!"], build: ["Susun dari kanan ke kiri", "Build it right to left"],
    sortIt: ["Masukkan ke kotak yang benar", "Put it in the right box"], ayahListen: ["Dengar murottal, lalu baca", "Hear the recitation, then read"],
    ayahBuild: ["Susun ayatnya (mulai dari kanan)", "Build the verse (start from the right)"], ayahFill: ["Kata mana yang hilang?", "Which word is missing?"],
    record: ["Rekam suaraku", "Record me"], stopRec: ["Selesai", "Stop"], myVoice: ["Suaraku", "My voice"],
    tashih: ["Tashih bersama Abi/Umi", "Reading check with a parent"], tashihHint: ["Tanpa suara bantuan. Ketuk tiap bacaan yang sudah lancar.", "No help sounds. Tap each one read fluently."],
    allGood: ["Lancar semua!", "All fluent!"], skip: ["Lewati", "Skip"], done: ["Selesai", "Done"],
    great: ["Masya Allah, hebat!", "Masha Allah, great!"], good: ["Bagus!", "Good!"], tryAgain: ["Coba lagi ya!", "Try again!"],
    oops: ["Hampir! Dengarkan lagi", "Almost! Listen again"], levelDone: ["Level selesai!", "Level complete!"],
    newSticker: ["Stiker baru!", "New sticker!"], fail: ["Hatinya habis… Ayo coba lagi!", "Out of hearts… let's try again!"],
    locked: ["Selesaikan level sebelumnya dulu ya", "Finish the level before first"],
    gateQ: ["Untuk Abi & Umi: berapa {a} × {b}?", "For parents: what is {a} × {b}?"],
    settings: ["Pengaturan", "Settings"], childName: ["Nama anak", "Child's name"], language: ["Bahasa", "Language"],
    moVoice: ["Mo berbicara", "Mo talks"], sfx: ["Efek suara", "Sound effects"], latin: ["Bantuan huruf latin", "Latin hints"],
    cdn: ["Murottal online (web)", "Online recitation (web)"], unlockAll: ["Buka semua level", "Unlock all levels"],
    reset: ["Hapus progres", "Reset progress"], resetQ: ["Yakin hapus semua bintang dan stiker?", "Delete all stars and stickers?"],
    progress: ["Laporan belajar", "Learning report"], curriculum: ["Kurikulum", "Curriculum"], theme: ["Tampilan", "Theme"],
    themeAuto: ["Otomatis", "Auto"], themeLight: ["Terang", "Light"], themeDark: ["Gelap", "Dark"],
    close: ["Tutup", "Close"], streak: ["hari berturut-turut", "days in a row"], stars: ["bintang", "stars"],
    surahRead: ["Baca satu surat utuh", "Read the whole surah"], listenAll: ["Dengar semua", "Hear it all"],
    fluent: ["Lancar", "Fluent"], practice: ["Perlu latihan", "Needs practice"],
    certTitle: ["Sertifikat Khatam Jilid", "Graduation Certificate"],
    certBody: ["telah menyelesaikan perjalanan Baby Mo Hijaiyah, dari huruf alif sampai membaca Al-Qur'an. Barakallahu fiik!",
      "has finished the Baby Mo Hijaiyah journey, from alif to reading the Qur'an. Barakallahu fiik!"],
    noAudio: ["Murottal belum diunduh — Abi/Umi bacakan ya, {k} menirukan (talaqqi).", "Recitation not downloaded — a parent reads, the child copies (talaqqi)."],
    goal: ["Target", "Goal"], hearts: ["hati", "hearts"], tapSlow: ["Baca pelan-pelan, jangan dieja", "Read slowly, don't spell it out"],
    worldLocked: ["Selesaikan Ujian jilid sebelumnya dulu", "Pass the previous book's test first"],
    hint: ["Bantuan", "Hint"], back: ["Kembali", "Back"], quit: ["Keluar dari level?", "Leave this level?"],
    yesQuit: ["Ya, keluar", "Yes, leave"], keepPlaying: ["Lanjut main", "Keep playing"]
  };
  function t(k, vars) {
    var e = W[k]; if (!e) return k;
    var s = e[st.lang === "en" ? 1 : 0];
    if (vars) for (var v in vars) s = s.replace("{" + v + "}", vars[v]);
    return kid(s);
  }
  // {k} = the child's name, or "Si kecil" / "Your child" when no name was given
  function kid(s) { return s.indexOf("{k}") < 0 ? s : s.split("{k}").join(st.name || W.kid[st.lang === "en" ? 1 : 0]); }
  function tr(o) { if (!o) return ""; if (typeof o === "string") return kid(o); return kid(o[st.lang] || o.id || ""); }

  window.HJ = window.HJ || {}; HJ.store = store; HJ.t = t; HJ.tr = tr;
})();
