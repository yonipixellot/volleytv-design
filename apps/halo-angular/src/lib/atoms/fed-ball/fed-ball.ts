import { Component, effect, input, signal, untracked } from '@angular/core';
import { VOLLEY_BALL_SEAMS } from '../../brand/volleytv-preset';

interface BallLayer { id: number; color: string; state: 'idle' | 'in' | 'out'; }

/**
 * FedBall — a volleyball in a region colorway, with the "bounce" switch
 * (approved from the roundel-surgery board, 2026-08-23): when `color` changes,
 * the outgoing ball drops away and the incoming one falls in and
 * squash-bounces like a ball. One vector (disc + seams), any colorway — never
 * per-region raster art. Reduced motion collapses the
 * swap to an instant cut (global a11y motion rules also cover it).
 */
@Component({
  selector: 'halo-fed-ball',
  standalone: true,
  template: `
    <span class="stage" [style.width.px]="size()" [style.height.px]="size()">
      @for (l of layers(); track l.id) {
        <svg class="ball" [class.in]="l.state === 'in'" [class.out]="l.state === 'out'"
          viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="46" [attr.fill]="l.color" />
          <path [attr.d]="seams" fill="none" stroke="rgba(0, 0, 0, .55)" stroke-width="6" stroke-linecap="round" />
          <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(0, 0, 0, .55)" stroke-width="6" />
        </svg>
      }
    </span>
  `,
  styles: [`
    :host { display: inline-flex; }
    .stage { position: relative; display: block; transform: translateY(.5px); }
    .ball {
      position: absolute; inset: 0; width: 100%; height: 100%; display: block;
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, .45));
    }
    .ball.out { animation: fb-out .26s cubic-bezier(.5, 0, .9, .4) forwards; }
    .ball.in { animation: fb-in .52s both; animation-delay: .12s; }
    @keyframes fb-out { to { opacity: 0; transform: translateY(9px) scale(.8); } }
    @keyframes fb-in {
      0% { opacity: 0; transform: translateY(-11px); }
      45% { opacity: 1; transform: translateY(0); }
      62% { transform: translateY(0) scaleY(.82) scaleX(1.1); }
      80% { transform: translateY(-2.5px) scaleY(1.02); }
      100% { transform: none; }
    }
    @media (prefers-reduced-motion: reduce) {
      .ball.in { animation: none; }
      .ball.out { animation: none; display: none; }
    }
  `],
})
export class FedBall {
  protected seams = VOLLEY_BALL_SEAMS;
  /** Region colorway (tuned palette lives in FederationState). */
  color = input('#ff6b35');
  /** Ball size in px (the roundel uses 21 inside its 38px circle). */
  size = input(21);

  protected layers = signal<BallLayer[]>([]);
  private nextId = 1;

  constructor() {
    effect(() => {
      const c = this.color();
      untracked(() => {
        const cur = this.layers();
        const top = cur.find((l) => l.state !== 'out');
        if (!top) { this.layers.set([{ id: this.nextId++, color: c, state: 'idle' }]); return; }
        if (top.color === c) return;
        // dribble swap: mark the current ball out, drop the new one in
        this.layers.set([
          ...cur.filter((l) => l.state !== 'out').map((l) => ({ ...l, state: 'out' as const })),
          { id: this.nextId++, color: c, state: 'in' as const },
        ]);
        setTimeout(() => this.layers.update((ls) => ls.filter((l) => l.state !== 'out')), 700);
      });
    });
  }
}
