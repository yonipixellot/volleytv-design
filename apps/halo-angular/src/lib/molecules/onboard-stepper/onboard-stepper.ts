import { Component, computed, input, output } from '@angular/core';
import { HaloIcon } from '../../atoms/icon/icon';
import { TPipe } from '../../../app/i18n/t.pipe';

/** Onboarding header — optional back button, "Step X of Y" label, progress bar. */
@Component({
  selector: 'halo-onboard-stepper',
  standalone: true,
  imports: [HaloIcon, TPipe],
  template: `
    <div class="stp">
      <div class="row">
        @if (showBack()) {
          <button class="back" type="button" [attr.aria-label]="'common.back' | t" (click)="back.emit()">
            <halo-icon name="chevron-left" [size]="15" />
          </button>
        } @else { <span class="spacer"></span> }
        <span class="lbl">{{ label() || ('auth.stepOf' | t: { n: step(), total: total() }) }}</span>
        <span class="spacer"></span>
      </div>
      <div class="track"><div class="fill" [style.width.%]="pct()"></div></div>

      <!-- The named journey, wide screens only (see the .scss). The bar says how
           far along you are; it never said what is coming, and on a 5-step coach
           flow that is the difference between "nearly there" and "no idea".
           Hidden on a phone, where the row has no width to spend on it. -->
      @if (names().length) {
        <ol class="names" aria-hidden="true"
            [style.--steps]="names().length" [style.--progress]="progress()">
          @for (n of names(); track n; let i = $index) {
            <li class="nm" [class.done]="i + 1 < step()" [class.now]="i + 1 === step()">
              <span class="rail">
                <span class="dot">
                  @if (i + 1 < step()) {
                    <halo-icon name="check" [size]="12" [strokeWidth]="3.2" />
                  } @else {
                    {{ i + 1 }}
                  }
                </span>
              </span>
              <span class="nm-t">{{ n }}</span>
            </li>
          }
        </ol>
      }
    </div>
  `,
  styleUrl: './onboard-stepper.scss',
})
export class OnboardStepper {
  step = input(1);
  total = input(3);
  label = input('');
  /** Step names, longest-flow aware. Empty renders nothing — the bar alone. */
  names = input<string[]>([]);
  showBack = input(false);
  back = output<void>();

  pct = computed(() => Math.max(0, Math.min(100, (this.step() / this.total()) * 100)));

  /**
   * How far along the named rail the fill sits, 0–1, measured dot centre to dot
   * centre — so step 1 is an empty rail and the last step a full one.
   *
   * The rail is drawn as ONE line with ONE transition rather than a chain of
   * per-step segments. Chained segments have to hand over mid-rail, and every
   * hand-over is a point where an eased segment decelerates to a stop before the
   * next accelerates from rest: the fill visibly stalls at the midpoint. There is
   * no seam here to smooth because there is no seam.
   */
  progress = computed(() => {
    const last = Math.max(1, this.names().length - 1);
    return Math.max(0, Math.min(1, (this.step() - 1) / last));
  });
}
