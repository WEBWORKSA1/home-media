# Home.Media — Phase-wise Build Prompts

Use these in order to rebuild or extend the site. Each phase ends with a check. Replace `[SITE INBOX]` with the private form inbox; it must only ever be stored encoded in `assets/js/config.js`, never written in plain text anywhere.

---

## Phase 0 — Research and positioning

> Research the home-entertainment niche for the domain **Home.Media**. Open and read at least 38 leading sites across AV reviews (RTINGS, What Hi-Fi?, Audioholics), streaming guides (JustWatch, Reelgood, Cord Cutters News), media servers (Plex, Jellyfin, Emby, Kodi), installer lead-gen (Angi, Homeyou, CEDIA, Control4, Audio Advice, Crutchfield design service) and calculator sites (ProjectorScreen.com, Homewyse). For each, record what it actually does: tools, forms, lead capture, monetization, design. Then pick the single most profitable concept for an exact-match "home media" domain, size its revenue streams with explicit assumptions, and check trademark conflicts with "Home Media" names (e.g. Home Media Magazine / Media Play News). Output `RESEARCH.md`.

**Check:** concept names one primary revenue engine (lead marketplace), not "ads + everything".

## Phase 1 — Foundation, layout, compliance

> Build a static, dependency-free site for GitHub Pages (free plan, `main` branch). Use a Python generator (`scripts/build.py`) that wraps page bodies in one shared layout and writes plain HTML. The layout must include on every page: the AdSense script `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6620975821265271" crossorigin="anonymous"></script>` (except thank-you and 404 pages), `google-adsense-account` meta, canonical, Open Graph, JSON-LD (Organization, WebSite + SearchAction, BreadcrumbList, Article/FAQ where relevant), and a top owner bar reading "Contact, if you are interested in this website / domain name / Sponsorship / Advertisement / Partnership" linking to `https://web.works/contact` (link text must not show the URL). Dark cinematic theme with light-mode toggle, responsive mega-nav, accessible (skip link, focus states, ARIA). Pages: about, contact, privacy (AdSense cookies, opt-out, form processor), terms, disclaimer, editorial policy, trademark & copyright disclosure (brand always "Home.Media"; not affiliated with Home Media Magazine, Media Play News or any HomeMedia-named product), 404, thank-you, search. Add `ads.txt` (`google.com, pub-6620975821265271, DIRECT, f08c47fec0942fa0`), `robots.txt`, `sitemap.xml`, web manifest, SVG logo/favicon.

**Check:** every page has the owner bar and AdSense code; no email address appears anywhere in source.

## Phase 2 — Interactive tools

> Build 10 client-side tools in `assets/js/tools.js`, each on its own SEO page with explainer text, FAQ and a "Get a free plan" CTA that pre-fills the lead wizard with the tool's result: (1) Screen Size & Viewing Distance (SMPTE 30°, THX 40°, 4K acuity), (2) Projector Throw & Brightness (throw ratio, aspect ratios, lumens/gain → foot-lamberts), (3) Speaker Layout Planner with an interactive SVG room for 2.1 to 9.2.6 using Dolby angles, (4) Streaming Cost & Cord-Cutting Savings with editable reference prices, (5) Bandwidth Planner (3/5/15 Mbps per HD/FHD/4K stream + headroom), (6) Media Server Storage (bitrate × runtime × count + RAID overhead), (7) Home Theater Cost Estimator (published cost ranges, low/mid/high), (8) Room Mode calculator (axial modes, Bonello-style spacing warnings), (9) HDMI Bandwidth Checker (resolution × refresh × bit depth × chroma → Gbps vs HDMI 2.0/2.1), (10) Setup Matchmaker quiz. Units switch ft/m. Results shareable via URL params.

**Check:** each tool computes instantly, survives empty/odd input, and works on a 360 px phone.

## Phase 3 — Lead engine

