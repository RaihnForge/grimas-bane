# Grima's Bane — Memory (MON)

Cross-session AI memory + breadcrumbs. Newest first.

## Project facts

- MV3 Chrome extension, no build step, no deps. Node stdlib-only helper scripts
  (`generate-icons.js`, `build-zip.js`) use `zlib` to emit PNG + ZIP by hand.
- Default-hide is CSS at `document_start`; the content script only *un-hides*
  by adding `gb-allow-<platform>` to `<html>` when a site is toggled off. Do not
  invert this — it's what prevents the flash of Shorts.
- Repo is under **RaihnForge** (not E4Keyes) on purpose: GitHub Pages landing at
  `raihnforge.github.io/grimas-bane/`. Pages serves from `/docs` on `main`.
- State = booleans in `chrome.storage.sync`: `master, youtube, facebook,
  instagram, tiktok` (all default true = blocking on).
- Developer: Thane.

## Breadcrumbs

- **2026-06-21** — Built v0.1.0 end to end in one session: extension (4
  platforms), public repo created via `gh`, Pages enabled and verified 200, Web
  Store package + listing copy prepared (`STORE-LISTING.md`), full studio
  onboarding + Thane assignment.
- **2026-06-21 (rebrand)** — Renamed from **Mouth of Sauron** → **Grima's Bane**
  (Joshua's pick; Wormtongue's whisper = the feed, this is its bane). Full rename:
  GitHub repo `mouth-of-sauron` → `grimas-bane` (Pages URL moved, old auto-redirects),
  local folder + all 4 cross-repo registrations, slug, the `mos-`→`gb-` CSS class
  prefix, and the icon. Popup/overlay/landing UI colors unchanged (dark-red).
- **2026-06-21 (icon)** — Icon iterated maw → forked serpent tongue → **final:
  a hooded shade** on a dark disc (grey cloak, black face void, two dead red X
  eyes), from a reference image Joshua supplied. `generate-icons.js` now renders
  it via polygon fill + 4× supersampling for clean AA (point-in-poly + segment
  distance, all in 0..1 coords). Tunables at the top of `draw()`: `HOOD`/`FACE`
  polygons, `rDisc`, eye position/size.
- **Open follow-up:** Web Store submission is the next real milestone but needs
  Joshua's registered dev account ($5) and screenshots — can't be done from here.

## Gotchas

- Selectors for YouTube/Meta/TikTok are the fragile layer and will drift. The
  URL redirects are stable. When something leaks, fix `content.css` /
  `content.js` hide passes, not the redirects.
- `dist/*.zip` is gitignored — the Web Store package is rebuilt fresh, never
  committed.
