import { Component, input, model } from '@angular/core';
import { Crest } from '../../atoms/crest/crest';
import { Avatar } from '../../atoms/avatar/avatar';
import { HaloIcon } from '../../atoms/icon/icon';
import { TPipe } from '../../../app/i18n/t.pipe';

/**
 * Follow row for the onboarding team/player pickers: a leading mark, name +
 * meta, and a Follow pill that toggles `followed`. When `showBell` is set
 * (player rows) a notify bell appears once followed.
 *
 * `kind` picks the mark, and it is NOT cosmetic: the app reads shape as type
 * (see avatar.ts) — a circle is a PERSON, a rounded plate is a CLUB or TEAM.
 * Player rows rendered a crest until 2026-08-27, which made teammates look like
 * clubs and contradicted the same list on the Following screen.
 */
@Component({
  selector: 'halo-follow-row',
  standalone: true,
  imports: [Crest, Avatar, HaloIcon, TPipe],
  template: `
    <div class="fr" [class.on]="followed()">
      @if (kind() === 'person') {
        <halo-avatar [src]="crest()" [monogram]="mono()" [size]="42" />
      } @else {
        <halo-crest [src]="crest()" [monogram]="mono()" [size]="42" />
      }
      <span class="txt">
        <span class="nm">{{ name() }}</span>
        @if (meta()) { <span class="meta">{{ meta() }}</span> }
      </span>

      @if (showBell() && followed()) {
        <button class="bell" type="button" [class.on]="notify()"
                [attr.aria-pressed]="notify()" [attr.aria-label]="'row.notifsFor' | t: { name: name() }"
                (click)="notify.set(!notify())">
          <halo-icon name="bell" [size]="16" />
        </button>
      }

      <button class="follow halo-follow-pill" type="button" [class.on]="followed()"
              [attr.aria-pressed]="followed()" [attr.aria-label]="(followed() ? 'row.unfollow' : 'row.follow') | t: { name: name() }"
              (click)="followed.set(!followed())">
        {{ followed() ? ('common.unfollow' | t) : ('common.follow' | t) }}
      </button>
    </div>
  `,
  styleUrl: './follow-row.scss',
})
export class FollowRow {
  name = input('');
  meta = input('');
  /** 'person' → circular avatar, 'team' → rounded club plate. */
  kind = input<'team' | 'person'>('team');
  crest = input('');
  mono = input('?');
  showBell = input(false);
  followed = model(false);
  notify = model(false);
}
