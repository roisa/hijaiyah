#!/usr/bin/env node
/* Builds the App Store kit for Baby Mo Hijaiyah into kit/ (published at https://roisa.github.io/hijaiyah/kit/):
   1. real screenshots of the game at Apple's sizes (iPhone 1206×2622, iPad 13" 2064×2752), ID + EN
   2. caption banners (same style as the Baby Mo kit, render-1 Baby Mo)
   3. 1024 app icon, header 16:9 (5244×2950) and search 3:2 (3840×2560)
   4. kit/index.html: every image to download (one, a group, or all as ZIP) + listing text ready to copy
   Needs the game served at http://127.0.0.1:8811/ (npm start) and Playwright.
   Usage: node tools/kit/build-kit.js [--skip-shots] */
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const { chromium } = require("playwright");
const T = require("./templates"), C = require("./content");
const ROOT = path.join(__dirname, "../.."), KIT = path.join(ROOT, "kit"), BASE = "http://127.0.0.1:8811/";
const DEV = { iphone: { w: 402, h: 874, dsf: 3, px: "1206 × 2622" }, ipad: { w: 1032, h: 1376, dsf: 2, px: "2064 × 2752" } };
const LANGS = ["id", "en"], NAME = { id: "Ibra", en: "Zayd" };
for (const d of ["raw", "banners", "creative", "thumbs"]) fs.mkdirSync(path.join(KIT, d), { recursive: true });

// put the game in a nice, believable state for each screen
const STATE = (lang, dark) => `(function(){localStorage.clear();var s=HJ.store.get();s.lang=${JSON.stringify(lang)};s.langChosen=true;s.name=${JSON.stringify(NAME[lang])};
s.theme=${JSON.stringify(dark ? "dark" : "light")};s.settings.moVoice=false;s.settings.sfx=false;s.settings.cdn=false;
var d=new Date(),t=d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
["1-1","1-2","1-3","1-4","1-5","1-6","1-7"].forEach(function(id,i){s.stars[id]=i%3===1?2:3;s.stickers.push(id);s.tashih[id]=i<4?1:0;});
s.streak={last:t,n:4};s.plays=12;s.seen={pick:1,yesno:1,pop:1,train:1,bridge:1,match:1,build:1,sort:1,learn:1,trace:1,ayahbuild:1,ayahfill:1};s.daily={date:t,done:{level:1}};HJ.store.save();})()`;

async function scene(p, key) {
  const go = (js) => p.evaluate(js);
  const step = async (id, type, unlock) => {
    await go(`HJ.store.setting("unlockAll",${!!unlock});HJ.runLevel(HJ.level(${JSON.stringify(id)}))`);
    for (let i = 0; i < 20; i++) { await p.waitForTimeout(120); const t = await go("HJ._ctx&&HJ._ctx.step.type"); if (t === type) break; await go("HJ._ctx.next()"); }
  };
  switch (key) {
    case "home": await go("HJ.go.home()"); await p.waitForTimeout(1200); break;
    case "learn": await step("1-8", "learn"); await p.waitForTimeout(1300); break;
    case "train": await step("1-8", "train"); await go("document.querySelectorAll('.car')[1].classList.add('on')"); await p.waitForTimeout(600); break;
    case "pop": await step("1-8", "pop"); await p.waitForTimeout(3300); break;
    case "map": await go("HJ.go.map()"); await p.waitForTimeout(900); break;
    case "results":
      await step("1-8", "intro"); for (let i = 0; i < 30; i++) { const a = await go("!!(HJ._ctx&&HJ._ctx.alive())"); if (!a) break; await go("HJ._ctx.next()"); await p.waitForTimeout(60); }
      await p.waitForTimeout(3200); await go("document.querySelectorAll('.confetti,.toast').forEach(function(x){x.remove()})"); break;
    case "tajwid": await step("6-5", "sort", true); await p.waitForTimeout(900); break;
    case "ayah": await step("7-1", "ayah", true); await go("HJ._ctx.next()"); await p.waitForTimeout(900); break;
    case "trace": {
      // a child half-way through ج: painted road, ink, moving arrows ahead
      await go(`HJ.runLevel(HJ.level("1-1"),{steps:[{type:"trace",glyph:"ج"}],noReplay:true})`); await p.waitForTimeout(2600);
      const box = await go(`(function(){var r=document.querySelector(".tr-ink").getBoundingClientRect();return {x:r.left,y:r.top,w:r.width}})()`);
      const pts = await go(`(function(){var s=document.createElementNS("http://www.w3.org/2000/svg","svg");document.body.appendChild(s);var pe=document.createElementNS("http://www.w3.org/2000/svg","path");pe.setAttribute("d",HJ.strokes("jim")[0]);s.appendChild(pe);var L=pe.getTotalLength(),o=[];for(var i=0;i<=50;i++){var q=pe.getPointAtLength(L*i/50);o.push([q.x,q.y]);}s.remove();return o;})()`);
      const X = (u) => box.x + u / 100 * box.w, Y = (v) => box.y + v / 100 * box.w;
      await p.mouse.move(X(pts[0][0]), Y(pts[0][1])); await p.mouse.down();
      for (const q of pts.slice(1, 31)) await p.mouse.move(X(q[0] + Math.sin(q[1]) * 1.2), Y(q[1] + Math.cos(q[0]) * 1.2));
      await p.waitForTimeout(500); break;
    }
    case "dark": await go("HJ.go.home()"); await p.waitForTimeout(1200); break;
  }
  await go("document.querySelectorAll('.jp,.jfly,.jbanner,.toast,.tap-hand').forEach(function(x){x.remove()})");
}

