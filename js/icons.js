/* Baby Mo Hijaiyah — icons.
   HJ.ic(name)  : chunky, rounded, filled control icons (like iOS ".fill" symbols, made thicker for small hands).
                  They use currentColor, so they take the colour of the button they sit on.
   HJ.art(name) : small colourful illustrations in the Baby Mo icon style (gradient body, darker rim, white
                  gloss) that replace every emoji in the interface: star, flame, heart, trophy, gift, balloon,
                  train, cap, repeat, moon, sun, sparkle, globe, hand, link, wave, book…
   No emoji are used for anything a child taps or collects. */
(function () {
  /* ---------- control icons (24×24, currentColor) ---------- */
  var F = 'fill="currentColor"', R = 'stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" fill="none"';
  var IC = {
    play: '<path ' + F + ' stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" d="M8 5.2v13.6a1 1 0 0 0 1.5.86l11-6.8a1 1 0 0 0 0-1.72l-11-6.8A1 1 0 0 0 8 5.2z"/>',
    next: '<path ' + R + ' stroke-width="3.2" d="M4.5 12h14M13 5.5l6.5 6.5-6.5 6.5"/>',
    back: '<path ' + R + ' stroke-width="3.4" d="M15 4.5 7.5 12l7.5 7.5"/>',
    chevR: '<path ' + R + ' stroke-width="3" d="M9 5l7 7-7 7"/>',
    close: '<path ' + R + ' stroke-width="3.4" d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    check: '<path ' + R + ' stroke-width="3.6" d="M4.8 12.8l4.6 4.6 9.8-10.4"/>',
    speaker: '<path ' + F + ' stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" d="M3.5 9.6a1.6 1.6 0 0 1 1.6-1.6h2.6l4.8-4a.9.9 0 0 1 1.5.7v14.6a.9.9 0 0 1-1.5.7l-4.8-4H5.1a1.6 1.6 0 0 1-1.6-1.6z"/><path ' + R + ' stroke-width="2.8" d="M16.6 9.2a4 4 0 0 1 0 5.6M19.4 6.4a8 8 0 0 1 0 11.2"/>',
    mic: '<rect x="8" y="2.5" width="8" height="12.5" rx="4" ' + F + '/><path ' + R + ' stroke-width="2.8" d="M5 11.5a7 7 0 0 0 14 0M12 18.5v3"/>',
    stop: '<rect x="5.5" y="5.5" width="13" height="13" rx="3.5" ' + F + '/>',
    replay: '<path ' + R + ' stroke-width="3" d="M19.6 13A7.8 7.8 0 1 1 16.8 6.2"/><path ' + F + ' d="M20.6 3.4v6.2a.8.8 0 0 1-.8.8h-6.2a.8.8 0 0 1-.56-1.36l6.2-6.2a.8.8 0 0 1 1.36.56z"/>',
    skip: '<path ' + F + ' stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" d="M3 6.4v11.2a.8.8 0 0 0 1.25.66L12 12.66V17.6a.8.8 0 0 0 1.25.66l8.4-5.6a.8.8 0 0 0 0-1.32l-8.4-5.6A.8.8 0 0 0 12 6.4v4.94L4.25 5.74A.8.8 0 0 0 3 6.4z"/>',
    bubble: '<path ' + F + ' d="M12 3.5c-5 0-9 3.3-9 7.6 0 2.4 1.3 4.5 3.3 5.9l-.8 3.3a.6.6 0 0 0 .9.66l3.7-2.2c.6.1 1.2.15 1.9.15 5 0 9-3.4 9-7.8s-4-7.6-9-7.6z"/><circle cx="8" cy="11.2" r="1.4" fill="#fff" fill-opacity=".9"/><circle cx="12" cy="11.2" r="1.4" fill="#fff" fill-opacity=".9"/><circle cx="16" cy="11.2" r="1.4" fill="#fff" fill-opacity=".9"/>',
    tag: '<path ' + F + ' d="M3.5 5.2v5.6a2 2 0 0 0 .6 1.4l8.2 8.2a2 2 0 0 0 2.8 0l5.6-5.6a2 2 0 0 0 0-2.8L12.5 3.8a2 2 0 0 0-1.4-.6H5.5a2 2 0 0 0-2 2z"/><circle cx="8" cy="7.8" r="1.7" fill="#fff" fill-opacity=".9"/>',
    bulb: '<path ' + F + ' d="M12 2.5a7 7 0 0 0-4.2 12.6c.6.5 1 1.2 1 2V18h6.4v-.9c0-.8.4-1.5 1-2A7 7 0 0 0 12 2.5z"/><rect x="8.8" y="19.2" width="6.4" height="2.6" rx="1.3" ' + F + '/>',
    gear: '<path ' + F + ' fill-rule="evenodd" d="M10.3 2.4h3.4l.6 2.6c.6.2 1.2.5 1.7.9l2.5-.9 1.7 2.9-2 1.8c.1.6.1 1.2 0 1.8l2 1.8-1.7 2.9-2.5-.9c-.5.4-1.1.7-1.7.9l-.6 2.6h-3.4l-.6-2.6a6.8 6.8 0 0 1-1.7-.9l-2.5.9-1.7-2.9 2-1.8a6 6 0 0 1 0-1.8l-2-1.8 1.7-2.9 2.5.9c.5-.4 1.1-.7 1.7-.9zM12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8z" transform="translate(0 .2)"/>',
    gamepad: '<path ' + F + ' fill-rule="evenodd" d="M7 6.5h10a5 5 0 0 1 4.9 5.9l-.9 4.7a2.6 2.6 0 0 1-4.5 1.3L14.6 16H9.4l-1.9 2.4A2.6 2.6 0 0 1 3 17.1l-.9-4.7A5 5 0 0 1 7 6.5zM7.3 9.4a.9.9 0 0 0-.9.9v1.1H5.3a.9.9 0 0 0 0 1.8h1.1v1.1a.9.9 0 0 0 1.8 0v-1.1h1.1a.9.9 0 0 0 0-1.8H8.2v-1.1a.9.9 0 0 0-.9-.9zm8.6.4a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zm2.2 2.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z"/>',
    map: '<path ' + F + ' fill-rule="evenodd" d="M2.5 6.7c0-.5.3-.9.7-1.1l5-2.3a1.6 1.6 0 0 1 1.3 0L15 5.6l5.2-2.3a.9.9 0 0 1 1.3.8v13.2c0 .5-.3.9-.7 1.1l-5 2.3a1.6 1.6 0 0 1-1.3 0L9 18.4l-5.2 2.3a.9.9 0 0 1-1.3-.8zM9.2 5v11.6l5.6 2.4V7.4z"/>',
    sticker: '<path ' + F + ' stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" d="M12 2.8l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.6l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z"/>',
    user: '<circle cx="12" cy="7.6" r="4.6" ' + F + '/><path ' + F + ' d="M3.5 20.2a8.5 8.5 0 0 1 17 0 1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z"/>',
    family: '<circle cx="8.2" cy="7" r="3.6" ' + F + '/><circle cx="17" cy="8.8" r="2.8" ' + F + '/><path ' + F + ' d="M1.8 19.6a6.4 6.4 0 0 1 12.8 0 .9.9 0 0 1-.9.9h-11a.9.9 0 0 1-.9-.9zM14.2 15.2a4.6 4.6 0 0 1 8 3.9.9.9 0 0 1-.9.8h-5.6c0-1.8-.6-3.4-1.5-4.7z"/>',
    lock: '<path ' + R + ' stroke-width="3" d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/><rect x="4.5" y="10" width="15" height="11.5" rx="3.5" ' + F + '/>',
    heart: '<path ' + F + ' d="M12 21s-9-5.2-9-11.6A5 5 0 0 1 12 6.6a5 5 0 0 1 9 2.8C21 15.8 12 21 12 21z"/>',
    trash: '<path ' + F + ' d="M9 3.5h6a1 1 0 0 1 1 1V6h4a1 1 0 0 1 0 2h-.9l-.9 11.6a2 2 0 0 1-2 1.9H7.8a2 2 0 0 1-2-1.9L4.9 8H4a1 1 0 0 1 0-2h4V4.5a1 1 0 0 1 1-1z"/>',
    book: '<path ' + F + ' d="M4 5a2.5 2.5 0 0 1 2.5-2.5H19a1 1 0 0 1 1 1V17a1 1 0 0 1-1 1H6.5a1 1 0 0 0 0 2H19a1 1 0 0 1 0 2H6.5A2.5 2.5 0 0 1 4 19.5z"/>',
    globe: '<circle cx="12" cy="12" r="9.5" ' + F + '/><path stroke="#fff" stroke-opacity=".85" stroke-width="1.8" fill="none" d="M2.8 12h18.4M12 2.6c2.6 2.6 3.8 5.8 3.8 9.4s-1.2 6.8-3.8 9.4M12 2.6C9.4 5.2 8.2 8.4 8.2 12s1.2 6.8 3.8 9.4"/>',
    textA: '<path ' + R + ' stroke-width="3" d="M4 19.5 10 4.5h1l6 15M6.4 14h8.2"/><path ' + R + ' stroke-width="2.6" d="M19 12v7.5"/>'
  };
  HJ.ic = function (n, cls) { return '<svg class="ic ' + (cls || "") + '" viewBox="0 0 24 24" aria-hidden="true">' + (IC[n] || "") + "</svg>"; };

  /* ---------- colourful illustrations (48×48) ---------- */
  var uid = 0;
  function lg(id, a, b, x2, y2) { return '<linearGradient id="' + id + '" x1="0" y1="0" x2="' + (x2 == null ? 0 : x2) + '" y2="' + (y2 == null ? 1 : y2) + '"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient>'; }
  function gloss(cx, cy, rx, ry, o) { return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#fff" opacity="' + (o || .45) + '"/>'; }
  function starPath(cx, cy, R, r) {
    var p = []; for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R; p.push((cx + rr * Math.cos(a)).toFixed(1) + " " + (cy + rr * Math.sin(a)).toFixed(1)); }
    return "M" + p.join("L") + "z";
  }
  var ART = {
    star: function (u) { return "<defs>" + lg(u, "#FFE27A", "#FFAA00") + "</defs>" +
      '<path d="' + starPath(24, 26, 21, 10) + '" fill="url(#' + u + ')" stroke="#F08C00" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="' + starPath(24, 26, 13, 6.4) + '" fill="#FFF3B0" opacity=".55"/>' + gloss(17, 18, 4.5, 3, .7); },
    starOff: function (u) { return '<path d="' + starPath(24, 26, 21, 10) + '" fill="#D5DBE5" stroke="#B8C1CF" stroke-width="3" stroke-linejoin="round"/>' + gloss(17, 18, 4.5, 3, .5); },
    flame: function (u) { return "<defs>" + lg(u, "#FFC64D", "#FF4E2B") + lg(u + "b", "#FFF6B0", "#FFC23D") + "</defs>" +
      '<path d="M24 3.5c3.5 7.8 13 12 13 25a13 13 0 0 1-26 0c0-6.4 3.2-10.6 6.6-13.6.3 4.2 2.3 6.6 4.6 6.9C21.9 15.4 21 9.6 24 3.5z" fill="url(#' + u + ')"/>' +
      '<path d="M24.4 23c3.4 3.3 6.6 5.8 6.6 10.4a7 7 0 0 1-14 0c0-3.2 1.8-5.4 3.8-6.9.4 2 1.4 3 2.6 3.1-.5-2.4-.4-4.4 1-6.6z" fill="url(#' + u + 'b)"/>' + gloss(19, 22, 2.6, 4.2, .4); },
    heart: function (u) { return "<defs>" + lg(u, "#FF8FA3", "#FF2D55") + "</defs>" +
      '<path d="M24 43S5 32 5 18.6A10 10 0 0 1 24 13a10 10 0 0 1 19 5.6C43 32 24 43 24 43z" fill="url(#' + u + ')" stroke="#E0193F" stroke-width="2"/>' + gloss(14.5, 18.5, 4.2, 3, .65); },
    heartOff: function () { return '<path d="M24 43S5 32 5 18.6A10 10 0 0 1 24 13a10 10 0 0 1 19 5.6C43 32 24 43 24 43z" fill="#D5DBE5" stroke="#B8C1CF" stroke-width="2"/>'; },
    trophy: function (u) { return "<defs>" + lg(u, "#FFE27A", "#F0A000") + lg(u + "b", "#9A6BFF", "#6A3FD8") + "</defs>" +
      '<path d="M13 9h-5a2 2 0 0 0-2 2.2c.5 6 3.6 9.8 8.8 10.6M35 9h5a2 2 0 0 1 2 2.2c-.5 6-3.6 9.8-8.8 10.6" fill="none" stroke="#E79A00" stroke-width="3.4" stroke-linecap="round"/>' +
      '<path d="M12 6h24v9c0 7.2-5.2 13-12 13s-12-5.8-12-13z" fill="url(#' + u + ')"/>' +
      '<rect x="20.5" y="27" width="7" height="7" fill="#E79A00"/><rect x="13" y="33" width="22" height="9" rx="3" fill="url(#' + u + 'b)"/>' +
      '<path d="' + starPath(24, 15.6, 5.4, 2.6) + '" fill="#fff" opacity=".9"/>' + gloss(17, 10, 3, 2.2, .7); },
    gift: function (u) { return "<defs>" + lg(u, "#FF8A80", "#E5394B") + lg(u + "b", "#FF6F7F", "#D02A3D") + "</defs>" +
      '<rect x="7" y="20" width="34" height="23" rx="4" fill="url(#' + u + ')"/><rect x="5" y="14" width="38" height="9" rx="3" fill="url(#' + u + 'b)"/>' +
      '<rect x="21" y="14" width="6" height="29" fill="#FFD54A"/><path d="M24 14c-4-6-11-7-11-2.5S19 15 24 14zm0 0c4-6 11-7 11-2.5S29 15 24 14z" fill="#FFD54A" stroke="#F0A000" stroke-width="1.6"/>' + gloss(12, 17, 4, 1.6, .5); },
    balloon: function (u) { return "<defs>" + lg(u, "#FF8A9A", "#FF3B5C", 1, 1) + "</defs>" +
      '<path d="M24 34c3 3-2 5 1 9" fill="none" stroke="#8A97A6" stroke-width="1.6" stroke-linecap="round"/>' +
      '<ellipse cx="24" cy="18" rx="13" ry="15" fill="url(#' + u + ')"/><path d="M21.6 32.4h4.8l-1.2 2.6h-2.4z" fill="#E0193F"/>' + gloss(19, 11.5, 3.4, 5, .55); },
    cap: function (u) { return "<defs>" + lg(u, "#4A5A9A", "#1E2654") + "</defs>" +
      '<path d="M12 21v9c0 3.3 5.4 6 12 6s12-2.7 12-6v-9" fill="#2A3470"/><path d="M3 18.5 24 9l21 9.5L24 28z" fill="url(#' + u + ')" stroke="#141B40" stroke-width="1.4" stroke-linejoin="round"/>' +
      '<path d="M24 18.5l13 3.6v10" fill="none" stroke="#FFC93D" stroke-width="2.2" stroke-linecap="round"/><circle cx="37" cy="34" r="3" fill="#FFC93D"/>' + gloss(18, 14.5, 5, 1.6, .35); },
    repeat: function (u) { return "<defs>" + lg(u, "#5BE38A", "#12A15A") + "</defs><circle cx=\"24\" cy=\"24\" r=\"21\" fill=\"url(#" + u + ")\"/>" +
      '<path d="M14.5 21.5a10 10 0 0 1 17.6-5.2M33.5 26.5a10 10 0 0 1-17.6 5.2" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M34.6 10.6v8.2h-8.2zM13.4 37.4v-8.2h8.2z" fill="#fff" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/>' + gloss(17, 12, 7, 3.4, .35); },
    moon: function (u) { return "<defs>" + lg(u, "#FFF0A0", "#FFC23D") + "</defs>" +
      '<path d="M30 5.5A19 19 0 1 0 42.5 32 15 15 0 0 1 30 5.5z" fill="url(#' + u + ')" stroke="#F0A000" stroke-width="2"/>' + gloss(14, 18, 3, 5, .5) +
      '<path d="' + starPath(37, 12, 4, 1.8) + '" fill="#FFD54A"/>'; },
    sun: function (u) { var r = ""; for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4; r += '<path d="M' + (24 + 15 * Math.cos(a)).toFixed(1) + " " + (24 + 15 * Math.sin(a)).toFixed(1) + "L" + (24 + 21 * Math.cos(a)).toFixed(1) + " " + (24 + 21 * Math.sin(a)).toFixed(1) + '" stroke="#FFAA00" stroke-width="4" stroke-linecap="round"/>'; }
      return "<defs>" + lg(u, "#FFE27A", "#FF9500") + "</defs>" + r + '<circle cx="24" cy="24" r="11.5" fill="url(#' + u + ')"/>' + gloss(20.5, 19.5, 3.4, 2.4, .65); },
    sparkle: function (u) { return "<defs>" + lg(u, "#C9A7FF", "#7C3AED") + "</defs>" +
      '<path d="M22 4c1.6 9 4 11.4 14 13-10 1.6-12.4 4-14 13-1.6-9-4-11.4-14-13 10-1.6 12.4-4 14-13z" fill="url(#' + u + ')"/>' +
      '<path d="M37 28c.8 4.4 2 5.6 6.4 6.4-4.4.8-5.6 2-6.4 6.4-.8-4.4-2-5.6-6.4-6.4 4.4-.8 5.6-2 6.4-6.4z" fill="#FFC93D"/>' + gloss(19, 13, 1.6, 3, .55); },
    globe: function (u) { return "<defs>" + lg(u, "#7CC8FF", "#2B7BE4") + "</defs><circle cx=\"24\" cy=\"24\" r=\"20\" fill=\"url(#" + u + ")\"/>" +
      '<path d="M13 12c4 1 5 4 3 6s-1 5 2 6-1 6-4 6-6-4-7-8c1-4 3-8 6-10zM30 9c3 1 7 4 9 8-2 1-5 0-6 3s3 4 2 8-5 6-8 5c0-3 2-5 0-7s-4-2-4-5 3-3 4-5-1-4 3-7z" fill="#5BD08A"/>' + gloss(16, 12, 6, 3, .4); },
    hand: function (u) { return "<defs>" + lg(u, "#FFC58A", "#F2994A") + "</defs>" +
      '<path d="M16 25V11.5a3 3 0 0 1 6 0V22V8.5a3 3 0 0 1 6 0V22v-11a3 3 0 0 1 6 0v18c0 8-5 14-12 14h-1.5c-4 0-7.6-2.2-9.6-5.6L6.4 30a3 3 0 0 1 5-3.2L16 31z" fill="url(#' + u + ')" stroke="#D9772A" stroke-width="2" stroke-linejoin="round"/>' + gloss(18.5, 11, 1.4, 3, .55); },
    link: function (u) { return "<defs>" + lg(u, "#7CC8FF", "#2B7BE4") + "</defs>" +
      '<rect x="4" y="16" width="24" height="16" rx="8" fill="none" stroke="url(#' + u + ')" stroke-width="6"/><rect x="20" y="16" width="24" height="16" rx="8" fill="none" stroke="#5BD08A" stroke-width="6"/>'; },
    wave: function (u) { return "<defs>" + lg(u, "#5EEAD4", "#0D9488", 1, 0) + "</defs>" +
      '<path d="M5 26c4-7 8-7 12 0s8 7 12 0 8-7 12 0" fill="none" stroke="url(#' + u + ')" stroke-width="6" stroke-linecap="round"/>'; },
    book: function (u) { return "<defs>" + lg(u, "#34D399", "#047857") + "</defs>" +
      '<rect x="9" y="5" width="30" height="38" rx="5" fill="url(#' + u + ')"/><rect x="9" y="36" width="30" height="7" rx="3" fill="#FFF8E7"/>' +
      '<rect x="14" y="10" width="20" height="21" rx="4" fill="none" stroke="#FFD54A" stroke-width="2.4"/><path d="' + starPath(24, 20.5, 5.4, 2.4) + '" fill="#FFD54A"/>' + gloss(15, 9, 4, 2, .4); },
    check: function (u) { return "<defs>" + lg(u, "#5BE38A", "#12A15A") + "</defs><circle cx=\"24\" cy=\"24\" r=\"20\" fill=\"url(#" + u + ")\"/>" +
      '<path d="M14 24.5l7 7 13-14" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' + gloss(17, 12, 6, 3, .35); },
    lock: function (u) { return '<path d="M15 21v-5a9 9 0 0 1 18 0v5" fill="none" stroke="#9AA5B4" stroke-width="5" stroke-linecap="round"/>' +
      "<defs>" + lg(u, "#C8D0DC", "#8A97A6") + '</defs><rect x="9" y="20" width="30" height="23" rx="7" fill="url(#' + u + ')"/><circle cx="24" cy="30" r="3.4" fill="#fff"/><rect x="22.6" y="31" width="2.8" height="6" rx="1.4" fill="#fff"/>' + gloss(16, 24, 4, 1.8, .45); },
    medal: function (u) { return "<defs>" + lg(u, "#FFE27A", "#F0A000") + "</defs>" +
      '<path d="M15 3h8l3 13h-8zM33 3h-8l-3 13h8z" fill="#3B7DD8"/><path d="M19 3h4l3 13h-4z" fill="#FF6B6B"/>' +
      '<circle cx="24" cy="30" r="14" fill="url(#' + u + ')" stroke="#E79A00" stroke-width="2.4"/><path d="' + starPath(24, 30.5, 7.4, 3.4) + '" fill="#fff" opacity=".92"/>' + gloss(18.5, 23.5, 3.4, 2, .6); }
  };
  HJ.art = function (n, size, cls) {
    var f = ART[n]; if (!f) return "";
    var u = "a" + (++uid);
    var w = size || 24;
    return '<svg class="art ' + (cls || "") + '" viewBox="0 0 48 48" width="' + w + '" height="' + w + '" aria-hidden="true">' + f(u) + "</svg>";
  };
  // round flags for the language choice (drawn, not emoji, so they look the same on every phone)
  HJ.flag = function (code, size) {
    var w = size || 44, u = "f" + (++uid), body;
    if (code === "id") body = '<rect width="60" height="30" fill="#E5262D"/><rect y="30" width="60" height="30" fill="#fff"/>';
    else body = '<rect width="60" height="60" fill="#012169"/><path d="M0 0l60 60M60 0L0 60" stroke="#fff" stroke-width="12"/>' +
      '<path d="M0 0l60 60M60 0L0 60" stroke="#C8102E" stroke-width="5"/><path d="M30 0v60M0 30h60" stroke="#fff" stroke-width="18"/>' +
      '<path d="M30 0v60M0 30h60" stroke="#C8102E" stroke-width="10"/>';
    return '<svg class="flag" viewBox="0 0 60 60" width="' + w + '" height="' + w + '" aria-hidden="true"><defs><clipPath id="' + u + '"><circle cx="30" cy="30" r="30"/></clipPath>' +
      '<radialGradient id="' + u + 'g" cx=".35" cy=".25" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>' +
      '<g clip-path="url(#' + u + ')">' + body + '<circle cx="30" cy="30" r="30" fill="url(#' + u + 'g)"/></g><circle cx="30" cy="30" r="29" fill="none" stroke="rgba(0,0,0,.12)" stroke-width="2"/></svg>';
  };
  // the cute engine for the reading train (faces left, the way we read)
  HJ.engine = function () {
    var u = "e" + (++uid);
    var P = (HJ.prize && HJ.prize.train()) || { body: ["#FF8A80", "#E5394B"], cab: ["#7CC8FF", "#2B7BE4"] };
    return '<svg class="art engine" viewBox="0 0 96 76" aria-hidden="true"><defs>' + lg(u, P.body[0], P.body[1]) + lg(u + "b", P.cab[0], P.cab[1]) + "</defs>" +
      '<circle cx="74" cy="10" r="6" fill="#fff" opacity=".85"/><circle cx="84" cy="5" r="4" fill="#fff" opacity=".6"/>' +
      '<rect x="66" y="16" width="12" height="16" rx="3" fill="#3A4256"/><rect x="63" y="13" width="18" height="6" rx="3" fill="#4A5470"/>' +
      '<rect x="8" y="30" width="72" height="30" rx="10" fill="url(#' + u + ')"/><rect x="8" y="12" width="32" height="30" rx="8" fill="url(#' + u + 'b)"/>' +
      '<rect x="14" y="18" width="20" height="14" rx="5" fill="#E9F6FF"/><circle cx="24" cy="25" r="3.6" fill="#FFC58A"/>' +
      '<rect x="78" y="40" width="10" height="12" rx="3" fill="#FFD54A"/><path d="M88 58H96L88 48z" fill="#3A4256"/>' +
      '<circle cx="24" cy="62" r="10" fill="#3A4256"/><circle cx="24" cy="62" r="4" fill="#C8D0DC"/><circle cx="58" cy="62" r="10" fill="#3A4256"/><circle cx="58" cy="62" r="4" fill="#C8D0DC"/>' +
      '<ellipse cx="44" cy="36" rx="24" ry="3" fill="#fff" opacity=".35"/><ellipse cx="22" cy="15.5" rx="8" ry="2" fill="#fff" opacity=".45"/></svg>';
  };
})();
