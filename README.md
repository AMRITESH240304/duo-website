# Duo marketing site

Plain HTML/CSS/JS, kept separate from the Flutter app (`app/`). No build step, no framework — open `index.html` via a local server (not `file://`, since the i18n JSON is loaded with `fetch`).

## Run locally

```bash
cd website
python3 -m http.server 8080
# open http://localhost:8080
```

## Structure

```
website/
  index.html          hero + features + USP + CTA
  privacy.html         /privacy — Play Console can link this directly
  terms.html            /terms
  404.html
  css/style.css        all styles
  js/i18n.js           language detect/switch, loads i18n/*.json
  js/main.js           scatters stickers/avatars around the hero
  i18n/{en,de,es,fr,it}.json   all copy, incl. legal text
  assets/img/logo.png             brand mark (from app/assets/logo.png)
  assets/img/google-play-badge.png  official Play badge (Google-hosted asset)
  assets/img/app-demo.mp4          ⚠️ PLACEHOLDER — swap for a real screen capture
  assets/stickers/*    8 in-app stickers (paywall-only ones excluded)
  assets/avatars/*     a few in-app avatars for extra scatter variety
```

## TODO before shipping

1. **`assets/img/app-demo.mp4`** — record a real loop of the app (nudge → live voice → chat) and drop it in at the same filename, or update the `<source>` in `index.html`. Keep it short (5–10s), muted, no audio track needed since it autoplays muted anyway. An `.mp4` loops far more efficiently than a real animated GIF.
2. **Compress images** — the stickers/avatars/logo were copied straight from the Flutter app and are much larger than a website needs (some are >1MB). Run them through `squoosh.app` or `pngquant` and resize to ~2x their max on-screen size (`assets/stickers` ~130px max, `assets/avatars` ~110px max).
3. **Domain** — once picked, update absolute URLs in `og:url` / canonical tags if added, and register the domain in Play Console's privacy policy field pointing at `/privacy.html`.
4. Optional: swap the Google-hosted badge URL for a locally saved copy if you want zero external requests (already saved as a local file here).
