# CLAUDE.md

Halo — a white-label OTT streaming platform for sports leagues and federations. One
Angular app, re-skinned per tenant. This repo is the **Volley TV** tenant: a volleyball-native
(indoor 6v6) sales click-dummy, forked from the Hoops TV basketball build (`Pixellot/halo-design`,
tag `fork/hoopstv-2026-09-08`). See `README.md` for the fork contract and `apps/halo-angular/HANDOFF.md`.

## Where the truth lives

Read these rather than inferring from code; they exist because the code alone was misleading.

| File | What it settles |
| --- | --- |
| `DESIGN.md` | The visual system: colors, type, spacing, elevation, shapes, components. Normative. |
| `PRODUCT.md` | Users, personas, tiers, product rules, what is mocked vs real. |
| `apps/halo-angular/A11Y-AUDIT.md` | The accessibility baseline (WCAG 2.1 AA, 0 violations). Preserve it; don't redo it. |
| Storybook → `Tokens/Spacing · Rules` | The spacing contract as a working page, with do/don't. |
| Storybook → `Tokens/Typography · Rules` | The type scale, the two font traps, and why a literal size breaks a11y. |

## Commands

Run from the repo root (bun workspace):

```bash
bun start                 # dev server (Angular, port 4200)
bun run build
bun run test
bun run storybook
bun run lint:spacing      # spacing contract; also runs in CI on every PR
```

**There are two lockfiles and both are load-bearing.** `bun.lock` at the root is
what installs; `apps/halo-angular/package-lock.json` is what Dependabot scans (it
does not read `bun.lock` — the same vulnerable versions sit in both, and every
alert cites the npm file). They must not drift, or the alerts stop describing what
is installed. After changing a dependency, regenerate the npm one **minimally**:

```bash
npm install --package-lock-only --ignore-scripts   # run in a copy without node_modules
```

Two cautions, both learned the hard way. Run it where bun's `node_modules` is not,
or npm's tree reconciliation crashes. And never delete the file first: regenerating
from scratch re-resolves every range and moved 161 packages, including all of
Angular, which is a dependency bump wearing a security fix's clothes.

A dependency `overrides` entry has to be written **twice** for the same reason:
bun reads it from the workspace root `package.json`, npm from the app's.

Never start a dev server with a bare `ng serve` in the background; use the harness preview
tooling so the port is managed.

## Layout

```
apps/halo-angular/src/
  app/            pages/ (14 page folders, 40 routes) + the state services below
  lib/atoms/      13 · molecules/ 15 · organisms/ 27   (one folder per component)
  lib/foundations/  Storybook token galleries + the spacing rules page
  lib/brand/      tenant lockups and presets
  styles/_tokens.scss        every CSS custom property
  styles/tokens/design-tokens.json   the platform-neutral mirror — keep in sync
```

Component convention: `name/name.ts` + `name/name.scss` + `name/name.stories.ts`. Some
components keep styles inline in the `styles:` array instead of a `.scss` file — both are
normal, and the spacing linter reads both.

## Rules that are easy to break

These are the ones that have actually gone wrong here, not generic advice.

**Spacing is tokenized. A raw px padding, margin or gap is a defect.** Reach for the role
token (`--pad-x`, `--pad-card`, `--gap-tight`, `--pad-control-x`…), then a ladder step
(`--space-N`, where N × 4 = px, up to `--space-12`). Page-level rhythm comes from the
`.halo-page` / `.halo-stack` / `.halo-rail` / `.halo-nav-dock` utilities — apply the class,
don't re-derive the gap. `bun run lint:spacing` enforces this.

**A page-level block contributes nothing at its bottom edge.** The gap between two blocks
belongs to the block *below*, once, via `--block-gap` (32px). The only sanctioned bottom edge
is a heading's `--section-bottom` (16px). The linter discovers page blocks from the templates,
so a new one is covered automatically — and `tools/spacing-baseline.json` lists the pages
still awaiting this normalization.

**Two ends leave the grid, and both must state a reason in a comment:** sub-4px optical
corrections (hairlines, cap-height compensation) and values above 48px (layout dimensions,
not rhythm). A value without a stated reason is a defect. `tools/spacing-baseline.json`
holds 86 pre-existing sub-grid values as recorded debt — it may shrink, never grow.

**Font size is tokenized, and a literal is a real defect.** `--fs-caption` 12 · `--fs-body` 14
· `--fs-body-lg` 16 · `--fs-title` 18 · `--fs-heading` 20, plus `--fs-d-*` for display. The
accessibility text control re-derives the whole scale, so a hardcoded size is the one value
it cannot reach — the text around it grows and that label does not.

**The type scale and the radius scale are deliberately NOT on the 4px grid.** `--fs-*` is a
ratio scale; `--r-field` (15px) and `--r-card-sm` (18px) are shape language. Do not "fix"
them to multiples of 4. Inventing a sixth radius is the defect.

