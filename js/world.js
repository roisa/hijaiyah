/* Baby Mo Hijaiyah — "Hijaiyah World": the home screen's illustration (its own art, not the Baby Mo app's).
   A floating island in a dawn sky. Giant toy letters stand on it (tap one: it bounces and says its name),
   hot-air balloons carry letters, a little waterfall runs off the edge, two far islands float behind.
   Day and night versions; slow motion only, none with reduced motion.
   HJ.world.hero(dark) → SVG string (viewBox 400×540). Mo is drawn in it from render 1 (full body is fine). */
(function () {
  var uid = 0;
  function lg(id, a, b, x2, y2) { return '<linearGradient id="' + id + '" x1="0" y1="0" x2="' + (x2 || 0) + '" y2="' + (y2 == null ? 1 : y2) + '"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient>'; }
  function lgN(id, stops) { return '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' + stops.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"/>'; }).join("") + "</linearGradient>"; }
  function rg(id, c, o) { return '<radialGradient id="' + id + '"><stop offset="0" stop-color="' + c + '" stop-opacity="' + o + '"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></radialGradient>'; }

  // the toy letters on the island: glyph, x, baseline, size, [light, dark, edge] colours, wiggle delay
  var TOYS = [
    { c: "ا", x: 62, y: 343, s: 128, col: ["#FF8A8A", "#F0464E", "#B8262E"], d: 0, f: [63, 286, .75], w: 17, g: 357 },
    { c: "ب", x: 136, y: 344, s: 104, col: ["#FFE066", "#FFB000", "#C77A00"], d: 2.4, f: [141, 331, .85], g: 358, dot: 1 },
    { c: "ن", x: 338, y: 324, s: 100, col: ["#C7B2FF", "#8B63F0", "#5B37B8"], d: 4.8, f: [338, 322, 1], g: 355 }
  ];
  var BALLOONS = [
    // [main, stripe, band] colours; far balloons are smaller and a little hazy
    { c: "ب", x: 44, y: 168, s: .86, col: ["#FF6B81", "#FFD1D9", "#FFB000", "#C9264D"], d: 0, far: 0 },
    { c: "ت", x: 152, y: 182, s: .5, col: ["#2EC4B6", "#D4F7F2", "#FF8FA3", "#0B7F75"], d: 2.2, far: 1 },
    { c: "ث", x: 108, y: 236, s: .32, col: ["#FFB000", "#FFF0C2", "#8B63F0", "#A65F00"], d: 4.1, far: 2 }
  ];

  function cloud(x, y, s, fill, cls, delay) {
    return '<g class="' + cls + '" style="animation-delay:' + (delay || 0) + 's"><g transform="translate(' + x + " " + y + ") scale(" + s + ')" fill="' + fill + '">' +
      '<ellipse cx="0" cy="0" rx="36" ry="14"/><circle cx="-16" cy="-7" r="14"/><circle cx="2" cy="-14" r="18"/><circle cx="20" cy="-8" r="14"/><circle cx="32" cy="-1" r="10"/>' +
      '<ellipse cx="0" cy="6" rx="34" ry="7" fill="#000" opacity=".06"/><circle cx="-4" cy="-20" r="6" fill="#fff" opacity=".35"/></g></g>';
  }
  function star(x, y, r, d) {
    return '<path class="hw-tw" style="animation-delay:' + d + 's" transform="translate(' + x + " " + y + ')" d="M0 -' + r + " L" + r * .3 + " -" + r * .3 + " L" + r + " 0 L" + r * .3 + " " + r * .3 + " L0 " + r + " L-" + r * .3 + " " + r * .3 + " L-" + r + " 0 L-" + r * .3 + " -" + r * .3 + 'Z" fill="#FFF6C8"/>';
  }

  // a real hot-air balloon: striped gores, shading, a band, a skirt, ropes and a woven basket.
  // It sways from the top (like it hangs in the wind) and drifts a little; far ones are smaller and hazier.
  function balloon(b, n, id) {
    var e = id + "b" + b.c.charCodeAt(0), C = b.col, rope = n ? "#9C8BB8" : "#8A6346";
    var env = "M0 -48 C29 -48 46 -28 45 -6 C44 14 28 30 14 44 L-14 44 C-28 30 -44 14 -45 -6 C-46 -28 -29 -48 0 -48Z";
    var out = '<g class="hw-drift3" style="animation-delay:-' + b.d * 3 + 's"><g class="hw-sway" style="animation-delay:-' + b.d + 's">' +
      '<g class="hw-balloon" data-say="' + b.c + '" opacity="' + (b.far === 2 ? .8 : b.far ? .92 : 1) + '"><g transform="translate(' + b.x + " " + b.y + ") scale(" + b.s + ')">' +
      "<defs>" + '<clipPath id="' + e + 'c"><path d="' + env + '"/></clipPath>' +
      '<radialGradient id="' + e + 'h" cx=".32" cy=".26" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></radialGradient>' +
      lg(e + "k", n ? "#9A7A60" : "#D9A066", n ? "#6B5040" : "#9C6232") + "</defs>" +
      // ropes, basket (woven), a warm glow from the burner
      '<path d="M-12 44 L-9 70 M-4 46 L-3 70 M4 46 L3 70 M12 44 L9 70" stroke="' + rope + '" stroke-width="1.3"/>' +
      '<circle cx="0" cy="58" r="7" fill="#FFB347" opacity="' + (n ? .55 : .25) + '"/>' +
      '<path d="M-11 70 H11 L9 86 Q0 89 -9 86Z" fill="url(#' + e + 'k)"/>' +
      '<path d="M-10 75 H10 M-9.5 80 H9.5 M-5 70 L-4.5 87 M0 70 V88 M5 70 L4.5 87" stroke="' + (n ? "#5A4232" : "#8A5428") + '" stroke-width="1" opacity=".7"/>' +
      '<rect x="-12.5" y="67.5" width="25" height="4" rx="2" fill="' + (n ? "#7A5C46" : "#B8773E") + '"/>' +
      // envelope with gores
      '<g clip-path="url(#' + e + 'c)"><rect x="-50" y="-50" width="100" height="100" fill="' + C[0] + '"/>' +
      '<ellipse cx="0" cy="-2" rx="32" ry="56" fill="' + C[1] + '"/><ellipse cx="0" cy="-2" rx="17" ry="58" fill="' + C[0] + '"/><ellipse cx="0" cy="-2" rx="5" ry="60" fill="' + C[1] + '"/>' +
      // a band round the middle and a scalloped hem
      '<path d="M-50 14 Q0 26 50 14 V22 Q0 34 -50 22Z" fill="' + C[2] + '"/>' +
      '<path d="M-50 22 Q0 34 50 22 V26 Q0 38 -50 26Z" fill="#fff" opacity=".5"/>' +
      // the letter is painted on the fabric: it follows the round shape a little and gets the same light and shade
      '<g transform="translate(0 -8) scale(.86 1)"><text x="0" y="10" text-anchor="middle" style="font-family:var(--ar)" font-size="50" fill="#fff" stroke="' + C[3] + '" stroke-width="3" stroke-linejoin="round" paint-order="stroke" stroke-opacity=".85">' + b.c + "</text></g>" +
      '<rect x="-50" y="-50" width="100" height="100" fill="url(#' + e + 'h)"/></g>' +
      '<path d="' + env + '" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="1.2"/>' +
      // skirt
      '<path d="M-14 44 L14 44 L10 52 L-10 52Z" fill="' + C[2] + '"/><path d="M-10 52 L10 52" stroke="#000" stroke-opacity=".2" stroke-width="1.4"/>' +
      "</g></g></g></g>";
    return out;
  }

  function toy(tc, n, id, i) {
    var e = id + "t" + i, f = 'style="font-family:var(--ar)" font-size="' + tc.s + '" text-anchor="middle"', w = tc.w || 11;
    function glyph() {
      return '<text x="' + tc.x + '" y="' + (tc.y + 6) + '" ' + f + ' fill="' + tc.col[2] + '" stroke="' + tc.col[2] + '" stroke-width="' + w + '" stroke-linejoin="round">' + tc.c + "</text>" +
        '<text x="' + tc.x + '" y="' + tc.y + '" ' + f + ' fill="url(#' + e + ')" stroke="' + tc.col[1] + '" stroke-width="' + (w - 2) + '" stroke-linejoin="round">' + tc.c + "</text>" +
        '<text x="' + (tc.x - 1.5) + '" y="' + (tc.y - 2) + '" ' + f + ' fill="none" stroke="#fff" stroke-opacity="' + (n ? .18 : .4) + '" stroke-width="2.2" stroke-linejoin="round">' + tc.c + "</text>";
    }
    function shadow(x, y, rx) {   // a soft shadow and a darker contact line: the toy rests on the grass
      return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + (rx * .17 + 3) + '" fill="#000" opacity="' + (n ? .26 : .13) + '"/>' +
        '<ellipse cx="' + x + '" cy="' + (y - 1) + '" rx="' + rx * .62 + '" ry="2.6" fill="#000" opacity="' + (n ? .3 : .18) + '"/>';
    }
    var out = '<g class="hw-toy" data-say="' + tc.c + '" style="animation-delay:' + tc.d + 's"><defs>' + lg(e, tc.col[0], tc.col[1]) + "</defs>";
    if (tc.dot) {
      // ba: the body (dotless ٮ) stands on the grass, and its dot is a little block resting on the grass in front of it
      var body = { c: "ٮ" }, dx = tc.x - 4, dy = tc.g + 2, h = 8.5;
      var keep = tc.c; tc.c = body.c; var g0 = glyph(); tc.c = keep;
      out += shadow(tc.x, tc.g, tc.s * .42) + g0 + shadow(dx, dy + h - 1, 11) +
        '<path d="M' + dx + " " + (dy - h + 5) + " L" + (dx + h) + " " + (dy + 5) + " L" + dx + " " + (dy + h + 5) + " L" + (dx - h) + " " + (dy + 5) + 'Z" fill="' + tc.col[2] + '" stroke="' + tc.col[2] + '" stroke-width="5" stroke-linejoin="round"/>' +
        '<path d="M' + dx + " " + (dy - h) + " L" + (dx + h) + " " + dy + " L" + dx + " " + (dy + h) + " L" + (dx - h) + " " + dy + 'Z" fill="url(#' + e + ')" stroke="' + tc.col[1] + '" stroke-width="4" stroke-linejoin="round"/>' +
        '<path d="M' + (dx - h + 3) + " " + (dy - 1) + " L" + dx + " " + (dy - h + 2) + '" stroke="#fff" stroke-opacity=".55" stroke-width="2" stroke-linecap="round"/>';
    } else out += shadow(tc.x, tc.g, tc.s * (tc.c === "ا" ? .14 : .3)) + glyph();
    return out + face(tc.f[0], tc.f[1], tc.f[2], tc.col[2], i) + "</g>";
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
    // sun / moon (top right, beside the title)
    var X = 354, Y = 104;
    if (n) {
      s += '<circle cx="' + X + '" cy="' + Y + '" r="70" fill="url(#' + id + 'glow)"/><circle cx="' + X + '" cy="' + Y + '" r="30" fill="#F4F1FF"/><circle cx="' + (X + 13) + '" cy="' + (Y - 9) + '" r="27" fill="#26215C"/>' +
        '<circle cx="' + (X - 16) + '" cy="' + (Y + 6) + '" r="3" fill="#D9D3F5"/><circle cx="' + (X - 8) + '" cy="' + (Y + 18) + '" r="2" fill="#D9D3F5"/>';
      [[40, 40, 3], [120, 30, 2.4], [190, 140, 2], [270, 40, 2.8], [380, 190, 2.2], [24, 120, 2], [110, 220, 1.8], [390, 250, 2.4], [250, 160, 1.6], [70, 300, 1.6]].forEach(function (p, i) { s += star(p[0], p[1], p[2] * 2, i * .7); });
    } else {
      s += '<circle cx="' + X + '" cy="' + Y + '" r="80" fill="url(#' + id + 'glow)"/><g class="hw-spin" style="transform-origin:' + X + "px " + Y + 'px">' +
        [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(function (a, i) { var L = i % 2 ? 12 : 19; return '<path d="M' + (X - 5) + " " + (Y - 38) + " L" + X + " " + (Y - 38 - L) + " L" + (X + 5) + " " + (Y - 38) + 'Z" fill="#FFCF3F" opacity=".8" stroke="#FFCF3F" stroke-width="2" stroke-linejoin="round" transform="rotate(' + a + " " + X + " " + Y + ')"/>'; }).join("") +
        '</g><circle cx="' + X + '" cy="' + Y + '" r="32" fill="#FFC21A"/><circle cx="' + X + '" cy="' + (Y - 1.5) + '" r="28.5" fill="#FFDD55"/><ellipse cx="' + (X - 11) + '" cy="' + (Y - 14) + '" rx="9" ry="5" fill="#fff" opacity=".5" transform="rotate(-30 ' + (X - 11) + " " + (Y - 14) + ')"/>' +
        '<ellipse cx="' + (X - 9) + '" cy="' + (Y - 2) + '" rx="2.6" ry="3.4" fill="#8A4B00"/><ellipse cx="' + (X + 9) + '" cy="' + (Y - 2) + '" rx="2.6" ry="3.4" fill="#8A4B00"/>' +
        '<path d="M' + (X - 8) + " " + (Y + 7) + " Q" + X + " " + (Y + 15) + " " + (X + 8) + " " + (Y + 7) + '" stroke="#8A4B00" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
        '<circle cx="' + (X - 15) + '" cy="' + (Y + 6) + '" r="4" fill="#FF8F6B" opacity=".5"/><circle cx="' + (X + 15) + '" cy="' + (Y + 6) + '" r="4" fill="#FF8F6B" opacity=".5"/>';
    }
    // clouds (slow drift)
    s += cloud(70, 58, .8, P.cloud, "hw-drift", 0) + cloud(372, 196, .75, P.cloud, "hw-drift2", -6) + cloud(222, 214, .55, P.cloud, "hw-drift", -12);
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
      '<path d="M318 368 C322 400 318 460 324 540" stroke="url(#' + id + 'wf)" stroke-width="15" fill="none" opacity=".55"/>' +
      '<path class="hw-fall" d="M318 368 C322 400 318 460 324 540" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="14 18" opacity="' + (n ? .35 : .8) + '"/>' +
      '<path class="hw-fall" style="animation-duration:1.7s" d="M313 370 C316 410 313 460 317 540" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-dasharray="8 22" opacity="' + (n ? .3 : .7) + '"/>' +
      // little rocks floating under the island
      '<g class="hw-bob" style="animation-duration:5s"><path d="M46 438 Q62 430 78 438 Q72 452 62 456 Q50 450 46 438Z" fill="url(#' + id + 'rk)"/><path d="M46 438 Q62 430 78 438 Q62 442 46 438Z" fill="url(#' + id + 'gr)"/></g>' +
      '<g class="hw-bob" style="animation-duration:6s;animation-delay:-2s"><path d="M346 452 Q358 446 370 452 Q366 462 358 465 Q350 461 346 452Z" fill="url(#' + id + 'rk)"/><path d="M346 452 Q358 446 370 452 Q358 455 346 452Z" fill="url(#' + id + 'gr)"/></g>' +
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
      // vines hanging off the edge
      '<g stroke="' + (n ? "#2E6B58" : "#3DBB6A") + '" stroke-width="2.4" fill="none" stroke-linecap="round"><path d="M74 372 q-3 14 2 26"/><path d="M128 377 q3 10 -1 20"/><path d="M276 377 q-3 12 2 22"/></g>' +
      '<g fill="' + (n ? "#3C8F77" : "#5DD38A") + '"><ellipse cx="74" cy="388" rx="3" ry="5" transform="rotate(30 74 388)"/><ellipse cx="128" cy="390" rx="3" ry="5" transform="rotate(-30 128 390)"/><ellipse cx="277" cy="392" rx="3" ry="5" transform="rotate(30 277 392)"/></g>' +
      // a round tree on the left (behind alif)
      '<path d="M30 352 Q31 322 34 300" stroke="' + (n ? "#5A4560" : "#B07A4A") + '" stroke-width="6" fill="none" stroke-linecap="round"/>' +
      '<g fill="' + (n ? "#2F7A64" : "#4CC97A") + '"><circle cx="34" cy="290" r="20"/><circle cx="20" cy="300" r="13"/><circle cx="48" cy="300" r="13"/></g>' +
      '<circle cx="27" cy="282" r="7" fill="#fff" opacity="' + (n ? .06 : .25) + '"/>' + (n ? "" : '<circle cx="42" cy="288" r="3" fill="#FF6B81"/><circle cx="26" cy="300" r="3" fill="#FF6B81"/><circle cx="40" cy="304" r="3" fill="#FF6B81"/>') +
      // grass tufts along the front edge
      '<g stroke="' + (n ? "#1C4D40" : "#2FA25B") + '" stroke-width="2" stroke-linecap="round">' + [60, 92, 160, 214, 250, 286, 320, 350].map(function (x, i) { var y = 372 - (i % 3); return '<path d="M' + x + " " + y + " l-3 -7 M" + x + " " + y + " l0 -9 M" + x + " " + y + ' l3 -7"/>'; }).join("") + "</g>" +
      // a mushroom beside Mo
      '<g transform="translate(300 357)"><rect x="-3" y="-10" width="6" height="11" rx="3" fill="#FFF3E0"/><path d="M-11 -9 Q0 -24 11 -9Z" fill="#FF6B6B"/><circle cx="-4" cy="-14" r="2" fill="#fff"/><circle cx="4" cy="-12" r="1.6" fill="#fff"/></g>' +
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
