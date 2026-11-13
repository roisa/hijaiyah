/* Writes kit/index.html — the App Store kit page for Baby Mo Hijaiyah (same layout as babymo.id/app-store-kit). */
const fs = require("fs"), path = require("path");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const len = (v, bytes) => bytes ? Buffer.byteLength(v, "utf8") : [...v].length;

function reelsHtml(KIT) {
  // reels: kit/reels/reels.js (the scripts) + kit/reels/video/ (made by tools/reels/render.js)
  global.window = global; delete require.cache[require.resolve(path.join(KIT, "reels/reels.js"))]; require(path.join(KIT, "reels/reels.js"));
  const R = window.REELS || [], has = (f) => fs.existsSync(path.join(KIT, "reels/video", f));
  return `<h2 id="reels">Reels &amp; stories</h2>
<p class="lead">${R.length} vertical videos (1080 × 1920, 9:16) for Instagram Reels and Stories, TikTok, YouTube Shorts and WhatsApp Status. Baby Mo (render 1) plays the real game: tracing, balloons, the reading train, the bridge, stars and stickers, the Qur'an. Each one has sound effects only (no music) — add a nasheed or voice-over in your editor if you like. Captions are ready to paste.</p>
<div class="note"><b>Make more reels · </b>Open the <a href="reels/editor.html">reel editor</a>, pick a reel, change the words, poses (render-1 Baby Mo) or timing, press Play to preview, then Download it. Render the MP4 with <code>node tools/reels/render.js my-reel.json</code> (the game must be running with <code>npm start</code>). To keep a reel for good, paste it into <code>kit/reels/reels.js</code> and run <code>node tools/reels/render.js</code>.</div>
<section class="group" id="reels-all"><div class="ghead"><div><h3>All reels · Bahasa Indonesia + English</h3><p>${R.length * 2} MP4 files · about 1.5 MB each · covers included</p></div><button class="btn" data-zip="reels-all" type="button">⬇ Download all reels (ZIP)</button></div>
<div class="reels">${R.map((r, i) => `<div class="reel">
  <video src="reels/video/${r.id}-id.mp4" poster="reels/video/${r.id}-id.jpg" controls muted playsinline preload="none" data-id="${r.id}"></video>
  <div class="rmeta"><b>${String(i + 1).padStart(2, "0")} · ${esc(r.name)}</b><small>${r.dur}s · ${esc(r.theme)}</small>
  <div class="rl">${["id", "en"].map((l) => has(`${r.id}-${l}.mp4`) ? `<a href="reels/video/${r.id}-${l}.mp4" download data-file="baby-mo-hijaiyah-reel-${r.id}-${l}.mp4">⬇ ${l.toUpperCase()} video</a><a href="reels/video/${r.id}-${l}.jpg" download data-file="baby-mo-hijaiyah-reel-${r.id}-${l}-cover.jpg">cover</a>` : "").join("")}</div>
  <div class="rl"><button class="mini" data-swap="${r.id}">▶ ID / EN</button><a href="reels/reel.html?reel=${r.id}&amp;lang=id" target="_blank">live</a><a href="reels/editor.html?reel=${r.id}">✎ edit this reel</a></div>
  ${["id", "en"].map((l) => `<div class="cap"><div class="fhead"><small>Caption · ${l === "id" ? "Bahasa Indonesia" : "English"}</small><button class="btn copy" data-copy="cap-${r.id}-${l}">Copy</button></div><div class="val" id="cap-${r.id}-${l}">${esc(r.caption ? r.caption[l] : "")}</div></div>`).join("")}
  </div></div>`).join("")}</div></section>`;
}

