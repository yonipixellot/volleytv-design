# Halo Angular — M6 Accessibility Audit (BA dark)

Measured with axe-core 4.13 against the **live app routes** (not story chrome), all
12 routes, 0 errored. Tags: wcag2a/2aa/21aa/22aa + best-practice.

Baseline totals: `region` 113 · `color-contrast` 108 (violations) + 67 (incomplete/glass)
· `landmark-one-main` 11 · `page-has-heading-one` 6 · `button-name` 3 · `image-redundant-alt` 2.

## Gaps

- [x] **G1 — `--ink3` muted text contrast.** rgba(238,241,246,.40) → ~3.5:1 dark, ~2.7:1 light. Raise alpha to .52 (dark) / .62 (light). Clears most `color-contrast` violations. `src/styles/_tokens.scss`
- [x] **G2 — landmarks.** No `<main>`. Wrap `<router-outlet>` in `<main>` → clears `landmark-one-main` (11) + `region` (113) app-wide. `src/app/app.html`
- [x] **G3 — `button-name` on `.logodd`.** Client-logo dropdown button has no accessible name. Add aria-label. `src/lib/organisms/app-header/app-header.ts`
- [x] **G4 — `page-has-heading-one`.** 7 pages missing `<h1>`: you, game, sign-in, sign-up, watch/live, watch/vod, watch/highlight. Add one (visually-hidden where no visible title).
- [x] **G5 — white-on-green story initials** (2.6:1, need 3:1 large text). Seed avatar color `#10b866` too light. Darken seed colors to AA-safe shades. home/you seed.
- [x] **G6 — white-on-red "Live now" badge** (3.05:1, need 4.5:1). `--live` white text fails. Fix badge treatment.
- [x] **G7 — `image-redundant-alt`** (2 nodes). Crest `alt` duplicates adjacent team-name text → make decorative `alt=""`.
- [x] **G8 — focus visibility (WCAG 2.4.7).** 0 `:focus-visible` rules existed app-wide (axe can't detect this). Added one zero-specificity `:where()` baseline ring (accent outline + halo) in `src/styles.scss`. Verified with real keyboard Tab.
- [x] **G9 — `.push` caption used `--ink4`** (hairline-faint, 1.9:1 dark / 1.8:1 light). → `--ink3`. `shot-map.scss`
- [x] **G10 — light `--pos` green `#0f9d59`** (3.2–3.5:1 as delta text & on-fill) → `#068043`. `_tokens.scss`
- [x] **G11 — light `--live` `#e0413f`** as red text on white (4.2:1) → `#d12b2f`. `_tokens.scss`
- [x] **G12 — `.livepill` (live player) & `.lchip.live` (ladder)** white on `--live` → `--live-strong`.
- [ ] **Incomplete — `color-contrast` 65 nodes (glass/gradient).** axe can't resolve bg through `backdrop-filter`/gradient → lands in `incomplete`, NOT verified. Muted-text tokens were raised globally so these are very likely fine, but an honest conformance claim needs a manual sampling pass. Not a blocker for M6.

## Result

axe-core 4.13, all 12 live routes, **0 errored**:
| theme | violations (before → after) | incomplete (glass) |
|---|---|---|
| BA dark | 243 → **0** | 65 |
| BA light | (worse) → **0** | 65 |

## Other M6
- [x] Responsive desktop pass — app is a phone-width canvas; from ≥520px it's a centred device frame on a **theme-aware** ambient backdrop (was hardcoded black behind the light theme) with a soft framing shadow + hairline. No horizontal overflow on any of the 12 routes in either theme; shell stays 430px centred; mobile stays edge-to-edge. `src/styles.scss`
- [x] Storybook build gate — green (app + storybook both build clean after all a11y/responsive edits)
- [x] Deploy — pushed to `Pixellot/ott-halo` branch **`yoni/halo-angular`** at `apps/halo-angular/`. Artifacts build clean: `dist/halo-web` + `storybook-static`.

## Note
`public/axe.min.js` is a dev-only scanning aid — must NOT ship. Removed before build.

## 2026-09-02 — WCAG 2.2 AA deep audit (all skins × themes × personas × tiers, phone + desktop)
Ledger + numbers: `Outputs/Design Audits/audit-2026-09-02_halo-angular-wcag22.md` (ott-halo-master). Branch `a11y/wcag22-audit`.
Tooling (dev-only, served by the Storybook vite server, never bundled): `tools/sb-audit.js` (stories: axe + contrast/target/overflow/render) and `tools/app-audit.js` (live app across routes × persona × tier × skin × theme; `__appAudit.kb` logs real Tab walks).
Result on the default HoopsTV dark skin: app axe violations 36 → 0 nodes (56 URLs), Storybook 87 → 16 nodes (the remainder is a harness-timing read of the toggle thumb + the crest fallback monogram). Open: light/base colour tokens (decisions), glass/gradient text needs a manual pass, media untestable on the mock player.


## 2026-09-08 — Volley TV skin (fork of the Hoops TV build)

The `ba` and `hoopstv` skin blocks were replaced by one `volleytv` block (coral `#ff6b35` + deep teal `#0f5c6e`, ink `#0b1a22`). Every measured figure above was taken on the Hoops TV skin and does **not** carry over to the new token pairs. Computed WCAG relative-luminance ratios for the new pairs (formula check, not a rendered run):

| Pair | Ratio | Rule |
|---|---|---|
| coral `#ff6b35` text on dark `--screen #0a1014` | 6.8:1 | AA text ✓ |
| coral on dark `--card #121c21` | 6.3:1 | AA text ✓ |
| ink `#0b1a22` on coral fill (`--on-accent`, dark) | 6.3:1 | AA text ✓ |
| white on coral | 2.8:1 | ✗ — never use white on the coral fill |
| teal `#0f5c6e` text on light `--screen #f4f8f8` | 7.1:1 | AA text ✓ |
| white on teal fill (`--on-accent`, light) | 7.6:1 | AA text ✓ |
| coral `#ff6b35` on light `--screen` | 2.6:1 | ✗ — coral is not a text colour in light; `--accent-deep #0a4452` / teal carry text |
| ink on sand `#f2d6a2` | 12.6:1 | ✓ |

Open until G9a of the fork ledger: a rendered `tools/app-audit.js` + `tools/sb-audit.js` run on the finished volleyball app, both themes, with `0 errored`. The Hoops TV figures above stay as the method record, not as this skin's baseline.

Rendered evidence so far (2026-09-08, fork G8/G9): `bun run build-storybook` exit 0 with the volleytv skin as the only Skin toolbar entry; `bun run lint:spacing` exit 0 (baseline unchanged). The Storybook vitest/axe project (`vitest.config.ts`) does **not** run in this repo — `vitest` is not installed (`Cannot find module 'vitest/config'`), a pre-existing gap inherited from upstream, not a fork regression. Live-app tokens were read back through the DOM: dark `--accent #ff6b35` / `--on-accent #0b1a22` on `--screen #0a1014`; light `--accent #0f5c6e` / `--on-accent #ffffff` on `--screen #f4f8f8`, matching the computed table above. Still open: a `tools/app-audit.js` axe pass across routes × persona × tier × theme, and the manual glass/gradient sampling.
