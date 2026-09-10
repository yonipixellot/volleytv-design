import { Component, ElementRef, ViewChild, computed, input, linkedSignal, signal } from '@angular/core';
import { t } from '../../../app/i18n/i18n';
import { TPipe } from '../../../app/i18n/t.pipe';
import { SegmentedToggle, type SegOption } from '../../molecules/segmented-toggle/segmented-toggle';

/** One attack: where it was hit from (own half, bottom) → where it landed
 *  (opponent half, top — or the net / out for an error). Court units: 1 m = 10,
 *  the court is the 90 × 180 rectangle at (20, 20), the net is y = 110. */
export interface Attack { x1: number; y1: number; x2: number; y2: number; set: number; }

/* Origins sit where the hitter meets the ball: outside from zone 4, opposite
   from zone 2, middle from zone 3 tight to the net, the pipe from zone 6. Kills
   go deep and to the corners, line or cross-court. */
const KILLS: Attack[] = [
  { x1: 30, y1: 146, x2: 98, y2: 28, set: 1 }, { x1: 32, y1: 142, x2: 26, y2: 40, set: 1 }, { x1: 62, y1: 134, x2: 48, y2: 70, set: 1 },
  { x1: 100, y1: 144, x2: 32, y2: 32, set: 2 }, { x1: 98, y1: 140, x2: 104, y2: 46, set: 2 }, { x1: 28, y1: 150, x2: 84, y2: 60, set: 2 },
  { x1: 66, y1: 166, x2: 72, y2: 36, set: 3 }, { x1: 70, y1: 132, x2: 92, y2: 66, set: 3 }, { x1: 34, y1: 144, x2: 60, y2: 52, set: 3 },
  { x1: 102, y1: 146, x2: 40, y2: 58, set: 4 }, { x1: 58, y1: 136, x2: 30, y2: 74, set: 4 },
  { x1: 30, y1: 148, x2: 100, y2: 40, set: 5 }, { x1: 64, y1: 168, x2: 56, y2: 30, set: 5 },
];
/* Errors end in the net (y = 110), long (past the far baseline) or wide. */
const ERRORS: Attack[] = [
  { x1: 30, y1: 146, x2: 44, y2: 110, set: 1 }, { x1: 100, y1: 144, x2: 36, y2: 12, set: 1 },
  { x1: 62, y1: 134, x2: 66, y2: 110, set: 2 }, { x1: 32, y1: 142, x2: 12, y2: 52, set: 2 },
  { x1: 98, y1: 140, x2: 96, y2: 10, set: 3 }, { x1: 66, y1: 166, x2: 118, y2: 44, set: 3 },
  { x1: 28, y1: 150, x2: 52, y2: 110, set: 4 }, { x1: 70, y1: 132, x2: 82, y2: 14, set: 4 },
  { x1: 102, y1: 146, x2: 14, y2: 72, set: 5 },
];
/** Attack attempts per set (kills + errors + balls kept in play). 31 → 13 kills = 42%. */
const ATTEMPTS = [8, 7, 6, 6, 4];

/** Attack path card (.card): header + the full court, portrait, net across the
 *  middle, 3 × 3 zones per half. Every attack is an arrow from where it was hit
 *  (own half, bottom) to where it landed (opponent half, top); errors end in
 *  the net or out. Beside the court: kill %, a set filter, the legend. Same
 *  model as Pixellot Advantage's "Attack Path" chart (Maryna 2026-09-09). */
