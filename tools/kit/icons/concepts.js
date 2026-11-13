/* App icon concepts for Baby Mo Hijaiyah (rendered by tools/kit/icons/build-icons.js).
   Each concept is a 512 × 512 HTML scene (rendered at 2× = 1024). Shared pieces: 3D "candy" Arabic letters made from
   stacked text shadows, render-1 Baby Mo (800 px PNG), sunburst rays, sparkles. */
const MO = (p) => `tools/kit/art/mo-${p}.png`;
const head = (base, css) => `<!doctype html><html><head><meta charset="utf-8"><base href="${base}"><link rel="stylesheet" href="assets/fonts/fonts.css"><style>
*{margin:0;padding:0;box-sizing:border-box}html,body{width:512px;height:512px;overflow:hidden}body{position:relative}
.ar{font-family:'Scheherazade New',serif;direction:rtl;line-height:1}
.rays{position:absolute;inset:-40%;background:repeating-conic-gradient(from 0deg,rgba(255,255,255,.16) 0 9deg,rgba(255,255,255,0) 9deg 22deg);border-radius:50%}
.glow{position:absolute;border-radius:50%;filter:blur(30px)}
.sp{position:absolute}
${css}</style></head><body>`;
// a 3D candy letter: gradient face, darker extrusion, white rim light
function candy({ ch, size, face = ["#FFF3A6", "#FFC21A"], side = "#D98A00", rim = "#fff", depth = 12, stroke = 0, strokeCol = "#fff", x, y, rot = 0, cls = "" }) {
  const sh = []; for (let i = 1; i <= depth; i++) sh.push(`0 ${i}px 0 ${side}`);
  sh.push(`0 ${depth + 6}px ${depth + 8}px rgba(0,0,0,.35)`);
  return `<div class="ar ${cls}" style="position:absolute;left:${x}px;top:${y}px;font-size:${size}px;transform:rotate(${rot}deg);text-shadow:${sh.join(",")}">
<span style="position:relative;display:inline-block">
<span style="position:absolute;inset:0;-webkit-text-stroke:${stroke * 2}px ${strokeCol};color:${strokeCol};${stroke ? "" : "display:none"}">${ch}</span>
<span style="position:relative;background:linear-gradient(180deg,${face[0]} 18%,${face[1]} 78%);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:none;filter:drop-shadow(0 -2px 0 ${rim})">${ch}</span></span></div>`;
}
const star = (x, y, s, c = "#FFD23F", st = "#F08C00", rot = 0) => `<svg class="sp" style="left:${x}px;top:${y}px;width:${s}px;transform:rotate(${rot}deg)" viewBox="0 0 48 48"><path d="M24 3.5l6 12.4 13.6 1.9-9.9 9.4 2.4 13.5L24 34.3l-12.1 6.4 2.4-13.5-9.9-9.4 13.6-1.9z" fill="${c}" stroke="${st}" stroke-width="3" stroke-linejoin="round"/><ellipse cx="18" cy="17" rx="4" ry="2.6" fill="#fff" opacity=".7"/></svg>`;
const twinkle = (x, y, s, c = "#fff") => `<svg class="sp" style="left:${x}px;top:${y}px;width:${s}px" viewBox="0 0 40 40"><path d="M20 0c2 12 6 16 20 20-14 4-18 8-20 20-2-12-6-16-20-20 14-4 18-8 20-20z" fill="${c}"/></svg>`;
const moon = (x, y, s) => `<svg class="sp" style="left:${x}px;top:${y}px;width:${s}px" viewBox="0 0 48 48"><path d="M30 5.5A19 19 0 1 0 42.5 32 15 15 0 0 1 30 5.5z" fill="#FFE27A" stroke="#F0A000" stroke-width="2"/></svg>`;

