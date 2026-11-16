/* Baby Mo Hijaiyah — illustrated backgrounds, one per world (level screens) and per tab (map, stickers, parents).
   Drawn as SVG in the same soft, flat style as the home hills (scene.js). Rules so they never get in the way:
   • the art lives in the bottom ~28% (ground) and as small sky details at the top; the middle stays calm and empty
   • colours are pastel and low-contrast behind the glass cards; dark mode gets a night version of every scene
   • motion is slow (8–90 s loops), small, and only transform/opacity; none with prefers-reduced-motion
   Nothing here depicts people, prophets or angels; the Qur'an scene uses geometric patterns and lanterns only. */
(function () {
  var W = 430, H = 932, uid = 0;
  function dark() { return document.documentElement.getAttribute("data-theme") === "dark"; }
  function lg(id, a, b, x2, y2) { return '<linearGradient id="' + id + '" x1="0" y1="0" x2="' + (x2 || 0) + '" y2="' + (y2 == null ? 1 : y2) + '"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient>'; }
  function rg(id, a, b, op) { return '<radialGradient id="' + id + '"><stop offset="0" stop-color="' + a + '" stop-opacity="' + (op == null ? 1 : op) + '"/><stop offset="1" stop-color="' + b + '" stop-opacity="0"/></radialGradient>'; }
  function g(cls, inner, extra) { return '<g class="' + cls + '"' + (extra || "") + ">" + inner + "</g>"; }

  /* ---------- shared pieces ---------- */
  function cloud(x, y, s, c, cls) {
    return g("bgc " + (cls || ""), '<path transform="translate(' + x + " " + y + ") scale(" + s + ')" d="M14 40 C2 40 0 26 12 23 C10 9 28 4 36 14 C42 2 64 2 68 17 C82 13 92 26 84 36 C88 41 82 44 76 44 L18 44 C14 44 12 42 14 40 Z" fill="' + c + '"/>');
  }
  function sunMoon(x, y, r, P, id) {
    if (P.night) return '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 2.4) + '" fill="url(#' + id + 'mg)" class="bgglow"/>' +
      '<path d="M' + (x + r * .3) + " " + (y - r) + " A" + r + " " + r + " 0 1 0 " + (x + r) + " " + (y + r * .25) + " A" + (r * .78) + " " + (r * .78) + " 0 0 1 " + (x + r * .3) + " " + (y - r) + 'Z" fill="#FFF1B8"/>';
    return '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 2.6) + '" fill="url(#' + id + 'sg)" class="bgglow"/>' +
      g("bgspin", Array.apply(null, Array(12)).map(function (_, i) { var a = i * 30 * Math.PI / 180; return '<path d="M' + (x + Math.cos(a) * r * 1.3) + " " + (y + Math.sin(a) * r * 1.3) + " L" + (x + Math.cos(a) * r * 1.75) + " " + (y + Math.sin(a) * r * 1.75) + '" stroke="#FFD95A" stroke-width="5" stroke-linecap="round" opacity=".55"/>'; }).join(""), ' style="transform-origin:' + x + "px " + y + 'px"') +
      '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#FFE27A"/><circle cx="' + (x - r * .3) + '" cy="' + (y - r * .3) + '" r="' + (r * .45) + '" fill="#FFF6C9" opacity=".8"/>';
  }
  function stars(n, top, bottom, seed) {
    var s = "", r = seed || 7;
    for (var i = 0; i < n; i++) { r = (r * 9301 + 49297) % 233280; var x = r / 233280 * W; r = (r * 9301 + 49297) % 233280; var y = top + r / 233280 * (bottom - top);
      s += i % 4 ? '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (1 + i % 3 * .6) + '" fill="#FFF6D6" class="bgtw" style="animation-delay:-' + (i * .7 % 4).toFixed(1) + 's"/>'
        : '<path transform="translate(' + x.toFixed(1) + " " + y.toFixed(1) + ')" d="M0 -6 L1.6 -1.6 L6 0 L1.6 1.6 L0 6 L-1.6 1.6 L-6 0 L-1.6 -1.6Z" fill="#FFF1B8" class="bgtw" style="animation-delay:-' + (i * .9 % 4).toFixed(1) + 's"/>'; }
    return s;
  }
  function birds(x, y, c) { return g("bgbirds", '<path d="M' + x + " " + y + " q6 -6 12 0 q6 -6 12 0 M" + (x + 30) + " " + (y - 14) + " q5 -5 10 0 q5 -5 10 0 M" + (x + 14) + " " + (y - 30) + ' q4 -4 8 0 q4 -4 8 0" fill="none" stroke="' + c + '" stroke-width="2.4" stroke-linecap="round"/>'); }
  function frame(id, P, body) {
    return '<svg class="bg-svg" viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs>' +
      lg(id + "sky", P.sky[0], P.sky[1]) + '<linearGradient id="' + id + 'veil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + P.sky[1] + '" stop-opacity="0"/><stop offset=".5" stop-color="' + P.sky[1] + '" stop-opacity="' + (P.veil == null ? .32 : P.veil) + '"/><stop offset="1" stop-color="' + P.sky[1] + '" stop-opacity="0"/></linearGradient>' + rg(id + "sg", "#FFF3B0", "#FFF3B0", .9) + rg(id + "mg", "#A9B4FF", "#A9B4FF", .35) + (P.defs || "") + "</defs>" +
      '<rect width="' + W + '" height="' + H + '" fill="url(#' + id + 'sky)"/>' + body +
      '<rect y="300" width="' + W + '" height="500" fill="url(#' + id + 'veil)"/>' + "</svg>";
  }

  /* ---------- scenes ---------- */
  var S = {};
  // Book 1 — Fathah Island: sea, a sandy island, palm trees, a little sailboat, shells
  S.w1 = function (id, n) {
    var P = { night: n, sky: n ? ["#121A3E", "#2B3270"] : ["#BDE5FF", "#F2FAFF"] };
    var sea = n ? ["#24407A", "#172B57"] : ["#7FD4EE", "#46B6DD"], sand = n ? ["#6E5E86", "#4E4468"] : ["#FFE7AE", "#F6CF82"], leaf = n ? "#2E6F6A" : "#3CC377", leaf2 = n ? "#235A57" : "#2BA463", trunk = n ? "#6B5070" : "#C98B50";
    P.defs = lg(id + "sea", sea[0], sea[1]) + lg(id + "sand", sand[0], sand[1]);
    function palm(x, y, s, flip) {
      return g("bgsway", '<g transform="translate(' + x + " " + y + ") scale(" + (flip ? -s : s) + " " + s + ')"><path d="M0 0 C-4 -40 4 -80 14 -110" stroke="' + trunk + '" stroke-width="11" fill="none" stroke-linecap="round"/>' +
        '<path d="M-2 -20 l10 -3 M0 -45 l11 -2 M5 -70 l10 0 M10 -92 l9 1" stroke="' + (n ? "#55405C" : "#A86E3A") + '" stroke-width="2.5" stroke-linecap="round"/>' +
        '<path d="M14 -110 C-10 -128 -40 -118 -52 -96 C-30 -110 -8 -108 14 -110Z M14 -110 C40 -132 70 -122 80 -98 C58 -112 36 -110 14 -110Z M14 -110 C0 -140 22 -160 44 -158 C26 -148 18 -132 14 -110Z M14 -110 C-14 -140 -46 -142 -60 -126 C-36 -132 -14 -124 14 -110Z M14 -110 C34 -96 44 -74 40 -54 C30 -76 22 -92 14 -110Z" fill="' + leaf + '"/>' +
        '<path d="M14 -110 C-6 -122 -30 -116 -40 -102 M14 -110 C36 -124 58 -118 66 -104" stroke="' + leaf2 + '" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        '<circle cx="10" cy="-104" r="6" fill="' + (n ? "#5A4A3A" : "#8A5A2B") + '"/><circle cx="20" cy="-102" r="6" fill="' + (n ? "#4A3C30" : "#7A4E24") + '"/></g>', ' style="transform-origin:' + x + "px " + y + 'px"');
    }
    return frame(id, P,
      (n ? stars(34, 70, 560, 3) : "") + sunMoon(338, 150, 34, P, id) +
      cloud(30, 120, 1, n ? "#2A3470" : "#fff", "bgdrift") + cloud(240, 230, .7, n ? "#262F66" : "#fff", "bgdrift b") + (n ? "" : birds(70, 300, "#6F8FB0")) +
      '<rect y="700" width="' + W + '" height="232" fill="url(#' + id + 'sea)"/>' +
      g("bgwave", '<path d="M-60 712 q15 -8 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0" stroke="#fff" stroke-opacity="' + (n ? .18 : .55) + '" stroke-width="3" fill="none"/>') +
      g("bgwave b", '<path d="M-60 744 q20 -8 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" stroke="#fff" stroke-opacity="' + (n ? .12 : .35) + '" stroke-width="3" fill="none"/>') +
      g("bgbob", '<g transform="translate(300 708)"><path d="M-26 0 L26 0 L18 12 L-18 12Z" fill="' + (n ? "#8A5A7A" : "#FF8A65") + '"/><path d="M0 0 L0 -44" stroke="' + (n ? "#9A8AA8" : "#8A6A4A") + '" stroke-width="3"/><path d="M2 -42 L24 -6 L2 -6Z" fill="' + (n ? "#C8C2E8" : "#fff") + '"/><path d="M-2 -36 L-18 -8 L-2 -8Z" fill="' + (n ? "#A9A2D2" : "#FFE27A") + '"/></g>') +
      '<path d="M-20 932 L-20 812 C60 770 170 776 240 800 C320 826 380 806 450 790 L450 932Z" fill="url(#' + id + 'sand)"/>' +
      palm(70, 822, .9, false) + palm(392, 832, .75, true) +
      '<g opacity="' + (n ? .5 : .9) + '"><path transform="translate(190 880) scale(.9)" d="M0 -12 L3 -4 L12 -4 L5 1 L8 10 L0 5 L-8 10 L-5 1 L-12 -4 L-3 -4Z" fill="' + (n ? "#C47A8A" : "#FF8FA3") + '"/><path transform="translate(262 862)" d="M-8 0 C-8 -10 8 -10 8 0 Z" fill="' + (n ? "#B9A0C8" : "#FFD6E0") + '"/><path d="M256 862 l2 -8 M262 862 l0 -9 M268 862 l-2 -8" stroke="' + (n ? "#8A7AA0" : "#F2A7B8") + '" stroke-width="1.5"/></g>');
  };
  // Book 2 — Joining Forest: soft hills, round and pointy trees, mushrooms, butterflies (fireflies at night)
  S.w2 = function (id, n) {
    var P = { night: n, sky: n ? ["#10203A", "#22406A"] : ["#CFF0D8", "#F4FFF2"] };
    var h1 = n ? "#1E4A4A" : "#A8E3A0", h2 = n ? "#173C3C" : "#7ED07A", h3 = n ? "#123232" : "#58BC5E";
    function tree(x, y, s, c1, c2) { return g("bgsway", '<g transform="translate(' + x + " " + y + ") scale(" + s + ')"><rect x="-5" y="-30" width="10" height="34" rx="4" fill="' + (n ? "#3E3A4A" : "#A0703F") + '"/><circle cx="0" cy="-56" r="30" fill="' + c1 + '"/><circle cx="-18" cy="-40" r="20" fill="' + c1 + '"/><circle cx="18" cy="-42" r="21" fill="' + c2 + '"/><circle cx="-8" cy="-66" r="10" fill="#fff" opacity="' + (n ? .06 : .25) + '"/></g>', ' style="transform-origin:' + x + "px " + y + 'px"'); }
    function pine(x, y, s, c) { return g("bgsway b", '<g transform="translate(' + x + " " + y + ") scale(" + s + ')"><rect x="-4" y="-16" width="8" height="18" fill="' + (n ? "#3A3444" : "#8A5E34") + '"/><path d="M0 -96 L26 -44 L14 -44 L32 -14 L-32 -14 L-14 -44 L-26 -44Z" fill="' + c + '"/></g>', ' style="transform-origin:' + x + "px " + y + 'px"'); }
    function mush(x, y, s) { return '<g transform="translate(' + x + " " + y + ") scale(" + s + ')"><rect x="-5" y="-14" width="10" height="14" rx="4" fill="' + (n ? "#C8BFD8" : "#FFF4E2") + '"/><path d="M-16 -12 C-16 -30 16 -30 16 -12Z" fill="' + (n ? "#9A4A6A" : "#FF6B6B") + '"/><circle cx="-6" cy="-20" r="3" fill="#fff" opacity=".9"/><circle cx="6" cy="-17" r="2.4" fill="#fff" opacity=".9"/></g>'; }
    var fly = n ? [[90, 640], [330, 600], [210, 690], [380, 700], [40, 560]].map(function (p, i) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.2" fill="#FFF07A" class="bgfly" style="animation-delay:-' + i * 1.3 + 's"/>'; }).join("")
      : g("bgflut", '<g transform="translate(330 610)"><path d="M0 0 C-12 -14 -18 2 -4 4 C-16 8 -8 18 0 6 C8 18 16 8 4 4 C18 2 12 -14 0 0Z" fill="#FFB84D"/></g>') + g("bgflut b", '<g transform="translate(80 560) scale(.8)"><path d="M0 0 C-12 -14 -18 2 -4 4 C-16 8 -8 18 0 6 C8 18 16 8 4 4 C18 2 12 -14 0 0Z" fill="#C59BFF"/></g>');
    return frame(id, P,
      (n ? stars(26, 60, 480, 11) : "") + sunMoon(74, 140, 30, P, id) + cloud(250, 110, .9, n ? "#24385A" : "#fff", "bgdrift") + cloud(10, 250, .6, n ? "#1F3352" : "#fff", "bgdrift b") +
      '<path d="M-20 932 L-20 740 C80 700 160 712 230 736 C300 760 380 720 450 712 L450 932Z" fill="' + h1 + '"/>' +
      pine(40, 760, .9, n ? "#1F5550" : "#4FB66A") + pine(398, 744, 1, n ? "#1C4E4A" : "#45A962") + tree(330, 770, .9, n ? "#23605A" : "#6CCB6F", n ? "#1D5550" : "#55B95E") +
      '<path d="M-20 932 L-20 800 C70 778 150 790 220 810 C300 832 370 800 450 792 L450 932Z" fill="' + h2 + '"/>' +
      tree(96, 838, 1.05, n ? "#20584F" : "#5BC163", n ? "#1A4C45" : "#47AA55") + pine(250, 832, .8, n ? "#1A4A44" : "#3FA55B") +
      '<path d="M-20 932 L-20 872 C90 850 200 862 290 874 C350 882 400 868 450 862 L450 932Z" fill="' + h3 + '"/>' +
      mush(180, 884, 1) + mush(208, 890, .7) + mush(372, 880, .85) + fly +
      '<g opacity="' + (n ? .4 : .85) + '">' + [[30, 900], [140, 896], [300, 902], [420, 894]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4" fill="#fff"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="1.8" fill="#FFD43B"/>'; }).join("") + "</g>");
  };
  // Book 3 — Kasrah-Dhammah Mountain: pastel peaks with snow caps, a hot-air balloon, clouds below the peaks
  S.w3 = function (id, n) {
    var P = { night: n, sky: n ? ["#141638", "#33306A"] : ["#C9DCFF", "#F6F2FF"] };
    function peak(x, y, w, h, c1, c2) { return '<path d="M' + (x - w) + " " + y + " L" + x + " " + (y - h) + " L" + (x + w) + " " + y + 'Z" fill="' + c1 + '"/><path d="M' + x + " " + (y - h) + " L" + (x + w) + " " + y + " L" + (x + w * .2) + " " + y + 'Z" fill="' + c2 + '"/>' +
      '<path d="M' + (x - w * .3) + " " + (y - h * .7) + " L" + x + " " + (y - h) + " L" + (x + w * .3) + " " + (y - h * .7) + " L" + (x + w * .14) + " " + (y - h * .62) + " L" + x + " " + (y - h * .72) + " L" + (x - w * .14) + " " + (y - h * .6) + 'Z" fill="' + (n ? "#C9C6EA" : "#FFFFFF") + '"/>'; }
    return frame(id, P,
      (n ? stars(40, 60, 600, 5) : "") + sunMoon(350, 132, 30, P, id) + cloud(30, 160, .8, n ? "#2C2E66" : "#fff", "bgdrift") +
      g("bgbob", '<g transform="translate(110 330)"><path d="M0 -40 C-30 -40 -34 -4 -12 14 L12 14 C34 -4 30 -40 0 -40Z" fill="' + (n ? "#9A5C8A" : "#FF8A80") + '"/><path d="M0 -40 C-12 -40 -14 -4 -5 14 L5 14 C14 -4 12 -40 0 -40Z" fill="' + (n ? "#C9A24A" : "#FFD54A") + '"/><path d="M-12 14 L-7 30 M12 14 L7 30" stroke="' + (n ? "#8A7A9A" : "#9A7A5A") + '" stroke-width="2"/><rect x="-9" y="30" width="18" height="12" rx="3" fill="' + (n ? "#7A5A4A" : "#B07A4A") + '"/></g>') +
      peak(90, 810, 150, 180, n ? "#3A3C78" : "#B9B2F0", n ? "#2E3066" : "#9C94E2") + peak(330, 816, 170, 220, n ? "#34366E" : "#A9C2F5", n ? "#2A2C60" : "#8CA8EC") +
      cloud(130, 740, 1.2, n ? "#3A3F7E" : "#fff", "bgdrift b") + cloud(-10, 780, 1, n ? "#33387A" : "#F4F2FF", "bgdrift") +
      '<path d="M-20 932 L-20 820 C80 796 180 808 260 826 C340 844 400 820 450 812 L450 932Z" fill="' + (n ? "#2A3A5E" : "#9AD9B4") + '"/>' +
      '<path d="M-20 932 L-20 870 C100 852 220 864 320 878 C380 886 420 876 450 872 L450 932Z" fill="' + (n ? "#23324F" : "#7CCB9C") + '"/>' +
      g("bgsway", '<path d="M380 868 L380 812" stroke="' + (n ? "#8A8AA8" : "#8A6A4A") + '" stroke-width="3"/><path d="M381 814 L408 822 L381 832Z" fill="' + (n ? "#C47A9A" : "#FF6B8B") + '"/>', ' style="transform-origin:380px 868px"'));
  };
  // Book 4 — Tanwin & Sukun Sea: under the water — rays of light, seaweed, coral, bubbles, slow fish (glowing jellyfish at night)
  S.w4 = function (id, n) {
    var P = { night: n, sky: n ? ["#0B1F3A", "#061428"] : ["#BFF0F7", "#7CD3E6"] };
    function weed(x, y, h, c, d) { return g("bgsway" + (d ? " b" : ""), '<path d="M' + x + " " + y + " C" + (x - 14) + " " + (y - h * .3) + " " + (x + 14) + " " + (y - h * .6) + " " + x + " " + (y - h) + '" stroke="' + c + '" stroke-width="9" fill="none" stroke-linecap="round"/>', ' style="transform-origin:' + x + "px " + y + 'px"'); }
    function fish(cls, x, y, s, c, flip) { return g(cls, '<g transform="translate(' + x + " " + y + ") scale(" + (flip ? -s : s) + " " + s + ')"><path d="M0 0 C10 -12 34 -12 40 0 C34 12 10 12 0 0Z" fill="' + c + '"/><path d="M0 0 L-12 -10 L-12 10Z" fill="' + c + '"/><circle cx="30" cy="-2" r="2.6" fill="#1D2433"/><path d="M16 -8 C20 -2 20 2 16 8" stroke="#fff" stroke-opacity=".5" stroke-width="2" fill="none"/></g>'); }
    var bub = [[60, 0], [140, 3], [250, 1.5], [360, 4.5], [310, 6]].map(function (b, i) { return '<circle cx="' + b[0] + '" cy="880" r="' + (4 + i % 3 * 2) + '" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2" class="bgrise" style="animation-delay:-' + b[1] + 's"/>'; }).join("");
    var jelly = n ? [[90, 420, 0], [330, 300, 3]].map(function (j) { return g("bgbob" + (j[2] ? " b" : ""), '<g transform="translate(' + j[0] + " " + j[1] + ')"><path d="M-18 0 C-18 -24 18 -24 18 0Z" fill="#9EF0FF" opacity=".55"/><path d="M-12 0 q-4 14 0 26 M0 0 q4 14 0 30 M12 0 q-4 14 0 24" stroke="#9EF0FF" stroke-opacity=".45" stroke-width="2" fill="none"/></g>'); }).join("") : "";
    return frame(id, P,
      '<g opacity="' + (n ? .05 : .22) + '"><g class="bgray">' + [[60, 0], [190, 30], [310, 10]].map(function (r) { return '<path d="M' + r[0] + " -20 L" + (r[0] + 40) + " -20 L" + (r[0] + 110 + r[1]) + " 760 L" + (r[0] + 40 + r[1]) + ' 760Z" fill="#fff"/>'; }).join("") + "</g></g>" +
      jelly + fish("bgswim", -60, 540, 1.2, n ? "#4A6AA8" : "#FFB84D") + fish("bgswim b", -60, 660, 1, n ? "#5A5AA0" : "#FF8FA3") + fish("bgswim c", -60, 250, .8, n ? "#3A7A9A" : "#7AA8FF", false) +
      '<path d="M-20 932 L-20 836 C70 812 160 826 240 842 C320 858 390 832 450 826 L450 932Z" fill="' + (n ? "#1B2E4A" : "#F3DDA8") + '"/>' +
'<path d="M150 872 C150 850 196 846 200 872Z M330 868 C334 852 362 850 366 868Z" fill="' + (n ? "#2A3A5A" : "#D8C28A") + '"/>' + fish("bgswim b", -60, 330, .7, n ? "#4A7A8A" : "#5FD3A8", false) +
      weed(30, 860, 120, n ? "#1F5A5A" : "#3CC28A") + weed(52, 866, 80, n ? "#1A4E50" : "#2FAE78", 1) + weed(400, 850, 130, n ? "#1F5A5A" : "#3CC28A", 1) + weed(380, 860, 90, n ? "#1A4E50" : "#2FAE78") +
      '<g transform="translate(210 862)"><path d="M0 0 C-4 -20 -18 -28 -14 -44 M0 0 C2 -24 14 -30 10 -50 M0 -18 C10 -26 22 -26 24 -36" stroke="' + (n ? "#8A4A6A" : "#FF7A8A") + '" stroke-width="8" fill="none" stroke-linecap="round"/></g>' +
      '<g transform="translate(300 880)"><circle r="16" fill="' + (n ? "#5A4A7A" : "#C59BFF") + '"/><circle cx="-6" cy="-5" r="3" fill="#fff" opacity=".5"/></g><g transform="translate(120 888) scale(.8)"><path d="M0 -12 L3 -4 L12 -4 L5 1 L8 10 L0 5 L-8 10 L-5 1 L-12 -4 L-3 -4Z" fill="' + (n ? "#B07A5A" : "#FFB84D") + '"/></g>' + bub);
  };
  // Book 5 — Tasydid Town: rounded colourful houses, a little clock tower, bunting, trees (lit windows at night)
  S.w5 = function (id, n) {
    var P = { night: n, sky: n ? ["#16163A", "#38306A"] : ["#FFE3EE", "#FFF8EC"] };
    var win = n ? "#FFE58A" : "#CFEFFF";
    function house(x, y, w, h, c, roof) { return '<g transform="translate(' + x + " " + y + ')"><rect x="0" y="' + (-h) + '" width="' + w + '" height="' + h + '" rx="8" fill="' + c + '"/><path d="M-6 ' + (-h + 2) + " Q" + (w / 2) + " " + (-h - w * .55) + " " + (w + 6) + " " + (-h + 2) + 'Z" fill="' + roof + '"/>' +
      '<rect x="' + (w * .2) + '" y="' + (-h * .72) + '" width="' + (w * .24) + '" height="' + (w * .24) + '" rx="4" fill="' + win + '" class="' + (n ? "bgwin" : "") + '"/><rect x="' + (w * .56) + '" y="' + (-h * .72) + '" width="' + (w * .24) + '" height="' + (w * .24) + '" rx="4" fill="' + win + '"/><path d="M' + (w * .38) + " 0 L" + (w * .38) + " " + (-h * .34) + " Q" + (w * .5) + " " + (-h * .46) + " " + (w * .62) + " " + (-h * .34) + " L" + (w * .62) + ' 0Z" fill="' + (n ? "#3A2E4A" : "#B07A4A") + '"/></g>'; }
    var flags = ["#FF6B6B", "#FFB800", "#34C759", "#3B82F6", "#A855F7", "#FF7AB6"];
    return frame(id, P,
      (n ? stars(30, 60, 540, 9) : "") + sunMoon(80, 130, 28, P, id) + cloud(250, 150, .8, n ? "#2E2A60" : "#fff", "bgdrift") + (n ? "" : birds(300, 260, "#C08AA0")) +
      '<path d="M-20 932 L-20 770 C100 740 300 750 450 770 L450 932Z" fill="' + (n ? "#2A2A56" : "#F6D9C8") + '"/>' +
'<g transform="translate(215 850) scale(.82) translate(-215 -850)">' + house(-4, 800, 70, 70, n ? "#4A3E6E" : "#FFB4A2", n ? "#6A4A7A" : "#FF7A6B") + house(78, 812, 64, 96, n ? "#3E4A72" : "#A8D8FF", n ? "#5A5A8A" : "#5AA8F0") +
      '<g transform="translate(160 800)"><rect x="0" y="-150" width="40" height="150" rx="8" fill="' + (n ? "#55447A" : "#FFE08A") + '"/><path d="M-6 -148 Q20 -190 46 -148Z" fill="' + (n ? "#7A5A8A" : "#FF9F43") + '"/><circle cx="20" cy="-118" r="13" fill="' + (n ? "#FFF0B8" : "#fff") + '"/><path d="M20 -118 L20 -127 M20 -118 L26 -114" stroke="#5A4A3A" stroke-width="2.4" stroke-linecap="round"/></g>' +
      house(212, 806, 74, 84, n ? "#45406E" : "#C6F0C2", n ? "#5E4E80" : "#4CC27A") + house(296, 798, 66, 66, n ? "#4E3E66" : "#FFC9E5", n ? "#6E4E7E" : "#F06AA8") + house(370, 812, 70, 96, n ? "#3A466E" : "#FFE6A8", n ? "#5A5A86" : "#F2A93B") +
      "</g>" + g("bgsway b", '<path d="M0 740 Q110 772 215 748 Q320 772 430 740" stroke="' + (n ? "#8A7AA8" : "#C8A58A") + '" stroke-width="2" fill="none"/>' + Array.apply(null, Array(12)).map(function (_, i) { var x = 14 + i * 36, y = 741 + Math.sin(i / 11 * Math.PI) * 20; return '<path d="M' + (x - 9) + " " + y + " L" + (x + 9) + " " + y + " L" + x + " " + (y + 16) + 'Z" fill="' + flags[i % 6] + '" opacity="' + (n ? .7 : 1) + '"/>'; }).join(""),  ' style="transform-origin:215px 740px"') +
      '<path d="M-20 932 L-20 842 C120 828 300 832 450 846 L450 932Z" fill="' + (n ? "#23234A" : "#9ADB8E") + '"/>' +
      '<path d="M-20 932 L-20 872 C150 864 300 866 450 878 L450 932Z" fill="' + (n ? "#1E1E42" : "#7CCB7A") + '"/>');
  };
  // Book 6 — Tajwid Palace: a palace with domes and arches, a fountain, hedges and hanging lanterns
  S.w6 = function (id, n) {
    var P = { night: n, sky: n ? ["#12163A", "#3A2A5E"] : ["#FFD8C4", "#FFF4EA"] };
    var wall = n ? "#3E3A6A" : "#FFF7EC", wall2 = n ? "#34305E" : "#F2D9B8", dome = n ? "#6A5A9A" : "#6CC4D6", dome2 = n ? "#5A4A88" : "#3FA9C2", shade = n ? "rgba(0,0,0,.18)" : "rgba(190,140,80,.16)";
    function lantern(x, y, d) { return g("bgsway" + (d ? " b" : ""), '<path d="M' + x + " 660 L" + x + " " + (y - 16) + '" stroke="' + (n ? "#8A7AA8" : "#C8A06A") + '" stroke-width="1.6"/><g transform="translate(' + x + " " + y + ')"><path d="M-8 -16 L8 -16 L12 -4 L8 14 L-8 14 L-12 -4Z" fill="' + (n ? "#FFC94D" : "#F2A93B") + '"/><path d="M-6 -10 L6 -10 L8 -2 L5 10 L-5 10 L-8 -2Z" fill="' + (n ? "#FFF0A8" : "#FFE08A") + '" class="' + (n ? "bgwin" : "") + '"/><path d="M-5 -16 L0 -24 L5 -16Z" fill="' + (n ? "#C99A3A" : "#C77700") + '"/></g>', ' style="transform-origin:' + x + 'px 600px"'); }
    function arch(x, y, w, h, c) { return '<path d="M' + x + " " + y + " L" + x + " " + (y - h + w / 2) + " Q" + (x + w / 2) + " " + (y - h - w * .3) + " " + (x + w) + " " + (y - h + w / 2) + " L" + (x + w) + " " + y + 'Z" fill="' + c + '"/>'; }
    var winC = n ? "#FFE58A" : "#9ED8E6";
    return frame(id, P,
      (n ? stars(36, 60, 520, 13) : "") + sunMoon(360, 120, 26, P, id) + cloud(20, 150, .7, n ? "#2E2A62" : "#fff", "bgdrift") +
'<g transform="translate(215 840) scale(.8) translate(-215 -840)">' + '<rect x="40" y="700" width="350" height="140" fill="' + wall2 + '"/>' +
      '<path d="M150 704 C150 640 280 640 280 704Z" fill="' + dome + '"/><path d="M215 640 C255 650 278 676 280 704 L240 704 C240 676 232 654 215 640Z" fill="' + dome2 + '"/><path d="M215 640 L215 618" stroke="' + (n ? "#C9A24A" : "#E0A100") + '" stroke-width="3"/><circle cx="215" cy="614" r="5" fill="' + (n ? "#FFD95A" : "#FFC21A") + '"/>' +
      [40, 356].map(function (x) { return '<rect x="' + x + '" y="660" width="34" height="180" fill="' + wall + '"/><rect x="' + (x + 22) + '" y="660" width="12" height="180" fill="' + shade + '"/><path d="M' + (x - 4) + ' 662 C' + (x - 4) + " 630 " + (x + 38) + " 630 " + (x + 38) + ' 662Z" fill="' + dome + '"/><path d="M' + (x + 17) + ' 640 C' + (x + 30) + " 642 " + (x + 38) + " 652 " + (x + 38) + " 662 L" + (x + 26) + " 662 C" + (x + 26) + " 652 " + (x + 22) + " 644 " + (x + 17) + ' 640Z" fill="' + dome2 + '"/>' + arch(x + 10, 700, 14, 26, winC) + arch(x + 10, 760, 14, 26, winC); }).join("") +
      '<rect x="74" y="720" width="282" height="120" fill="' + wall + '"/>' +'<rect x="74" y="826" width="282" height="14" fill="' + shade + '"/><path d="M172 690 C182 672 200 660 214 658" stroke="#fff" stroke-opacity="' + (n ? .12 : .5) + '" stroke-width="5" fill="none" stroke-linecap="round"/>' +
      [90, 150, 245, 305].map(function (x) { return arch(x, 800, 36, 62, winC); }).join("") + arch(196, 840, 38, 92, n ? "#2A2448" : "#C8A06A") +
      '<path d="M74 724 L356 724" stroke="' + (n ? "#5A4E8A" : "#E8C890") + '" stroke-width="6"/>' + '<g opacity=".5">' + [100, 140, 180, 220, 260, 300, 340].map(function (x) { return '<path transform="translate(' + x + ' 742)" d="M0 -6 L6 0 L0 6 L-6 0Z" fill="' + (n ? "#8A7AC8" : "#E0B070") + '"/>'; }).join("") + "</g>" +
      "</g>" + lantern(28, 720) + lantern(404, 712, 1) +
      '<path d="M-20 932 L-20 840 L450 840 L450 932Z" fill="' + (n ? "#24244A" : "#B9E3A6") + '"/>' +
      '<g transform="translate(215 892)"><ellipse rx="62" ry="14" fill="' + (n ? "#3A5A8A" : "#9EE3F2") + '"/><ellipse rx="62" ry="14" fill="none" stroke="' + (n ? "#5A6AA8" : "#fff") + '" stroke-width="5"/><rect x="-5" y="-40" width="10" height="34" fill="' + (n ? "#5A5A8A" : "#F6E2C2") + '"/>' +
      g("bgfount", '<path d="M0 -40 C-10 -60 -26 -54 -30 -30 M0 -40 C10 -60 26 -54 30 -30 M0 -40 L0 -62" stroke="' + (n ? "#9EC8FF" : "#7ACDE8") + '" stroke-width="3" fill="none" stroke-linecap="round"/>') + "</g>" +
      [20, 72, 358, 410].map(function (x, i) { return '<path d="M' + (x - 26) + " 872 C" + (x - 28) + " 842 " + (x + 28) + " 842 " + (x + 26) + ' 872Z" fill="' + (n ? "#1F4A44" : "#5BC163") + '"/><path d="M' + (x - 14) + " 852 C" + (x - 6) + " 846 " + (x + 6) + " 846 " + (x + 12) + ' 850" stroke="#fff" stroke-opacity="' + (n ? .08 : .3) + '" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        (n ? "" : '<circle cx="' + (x - 8) + '" cy="858" r="3.2" fill="' + ["#FF8FA3", "#FFD54A", "#FFFFFF", "#C59BFF"][i] + '"/><circle cx="' + (x + 9) + '" cy="862" r="3" fill="' + ["#FFFFFF", "#FF8FA3", "#FFD54A", "#FFFFFF"][i] + '"/>'); }).join(""));
  };
  // Book 7 — Qur'an Gate: a golden evening, a grand arched gate with a geometric star pattern, crescent, glowing lanterns
  S.w7 = function (id, n) {
    var P = { night: n, sky: n ? ["#0E1236", "#3A2660"] : ["#FFD9A8", "#FFF4E2"] };
    P.defs = lg(id + "gate", n ? "#4A3C7A" : "#FFE7B0", n ? "#2E2656" : "#F2C877") + rg(id + "gl", "#FFE9A8", "#FFE9A8", n ? .5 : .7);
    function star8(x, y, r, c, o) { var p = ""; for (var i = 0; i < 16; i++) { var a = i * Math.PI / 8, rr = i % 2 ? r * .55 : r; p += (i ? "L" : "M") + (x + Math.cos(a) * rr).toFixed(1) + " " + (y + Math.sin(a) * rr).toFixed(1); } return '<path d="' + p + 'Z" fill="' + c + '" opacity="' + (o || 1) + '"/>'; }
    function lantern(x, y, cls) { return g("bgsway " + (cls || ""), '<path d="M' + x + " 640 L" + x + " " + (y - 22) + '" stroke="' + (n ? "#C9A24A" : "#C88A3A") + '" stroke-width="1.6"/><g transform="translate(' + x + " " + y + ')"><circle r="30" fill="url(#' + id + 'gl)" class="bgglow"/><path d="M-6 -22 L6 -22 L4 -16 L-4 -16Z" fill="#C99A3A"/><path d="M-12 -16 L12 -16 L16 0 L12 18 L-12 18 L-16 0Z" fill="' + (n ? "#E0A23A" : "#F2A93B") + '"/><path d="M-8 -11 L8 -11 L11 0 L8 13 L-8 13 L-11 0Z" fill="#FFF0B0"/><path d="M0 -11 L0 13 M-10 0 L10 0" stroke="#E0A23A" stroke-width="1.5"/><path d="M-5 18 L5 18 L0 26Z" fill="#C99A3A"/></g>', ' style="transform-origin:' + x + 'px 640px"'); }
    var gx = 215, top = 600;
    return frame(id, P,
      (n ? stars(46, 60, 600, 17) : stars(10, 70, 300, 17).replace(/#FFF6D6|#FFF1B8/g, "#FFFFFF")) +
      '<g transform="translate(330 140)"><circle r="70" fill="url(#' + id + 'gl)" class="bgglow"/><path d="M8 -30 A30 30 0 1 0 30 8 A23 23 0 0 1 8 -30Z" fill="' + (n ? "#FFF1B8" : "#FFFFFF") + '"/></g>' +
      cloud(30, 170, .8, n ? "#3A2E6E" : "#FFF3E2", "bgdrift") +
      '<path d="M-20 932 L-20 800 C100 784 330 784 450 800 L450 932Z" fill="' + (n ? "#2A2050" : "#F7D9A8") + '"/>' +
      // the gate
      '<g transform="translate(215 860) scale(.78) translate(-215 -860)"><rect x="' + (gx - 120) + '" y="' + (top + 40) + '" width="240" height="' + (860 - top - 40) + '" rx="10" fill="url(#' + id + 'gate)"/>' +
      '<path d="M' + (gx - 70) + " 860 L" + (gx - 70) + " " + (top + 120) + " Q" + gx + " " + (top + 10) + " " + (gx + 70) + " " + (top + 120) + " L" + (gx + 70) + ' 860Z" fill="' + (n ? "#1A1440" : "#FFF8EA") + '"/>' +
      '<path d="M' + (gx - 70) + " " + (top + 120) + " Q" + gx + " " + (top + 10) + " " + (gx + 70) + " " + (top + 120) + '" fill="none" stroke="' + (n ? "#C9A24A" : "#E0A100") + '" stroke-width="6"/>' +
      '<g class="bgglow">' + star8(gx, top + 110, 26, n ? "#FFD95A" : "#F2B53A") + star8(gx, top + 110, 12, n ? "#1A1440" : "#FFF8EA") + "</g>" +
      [-96, 96].map(function (d) { return star8(gx + d, top + 90, 14, n ? "#C9A24A" : "#E8B04A", .9) + star8(gx + d, top + 160, 10, n ? "#C9A24A" : "#E8B04A", .7); }).join("") +
      '<path d="M' + (gx - 130) + " " + (top + 46) + " L" + (gx + 130) + " " + (top + 46) + '" stroke="' + (n ? "#C9A24A" : "#E0A100") + '" stroke-width="8" stroke-linecap="round"/>' +
      '<g opacity=".55">' + [-110, -88, -66, -44, -22, 0, 22, 44, 66, 88, 110].map(function (d) { return '<path transform="translate(' + (gx + d) + " " + (top + 30) + ')" d="M-8 10 L-8 -2 Q0 -14 8 -2 L8 10Z" fill="' + (n ? "#6A5A9A" : "#F2C877") + '"/>'; }).join("") + "</g></g>" +
      lantern(50, 712) + lantern(380, 700, "b") +
      '<path d="M-20 932 L-20 860 L450 860 L450 932Z" fill="' + (n ? "#221A46" : "#EBC690") + '"/><path d="M' + (gx - 70) + " 860 L" + (gx - 100) + " 932 L" + (gx + 100) + " 932 L" + (gx + 70) + ' 860Z" fill="' + (n ? "#2E2458" : "#F6DCAE") + '"/>');
  };
  // Map — sky with islands far away
  S.map = function (id, n) {
    var P = { night: n, sky: n ? ["#10173D", "#253068"] : ["#BFE3FF", "#F0F8FF"] };
    return frame(id, P,
      (n ? stars(40, 60, 700, 21) : "") + sunMoon(360, 130, 28, P, id) + cloud(20, 200, .9, n ? "#26306A" : "#fff", "bgdrift") + cloud(230, 420, .7, n ? "#222C62" : "#fff", "bgdrift b") + cloud(40, 620, .6, n ? "#202A5E" : "#fff", "bgdrift") + (n ? "" : birds(250, 300, "#6F8FB0")) +
      '<rect y="820" width="' + W + '" height="112" fill="' + (n ? "#1C2E5E" : "#8FD8F0") + '"/>' + g("bgwave", '<path d="M-60 830 q15 -7 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0" stroke="#fff" stroke-opacity="' + (n ? .15 : .5) + '" stroke-width="3" fill="none"/>') +
      '<path d="M40 860 C70 830 140 830 170 860Z" fill="' + (n ? "#2E5A5A" : "#7FCF7A") + '"/><path d="M270 880 C300 846 380 846 410 880Z" fill="' + (n ? "#3A4A6A" : "#B9B2F0") + '"/>');
  };
  // Sticker book — a playful sky with floating balloons and paper stars
  S.stickers = function (id, n) {
    var P = { night: n, sky: n ? ["#171A40", "#2E2A62"] : ["#FFE8F2", "#F4F0FF"] };
    function balloon(x, y, c, cls) { return g("bgbob " + (cls || ""), '<g transform="translate(' + x + " " + y + ')"><path d="M0 34 q-6 20 4 40" stroke="' + (n ? "#8A8AB0" : "#B0A0C0") + '" stroke-width="1.6" fill="none"/><ellipse rx="22" ry="27" fill="' + c + '" opacity="' + (n ? .7 : 1) + '"/><ellipse cx="-8" cy="-10" rx="5" ry="8" fill="#fff" opacity=".45"/><path d="M-4 26 L4 26 L0 33Z" fill="' + c + '"/></g>'); }
    function pstar(x, y, s, c, cls) { return g("bgtw " + (cls || ""), '<path transform="translate(' + x + " " + y + ") scale(" + s + ')" d="M0 -14 L4 -5 L14 -4 L6 3 L9 13 L0 8 L-9 13 L-6 3 L-14 -4 L-4 -5Z" fill="' + c + '"/>'); }
    return frame(id, P,
      (n ? stars(24, 60, 700, 31) : "") + balloon(40, 700, "#FF8FA3") + balloon(392, 640, "#7CC8FF", "b") + balloon(360, 760, "#FFD54A") + balloon(80, 820, "#B9A6FF", "b") +
      pstar(380, 200, 1.1, "#FFD54A") + pstar(40, 300, .8, "#FF8FA3", "b") + pstar(400, 420, .7, "#7CC8FF") + cloud(220, 860, 1.4, n ? "#252A60" : "#fff", "bgdrift") + cloud(-40, 890, 1.2, n ? "#222658" : "#FFF6FB", "bgdrift b"));
  };
  // Parents — calm hills, one tree, a few clouds
  S.parents = function (id, n) {
    var P = { night: n, sky: n ? ["#0F1634", "#1E2650"] : ["#E3F1FF", "#F7FBFF"] };
    return frame(id, P,
      (n ? stars(20, 60, 500, 41) : "") + cloud(250, 160, .8, n ? "#1E2A58" : "#fff", "bgdrift") +
      '<path d="M-20 932 L-20 840 C100 812 220 822 300 842 C360 856 410 846 450 838 L450 932Z" fill="' + (n ? "#1C2E48" : "#CDEBD5") + '"/>' +
      '<path d="M-20 932 L-20 884 C120 870 280 874 450 890 L450 932Z" fill="' + (n ? "#182840" : "#B4E0C2") + '"/>' +
      g("bgsway", '<g transform="translate(372 846)"><rect x="-4" y="-26" width="8" height="28" rx="3" fill="' + (n ? "#3A3A4A" : "#B08A60") + '"/><circle cy="-46" r="24" fill="' + (n ? "#1F4A44" : "#8ED49A") + '"/><circle cx="-14" cy="-34" r="15" fill="' + (n ? "#1F4A44" : "#8ED49A") + '"/><circle cx="14" cy="-36" r="16" fill="' + (n ? "#1A403B" : "#77C688") + '"/></g>', ' style="transform-origin:372px 846px"'));
  };

  /* ---------- the layer ---------- */
  var layer = null, curName = null, curDark = null;
  function set(name) {
    if (!layer) { layer = document.createElement("div"); layer.id = "bgl"; layer.setAttribute("aria-hidden", "true"); document.body.insertBefore(layer, document.body.firstChild); }
    var d = dark();
    if (name === curName && d === curDark) return;
    var old = layer.firstChild;
    curName = name; curDark = d;
    if (!name || !S[name]) { if (old) { old.classList.add("out"); setTimeout(function () { old.remove(); }, 500); } return; }
    var w = document.createElement("div"); w.className = "bg-scene in bg-" + name; w.innerHTML = S[name]("bg" + (++uid), d);
    layer.appendChild(w);
    requestAnimationFrame(function () { w.classList.remove("in"); });
    if (old) { old.classList.add("out"); setTimeout(function () { old.remove(); }, 600); }
  }
  // re-draw when the theme changes (the light/dark scenes differ)
  try { new MutationObserver(function () { if (curName && dark() !== curDark) { var n = curName; curName = null; set(n); } }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] }); } catch (e) {}
  HJ.bg = set; HJ.bgScenes = S;
})();
