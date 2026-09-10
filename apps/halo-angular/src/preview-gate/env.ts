/* Access-control config for the Vercel-only preview deploy of halo-angular —
   NOT part of the Halo product. Ported from the Next.js design-preview app
   (apps/design-preview/src/lib/supabase.ts on branch design-yoni-vercel),
   which used NEXT_PUBLIC_* vars inlined by Next at build time.

   Angular has no equivalent of Next's NEXT_PUBLIC_* inlining, so the values
   are written into env.generated.ts by tools/gen-preview-env.mjs, which runs
   from the `prebuild` npm script (i.e. on every `npm run build`, including
   Vercel's). The generator reads NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY first
   so the env vars already set on the Vercel project keep working unchanged,
   and falls back to the unprefixed names.

   The anon key is meant to be exposed client-side; this deploy uses Supabase
   purely for Auth (no database tables), so there is nothing an anon key + RLS
   would need to protect. */
import { REQUIRE_AUTH, SUPABASE_ANON_KEY, SUPABASE_URL } from './env.generated';

export const supabaseUrl = SUPABASE_URL;
export const supabaseAnonKey = SUPABASE_ANON_KEY;
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/* True only on Vercel builds — the one deploy target that is publicly
   reachable. GitHub Pages is private-repo Pages behind GitHub's own org
   login, so the gate stays off there and the app boots normally. */
export const requireAuth = REQUIRE_AUTH;
