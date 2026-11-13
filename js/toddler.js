/* Baby Mo Hijaiyah — little ones' games (age 3–4) for Free Play. No reading, no losing, big targets:
   • bubbles  — letter bubbles float up; every tap pops one and says its sound
   • paint    — colour a giant letter with a finger (paint only sticks inside the letter); full → it shines
   • feed     — Mo asks for a letter; drag (or tap) the right fruit to Mo, who munches it
   • shadow   — drag the letter to its matching shadow
   Each step is one game round (see js/extras.js play()); ctx comes from app.js runLevel(). */
(function () {
  var A = HJ.audio, t = HJ.t, U = HJ.util, G = HJ.games;
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function after(ctx, ms, fn) { setTimeout(function () { if (ctx.alive()) fn(); }, ms); }
  function dark() { return document.documentElement.getAttribute("data-theme") === "dark"; }
  var COLS = ["#FF6B6B", "#FFB800", "#34C759", "#3B82F6", "#A855F7", "#FF7AB6", "#14B8A6", "#FB923C"];
  function burstAt(e, n) { var r = e.getBoundingClientRect(); HJ.juice.burst(r.left + r.width / 2, r.top + r.height / 2, n || 12); }

  /* drag helper: the element follows the finger; onDrop(x, y) returns true to keep it, false to fly back */
  function draggable(e, onDrop, onTap) {
    var sx = 0, sy = 0, dx = 0, dy = 0, down = false, moved = false;
    e.style.touchAction = "none";
    e.addEventListener("pointerdown", function (ev) { down = true; moved = false; sx = ev.clientX; sy = ev.clientY; dx = dy = 0; e.classList.add("drag"); try { e.setPointerCapture(ev.pointerId); } catch (x) {} A.fx.tap(); });
    e.addEventListener("pointermove", function (ev) { if (!down) return; dx = ev.clientX - sx; dy = ev.clientY - sy; if (Math.abs(dx) + Math.abs(dy) > 8) moved = true; e.style.transform = "translate(" + dx + "px," + dy + "px) scale(1.12)"; });
    function end(ev) {
      if (!down) return; down = false; e.classList.remove("drag");
      var keep = moved ? onDrop(ev.clientX, ev.clientY) : (onTap ? onTap() : false);
      if (!keep) { e.style.transition = "transform .35s cubic-bezier(.34,1.56,.64,1)"; e.style.transform = ""; setTimeout(function () { e.style.transition = ""; }, 360); }
    }
    e.addEventListener("pointerup", end); e.addEventListener("pointercancel", end);
  }
  function inside(x, y, target, pad) { var r = target.getBoundingClientRect(); pad = pad || 0; return x > r.left - pad && x < r.right + pad && y > r.top - pad && y < r.bottom + pad; }

  /* ---------- 1. bubbles ---------- */
  G.bubbles = function (s, ctx) {
    var st = ctx.stage, need = s.need || 10, got = 0, n = 0, timer; ctx.mo("pose-12");
    var head = el("div", "row"), cnt = el("div", "count glass", HJ.art("sparkle", 24) + " 0 / " + need);
    head.appendChild(cnt); st.appendChild(head);
    var sky = el("div", "sky td-sky"); st.appendChild(sky);
    function spawn() {
      if (!ctx.alive()) { clearInterval(timer); return; }
      if (sky.querySelectorAll(".bub:not(.pop)").length > 5) return;
      var it = s.pool[n++ % s.pool.length], b = el("button", "bub");
      b.style.left = (4 + Math.random() * 64) + "%"; b.style.animationDuration = (7 + Math.random() * 3) + "s";
      b.style.setProperty("--c", COLS[n % COLS.length]);
      b.appendChild(el("span", "ar", it.ar));
      b.onpointerdown = function () {
        if (b.classList.contains("pop")) return;
        b.classList.add("pop"); A.fx.pop(); A.say(it.au); burstAt(b, 10); HJ.juice.buzz(12);
        got++; cnt.innerHTML = HJ.art("sparkle", 24) + " " + got + " / " + need;
        setTimeout(function () { b.remove(); }, 300);
        if (got === need) { clearInterval(timer); ctx.good(); after(ctx, 1100, ctx.next); }
      };
      b.addEventListener("animationend", function (e) { if (e.animationName === "bubUp") b.remove(); });
      sky.appendChild(b);
    }
    spawn(); setTimeout(spawn, 500); timer = setInterval(spawn, 900);
  };

  /* ---------- 2. paint the letter ---------- */
  G.paint = function (s, ctx) {
    var st = ctx.stage, it = s.item, letter = HJ.BY[it.k] || HJ.L[0], ch = letter.seat || letter.c; ctx.mo("pose-12");
    var wrap = el("div", "paint-wrap glass"), cv = el("canvas", "paint-cv"); wrap.appendChild(cv); st.appendChild(wrap);
    var pal = el("div", "crayons"), col = COLS[0];
    COLS.concat(["rainbow"]).forEach(function (c, i) {
      var b = el("button", "crayon" + (i === 0 ? " on" : "")); b.style.background = c === "rainbow" ? "conic-gradient(#FF6B6B,#FFB800,#34C759,#3B82F6,#A855F7,#FF6B6B)" : c;
      b.setAttribute("aria-label", c); b.onclick = function () { col = c; A.fx.tap(); pal.querySelectorAll(".on").forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on"); };
      pal.appendChild(b);
    });
    st.appendChild(pal);
    var dpr = Math.min(2, window.devicePixelRatio || 1), W, mask, paint, g, done = false, hue = 0;
    function setup() {
      W = Math.round(wrap.clientWidth * dpr); cv.width = cv.height = W;
      mask = document.createElement("canvas"); mask.width = mask.height = W;
      paint = document.createElement("canvas"); paint.width = paint.height = W;
      var m = mask.getContext("2d"), F = "'Scheherazade New', 'Amiri', serif"; m.font = "100px " + F;
      var mt = m.measureText(ch), iw = (mt.actualBoundingBoxLeft || 0) + (mt.actualBoundingBoxRight || 50), ih = (mt.actualBoundingBoxAscent || 70) + (mt.actualBoundingBoxDescent || 10);
      var size = 100 * Math.min(W * .7 / iw, W * .74 / ih); m.font = size + "px " + F; mt = m.measureText(ch);
      var L = mt.actualBoundingBoxLeft || 0, R = mt.actualBoundingBoxRight || 0, As = mt.actualBoundingBoxAscent || 0, De = mt.actualBoundingBoxDescent || 0;
      m.fillStyle = "#000"; m.fillText(ch, W / 2 - (R - L) / 2, W / 2 + (As - De) / 2);
      // a fat outline so little fingers that go slightly outside still count
      m.strokeStyle = "#000"; m.lineWidth = W * .018; m.lineJoin = "round"; m.strokeText(ch, W / 2 - (R - L) / 2, W / 2 + (As - De) / 2);
      g = cv.getContext("2d"); draw();
    }
    function draw(shine) {
      g.clearRect(0, 0, W, W);
      g.save(); g.globalAlpha = dark() ? .22 : .13; g.drawImage(mask, 0, 0); g.restore();       // the letter waiting to be coloured
      var tmp = document.createElement("canvas"); tmp.width = tmp.height = W; var tg = tmp.getContext("2d");
      tg.drawImage(paint, 0, 0); tg.globalCompositeOperation = "destination-in"; tg.drawImage(mask, 0, 0);
      if (shine) { g.save(); g.shadowColor = "rgba(255,200,60,.95)"; g.shadowBlur = 30 * dpr; g.drawImage(tmp, 0, 0); g.restore(); }
      g.drawImage(tmp, 0, 0);
    }
    var last = null, down = false;
    function pos(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * W }; }
    function stroke(a, b) {
      var p = paint.getContext("2d"); p.lineCap = "round"; p.lineJoin = "round"; p.lineWidth = W * .085;
      p.strokeStyle = col === "rainbow" ? "hsl(" + (hue = (hue + 4) % 360) + ",90%,58%)" : col;
      p.beginPath(); p.moveTo(a.x, a.y); p.lineTo(b.x + .01, b.y); p.stroke();
    }
    cv.style.touchAction = "none";
    cv.addEventListener("pointerdown", function (e) { if (done) return; down = true; try { cv.setPointerCapture(e.pointerId); } catch (x) {} last = pos(e); stroke(last, last); draw(); });
    cv.addEventListener("pointermove", function (e) { if (!down || done) return; var p = pos(e); stroke(last, p); last = p; draw(); if (Math.random() < .25) A.fx.tap(); });
    function up() { if (!down) return; down = false; check(); }
    cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
    function check() {
      var md = mask.getContext("2d").getImageData(0, 0, W, W).data, pd = paint.getContext("2d").getImageData(0, 0, W, W).data, tot = 0, hit = 0, step = 4 * 6;
      for (var i = 3; i < md.length; i += step) if (md[i] > 128) { tot++; if (pd[i] > 60) hit++; }
      if (tot && hit / tot > .72) finish();
    }
    function finish() {
      done = true; draw(true); wrap.classList.add("shine"); A.fx.sparkle(); A.say(it.au); burstAt(wrap, 24); ctx.good();
      after(ctx, 1800, ctx.next);
    }
    var hint = el("button", "btn small ghost", HJ.ic("speaker") + " " + HJ.esc(HJ.letterName(letter.k, HJ.store.get().lang) || letter.id)); hint.onclick = function () { A.say(it.au); };
    var r = el("div", "row"); r.appendChild(hint); st.appendChild(r);
    (document.fonts && document.fonts.load ? document.fonts.load("100px 'Scheherazade New'") : Promise.resolve()).then(function () { if (ctx.alive()) setup(); }, setup);
    after(ctx, 400, function () { A.say(it.au); });
  };

  /* ---------- 3. feed Mo ---------- */
  var FRUIT = [["#FF4D4D", "#C81E1E"], ["#FFA62B", "#E8590C"], ["#FFD43B", "#E0A100"], ["#B266FF", "#7C3AED"], ["#5EDB7A", "#16A34A"], ["#FF7AB6", "#DB2777"]];
  function fruitSvg(c) {
    return '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M52 20 C54 10 60 6 66 5" stroke="#6B4423" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M56 16 C66 6 80 8 84 14 C74 20 64 20 56 16 Z" fill="#3FBF5A"/>' +
      '<circle cx="50" cy="58" r="38" fill="' + c[0] + '"/><path d="M50 96 A38 38 0 0 1 12 58" stroke="' + c[1] + '" stroke-width="8" fill="none" opacity=".45"/><ellipse cx="36" cy="40" rx="9" ry="6" fill="#fff" opacity=".5"/></svg>';
  }
  G.feed = function (s, ctx) {
    var st = ctx.stage, round = 0, rounds = s.rounds;
    ctx.mo(null);
    var ask = el("div", "ask"); st.appendChild(ask);
    var moBox = el("div", "feed-mo"), mo = HJ.moImg("pose-41", "190px"), bubble = el("div", "feed-want glass"); moBox.appendChild(mo); moBox.appendChild(bubble); st.appendChild(moBox);
    var tray = el("div", "fruits"); st.appendChild(tray);
    function setMo(p) { mo.src = mo.src.replace(/mo-[a-z0-9-]+\.webp/, "mo-" + p + ".webp"); }
    function show() {
      if (round >= rounds.length) { ctx.good(); after(ctx, 900, ctx.next); return; }
      var r = rounds[round], busy = false;
      tray.innerHTML = ""; setMo("pose-41");
      bubble.innerHTML = '<span class="ar">' + HJ.esc(r.q.ar) + "</span>";
      ask.textContent = t("feedAsk");
      U.shuffle(r.options.slice()).forEach(function (o, i) {
        var f = el("div", "fruit"); f.innerHTML = fruitSvg(FRUIT[(round * 2 + i) % FRUIT.length]); f.appendChild(el("span", "ar", HJ.esc(o.ar)));
        f.setAttribute("role", "button"); if (o.ar === r.q.ar) f.setAttribute("data-ok", "1");
        function choose() {
          if (busy) return false;
          if (o.ar === r.q.ar) {
            busy = true;
            var a = f.getBoundingClientRect(), b = mo.getBoundingClientRect();
            f.style.transition = "transform .45s cubic-bezier(.5,0,.5,1), opacity .45s"; f.style.transform = "translate(" + (b.left + b.width / 2 - a.left - a.width / 2) + "px," + (b.top + b.height * .32 - a.top - a.height / 2) + "px) scale(.3)"; f.style.opacity = "0";
            setTimeout(function () { if (!ctx.alive()) return; A.fx.coin(); setMo("yeyy"); moBox.classList.remove("chomp"); void moBox.offsetWidth; moBox.classList.add("chomp"); burstAt(mo, 14); A.say(r.q.au); ctx.good(true); HJ.toast && 0; }, 430);
            setTimeout(function () { if (ctx.alive()) { round++; show(); } }, 1900);
            return true;
          }
          A.fx.bad(); setMo("pose-33"); f.classList.remove("no"); void f.offsetWidth; f.classList.add("no"); ctx.bad(true);
          setTimeout(function () { if (ctx.alive()) { setMo("pose-41"); A.say(r.q.au); } }, 700);
          return false;
        }
        draggable(f, function (x, y) { return inside(x, y, mo, 30) ? choose() : false; }, choose);
        tray.appendChild(f);
      });
      after(ctx, 350, function () { A.say(r.q.au); });
    }
    bubble.onclick = function () { var r = rounds[round]; if (r) A.say(r.q.au); };
    show();
  };

  /* ---------- 4. shadow match ---------- */
  G.shadow = function (s, ctx) {
    var st = ctx.stage, round = 0, rounds = s.rounds; ctx.mo("pose-12");
    st.appendChild(el("div", "ask", HJ.esc(t("tdShadow"))));
    var shelf = el("div", "shadows"), piece = el("div", "sh-dock"); st.appendChild(shelf); st.appendChild(piece);
    function show() {
      if (round >= rounds.length) { ctx.good(); after(ctx, 900, ctx.next); return; }
      var r = rounds[round], c = COLS[(round * 3 + 1) % COLS.length], busy = false;
      shelf.innerHTML = ""; piece.innerHTML = "";
      var slots = U.shuffle(r.options.slice()).map(function (o) { var sl = el("div", "sh-slot", '<span class="ar">' + HJ.esc(o.ar) + "</span>"); sl._o = o; shelf.appendChild(sl); return sl; });
      var p = el("div", "sh-piece", '<span class="ar">' + HJ.esc(r.q.ar) + "</span>"); p.style.background = "linear-gradient(160deg," + c + "," + c + "cc)"; piece.appendChild(p);
      function tryOn(sl) {
        if (busy) return false;
        if (sl._o.ar === r.q.ar) {
          busy = true; var a = p.getBoundingClientRect(), b = sl.getBoundingClientRect();
          p.style.transition = "transform .3s cubic-bezier(.34,1.56,.64,1)"; p.style.transform = "translate(" + (b.left + b.width / 2 - a.left - a.width / 2) + "px," + (b.top + b.height / 2 - a.top - a.height / 2) + "px)";
          setTimeout(function () { if (!ctx.alive()) return; p.style.visibility = "hidden"; sl.classList.add("fit"); sl.style.setProperty("--c", c); A.fx.coin(); burstAt(sl, 14); A.say(r.q.au); ctx.good(true); }, 300);
          setTimeout(function () { if (ctx.alive()) { round++; show(); } }, 1600);
          return true;
        }
        A.fx.bad(); sl.classList.remove("no"); void sl.offsetWidth; sl.classList.add("no"); ctx.bad(true); return false;
      }
      draggable(p, function (x, y) { for (var i = 0; i < slots.length; i++) if (inside(x, y, slots[i], 10)) return tryOn(slots[i]); return false; }, function () { A.say(r.q.au); return false; });
      slots.forEach(function (sl) { sl.onclick = function () { tryOn(sl); }; });
      after(ctx, 300, function () { A.say(r.q.au); });
    }
    show();
  };

  /* steps for one Free Play round of a little ones' game, from a pool of letters (fathah syllables) */
  HJ.toddlerSteps = function (type, pool) {
    var P = U.shuffle(pool.slice());
    function far(q, n) {   // easy choices for small children: never a look-alike letter
      var cz = HJ.cousins(q.k) || [], opts = U.shuffle(P.filter(function (x) { return x.ar !== q.ar && cz.indexOf(x.k) < 0; })).slice(0, n - 1);
      return U.shuffle([q].concat(opts));
    }
    if (type === "bubbles") return [{ type: "bubbles", pool: P.slice(0, 6), need: 10 }];
    if (type === "paint") return P.slice(0, 3).map(function (x) { return { type: "paint", item: x }; });
    if (type === "feed") return [{ type: "feed", rounds: P.slice(0, 4).map(function (q) { return { q: q, options: far(q, 2) }; }) }];
    if (type === "shadow") return [{ type: "shadow", rounds: P.slice(0, 4).map(function (q) { return { q: q, options: far(q, 3) }; }) }];
    return [];
  };
})();
