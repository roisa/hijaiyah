#!/usr/bin/env node
/* Renders the reels in kit/reels/reels.js to MP4 (1080 × 1920, 30 fps, H.264 + sound effects) and cover images.
   Needs the game served at http://127.0.0.1:8811/ (npm start), Playwright, ffmpeg and Python 3 with numpy.
   Usage:
     node tools/reels/render.js                 every reel, Indonesian and English
     node tools/reels/render.js trace pop       only these reels
     node tools/reels/render.js my-reel.json    a reel saved from the reel editor (kit/reels/editor.html)
     LANGS=id node tools/reels/render.js        only one language
   Output: kit/reels/video/<id>-<lang>.mp4, kit/reels/video/<id>-<lang>.jpg (cover), kit/reels/video/<id>-<lang>-thumb.webp */
const fs = require("fs"), path = require("path"), os = require("os"), { execFileSync } = require("child_process");
const { chromium } = require("playwright");
const ROOT = path.join(__dirname, "../.."), OUT = path.join(ROOT, "kit/reels/video"), BASE = "http://127.0.0.1:8811/";
fs.mkdirSync(OUT, { recursive: true });

// which reels
global.window = global; require(path.join(ROOT, "kit/reels/reels.js"));
let reels = window.REELS, args = process.argv.slice(2), extra = [];
for (const a of args) if (a.endsWith(".json")) extra.push(JSON.parse(fs.readFileSync(a, "utf8")));
if (extra.length) reels = extra; else if (args.length) reels = reels.filter((r) => args.includes(r.id));
const LANGS = (process.env.LANGS || "id,en").split(",");

(async () => {
  const b = await chromium.launch();
  for (const reel of reels) for (const lang of LANGS) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "reel-"));
    const page = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
    const frames = []; const cdp = await page.context().newCDPSession(page);
    cdp.on("Page.screencastFrame", (f) => { frames.push({ ts: f.metadata.timestamp, data: f.data }); cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {}); });
    // a reel from a JSON file is injected into the page before it plays
    if (extra.includes(reel)) await page.addInitScript((r) => { window.__EXTRA_REEL = r; }, reel);
    await page.goto(BASE + `kit/reels/reel.html?reel=${encodeURIComponent(reel.id)}&lang=${lang}&rec=1`);
    await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: 1080, maxHeight: 1920, everyNthFrame: 1 });
    await page.waitForFunction(() => window.REEL && REEL.playing, null, { timeout: 30000 });
    const startWall = await page.evaluate(() => REEL.startWall);
    await page.waitForFunction(() => window.FINISHED === true, null, { timeout: (reel.dur + 20) * 1000, polling: 200 });
    await cdp.send("Page.stopScreencast");
    const log = await page.evaluate(() => REEL.log);
    await page.close();

    // frames → constant 30 fps video between the start and the end of the reel
    const t0 = startWall / 1000, dur = reel.dur;
    frames.sort((a, c) => a.ts - c.ts);
    const list = [];
    let first = frames.findIndex((f) => f.ts >= t0); if (first < 0) first = frames.length - 1; if (first > 0) first--;   // the frame on screen at t0
    const use = frames.slice(first).filter((f) => f.ts < t0 + dur);
    use.forEach((f, i) => { const name = `f${String(i).padStart(5, "0")}.jpg`; fs.writeFileSync(path.join(tmp, name), Buffer.from(f.data, "base64"));
      const start = Math.max(t0, f.ts), end = i + 1 < use.length ? Math.max(t0, use[i + 1].ts) : t0 + dur; list.push(`file '${name}'\nduration ${Math.max(0.001, end - start).toFixed(4)}`); });
    list.push(`file 'f${String(use.length - 1).padStart(5, "0")}.jpg'`);
    fs.writeFileSync(path.join(tmp, "list.txt"), list.join("\n"));
    fs.writeFileSync(path.join(tmp, "log.json"), JSON.stringify(log));
    execFileSync("python3", ["-I", path.join(__dirname, "sfx.py"), path.join(tmp, "log.json"), String(dur), path.join(tmp, "sfx.wav")]);
    const mp4 = path.join(OUT, `${reel.id}-${lang}.mp4`);
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", path.join(tmp, "list.txt"), "-i", path.join(tmp, "sfx.wav"),
      "-vf", "fps=30,format=yuv420p", "-c:v", "libx264", "-preset", "medium", "-crf", "24", "-profile:v", "high", "-movflags", "+faststart",
      "-c:a", "aac", "-b:a", "96k", "-shortest", "-t", String(dur), mp4]);
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", String(reel.cover || dur / 2), "-i", mp4, "-frames:v", "1", "-q:v", "3", path.join(OUT, `${reel.id}-${lang}.jpg`)]);
    execFileSync("python3", ["-I", "-c", `from PIL import Image;im=Image.open(${JSON.stringify(path.join(OUT, `${reel.id}-${lang}.jpg`))});im.thumbnail((360,640));im.save(${JSON.stringify(path.join(OUT, `${reel.id}-${lang}-thumb.webp`))},'WEBP',quality=80)`]);
    fs.rmSync(tmp, { recursive: true, force: true });
    const mb = (fs.statSync(mp4).size / 1e6).toFixed(1);
    console.log(`${reel.id}-${lang}.mp4  ${dur}s  ${use.length} frames  ${mb} MB`);
  }
  await b.close();
})();