const C = {
  // A — toy block: a glossy 3D letter cube (ب on the front) with Mo hugging it
  A: (b) => head(b, `
body{background:radial-gradient(90% 80% at 50% 30%,#7EF0B2,#1FB36B 55%,#0B7A4B)}
.cube{position:absolute;left:96px;top:70px;width:250px;height:250px;transform:rotate(-8deg)}
.cube .f{position:absolute;inset:0;border-radius:46px;background:linear-gradient(160deg,#FFFFFF,#E9F3FF);box-shadow:0 18px 0 #B9CDE6,0 34px 40px rgba(0,50,30,.35),inset 0 -10px 0 rgba(30,60,110,.06)}
.cube .f::after{content:"";position:absolute;left:18px;right:18px;top:12px;height:70px;border-radius:30px;background:linear-gradient(180deg,rgba(255,255,255,.95),rgba(255,255,255,0))}
.mo{position:absolute;right:-56px;bottom:-62px;width:350px;filter:drop-shadow(0 14px 18px rgba(0,40,20,.4))}`) +
    `<div class="rays"></div><div class="glow" style="left:120px;top:60px;width:260px;height:260px;background:rgba(255,255,200,.55)"></div>
<div class="cube"><div class="f"></div></div>
${candy({ ch: "بَ", size: 230, face: ["#4CE38C", "#0E9F57"], side: "#0A6E3D", x: 128, y: 18, rot: -8 })}
${star(330, 40, 74, undefined, undefined, 12)}${twinkle(52, 330, 34)}${twinkle(64, 58, 24)}
<img class="mo" src="${MO("pose-41")}"></body></html>`,

  // B — big golden alif-ba with Mo cheering in front, night-sky purple (Qur'an feel)
  B: (b) => head(b, `
body{background:radial-gradient(80% 70% at 50% 35%,#8E7CFF,#5B3FD6 55%,#2C1A7A)}
.mo{position:absolute;left:50%;bottom:-70px;width:400px;margin-left:-200px;filter:drop-shadow(0 16px 20px rgba(20,0,60,.5))}`) +
    `<div class="rays" style="opacity:.8"></div><div class="glow" style="left:116px;top:20px;width:280px;height:220px;background:rgba(255,210,90,.55)"></div>
${candy({ ch: "أ ب", size: 210, face: ["#FFF6B8", "#FFB800"], side: "#C77700", x: 92, y: -30, stroke: 7 })}
${moon(28, 34, 74)}${twinkle(420, 60, 40)}${twinkle(452, 190, 22)}${twinkle(46, 220, 26)}
<img class="mo" src="${MO("yeyy")}"></body></html>`,

  // C — Mo big in front, holding up a speech-bubble-like tile with ب, sunny orange
  C: (b) => head(b, `
body{background:radial-gradient(90% 80% at 40% 25%,#FFE27A,#FF9F1C 55%,#E8590C)}
.bub{position:absolute;left:44px;top:40px;width:270px;height:220px;border-radius:70px 70px 70px 22px;background:linear-gradient(170deg,#FFFFFF,#FFF2DA);box-shadow:0 14px 0 #F5C77A,0 30px 40px rgba(120,40,0,.35);transform:rotate(-6deg)}
.mo{position:absolute;right:-70px;bottom:-60px;width:380px;filter:drop-shadow(0 14px 18px rgba(120,40,0,.4))}`) +
    `<div class="rays"></div><div class="bub"></div>
${candy({ ch: "بَ", size: 210, face: ["#5BE38A", "#0E9F57"], side: "#0A6E3D", x: 86, y: -4, rot: -6 })}
${star(300, 36, 64, "#fff", "#FFB800", 10)}${twinkle(380, 140, 30)}${twinkle(40, 300, 30)}
<img class="mo" src="${MO("yes")}"></body></html>`,

  // D — round badge: Mo's face/torso inside a ring of hijaiyah letters, teal
  D: (b) => head(b, `
body{background:radial-gradient(90% 90% at 50% 30%,#6FF3E0,#14B8A6 55%,#0B6E68)}
.ring{position:absolute;left:36px;top:36px;width:440px;height:440px;border-radius:50%;border:16px solid rgba(255,255,255,.9);box-shadow:inset 0 0 0 8px rgba(255,255,255,.25),0 16px 30px rgba(0,60,60,.35)}
.mo{position:absolute;left:50%;bottom:-30px;width:400px;margin-left:-200px;filter:drop-shadow(0 14px 18px rgba(0,60,60,.4))}
.tile{position:absolute;width:96px;height:96px;border-radius:26px;background:#fff;display:grid;place-items:center;box-shadow:0 8px 0 #BFE9E3,0 16px 20px rgba(0,60,60,.3)}`) +
    `<div class="rays"></div><div class="ring"></div><img class="mo" src="${MO("pose-41")}">
<div class="tile" style="left:24px;top:40px;transform:rotate(-12deg)">${candy({ ch: "أ", size: 84, face: ["#FF8FB1", "#E11D48"], side: "#9F1239", depth: 6, x: 26, y: -6 })}</div>
<div class="tile" style="left:392px;top:40px;transform:rotate(10deg)">${candy({ ch: "بَ", size: 84, face: ["#7CC8FF", "#2563EB"], side: "#1E3A8A", depth: 6, x: 14, y: -14 })}</div>
${star(214, 10, 84)}</body></html>`,

  // E — the current idea, refined: 3D tilted tile with thickness, golden candy letters, Mo bigger, rays + crescent
  E: (b) => head(b, `
body{background:radial-gradient(90% 80% at 35% 20%,#7EF0B2,#22B573 55%,#0A7A4F)}
.card{position:absolute;left:34px;top:46px;width:310px;height:240px;border-radius:58px;background:linear-gradient(165deg,#FFFFFF,#EEF7F1);transform:rotate(-7deg);
 box-shadow:0 16px 0 #B9E2CC,0 34px 44px rgba(0,60,30,.35)}
.card::after{content:"";position:absolute;left:22px;right:22px;top:14px;height:80px;border-radius:40px;background:linear-gradient(180deg,rgba(255,255,255,1),rgba(255,255,255,0))}
.mo{position:absolute;right:-74px;bottom:-78px;width:400px;filter:drop-shadow(0 16px 20px rgba(0,50,25,.45))}`) +
    `<div class="rays"></div><div class="glow" style="left:60px;top:40px;width:300px;height:240px;background:rgba(255,255,220,.45)"></div><div class="card"></div>
${candy({ ch: "أ ب", size: 196, face: ["#FFE680", "#FFAA00"], side: "#C46F00", x: 70, y: -2, rot: -7, stroke: 5 })}
${star(330, 28, 80, undefined, undefined, 14)}${moon(420, 150, 54)}${twinkle(38, 330, 30)}${twinkle(250, 300, 22)}
<img class="mo" src="${MO("pose-05")}"></body></html>`,

  // F — Mo flying with an open book, letters popping out, sky blue
  F: (b) => head(b, `
body{background:radial-gradient(90% 80% at 50% 25%,#9FDBFF,#3B9CF0 55%,#1D5FD6)}
.book{position:absolute;left:70px;top:250px;width:372px;height:170px}
.mo{position:absolute;left:50%;bottom:-48px;width:330px;margin-left:-165px;filter:drop-shadow(0 14px 18px rgba(10,40,100,.45))}`) +
    `<div class="rays"></div>
<svg class="book" viewBox="0 0 372 170"><path d="M186 30C140 6 70 4 14 22v140c56-18 126-16 172 8 46-24 116-26 172-8V22C302 4 232 6 186 30z" fill="#fff"/><path d="M186 30v140" stroke="#CFE3F7" stroke-width="6"/><path d="M14 162c56-18 126-16 172 8 46-24 116-26 172-8v8c-56-16-126-14-172 10-46-24-116-26-172-10z" fill="#2E7D4F"/></svg>
${candy({ ch: "أ", size: 150, face: ["#FF9DBA", "#E11D48"], side: "#9F1239", depth: 9, x: 60, y: 30, rot: -14, stroke: 5 })}
${candy({ ch: "بَ", size: 160, face: ["#FFE680", "#FFAA00"], side: "#C46F00", depth: 9, x: 176, y: -16, stroke: 5 })}
${candy({ ch: "تَ", size: 150, face: ["#7CF0B0", "#12A15A"], side: "#0A6E3D", depth: 9, x: 330, y: 34, rot: 14, stroke: 5 })}
${twinkle(30, 40, 30)}${twinkle(460, 20, 26)}
<img class="mo" src="${MO("pose-02")}"></body></html>`
};
module.exports = { C, candy, star, twinkle, moon, head, MO };

