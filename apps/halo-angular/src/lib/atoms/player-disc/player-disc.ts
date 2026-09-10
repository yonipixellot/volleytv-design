import { Component, input } from '@angular/core';

/** Player profile disc (.pav/.pdisc): brand-core fill with the outlined number,
    optionally inside a lime brand ring.

    `ring` is OFF on the You card since 2026-08-27: a lime ring is the app's
    story-rail signal for "unseen content, tap me" (halo-stories-rail flips it
    via `.unseen`), and the card's disc is neither tappable nor content — so it
    promised an action that doesn't exist and diluted the signal where it's
    real. Kept as an input because the ring still earns its place wherever the
    disc IS a story/portrait affordance. */
@Component({
  selector: 'halo-player-disc',
  standalone: true,
  template: `
    <span class="pdisc" [class.noring]="!ring()" [style.width.px]="size()" [style.height.px]="size()">
      <span class="n" [style.fontSize.px]="size() * 0.53">{{ number() }}</span>
    </span>
  `,
  styleUrl: './player-disc.scss',
})
export class PlayerDisc {
  number = input<string | number>(7);
  size = input(70);
  /** Draw the lime brand ring + gap around the fill. */
  ring = input(true);
}
