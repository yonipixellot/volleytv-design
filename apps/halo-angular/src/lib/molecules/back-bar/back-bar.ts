import { Component, input, model, output } from '@angular/core';
import { HaloIcon } from '../../atoms/icon/icon';
import { TPipe } from '../../../app/i18n/t.pipe';

/** Sticky top bar for detail screens — back button + the matchup, optional follow bell. */
@Component({
  selector: 'halo-back-bar',
  standalone: true,
  imports: [HaloIcon, TPipe],
  template: `
    <div class="bb">
      <button class="back" type="button" [attr.aria-label]="'common.back' | t" (click)="back.emit()">
        <halo-icon name="chevron-left" [size]="16" />
      </button>
      <!-- text-only matchup — no crests in the top bar (Yoni 2026-08-22) -->
      <div class="match">
        <span class="nm">{{ homeName() }}</span>
        <span class="vs">{{ 'common.vs' | t }}</span>
        <span class="nm">{{ awayName() }}</span>
      </div>
      @if (showBell()) {
        <button class="bell" type="button" [class.on]="notify()" [attr.aria-label]="'bar.followGame' | t"
                [attr.aria-pressed]="notify()" (click)="notify.set(!notify())">
          <halo-icon name="bell" [size]="16" />
        </button>
      } @else {
        <!-- Balances the back button so the title sits at true center. -->
        <span class="spacer" aria-hidden="true"></span>
      }
    </div>
  `,
  styleUrl: './back-bar.scss',
})
export class BackBar {
  homeName = input('');
  awayName = input('');
  homeCrest = input('');
  awayCrest = input('');
  homeMono = input('?');
  awayMono = input('?');
  showBell = input(false);
  notify = model(false);
  back = output<void>();
}