function write(KIT, C, DEV) {
  // fail loudly if a listing field is over Apple's limit
  for (const [k, f] of Object.entries(C.LISTING)) for (const l of ["id", "en"]) {
    const n = len(f[l], f.bytes); if (n > f.lim) throw new Error(`${k} (${l}) is ${n}/${f.lim}`);
  }
  const N = C.SHOTS.length, pad = (i) => String(i + 1).padStart(2, "0");
  const names = C.SHOTS.map((s) => s.en.t1.replace(/,$/, "") + " " + s.en.t2);
  const groups = [];
  for (const kind of ["banner", "raw"]) for (const dev of Object.keys(DEV)) for (const lang of ["id", "en"]) {
    groups.push({ id: `${kind}-${dev}-${lang}`, dev,
      title: `${kind === "banner" ? "Banners" : "Plain screenshots"} · ${dev === "iphone" ? "iPhone · Dynamic Island (medium display)" : 'iPad 13" display'} · ${lang === "id" ? "Bahasa Indonesia" : "English (U.S.)"}`,
      note: `${DEV[dev].px} px · ${N} images · ` + (kind === "raw" ? "No captions — use instead of the banners, or for the website and social posts." : lang === "id" ? "Upload to the Indonesian localization." : "Upload to the English (U.S.) localization."),
      files: C.SHOTS.map((s, i) => kind === "banner"
        ? { src: `banners/${dev}-${lang}-${pad(i)}.jpg`, th: `thumbs/banners-${dev}-${lang}-${pad(i)}.webp`, name: `${pad(i)} ${names[i]}` }
        : { src: `raw/${dev}-${lang}-${pad(i)}-${s.key}.jpg`, th: `thumbs/raw-${dev}-${lang}-${pad(i)}-${s.key}.webp`, name: `${pad(i)} ${s.key}` }) });
  }
  const tile = (f) => `<div class="tile"><img src="${f.th}" alt="${esc(f.name)}" loading="lazy"><a href="${f.src}" download data-file="${f.src.split("/").pop()}">⬇ ${esc(f.name)}</a></div>`;
  const field = (lang, k, label, where, i) => { const f = C.LISTING[k], n = len(f[lang], f.bytes), id = `f-${lang}-${i}`;
    return `<div class="field"><div class="fhead"><div><b>${label}</b> <small>· ${where}</small></div><div class="fr"><span class="count${n > f.lim ? " over" : ""}">${n} / ${f.lim}${f.bytes ? " bytes" : ""}</span><button class="btn copy" data-copy="${id}">Copy</button></div></div><div class="val" id="${id}">${esc(f[lang])}</div></div>`; };
  const FIELDS = [["name", "Name", "App Information → Localizable Information"], ["subtitle", "Subtitle", "App Information → Localizable Information"],
    ["promo", "Promotional Text", "Version → Promotional Text (can change any time)"], ["desc", "Description", "Version → Description"],
    ["keywords", "Keywords", "Version → Keywords (comma-separated, no spaces)"], ["whatsNew", "What's New in This Version", "Version → What's New (updates only)"]];

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>App Store Kit — Baby Mo Hijaiyah</title>
<link rel="icon" href="creative/app-icon-1024.png"><link rel="stylesheet" href="../assets/fonts/fonts.css">
<script src="jszip-3.10.1.min.js" defer></script>
<style>
:root{color-scheme:light;--bg:#F6F7F4;--card:#FFFFFF;--ink:#16201B;--soft:#5D6A63;--line:#E2E6E1;--accent:#12A15A;--accent-ink:#FFFFFF;--warn:#B35C00;--warn-bg:#FFF4DE;--chip:#EEF4F0}
@media (prefers-color-scheme:dark){:root{color-scheme:dark;--bg:#101412;--card:#181E1B;--ink:#E9EFEB;--soft:#9DABA3;--line:#28312C;--accent:#4FD08D;--accent-ink:#06231A;--warn:#FFC266;--warn-bg:#2A2214;--chip:#1F2824}}
*{box-sizing:border-box}html,body{margin:0;background:var(--bg);color:var(--ink)}
body{font-family:'Nunito',system-ui,sans-serif;font-size:15px;line-height:1.55}
.w{max-width:1120px;margin:0 auto;padding:28px max(16px,env(safe-area-inset-left)) 64px}
h1,h2,h3{font-family:'Fredoka','Nunito',sans-serif;margin:0;letter-spacing:-.01em}
h1{font-size:clamp(30px,5vw,44px);line-height:1.05}h2{font-size:26px;margin:44px 0 6px}h3{font-size:18px}
.lead{color:var(--soft);max-width:66ch;margin:8px 0 0}
.top{display:flex;gap:18px;align-items:center;flex-wrap:wrap}.top img{width:84px;height:84px;border-radius:20px;box-shadow:0 10px 24px -14px rgba(0,0,0,.5)}
.btn{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:10px 18px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;font-weight:800;cursor:pointer;text-decoration:none}
.btn.pri{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}.btn:disabled{opacity:.6;cursor:wait}
.bar{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:18px}
.toc{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}.toc a{font-weight:700;color:var(--ink);background:var(--chip);border-radius:999px;padding:6px 12px;text-decoration:none;font-size:14px}
.group{margin-top:22px;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px}
.ghead{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:12px}.ghead p{margin:2px 0 0;color:var(--soft);font-size:14px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:12px}.grid.ipad{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}.grid.wide{grid-template-columns:repeat(auto-fill,minmax(260px,1fr))}
.tile{display:flex;flex-direction:column;gap:6px;min-width:0}.tile img{width:100%;height:auto;border-radius:10px;border:1px solid var(--line);background:#fff;display:block}
.tile a{font-size:13px;font-weight:800;color:var(--accent);text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lang{display:flex;gap:6px;margin:10px 0 0}.lang button{font:inherit;font-weight:800;padding:7px 14px;border-radius:999px;border:1px solid var(--line);background:var(--card);color:var(--soft);cursor:pointer}
.lang button[aria-pressed=true]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.field{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px 16px;margin-top:12px;min-width:0}
.fhead{display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap}.fhead small{color:var(--soft);font-size:13px}.fr{display:flex;gap:10px;align-items:center}
.count{font-size:13px;font-weight:800;color:var(--accent);font-variant-numeric:tabular-nums}.count.over{color:#D9480F}
.val{margin-top:8px;white-space:pre-wrap;word-break:break-word;background:var(--chip);border-radius:10px;padding:10px 12px;font-size:14.5px;max-height:340px;overflow:auto}
.copy{min-height:36px;padding:6px 12px;font-size:14px}
.kv{display:grid;grid-template-columns:1fr;gap:10px;margin-top:12px}@media(min-width:760px){.kv{grid-template-columns:1fr 1fr}}
table{width:100%;border-collapse:collapse;font-size:14.5px}td{padding:8px 10px;border-top:1px solid var(--line);vertical-align:top}td:last-child{font-weight:800}
.tbl{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:6px;margin-top:12px;overflow-x:auto}
.check{list-style:none;padding:0;margin:12px 0 0;display:grid;gap:10px}.check li{display:flex;gap:12px;align-items:flex-start;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 14px}
.check input{width:22px;height:22px;margin-top:2px;accent-color:var(--accent);flex:0 0 auto}.check b{display:block}.check span{color:var(--soft);font-size:14px}.check li.done b{text-decoration:line-through;color:var(--soft)}
.note{background:var(--warn-bg);border-radius:14px;padding:12px 14px;margin-top:10px;font-size:14.5px}.note b{color:var(--warn)}
.reels{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px}
.reel{display:flex;flex-direction:column;gap:8px;background:var(--chip);border-radius:16px;padding:10px}
.reel video{width:100%;aspect-ratio:9/16;border-radius:12px;background:#000;display:block}
.rmeta b{display:block;font-size:15px}.rmeta small{color:var(--soft)}
.rl{display:flex;gap:10px;flex-wrap:wrap;margin-top:6px;align-items:center}.rl a{font-size:13px;font-weight:800;color:var(--accent);text-decoration:none}
.mini{font:inherit;font-size:13px;font-weight:800;padding:4px 10px;border-radius:99px;border:1px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer}
.cap{margin-top:8px}.cap .val{font-size:13px;max-height:140px}.cap .copy{min-height:30px;padding:3px 10px;font-size:13px}
.note a{color:var(--accent);font-weight:800}
.toast{position:fixed;left:50%;bottom:calc(20px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);background:var(--ink);color:var(--bg);padding:10px 16px;border-radius:999px;font-weight:800;opacity:0;transition:opacity .2s;pointer-events:none}.toast.on{opacity:1}
</style></head><body><main class="w">
<div class="top"><img src="creative/app-icon-1024.png" alt="Baby Mo Hijaiyah app icon"><div><h1>Baby Mo Hijaiyah · App Store Kit</h1>
<p class="lead">Everything for the App Store Connect submission: real screenshots at Apple's sizes, caption banners in Bahasa Indonesia and English, header and search artwork, and every listing field ready to copy. Made from the game itself by <code>tools/kit/build-kit.js</code>.</p></div></div>
<div class="bar"><button class="btn pri" data-zip="all" type="button">⬇ Download everything (ZIP)</button><a class="btn" href="creative/app-icon-1024.png" download="baby-mo-hijaiyah-icon-1024.png">App icon 1024 px</a><a class="btn" href="../">▶ Play the game</a></div>
<nav class="toc"><a href="#screens">Screenshots</a><a href="#creative">Header &amp; search</a><a href="#reels">Reels</a><a href="#listing">Listing text</a><a href="#info">App information</a><a href="#age">Age rating</a><a href="#privacy">App privacy</a><a href="#review">Review notes</a><a href="#checklist">Checklist</a><a href="../app/">Marketing page ↗</a></nav>

<h2 id="screens">Screenshots &amp; banners</h2>
<p class="lead">App Store Connect needs at least one image (up to 10) for <b>iPhone with Dynamic Island (medium display)</b> — 1206 × 2622 px — and for <b>iPad 13" display</b> — 2064 × 2752 px, because the app also runs on iPad. Use the banners (with captions) or the plain screenshots, per language.</p>
${groups.map((g) => `<section class="group" id="${g.id}"><div class="ghead"><div><h3>${esc(g.title)}</h3><p>${esc(g.note)}</p></div><button class="btn" data-zip="${g.id}" type="button">⬇ Download group (ZIP)</button></div>
<div class="grid${g.dev === "ipad" ? " ipad" : ""}">${g.files.map(tile).join("")}</div></section>`).join("\n")}

<h2 id="creative">Header &amp; Search Results</h2>
<p class="lead">Product Page Information → <b>Header and Search Results</b>. No transparency, as Apple requires.</p>
<section class="group" id="creative-assets"><div class="ghead"><div><h3>Header, search artwork &amp; app icon</h3><p>Baby Mo with hijaiyah letter tiles and two real screens</p></div><button class="btn" data-zip="creative-assets" type="button">⬇ Download group (ZIP)</button></div>
${[["header-16x9", "Header · 16:9", "5244 × 2950 px · PNG"], ["search-3x2", "Search Results · 3:2", "3840 × 2560 px · PNG"]].map(([b, t, s]) =>
    `<div style="margin-top:14px"><b>${t}</b> <small style="color:var(--soft)">· ${s}</small><div class="grid wide" style="margin-top:8px">${["id", "en"].map((l) => tile({ src: `creative/${b}-${l}.png`, th: `thumbs/creative-${b}-${l}.webp`, name: l === "id" ? "Bahasa Indonesia" : "English (U.S.)" })).join("")}</div></div>`).join("")}
<div style="margin-top:14px" id="icon-final"><b>App icon — final round</b> <small style="color:var(--soft)">· 1024 × 1024 px · Buddy now shows Mo from the waist up (render 1); Blast shows only Mo's head popping through the portal</small><div class="grid" style="margin-top:8px">${tile({ src: "creative/app-icon-choice-buddy-mo.png", th: "thumbs/creative-app-icon-choice-buddy-mo.webp", name: "Buddy · high-five" })}${tile({ src: "creative/app-icon-choice-buddy-mo-wave.png", th: "thumbs/creative-app-icon-choice-buddy-mo-wave.webp", name: "Buddy · waving" })}${tile({ src: "creative/app-icon-choice-blast-mo.png", th: "thumbs/creative-app-icon-choice-blast-mo.webp", name: "Blast · excited" })}${tile({ src: "creative/app-icon-choice-blast-mo-smile.png", th: "thumbs/creative-app-icon-choice-blast-mo-smile.webp", name: "Blast · smile" })}</div></div>
<div style="margin-top:14px"><b>Earlier round — 3 choices</b> <small style="color:var(--soft)">· 1024 × 1024 px · drawn from scratch: Blast off (Mo bursting out of a golden portal with بَ), Letter buddy (a friendly ب high-fiving Mo), Game badge (a gold shield with Mo and an أ ب ت ribbon)</small><div class="grid" style="margin-top:8px">${tile({ src: "creative/app-icon-choice-blast.png", th: "thumbs/creative-app-icon-choice-blast.webp", name: "Choice A · Blast off" })}${tile({ src: "creative/app-icon-choice-buddy.png", th: "thumbs/creative-app-icon-choice-buddy.webp", name: "Choice B · Letter buddy" })}${tile({ src: "creative/app-icon-choice-badge.png", th: "thumbs/creative-app-icon-choice-badge.webp", name: "Choice C · Game badge" })}</div></div>
<div style="margin-top:14px"><b>App icon (current)</b> <small style="color:var(--soft)">· 1024 × 1024 px · PNG, no transparency (Apple rounds the corners) · green is the main icon; orange and purple are alternatives (e.g. for an A/B test with Product Page Optimization)</small><div class="grid" style="margin-top:8px">${tile({ src: "creative/app-icon-1024.png", th: "thumbs/creative-app-icon-1024.webp", name: "App icon · green (main)" })}${tile({ src: "creative/app-icon-1024-orange.png", th: "thumbs/creative-app-icon-1024-orange.webp", name: "Alternative · orange" })}${tile({ src: "creative/app-icon-1024-purple.png", th: "thumbs/creative-app-icon-1024-purple.webp", name: "Alternative · purple" })}</div></div>
</section>

${reelsHtml(KIT)}

<h2 id="listing">Listing text</h2>
<p class="lead">Paste each field into App Store Connect. The counter shows Apple's limit (keywords count in bytes).</p>
<div class="lang" role="group"><button type="button" data-lang="id" aria-pressed="true">Bahasa Indonesia (primary)</button><button type="button" data-lang="en" aria-pressed="false">English (U.S.)</button></div>
${["id", "en"].map((l) => `<div data-pane="${l}"${l === "id" ? "" : " hidden"}>${FIELDS.map(([k, label, where], i) => field(l, k, label, where, i)).join("")}</div>`).join("")}

<h2 id="info">App information</h2>
<div class="kv">${C.FACTS.map(([label, value, where, note], i) => `<div class="field" style="margin-top:0"><div class="fhead"><div><b>${esc(label)}</b> <small>· ${esc(where)}</small></div><button class="btn copy" data-copy="k-${i}">Copy</button></div><div class="val" id="k-${i}">${esc(value)}</div>${note ? `<small style="color:var(--soft);display:block;margin-top:6px">${esc(note)}</small>` : ""}</div>`).join("")}</div>

<h2 id="age">Age rating</h2><p class="lead">App Information → Age Rating. With these answers the rating comes out as <b>4+</b>. Also choose <b>Made for Kids</b> and one age band.</p>
<div class="tbl"><table><tbody>${C.AGE.map(([q, a]) => `<tr><td>${esc(q)}</td><td>${esc(a)}</td></tr>`).join("")}</tbody></table></div>

<h2 id="privacy">App privacy</h2><p class="lead">App Privacy → Data Types: <b>Data Not Collected</b>.</p>
<div class="tbl"><table><tbody>${C.PRIVACY.map(([q, a]) => `<tr><td>${esc(q)}</td><td>${esc(a)}</td></tr>`).join("")}</tbody></table></div>

<h2 id="review">Notes for App Review</h2>
<div class="field"><div class="fhead"><div><b>Notes</b> <small>· App Review Information → Notes</small></div><button class="btn copy" data-copy="review-notes">Copy</button></div><div class="val" id="review-notes">${esc(C.REVIEW_NOTES)}</div></div>
<div class="field"><div class="fhead"><div><b>Export compliance</b> <small>· asked when you select a build</small></div></div><div class="val">The app makes no network requests and uses no encryption → add ITSAppUsesNonExemptEncryption = NO to Info.plist.</div></div>
<div class="field"><div class="fhead"><div><b>Content rights</b> <small>· App Information</small></div></div><div class="val">Third-party content: the Qur'an text (public domain), open-licensed fonts (SIL OFL) and the recitation audio — confirm the reciter's licence for app use before submitting (see checklist).</div></div>

<h2 id="checklist">Before you press Submit</h2>
<ul class="check">${C.CHECK.map(([t, d], i) => `<li><input type="checkbox" id="c${i}"><label for="c${i}"><b>${esc(t)}</b><span>${esc(d)}</span></label></li>`).join("")}</ul>
<div class="note"><b>Note · </b>Re-run <code>node tools/kit/build-kit.js</code> after changing the game, so the screenshots always show the latest version.</div>
</main><div class="toast" id="toast" role="status" aria-live="polite"></div>
<script>
(function(){var toast=document.getElementById('toast'),tt;function say(m){toast.textContent=m;toast.classList.add('on');clearTimeout(tt);tt=setTimeout(function(){toast.classList.remove('on')},1600)}
document.addEventListener('click',function(e){
 var c=e.target.closest('[data-copy]');if(c){var el=document.getElementById(c.getAttribute('data-copy'));(navigator.clipboard?navigator.clipboard.writeText(el.textContent):Promise.reject()).then(function(){say('Copied')}).catch(function(){var r=document.createRange();r.selectNodeContents(el);var s=getSelection();s.removeAllRanges();s.addRange(r);say('Selected — press Copy')});}
 var l=e.target.closest('[data-lang]');if(l){var v=l.getAttribute('data-lang');document.querySelectorAll('[data-lang]').forEach(function(b){b.setAttribute('aria-pressed',String(b===l))});document.querySelectorAll('[data-pane]').forEach(function(p){p.hidden=p.getAttribute('data-pane')!==v});}
 var z=e.target.closest('[data-zip]');if(z)zip(z);
 var sw=e.target.closest('[data-swap]');if(sw){var v=document.querySelector('video[data-id="'+sw.getAttribute('data-swap')+'"]'),en=/-id\.mp4$/.test(v.getAttribute('src'));
   v.src=v.getAttribute('src').replace(en?'-id.mp4':'-en.mp4',en?'-en.mp4':'-id.mp4');v.poster=v.src.replace('.mp4','.jpg');v.play();}});
function zip(btn){if(!window.JSZip){say('ZIP tool is still loading — try again');return;}
 var sel=btn.getAttribute('data-zip'),files=[].slice.call(document.querySelectorAll(sel==='all'?'[data-file]':'#'+sel+' [data-file]'));
 var z=new JSZip(),done=0,label=btn.textContent;btn.disabled=true;
 Promise.all(files.map(function(a){return fetch(a.href).then(function(r){return r.blob()}).then(function(b){z.file(a.getAttribute('data-file'),b);done++;btn.textContent='Preparing '+done+'/'+files.length+'…';})}))
 .then(function(){return z.generateAsync({type:'blob'})}).then(function(b){var u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=(sel==='all'?'baby-mo-hijaiyah-app-store-kit':sel)+'.zip';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000);})
 .catch(function(){say('Download failed — check your connection')}).then(function(){btn.disabled=false;btn.textContent=label;});}
document.querySelectorAll('.check input').forEach(function(cb){var k='hjk-'+cb.id;try{cb.checked=localStorage.getItem(k)==='1'}catch(e){}cb.closest('li').classList.toggle('done',cb.checked);
 cb.addEventListener('change',function(){try{localStorage.setItem(k,cb.checked?'1':'0')}catch(e){}cb.closest('li').classList.toggle('done',cb.checked)})});})();
</script></body></html>`;
  fs.writeFileSync(path.join(KIT, "index.html"), html);
}
module.exports = { write };
