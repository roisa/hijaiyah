/* Baby Mo Hijaiyah — badges (achievements).
   Little medals for milestones: first level, stars, books, streaks, races, the Grand Prix, coins, the treasure
   chest, reading checks. HJ.badges.check() looks for new ones (after a level, a race, a chest, on the home screen)
   and shows a happy pop-up banner for each; HJ.badges.shelf() is the badge wall in the sticker book. */
(function () {
  var S = HJ.store, t = HJ.t, A = HJ.audio, J = HJ.juice;
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function L() { return S.get().lang === "en" ? 1 : 0; }
  function stars() { return S.totalStars(); }
  function bookDone(n) { var w = HJ.worlds[n - 1], st = S.get(); return w && w.levels.every(function (l) { return st.stars[l.id]; }); }
  function races(f) { var r = S.get().race || {}; return Object.keys(r).filter(function (k) { return f(k, r[k]); }).length; }
  var B = [
    { id: "first", art: "star", c: ["#FFD43B", "#F59F00"], n: ["Langkah Pertama", "First Step"], d: ["Selesaikan 1 level", "Finish your first level"], ok: function (s) { return Object.keys(s.stars).length >= 1; } },
    { id: "stars30", art: "star", c: ["#FFB000", "#E07000"], n: ["30 Bintang", "30 Stars"], d: ["Kumpulkan 30 bintang", "Collect 30 stars"], ok: function () { return stars() >= 30; } },
    { id: "stars100", art: "sparkle", c: ["#FF8FB1", "#E0457A"], n: ["100 Bintang", "100 Stars"], d: ["Kumpulkan 100 bintang", "Collect 100 stars"], ok: function () { return stars() >= 100; } },
    { id: "book1", art: "book", c: ["#3FCF7A", "#16A35B"], n: ["Jilid 1 Selesai", "Book 1 Done"], d: ["Semua 28 huruf!", "All 28 letters!"], ok: function () { return bookDone(1); } },
    { id: "book2", art: "book", c: ["#4D96FF", "#2361D6"], n: ["Jilid 2 Selesai", "Book 2 Done"], d: ["Huruf bersambung", "Joined letters"], ok: function () { return bookDone(2); } },
    { id: "book4", art: "trophy", c: ["#9B6DFF", "#6A3DE0"], n: ["Jilid 4 Selesai", "Book 4 Done"], d: ["Tanwin & sukun", "Tanwin & sukun"], ok: function () { return bookDone(4); } },
    { id: "streak3", art: "flame", c: ["#FF9F3D", "#E04E00"], n: ["3 Hari Beruntun", "3-Day Streak"], d: ["Belajar 3 hari berturut-turut", "Learn 3 days in a row"], ok: function (s) { return (s.streak || {}).n >= 3; } },
    { id: "streak7", art: "flame", c: ["#FF5D73", "#C42A48"], n: ["7 Hari Beruntun", "7-Day Streak"], d: ["Seminggu penuh!", "A whole week!"], ok: function (s) { return (s.streak || {}).n >= 7; } },
    { id: "tashih", art: "check", c: ["#2EC4B6", "#0A8A80"], n: ["Baca ke Abi/Umi", "Read to a Parent"], d: ["Tashih pertama", "Your first reading check"], ok: function (s) { return Object.keys(s.tashih || {}).some(function (k) { return s.tashih[k]; }); } },
    { id: "chest", art: "gift", c: ["#C98B50", "#8A5428"], n: ["Pemburu Harta", "Treasure Hunter"], d: ["Buka peti harta", "Open a treasure chest"], ok: function (s) { return (s.chest || 0) >= 1; } },
    { id: "race1", art: "flame", c: ["#FF6B5B", "#D93A2B"], n: ["Juara Balap", "Race Winner"], d: ["Juara 1 di balapan", "Win a race"], ok: function () { return races(function (k, v) { return v === 1; }) >= 1; } },
    { id: "gp", art: "trophy", c: ["#FFC21A", "#B8860B"], n: ["Juara Grand Prix", "Grand Prix Champion"], d: ["Menangkan Grand Prix", "Win a Grand Prix"], ok: function () { return races(function (k, v) { return /-gp$/.test(k) && v === 1; }) >= 1; } },
    { id: "racer10", art: "sparkle", c: ["#7CC8FF", "#3D8FE0"], n: ["Pembalap Hebat", "Super Racer"], d: ["Selesaikan 10 balapan", "Finish 10 races"], ok: function () { return races(function () { return true; }) >= 10; } },
    { id: "coins100", art: "star", c: ["#FFE27A", "#D9A600"], n: ["100 Koin", "100 Coins"], d: ["Punya 100 koin", "Have 100 coins"], ok: function (s) { return (s.coins || 0) >= 100; } },
    { id: "khatam", art: "cap", c: ["#22C06E", "#0B6B3A"], n: ["Wisuda!", "Graduation!"], d: ["Selesai sampai Al-Qur'an", "All the way to the Qur'an"], ok: function () { return bookDone(7); } }
  ];
  function medal(b, size, locked) {
    var s = size || 64, u = "bd" + b.id + (locked ? "x" : "");
    return '<svg class="bd-medal" width="' + s + '" height="' + s + '" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + (locked ? "#D7DEE8" : b.c[0]) + '"/><stop offset="1" stop-color="' + (locked ? "#9FAEC2" : b.c[1]) + '"/></linearGradient></defs>' +
      '<path d="M20 4h10l-6 22h-10zM34 4h10l6 22h-10z" fill="' + (locked ? "#C9D3E3" : "#FF5D73") + '"/><path d="M24 4h4l-4 22h-4zM40 4h-4l4 22h4z" fill="' + (locked ? "#E6EAF0" : "#3D9BFF") + '"/>' +
      '<circle cx="32" cy="40" r="20" fill="url(#' + u + ')" stroke="#fff" stroke-width="3"/><circle cx="32" cy="40" r="15" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1.5" stroke-dasharray="3 3"/>' +
      '<g transform="translate(20 28) scale(.5)">' + (HJ.art(b.art, 48) || "").replace(/^<svg[^>]*>|<\/svg>$/g, "") + "</g>" +
      '<ellipse cx="25" cy="31" rx="5" ry="3" fill="#fff" opacity=".45" transform="rotate(-30 25 31)"/></svg>';
  }
  function owned() { var s = S.get(); s.badges = s.badges || {}; return s.badges; }
  var queue = [], showing = false;
  function check() {
    var s = S.get(), o = owned(), fresh = [];
    B.forEach(function (b) { if (!o[b.id]) { var ok = false; try { ok = b.ok(s); } catch (e) {} if (ok) { o[b.id] = Date.now(); fresh.push(b); } } });
    if (fresh.length) { S.save(); queue = queue.concat(fresh); setTimeout(pop, 1600); }
  }
  // a happy banner that drops in from the top (it never blocks the game)
  function pop() {
    if (showing || !queue.length) return;
    var b, many = queue.length > 2;
    if (many) { b = queue[queue.length - 1]; var nAll = queue.length; queue = []; } else b = queue.shift();
    showing = true;
    var v = el("button", "bd-pop", '<span class="bd-shine"></span>' + medal(b, 72) + '<span class="bd-tx"><small>' + esc(t("badgeNew")) + "</small><b>" + esc(many ? t("badgeMany", { n: nAll }) : b.n[L()]) + "</b><em>" + esc(many ? t("badgeSee") : b.d[L()]) + "</em></span>");
    document.body.appendChild(v); A.fx.unlock(); J.buzz([20, 40, 20]);
    var r = v.getBoundingClientRect(); setTimeout(function () { J.burst(r.left + 50, r.top + 40, 18, true); }, 350);
    A.talk(many ? t("badgeNew") : t("badgeNew") + " " + b.n[L()], S.get().lang);
    var gone = false; function out() { if (gone) return; gone = true; v.classList.add("out"); setTimeout(function () { v.remove(); showing = false; pop(); }, 400); }
    v.onclick = function () { out(); if (HJ.go && HJ.go.stickers) HJ.go.stickers(); };
    setTimeout(out, 3800);
  }
  function shelf() {
    var o = owned(), got = B.filter(function (b) { return o[b.id]; }).length;
    var box = el("section", "tz-card glass bd-wall");
    box.appendChild(el("div", "rs-h", "<b>" + esc(t("badgeWall")) + "</b><small>" + got + " / " + B.length + "</small>"));
    var g = el("div", "bd-grid");
    B.forEach(function (b) {
      var have = !!o[b.id], c = el("button", "bd-it" + (have ? "" : " locked"), medal(b, 56, !have) + "<b>" + esc(b.n[L()]) + "</b>");
      c.setAttribute("aria-label", b.n[L()] + " · " + b.d[L()]);
      c.onclick = function () { A.unlock(); A.fx.tap(); HJ.toast((have ? "" : HJ.ic("lock") + " ") + esc(b.d[L()])); };
      g.appendChild(c);
    });
    box.appendChild(g);
    return box;
  }
  HJ.badges = { check: check, shelf: shelf, list: B };
})();
