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
