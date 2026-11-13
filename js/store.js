/* Baby Mo Hijaiyah — progress (on this device only) and the interface words in Indonesian and English. */
(function () {
  var KEY = "bmh_v1";
  var DEF = { name: "Ibra", lang: "id", theme: "auto", stars: {}, tashih: {}, stickers: [], streak: { last: "", n: 0 }, plays: 0,
    settings: { moVoice: true, sfx: true, latin: true, cdn: true, unlockAll: false } };
  var st;
  function load() {
    try { st = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { st = null; }
    if (!st) st = JSON.parse(JSON.stringify(DEF));
    for (var k in DEF) if (st[k] === undefined) st[k] = JSON.parse(JSON.stringify(DEF[k]));
    for (var s in DEF.settings) if (st.settings[s] === undefined) st.settings[s] = DEF.settings[s];
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  load();

  function today() { var d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  var store = {
    get: function () { return st; },
    save: save,
    set: function (k, v) { st[k] = v; save(); },
    setting: function (k, v) { st.settings[k] = v; save(); },
    reset: function () { var keep = { name: st.name, lang: st.lang, settings: st.settings }; st = JSON.parse(JSON.stringify(DEF)); Object.assign(st, keep); save(); },
    finish: function (id, stars) {
      var first = !st.stars[id];
      st.stars[id] = Math.max(st.stars[id] || 0, stars);
      if (first && st.stickers.indexOf(id) < 0) st.stickers.push(id);
      st.plays++;
      var t = today();
      if (st.streak.last !== t) {
        var y = new Date(); y.setDate(y.getDate() - 1);
        var ys = y.getFullYear() + "-" + (y.getMonth() + 1) + "-" + y.getDate();
        st.streak.n = st.streak.last === ys ? st.streak.n + 1 : 1; st.streak.last = t;
      }
      save(); return first;
    },
    totalStars: function () { var n = 0; for (var k in st.stars) n += st.stars[k]; return n; },
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
    play: ["Ayo Main!", "Let's Play!"], hello: ["Assalamu'alaikum, {n}!", "Assalamu'alaikum, {n}!"],
    hello2: ["Ayo belajar membaca Al-Qur'an bersama Baby Mo!", "Let's learn to read the Qur'an with Baby Mo!"],
    daily: ["Murajaah Harian", "Daily Review"], dailySub: ["5 menit mengulang, biar makin lancar", "5 minutes of review, every day"],
    stickers: ["Stiker", "Stickers"], map: ["Peta", "Map"], parents: ["Abi & Umi", "Parents"],
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
    tashih: ["Tashih bersama Abi/Umi", "Check with Abi/Umi"], tashihHint: ["Ibra membaca tanpa suara bantuan. Ketuk ✓ kalau sudah lancar.", "Ibra reads without help. Tap ✓ when it's fluent."],
    allGood: ["Lancar semua!", "All fluent!"], skip: ["Lewati", "Skip"], done: ["Selesai", "Done"],
    great: ["Masya Allah, hebat!", "Masha Allah, great!"], good: ["Bagus!", "Good!"], tryAgain: ["Coba lagi ya!", "Try again!"],
    oops: ["Hampir! Dengarkan lagi", "Almost! Listen again"], levelDone: ["Level selesai!", "Level complete!"],
    newSticker: ["Stiker baru!", "New sticker!"], fail: ["Hatinya habis… Ayo coba lagi!", "Out of hearts… let's try again!"],
    locked: ["Selesaikan level sebelumnya dulu ya", "Finish the level before first"],
    gateQ: ["Untuk Abi & Umi: berapa {a} + {b}?", "For parents: what is {a} + {b}?"],
    settings: ["Pengaturan", "Settings"], childName: ["Nama anak", "Child's name"], language: ["Bahasa", "Language"],
    moVoice: ["Mo berbicara", "Mo talks"], sfx: ["Efek suara", "Sound effects"], latin: ["Bantuan huruf latin", "Latin hints"],
    cdn: ["Murottal online (web)", "Online recitation (web)"], unlockAll: ["Buka semua level", "Unlock all levels"],
    reset: ["Hapus progres", "Reset progress"], resetQ: ["Yakin hapus semua bintang dan stiker?", "Delete all stars and stickers?"],
    progress: ["Laporan belajar", "Learning report"], curriculum: ["Kurikulum", "Curriculum"], theme: ["Tampilan", "Theme"],
    themeAuto: ["Otomatis", "Auto"], themeLight: ["Terang", "Light"], themeDark: ["Gelap", "Dark"],
    close: ["Tutup", "Close"], streak: ["hari berturut-turut", "days in a row"], stars: ["bintang", "stars"],
    surahRead: ["Baca satu surat utuh", "Read the whole surah"], listenAll: ["Dengar semua", "Hear it all"],
    fluent: ["Lancar ⭐", "Fluent ⭐"], practice: ["Perlu latihan", "Needs practice"],
    certTitle: ["Sertifikat Khatam Jilid", "Graduation Certificate"],
    certBody: ["telah menyelesaikan perjalanan Baby Mo Hijaiyah, dari huruf alif sampai membaca Al-Qur'an. Barakallahu fiik!",
      "has finished the Baby Mo Hijaiyah journey, from alif to reading the Qur'an. Barakallahu fiik!"],
    noAudio: ["Murottal belum diunduh — Abi/Umi bacakan ya, Ibra menirukan (talaqqi).", "Recitation not downloaded — a parent reads, the child copies (talaqqi)."],
    goal: ["Target", "Goal"], hearts: ["hati", "hearts"], tapSlow: ["Baca pelan-pelan, jangan dieja", "Read slowly, don't spell it out"],
    worldLocked: ["Selesaikan Ujian jilid sebelumnya dulu", "Pass the previous book's test first"],
    hint: ["Bantuan", "Hint"], back: ["Kembali", "Back"], quit: ["Keluar dari level?", "Leave this level?"],
    yesQuit: ["Ya, keluar", "Yes, leave"], keepPlaying: ["Lanjut main", "Keep playing"]
  };
  function t(k, vars) {
    var e = W[k]; if (!e) return k;
    var s = e[st.lang === "en" ? 1 : 0];
    if (vars) for (var v in vars) s = s.replace("{" + v + "}", vars[v]);
    return s;
  }
  function tr(o) { if (!o) return ""; if (typeof o === "string") return o; return o[st.lang] || o.id || ""; }

  window.HJ = window.HJ || {}; HJ.store = store; HJ.t = t; HJ.tr = tr;
})();
