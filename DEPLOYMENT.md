# Volley TV — Deployment

Two deploy targets, both separate from the Hoops TV (`halo-design`) deploys.

## 1. GitHub Pages (internal, first)

`.github/workflows/pages.yml` builds `apps/halo-angular` with `--base-href="/"` on every
push to `main` and publishes through the `gh-pages` buffer branch (`.github/scripts/pages-buffer.sh`).
`pages-preview.yml` publishes a per-PR preview under `previews/`; `pages-cleanup.yml` removes it.
`404.html` gives SPA deep links.

Private-repo Pages is gated by GitHub's own org login; unauthenticated requests 302 to
`github.com/pages/auth`. The browser caches the HTML for ~10 min after a deploy; hard-refresh.

Setup once the repo exists: Settings → Pages → Source = `gh-pages` branch, root.

## 2. Vercel + Supabase (client-facing, LAST)

Done only after the Pages build is signed off. Steps for the repo owner (no keys go through Claude):

1. Vercel → New Project → import `Pixellot/volleytv-design`, Root Directory `apps/halo-angular`.
   `apps/halo-angular/vercel.json` already sets `bun ci` / `bun run build` / `dist/halo-web/browser`
   and the SPA rewrite.
2. Create a **new** Supabase project (Auth only, no tables). Settings → API → copy URL + anon key.
3. Vercel → Project → Settings → Environment Variables:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Supabase → Authentication → Users → Add user (Auto Confirm User on) for each client viewer.
   There is no self-serve sign-up: knowing the URL never gets anyone in.
5. Redeploy. The gate (`src/preview-gate/`) arms only when `VERCEL=1` and fails closed if the
   vars are missing, so local and Pages builds are never affected.

Verify: the Vercel URL shows the sign-in form, never boots the app without a session, and
Settings › Sign out ends the gate session.
