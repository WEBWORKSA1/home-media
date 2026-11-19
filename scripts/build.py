#!/usr/bin/env python3
"""Home.Media static site generator.

Wraps page bodies (content/pages/*.html) and guides (content/guides/*.md) in one
shared layout and writes plain HTML that GitHub Pages serves as-is.

Run:  python3 scripts/build.py
"""
import datetime as dt
import html
import json
import pathlib
import re

import markdown

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
DATA = ROOT / "assets" / "data"

SITE = {
    "name": "Home.Media",
    "url": "https://home.media",
    "tagline": "Plan, build & stream the perfect home setup",
    "description": "Free home theater and streaming planning tools, expert guides and a free Home Media Plan: screen size, speaker layout, streaming costs, media servers and vetted installers.",
    "pub": "ca-pub-6620975821265271",
    "owner_url": "https://web.works/contact",
}
ADSENSE = ('<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
           '?client=ca-pub-6620975821265271" crossorigin="anonymous"></script>')
NOW = dt.datetime.now(dt.timezone.utc)
TODAY = NOW.strftime("%Y-%m-%d")
VER = NOW.strftime("%Y%m%d%H%M")

# ---------------------------------------------------------------- registries
ICONS = {
    "screen": '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    "projector": '<rect x="2" y="8" width="20" height="9" rx="2"/><circle cx="16" cy="12.5" r="2.5"/><path d="M6 12h4"/>',
    "speakers": '<rect x="6" y="3" width="12" height="18" rx="2"/><circle cx="12" cy="14" r="3"/><circle cx="12" cy="7" r="1"/>',
    "stream": '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M10 9l4 2-4 2z"/><path d="M7 21h10"/>',
    "wifi": '<path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19" r="1"/>',
    "server": '<rect x="4" y="3" width="16" height="7" rx="1.5"/><rect x="4" y="14" width="16" height="7" rx="1.5"/><path d="M8 6.5h.01M8 17.5h.01"/>',
    "cost": '<circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .9-3 2.1 0 2.8 6 1.4 6 4.3 0 1.2-1.3 2.1-3 2.1-1.5 0-2.7-.6-3.1-1.6M12 6v2M12 16v2"/>',
    "wave": '<path d="M2 12c2-6 4-6 6 0s4 6 6 0 4-6 6 0"/>',
    "hdmi": '<path d="M3 8h18v5l-3 3H6l-3-3z"/><path d="M7 11h10"/>',
    "quiz": '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14M12 17h.01"/>',
    "plan": '<path d="M9 4H5a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-4"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M8 12l2.5 2.5L16 9"/>',
    "pro": '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    "play": '<circle cx="12" cy="12" r="9"/><path d="M10 8.5l5.5 3.5-5.5 3.5z"/>',
    "news": '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/>',
    "heart": '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    "trophy": '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M10 17h4M12 13v4M8 21h8"/>',
    "book": '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
}

TOOLS = [
    ("screen-size.html", "Screen Size & Viewing Distance", "How big a TV or screen for your seat", "screen"),
    ("projector.html", "Projector Throw & Brightness", "Throw distance, image size, foot-lamberts", "projector"),
    ("speaker-layout.html", "Speaker Layout Planner", "2.1 to 9.2.6 Dolby Atmos placement", "speakers"),
    ("streaming-cost.html", "Streaming Cost & Cord-Cutting Savings", "What you pay vs cable, per year", "stream"),
    ("bandwidth.html", "Streaming Bandwidth Planner", "The internet speed your household needs", "wifi"),
    ("storage.html", "Media Server Storage Calculator", "Terabytes for Plex, Jellyfin & Emby", "server"),
    ("cost-estimator.html", "Home Theater Cost Estimator", "Low / mid / high budget breakdown", "cost"),
    ("room-modes.html", "Room Mode (Bass) Calculator", "Find boomy notes before you build", "wave"),
    ("hdmi.html", "HDMI Bandwidth Checker", "Which HDMI port and cable you need", "hdmi"),
    ("matchmaker.html", "Setup Matchmaker Quiz", "The right system in 6 questions", "quiz"),
]

