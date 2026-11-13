#!/usr/bin/env node
/* Copies the web game into dist/ for Capacitor (iOS / Android) and marks it as the app build:
   no online murottal fallback (Kids Category: no third-party requests). Run tools/fetch-murottal.sh first
   so the recitation is bundled. Then: npx cap sync */
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, ".."), dist = path.join(root, "dist");
fs.rmSync(dist, { recursive: true, force: true });
for (const p of ["index.html", "manifest.webmanifest", "css", "js", "assets", "audio"]) fs.cpSync(path.join(root, p), path.join(dist, p), { recursive: true });
const ix = path.join(dist, "index.html");
fs.writeFileSync(ix, fs.readFileSync(ix, "utf8").replace("<div id=\"app\"></div>", "<div id=\"app\"></div>\n<script>window.HJ_APP_BUILD=1</script>"));
console.log("dist/ ready", fs.existsSync(path.join(root, "audio/quran")) ? "" : "(warning: audio/quran missing — run tools/fetch-murottal.sh)");