/* ---------- batch 2: bigger Mo, one chunky extruded letter, bolder colour ---------- */
// a properly extruded 3D letter: N copies stepping down in the side colour, a white rim copy, then the gradient face on top
function block({ ch, size, face = ["#7CF0B0", "#0E9F57"], side = "#0A6E3D", rim = "#FFFFFF", depth = 16, rimW = 8, x, y, rot = 0, shine = true }) {
  let layers = "";
  for (let i = depth; i >= 1; i--) layers += `<span style="position:absolute;left:0;top:${i}px;color:${side};${i === depth ? `filter:drop-shadow(0 10px 12px rgba(0,0,0,.35))` : ""}">${ch}</span>`;
  layers += `<span style="position:absolute;left:0;top:0;color:${rim};-webkit-text-stroke:${rimW}px ${rim}">${ch}</span>`;
  layers += `<span style="position:absolute;left:0;top:${depth}px;color:${side};-webkit-text-stroke:${rimW}px ${side};z-index:-1">${ch}</span>`;
  layers += `<span style="position:relative;background:linear-gradient(180deg,${face[0]} 20%,${face[1]} 80%);-webkit-background-clip:text;background-clip:text;color:transparent">${ch}</span>`;
  if (shine) layers += `<span style="position:absolute;left:0;top:0;background:linear-gradient(180deg,rgba(255,255,255,.75) 0 30%,rgba(255,255,255,0) 46%);-webkit-background-clip:text;background-clip:text;color:transparent">${ch}</span>`;
  return `<div class="ar" style="position:absolute;left:${x}px;top:${y}px;font-size:${size}px;transform:rotate(${rot}deg);isolation:isolate"><span style="position:relative;display:inline-block">${layers}</span></div>`;
}
const tile = (x, y, w, h, rot, face = ["#FFFFFF", "#F1F6FF"], edge = "#C9D7EC", r = 62) => `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;transform:rotate(${rot}deg);border-radius:${r}px;
 background:linear-gradient(165deg,${face[0]},${face[1]});box-shadow:0 18px 0 ${edge},0 36px 46px rgba(0,0,0,.30)"><div style="position:absolute;left:20px;right:20px;top:14px;height:42%;border-radius:${r - 16}px;background:linear-gradient(180deg,rgba(255,255,255,.95),rgba(255,255,255,0))"></div></div>`;