(async () => {
  const b = await chromium.launch();
  const shotPath = (dev, lang, i, key) => `raw/${dev}-${lang}-${String(i + 1).padStart(2, "0")}-${key}.jpg`;
  if (!process.argv.includes("--skip-shots")) {
    for (const dev of Object.keys(DEV)) for (const lang of LANGS) {
      const D = DEV[dev];
      for (let i = 0; i < C.SHOTS.length; i++) {
        const key = C.SHOTS[i].key, dark = key === "dark";
        const ctx = await b.newContext({ viewport: { width: D.w, height: D.h }, deviceScaleFactor: D.dsf, colorScheme: dark ? "dark" : "light" });
        const p = await ctx.newPage();
        await p.goto(BASE); await p.evaluate(STATE(lang, dark)); await p.reload(); await p.waitForTimeout(700);
        // a real iPhone keeps the top (Dynamic Island, clock) and the home bar free: give the game the same safe areas
        const inset = dev === "iphone" ? { t: 54, b: 30 } : { t: 24, b: 20 };
        await p.addStyleTag({ content: `#app{padding-top:${inset.t}px!important}.tabbar{bottom:${inset.b}px!important}.stage{padding-bottom:${inset.b + 12}px!important}
          .panel{padding-bottom:${inset.b + 22}px!important}.bubble-wrap{bottom:${inset.b - 6}px!important}
          .sbar{position:fixed;z-index:999;top:0;left:0;right:0;height:${inset.t}px;display:flex;align-items:center;justify-content:space-between;padding:${dev === "iphone" ? "6px 34px 0 40px" : "0 22px"};font:700 ${dev === "iphone" ? 16 : 13}px -apple-system,'Nunito',sans-serif;pointer-events:none}
          .sbar i{display:inline-block;width:25px;height:12px;border-radius:4px;border:1.5px solid currentColor;position:relative;margin-left:6px}.sbar i::after{content:"";position:absolute;inset:1.5px;right:4px;border-radius:2px;background:currentColor}` });
        await p.evaluate((d) => { const s = document.createElement("div"); s.className = "sbar"; s.innerHTML = "<span>9:41</span><span>" + (d === "ipad" ? "100% " : "") + "<i></i></span>";
          s.style.color = document.documentElement.getAttribute("data-theme") === "dark" ? "#fff" : "#152230"; document.body.appendChild(s); }, dev);
        await p.evaluate("document.fonts.ready"); await scene(p, key);
        await p.screenshot({ path: path.join(KIT, shotPath(dev, lang, i, key)), type: "jpeg", quality: 90 });
        await ctx.close();
        process.stdout.write(".");
      }
    }
    console.log(" screenshots");
  }
  // banners
  const tmp = path.join(ROOT, "tools/kit/_render.html");
  async function render(html, w, h, dsf, out, type) {
    fs.writeFileSync(tmp, html);
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dsf }); const p = await ctx.newPage();
    await p.goto(BASE + "tools/kit/_render.html"); await p.evaluate("document.fonts.ready"); await p.waitForTimeout(250);
    await p.screenshot({ path: out, type: type || "jpeg", quality: type === "png" ? undefined : 92 }); await ctx.close();
  }
  for (const dev of Object.keys(DEV)) for (const lang of LANGS) for (let i = 0; i < C.SHOTS.length; i++) {
    const s = C.SHOTS[i], D = DEV[dev];
    await render(T.banner({ dev, lang, i, cap: s[lang], shot: "kit/" + shotPath(dev, lang, i, s.key), mo: s.mo, base: BASE }), D.w, D.h, D.dsf,
      path.join(KIT, `banners/${dev}-${lang}-${String(i + 1).padStart(2, "0")}.jpg`));
    process.stdout.write("+");
  }
  console.log(" banners");
  await render(T.icon(BASE), 512, 512, 2, path.join(KIT, "creative/app-icon-1024.png"), "png");
  const sceneSvg = fs.readFileSync(path.join(ROOT, "js/scene.js"), "utf8").match(/HJ_SCENE='([\s\S]*)';/)[1];
  for (const lang of LANGS) {
    const shots = [`kit/${shotPath("iphone", lang, 0, "home")}`, `kit/${shotPath("iphone", lang, 1, "learn")}`];
    await render(T.wide({ w: 2622, h: 1475, lang, shots, base: BASE, scene: sceneSvg }), 2622, 1475, 2, path.join(KIT, `creative/header-16x9-${lang}.png`), "png");
    await render(T.wide({ w: 1920, h: 1280, lang, shots, base: BASE, scene: sceneSvg }), 1920, 1280, 2, path.join(KIT, `creative/search-3x2-${lang}.png`), "png");
  }
  fs.unlinkSync(tmp);
  await b.close();
  console.log("creative");
  // thumbnails (webp) with Python/Pillow
  execFileSync("python3", ["-I", "-c", `
import glob,os
from PIL import Image
k=${JSON.stringify(KIT)}
for f in glob.glob(k+'/raw/*.jpg')+glob.glob(k+'/banners/*.jpg')+glob.glob(k+'/creative/*.png'):
    d=os.path.basename(os.path.dirname(f)); n=os.path.splitext(os.path.basename(f))[0]
    im=Image.open(f).convert('RGB'); w=520 if d=='creative' else 300; im.thumbnail((w,w*3))
    im.save(k+'/thumbs/'+d+'-'+n+'.webp','WEBP',quality=80)
`], { stdio: "inherit" });
  require("./page").write(KIT, C, DEV);
  console.log("kit/index.html");
})();