@Component({
  selector: 'halo-shot-map',
  standalone: true,
  imports: [TPipe, SegmentedToggle],
  template: `
    <div class="card">
      <div class="shot-h">
        <div class="shot-h-l">
          <div class="ct">{{ shotType() }}</div>
          <div class="shot-meta">{{ 'shot.tied' | t }}</div>
        </div>
      </div>

      <svg #court class="court" viewBox="0 0 130 220" width="100%" preserveAspectRatio="xMidYMid meet" role="img" [attr.aria-label]="'shot.court' | t">
        <defs>
          <marker [attr.id]="uid + '-k'" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" fill="var(--pos)" />
          </marker>
        </defs>
        <!-- Free zone, then the 9 × 18 m court. Own half at the bottom, the
             opponent's at the top: attacks travel up the screen, over the net. -->
        <rect x="0" y="0" width="130" height="220" rx="3" fill="var(--court)" />
        <g fill="none" stroke="var(--courtline)" [attr.stroke-width]="1.1 * k()" stroke-linejoin="round">
          <rect x="20" y="20" width="90" height="180" />
          <!-- attack lines, 3 m either side of the net -->
          <path d="M20 80H110M20 140H110" />
          <!-- the 3 × 3 zone grid per half, faint -->
          <path d="M50 20V200M80 20V200M20 50H110M20 170H110" [attr.stroke-width]="0.7 * k()" stroke-dasharray="2 2" opacity=".6" />
        </g>
        <!-- Net: posts a metre outside the sidelines, the tape across. -->
        <g stroke="var(--courtline)" stroke-linecap="round">
          <path d="M10 110H120" [attr.stroke-width]="2.6 * k()" />
          <path d="M10 106V114M120 106V114" [attr.stroke-width]="1.4 * k()" />
        </g>
        <!-- Zone numbers, each side in its OWN numbering (front row 4·3·2 at the
             net, back row 5·6·1), so the opponent's read upside-down to us. -->
        <g class="zones" fill="var(--courtline)" font-family="var(--body)" font-weight="700" text-anchor="middle" [attr.font-size]="7.5 * k()" opacity=".6">
          <text x="35" y="67">1</text><text x="65" y="67">6</text><text x="95" y="67">5</text>
          <text x="35" y="97">2</text><text x="65" y="97">3</text><text x="95" y="97">4</text>
          <text x="35" y="129">4</text><text x="65" y="129">3</text><text x="95" y="129">2</text>
          <text x="35" y="159">5</text><text x="65" y="159">6</text><text x="95" y="159">1</text>
        </g>
        @for (a of errorsShown(); track $index) {
          <!-- Errors are the quiet layer: a thin half-tone shaft, so the kills
               carry the picture and an error is found, not shouted. -->
          <path [attr.d]="line(a)" stroke="var(--live)" [attr.stroke-width]="0.8 * k()" stroke-linecap="round" opacity=".45" />
          <circle [attr.cx]="a.x1" [attr.cy]="a.y1" [attr.r]="1.3 * k()" fill="var(--live)" opacity=".6" />
          <path [attr.d]="cross(a)" stroke="var(--live)" [attr.stroke-width]="1.4 * k()" stroke-linecap="round" opacity=".8" />
        }
        @for (a of killsShown(); track $index) {
          <path [attr.d]="line(a)" stroke="var(--pos)" [attr.stroke-width]="1.3 * k()" stroke-linecap="round" [attr.marker-end]="'url(#' + uid + '-k)'" />
          <circle [attr.cx]="a.x1" [attr.cy]="a.y1" [attr.r]="1.7 * k()" fill="var(--pos)" />
        }
      </svg>

      <!-- The set filter gets the card's full width: six pills never fit beside
           a portrait court on a phone (they scrolled out of view). -->
      <div class="sets">
        <div class="sets-l">{{ 'shot.set' | t }}</div>
        <halo-segmented-toggle [options]="setOptions" [(value)]="set" />
      </div>

      <div class="side">
        <div class="shot-sum">
          <span class="big num">{{ pct() }}</span>
          <small>{{ killsShown().length }}/{{ attempts() }} {{ 'shot.att' | t }}</small>
        </div>
        <div class="shot-legend">
          <span class="lg"><i class="ak" aria-hidden="true"></i>{{ 'shot.made' | t }}</span>
          <span class="lg"><i class="ae" aria-hidden="true"></i>{{ 'shot.missed' | t }}</span>
          <span class="lg push">{{ 'shot.court' | t }}</span>
        </div>
      </div>
    </div>
  `,
  styleUrl: './shot-map.scss',
})
export class ShotMap {
  /**
   * Court width the ink was drawn for: the phone rendering, where the court
   * column measures ~165px. Everything below is stated as a multiple of it.
   */
  private static readonly REF = 165;

