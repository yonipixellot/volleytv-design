import { Component, input, output } from '@angular/core';
import { HaloIcon } from '../../atoms/icon/icon';
import { t } from '../../../app/i18n/i18n';

/**
 * 16:9 video card in the home-rail language — poster with a gold play button
 * bottom-left, kind chip top-left, duration bottom-right, and the title / sub
 * in a footer BELOW the frame (so it reads as a member of the media-card family).
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
  selector: 'halo-video-embed',
  standalone: true,
  imports: [HaloIcon],
  template: `
    <button class="ve halo-media-card" type="button" (click)="open.emit()" [attr.aria-label]="kindLabel() + ' · ' + title()">
      <span class="th">
        @if (poster() && !imgFailed) {
          <img class="poster" [src]="poster()" alt="" (error)="imgFailed = true" />
        } @else {
          <span class="thfall" aria-hidden="true"><halo-icon name="play" [size]="26" /></span>
        }
        <span class="scr"></span>
        @if (kindLabel()) { <span class="kind">{{ kindLabel() }}</span> }
        <span class="play halo-media-play"><halo-icon name="play" [size]="18" /></span>
        @if (duration()) { <span class="dur">{{ duration() }}</span> }
      </span>
      <span class="foot">
        <span class="ttl">{{ title() }}</span>
        @if (sub()) { <span class="sub">{{ sub() }}</span> }
      </span>
    </button>
  `,
  styleUrl: './video-embed.scss',
})
export class VideoEmbed {
  imgFailed = false;
  kindLabel = input(t('embed.fullGame169'));
  title = input('');
  sub = input('');
  duration = input('');
  poster = input('');
  open = output<void>();
}
