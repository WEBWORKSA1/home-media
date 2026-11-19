---
{"title": "Plex vs Jellyfin vs Emby vs Kodi: Choosing a Media Server", "short": "Plex vs Jellyfin vs Emby vs Kodi", "description": "Compare Plex, Jellyfin, Emby and Kodi on cost, ease of use, apps, remote streaming, transcoding, live TV and privacy, and see which fits your household.", "cat": "server", "order": 1, "updated": "2026-11-19", "tools": ["storage.html", "bandwidth.html"], "related": ["build-a-home-media-server", "internet-speed-for-streaming", "cord-cutting-guide"], "keywords": "plex vs jellyfin, jellyfin vs emby, plex vs kodi, best media server software, media server comparison", "tldr": ["Plex: the most polished apps and easiest sharing; premium features need a Plex Pass.", "Jellyfin: completely free and open source with no paid tier; apps are improving fast.", "Emby: Plex-like polish with a paid Premiere tier; strong live TV.", "Kodi: a superb player for one TV, not a server; pairs well with any of the others."], "faq": [["Is Jellyfin really free?", "Yes. Jellyfin is free software under the GNU GPL, with no premium tier, subscriptions or tracking. The project is funded by donations."], ["Can I use more than one?", "Yes. They can read the same media folders. Many people run Plex for family and Jellyfin for themselves, or use Kodi as the player on the main TV."], ["Is running a media server legal?", "The software is legal. Use it for media you own or are licensed to copy, such as your own discs, home videos and DRM-free purchases."]]}
---
A **media server** organises your own films, shows, music and photos, adds artwork and descriptions, and streams them to TVs, phones and browsers. Four names dominate. They overlap, but they're not interchangeable.

## Quick comparison

| | Plex | Jellyfin | Emby | Kodi |
| --- | --- | --- | --- | --- |
| What it is | Server + apps | Server + apps | Server + apps | Media player/center |
| Cost model | Free server; paid Plex Pass | Free, no paid tier | Free server; paid Premiere | Free |
| Open source | No | Yes (GPL) | No | Yes (GPL) |
| App polish | Best | Good, improving | Very good | Excellent on TV |
| Remote / family sharing | Easiest (some features need a pass) | Yes, you configure access | Yes | N/A (local player) |
| Hardware transcoding | With Plex Pass | Free | With Premiere | N/A |
| Live TV / DVR | Yes | Yes | Yes | Via add-ons/backends |

## Plex

Plex is the most established option, with first-party apps on nearly every device and the easiest way to share a library with family. The **Plex Media Server is free**, but premium features (such as hardware transcoding and others listed on Plex's plans page) require a **Plex Pass** subscription, and Plex now charges for some remote-streaming scenarios through a Plex Pass or a Remote Watch Pass. Plex also offers free ad-supported films and live channels alongside your library.

**Choose Plex if:** you want the least fuss for non-technical family members and don't mind paying for extras.

## Jellyfin

Jellyfin is a community-built, **completely free and open-source** server. There's no premium tier, no account requirement and no tracking. Hardware-accelerated transcoding (Intel Quick Sync, NVIDIA NVENC, AMD AMF, VA-API), live TV and DVR, plugins and SyncPlay (watching together) are all included. Its apps are less uniform than Plex's across devices, but they've improved quickly.

**Choose Jellyfin if:** you value privacy and ownership, are comfortable with a little setup, and don't want subscriptions.

{{AD}}

## Emby

Emby is a personal media server with polished apps and a strong live TV and DVR feature set. The server is free; **Emby Premiere** unlocks many features, including hardware transcoding and full playback in some apps. Jellyfin began as a fork of Emby's code when Emby moved toward a closed-source model.

**Choose Emby if:** you like a Plex-style experience and heavy live-TV use, and prefer Emby's licensing.

## Kodi

Kodi is a free, open-source **media center** that turns a PC, streaming box or TV into a beautiful 10-foot interface for local and network media. It plays almost any format and has a deep add-on and skin ecosystem. It's primarily a **player**, not a multi-user server, which is why many people pair Kodi on the main TV with a Plex, Jellyfin or Emby server. Use only legitimate add-ons; some third-party add-ons enable piracy.

**Choose Kodi if:** you want the best possible playback and customisation on one or two TVs.

## How to decide

1. **Who will use it?** Family on many devices → Plex or Emby. Mostly you → Jellyfin or Kodi.
2. **Budget for subscriptions?** None → Jellyfin.
3. **Will people watch outside the house?** Check each platform's current remote-streaming rules and your upload speed.
4. **What hardware?** A NAS or mini PC with Intel Quick Sync handles transcoding efficiently for any of them.

Size the drives with the [storage calculator](storage.html), then follow [how to build a home media server](guides/build-a-home-media-server.html).
