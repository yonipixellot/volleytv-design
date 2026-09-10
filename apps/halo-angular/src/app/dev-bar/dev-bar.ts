import { Component, DestroyRef, ElementRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PERSONAS, TIERS, PersonaKey, Tier, ViewContext } from '../view-context';
import { TenantConfig } from '../tenant';
import { HaloIcon } from '../../lib/atoms/icon/icon';

/**
 * Master switch for internal preview tooling (the dev bar). Set to `false` — or
 * bind to an Angular environment flag — for any client-facing build so the tool
 * is never shipped. App root renders the dev bar only when this is true.
 */
export const DEV_TOOLS_ENABLED = true;

interface Change {
  title: string; note: string; route: string[]; query?: Record<string, string>;
  /** Persona to switch INTO before navigating, so the change is actually
      visible where you land. Defaults to 'adult' (athlete) when omitted. */
  persona?: PersonaKey;
  /** Tier to switch into. Defaults to 'premium' (content unlocked) when omitted. */
  tier?: Tier;
}

/**
 * ⚠️ INTERNAL TOOLING — NOT PART OF THE DESIGN SYSTEM.
 * Deliberately lives in `src/app/` (never `src/lib/`), has NO Storybook story,
 * and is NOT a reusable atom/molecule/organism.
 *
 * Gated behind {@link DEV_TOOLS_ENABLED} so client/production builds drop it.
 * Flips persona + tier with no reload, and carries the "✦ New" changelog so
 * reviewers can jump straight to each change (wireframe-PT WhatsNewPanel parity).
 */
