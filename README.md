# volleytv-design

**Volley TV** — a volleyball-native click-dummy of the Halo OTT platform, for sales and
marketing demos to clubs, schools and colleges (indoor 6v6).

This repo is a **fork of `Pixellot/halo-design`** (the Hoops TV basketball tenant) taken at
`main` @ `329e987` on 2026-09-08, tag `fork/hoopstv-2026-09-08`. The two repos are kept
**completely separate**: different repo, different deploys, different preview gate. Nothing
here flows back to Hoops TV, and Hoops TV never deploys from here.

The app folder stays `apps/halo-angular` and the Angular project stays `halo-web` on
purpose: Halo is the platform, Volley TV is the tenant. Renaming would break the spacing
lint baseline paths, the workflow `paths:` filters and every cherry-pick from upstream.

## Commands

```bash
bun install --frozen-lockfile
bun start                 # dev server on http://localhost:4200
bun run build             # prod build → apps/halo-angular/dist/halo-web/browser
bun run storybook         # design system on http://localhost:6006
bun run lint:spacing      # spacing contract (runs in CI)
bun run test
```

## Deploys

| Target | URL | Gate | Status |
|---|---|---|---|
| GitHub Pages (`pages.yml`, push to `main`) | https://yonipixellot.github.io/volleytv-design/ | none (public repo) | live since 2026-09-10 |
| Vercel (client-facing) | `[NEED: create Vercel project]` | Supabase Auth, own project, admin-provisioned viewers | last phase, see `DEPLOYMENT.md` |

## Pulling a design-system fix from Hoops TV

`upstream` = `Pixellot/halo-design`, fetch-only (push URL is disabled).

```bash
git fetch upstream main
git log --oneline fork/hoopstv-2026-09-08..upstream/main -- apps/halo-angular/src/lib
git cherry-pick <sha>          # DS-layer commits only; app/ copy and data are volleyball here
```

Cherry-pick components, tokens, foundations, Storybook. Never cherry-pick `src/app/i18n`,
seed data, `tenant.ts` or brand presets — those are what makes this repo Volley TV.

## Where the truth lives

- `CLAUDE.md` — working rules for the codebase.
- `DESIGN.md`, `PRODUCT.md` — the visual system and the product model.
- `apps/halo-angular/HANDOFF.md` — how to resume work on this repo.
- `apps/halo-angular/A11Y-AUDIT.md` — accessibility baseline (re-measured for the Volley TV skin).
- Planning in the `ott-halo-master` workspace: `Outputs/Planning/volley-tv/`, ledger
  `Outputs/Design Audits/audit-2026-09-08_volleytv-fork.md`.