GUIDE_CATS = [
    ("start", "Start here"),
    ("screen", "Screens & projectors"),
    ("sound", "Sound & speakers"),
    ("stream", "Streaming & cord-cutting"),
    ("server", "Media servers"),
    ("build", "Planning & building"),
]


def icon(key, size=22):
    return (f'<svg class="ico" viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="currentColor" '
            f'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICONS[key]}</svg>')


def esc(s):
    return html.escape(str(s), quote=True)


def read_front(path):
    """Return (meta dict, body) from a file with a --- JSON --- header."""
    text = path.read_text(encoding="utf-8")
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n", text, re.S)
    if not m:
        raise SystemExit(f"Missing front matter in {path}")
    return json.loads(m.group(1)), text[m.end():]


def load_json(name, default):
    p = DATA / name
    if p.exists():
        try:
            return json.loads(p.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return default
    return default


# ---------------------------------------------------------------- guides
def load_guides():
    guides = []
    for p in sorted((CONTENT / "guides").glob("*.md")):
        meta, body = read_front(p)
        meta["slug"] = p.stem
        meta["path"] = f"guides/{p.stem}.html"
        words = len(re.findall(r"\w+", body))
        meta["minutes"] = max(3, round(words / 220))
        meta["body"] = body
        guides.append(meta)
    order = {k: i for i, (k, _) in enumerate(GUIDE_CATS)}
    guides.sort(key=lambda g: (order.get(g["cat"], 99), g.get("order", 50)))
    return guides


GUIDES = []


# ---------------------------------------------------------------- snippets
def tool_cards(limit=None, exclude=None):
    out = []
    for href, name, blurb, ic in TOOLS:
        if exclude and href == exclude:
            continue
        out.append(f'<a class="card tool-card" href="{href}"><span class="tc-ico">{icon(ic, 26)}</span>'
                   f'<strong>{esc(name)}</strong><span>{esc(blurb)}</span><em>Open tool →</em></a>')
        if limit and len(out) >= limit:
            break
    return '<div class="grid tools-grid">' + "".join(out) + "</div>"


def guide_card(g):
    cat = dict(GUIDE_CATS).get(g["cat"], "Guide")
    return (f'<a class="card guide-card" href="{g["path"]}"><span class="kicker">{esc(cat)}</span>'
            f'<strong>{esc(g["title"])}</strong><span>{esc(g["description"])}</span>'
            f'<em>{g["minutes"]} min read</em></a>')


def guide_cards(cat=None, limit=None, exclude=None):
    items = [g for g in GUIDES if (cat is None or g["cat"] == cat) and g["slug"] != exclude]
    if limit:
        items = items[:limit]
    return '<div class="grid guides-grid">' + "".join(guide_card(g) for g in items) + "</div>"


def guides_by_cat():
    parts = []
    for key, label in GUIDE_CATS:
        items = [g for g in GUIDES if g["cat"] == key]
        if not items:
            continue
        parts.append(f'<section class="guide-cat" id="cat-{key}"><h2>{esc(label)}</h2>'
                     + '<div class="grid guides-grid">' + "".join(guide_card(g) for g in items) + "</div></section>")
    return "".join(parts)


def cta_block(src="page", heading=None, text=None):
    heading = heading or "Get your free Home Media Plan"
    text = text or ("Answer a few quick questions about your room and budget. Get a recommended setup, an "
                    "instant cost estimate and, if you want, introductions to up to 3 vetted local installers.")
    return (f'<aside class="cta-band" aria-label="Free plan"><div><span class="kicker">Free · 60 seconds · No obligation</span>'
            f'<h2>{esc(heading)}</h2><p>{esc(text)}</p></div>'
            f'<div class="cta-actions"><a class="btn btn-primary btn-lg" href="plan.html?src={esc(src)}">Start my free plan</a>'
            f'<a class="btn btn-ghost" href="services.html">See typical costs</a></div></aside>')


def faq_html(faq):
    if not faq:
        return ""
    items = "".join(f'<details class="faq-item"><summary>{esc(q)}</summary><div class="faq-a"><p>{a}</p></div></details>'
                    for q, a in faq)
    return f'<section class="faq" id="faq"><h2>Frequently asked questions</h2>{items}</section>'


def fmt_date(iso):
    try:
        d = dt.datetime.fromisoformat(iso.replace("Z", "+00:00"))
        return d.strftime("%b %-d, %Y")
    except Exception:
        return ""


def news_list(n=8, topic=None):
    data = load_json("news.json", {"items": []})
    items = [i for i in data.get("items", []) if not topic or i.get("topic") == topic][:n]
    if not items:
        return '<p class="muted">Headlines refresh daily.</p>'
    lis = []
    for i in items:
        lis.append(f'<li><a href="{esc(i["url"])}" target="_blank" rel="noopener nofollow">{esc(i["title"])}</a>'
                   f'<span class="meta">{esc(i.get("source", ""))}{" · " + fmt_date(i["date"]) if i.get("date") else ""}'
                   f'{" · " + esc(i["topicLabel"]) if i.get("topicLabel") else ""}</span></li>')
    return ('<ul class="news-list" data-news-list data-count="' + str(n) + '">' + "".join(lis) + "</ul>"
            + f'<p class="fresh">Updated <time datetime="{esc(data.get("updated", TODAY))}">{fmt_date(data.get("updated", TODAY)) or TODAY}</time> · refreshed automatically every day</p>')


def video_facade(v):
    vid = esc(v["id"])
    return (f'<figure class="video"><button class="yt" type="button" data-yt="{vid}" aria-label="Play: {esc(v["title"])}">'
            f'<img src="https://i.ytimg.com/vi/{vid}/hqdefault.jpg" alt="" loading="lazy" width="480" height="360">'
            f'<span class="yt-play" aria-hidden="true"></span></button>'
            f'<figcaption><strong>{esc(v["title"])}</strong><span>{esc(v.get("channel", "YouTube"))}</span></figcaption></figure>')


def video_grid(n=4, topic=None, which="featured"):
    data = load_json("videos.json", {"featured": [], "latest": []})
    items = data.get(which, [])
    if topic:
        items = [v for v in items if v.get("topic") == topic]
    items = items[:n]
    if not items:
        return '<p class="muted">Fresh uploads appear here after the daily refresh.</p>' if which == "latest" else ""
    return '<div class="grid video-grid">' + "".join(video_facade(v) for v in items) + "</div>"


def ad(slot="in-content"):
    return f'<div class="ad-slot" data-slot="{slot}" aria-hidden="true"></div>'


def expand(body, meta):
    """Replace {{TOKENS}} in page bodies."""
    def rep(m):
        tok, arg = m.group(1), (m.group(2) or "")
        if tok == "TOOLS":
            return tool_cards(limit=int(arg) if arg.isdigit() else None, exclude=meta.get("out"))
        if tok == "GUIDES":
            if arg in dict(GUIDE_CATS):
                return guide_cards(cat=arg)
            return guide_cards(limit=int(arg) if arg.isdigit() else None)
        if tok == "GUIDES_BY_CAT":
            return guides_by_cat()
        if tok == "CTA":
            return cta_block(src=arg or meta.get("out", "page").replace(".html", ""))
        if tok == "FAQ":
            return faq_html(meta.get("faq"))
        if tok == "NEWS":
            parts = arg.split(",")
            return news_list(n=int(parts[0]) if parts[0].isdigit() else 8, topic=parts[1] if len(parts) > 1 else None)
        if tok == "VIDEOS":
            parts = arg.split(",")
            return video_grid(n=int(parts[0]) if parts[0].isdigit() else 4,
                              topic=parts[1] if len(parts) > 1 and parts[1] else None,
                              which=parts[2] if len(parts) > 2 else "featured")
        if tok == "AD":
            return ad(arg or "in-content")
        if tok == "YEAR":
            return str(NOW.year)
        if tok == "TODAY":
            return NOW.strftime("%B %-d, %Y")
        if tok == "GUIDECOUNT":
            return str(len(GUIDES))
        if tok == "ICON":
            return icon(arg)
        return m.group(0)
    return re.sub(r"\{\{([A-Z_]+)(?::([^}]*))?\}\}", rep, body)


# ---------------------------------------------------------------- layout
NAV_HTML = None


def nav_html():
    tools = "".join(f'<li><a href="{h}">{icon(i, 18)}<span><strong>{esc(n)}</strong><small>{esc(b)}</small></span></a></li>'
                    for h, n, b, i in TOOLS)
    gcats = "".join(f'<li><a href="guides/index.html#cat-{k}"><span><strong>{esc(l)}</strong>'
                    f'<small>{len([g for g in GUIDES if g["cat"] == k])} guides</small></span></a></li>' for k, l in GUIDE_CATS)
    plan = "".join(f'<li><a href="{h}">{icon(i, 18)}<span><strong>{esc(n)}</strong><small>{esc(b)}</small></span></a></li>' for h, n, b, i in [
        ("plan.html", "Free Home Media Plan", "Your setup + estimate in 60 seconds", "plan"),
        ("services.html", "Services & Typical Costs", "Mounting, surround, projectors, theaters", "cost"),
        ("cost-estimator.html", "Cost Estimator", "Budget breakdown by tier", "cost"),
        ("guides/hire-home-theater-installer.html", "How to Hire an Installer", "Checklist + questions to ask", "pro"),
        ("pros.html", "For Installers", "Join the Home.Media pro network", "pro"),
    ])
    return f'''<nav id="nav" class="main-nav" aria-label="Main">
  <ul class="nav-list">
    <li class="has-mega"><button type="button" class="mega-toggle" aria-expanded="false">Tools<span aria-hidden="true">▾</span></button>
      <div class="mega"><ul class="mega-grid">{tools}</ul><a class="mega-foot" href="tools.html">All 10 tools →</a></div></li>
    <li class="has-mega"><button type="button" class="mega-toggle" aria-expanded="false">Guides<span aria-hidden="true">▾</span></button>
      <div class="mega mega-sm"><ul class="mega-grid one">{gcats}</ul><a class="mega-foot" href="guides/index.html">All guides →</a></div></li>
    <li class="has-mega"><button type="button" class="mega-toggle" aria-expanded="false">Plan &amp; Hire<span aria-hidden="true">▾</span></button>
      <div class="mega mega-sm"><ul class="mega-grid one">{plan}</ul></div></li>
    <li><a href="videos.html">Videos</a></li>
    <li><a href="news.html">News</a></li>
    <li><a href="contests.html">Contest</a></li>
  </ul>
</nav>'''


def footer_html():
    gl = "".join(f'<li><a href="{g["path"]}">{esc(g.get("short", g["title"]))}</a></li>' for g in GUIDES[:8])
    tl = "".join(f'<li><a href="{h}">{esc(n)}</a></li>' for h, n, _, _ in TOOLS)
    return f'''<footer class="site-foot">
  <div class="wrap foot-grid">
    <div class="foot-brand">
      <a class="logo" href="index.html" aria-label="Home.Media home"><img src="assets/img/logo.svg" alt="" width="36" height="36"><span>Home<b>.</b>Media</span></a>
      <p>Independent planning tools and guides for home theaters, streaming and media servers. Free to use, supported by ads, partners and readers.</p>
      <form class="mini-news" data-form="newsletter" novalidate>
        <label for="fn-email">Weekly setup tips &amp; streaming price alerts</label>
        <div class="row"><input id="fn-email" type="email" name="email" placeholder="you@example.com" required autocomplete="email"><button class="btn btn-primary" type="submit">Subscribe</button></div>
        <input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
        <p class="form-msg" role="status"></p>
      </form>
    </div>
    <div><h3>Tools</h3><ul>{tl}</ul></div>
    <div><h3>Guides</h3><ul>{gl}<li><a href="guides/index.html"><strong>All guides →</strong></a></li></ul></div>
    <div><h3>Plan &amp; hire</h3><ul>
      <li><a href="plan.html">Free Home Media Plan</a></li><li><a href="services.html">Services &amp; costs</a></li>
      <li><a href="pros.html">For installers</a></li><li><a href="advertise.html">Advertise &amp; sponsor</a></li>
      <li><a href="support.html">Support Home.Media</a></li><li><a href="contests.html">Setup of the Month</a></li>
      <li><a href="careers.html">Careers</a></li><li><a href="videos.html">Videos</a></li><li><a href="news.html">News</a></li></ul></div>
    <div><h3>Company</h3><ul>
      <li><a href="about.html">About</a></li><li><a href="contact.html">Contact</a></li><li><a href="editorial-policy.html">Editorial policy</a></li>
      <li><a href="privacy.html">Privacy</a></li><li><a href="terms.html">Terms</a></li><li><a href="disclaimer.html">Disclaimer</a></li>
      <li><a href="legal.html">Trademark &amp; copyright</a></li><li><a href="search.html">Search</a></li><li><a href="sitemap.xml">Sitemap</a></li></ul></div>
  </div>
  <div class="wrap foot-base">
    <p>© <span data-year>{NOW.year}</span> Home.Media. Original content and tools. Third-party names and trademarks belong to their owners and are used for identification only; Home.Media is not affiliated with any brand, publication or product named "Home Media". <a href="legal.html">Full disclosure</a>.</p>
    <p><a class="owner-link" href="{SITE["owner_url"]}" target="_blank" rel="noopener">Interested in this website or domain? Sponsorship, advertising &amp; partnership enquiries</a></p>
  </div>
</footer>'''


def jsonld(meta, path, title, desc):
    url = SITE["url"] + "/" + ("" if path == "index.html" else path)
    graph = [
        {"@type": "Organization", "@id": SITE["url"] + "/#org", "name": "Home.Media", "url": SITE["url"] + "/",
         "logo": SITE["url"] + "/assets/img/logo.svg"},
        {"@type": "WebSite", "@id": SITE["url"] + "/#site", "name": "Home.Media", "url": SITE["url"] + "/",
         "publisher": {"@id": SITE["url"] + "/#org"},
         "potentialAction": {"@type": "SearchAction", "target": SITE["url"] + "/search.html?q={query}",
                             "query-input": "required name=query"}},
    ]
    if meta.get("section"):
        graph.append({"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE["url"] + "/"},
            {"@type": "ListItem", "position": 2, "name": meta["section"], "item": SITE["url"] + "/" + meta.get("section_url", "")},
            {"@type": "ListItem", "position": 3, "name": title, "item": url}]})
    if meta.get("article"):
        graph.append({"@type": "Article", "headline": title, "description": desc, "url": url,
                      "dateModified": meta.get("updated", TODAY), "datePublished": meta.get("published", "2026-11-19"),
                      "author": {"@type": "Organization", "name": "Home.Media Editorial Team", "url": SITE["url"] + "/about.html"},
                      "publisher": {"@id": SITE["url"] + "/#org"}, "mainEntityOfPage": url})
    if meta.get("tool"):
        graph.append({"@type": "WebApplication", "name": title, "url": url, "applicationCategory": "UtilitiesApplication",
                      "operatingSystem": "Any (web browser)", "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"}})
    if meta.get("faq"):
        graph.append({"@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": re.sub(r"<[^>]+>", "", a)}}
            for q, a in meta["faq"]]})
    return '<script type="application/ld+json">' + json.dumps({"@context": "https://schema.org", "@graph": graph},
                                                             ensure_ascii=False) + "</script>"


