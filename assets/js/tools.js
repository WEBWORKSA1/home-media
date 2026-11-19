/* Home.Media — interactive tools. Each tool boots only if its root element exists. */
(function () {
  "use strict";
  var doc = document, HM = window.HM || {}, ROOT = window.HM_ROOT || "";
  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  function num(el, d) { var v = parseFloat(el && el.value); return isFinite(v) ? v : (d || 0); }
  function r1(n) { return Math.round(n * 10) / 10; }
  function r0(n) { return Math.round(n); }
  function deg(r) { return r * 180 / Math.PI; }
  function rad(d) { return d * Math.PI / 180; }
  function esc(s) { return HM.esc ? HM.esc(s) : String(s); }
  function money(n) { return "$" + Math.round(n).toLocaleString("en-US"); }
  function stat(k, v, s, hl) { return '<div class="stat' + (hl ? " hl" : "") + '"><span class="k">' + k + '</span><span class="v">' + v + '</span>' + (s ? '<span class="s">' + s + "</span>" : "") + "</div>"; }
  function badge(kind, t) { return '<span class="badge ' + kind + '">' + t + "</span>"; }
  function seg(root, name, cb) {
    var btns = $$('[data-seg="' + name + '"] button', root);
    btns.forEach(function (b) {
      b.addEventListener("click", function () { btns.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); cb(b.getAttribute("data-val")); });
    });
    var on = btns.filter(function (b) { return b.getAttribute("aria-pressed") === "true"; })[0];
    return on ? on.getAttribute("data-val") : null;
  }
  function setSeg(root, name, val) { $$('[data-seg="' + name + '"] button', root).forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-val") === val ? "true" : "false"); }); }
  function share(params) {
    var q = new URLSearchParams(params).toString();
    try { history.replaceState(null, "", location.pathname + "?" + q); } catch (e) {}
  }
  function bind(root, fn) { $$("input,select", root).forEach(function (el) { el.addEventListener("input", fn); el.addEventListener("change", fn); }); }
  function fromURL(map) { Object.keys(map).forEach(function (k) { var v = HM.params && HM.params.get(k); if (v !== null && v !== undefined && map[k]) map[k].value = v; }); }
  function planLink(el, q) { if (el) el.href = ROOT + "plan.html?" + new URLSearchParams(q).toString(); }
  var FT_PER_M = 3.28084, IN_PER_FT = 12;

  /* ===================================================== 1. Screen size */
  (function () {
    var root = $("#tool-screen"); if (!root) return;
    var unit = "ft", mode = "dist";
    var el = { dist: $("#ss-dist", root), size: $("#ss-size", root), res: $("#ss-res", root), use: $("#ss-use", root), aspect: $("#ss-aspect", root), out: $("#ss-out"), viz: $("#ss-viz"), table: $("#ss-table"), cta: $("#ss-cta") };
    var ANG = { movies: 40, mixed: 35, tv: 30, gaming: 38 };
    var HPX = { "1080p": 1920, "4K": 3840, "8K": 7680 };
    var SIZES = [43, 50, 55, 65, 75, 77, 83, 85, 98, 100, 115];
    function wFactor(a) { var p = a === "2.39:1" ? [2.39, 1] : [16, 9]; return p[0] / Math.hypot(p[0], p[1]); }
    function hFactor(a) { var p = a === "2.39:1" ? [2.39, 1] : [16, 9]; return p[1] / Math.hypot(p[0], p[1]); }
    function distIn(widthIn, angle) { return widthIn / (2 * Math.tan(rad(angle / 2))); }
    function fmtLen(inches) { return unit === "ft" ? r1(inches / 12) + " ft" : r1(inches * 0.0254) + " m"; }
    function nearest(d) { return SIZES.reduce(function (a, b) { return Math.abs(b - d) < Math.abs(a - d) ? b : a; }); }
    var cur = seg(root, "unit", function (v) {
      var D = num(el.dist); unit = v;
      el.dist.value = v === "m" ? r1(D / FT_PER_M) : r1(D * FT_PER_M);
      $$("[data-unit-label]", root).forEach(function (s) { s.textContent = v; }); calc();
    }); if (cur) unit = cur;
    var curm = seg(root, "mode", function (v) { mode = v; toggle(); calc(); }); if (curm) mode = curm;
    function toggle() { $("#ss-dist-f", root).hidden = mode !== "dist"; $("#ss-size-f", root).hidden = mode !== "size"; }
    fromURL({ d: el.dist, s: el.size, r: el.res, u: el.use, a: el.aspect });
    if (HM.params && HM.params.get("m") === "size") { mode = "size"; setSeg(root, "mode", "size"); }
    toggle();
    function calc() {
      var a = el.aspect.value, wf = wFactor(a), hf = hFactor(a), ang = ANG[el.use.value] || 35, hpx = HPX[el.res.value] || 3840;
      var acu = Math.tan(rad(1 / 60));
      var html = "", viz = "", diag, Din;
      if (mode === "dist") {
        var D = Math.max(0.5, num(el.dist, 9)); Din = unit === "ft" ? D * 12 : D * 39.3701;
        var wRec = 2 * Din * Math.tan(rad(ang / 2)); diag = wRec / wf;
        var d30 = 2 * Din * Math.tan(rad(15)) / wf, d40 = 2 * Din * Math.tan(rad(20)) / wf;
        var dRes = Din * hpx * acu / wf;
        html += stat("Recommended size", r0(diag) + '"', "Nearest common size: " + nearest(diag) + '"', true);
        html += stat("Comfortable range", r0(d30) + "–" + r0(d40) + '"', "SMPTE 30° to THX 40°");
        html += stat("Full " + el.res.value + " detail from ≥", r0(dRes) + '"', "Smaller screens look the same as lower resolution from here");
        var bottom = 42 - (diag * hf) / 2;
        html += stat("Mount height", "~42 in", "Screen centre at seated eye level; bottom edge ≈ " + r0(Math.max(bottom, 12)) + " in from floor");
        share({ m: "dist", d: D, r: el.res.value, u: el.use.value, a: a });
      } else {
        diag = Math.max(20, num(el.size, 65)); var w = diag * wf;
        var dMin = distIn(w, 40), dRecIn = distIn(w, ang), dMax = distIn(w, 30), dRes2 = w / (hpx * acu);
        Din = dRecIn;
        html += stat("Recommended distance", fmtLen(dRecIn), ang + "° viewing angle for " + el.use.selectedOptions[0].text.toLowerCase(), true);
        html += stat("Closest (immersive)", fmtLen(dMin), "THX 40°");
        html += stat("Farthest (SMPTE 30°)", fmtLen(dMax), "Beyond this the screen feels small");
        html += stat("Full " + el.res.value + " detail within", fmtLen(dRes2), "20/20 vision, 1 arc-minute per pixel");
        share({ m: "size", s: diag, r: el.res.value, u: el.use.value, a: a });
      }
      el.out.innerHTML = html;
      /* top-down viz */
      var Wpx = diag * wf, scale = 300 / Math.max(Din, Wpx * 1.2), sw = Wpx * scale, sd = Din * scale, cx = 300, top = 40;
      viz = '<svg viewBox="0 0 600 ' + (sd + 110) + '" role="img" aria-label="Viewing angle diagram">' +
        '<rect x="' + (cx - sw / 2) + '" y="' + top + '" width="' + sw + '" height="8" rx="2" fill="var(--accent)"/>' +
        '<text x="' + cx + '" y="' + (top - 10) + '" text-anchor="middle" fill="var(--muted)" font-size="14">' + r0(diag) + '" screen</text>' +
        '<path d="M' + (cx - sw / 2) + " " + (top + 8) + " L" + cx + " " + (top + 8 + sd) + " L" + (cx + sw / 2) + " " + (top + 8) + 'Z" fill="var(--accent-soft)" stroke="var(--accent)" stroke-dasharray="4 4"/>' +
        '<line x1="' + cx + '" y1="' + (top + 8) + '" x2="' + cx + '" y2="' + (top + 8 + sd) + '" stroke="var(--line2)"/>' +
        '<circle cx="' + cx + '" cy="' + (top + 8 + sd) + '" r="12" fill="var(--teal)"/>' +
        '<text x="' + (cx + 22) + '" y="' + (top + 8 + sd / 2) + '" fill="var(--text)" font-size="15">' + fmtLen(Din) + "</text>" +
        '<text x="' + cx + '" y="' + (top + 8 + sd + 34) + '" text-anchor="middle" fill="var(--muted)" font-size="13">Your seat · ' + r0(deg(2 * Math.atan((diag * wf / 2) / Din))) + "° field of view</text></svg>";
      el.viz.innerHTML = viz;
      /* table */
      var rows = SIZES.map(function (s) { var w = s * wf; return "<tr><td>" + s + '"</td><td class="num">' + fmtLen(distIn(w, 40)) + '</td><td class="num">' + fmtLen(distIn(w, 35)) + '</td><td class="num">' + fmtLen(distIn(w, 30)) + "</td></tr>"; }).join("");
      el.table.innerHTML = '<table><thead><tr><th>Screen</th><th class="num">Immersive (40°)</th><th class="num">Mixed (35°)</th><th class="num">Max (30°)</th></tr></thead><tbody>' + rows + "</tbody></table>";
      planLink(el.cta, { src: "tool-screen", screen: r0(diag) + '"', type: "Living-room upgrade" });
    }
    bind(root, calc); calc();
  })();

  /* ===================================================== 2. Projector */
  (function () {
    var root = $("#tool-proj"); if (!root) return;
    var unit = "ft", mode = "size";
    var el = { preset: $("#pj-preset", root), tr1: $("#pj-tr1", root), tr2: $("#pj-tr2", root), aspect: $("#pj-aspect", root), diag: $("#pj-diag", root), dist: $("#pj-dist", root), lm: $("#pj-lm", root), gain: $("#pj-gain", root), room: $("#pj-room", root), out: $("#pj-out"), viz: $("#pj-viz"), cta: $("#pj-cta") };
    var u = seg(root, "unit", function (v) { var d = num(el.dist); el.dist.value = v === "m" ? r1(d / FT_PER_M) : r1(d * FT_PER_M); unit = v; $$("[data-unit-label]", root).forEach(function (s) { s.textContent = v; }); calc(); }); if (u) unit = u;
    var m = seg(root, "mode", function (v) { mode = v; toggle(); calc(); }); if (m) mode = m;
    function toggle() { $("#pj-diag-f", root).hidden = mode !== "size"; $("#pj-dist-f", root).hidden = mode !== "dist"; }
    toggle();
    el.preset.addEventListener("change", function () { var v = el.preset.value.split("-"); if (v.length === 2) { el.tr1.value = v[0]; el.tr2.value = v[1]; } calc(); });
    fromURL({ t1: el.tr1, t2: el.tr2, s: el.diag, lm: el.lm, g: el.gain, rm: el.room });
    var TARGET = { dark: [16, 30, "Dark, light-controlled room"], dim: [30, 40, "Dim room, some light"], living: [50, 60, "Living room with lights on"], bright: [75, 90, "Bright room / daytime"] };
    function len(ft) { return unit === "ft" ? r1(ft) + " ft" : r1(ft / FT_PER_M) + " m"; }
    function calc() {
      var p = el.aspect.value.split(":").map(Number), wf = p[0] / Math.hypot(p[0], p[1]), hf = p[1] / Math.hypot(p[0], p[1]);
      var t1 = Math.max(0.1, num(el.tr1, 1.3)), t2 = Math.max(t1, num(el.tr2, t1)), diag, wFt, html = "";
      if (mode === "size") {
        diag = Math.max(30, num(el.diag, 120)); wFt = diag * wf / 12;
        html += stat("Throw distance", len(wFt * t1) + (t2 > t1 ? " – " + len(wFt * t2) : ""), "Lens to screen, for a " + r0(diag) + '" image', true);
      } else {
        var dFt = Math.max(0.3, num(el.dist, 12)); if (unit === "m") dFt *= FT_PER_M;
        var w1 = dFt / t2, w2 = dFt / t1; wFt = w2; diag = (wFt * 12) / wf;
        html += stat("Image size", r0((w1 * 12) / wf) + '"' + (t2 > t1 ? " – " + r0(diag) + '"' : ""), "Diagonal from this distance", true);
      }
      var hFt = diag * hf / 12, area = wFt * hFt, lm = Math.max(0, num(el.lm, 2500)), g = Math.max(0.1, num(el.gain, 1));
      var fl = lm * g / area, flReal = fl * 0.7, tgt = TARGET[el.room.value] || TARGET.dark;
      html += stat("Image width × height", r1(wFt * 12) + " × " + r1(hFt * 12) + " in", r1(wFt) + " × " + r1(hFt) + " ft");
      var kind = flReal >= tgt[1] ? "ok" : flReal >= tgt[0] ? "warn" : "bad";
      html += stat("Brightness", r0(flReal) + " fL", "Rated " + r0(fl) + " fL; calibrated output assumed 30% lower");
      var maxArea = lm * g * 0.7 / tgt[0], maxDiag = Math.sqrt(maxArea / (wf * hf)) * 12;
      html += stat("Largest bright-enough screen", r0(maxDiag) + '"', "For " + tgt[2].toLowerCase());
      el.out.innerHTML = html + '<div class="callout ' + (kind === "ok" ? "" : "warn") + '">' + badge(kind, kind === "ok" ? "Bright enough" : kind === "warn" ? "Borderline" : "Too dim") +
        " Target for a " + tgt[2].toLowerCase() + ": " + tgt[0] + "–" + tgt[1] + " fL (HDR benefits from the top of the range). " +
        (kind === "bad" ? "Use a smaller screen, a higher-gain or ALR screen, or a brighter projector." : kind === "warn" ? "Works for SDR; HDR will look flat. Consider an ALR screen in rooms with ambient light." : "Good headroom for HDR and lamp/laser ageing.") + "</div>";
      var s = 520 / Math.max(wFt * t2 + 2, 6), x0 = 40, sx = x0 + wFt * t2 * s;
      el.viz.innerHTML = '<svg viewBox="0 0 620 190" role="img" aria-label="Throw distance diagram"><rect x="' + sx + '" y="20" width="10" height="150" rx="2" fill="var(--accent)"/>' +
        '<rect x="' + (sx - wFt * t1 * s - 30) + '" y="78" width="30" height="20" rx="4" fill="var(--teal)"/>' +
        (t2 > t1 ? '<rect x="' + (x0 - 30) + '" y="78" width="30" height="20" rx="4" fill="none" stroke="var(--teal)" stroke-dasharray="4 3"/>' : "") +
        '<path d="M' + (sx - wFt * t1 * s) + ' 88 L' + sx + ' 22 L' + sx + ' 168Z" fill="var(--accent-soft)"/>' +
        '<text x="' + (sx - wFt * t1 * s / 2) + '" y="186" text-anchor="middle" fill="var(--muted)" font-size="13">' + len(wFt * t1) + (t2 > t1 ? " (zoom to " + len(wFt * t2) + ")" : "") + '</text>' +
        '<text x="' + (sx - 6) + '" y="14" text-anchor="end" fill="var(--muted)" font-size="13">' + r0(diag) + '" screen</text></svg>';
      share({ t1: t1, t2: t2, s: r0(diag), lm: lm, g: g, rm: el.room.value });
      planLink(el.cta, { src: "tool-projector", type: "Projector & screen", screen: r0(diag) + '"' });
    }
    bind(root, calc); calc();
  })();

  /* ===================================================== 3. Speaker layout */
  (function () {
    var root = $("#tool-spk"); if (!root) return;
    var unit = "ft";
    var el = { cfg: $("#sp-cfg", root), L: $("#sp-len", root), W: $("#sp-wid", root), H: $("#sp-hgt", root), seat: $("#sp-seat", root), out: $("#sp-out"), viz: $("#sp-viz"), table: $("#sp-table"), cta: $("#sp-cta") };
    var u = seg(root, "unit", function (v) {
      [el.L, el.W, el.H, el.seat].forEach(function (i) { var d = num(i); i.value = v === "m" ? r1(d / FT_PER_M) : r1(d * FT_PER_M); });
      unit = v; $$("[data-unit-label]", root).forEach(function (s) { s.textContent = v; }); calc();
    }); if (u) unit = u;
    fromURL({ c: el.cfg, l: el.L, w: el.W, h: el.H, s: el.seat });
    var EAR = { C: [0, "Centre", "0°"], FL: [-30, "Front left", "22–30°"], FR: [30, "Front right", "22–30°"], FWL: [-60, "Front wide left", "50–70°"], FWR: [60, "Front wide right", "50–70°"],
      SL5: [-110, "Surround left", "100–120°"], SR5: [110, "Surround right", "100–120°"], SL: [-95, "Side surround left", "90–110°"], SR: [95, "Side surround right", "90–110°"],
      SBL: [-145, "Rear surround left", "135–150°"], SBR: [145, "Rear surround right", "135–150°"] };
    var CFG = {
      "2.1": ["FL", "FR"], "3.1": ["C", "FL", "FR"], "5.1": ["C", "FL", "FR", "SL5", "SR5"], "7.1": ["C", "FL", "FR", "SL", "SR", "SBL", "SBR"],
      "5.1.2": ["C", "FL", "FR", "SL5", "SR5"], "5.1.4": ["C", "FL", "FR", "SL5", "SR5"], "7.1.2": ["C", "FL", "FR", "SL", "SR", "SBL", "SBR"],
      "7.1.4": ["C", "FL", "FR", "SL", "SR", "SBL", "SBR"], "7.2.4": ["C", "FL", "FR", "SL", "SR", "SBL", "SBR"], "9.2.4": ["C", "FL", "FR", "FWL", "FWR", "SL", "SR", "SBL", "SBR"],
      "9.2.6": ["C", "FL", "FR", "FWL", "FWR", "SL", "SR", "SBL", "SBR"]
    };
    function heights(c) { var h = c.split(".")[2] || "0"; return h === "2" ? ["TM"] : h === "4" ? ["TF", "TR"] : h === "6" ? ["TF", "TM", "TR"] : []; }
    function subs(c) { return parseInt(c.split(".")[1], 10) || 1; }
    var dragging = false, svgEl = null, scale = 1, pad = 30;
    function toFt(v) { return unit === "m" ? v * FT_PER_M : v; }
    function len(ft) { return unit === "ft" ? r1(ft) + " ft" : r1(ft / FT_PER_M) + " m"; }
    function calc() {
      var c = el.cfg.value, L = Math.max(8, toFt(num(el.L, 20))), W = Math.max(7, toFt(num(el.W, 14))), H = Math.max(6.5, toFt(num(el.H, 8.5)));
      var seatY = Math.min(L - 1, Math.max(3, toFt(num(el.seat, L * 0.62)))), x0 = W / 2, ear = 3.9, m = 0.6, list = [];
      CFG[c].forEach(function (k) {
        var a = rad(EAR[k][0]), dx = Math.sin(a), dy = -Math.cos(a), t = Infinity, x, y;
        if (Math.abs(EAR[k][0]) <= 45) {
          /* front speakers live on the screen wall */
          y = m + 0.4; x = Math.min(W - m, Math.max(m, x0 + Math.tan(a) * (seatY - y)));
        } else {
          if (dx > 1e-6) t = Math.min(t, (W - m - x0) / dx); if (dx < -1e-6) t = Math.min(t, (m - x0) / dx);
          if (dy < -1e-6) t = Math.min(t, (m - seatY) / dy); if (dy > 1e-6) t = Math.min(t, (L - m - seatY) / dy);
          x = x0 + dx * t; y = seatY + dy * t;
        }
        var z = k === "C" ? Math.max(ear - 1.2, 1.5) : (/^S|^SB/.test(k) ? Math.min(H - 1, ear + 2) : ear);
        var act = Math.round(Math.abs(deg(Math.atan2(x - x0, seatY - y))));
        list.push({ k: k, name: EAR[k][1], target: EAR[k][2] + " (yours: " + act + "°)", x: x, y: y, z: z, kind: "ear", ang: Math.abs(EAR[k][0]) });
      });
      var fl = list.filter(function (s) { return s.k === "FL"; })[0], lat = fl ? Math.max(1.5, Math.min(x0 - fl.x, W / 2 - 1.5)) * 0.9 : W / 4;
      var rise = Math.max(1, H - ear);
      heights(c).forEach(function (h) {
        var off = h === "TF" ? -rise : h === "TR" ? rise : -rise * 0.18, nm = { TF: "Top front", TM: "Top middle", TR: "Top rear" }[h], tg = { TF: "30–55° up", TM: "65–100° up", TR: "125–150° up" }[h];
        [-1, 1].forEach(function (sgn) {
          var y = Math.min(L - 0.6, Math.max(0.6, seatY + off));
          list.push({ k: h + (sgn < 0 ? "L" : "R"), name: nm + (sgn < 0 ? " left" : " right"), target: tg, x: x0 + sgn * lat, y: y, z: H, kind: "top" });
        });
      });
      var ns = subs(c);
      (ns === 1 ? [W * 0.25] : ns === 2 ? [W * 0.25, W * 0.75] : [W * 0.25, W * 0.75, W * 0.5]).forEach(function (sx, i) {
        list.push({ k: "SW" + (i + 1), name: "Subwoofer " + (i + 1), target: ns > 1 ? "Front wall ¼ & ¾ points" : "Front wall, try ¼ width", x: sx, y: 0.9, z: 1, kind: "sub" });
      });
      /* svg */
      var maxW = 560; scale = Math.min(maxW / W, 520 / L); var sw = W * scale, sh = L * scale;
      var s = '<svg viewBox="0 0 ' + (sw + pad * 2) + " " + (sh + pad * 2 + 10) + '" role="img" aria-label="Speaker layout, drag the seat to move it">' +
        '<rect x="' + pad + '" y="' + pad + '" width="' + sw + '" height="' + sh + '" rx="6" fill="var(--card)" stroke="var(--line2)" stroke-width="2"/>' +
        '<rect x="' + (pad + sw * 0.2) + '" y="' + (pad - 2) + '" width="' + sw * 0.6 + '" height="6" rx="2" fill="var(--accent)"/><text x="' + (pad + sw / 2) + '" y="' + (pad - 10) + '" text-anchor="middle" fill="var(--muted)" font-size="12">SCREEN</text>';
      var lx = pad + x0 * scale, ly = pad + seatY * scale;
      list.forEach(function (sp) {
        var px = pad + sp.x * scale, py = pad + sp.y * scale;
        if (sp.kind !== "sub") s += '<line x1="' + lx + '" y1="' + ly + '" x2="' + px + '" y2="' + py + '" stroke="' + (sp.kind === "top" ? "var(--teal)" : "var(--accent)") + '" stroke-opacity=".35" stroke-dasharray="3 4"/>';
      });
      list.forEach(function (sp) {
        var px = pad + sp.x * scale, py = pad + sp.y * scale, col = sp.kind === "top" ? "var(--teal)" : sp.kind === "sub" ? "var(--violet)" : "var(--accent)";
        s += sp.kind === "sub" ? '<rect x="' + (px - 11) + '" y="' + (py - 11) + '" width="22" height="22" rx="4" fill="' + col + '"/>' : '<circle cx="' + px + '" cy="' + py + '" r="' + (sp.kind === "top" ? 9 : 11) + '" fill="' + col + '"' + (sp.kind === "top" ? ' fill-opacity=".85"' : "") + "/>";
        s += '<text x="' + px + '" y="' + (py + 4) + '" text-anchor="middle" font-size="9" font-weight="800" fill="#0b0f1a">' + sp.k.replace(/5$/, "") + "</text>";
      });
      s += '<g class="seat" style="cursor:grab"><rect x="' + (lx - 30) + '" y="' + (ly - 12) + '" width="60" height="24" rx="8" fill="var(--text)" fill-opacity=".9"/><text x="' + lx + '" y="' + (ly + 5) + '" text-anchor="middle" font-size="11" font-weight="800" fill="var(--bg)">YOU ⇕</text></g>';
      s += '<text x="' + (pad + sw / 2) + '" y="' + (pad + sh + 26) + '" text-anchor="middle" fill="var(--muted)" font-size="12">' + len(W) + " wide × " + len(L) + ' long · drag YOU to move the seat</text></svg>';
      el.viz.innerHTML = s; svgEl = $("svg", el.viz);
      var seatG = $(".seat", el.viz);
      function move(ev) {
        if (!dragging) return; ev.preventDefault();
        var pt = svgEl.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
        var p = pt.matrixTransform(svgEl.getScreenCTM().inverse()), yFt = (p.y - pad) / scale;
        yFt = Math.min(L - 1, Math.max(3, yFt)); el.seat.value = unit === "m" ? r1(yFt / FT_PER_M) : r1(yFt); calc();
      }
      seatG.addEventListener("pointerdown", function (e) { dragging = true; try { svgEl.setPointerCapture(e.pointerId); } catch (x) {} });
      svgEl.addEventListener("pointermove", move);
      svgEl.addEventListener("pointerup", function () { dragging = false; });
      svgEl.addEventListener("pointercancel", function () { dragging = false; });
      /* table */
      var rows = list.map(function (sp) {
        var d3 = Math.hypot(sp.x - x0, sp.y - seatY, sp.z - ear);
        return "<tr><td><strong>" + esc(sp.name) + "</strong></td><td>" + esc(sp.target) + '</td><td class="num">' + len(d3) + '</td><td class="num">' + len(sp.y) + " from screen wall · " + len(sp.x) + " from left wall</td><td class=\"num\">" + (sp.kind === "top" ? "Ceiling" : len(sp.z)) + "</td></tr>";
      }).join("");
      el.table.innerHTML = "<table><thead><tr><th>Speaker</th><th>Target angle</th><th class=\"num\">To your ears</th><th class=\"num\">Position</th><th class=\"num\">Height</th></tr></thead><tbody>" + rows + "</tbody></table>";
      var warn = [];
      if (L - seatY < 2.5) warn.push("Your seat is close to the back wall: expect boomy bass and cramped surrounds. Pull it forward if you can.");
      if (heights(c).length && H < 7.5) warn.push("Low ceiling: angle in-ceiling speakers toward the seat or use Atmos-enabled (upfiring) modules.");
      if (seatY / L < 0.45) warn.push("You're sitting in the front half of the room; for most rooms a seat around 55–65% of the length from the screen balances bass and surround spacing.");
      var pct = Math.round(seatY / L * 100);
      el.out.innerHTML = stat("Layout", c, list.filter(function (x) { return x.kind !== "sub"; }).length + " speakers + " + subs(c) + " sub" + (subs(c) > 1 ? "s" : ""), true) +
        stat("Seat position", pct + "% of length", len(seatY) + " from the screen wall") + stat("Ear height used", len(ear), "Dolby's seated ear-height reference") +
        (warn.length ? '<div class="callout warn">' + warn.map(esc).join("<br>") + "</div>" : '<div class="callout">' + badge("ok", "Looks good") + " Set each speaker's distance in your receiver (or run room correction) so sound arrives in sync.</div>");
      share({ c: c, l: num(el.L), w: num(el.W), h: num(el.H), s: num(el.seat) });
      planLink(el.cta, { src: "tool-speakers", config: c, type: "Surround / Atmos install" });
    }
    bind(root, calc); calc();
  })();

  /* ===================================================== 4. Streaming cost */
  (function () {
    var root = $("#tool-stream"); if (!root) return;
    var list = $("#sc-list", root), out = $("#sc-out"), bars = $("#sc-bars"), cta = $("#sc-cta"), cable = $("#sc-cable", root), equip = $("#sc-equip", root), filter = "all", data = [];
    var pre = {}; (HM.params && HM.params.get("s") || "").split(",").forEach(function (x) { var p = x.split(":"); if (p[0]) pre[p[0]] = parseInt(p[1] || "0", 10); });
    if (HM.params && HM.params.get("cable")) cable.value = HM.params.get("cable");
    fetch(ROOT + "assets/data/prices.json").then(function (r) { return r.json(); }).then(function (d) {
      data = d.services; $("#sc-asof").textContent = d.asOf || "";
      var hasPre = Object.keys(pre).length;
      list.innerHTML = data.map(function (s, i) {
        var on = hasPre ? (s.id in pre) : !!s.def, pi = hasPre && s.id in pre ? pre[s.id] : (s.defPlan || 0);
        var opts = s.plans.map(function (p, j) { return '<option value="' + j + '"' + (j === pi ? " selected" : "") + ">" + esc(p.n) + "</option>"; }).join("");
        return '<div class="svc' + (on ? " on" : "") + '" data-i="' + i + '" data-cat="' + s.cat + '"><input type="checkbox" aria-label="Include ' + esc(s.name) + '"' + (on ? " checked" : "") + '>' +
          '<span class="svc-name">' + esc(s.name) + '<span class="svc-sub">' + esc(s.note || "") + '</span></span><span class="svc-right"><select aria-label="' + esc(s.name) + ' plan">' + opts + '</select>' +
          '<label class="sr" style="position:absolute;left:-9999px" for="pr' + i + '">Price</label>$<input id="pr' + i + '" type="number" step="0.01" min="0" value="' + s.plans[pi].p + '"></span></div>';
      }).join("");
      $$(".svc", list).forEach(function (row) {
        var s = data[+row.getAttribute("data-i")], sel = $("select", row), pr = $('input[type="number"]', row), cb = $('input[type="checkbox"]', row);
        sel.addEventListener("change", function () { pr.value = s.plans[+sel.value].p; calc(); });
        cb.addEventListener("change", function () { row.classList.toggle("on", cb.checked); calc(); });
        pr.addEventListener("input", calc);
      });
      calc();
    }).catch(function () { list.innerHTML = '<p class="muted">Price list could not load. Refresh the page.</p>'; });
    $$('[data-seg="cat"] button', root).forEach(function (b) {
      b.addEventListener("click", function () {
        $$('[data-seg="cat"] button', root).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        filter = b.getAttribute("data-val"); $$(".svc", list).forEach(function (r) { r.hidden = filter !== "all" && r.getAttribute("data-cat") !== filter; });
      });
    });
    [cable, equip].forEach(function (i) { i.addEventListener("input", calc); });
    function calc() {
      var tot = 0, sel = [], svod = [], pre2 = [];
      $$(".svc", list).forEach(function (row) {
        if (!$('input[type="checkbox"]', row).checked) return;
        var s = data[+row.getAttribute("data-i")], p = Math.max(0, num($('input[type="number"]', row))), pi = $("select", row).value;
        tot += p; sel.push({ name: s.name, p: p }); pre2.push(s.id + ":" + pi); if (s.cat === "svod") svod.push(p);
      });
      var cab = Math.max(0, num(cable)), eq = Math.max(0, num(equip)), save = cab - tot;
      var html = stat("Streaming per month", money(tot), sel.length + " service" + (sel.length === 1 ? "" : "s"), true) + stat("Per year", money(tot * 12), "Before taxes and promos");
      if (cab > 0) {
        html += stat(save >= 0 ? "You save per year" : "Extra per year", money(Math.abs(save) * 12), save >= 0 ? "vs your " + money(cab) + "/mo cable or satellite bill" : "Streaming costs more than your current bill");
        html += stat("5-year difference", (save >= 0 ? "" : "−") + money(Math.abs(save) * 60 - eq), eq ? "After " + money(eq) + " in equipment" : "");
        if (save > 0 && eq > 0) html += stat("Equipment pays back in", Math.ceil(eq / save) + " mo", "");
      }
      if (svod.length >= 3) {
        svod.sort(function (a, b) { return b - a; }); var keep = svod[0] + svod[1], rest = svod.slice(2).reduce(function (a, b) { return a + b; }, 0);
        html += '<div class="callout"><strong>Rotation tip:</strong> keep 2 on-demand services at a time and rotate monthly. That cuts about ' + money(rest * 12) + "/year from your on-demand spend (paying ~" + money(keep) + "/mo for on-demand instead of " + money(keep + rest) + ").</div>";
      }
      out.innerHTML = html;
      var mx = Math.max(cab, tot, 1);
      bars.innerHTML = (cab ? '<div class="bar"><span>Cable / satellite</span><span class="bar-track"><span class="bar-fill" style="width:' + (cab / mx * 100) + '%;background:var(--rose)"></span></span><span class="num">' + money(cab) + "</span></div>" : "") +
        '<div class="bar"><span>Your streaming</span><span class="bar-track"><span class="bar-fill teal" style="width:' + (tot / mx * 100) + '%"></span></span><span class="num">' + money(tot) + "</span></div>";
      share({ s: pre2.join(","), cable: cab });
      planLink(cta, { src: "tool-streaming", type: "Cut the cord / streaming setup" });
    }
  })();

  /* ===================================================== 5. Bandwidth */
  (function () {
    var root = $("#tool-bw"); if (!root) return;
    var RATES = { k4: [15, 0.5], fhd: [5, 0.3], hd: [3, 0.2], call: [4, 3.5], game: [3, 1], cloud: [35, 1], wfh: [10, 10], iot: [0.5, 0.2], web: [3, 1] };
    var out = $("#bw-out"), cta = $("#bw-cta"), hrs4 = $("#bw-h4k", root), hrsHD = $("#bw-hhd", root);
    $$(".stepper", root).forEach(function (st) {
      var inp = $("input", st);
      $$("button", st).forEach(function (b) { b.addEventListener("click", function () { inp.value = Math.max(0, Math.min(50, num(inp) + (+b.getAttribute("data-step")))); calc(); }); });
    });
    bind(root, calc);
    function calc() {
      var down = 0, up = 0;
      Object.keys(RATES).forEach(function (k) { var n = Math.max(0, num($("#bw-" + k, root))); down += n * RATES[k][0]; up += n * RATES[k][1]; });
      var rec = down * 1.5, tiers = [100, 200, 300, 500, 1000, 2000], tier = tiers.filter(function (t) { return t >= rec; })[0] || 2000;
      var gb = (num(hrs4) * 7 + num(hrsHD) * 3) * 30;
      var html = stat("Peak demand", r0(down) + " Mbps", "Everything you listed running at once") + stat("Recommended plan", tier >= 1000 ? (tier / 1000) + " Gbps" : tier + " Mbps", "Peak × 1.5 for Wi-Fi overhead and spikes", true) + stat("Upload needed", r0(Math.max(10, up * 1.5)) + " Mbps", "Video calls, uploads, cloud backup") + stat("Streaming data / month", gb >= 1000 ? r1(gb / 1000) + " TB" : r0(gb) + " GB", "≈7 GB/h 4K, ≈3 GB/h HD");
      var notes = [];
      if (gb > 1200) notes.push("Your viewing alone tops 1.2 TB/month, a common cable data cap. Look for unlimited data or fiber.");
      if (tier >= 500) notes.push("At this speed, Wi-Fi is usually the bottleneck. Use Wi-Fi 6/6E/7 mesh and wire the main TV with Ethernet.");
      if (num($("#bw-cloud", root)) > 0) notes.push("Cloud gaming is sensitive to latency and jitter, not just speed. Wired connections help most.");
      out.innerHTML = html + (notes.length ? '<div class="callout">' + notes.map(esc).join("<br>") + "</div>" : "");
      planLink(cta, { src: "tool-bandwidth", type: "Wi-Fi & network for streaming" });
    }
    calc();
  })();

  /* ===================================================== 6. Storage */
  (function () {
    var root = $("#tool-store"); if (!root) return;
    var el = { mc: $("#st-mc", root), mq: $("#st-mq", root), ec: $("#st-ec", root), eq: $("#st-eq", root), mu: $("#st-mu", root), ph: $("#st-ph", root), gr: $("#st-gr", root), yr: $("#st-yr", root), dr: $("#st-dr", root), out: $("#st-out"), table: $("#st-table"), cta: $("#st-cta") };
    fromURL({ mc: el.mc, mq: el.mq, ec: el.ec, eq: el.eq });
    function calc() {
      var gb = num(el.mc) * num(el.mq) + num(el.ec) * num(el.eq) + num(el.mu) + num(el.ph);
      var tb = gb / 1000, fut = tb * Math.pow(1 + num(el.gr) / 100, num(el.yr)), need = fut / 0.8, d = Math.max(1, num(el.dr, 16));
      function fit(minN, use) { for (var n = minN; n < 60; n++) if (use(n) * d >= need) return n; return 60; }
      var schemes = [
        ["Single disks / JBOD (no protection)", 1, function (n) { return n; }],
        ["Mirror (RAID 1 / RAID 10)", 2, function (n) { return Math.floor(n / 2); }],
        ["Single parity (RAID 5, SHR, Unraid 1-parity)", 3, function (n) { return n - 1; }],
        ["Dual parity (RAID 6, SHR-2, Unraid 2-parity)", 4, function (n) { return n - 2; }]
      ];
      var rows = schemes.map(function (s) {
        var n = fit(s[1], s[2]); if (s[1] === 2 && n % 2) n++;
        return "<tr><td>" + s[0] + '</td><td class="num">' + n + " × " + d + ' TB</td><td class="num">' + r1(s[2](n) * d) + ' TB</td><td class="num">' + r0(n * d) + " TB</td></tr>";
      }).join("");
      el.out.innerHTML = stat("Library today", r1(tb) + " TB", r0(gb).toLocaleString() + " GB") + stat("In " + num(el.yr) + " years", r1(fut) + " TB", num(el.gr) + "% growth per year") + stat("Usable space to buy", r1(need) + " TB", "Keeps the array ≤80% full", true) +
        '<div class="callout"><strong>Sanity check:</strong> a high-bitrate 4K movie is roughly 60–65 GB. Kaleidescape\'s 8 TB server is rated for about 125 high-bitrate 4K films or about 200 HD films. RAID protects against a failed drive, not deletion or fire, so back up irreplaceable files separately.</div>';
      el.table.innerHTML = '<table><thead><tr><th>Protection</th><th class="num">Drives</th><th class="num">Usable</th><th class="num">Raw</th></tr></thead><tbody>' + rows + "</tbody></table>";
      share({ mc: num(el.mc), mq: el.mq.value, ec: num(el.ec), eq: el.eq.value });
      planLink(el.cta, { src: "tool-storage", type: "Media server / NAS setup" });
    }
    bind(root, calc); calc();
  })();

  /* ===================================================== 7. Cost estimator */
  (function () {
    var root = $("#tool-cost"); if (!root) return;
    var C = {
      display: { tv55: [500, 2500, "TV 55–65\"", "tv"], tv75: [1000, 4500, "TV 75–85\"", "tv"], tv98: [2500, 20000, "TV 98\"+", "tv"], pj1: [850, 2800, "Entry projector + screen", "pj"], pj2: [2500, 8500, "Mid-range 4K projector + screen", "pj"], pj3: [8000, 37000, "High-end projector + screen", "pj"] },
      audio: { bar: [250, 1500, "Soundbar with subwoofer"], s51: [800, 3500, "5.1 receiver + speakers + sub"], atmos: [2000, 8000, "Atmos 5.1.2–7.1.4 system"], ref: [8000, 40000, "Reference / high-end system"] },
      seating: { none: [0, 0, "Existing furniture"], sofa: [1000, 4000, "New sofa or sectional"], row: [2000, 8000, "One row of recliners"], rows: [5000, 20000, "Two rows + riser"] },
      acoustic: { none: [0, 0, "None"], basic: [300, 1000, "Basic panels"], full: [2000, 10000, "Full treatment design"] },
      control: { none: [0, 0, "None"], basic: [150, 1000, "Dimmable lighting / simple remote"], full: [2500, 15000, "Lighting + automation system"] },
      build: { none: [0, 0, "No construction"], finish: [1000, 5000, "Paint, carpet, in-wall wiring"], full: [80, 200, "Full room build-out", "sqft"] }
    };
    var f = {}; ["display", "audio", "seating", "acoustic", "control", "build"].forEach(function (k) { f[k] = $("#ce-" + k, root); });
    var sq = $("#ce-sqft", root), inst = $("#ce-install", root), cal = $("#ce-cal", root), out = $("#ce-out"), tbl = $("#ce-table"), cta = $("#ce-cta");
    fromURL({ d: f.display, a: f.audio, se: f.seating, ac: f.acoustic, co: f.control, b: f.build, sq: sq });
    function calc() {
      var lines = [], lo = 0, hi = 0, area = Math.max(80, num(sq, 250));
      function add(name, l, h) { if (h <= 0) return; lines.push([name, l, h]); lo += l; hi += h; }
      Object.keys(f).forEach(function (k) {
        var v = C[k][f[k].value]; if (!v) return;
        if (v[3] === "sqft") add(v[2] + " (" + r0(area) + " sq ft × $" + v[0] + "–" + v[1] + ")", v[0] * area, v[1] * area); else add((k === "display" ? "Display: " : k === "audio" ? "Audio: " : k === "seating" ? "Seating: " : k === "acoustic" ? "Acoustics: " : k === "control" ? "Lighting & control: " : "") + v[2], v[0], v[1]);
      });
      if (inst.value === "pro") {
        var d = C.display[f.display.value], a = f.audio.value;
        if (d[3] === "tv") add("TV wall mounting labour", 122, 351); else add("Projector & screen installation", 1332, 6015);
        if (a !== "bar") add("Surround speaker installation", 624, 3209);
        if (a !== "bar" || f.build.value !== "none") add("In-wall wiring", 715, 2500);
        if (f.build.value === "full" || a === "ref") add("Home theater designer", 500, 3000);
      }
      if (cal.checked) add("Professional calibration (audio + video)", 250, 900);
      var mid = (lo + hi) / 2;
      out.innerHTML = stat("Budget", money(lo), "Value-focused choices") + stat("Typical", money(mid), "Mid-range gear and labour", true) + stat("Premium", money(hi), "High-end gear and finishes") +
        '<div class="callout">For context, published 2026 cost guides put a professionally installed home theater at about <strong>$20,000 on average</strong>, typically <strong>$10,000–$60,000</strong>, with build-outs at <strong>$80–$200 per sq ft</strong> (Angi). Simple living-room upgrades cost far less.</div>';
      tbl.innerHTML = '<table><thead><tr><th>Line item</th><th class="num">Low</th><th class="num">High</th></tr></thead><tbody>' + lines.map(function (l) { return "<tr><td>" + esc(l[0]) + '</td><td class="num">' + money(l[1]) + '</td><td class="num">' + money(l[2]) + "</td></tr>"; }).join("") +
        '<tr><td><strong>Total</strong></td><td class="num"><strong>' + money(lo) + '</strong></td><td class="num"><strong>' + money(hi) + "</strong></td></tr></tbody></table>";
      var band = mid < 500 ? "Under $500" : mid < 2000 ? "$500–$2k" : mid < 5000 ? "$2k–$5k" : mid < 15000 ? "$5k–$15k" : mid < 50000 ? "$15k–$50k" : "$50k+";
      share({ d: f.display.value, a: f.audio.value, se: f.seating.value, ac: f.acoustic.value, co: f.control.value, b: f.build.value, sq: area });
      planLink(cta, { src: "tool-cost", budget: band, install: inst.value === "pro" ? "Pro install" : "DIY with a plan" });
    }
    bind(root, calc); calc();
  })();

  /* ===================================================== 8. Room modes */
  (function () {
    var root = $("#tool-modes"); if (!root) return;
    var unit = "ft", el = { L: $("#rm-l", root), W: $("#rm-w", root), H: $("#rm-h", root), out: $("#rm-out"), viz: $("#rm-viz"), table: $("#rm-table") };
    var u = seg(root, "unit", function (v) { [el.L, el.W, el.H].forEach(function (i) { var d = num(i); i.value = v === "m" ? r1(d / FT_PER_M) : r1(d * FT_PER_M); }); unit = v; $$("[data-unit-label]", root).forEach(function (s) { s.textContent = v; }); calc(); }); if (u) unit = u;
    fromURL({ l: el.L, w: el.W, h: el.H });
    function calc() {
      var c = unit === "ft" ? 1125 : 343, dims = [["Length", num(el.L, 20), "var(--accent)"], ["Width", num(el.W, 14), "var(--teal)"], ["Height", num(el.H, 8.5), "var(--violet)"]], modes = [];
      dims.forEach(function (d) { if (d[1] <= 0) return; for (var n = 1; n <= 8; n++) { var f = n * c / (2 * d[1]); if (f <= 250) modes.push({ f: f, dim: d[0], n: n, col: d[2] }); } });
      modes.sort(function (a, b) { return a.f - b.f; });
      var issues = [], gaps = [];
      for (var i = 1; i < modes.length; i++) {
        var a = modes[i - 1], b = modes[i];
        if (b.f - a.f < Math.max(3, a.f * 0.05) && a.dim !== b.dim) issues.push(r0(a.f) + " Hz (" + a.dim + " & " + b.dim + ")");
        if (b.f < 150 && b.f - a.f > 20) gaps.push(r0(a.f) + "–" + r0(b.f) + " Hz");
      }
      var h = num(el.H, 8.5), ratios = [1, r1(num(el.W) / h * 100) / 100, r1(num(el.L) / h * 100) / 100];
      var grade = issues.length === 0 && gaps.length <= 1 ? ["ok", "Good spread"] : issues.length <= 2 ? ["warn", "Some stacking"] : ["bad", "Problem ratios"];
      el.out.innerHTML = stat("Room ratio (H:W:L)", ratios.map(function (x) { return x.toFixed(2); }).join(" : "), "") + stat("Lowest mode", r0(modes[0] ? modes[0].f : 0) + " Hz", "Length axial", true) + stat("Seat sweet spot", (unit === "ft" ? r1(num(el.L) * 0.38) + " ft" : r1(num(el.L) * 0.38) + " m"), "≈38% of length from a wall") +
        '<div class="callout ' + (grade[0] === "ok" ? "" : "warn") + '">' + badge(grade[0], grade[1]) + " " + (issues.length ? "Coinciding modes near " + issues.slice(0, 4).join(", ") + " will boom. " : "No major coinciding axial modes. ") + (gaps.length ? "Gaps at " + gaps.slice(0, 3).join(", ") + " can sound thin. " : "") + "Multiple subwoofers and room EQ smooth both problems.</div>";
      var w = 600, x = function (f) { return 30 + (f - 20) / 230 * (w - 50); };
      var svg = '<svg class="freq-chart" viewBox="0 0 ' + w + ' 150" role="img" aria-label="Room mode chart"><line x1="30" y1="110" x2="' + (w - 20) + '" y2="110" stroke="var(--line2)"/>';
      [20, 50, 100, 150, 200, 250].forEach(function (t) { svg += '<line x1="' + x(t) + '" y1="110" x2="' + x(t) + '" y2="116" stroke="var(--line2)"/><text x="' + x(t) + '" y="132" text-anchor="middle">' + t + " Hz</text>"; });
      modes.forEach(function (m) { svg += '<line x1="' + x(m.f) + '" y1="' + (110 - (90 - m.n * 9)) + '" x2="' + x(m.f) + '" y2="110" stroke="' + m.col + '" stroke-width="3" stroke-linecap="round"><title>' + m.dim + " mode " + m.n + ": " + r1(m.f) + " Hz</title></line>"; });
      svg += '<text x="30" y="14">Length</text><rect x="78" y="6" width="10" height="10" fill="var(--accent)"/><text x="100" y="14">Width</text><rect x="140" y="6" width="10" height="10" fill="var(--teal)"/><text x="162" y="14">Height</text><rect x="206" y="6" width="10" height="10" fill="var(--violet)"/></svg>';
      el.viz.innerHTML = svg;
      el.table.innerHTML = '<table><thead><tr><th>Frequency</th><th>Dimension</th><th class="num">Order</th></tr></thead><tbody>' + modes.filter(function (m) { return m.f <= 200; }).map(function (m) { return '<tr><td class="num" style="text-align:left">' + r1(m.f) + " Hz</td><td>" + m.dim + '</td><td class="num">' + m.n + "</td></tr>"; }).join("") + "</tbody></table>";
      share({ l: num(el.L), w: num(el.W), h: num(el.H) });
    }
    bind(root, calc); calc();
  })();

  /* ===================================================== 9. HDMI bandwidth */
  (function () {
    var root = $("#tool-hdmi"); if (!root) return;
    var el = { res: $("#hd-res", root), hz: $("#hd-hz", root), bit: $("#hd-bit", root), cs: $("#hd-cs", root), out: $("#hd-out"), table: $("#hd-table") };
    var TOT = { "1080p": [2200, 1125], "1440p": [2720, 1525], "4K": [4400, 2250], "8K": [9000, 4500] };
    var LINKS = [["HDMI 1.4 (High Speed cable)", 8.16], ["HDMI 2.0 · 18 Gbps (Premium High Speed cable)", 14.4], ["HDMI 2.1 · FRL 24 Gbps", 21.33], ["HDMI 2.1 · FRL 32 Gbps", 28.44], ["HDMI 2.1 · FRL 40 Gbps (many TVs/consoles)", 35.56], ["HDMI 2.1 · FRL 48 Gbps (Ultra High Speed cable)", 42.67]];
    fromURL({ r: el.res, hz: el.hz, b: el.bit, c: el.cs });
    function calc() {
      var t = TOT[el.res.value], hz = num(el.hz, 60), bits = num(el.bit, 10), cs = el.cs.value;
      var bpp = cs === "444" ? bits * 3 : cs === "422" ? 24 : bits * 1.5;
      var gbps = t[0] * t[1] * hz * bpp / 1e9, need = null;
      LINKS.forEach(function (l) { if (!need && l[1] * 1.01 >= gbps) need = l; });
      el.out.innerHTML = stat("Video data rate", r1(gbps) + " Gbps", el.res.value + " " + hz + " Hz · " + bits + "-bit · " + (cs === "444" ? "RGB / 4:4:4" : cs === "422" ? "4:2:2" : "4:2:0"), true) +
        stat("Minimum link", need ? need[0].split(" (")[0] : "Beyond 48 Gbps", need ? (need[0].match(/\((.*)\)/) || ["", ""])[1] : "Needs Display Stream Compression (DSC)") +
        '<div class="callout">' + (need ? badge("ok", "Supported") + " Any port and cable rated for <strong>" + esc(need[0]) + "</strong> or higher carries this signal." : badge("bad", "Compression needed") + " Lower the refresh rate, use 4:2:0, or rely on DSC-capable gear.") +
        " For lossless Dolby Atmos (TrueHD) or DTS:X to a receiver or soundbar, both ends need <strong>eARC</strong>; plain ARC carries compressed Atmos only.</div>";
      el.table.innerHTML = '<table><thead><tr><th>Link</th><th class="num">Usable data</th><th>This signal</th></tr></thead><tbody>' + LINKS.map(function (l) { var ok = l[1] * 1.01 >= gbps; return "<tr><td>" + esc(l[0]) + '</td><td class="num">' + l[1] + " Gbps</td><td>" + badge(ok ? "ok" : "bad", ok ? "Fits" : "Too much") + "</td></tr>"; }).join("") + "</tbody></table>";
      share({ r: el.res.value, hz: hz, b: bits, c: cs });
    }
    bind(root, calc); calc();
  })();

  /* ===================================================== 10. Setup Matchmaker */
  (function () {
    var root = $("#tool-match"); if (!root) return;
    var out = $("#mm-out"), btn = $("#mm-go", root);
    var PK = {
      bar: { n: "Soundbar Starter", r: [800, 2500], why: "Big upgrade over TV speakers with one box and no wiring.", parts: ["55–65\" 4K TV with good HDR", "Dolby Atmos soundbar with wireless subwoofer", "4K streaming stick or the TV's own apps", "Optional: wireless rear speakers later"] },
      apt: { n: "Apartment Smart Setup", r: [1200, 3500], why: "Cinema feel without upsetting the neighbours.", parts: ["55–75\" TV or a portable laser projector", "Compact Atmos soundbar with night mode", "Wireless rears (no wire runs)", "Wireless headphones for late nights"] },
      s51: { n: "5.1 Living Room", r: [2500, 6000], why: "Real surround with a receiver you can grow into Atmos.", parts: ["65–77\" TV", "AV receiver with room correction", "5 bookshelf/tower speakers + 1 subwoofer", "Flat or in-wall wiring"] },
      atmos: { n: "Atmos Media Room", r: [6000, 15000], why: "Overhead sound and a big screen for a shared family room.", parts: ["77–98\" TV or a UST projector with ALR screen", "Atmos receiver (9–11 channels)", "5.1.2 or 5.1.4 speakers, 1–2 subwoofers", "Light control: blinds or smart dimmers"] },
      pj: { n: "Projector Den", r: [5000, 12000], why: "The biggest picture per dollar in a room you can darken.", parts: ["4K projector (2,000+ calibrated lumens)", "100–120\" fixed-frame screen", "5.1.2 Atmos system", "Dark walls/ceiling near the screen"] },
      ded: { n: "Dedicated Cinema", r: [20000, 60000], why: "A purpose-built room engineered for reference sound and picture.", parts: ["High-end projector + 120–150\" acoustically transparent screen", "7.2.4 or larger Atmos, multiple subwoofers", "Acoustic treatment and sound isolation", "Theater seating on a riser, lighting scenes, pro calibration"] }
    };
    function pick(a) {
      if (a.room === "dedicated" && (a.budget >= 4)) return "ded";
      if (a.room === "apartment" || a.noise === "quiet") return a.budget >= 3 ? "atmos" : "apt";
      if (a.budget <= 1) return "bar";
      if (a.light === "dark" && a.watch === "movies" && a.budget >= 3) return a.room === "dedicated" ? "ded" : "pj";
      if (a.budget >= 4) return a.room === "dedicated" ? "ded" : "atmos";
      if (a.budget === 3) return a.light === "dark" ? "pj" : "atmos";
      return a.diy === "plug" ? "bar" : "s51";
    }
    btn.addEventListener("click", function () {
      var a = {}, miss = false;
      ["room", "budget", "watch", "light", "noise", "diy"].forEach(function (q) { var c = $('input[name="mm-' + q + '"]:checked', root); if (!c) miss = true; else a[q] = q === "budget" ? +c.value : c.value; });
      if (miss) { out.innerHTML = '<p class="form-msg err">Answer all 6 questions to see your match.</p>'; return; }
      var k = pick(a), p = PK[k], band = p.r[1] <= 2500 ? "$500–$2k" : p.r[1] <= 6000 ? "$2k–$5k" : p.r[1] <= 15000 ? "$5k–$15k" : "$15k–$50k";
      out.innerHTML = '<div class="estimate"><span class="kicker">Your match</span><h2 style="margin:.2rem 0">' + esc(p.n) + '</h2><p class="muted">' + esc(p.why) + '</p><p class="big">' + money(p.r[0]) + "–" + money(p.r[1]) + '</p><p class="note">Typical all-in range for gear (labour extra if you hire a pro).</p><ul class="feature-list">' + p.parts.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") +
        '</ul><div class="share-row" style="margin-top:1rem"><a class="btn btn-primary" href="' + ROOT + "plan.html?" + new URLSearchParams({ src: "tool-matchmaker", package: p.n, budget: band, install: a.diy === "pro" ? "Pro install" : "DIY with a plan" }).toString() + '">Get this planned for my room</a><a class="btn btn-ghost" href="' + ROOT + 'cost-estimator.html">Fine-tune the budget</a></div></div>';
      out.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  })();
})();
