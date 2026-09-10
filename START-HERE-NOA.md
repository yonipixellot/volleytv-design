# Volley TV — start here (handoff for Noa, 2026-09-09)

This is the **Volley TV** click-dummy: the Halo OTT app re-skinned and re-written as a
volleyball-native sales prototype. Angular 21 + Storybook, one tenant, English only.
It is a fork of the Hoops TV prototype; nothing here touches Hoops TV.

State: last commit `e4331a5` (attack path chart, latest-set default). No git history is
included — run `git init && git add -A && git commit -m "Volley TV handoff"` to start yours.

## Run it

```bash
# needs bun (https://bun.sh) and Node 22 (see .nvmrc)
bun install --frozen-lockfile
bun start                 # http://localhost:4200
bun run storybook         # http://localhost:6006  (the design system)
bun run build             # prod build → apps/halo-angular/dist/halo-web/browser
bun run lint:spacing      # spacing contract — keep at "violations: 0"
```

Sign-in accepts any email + password (prototype). The **✦ dev bar** (bottom-right) switches
tier (free / basic / premium), persona and screen states, and lists every change ("✦ New").

## Working in Claude Code

Open this folder and run `claude`. Useful first prompts:
- "Read apps/halo-angular/HANDOFF.md and README.md, then summarise the working rules."
- "Start the preview with the `halo-angular` launch config and open /you" — `.claude/launch.json`
  is already set up for Claude's browser pane.

House rules the code enforces or expects (details in `apps/halo-angular/HANDOFF.md`):
1. **Copy lives in `src/app/i18n/en.ts`** — never hard-code strings in templates.
2. **Spacing lint:** off-grid px values need a reason comment within 6 lines above; font sizes
   must use a `--fs-*` token. Run `bun run lint:spacing` before you call something done.
3. **Use the DS atoms/molecules** in `src/lib/` (chip, button, crest, segmented-toggle…) rather
   than hand-rolled equivalents; new UI should feel like a Storybook story.
4. **Every user-facing change gets a "✦ New" entry** in `src/app/dev-bar/dev-bar.ts` with a
   deep link.
5. Brand: coral `#FF6B35` leads dark, deep teal `#0F5C6E` leads light; League Spartan + Inter.
   Skin tokens: `src/styles/_tokens.scss` (`data-skin='volleytv'`). Brand SVGs: `public/img/brand/`.
6. Volleyball model (sets to 25, 5th to 15; points = kills + aces + blocks; positions
   S / OH / MB / OPP / L; attack path chart like Pixellot Advantage) — HANDOFF.md §3.

## Not included / not configured
- No deploy is wired for you: the GitHub Pages workflow in `.github/` only runs on a GitHub remote,
  and the Vercel + Supabase preview gate is dormant until `VERCEL=1` and keys exist
  (`apps/halo-angular/.env.example`, `DEPLOYMENT.md`). Local dev needs none of it.
- Demo footage in `public/media` and the sponsor creatives are licensed client material and ship in git.
- `node_modules`, build output and the previous owner's git history were left out on purpose.
