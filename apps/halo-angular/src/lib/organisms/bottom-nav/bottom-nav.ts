import { Component, input, output } from '@angular/core';
import { HaloIcon, IconName } from '../../atoms/icon/icon';
import { t } from '../../../app/i18n/i18n';

export interface NavItem { key: string; label: string; icon: IconName; dot?: boolean; locked?: boolean; }

const DEFAULT_ITEMS: NavItem[] = [
  { key: 'home', label: t('nav.home'), icon: 'home' },
  { key: 'games', label: t('nav.games'), icon: 'games' },
  { key: 'you', label: t('nav.you'), icon: 'user' },
];

/** Floating bottom tab bar (.nav). Active tab highlights with the accent. */
@Component({
  selector: 'halo-bottom-nav',
  standalone: true,
  imports: [HaloIcon],
  template: `
    <nav class="nav">
      @for (it of items(); track it.key) {
        <button class="ni" type="button" [class.on]="it.key === active()" [class.locked]="it.locked" (click)="select.emit(it.key)">
          <span class="nic">
            <halo-icon [name]="it.icon" [size]="19" />
            @if (it.locked) { <span class="lk"><halo-icon name="lock" [size]="10" /></span> }
          </span>
          {{ it.label }}
          @if (it.dot) { <span class="dot"></span> }
        </button>
      }
    </nav>
  `,
  styleUrl: './bottom-nav.scss',
})
export class BottomNav {
  items = input<NavItem[]>(DEFAULT_ITEMS);
  active = input<string>('home');
  select = output<string>();
}