def layout(meta, body, path):
    depth = path.count("/")
    rel = "../" * depth
    title = meta["title"]
    full_title = f"{SITE['name']} | {SITE['tagline']}" if path == "index.html" else f"{title} | {SITE['name']}"
    desc = meta.get("description", SITE["description"])
    url = SITE["url"] + "/" + ("" if path == "index.html" else path)
    show_ads = not meta.get("noads")
    crumbs = ""
    if meta.get("section"):
        crumbs = (f'<nav class="crumbs wrap" aria-label="Breadcrumb"><a href="index.html">Home</a><span aria-hidden="true">›</span>'
                  f'<a href="{meta.get("section_url", "")}">{esc(meta["section"])}</a><span aria-hidden="true">›</span>'
                  f'<span aria-current="page">{esc(meta.get("crumb", title))}</span></nav>')
    scripts = "".join(f'<script src="assets/js/{s}.js?v={VER}" defer></script>' for s in meta.get("scripts", []))
    robots = '<meta name="robots" content="noindex,follow">\n' if meta.get("noindex") else ""
    BASE = ('<script>document.write(\'<base href="\'+(location.hostname.slice(-10)===\'.github.io\'?\'/home-media/\':\'/\')+\'">\')</script>\n' if meta.get('base') == 'dynamic' else '')
    page = f'''<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
{BASE}<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(full_title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{url}">
{robots}<meta name="google-adsense-account" content="{SITE["pub"]}">
<meta name="theme-color" content="#0b0f1a">
<meta property="og:type" content="{"article" if meta.get("article") else "website"}">
<meta property="og:site_name" content="Home.Media">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE["url"]}/assets/img/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="assets/img/icon-192.png">
<link rel="manifest" href="site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=Figtree:wght@400;500;600;700;800&display=swap">
<link rel="stylesheet" href="assets/css/site.css?v={VER}">
<script>window.HM_ROOT="{rel}";(function(){{try{{var t=localStorage.getItem("hm-theme");if(t)document.documentElement.setAttribute("data-theme",t);}}catch(e){{}}}})();</script>
{ADSENSE if show_ads else ""}
{jsonld(meta, path, title, desc)}
</head>
<body class="{esc(meta.get("body_class", ""))}">
<a class="skip" href="#main">Skip to content</a>
<a class="owner-bar" href="{SITE["owner_url"]}" target="_blank" rel="noopener"><span class="ob-dot" aria-hidden="true"></span>Contact, if you are interested in this website / domain name / Sponsorship / Advertisement / Partnership<span class="ob-arrow" aria-hidden="true">→</span></a>
<header class="site-head">
  <div class="wrap head-row">
    <a class="logo" href="index.html" aria-label="Home.Media home"><img src="assets/img/logo.svg" alt="" width="38" height="38"><span>Home<b>.</b>Media</span></a>
    {NAV_HTML}
    <div class="head-actions">
      <a class="icon-btn" href="search.html" aria-label="Search the site"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg></a>
      <button class="icon-btn" type="button" data-theme-toggle aria-label="Switch light or dark theme"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg></button>
      <a class="btn btn-primary btn-sm head-cta" href="plan.html?src=header">Free Plan</a>
      <button id="burger" class="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="nav"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>
<main id="main" tabindex="-1">
{crumbs}
{body}
</main>
{FOOTER_HTML}
<div class="sticky-cta" id="stickyCta" hidden><p><strong>Planning a setup?</strong> Free plan + cost estimate in 60 seconds.</p><a class="btn btn-primary btn-sm" href="plan.html?src=sticky">Get my plan</a><button type="button" class="sc-close" aria-label="Dismiss" data-dismiss-sticky>×</button></div>
<div class="cookie" id="cookie" hidden><p>We use cookies for essential features, analytics and Google ads. <a href="privacy.html">Privacy policy</a>.</p><button class="btn btn-sm btn-primary" type="button" data-cookie-ok>OK</button></div>
<script src="assets/js/config.js?v={VER}" defer></script>
<script src="assets/js/site.js?v={VER}" defer></script>
{scripts}
</body>
</html>
'''
    if rel:
        page = re.sub(r'((?:href|src|action|poster)=")(?!https?:|//|/|#|mailto:|tel:|data:|javascript:)', r"\1" + rel, page)
    return page