@Component({
  selector: 'app-dev-bar',
  standalone: true,
  imports: [HaloIcon],
  template: `
    <div class="devbar" role="region" aria-label="Preview controls">
      <span class="tag">DEV</span>

      <label class="ctl">
        <span class="k">Persona</span>
        <select [value]="vc.persona()" (change)="onPersona($event)" aria-label="Preview persona">
          @for (p of personas; track p.key) {
            <option [value]="p.key" [selected]="p.key === vc.persona()">{{ p.emoji }} {{ p.label }}</option>
          }
        </select>
      </label>

      <label class="ctl">
        <span class="k">Tier</span>
        <select [value]="vc.tier()" (change)="onTier($event)" aria-label="Entitlement tier">
          @for (t of tiers; track t.key) {
            <option [value]="t.key" [selected]="t.key === vc.tier()">{{ t.label }}</option>
          }
        </select>
      </label>


      <button class="new-btn" type="button" [class.on]="panelOpen()"
        [attr.aria-expanded]="panelOpen()" (click)="panelOpen.set(!panelOpen())">
        <span class="spark" aria-hidden="true">✦</span> New
        <span class="cnt">{{ changes.length }}</span>
      </button>

      <!-- Force the brand controls onto their own line: a zero-height, full-width
           flex item makes the wrap deterministic instead of depending on how many
           of the row-1 controls happen to fit (Yoni 2026-09-03). -->
      <span class="rowbreak" aria-hidden="true"></span>

      <!-- Live re-skin: the two brand knobs + a logo upload, the DEV-bar mirror
           of what the client sets in the admin app. Colours inject inline on the
           .halo root (see TenantConfig.*Var); the logo becomes a data: URL that
           replaces every brand mark. -->
      <span class="ctl brand" role="group" aria-label="Brand">
        <span class="k">Brand</span>
        <label class="sw" [style.background]="primaryHex()" title="Primary colour">
          <input type="color" [value]="primaryHex()" (input)="onPrimary($event)"
            aria-label="Primary brand colour" />
        </label>
        <label class="sw" [style.background]="secondaryHex()" title="Secondary colour">
          <input type="color" [value]="secondaryHex()" (input)="onSecondary($event)"
            aria-label="Secondary brand colour" />
        </label>
        <button class="mini" type="button" (click)="logoInput.click()"
          [class.on]="!!tenant.ovLogo()" title="Upload client logo">Logo</button>
        <input #logoInput type="file" accept="image/*" hidden (change)="onLogo($event)"
          aria-label="Upload client logo" />
        @if (tenant.hasBrandingOverride()) {
          <button class="mini reset" type="button" (click)="resetBrand()"
            aria-label="Reset brand to default" title="Reset brand">⟲</button>
        }
      </span>

      <!-- Print screen: render the current app view at a phone and a desktop
           frame and save both as PNGs. Renders at each width so the real mobile
           and desktop layouts trigger, not a squashed crop (Yoni 2026-09-03).
           Sits on the brand row, at the end. -->
      <select class="shotsel" [value]="shotMode()" (change)="onShotMode($event)"
        [disabled]="capturing()" aria-label="Which frames to capture"
        title="A desktop shot is rendered off-screen — no need to switch to desktop view">
        <option value="both">Both</option>
        <option value="mobile">Phone</option>
        <option value="desktop">Desktop</option>
      </select>
      <button class="mini shot" type="button" (click)="capture()" [disabled]="capturing()"
        [attr.aria-busy]="capturing()" title="Save a PNG of this screen at the selected frame(s)">
        <halo-icon name="download" [size]="13" />
        {{ capturing() ? shotMsg() : 'Shots' }}
      </button>
    </div>

    @if (panelOpen()) {
      <button class="wn-scrim" type="button" aria-label="Close what's new" (click)="panelOpen.set(false)"></button>
      <div class="wn" role="dialog" aria-label="What's new">
        <div class="wn-head">
          <span class="wn-t"><span class="spark" aria-hidden="true">✦</span> What's new · 8 Sep</span>
          <span class="wn-act">
            <!-- Every row here sets query params AND a persona/tier, and none of
                 that is visible in the UI afterwards — so without this the only
                 way back to a normal page was hand-editing the address bar
                 (Maryna 2026-08-30). -->
            <button class="wn-reset" type="button" (click)="resetView()">Reset view</button>
            <button class="wn-x" type="button" aria-label="Close" (click)="panelOpen.set(false)">✕</button>
          </span>
        </div>
        <div class="wn-list">
          @for (c of changes; track c.title; let i = $index) {
            <button class="wn-row" type="button" (click)="go(c)">
              <span class="wn-n">{{ changes.length - i }}</span>
              <span class="wn-tx">
                <span class="wn-rt">{{ c.title }}</span>
                <span class="wn-rn">{{ c.note }}</span>
              </span>
              <span class="wn-go" aria-hidden="true">→</span>
            </button>
          }
        </div>
      </div>
    }
  `,
  styleUrl: './dev-bar.scss',
})
export class DevBar {
  protected vc = inject(ViewContext);
  protected tenant = inject(TenantConfig);
  private router = inject(Router, { optional: true });

  /** The colour pickers' shown values. Seeded from the live skin so they open
   *  on the current brand rather than black, then track what the reviewer picks. */
  protected primaryHex = signal('#0f5c6e');
  protected secondaryHex = signal('#ff6b35');
  /** The skin's own colours, captured while no override is in effect, so reset
   *  restores the pickers without re-reading a value change detection may not
   *  have flushed yet. */
  private skinPrimary = '#0f5c6e';
  private skinSecondary = '#ff6b35';

  /** Publishes the bar's own height as --devbar-h for the whole document.
   *  Measured rather than declared because the bar WRAPS: one row on a desktop,
   *  three on a phone. A page that pins something to the top of the page area
   *  reads this so it lands under the bar, not behind it. */
  constructor() {
    const el = inject(ElementRef).nativeElement as HTMLElement;
    const root = document.documentElement;
    const publish = () =>
      root.style.setProperty('--devbar-h', `${Math.round(el.getBoundingClientRect().height)}px`);

    // Three triggers, because one is not enough here. ResizeObserver is the
    // right tool for the bar wrapping to two and three rows, but its callbacks
    // are delivered by the RENDERING loop, which a backgrounded or hidden tab
    // does not run: measured, the bar grew 45 → 110px on a phone width and the
    // variable stayed at 45. The timeout covers first paint and the resize
    // listener covers viewport changes, and neither depends on that loop.
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    const first = setTimeout(publish);
    window.addEventListener('resize', publish);

    inject(DestroyRef).onDestroy(() => {
      ro.disconnect();
      clearTimeout(first);
      window.removeEventListener('resize', publish);
      root.style.removeProperty('--devbar-h');
    });

    // Seed the colour pickers from the live skin (deferred one tick so the
    // `.halo` root has resolved its custom properties). Falls back to the
    // Volley TV defaults the signals already hold if the read comes back empty.
    setTimeout(() => this.seedPickersFromSkin());
  }

