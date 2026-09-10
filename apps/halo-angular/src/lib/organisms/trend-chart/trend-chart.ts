import { Component, ElementRef, ViewChild, computed, input, model, output, signal } from '@angular/core';
import { HaloIcon } from '../../atoms/icon/icon';
import { t } from '../../../app/i18n/i18n';
import { TPipe } from '../../../app/i18n/t.pipe';

/** Per-stat dataset the chip row switches between. Any field left out falls
 *  back to the chart's own top-level input, so a single-stat chart needs none. */
export interface StatDatum {
  points: number[];
  trend?: string;
  season?: string | number;
  titleSub?: string;
  legendLabel?: string;
  verdictTitle?: string;
  verdictText?: string;
}

/**
 * Analytics trend block: header (title/trend/season), optional stat chips,
 * range control, an area chart computed from per-game points (with typical-range
 * band, average line and season-high / low markers), legend and a verdict.
 *
 * Premium gating: chips listed in `lockedChips` show a padlock; selecting one
 * still switches to it but the chart region renders blurred behind an Upgrade
 * overlay (tap → `upgrade`). The default/free stat stays fully visible.
 */
@Component({
  // `title` is a global HTML attribute, so a static `title="…"` in a caller's
  // template stays on the HOST and the browser raises its own tooltip over the
  // component — duplicating text already on screen (Maryna 2026-08-30). The
  // input keeps its natural name; the host simply stops carrying it.
  host: { '[attr.title]': 'null' },
  selector: 'halo-trend-chart',
  standalone: true,
  imports: [HaloIcon, TPipe],
  template: `
    <!-- ORDER IS THE DEPENDENCY ORDER: controls, then everything derived from
         them (Maryna 2026-08-28). The header used to sit on top, but every word
         in it — metric, delta, the big figure — is a RESULT of the selection made
         below it, so a reader changed something at the bottom and the answer
         appeared above their finger, off where they were looking. -->

    <!-- Metric selector as TILES, not a pill row: a grid of value+code cannot be
         confused with the segmented range, and it shows every metric at once
         instead of hiding the tail behind a horizontal scroll.
         Above the range, not below it: these are SEASON figures, so the range —
         which windows the plot and the delta — does not scope them. Putting it
         above would claim that it did. -->
    @if (statChips().length) {
      <div class="mlab">{{ 'trend.tapToChart' | t }}</div>
      <!-- The tile COUNT is a layout input at desktop widths: it is what says how
           wide one row of tiles is, and the range control beside them wraps off
           the row only when that width no longer fits (see trend-chart.scss). -->
      <div class="mtiles" role="tablist" [attr.aria-label]="'trend.statistic' | t" [style.--mt-n]="statChips().length">
        @for (c of statChips(); track c) {
          <button class="mtile" type="button" role="tab" [attr.aria-selected]="c === displayStat()"
            [class.on]="c === displayStat()" [class.locked]="isLocked(c)" (click)="activeStat.set(c)">
            <span class="mt-v num">{{ tileValue(c) }}</span>
            <span class="mt-k">{{ c }}@if (isLocked(c)) { <halo-icon name="lock" [size]="9" /> }</span>
          </button>
        }
      </div>
    }

    <div class="rangeseg">
      @for (r of ranges(); track r) { <button [class.on]="r === activeRange()" (click)="activeRange.set(r)">{{ rangeLabel(r) }}</button> }
    </div>

    <!-- Derived from the controls above. The hero repeats the SELECTED TILE's
         season figure on purpose: a big number is the fastest thing to scan, and
         the repeat is the selection feedback — tap 42 and 42 is what gets big
         (Maryna 2026-08-28). The delta beside it is window-scoped and says so in
         words ("vs last 10"), so the two scopes in this header are labelled
         rather than guessed at. -->
    <div class="ch-h">
      <div>
        <div class="ct">{{ dTitle() }} @if (dTitleSub()) { <span class="ct-s">· {{ dTitleSub() }}</span> }</div>
        @if (dTrend()) { <div class="trend" [class]="'trend ' + trendDir()">{{ dTrend() }}</div> }
      </div>
      <div class="cbig num">{{ dSeason() }}<small>{{ 'trend.season' | t }}</small></div>
    </div>

    <div class="ch-body" [class.locked]="activeLocked()">

    <!-- Scrub layer. One implementation covers both platforms: Pointer Events
         unify mouse and touch, so the web hover and the "drag your finger"
         reading are the same code path. The touch-action: pan-y in the SCSS is
         what makes it work on a phone — a VERTICAL swipe still scrolls the page,
         a horizontal one reaches us instead of being eaten by the scroller. -->
    <div class="plot" #plot
         (pointermove)="scrub($event)" (pointerdown)="scrub($event)"
         (pointerleave)="cursor.set(null)" (pointercancel)="cursor.set(null)">
    <!-- No fixed height. With height="152" and the default
         preserveAspectRatio="xMidYMid meet", a box wider than the viewBox's 2.158
         ratio could not scale up (height capped it), so the viewBox was CENTRED
         instead — 13px of letterbox each side at 430px wide, which is what still
         looked like chart padding after the viewBox padding was removed.
         Letting height follow the intrinsic ratio keeps the scale uniform, so the
         plot fills the width exactly at any viewport (2026-08-28). -->
    <svg class="chart-svg" [attr.viewBox]="'0 0 ' + plotW() + ' 152'" width="100%">
      <defs>
        <linearGradient [attr.id]="gid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" [attr.stop-color]="accentVar()" stop-opacity=".4" />
          <stop offset="1" [attr.stop-color]="accentVar()" stop-opacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" [attr.y]="band().y" [attr.width]="plotW()" [attr.height]="band().h" rx="8" fill="var(--band)" />
      <line x1="0" [attr.x2]="plotW()" [attr.y1]="avgY()" [attr.y2]="avgY()" stroke="var(--ink4)" stroke-width="1" stroke-dasharray="3 4" />
      <!-- End-anchored so it stays inside the plot now that the line reaches the
           edge; 2 units of slack keeps it off the very last pixel. -->
      <text [attr.x]="plotW() - 2" [attr.y]="avgY() - 5" text-anchor="end" font-size="8" fill="var(--ink3)" font-weight="500">{{ 'trend.avg' | t }}</text>
      <path [attr.d]="areaPath()" [attr.fill]="'url(#' + gid + ')'" />
      <path [attr.d]="linePath()" fill="none" [attr.stroke]="accentVar()" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" />
      <circle [attr.cx]="low().x" [attr.cy]="low().y" r="5" fill="var(--live)" stroke="var(--card)" stroke-width="2.5" />
      <text [attr.x]="low().x" [attr.y]="low().y + 15" text-anchor="middle" font-size="9" font-weight="700" fill="var(--live)">{{ low().v }}</text>
      <circle [attr.cx]="high().x" [attr.cy]="high().y" r="6" [attr.fill]="accentVar()" stroke="var(--card)" stroke-width="2.5" />
      <text [attr.x]="high().x" [attr.y]="high().y - 11" text-anchor="middle" font-size="11" font-weight="700" fill="var(--ink)">{{ high().v }}</text>
      <g fill="var(--ink4)" font-size="8.5" font-weight="500">
        @for (t of xTicks(); track t.x) { <text [attr.x]="t.x" y="148" [attr.text-anchor]="t.anchor">{{ t.label }}</text> }
      </g>

      <!-- Crosshair: a hairline that SNAPS to the nearest game, so the reader
           aims at a game rather than at a 2px line. Drawn last so it sits over
           the fill and the markers. -->
      @if (cursor(); as c) {
        <line [attr.x1]="c.x" [attr.x2]="c.x" y1="30" y2="138" stroke="var(--ink3)" stroke-width="1" />
        <circle [attr.cx]="c.x" [attr.cy]="c.y" r="5" [attr.fill]="accentVar()" stroke="var(--card)" stroke-width="2.5" />
      }
    </svg>

    <!-- Readout as HTML, not SVG text: the value leads and the label follows,
         which needs real type styling. Never the ONLY way to read a value —
         the season high / low keep their direct labels above. -->
    @if (cursor(); as c) {
      <div class="tip" [style.left.%]="c.pct" [class.flip]="c.pct > 62" [class.flipl]="c.pct < 14">
        <span class="tip-v num">{{ c.v }}</span>
        <span class="tip-k">{{ c.label }} · {{ dLegend() }}</span>
      </div>
    }
    </div>

    <div class="legend">
      <span class="lg"><i class="ln" [style.background]="accentVar()"></i>{{ dLegend() }}</span>
      <span class="lg"><i class="bd"></i>{{ 'trend.typical' | t }}</span>
      <span class="lg"><i class="hi" [style.background]="accentVar()"></i>{{ 'trend.high' | t }}</span>
    </div>

    @if (dVerdictTitle()) {
      <div class="verdict"><b>{{ dVerdictTitle() }}</b><p>{{ dVerdictText() }}</p></div>
    }

    @if (activeLocked()) {
      <button class="ch-lock" type="button" (click)="upgrade.emit()">
        <span class="lk"><halo-icon name="lock" [size]="16" /></span>
        <span class="t">{{ 'trend.isPremium' | t: { stat: displayStat() } }}</span>
        <span class="cta">{{ 'common.upgrade' | t }}</span>
      </button>
    }
    </div>
  `,
  styleUrl: './trend-chart.scss',
})
export class TrendChart {
  /**
   * ONE VIEWBOX UNIT IS ONE CSS PIXEL.
   *
   * The viewBox was a fixed 328 — the width this chart has on a phone — and the
   * svg then scaled to whatever box it was given. In a 486px column that is a
   * uniform 1.48x magnification of EVERYTHING: the 3-unit line became 4.4px,
   * the 11-unit label 16px, the marker dots half again as big. Measured on the
   * You dashboard, and it is exactly what "the charts just got huge" describes
   * (Maryna 2026-08-30).
   *
   * Tracking the rendered width instead means a wider column buys more PLOT —
   * the games spread out and the line is easier to read — while the strokes,
   * the dots and the type stay the size they were drawn at. The height is
   * unchanged at 152 for the same reason.
   *
   * 328 remains the pre-measurement default so the first frame is the phone
   * layout rather than a collapsed one.
   */
  protected plotW = signal(328);

