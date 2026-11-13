/* HTML templates for the App Store kit images (rendered by tools/kit/build-kit.js with Playwright).
   Same look as the Baby Mo kit: pastel background, a small pill, a big two-line title (second line in colour),
   a subtitle, check pills, the real screenshot in a phone/iPad frame, and Baby Mo (render 1, 800 px PNG) peeking in. */
const HEAD = (base) => `<!doctype html><html><head><meta charset="utf-8"><base href="${base}">
<link rel="stylesheet" href="assets/fonts/fonts.css"><style>
*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;overflow:hidden}
body{font-family:'Nunito',sans-serif;color:#152230;-webkit-font-smoothing:antialiased}
.fun{font-family:'Fredoka','Nunito',sans-serif;font-weight:700}
.ar{font-family:'Scheherazade New',serif;direction:rtl}
</style>`;

const GRADS = [
  ["#E3F8EC", "#DDF0FF", "#12A15A", "#0A9488"], ["#FFF1D6", "#FFE3EC", "#E8590C", "#FF4F7B"], ["#E6F4FF", "#EDE7FF", "#2F6FEA", "#8B5CF6"],
  ["#FFE9F0", "#FFF4D6", "#FF4F7B", "#FF9500"], ["#E3F8EC", "#FFF5D6", "#12A15A", "#E0A100"], ["#FFF4D6", "#FFE3D6", "#E8590C", "#E0A100"],
  ["#EDE7FF", "#E0F4FF", "#7C3AED", "#2F6FEA"], ["#FFF8E1", "#E9F7EF", "#B7791F", "#12A15A"], ["#E6F4FF", "#E3F8EC", "#0A84FF", "#12A15A"],
  ["#1A2050", "#132B45", "#FFD66B", "#6EE7B7"]
];

function banner({ dev, lang, i, cap, shot, mo, base }) {
  const g = GRADS[i % GRADS.length], dark = i === 9, P = dev === "ipad";
  const W = P ? 1032 : 402, H = P ? 1376 : 874;
  const s = P ? 1.9 : 1;                      // type scale
  const fw = P ? 690 : 286, fh = Math.round(fw * (P ? 1376 / 1032 : 874 / 402)), bez = P ? 16 : 10, rad = P ? 44 : 46;
  const top = P ? 380 : 238, moW = P ? 360 : 178, moLeft = i % 2 === 1;
  return HEAD(base) + `<style>
body{width:${W}px;height:${H}px;background:radial-gradient(120% 60% at 0% 0%,${g[0]},transparent 70%),radial-gradient(120% 60% at 100% 100%,${g[1]},transparent 70%),${dark ? "#0E1530" : "#F6F8FC"};position:relative}
.k{position:absolute;top:${26 * s}px;left:50%;transform:translateX(-50%);padding:${5 * s}px ${12 * s}px;border-radius:99px;background:${dark ? "rgba(255,255,255,.1)" : "#fff"};color:${dark ? "#E6ECFF" : "#3A4656"};font-weight:900;font-size:${10.5 * s}px;letter-spacing:.14em;box-shadow:0 6px 14px -10px rgba(30,60,110,.5);white-space:nowrap}
h1{position:absolute;top:${58 * s}px;left:16px;right:16px;text-align:center;font-size:${30 * s}px;line-height:1.08;letter-spacing:-.01em;color:${dark ? "#fff" : "#152230"}}
h1 em{font-style:normal;background:linear-gradient(95deg,${g[2]},${g[3]});-webkit-background-clip:text;background-clip:text;color:transparent;display:block}
.sub{position:absolute;top:${134 * s}px;left:22px;right:22px;text-align:center;font-weight:700;font-size:${13.2 * s}px;color:${dark ? "#C3CCE0" : "#4A5563"};line-height:1.35}
.pills{position:absolute;top:${(P ? 168 : 178) * s - (P ? 0 : 6)}px;left:0;right:0;display:flex;gap:${7 * s}px;justify-content:center}
.pills span{padding:${4 * s}px ${10 * s}px;border-radius:99px;background:${dark ? "rgba(255,255,255,.12)" : "#fff"};color:${dark ? "#fff" : "#1E2A38"};font-weight:900;font-size:${11 * s}px;box-shadow:0 6px 12px -10px rgba(30,60,110,.6)}
.pills span::before{content:"✓ ";color:#22C06E}
.phone{position:absolute;top:${top}px;left:50%;width:${fw + bez * 2}px;height:${fh + bez * 2}px;margin-left:-${fw / 2 + bez}px;border-radius:${rad}px;background:#141A26;padding:${bez}px;
  box-shadow:0 0 0 2px #2A3242 inset,0 40px 60px -30px rgba(20,30,60,.55)}
.phone img{width:${fw}px;height:${fh}px;border-radius:${rad - bez}px;display:block;object-fit:cover}
.isl{position:absolute;top:${bez + (P ? 0 : 9)}px;left:50%;width:${P ? 0 : 84}px;height:${P ? 0 : 24}px;margin-left:-42px;border-radius:14px;background:#0B0F18}
.mo{position:absolute;bottom:${P ? -30 : -12}px;${moLeft ? "left" : "right"}:${P ? 24 : -18}px;width:${moW}px;filter:drop-shadow(0 18px 22px rgba(30,50,90,.35));${moLeft ? "transform:scaleX(-1)" : ""}}
</style></head><body>
<div class="k">${cap.k}</div>
<h1 class="fun">${cap.t1}<em>${cap.t2}</em></h1>
<div class="sub">${cap.sub}</div>
${cap.pills ? `<div class="pills">${cap.pills.map((p) => `<span>${p}</span>`).join("")}</div>` : ""}
<div class="phone"><img src="${shot}"><div class="isl"></div></div>
<img class="mo" src="tools/kit/art/mo-${mo}.png">
</body></html>`;
}

