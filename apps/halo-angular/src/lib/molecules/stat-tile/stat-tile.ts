import { Component, input } from '@angular/core';

/** Compact metric tile (.mblock): label + comparison tag, then number + inline
    delta. Sized to sit tight beside the gauge and height-balance it (option B). */
@Component({
  selector: 'halo-stat-tile',
  standalone: true,
  template: `
    <div class="mblock">
      <div class="mb-top">
        <!-- Full name at width, abbreviation below 768: the row holds the label
             and its comparison tag side by side, and "Free throw" was the one
             that lost the fight and truncated to "FREE THR…". -->
        <span class="mb-lab mb-lab-full">{{ label() }}</span>
        @if (short()) { <span class="mb-lab mb-lab-short">{{ short() }}</span> }
        @if (tag()) { <span class="mb-tag">{{ tag() }}</span> }
      </div>
      <div class="mb-val">
        <span class="mb-num num">{{ value() }}</span>
        @if (delta()) { <span class="mb-delta" [class.flat]="tone() === 'flat'">{{ delta() }}</span> }
      </div>
    </div>
  `,
  styleUrl: './stat-tile.scss',
})
export class StatTile {
  label = input.required<string>();
  /** The metric's abbreviation, shown INSTEAD of `label` below 768. */
  short = input('');
  value = input.required<string | number>();
  tag = input('');
  delta = input('');
  tone = input<'up' | 'flat'>('up');
}