> Build `plan.html`: a 5-step "Free Home Media Plan" wizard (project types → room → budget/timeline/DIY-or-pro → location/ownership → contact + consent) with a progress bar, card-style options, an instant estimate panel before the contact step, lead scoring (HOT/WARM/COOL in the subject), hidden fields for page source, UTM and referrer, honeypot, and consent text naming matching with up to 3 vetted partners. Submit via FormSubmit AJAX using an inbox decoded at send time from an encoded array in `config.js` ([SITE INBOX]); fall back to a hidden-form POST. Add service pages with cost ranges, a sticky CTA bar, an in-content slide-in after 50% scroll (once per session), and `pros.html` for installers to join the network (company, services, service area, certifications, lead volume, budget per lead).

**Check:** submit every form once; FormSubmit sends one activation email to the inbox; after activation all forms deliver.

## Phase 4 — Content depth (AdSense approval)

> Write 14+ original, practical guides (800–1,400 words each): beginner's home theater setup, TV size and distance, projector vs TV, Dolby Atmos speaker placement, soundbar vs surround, cord-cutting, streaming bandwidth and Wi-Fi, Plex vs Jellyfin vs Emby vs Kodi, building a media server/NAS, home theater cost, room acoustics, HDMI 2.1 and eARC, free OTA antenna TV, hiring an installer, small-room/apartment setups, picture calibration basics. Each: TL;DR box, steps, tables, FAQ (FAQPage schema), related tools, related guides, and a plan CTA. No thin pages, no copied text, no fake reviews or invented testimonials.

**Check:** 30+ indexable pages with real substance; legal pages linked in footer.

## Phase 5 — Self-updating automation

> Add `scripts/update.py` and a daily GitHub Actions workflow: fetch Google News RSS for home-theater, streaming-price, cord-cutting, media-server and TV/projector queries; dedupe and save `assets/data/news.json`; resolve YouTube channel feeds (public RSS) for curated AV creators and save `assets/data/videos.json`; re-run the generator so headlines and videos are baked into HTML for crawlers; update sitemap `lastmod`; commit only if changed and push to `main` (and mirror to `gh-pages` if that branch exists). In-browser: tip of the day, freshness stamps, contest countdown, copyright year.

**Check:** run the workflow manually once; confirm a bot commit and fresh dates on news.html.

## Phase 6 — Community and money pages

> Build: `support.html` (donation tiers and pledge form; payment links read from config; transparent "where support goes": operations, promotions, marketing, hiring, contest prizes), `contests.html` ("Setup of the Month": prize, deadline countdown, entry form with photo links, official rules: no purchase necessary, 18+, void where prohibited, judging criteria), `careers.html` (writers, video editors, calibrators, installer partners, moderators, developers, sponsorship sales; application form), `advertise.html` (tool sponsorships, newsletter, category exclusives, video integrations; inquiry form), `videos.html`, `news.html`.

**Check:** all forms post to the same encoded inbox; nothing exposes the address.

## Phase 7 — QA and AdSense readiness

> Run a full sweep: broken links, console errors, form validation, mobile layout at 360/768/1280 px, Lighthouse accessibility, owner bar and AdSense code on every content page, no email in any file, ads.txt reachable at root, privacy policy mentions Google advertising cookies, cookie notice present. Report all issues in one list before fixing.

## Phase 8 — Deploy

> Push to `webworksa1/home-media` on `main`. Enable GitHub Pages: Settings → Pages → Deploy from a branch → `main` / root. Add custom domain `home.media` (A records 185.199.108.153, .109.153, .110.153, .111.153; `www` CNAME → webworksa1.github.io), enforce HTTPS, then apply to AdSense with the custom domain and enable Google's consent message for EEA/UK.

## Phase 9 — Growth (after launch)

> Recruit 10 installers in 3 metro areas before scaling traffic; add territory pages ("TV mounting in Toronto") only where a buyer exists; add affiliate links to tool results; publish one data study per month (e.g. streaming cost index) for backlinks; build an email sequence for plan requesters; A/B test wizard step order and the instant-estimate panel.