  private seedPickersFromSkin(): void {
    const host = document.querySelector('.halo') as HTMLElement | null;
    if (!host) return;
    // Only trust the read when no override is active — otherwise it returns the
    // override, not the skin's own colour.
    if (this.tenant.ovPrimary() || this.tenant.ovSecondary()) return;
    const cs = getComputedStyle(host);
    const p = normHex(cs.getPropertyValue('--primary'));
    const s = normHex(cs.getPropertyValue('--secondary'));
    if (p) { this.skinPrimary = p; this.primaryHex.set(p); }
    if (s) { this.skinSecondary = s; this.secondaryHex.set(s); }
  }
  protected personas = PERSONAS;
  protected tiers = TIERS;
  protected panelOpen = signal(false);

  protected onPersona(e: Event): void {
    this.vc.setPersona((e.target as HTMLSelectElement).value as PersonaKey);
  }
  protected onTier(e: Event): void {
    this.vc.setTier((e.target as HTMLSelectElement).value as Tier);
  }

  protected onPrimary(e: Event): void {
    const v = (e.target as HTMLInputElement).value;
    this.primaryHex.set(v);
    this.tenant.setPrimary(v);
  }
  protected onSecondary(e: Event): void {
    const v = (e.target as HTMLInputElement).value;
    this.secondaryHex.set(v);
    this.tenant.setSecondary(v);
  }
  /** Read the picked file as a data: URL so the logo survives with no upload
   *  endpoint — this is a preview tool, not a real asset pipeline. */
  protected onLogo(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.tenant.setLogo(reader.result as string);
    reader.readAsDataURL(file);
    input.value = ''; // let the same file be re-picked after a reset
  }
  protected resetBrand(): void {
    this.tenant.resetBranding();
    // Restore the pickers from the captured skin colours rather than re-reading
    // the DOM, which change detection may not have cleared yet.
    this.primaryHex.set(this.skinPrimary);
    this.secondaryHex.set(this.skinSecondary);
  }

  // --- Print screen -------------------------------------------------------
  protected capturing = signal(false);
  protected shotMsg = signal('…');
  /** Which frames "Shots" saves. Every mode captures OFF-SCREEN, so a desktop
   *  shot never requires switching the browser to desktop width. */
  protected shotMode = signal<'both' | 'mobile' | 'desktop'>('both');
  protected onShotMode(e: Event): void {
    this.shotMode.set((e.target as HTMLSelectElement).value as 'both' | 'mobile' | 'desktop');
  }

  /** The two frames to render — a phone screen and a desktop screen. Rendered at
   *  each WIDTH so the app's own media queries pick the mobile vs desktop layout;
   *  the height is the visible screen (a "print screen", not the full scroll). */
  private static readonly FRAMES = [
    { w: 390, h: 844, tag: 'mobile' },
    { w: 1440, h: 900, tag: 'desktop' },
  ] as const;

