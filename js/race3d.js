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
         rumble: ["#FF7AA8", "#FFFFFF"], road: [["#D9BC80", "#D2B377"], ["#5A5470", "#544E69"]], far: ["#2C8EC0", "#0A2550"], hills: ["#2FA3A0", "#0E3A4A"], deco: ["coral", "weed", "coral", "star"] },
    hill: { name: "hill", hilly: 3, sky: [["#6FC3FF", "#C8EBFF", "#F4FFF0"], ["#0E1A3E", "#22386A", "#3A5070"]], grass: [["#7EDB6A", "#6FCF5C"], ["#2D5A3E", "#285236"]],
         rumble: ["#FF9F3D", "#FFFFFF"], road: [["#7A8296", "#737B8F"], ["#3E4660", "#394058"]], far: ["#8FD48A", "#24483A"], hills: ["#5FC261", "#1C3A2C"], deco: ["windmill", "tree", "flowers", "bush", "sheep"] },
    snow: { name: "snow", snow: 1, sky: [["#A9D8FF", "#E4F3FF", "#FFFFFF"], ["#0C1638", "#1E2E5E", "#3A4A7A"]], grass: [["#F4F9FF", "#E6F0FA"], ["#5A6A90", "#52628A"]],
         rumble: ["#3D9BFF", "#FFFFFF"], road: [["#8E9AB4", "#8693AE"], ["#46506E", "#414A66"]], far: ["#C9DDF5", "#2E3E6E"], hills: ["#E8F2FC", "#4A5A84"], deco: ["snowpine", "snowman", "snowpine", "igloo", "rock"] },
    desert: { name: "desert", sky: [["#FFB86B", "#FFE0A8", "#FFF4DC"], ["#1A1238", "#40285E", "#7A3E6E"]], grass: [["#F7CF86", "#F0C474"], ["#6A4E6E", "#624668"]],
         rumble: ["#E0603A", "#FFFFFF"], road: [["#B98A62", "#B2835C"], ["#5A4660", "#54405A"]], far: ["#F2B872", "#5A3A60"], hills: ["#E8B068", "#4A3254"], deco: ["cactus", "rock", "cactus", "camel", "palm"] },
    candy: { name: "candy", sky: [["#FFB3E1", "#FFE0F2", "#FFF6FB"], ["#2A1248", "#4A2470", "#6A3A88"]], grass: [["#C9F3E0", "#B8EDD4"], ["#4A3A78", "#433470"]],
         rumble: ["#FF5FA2", "#FFFFFF"], road: [["#B9A6E8", "#B19DE2"], ["#5A4A8A", "#544484"]], far: ["#FFC4E8", "#5A3488"], hills: ["#A8E8CF", "#3E2A6E"], deco: ["lolly", "cane", "cupcake", "lolly", "gumdrop"] },
    rainbow: { name: "rainbow", rainbow: 1, sky: [["#8FD3FF", "#D6EEFF", "#FFF0FA"], ["#18204A", "#2E3270", "#4A3A7A"]], grass: [["#BDF2CF", "#AEEBC2"], ["#3A5A6E", "#345368"]],
         rumble: ["#9B6DFF", "#FFD43B"], road: [["#8C90B8", "#8589B2"], ["#46496E", "#414468"]], far: ["#C8E6FF", "#3A4A88"], hills: ["#9EE6B8", "#2E4A5A"], deco: ["rainbowsm", "balloons", "flowers", "cloudtree", "rainbowsm"] },
    space: { name: "space", space: 1, sky: [["#120C3A", "#2A1A6E", "#5A2E8A"], ["#060418", "#140C3A", "#2A1658"]], grass: [["#4A3A8A", "#433482"], ["#2A2058", "#251C50"]],
         rumble: ["#7CF3FF", "#FF5FA2"], road: [["#2E2A55", "#2A264E"], ["#1E1A40", "#1A173A"]], far: ["#6A4AB0", "#3A2A70"], hills: ["#5A3EA0", "#2E2260"], deco: ["rocket", "crystal", "rock", "crystal", "planetpole"] },
    dino: { name: "dino", volcano: 1, sky: [["#7FD8D0", "#D8F5E8", "#FFF6DC"], ["#0E2230", "#1E3A48", "#3A3A50"]], grass: [["#7FCB6E", "#72BF61"], ["#25503F", "#214836"]],
         rumble: ["#FF8A3D", "#FFFFFF"], road: [["#9A8A7A", "#938374"], ["#4A4458", "#443F52"]], far: ["#6FAF8A", "#1E3A35"], hills: ["#4FA86A", "#173029"], deco: ["dino", "fern", "palm", "egg", "fern"] }
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
    windmill: function (n) { return sprite("wmill", n, function (g, w, h, n) {
      g.fillStyle = n ? "#8A7AA0" : "#FFF3E0"; g.beginPath(); g.moveTo(w * .36, h); g.lineTo(w * .42, h * .34); g.lineTo(w * .58, h * .34); g.lineTo(w * .64, h); g.closePath(); g.fill();
      g.fillStyle = n ? "#5A4C70" : "#E05A3A"; g.beginPath(); g.moveTo(w * .38, h * .36); g.lineTo(w * .5, h * .24); g.lineTo(w * .62, h * .36); g.closePath(); g.fill();
      g.fillStyle = n ? "#3C3352" : "#8A5A3A"; rr(g, w * .45, h * .78, w * .1, h * .22, 6); g.fill();
      g.fillStyle = n ? "#C8C2E8" : "#FFFFFF"; g.strokeStyle = n ? "#6E6290" : "#B98A62"; g.lineWidth = 3;
      for (var k = 0; k < 4; k++) { g.save(); g.translate(w / 2, h * .3); g.rotate(k * Math.PI / 2 + .35); g.fillRect(-7, -h * .28, 14, h * .26); g.strokeRect(-7, -h * .28, 14, h * .26); g.restore(); }
      g.fillStyle = "#8A5A3A"; g.beginPath(); g.arc(w / 2, h * .3, 8, 0, 7); g.fill();
    }, 220, 360, .6); },
    flowers: function (n) { return sprite("flw", n, function (g, w, h, n) {
      var cols = n ? ["#C46AA0", "#E6B84A", "#9A7AE0"] : ["#FF5D73", "#FFD43B", "#FF8FB1", "#9B6DFF", "#FFFFFF"];
      for (var k = 0; k < 14; k++) { var x = 14 + (k * 37) % (w - 28), y = h - 10 - (k * 23) % (h * .5); g.strokeStyle = n ? "#2E6B58" : "#3DBB6A"; g.lineWidth = 3; g.beginPath(); g.moveTo(x, h); g.lineTo(x, y); g.stroke();
        g.fillStyle = cols[k % cols.length]; for (var a = 0; a < 5; a++) { g.beginPath(); g.arc(x + Math.cos(a * 1.26) * 6, y + Math.sin(a * 1.26) * 6, 5, 0, 7); g.fill(); } g.fillStyle = "#FFE27A"; g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); }
    }, 220, 110, .5); },
    sheep: function (n) { return sprite("sheep", n, function (g, w, h, n) {
      g.fillStyle = "#3A3F4C"; [.32, .42, .6, .7].forEach(function (x) { g.fillRect(w * x, h * .66, 8, h * .3); });
      g.fillStyle = n ? "#D6D2F0" : "#FFFFFF"; [[.5, .5, .26], [.32, .5, .17], [.68, .5, .17], [.5, .35, .17], [.4, .62, .15], [.6, .62, .15]].forEach(function (p) { g.beginPath(); g.arc(w * p[0], h * p[1], w * p[2] * .9, 0, 7); g.fill(); });
      g.fillStyle = "#3A3F4C"; g.beginPath(); g.ellipse(w * .84, h * .42, w * .1, h * .13, .3, 0, 7); g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.arc(w * .87, h * .38, 3, 0, 7); g.fill();
    }, 160, 120, .32); },
    snowpine: function (n) { return sprite("spine", n, function (g, w, h, n) {
      g.fillStyle = n ? "#5A4560" : "#8A5A3A"; g.fillRect(w * .45, h * .82, w * .1, h * .18);
      var c = n ? "#2B5A55" : "#2F8A6A";
      [[.86, .08, .92], [.62, .16, .84], [.38, .26, .74]].forEach(function (p) { g.fillStyle = c; g.beginPath(); g.moveTo(w * p[1], h * p[0]); g.lineTo(w / 2, h * (p[0] - .42)); g.lineTo(w * p[2], h * p[0]); g.closePath(); g.fill();
        g.fillStyle = n ? "#D6D2F0" : "#FFFFFF"; g.beginPath(); g.moveTo(w * (p[1] + .1), h * (p[0] - .08)); g.lineTo(w / 2, h * (p[0] - .42)); g.lineTo(w * (p[2] - .1), h * (p[0] - .08)); g.quadraticCurveTo(w / 2, h * (p[0] - .2), w * (p[1] + .1), h * (p[0] - .08)); g.fill(); });
    }, 180, 340, .48); },
    igloo: function (n) { return sprite("igloo", n, function (g, w, h, n) {
      g.fillStyle = n ? "#C8D4F0" : "#FFFFFF"; g.beginPath(); g.arc(w / 2, h, w * .44, Math.PI, 0); g.fill();
      g.strokeStyle = n ? "#9AA8D0" : "#B8D4F0"; g.lineWidth = 3; for (var r2 = 1; r2 < 4; r2++) { g.beginPath(); g.arc(w / 2, h, w * .44 * r2 / 4 + 12, Math.PI, 0); g.stroke(); }
      g.fillStyle = n ? "#3A3F5C" : "#6A84B0"; g.beginPath(); g.arc(w * .72, h, w * .12, Math.PI, 0); g.fill();
    }, 220, 120, .45); },
    cactus: function (n) { return sprite("cact", n, function (g, w, h, n) {
      g.strokeStyle = n ? "#2E6B58" : "#3DAA5C"; g.lineCap = "round"; g.lineWidth = w * .2;
      g.beginPath(); g.moveTo(w / 2, h); g.lineTo(w / 2, h * .12); g.stroke();
      g.lineWidth = w * .13; g.beginPath(); g.moveTo(w / 2, h * .55); g.lineTo(w * .2, h * .55); g.lineTo(w * .2, h * .3); g.stroke(); g.beginPath(); g.moveTo(w / 2, h * .45); g.lineTo(w * .8, h * .45); g.lineTo(w * .8, h * .22); g.stroke();
      if (!n) { g.fillStyle = "#FF8FB1"; g.beginPath(); g.arc(w / 2, h * .1, 9, 0, 7); g.fill(); }
      g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 3; g.beginPath(); g.moveTo(w * .46, h * .2); g.lineTo(w * .46, h * .9); g.stroke();
    }, 160, 300, .4); },
    camel: function (n) { return sprite("camel", n, function (g, w, h, n) {
      var c = n ? "#8A6A7A" : "#D9A066"; g.fillStyle = c; g.strokeStyle = c; g.lineCap = "round"; g.lineWidth = 12;
      [.3, .4, .62, .72].forEach(function (x) { g.beginPath(); g.moveTo(w * x, h * .55); g.lineTo(w * x, h * .98); g.stroke(); });
      g.beginPath(); g.ellipse(w * .5, h * .5, w * .28, h * .14, 0, 0, 7); g.fill();
      g.beginPath(); g.arc(w * .42, h * .38, w * .1, Math.PI, 0); g.arc(w * .6, h * .38, w * .1, Math.PI, 0); g.fill();
      g.lineWidth = 14; g.beginPath(); g.moveTo(w * .76, h * .48); g.quadraticCurveTo(w * .84, h * .3, w * .86, h * .18); g.stroke();
      g.beginPath(); g.ellipse(w * .9, h * .16, w * .07, h * .05, 0, 0, 7); g.fill(); g.fillStyle = "#2A1F3D"; g.beginPath(); g.arc(w * .91, h * .14, 3, 0, 7); g.fill();
      if (!n) { g.fillStyle = "#FF5D73"; g.fillRect(w * .4, h * .32, w * .22, h * .07); }
    }, 220, 220, .5); },
    lolly: function (n) { return sprite("lolly", n, function (g, w, h, n) {
      g.fillStyle = "#FFFFFF"; g.fillRect(w / 2 - 6, h * .4, 12, h * .6);
      var cols = n ? ["#C46AA0", "#E6B84A", "#4FA8C8"] : ["#FF5FA2", "#FFD43B", "#3D9BFF", "#22C06E"];
      for (var r2 = 6; r2 > 0; r2--) { g.fillStyle = cols[r2 % cols.length]; g.beginPath(); g.arc(w / 2, h * .28, w * .45 * r2 / 6, 0, 7); g.fill(); }
      g.fillStyle = "rgba(255,255,255,.45)"; g.beginPath(); g.ellipse(w * .36, h * .16, 10, 6, -.6, 0, 7); g.fill();
    }, 160, 280, .42); },
    cane: function (n) { return sprite("cane", n, function (g, w, h, n) {
      g.lineCap = "round"; g.lineWidth = w * .22; g.strokeStyle = n ? "#E6E0F8" : "#FFFFFF"; g.beginPath(); g.moveTo(w * .36, h); g.lineTo(w * .36, h * .3); g.arc(w * .56, h * .3, w * .2, Math.PI, 0); g.stroke();
      g.strokeStyle = n ? "#C46AA0" : "#FF3B5C"; g.lineWidth = w * .1; g.setLineDash([16, 18]); g.beginPath(); g.moveTo(w * .36, h); g.lineTo(w * .36, h * .3); g.arc(w * .56, h * .3, w * .2, Math.PI, 0); g.stroke(); g.setLineDash([]);
    }, 120, 300, .32); },
    cupcake: function (n) { return sprite("cupc", n, function (g, w, h, n) {
      g.fillStyle = n ? "#6A5A9A" : "#7CC8FF"; g.beginPath(); g.moveTo(w * .2, h * .55); g.lineTo(w * .8, h * .55); g.lineTo(w * .7, h); g.lineTo(w * .3, h); g.closePath(); g.fill();
      g.fillStyle = n ? "#E6B0D0" : "#FFB3D6"; [[.5, .38, .3], [.32, .48, .18], [.68, .48, .18], [.5, .2, .18]].forEach(function (p) { g.beginPath(); g.arc(w * p[0], h * p[1], w * p[2], 0, 7); g.fill(); });
      g.fillStyle = "#FF3B5C"; g.beginPath(); g.arc(w / 2, h * .06, w * .08, 0, 7); g.fill();
      ["#FFD43B", "#22C06E", "#3D9BFF", "#FFFFFF"].forEach(function (c2, k) { g.fillStyle = c2; g.fillRect(w * (.3 + k * .12), h * (.32 + (k % 2) * .1), 6, 3); });
    }, 160, 200, .38); },
    gumdrop: function (n) { return sprite("gum", n, function (g, w, h, n) {
      [["#FF5FA2", .25], ["#22C06E", .5], ["#FFB000", .75]].forEach(function (p) { g.fillStyle = n ? "#8A6AB0" : p[0]; g.beginPath(); g.moveTo(w * (p[1] - .14), h); g.quadraticCurveTo(w * (p[1] - .14), h * .3, w * p[1], h * .3); g.quadraticCurveTo(w * (p[1] + .14), h * .3, w * (p[1] + .14), h); g.closePath(); g.fill();
        g.fillStyle = "rgba(255,255,255,.4)"; g.beginPath(); g.arc(w * (p[1] - .04), h * .48, 5, 0, 7); g.fill(); });
    }, 200, 110, .42); },
    rainbowsm: function (n) { return sprite("rbs", n, function (g, w, h, n) {
      var cols = ["#FF5D73", "#FF9F3D", "#FFD43B", "#22C06E", "#3D9BFF", "#9B6DFF"]; g.lineWidth = 12; g.globalAlpha = n ? .6 : 1;
      cols.forEach(function (c, k) { g.strokeStyle = c; g.beginPath(); g.arc(w / 2, h, w * .44 - k * 12, Math.PI, 0); g.stroke(); });
      g.globalAlpha = 1; g.fillStyle = n ? "#C8C2E8" : "#fff"; [[.08, 1], [.92, 1]].forEach(function (p2) { g.beginPath(); g.arc(w * p2[0], h - 10, 22, 0, 7); g.arc(w * p2[0] + 18, h - 4, 16, 0, 7); g.arc(w * p2[0] - 16, h - 4, 15, 0, 7); g.fill(); });
    }, 260, 140, .62); },
    balloons: function (n) { return sprite("bln", n, function (g, w, h, n) {
      [["#FF5D73", .3, .2], ["#FFD43B", .62, .14], ["#3D9BFF", .48, .32]].forEach(function (b2) { g.strokeStyle = "rgba(0,0,0,.3)"; g.lineWidth = 2; g.beginPath(); g.moveTo(w * b2[1], h * b2[2] + 30); g.quadraticCurveTo(w * .5, h * .7, w * .5, h); g.stroke();
        g.fillStyle = n ? "#8A7AB0" : b2[0]; g.beginPath(); g.ellipse(w * b2[1], h * b2[2], 24, 30, 0, 0, 7); g.fill(); g.fillStyle = "rgba(255,255,255,.5)"; g.beginPath(); g.ellipse(w * b2[1] - 8, h * b2[2] - 10, 6, 10, 0, 0, 7); g.fill(); });
    }, 140, 260, .34); },
    cloudtree: function (n) { return sprite("ctr", n, function (g, w, h, n) {
      g.fillStyle = n ? "#6A5A8A" : "#C9A7FF"; rr(g, w * .45, h * .5, w * .1, h * .5, 6); g.fill();
      g.fillStyle = n ? "#C8C2E8" : "#FFFFFF"; [[.5, .3, .22], [.3, .4, .16], [.7, .4, .16], [.4, .2, .14], [.62, .22, .14]].forEach(function (p2) { g.beginPath(); g.arc(w * p2[0], h * p2[1], w * p2[2], 0, 7); g.fill(); });
      if (!n) { g.fillStyle = "#FF8FB1"; [[.36, .3], [.6, .36], [.5, .18]].forEach(function (p2) { g.beginPath(); g.arc(w * p2[0], h * p2[1], 6, 0, 7); g.fill(); }); }
    }, 200, 260, .5); },
    rocket: function (n) { return sprite("rkt", n, function (g, w, h, n) {
      g.fillStyle = "#FFB000"; g.beginPath(); g.moveTo(w * .4, h * .86); g.lineTo(w * .5, h); g.lineTo(w * .6, h * .86); g.fill();
      g.fillStyle = "#FF5D73"; g.beginPath(); g.moveTo(w * .3, h * .86); g.lineTo(w * .18, h * .95); g.lineTo(w * .32, h * .62); g.fill(); g.beginPath(); g.moveTo(w * .7, h * .86); g.lineTo(w * .82, h * .95); g.lineTo(w * .68, h * .62); g.fill();
      g.fillStyle = "#F4F6FF"; g.beginPath(); g.moveTo(w * .3, h * .86); g.quadraticCurveTo(w * .26, h * .3, w * .5, h * .04); g.quadraticCurveTo(w * .74, h * .3, w * .7, h * .86); g.closePath(); g.fill();
      g.fillStyle = "#FF5D73"; g.beginPath(); g.moveTo(w * .36, h * .24); g.quadraticCurveTo(w * .5, h * .02, w * .64, h * .24); g.closePath(); g.fill();
      g.fillStyle = "#3D9BFF"; g.beginPath(); g.arc(w / 2, h * .42, w * .1, 0, 7); g.fill(); g.strokeStyle = "#C9D3E3"; g.lineWidth = 5; g.stroke();
    }, 140, 300, .36); },
    crystal: function (n) { return sprite("cry", n, function (g, w, h, n) {
      [["#7CF3FF", .3, .6, .14], ["#FF8FD8", .55, .95, .16], ["#C9A7FF", .75, .55, .12], ["#7CF3FF", .45, .45, .1]].forEach(function (c2) { var x = w * c2[1], top = h * (1 - c2[2]), hw = w * c2[3];
        g.fillStyle = c2[0]; g.beginPath(); g.moveTo(x - hw, h); g.lineTo(x - hw, top + hw); g.lineTo(x, top); g.lineTo(x + hw, top + hw); g.lineTo(x + hw, h); g.closePath(); g.fill();
        g.fillStyle = "rgba(255,255,255,.45)"; g.beginPath(); g.moveTo(x - hw, h); g.lineTo(x - hw, top + hw); g.lineTo(x, top); g.lineTo(x, h); g.closePath(); g.fill(); });
    }, 180, 150, .4); },
    planetpole: function (n) { return sprite("ppl", n, function (g, w, h, n) {
      g.fillStyle = "#8E9BB0"; g.fillRect(w / 2 - 4, h * .5, 8, h * .5);
      g.fillStyle = "#FFB86B"; g.beginPath(); g.arc(w / 2, h * .32, w * .26, 0, 7); g.fill(); g.fillStyle = "#F0903A"; g.fillRect(w * .26, h * .3, w * .48, 8);
      g.strokeStyle = "#FFE27A"; g.lineWidth = 6; g.beginPath(); g.ellipse(w / 2, h * .32, w * .44, w * .1, -.3, 0, 7); g.stroke();
    }, 160, 220, .34); },
    dino: function (n) { return sprite("dino", n, function (g, w, h, n) {
      var c = n ? "#3C8F77" : "#5BC86A", d = n ? "#2E6B58" : "#3DA854";
      g.fillStyle = d; [.32, .44, .62, .74].forEach(function (x) { rr(g, w * x - 12, h * .62, 24, h * .38, 10); g.fill(); });
      g.fillStyle = c; g.beginPath(); g.ellipse(w * .52, h * .58, w * .3, h * .2, 0, 0, 7); g.fill();
      g.beginPath(); g.moveTo(w * .24, h * .6); g.quadraticCurveTo(w * .04, h * .62, w * .02, h * .5); g.quadraticCurveTo(w * .12, h * .56, w * .26, h * .52); g.fill();
      g.lineWidth = 26; g.strokeStyle = c; g.lineCap = "round"; g.beginPath(); g.moveTo(w * .72, h * .52); g.quadraticCurveTo(w * .84, h * .3, w * .82, h * .14); g.stroke();
      g.beginPath(); g.ellipse(w * .86, h * .12, w * .09, h * .07, .2, 0, 7); g.fill();
      g.fillStyle = "#fff"; g.beginPath(); g.arc(w * .88, h * .1, 7, 0, 7); g.fill(); g.fillStyle = "#2A1F3D"; g.beginPath(); g.arc(w * .89, h * .1, 4, 0, 7); g.fill();
      g.strokeStyle = "#2A1F3D"; g.lineWidth = 3; g.beginPath(); g.arc(w * .9, h * .14, 6, .2, 1.4); g.stroke();
      g.fillStyle = n ? "#C46AA0" : "#FFB000"; [.4, .5, .6].forEach(function (x) { g.beginPath(); g.moveTo(w * x - 10, h * .4); g.lineTo(w * x, h * .3); g.lineTo(w * x + 10, h * .4); g.fill(); });
      g.fillStyle = "rgba(255,255,255,.25)"; g.beginPath(); g.ellipse(w * .46, h * .5, w * .14, h * .05, 0, 0, 7); g.fill();
    }, 300, 260, .7); },
    fern: function (n) { return sprite("fern", n, function (g, w, h, n) {
      g.strokeStyle = n ? "#2E6F6A" : "#3CC377"; g.lineCap = "round";
      [[-.9, .2], [-.5, .05], [0, 0], [.5, .05], [.9, .2]].forEach(function (f2) { g.lineWidth = 10; g.beginPath(); g.moveTo(w / 2, h); g.quadraticCurveTo(w / 2 + f2[0] * w * .2, h * .4, w / 2 + f2[0] * w * .45, h * (.1 + f2[1])); g.stroke(); });
    }, 180, 150, .42); },
    egg: function (n) { return sprite("egg", n, function (g, w, h, n) {
      g.fillStyle = n ? "#6A5040" : "#C98B50"; g.beginPath(); g.ellipse(w / 2, h * .85, w * .45, h * .15, 0, 0, 7); g.fill();
      [[.35, "#FFF3E0"], [.65, "#E6F8EE"]].forEach(function (e2) { g.fillStyle = n ? "#C8C2E8" : e2[1]; g.beginPath(); g.ellipse(w * e2[0], h * .55, w * .17, h * .3, 0, 0, 7); g.fill();
        g.fillStyle = n ? "#8A7AB0" : "#7CC8FF"; [[-.05, -.1], [.05, .05], [-.03, .12]].forEach(function (d2) { g.beginPath(); g.arc(w * (e2[0] + d2[0]), h * (.55 + d2[1]), 4, 0, 7); g.fill(); }); });
    }, 120, 110, .26); },
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
  // flag bunting strung across the road on two poles
  function buntSpr(night) { return sprite("bunt", night, function (g, w, h, n) {
    g.fillStyle = "#8E9BB0"; rr(g, 6, 40, 22, h - 40, 8); g.fill(); rr(g, w - 28, 40, 22, h - 40, 8); g.fill();
    g.fillStyle = "#FFD43B"; g.beginPath(); g.arc(17, 36, 14, 0, 7); g.arc(w - 17, 36, 14, 0, 7); g.fill();
    var cols = n ? ["#C46AA0", "#E6B84A", "#4FA8C8", "#6EC08A", "#9A7AE0"] : ["#FF5D73", "#FFD43B", "#3D9BFF", "#22C06E", "#9B6DFF", "#FF9F3D"];
    for (var row = 0; row < 2; row++) {
      var y0 = 46 + row * 46, sag = 70 - row * 20; g.strokeStyle = n ? "#C8C2E8" : "#fff"; g.lineWidth = 4; g.beginPath(); g.moveTo(17, y0);
      g.quadraticCurveTo(w / 2, y0 + sag * 2, w - 17, y0); g.stroke();
      for (var i = 1; i < 22; i++) { var t2 = i / 22, x = (1 - t2) * (1 - t2) * 17 + 2 * (1 - t2) * t2 * (w / 2) + t2 * t2 * (w - 17), y = (1 - t2) * (1 - t2) * y0 + 2 * (1 - t2) * t2 * (y0 + sag * 2) + t2 * t2 * y0;
        g.fillStyle = cols[(i + row * 2) % cols.length]; g.beginPath(); g.moveTo(x - 18, y); g.lineTo(x + 18, y); g.lineTo(x, y + 36); g.closePath(); g.fill();
        g.fillStyle = "rgba(255,255,255,.3)"; g.beginPath(); g.moveTo(x - 18, y); g.lineTo(x - 2, y); g.lineTo(x - 9, y + 16); g.closePath(); g.fill(); }
    }
  }, 1100, 440, 2.5); }
  // a little grandstand full of round, cheerful fans waving flags (abstract figures, no faces of real people)
  function standSpr(night, side) { return sprite("stand" + side, night, function (g, w, h, n) {
    g.fillStyle = n ? "#4A4370" : "#E9E3F7"; g.beginPath(); g.moveTo(10, h); g.lineTo(10, h * .35); g.lineTo(w - 10, h * .2); g.lineTo(w - 10, h); g.closePath(); g.fill();
    g.fillStyle = n ? "#5C5488" : "#FF5D73"; g.fillRect(0, h * .14, w, 22); for (var s2 = 0; s2 < 10; s2++) { g.fillStyle = s2 % 2 ? (n ? "#C8C2E8" : "#fff") : (n ? "#5C5488" : "#FF5D73"); g.beginPath(); g.moveTo(s2 * w / 10, h * .14 + 22); g.lineTo((s2 + 1) * w / 10, h * .14 + 22); g.lineTo((s2 + .5) * w / 10, h * .14 + 44); g.closePath(); g.fill(); }
    var skin = ["#F2C9A0", "#E0A97E", "#C98B63", "#F7D7B5"], tops = ["#3D9BFF", "#FF8FB1", "#22C06E", "#FFB000", "#9B6DFF", "#FF6B5B"], hats = ["#FFD43B", "#7CC8FF", "#FF8FB1", null];
    for (var r2 = 0; r2 < 3; r2++) for (var i = 0; i < 8; i++) {
      var x = 30 + i * (w - 60) / 7 + (r2 % 2) * 14, y = h * (.5 + r2 * .17), k = (i * 3 + r2 * 5) % 6;
      g.fillStyle = tops[k]; rr(g, x - 16, y, 32, 34, 12); g.fill();
      g.fillStyle = skin[(i + r2) % 4]; g.beginPath(); g.arc(x, y - 6, 13, 0, 7); g.fill();
      var hc = hats[(i + r2 * 2) % 4]; if (hc) { g.fillStyle = hc; g.beginPath(); g.arc(x, y - 10, 13, Math.PI, 0); g.fill(); }
      if ((i + r2) % 3 === 0) { g.strokeStyle = "#8E9BB0"; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 14, y + 6); g.lineTo(x + 22, y - 34); g.stroke(); g.fillStyle = tops[(k + 2) % 6]; g.beginPath(); g.moveTo(x + 22, y - 34); g.lineTo(x + 46, y - 26); g.lineTo(x + 22, y - 18); g.closePath(); g.fill(); }
    }
  }, 520, 300, 1.25); }
  // a hot-air balloon carrying a letter, drifting in the sky (made once per letter)
  function skyBalloon(letter, cols) { return sprite("sb" + letter + cols[0], 0, function (g, w, h) {
    g.save(); g.beginPath(); g.ellipse(w / 2, h * .38, w * .44, h * .36, 0, 0, 7); g.clip();
    g.fillStyle = cols[0]; g.fillRect(0, 0, w, h); g.fillStyle = cols[1]; for (var i = -2; i < 3; i++) { g.beginPath(); g.ellipse(w / 2 + i * w * .2, h * .38, w * .05, h * .4, 0, 0, 7); g.fill(); }
    g.fillStyle = cols[2]; g.fillRect(0, h * .4, w, h * .14);
    var q = g.createRadialGradient(w * .35, h * .2, 4, w / 2, h * .4, w * .5); q.addColorStop(0, "rgba(255,255,255,.5)"); q.addColorStop(.5, "rgba(255,255,255,0)"); q.addColorStop(1, "rgba(0,0,0,.18)"); g.fillStyle = q; g.fillRect(0, 0, w, h);
    g.fillStyle = "#fff"; g.font = (h * .3) + "px 'Scheherazade New', serif"; g.textAlign = "center"; g.direction = "rtl"; g.lineWidth = 3; g.strokeStyle = cols[0]; g.strokeText(letter, w / 2, h * .5); g.fillText(letter, w / 2, h * .5); g.direction = "ltr";
    g.restore();
    g.strokeStyle = "#8A6346"; g.lineWidth = 2; g.beginPath(); g.moveTo(w * .36, h * .7); g.lineTo(w * .42, h * .86); g.moveTo(w * .64, h * .7); g.lineTo(w * .58, h * .86); g.stroke();
    g.fillStyle = "#C98B50"; rr(g, w * .4, h * .85, w * .2, h * .13, 4); g.fill();
  }, 90, 120, 0); }
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
    if (o.turbo) for (var i = -1; i <= 1; i += 2) { var fl = (40 + Math.random() * 30) * (o.big ? 2 : 1); var q = g.createLinearGradient(0, -40, 0, -40 + fl); q.addColorStop(0, "#FFF3A6"); q.addColorStop(.4, "#FFB000"); q.addColorStop(1, "rgba(255,80,40,0)"); g.fillStyle = q; g.beginPath(); g.ellipse(i * 40, -30 + fl / 2, 16, fl / 2, 0, 0, 7); g.fill(); }
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
    // gloves on the steering wheel, peeking out at the sides
    g.fillStyle = who.glove || "#FFFFFF"; g.beginPath(); g.arc(-82, -150, 15, 0, 7); g.arc(82, -150, 15, 0, 7); g.fill();
    g.strokeStyle = "rgba(0,0,0,.12)"; g.lineWidth = 3; g.beginPath(); g.arc(-82, -150, 15, 0, 7); g.stroke(); g.beginPath(); g.arc(82, -150, 15, 0, 7); g.stroke();
    // a whippy antenna with a little flag (Mo's has a hijaiyah letter on it)
    if (who.flag) {
      var fw = o.flap || 0;
      g.strokeStyle = "#5A6275"; g.lineWidth = 5; g.lineCap = "round"; g.beginPath(); g.moveTo(132, -176); g.quadraticCurveTo(140 + fw * 6, -290, 150 + fw * 10, -380); g.stroke();
      g.fillStyle = who.flag; g.beginPath(); g.moveTo(150 + fw * 10, -390); g.quadraticCurveTo(215, -380 + fw * 12, 262, -362 + fw * 16); g.quadraticCurveTo(215, -330 - fw * 8, 148 + fw * 9, -310); g.closePath(); g.fill();
      g.fillStyle = "rgba(255,255,255,.25)"; g.beginPath(); g.moveTo(150 + fw * 10, -390); g.quadraticCurveTo(200, -384, 240, -370); g.lineTo(150, -372); g.closePath(); g.fill();
      if (who.flagTxt) { g.fillStyle = "#fff"; g.font = "64px 'Scheherazade New', serif"; g.textAlign = "center"; g.direction = "rtl"; g.fillText(who.flagTxt, 196, -334); g.direction = "ltr"; }
    }
    g.restore();
  }

  /* ---------- sound: a soft engine hum and a cheerful loop ---------- */
  function sound() {
    var c = A.ac && A.ac(), set = S.get().settings || {};
    var none = { speed: function () {}, music: function () {}, duck: function () {}, stop: function () {}, fx: function () {}, fast: function () {} };
    if (!c || set.sfx === false) return none;
    var out = c.createGain(); out.gain.value = 1; out.connect(c.destination);
    var eo = c.createOscillator(), eo2 = c.createOscillator(), lp = c.createBiquadFilter(), eg = c.createGain();
    eo.type = "sawtooth"; eo2.type = "square"; lp.type = "lowpass"; lp.frequency.value = 380; eg.gain.value = 0;
    eo.connect(lp); eo2.connect(lp); lp.connect(eg); eg.connect(out); eo.start(); eo2.start();
    var mg = c.createGain(), musicOn = set.raceMusic !== false; mg.gain.value = musicOn ? .085 : 0; mg.connect(out);
    var step = 60 / 132 / 2, next = c.currentTime + .15, i = 0, ducked = false, fast = false;
    function note(f, t0, d, type, vol) { var o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + .012); g.gain.exponentialRampToValueAtTime(.0001, t0 + d); o.connect(g); g.connect(mg); o.start(t0); o.stop(t0 + d + .05); }
    var ROOT = [0, 5, 7, 5], MEL = [0, 4, 7, 12, 7, 4, 9, 7];
    function sched() {
      while (next < c.currentTime + .3) {
        var bar = Math.floor(i / 8) % 4, b = i % 8, f0 = 130.81 * Math.pow(2, ROOT[bar] / 12);
        note(f0 * (b % 2 ? 2 : 1), next, step * .85, "triangle", .55);                           // bouncing bass
        if (b % 2 === 0 || bar === 3) note(f0 * 4 * Math.pow(2, MEL[(b + bar * 2) % 8] / 12), next, step * .7, "square", .16);   // little tune
        if (b === 4) note(f0 * 8, next, .05, "sine", .12);                                       // a tick
        if (fast && b % 2 === 1) note(f0 * 6, next, .04, "square", .08);                          // last lap: an extra hi-hat
        i++; next += fast ? step * .84 : step;
      }
    }
    var timer = setInterval(sched, 70); sched();
    // ---- sound effects (all made here, no files) ----
    var nb = null;
    function noise() { if (nb) return nb; nb = c.createBuffer(1, c.sampleRate, c.sampleRate); var d = nb.getChannelData(0); for (var k = 0; k < d.length; k++) d[k] = Math.random() * 2 - 1; return nb; }
    function nz(t0, d, type, f0, f1, vol, q) {        // a filtered noise swoosh
      var s2 = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s2.buffer = noise(); s2.loop = true;
      f.type = type; f.Q.value = q || 1; f.frequency.setValueAtTime(f0, t0); f.frequency.exponentialRampToValueAtTime(f1, t0 + d);
      g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + d * .25); g.gain.exponentialRampToValueAtTime(.0001, t0 + d);
      s2.connect(f); f.connect(g); g.connect(out); s2.start(t0); s2.stop(t0 + d + .05);
    }
    function tn(f, t0, d, type, vol, f1) {
      var o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t0); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t0 + d);
      g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + .015); g.gain.exponentialRampToValueAtTime(.0001, t0 + d);
      o.connect(g); g.connect(out); o.start(t0); o.stop(t0 + d + .05);
    }
    var FX = {
      turbo: function (t0) { tn(60, t0, .35, "sine", .5, 38); nz(t0, 1.1, "bandpass", 300, 4200, .32, 2); tn(160, t0, .9, "sawtooth", .09, 720); tn(240, t0 + .05, .9, "square", .05, 1080);
        [0, 4, 7, 12, 16].forEach(function (n2, k) { tn(523 * Math.pow(2, n2 / 12), t0 + .1 + k * .06, .2, "triangle", .1); }); },
      pad: function (t0) { nz(t0, .6, "bandpass", 500, 3000, .25, 2); tn(220, t0, .5, "sawtooth", .06, 660); },
      wrong: function (t0) { tn(180, t0, .18, "triangle", .3, 120); tn(330, t0 + .12, .35, "sine", .14, 200); nz(t0, .4, "highpass", 2500, 1800, .05); },
      box: function (t0) { [0, 4, 7, 11, 14, 19].forEach(function (n2, k) { tn(784 * Math.pow(2, n2 / 12), t0 + k * .05, .25, "sine", .1); }); nz(t0, .5, "highpass", 6000, 9000, .04); },
      jump: function (t0) { tn(260, t0, .35, "sine", .2, 820); nz(t0, .4, "bandpass", 800, 2400, .08); },
      land: function (t0) { tn(90, t0, .25, "sine", .45, 45); nz(t0, .3, "lowpass", 900, 200, .25); },
      bump: function (t0) { tn(120, t0, .15, "square", .16, 80); nz(t0, .2, "lowpass", 1200, 300, .2); tn(900, t0 + .05, .12, "square", .04, 1400); },
      pass: function (t0) { nz(t0, .7, "bandpass", 1800, 500, .22, 3); },
      beep: function (t0) { tn(440, t0, .22, "square", .12); },
      go: function (t0) { tn(880, t0, .6, "square", .12); tn(1320, t0, .6, "sine", .06); },
      lap: function (t0) { [0, 4, 7, 12].forEach(function (n2, k) { tn(523 * Math.pow(2, n2 / 12), t0 + k * .11, .22, "square", .08); }); tn(1046, t0 + .44, .5, "triangle", .12); },
      cheer: function (t0) { nz(t0, 2.2, "bandpass", 900, 1400, .28, .7); nz(t0 + .2, 1.8, "bandpass", 1600, 2400, .14, 1.2); for (var k = 0; k < 6; k++) tn(1500 + Math.random() * 900, t0 + .3 + Math.random() * 1.2, .09, "sine", .03); },
      skid: function (t0) { nz(t0, .35, "bandpass", 3200, 2400, .06, 6); }
    };
    return {
      fx: function (n3) { try { if (FX[n3]) FX[n3](c.currentTime + .01); } catch (e) {} },
      fast: function (on) { fast = on; },
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
    var night = dark() ? 1 : 0, TH = THEME[R.th || R.w], rand = rng(R.id + "-track");
    var st = S.get(), gar = st.garage || {}, myPaint = PAINT[gar.paint] || PAINT.red, myRim = RIMS[gar.rim] || RIMS.classic;
    var ME = { paint: myPaint, rim: myRim, helmet: [myPaint[0], myPaint[1]], shirt: ["#43B85C", "#FF8A3D"], num: "1", hair: "#22252E", star: true, flag: "#22C06E", flagTxt: R.flag || ["ب", "ج", "ق", "ن"][R.w - 1] || "ب" };
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
    var hud = el("div", "r3-hud", '<div class="r3-pos"><b>1</b><small>/3</small></div><div class="r3-lap"></div><div class="r3-time">0:00</div><div class="r3-spd"><b>0</b><small>km/h</small></div>'); sc.appendChild(hud);
    // the letter chooser: when a letter is called, three big letter buttons (same order and colours as the boards) —
    // tap the letter you heard and Mo steers into that lane
    var pick = el("div", "r3-pick", '<button class="rp-say">' + HJ.ic("speaker") + " " + esc(t("racePick")) + '</button><div class="rp-row"></div>'); sc.appendChild(pick);
    pick.querySelector(".rp-say").onclick = function (e) { e.stopPropagation(); A.unlock(); sayGate(); };
    pick.querySelector(".rp-say").addEventListener("pointerdown", function (e) { e.stopPropagation(); }); pick.querySelector(".rp-say").addEventListener("pointerup", function (e) { e.stopPropagation(); });
    var pickBtns = [0, 1, 2].map(function (l) {
      var b = el("button", "rp-b l" + l, '<span class="rp-bolt"></span><span class="ar"></span>');
      b.addEventListener("pointerdown", function (e) { e.stopPropagation(); }); b.addEventListener("pointerup", function (e) { e.stopPropagation(); });
      b.onclick = function (e) { e.stopPropagation(); if (phase !== "race" || !curGate || curGate.done) return; A.unlock(); if (laneI !== l) snd.fx("pass"); laneI = l; markPick(); J.bump(b);
        A.sayNow(curGate.signs[l].au); tip.classList.add("gone"); };
      pick.querySelector(".rp-row").appendChild(b); return b; });
    var babyBtn = el("button", "r3-baby", '<span class="rb-bal"><span class="ar"></span></span><img class="rb-hand" src="assets/icons/tap-hand.svg" alt="">');
    babyBtn.setAttribute("aria-label", t("raceBabyTap")); sc.appendChild(babyBtn);
    babyBtn.addEventListener("pointerdown", function (e) { e.stopPropagation(); }); babyBtn.addEventListener("pointerup", function (e) { e.stopPropagation(); });
    babyBtn.onclick = function (e) { e.stopPropagation(); babyGo(); };
    function babyGo() {
      if (phase !== "race" || !curGate || curGate.done || curGate.tapped) return;
      A.unlock(); curGate.tapped = true; laneI = curGate.good; snd.fx("pass"); J.bump(babyBtn); babyBtn.classList.add("go"); A.sayNow(curGate.q.au);
    }
    function showPick(G) {
      if (G.baby) {
        babyBtn.querySelector(".ar").textContent = G.q.ar; babyBtn.style.setProperty("--bc", G.col);
        babyBtn.className = "r3-baby on " + ["l", "c", "r"][G.good]; return;
      }
      pickBtns.forEach(function (b, l) { b.className = "rp-b l" + l; b.querySelector(".ar").textContent = G.signs[l].ar; b.classList.toggle("w", G.signs[l].ar.replace(/[\u064B-\u0652]/g, "").length > 2); });
      markPick(); pick.classList.add("on"); tip.classList.add("gone");
    }
    function markPick() { pickBtns.forEach(function (b, l) { b.classList.toggle("me", l === laneI); }); }
    function pickResult(G) {
      if (G.baby) { babyBtn.className = "r3-baby"; return; }
      pickBtns.forEach(function (b, l) { b.classList.toggle("good", l === G.good); b.classList.toggle("bad", l === G.picked && l !== G.good); });
      setTimeout(function () { if (my === live && (!curGate || curGate.done)) pick.classList.remove("on"); }, 1100);
    }
    var cam = el("div", "r3-cam"), camImg = el("img"); camImg.alt = "Baby Mo"; cam.appendChild(camImg); sc.appendChild(cam);
    var callout = el("div", "r3-call"); sc.appendChild(callout);
    var listen = el("div", "r3-listen", '<span class="rl-ear">' + HJ.ic("speaker") + "</span><b>" + esc(t("raceListen")) + "</b>"); sc.appendChild(listen);
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
    var BABY = !!R.baby;
    var laps = BABY ? 1 : R.gp ? 3 : 2, perLap = BABY ? (R.gp ? 7 : 5) : R.gp ? 4 : 5, gap = BABY ? 440 : 520;   // a gate every 520 segments (~12 s)
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
      var hm = TH.hilly || 1;
      if (r < .3) section(15, len, 15, 0, (rand() - .5) * 40 * hm);
      else if (r < .65) section(25, len, 25, (rand() < .5 ? -1 : 1) * (2 + rand() * 3), (rand() - .5) * 30 * hm);
      else { var c = (rand() < .5 ? -1 : 1) * (2 + rand() * 2); section(20, 30, 20, c, 0); section(20, 30, 20, -c, (rand() - .5) * 20); }
    }
    // come back down to the start height and straight
    var yEnd = lastY(); for (var k = 0; k < 120; k++) addSeg(0, ease(yEnd, 0, k / 119));
    N = segs.length; var LAPLEN = N * SEG, TOTAL = laps * LAPLEN;
    // scenery on both sides
    for (k = 20; k < N; k += 30) segs[k].sp.push({ s: function (n) { return n ? lampSpr() : null; }, x: (k / 30) % 2 ? 1.2 : -1.2 });
    // festive bunting across the road now and then, grandstands of cheering fans at the start / finish straight
    for (k = 70; k < N - 60; k += 150) segs[k].sp.push({ s: function (n) { return buntSpr(n); }, x: 0, over: 1 });
    [6, 26, 46, N - 34, N - 14].forEach(function (kk, j) { if (segs[kk]) segs[kk].sp.push({ s: function (n) { return standSpr(n, j % 2); }, x: j % 2 ? 1.75 : -1.75, fans: 1 }); });
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
        var gs = L * N + 120 + gi * gap, q = targets[L * perLap + gi], opts = BABY ? [q, q] : distract(q), lanes = U.shuffle([0, 1, 2]), signs = [];
        signs[lanes[0]] = q; signs[lanes[1]] = opts[0]; signs[lanes[2]] = opts[1];
        var G = { seg: gs, q: q, signs: signs, good: lanes[0], said: false, done: false, picked: -1, spr: null, baby: BABY, col: ["#FF5D73", "#FFB000", "#22C06E", "#3D9BFF", "#9B6DFF", "#FF5FA2"][(L * perLap + gi) % 6] };
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
      if (R.vmix && q.k) {
        var alts = U.shuffle(R.vmix.filter(function (v) { return v !== q.v; }).map(function (v) { return HJ.syl(q.k, v); }).filter(function (x) { return x.ar !== q.ar && A.hasClip(x.ar); }));
        if (alts.length >= 2) return [alts[0], alts[1]];
      }
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
      { k: "ais", z: PLAYERZ + 4 * SEG, lane: 0, x: LANES[0], pace: BABY ? .8 : .985, ph: 1.1, fin: 0 },
      { k: "adam", z: PLAYERZ + 6 * SEG, lane: 2, x: LANES[2], pace: BABY ? .84 : 1.02, ph: .2, fin: 0 }
    ];
    HJ._race = { gates: gates, setLane: function (l) { laneI = l; }, phase: function () { return phase; }, pos: function () { return pos; }, total: TOTAL, coins: coins,
      // for tests: put Mo (and the rivals beside him) just before a spot on the track
      warp: function (seg, near) { pos = Math.max(0, seg * SEG - PLAYERZ); riv.forEach(function (rv, i) { rv.z = pos + PLAYERZ + (near ? 3 + i * 3 : 6 + i * 9) * SEG; if (near) { rv.lane = rv.x = 0; rv.lane = i ? 2 : 0; rv.x = LANES[rv.lane]; } }); },
      ev: ev, ramps: ramps, pads: pads, lane: function () { return laneI; }, seg: function () { return Math.floor((pos + PLAYERZ) / SEG); } };

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
      if (TH.space) {
        g.fillStyle = "#FFB86B"; g.beginPath(); g.arc(sx, sy + 10, 38, 0, 7); g.fill(); g.fillStyle = "#F0903A"; g.fillRect(sx - 36, sy + 2, 72, 8); g.fillRect(sx - 30, sy + 18, 60, 6);
        g.strokeStyle = "#FFE27A"; g.lineWidth = 6; g.beginPath(); g.ellipse(sx, sy + 10, 66, 14, -.25, 0, 7); g.stroke();
        g.fillStyle = "#7CC8FF"; g.beginPath(); g.arc(W * .18 - skyX * .1 % W, H * .1, 14, 0, 7); g.fill(); g.fillStyle = "rgba(255,255,255,.4)"; g.beginPath(); g.arc(W * .18 - 4 - skyX * .1 % W, H * .1 - 4, 5, 0, 7); g.fill();
      } else if (TH.name !== "sea") { g.fillStyle = night ? "rgba(220,215,255,.25)" : "rgba(255,240,170,.5)"; g.beginPath(); g.arc(sx, sy, 46, 0, 7); g.fill(); g.fillStyle = night ? "#F4F1FF" : "#FFD43B"; g.beginPath(); g.arc(sx, sy, 26, 0, 7); g.fill();
        if (night) { g.fillStyle = SK[0]; g.beginPath(); g.arc(sx + 10, sy - 8, 23, 0, 7); g.fill(); } }
      else { g.fillStyle = "rgba(255,255,255,.18)"; for (var r = 0; r < 5; r++) { g.beginPath(); g.moveTo(W * (.1 + r * .2) - skyX * .1 % 80, 0); g.lineTo(W * (.18 + r * .2) - skyX * .1 % 80, 0); g.lineTo(W * (.3 + r * .2), H * .5); g.lineTo(W * (.2 + r * .2), H * .5); g.closePath(); g.fill(); } }
      if (night || TH.space) { g.fillStyle = "rgba(255,246,200,.85)"; for (var s = 0; s < (TH.space ? 70 : 40); s++) { var xx = ((s * 97.3 - skyX * .3) % W + W) % W, yy = (s * 53.7) % (H * .4); g.fillRect(xx, yy, 1.8, 1.8); } }
      // clouds (or bubbles under the sea)
      for (var c = 0; c < 5; c++) {
        var cx = ((c * 211 - skyX * .5 - tRace * 6) % (W + 240) + W + 240) % (W + 240) - 120, cy = H * (.08 + (c % 3) * .07);
        if (TH.name === "sea") { g.fillStyle = "rgba(255,255,255,.35)"; for (var b = 0; b < 3; b++) { g.beginPath(); g.arc(cx + b * 14, ((cy - tRace * 30 * (1 + b * .2)) % (H * .5) + H * .5) % (H * .5), 4 + b * 2, 0, 7); g.fill(); } }
        else if (!TH.space) { g.fillStyle = night ? "rgba(110,110,180,.4)" : "rgba(255,255,255,.92)"; g.beginPath(); g.ellipse(cx, cy, 44, 14, 0, 0, 7); g.arc(cx - 16, cy - 6, 16, 0, 7); g.arc(cx + 12, cy - 12, 20, 0, 7); g.fill(); }
      }
      // letter balloons drifting high up (letters from this race), birds flapping by (fish under the sea)
      if (TH.name !== "sea") for (var bi = 0; bi < 3; bi++) {
        var BC = [["#FF6B81", "#FFD1D9", "#FFB000"], ["#2EC4B6", "#D4F7F2", "#FF8FA3"], ["#FFB000", "#FFF0C2", "#8B63F0"]][bi];
        var sp2 = skyBalloon(R.targets[bi % R.targets.length].ar, BC), sc2 = (.55 + bi * .18) * Math.min(1, W / 400);
        var bx = ((bi * (W + 160) / 3 + 40 - skyX * (.15 + bi * .05) - tRace * (3 + bi * 2)) % (W + 160) + W + 160) % (W + 160) - 80, by = H * (.12 + bi * .09) + Math.sin(tRace * .8 + bi * 2) * 6;
        g.globalAlpha = night ? .75 : 1; g.drawImage(sp2.c, bx, by, sp2.w * sc2, sp2.h * sc2); g.globalAlpha = 1;
      }
      for (var bd = 0; bd < 4; bd++) {
        var fx = ((bd * 133 - tRace * (28 + bd * 6) - skyX * .4) % (W + 100) + W + 100) % (W + 100) - 50, fy = H * (.22 + (bd % 2) * .08) + Math.sin(tRace * 2 + bd) * 8;
        if (TH.name === "sea") {
          g.fillStyle = ["#FFB000", "#FF7AA8", "#7CC8FF", "#5BE38A"][bd]; g.beginPath(); g.ellipse(fx, fy, 14, 8, 0, 0, 7); g.fill();
          g.beginPath(); g.moveTo(fx + 12, fy); g.lineTo(fx + 24, fy - 8); g.lineTo(fx + 24, fy + 8); g.closePath(); g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.arc(fx - 7, fy - 2, 2.5, 0, 7); g.fill();
        } else if (!night || bd < 2) {
          var fl = Math.sin(tRace * 12 + bd * 1.7) * 6; g.strokeStyle = night ? "rgba(220,215,255,.7)" : "#5A6275"; g.lineWidth = 2.4; g.lineCap = "round";
          g.beginPath(); g.moveTo(fx - 10, fy - fl); g.quadraticCurveTo(fx - 5, fy - 4, fx, fy); g.quadraticCurveTo(fx + 5, fy - 4, fx + 10, fy - fl); g.stroke();
        }
      }
      if (TH.rainbow) {     // a big rainbow over the whole world
        var rx = W / 2 - skyX * .08, ry = H * .5; g.lineWidth = Math.max(10, W * .028); g.globalAlpha = night ? .45 : .8;
        ["#FF5D73", "#FF9F3D", "#FFD43B", "#22C06E", "#3D9BFF", "#9B6DFF"].forEach(function (c3, k3) { g.strokeStyle = c3; g.beginPath(); g.arc(rx, ry, W * .62 - k3 * g.lineWidth, Math.PI, 0); g.stroke(); });
        g.globalAlpha = 1;
      }
      if (TH.volcano) {     // a friendly volcano puffing smoke
        var vx = W * .3 - skyX * .12, vy = H * .5;
        g.fillStyle = night ? "#3A2E44" : "#8A6A5A"; g.beginPath(); g.moveTo(vx - 120, vy); g.lineTo(vx - 26, vy - H * .2); g.lineTo(vx + 26, vy - H * .2); g.lineTo(vx + 120, vy); g.closePath(); g.fill();
        g.fillStyle = "#FF7A3D"; g.beginPath(); g.moveTo(vx - 26, vy - H * .2); g.lineTo(vx + 26, vy - H * .2); g.lineTo(vx + 14, vy - H * .16); g.lineTo(vx, vy - H * .18); g.lineTo(vx - 12, vy - H * .15); g.closePath(); g.fill();
        g.fillStyle = night ? "rgba(160,150,190,.5)" : "rgba(255,255,255,.75)";
        for (var sm = 0; sm < 4; sm++) { var k4 = (tRace * .25 + sm / 4) % 1; g.beginPath(); g.arc(vx + Math.sin(k4 * 6 + sm) * 10, vy - H * .2 - k4 * H * .16, 10 + k4 * 22, 0, 7); g.fill(); }
      }
      // far layer (mountains / sea line) and near hills, both slide with the curves
      var hz = H * .5;
      g.fillStyle = TH.far[night]; g.beginPath(); g.moveTo(0, hz);
      for (var x = 0; x <= W + 30; x += 30) { var u = (x + hillX * .3) / 120, h = TH.name === "mountain" || TH.name === "snow" ? Math.abs(((u % 2) + 2) % 2 - 1) * H * .2 + H * .03 : TH.name === "desert" ? (Math.sin(u * .6) * .5 + .5) * H * .09 + H * .02 : TH.name === "hill" ? (Math.sin(u * .8) * .5 + .5) * H * .1 + H * .03 : TH.name === "beach" ? H * .015 : (Math.sin(u) * .5 + .5) * H * .06 + H * .02; g.lineTo(x, hz - h); }
      g.lineTo(W, hz); g.closePath(); g.fill();
      if ((TH.name === "mountain" || TH.name === "snow") && !night) { g.fillStyle = "rgba(255,255,255,.8)"; for (x = -240; x <= W + 240; x += 240) { var u2 = x - ((hillX * .3) % 240); g.beginPath(); g.moveTo(u2 - 26, hz - H * .17); g.lineTo(u2, hz - H * .23); g.lineTo(u2 + 26, hz - H * .17); g.closePath(); g.fill(); } }
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
        sg.sp.forEach(function (o) {
          var sp = typeof o.s === "function" ? o.s(night) : o.s; if (!sp || (o.over && behind)) return;
          var lift = o.fans && !calm ? Math.abs(Math.sin(tRace * 7 + sg.i)) * A1.s * ROADW * W / 2 * .04 : 0;
          drawSprite(sp, A1, o.x, it.clip, lift);
        });
        if (behind) continue;
        (ev[it.abs] || []).forEach(function (e) {
          if (e.k === "gate") { if (e.o.baby) drawBalloon(e.o, A1, it.clip); else drawGate(e.o, A1, it.clip); }
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
      if ((boost > 0 || padT > 0) && !calm) { g.lineWidth = 3; for (var s = 0; s < 26; s++) { g.strokeStyle = s % 4 ? "rgba(255,255,255,.6)" : ["rgba(255,212,59,.8)", "rgba(124,200,255,.8)", "rgba(255,143,177,.8)"][s % 3]; var ang = s * 0.45 + tRace * 3, r0 = W * (.3 + Math.random() * .2), r1 = r0 + 40 + Math.random() * 40, cx2 = W / 2, cy2 = H * .55; g.beginPath(); g.moveTo(cx2 + Math.cos(ang) * r0, cy2 + Math.sin(ang) * r0 * .6); g.lineTo(cx2 + Math.cos(ang) * r1, cy2 + Math.sin(ang) * r1 * .6); g.stroke(); } }
      // Mo's kart
      var kw = Math.min(W * .38, 230);
      if (shield > 0) { var bq = g.createRadialGradient(W / 2, H - kw * .55, kw * .2, W / 2, H - kw * .55, kw * .78); bq.addColorStop(0, "rgba(124,200,255,0)"); bq.addColorStop(.8, "rgba(124,200,255,.25)"); bq.addColorStop(1, "rgba(255,255,255,.7)"); g.fillStyle = bq; g.beginPath(); g.arc(W / 2, H - kw * .55, kw * .78 + Math.sin(tRace * 6) * 3, 0, 7); g.fill(); }
      if (magnet > 0) { g.strokeStyle = "rgba(255,212,59," + (.4 + Math.sin(tRace * 10) * .2) + ")"; g.lineWidth = 4; for (var mr = 0; mr < 2; mr++) { g.beginPath(); g.arc(W / 2, H - kw * .5, kw * (.62 + mr * .14 + (tRace * .3 % .14)), Math.PI * 1.1, Math.PI * 1.9); g.stroke(); } }
      drawKart(g, W / 2, H - 14, kw, ME, { flap: Math.sin(tRace * 14) * (speed / BASE), tilt: tilt, turbo: boost > 0 || padT > 0, big: boost > 0, air: air * 120, night: night, roll: roll, wob: calm ? 0 : Math.sin(tRace * 22) * 1.2 });
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
      var pc = { hill: "#FF9F3D", snow: "#3D9BFF", desert: "#E0603A", candy: "#FF5FA2" }[R.th] || ["#FF5D73", "#FFB000", "#22C06E", "#3D9BFF", "#9B6DFF"][R.w % 5];
      q.fillStyle = "#fff"; rr(q, 12, 36, 34, h - 36, 12); q.fill(); rr(q, w - 46, 36, 34, h - 36, 12); q.fill();
      q.fillStyle = pc; for (var i = 0; i < 6; i++) { q.fillRect(12, 60 + i * 80, 34, 36); q.fillRect(w - 46, 60 + i * 80, 34, 36); }
      q.fillStyle = pc; rr(q, 0, 0, w, 74, 30); q.fill(); q.fillStyle = "rgba(255,255,255,.3)"; rr(q, 20, 8, w - 40, 18, 9); q.fill();
      // speaker symbol on the banner
      q.fillStyle = "#fff"; q.beginPath(); q.moveTo(w / 2 - 30, 26); q.lineTo(w / 2 - 14, 26); q.lineTo(w / 2 + 4, 12); q.lineTo(w / 2 + 4, 62); q.lineTo(w / 2 - 14, 48); q.lineTo(w / 2 - 30, 48); q.closePath(); q.fill();
      q.strokeStyle = "#fff"; q.lineWidth = 6; q.lineCap = "round"; q.beginPath(); q.arc(w / 2 + 8, 37, 16, -.8, .8); q.stroke(); q.beginPath(); q.arc(w / 2 + 8, 37, 28, -.8, .8); q.stroke();
      // hangers for the three boards (the boards themselves are drawn on their own, so they can swing)
      for (var l = 0; l < 3; l++) { var hx = w / 2 + LANES[l] / 2.4 * w; q.strokeStyle = "#8E9BB0"; q.lineWidth = 6; q.beginPath(); q.moveTo(hx - 60, 74); q.lineTo(hx - 60, 104); q.moveTo(hx + 60, 74); q.lineTo(hx + 60, 104); q.stroke(); }
      G.spr = { c: c, w: w, h: h, ww: 2.4 }; G.sprState = G.done + "" + G.picked;
      return G.spr;
    }
    // one letter board: a chunky toy sign with a coloured rim and lip, the letter big and bold in a deep colour
    var BOARD = [["#FFD43B", "#E0A800", "#B8410E"], ["#7CC8FF", "#3D8FE0", "#173F8C"], ["#C9A7FF", "#8B63F0", "#4B2A9E"]];
    function boardSprite(G, l) {
      G.bspr = G.bspr || []; var st = G.done ? (l === G.good ? "good" : l === G.picked ? "bad" : "dim") : "";
      if (G.bspr[l] && G.bspr[l].st === st) return G.bspr[l];
      var w = 320, h = 320, c = document.createElement("canvas"); c.width = w; c.height = h; var q = c.getContext("2d");
      var C = st === "good" ? ["#5BE38A", "#17A35B", "#0B6B3A"] : st === "bad" ? ["#FF8A8A", "#D93A3A", "#8A1A1A"] : BOARD[l];
      q.globalAlpha = st === "dim" ? .55 : 1;
      q.fillStyle = "rgba(0,0,0,.18)"; rr(q, 16, 30, w - 32, h - 40, 44); q.fill();                 // shadow
      q.fillStyle = C[1]; rr(q, 10, 22, w - 20, h - 34, 44); q.fill();                                // lip
      q.fillStyle = C[0]; rr(q, 10, 6, w - 20, h - 40, 44); q.fill();                                  // rim
      q.fillStyle = "#fff"; rr(q, 28, 24, w - 56, h - 76, 32); q.fill();                               // face
      q.fillStyle = "rgba(255,255,255,.55)"; rr(q, 30, 12, w - 120, 10, 5); q.fill();                  // shine
      var item = G.signs[l], fs = item.ar.replace(/[\u064B-\u0652]/g, "").length > 2 ? 120 : 196;
      q.direction = "rtl"; q.textAlign = "center"; q.font = fs + "px 'Scheherazade New', serif";
      var m = q.measureText(item.ar); if (m.width > w - 90) { fs = fs * (w - 90) / m.width; q.font = fs + "px 'Scheherazade New', serif"; m = q.measureText(item.ar); }
      var mid = m.actualBoundingBoxAscent != null ? (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2 : fs * .3, cy = 24 + (h - 76) / 2 + mid;
      q.lineJoin = "round"; q.strokeStyle = C[2]; q.lineWidth = 7; q.strokeText(item.ar, w / 2, cy);       // bold: a stroke in the same deep colour
      q.fillStyle = C[2]; q.fillText(item.ar, w / 2, cy); q.direction = "ltr";
      if (!st) {            // the lightning badge: driving through the right letter gives a turbo
        q.fillStyle = "#FF8A00"; q.beginPath(); q.arc(44, 40, 30, 0, 7); q.fill(); q.strokeStyle = "#fff"; q.lineWidth = 5; q.stroke();
        q.fillStyle = "#FFF3A6"; q.beginPath(); q.moveTo(49, 18); q.lineTo(32, 44); q.lineTo(45, 44); q.lineTo(38, 62); q.lineTo(57, 34); q.lineTo(44, 34); q.closePath(); q.fill();
      }
      if (st === "good") { q.fillStyle = "#17A35B"; q.beginPath(); q.arc(w - 40, 40, 30, 0, 7); q.fill(); q.strokeStyle = "#fff"; q.lineWidth = 9; q.lineCap = "round"; q.beginPath(); q.moveTo(w - 54, 40); q.lineTo(w - 44, 52); q.lineTo(w - 26, 28); q.stroke(); }
      return (G.bspr[l] = { c: c, w: w, h: h, ww: 2.4 * w / 1100, st: st });
    }
    // toddler mode: one big shiny balloon carrying the letter, floating over its lane
    function balloonSprite(G) {
      if (G.bal) return G.bal;
      var w = 300, h = 470, c = document.createElement("canvas"); c.width = w; c.height = h; var q = c.getContext("2d");
      q.strokeStyle = "rgba(60,60,80,.55)"; q.lineWidth = 4; q.beginPath(); q.moveTo(w / 2, 330); q.bezierCurveTo(w / 2 - 30, 380, w / 2 + 30, 420, w / 2, h); q.stroke();
      q.fillStyle = G.col; q.beginPath(); q.moveTo(w / 2 - 14, 330); q.lineTo(w / 2 + 14, 330); q.lineTo(w / 2, 312); q.closePath(); q.fill();
      var gr = q.createRadialGradient(w * .38, 110, 10, w / 2, 170, 170); gr.addColorStop(0, "#fff"); gr.addColorStop(.18, G.col); gr.addColorStop(1, G.col);
      q.fillStyle = gr; q.beginPath(); q.ellipse(w / 2, 170, 140, 160, 0, 0, 7); q.fill();
      q.fillStyle = "rgba(0,0,0,.12)"; q.beginPath(); q.ellipse(w / 2 + 30, 200, 100, 120, 0, 0, 7); q.globalCompositeOperation = "source-atop"; q.fill(); q.globalCompositeOperation = "source-over";
      q.fillStyle = "rgba(255,255,255,.7)"; q.beginPath(); q.ellipse(w * .32, 90, 26, 40, -.5, 0, 7); q.fill();
      var fs = G.q.ar.replace(/[\u064B-\u0652]/g, "").length > 2 ? 90 : 150;
      q.font = fs + "px 'Scheherazade New', serif"; q.textAlign = "center"; q.direction = "rtl";
      var m = q.measureText(G.q.ar), mid = m.actualBoundingBoxAscent != null ? (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2 : fs * .3;
      // the letter printed on the balloon: white with a deep outline in the balloon's own colour and a soft shadow
      q.lineJoin = "round"; q.save(); q.shadowColor = "rgba(0,0,0,.25)"; q.shadowOffsetY = 5; q.shadowBlur = 6;
      q.strokeStyle = "rgba(0,0,0,.28)"; q.lineWidth = 16; q.strokeText(G.q.ar, w / 2, 180 + mid); q.restore();
      var dk = "#" + G.col.slice(1).match(/../g).map(function (h2) { var v = Math.round(parseInt(h2, 16) * .62); return (v < 16 ? "0" : "") + v.toString(16); }).join("");
      q.strokeStyle = dk; q.lineWidth = 16; q.strokeText(G.q.ar, w / 2, 180 + mid);
      q.fillStyle = "#fff"; q.fillText(G.q.ar, w / 2, 180 + mid); q.direction = "ltr";
      return (G.bal = { c: c, w: w, h: h, ww: .9 });
    }
    function drawBalloon(G, P, clip) {
      if (G.done) return;
      var sp = balloonSprite(G), bw2 = P.s * sp.ww * ROADW * W / 2, bob = calm ? 0 : Math.sin(tRace * 3 + G.seg) * .04;
      // a ring of light on the road under it
      var gx = P.x + P.s * LANES[G.good] * ROADW * W / 2, gy = P.y;
      if (bw2 > 12 && gy < clip + 4) { g.save(); g.globalAlpha = .45 + Math.sin(tRace * 8) * .15; g.fillStyle = "#FFE27A"; g.beginPath(); g.ellipse(gx, gy - 2, bw2 * .5, bw2 * .12, 0, 0, 7); g.fill(); g.restore(); }
      drawSprite(sp, P, LANES[G.good], clip, bw2 * (.25 + bob));
    }
    function drawGate(G, P, clip) {
      var gs = gateSprite(G); drawSprite(gs, P, 0, clip, 0);
      var gw = P.s * gs.ww * ROADW * W / 2, gh = gw * gs.h / gs.w;
      for (var l = 0; l < 3; l++) {
        // each board swings a little on its own; while the letter is being called they all bounce
        var callNow = curGate === G && !G.done && listen.classList.contains("on");
        var bob = calm ? 0 : Math.sin(tRace * 3 + l * 2.1) * .012 + (callNow ? Math.abs(Math.sin(tRace * 9 + l)) * .03 : 0);
        if (callNow && gw > 30) {           // a soft pulsing glow behind each board while the letter is called
          var bx2 = P.x + P.s * LANES[l] * ROADW * W / 2, by3 = P.y - gh * ((560 - 104 - 150) / 560 + bob), rg2 = gw * .16 * (1 + Math.sin(tRace * 8) * .12);
          if (by3 < clip) { var gl2 = g.createRadialGradient(bx2, by3, 2, bx2, by3, rg2); gl2.addColorStop(0, "rgba(255,240,150,.85)"); gl2.addColorStop(1, "rgba(255,240,150,0)"); g.fillStyle = gl2; g.beginPath(); g.arc(bx2, by3, rg2, 0, 7); g.fill(); }
        }
        drawSprite(boardSprite(G, l), P, LANES[l], clip, gh * ((560 - 104 - 300) / 560 + bob));
      }
    }

    /* ---- particles (screen space) ---- */
    var parts = [];
    function puff(x, y, n, kind) {
      if (calm && kind !== "coin") n = Math.ceil(n / 3);
      for (var i = 0; i < n; i++) {
        var a = kind === "dust" ? Math.PI + Math.random() * Math.PI : kind === "smoke" ? Math.PI / 2 + (Math.random() - .5) * 1.2 : Math.random() * Math.PI * 2, v = kind === "smoke" ? 30 + Math.random() * 30 : 120 + Math.random() * 220;
        var col = kind === "spark" ? ["#FFE27A", "#FFB000", "#FFFFFF"][i % 3] : kind === "coin" ? ["#FFD43B", "#FFF3A6", "#FFB000"][i % 3] : kind === "box" ? ["#FF8FB1", "#FFD43B", "#5BE38A", "#7CC8FF", "#C9A7FF"][i % 5] : kind === "star" ? ["#FFD43B", "#FFFFFF", "#5BE38A"][i % 3] : kind === "dust" ? (TH.name === "sea" || TH.name === "beach" ? "#F3D9A0" : "#C9C2B0") : (night ? "rgba(200,200,230,.28)" : "rgba(120,120,140,.3)");
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
      g.save();
      if (kickT > 0 && !calm) { var kz = 1 + Math.sin(kickT / .6 * Math.PI) * .06; g.translate(W / 2, H * .6); g.scale(kz, kz); g.translate(-W / 2, -H * .6); kickT -= dt; }
      if (shake > 0 && !calm) { g.translate((Math.random() - .5) * 8 * shake, (Math.random() - .5) * 8 * shake); shake = Math.max(0, shake - dt * 3); }
      render(); drawParts(dt); g.restore();
      if (TH.snow && !calm) {        // falling snow
        g.fillStyle = "rgba(255,255,255,.85)";
        for (var sf = 0; sf < 60; sf++) { var fx2 = ((sf * 73.1 + Math.sin(tRace + sf) * 20 - skyX * .6) % W + W) % W, fy2 = ((sf * 41.7 + tRace * (40 + sf % 5 * 12)) % H); g.beginPath(); g.arc(fx2, fy2, 1.5 + sf % 3, 0, 7); g.fill(); }
      }
      if (flashT > 0) { g.fillStyle = "rgba(255,240,170," + Math.min(.55, flashT * 1.2).toFixed(3) + ")"; g.fillRect(0, 0, W, H); flashT -= dt; }
      if (boost > 0 && !calm) {             // a warm glow round the edges while the turbo lasts
        var vg = g.createRadialGradient(W / 2, H * .6, Math.min(W, H) * .35, W / 2, H * .6, Math.max(W, H) * .75); vg.addColorStop(0, "rgba(255,180,0,0)"); vg.addColorStop(1, "rgba(255,140,0," + Math.min(.35, boost * .15).toFixed(3) + ")");
        g.fillStyle = vg; g.fillRect(0, 0, W, H);
        if (Math.random() < dt * 30) puff(W / 2 + (Math.random() - .5) * 60, H - 30, 2, "spark");
      }
      // exhaust puffs while driving
      if (phase === "race" && Math.random() < dt * (boost > 0 ? 18 : 6)) { var kw2 = Math.min(W * .38, 230); puff(W / 2 + (Math.random() < .5 ? -1 : 1) * kw2 * .13, H - 14 - kw2 * .08, 1, "smoke"); }
      requestAnimationFrame(frame);
    }
    function update(dt) {
      tRace += dt;
      var target = phase === "end" ? BASE * .5 : BASE * (boost > 0 ? 1.6 : slow > 0 ? .55 : padT > 0 ? 1.3 : 1) * (tutOn ? .32 : 1);
      speed += (target - speed) * Math.min(1, dt * (target > speed ? 2.2 : 3));
      if (boost > 0) boost -= dt; if (slow > 0) slow -= dt; if (padT > 0) padT -= dt; if (shield > 0) shield -= dt; if (magnet > 0) magnet -= dt;
      snd.speed(speed / BASE);
      pos += speed * dt; roll += speed * dt * .02;
      var seg = segs[Math.floor(pos / SEG) % N];
      skyX += seg.curve * speed * dt * .004; hillX += seg.curve * speed * dt * .012;
      // steering: glide to the lane, lean into it
      var tx = LANES[laneI]; tilt = Math.max(-.09, Math.min(.09, (tx - px) * .22)); px += (tx - px) * Math.min(1, dt * 8);
      if (air > 0 || airV) { airV -= dt * 3.2; air += airV * dt; if (air <= 0) { air = 0; airV = 0; snd.fx("land"); J.buzz(15); shake = .6; puff(W / 2 - 60, H - 20, 10, "dust"); puff(W / 2 + 60, H - 20, 10, "dust"); } }
      var pAbs = pos + PLAYERZ, pSeg = Math.floor(pAbs / SEG), lane = Math.round((px + .64) / .64);
      // lap counter / last lap
      var lapNow = Math.min(laps, Math.floor(pAbs / LAPLEN) + 1);
      if (lapNow !== lastLap) { if (lastLap && phase === "race") { snd.fx("lap"); if (lapNow === laps) snd.fast(true); } lastLap = lapNow; hud.querySelector(".r3-lap").innerHTML = esc(t("raceLap", { n: lapNow, m: laps })); if (lapNow === laps && laps > 1 && phase === "race") callText(t("raceLastLap"), "gold"); }
      // events near the player
      for (var s = pSeg - 1; s <= pSeg + 1; s++) (ev[s] || []).forEach(function (e) {
        var o = e.o;
        if (e.k === "box" && !o.got && s <= pSeg && lane === o.lane) { o.got = true; power(); puff(W / 2, H * .72, 26, "box"); snd.fx("box"); }
        if (e.k === "coin" && !o.got && s <= pSeg && (lane === o.lane || magnet > 0) && air < .2) { o.got = true; coinsN++; coinEl.querySelector("b").textContent = coinsN; A.fx.coin(); puff(W / 2, H * .72, 8, "coin");
          var sb = stage.getBoundingClientRect(); J.fly({ x: sb.left + W / 2, y: sb.top + H * .72 }, coinEl.querySelector(".rt-coin"), '<i class="rt-coin"></i>'); }
        if (e.k === "pad" && !o.used && s <= pSeg && lane === o.lane) { o.used = true; padT = 1.2; snd.fx("pad"); callText("Zoom!", "blue"); puff(W / 2, H * .85, 10, "smoke"); flashT = .2; }
        if (e.k === "ramp" && !o.used && s <= pSeg) { o.used = true; airV = 1.6; air = .01; snd.fx("jump"); callText("Wheee!", "blue"); }
      });
      // gates: the sound comes as the gate gets near
      gates.forEach(function (G) {
        if (G.done) return;
        var dist = G.seg - pSeg;
        if (!G.said && dist < 400 && phase === "race") { G.said = true; curGate = G; callGate(G); if (tut && G === gates[0] && !BABY) { tutOn = true; tip.classList.add("gone"); } if (BABY) tip.classList.add("gone"); }
        if (tutOn && G === gates[0]) { var dir = G.good - laneI; hand.className = "r3-hand on " + (dir < 0 ? "l" : dir > 0 ? "r" : "c"); hand.setAttribute("data-say", dir === 0 ? t("tutStay") : t("tutTap")); }
        if (G.baby && dist < 70 && laneI !== G.good) laneI = G.good;
        if (dist <= 0) {
          if (G.baby) { G.done = true; G.picked = G.good; pickResult(G); popBalloon(G); return; }
          G.done = true; G.picked = lane;
          if (tutOn) { tutOn = false; tut = false; hand.className = "r3-hand"; S.get().raceTut = 1; S.save(); }
          pickResult(G);
          if (lane === G.good) { okN++; boost = 3; slow = 0; setCam("yes"); puff(W / 2, H * .6, 40, "star"); puff(W / 2, H * .4, 24, "box"); snd.fx("turbo"); J.buzz([20, 30, 40]);
            flashT = .45; kickT = .6; turboText(); }
          else { if (shield > 0) { shield = 0; callText(t("pwSaved"), "blue"); } else { slow = 1.2; boost = 0; } setCam("oh"); snd.fx("wrong"); J.buzz([20, 30, 20]); if (G.q.k && S.addMiss) S.addMiss(G.q);
            callText('<small>' + HJ.ic("speaker") + " " + esc(t("raceThis")) + '</small><span class="ans-box' + (G.q.ar.replace(/[\u064B-\u0652]/g, "").length > 2 ? " w" : "") + '"><span class="ar">' + esc(G.q.ar) + "</span></span>", "ans"); shake = .4; setTimeout(function () { if (my === live) A.sayNow(G.q.au); }, 250); }
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
        if (who2) { talkT = tRace; var nm = who2.k === "ais" ? "Ais" : "Kak Adam"; var line = place < lastPlace ? t("racePassed", { n: nm }) : t("raceCatch", { n: nm }); callText(esc(line), place < lastPlace ? "green" : "gold"); }
      }
      if (place !== lastPlace) { if (place < lastPlace && phase === "race") snd.fx("pass"); lastPlace = place; J.bump(hud.querySelector(".r3-pos")); }
      var tm = Math.floor(tRace); hud.querySelector(".r3-time").textContent = Math.floor(tm / 60) + ":" + (tm % 60 < 10 ? "0" : "") + tm % 60;
      hud.querySelector(".r3-spd b").textContent = Math.round(speed / BASE * 88);
      // bumping into Ais or Kak Adam from behind: a soft bonk (with turbo, Mo zooms past instead)
      if (bumpT > 0) bumpT -= dt;
      riv.forEach(function (rv) { var gap = rv.z - pAbs;
        if (bumpT <= 0 && phase === "race" && rv.lane === laneI && gap > 0 && gap < 2.2 * SEG && Math.abs(rv.x - px) < .3) {
          bumpT = 1.6;
          if (boost > 0 || padT > 0) { rv.z -= 3 * SEG; snd.fx("pass"); puff(W / 2, H * .55, 14, "star"); }
          else { slow = Math.max(slow, .6); snd.fx("bump"); shake = .5; callText("Bonk!", "gold"); setTimeout(function () { if (my === live) (HORNS.beep)(rv.k === "ais" ? 1.3 : .8); }, 250); }
        } });
      // sharp curves at speed: tyre squeal and sparks
      if (skidT > 0) skidT -= dt;
      if (Math.abs(seg.curve) > 3 && speed > BASE * .9 && !calm) {
        if (Math.random() < dt * 14) puff(W / 2 + (seg.curve > 0 ? -1 : 1) * Math.min(W * .38, 230) * .5, H - 22, 2, "spark");
        if (skidT <= 0) { skidT = 1.2; snd.fx("skid"); }
      }
      function pc(z) { return Math.max(0, Math.min(1, (z - PLAYERZ) / (TOTAL - PLAYERZ))) * 100 + "%"; }
      heads.mo.style.left = pc(pAbs); heads.ais.style.left = pc(riv[0].z); heads.adam.style.left = pc(riv[1].z);
      if (phase === "race" && pos + PLAYERZ >= TOTAL) finish();
    }
    function sayGate() { if (curGate && !curGate.done) { spk.classList.remove("ping"); void spk.offsetWidth; spk.classList.add("ping"); snd.duck(true); A.sayNow(curGate.q.au).then(function () { snd.duck(false); }); } }
    // as an arch comes: "Listen!" + the sound, then the sound again ("ba … ba!")
    function popBalloon(G) {
      okN++; boost = 3; slow = 0; setCam("yes"); snd.fx("box"); snd.fx("turbo"); J.buzz([20, 30, 40]);
      for (var k = 0; k < 3; k++) puff(W / 2 + (k - 1) * 40, H * .5, 16, "box");
      puff(W / 2, H * .55, 30, "star"); flashT = .45; kickT = .6; turboText(); A.sayNow(G.q.au);
      setTimeout(function () { if (my === live) setCam("mo"); }, 1600);
    }
    function callGate(G) {
      callout.classList.remove("on"); listen.classList.add("on"); J.bump(listen); sayGate(); showPick(G);
      setTimeout(function () { if (my === live && !G.done && curGate === G) { J.bump(listen); sayGate(); } }, 1700);
      setTimeout(function () { listen.classList.remove("on"); }, 3600);
    }
    function power() {
      var k = U.pick(["shield", "magnet", "turbo"]); A.fx.unlock(); J.buzz(20);
      if (k === "shield") { shield = 12; callText(esc(t("pwShield")), "blue"); }
      else if (k === "magnet") { magnet = 9; callText(esc(t("pwMagnet")), "gold"); }
      else { padT = 2.4; callText("Turbo!", "green"); }
    }
    var callT = null, flashT = 0, kickT = 0, bumpT = 0, skidT = 0;
    var tbig = el("div", "r3-turbo", '<span class="tb-bolt"></span><b>TURBO!</b>'); sc.appendChild(tbig);
    function turboText() { tbig.classList.remove("on"); void tbig.offsetWidth; tbig.classList.add("on"); setTimeout(function () { tbig.classList.remove("on"); }, 1400); }
    function callText(html, kind) { callout.className = "r3-call on " + (kind || ""); callout.innerHTML = html; clearTimeout(callT); callT = setTimeout(function () { callout.classList.remove("on"); }, kind === "ans" ? 2000 : 1300); }

    /* ---- controls: tap the left or right half, swipe, arrow keys ---- */
    var sx0 = null;
    stage.addEventListener("pointerdown", function (e) { A.unlock(); sx0 = e.clientX; });
    stage.addEventListener("pointerup", function (e) {
      if (phase !== "race" || sx0 == null) return;
      if (BABY) { sx0 = null; babyGo(); return; }
      var d = e.clientX - sx0, b = stage.getBoundingClientRect();
      var dir = Math.abs(d) > 30 ? (d > 0 ? 1 : -1) : (e.clientX - b.left < b.width / 2 ? -1 : 1);
      var nl = Math.max(0, Math.min(2, laneI + dir)); if (nl !== laneI) { laneI = nl; A.fx.step(); markPick(); } tip.classList.add("gone"); sx0 = null;
    });
    function key(e) { if (phase !== "race") return; if (e.key === "ArrowLeft") laneI = Math.max(0, laneI - 1); if (e.key === "ArrowRight") laneI = Math.min(2, laneI + 1); markPick(); }
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
    A.preload(R.pool.concat(R.targets).map(function (x) { return x.au; }));
    var sounds = U.shuffle(R.targets.slice()).slice(0, 3), ci2 = 0;
    A.talk(t("raceReady"), lang());
    function light() {
      if (my !== live) return;
      if (ci2 < 3) { cd.querySelectorAll("i")[ci2].classList.add("on"); var it = sounds[ci2 % sounds.length]; cd.querySelector(".rc-say").innerHTML = '<span class="ar">' + esc(it.ar) + "</span>"; snd.fx("beep");
        A.sayNow(it.au).then(function () { setTimeout(light, 380); }); ci2++; return; }
      cd.querySelectorAll("i").forEach(function (i) { i.classList.add("go"); }); cd.querySelector(".rc-say").textContent = t("raceGo"); snd.fx("go"); J.buzz(30); flashT = .25;
      phase = "race"; setTimeout(function () { cd.classList.add("out"); }, 600); setTimeout(function () { cd.remove(); }, 1000);
    }
    setTimeout(light, 900);
    setTimeout(function () { tip.classList.add("gone"); }, 9000);
    requestAnimationFrame(frame);

    /* ---- finish ---- */
    function finish() {
      phase = "end"; finT = tRace; A.fx.win(); setCam("win"); snd.fx("cheer");
      callText(esc(t("raceFinishT")), "gold"); if (HJ._app && HJ._app.confetti) HJ._app.confetti(calm ? 30 : 110); puff(W / 2, H * .45, 40, "star"); puff(W * .25, H * .4, 20, "box"); puff(W * .75, H * .4, 20, "box");
      riv.forEach(function (rv) { if (!rv.fin) rv.fin = tRace + (TOTAL - rv.z) / (BASE * rv.pace); });
      var place = 1 + riv.filter(function (rv) { return rv.fin < finT; }).length;
      var order = [{ k: "mo", t: finT }].concat(riv.map(function (rv) { return { k: rv.k, t: rv.fin }; })).sort(function (a, b) { return a.t - b.t; });
      setTimeout(function () { if (my !== live) return; stop(); hooks.onFinish({ place: place, ok: okN, total: gates.length, coins: coinsN, time: finT, order: order }); }, 1800);
    }
  }

  HJ.race3d = { run: run, drawKart: drawKart, PAINT: PAINT, RIMS: RIMS, HORNS: HORNS };
})();
