import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { requirePreviewAuth } from './preview-gate/gate';
import { applyDocumentLang } from './app/i18n/i18n';

/* Static hosts (GitHub Pages) have no SPA rewrite: a deep link like /you 404s,
   and 404.html at the site root bounces it to /?p=%2Fyou. Put the route back
   before the router boots, so a shared link opens the screen it names, exactly
   as the dev server does. No-op when there is no `p`. */
(() => {
  const here = new URL(location.href);
  const p = here.searchParams.get('p');
  if (!p) return;
  const base = (document.querySelector('base')?.getAttribute('href') ?? '/').replace(/\/$/, '');
  const wanted = new URL(p, location.origin); // p carries its own ?search#hash
  history.replaceState(null, '', base + wanted.pathname + wanted.search + wanted.hash);
})();

// Language before anything paints: <html lang dir> + the script's web font.
applyDocumentLang();

/* The preview-deploy access gate runs BEFORE bootstrap so no protected screen
   is ever rendered for a signed-out visitor. It resolves immediately when the
   gate is disabled (no Supabase env vars → "not configured" screen, returns
   false) or when a session already exists; otherwise it waits on the sign-in
   form. See src/preview-gate/gate.ts — this is deploy scaffolding, not part
   of the Halo product. */
requirePreviewAuth()
  .then((allowed) => {
    if (!allowed) return undefined;
    return bootstrapApplication(App, appConfig);
  })
  .catch((err) => console.error(err));
