---
{"title": "How to Build a Home Media Server (NAS, Mini PC or Old Laptop)", "short": "Build a media server", "description": "Plan and build a home media server: choosing hardware, storage and RAID, transcoding, folder structure and naming, remote access, backups and keeping it legal.", "cat": "server", "order": 2, "updated": "2026-11-19", "tools": ["storage.html", "bandwidth.html"], "related": ["plex-vs-jellyfin-vs-emby-vs-kodi", "internet-speed-for-streaming", "cord-cutting-guide"], "keywords": "build a media server, plex server hardware, nas for plex, jellyfin server build, media server backup", "tldr": ["Pick software first (Plex, Jellyfin or Emby), then hardware that suits it.", "A mini PC or NAS with Intel Quick Sync handles several transcodes quietly.", "Size storage with growth in mind and keep the array under 80% full.", "RAID is not a backup: keep a second copy of irreplaceable files."], "faq": [["Can I use an old laptop?", "Yes, to start. An old laptop with an external drive is a fine way to try Plex or Jellyfin. Move to a NAS or mini PC when the library or household grows."], ["NAS or mini PC?", "A NAS is easiest for storage, redundancy and low power. A mini PC with external or attached storage gives more CPU/GPU power for transcoding. Many people use both: NAS for storage, mini PC for the server software."], ["How much RAM do I need?", "8 GB is plenty for a media server on its own. Add more if the same machine runs other services or virtual machines."]]}
---
A home media server puts your own films, shows, music and photos on every screen, with artwork, resume points and profiles, like a private streaming service. Here's how to build one that's quiet, reliable and easy for the whole household.

## 1. Choose the software

Start with how people will watch. **Plex** has the most polished apps and easiest sharing; **Jellyfin** is fully free and open source; **Emby** sits between them; **Kodi** is a superb player on the TV. Compare them in [Plex vs Jellyfin vs Emby vs Kodi](guides/plex-vs-jellyfin-vs-emby-vs-kodi.html).

## 2. Choose the hardware

| Option | Good for | Watch-outs |
| --- | --- | --- |
| Old laptop/PC + USB drive | Trying it out | Power draw, single drive |
| NAS (2–8 bays) | Storage, redundancy, low power, always on | Some NAS CPUs are weak at transcoding |
| Mini PC (Intel with Quick Sync) | Fast transcoding, quiet, low power | Storage via NAS or external enclosure |
| Custom server (e.g. Unraid) | Big libraries, flexibility | More setup and maintenance |

**Transcoding** converts a video on the fly when a device can't play the original (a phone on mobile data, an older TV, a browser). With hardware acceleration such as Intel Quick Sync, a small, efficient CPU handles several streams. If every TV in the house plays your files directly (**direct play**), transcoding rarely happens.

## 3. Size and protect the storage

Use the [storage calculator](storage.html). A 1080p web-quality film is around 5 GB; a 4K remux can be 50–80 GB. For scale, Kaleidescape rates an 8 TB server at about 125 high-bitrate 4K films or about 200 HD films.

Protection options:

- **Mirror (RAID 1):** two drives, half usable. Simple.
- **Single parity (RAID 5, SHR, Unraid single parity):** survives one drive failure.
- **Dual parity (RAID 6, SHR-2):** survives two; recommended for 4+ large drives, because rebuilds take many hours.

**RAID is not a backup.** It won't protect against deletion, ransomware, theft or fire. Keep irreplaceable photos and home video in a second place, ideally off-site.

{{AD}}

## 4. Organise folders and names

Media servers match files to online metadata by name. A clean structure saves hours:

```
Movies/Film Title (Year)/Film Title (Year).mkv
TV/Show Name/Season 01/Show Name - S01E01.mkv
Music/Artist/Album/01 - Track.flac
```

Keep films, TV, music and photos in separate libraries.

## 5. Network

Wire the server and the main TV with Ethernet. High-bitrate 4K files can exceed what weak Wi-Fi delivers reliably. For viewing outside the house, upload speed is the limit; see [internet speed for streaming](guides/internet-speed-for-streaming.html).

## 6. Remote access, safely

Use the platform's built-in secure remote access, or a VPN. Avoid forwarding random ports without understanding them. Give family members their own accounts with appropriate permissions and parental controls.

## 7. Maintenance

- Turn on automatic updates for the server software.
- Check drive health (SMART) monthly; replace drives showing errors.
- Schedule backups and test a restore once in a while.
- Keep the array under about 80% full.

## Keep it legal

Use media you own or are licensed to copy: your own discs, home videos, DRM-free purchases and public-domain works. Don't use the server to distribute content you don't have rights to.

Want it built and configured for you? Request a [free Home Media Plan](plan.html?type=Media%20server%20%2F%20NAS%20setup).
