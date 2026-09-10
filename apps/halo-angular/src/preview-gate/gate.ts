/* Access-control gate for the Vercel-only preview deploy — NOT part of the
   Halo product. Port of apps/design-preview/src/app/_AuthGate.tsx (branch
   design-yoni-vercel) from React to plain DOM.

   Why plain DOM and not an Angular component: the gate runs BEFORE
   bootstrapApplication(), so no protected screen is ever constructed or
   rendered while the session check is in flight. It also keeps the diff
   against Yoni's standalone repo down to main.ts plus this folder — relevant
   because that repo is rsync'd over apps/halo-angular/ on every deploy
   (see HANDOFF.md §3).

   Accounts are provisioned by an admin in the Supabase dashboard
   (Authentication → Users → Add user, "Auto Confirm User" on). There is no
   self-serve sign-up on purpose, so knowing the URL alone never gets anyone in.

   This is a CLIENT-SIDE gate: the bundle still ships the compiled JS for
   every screen, so it stops casual browsing of the link, not a determined
   person digging through devtools. Same trade-off the Next.js gate made. */
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, requireAuth, supabaseAnonKey, supabaseUrl } from './env';

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";

/* Imported dynamically, for two reasons: the supabase-js bundle is ~150kB and
   this gate is deploy scaffolding rather than product code, so it must not eat
   into the app's initial-bundle budget (angular.json); and the module is never
   fetched at all on an unconfigured build, which is the GitHub Pages case.

   Placeholder fallbacks so createClient() never throws on a build that ran
   before the env vars were set. Callers check isSupabaseConfigured first. */
/* The signed-in client, kept so the app's own Sign out (Settings › Sign out)
   can end the gate session too. The floating "Sign out" pill that used to do
   this was removed (Yoni 2026-09-07): it was deploy scaffolding painted over
   the product, sat on top of the video controls, and users sign out from the
   menu like anywhere else. */
let gateClient: SupabaseClient | null = null;

/** End the preview-gate session, if there is one. Resolves immediately when the
 *  gate is disabled (GitHub Pages, local dev). On Vercel the SIGNED_OUT listener
 *  below reloads to the sign-in form. */
export async function previewSignOut(): Promise<void> {
  if (!gateClient) return;
  try { await gateClient.auth.signOut(); } catch { /* already gone */ }
}

async function makeClient(): Promise<SupabaseClient> {
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key',
  );
}

function fullScreen(): HTMLDivElement {
  const el = document.createElement('div');
  Object.assign(el.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '2147483647',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#000',
    padding: '24px',
    fontFamily: FONT,
    boxSizing: 'border-box',
  } satisfies Partial<CSSStyleDeclaration>);
  return el;
}

function styleInput(el: HTMLInputElement): void {
  Object.assign(el.style, {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: FONT,
  } satisfies Partial<CSSStyleDeclaration>);
}

function notConfiguredScreen(): void {
  const host = fullScreen();
  host.style.color = 'rgba(255,255,255,0.7)';
  host.style.textAlign = 'center';
  host.style.fontSize = '14px';
  host.textContent =
    "Auth isn't configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
    'NEXT_PUBLIC_SUPABASE_ANON_KEY in this project’s environment variables.';
  document.body.appendChild(host);
}

/* Resolves only once the visitor has signed in successfully. */
function signInScreen(supabase: SupabaseClient): Promise<void> {
  return new Promise((resolve) => {
    const host = fullScreen();

    const form = document.createElement('form');
    Object.assign(form.style, {
      width: '100%',
      maxWidth: '340px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '28px',
      borderRadius: '18px',
      background: 'rgba(28,30,40,0.55)',
      border: '1px solid rgba(255,255,255,0.10)',
      backdropFilter: 'blur(24px)',
      boxSizing: 'border-box',
    } satisfies Partial<CSSStyleDeclaration>);
    /* Safari still needs the prefix, and it has no typed CSSStyleDeclaration
       property, so it goes through setProperty rather than Object.assign. */
    form.style.setProperty('-webkit-backdrop-filter', 'blur(24px)');

    const heading = document.createElement('div');
    const title = document.createElement('div');
    Object.assign(title.style, { color: '#fff', fontSize: '18px', fontWeight: '700' });
    title.textContent = 'Halo Design Preview';
    const sub = document.createElement('div');
    Object.assign(sub.style, {
      color: 'rgba(255,255,255,0.55)',
      fontSize: '13px',
      marginTop: '4px',
    });
    sub.textContent = 'Sign in with the account you were given.';
    heading.append(title, sub);

    const email = document.createElement('input');
    email.type = 'email';
    email.required = true;
    email.autofocus = true;
    email.placeholder = 'Email';
    email.autocomplete = 'username';
    styleInput(email);

    const password = document.createElement('input');
    password.type = 'password';
    password.required = true;
    password.placeholder = 'Password';
    password.autocomplete = 'current-password';
    styleInput(password);

    const error = document.createElement('div');
    Object.assign(error.style, { color: '#ff6b6b', fontSize: '13px', display: 'none' });

    const submit = document.createElement('button');
    submit.type = 'submit';
    Object.assign(submit.style, {
      padding: '12px 24px',
      borderRadius: '9999px',
      border: 'none',
      background: '#fff',
      color: '#000',
      fontSize: '14px',
      fontWeight: '700',
      cursor: 'pointer',
      fontFamily: FONT,
    } satisfies Partial<CSSStyleDeclaration>);
    submit.textContent = 'Sign in';

    form.append(heading, email, password, error, submit);
    host.appendChild(form);
    document.body.appendChild(host);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      error.style.display = 'none';
      submit.disabled = true;
      submit.textContent = 'Signing in…';
      submit.style.opacity = '0.6';
      submit.style.cursor = 'default';

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      });

      if (!signInError) {
        host.remove();
        resolve();
        return;
      }

      submit.disabled = false;
      submit.textContent = 'Sign in';
      submit.style.opacity = '1';
      submit.style.cursor = 'pointer';
      error.textContent =
        signInError.message === 'Invalid login credentials'
          ? 'Wrong email or password.'
          : signInError.message;
      error.style.display = 'block';
    });
  });
}


/* Resolves when the visitor is allowed through; never resolves otherwise, so
   the caller simply awaits it before bootstrapping Angular.

   Returns false when auth is unconfigured, letting the caller skip bootstrap
   entirely (the "not configured" screen is already on-screen by then). */
export async function requirePreviewAuth(): Promise<boolean> {
  /* Not a Vercel build — the gate is off and the app boots normally. This is
     the GitHub Pages path: that site is private-repo Pages, already behind
     GitHub's org login, and has no Supabase credentials. Arming the gate there
     would break Yoni's Pages deploy for no security gain. Also the local
     `npm start` / `ng serve` path. */
  if (!requireAuth) return true;

  /* Vercel build with no credentials: fail CLOSED. The design is publicly
     reachable here, so refusing to boot is the safe outcome — never publish
     it because an env var was missing or misspelled. */
  if (!isSupabaseConfigured) {
    notConfiguredScreen();
    return false;
  }

  const supabase = await makeClient();
  gateClient = supabase;
  const { data } = await supabase.auth.getSession();
  let session: Session | null = data.session;

  if (!session) {
    await signInScreen(supabase);
    session = (await supabase.auth.getSession()).data.session;
  }

  /* A sign-out from another tab, or an expired refresh token, should drop this
     tab back to the sign-in form rather than leaving a dead session on screen. */
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') location.reload();
  });

  return true;
}
