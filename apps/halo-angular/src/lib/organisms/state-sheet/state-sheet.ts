import { Component, ElementRef, inject, input, output } from '@angular/core';
import { HaloIcon } from '../../atoms/icon/icon';
import { Crest } from '../../atoms/crest/crest';
import { ClientLogo } from '../../atoms/client-logo/client-logo';
import { VOLLEYTV_MARK_STACKED_SVG, VOLLEYTV_NAME } from '../../brand/volleytv-preset';
import { StateInfo, StateCode } from '../../../app/federation-state';
import { TPipe } from '../../../app/i18n/t.pipe';

/**
 * Region picker — the sheet behind the header brandmark switcher (proto
 * WatchScreen StatePicker). Lists the tenant's "all regions" sentinel plus the
 * regional leagues (crest + name), the
 * active one checked. Picking one re-brands the header + re-scopes content.
 * Bottom sheet to match the app's other pickers (share / premium / a11y).
 *
 * Titled "Change state/territory", not "Your association" (2026-08-27):
 * "State" is already the app's user-facing word for this dimension — the browse
 * filters in onboarding and Manage following are labelled State with
 * NSW/QLD/VIC/SA values — while "association" appeared nowhere else in the
 * product, and "competition" (the old trigger aria-label) already means a
 * different thing here entirely (events-data.ts: 'Monday Men 14 - 2026
 * Winter'). Verb-led on purpose, unlike the plain-noun a11y sheet: this
 * switcher re-brands the whole app, so the title states the action rather than
 * reading as a label for the current value.
 */
@Component({
  selector: 'halo-state-sheet',
  standalone: true,
  imports: [HaloIcon, Crest, ClientLogo, TPipe],
  template: `
    @if (open()) {
      <div class="scrim" (click)="close.emit()"></div>
      <!-- aria-label spells out "or" where the visible title uses a slash:
           screen readers announce "/" inconsistently (often literally as
           "slash"), and "State/Territory" is the idiomatic written form in AU. -->
      <div #sheet class="sheet" role="dialog" aria-modal="true" [attr.aria-label]="'state.changeA11y' | t" tabindex="-1" (keydown)="onKey($event)">
        <header class="top">
          <h2>{{ 'state.change' | t }}</h2>
          <button class="x" type="button" [attr.aria-label]="'common.close' | t" (click)="close.emit()"><halo-icon name="close" [size]="18" /></button>
        </header>

        <div class="opts" role="listbox" [attr.aria-label]="'state.list' | t">
        <button class="row" type="button" role="option" [class.on]="selected() === null" [attr.aria-selected]="selected() === null" (click)="pick.emit(null)">
          <!-- Tenant emblem, not a monogram (Yoni 2026-08-23) -->
          <span class="balogo"><halo-client-logo [svg]="baLogo" [name]="allName" [height]="30" /></span>
          <!-- "Australia-wide" sub (2026-08-27): this row is the all-states
               sentinel, and under a title naming a state/territory it has to
               say so — the 8 rows below use the same slot for their code. -->
          <span class="tx"><span class="nm">{{ allName }}</span><span class="sub">{{ 'state.auWide' | t }}</span></span>
          @if (selected() === null) { <halo-icon class="ck" name="check" [size]="17" /> }
        </button>

        <div class="divider"></div>

        @for (s of states(); track s.code) {
          <button class="row" type="button" role="option" [class.on]="s.code === selected()" [attr.aria-selected]="s.code === selected()" (click)="pick.emit(s.code)">
            <halo-crest [src]="s.crest" [size]="34" />
            <span class="tx"><span class="nm">{{ s.name }}</span><span class="sub">{{ s.code }}</span></span>
            @if (s.code === selected()) { <halo-icon class="ck" name="check" [size]="17" /> }
          </button>
        }
        </div>
      </div>
    }
  `,
  styleUrl: './state-sheet.scss',
})
export class StateSheet {
  protected baLogo = VOLLEYTV_MARK_STACKED_SVG;
  protected allName = VOLLEYTV_NAME;
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  open = input(false);
  states = input<StateInfo[]>([]);
  selected = input<StateCode | null>(null);

  close = output<void>();
  pick = output<StateCode | null>();

  protected onKey(e: KeyboardEvent): void {
    if (e.key === 'Escape') this.close.emit();
  }
}
