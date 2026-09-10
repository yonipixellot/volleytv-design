import { Component, computed, input } from '@angular/core';

/**
 * Performance gauge column (.gcol): a 300° gradient arc with the value in the
 * centre, a caption + delta, and context chips. `scale` picks the heat gradient.
 */
@Component({
  selector: 'halo-perf-gauge',
  standalone: true,
  template: `
    <div class="gcol">
      <div class="gauge">
        <svg viewBox="0 0 140 120" width="140" height="120">
          <defs>
            <!-- The gradient rotates with the circle it paints, so its axis is stated
               in the ring's PRE-rotation space: pointing left here lands offset 0
               at the top once the -90 turn is applied, which puts the scale's
               first colour at the arc's start (Maryna 2026-08-30). -->
          <linearGradient [attr.id]="gid()" x1="1" y1="0.5" x2="0" y2="0.5">
              @for (s of stops(); track s.o) { <stop [attr.offset]="s.o" [attr.stop-color]="s.c" /> }
            </linearGradient>
          </defs>
          <circle cx="70" cy="62" r="54" fill="none" stroke="var(--hair)" stroke-width="10"
                  stroke-linecap="round" [attr.stroke-dasharray]="trackDash" transform="rotate(-90 70 62)" />
          <circle cx="70" cy="62" r="54" fill="none" [attr.stroke]="'url(#' + gid() + ')'" stroke-width="10"
                  stroke-linecap="round" [attr.stroke-dasharray]="valDash()" transform="rotate(-90 70 62)" />
        </svg>
        <div class="gv num">{{ value() }}</div>
      </div>
      <div class="gcapt">
        <!-- Two labels, one shown per width. Below 768 the full name wrapped to
             two lines under a ring that is itself the widest thing in the
             column; the short form is what the caption already ended with, in
             brackets, so nothing is lost (Maryna 2026-08-30). -->
        <span class="gk gk-full">{{ caption() }}</span>
        @if (short()) { <span class="gk gk-short">{{ short() }}</span> }
        @if (delta()) { <span class="gp">{{ delta() }}</span> }
      </div>
    </div>
  `,
  styleUrl: './perf-gauge.scss',
})
export class PerfGauge {
  value = input.required<string>();
  percent = input(50);
  caption = input('');
  /** The metric's abbreviation, shown INSTEAD of `caption` below 768. Empty
   *  keeps the full name at every width. */
  short = input('');
  delta = input('');
  scale = input<'off' | 'def'>('off');

  private static seq = 0;
  private id = `pg${PerfGauge.seq++}`;
  gid = computed(() => this.id);

  private C = 2 * Math.PI * 54;      // ≈ 339.29
  // A full ring, not a 300° dial. The dial's open bottom existed to make room
  // for a caption underneath; the caption sits BESIDE the ring now, so the
  // shape can close and read as a proportion of a whole (Maryna 2026-08-30).
  private arc = this.C;
  trackDash = `${this.arc.toFixed(2)} ${(this.C - this.arc).toFixed(2)}`;

  valDash = computed(() => {
    const v = this.arc * Math.max(0, Math.min(100, this.percent())) / 100;
    return `${v.toFixed(2)} ${(this.C - v).toFixed(2)}`;
  });

  stops = computed(() =>
    this.scale() === 'def'
      ? [{ o: 0, c: '#20b7ff' }, { o: 0.5, c: '#2fd07f' }, { o: 1, c: '#ffce3a' }]
      : [{ o: 0, c: '#2fd07f' }, { o: 0.38, c: '#8fe04a' }, { o: 0.7, c: '#ffce3a' }, { o: 1, c: '#ff9d2e' }],
  );
}
