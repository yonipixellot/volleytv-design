import { Component, input, output } from '@angular/core';
import { HaloIcon } from '../../atoms/icon/icon';
import { Score } from '../../atoms/score/score';

/**
 * Media rail card (.vcard) for "Full games" and "Game highlights".
 * Real 16:9 thumbnail with a gold play button + duration; footer date, title
 * (Inter) with an optional gold score, and a sub line.
 */
/* The subtitle is plain text since 2026-08-27: the whole card is one button
   that opens the video, so linkifying team names inside it made a single tap
   mean two destinations. */
@Component({
  // `title` is a global HTML attribute, so a static `title="…"` in a caller's
  // template stays on the HOST and the browser raises its own tooltip over the
  // component — duplicating text already on screen (Maryna 2026-08-30). The
  // input keeps its natural name; the host simply stops carrying it.
  host: { '[attr.title]': 'null' },
  selector: 'halo-rail-card',
  standalone: true,
  imports: [HaloIcon, Score],
  template: `
    <button class="vcard halo-media-card" type="button" (click)="open.emit()">
      <div class="th">
        @if (thumb() && !imgFailed) {
          <img [src]="thumb()" [alt]="title()" (error)="imgFailed = true" />
        } @else {
          <span class="thfall" aria-hidden="true"><halo-icon name="play" [size]="26" /></span>
        }
        <div class="scr"></div>
        <span class="pl halo-media-play"><halo-icon name="play" [size]="20" /></span>
        @if (duration()) { <span class="dur num">{{ duration() }}</span> }
      </div>
      <div class="ft">
        @if (date()) { <div class="dt">{{ date() }}</div> }
        <div class="nm">
          <span class="nm-t">{{ title() }}</span>
          @if (score()) { <halo-score class="sc" [pair]="score()" /> }
        </div>
        <div class="sub">{{ sub() }}</div>
      </div>
    </button>
  `,
  styleUrl: './rail-card.scss',
})
export class RailCard {
  imgFailed = false;
  title = input.required<string>();
  sub = input('');
  date = input('');
  score = input('');
  duration = input('');
  thumb = input('img/game-1.webp');
  open = output<void>();
}