# ---------------------------------------------------------------- build
def guide_page(g):
    md = markdown.Markdown(extensions=["tables", "toc", "attr_list", "md_in_html", "sane_lists"],
                           extension_configs={"toc": {"toc_depth": "2-2"}})
    body_html = md.convert(expand(g["body"], g))
    toc = md.toc
    related_tools = "".join(
        f'<li><a href="{h}">{icon(i, 18)}<span>{esc(n)}</span></a></li>' for h, n, _, i in TOOLS if h in g.get("tools", []))
    related_guides = [x for x in GUIDES if x["slug"] in g.get("related", [])] or \
                     [x for x in GUIDES if x["cat"] == g["cat"] and x["slug"] != g["slug"]][:3]
    cat_label = dict(GUIDE_CATS).get(g["cat"], "Guide")
    tldr = "".join(f"<li>{t}</li>" for t in g.get("tldr", []))
    body = f'''<article class="wrap article">
  <header class="article-head">
    <span class="kicker">{esc(cat_label)}</span>
    <h1>{esc(g["title"])}</h1>
    <p class="lede">{esc(g["description"])}</p>
    <p class="byline">By the Home.Media Editorial Team · Updated <time datetime="{g.get("updated", TODAY)}">{fmt_date(g.get("updated", TODAY))}</time> · {g["minutes"]} min read</p>
  </header>
  <div class="article-grid">
    <div class="prose">
      {f'<div class="tldr"><h2>Quick answer</h2><ul>{tldr}</ul></div>' if tldr else ""}
      {body_html}
      {faq_html(g.get("faq"))}
      <p class="sources-note">How we write: see our <a href="editorial-policy.html">editorial policy</a>. Spotted an error? <a href="contact.html?topic=correction">Tell us</a>.</p>
    </div>
    <aside class="article-side">
      <div class="side-box toc-box"><h2>On this page</h2>{toc}</div>
      {f'<div class="side-box"><h2>Related tools</h2><ul class="side-tools">{related_tools}</ul></div>' if related_tools else ""}
      <div class="side-box side-cta"><h2>Want this done for you?</h2><p>Free plan, instant estimate, optional intros to vetted installers.</p><a class="btn btn-primary" href="plan.html?src=guide-{g["slug"]}">Start my free plan</a></div>
      {ad("sidebar")}
    </aside>
  </div>
  {cta_block(src="guide-" + g["slug"])}
  <section class="related"><h2>Keep reading</h2><div class="grid guides-grid">{"".join(guide_card(x) for x in related_guides)}</div></section>
</article>'''
    meta = dict(g)
    meta.update({"article": True, "section": "Guides", "section_url": "guides/index.html",
                 "crumb": g.get("short", g["title"])})
    return layout(meta, body, g["path"])


