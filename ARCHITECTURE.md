# Grima's Bane — Architecture (CON)

## Overview

A Manifest V3 content-script extension. No service worker, no background page,
no network calls. All logic runs in the page context of four host sites; all
state is four-plus booleans in `chrome.storage.sync`.

```
manifest.json ── declares content script (document_start) on 4 hosts + popup action
   │
   ├── src/content.css   default-HIDE rules, keyed on html:not(.gb-allow-<platform>)
   ├── src/content.js    reads settings → toggles allow-class, redirects, observes DOM
   └── src/popup.*        toolbar UI: master + per-site toggles → writes storage.sync

scripts/generate-icons.js   (dev) zlib PNG encoder → icons/
scripts/build-zip.js        (dev) zlib ZIP writer → dist/ store package
docs/                        GitHub Pages landing site
```

## Components (CON/MON/EVD)

| Component | Type | Role |
|-----------|------|------|
| `manifest.json` | CON | Host matches, content-script registration, `storage` permission, action popup |
| `src/content.css` | CON | Static default-hide selectors per platform + block-overlay styling |
| `src/content.js` | CON | Settings load, allow-class toggle, redirects, MutationObserver hide passes, SPA URL watch, TikTok overlay |
| `src/popup.{html,css,js}` | CON | Master + per-platform switches; writes `storage.sync`; reload-tab affordance |
| `chrome.storage.sync` | MON | Live state: `{master, youtube, facebook, instagram, tiktok}` booleans (default all true) |
| `icons/`, `docs/` | EVD | Brand mark + public landing page |

## Data flow

1. At `document_start`, `content.css` is injected — Shorts are hidden immediately,
   before any settings are read (this is why there is no flash).
2. `content.js` resolves the current platform from the hostname, reads
   `storage.sync` (defaults: everything blocked).
3. If a platform is **enabled** (master AND that site): leave the hide-CSS active,
   run the redirect for the current URL, start the DOM observer (Meta sites),
   inject the block overlay (TikTok).
4. If **disabled**: add `gb-allow-<platform>` to `<html>` (un-hides the CSS),
   stop the observer, remove any overlay.
5. The popup writes booleans; `storage.onChanged` re-applies live for CSS-based
   changes. Redirect/overlay changes take effect on the next load — the popup
   offers a one-click tab reload.

## Per-platform strategy

| Platform | Hide layer | Redirect / block layer |
|----------|-----------|------------------------|
| YouTube | CSS `:has()` on Shorts shelves/renderers/guide entries | `/shorts/<id>` → `/watch?v=<id>` (SPA-aware) |
| Facebook | CSS + JS climb from `a[href^="/reel/"]` to feed card | `/reel(s)/…` → home |
| Instagram | CSS + JS on Reels nav link | `/reels?/…` → home |
| TikTok | n/a (whole site) | full-page block overlay |

## Optimization / robustness layers

- **No-flash hide:** zero-JS default-hide (see above).
- **SPA navigation:** `history.pushState`/`replaceState` are wrapped plus a 1s
  `popstate`/interval fallback, so redirects fire on in-app navigation.
- **Observer debounce:** Meta hide passes are debounced (~350ms) and scoped to
  anchor/aria selectors to avoid scanning every node on mutation.

## Known fragility

DOM selectors track obfuscated, frequently-changing third-party markup. They are
the expected maintenance point. Redirects key off URL shape and are stable. See
KPSP-Shard backlog for selector-hardening items.

## Non-goals

No background worker, no remote config, no analytics, no data egress, no blocking
beyond short-form feeds. See CLAUDE.md ownership boundaries.