  /** Capture the current app view at both frames and save each as a PNG.
   *
   *  Why the snapshot-into-an-iframe dance: the app's mobile vs desktop layouts
   *  are driven by @media (min-width) queries, which evaluate against the real
   *  viewport. html2canvas's `windowWidth` does NOT re-run them — it reads the
   *  source's current geometry — so capturing the live 800px page at
   *  windowWidth:1440 just gives the mobile layout in a wide frame. Instead we
   *  clone the live DOM (which already reflects the current persona/tier/brand,
   *  none of which is persisted) into an iframe sized to the target width, let
   *  the browser re-lay-it-out at that width, then rasterise that.
   *
   *  html2canvas-pro (not the 2022 html2canvas) parses the modern colour
   *  functions the tokens use. Its two blind spots are worked around in
   *  renderFrame: SVG <img> are pre-rasterised to PNG, and position:fixed chrome
   *  (the dock) is pinned to absolute coordinates so it is not dropped or cut.
   *  Imported lazily so it stays a separate chunk, out of the main bundle and any
   *  client build where the bar is compiled away. */
  protected async capture(): Promise<void> {
    if (this.capturing()) return;
    this.capturing.set(true);
    try {
      const { default: html2canvas } = await import('html2canvas-pro');
      const slug = (location.pathname.replace(/^\/+|\/+$/g, '') || 'home').replace(/\//g, '-');
      const srcdoc = buildSnapshot();
      const frames = DevBar.FRAMES.filter((f) => this.shotMode() === 'both' || f.tag === this.shotMode());
      for (const f of frames) {
        this.shotMsg.set(f.tag === 'mobile' ? '📱…' : '🖥…');
        const canvas = await renderFrame(html2canvas, srcdoc, f.w, f.h);
        await saveCanvas(canvas, `halo-${slug}-${f.tag}-${f.w}x${f.h}.png`);
        // A short gap so the browser does not fold two rapid downloads into one.
        await new Promise((r) => setTimeout(r, 300));
      }
    } catch (e) {
      // Best-effort tool; a failed capture should not wedge the bar.
      console.error('[dev-bar] capture failed', e);
    } finally {
      this.capturing.set(false);
    }
  }

  /** Back to a normal page: drop the demo query params and put persona and tier
   *  back where they start. Stays on the current ROUTE — you are usually looking
   *  at the right screen and only want the demo state off it. */
  protected resetView(): void {
    this.panelOpen.set(false);
    this.vc.setPersona('adult');
    this.vc.setTier('premium');
    void this.router?.navigate([], { queryParams: {} });
  }

  protected go(c: Change): void {
    this.panelOpen.set(false);
    // Land in the context the change lives in — otherwise you arrive on the
    // page but the feature is hidden by the current persona/tier (Yoni 2026-08-24).
    this.vc.setPersona(c.persona ?? 'adult');
    this.vc.setTier(c.tier ?? 'premium');
    void this.router?.navigate(c.route, c.query ? { queryParams: c.query } : {});
  }

  /** Today's changes, newest first — each deep-links to the surface it changed.
      Some need a persona/tier set first; the note says so.
      RULE (Yoni 2026-08-23): every change we ship gets an entry here. */

  protected changes: Change[] = [
    { title: 'Torres is a player story', note: 'Home: the Torres circle was listed as a team, painted as initials and opened the game recap. Torres is a player video, so the circle is now Jordan Torres, #14 Netsetters 1 (the player you follow in Following), painted like the other people and opening his own vertical reel. He plays clip 9, which left the own reel so no footage repeats across stories, and he joins the Teammates grid and the game roster (Yoni 2026-09-10).', route: ['/home'] },
    { title: 'Game card meta fits one row', note: 'Home and Games: the competition line under a live score wrapped to two rows ("Monday Men Div 1 - 2026 Winter · Open · Set 2"). The competition is now "Monday Men Div 1", like the other two which never carried a season, and the card keeps the line to one row with an ellipsis if a name ever runs long (Yoni 2026-09-10).', route: ['/home'] },
    { title: 'Reel: arrows step one clip, clips open on the rally', note: 'Watch › Highlights · the desktop arrows now move one clip at a time, like the tap zones (the neighbour cards still jump to a whole reel). Every reel clip was re-cut to open on the rally instead of the identical serve walk-up, so switching between moments and teammates reads as different plays. The own reel grew from three to five moments, using the two clips that were unused (Yoni 2026-09-10).', route: ['/watch/highlight'] },
    { title: 'Players keep their close; stories get distinct clips', note: 'The X is back on the live and full-game players at desktop widths (it fades with the controls on live), and the story deck\'s close now sits beside the reel\'s top edge instead of the page corner. Teammate stories play clips 5 to 8, so the first two stories no longer show the same footage.', route: ['/watch/live'] },
    { title: 'Story line and auto-advance', note: 'The reel now runs like an Instagram story: the active segment fills with the clip\'s own playback, the next moment starts when it ends, and the last moment of a reel flows into the next teammate\'s reel instead of closing (back from a first moment rewinds into the previous reel\'s last). One-moment reels drop the "1 / 1" counter but keep the line. Press and hold pauses it (Space on a focused tap zone for keyboard). Locked moments hold still so the ticket can be read; a poster with no footage holds 5 s.', route: ['/watch/highlight'] },
    { title: 'Real footage in both players', note: 'The players now play video instead of holding a poster. Watch › full game / recap / highlights runs real match footage with a working play, mute and seekable scrubber, and the clock reads the file\'s own duration (a 4:00 match no longer says 1:42:10). The vertical reel plays a real clip per moment, muted and looping. Locked moments keep the blurred poster behind the gold ticket, so nothing gated plays. Footage is licensed client material and ships in git so every deploy plays it.', route: ['/watch/vod'], query: { kind: 'highlights' } },
    { title: 'Attack path', note: 'You › Offence: the half-court landing map is now a full-court Attack Path like Pixellot Advantage — every attack an arrow from where it was hit (own half, bottom) to where it landed (opponent half, top), errors end in the net or out, set filter beside the court, zones numbered per side.', route: ['/you'], query: { tab: 'stats' } },
    { title: 'Club crests everywhere', note: 'Every team now carries a proper two-tone crest (typeset monogram, ball motif) instead of a text tile — Home live cards, Games, team fixtures, the SSO team picker and the highlight player. Regions got the same badge system.', route: ['/home'] },
    { title: 'Brand re-cut', note: 'Wordmark is now set in League Spartan (outlined from the app font), the ball is a real volleyball, the lockup, favicon and the Club iD mock screens follow. Header, sign-in, SSO handoff and get-started all read one brand.', route: ['/auth/sign-in'] },
    { title: 'Animated splash', note: 'Card settles, the ball serves in and lands with a squash, the wordmark wipes on, the tagline fades — ~1.3 s, static under reduced motion. Add ?splash=1 to replay on a phone width.', route: ['/auth/sign-in'], query: { splash: '1' } },
    { title: 'Volleyball positions in follow lists', note: 'Teammate and rival rows in onboarding/SSO now read S · OH · MB · OPP · L instead of basketball codes; upsell copy says attack maps.', route: ['/home'] },
    { title: 'Volleyball imagery', note: 'Home hero, posters, clip thumbs, the women\'s-league banner and both ad creatives are volleyball placeholders drawn to the brand (SVG, bundle 16 MB → under 5 MB).', route: ['/home'] },
    { title: 'Regions replace state federations', note: 'Six generic regional leagues (North · South · East · West · Metro · Coastal) with monogram crests behind the Events Region filter; clubs renamed (Netsetters 1, Bayside Breakers, Northside Flames, Harbour Blues, Spike City).', route: ['/home'] },
    { title: 'Attack map', note: 'You › Offence: the FIBA shot chart is now the opponent half-court with the attack line and zones 4·3·2 / 5·6·1, kills as rings, errors as crosses.', route: ['/you'], query: { tab: 'stats' } },
    { title: 'Volleyball stats', note: 'PTS · K · ACE · BLK · DIG everywhere (points = kills + aces + blocks), 6 + libero rosters, hitting % and digs gauges, results as sets won (3–1) with the live set\'s rally score on live cards. Basic tier keeps kills, sets and aces; digs and blocks are Premium.', route: ['/game', 'g1'], query: { tab: 'stats' } },
    { title: 'Volley TV · the volleyball fork', note: 'This build is a volleyball-native fork of the Hoops TV app (fork tag fork/hoopstv-2026-09-08): new Volley TV skin (coral / deep teal), lockups, splash and favicon. Terminology, stats, seed data and imagery follow gap by gap.', route: ['/auth/sign-in'], query: { splash: '1' } },
  ];
}

/** Serialise the live app into a standalone HTML document: the current DOM
 *  (which already carries the chosen persona/tier/theme and any brand override,
 *  all inline in the markup) plus the head's <style>/<link> tags. The DEV bar
 *  itself is dropped, and the offset it publishes is zeroed, so the shot is the
 *  app alone. Relative and root-relative URLs resolve because a srcdoc iframe
 *  inherits the parent document's base URL. */
function buildSnapshot(): string {
  const root = document.documentElement.cloneNode(true) as HTMLElement;
  // Strip every <script> (and module preloads): without them the iframe is a
  // STATIC render of the DOM as it stands. Leaving them in re-bootstraps Angular
  // inside the iframe, which throws away this prepared markup, resets all the
  // in-memory state we are trying to capture, and races its own first paint.
  root.querySelectorAll('script, link[rel="modulepreload"]').forEach((n) => n.remove());
  root.querySelectorAll('app-dev-bar, #__shotpreview').forEach((n) => n.remove());
  const halo = root.querySelector('.halo') as HTMLElement | null;
  if (halo) {
    halo.classList.remove('has-devbar');
    halo.style.setProperty('--devbar-h', '0px');
  }
  return '<!doctype html>' + root.outerHTML;
}

/** Render a snapshot at an exact viewport size and rasterise it. The iframe is a
 *  real viewport, so the app's media queries evaluate at `w` and the correct
 *  layout renders; html2canvas-pro then reads that already-correct geometry. */
async function renderFrame(
  html2canvas: (el: HTMLElement, opts?: Record<string, unknown>) => Promise<HTMLCanvasElement>,
  srcdoc: string,
  w: number,
  h: number,
): Promise<HTMLCanvasElement> {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  // Off-screen but genuinely laid out — display:none would stop the browser
  // evaluating media queries and leave nothing to capture.
  iframe.style.cssText =
    `position:fixed;top:0;left:0;width:${w}px;height:${h}px;border:0;opacity:0;pointer-events:none;z-index:-1;`;
  iframe.srcdoc = srcdoc;
  document.body.appendChild(iframe);
  try {
    await new Promise<void>((resolve) => { iframe.onload = () => resolve(); });
    const idoc = iframe.contentDocument;
    if (!idoc) throw new Error('no iframe document');
    // Let fonts settle, then wait for every image to finish — a fresh srcdoc
    // starts them from scratch, and html2canvas draws whatever is ready.
    // Gate on `complete` ALONE: an image that already finished (even a failed one
    // with naturalWidth 0) has had its load/error fire, so attaching a listener
    // then would wait forever — the intermittent capture hang. A timeout is the
    // final backstop so one stuck resource can never wedge the whole shot.
    try { await (idoc as Document & { fonts?: FontFaceSet }).fonts?.ready; } catch { /* older engines */ }
    await Promise.all([...idoc.images].map((im) =>
      im.complete
        ? Promise.resolve()
        : new Promise<void>((res) => {
            im.addEventListener('load', () => res(), { once: true });
            im.addEventListener('error', () => res(), { once: true });
            setTimeout(res, 3000);
          })));
    await new Promise((r) => setTimeout(r, 150));

    // FIX 1 — position:fixed. html2canvas positions fixed elements against the
    // full document, not the 844px frame, so the bottom dock landed off-frame and
    // got cut. Pin every fixed element to absolute at the coordinates it actually
    // occupies in this viewport (scroll is at 0,0, so rect == frame position).
    idoc.querySelectorAll<HTMLElement>('*').forEach((el) => {
      if (idoc.defaultView?.getComputedStyle(el).position !== 'fixed') return;
      const r = el.getBoundingClientRect();
      el.style.position = 'absolute';
      el.style.top = `${Math.round(r.top)}px`;
      el.style.left = `${Math.round(r.left)}px`;
      el.style.right = 'auto';
      el.style.bottom = 'auto';
      el.style.margin = '0';
      // getBoundingClientRect already includes any transform (the dock centres
      // with translateX(-50%)); left/top are the final visual position, so the
      // transform must be cleared or it shifts the element a second time.
      el.style.transform = 'none';
    });

    // FIX 2 — SVG <img>. html2canvas mis-sizes an SVG <img> (it keys off the
    // bitmap's natural pixels, not the CSS box), so the wide wordmark came out
    // oversized and clipped. Its raster path DOES honour a background-image on a
    // <div> (divs are sized by CSS), so replace each SVG <img> with a <div> that
    // carries the mark as a PNG background at the exact box it occupied. Non-SVG
    // images (crests, posters) render fine as-is on html2canvas's default path.
    await Promise.all([...idoc.querySelectorAll('img')].map((im) => {
      const r = im.getBoundingClientRect();
      const iw = Math.round(r.width), ih = Math.round(r.height);
      if (iw < 1 || ih < 1) return Promise.resolve();
      const isSvg = /\.svg(\?|$)/i.test(im.src) || im.src.startsWith('data:image/svg');
      return isSvg ? svgImgToBgDiv(im, iw, ih, 2) : Promise.resolve();
    }));

    return await html2canvas(idoc.documentElement, {
      width: w, height: h, windowWidth: w, windowHeight: h,
      scale: 2, useCORS: true, backgroundColor: null,
    });
  } finally {
    iframe.remove();
  }
}

/** Replace an SVG <img> with a <div> whose background is a PNG raster of the SVG,
 *  sized to the `w`×`h` box the image occupied (rasterised at ×`scale` for
 *  crispness). html2canvas sizes divs by CSS and paints their backgrounds at the
 *  box, sidestepping its broken SVG-<img> sizing. Best-effort: on failure the
 *  original <img> is left in place. */
async function svgImgToBgDiv(im: HTMLImageElement, w: number, h: number, scale: number): Promise<void> {
  try {
    const text = await (await fetch(im.src)).text();
    const svg = new DOMParser().parseFromString(text, 'image/svg+xml').documentElement;
    svg.setAttribute('width', String(w * scale));
    svg.setAttribute('height', String(h * scale));
    const url = 'data:image/svg+xml;charset=utf-8,' +
      encodeURIComponent(new XMLSerializer().serializeToString(svg));
    const raster = new Image();
    await new Promise<void>((res, rej) => {
      raster.onload = () => res();
      raster.onerror = () => rej(new Error('svg raster load'));
      raster.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = w * scale;
    canvas.height = h * scale;
    canvas.getContext('2d')?.drawImage(raster, 0, 0, w * scale, h * scale);
    const png = canvas.toDataURL('image/png');
    const div = im.ownerDocument.createElement('div');
    div.className = im.className;
    div.style.cssText = im.getAttribute('style') ?? '';
    div.style.width = `${w}px`;
    div.style.height = `${h}px`;
    div.style.backgroundImage = `url(${png})`;
    div.style.backgroundSize = 'contain';
    div.style.backgroundRepeat = 'no-repeat';
    div.style.backgroundPosition = 'center';
    im.replaceWith(div);
  } catch {
    /* leave the SVG <img> as-is; html2canvas will do its imperfect best */
  }
}

/** Save a canvas as a PNG download, via a Blob (a data: URL would be megabytes
 *  of string for a 2× desktop frame). Object URL is revoked after the click. */
function saveCanvas(canvas: HTMLCanvasElement, filename: string): Promise<void> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) { resolve(); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      resolve();
    }, 'image/png');
  });
}

/** A CSS custom-property value → a `#rrggbb` an <input type="color"> accepts,
 *  or '' when it is not a plain hex (the pickers keep their seeded default). */
function normHex(raw: string): string {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(raw.trim());
  if (!m) return '';
  const h = m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1];
  return `#${h.toLowerCase()}`;
}
