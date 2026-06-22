# Grima's Bane — KPSP Shard (CON + MON)

> Project/product state. ExPod (project-tracker) authors the structure; sessions
> manage the backlog. Keep this in sync after every feature.

## Snapshot

- **Project:** Grima's Bane (Shorts/Reels blocker)
- **Category:** dev-tools (internal utility) — sovereign
- **Repo:** `RaihnForge/grimas-bane` (public)
- **Landing:** https://raihnforge.github.io/grimas-bane/
- **Version:** 0.1.0
- **Phase:** execution (shipped v0.1.0, unpacked; Web Store pending)
- **Developer:** Thane
- **Created:** 2026-06-21

## Milestones

- [x] **M1 — Working extension.** MV3, 4 platforms, default-on, popup toggles. (2026-06-21)
- [x] **M2 — Brand + publish.** Forked-tongue + bane icon, GitHub Pages landing, public repo. (2026-06-21)
- [ ] **M3 — Chrome Web Store listing.** Upload `dist` zip, screenshots, review, live. (needs Joshua's dev account + $5)
- [ ] **M4 — Selector hardening pass.** Verify hide rules against current YouTube/Meta/TikTok markup; add fallbacks.

## Backlog

Priority order. Pull from the top.

1. **[M3] Web Store submission** — package is built (`scripts/build-zip.js`),
   listing copy in `STORE-LISTING.md`. Blocked on Joshua registering a Web Store
   developer account ($5) and capturing 1280×800 screenshots.
2. **[M4] Selector audit** — load each site, confirm: YT Shorts shelf/sidebar
   gone + `/shorts/` redirect; FB Reels cards + nav gone; IG Reels nav gone +
   `/reels/` redirect; TikTok curtain. Log any that leak and tighten selectors.
3. **Per-site "allow for 10 min" temporary unlock** — optional escape hatch that
   re-locks itself, so toggling off is not sticky. (Design first; risks scope creep.)
4. **Options page with counters** — "Shorts blocked today" tally. Nice-to-have;
   requires storage writes from content script. Evaluate against the no-tracking
   principle (counts stay local).
5. **Firefox (MV3) port** — manifest + `browser.*` shim. Only if there's demand.
6. **Mobile note** — document that this is desktop-Chromium only; mobile browsers
   don't support extensions.

## Decisions log

- 2026-06-21 — Published under **RaihnForge** (personal), not E4Keyes, so the
  Pages project site lives under the user account. Registered in manifest's
  RaihnForge section with that rationale.
- 2026-06-21 — TikTok handled as a full-site curtain (the entire site is
  short-form) rather than per-element hiding.
- 2026-06-21 — Default-hide via CSS, un-hide via JS allow-class, to eliminate the
  flash-of-Shorts before settings load.
