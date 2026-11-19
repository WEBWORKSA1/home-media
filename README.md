# Home.Media

The independent planning hub for home entertainment: 10 free calculators (screen size, projector throw, Dolby Atmos speaker layout, streaming cost, bandwidth, media-server storage, home theater cost, room modes, HDMI, setup quiz), 16 in-depth guides, self-updating news and videos, and a **Free Home Media Plan** wizard that turns visitors into scored installation leads.

Static site, no dependencies at runtime. Hosted free on GitHub Pages.

- `RESEARCH.md`: concept, revenue model, trademark position and the 41-site benchmark
- `PROMPTS.md`: phase-by-phase prompts to rebuild or extend the site

## How it's built

`scripts/build.py` wraps every page body in one shared layout (owner bar, header, AdSense, structured data, footer) and writes plain HTML to the repo root. GitHub Pages serves those files as-is (`_config.yml` only keeps working folders out of the published site).

| Path | What it holds |
| --- | --- |
| `content/pages/*.html` | Page bodies with a JSON header (title, description, FAQ, scripts) |
| `content/guides/*.md` | Guides in Markdown with a JSON header; add a file to add a guide |
| `scripts/build.py` | Generator: layout, nav, footer, sitemap, search index |
| `scripts/update.py` | Daily refresh of news and videos from public feeds |
| `.github/workflows/update.yml` | Runs the refresh daily and rebuilds on content changes |
| `assets/js/config.js` | Encoded form inbox, AdSense slot IDs, payment links, contest details |
| `assets/js/site.js` / `tools.js` / `plan.js` | Site behaviour, the 10 tools, the lead wizard |
| `assets/data/*.json` | Streaming prices, news, videos, YouTube channels, search index |
| `*.html`, `guides/*.html`, `sitemap.xml` | Generated output (don't edit by hand; edit `content/` and rebuild) |

Edit a page: change the file in `content/`, commit. The workflow rebuilds and commits the HTML automatically. Locally: `pip install markdown && python3 scripts/build.py`.

## Self-updating parts

- **Daily (GitHub Actions, 06:17 UTC):** fresh headlines on `news.html` and the home page; latest uploads from AV and streaming creators on `videos.html`; sitemap dates.
- **On every content push:** pages rebuild automatically.
- **In the browser, every visit:** tip of the day, contest countdown, freshness stamps, copyright year, newer news if the JSON is fresher than the page.

## One-time setup checklist

1. **Publish from `main`:** Settings → Pages → Build and deployment → *Deploy from a branch* → `main` / `(root)` → Save. (If a `gh-pages` branch exists, it was only used to switch Pages on; the workflow keeps it identical to `main`, and it can be deleted once `main` is selected.)
2. **Custom domain (required for AdSense):** Settings → Pages → Custom domain `home.media` → Save. At the registrar: A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`; `www` CNAME → `webworksa1.github.io`. Tick *Enforce HTTPS* once the certificate is issued.
3. **Forms:** submit any form once. The form service sends a one-time activation email to the site inbox; click *Activate*. All forms then deliver. The address is stored encoded in `assets/js/config.js` and never appears in page source.
4. **AdSense:** add `home.media` as a site, keep `ads.txt` at the root, turn on Auto ads, and enable Google's consent message for EEA/UK/Switzerland. After approval, paste display-unit slot IDs into `adSlots` in `config.js`.
5. **Automation:** Actions → *Home.Media auto-refresh* → *Run workflow* once to confirm it commits.
6. **Payments:** paste PayPal / Stripe / Buy Me a Coffee links into `donate` in `config.js`. Until then the Support page collects pledges.

## Trademark & copyright

Original content © Home.Media. The brand is always written **Home.Media**. Not affiliated with Home Media Magazine, Media Play News or any product named "Home Media". Third-party names are trademarks of their owners, used for identification only. Embedded videos remain the property of their creators. Full disclosure: `legal.html`.

Website, domain, sponsorship, advertising and partnership enquiries: https://web.works/contact
