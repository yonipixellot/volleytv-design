import { Component, input, model } from '@angular/core';
import { t } from '../../../app/i18n/i18n';

export interface SelectOption { value: string; label: string; }

/** Labelled native select, styled to match halo-form-field.
 *  API parity with form-field: `hint`, `error` (red field + message), `disabled`. */
@Component({
  selector: 'halo-form-select',
  standalone: true,
  template: `
    <label class="fs" [class.disabled]="disabled()">
      <span class="lbl" [id]="uid + '-l'">{{ label() }}</span>
      <span class="wrap" [class.placeholder]="!value()" [class.err]="!!error()">
        <select class="sel" [value]="value()" [disabled]="disabled()" [attr.autocomplete]="autocomplete() || null"
          [attr.aria-labelledby]="uid + '-l'" [attr.aria-describedby]="(error() || hint()) ? uid + '-m' : null" [attr.aria-invalid]="error() ? true : null"
                (change)="value.set($any($event.target).value)">
          <option value="" disabled hidden>{{ placeholder() }}</option>
          @for (o of options(); track o.value) {
            <option [value]="o.value">{{ o.label }}</option>
          }
        </select>
        <svg class="chev" viewBox="0 0 14 14" width="13" height="13" fill="none"
             stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3.5 5 L7 8.5 L10.5 5" />
        </svg>
      </span>
      @if (error()) {
        <span class="msg err" [id]="uid + '-m'" role="alert">{{ error() }}</span>
      } @else if (hint()) {
        <span class="msg" [id]="uid + '-m'">{{ hint() }}</span>
      }
    </label>
  `,
  styleUrl: './form-select.scss',
})
export class FormSelect {
  label = input('');
  value = model('');
  placeholder = input(t('auth.select'));
  options = input<SelectOption[]>([]);
  hint = input('');
  private static seq = 0;
  protected readonly uid = 'fs' + (++FormSelect.seq);
  error = input<string | null>(null);
  disabled = input(false);
  /** HTML autocomplete token (1.3.5 Identify Input Purpose), e.g. 'sex', 'country-name'. */
  autocomplete = input('');
}
