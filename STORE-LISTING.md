# Chrome Web Store — submission notes

Everything you need to paste into the Web Store developer dashboard. The
packaged upload is built by `node scripts/build-zip.js` → `dist/grimas-bane-store.zip`.

## One-time setup
1. Register a developer account at https://chrome.google.com/webstore/devconsole (one-time **$5** fee).
2. Click **Add new item** → upload `dist/grimas-bane-store.zip`.
3. Fill in the fields below, add screenshots, submit for review (typically a few days).

## Listing fields

**Name**
> Grima's Bane — Shorts & Reels Blocker

**Summary** (≤132 chars)
> Blocks Shorts and Reels on YouTube, Facebook, Instagram, and TikTok — until you toggle a site off. On by default.

**Category**
> Productivity

**Language**
> English

**Description**
> Reclaim your attention from the endless scroll.
>
> Grima's Bane shuts the short-form feed across the four biggest offenders:
>
> • YouTube — hides Shorts shelves, the sidebar Shorts entry, and Shorts grid rows, and redirects /shorts/ links to the normal watch page.
> • Facebook — hides Reels cards and the Reels nav entry, and redirects Reels URLs to your home feed.
> • Instagram — hides the Reels nav entry and redirects Reels URLs to home.
> • TikTok — the whole site is short-form, so it's held behind a block curtain.
>
> Blocking is ON by default. A single click on the toolbar icon opens a master switch plus one toggle per site — so you stay in control. Turn a site back on whenever you actually want it; your settings sync across your Chrome profile.
>
> No accounts. No tracking. No data collection. Open source (MIT).

## Privacy

**Single purpose**
> Hide short-form video feeds (Shorts/Reels) on supported sites and let the user toggle that blocking per site.

**Permission justifications**
- `storage` — saves the on/off toggle for each site (synced via chrome.storage.sync). Nothing else is stored.
- Host access (youtube.com, facebook.com, instagram.com, tiktok.com) — the content script must run on these sites to hide Shorts/Reels elements and redirect short-form URLs.

**Data usage** — This extension collects **no** user data. Tick: does not sell data, does not use data for unrelated purposes, does not use data for creditworthiness/lending.

## Assets to prepare (not auto-generated)
- Store icon: 128×128 (use `icons/icon128.png`).
- At least one screenshot, 1280×800 or 640×400: suggest a before/after of a YouTube homepage with the Shorts shelf gone, plus the popup open.
- Optional small promo tile 440×280.