  @ViewChild('plot') set plotEl(el: ElementRef<HTMLElement> | undefined) {
    this.ro?.disconnect();
    if (!el) return;
    const measure = () => {
      const w = Math.round(el.nativeElement.getBoundingClientRect().width);
      if (w > 0) this.plotW.set(w);
    };
    // A ResizeObserver rather than a window listener: this chart also changes
    // width when the CARD around it changes, which a viewport event misses.
    this.ro = new ResizeObserver(measure);
    this.ro.observe(el.nativeElement);
    measure();
  }
  private ro?: ResizeObserver;

  title = input.required<string>();
  titleSub = input('');
  trend = input('');
  season = input<string | number>('');
  points = input.required<number[]>();
  accent = input<'off' | 'def'>('off');
  statChips = input<string[]>([]);
  lockedChips = input<string[]>([]);
  /** Per-stat data keyed by chip label; picking a chip swaps the chart to it. */
  statData = input<Record<string, StatDatum>>({});
  upgrade = output<void>();
  activeStat = model<string>('');
  /**
   * Widest first, then narrower (2026-08-28). It used to read Last 10 → Last 5 →
   * Season, which is 10 → 5 → whole log: not monotonic, so there was no way to
   * guess where an option sat.
   *
   * Season is also the DEFAULT now: the block's hero is the season figure, and
   * the point of the chart is the season's shape, so the range is a zoom-in from
   * the full picture rather than a choice the viewer has to make up front.
   */
  activeRange = model<string>('Season');
  /** Range keys stay English (callers pass them, the window logic compares them); only the chip text translates. */
  protected rangeLabel(r: string): string {
    return r === 'Season' ? t('trend.season') : r === 'Last 5' ? t('trend.last5') : r === 'Last 10' ? t('trend.last10') : r;
  }
  ranges = input<string[]>(['Season', 'Last 10', 'Last 5']);
  legendLabel = input(t('stat.perGame'));
  verdictTitle = input('');
  verdictText = input('');

