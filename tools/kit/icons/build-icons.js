#!/usr/bin/env node
/* Renders icon concepts and an evaluation sheet: each concept large, then at real home-screen sizes
   (120, 60 and 40 px) on a light and a dark wallpaper next to other icons, and in grayscale (contrast check).
   Usage: node tools/kit/icons/build-icons.js [out-dir] [concept letters…]   (needs `npm start`) */
const fs = require("fs"), path = require("path"), { chromium } = require("playwright");
const { C } = require("./concepts");
const ROOT = path.join(__dirname, "../../.."), BASE = "http://127.0.0.1:8811/";
const out = process.argv[2] || "/tmp/icons", pick = process.argv.slice(3);
fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch(), keys = pick.length ? pick : Object.keys(C);
  const tmp = path.join(ROOT, "tools/kit/_icon.html");
  for (const k of keys) {
    fs.writeFileSync(tmp, C[k](BASE));
    const p = await b.newPage({ viewport: { width: 512, height: 512 }, deviceScaleFactor: 2 });
    await p.goto(BASE + "tools/kit/_icon.html"); await p.evaluate("document.fonts.ready"); await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(out, `icon-${k}.png`) }); await p.close();
  }
  fs.unlinkSync(tmp);
  // evaluation sheet
  const others = ["games/hijaiyah.svg", "ui/calendar.svg", "ui/sticker.svg", "games/huruf-hijaiyah.svg", "ui/mission.svg"].map((f) => "/home/user/babymo-app/www/icons/" + f);
  const img = (f) => "data:image/png;base64," + fs.readFileSync(f).toString("base64");
  const svg = (f) => fs.existsSync(f) ? "data:image/svg+xml;base64," + fs.readFileSync(f).toString("base64") : "";
  const row = (k, s, dark) => `<div style="display:flex;gap:${s * .35}px;align-items:center;padding:${s * .3}px;border-radius:14px;background:${dark ? "linear-gradient(135deg,#1b2340,#3a2a5a)" : "linear-gradient(135deg,#bfe3ff,#ffd6e6)"}">
    ${[0, 1, 2].map((i) => `<img src="${svg(others[i])}" style="width:${s}px;height:${s}px;border-radius:${s * .225}px">`).join("")}
    <img src="${img(path.join(out, `icon-${k}.png`))}" style="width:${s}px;height:${s}px;border-radius:${s * .225}px">
    ${[3, 4].map((i) => `<img src="${svg(others[i])}" style="width:${s}px;height:${s}px;border-radius:${s * .225}px">`).join("")}</div>`;
  const html = `<!doctype html><body style="margin:0;font:14px sans-serif;background:#fff;display:flex;flex-wrap:wrap;gap:18px;padding:18px;width:${keys.length * 360}px">` +
    keys.map((k) => `<div style="width:340px;display:flex;flex-direction:column;gap:10px"><b style="font-size:20px">${k}</b>
    <img src="${img(path.join(out, `icon-${k}.png`))}" style="width:300px;height:300px;border-radius:66px;box-shadow:0 10px 24px rgba(0,0,0,.2)">
    ${row(k, 60, false)}${row(k, 60, true)}${row(k, 40, false)}
    <div style="display:flex;gap:10px"><img src="${img(path.join(out, `icon-${k}.png`))}" style="width:120px;height:120px;border-radius:27px;filter:grayscale(1)"><img src="${img(path.join(out, `icon-${k}.png`))}" style="width:29px;height:29px;border-radius:7px"></div></div>`).join("") + "</body>";
  const p = await b.newPage({ viewport: { width: keys.length * 360 + 40, height: 900 } });
  await p.setContent(html); await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(out, "sheet.png"), fullPage: true });
  await b.close(); console.log("icons:", keys.join(" "), "→", out);
})();
