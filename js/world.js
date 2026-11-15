/* Baby Mo Hijaiyah — "Hijaiyah World": the home screen's illustration (its own art, not the Baby Mo app's).
   A floating island in a dawn sky. Giant toy letters stand on it (tap one: it bounces and says its name),
   hot-air balloons carry letters, a little waterfall runs off the edge, two far islands float behind.
   Day and night versions; slow motion only, none with reduced motion.
   HJ.world.hero(dark) → SVG string (viewBox 400×500). Mo is drawn in it from render 1 (full body is fine). */
(function () {
  var uid = 0;
  function lg(id, a, b, x2, y2) { return '<linearGradient id="' + id + '" x1="0" y1="0" x2="' + (x2 || 0) + '" y2="' + (y2 == null ? 1 : y2) + '"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient>'; }
  function lgN(id, stops) { return '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' + stops.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"/>'; }).join("") + "</linearGradient>"; }
  function rg(id, c, o) { return '<radialGradient id="' + id + '"><stop offset="0" stop-color="' + c + '" stop-opacity="' + o + '"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></radialGradient>'; }

  // the toy letters on the island: glyph, x, baseline, size, [light, dark, edge] colours, wiggle delay
  var TOYS = [
    { c: "ا", x: 62, y: 349, s: 128, col: ["#FF8A8A", "#F0464E", "#B8262E"], d: 0, f: [63, 292, .62] },
    { c: "ب", x: 136, y: 344, s: 104, col: ["#FFE066", "#FFB000", "#C77A00"], d: 2.4, f: [141, 331, .85] },
    { c: "ن", x: 338, y: 324, s: 100, col: ["#C7B2FF", "#8B63F0", "#5B37B8"], d: 4.8, f: [338, 322, 1] }
  ];
  var BALLOONS = [
    { c: "ب", x: 44, y: 138, s: .88, col: ["#FF8FA3", "#F25774"], d: 0 },
    { c: "ت", x: 148, y: 168, s: .58, col: ["#6FE0D2", "#16B3A1"], d: 1.7 }
  ];

  function cloud(x, y, s, fill, cls, delay) {
    return '<g class="' + cls + '" style="animation-delay:' + (delay || 0) + 's"><g transform="translate(' + x + " " + y + ") scale(" + s + ')" fill="' + fill + '">' +
      '<ellipse cx="0" cy="0" rx="34" ry="15"/><circle cx="-14" cy="-8" r="15"/><circle cx="10" cy="-13" r="19"/><circle cx="28" cy="-3" r="12"/></g></g>';
  }
  function star(x, y, r, d) {
    return '<path class="hw-tw" style="animation-delay:' + d + 's" transform="translate(' + x + " " + y + ')" d="M0 -' + r + " L" + r * .3 + " -" + r * .3 + " L" + r + " 0 L" + r * .3 + " " + r * .3 + " L0 " + r + " L-" + r * .3 + " " + r * .3 + " L-" + r + " 0 L-" + r * .3 + " -" + r * .3 + 'Z" fill="#FFF6C8"/>';
  }

  function balloon(b, n, id) {
    var e = id + "b" + b.c.charCodeAt(0);
    return '<g class="hw-bob" style="animation-delay:-' + b.d + 's"><g class="hw-balloon" data-say="' + b.c + '" transform="translate(' + b.x + " " + b.y + ") scale(" + b.s + ')">' +
      '<defs>' + lg(e, b.col[0], b.col[1], 1, 1) + "</defs>" +
      '<path d="M-12 44 L-9 66 M12 44 L9 66" stroke="' + (n ? "#8B7AA8" : "#9A6B4F") + '" stroke-width="1.6"/>' +
      '<path d="M0 -40 C26 -40 38 -20 36 0 C34 20 16 36 6 44 L-6 44 C-16 36 -34 20 -36 0 C-38 -20 -26 -40 0 -40Z" fill="url(#' + e + ')"/>' +
      '<path d="M0 -40 C10 -30 13 20 6 44 M0 -40 C-10 -30 -13 20 -6 44" stroke="#fff" stroke-opacity=".35" stroke-width="2" fill="none"/>' +
      '<ellipse cx="-17" cy="-20" rx="6" ry="11" fill="#fff" opacity=".45" transform="rotate(20 -17 -20)"/>' +
      '<rect x="-10" y="64" width="20" height="14" rx="4" fill="' + (n ? "#8A6A55" : "#C98B50") + '"/><path d="M-10 69 H10" stroke="' + (n ? "#6E5244" : "#A86E3A") + '" stroke-width="2"/>' +
      '<text x="0" y="12" text-anchor="middle" style="font-family:var(--ar)" font-size="40" fill="#fff" stroke="' + b.col[1] + '" stroke-width="1">' + b.c + "</text></g></g>";
  }

  function toy(tc, n, id, i) {
    var e = id + "t" + i, f = 'style="font-family:var(--ar)" font-size="' + tc.s + '" text-anchor="middle"';
    return '<g class="hw-toy" data-say="' + tc.c + '" style="animation-delay:' + tc.d + 's">' +
      '<defs>' + lg(e, tc.col[0], tc.col[1]) + "</defs>" +
      '<ellipse cx="' + tc.x + '" cy="' + (i === 2 ? 352 : tc.y + 4) + '" rx="' + tc.s * .3 + '" ry="7" fill="#000" opacity="' + (n ? .28 : .14) + '"/>' +
      // a chunky toy: a thick dark edge, a 3D side (offset), then the glossy face
      '<text x="' + tc.x + '" y="' + (tc.y + 6) + '" ' + f + ' fill="' + tc.col[2] + '" stroke="' + tc.col[2] + '" stroke-width="11" stroke-linejoin="round">' + tc.c + "</text>" +
      '<text x="' + tc.x + '" y="' + tc.y + '" ' + f + ' fill="url(#' + e + ')" stroke="' + tc.col[1] + '" stroke-width="9" stroke-linejoin="round">' + tc.c + "</text>" +
      '<text x="' + (tc.x - 1.5) + '" y="' + (tc.y - 2) + '" ' + f + ' fill="none" stroke="#fff" stroke-opacity="' + (n ? .18 : .4) + '" stroke-width="2.2" stroke-linejoin="round">' + tc.c + "</text>" +
      face(tc.f[0], tc.f[1], tc.f[2], tc.col[2], i) + "</g>";
  }
  // a happy face on each toy letter (they are the child's letter friends)
  function face(x, y, k, ink, i) {
    var dx = 8 * k, r = 4.4 * k;
    function eye(ex) { return '<g class="hw-blink" style="animation-delay:' + (i * 1.9) + 's"><circle cx="' + ex + '" cy="' + y + '" r="' + r + '" fill="#fff"/><circle cx="' + (ex + .6 * k) + '" cy="' + (y + .5 * k) + '" r="' + (r * .62) + '" fill="#2A1F3D"/><circle cx="' + (ex + 1.6 * k) + '" cy="' + (y - 1 * k) + '" r="' + (r * .25) + '" fill="#fff"/></g>'; }
    return '<g class="hw-face">' + eye(x - dx) + eye(x + dx) +
      '<path d="M' + (x - 4.5 * k) + " " + (y + 7 * k) + " Q" + x + " " + (y + 12 * k) + " " + (x + 4.5 * k) + " " + (y + 7 * k) + '" stroke="' + ink + '" stroke-width="' + (2.2 * k) + '" fill="none" stroke-linecap="round"/>' +
      (k > .8 ? '<circle cx="' + (x - dx - 5 * k) + '" cy="' + (y + 7 * k) + '" r="' + (3 * k) + '" fill="#FF7A8A" opacity=".5"/><circle cx="' + (x + dx + 5 * k) + '" cy="' + (y + 7 * k) + '" r="' + (3 * k) + '" fill="#FF7A8A" opacity=".5"/>' : "") + "</g>";
  }

  function flower(x, y, c, n) {
    return '<g transform="translate(' + x + " " + y + ')"><path d="M0 0 V-9" stroke="' + (n ? "#2F6B58" : "#2E9E55") + '" stroke-width="2"/>' +
      [0, 72, 144, 216, 288].map(function (a) { var r = a * Math.PI / 180; return '<circle cx="' + (Math.sin(r) * 4).toFixed(1) + '" cy="' + (-10 - Math.cos(r) * 4).toFixed(1) + '" r="3.6" fill="' + c + '"/>'; }).join("") +
      '<circle cx="0" cy="-10" r="2.6" fill="#FFE27A"/></g>';
  }

  function hero(n) {
    var id = "hw" + (++uid);
    var P = n ? { sky: [[0, "#0B1238"], [.55, "#26215C"], [1, "#43306E"]], grass: ["#3C8F77", "#24604F"], rock: ["#5E4C80", "#33284F"], strata: "#4A3B68", far: "#2D2B5E", cloud: "#3A3A78", water: ["#7FA8E8", "#7FA8E8"] }
              : { sky: [[0, "#86C8FF"], [.45, "#C9BDFF"], [.78, "#FFD3E6"], [1, "#FFF1DC"]], grass: ["#86E28A", "#3DBB6A"], rock: ["#F1C08F", "#B9784F"], strata: "#DDA06F", far: "#E6D2F7", cloud: "#FFFFFF", water: ["#BFF0FF", "#7FD4EE"] };
    var s = '<svg class="hw-svg" viewBox="0 0 400 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>' +
      lgN(id + "sky", P.sky) + lg(id + "gr", P.grass[0], P.grass[1]) + lg(id + "rk", P.rock[0], P.rock[1]) + lg(id + "wf", P.water[0], P.water[1]) +
      rg(id + "glow", n ? "#C9C2FF" : "#FFF3B0", n ? .45 : .9) + rg(id + "mist", n ? "#8C7BD6" : "#FFFFFF", n ? .25 : .7) + "</defs>" +
      '<rect width="400" height="540" fill="url(#' + id + 'sky)"/>';
    // sun / moon
    if (n) {
      s += '<circle cx="350" cy="140" r="70" fill="url(#' + id + 'glow)"/><circle cx="350" cy="140" r="30" fill="#F4F1FF"/><circle cx="363" cy="131" r="27" fill="#26215C"/>';
      [[40, 40, 3], [120, 30, 2.4], [190, 90, 2], [270, 40, 2.8], [360, 160, 2.2], [24, 190, 2], [150, 200, 1.8], [390, 250, 2.4], [300, 210, 1.6]].forEach(function (p, i) { s += star(p[0], p[1], p[2] * 2, i * .7); });
    } else {
      s += '<circle cx="350" cy="140" r="78" fill="url(#' + id + 'glow)"/><g class="hw-spin" style="transform-origin:350px 140px">' +
        [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(function (a) { return '<rect x="347" y="84" width="6" height="16" rx="3" fill="#FFD95A" opacity=".75" transform="rotate(' + a + ' 350 140)"/>'; }).join("") +
        '</g><circle cx="350" cy="140" r="31" fill="#FFD43B"/><circle cx="350" cy="140" r="25" fill="#FFE57A"/>' +
        '<circle cx="341" cy="136" r="2.6" fill="#B86B00"/><circle cx="359" cy="136" r="2.6" fill="#B86B00"/><path d="M342 146 Q350 153 358 146" stroke="#B86B00" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
        '<circle cx="337" cy="144" r="3.5" fill="#FF9F7A" opacity=".55"/><circle cx="363" cy="144" r="3.5" fill="#FF9F7A" opacity=".55"/>';
    }
    // clouds (slow drift)
    s += cloud(150, 64, .9, P.cloud, "hw-drift", 0) + cloud(372, 196, .75, P.cloud, "hw-drift2", -6) + cloud(28, 246, .65, P.cloud, "hw-drift", -12);
    // far islands
    s += '<g class="hw-bob" style="animation-delay:-2s;animation-duration:7s" opacity="' + (n ? .8 : .9) + '"><path d="M14 236 Q50 226 92 236 Q88 246 70 250 Q56 268 46 252 Q22 248 14 236Z" fill="' + P.far + '"/>' +
      '<path d="M40 234 C40 222 44 212 50 206" stroke="' + (n ? "#3C3A70" : "#C7A8E6") + '" stroke-width="3" fill="none"/><path d="M50 206 q-12 -2 -16 6 M50 206 q12 -4 16 4 M50 206 q-2 -10 6 -12" stroke="' + (n ? "#3C3A70" : "#B9A0DE") + '" stroke-width="4" fill="none" stroke-linecap="round"/></g>' +
      '<g class="hw-bob" style="animation-delay:-4s;animation-duration:8s" opacity="' + (n ? .8 : .9) + '"><path d="M318 278 Q350 270 388 278 Q384 288 368 292 Q358 306 348 292 Q326 290 318 278Z" fill="' + P.far + '"/>' +
      '<path d="M352 276 v-14" stroke="' + (n ? "#3C3A70" : "#C7A8E6") + '" stroke-width="2.4"/><path d="M341 263 Q352 244 363 263Z" fill="' + (n ? "#3C3A70" : "#D9B8F2") + '"/><circle cx="352" cy="246" r="3" fill="' + (n ? "#FFE27A" : "#C7A8E6") + '"/></g>';
    // balloons
    BALLOONS.forEach(function (b) { s += balloon(b, n, id); });
    // the island (it floats a little)
    s += '<g class="hw-isle">' +
      '<ellipse cx="200" cy="372" rx="190" ry="40" fill="url(#' + id + 'mist)"/>' +
      // waterfall
      '<path class="hw-fall" d="M318 368 C322 400 318 460 324 540" stroke="url(#' + id + 'wf)" stroke-width="14" fill="none" stroke-linecap="round" stroke-dasharray="18 10" opacity=".85"/>' +
      // rock underside
      '<path d="M40 362 Q120 378 200 378 Q290 378 362 362 Q350 392 318 404 Q296 418 270 424 Q258 450 236 462 Q214 478 200 470 Q186 460 176 440 Q140 432 112 418 Q70 400 40 362Z" fill="url(#' + id + 'rk)"/>' +
      '<path d="M70 384 Q130 398 200 398 Q270 398 330 384 M120 414 Q180 424 260 418 M180 444 Q206 450 236 444" stroke="' + P.strata + '" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>' +
      '<path d="M96 404 l-4 16 M150 420 l2 14 M286 414 l3 12" stroke="' + (n ? "#2E5B4C" : "#3DBB6A") + '" stroke-width="3" stroke-linecap="round"/>' +
      // gems in the rock
      '<path d="M226 430 l7 -9 l7 9 l-7 9Z" fill="' + (n ? "#9AD8FF" : "#7FD4EE") + '" opacity=".9"/><path d="M146 398 l5 -7 l5 7 l-5 7Z" fill="' + (n ? "#FFB3D1" : "#FF8FB1") + '" opacity=".9"/>' +
      // grass top
      '<path d="M30 360 Q36 336 110 332 Q200 322 290 332 Q364 338 370 360 Q372 372 340 374 Q200 384 60 374 Q28 372 30 360Z" fill="url(#' + id + 'gr)"/>' +
      '<path d="M30 360 Q28 372 60 374 Q200 384 340 374 Q372 372 370 360 Q360 368 330 368 Q200 378 70 368 Q38 368 30 360Z" fill="' + (n ? "#1C4D40" : "#2FA25B") + '"/>' +
      '<path d="M70 338 Q160 326 250 330" stroke="#fff" stroke-opacity="' + (n ? .08 : .35) + '" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      // bushes and flowers
      '<g fill="' + (n ? "#2E7462" : "#4CC97A") + '"><circle cx="34" cy="352" r="12"/><circle cx="48" cy="346" r="14"/><circle cx="372" cy="350" r="12"/><circle cx="360" cy="343" r="10"/></g>' +
      flower(98, 352, "#FF8FB1", n) + flower(186, 356, "#FFFFFF", n) + flower(300, 356, "#7CC8FF", n) + flower(196, 348, "#FFB86B", n) + flower(380, 362, "#FF8FB1", n);
    TOYS.forEach(function (tc, i) { s += toy(tc, n, id, i); });
    // Mo (render 1) stands in the middle
    s += '<g class="hw-mo"><ellipse cx="247" cy="353" rx="40" ry="8" fill="#000" opacity="' + (n ? .3 : .15) + '"/>' +
      '<image class="hw-mo-img" href="' + HJ.world.moSrc + '" x="166" y="200" width="160" height="160"/></g>';
    s += "</g>";
    // sparkles
    if (!n) [[112, 250, 5, 0], [282, 226, 4, 1.2], [180, 196, 3.5, 2.1], [40, 300, 4, .6]].forEach(function (p) { s += star(p[0], p[1], p[2], p[3]); });
    return s + "</svg>";
  }

  HJ.world = { hero: hero, moSrc: "assets/mo/mo-pose-41.webp" };
})();