**There is no Halo palette.** Two knobs per tenant (`--primary`, `--secondary`) produce
`--accent`, and which knob leads can flip per theme. Components read `--accent` and the role
tokens; a tenant hex in component CSS is always wrong. Coral and deep teal belong to Volley TV,
not to the system.

**Premium gold and the OS-style system green are fixed** across every tenant and theme.
They are platform language, not brand.

**`--pad-section` no longer exists.** One inset governs the screen: `--pad-x`. If you see it
referenced in an old branch or snippet, that is the thing that put every section header 4px
off the cards it introduced.

**Four layout bands, hardcoded** (custom properties can't be read inside a media-query
condition, so `--bp-*` is reference only): below 768 the centred 430px phone frame with
scrolling rails and the dock; 768–1023 full width, 2-column rails, dock kept; 1024–1279 nav
moves into the header, 3 columns; 1280+ 4 columns. A page without its own wide layout caps at
a readable 720px column rather than stretching.

**`.dhome` marks the Home ROUTE, not a width** (`app.ts`, `isDesktopHomeRoute`); the media
query supplies the width. It also opts a page out of the 720px cap, so it now means "this
route owns its wide layout". Games and You still render the mobile layout inside that cap.
Don't assume a wide pass exists for a page just because a component has one.

**Two navigation models, never both at once.** Below 1280px the floating dock; at 1280px and
above the inline header nav, text-only, with no Home tab (the wordmark is the way back).

**Persona and tier are orthogonal, and the UI reads only derived capabilities.** Use
`ViewContext.caps()` (`app/view-context.ts`), never `if persona === …`. Tier gating for
personal highlights lives in `app/clip-access.ts` and nowhere else.

**Official brand assets are used verbatim.** Tenant lockups are treated as style-guide SVGs —
never recolored, re-proportioned, or filtered (Volley TV's are placeholders drawn to that rule). Region crest art is themeable
through tokens; the two asset classes are not interchangeable.

**All game, stats and fixture content is mocked** (`app/events-data.ts` and friends). Never
present it as real usage, viewership, or testimonial data.

**Every new surface is responsive from the start.** Design and verify at every band before
shipping — 375, 768, 1024, 1280, 1920, in both themes — rather than building at one width and
stretching later. Breakpoints come from the ladder (768 / 1024 / 1280 / 1600 / 2000, plus
360 / 390 / 480 / 520 for sub-phone); inventing a number is a defect the linter catches. If a
band has no answer yet, leave the page without a wide layout so it takes the 720px cap — an
honest fallback beats a layout that only works where it was built.

## Languages (i18n)

The app ships in English, Hebrew and Japanese; the user switches in Settings › Language
(persist + reload) and any URL takes `?lang=en|he|ja`. Everything lives in
`apps/halo-angular/src/app/i18n/`.

**Every user-facing string goes through the dictionary.** `{{ 'area.key' | t }}` in
templates (import `TPipe`), `t('area.key', { n })` in TypeScript, `plural(n, 'x.one',
'x.many')` for counts. Add the key to `en.ts` first: `he.ts` and `ja.ts` are typed against
it, so a missing translation is a compile error, not a silent English fallback. A literal
string in a template or a `label:`/`title:` field is a defect.

**Proper nouns stay Latin** (teams, clubs, venues, people, "Volley TV", "Halo"). Everything
descriptive is translated, competition descriptors and seed content included.

**Dates, times, numbers come from `Intl`** via the helpers in `i18n.ts` (`fmtDate`,
`fmtTime`, `fmtShortDay`, `WEEKDAYS`, `MONTH_ABBR`, `regionName`). English keeps its
hand-written short tables because en-AU's own short month is "Sept".

**RTL is logical properties, not a second stylesheet.** Write `margin-inline-start`,
`inset-inline-end`, `text-align: start`; a physical `left`/`right` is only right for
things that must not mirror (charts, the video scrubber, the segmented toggle's thumb).
Chevrons and arrows mirror globally in `styles.scss`; `.num` keeps scores and clocks LTR.

**Fonts swap per script** (`_tokens.scss`, `:root:lang(he|ja)`): League Spartan and Inter
have no Hebrew or kana glyphs, so those languages load Noto at boot and fall back to the
OS face. Do not put Hebrew or Japanese text in the display font.

**Logic that keys off English copy must go through `englishOf()`** (clip gating in
`clip-access.ts` classifies plays by their English title). Never compare translated strings.

## UI copy

Product text avoids the em dash — it reads as an AI tell to this team. Use a period, a comma,
or a colon instead. This applies to user-facing strings, not to code comments or these docs.

Controls name their action; errors name the problem and the recovery.

## Verifying UI changes

Check the change in the browser rather than asking someone else to. Both themes
(`data-theme="dark|light"`) and both widths (375px and ≥1280px) — the theme and the
breakpoint are where this codebase regresses. Angular applies signal-driven classes on the
next change-detection tick, so measure after it settles, not synchronously after a resize.