// Mo big: head and shoulders, cut off by the icon edge
const bigMo = (pose, x, y, w, flip) => `<img src="${MO(pose)}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;filter:drop-shadow(0 18px 22px rgba(0,0,0,.35));${flip ? "transform:scaleX(-1)" : ""}">`;

Object.assign(C, {
  // G — orange sunburst, white tile with a chunky green ب, Mo waving big
  G: (b) => head(b, `body{background:radial-gradient(90% 80% at 30% 20%,#FFE584,#FFA41B 52%,#F0620F)}`) +
    `<div class="rays"></div><div class="glow" style="left:40px;top:20px;width:300px;height:260px;background:rgba(255,255,230,.55)"></div>
${tile(34, 40, 270, 250, -8)}${block({ ch: "بَ", size: 230, x: 66, y: -20, rot: -8 })}
${star(282, 22, 80, undefined, undefined, 14)}${twinkle(410, 52, 34)}${twinkle(32, 330, 28)}
${bigMo("yes", 190, 168, 470)}</body></html>`,
  // H — purple night, giant gold ب like a sun behind Mo, crescent + stars
  H: (b) => head(b, `body{background:radial-gradient(80% 70% at 50% 30%,#9C8BFF,#6243E0 52%,#2D1680)}`) +
    `<div class="rays" style="opacity:.9"></div><div class="glow" style="left:96px;top:10px;width:320px;height:260px;background:rgba(255,205,80,.6)"></div>
${block({ ch: "بَ", size: 300, face: ["#FFF3A0", "#FFB300"], side: "#B86A00", rim: "#FFF6D0", x: 100, y: -84, depth: 18 })}
${moon(30, 40, 70)}${twinkle(436, 70, 40)}${twinkle(456, 214, 22)}${twinkle(44, 210, 24)}
${bigMo("yeyy", 52, 196, 410)}</body></html>`,
  // I — green brand, white tile + ب, Mo peeking with a big face from the bottom right
  I: (b) => head(b, `body{background:radial-gradient(90% 80% at 30% 20%,#8DF5BE,#22B573 52%,#08724A)}`) +
    `<div class="rays"></div><div class="glow" style="left:30px;top:20px;width:320px;height:260px;background:rgba(255,255,220,.5)"></div>
${tile(30, 36, 280, 256, -8)}${block({ ch: "بَ", size: 236, face: ["#FFE680", "#FF9F00"], side: "#B86200", x: 64, y: -22, rot: -8 })}
${star(290, 18, 84, undefined, undefined, 14)}${moon(436, 112, 46)}${twinkle(30, 336, 30)}
${bigMo("pose-41", 176, 176, 500)}</body></html>`,
  // J — sky blue, Mo big in the middle holding the moment, letter bubble above (thought/speech)
  J: (b) => head(b, `body{background:radial-gradient(90% 80% at 50% 20%,#A9E1FF,#3D9BF0 52%,#1B56C9)}`) +
    `<div class="rays"></div>
<div style="position:absolute;left:136px;top:22px;width:240px;height:190px;border-radius:70px;background:linear-gradient(170deg,#fff,#EEF5FF);box-shadow:0 14px 0 #BFD6F2,0 30px 40px rgba(0,30,90,.3)"></div>
<div style="position:absolute;left:236px;top:200px;width:40px;height:40px;border-radius:50%;background:#fff;box-shadow:0 8px 0 #BFD6F2"></div>
${block({ ch: "بَ", size: 200, face: ["#7CF0B0", "#0E9F57"], side: "#0A6E3D", x: 170, y: -34 })}
${star(380, 30, 66, undefined, undefined, 12)}${twinkle(40, 70, 34)}${twinkle(60, 300, 24)}
${bigMo("idea", 76, 214, 380)}</body></html>`,
  // K — warm coral/pink, giant 3D ب centred, Mo's big face peeking from the bottom edge
  K: (b) => head(b, `body{background:radial-gradient(90% 80% at 50% 25%,#FFD0DD,#FF6F9C 52%,#D6336C)}`) +
    `<div class="rays"></div><div class="glow" style="left:80px;top:10px;width:350px;height:260px;background:rgba(255,255,230,.5)"></div>
${block({ ch: "بَ", size: 290, face: ["#FFF3A0", "#FFB300"], side: "#B86A00", x: 104, y: -70, depth: 18 })}
${star(40, 40, 70, undefined, undefined, -12)}${twinkle(436, 60, 36)}${twinkle(452, 250, 24)}
${bigMo("pose-05", 66, 236, 380)}</body></html>`
});
module.exports = { C, candy, star, twinkle, moon, head, MO, block, tile, bigMo };