  /**
   * Ink scale. The court is a MAP, so its geometry scales with the box — the
   * lines, the net, the zones keep their real proportions. The ink laid ON the
   * map must not: a viewBox is a magnifier, and at 560px it rendered 20px
   * markers and 4px court lines off values drawn for 11 and 2 (Maryna
   * 2026-08-30). k = REF / rendered width, capped at 1.
   */
  protected k = signal(1);

  /** Unique marker id, so two charts on one page (Storybook docs) don't share arrowheads. */
  protected uid = 'ap' + Math.random().toString(36).slice(2, 7);

  private ro?: ResizeObserver;

  @ViewChild('court') set courtEl(el: ElementRef<SVGSVGElement> | undefined) {
    this.ro?.disconnect();
    if (!el) return;
    const measure = (w: number) => { if (w > 0) this.k.set(Math.min(1, ShotMap.REF / w)); };
    measure(el.nativeElement.getBoundingClientRect().width);
    this.ro = new ResizeObserver(([e]) => measure(e.contentRect.width));
    this.ro.observe(el.nativeElement);
  }

  ngOnDestroy() { this.ro?.disconnect(); }

  protected line(a: Attack) { return `M${a.x1} ${a.y1}L${a.x2} ${a.y2}`; }

  /** An error is an X of constant screen size, centred where the ball died. */
  protected cross(a: Attack) {
    const d = 2 * this.k();
    return `M${a.x2 - d} ${a.y2 - d}L${a.x2 + d} ${a.y2 + d}M${a.x2 - d} ${a.y2 + d}L${a.x2 + d} ${a.y2 - d}`;
  }

  // No `title` input. It was never rendered, and because `title` is a global
  // HTML attribute Angular put it on the HOST — so hovering the card raised a
  // native browser tooltip over the diagram (Maryna 2026-08-30). The card
  // already says what it is, in .ct.
  shotType = input(t('stat.kill'));
  kills = input<Attack[]>(KILLS);
  errors = input<Attack[]>(ERRORS);
  /** Attempts per set (index 0 = set 1); the kill % denominator. */
  attemptsPerSet = input<number[]>(ATTEMPTS);

  /** Set filter: '0' = all sets. Opens on the LATEST set that has attacks: the
   *  all-sets view stacks every arrow of the match and reads as a tangle, and
   *  the last set is the one a player wants to relive (Yoni 2026-09-09). */
  protected set = linkedSignal(() => String(Math.max(0, ...this.kills().map(a => a.set), ...this.errors().map(a => a.set))));
  protected setOptions: SegOption[] = [
    { key: '0', label: t('shot.allSets') }, { key: '1', label: '1' }, { key: '2', label: '2' }, { key: '3', label: '3' }, { key: '4', label: '4' }, { key: '5', label: '5' },
  ];

  private inSet = (a: Attack) => this.set() === '0' || a.set === +this.set();
  protected killsShown = computed(() => this.kills().filter(this.inSet));
  protected errorsShown = computed(() => this.errors().filter(this.inSet));
  protected attempts = computed(() => {
    const s = +this.set();
    return s === 0 ? this.attemptsPerSet().reduce((n, v) => n + v, 0) : (this.attemptsPerSet()[s - 1] ?? 0);
  });
  /** Kill % across the attempts in view. */
  protected pct = computed(() => {
    const n = this.attempts();
    return n ? Math.round((this.killsShown().length / n) * 100) + '%' : '–';
  });
}
