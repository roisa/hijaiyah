/* Baby Mo Hijaiyah — the tracing game.
   The child writes the letter stroke by stroke, the right way:
   • a green numbered start circle, moving arrows along the road, and a glowing "finger" demo show where and how
   • the stroke only grows while the finger stays on the road and moves forward (no skipping ahead, no shortcuts)
   • going off the road makes the ink wobble and the road shake gently; the child carries on from where they were
   • dots are tapped in their place
   • neatness = how much of the drawing stayed on the road
   At the end the wobbly drawing shakes, turns into a clean glowing gold letter, then into the real letter while
   Mo says its name. It never fails: the child can always write it again. */
(function () {
  var A = HJ.audio, t = HJ.t;
  var TOL = 10, FAR = 21, START = 14, ROAD = 13;      // in letter units (the box is 100 × 100)

  function sampler(d) {
    var ns = "http://www.w3.org/2000/svg", svg = document.getElementById("hj-sampler");
    if (!svg) { svg = document.createElementNS(ns, "svg"); svg.id = "hj-sampler"; svg.setAttribute("style", "position:absolute;width:0;height:0;overflow:hidden"); document.body.appendChild(svg); }
    var p = document.createElementNS(ns, "path"); p.setAttribute("d", d); svg.appendChild(p);
    var L = p.getTotalLength(), n = Math.max(24, Math.round(L / 1.2)), pts = [];
    for (var i = 0; i <= n; i++) { var q = p.getPointAtLength(L * i / n); pts.push({ x: q.x, y: q.y, l: L * i / n }); }
    p.remove();
    return { pts: pts, len: L };
  }

  HJ.games.trace = function (s, ctx) {
    var st = ctx.stage, letter = HJ.BY[s.glyph] || HJ.BY[s.glyph === "ا" ? "alif" : s.glyph], k = letter ? letter.k : "alif";
    var raw = HJ.strokes(k) || HJ.strokes("alif");
    var strokes = raw.map(function (r) { return typeof r === "string" ? { kind: "path", sm: sampler(r), d: r } : { kind: "dot", x: r.d[0], y: r.d[1] }; });
    var cur = 0, prog = 0, tracing = false, on = 0, off = 0, demoT = 0, demoUntil = 0, wrongStarts = 0, finished = false, lastNote = 0;

    st.appendChild(HJ.el("div", "ask", HJ.esc(t("trace"))));
    var wrap = HJ.el("div", "trace-wrap glass"), road = HJ.el("canvas"), ink = HJ.el("canvas"), clean = HJ.el("canvas");
    road.className = "tr-road"; ink.className = "tr-ink"; clean.className = "tr-clean";
    wrap.appendChild(road); wrap.appendChild(ink); wrap.appendChild(clean);
    var glyph = HJ.el("div", "tr-glyph ar", HJ.esc(letter ? letter.c : "ا")); wrap.appendChild(glyph);
    st.appendChild(wrap);
    var row = HJ.el("div", "row tr-row"), watch = HJ.el("button", "btn small ghost", HJ.art("hand", 22) + " " + t("traceWatch")), skip = HJ.el("button", "btn small ghost", HJ.ic("skip") + " " + t("skip"));
    row.appendChild(watch); row.appendChild(skip); st.appendChild(row);
    skip.onclick = function () { ctx.next(); };
    watch.onclick = function () { A.fx.tap(); demo(); };
    ctx.mo("pose-08", t("traceStart"));

    var dpr = Math.min(2, window.devicePixelRatio || 1), W = 0, sc = 1, gR, gI, gC;
    function setup() {
      var r = wrap.getBoundingClientRect(); W = Math.round(r.width * dpr); sc = W / 100;
      [road, ink, clean].forEach(function (c) { c.width = W; c.height = W; });
      gR = road.getContext("2d"); gI = ink.getContext("2d"); gC = clean.getContext("2d");
      gI.lineCap = gI.lineJoin = "round";
    }
    function P(x, y) { return [x * sc, y * sc]; }
    function strokePath(g, sm, upto) {
      var pts = sm.pts; g.beginPath(); g.moveTo(pts[0].x * sc, pts[0].y * sc);
      var last = upto == null ? pts.length - 1 : upto;
      for (var i = 1; i <= last; i++) g.lineTo(pts[i].x * sc, pts[i].y * sc);
    }
    var dark = function () { return document.documentElement.getAttribute("data-theme") === "dark"; };

    /* ---------- the road, the arrows, the markers (redrawn every frame) ---------- */
    function drawRoad(now) {
      if (!gR) return;
      gR.clearRect(0, 0, W, W);
      gR.lineCap = gR.lineJoin = "round";
      strokes.forEach(function (sk, i) {
        if (sk.kind === "dot") {
          var c = P(sk.x, sk.y), done = i < cur, isCur = i === cur && !finished;
          gR.beginPath(); gR.arc(c[0], c[1], 5.2 * sc, 0, 7);
          gR.fillStyle = done ? "#22C06E" : dark() ? "rgba(255,255,255,.16)" : "rgba(21,34,48,.12)"; gR.fill();
          if (isCur) { var pu = 1 + .25 * Math.sin(now / 180); gR.beginPath(); gR.arc(c[0], c[1], 8 * sc * pu, 0, 7); gR.strokeStyle = "rgba(34,192,110,.75)"; gR.lineWidth = 2.2 * sc; gR.stroke(); }
          return;
        }
        // the road
        strokePath(gR, sk.sm); gR.lineWidth = ROAD * sc;
        gR.strokeStyle = i < cur ? "rgba(34,192,110,.30)" : i === cur ? (dark() ? "rgba(255,255,255,.20)" : "rgba(21,34,48,.13)") : (dark() ? "rgba(255,255,255,.08)" : "rgba(21,34,48,.06)");
        gR.stroke();
        if (i < cur) { strokePath(gR, sk.sm); gR.lineWidth = 6.5 * sc; gR.strokeStyle = "#22C06E"; gR.stroke(); }
        if (i === cur && !finished) {
          // painted part of the current stroke
          if (prog > 0) { strokePath(gR, sk.sm, prog); gR.lineWidth = 8 * sc; gR.strokeStyle = "rgba(34,192,110,.55)"; gR.stroke(); }
          // moving arrows (chevrons) along the rest of the road
          var pts = sk.sm.pts, step = 9, phase = (now / 40) % step;
          for (var l = pts[prog].l + phase; l < sk.sm.len - 3; l += step) {
            var j = Math.min(pts.length - 2, Math.round(l / sk.sm.len * (pts.length - 1))), a = pts[j], b = pts[j + 1];
            var ang = Math.atan2(b.y - a.y, b.x - a.x), cx = a.x * sc, cy = a.y * sc, z = 2.6 * sc;
            gR.save(); gR.translate(cx, cy); gR.rotate(ang); gR.beginPath(); gR.moveTo(-z, -z); gR.lineTo(z * .6, 0); gR.lineTo(-z, z);
            gR.strokeStyle = "rgba(255,149,0,.95)"; gR.lineWidth = 1.5 * sc; gR.stroke(); gR.restore();
          }
          // start (or "carry on") marker with its number, and the finish ring
          var sp = pts[prog], pu2 = 1 + .12 * Math.sin(now / 200);
          var e = pts[pts.length - 1]; gR.beginPath(); gR.arc(e.x * sc, e.y * sc, 4 * sc, 0, 7); gR.strokeStyle = "rgba(255,149,0,.8)"; gR.lineWidth = 1.6 * sc; gR.setLineDash([2 * sc, 2 * sc]); gR.stroke(); gR.setLineDash([]);
          gR.beginPath(); gR.arc(sp.x * sc, sp.y * sc, 6 * sc * pu2, 0, 7); gR.fillStyle = "#22C06E"; gR.fill();
          gR.lineWidth = 1.4 * sc; gR.strokeStyle = "#fff"; gR.stroke();
          var nPath = strokes.slice(0, i + 1).filter(function (x) { return x.kind === "path"; }).length;
          gR.fillStyle = "#fff"; gR.font = "900 " + (6.5 * sc) + "px Nunito, sans-serif"; gR.textAlign = "center"; gR.textBaseline = "middle"; gR.fillText(prog > 0 ? "▸" : String(nPath), sp.x * sc, sp.y * sc + .4 * sc);
        }
      });
      // the demo finger: a glowing dot with a little trail, running along the current stroke
      if (now < demoUntil && strokes[cur] && strokes[cur].kind === "path") {
        var sm = strokes[cur].sm, k = Math.min(1, (now - demoT) / 1500), ease = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        var idx = Math.round(ease * (sm.pts.length - 1));
        for (var tr = 0; tr < 10; tr++) { var q = sm.pts[Math.max(0, idx - tr * 3)]; gR.beginPath(); gR.arc(q.x * sc, q.y * sc, (4.2 - tr * .3) * sc, 0, 7); gR.fillStyle = "rgba(255,201,61," + (.5 - tr * .045) + ")"; gR.fill(); }
        var f = sm.pts[idx]; gR.save(); gR.shadowColor = "#FFC93D"; gR.shadowBlur = 14 * dpr; gR.beginPath(); gR.arc(f.x * sc, f.y * sc, 5 * sc, 0, 7); gR.fillStyle = "#FFD54A"; gR.fill(); gR.restore();
      }
    }
    function loop(now) { if (!ctx.alive()) return; drawRoad(now); requestAnimationFrame(loop); }

    function demo() { if (!strokes[cur] || strokes[cur].kind !== "path") { pulseHint(); return; } demoT = performance.now(); demoUntil = demoT + 1900; }
    function pulseHint() { wrap.classList.remove("tr-nudge"); void wrap.offsetWidth; wrap.classList.add("tr-nudge"); }

    /* ---------- input ---------- */
    function pt(e) { var r = ink.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * 100, y: (e.clientY - r.top) / r.height * 100 }; }
    function near(sm, p, from, to) {
      var best = -1, bd = 1e9; from = Math.max(0, from); to = Math.min(sm.pts.length - 1, to);
      for (var i = from; i <= to; i++) { var q = sm.pts[i], d = Math.hypot(q.x - p.x, q.y - p.y); if (d < bd) { bd = d; best = i; } }
      return { i: best, d: bd };
    }
    var lastP = null, inkCol = 0;
    var COLS = ["#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981"];
    function inkLine(a, b, good) {
      gI.strokeStyle = good ? COLS[(inkCol / 30 | 0) % COLS.length] : "rgba(255,90,90,.55)";
      gI.lineWidth = (good ? 5.2 : 4) * sc; gI.beginPath(); gI.moveTo(a.x * sc, a.y * sc);
      var wob = good ? 0 : 1.6;
      gI.lineTo((b.x + (Math.random() - .5) * wob) * sc, (b.y + (Math.random() - .5) * wob) * sc); gI.stroke(); inkCol++;
    }
    ink.onpointerdown = function (e) {
      if (finished) return; e.preventDefault(); A.unlock();
      try { ink.setPointerCapture(e.pointerId); } catch (x) {}
      var p = pt(e), sk = strokes[cur];
      if (!sk) return;
      if (sk.kind === "dot") {
        if (Math.hypot(p.x - sk.x, p.y - sk.y) < START) {
          var c = ink.getBoundingClientRect(); HJ.juice.burst(c.left + sk.x / 100 * c.width, c.top + sk.y / 100 * c.height, 10);
          gI.fillStyle = COLS[cur % COLS.length]; gI.beginPath(); gI.arc(sk.x * sc, sk.y * sc, 4.6 * sc, 0, 7); gI.fill();
          A.fx.pop(); on += 8; nextStroke();
        } else { wrongStart(t("traceDot")); }
        return;
      }
      var s0 = sk.sm.pts[prog];
      if (Math.hypot(p.x - s0.x, p.y - s0.y) < START) { tracing = true; lastP = p; A.fx.tap(); }
      else wrongStart(t("traceStart"));
    };
    ink.onpointermove = function (e) {
      if (!tracing || finished) return;
      var p = pt(e), sk = strokes[cur], sm = sk.sm, ahead = Math.round(16 / (sm.len / (sm.pts.length - 1)));
      var n = near(sm, p, prog - 4, prog + ahead);
      if (n.d <= TOL) {
        on++; inkLine(lastP, p, true);
        if (n.i > prog) {
          prog = n.i;
          var pct = prog / (sm.pts.length - 1);
          if (pct - lastNote > .1) { lastNote = pct; A.fx.note(cur * 3 + Math.round(pct * 8)); }
        }
      } else {
        off++; inkLine(lastP, p, false);
        if (n.d > FAR) { tracing = false; offRoad(); }
      }
      lastP = p;
      if (prog >= sm.pts.length - 3) { tracing = false; nextStroke(); }
    };
    ink.onpointerup = ink.onpointercancel = function () { tracing = false; lastP = null; };

    var offTalk = 0;
    function offRoad() {
      A.fx.bad(); HJ.juice.buzz(25); pulseHint();
      if (performance.now() - offTalk > 4000) { offTalk = performance.now(); ctx.mo("pose-33", t("traceFollow")); }
    }
    function wrongStart(msg) {
      wrongStarts++; A.fx.tap(); pulseHint(); ctx.mo("pose-08", msg);
      if (wrongStarts % 2 === 0) demo();
    }
    function nextStroke() {
      var sk = strokes[cur];
      if (sk.kind === "path") {
        var e = sk.sm.pts[sk.sm.pts.length - 1], c = ink.getBoundingClientRect();
        HJ.juice.burst(c.left + e.x / 100 * c.width, c.top + e.y / 100 * c.height, 12); A.fx.sparkle();
      }
      cur++; prog = 0; lastNote = 0;
      if (cur >= strokes.length) return finish();
      if (strokes[cur].kind === "dot") ctx.mo("pose-08", t("traceDot")); else { ctx.mo("pose-08", t("traceNext")); demo(); }
    }

    /* ---------- the finale: wobbly → shake → clean glowing gold → the real letter ---------- */
    function finish() {
      finished = true;
      var acc = on / Math.max(1, on + off), stars = acc >= .85 ? 3 : acc >= .65 ? 2 : 1;
      wrap.classList.add("tr-shake");
      setTimeout(function () {
        if (!ctx.alive()) return;
        ink.classList.add("tr-fade"); wrap.classList.remove("tr-shake");
        // draw the clean letter in gold, stroke after stroke, with a glow
        var t0 = performance.now(), paths = strokes.filter(function (x) { return x.kind === "path"; }), dots = strokes.filter(function (x) { return x.kind === "dot"; });
        var grad = gC.createLinearGradient(0, 0, W, W); grad.addColorStop(0, "#FFE27A"); grad.addColorStop(.6, "#FFB800"); grad.addColorStop(1, "#F08C00");
        (function draw(now) {
          if (!ctx.alive()) return;
          var k = Math.min(1, (now - t0) / 750);
          gC.clearRect(0, 0, W, W); gC.lineCap = gC.lineJoin = "round"; gC.save(); gC.shadowColor = "rgba(255,190,0,.9)"; gC.shadowBlur = 16 * dpr;
          paths.forEach(function (sk, i) {
            var kk = Math.max(0, Math.min(1, k * paths.length - i)); if (!kk) return;
            strokePath(gC, sk.sm, Math.round(kk * (sk.sm.pts.length - 1))); gC.lineWidth = 7.5 * sc; gC.strokeStyle = grad; gC.stroke();
          });
          if (k >= 1) dots.forEach(function (d) { gC.beginPath(); gC.arc(d.x * sc, d.y * sc, 5 * sc, 0, 7); gC.fillStyle = grad; gC.fill(); });
          gC.restore();
          if (k < 1) requestAnimationFrame(draw); else glowDone();
        })(t0);
        A.fx.whoosh();
      }, 520);
      function glowDone() {
        wrap.classList.add("tr-glow"); var r = wrap.getBoundingClientRect();
        HJ.juice.burst(r.left + r.width / 2, r.top + r.height / 2, 22, true); A.fx.win(); HJ.juice.buzz([20, 30, 40]);
        setTimeout(function () {
          if (!ctx.alive()) return;
          clean.classList.add("tr-fade"); glyph.classList.add("on");
          A.say(letter ? letter.n : "أَلِف");
          var msg = stars === 3 ? t("traceNeat") : t("traceGood");
          ctx.cheer(msg);
          var res = HJ.el("div", "tr-result glass", [0, 1, 2].map(function (i) { return HJ.art(i < stars ? "star" : "starOff", 34); }).join("") + "<b>" + HJ.esc(msg) + "</b>");
          wrap.appendChild(res);
          row.innerHTML = "";
          var again = HJ.el("button", "btn ghost", HJ.ic("replay") + " " + t("writeAgain")), go = HJ.el("button", "btn", t("next") + " " + HJ.ic("next"));
          again.onclick = function () { A.fx.tap(); HJ.games.trace(s, Object.assign({}, ctx, { stage: (st.innerHTML = "", st) })); };
          go.onclick = function () { ctx.next(); };
          row.appendChild(again); row.appendChild(go);
          ctx.good(true);
        }, 900);
      }
    }

    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () {
      setTimeout(function () { if (!ctx.alive()) return; setup(); requestAnimationFrame(loop); demo(); }, 60);
    });
  };
})();