/* ---------- batch 3: the finalists — one letter tile, one star, Mo big and looking at you, rim light ---------- */
const rim = (x, y, w, h, c = "rgba(255,255,255,.55)") => `<div class="glow" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${c};filter:blur(34px)"></div>`;
Object.assign(C, {
  // L — brand green (matches the Baby Mo family), gold ب on a white tile, Mo big
  L: (b) => head(b, `body{background:radial-gradient(95% 85% at 28% 18%,#8DF5BE,#1FB06E 50%,#076B44)}.rays{opacity:.55}`) +
    `<div class="rays"></div>${rim(28, 24, 300, 270, "rgba(255,255,220,.5)")}
${tile(28, 32, 272, 250, -8)}${block({ ch: "بَ", size: 232, face: ["#FFE680", "#FF9F00"], side: "#B86200", x: 58, y: -26, rot: -8 })}
${star(270, 16, 92, undefined, undefined, 14)}
${rim(250, 230, 260, 260)}${bigMo("pose-41", 150, 150, 560)}</body></html>`,
  // M — sunny orange, green ب on a white tile, Mo waving big
  M: (b) => head(b, `body{background:radial-gradient(95% 85% at 28% 18%,#FFE584,#FFA41B 50%,#EA580C)}.rays{opacity:.55}`) +
    `<div class="rays"></div>${rim(28, 24, 300, 270, "rgba(255,255,230,.5)")}
${tile(28, 32, 272, 250, -8)}${block({ ch: "بَ", size: 232, x: 58, y: -26, rot: -8 })}
${star(270, 16, 92, undefined, undefined, 14)}
${rim(250, 230, 260, 260)}${bigMo("yes", 160, 140, 540)}</body></html>`,
  // N — deep purple with a gold ب (Qur'an / night feel), Mo big and happy
  N: (b) => head(b, `body{background:radial-gradient(95% 85% at 30% 18%,#A897FF,#6243E0 50%,#2B1478)}.rays{opacity:.5}`) +
    `<div class="rays"></div>${rim(28, 24, 300, 270, "rgba(255,210,110,.45)")}
${tile(28, 32, 272, 250, -8, ["#FFFFFF", "#F3EEFF"], "#C9BDF0")}${block({ ch: "بَ", size: 232, face: ["#FFE680", "#FF9F00"], side: "#B86200", x: 58, y: -26, rot: -8 })}
${star(270, 16, 92, undefined, undefined, 14)}
${rim(250, 230, 260, 260, "rgba(255,255,255,.45)")}${bigMo("pose-41", 150, 150, 560)}</body></html>`
});
module.exports = { C, candy, star, twinkle, moon, head, MO, block, tile, bigMo, rim };

/* ---------- final polish: Mo's whole head inside the icon ---------- */
const finalIcon = (bgCss, tileFace, tileEdge, letter, pose, glowLetter) => (b) => head(b, `body{background:${bgCss}}.rays{opacity:.5}`) +
  `<div class="rays"></div>${rim(28, 24, 300, 270, glowLetter)}
${tile(26, 30, 270, 248, -8, tileFace, tileEdge)}${block(Object.assign({ ch: "بَ", size: 230, x: 56, y: -28, rot: -8 }, letter))}
${star(266, 14, 92, undefined, undefined, 14)}
${rim(220, 220, 280, 280, "rgba(255,255,255,.5)")}${bigMo(pose, 128, 152, 530)}</body></html>`;
Object.assign(C, {
  green: finalIcon("radial-gradient(95% 85% at 28% 18%,#8DF5BE,#1FB06E 50%,#076B44)", undefined, undefined, { face: ["#FFE680", "#FF9F00"], side: "#B86200" }, "pose-41", "rgba(255,255,220,.5)"),
  orange: finalIcon("radial-gradient(95% 85% at 28% 18%,#FFE584,#FFA41B 50%,#EA580C)", undefined, undefined, {}, "pose-41", "rgba(255,255,230,.5)"),
  purple: finalIcon("radial-gradient(95% 85% at 30% 18%,#A897FF,#6243E0 50%,#2B1478)", ["#FFFFFF", "#F3EEFF"], "#C9BDF0", { face: ["#FFE680", "#FF9F00"], side: "#B86200" }, "pose-41", "rgba(255,210,110,.45)")
});
module.exports = { C, candy, star, twinkle, moon, head, MO, block, tile, bigMo, rim };

