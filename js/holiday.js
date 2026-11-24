/* Baby Mo Hijaiyah — the island dresses up for Ramadan and the two Eids.
   The Hijri date comes from the phone's own calendar (Intl, "islamic" calendar): Ramadan (month 9), Eid al-Fitr
   (1–3 Syawal) and Eid al-Adha (10–13 Dzulhijjah). Strings of lanterns swing over Hijaiyah World, a crescent and
   stars twinkle, and a banner greets the family. Parents can preview it: Parents → "Holiday decorations".
   HJ.holiday.now() → "ramadan" | "fitr" | "adha" | null; HJ.holiday.decorate(heroEl). No people or faces. */
(function () {
  var S = HJ.store;
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function hijri(d) {
    try {
      var p = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { month: "numeric", day: "numeric" }).formatToParts(d || new Date());
      var m = +p.filter(function (x) { return x.type === "month"; })[0].value, dd = +p.filter(function (x) { return x.type === "day"; })[0].value;
      return { m: m, d: dd };
    } catch (e) { return null; }
  }
  function now() {
    var f = (location.search.match(/holiday=(\w+)/) || [])[1] || (S.get().settings || {}).holidayPreview;
    if (f === true) return "ramadan";
    if (f && f !== "off") return f;
    var h = hijri(); if (!h) return null;
    if (h.m === 9) return "ramadan";
    if (h.m === 10 && h.d <= 3) return "fitr";
    if (h.m === 12 && h.d >= 10 && h.d <= 13) return "adha";
    return null;
  }
  var TXT = {
    ramadan: ["Marhaban ya Ramadan!", "Ramadan Mubarak!"],
    fitr: ["Selamat Hari Raya Idul Fitri!", "Eid Mubarak!"],
    adha: ["Selamat Hari Raya Idul Adha!", "Eid al-Adha Mubarak!"]
  };
  function lantern(x, y, s, c, d) {
    return '<g class="hd-swing" style="animation-delay:' + d + 's;transform-origin:' + x + "px " + (y - 30 * s) + 'px"><line x1="' + x + '" y1="' + (y - 30 * s) + '" x2="' + x + '" y2="' + (y - 12 * s) + '" stroke="#C9A04A" stroke-width="1.5"/>' +
      '<g transform="translate(' + x + " " + y + ") scale(" + s + ')"><path d="M-7 -12h14l-3 -5h-8z" fill="#C9A04A"/><path d="M-10 -12 Q-14 4 -6 14 H6 Q14 4 10 -12Z" fill="' + c + '"/>' +
      '<path d="M-4 -10 Q-6 4 -2 12 M4 -10 Q6 4 2 12" stroke="rgba(255,255,255,.5)" stroke-width="1.4" fill="none"/><circle cx="0" cy="2" r="5" fill="#FFF3B0" opacity=".9"/><path d="M-6 14h12l-2 4h-8z" fill="#C9A04A"/></g>' +
      '<circle class="hd-glow" cx="' + x + '" cy="' + (y + 2 * s) + '" r="' + 16 * s + '" fill="#FFE27A" opacity=".25"/></g>';
  }
  function decorate(hero) {
    var k = now(); if (!k || !TXT[k]) return;
    var cols = ["#FF5D73", "#FFB000", "#22C06E", "#3D9BFF", "#9B6DFF"], L = [];
    // two strings of lanterns across the sky, sagging gently
    [[24, 0], [58, 1]].forEach(function (row, ri) {
      var y0 = row[0], n = 6;
      L.push('<path d="M-10 ' + y0 + " Q200 " + (y0 + 40) + " 410 " + y0 + '" stroke="#C9A04A" stroke-width="1.5" fill="none" opacity=".8"/>');
      for (var i = 0; i < n; i++) { var tt = (i + .5 + ri * .5) / n, x = -10 + tt * 420, y = y0 + 4 * tt * (1 - tt) * 40 + 30; L.push(lantern(x, y, ri ? .9 : 1.1, cols[(i + ri) % 5], i * .3 + ri)); }
    });
    var deco = el("div", "hd-deco hd-" + k, '<svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMin slice" aria-hidden="true">' + L.join("") +
      '<g class="hd-moon"><path d="M352 118 a18 18 0 1 0 14 -30 a14 14 0 1 1 -14 30z" fill="#FFE27A"/></g>' +
      [[330, 92], [384, 132], [300, 128]].map(function (p, i) { return '<path class="hd-tw" style="animation-delay:' + i * .5 + 's" d="M' + p[0] + " " + (p[1] - 6) + "l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2z" + '" fill="#FFF3B0"/>'; }).join("") + "</svg>");
    hero.appendChild(deco);
    var ban = el("div", "hd-ban", "<b>" + TXT[k][S.get().lang === "en" ? 1 : 0] + "</b>");
    hero.appendChild(ban);
  }
  HJ.holiday = { now: now, decorate: decorate, hijri: hijri };
})();
