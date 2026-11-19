/* Home.Media — Free Home Media Plan wizard (lead engine). */
(function () {
  "use strict";
  var doc = document, HM = window.HM || {};
  var form = doc.getElementById("planForm"); if (!form) return;
  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  var steps = $$(".wz-step", form), bar = $("#wzProgress"), msg = $("#wzMsg"), cur = 0;
  var back = $("#wzBack"), next = $("#wzNext"), send = $("#wzSend"), stepLabel = $("#wzStepLabel");

  /* typical all-in project ranges (USD). Sources noted on services.html */
  var RANGE = {
    "Dedicated home theater": [10000, 60000], "Living-room upgrade": [1500, 8000], "TV mounting & cable hiding": [122, 600],
    "Surround / Atmos install": [1500, 11000], "Projector & screen": [1332, 6015], "Whole-home audio": [2000, 15000],
    "Smart home & lighting": [1500, 15000], "Media server / NAS setup": [400, 3000], "Wi-Fi & network for streaming": [300, 2500],
    "Cut the cord / streaming setup": [0, 400], "Calibration & tuning": [250, 900]
  };
  var BUDGET = { "Under $500": [0, 500], "$500–$2k": [500, 2000], "$2k–$5k": [2000, 5000], "$5k–$15k": [5000, 15000], "$15k–$50k": [15000, 50000], "$50k+": [50000, 150000] };

  bar.innerHTML = steps.map(function () { return "<span></span>"; }).join("");

  /* ---------- prefill from tools / links ---------- */
  var P = HM.params || new URLSearchParams(location.search);
  var typeMap = { "Living-room upgrade": 1, "Projector & screen": 1, "Surround / Atmos install": 1, "Cut the cord / streaming setup": 1, "Media server / NAS setup": 1, "Wi-Fi & network for streaming": 1, "Dedicated home theater": 1, "TV mounting & cable hiding": 1, "Whole-home audio": 1, "Smart home & lighting": 1, "Calibration & tuning": 1 };
  (P.get("type") || "").split("|").forEach(function (t) { if (typeMap[t]) { var c = $('input[name="projects"][value="' + t + '"]', form); if (c) c.checked = true; } });
  ["budget", "install", "timeline", "room"].forEach(function (k) { var v = P.get(k); if (v) { var r = $('input[name="' + k + '"][value="' + v.replace(/"/g, "") + '"]', form); if (r) r.checked = true; } });
  var from = [];
  ["package", "screen", "config"].forEach(function (k) { var v = P.get(k); if (v) { $('input[name="' + k + '"]', form).value = v; from.push(k + ": " + v); } });
  $('input[name="source_tool"]', form).value = P.get("src") || "direct";
  if (from.length) { var n = $("#wzFrom"); n.hidden = false; n.textContent = "Carried over from your tool result: " + from.join(" · "); }

  /* restore a half-finished plan from this session */
  try {
    var saved = JSON.parse(sessionStorage.getItem("hm-plan") || "null");
    if (saved && !P.get("type")) Object.keys(saved).forEach(function (k) {
      [].concat(saved[k]).forEach(function (v) {
        var el = form.querySelector('[name="' + k + '"][value="' + String(v).replace(/"/g, '\\"') + '"]') || form.querySelector('[name="' + k + '"]:not([type="radio"]):not([type="checkbox"])');
        if (!el) return; if (el.type === "radio" || el.type === "checkbox") el.checked = true; else if (!el.value) el.value = v;
      });
    });
  } catch (e) {}
  function save() {
    var o = {};
    new FormData(form).forEach(function (v, k) { if (k.charAt(0) === "_" || !v) return; if (o[k]) o[k] = [].concat(o[k], v); else o[k] = v; });
    try { sessionStorage.setItem("hm-plan", JSON.stringify(o)); } catch (e) {}
  }
  form.addEventListener("change", save);

  /* ---------- estimate ---------- */
  function vals(name) { return $$('[name="' + name + '"]:checked', form).map(function (i) { return i.value; }); }
  function val(name) { var c = $('[name="' + name + '"]:checked', form); return c ? c.value : ""; }
  function estimate() {
    var pr = vals("projects"), lo = 0, hi = 0;
    pr.forEach(function (p) { var r = RANGE[p] || [0, 0]; lo += r[0]; hi += r[1]; });
    if (pr.indexOf("Dedicated home theater") > -1) { lo = Math.max(lo, 10000); }
    var size = val("roomsize"), bud = BUDGET[val("budget")] || null, room = val("room");
    var screen = /Small/.test(size) ? "55–65\" TV" : /Medium/.test(size) ? "75–85\" TV or 100\" UST projector" : /Large/.test(size) ? "100–120\" projector screen or 98\" TV" : "120–150\" projector screen";
    var audio = !bud || bud[1] <= 2000 ? "Dolby Atmos soundbar + subwoofer" : bud[1] <= 5000 ? "5.1 receiver system (Atmos-ready)" : bud[1] <= 15000 ? "5.1.2 / 5.1.4 Dolby Atmos" : "7.2.4 Atmos with dual subwoofers";
    if (/Bedroom|Apartment/.test(room)) audio = bud && bud[1] > 5000 ? "5.1.2 Atmos with night-mode EQ" : "Compact Atmos soundbar + wireless rears";
    var fit = "", fitKind = "ok";
    if (bud && hi) {
      if (bud[1] < lo) { fit = "Your budget is below the typical range for this scope. We'll prioritise what matters most and phase the rest."; fitKind = "warn"; }
      else if (bud[0] > hi) { fit = "Your budget has room above the typical range: think calibration, better seating or acoustic treatment."; }
      else fit = "Your budget fits the typical range for this scope.";
    }
    return { lo: lo, hi: hi, screen: screen, audio: audio, fit: fit, fitKind: fitKind, pr: pr };
  }
  function money(n) { return "$" + Math.round(n).toLocaleString("en-US"); }
  function renderEstimate() {
    var e = estimate(), box = $("#wzEstimate");
    if (!e.pr.length) { box.hidden = true; return; }
    box.hidden = false;
    box.innerHTML = '<span class="kicker">Your instant estimate</span><p class="big">' + money(e.lo) + "–" + money(e.hi) + '</p><p class="note">Typical all-in range for: ' + HM.esc(e.pr.join(", ")) + '.</p><ul class="feature-list"><li>Screen: ' + HM.esc(e.screen) + "</li><li>Sound: " + HM.esc(e.audio) + "</li>" + (e.fit ? "<li>" + HM.esc(e.fit) + "</li>" : "") + '</ul><p class="note">Your full plan adds layout, model shortlists and a phased budget.</p>';
    $('input[name="estimate"]', form).value = money(e.lo) + "–" + money(e.hi);
    $('input[name="recommendation"]', form).value = e.screen + " · " + e.audio;
  }

  /* ---------- step validation ---------- */
  function check(i) {
    var s = steps[i], need = (s.getAttribute("data-need") || "").split(",").filter(Boolean), miss = [];
    need.forEach(function (n) {
      var els = $$('[name="' + n + '"]', s); if (!els.length) return;
      if (els[0].type === "radio" || els[0].type === "checkbox") { if (!els.some(function (x) { return x.checked; })) miss.push(els[0].getAttribute("data-label") || n); }
      else if (!els[0].value.trim() || !els[0].checkValidity()) miss.push(els[0].getAttribute("data-label") || n);
    });
    if (miss.length) { msg.className = "form-msg err"; msg.textContent = "Please choose or fill in: " + miss.join(", ") + "."; return false; }
    msg.className = "form-msg"; msg.textContent = ""; return true;
  }
  function show(i) {
    cur = i;
    steps.forEach(function (s, j) { s.classList.toggle("active", j === i); });
    $$("span", bar).forEach(function (sp, j) { sp.classList.toggle("done", j <= i); });
    back.hidden = i === 0; next.hidden = i === steps.length - 1; send.hidden = i !== steps.length - 1;
    stepLabel.textContent = "Step " + (i + 1) + " of " + steps.length;
    if (i === steps.length - 1) renderEstimate();
    var top = form.getBoundingClientRect().top + scrollY - 100; if (scrollY > top) scrollTo({ top: top, behavior: "smooth" });
  }
  next.addEventListener("click", function () { if (check(cur)) show(Math.min(cur + 1, steps.length - 1)); });
  back.addEventListener("click", function () { msg.textContent = ""; show(Math.max(cur - 1, 0)); });
  /* auto-advance on single-choice steps for speed */
  $$('.wz-step[data-auto] input[type="radio"]', form).forEach(function (r) {
    r.addEventListener("change", function () { var s = steps[cur]; if (s.contains(r) && check(cur)) setTimeout(function () { show(cur + 1); }, 220); });
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (form.querySelector('[name="_honey"]').value) return;
    if (!check(cur) || !HM.validate(form, msg)) return;
    renderEstimate();
    var d = {};
    new FormData(form).forEach(function (v, k) { if (k === "_honey" || v === "") return; d[k] = d[k] ? d[k] + ", " + v : v; });
    d.timeline = d.timeline || ""; d.budget = d.budget || "";
    try { sessionStorage.removeItem("hm-plan"); } catch (x) {}
    HM.submit("plan", d, msg, send);
  });
  show(0);
})();
