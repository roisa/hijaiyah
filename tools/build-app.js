#!/usr/bin/env node
/* Copies the web game into dist/ for Capacitor (iOS / Android) and marks it as the app build:
   no online murottal fallback (Kids Category: no third-party requests). Run tools/fetch-murottal.sh first
   so the recitation is bundled. Then: npx cap sync */
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const root = path.join(__dirname, ".."), dist = path.join(root, "dist");
// the Qur'an recitation must be inside the app (no streaming in the app build): fetch whatever is missing first
const QN = 86;   // ayahs of the 15 surahs in Book 7 (tools/fetch-murottal.sh)
const have = () => fs.existsSync(path.join(root, "audio/quran")) ? fs.readdirSync(path.join(root, "audio/quran")).filter(f => /\.mp3$/.test(f)).length : 0;
if (have() < QN) {
  console.log(`audio/quran has ${have()}/${QN} ayahs — downloading the murottal (tools/fetch-murottal.sh)…`);
  try { execFileSync("bash", [path.join(root, "tools/fetch-murottal.sh")], { stdio: "inherit", cwd: root }); } catch (e) { /* reported below */ }
}
fs.rmSync(dist, { recursive: true, force: true });
for (const p of ["index.html", "manifest.webmanifest", "css", "js", "assets", "audio"]) fs.cpSync(path.join(root, p), path.join(dist, p), { recursive: true });
const ix = path.join(dist, "index.html");
/* HJ_APP_BUILD gates JS (no CDN, no share links); html.hj-app scopes the app-only CSS overrides
   at the bottom of css/app.css (navbar etc.). Neither exists on the web build, so web changes
   merge into the app without clashing — just rerun npm run ios. */
fs.writeFileSync(ix, fs.readFileSync(ix, "utf8").replace("<div id=\"app\"></div>",
  "<div id=\"app\"></div>\n<script>window.HJ_APP_BUILD=1;document.documentElement.classList.add(\"hj-app\")</script>"));
if (have() < QN) console.log(`\n⚠️  WARNING: only ${have()}/${QN} Qur'an recitation files in audio/quran — the Qur'an steps will ask a parent to read.\n    Connect to the internet and run: bash tools/fetch-murottal.sh   (then npm run build:app again)\n`);
console.log("dist/ ready", have() >= QN ? `(murottal ${have()}/${QN} ✓)` : "");
