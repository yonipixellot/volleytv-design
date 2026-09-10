import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Line-icon set for the Halo UI. Stroke icons inherit `color` via currentColor.
 * The first five (bell/home/games/user/arrow-up) are the app's original sprite;
 * the rest are drawn in the same 24px / ~1.9 stroke / round-join style.
 */
export type IconName =
  | 'bell' | 'home' | 'games' | 'user' | 'arrow-up' | 'arrow-down'
  | 'chevron-left' | 'chevron-right' | 'chevron-down' | 'chevron-up'
  | 'play' | 'search' | 'plus' | 'close' | 'menu'
  | 'calendar' | 'share' | 'check' | 'bookmark'
  | 'settings' | 'heart' | 'chart' | 'logout' | 'sun' | 'moon' | 'lock' | 'clock'
  | 'card' | 'shield' | 'globe' | 'accessibility' | 'compass' | 'info' | 'mail' | 'edit' | 'trash' | 'download' | 'more' | 'scoreboard' | 'oceania';

interface IconDef { vb: string; inner: string; }

const S = 'fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"';

const ICONS: Record<IconName, IconDef> = {
  bell: { vb: '0 0 24 24', inner: `<path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7Z M9.5 20a2.5 2.5 0 0 0 5 0" ${S}/>` },
  home: { vb: '0 0 24 24', inner: `<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" ${S}/>` },
  games: { vb: '0 0 24 24', inner: `<g ${S}><rect x="3.5" y="5" width="17" height="14" rx="2.5"/><path d="M3.5 9.5h17M9 5v14"/></g>` },
  user: { vb: '0 0 24 24', inner: `<g ${S}><circle cx="12" cy="8" r="3.6"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/></g>` },
  'arrow-up': { vb: '0 0 24 24', inner: `<path d="M7 17L17 7M17 7H9M17 7V15" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>` },
  // Mirror of arrow-up on the horizontal axis, same 2.6 stroke: the pair reads
  // as one glyph family for trend up / trend down (2026-08-27).
  'arrow-down': { vb: '0 0 24 24', inner: `<path d="M7 7L17 17M17 17H9M17 17V9" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>` },
  'chevron-left': { vb: '0 0 24 24', inner: `<path d="M15 6l-6 6 6 6" ${S}/>` },
  'chevron-right': { vb: '0 0 24 24', inner: `<path d="M9 6l6 6-6 6" ${S}/>` },
  'chevron-down': { vb: '0 0 24 24', inner: `<path d="M6 9l6 6 6-6" ${S}/>` },
  // The set had left, right and down but not up, so a reversible disclosure had
  // to rotate `chevron-down` instead — and the global rotate rule measurably did
  // not reach the icon inside `.halo-more` (Maryna 2026-09-02). A real glyph has
  // no cascade to lose.
  'chevron-up': { vb: '0 0 24 24', inner: `<path d="M6 15l6-6 6 6" ${S}/>` },
  play: { vb: '0 0 24 24', inner: `<path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>` },
  search: { vb: '0 0 24 24', inner: `<g ${S}><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4-4"/></g>` },
  plus: { vb: '0 0 24 24', inner: `<path d="M12 5v14M5 12h14" ${S}/>` },
  close: { vb: '0 0 24 24', inner: `<path d="M6 6l12 12M18 6L6 18" ${S}/>` },
  menu: { vb: '0 0 24 24', inner: `<path d="M4 7h16M4 12h16M4 17h16" ${S}/>` },
  calendar: { vb: '0 0 24 24', inner: `<g ${S}><rect x="4" y="5.5" width="16" height="15" rx="2.5"/><path d="M4 10h16M8 3.5v4M16 3.5v4"/></g>` },
  share: { vb: '0 0 24 24', inner: `<g ${S}><circle cx="6" cy="12" r="2.5"/><circle cx="17" cy="6" r="2.5"/><circle cx="17" cy="18" r="2.5"/><path d="M8.2 10.8l6.6-3.6M8.2 13.2l6.6 3.6"/></g>` },
  check: { vb: '0 0 24 24', inner: `<path d="M5 12.5l4.5 4.5L19 7.5" ${S}/>` },
  bookmark: { vb: '0 0 24 24', inner: `<path d="M6 4.5h12v15l-6-4-6 4z" ${S}/>` },
  settings: { vb: '0 0 24 24', inner: `<g ${S}><circle cx="12" cy="12" r="3"/><path d="M12 2.5v2.2M12 19.3v2.2M4.2 7l1.9 1.1M17.9 15.9l1.9 1.1M4.2 17l1.9-1.1M17.9 8.1l1.9-1.1"/></g>` },
  // Mirror-symmetric arcs (Feather's verified heart, same 24x24/stroke style as
  // this set) — 2026-08-26 fix. The old hand-drawn path wasn't left/right
  // symmetric: its notch sat at x=10 instead of the centre (x=12), and its
  // right "shoulder" point sat at x=13.8 where mirroring the left one (x=6.2)
  // required x=17.8. That pulled the right lobe in and read as the heart
  // leaning/sliding right, most visible at small icon-chip sizes.
  heart: { vb: '0 0 24 24', inner: `<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" ${S}/>` },
  chart: { vb: '0 0 24 24', inner: `<g ${S}><path d="M4 20V4M4 20h16"/><path d="M8 16v-3M12 16V8M16 16v-6"/></g>` },
  logout: { vb: '0 0 24 24', inner: `<g ${S}><path d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8"/><path d="M18 15l3-3-3-3M21 12H9"/></g>` },
  sun: { vb: '0 0 24 24', inner: `<g ${S}><circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.8 4.8l1.8 1.8M17.4 17.4l1.8 1.8M4.8 19.2l1.8-1.8M17.4 6.6l1.8-1.8"/></g>` },
  moon: { vb: '0 0 24 24', inner: `<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" ${S}/>` },
  clock: { vb: '0 0 24 24', inner: `<g ${S}><circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/></g>` },
  lock: { vb: '0 0 24 24', inner: `<g ${S}><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></g>` },
  card: { vb: '0 0 24 24', inner: `<g ${S}><rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M3 10h18"/></g>` },
  shield: { vb: '0 0 24 24', inner: `<path d="M12 3l7 3v5c0 4.6-3 7.7-7 9-4-1.3-7-4.4-7-9V6l7-3Z" ${S}/>` },
  // Australia + NZ silhouette (filled) — the federation/state-scope glyph.
  // Coastline traced from real lon/lat (Darwin→Gulf→Cape York→east coast→
  // Bight→west coast), plus Tasmania and NZ's two islands.
  oceania: { vb: '0 0 24 24', inner: `<g fill="currentColor"><path d="M8.30 5.70C8.67 5.55 8.57 5.50 8.90 5.50C9.23 5.50 9.98 5.40 10.30 5.70C10.30 5.70 10.80 7.30 10.80 7.30C10.80 7.30 12.00 6.00 12.00 6.00C12.00 6.00 12.50 5.30 12.50 5.30C12.50 5.30 13.60 6.70 13.60 6.70C13.85 7.17 13.80 7.73 14.00 8.10C14.20 8.47 14.42 8.53 14.80 8.90C15.18 9.27 16.02 9.92 16.30 10.30C16.58 10.68 16.60 10.75 16.50 11.20C16.40 11.65 15.92 12.50 15.70 13.00C15.48 13.50 15.50 13.91 15.20 14.20C14.90 14.49 14.22 14.70 13.90 14.75C13.58 14.80 13.65 14.56 13.30 14.50C12.95 14.44 12.33 14.60 11.80 14.40C11.27 14.20 10.68 13.67 10.10 13.30C9.52 12.93 8.92 12.33 8.30 12.20C7.68 12.07 7.12 12.35 6.40 12.50C5.68 12.65 4.63 12.98 4.00 13.10C3.37 13.22 2.85 13.38 2.60 13.20C2.35 13.02 2.60 12.47 2.50 12.00C2.40 11.53 2.03 10.90 2.00 10.40C1.97 9.90 1.77 9.45 2.30 9.00C2.83 8.55 4.47 8.13 5.20 7.70C5.93 7.27 6.18 6.73 6.70 6.40C7.22 6.07 7.93 5.85 8.30 5.70Z"/><path d="M13.9 15.2 L14.6 15.35 L14.25 16.5 L13.5 15.9 Z"/><path d="M22.0 12.6 C22.3 13.0 22.2 13.5 21.7 14.1 C21.2 14.7 20.6 15.2 20.1 15.4 C19.8 15.0 19.9 14.5 20.4 13.9 C20.9 13.3 21.5 12.8 22.0 12.6 Z"/><path d="M19.9 15.3 C20.2 15.7 20.1 16.3 19.5 16.9 C18.9 17.5 18.2 18.0 17.6 18.1 C17.4 17.7 17.6 17.1 18.2 16.5 C18.8 15.9 19.4 15.4 19.9 15.3 Z"/></g>` },
  // The meridian is an ELLIPSE, not two near-straight arcs. The old pair bulged
  // about 2px off centre at r 8.5, so at the 18-20px this icon actually renders
  // they collapsed onto each other and the glyph read as a crosshair in a
  // circle: ring, horizontal, vertical (Maryna 2026-08-31). Half-width 3.8 is
  // wide enough to stay an ellipse at 18px. Three strokes and no latitude arcs
  // on purpose — a fourth line silts up at this size.
  globe: { vb: '0 0 24 24', inner: `<g ${S}><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.4 2.3 3.8 5.3 3.8 8.5s-1.4 6.2-3.8 8.5c-2.4-2.3-3.8-5.3-3.8-8.5s1.4-6.2 3.8-8.5Z"/></g>` },
  accessibility: { vb: '0 0 24 24', inner: `<g ${S}><circle cx="12" cy="4.4" r="1.7"/><path d="M4.5 8.4c2.5 1 4.8 1.4 7.5 1.4s5-.4 7.5-1.4M12 9.6V15M12 15l-3 5M12 15l3 5"/></g>` },
  compass: { vb: '0 0 24 24', inner: `<g ${S}><circle cx="12" cy="12" r="8.5"/><path d="M15.6 8.4l-2.1 5.1-5.1 2.1 2.1-5.1 5.1-2.1Z"/></g>` },
  info: { vb: '0 0 24 24', inner: `<circle cx="12" cy="12" r="8.5" ${S}/><path d="M12 11.2v5" ${S}/><circle cx="12" cy="7.8" r="1.05" fill="currentColor"/>` },
  mail: { vb: '0 0 24 24', inner: `<g ${S}><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M4 7.5l8 5.5 8-5.5"/></g>` },
  edit: { vb: '0 0 24 24', inner: `<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" ${S}/>` },
  trash: { vb: '0 0 24 24', inner: `<g ${S}><path d="M4 6.5h16M9.5 6.5V4.8a1.3 1.3 0 0 1 1.3-1.3h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7M18.5 6.5V19a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19V6.5"/><path d="M10 10.8v5.4M14 10.8v5.4"/></g>` },
  download: { vb: '0 0 24 24', inner: `<g ${S}><path d="M12 3.5v11M7.5 10l4.5 4.5 4.5-4.5"/><path d="M4.5 19.5h15"/></g>` },
  // Overflow / kebab. Filled dots, not stroked circles: at 15-16px a stroked
  // ring collapses into a smudge, while a solid dot stays a clean dot.
  more: { vb: '0 0 24 24', inner: `<g fill="currentColor"><circle cx="5" cy="12" r="1.85"/><circle cx="12" cy="12" r="1.85"/><circle cx="19" cy="12" r="1.85"/></g>` },
  // Scoreboard: two panels split down the middle, a score dot in each. For ONE
  // MATCH - distinct from `games`, which is the Games TAB's symbol (a table
  // with a header rule) and read as a layout rather than a game when it was
  // borrowed for a single fixture (2026-08-27).
  scoreboard: { vb: '0 0 24 24', inner: `<g ${S}><rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M12 6v12"/></g><g fill="currentColor"><circle cx="7.6" cy="12" r="1.15"/><circle cx="16.4" cy="12" r="1.15"/></g>` },
};

