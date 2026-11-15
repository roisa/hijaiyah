/* Baby Mo Hijaiyah — the race engine (Balap Hijaiyah, forward view).
   A classic "pseudo 3D" road: the track is a strip of segments with curves and hills, drawn from the camera
   behind Mo's kart toward the horizon. Everything is drawn here (no image files) except the drivers' faces in the
   corner cam, which come from the original pictures (render 1 for Mo).
   On the road: letter ARCHES (hear a sound, drive under the board with that letter → turbo; a wrong one → a little
   slower and the right letter is shown and said), gold coins (they buy paint and wheels in the Garage), turbo pads,
   ramps (a little jump), and Ais and Kak Adam racing in their own karts. 2 laps (Grand Prix 3).
   HJ.race3d.run(race, { onFinish(result), onQuit() }) */
(function () {
  var A = HJ.audio, S = HJ.store, t = HJ.t, U = HJ.util, J = HJ.juice;
  var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function lang() { return S.get().lang; }
  function dark() { return document.documentElement.getAttribute("data-theme") === "dark"; }

  /* ---------- road constants ---------- */
  var SEG = 200, ROADW = 2000, CAMH = 1000, FOV = 100, DEPTH = 1 / Math.tan((FOV / 2) * Math.PI / 180), DRAW = 170, LANES = [-0.64, 0, 0.64];
  var PLAYERZ = CAMH * DEPTH, BASE = 44 * SEG;   // cruising speed: 44 segments a second

  /* ---------- seeded random (a race always has the same track) ---------- */
  function rng(seed) { var s = 0; for (var i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  /* ---------- the look of each world ---------- */
  var THEME = {
    1: { name: "beach", sky: [["#7CC8FF", "#CFEBFF", "#FFF4DC"], ["#0E1640", "#28306E", "#4A3F7A"]], grass: [["#F6D58E", "#EFC97C"], ["#6A5E8E", "#615585"]],
         rumble: ["#FF5D5D", "#FFFFFF"], road: [["#7A8296", "#737B8F"], ["#3E4660", "#394058"]], far: ["#5BC0E8", "#2A4C8A"], hills: ["#9AD9A0", "#2F5A55"], deco: ["palm", "umbrella", "palm", "castle"] },
    2: { name: "forest", sky: [["#8FDDB8", "#D8F7E6", "#FFF8E0"], ["#0B1D2A", "#173544", "#284A50"]], grass: [["#7FCB6E", "#72BF61"], ["#25503F", "#214836"]],
         rumble: ["#FFB000", "#FFFFFF"], road: [["#7A7F8E", "#727787"], ["#3C4458", "#373F52"]], far: ["#6BBF8A", "#1C3D35"], hills: ["#4FA86A", "#173029"], deco: ["tree", "bush", "pine", "mushroom"] },
    3: { name: "mountain", sky: [["#9DB2FF", "#DCE3FF", "#FFF2F6"], ["#0F1438", "#252A62", "#3A3570"]], grass: [["#A8DC98", "#9AD18A"], ["#2E4A48", "#294240"]],
         rumble: ["#7C5CFF", "#FFFFFF"], road: [["#7D8498", "#767D91"], ["#3D4562", "#38405A"]], far: ["#9AA6E0", "#2A3066"], hills: ["#7FB8A0", "#22383D"], deco: ["pine", "rock", "pine", "snowman"] },
    4: { name: "sea", sky: [["#3FB4E0", "#7FD4EE", "#BFF0FF"], ["#06142C", "#0B2346", "#123462"]], grass: [["#F0D79C", "#E8CC8C"], ["#4E5378", "#474C70"]],
         rumble: ["#FF7AA8", "#FFFFFF"], road: [["#D9BC80", "#D2B377"], ["#5A5470", "#544E69"]], far: ["#2C8EC0", "#0A2550"], hills: ["#2FA3A0", "#0E3A4A"], deco: ["coral", "weed", "coral", "star"] }
  };
  var PAINT = {
    red: ["#FF6B5B", "#D93A2B"], orange: ["#FF9F3D", "#DB6D0E"], yellow: ["#FFD43B", "#D9A600"], green: ["#3FCF7A", "#1E9A52"],
    blue: ["#4D96FF", "#2361D6"], purple: ["#9B6DFF", "#6A3DE0"], pink: ["#FF7FB8", "#DB4C8E"], gold: ["#FFC93D", "#B8860B"]
  };
  var RIMS = { classic: ["#C9D3E3", "#8E9BB0"], star: ["#FFD43B", "#D99A00"], rainbow: ["#FF8FB1", "#7CC8FF"] };

  /* ---------- sprite cache: everything on the roadside is drawn once into a small canvas ---------- */
  var SPR = {};
  function sprite(name, night, maker, w, h, ww) {
    var key = name + (night ? "n" : "d");
    if (SPR[key]) return SPR[key];
    var c = document.createElement("canvas"); c.width = w; c.height = h; var g = c.getContext("2d");
    maker(g, w, h, night);
    return (SPR[key] = { c: c, w: w, h: h, ww: ww });
  }
  function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function lgr(g, y0, y1, a, b) { var q = g.createLinearGradient(0, y0, 0, y1); q.addColorStop(0, a); q.addColorStop(1, b); return q; }
  var DECO = {
    palm: function (n) { return sprite("palm", n, function (g, w, h, n) {
      g.strokeStyle = n ? "#6B5070" : "#C98B50"; g.lineWidth = 22; g.lineCap = "round"; g.beginPath(); g.moveTo(w * .5, h - 6); g.quadraticCurveTo(w * .42, h * .55, w * .58, h * .2); g.stroke();
      g.strokeStyle = n ? "#55405C" : "#A86E3A"; g.lineWidth = 4; for (var i = 1; i < 7; i++) { var y = h - 6 - i * (h * .11); g.beginPath(); g.moveTo(w * .43, y); g.lineTo(w * .57, y - 6); g.stroke(); }
      var lf = n ? ["#2E6F6A", "#235A57"] : ["#3CC377", "#2BA463"];
      [[-.42, .12], [.44, .14], [-.3, -.02], [.32, .0], [-.05, -.06], [.1, .3], [-.2, .3]].forEach(function (p, i) {
        g.strokeStyle = lf[i % 2]; g.lineWidth = 26; g.beginPath(); g.moveTo(w * .58, h * .2); g.quadraticCurveTo(w * (.58 + p[0] * .55), h * (.2 + p[1] - .14), w * (.58 + p[0]), h * (.2 + p[1] + .08)); g.stroke(); });
      g.fillStyle = n ? "#5A4560" : "#8A5A2A"; [[.55, .23], [.62, .24], [.58, .27]].forEach(function (p) { g.beginPath(); g.arc(w * p[0], h * p[1], 11, 0, 7); g.fill(); });
    }, 260, 420, .62); },
    umbrella: function (n) { return sprite("umb", n, function (g, w, h, n) {
      g.strokeStyle = n ? "#8A7AA0" : "#9A7A5A"; g.lineWidth = 8; g.beginPath(); g.moveTo(w / 2, h); g.lineTo(w / 2 + 6, h * .25); g.stroke();
      var cols = n ? ["#7A4A8A", "#C8C2E8"] : ["#FF5D73", "#FFFFFF"];
      for (var i = 0; i < 6; i++) { g.fillStyle = cols[i % 2]; g.beginPath(); g.moveTo(w / 2 + 6, h * .12); g.lineTo(10 + i * (w - 20) / 6, h * .34); g.lineTo(10 + (i + 1) * (w - 20) / 6, h * .34); g.closePath(); g.fill(); }
      g.fillStyle = n ? "#4E4770" : "#FFE7AE"; rr(g, w * .18, h * .86, w * .64, h * .1, 8); g.fill(); g.fillStyle = n ? "#6E5E86" : "#7CC8FF"; rr(g, w * .2, h * .82, w * .6, h * .07, 6); g.fill();
    }, 240, 240, .5); },
    castle: function (n) { return sprite("castle", n, function (g, w, h, n) {
      var a = n ? "#6E5E86" : "#F6CF82", b = n ? "#5A4C70" : "#E2B568";
      g.fillStyle = b; g.fillRect(w * .1, h * .45, w * .8, h * .55); g.fillStyle = a; g.fillRect(w * .1, h * .45, w * .8, h * .1);
      [[.1, .3], [.4, .15], [.7, .3]].forEach(function (p) { g.fillStyle = b; g.fillRect(w * p[0], h * p[1], w * .2, h); g.fillStyle = a; for (var i = 0; i < 3; i++) g.fillRect(w * p[0] + i * w * .075, h * p[1] - h * .07, w * .05, h * .08); });
      g.fillStyle = n ? "#3C3352" : "#B98A4A"; rr(g, w * .44, h * .7, w * .12, h * .3, 12); g.fill();
      g.strokeStyle = "#7A5A3A"; g.lineWidth = 3; g.beginPath(); g.moveTo(w * .5, h * .15); g.lineTo(w * .5, 0); g.stroke(); g.fillStyle = "#FF5D73"; g.beginPath(); g.moveTo(w * .5, 2); g.lineTo(w * .66, 10); g.lineTo(w * .5, 18); g.fill();
    }, 220, 180, .42); },
    tree: function (n) { return sprite("tree", n, function (g, w, h, n) {
      g.fillStyle = n ? "#5A4560" : "#9C6A3E"; rr(g, w * .44, h * .55, w * .12, h * .45, 8); g.fill();
      var c = n ? ["#2F7A64", "#286A57"] : ["#4CC97A", "#3DB86B"];
      [[.5, .3, .3], [.3, .45, .2], [.7, .45, .2], [.5, .5, .24]].forEach(function (p, i) { g.fillStyle = c[i % 2]; g.beginPath(); g.arc(w * p[0], h * p[1], w * p[2], 0, 7); g.fill(); });
      g.fillStyle = "rgba(255,255,255," + (n ? .06 : .25) + ")"; g.beginPath(); g.arc(w * .4, h * .2, w * .1, 0, 7); g.fill();
      if (!n) { g.fillStyle = "#FF6B6B"; [[.36, .36], [.62, .3], [.55, .5], [.3, .5]].forEach(function (p) { g.beginPath(); g.arc(w * p[0], h * p[1], 7, 0, 7); g.fill(); }); }
    }, 240, 300, .62); },
    bush: function (n) { return sprite("bush", n, function (g, w, h, n) {
      var c = n ? ["#2E7462", "#25604F"] : ["#5DD38A", "#4CC97A"];
      [[.25, .65, .25], [.5, .5, .3], [.75, .65, .25]].forEach(function (p, i) { g.fillStyle = c[i % 2]; g.beginPath(); g.arc(w * p[0], h * p[1], w * p[2], 0, 7); g.fill(); });
      if (!n) { g.fillStyle = "#FF8FB1"; [[.3, .5], [.55, .35], [.72, .55]].forEach(function (p) { g.beginPath(); g.arc(w * p[0], h * p[1], 7, 0, 7); g.fill(); }); }
    }, 220, 140, .45); },
    mushroom: function (n) { return sprite("mush", n, function (g, w, h, n) {
      g.fillStyle = n ? "#C8C2E8" : "#FFF3E0"; rr(g, w * .38, h * .45, w * .24, h * .55, 14); g.fill();
      g.fillStyle = n ? "#8A4A7A" : "#FF5D5D"; g.beginPath(); g.ellipse(w / 2, h * .45, w * .46, h * .32, 0, Math.PI, 0); g.fill();
      g.fillStyle = "#fff"; [[.32, .32], [.55, .22], [.7, .38]].forEach(function (p) { g.beginPath(); g.arc(w * p[0], h * p[1], 8, 0, 7); g.fill(); });
    }, 160, 170, .32); },
    pine: function (n) { return sprite("pine", n, function (g, w, h, n) {
      g.fillStyle = n ? "#5A4560" : "#8A5A3A"; g.fillRect(w * .45, h * .82, w * .1, h * .18);
      var c = n ? ["#2B5A55", "#24504B"] : ["#2FA06A", "#28915F"];
      [[.08, .3], [.28, .25], [.5, .2]].reverse().forEach(function (p, i) { g.fillStyle = c[i % 2]; g.beginPath(); g.moveTo(w * p[1] * .2, h * (.88 - i * .0)); g.lineTo(w / 2, h * (p[0] - .05)); g.lineTo(w - w * p[1] * .2, h * .88); g.closePath(); g.fill(); });
      g.fillStyle = c[0]; g.beginPath(); g.moveTo(w * .08, h * .86); g.lineTo(w * .5, h * .25); g.lineTo(w * .92, h * .86); g.closePath(); g.fill();
      g.fillStyle = c[1]; g.beginPath(); g.moveTo(w * .16, h * .62); g.lineTo(w * .5, h * .1); g.lineTo(w * .84, h * .62); g.closePath(); g.fill();
      g.fillStyle = c[0]; g.beginPath(); g.moveTo(w * .26, h * .38); g.lineTo(w * .5, 0); g.lineTo(w * .74, h * .38); g.closePath(); g.fill();
      if (!n) { g.fillStyle = "rgba(255,255,255,.85)"; g.beginPath(); g.moveTo(w * .38, h * .2); g.lineTo(w * .5, 0); g.lineTo(w * .62, h * .2); g.quadraticCurveTo(w * .5, h * .25, w * .38, h * .2); g.fill(); }
    }, 180, 340, .48); },
    rock: function (n) { return sprite("rock", n, function (g, w, h, n) {
      g.fillStyle = n ? "#4A4A6A" : "#A9A3B8"; g.beginPath(); g.moveTo(w * .05, h); g.lineTo(w * .2, h * .35); g.lineTo(w * .5, h * .1); g.lineTo(w * .82, h * .3); g.lineTo(w * .95, h); g.closePath(); g.fill();
      g.fillStyle = n ? "#5A5A7C" : "#C8C2D6"; g.beginPath(); g.moveTo(w * .2, h * .35); g.lineTo(w * .5, h * .1); g.lineTo(w * .55, h * .6); g.lineTo(w * .3, h * .7); g.closePath(); g.fill();
    }, 200, 130, .45); },
    snowman: function (n) { return sprite("snow", n, function (g, w, h, n) {
      g.fillStyle = n ? "#D6D2F0" : "#FFFFFF"; g.beginPath(); g.arc(w / 2, h * .72, w * .34, 0, 7); g.fill(); g.beginPath(); g.arc(w / 2, h * .34, w * .24, 0, 7); g.fill();
      g.fillStyle = "#2A2F3D"; g.beginPath(); g.arc(w * .42, h * .3, 4, 0, 7); g.arc(w * .58, h * .3, 4, 0, 7); g.fill();
      g.fillStyle = "#FF8A3D"; g.beginPath(); g.moveTo(w * .5, h * .35); g.lineTo(w * .68, h * .38); g.lineTo(w * .5, h * .4); g.fill();
      g.fillStyle = "#FF5D73"; g.fillRect(w * .28, h * .48, w * .44, h * .06); g.fillRect(w * .6, h * .5, w * .08, h * .16);
    }, 150, 200, .32); },
    coral: function (n) { return sprite("coral", n, function (g, w, h, n) {
      var c = n ? ["#9A5AA0", "#7A4A8A"] : ["#FF7A8A", "#FF9F6B"];
      g.lineCap = "round"; [[.5, .05, 0], [.25, .25, 1], [.75, .2, 1], [.38, .4, 0], [.64, .38, 0]].forEach(function (p) { g.strokeStyle = c[p[2]]; g.lineWidth = 18; g.beginPath(); g.moveTo(w / 2, h); g.quadraticCurveTo(w * p[0], h * .7, w * p[0], h * p[1]); g.stroke(); g.fillStyle = c[p[2]]; g.beginPath(); g.arc(w * p[0], h * p[1], 12, 0, 7); g.fill(); });
    }, 220, 220, .5); },
    weed: function (n) { return sprite("weed", n, function (g, w, h, n) {
      g.strokeStyle = n ? "#2E6F6A" : "#3CC377"; g.lineCap = "round"; [[.3, 12], [.5, 16], [.7, 12]].forEach(function (p, i) { g.lineWidth = p[1]; g.beginPath(); g.moveTo(w * p[0], h); g.bezierCurveTo(w * (p[0] - .2), h * .7, w * (p[0] + .2), h * .4, w * (p[0] - .05 + i * .03), 10); g.stroke(); });
    }, 140, 320, .34); },
    star: function (n) { return sprite("star", n, function (g, w, h, n) {
      g.fillStyle = n ? "#C8789A" : "#FF9F6B"; g.beginPath(); for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? w * .2 : w * .45; g.lineTo(w / 2 + Math.cos(a) * r, h * .55 + Math.sin(a) * r * .6); } g.closePath(); g.fill();
      g.fillStyle = "rgba(255,255,255,.5)"; [[.5, .45], [.38, .55], [.62, .55]].forEach(function (p) { g.beginPath(); g.arc(w * p[0], h * p[1], 4, 0, 7); g.fill(); });
    }, 140, 90, .28); },
    chevron: function (n, dir) { return sprite("chev" + dir, n, function (g, w, h) {
      g.fillStyle = "#fff"; rr(g, 8, 8, w - 16, h * .62, 14); g.fill(); g.fillStyle = "#FF5D5D"; rr(g, 16, 16, w - 32, h * .62 - 16, 10); g.fill();
      g.strokeStyle = "#fff"; g.lineWidth = 14; g.lineJoin = "round"; g.lineCap = "round";
      for (var i = 0; i < 2; i++) { var x = w * (.38 + i * .24) * 1; g.beginPath(); if (dir > 0) { g.moveTo(x - 14, 34); g.lineTo(x + 12, h * .33); g.lineTo(x - 14, h * .62 - 22); } else { g.moveTo(x + 14, 34); g.lineTo(x - 12, h * .33); g.lineTo(x + 14, h * .62 - 22); } g.stroke(); }
      g.fillStyle = "#8E9BB0"; g.fillRect(w / 2 - 6, h * .62, 12, h * .38);
    }, 200, 200, .4); }
  };
  function lampSpr() { return sprite("lamp", 1, function (g, w, h) {
    var q = g.createRadialGradient(w / 2, 40, 4, w / 2, 40, 70); q.addColorStop(0, "rgba(255,236,160,.95)"); q.addColorStop(1, "rgba(255,236,160,0)"); g.fillStyle = q; g.beginPath(); g.arc(w / 2, 40, 70, 0, 7); g.fill();
    g.fillStyle = "#8E9BB0"; g.fillRect(w / 2 - 5, 50, 10, h - 50); g.fillStyle = "#3A4256"; rr(g, w / 2 - 22, 28, 44, 22, 8); g.fill(); g.fillStyle = "#FFF3B0"; rr(g, w / 2 - 16, 44, 32, 10, 4); g.fill();
  }, 140, 300, .3); }
  function boxSpr() { return sprite("box", 0, function (g, w, h) {
    var q = g.createLinearGradient(0, 0, w, h); q.addColorStop(0, "#FF8FB1"); q.addColorStop(.35, "#FFD43B"); q.addColorStop(.7, "#5BE38A"); q.addColorStop(1, "#7CC8FF");
    g.fillStyle = "rgba(0,0,0,.18)"; g.beginPath(); g.ellipse(w / 2, h - 6, w * .4, 8, 0, 0, 7); g.fill();
    g.fillStyle = q; rr(g, 8, 6, w - 16, h - 20, 22); g.fill(); g.strokeStyle = "#fff"; g.lineWidth = 6; rr(g, 8, 6, w - 16, h - 20, 22); g.stroke();
    g.fillStyle = "rgba(255,255,255,.35)"; rr(g, 18, 14, w - 36, 18, 9); g.fill();
    g.fillStyle = "#fff"; g.font = "900 " + (h * .55) + "px 'Fredoka One', Nunito"; g.textAlign = "center"; g.textBaseline = "middle"; g.lineWidth = 8; g.strokeStyle = "#9B6DFF"; g.strokeText("?", w / 2, h / 2); g.fillText("?", w / 2, h / 2);
  }, 120, 120, .36); }
  function coinSpr() { return sprite("coin", 0, function (g, w, h) {
    var q = g.createRadialGradient(w * .38, h * .35, 4, w / 2, h / 2, w / 2); q.addColorStop(0, "#FFF3A6"); q.addColorStop(.6, "#FFC21A"); q.addColorStop(1, "#D98A00");
    g.fillStyle = q; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 2, 0, 7); g.fill(); g.strokeStyle = "#B87400"; g.lineWidth = 4; g.stroke();
    g.strokeStyle = "rgba(255,255,255,.75)"; g.lineWidth = 5; g.beginPath(); g.arc(w / 2, h / 2, w * .3, 0, 7); g.stroke();
    g.fillStyle = "#B87400"; g.font = "900 " + (w * .38) + "px 'Fredoka One', Nunito"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("★", w / 2, h / 2 + 2);
    g.fillStyle = "rgba(255,255,255,.85)"; g.beginPath(); g.ellipse(w * .32, h * .26, w * .1, h * .05, -.6, 0, 7); g.fill();
  }, 96, 96, .25); }
  function padSpr() { return sprite("pad", 0, function (g, w, h) {
    g.fillStyle = "rgba(0,0,0,.18)"; rr(g, 4, 6, w - 8, h - 6, 16); g.fill();
    var q = g.createLinearGradient(0, 0, 0, h); q.addColorStop(0, "#7CF3FF"); q.addColorStop(1, "#2AA9FF"); g.fillStyle = q; rr(g, 4, 0, w - 8, h - 8, 16); g.fill();
    g.strokeStyle = "#fff"; g.lineWidth = 9; g.lineJoin = "round"; g.lineCap = "round";
    for (var i = 0; i < 3; i++) { var x = w * (.28 + i * .22); g.beginPath(); g.moveTo(x - 22, h * .62); g.lineTo(x, h * .22); g.lineTo(x + 22, h * .62); g.stroke(); }
  }, 300, 90, .66); }
  function rampSpr() { return sprite("ramp", 0, function (g, w, h) {
    var q = g.createLinearGradient(0, 0, 0, h); q.addColorStop(0, "#FFD43B"); q.addColorStop(1, "#F59F00"); g.fillStyle = q;
    g.beginPath(); g.moveTo(10, h); g.lineTo(w * .1, h * .1); g.lineTo(w * .9, h * .1); g.lineTo(w - 10, h); g.closePath(); g.fill();
    g.fillStyle = "#C77A00"; g.fillRect(w * .1, h * .08, w * .8, h * .12);
    g.fillStyle = "#fff"; for (var i = 0; i < 6; i++) { var x = w * (.16 + i * .13); g.beginPath(); g.moveTo(x, h * .9); g.lineTo(x + 30, h * .3); g.lineTo(x + 54, h * .3); g.lineTo(x + 24, h * .9); g.closePath(); g.globalAlpha = .55; g.fill(); g.globalAlpha = 1; }
  }, 900, 120, 2.0); }
  function archSpr(kind, night) { return sprite("arch" + kind, night, function (g, w, h, n) {
    // start / finish arch: checkered banner on two posts
    g.fillStyle = "#3A4256"; g.fillRect(14, 40, 26, h - 40); g.fillRect(w - 40, 40, 26, h - 40);
    var bw = w - 40, bh = 90;
    for (var x = 0; x < bw; x += 30) for (var y = 0; y < bh; y += 30) { g.fillStyle = ((x + y) / 30) % 2 ? "#222" : "#fff"; g.fillRect(20 + x, 10 + y, 30, 30); }
    g.fillStyle = kind === "fin" ? "#FF5D73" : "#22C06E"; rr(g, w / 2 - 230, 0, 460, 110, 24); g.fill();
    g.fillStyle = "#fff"; g.font = "900 64px 'Fredoka One', Nunito"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(kind === "fin" ? t("raceFinish") : "START", w / 2, 58);
  }, 1100, 420, 2.4); }

  /* ---------- a kart seen from behind (the player, the rivals) ---------- */
  // who: { paint:[c,d], rim:[c,d], helmet:[c,d], shirt:[c,d], hijab:color|null }
  function drawKart(g, cx, by, W, who, o) {
    o = o || {}; var s = W / 300, wob = o.wob || 0;
    g.save(); g.translate(cx, by); g.scale(s, s); g.rotate(o.tilt || 0);
    // shadow
    g.fillStyle = "rgba(0,0,0," + (o.night ? .35 : .22) + ")"; g.beginPath(); g.ellipse(0, -4 + (o.air || 0) * 0, 160 - (o.air || 0) * .4, 20, 0, 0, 7); g.fill();
    g.translate(0, -(o.air || 0) + wob);
    // turbo flames from the two exhausts
    if (o.turbo) for (var i = -1; i <= 1; i += 2) { var fl = 40 + Math.random() * 30; var q = g.createLinearGradient(0, -40, 0, -40 + fl); q.addColorStop(0, "#FFF3A6"); q.addColorStop(.4, "#FFB000"); q.addColorStop(1, "rgba(255,80,40,0)"); g.fillStyle = q; g.beginPath(); g.ellipse(i * 40, -30 + fl / 2, 16, fl / 2, 0, 0, 7); g.fill(); }
    // rear tyres
    [-1, 1].forEach(function (sd) {
      g.fillStyle = "#23262F"; rr(g, sd * 150 - (sd > 0 ? 62 : 0), -122, 62, 118, 22); g.fill();
      g.fillStyle = "#3A3F4C"; for (var k = 0; k < 5; k++) { var yy = -116 + ((k * 24 + (o.roll || 0)) % 116); g.fillRect(sd * 150 - (sd > 0 ? 58 : -4), yy, 54, 7); }
      g.fillStyle = who.rim[0]; g.beginPath(); g.ellipse(sd * 150 - sd * 31, -62, 12, 26, 0, 0, 7); g.fill();
    });
    // body
    var P = who.paint;
    g.fillStyle = P[1]; rr(g, -122, -100, 244, 84, 30); g.fill();
    var q2 = g.createLinearGradient(0, -170, 0, -30); q2.addColorStop(0, P[0]); q2.addColorStop(1, P[1]);
    g.fillStyle = q2; g.beginPath(); g.moveTo(-112, -40); g.quadraticCurveTo(-118, -150, -60, -158); g.lineTo(60, -158); g.quadraticCurveTo(118, -150, 112, -40); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,255,255,.28)"; g.beginPath(); g.moveTo(-96, -120); g.quadraticCurveTo(-92, -146, -56, -150); g.lineTo(-10, -150); g.lineTo(-30, -128); g.closePath(); g.fill();
    // tail lights + bumper + exhausts + number
    g.fillStyle = "#2A2F3D"; rr(g, -128, -40, 256, 26, 12); g.fill();
    g.fillStyle = o.night ? "#FF3B3B" : "#FF6B6B"; rr(g, -108, -88, 34, 18, 8); g.fill(); rr(g, 74, -88, 34, 18, 8); g.fill();
    if (o.night) { g.fillStyle = "rgba(255,60,60,.35)"; g.beginPath(); g.arc(-91, -79, 30, 0, 7); g.arc(91, -79, 30, 0, 7); g.fill(); }
    g.fillStyle = "#8E9BB0"; [-40, 40].forEach(function (x) { g.beginPath(); g.arc(x, -30, 13, 0, 7); g.fill(); }); g.fillStyle = "#2A2F3D"; [-40, 40].forEach(function (x) { g.beginPath(); g.arc(x, -30, 7, 0, 7); g.fill(); });
    g.fillStyle = "#fff"; rr(g, -26, -98, 52, 34, 8); g.fill(); g.fillStyle = P[1]; g.font = "900 26px 'Fredoka One', Nunito"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(who.num || "1", 0, -80);
    // seat back + roll bar
    g.fillStyle = "#2A2F3D"; rr(g, -70, -214, 140, 70, 26); g.fill();
    g.strokeStyle = "#C9D3E3"; g.lineWidth = 10; g.beginPath(); g.moveTo(-74, -150); g.lineTo(-62, -232); g.quadraticCurveTo(0, -250, 62, -232); g.lineTo(74, -150); g.stroke();
    // driver from behind: shoulders, (hijab), helmet
    var Sh = who.shirt; g.fillStyle = Sh[0]; g.beginPath(); g.moveTo(-74, -168); g.quadraticCurveTo(-74, -222, -28, -228); g.lineTo(28, -228); g.quadraticCurveTo(74, -222, 74, -168); g.closePath(); g.fill();
    g.fillStyle = Sh[1]; g.fillRect(-74, -186, 22, 16); g.fillRect(52, -186, 22, 16);
    if (who.hijab) { g.fillStyle = who.hijab; g.beginPath(); g.moveTo(-46, -232); g.quadraticCurveTo(0, -198, 46, -232); g.lineTo(40, -258); g.lineTo(-40, -258); g.closePath(); g.fill(); }
    if (who.hair) { g.fillStyle = who.hair; g.beginPath(); g.ellipse(0, -246, 46, 16, 0, 0, 7); g.fill(); }
    var H = who.helmet, hq = g.createRadialGradient(-20, -320, 10, 0, -290, 70); hq.addColorStop(0, H[0]); hq.addColorStop(1, H[1]);
    g.fillStyle = hq; g.beginPath(); g.arc(0, -292, 58, 0, 7); g.fill();
    g.fillStyle = "#fff"; g.fillRect(-9, -350, 18, 112); g.fillStyle = H[1]; g.fillRect(-58, -266, 116, 14);
    g.fillStyle = "rgba(255,255,255,.4)"; g.beginPath(); g.ellipse(-24, -318, 14, 20, -.5, 0, 7); g.fill();
    if (who.star) { g.fillStyle = "#FFD43B"; g.beginPath(); for (var si = 0; si < 10; si++) { var sa = -Math.PI / 2 + si * Math.PI / 5, srr = si % 2 ? 9 : 20; g.lineTo(30 + Math.cos(sa) * srr, -300 + Math.sin(sa) * srr); } g.closePath(); g.fill(); }
    if (who.ears) { g.fillStyle = H[0]; g.beginPath(); g.moveTo(-50, -320); g.lineTo(-44, -360); g.lineTo(-22, -338); g.closePath(); g.moveTo(50, -320); g.lineTo(44, -360); g.lineTo(22, -338); g.closePath(); g.fill(); }
    // spoiler wing
    g.fillStyle = P[1]; g.fillRect(-150, -176, 16, 30); g.fillRect(134, -176, 16, 30); g.fillStyle = P[0]; rr(g, -166, -190, 332, 22, 10); g.fill();
    g.restore();
  }

  /* ---------- sound: a soft engine hum and a cheerful loop ---------- */
  function sound() {
    var c = A.ac && A.ac(), set = S.get().settings || {};
    var none = { speed: function () {}, music: function () {}, duck: function () {}, stop: function () {} };
    if (!c || set.sfx === false) return none;
    var out = c.createGain(); out.gain.value = 1; out.connect(c.destination);
    var eo = c.createOscillator(), eo2 = c.createOscillator(), lp = c.createBiquadFilter(), eg = c.createGain();
    eo.type = "sawtooth"; eo2.type = "square"; lp.type = "lowpass"; lp.frequency.value = 380; eg.gain.value = 0;
    eo.connect(lp); eo2.connect(lp); lp.connect(eg); eg.connect(out); eo.start(); eo2.start();
    var mg = c.createGain(), musicOn = set.raceMusic !== false; mg.gain.value = musicOn ? .085 : 0; mg.connect(out);
    var step = 60 / 132 / 2, next = c.currentTime + .15, i = 0, ducked = false;
    function note(f, t0, d, type, vol) { var o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + .012); g.gain.exponentialRampToValueAtTime(.0001, t0 + d); o.connect(g); g.connect(mg); o.start(t0); o.stop(t0 + d + .05); }
    var ROOT = [0, 5, 7, 5], MEL = [0, 4, 7, 12, 7, 4, 9, 7];
    function sched() {
      while (next < c.currentTime + .3) {
        var bar = Math.floor(i / 8) % 4, b = i % 8, f0 = 130.81 * Math.pow(2, ROOT[bar] / 12);
        note(f0 * (b % 2 ? 2 : 1), next, step * .85, "triangle", .55);                           // bouncing bass
        if (b % 2 === 0 || bar === 3) note(f0 * 4 * Math.pow(2, MEL[(b + bar * 2) % 8] / 12), next, step * .7, "square", .16);   // little tune
        if (b === 4) note(f0 * 8, next, .05, "sine", .12);                                       // a tick
        i++; next += step;
      }
    }
    var timer = setInterval(sched, 70); sched();
    return {
      speed: function (v) { var t0 = c.currentTime; eo.frequency.setTargetAtTime(55 + v * 75, t0, .12); eo2.frequency.setTargetAtTime(27 + v * 37, t0, .12); eg.gain.setTargetAtTime(ducked ? .008 : .028 + v * .018, t0, .2); },
      music: function (on) { musicOn = on; mg.gain.setTargetAtTime(on && !ducked ? .085 : 0, c.currentTime, .2); },
      duck: function (on) { ducked = on; mg.gain.setTargetAtTime(musicOn ? (on ? .02 : .085) : 0, c.currentTime, .15); },
      stop: function () { clearInterval(timer); eg.gain.setTargetAtTime(0, c.currentTime, .05); mg.gain.setTargetAtTime(0, c.currentTime, .05); setTimeout(function () { try { eo.stop(); eo2.stop(); } catch (e) {} out.disconnect(); }, 400); }
    };
  }
  // horns: tap the horn button (the Garage sells more)
  var HORNS = {
    beep: function (p) { tone2(520 * p, .12, "square", .09); tone2(520 * p, .14, "square", .09, .17); },
    trumpet: function (p) { tone2(392 * p, .16, "sawtooth", .07, 0, 523 * p); tone2(523 * p, .28, "sawtooth", .07, .18, 659 * p); },
    duck: function (p) { tone2(760 * p, .1, "square", .08, 0, 520 * p); tone2(760 * p, .12, "square", .08, .16, 480 * p); }
  };
  function tone2(f, d, type, vol, when, slide) {
    var c = A.ac && A.ac(); if (!c || (S.get().settings || {}).sfx === false) return;
    var t0 = c.currentTime + (when || 0), o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t0 + d);
    g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + .012); g.gain.exponentialRampToValueAtTime(.0001, t0 + d);
    o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + d + .05);
  }

  /* ---------- the race ---------- */
  var live = 0;
  function run(R, hooks) {
    var my = ++live;
    var app = document.getElementById("app"); app.innerHTML = ""; A.stop();
    if (HJ.bg) HJ.bg(null);
    var night = dark() ? 1 : 0, TH = THEME[R.w], rand = rng(R.id + "-track");
    var st = S.get(), gar = st.garage || {}, myPaint = PAINT[gar.paint] || PAINT.red, myRim = RIMS[gar.rim] || RIMS.classic;
    var ME = { paint: myPaint, rim: myRim, helmet: [myPaint[0], myPaint[1]], shirt: ["#43B85C", "#FF8A3D"], num: "1", hair: "#22252E", star: true };
    var RIV = {
      ais: { paint: PAINT.pink, rim: RIMS.classic, helmet: ["#FFB3D6", "#E86AA6"], shirt: ["#FF8FC8", "#9B6DFF"], hijab: "#FFC4E1", num: "2", ears: true },
      adam: { paint: PAINT.blue, rim: RIMS.classic, helmet: ["#7FB3FF", "#2F6BE0"], shirt: ["#3D7BFF", "#FFFFFF"], num: "3" }
    };

    /* screen */
    var sc = el("div", "screen race r3"); app.appendChild(sc);
    var stage = el("div", "race-stage"), cv = el("canvas", "race-cv"); stage.appendChild(cv); sc.appendChild(stage);
    var top = el("div", "lv-top race-top"), x = el("button", "nav-btn", HJ.ic("close")); x.setAttribute("aria-label", t("close"));
    var mini = el("div", "rt-track", '<i class="rt-line"></i><span class="rt-flag"></span>');
    var spk = el("button", "nav-btn rt-spk", HJ.ic("speaker")); spk.setAttribute("aria-label", t("listen"));
    var coinEl = el("span", "rt-coins", '<i class="rt-coin"></i><b>0</b>');
    top.appendChild(x); top.appendChild(mini); top.appendChild(spk); top.appendChild(coinEl); sc.appendChild(top);
    var hud = el("div", "r3-hud", '<div class="r3-pos"><b>1</b><small>/3</small></div><div class="r3-lap"></div>'); sc.appendChild(hud);
    var cam = el("div", "r3-cam"), camImg = el("img"); camImg.alt = "Baby Mo"; cam.appendChild(camImg); sc.appendChild(cam);
    var callout = el("div", "r3-call"); sc.appendChild(callout);
    var horn = el("button", "r3-horn", '<svg viewBox="0 0 48 48" width="34" height="34" aria-hidden="true"><path d="M8 20h8l16-10v28L16 28H8z" fill="#fff"/><path d="M36 17c3 2 4 5 4 7s-1 5-4 7" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/></svg>');
    horn.setAttribute("aria-label", t("raceHorn")); sc.appendChild(horn);
    var mus = el("button", "nav-btn rt-mus" + ((S.get().settings || {}).raceMusic === false ? " off" : ""), '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 18V6l11-2v12" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6.5" cy="18" r="2.8" fill="currentColor"/><circle cx="17.5" cy="16" r="2.8" fill="currentColor"/></svg>');
    mus.setAttribute("aria-label", t("raceMusic")); top.insertBefore(mus, spk);
    var hand = el("div", "r3-hand", '<span class="r3-arrow"></span><img src="assets/icons/tap-hand.svg" alt="">'); sc.appendChild(hand);
    var tip = el("div", "race-tip glass", esc(t("raceHow3"))); sc.appendChild(tip);
    var heads = { ais: el("span", "rt-head ais"), adam: el("span", "rt-head adam"), mo: el("span", "rt-head moFace") };
    Object.keys(heads).forEach(function (k) { heads[k].style.backgroundImage = "url(" + hooks.face(k === "mo" ? "moFace" : k) + ")"; mini.appendChild(heads[k]); });
    function setCam(k) { camImg.src = hooks.faceOf(k); cam.classList.remove("pop"); void cam.offsetWidth; cam.classList.add("pop"); }
    setCam("mo");

    var g = cv.getContext("2d"), W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1);
    function size() { var b = stage.getBoundingClientRect(); W = b.width; H = b.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); g.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); window.addEventListener("resize", size);

    /* ---- build the track ---- */
    var laps = R.gp ? 3 : 2, perLap = R.gp ? 4 : 5, gap = 520;   // a gate every 520 segments (~12 s)
    var N = 120 + perLap * gap, segs = [];
    function lastY() { return segs.length ? segs[segs.length - 1].p2.y : 0; }
    function addSeg(curve, y) { var n = segs.length; segs.push({ i: n, curve: curve, p1: { y: lastY(), z: n * SEG }, p2: { y: y, z: (n + 1) * SEG }, sp: [], dark: Math.floor(n / 3) % 2 }); }
    function ease(a, b, p) { return a + (b - a) * ((-Math.cos(p * Math.PI) / 2) + .5); }
    function section(enter, hold, leave, curve, hill) {
      var y0 = lastY(), y1 = y0 + hill * SEG, tot = enter + hold + leave, n;
      for (n = 0; n < enter; n++) addSeg(curve * n / enter, ease(y0, y1, n / tot));
      for (n = 0; n < hold; n++) addSeg(curve, ease(y0, y1, (enter + n) / tot));
      for (n = 0; n < leave; n++) addSeg(curve * (1 - n / leave), ease(y0, y1, (enter + hold + n) / tot));
    }
    section(10, 60, 10, 0, 0);
    while (segs.length < N - 120) {
      var r = rand(), len = 40 + Math.floor(rand() * 60);
      if (r < .3) section(15, len, 15, 0, (rand() - .5) * 40);
      else if (r < .65) section(25, len, 25, (rand() < .5 ? -1 : 1) * (2 + rand() * 3), (rand() - .5) * 30);
      else { var c = (rand() < .5 ? -1 : 1) * (2 + rand() * 2); section(20, 30, 20, c, 0); section(20, 30, 20, -c, (rand() - .5) * 20); }
    }
    // come back down to the start height and straight
    var yEnd = lastY(); for (var k = 0; k < 120; k++) addSeg(0, ease(yEnd, 0, k / 119));
    N = segs.length; var LAPLEN = N * SEG, TOTAL = laps * LAPLEN;
    // scenery on both sides
    for (k = 20; k < N; k += 30) segs[k].sp.push({ s: function (n) { return n ? lampSpr() : null; }, x: (k / 30) % 2 ? 1.2 : -1.2 });
    for (k = 12; k < N; k += 5) {
      var dk = TH.deco[Math.floor(rand() * TH.deco.length)], side = rand() < .5 ? -1 : 1;
      segs[k].sp.push({ s: DECO[dk], x: side * (1.3 + rand() * 1.1) });
      if (rand() < .55) segs[k].sp.push({ s: DECO[TH.deco[Math.floor(rand() * TH.deco.length)]], x: -side * (1.4 + rand() * 1.5) });
      if (Math.abs(segs[k].curve) > 2 && k % 21 === 0) segs[k].sp.push({ s: function (n) { return DECO.chevron(n, segs[k] && segs[k].curve > 0 ? 1 : -1); }, x: (segs[k].curve > 0 ? 1.25 : -1.25), chev: segs[k].curve > 0 ? 1 : -1 });
    }
    // per-lap things, by absolute segment (lap * N + index)
    var gates = [], coins = [], pads = [], ramps = [], ev = {};
    function at(absSeg, o) { (ev[absSeg] = ev[absSeg] || []).push(o); }
    var targets = U.shuffle(R.targets.slice()), need = laps * perLap; while (targets.length < need) targets = targets.concat(U.shuffle(R.targets.slice()));
    for (var L = 0; L < laps; L++) {
      for (var gi = 0; gi < perLap; gi++) {
        var gs = L * N + 120 + gi * gap, q = targets[L * perLap + gi], opts = distract(q), lanes = U.shuffle([0, 1, 2]), signs = [];
        signs[lanes[0]] = q; signs[lanes[1]] = opts[0]; signs[lanes[2]] = opts[1];
        var G = { seg: gs, q: q, signs: signs, good: lanes[0], said: false, done: false, picked: -1, spr: null };
        gates.push(G); at(gs, { k: "gate", o: G });
        // a row of coins, a turbo pad and (once a lap) a ramp between this gate and the next
        var cl = Math.floor(rand() * 3); for (var ci = 0; ci < 6; ci++) { var C = { seg: gs + 120 + ci * 9, lane: cl, got: false }; coins.push(C); at(C.seg, { k: "coin", o: C }); }
        var cl2 = (cl + 1 + Math.floor(rand() * 2)) % 3; for (ci = 0; ci < 4; ci++) { var C2 = { seg: gs + 330 + ci * 9, lane: cl2, got: false }; coins.push(C2); at(C2.seg, { k: "coin", o: C2 }); }
        var P = { seg: gs + 250, lane: Math.floor(rand() * 3), used: false }; pads.push(P); at(P.seg, { k: "pad", o: P });
        var Bx = { seg: gs + 185, lane: Math.floor(rand() * 3), got: false }; at(Bx.seg, { k: "box", o: Bx });
        if (gi === 1) { var Rm = { seg: gs + 420, used: false }; ramps.push(Rm); at(Rm.seg, { k: "ramp", o: Rm }); }
      }
    }
    at(14, { k: "arch", o: { kind: "start" } });
    for (L = 1; L <= laps; L++) at(L * N, { k: "arch", o: { kind: L === laps ? "fin" : "start" } });
    function distract(q) {
      var cz = R.easy && q.k ? HJ.cousins(q.k) || [] : [];
      var cands = U.shuffle(R.pool.filter(function (x) { return x.ar !== q.ar && cz.indexOf(x.k) < 0; }));
      return [cands[0] || R.pool[0], cands[1] || R.pool[1]];
    }

    /* ---- state ---- */
    var pos = 0, speed = 0, laneI = 1, px = 0, tRace = 0, phase = "count", boost = 0, slow = 0, padT = 0, air = 0, airV = 0, tilt = 0, roll = 0;
    var okN = 0, coinsN = 0, skyX = 0, hillX = 0, curGate = null, finT = 0, lastLap = 0, shield = 0, magnet = 0, lastPlace = 3, talkT = 0;
    var snd = sound(), tut = !S.get().raceTut, tutOn = false, hornK = (st.garage || {}).horn || "beep";
    // rivals: tuned so about 8 of 10 right wins, 3–7 → 2nd (a pace factor of Mo's cruising speed)
    var riv = [
      { k: "ais", z: PLAYERZ + 4 * SEG, lane: 0, x: LANES[0], pace: .985, ph: 1.1, fin: 0 },
      { k: "adam", z: PLAYERZ + 6 * SEG, lane: 2, x: LANES[2], pace: 1.02, ph: .2, fin: 0 }
    ];
    HJ._race = { gates: gates, setLane: function (l) { laneI = l; }, phase: function () { return phase; }, pos: function () { return pos; }, total: TOTAL, coins: coins,
      // for tests: put Mo (and the rivals beside him) just before a spot on the track
      warp: function (seg) { pos = seg * SEG - PLAYERZ; riv.forEach(function (rv, i) { rv.z = pos + PLAYERZ + (6 + i * 9) * SEG; }); },
      ev: ev, ramps: ramps, pads: pads };

    /* ---- drawing ---- */
    function project(p, camX, camY, camZ) {
      var cx = p.x - camX, cy = p.y - camY, cz = p.z - camZ, sc2 = DEPTH / cz;
      return { x: W / 2 + sc2 * cx * W / 2, y: H / 2 - sc2 * cy * H / 2, w: sc2 * ROADW * W / 2, s: sc2, cz: cz };
    }
    function fogCol(a) { var c = TH.sky[night][2]; return "rgba(" + parseInt(c.substr(1, 2), 16) + "," + parseInt(c.substr(3, 2), 16) + "," + parseInt(c.substr(5, 2), 16) + "," + a.toFixed(3) + ")"; }
    function poly(x1, y1, x2, y2, x3, y3, x4, y4, c) { g.fillStyle = c; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.lineTo(x3, y3); g.lineTo(x4, y4); g.closePath(); g.fill(); }
    function background() {
      var sky = g.createLinearGradient(0, 0, 0, H * .62), SK = TH.sky[night];
      sky.addColorStop(0, SK[0]); sky.addColorStop(.6, SK[1]); sky.addColorStop(1, SK[2]); g.fillStyle = sky; g.fillRect(0, 0, W, H);
      // sun / moon (moves with the curves a little)
      var sx = W * .78 - skyX * .2 % W, sy = H * .16;
      if (TH.name !== "sea") { g.fillStyle = night ? "rgba(220,215,255,.25)" : "rgba(255,240,170,.5)"; g.beginPath(); g.arc(sx, sy, 46, 0, 7); g.fill(); g.fillStyle = night ? "#F4F1FF" : "#FFD43B"; g.beginPath(); g.arc(sx, sy, 26, 0, 7); g.fill();
        if (night) { g.fillStyle = SK[0]; g.beginPath(); g.arc(sx + 10, sy - 8, 23, 0, 7); g.fill(); } }
      else { g.fillStyle = "rgba(255,255,255,.18)"; for (var r = 0; r < 5; r++) { g.beginPath(); g.moveTo(W * (.1 + r * .2) - skyX * .1 % 80, 0); g.lineTo(W * (.18 + r * .2) - skyX * .1 % 80, 0); g.lineTo(W * (.3 + r * .2), H * .5); g.lineTo(W * (.2 + r * .2), H * .5); g.closePath(); g.fill(); } }
      if (night) { g.fillStyle = "rgba(255,246,200,.85)"; for (var s = 0; s < 40; s++) { var xx = ((s * 97.3 - skyX * .3) % W + W) % W, yy = (s * 53.7) % (H * .4); g.fillRect(xx, yy, 1.8, 1.8); } }
      // clouds (or bubbles under the sea)
      for (var c = 0; c < 5; c++) {
        var cx = ((c * 211 - skyX * .5 - tRace * 6) % (W + 240) + W + 240) % (W + 240) - 120, cy = H * (.08 + (c % 3) * .07);
        if (TH.name === "sea") { g.fillStyle = "rgba(255,255,255,.35)"; for (var b = 0; b < 3; b++) { g.beginPath(); g.arc(cx + b * 14, ((cy - tRace * 30 * (1 + b * .2)) % (H * .5) + H * .5) % (H * .5), 4 + b * 2, 0, 7); g.fill(); } }
        else { g.fillStyle = night ? "rgba(110,110,180,.4)" : "rgba(255,255,255,.92)"; g.beginPath(); g.ellipse(cx, cy, 44, 14, 0, 0, 7); g.arc(cx - 16, cy - 6, 16, 0, 7); g.arc(cx + 12, cy - 12, 20, 0, 7); g.fill(); }
      }
      // far layer (mountains / sea line) and near hills, both slide with the curves
      var hz = H * .5;
      g.fillStyle = TH.far[night]; g.beginPath(); g.moveTo(0, hz);
      for (var x = 0; x <= W + 30; x += 30) { var u = (x + hillX * .3) / 120, h = TH.name === "mountain" ? Math.abs(((u % 2) + 2) % 2 - 1) * H * .2 + H * .03 : TH.name === "beach" ? H * .015 : (Math.sin(u) * .5 + .5) * H * .06 + H * .02; g.lineTo(x, hz - h); }
      g.lineTo(W, hz); g.closePath(); g.fill();
      if (TH.name === "mountain" && !night) { g.fillStyle = "rgba(255,255,255,.8)"; for (x = -240; x <= W + 240; x += 240) { var u2 = x - ((hillX * .3) % 240); g.beginPath(); g.moveTo(u2 - 26, hz - H * .17); g.lineTo(u2, hz - H * .23); g.lineTo(u2 + 26, hz - H * .17); g.closePath(); g.fill(); } }
      g.fillStyle = TH.hills[night]; g.beginPath(); g.moveTo(0, hz + 2);
      for (x = 0; x <= W + 30; x += 30) { var u3 = (x + hillX * .6) / 80; g.lineTo(x, hz - (Math.sin(u3) * .5 + .5) * H * .035); }
      g.lineTo(W, hz + 2); g.closePath(); g.fill();
    }
    function render() {
      var base = Math.floor(pos / SEG) % N, perc = (pos % SEG) / SEG, bs = segs[base], camX = px * ROADW;
      var pY = bs.p1.y + (bs.p2.y - bs.p1.y) * perc, camY = pY + CAMH, lapOf = Math.floor(pos / LAPLEN);
      var dx = -(bs.curve * perc), xx = 0, maxy = H, list = [];
      g.clearRect(0, 0, W, H); background();
      for (var n = 0; n < DRAW; n++) {
        var seg = segs[(base + n) % N], looped = seg.i < base, zoff = looped ? LAPLEN : 0, posInLap = pos - lapOf * LAPLEN;
        var a = project({ x: 0, y: seg.p1.y, z: seg.p1.z }, camX - xx, camY, posInLap - zoff);
        var b = project({ x: 0, y: seg.p2.y, z: seg.p2.z }, camX - xx - dx, camY, posInLap - zoff);
        xx += dx; dx += seg.curve;
        var item = { seg: seg, a: a, b: b, clip: maxy, abs: (lapOf + (looped ? 1 : 0)) * N + seg.i };
        list.push(item);
        if (a.cz <= DEPTH || b.y >= a.y || b.y >= maxy) continue;
        var gc = TH.grass[night][seg.dark], rc = TH.rumble[seg.dark], rd = TH.road[night][seg.dark];
        poly(0, b.y, W, b.y, W, a.y, 0, a.y, gc);
        var r1 = a.w / 7, r2 = b.w / 7;
        poly(a.x - a.w - r1, a.y, a.x - a.w, a.y, b.x - b.w, b.y, b.x - b.w - r2, b.y, rc);
        poly(a.x + a.w + r1, a.y, a.x + a.w, a.y, b.x + b.w, b.y, b.x + b.w + r2, b.y, rc);
        poly(a.x - a.w, a.y, a.x + a.w, a.y, b.x + b.w, b.y, b.x - b.w, b.y, rd);
        var fogA = Math.pow(n / DRAW, 2.2) * .85;
        if (!seg.dark) { var l1 = a.w / 40, l2 = b.w / 40; [-1 / 3, 1 / 3].forEach(function (f) { var la = a.x + a.w * 2 * f, lb = b.x + b.w * 2 * f; poly(la - l1, a.y, la + l1, a.y, lb + l2, b.y, lb - l2, b.y, TH.name === "sea" ? "rgba(255,255,255,.6)" : "rgba(255,255,255,.85)"); }); }
        if (fogA > .02) poly(0, b.y, W, b.y, W, a.y, 0, a.y, fogCol(fogA));
        maxy = a.y;
      }
      // night: Mo's headlights light the road ahead
      if (night) { g.save(); g.globalCompositeOperation = "lighter"; g.translate(W / 2, H * .7); g.scale(1, .55);
        var hl = g.createRadialGradient(0, 0, 4, 0, 0, W * .5); hl.addColorStop(0, "rgba(255,240,190,.3)"); hl.addColorStop(.6, "rgba(255,240,190,.1)"); hl.addColorStop(1, "rgba(255,240,190,0)");
        g.fillStyle = hl; g.beginPath(); g.arc(0, 0, W * .5, 0, 7); g.fill(); g.restore(); }
      // first race: the right lane glows on the road up to the arch
      if (tutOn && gates[0] && !gates[0].done) {
        var GL = gates[0], gl = LANES[GL.good];
        g.save(); g.globalAlpha = .28 + Math.sin(tRace * 6) * .1; g.fillStyle = "#5BE38A";
        for (var m = 0; m < list.length - 1; m++) { var L1 = list[m]; if (L1.abs > GL.seg || L1.a.cz <= DEPTH || L1.b.y >= L1.a.y) continue;
          var ca = L1.a.x + L1.a.w * gl, cb = L1.b.x + L1.b.w * gl, wa = L1.a.w * .28, wb = L1.b.w * .28; poly(ca - wa, L1.a.y, ca + wa, L1.a.y, cb + wb, L1.b.y, cb - wb, L1.b.y, "#5BE38A"); }
        g.restore();
      }
      // sprites, far to near; nothing that is already behind Mo (it would cover his kart)
      var pSegAbs = Math.floor((pos + PLAYERZ) / SEG);
      for (n = list.length - 1; n > 0; n--) {
        var it = list[n], sg = it.seg, A1 = it.a; if (A1.cz <= DEPTH) continue;
        var behind = it.abs < pSegAbs;
        sg.sp.forEach(function (o) { var sp = typeof o.s === "function" ? o.s(night) : o.s; if (sp) drawSprite(sp, A1, o.x, it.clip, 0); });
        if (behind) continue;
        (ev[it.abs] || []).forEach(function (e) {
          if (e.k === "gate") drawGate(e.o, A1, it.clip);
          else if (e.k === "coin" && !e.o.got) drawSprite(coinSpr(), A1, LANES[e.o.lane], it.clip, 0, Math.abs(Math.cos(tRace * 4 + e.o.seg)) * .8 + .2, A1.s * ROADW * .1 * W / 2);
          else if (e.k === "pad") { g.globalAlpha = .75 + Math.sin(tRace * 10) * .25; drawSprite(padSpr(), A1, LANES[e.o.lane], it.clip, 0); g.globalAlpha = 1; }
          else if (e.k === "box" && !e.o.got) { var bxw = A1.s * ROADW * W / 2, bx = A1.x + A1.s * LANES[e.o.lane] * ROADW * W / 2, by2 = A1.y - bxw * (.22 + Math.sin(tRace * 3 + e.o.seg) * .03);
            if (bxw > 20 && by2 < it.clip) { var gw = g.createRadialGradient(bx, by2, 2, bx, by2, bxw * .3); gw.addColorStop(0, "rgba(255,255,255,.7)"); gw.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gw; g.beginPath(); g.arc(bx, by2, bxw * .3, 0, 7); g.fill(); }
            drawSprite(boxSpr(), A1, LANES[e.o.lane], it.clip, bxw * (.08 + Math.sin(tRace * 3 + e.o.seg) * .03)); }
          else if (e.k === "ramp") drawSprite(rampSpr(), A1, 0, it.clip, 0);
          else if (e.k === "arch") drawSprite(archSpr(e.o.kind, night), A1, 0, it.clip, 0);
        });
        riv.forEach(function (rv) {
          var rz = rv.z % LAPLEN, rabs = Math.floor(rv.z / SEG);
          if (rabs !== it.abs) return;
          var f = (rv.z % SEG) / SEG, sx = A1.x + (it.b.x - A1.x) * f, sy = A1.y + (it.b.y - A1.y) * f, ss = A1.s + (it.b.s - A1.s) * f;
          var w = ss * ROADW * .62 * W / 2, cx = sx + ss * rv.x * ROADW * W / 2;
          if (sy > it.clip + w * .3 || w < 4) return;
          drawKart(g, cx, sy, w, RIV[rv.k], { night: night, roll: tRace * 300, wob: Math.sin(tRace * 20 + rv.ph) * 2 });
          if (w > 22 && !(curGate && !curGate.done)) { var nm = rv.k === "ais" ? "Ais" : "Kak Adam", fz = Math.max(11, Math.min(16, w * .12)); g.font = "900 " + fz + "px Nunito"; var tw = g.measureText(nm).width + fz * 1.1, ty = sy - w * 1.36;
            g.fillStyle = rv.k === "ais" ? "#FF5FA2" : "#2F6BE0"; rr(g, cx - tw / 2, ty - fz * .95, tw, fz * 1.5, fz * .75); g.fill(); g.beginPath(); g.moveTo(cx - 5, ty + fz * .5); g.lineTo(cx + 5, ty + fz * .5); g.lineTo(cx, ty + fz * .5 + 6); g.fill();
            g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(nm, cx, ty - fz * .2); g.textBaseline = "alphabetic"; }
        });
      }
      // speed lines in turbo
      if (boost > 0 && !calm) { g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 2; for (var s = 0; s < 14; s++) { var ang = s * 0.45 + tRace * 3, r0 = W * (.3 + Math.random() * .2), r1 = r0 + 40 + Math.random() * 40, cx2 = W / 2, cy2 = H * .55; g.beginPath(); g.moveTo(cx2 + Math.cos(ang) * r0, cy2 + Math.sin(ang) * r0 * .6); g.lineTo(cx2 + Math.cos(ang) * r1, cy2 + Math.sin(ang) * r1 * .6); g.stroke(); } }
      // Mo's kart
      var kw = Math.min(W * .38, 230);
      if (shield > 0) { var bq = g.createRadialGradient(W / 2, H - kw * .55, kw * .2, W / 2, H - kw * .55, kw * .78); bq.addColorStop(0, "rgba(124,200,255,0)"); bq.addColorStop(.8, "rgba(124,200,255,.25)"); bq.addColorStop(1, "rgba(255,255,255,.7)"); g.fillStyle = bq; g.beginPath(); g.arc(W / 2, H - kw * .55, kw * .78 + Math.sin(tRace * 6) * 3, 0, 7); g.fill(); }
      if (magnet > 0) { g.strokeStyle = "rgba(255,212,59," + (.4 + Math.sin(tRace * 10) * .2) + ")"; g.lineWidth = 4; for (var mr = 0; mr < 2; mr++) { g.beginPath(); g.arc(W / 2, H - kw * .5, kw * (.62 + mr * .14 + (tRace * .3 % .14)), Math.PI * 1.1, Math.PI * 1.9); g.stroke(); } }
      drawKart(g, W / 2, H - 14, kw, ME, { tilt: tilt, turbo: boost > 0 || padT > 0, air: air * 120, night: night, roll: roll, wob: calm ? 0 : Math.sin(tRace * 22) * 1.2 });
    }
    function drawSprite(sp, P, offX, clip, lift, scaleX, forceW) {
      var w = forceW || (P.s * sp.ww * ROADW * W / 2), h = w * sp.h / sp.w, x = P.x + P.s * offX * ROADW * W / 2 - w / 2 * (scaleX || 1), y = P.y - h - (lift || 0);
      if (w < 2 || y > clip) return;
      var clipH = Math.max(0, y + h - clip), hh = h - clipH; if (hh <= 0) return;
      g.drawImage(sp.c, 0, 0, sp.w, sp.h * (hh / h), x, y, w * (scaleX || 1), hh);
    }
    // a letter arch: two posts, a banner, three boards hanging over the lanes; drawn into its own canvas once
    function gateSprite(G) {
      if (G.spr && G.sprState === G.done + "" + G.picked) return G.spr;
      var w = 1100, h = 560, c = G.spr ? G.spr.c : document.createElement("canvas"); c.width = w; c.height = h; var q = c.getContext("2d");
      q.clearRect(0, 0, w, h);
      var pc = ["#FF5D73", "#FFB000", "#22C06E", "#3D9BFF", "#9B6DFF"][R.w % 5];
      q.fillStyle = "#fff"; rr(q, 12, 36, 34, h - 36, 12); q.fill(); rr(q, w - 46, 36, 34, h - 36, 12); q.fill();
      q.fillStyle = pc; for (var i = 0; i < 6; i++) { q.fillRect(12, 60 + i * 80, 34, 36); q.fillRect(w - 46, 60 + i * 80, 34, 36); }
      q.fillStyle = pc; rr(q, 0, 0, w, 74, 30); q.fill(); q.fillStyle = "rgba(255,255,255,.3)"; rr(q, 20, 8, w - 40, 18, 9); q.fill();
      // speaker symbol on the banner
      q.fillStyle = "#fff"; q.beginPath(); q.moveTo(w / 2 - 30, 26); q.lineTo(w / 2 - 14, 26); q.lineTo(w / 2 + 4, 12); q.lineTo(w / 2 + 4, 62); q.lineTo(w / 2 - 14, 48); q.lineTo(w / 2 - 30, 48); q.closePath(); q.fill();
      q.strokeStyle = "#fff"; q.lineWidth = 6; q.lineCap = "round"; q.beginPath(); q.arc(w / 2 + 8, 37, 16, -.8, .8); q.stroke(); q.beginPath(); q.arc(w / 2 + 8, 37, 28, -.8, .8); q.stroke();
      for (var l = 0; l < 3; l++) {
        var cx = w / 2 + LANES[l] / 2.4 * w, bw = 300, bh = 270, by = 92, item = G.signs[l];
        var state = G.done ? (l === G.good ? "good" : l === G.picked ? "bad" : "dim") : "";
        q.strokeStyle = "#8E9BB0"; q.lineWidth = 6; q.beginPath(); q.moveTo(cx - 60, 74); q.lineTo(cx - 60, by + 10); q.moveTo(cx + 60, 74); q.lineTo(cx + 60, by + 10); q.stroke();
        q.fillStyle = state === "good" ? "#22C06E" : state === "bad" ? "#FF6B6B" : ["#FFD43B", "#7CC8FF", "#C9A7FF"][l];
        rr(q, cx - bw / 2, by, bw, bh, 36); q.fill();
        q.fillStyle = state === "dim" ? "rgba(255,255,255,.55)" : "#fff"; rr(q, cx - bw / 2 + 14, by + 14, bw - 28, bh - 28, 26); q.fill();
        q.fillStyle = "#1E2A3A"; q.textAlign = "center"; q.direction = "rtl";
        var fs = item.ar.replace(/[ً-ْ]/g, "").length > 2 ? 120 : 190; q.font = fs + "px 'Scheherazade New', serif";
        var m = q.measureText(item.ar); if (m.width > bw - 50) { fs = fs * (bw - 50) / m.width; q.font = fs + "px 'Scheherazade New', serif"; m = q.measureText(item.ar); }
        var mid = m.actualBoundingBoxAscent != null ? (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2 : fs * .3;
        q.fillText(item.ar, cx, by + bh / 2 + mid); q.direction = "ltr";
      }
      G.spr = { c: c, w: w, h: h, ww: 2.4 }; G.sprState = G.done + "" + G.picked;
      return G.spr;
    }
    function drawGate(G, P, clip) { drawSprite(gateSprite(G), P, 0, clip, 0); }

    /* ---- particles (screen space) ---- */
    var parts = [];
    function puff(x, y, n, kind) {
      if (calm && kind !== "coin") n = Math.ceil(n / 3);
      for (var i = 0; i < n; i++) {
        var a = kind === "dust" ? Math.PI + Math.random() * Math.PI : kind === "smoke" ? Math.PI / 2 + (Math.random() - .5) * 1.2 : Math.random() * Math.PI * 2, v = kind === "smoke" ? 30 + Math.random() * 30 : 120 + Math.random() * 220;
        var col = kind === "coin" ? ["#FFD43B", "#FFF3A6", "#FFB000"][i % 3] : kind === "box" ? ["#FF8FB1", "#FFD43B", "#5BE38A", "#7CC8FF", "#C9A7FF"][i % 5] : kind === "star" ? ["#FFD43B", "#FFFFFF", "#5BE38A"][i % 3] : kind === "dust" ? (TH.name === "sea" || TH.name === "beach" ? "#F3D9A0" : "#C9C2B0") : (night ? "rgba(200,200,230,.28)" : "rgba(120,120,140,.3)");
        parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (kind === "smoke" ? 0 : 60), r: kind === "smoke" ? 2.5 + Math.random() * 2.5 : 3 + Math.random() * 4, t: 0, life: kind === "smoke" ? .55 : .6 + Math.random() * .5, c: col, star: kind === "star" || kind === "box", g: kind === "smoke" ? -20 : 380, grow: kind === "smoke" });
      }
    }
    function drawParts(dt) {
      parts = parts.filter(function (p) { p.t += dt; return p.t < p.life; });
      parts.forEach(function (p) {
        var k = p.t / p.life, x = p.x + p.vx * p.t, y = p.y + p.vy * p.t + p.g * p.t * p.t * .5, r = p.r * (p.grow ? 1 + k * 1.5 : 1 - k * .4);
        g.globalAlpha = 1 - k; g.fillStyle = p.c;
        if (p.star) { g.beginPath(); for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5 + p.t * 4, rr2 = i % 2 ? r * .45 : r * 1.3; g.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } g.closePath(); g.fill(); }
        else { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
      });
      g.globalAlpha = 1;
    }
    var shake = 0;

    /* ---- the loop ---- */
    var last = 0;
    function frame(now) {
      if (my !== live || !document.body.contains(cv)) return;
      var dt = Math.min(.05, last ? (now - last) / 1000 : 0); last = now;
      if (phase === "race" || phase === "end") update(dt);
      g.save(); if (shake > 0 && !calm) { g.translate((Math.random() - .5) * 8 * shake, (Math.random() - .5) * 8 * shake); shake = Math.max(0, shake - dt * 3); }
      render(); drawParts(dt); g.restore();
      // exhaust puffs while driving
      if (phase === "race" && Math.random() < dt * (boost > 0 ? 18 : 6)) { var kw2 = Math.min(W * .38, 230); puff(W / 2 + (Math.random() < .5 ? -1 : 1) * kw2 * .13, H - 14 - kw2 * .08, 1, "smoke"); }
      requestAnimationFrame(frame);
    }
    function update(dt) {
      tRace += dt;
      var target = phase === "end" ? BASE * .5 : BASE * (boost > 0 ? 1.45 : slow > 0 ? .55 : padT > 0 ? 1.25 : 1) * (tutOn ? .32 : 1);
      speed += (target - speed) * Math.min(1, dt * (target > speed ? 2.2 : 3));
      if (boost > 0) boost -= dt; if (slow > 0) slow -= dt; if (padT > 0) padT -= dt; if (shield > 0) shield -= dt; if (magnet > 0) magnet -= dt;
      snd.speed(speed / BASE);
      pos += speed * dt; roll += speed * dt * .02;
      var seg = segs[Math.floor(pos / SEG) % N];
      skyX += seg.curve * speed * dt * .004; hillX += seg.curve * speed * dt * .012;
      // steering: glide to the lane, lean into it
      var tx = LANES[laneI]; tilt = Math.max(-.09, Math.min(.09, (tx - px) * .22)); px += (tx - px) * Math.min(1, dt * 8);
      if (air > 0 || airV) { airV -= dt * 3.2; air += airV * dt; if (air <= 0) { air = 0; airV = 0; A.fx.step(); J.buzz(15); shake = .6; puff(W / 2 - 60, H - 20, 10, "dust"); puff(W / 2 + 60, H - 20, 10, "dust"); } }
      var pAbs = pos + PLAYERZ, pSeg = Math.floor(pAbs / SEG), lane = Math.round((px + .64) / .64);
      // lap counter / last lap
      var lapNow = Math.min(laps, Math.floor(pAbs / LAPLEN) + 1);
      if (lapNow !== lastLap) { lastLap = lapNow; hud.querySelector(".r3-lap").innerHTML = esc(t("raceLap", { n: lapNow, m: laps })); if (lapNow === laps && laps > 1 && phase === "race") callText(t("raceLastLap"), "gold"); }
      // events near the player
      for (var s = pSeg - 1; s <= pSeg + 1; s++) (ev[s] || []).forEach(function (e) {
        var o = e.o;
        if (e.k === "box" && !o.got && s <= pSeg && lane === o.lane) { o.got = true; power(); puff(W / 2, H * .72, 26, "box"); }
        if (e.k === "coin" && !o.got && s <= pSeg && (lane === o.lane || magnet > 0) && air < .2) { o.got = true; coinsN++; coinEl.querySelector("b").textContent = coinsN; A.fx.coin(); puff(W / 2, H * .72, 8, "coin");
          var sb = stage.getBoundingClientRect(); J.fly({ x: sb.left + W / 2, y: sb.top + H * .72 }, coinEl.querySelector(".rt-coin"), '<i class="rt-coin"></i>'); }
        if (e.k === "pad" && !o.used && s <= pSeg && lane === o.lane) { o.used = true; padT = 1; A.fx.whoosh(); callText("Zoom!", "blue"); puff(W / 2, H * .85, 10, "smoke"); }
        if (e.k === "ramp" && !o.used && s <= pSeg) { o.used = true; airV = 1.6; air = .01; A.fx.unlock(); callText("Wheee!", "blue"); }
      });
      // gates: the sound comes as the gate gets near
      gates.forEach(function (G) {
        if (G.done) return;
        var dist = G.seg - pSeg;
        if (!G.said && dist < 210 && phase === "race") { G.said = true; curGate = G; sayGate(); if (tut && G === gates[0]) { tutOn = true; tip.classList.add("gone"); } }
        if (tutOn && G === gates[0]) { var dir = G.good - laneI; hand.className = "r3-hand on " + (dir < 0 ? "l" : dir > 0 ? "r" : "c"); hand.setAttribute("data-say", dir === 0 ? t("tutStay") : t("tutTap")); }
        if (dist <= 0) {
          G.done = true; G.picked = lane;
          if (tutOn) { tutOn = false; tut = false; hand.className = "r3-hand"; S.get().raceTut = 1; S.save(); }
          if (lane === G.good) { okN++; boost = 2.2; slow = 0; setCam("yes"); puff(W / 2, H * .6, 30, "star"); A.fx.combo(okN); J.buzz(15); callText(HJ.util.pick([t("raceTurbo"), "Masya Allah!", t("great")]), "green"); }
          else { if (shield > 0) { shield = 0; callText(t("pwSaved"), "blue"); } else { slow = 1.2; boost = 0; } setCam("oh"); A.fx.bad(); J.buzz([20, 30, 20]); if (G.q.k && S.addMiss) S.addMiss(G.q);
            callText('<small>' + esc(t("raceThis")) + '</small><span class="ar">' + esc(G.q.ar) + "</span>", "ans"); shake = .4; setTimeout(function () { if (my === live) A.say(G.q.au); }, 300); }
          setTimeout(function () { if (my === live) setCam("mo"); }, 1600);
        }
      });
      // rivals
      riv.forEach(function (rv) {
        if (!rv.fin) { rv.z += BASE * rv.pace * (1 + .07 * Math.sin(tRace * .6 + rv.ph)) * (tutOn ? .32 : 1) * dt; if (rv.z >= TOTAL) rv.fin = tRace; }
        if (Math.random() < dt * .2) {
          var near = Math.abs(rv.z - pAbs) < 30 * SEG;
          var ch = [0, 1, 2].filter(function (l) { return (!near || l !== laneI) && riv.every(function (o) { return o === rv || o.lane !== l || Math.abs(o.z - rv.z) > 25 * SEG; }); });
          if (ch.length) rv.lane = U.pick(ch);
        }
        rv.x += (LANES[rv.lane] - rv.x) * Math.min(1, dt * 2);
      });
      // place + mini track
      var place = 1 + riv.filter(function (rv) { return rv.z > pAbs; }).length;
      hud.querySelector(".r3-pos b").textContent = place;
      if (place !== lastPlace && phase === "race" && tRace - talkT > 8 && !gates.some(function (G) { return !G.done && G.seg - pSeg < 300; })) {
        var who2 = riv.filter(function (rv) { return Math.abs(rv.z - pAbs) < 40 * SEG; })[0];
        if (who2) { talkT = tRace; var nm = who2.k === "ais" ? "Ais" : "Kak Adam"; var line = place < lastPlace ? t("racePassed", { n: nm }) : t("raceCatch", { n: nm }); callText(esc(line), place < lastPlace ? "green" : "gold"); A.talk(line, lang()); }
      }
      if (place !== lastPlace) { lastPlace = place; J.bump(hud.querySelector(".r3-pos")); }
      function pc(z) { return Math.max(0, Math.min(1, (z - PLAYERZ) / (TOTAL - PLAYERZ))) * 100 + "%"; }
      heads.mo.style.left = pc(pAbs); heads.ais.style.left = pc(riv[0].z); heads.adam.style.left = pc(riv[1].z);
      if (phase === "race" && pos + PLAYERZ >= TOTAL) finish();
    }
    function sayGate() { if (curGate && !curGate.done) { spk.classList.remove("ping"); void spk.offsetWidth; spk.classList.add("ping"); snd.duck(true); A.say(curGate.q.au).then(function () { snd.duck(false); }); } }
    function power() {
      var k = U.pick(["shield", "magnet", "turbo"]); A.fx.unlock(); J.buzz(20);
      if (k === "shield") { shield = 12; callText(esc(t("pwShield")), "blue"); }
      else if (k === "magnet") { magnet = 9; callText(esc(t("pwMagnet")), "gold"); }
      else { padT = 2.4; callText("Turbo!", "green"); }
    }
    var callT = null;
    function callText(html, kind) { callout.className = "r3-call on " + (kind || ""); callout.innerHTML = html; clearTimeout(callT); callT = setTimeout(function () { callout.classList.remove("on"); }, kind === "ans" ? 2000 : 1300); }

    /* ---- controls: tap the left or right half, swipe, arrow keys ---- */
    var sx0 = null;
    stage.addEventListener("pointerdown", function (e) { A.unlock(); sx0 = e.clientX; });
    stage.addEventListener("pointerup", function (e) {
      if (phase !== "race" || sx0 == null) return;
      var d = e.clientX - sx0, b = stage.getBoundingClientRect();
      var dir = Math.abs(d) > 30 ? (d > 0 ? 1 : -1) : (e.clientX - b.left < b.width / 2 ? -1 : 1);
      var nl = Math.max(0, Math.min(2, laneI + dir)); if (nl !== laneI) { laneI = nl; A.fx.step(); } tip.classList.add("gone"); sx0 = null;
    });
    function key(e) { if (phase !== "race") return; if (e.key === "ArrowLeft") laneI = Math.max(0, laneI - 1); if (e.key === "ArrowRight") laneI = Math.min(2, laneI + 1); }
    document.addEventListener("keydown", key);
    spk.onclick = function () { A.unlock(); A.fx.tap(); sayGate(); };
    horn.onclick = function (e) { e.stopPropagation(); A.unlock(); (HORNS[hornK] || HORNS.beep)(1); J.bump(horn);
      // a rival nearby honks back
      var nb = riv.filter(function (rv) { return Math.abs(rv.z - (pos + PLAYERZ)) < 45 * SEG; })[0];
      if (nb) setTimeout(function () { if (my === live) HORNS.beep(nb.k === "ais" ? 1.3 : .8); }, 450); };
    horn.addEventListener("pointerdown", function (e) { e.stopPropagation(); }); horn.addEventListener("pointerup", function (e) { e.stopPropagation(); });
    mus.onclick = function () { var set = S.get().settings; set.raceMusic = set.raceMusic === false; S.save(); mus.classList.toggle("off", set.raceMusic === false); snd.music(set.raceMusic !== false); A.fx.tap(); };
    x.onclick = function () {
      HJ.modal(function (p, close) {
        p.appendChild(HJ._app.moImg("pose-23", "120px")); p.appendChild(el("h2", "", esc(t("quit"))));
        var r = el("div", "row"), y = el("button", "btn ghost", t("yesQuit")), n = el("button", "btn", t("keepPlaying"));
        y.onclick = function () { close(); stop(); hooks.onQuit(); }; n.onclick = close; r.appendChild(y); r.appendChild(n); p.appendChild(r);
      });
    };
    function stop() { live++; snd.stop(); document.removeEventListener("keydown", key); window.removeEventListener("resize", size); A.stop(); }

    /* ---- countdown ---- */
    var cd = el("div", "race-count", '<div class="rc-lights"><i></i><i></i><i></i></div><b class="rc-say"></b>'); stage.appendChild(cd);
    var sounds = U.shuffle(R.targets.slice()).slice(0, 3), ci2 = 0;
    A.talk(t("raceReady"), lang());
    function light() {
      if (my !== live) return;
      if (ci2 < 3) { cd.querySelectorAll("i")[ci2].classList.add("on"); var it = sounds[ci2 % sounds.length]; cd.querySelector(".rc-say").innerHTML = '<span class="ar">' + esc(it.ar) + "</span>"; A.fx.note(ci2);
        A.say(it.au).then(function () { setTimeout(light, 380); }); ci2++; return; }
      cd.querySelectorAll("i").forEach(function (i) { i.classList.add("go"); }); cd.querySelector(".rc-say").textContent = t("raceGo"); A.fx.unlock(); J.buzz(30);
      phase = "race"; setTimeout(function () { cd.classList.add("out"); }, 600); setTimeout(function () { cd.remove(); }, 1000);
    }
    setTimeout(light, 900);
    setTimeout(function () { tip.classList.add("gone"); }, 9000);
    requestAnimationFrame(frame);

    /* ---- finish ---- */
    function finish() {
      phase = "end"; finT = tRace; A.fx.win(); setCam("win");
      callText(esc(t("raceFinishT")), "gold"); puff(W / 2, H * .45, 40, "star"); puff(W * .25, H * .4, 20, "box"); puff(W * .75, H * .4, 20, "box");
      riv.forEach(function (rv) { if (!rv.fin) rv.fin = tRace + (TOTAL - rv.z) / (BASE * rv.pace); });
      var place = 1 + riv.filter(function (rv) { return rv.fin < finT; }).length;
      var order = [{ k: "mo", t: finT }].concat(riv.map(function (rv) { return { k: rv.k, t: rv.fin }; })).sort(function (a, b) { return a.t - b.t; });
      setTimeout(function () { if (my !== live) return; stop(); hooks.onFinish({ place: place, ok: okN, total: gates.length, coins: coinsN, time: finT, order: order }); }, 1800);
    }
  }

  HJ.race3d = { run: run, drawKart: drawKart, PAINT: PAINT, RIMS: RIMS, HORNS: HORNS };
})();