def build():
    global GUIDES, NAV_HTML, FOOTER_HTML
    GUIDES = load_guides()
    NAV_HTML = nav_html()
    FOOTER_HTML = footer_html()
    pages = []
    for p in sorted((CONTENT / "pages").glob("*.html")):
        meta, body = read_front(p)
        out = meta.get("out", p.name)
        meta["out"] = out
        html_out = layout(meta, expand(body, meta), out)
        (ROOT / out).parent.mkdir(parents=True, exist_ok=True)
        (ROOT / out).write_text(html_out, encoding="utf-8")
        pages.append((out, meta))
    (ROOT / "guides").mkdir(exist_ok=True)
    for g in GUIDES:
        (ROOT / g["path"]).write_text(guide_page(g), encoding="utf-8")

    # sitemap
    urls = []
    for out, meta in pages:
        if meta.get("noindex"):
            continue
        loc = SITE["url"] + "/" + ("" if out == "index.html" else out)
        pr = "1.0" if out == "index.html" else ("0.9" if out in ("plan.html", "tools.html") or meta.get("tool") else "0.7")
        urls.append(f"<url><loc>{loc}</loc><lastmod>{TODAY}</lastmod><priority>{pr}</priority></url>")
    for g in GUIDES:
        urls.append(f"<url><loc>{SITE['url']}/{g['path']}</loc><lastmod>{g.get('updated', TODAY)}</lastmod><priority>0.8</priority></url>")
    (ROOT / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
                                      + "\n".join(urls) + "\n</urlset>\n", encoding="utf-8")

    # search index
    idx = []
    for out, meta in pages:
        if meta.get("noindex"):
            continue
        idx.append({"t": meta["title"], "u": out, "d": meta.get("description", ""), "k": meta.get("keywords", ""),
                    "y": "Tool" if meta.get("tool") else "Page"})
    for g in GUIDES:
        idx.append({"t": g["title"], "u": g["path"], "d": g["description"], "k": g.get("keywords", ""), "y": "Guide"})
    (DATA / "search.json").write_text(json.dumps(idx, ensure_ascii=False, indent=0), encoding="utf-8")
    print(f"Built {len(pages)} pages + {len(GUIDES)} guides at {VER}")


FOOTER_HTML = ""

if __name__ == "__main__":
    build()