  private static seq = 0;
  gid = `tc${TrendChart.seq++}`;
  accentVar = computed(() => (this.accent() === 'def' ? 'var(--c-def)' : 'var(--c-off)'));

  /** The effective stat: explicit selection, else the first chip, else the title.
   *  (activeStat defaults to '' so a chip is highlighted from the first render.) */
  displayStat = computed(() => this.activeStat() || this.statChips()[0] || this.title());
  /** Resolved dataset for the active stat, if the caller supplied one. */
  private datum = computed<StatDatum | undefined>(() => this.statData()[this.displayStat()]);

  /* The active stat's full-season per-game log. The range control windows it:
     Last 5 / Last 10 are trailing slices, Season is the whole log. */
  private fullSeries = computed(() => this.datum()?.points ?? this.points());
  windowSeries = computed(() => {
    const s = this.fullSeries();
    const r = this.activeRange();
    if (r === 'Last 5') return s.slice(-5);
    if (r === 'Last 10') return s.slice(-10);
    return s; // Season → whole log
  });

  /* Displayed fields — the active stat's data when present, else the top-level
     input. Lets a single-stat chart (Defence) keep working with no statData. */
  dTitle = computed(() => this.displayStat() || this.title());
  dTitleSub = computed(() => this.datum()?.titleSub ?? this.titleSub());
  /**
   * Direction and magnitude for the ACTIVE WINDOW (early third vs late third),
   * computed once. The delta line, its colour and the verdict all read from this
   * one source, so they cannot contradict each other — with the verdict copy
   * hard-coded per stat, the header could say "▼ -5% across season" while the
   * verdict under the same chart said "TRENDING UP · up over the last 10"
   * (Maryna 2026-08-28).
   *
   * `pct: null` means the window is too short (or starts at zero) to say
   * anything, and every consumer falls back to the datum's own copy.
   */
  private windowDelta = computed<{ pct: number | null; dir: 'up' | 'down' | 'flat' }>(() => {
    const s = this.windowSeries();
    const none = { pct: null, dir: 'flat' as const };
    if (s.length < 2) return none;
    const k = Math.max(1, Math.floor(s.length / 3));
    const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / (a.length || 1);
    const early = avg(s.slice(0, k));
    if (!early) return none;
    const pct = Math.max(-40, Math.min(40, Math.round(((avg(s.slice(-k)) - early) / early) * 100)));
    return { pct, dir: pct >= 3 ? 'up' : pct <= -3 ? 'down' : 'flat' };
  });