/* 1024 × 1024 app icon (no transparency, square — Apple rounds the corners) */
function icon(base) {
  return HEAD(base) + `<style>
body{width:512px;height:512px;background:radial-gradient(90% 70% at 30% 10%,#5BE38A,transparent 70%),linear-gradient(160deg,#22C06E,#0A7A55);position:relative}
.sheen{position:absolute;left:-20%;right:-20%;top:-38%;height:75%;border-radius:50%;background:linear-gradient(180deg,rgba(255,255,255,.35),rgba(255,255,255,0))}
.card{position:absolute;left:44px;top:58px;width:290px;height:220px;border-radius:52px;background:#fff;transform:rotate(-7deg);box-shadow:0 14px 0 rgba(0,60,30,.18);display:grid;place-items:center}
.card .ar{font-size:150px;line-height:1;color:#0A7A55;margin-top:-14px}
.star{position:absolute;left:300px;top:44px;width:96px}
.mo{position:absolute;right:-70px;bottom:-110px;width:430px;filter:drop-shadow(0 12px 16px rgba(0,50,30,.35))}
</style></head><body><div class="sheen"></div><div class="card"><span class="ar">أَ بَ</span></div>
<svg class="star" viewBox="0 0 48 48"><path d="M24 4.5l5.6 11.6 12.7 1.7-9.3 8.8 2.3 12.6L24 33.2l-11.3 6 2.3-12.6-9.3-8.8 12.7-1.7z" fill="#FFC93D" stroke="#F08C00" stroke-width="3" stroke-linejoin="round"/></svg>
<img class="mo" src="tools/kit/art/mo-pose-05.png"></body></html>`;
}

/* Header 16:9 (2622×1475 css → 5244×2950) and Search 3:2 (1920×1280 css → 3840×2560) */
function wide({ w, h, lang, shots, base, scene }) {
  const t = lang === "id"
    ? { k: "BABY MO HIJAIYAH", t1: "Belajar ngaji", t2: "sambil bermain", sub: "Dari alif sampai Al-Qur'an · 77 level · metode Iqra & Ummi" }
    : { k: "BABY MO HIJAIYAH", t1: "Learn to read", t2: "the Qur'an through play", sub: "From alif to short surahs · 77 levels · Iqra & Ummi method" };
  const u = w / 1920;
  const tiles = ["أَ", "بَ", "تَ", "ثَ", "جَ", "مِ", "نُ", "قُرْآن"];
  return HEAD(base) + `<style>
body{width:${w}px;height:${h}px;position:relative;background:#EAF6FF}
.scene.pd-scene{position:absolute;inset:0;top:0;height:100%;-webkit-mask-image:none;mask-image:none}.scene svg{width:100%;height:100%}
.txt{position:absolute;left:${120 * u}px;top:${h * 0.13}px;width:${980 * u}px}
.k{display:inline-block;padding:${10 * u}px ${24 * u}px;border-radius:99px;background:#fff;font-weight:900;letter-spacing:.14em;font-size:${22 * u}px;color:#3A4656;box-shadow:0 10px 24px -16px rgba(30,60,110,.6)}
h1{margin-top:${26 * u}px;font-size:${108 * u}px;line-height:1.02;color:#152230}
h1 em{font-style:normal;display:block;background:linear-gradient(95deg,#12A15A,#10B5A0 40%,#2F9BEA 75%,#8B6CF5);-webkit-background-clip:text;background-clip:text;color:transparent}
p{margin-top:${24 * u}px;font-size:${30 * u}px;font-weight:800;color:#3A4656;background:rgba(255,255,255,.82);display:inline-block;padding:${10 * u}px ${22 * u}px;border-radius:${20 * u}px;white-space:nowrap}
.ph{position:absolute;bottom:${-h * 0.18}px;width:${330 * u}px;border-radius:${46 * u}px;background:#141A26;padding:${11 * u}px;box-shadow:0 40px 70px -30px rgba(20,30,60,.6)}
.ph img{width:100%;display:block;border-radius:${36 * u}px}
.p1{right:${430 * u}px;transform:rotate(-6deg)}.p2{right:${90 * u}px;bottom:${-h * 0.10}px;transform:rotate(5deg)}
.mo{position:absolute;right:${560 * u}px;bottom:${-30 * u}px;width:${470 * u}px;filter:drop-shadow(0 26px 30px rgba(30,50,90,.35));z-index:3}
.tile{position:absolute;background:#fff;border-radius:${26 * u}px;padding:${6 * u}px ${20 * u}px;box-shadow:0 14px 26px -16px rgba(30,60,110,.55);font-size:${64 * u}px;color:#0A7A55;line-height:1.5}
</style><link rel="stylesheet" href="css/scene.css"></head><body><div class="scene pd-scene">${scene}</div>
${tiles.map((x, i) => `<div class="tile ar" style="left:${(980 + (i % 4) * 150) * u}px;top:${(90 + Math.floor(i / 4) * 130 + (i % 2) * 40) * u}px;transform:rotate(${(i % 3 - 1) * 8}deg)">${x}</div>`).join("")}
<div class="txt"><span class="k">${t.k}</span><h1 class="fun">${t.t1}<em>${t.t2}</em></h1><p>${t.sub}</p></div>
<div class="ph p1"><img src="${shots[0]}"></div><div class="ph p2"><img src="${shots[1]}"></div>
<img class="mo" src="tools/kit/art/mo-pose-41.png"></body></html>`;
}

module.exports = { banner, icon, wide };
