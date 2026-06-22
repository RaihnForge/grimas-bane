# Grima's Bane — AI Instructions (CON)

## Developer: Thane

Infrastructure engineer. Minimal surface, boring-and-reliable over clever, the
README is the deliverable. This is a single-purpose browser utility — keep it
that way.

## What this is

A Manifest V3 Chrome (Chromium) extension that hides short-form video feeds
(Shorts / Reels) on YouTube, Facebook, Instagram, and TikTok. Blocking is **on
by default**; the toolbar popup is the off switch ("unless turned off").

Sovereign tool. PC-agnostic (any Chromium browser). Published as a public repo
under the **RaihnForge** personal account — not E4Keyes — because the GitHub
Pages landing site must resolve at `raihnforge.github.io/grimas-bane/`.

## Ownership boundaries

Grima's Bane owns **only** short-form feed suppression on the four supported
hosts: the per-platform hide rules, the short-form URL redirects, the TikTok
block curtain, and the popup toggle UI/state. It does **not**:

- Block or throttle anything outside Shorts/Reels (no site blocking, no timers —
  that is Samwise's territory: on-task nudging, allow/deny rulesets).
- Monitor service health (Watchtower) or GPU/system state (Narya).
- Collect, transmit, or persist anything beyond the per-site on/off booleans in
  `chrome.storage.sync`.

If a request would grow this past "hide the short-form feed," it belongs in a
different tool. Say so.

## Conventions

- **No build step, no bundler, no dependencies.** Plain MV3 + vanilla JS/CSS.
  The two `scripts/*.js` helpers are Node **stdlib only** (zlib for PNG/zip).
- **Default-hide via CSS, un-hide via JS.** `content.css` hides Shorts at
  `document_start` with no settings wait (no flash). The content script only
  *adds* `gb-allow-<platform>` to `<html>` when a site is toggled off. Never
  invert this — hiding must be the zero-JS default.
- **URL redirects are the stable layer; DOM selectors are the fragile layer.**
  When a platform reshuffles its markup, the selectors in `content.css` and the
  JS hide passes are what break first. Fix those; leave the redirects alone.
- **ASCII only in any `.ps1`** (workspace rule) — currently none here.
- Bump `version` in `manifest.json` AND `package.json` together on any release.

## Build / release

- `node scripts/generate-icons.js` — regenerate `icons/*.png` (forked-tongue + bane mark).
- `node scripts/build-zip.js` — produce `dist/grimas-bane-store.zip` for a
  Chrome Web Store upload (runtime files only; gitignored).
- Landing page lives in `docs/` and is served by GitHub Pages from `/docs`.

## Pillar docs

CLAUDE.md (this), ARCHITECTURE.md, DESIGN.md, README.md, KPSP-Shard.md,
MEMORY.md, keeper.md. Update KPSP-Shard backlog + ARCHITECTURE after features.
