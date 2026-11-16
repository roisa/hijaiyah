#!/usr/bin/env node
/* Copies the web game into dist/ for Capacitor (iOS / Android) and marks it as the app build:
   no online murottal fallback (Kids Category: no third-party requests). Run tools/fetch-murottal.sh first
   so the recitation is bundled. Then: npx cap sync */
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, ".."), dist = path.join(root, "dist");
fs.rmSync(dist, { recursive: true, force: true });
for (const p of ["index.html", "manifest.webmanifest", "css", "js", "assets", "audio"]) fs.cpSync(path.join(root, p), path.join(dist, p), { recursive: true });
const ix = path.join(dist, "index.html");
/* HJ_APP_BUILD gates JS (no CDN, no share links); html.hj-app scopes the app-only CSS overrides
   at the bottom of css/app.css (navbar etc.). Neither exists on the web build, so web changes
   merge into the app without clashing — just rerun npm run ios. */
fs.writeFileSync(ix, fs.readFileSync(ix, "utf8").replace("<div id=\"app\"></div>",
  "<div id=\"app\"></div>\n<script>window.HJ_APP_BUILD=1;document.documentElement.classList.add(\"hj-app\")</script>"));
console.log("dist/ ready", fs.existsSync(path.join(root, "audio/quran")) ? "" : "(warning: audio/quran missing — run tools/fetch-murottal.sh)");
