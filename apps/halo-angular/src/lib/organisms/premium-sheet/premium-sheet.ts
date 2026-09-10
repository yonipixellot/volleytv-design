import { Component, computed, input, output, signal } from '@angular/core';
import { HaloIcon } from '../../atoms/icon/icon';
import { HaloButton } from '../../atoms/button/button';
import { t } from '../../../app/i18n/i18n';
import { TPipe } from '../../../app/i18n/t.pipe';

export interface SheetPlan { id: string; term: string; price: string; blurb: string; badge?: string; }

/**
 * PremiumSheet — the slide-up Premium package picker (from the wireframe PT):
 * hero headline + benefit bullets + selectable plan cards + a primary "Unlock
 * Halo Premium · $X" CTA and a "Maybe later" dismiss. Pure organism: plans arrive
 * as input, selection is emitted via `unlock`; the app routes that into the
 * /upgrade payment flow. Accessible dialog (labelled, Esc + backdrop close).
 */
@Component({
  selector: 'halo-premium-sheet',
  standalone: true,
  imports: [HaloIcon, HaloButton, TPipe],
  template: `
    @if (open()) {
      <div class="scrim" (click)="close.emit()"></div>
      <div class="sheet" role="dialog" aria-modal="true" [attr.aria-label]="'watch.upgradeToPremium' | t"
           tabindex="-1" (keydown)="onKey($event)">
        <span class="grip" aria-hidden="true"></span>

        <h2 class="hd">{{ 'prem.title' | t }}</h2>
        <p class="sub">{{ 'prem.sub' | t }}</p>

        <ul class="benes">
          @for (b of bullets; track b) {
            <li><halo-icon name="check" [size]="15" /> {{ b }}</li>
          }
        </ul>

        <div class="plans">
          @for (p of plans(); track p.id) {
            <button class="plan" type="button" [class.on]="p.id === sel()" (click)="sel.set(p.id)">
              @if (p.badge) { <span class="badge">{{ p.badge }}</span> }
              <span class="term">{{ p.term }}</span>
              <span class="price">{{ p.price }}</span>
              <span class="blurb">{{ p.blurb }}</span>
              <span class="tick" aria-hidden="true"><halo-icon name="check" [size]="13" /></span>
            </button>
          }
        </div>

        <div class="acts">
          <halo-button variant="premium" [block]="true" (press)="unlock.emit(sel())">
            {{ 'prem.unlock' | t: { price: current().price } }}
          </halo-button>
          <halo-button variant="ghost" [block]="true" (press)="close.emit()">{{ 'ob.maybeLater' | t }}</halo-button>
        </div>
      </div>
    }
  `,
  styleUrl: './premium-sheet.scss',
})
export class PremiumSheet {
  open = input(false);
  plans = input<SheetPlan[]>([]);
  selected = input('');

  close = output<void>();
  unlock = output<string>();

  protected bullets = [
    t('prem.b1'),
    t('prem.b2'),
    t('prem.b3'),
  ];

  protected sel = signal('6mo');
  protected current = computed(() => this.plans().find((p) => p.id === this.sel()) ?? this.plans()[0] ?? { price: '' } as SheetPlan);

  protected onKey(e: KeyboardEvent): void {
    if (e.key === 'Escape') this.close.emit();
  }
}
