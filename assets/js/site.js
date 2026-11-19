/* Home.Media — shared site behaviour: nav, theme, forms, lead scoring, ads, video, news, search. */
(function () {
  "use strict";
  var doc = document, C = window.HM_CONFIG || {}, ROOT = window.HM_ROOT || "";
  var HM = window.HM = window.HM || {};
  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function sess(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }
  HM.$ = $; HM.$$ = $$; HM.store = store; HM.sess = sess;
  HM.params = new URLSearchParams(location.search);
  HM.abs = function (p) { return new URL(ROOT + p, location.href).href; };
  HM.esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  HM.money = function (n, dec) { return "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 }); };

  /* ---------- theme ---------- */
  $$("[data-theme-toggle]").forEach(function (b) {
    b.addEventListener("click", function () {
      var cur = doc.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      doc.documentElement.setAttribute("data-theme", cur); store("hm-theme", cur);
    });
  });

  /* ---------- nav ---------- */
  var burger = $("#burger"), nav = $("#nav"), head = $(".site-head");
  function setNavTop() { if (head) doc.documentElement.style.setProperty("--navtop", Math.round(head.getBoundingClientRect().bottom) + "px"); }
  if (burger && nav) {
    burger.addEventListener("click", function () {
      setNavTop();
      var open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      doc.body.style.overflow = open ? "hidden" : "";
    });
  }
  $$(".mega-toggle").forEach(function (t) {
    t.addEventListener("click", function (e) {
      e.stopPropagation();
      var li = t.parentElement, open = !li.classList.contains("open");
      $$(".has-mega.open").forEach(function (x) { if (x !== li) { x.classList.remove("open"); $(".mega-toggle", x).setAttribute("aria-expanded", "false"); } });
      li.classList.toggle("open", open); t.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });
  doc.addEventListener("click", function (e) {
    if (!e.target.closest(".has-mega")) $$(".has-mega.open").forEach(function (x) { x.classList.remove("open"); $(".mega-toggle", x).setAttribute("aria-expanded", "false"); });
  });
  doc.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      $$(".has-mega.open").forEach(function (x) { x.classList.remove("open"); $(".mega-toggle", x).setAttribute("aria-expanded", "false"); });
      if (nav && nav.classList.contains("open")) burger.click();
    }
  });

  /* ---------- attribution (UTM, referrer, landing page) ---------- */
  (function () {
    if (!sess("hm-attr")) {
      var a = { landing: location.pathname, referrer: doc.referrer || "direct" };
      ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid"].forEach(function (k) { if (HM.params.get(k)) a[k] = HM.params.get(k); });
      sess("hm-attr", JSON.stringify(a));
    }
    var pv = parseInt(sess("hm-pv") || "0", 10) + 1; sess("hm-pv", String(pv));
  })();

  /* ---------- lead scoring ---------- */
  HM.score = function (d) {
    var s = 0, b = String(d.budget || ""), t = String(d.timeline || ""), o = String(d.ownership || ""), i = String(d.install || "");
    if (/50k|15k/.test(b)) s += 40; else if (/5k/.test(b)) s += 30; else if (/2k/.test(b)) s += 20; else if (/500/.test(b)) s += 10;
    if (/ASAP/i.test(t)) s += 30; else if (/1.3/.test(t)) s += 22; else if (/3.6/.test(t)) s += 12;
    if (/Own/i.test(o)) s += 15;
    if (/Pro/i.test(i)) s += 15; else if (/Design/i.test(i)) s += 8;
    if (d.phone) s += 5;
    s = Math.min(100, s);
    return { score: s, tier: s >= 70 ? "HOT" : s >= 40 ? "WARM" : "COOL" };
  };

  /* ---------- forms ---------- */
  function inbox() {
    var k = C.inboxKey || 41;
    return String.fromCharCode.apply(null, (C.inbox || []).slice().reverse().map(function (c) { return c ^ k; }));
  }
  function collect(form) {
    var o = {};
    new FormData(form).forEach(function (v, k) {
      if (k === "_honey" || v === "" || (v && typeof v === "object")) return;
      o[k] = o[k] ? o[k] + ", " + v : v;
    });
    return o;
  }
  var LABELS = { newsletter: "Newsletter signup", contact: "Contact message", pro: "Installer network application", contest: "Contest entry",
    career: "Job application", advertise: "Advertising / sponsorship enquiry", support: "Support pledge", quote: "Quote request", plan: "Home Media Plan request", correction: "Correction report" };
  HM.submit = function (type, data, msgEl, btn) {
    var attr = {}; try { attr = JSON.parse(sess("hm-attr") || "{}"); } catch (e) {}
    var payload = {};
    Object.keys(data).forEach(function (k) { payload[k] = data[k]; });
    Object.keys(attr).forEach(function (k) { payload["src_" + k] = attr[k]; });
    payload.page = location.pathname + location.search;
    payload.submitted_at = new Date().toISOString();
    payload.pages_viewed = sess("hm-pv") || "1";
    var subj = "[Home.Media] " + (LABELS[type] || "Form");
    if (type === "plan" || type === "quote") {
      var sc = HM.score(data); payload.lead_score = sc.score; payload.lead_tier = sc.tier;
      subj = "[Home.Media] [" + sc.tier + "] " + (LABELS[type]) + (data.zip ? " · " + data.zip : "") + (data.budget ? " · " + data.budget : "");
    }
    payload._subject = subj; payload._template = "table"; payload._captcha = "false";
    if (btn) { btn.disabled = true; btn.dataset.label = btn.dataset.label || btn.textContent; btn.textContent = "Sending…"; }
    if (msgEl) { msgEl.className = "form-msg"; msgEl.textContent = ""; }
    var next = HM.abs("thank-you.html?f=" + encodeURIComponent(type));
    function done() { location.href = next; }
    function fallback() {
      var f = doc.createElement("form");
      f.method = "POST"; f.action = "https://formsubmit.co/" + inbox(); f.style.display = "none";
      payload._next = next;
      Object.keys(payload).forEach(function (k) { var i = doc.createElement("input"); i.type = "hidden"; i.name = k; i.value = payload[k]; f.appendChild(i); });
      doc.body.appendChild(f); f.submit();
    }
    fetch((C.formEndpoint || "https://formsubmit.co/ajax/") + inbox(), {
      method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(payload)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { if (r.ok && String(j.success) !== "false") done(); else fallback(); });
    }).catch(fallback);
  };
  HM.validate = function (form, msgEl) {
    var bad = null;
    $$("input,select,textarea", form).forEach(function (el) {
      el.removeAttribute("aria-invalid");
      if (el.name === "_honey" || el.disabled || el.closest("[hidden]")) return;
      if (!el.checkValidity()) { el.setAttribute("aria-invalid", "true"); if (!bad) bad = el; }
    });
    if (bad) {
      var lab = bad.id && $('label[for="' + bad.id + '"]', form);
      var name = lab ? lab.textContent.replace(/\s*\(.*|\*|optional/gi, "").trim() : (bad.placeholder || "this field");
      var why = bad.validity.valueMissing ? (bad.type === "checkbox" ? "Please tick: " : "Please fill in: ") + name
        : bad.validity.typeMismatch ? "Please enter a valid " + (bad.type === "email" ? "email address" : bad.type === "url" ? "link (https://…)" : name)
        : "Please check: " + name;
      if (msgEl) { msgEl.className = "form-msg err"; msgEl.textContent = why; }
      bad.focus(); return false;
    }
    return true;
  };
  $$("form[data-form]").forEach(function (form) {
    form.setAttribute("novalidate", "");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = $(".form-msg", form), btn = $('[type="submit"]', form);
      var hp = form.querySelector('[name="_honey"]');
      if (hp && hp.value) return;
      if (!HM.validate(form, msg)) return;
      HM.submit(form.getAttribute("data-form"), collect(form), msg, btn);
    });
  });
  /* prefill fields from URL, e.g. contact.html?topic=correction */
  $$("[data-prefill]").forEach(function (el) { var v = HM.params.get(el.getAttribute("data-prefill")); if (v) el.value = v; });

  /* ---------- AdSense manual units (only when slot IDs are configured) ---------- */
  var slots = C.adSlots || {};
  $$(".ad-slot[data-slot]").forEach(function (box) {
    var id = slots[box.getAttribute("data-slot")];
    if (!id) return;
    box.innerHTML = '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-6620975821265271" data-ad-slot="' + id + '" data-ad-format="auto" data-full-width-responsive="true"></ins>';
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
  });

  /* ---------- cookie notice ---------- */
  var ck = $("#cookie");
  if (ck && C.cookieNotice !== false && !store("hm-cookie")) {
    ck.hidden = false;
    $("[data-cookie-ok]", ck).addEventListener("click", function () { store("hm-cookie", "1"); ck.hidden = true; });
  }

  /* ---------- sticky CTA ---------- */
  var sc = $("#stickyCta"), noSticky = /plan\.html|thank-you|404/.test(location.pathname) || doc.body.classList.contains("no-sticky");
  if (sc && C.stickyCta !== false && !noSticky && !sess("hm-sticky-x")) {
    var shown = false;
    window.addEventListener("scroll", function () {
      if (shown) return;
      var max = doc.documentElement.scrollHeight - innerHeight;
      if (max > 400 && scrollY / max > 0.35) { shown = true; sc.hidden = false; }
    }, { passive: true });
    $("[data-dismiss-sticky]", sc).addEventListener("click", function () { sc.hidden = true; sess("hm-sticky-x", "1"); });
  }

  /* ---------- YouTube facades ---------- */
  doc.addEventListener("click", function (e) {
    var b = e.target.closest(".yt[data-yt]");
    if (!b || b.querySelector("iframe")) return;
    var id = b.getAttribute("data-yt");
    b.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
  });
  HM.videoHTML = function (v) {
    return '<figure class="video"><button class="yt" type="button" data-yt="' + HM.esc(v.id) + '" aria-label="Play: ' + HM.esc(v.title) + '">' +
      '<img src="https://i.ytimg.com/vi/' + HM.esc(v.id) + '/hqdefault.jpg" alt="" loading="lazy" width="480" height="360"><span class="yt-play" aria-hidden="true"></span></button>' +
      '<figcaption><strong>' + HM.esc(v.title) + '</strong><span>' + HM.esc(v.channel || "YouTube") + (v.published ? " · " + new Date(v.published).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "") + '</span></figcaption></figure>';
  };

  /* ---------- live news refresh (baked HTML first, newer JSON replaces it) ---------- */
  var nl = $$("[data-news-list]");
  if (nl.length) {
    fetch(ROOT + "assets/data/news.json?ts=" + Date.now()).then(function (r) { return r.json(); }).then(function (d) {
      var baked = $(".fresh time"), bt = baked ? Date.parse(baked.getAttribute("datetime")) : 0;
      if (!d.items || !d.items.length || Date.parse(d.updated) <= bt) return;
      nl.forEach(function (ul) {
        var n = parseInt(ul.getAttribute("data-count") || "8", 10), topic = ul.getAttribute("data-topic");
        var items = d.items.filter(function (i) { return !topic || i.topic === topic; }).slice(0, n);
        ul.innerHTML = items.map(function (i) {
          var dd = i.date ? new Date(i.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
          return '<li><a href="' + HM.esc(i.url) + '" target="_blank" rel="noopener nofollow">' + HM.esc(i.title) + '</a><span class="meta">' + HM.esc(i.source || "") + (dd ? " · " + dd : "") + (i.topicLabel ? " · " + HM.esc(i.topicLabel) : "") + "</span></li>";
        }).join("");
      });
      $$(".fresh time").forEach(function (t) { t.textContent = new Date(d.updated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); t.setAttribute("datetime", d.updated); });
    }).catch(function () {});
  }

  /* ---------- tip of the day ---------- */
  var TIPS = [
    "Mount the TV so the centre of the screen sits near seated eye level, usually 40–42 in (102–107 cm) from the floor.",
    "Turn off motion smoothing (\"soap opera effect\") for films; keep it for sports if you like it.",
    "Put the subwoofer in your seat, play bass-heavy music, crawl the floor: where bass sounds best is where the sub goes.",
    "Use Filmmaker Mode or Movie/Cinema picture mode as a starting point. It is usually the most accurate preset.",
    "Rotate streaming services: subscribe to two at a time, binge, cancel, switch. It can halve your yearly bill.",
    "A 4K stream needs about 15 Mbps on Netflix. Plan 1.5× headroom for everything else in the house.",
    "Hide speaker wire under rugs with flat wire, or in raceways painted to match the wall.",
    "Run a room-correction setup (Audyssey, Dirac, YPAO, ARC) every time you move speakers or furniture.",
    "Sit away from the exact middle of the room: bass often cancels there. Around 38% of the room length from a wall is a classic start.",
    "Buy one more HDMI input than you think you need. Consoles, streamers and a disc player add up fast.",
    "Use wired Ethernet for the main TV or streamer when you can. It removes most buffering problems.",
    "Back up the media server: RAID is not a backup. Keep a second copy of irreplaceable photos and video."
  ];
  $$("[data-tip]").forEach(function (el) {
    var d = new Date(), i = (d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate()) % TIPS.length;
    el.textContent = TIPS[i];
  });

  /* ---------- contest + countdowns ---------- */
  var ct = C.contest || {};
  $$("[data-contest]").forEach(function (el) { var k = el.getAttribute("data-contest"); if (ct[k]) el.textContent = ct[k]; });
  $$("[data-countdown]").forEach(function (el) {
    var end = Date.parse(el.getAttribute("data-countdown") || ct.closes);
    function tick() {
      var ms = Math.max(0, end - Date.now()), d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60;
      el.innerHTML = ms <= 0 ? "<div><b>Closed</b><span>judging</span></div>" :
        "<div><b>" + d + "</b><span>days</span></div><div><b>" + h + "</b><span>hours</span></div><div><b>" + m + "</b><span>min</span></div>";
    }
    if (!isNaN(end)) { tick(); setInterval(tick, 30000); }
  });
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- support page payment links ---------- */
  var don = C.donate || {};
  $$("[data-pay]").forEach(function (a) {
    var url = don[a.getAttribute("data-pay")];
    if (url) { a.href = url; a.hidden = false; a.target = "_blank"; a.rel = "noopener"; } else a.hidden = true;
  });
  var anyPay = Object.keys(don).some(function (k) { return don[k]; });
  $$("[data-pay-none]").forEach(function (el) { el.hidden = anyPay; });

  /* ---------- copy link ---------- */
  $$("[data-copy-link]").forEach(function (b) {
    b.addEventListener("click", function () {
      var url = b.getAttribute("data-copy-link") || location.href;
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(function () {
        var t = b.textContent; b.textContent = "Link copied ✓"; setTimeout(function () { b.textContent = t; }, 1800);
      }).catch(function () { prompt("Copy this link:", url); });
    });
  });

  /* ---------- table of contents scrollspy ---------- */
  var tocLinks = $$(".toc-box a");
  if (tocLinks.length && "IntersectionObserver" in window) {
    var map = {};
    tocLinks.forEach(function (a) { map[decodeURIComponent(a.getAttribute("href").split("#")[1] || "")] = a; });
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting && map[en.target.id]) { tocLinks.forEach(function (a) { a.classList.remove("active"); }); map[en.target.id].classList.add("active"); } });
    }, { rootMargin: "-80px 0px -70% 0px" });
    Object.keys(map).forEach(function (id) { var h = doc.getElementById(id); if (h) io.observe(h); });
  }

  /* ---------- site search ---------- */
  var sIn = $("[data-search-input]"), sOut = $("[data-search-results]");
  if (sIn && sOut) {
    var idx = [];
    function run() {
      var q = sIn.value.trim().toLowerCase();
      if (q.length < 2) { sOut.innerHTML = '<li class="muted">Type at least 2 letters. Try "projector", "Atmos", "Plex" or "cost".</li>'; return; }
      var terms = q.split(/\s+/);
      var res = idx.map(function (it) {
        var hay = (it.t + " " + it.d + " " + it.k).toLowerCase(), s = 0;
        terms.forEach(function (t) { if (hay.indexOf(t) > -1) s += 1; if (it.t.toLowerCase().indexOf(t) > -1) s += 2; });
        return { it: it, s: s };
      }).filter(function (r) { return r.s > 0; }).sort(function (a, b) { return b.s - a.s; }).slice(0, 25);
      sOut.innerHTML = res.length ? res.map(function (r) {
        return '<li><a href="' + ROOT + HM.esc(r.it.u) + '"><small>' + HM.esc(r.it.y) + '</small><strong>' + HM.esc(r.it.t) + '</strong><span>' + HM.esc(r.it.d) + "</span></a></li>";
      }).join("") : '<li class="muted">No matches. Try a broader word, or <a href="' + ROOT + 'plan.html?src=search">ask for a free plan</a>.</li>';
    }
    fetch(ROOT + "assets/data/search.json").then(function (r) { return r.json(); }).then(function (d) {
      idx = d; if (HM.params.get("q")) sIn.value = HM.params.get("q"); run();
    });
    sIn.addEventListener("input", run);
  }

  /* ---------- thank-you page personalisation ---------- */
  var ty = $("[data-thanks]");
  if (ty) {
    var f = HM.params.get("f") || "";
    var MSG = {
      plan: "Your Home Media Plan request is in. A specialist reviews it and replies within 1 business day, usually sooner.",
      quote: "Your quote request is in. Expect a reply within 1 business day.",
      newsletter: "You're subscribed. The first tips email arrives this week.",
      pro: "Thanks for applying to the installer network. We review applications weekly and reply with next steps.",
      contest: "Your Setup of the Month entry is in. Good luck!",
      career: "Application received. If there's a fit we'll be in touch within 2 weeks.",
      advertise: "Thanks. We'll reply with our rate card and available placements within 1 business day.",
      support: "Thank you for supporting Home.Media. We'll send your secure payment link shortly.",
      contact: "Message received. We reply within 1–2 business days."
    };
    if (MSG[f]) ty.textContent = MSG[f];
  }
})();