@Component({
  selector: 'halo-icon',
  standalone: true,
  template: `<span class="ico" [style.width.px]="size()" [style.height.px]="size()" [innerHTML]="svg()"></span>`,
  styles: [`
    :host { display: inline-flex; }
    .ico { display: inline-flex; }
    .ico ::ng-deep svg { width: 100%; height: 100%; display: block; }
  `],
})
export class HaloIcon {
  name = input.required<IconName>();
  size = input(24);

  /**
   * Override the drawn stroke, in the icon's own 24px units.
   *
   * The set is drawn at 24px with a 1.9 stroke, and `size` scales the whole
   * glyph — so at 12px that stroke renders under a pixel and the icon reads as
   * a grey smudge next to the text beside it. Rendering small is the case that
   * needs this; nothing else should.
   */
  strokeWidth = input<number | null>(null);

  private san = inject(DomSanitizer);
  svg = computed<SafeHtml>(() => {
    const def = ICONS[this.name()] ?? ICONS['bell'];
    const w = this.strokeWidth();
    const inner =
      w === null ? def.inner : def.inner.replace(/stroke-width="[\d.]+"/g, `stroke-width="${w}"`);
    return this.san.bypassSecurityTrustHtml(
      `<svg viewBox="${def.vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`,
    );
  });
}

export const ALL_ICONS = Object.keys(ICONS) as IconName[];