/* ---------- v2 (drawn letters): three new directions — Blast off, Letter buddy, Game badge ---------- */
// ب drawn as a thick vector stroke (same shape as the tracing game), with a 3D extrusion, a white rim and a shine
function drawBa({ x, y, s, face = ["#FFE680", "#FF9F00"], side = "#B86200", rim = "#fff", rot = 0, eyes = false, id = "b" }) {
  const P = "M80 40 C83 60 75 68 50 68 C27 68 19 61 20 44", F = "M50 46 L52 46";
  let ext = ""; for (let i = 7; i >= 1; i--) ext += `<path d="${P}" stroke="${side}" stroke-width="15" transform="translate(0 ${i * .7})"/>`;
  let dext = ""; for (let i = 7; i >= 1; i--) dext += `<circle cx="50" cy="${84 + i * .7}" r="7.5" fill="${side}"/>`;
  let fext = ""; for (let i = 5; i >= 1; i--) fext += `<path d="M42 27 L58 21" stroke="${side}" stroke-width="7" transform="translate(0 ${i * .7})"/>`;
  const face_ = eyes ? `<g><ellipse cx="38" cy="52" rx="6.4" ry="7.4" fill="#fff"/><ellipse cx="60" cy="52" rx="6.4" ry="7.4" fill="#fff"/>
    <circle cx="39.5" cy="53.5" r="3.6" fill="#1D2433"/><circle cx="61.5" cy="53.5" r="3.6" fill="#1D2433"/><circle cx="40.6" cy="52" r="1.2" fill="#fff"/><circle cx="62.6" cy="52" r="1.2" fill="#fff"/>
    <path d="M44 61 Q49.5 66 55 61" stroke="#7A2E00" stroke-width="2.2" fill="none" stroke-linecap="round"/><ellipse cx="31" cy="60" rx="3.4" ry="2.2" fill="#FF7A9A" opacity=".55"/><ellipse cx="68" cy="60" rx="3.4" ry="2.2" fill="#FF7A9A" opacity=".55"/></g>` : "";
  return `<svg style="position:absolute;left:${x}px;top:${y}px;width:${s}px;height:${s}px;transform:rotate(${rot}deg);overflow:visible;filter:drop-shadow(0 12px 14px rgba(0,0,0,.3))" viewBox="0 0 100 100">
<defs><linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${face[0]}"/><stop offset="1" stop-color="${face[1]}"/></linearGradient></defs>
<g fill="none" stroke-linecap="round" stroke-linejoin="round">${ext}${fext}<path d="${P}" stroke="${rim}" stroke-width="18"/><path d="${P}" stroke="url(#${id}f)" stroke-width="13"/>
<path d="M42 27 L58 21" stroke="${rim}" stroke-width="10"/><path d="M42 27 L58 21" stroke="url(#${id}f)" stroke-width="6"/>
<path d="M77 43 C78 52 74 58 62 60" stroke="#fff" stroke-width="3.5" opacity=".75"/></g>
${dext}<circle cx="50" cy="84" r="9" fill="${rim}"/><circle cx="50" cy="84" r="7" fill="url(#${id}f)"/><circle cx="48" cy="82" r="2" fill="#fff" opacity=".8"/>${face_}</svg>`;
}
Object.assign(C, {
  // A — Blast off: Mo bursting out of a golden portal with a glowing بَ, comic speed lines
  blast: (b) => head(b, `body{background:radial-gradient(90% 90% at 70% 30%,#FFD36B,#FF7A45 45%,#D9366E 80%,#8E1F5E)}`) +
    `<div class="rays" style="opacity:.6;background:repeating-conic-gradient(from 10deg at 50% 50%,rgba(255,255,255,.22) 0 5deg,rgba(255,255,255,0) 5deg 15deg)"></div>
<div style="position:absolute;left:120px;top:-6px;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,#FFF7C2 0,#FFD84D 35%,#FFAA00 58%,rgba(255,170,0,0) 72%)"></div>
<div style="position:absolute;left:152px;top:26px;width:336px;height:336px;border-radius:50%;border:18px solid #FFE680;box-shadow:0 0 0 9px #E08A00,inset 0 0 50px rgba(255,140,0,.8),0 0 60px rgba(255,220,120,.9)"></div>
${drawBa({ x: 176, y: 16, s: 300, face: ["#7CF0B0", "#0E9F57"], side: "#0A6E3D", id: "bl" })}
${[0, 1, 2, 3, 4].map((i) => `<div style="position:absolute;left:${20 + i * 18}px;top:${300 + i * 26}px;width:${120 - i * 12}px;height:10px;border-radius:5px;background:rgba(255,255,255,.75);transform:rotate(-32deg)"></div>`).join("")}
${star(36, 40, 70, undefined, undefined, -14)}${twinkle(110, 150, 30)}
<img src="${MO("pose-02")}" style="position:absolute;left:-14px;top:172px;width:390px;filter:drop-shadow(0 18px 20px rgba(80,0,40,.45));transform:rotate(-8deg)"></body></html>`,
  // B — Letter buddy: a cute 3D ب with a face high-fiving Mo
  buddy: (b) => head(b, `body{background:radial-gradient(90% 85% at 30% 20%,#9CF7D9,#2DD4BF 45%,#0F8F8A 80%,#0B5E66)}`) +
    `<div class="rays" style="opacity:.5"></div><div class="glow" style="left:10px;top:40px;width:330px;height:300px;background:rgba(255,255,230,.6)"></div>
${drawBa({ x: -6, y: 46, s: 330, eyes: true, id: "bd" })}
${star(250, 26, 74, undefined, undefined, 12)}${twinkle(40, 40, 30)}${twinkle(206, 136, 22)}
<img src="${MO("yes")}" style="position:absolute;left:168px;top:138px;width:430px;transform:scaleX(-1);filter:drop-shadow(0 18px 20px rgba(0,60,60,.4))">
<svg style="position:absolute;left:236px;top:150px;width:70px" viewBox="0 0 40 40"><path d="M20 0l3 13 13-6-9 11 13 4-14 2 6 13-11-9-5 14-2-14-13 6 9-11L0 18l14-2-6-13 11 9z" fill="#FFE680" stroke="#FFAA00" stroke-width="1.5"/></svg></body></html>`,
  // C — Game badge: a gold shield with Mo's face and a أ ب ت ribbon on a starry night
  badge: (b) => head(b, `body{background:radial-gradient(90% 85% at 50% 20%,#4B3BB8,#24186E 55%,#120B3D)}
.shield{position:absolute;left:66px;top:30px;width:380px;height:420px}`) +
    `${[...Array(18)].map((_, i) => `<div style="position:absolute;left:${(i * 97) % 500}px;top:${(i * 61) % 470}px;width:${i % 3 ? 3 : 5}px;height:${i % 3 ? 3 : 5}px;border-radius:50%;background:#FFE9A8;opacity:.8"></div>`).join("")}
<svg class="shield" viewBox="0 0 380 420"><defs><linearGradient id="gd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF3A6"/><stop offset=".5" stop-color="#FFC21A"/><stop offset="1" stop-color="#C77700"/></linearGradient>
<radialGradient id="in" cx=".5" cy=".35" r=".7"><stop offset="0" stop-color="#7CF0B0"/><stop offset="1" stop-color="#0E9F57"/></radialGradient><clipPath id="cl"><path d="M190 34 L330 84 C330 220 290 320 190 380 C90 320 50 220 50 84 Z"/></clipPath></defs>
<path d="M190 8 L356 66 C356 236 306 354 190 412 C74 354 24 236 24 66 Z" fill="url(#gd)" stroke="#8A5200" stroke-width="5"/>
<path d="M190 34 L330 84 C330 220 290 320 190 380 C90 320 50 220 50 84 Z" fill="url(#in)"/>
<g clip-path="url(#cl)"><path d="M190 34 L330 84 L330 200 L50 200 L50 84 Z" fill="rgba(255,255,255,.12)"/><image href="${MO("pose-41")}" x="-10" y="80" width="400" height="400"/></g>
<path d="M60 70 Q190 20 320 70" stroke="#fff" stroke-width="6" fill="none" opacity=".5" stroke-linecap="round"/></svg>
${moon(214, 0, 82)}
<svg style="position:absolute;left:14px;top:330px;width:484px;height:130px" viewBox="0 0 484 130"><path d="M10 40 L60 30 L60 110 L10 120 L34 76 Z" fill="#B91C4B"/><path d="M474 40 L424 30 L424 110 L474 120 L450 76 Z" fill="#B91C4B"/>
<path d="M50 24 Q242 -6 434 24 L434 100 Q242 70 50 100 Z" fill="#E11D48" stroke="#8A0E30" stroke-width="4"/><path d="M60 34 Q242 6 424 34" stroke="#fff" stroke-width="4" opacity=".4" fill="none"/></svg>
<div class="ar" style="position:absolute;left:0;right:0;top:312px;text-align:center;font-size:92px;color:#FFE680;text-shadow:0 4px 0 #8A0E30,0 0 12px rgba(255,220,120,.6)">أ ب ت</div>
${twinkle(40, 70, 40, "#FFE9A8")}${twinkle(430, 120, 30, "#FFE9A8")}</body></html>`
});

