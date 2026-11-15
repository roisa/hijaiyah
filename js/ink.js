/* Baby Mo Hijaiyah — every hijaiyah letter sits in the true middle of its box.
   Fonts place Arabic letters by their line box, not their shape: alif carries hamza + fathah high above it, ba's dot
   hangs low, so a letter that is "centred" by CSS can look 5–25 px too high or too low (measured on every screen).
   For each short Arabic text (a letter or a syllable or two, never Qur'an text or words), this measures the glyph's
   real ink with the same font (canvas TextMetrics) and nudges it so the ink is centred in its element, vertically and
   horizontally. It watches the page, so letters that appear later (balloons, bubbles, a new round) are fixed too.
   HJ.centerInk(el) does one element; HJ.centerInkAll(root) a whole tree. */
(function () {
  var cv = null, cache = {};
  function metrics(font, txt) {
    var k = font + "|" + txt; if (cache[k]) return cache[k];
    cv = cv || document.createElement("canvas").getContext("2d");
    cv.font = font; var m = cv.measureText(txt);
    if (m.fontBoundingBoxAscent == null || m.actualBoundingBoxAscent == null) return null;
    return (cache[k] = { fa: m.fontBoundingBoxAscent, fd: m.fontBoundingBoxDescent, ia: m.actualBoundingBoxAscent, id: m.actualBoundingBoxDescent, il: m.actualBoundingBoxLeft, ir: m.actualBoundingBoxRight, w: m.width });
  }
  function short(txt) { return txt && txt.replace(/[ً-ْٰـ\s]/g, "").length <= 3; }
  function eligible(e) {
    if (!e.isConnected || e.closest(".qq, .q, .qw, .w, .wordy, .no-ink, svg")) return false;
    var txt = e.textContent.trim(); if (!txt || !short(txt) || !/[؀-ۿ]/.test(txt)) return false;
    var cs = getComputedStyle(e); if (cs.display === "inline" || cs.display === "none") return false;
    return true;
  }
  function center(e) {
    if (!eligible(e)) return;
    var cs = getComputedStyle(e), fs = parseFloat(cs.fontSize); if (!fs) return;
    var txt = e.textContent.trim(), m = metrics(cs.fontStyle + " " + cs.fontWeight + " " + fs + "px " + cs.fontFamily, txt); if (!m) return;
    var padT = parseFloat(cs.paddingTop) || 0, padB = parseFloat(cs.paddingBottom) || 0, H = e.clientHeight - padT - padB;
    var LH = parseFloat(cs.lineHeight); if (!LH) LH = m.fa + m.fd;
    // where the ink sits from the element's top (text is laid out in the first line box)
    var base = padT + (LH - (m.fa + m.fd)) / 2 + m.fa, inkMid = base - (m.ia - m.id) / 2;
    var dy = padT + H / 2 - inkMid;
    // horizontally: text-align centres the advance width; centre the ink instead
    var dx = -((m.ir - m.il) / 2 - m.w / 2);
    if (Math.abs(dx) > 12) dx = dx > 0 ? 12 : -12;            // never move a letter far sideways
    var key = txt + "|" + fs + "|" + e.clientHeight;
    if (e.dataset.ink === key) return;
    e.dataset.ink = key;
    e.style.transform = "translate(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px)";
  }
  function all(root) { (root || document).querySelectorAll(".ar, .sticker .sf, .wi .card > span").forEach(center); }
  var pend = false;
  function schedule() { if (pend) return; pend = true; requestAnimationFrame(function () { pend = false; all(document); }); }
  var ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  ready.then(function () {
    all(document);
    try { new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true }); } catch (e) {}
    window.addEventListener("resize", function () { cache = {}; document.querySelectorAll("[data-ink]").forEach(function (e) { e.dataset.ink = ""; }); schedule(); });
  });
  HJ.centerInk = center; HJ.centerInkAll = all;
})();
