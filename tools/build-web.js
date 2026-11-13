#!/usr/bin/env node
/* Copies the playable web game into site/ for GitHub Pages (or any static host).
   Only what the game needs: no tools, docs or source notes. */
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, ".."), out = path.join(root, process.argv[2] || "site");
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out);
for (const p of ["index.html", "manifest.webmanifest", "sw.js", "css", "js", "assets", "audio", "kit", "app"])
  if (fs.existsSync(path.join(root, p))) fs.cpSync(path.join(root, p), path.join(out, p), { recursive: true });
fs.writeFileSync(path.join(out, ".nojekyll"), "");            // serve files as they are (no Jekyll)
fs.copyFileSync(path.join(out, "index.html"), path.join(out, "404.html"));
console.log("site ready:", out);
