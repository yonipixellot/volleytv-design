import { Component, input, output } from '@angular/core';
import { HaloIcon } from '../../atoms/icon/icon';
import { TPipe } from '../../../app/i18n/t.pipe';

/** Editorial section header — tick + rule + title, optional count and "See all" (.esec). */
@Component({
  // `title` is a global HTML attribute, so a static `title="…"` in a caller's
  // template stays on the HOST and the browser raises its own tooltip over the
  // component — duplicating text already on screen (Maryna 2026-08-30). The
  // input keeps its natural name; the host simply stops carrying it.
  host: { '[attr.title]': 'null' },
  selector: 'halo-section-header',
  standalone: true,
  imports: [HaloIcon, TPipe],
  template: `
    <div class="esec">
      <span class="tk" [class]="tone()"></span>
      <h2>{{ title() }}</h2>
      <span class="rl" [class]="tone()"></span>
      @if (count()) { <span class="cnt">{{ count() }}</span> }
      @if (sub()) { <span class="sub">{{ sub() }}</span> }
      @if (seeAll()) {
        <button class="seeall" type="button" (click)="seeAllClick.emit()">{{ 'sec.seeAll' | t }} <halo-icon name="chevron-right" [size]="14" /></button>
      }
    </div>
  `,
  styleUrl: './section-header.scss',
})
export class SectionHeader {
  title = input.required<string>();
  count = input('');
  sub = input('');
  seeAll = input(false);
  tone = input<'accent' | 'def' | 'live' | 'past'>('accent');
  seeAllClick = output<void>();
}
