#!/usr/bin/env python3
"""Daily refresh for Home.Media.

1. News: public Google News RSS searches  -> assets/data/news.json
2. Videos: public YouTube channel/playlist feeds -> assets/data/videos.json ("latest")

Standard library only. Writes files only when the content actually changed and
prints CHANGED=1/0 (also to $GITHUB_OUTPUT) so the workflow can skip rebuilds.
"""
import datetime as dt
import email.utils
import html
import json
import os
import pathlib
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "assets" / "data"
UA = "Mozilla/5.0 (compatible; HomeMediaBot/1.0; +https://home.media)"
NOW = dt.datetime.now(dt.timezone.utc)

NEWS_QUERIES = [
    ("stream", "Streaming", '"streaming service" price OR prices OR subscribers'),
    ("stream", "Cord-cutting", '"cord cutting" OR "cord cutters" OR "YouTube TV" OR "Sling TV"'),
    ("tv", "TVs & projectors", 'OLED TV OR "Mini LED" TV OR "4K projector"'),
    ("audio", "Home audio", '"Dolby Atmos" soundbar OR receiver OR speakers'),
    ("server", "Media servers", 'Plex OR Jellyfin OR Emby OR Kodi "media server"'),
    ("theater", "Home theater", '"home theater" OR "home cinema"'),
]
BLOCK = re.compile(r"\b(porn|casino|crypto|bitcoin|lottery|obituar)", re.I)


def get(url, timeout=25):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en-US,en;q=0.9"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def iso(d):
    return d.astimezone(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def load(name, default):
    p = DATA / name
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return default


def save(name, obj):
    (DATA / name).write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


# ------------------------------------------------------------------ news
def fetch_news():
    items, seen = [], set()
    for topic, label, q in NEWS_QUERIES:
        url = "https://news.google.com/rss/search?" + urllib.parse.urlencode(
            {"q": q + " when:3d", "hl": "en-US", "gl": "US", "ceid": "US:en"})
        try:
            root = ET.fromstring(get(url))
        except Exception as e:  # network or parse problem: skip this query
            print(f"news skip ({label}): {e}")
            continue
        n = 0
        for it in root.iter("item"):
            title = html.unescape((it.findtext("title") or "").strip())
            link = (it.findtext("link") or "").strip()
            src_el = it.find("source")
            source = (src_el.text or "").strip() if src_el is not None else ""
            if source and title.endswith(" - " + source):
                title = title[: -len(" - " + source)]
            key = re.sub(r"[^a-z0-9]", "", title.lower())[:80]
            if not title or not link or key in seen or BLOCK.search(title):
                continue
            try:
                d = email.utils.parsedate_to_datetime(it.findtext("pubDate"))
            except Exception:
                d = NOW
            seen.add(key)
            items.append({"title": title, "url": link, "source": source, "date": iso(d), "topic": topic, "topicLabel": label})
            n += 1
            if n >= 8:
                break
    items.sort(key=lambda i: i["date"], reverse=True)
    return items[:40]


# ------------------------------------------------------------------ videos
NS = {"a": "http://www.w3.org/2005/Atom", "yt": "http://www.youtube.com/xml/schemas/2015"}


def resolve_handle(handle):
    try:
        page = get("https://www.youtube.com/" + handle).decode("utf-8", "ignore")
    except Exception as e:
        print(f"handle skip {handle}: {e}")
        return None
    for pat in (r'"externalId":"(UC[\w-]{22})"', r'<link rel="canonical" href="https://www\.youtube\.com/channel/(UC[\w-]{22})"',
                r'"channelId":"(UC[\w-]{22})"'):
        m = re.search(pat, page)
        if m:
            return m.group(1)
    return None


def feed(url, name, topic, limit=3):
    out = []
    try:
        root = ET.fromstring(get(url))
    except Exception as e:
        print(f"feed skip {name}: {e}")
        return out
    for e in root.findall("a:entry", NS):
        vid = e.findtext("yt:videoId", default="", namespaces=NS)
        title = (e.findtext("a:title", default="", namespaces=NS) or "").strip()
        pub = e.findtext("a:published", default="", namespaces=NS)
        author = e.findtext("a:author/a:name", default=name, namespaces=NS) or name
        if not vid or not title or "#shorts" in title.lower():
            continue
        out.append({"id": vid, "title": title, "channel": author, "published": pub, "topic": topic})
        if len(out) >= limit:
            break
    return out


def fetch_videos(cfg):
    vids, changed_cfg = [], False
    for ch in cfg.get("channels", []):
        cid = ch.get("id")
        if not cid and ch.get("handle"):
            cid = resolve_handle(ch["handle"])
            if cid:
                ch["id"] = cid
                changed_cfg = True
        if cid:
            vids += feed("https://www.youtube.com/feeds/videos.xml?channel_id=" + cid, ch["name"], ch.get("topic", ""))
    for pl in cfg.get("playlists", []):
        vids += feed("https://www.youtube.com/feeds/videos.xml?playlist_id=" + pl["id"], pl["name"], pl.get("topic", ""), limit=2)
    seen, uniq = set(), []
    for v in sorted(vids, key=lambda v: v.get("published", ""), reverse=True):
        if v["id"] in seen:
            continue
        seen.add(v["id"])
        uniq.append(v)
    return uniq[:12], changed_cfg


def main():
    changed = False
    news = load("news.json", {"updated": "", "items": []})
    fresh = fetch_news()
    if len(fresh) >= 5 and [i["url"] for i in fresh] != [i["url"] for i in news.get("items", [])]:
        save("news.json", {"updated": iso(NOW), "items": fresh})
        changed = True
        print(f"news: {len(fresh)} items")

    cfg = load("channels.json", {"channels": [], "playlists": []})
    videos = load("videos.json", {"featured": [], "latest": []})
    latest, cfg_changed = fetch_videos(cfg)
    if cfg_changed:
        save("channels.json", cfg)
        changed = True
    if latest and [v["id"] for v in latest] != [v["id"] for v in videos.get("latest", [])]:
        videos["latest"] = latest
        videos["updated"] = iso(NOW)
        save("videos.json", videos)
        changed = True
        print(f"videos: {len(latest)} latest")

    flag = "CHANGED=1" if changed else "CHANGED=0"
    print(flag)
    out = os.environ.get("GITHUB_OUTPUT")
    if out:
        with open(out, "a") as f:
            f.write(("changed=true" if changed else "changed=false") + "\n")


if __name__ == "__main__":
    main()
