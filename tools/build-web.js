#!/usr/bin/env node
/* Copies the playable web game into site/ for GitHub Pages (or any static host).
   Only what the game needs (+ the tools/rekam voice pages): no build tools, docs or source notes. */
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, ".."), out = path.join(root, process.argv[2] || "site");
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out);
for (const p of ["index.html", "manifest.webmanifest", "sw.js", "css", "js", "assets", "audio", "kit", "app"])
  if (fs.existsSync(path.join(root, p))) fs.cpSync(path.join(root, p), path.join(out, p), { recursive: true });
// the voice recording / listening pages (web-only developer tools: https://roisa.github.io/hijaiyah/tools/rekam/),
// only the pages and their data — never the node / python scripts in tools/
fs.mkdirSync(path.join(out, "tools", "rekam"), { recursive: true });
for (const f of ["index.html", "dengar.html", "rekam-data.js"])
  if (fs.existsSync(path.join(root, "tools", "rekam", f))) fs.copyFileSync(path.join(root, "tools", "rekam", f), path.join(out, "tools", "rekam", f));
fs.writeFileSync(path.join(out, ".nojekyll"), "");            // serve files as they are (no Jekyll)
fs.copyFileSync(path.join(out, "index.html"), path.join(out, "404.html"));
console.log("site ready:", out);