  /** Caption for the delta line — the only place the window is named in words. */
  private rangeCapShort = computed(() => {
    const r = this.activeRange();
    return r === 'Season' ? t('trend.acrossSeason') : r === 'Last 5' ? t('trend.vsLast5') : t('stat.vsLast10');
  });

  dTrend = computed(() => {
    const { pct, dir } = this.windowDelta();
    if (pct === null) return this.datum()?.trend ?? this.trend();
    const arrow = dir === 'up' ? '▲' : dir === 'down' ? '▼' : '▪';
    return `${arrow} ${pct > 0 ? '+' : ''}${pct}% · ${this.rangeCapShort()}`;
  });
  dSeason = computed(() => this.datum()?.season ?? this.season());
  dLegend = computed(() => this.datum()?.legendLabel ?? this.legendLabel());

  /**
   * Hand-written per stat, deliberately. Generating it from the window was tried
   * and reverted (Maryna 2026-08-28): "Trending up / down / Holding steady" was
   * always true but had none of the character of "Cleaning the glass".
   *
   * The copy is kept honest by RULE instead: a verdict never states a direction
   * or a window, because those change with the range control and the delta line
   * above already reports both, computed. It only says things that hold for the
   * whole season — what the stat is about, and specific games that really are
   * the maximum in the data.
   */
  dVerdictTitle = computed(() => this.datum()?.verdictTitle ?? this.verdictTitle());
  dVerdictText = computed(() => this.datum()?.verdictText ?? this.verdictText());

  isLocked = (c: string): boolean => this.lockedChips().includes(c);
  activeLocked = computed(() => this.lockedChips().includes(this.displayStat()));

  private geom = computed(() => {
    const pts = this.windowSeries();
    const n = pts.length;
    // Plot spans the WHOLE viewBox (2026-08-28). It used to inset 16 units each
    // side to leave room for the end tick labels and the high/low markers, which
    // made the chart visibly narrower than every other line of the card. Those
    // 16 units were then bled back with a fixed -16px margin, but a fixed pixel
    // against a scaling viewBox unit only lines up at one viewport width.
    // Now the marks are kept in bounds by anchoring the end ticks (see xTicks)
    // and by letting the markers spill into the CARD's own 16px padding
    // (overflow: visible in the SCSS) — 38px from the screen edge, never past it.
    const x0 = 0, xN = this.plotW(), yTop = 44, yBot = 104, baseY = 134;
    const step = n > 1 ? (xN - x0) / (n - 1) : 0;
    const max = Math.max(...pts), min = Math.min(...pts);
    const range = max - min || 1;
    const x = (i: number) => x0 + i * step;
    const y = (v: number) => yTop + ((max - v) / range) * (yBot - yTop);
    return { pts, n, x0, xN, yTop, yBot, baseY, step, max, min, x, y };
  });