/* ---------- v3 (owner picks): Buddy with Mo's upper body only, Blast with Mo's head only ---------- */
const spark = (x, y, w) => `<svg class="sp" style="left:${x}px;top:${y}px;width:${w}px" viewBox="0 0 40 40"><path d="M20 0l3 13 13-6-9 11 13 4-14 2 6 13-11-9-5 14-2-14-13 6 9-11L0 18l14-2-6-13 11 9z" fill="#FFF3A6" stroke="#FFAA00" stroke-width="1.5"/></svg>`;
// upper body: the 800 px render placed so the waist (y≈540 of 800) sits on the icon's bottom edge
const upper = (pose, w, cx, flip, extra = "") => { const k = w / 800, top = 512 - 540 * k, left = cx - (flip ? 800 - 395 : 395) * k;
  return `<img src="${MO(pose)}" style="position:absolute;left:${left}px;top:${top}px;width:${w}px;${flip ? "transform:scaleX(-1);" : ""}filter:drop-shadow(0 16px 20px rgba(0,50,60,.45));${extra}">`; };
const buddyBg = `body{background:radial-gradient(90% 85% at 30% 20%,#9CF7D9,#2DD4BF 45%,#0F8F8A 80%,#0B5E66)}`;
function blastScene(headPose, opt = {}) {
  const hx = opt.hx ?? 150, hy = opt.hy ?? 168, hw = opt.hw ?? 300, rot = opt.rot ?? -8;
  return (b) => head(b, `body{background:radial-gradient(90% 90% at 70% 30%,#FFD36B,#FF7A45 45%,#D9366E 80%,#8E1F5E)}`) +
`<div class="rays" style="opacity:.6;background:repeating-conic-gradient(from 10deg at 50% 50%,rgba(255,255,255,.22) 0 5deg,rgba(255,255,255,0) 5deg 15deg)"></div>
<div style="position:absolute;left:96px;top:120px;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,#FFF7C2 0,#FFD84D 35%,#FFAA00 58%,rgba(255,170,0,0) 72%)"></div>
<div style="position:absolute;left:128px;top:152px;width:336px;height:336px;border-radius:50%;background:radial-gradient(circle,#5B2A86 0,#3A1560 60%,#24093F 100%);box-shadow:inset 0 0 40px rgba(255,160,40,.9)"></div>
${[...Array(9)].map((_, i) => `<div style="position:absolute;left:${170 + (i * 73) % 250}px;top:${200 + (i * 47) % 230}px;width:${i % 3 ? 4 : 7}px;height:${i % 3 ? 4 : 7}px;border-radius:50%;background:#FFE9A8"></div>`).join("")}
<img src="${MO("head-" + headPose)}" style="position:absolute;left:${hx}px;top:${hy}px;width:${hw}px;transform:rotate(${rot}deg);filter:drop-shadow(0 14px 16px rgba(60,0,40,.5))">
<svg style="position:absolute;left:110px;top:134px;width:372px;height:372px;overflow:visible" viewBox="0 0 372 372">
<path d="M18 186 A168 168 0 0 0 354 186" fill="none" stroke="#E08A00" stroke-width="44" stroke-linecap="round"/>
<path d="M18 186 A168 168 0 0 0 354 186" fill="none" stroke="#FFE680" stroke-width="30" stroke-linecap="round"/>
<path d="M40 230 A150 150 0 0 0 186 340" fill="none" stroke="#fff" stroke-width="7" opacity=".7" stroke-linecap="round"/></svg>
${drawBa({ x: opt.bx ?? -8, y: opt.by ?? -18, s: opt.bs ?? 270, face: ["#7CF0B0", "#0E9F57"], side: "#0A6E3D", id: "bl3", rot: -14 })}
${[0, 1, 2, 3].map((i) => `<div style="position:absolute;left:${210 + i * 26}px;top:${40 + i * 30}px;width:${90 - i * 14}px;height:9px;border-radius:5px;background:rgba(255,255,255,.75);transform:rotate(-40deg)"></div>`).join("")}
${star(392, 26, 76, undefined, undefined, 14)}${twinkle(318, 108, 26)}${twinkle(40, 300, 30)}${twinkle(70, 410, 20)}</body></html>`;
}
Object.assign(C, {
  // B · Buddy v3 — Mo from the waist up high-fives the ب buddy
  buddy3: (b) => head(b, buddyBg) + `<div class="rays" style="opacity:.5"></div><div class="glow" style="left:0;top:20px;width:300px;height:280px;background:rgba(255,255,230,.6)"></div>
${drawBa({ x: -34, y: 60, s: 290, eyes: true, id: "b3", rot: -4 })}
${star(400, 22, 70, undefined, undefined, 12)}${twinkle(250, 40, 26)}${twinkle(30, 330, 22)}
${upper("yes", 660, 330, true)}${spark(118, 268, 80)}</body></html>`,
  // B2 · Buddy v3 variant — Mo waving both hands next to the ب buddy
  buddy3b: (b) => head(b, buddyBg) + `<div class="rays" style="opacity:.5"></div><div class="glow" style="left:0;top:20px;width:300px;height:280px;background:rgba(255,255,230,.6)"></div>
${drawBa({ x: -20, y: 10, s: 290, eyes: true, id: "b4", rot: -8 })}
${star(410, 30, 66, undefined, undefined, 12)}${twinkle(240, 30, 26)}${twinkle(26, 330, 22)}
${upper("pose-26", 640, 340, false)}${spark(196, 196, 56)}</body></html>`,
  // A · Blast v3 — Mo's head pops through the portal as the ب blasts out
  blast3: blastScene("41"),
  blast3b: blastScene("yes", { rot: 6, hx: 146, hy: 160 })
});
module.exports = Object.assign(module.exports, { drawBa });
