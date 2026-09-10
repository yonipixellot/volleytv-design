# Volley TV (halo-angular fork) — Session Handoff

> Read this first when resuming work on **volleytv-design**. Last updated: 2026-09-08.

## 0. What this is

- A volleyball-native click-dummy of the Halo OTT app for sales & marketing (indoor 6v6, club/school/college).
- Forked from `Pixellot/halo-design` `main` @ `329e987` (Hoops TV basketball tenant), tag `fork/hoopstv-2026-09-08`.
- Depth of the fork: terminology + seed data + assets + brand skin. Layouts, screens and the design system are unchanged.
- English only. Tenant brand: **Volley TV**, skin `volleytv` (coral `#FF6B35` leads dark, deep teal `#0F5C6E` leads light).

## 1. Folders & repos

| | Path | Git |
|---|---|---|
| This build | `~/Desktop/volleytv-design` (bun workspace, app in `apps/halo-angular`) | `origin` = `yonipixellot/volleytv-design` (public, Pages at https://yonipixellot.github.io/volleytv-design/); `upstream` = `Pixellot/halo-design`, fetch-only |
| Hoops TV (do not touch) | `~/Desktop/halo-design` | `Pixellot/halo-design` `main` |
| Workspace / planning | `~/Documents/Claude/ott-halo-master` | ledger `Outputs/Design Audits/audit-2026-09-08_volleytv-fork.md`, plan `Outputs/Planning/volley-tv/` |

Every shell command: `cd ~/Desktop/volleytv-design && …` or `git -C ~/Desktop/volleytv-design …` (the harness resets cwd between calls).

## 2. Working method

- The fork is tracked gap-by-gap in the ledger above (G0–G10). Tick on disk, commit per gap, never reprint the list in chat.
- Commit at checkpoints; **never push** unless Yoni asks.
- Decisions via the AskUserQuestion module; product calls that need Yuval go to `Outputs/Planning/volley-tv/flags-for-yuval.md`.
- Self-review UI before presenting (DOM measurement first, screenshots only for final proof).
- Never loop: two failures of the same approach → stop and report.

## 3. Volleyball model (do not re-derive)

- `stats-data.ts` `GAME_STATS = ['PTS','K','ACE','BLK','DIG','AST']`; points = kills + aces + blocks.
- Scores are **sets won** (2–1); status label "Set N · a–b". `live-game-card` has no clock by design.
- Positions: setter / outside hitter / middle blocker / opposite / libero.
- Tier gate (`clip-access.ts`): premium = all; basic = kills, set assists, aces watchable, **digs and blocks locked**; free = all own clips locked. Covered by `clip-access.spec.ts`.
- `shot-map` = attack map (opponent 9×9 m half-court, zones 1–6, kills vs errors).
- Regions: 6 generic regional leagues replace the 8 Australian state federations; the Watch wordmark is still the region switcher (intentional).
- Fonts stay League Spartan / Inter.

## 3b. Status (2026-09-08, end of first session)

- Ledger G0–G8 done and committed locally on `main` (skin, brand, stats, clip gate + spec, en-only copy, clubs/regions, attack map, imagery, Storybook fixtures, score grammar).
- Verified: `bun run build` green, `bun run build-storybook` green, `lint:spacing` green, clip-access spec 5/5 (Karma), DOM checks of Home / Game / You / Highlight / sign-in / splash, tokens read back in both themes.
- NOT done: GitHub repo creation + first push (Yoni: "not yet"), Pages enablement, the Vercel + Supabase phase, a rendered axe pass across routes (`tools/app-audit.js`), a real light-theme visual review (Browser pane was hidden after the Home shot).
- Dev server for this repo: launch.json entry `volleytv` (port 4200) in the ott-halo-master workspace.

## 4. Deploys

See `DEPLOYMENT.md` at the repo root. GitHub Pages first; Vercel + a **separate** Supabase Auth project last.

## 5. Traps carried over from Hoops TV

- `_tokens.scss`: a scripted `// …` comment inserted into a one-line rule swallows the closing brace; use `/* */`.
- `tools/spacing-baseline.json` keys are `path|property|value`; moving or renaming a file invalidates its entries.
- `A11Y-AUDIT.md` contrast numbers are per-skin; re-measure after changing tokens.
- Angular `<select>` needs `[selected]` on options to reflect a bound value.
- Change detection is async: after a `.click()` via javascript_tool, query the DOM in a separate call.