  linePath = computed(() => {
    const g = this.geom();
    return g.pts.map((v, i) => `${i ? 'L' : 'M'} ${g.x(i).toFixed(1)} ${g.y(v).toFixed(1)}`).join(' ');
  });
  areaPath = computed(() => {
    const g = this.geom();
    return `${this.linePath()} L ${g.x(g.n - 1).toFixed(1)} ${g.baseY} L ${g.x0} ${g.baseY} Z`;
  });
  avgY = computed(() => {
    const g = this.geom();
    const avg = g.pts.reduce((a, b) => a + b, 0) / g.n;
    return +g.y(avg).toFixed(1);
  });
  band = computed(() => ({ y: +(this.avgY() - 13.5).toFixed(1), h: 27 }));
  high = computed(() => {
    const g = this.geom();
    const i = g.pts.indexOf(g.max);
    // `label` so the verdict can name the game, not just the value.
    const offset = this.fullSeries().length - g.n;
    return { x: +g.x(i).toFixed(1), y: +g.y(g.max).toFixed(1), v: g.max, label: `G${offset + i + 1}` };
  });
  low = computed(() => {
    const g = this.geom();
    const i = g.pts.indexOf(g.min);
    return { x: +g.x(i).toFixed(1), y: +g.y(g.min).toFixed(1), v: g.min };
  });
  /**
   * Season figure for a selector tile — the same number the hero shows for the
   * selected one.
   *
   * The season TOTAL is the headline this block has always led with, and it is
   * the number the viewer anchors on. A windowed per-game average was tried here
   * and reverted (Maryna 2026-08-28): it quietly moved the block's focus from
   * "what you have done this season" to "what you average lately", which is a
   * product decision and not a layout fix. Tile and hero therefore agree — you
   * tap 42 and 42 is what gets big, so nothing turns into a different number on
   * the way.
   */
  protected tileValue(k: string): string | number {
    return this.statData()[k]?.season ?? '—';
  }

  /**
   * Direction for CSS, straight from `windowDelta` — it used to sniff the ▲ / ▼
   * glyph back out of the formatted delta string, which meant the colour was
   * parsed from a label instead of read from the data.
   *
   * The colour used to be a hardcoded `--pos`, which painted every decline GREEN
   * — a ▼ -5% read as good news (2026-08-28). Assumes every metric here is
   * more-is-better (2FGM, AST, REB, STL, FG% all are); a stat where down is good
   * (turnovers, fouls) would need its polarity passed in.
   */
  protected trendDir = computed(() => this.windowDelta().dir);

  /** The scrubbed game: null when the pointer is away. */
  protected cursor = signal<{ x: number; y: number; v: number; label: string; pct: number } | null>(null);

  /**
   * Map a pointer to the nearest game. One viewBox unit is one CSS pixel, so
   * the scale factor is 1 — but the maths still goes through plotW() so it
   * stays correct on the frame before the observer has measured.
   */
  protected scrub(e: PointerEvent): void {
    const host = e.currentTarget as HTMLElement;
    const r = host.getBoundingClientRect();
    if (!r.width) return;
    const g = this.geom();
    const vx = ((e.clientX - r.left) / r.width) * this.plotW();
    const i = g.step
      ? Math.max(0, Math.min(g.n - 1, Math.round((vx - g.x0) / g.step)))
      : 0;
    const v = g.pts[i];
    if (v === undefined) return;
    const offset = this.fullSeries().length - g.n;
    this.cursor.set({
      x: +g.x(i).toFixed(1),
      y: +g.y(v).toFixed(1),
      v,
      label: `G${offset + i + 1}`,
      pct: +((g.x(i) / this.plotW()) * 100).toFixed(2),
    });
  }

  xTicks = computed(() => {
    const g = this.geom();
    /* Window is a trailing slice of the season, so game numbers start partway in. */
    const offset = this.fullSeries().length - g.n;
    const ticks: { x: number; label: string; anchor: 'start' | 'middle' | 'end' }[] = [];
    for (let i = 0; i < g.n; i += 2) {
      const x = +g.x(i).toFixed(1);
      /* The plot now runs edge to edge, so a middle-anchored label on the first
         or last point would hang outside the chart. Anchor those to their own
         edge instead; everything in between stays centred on its game. */
      const anchor = x <= 1 ? 'start' : x >= 327 ? 'end' : 'middle';
      ticks.push({ x, label: `G${offset + i + 1}`, anchor });
    }
    return ticks;
  });
}
