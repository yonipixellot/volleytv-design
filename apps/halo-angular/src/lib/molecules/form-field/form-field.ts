import { Component, input, model } from '@angular/core';

/**
 * Labelled form input (flat BA). Two-way bound via `value`.
 * Supports `hint`, `error` (turns the field red + shows the message),
 * `disabled` (read-only display of a value the user can't change yet), and a
 * projected right-slot (e.g. a Show/Hide password toggle) via
 * `<halo-form-field><button slot-right>…</button></halo-form-field>`.
 */
@Component({
  selector: 'halo-form-field',
  standalone: true,
  template: `
    <label class="ff">
      <span class="lbl" [id]="uid + '-l'">{{ label() }}</span>
      <span class="wrap" [class.err]="!!error()" [class.off]="disabled() || readonly()">
        <input
          class="inp"
          [attr.aria-labelledby]="uid + '-l'"
          [attr.aria-describedby]="(error() || hint()) ? uid + '-m' : null"
          [attr.aria-invalid]="error() ? true : null"
          [readonly]="readonly()"
          [type]="type()"
          [attr.inputmode]="inputmode() || null"
          [attr.placeholder]="placeholder()"
          [attr.autocomplete]="autocomplete() || null"
          [value]="value()"
          [class.empty]="!value()"
          [disabled]="disabled()"
          (input)="value.set($any($event.target).value)"
        />
        <span class="right"><ng-content select="[slot-right]" /></span>
      </span>
      @if (error()) {
        <span class="msg err" [id]="uid + '-m'" role="alert">{{ error() }}</span>
      } @else if (hint()) {
        <span class="msg" [id]="uid + '-m'">{{ hint() }}</span>
      }
    </label>
  `,
  styleUrl: './form-field.scss',
})
export class FormField {
  label = input('');
  value = model('');
  type = input('text');
  placeholder = input('');
  hint = input('');
  /** Read-only display (value reachable/selectable, not editable) — prefer over `disabled` for showing data. */
  readonly = input(false);
  private static seq = 0;
  /** Stable per-instance id: the label names the input (aria-labelledby) so the hint/error
   *  can be a DESCRIPTION (aria-describedby) instead of leaking into the name (a11y audit G26). */
  protected readonly uid = 'ff' + (++FormField.seq);
  error = input<string | null>(null);
  /** Read-only: the value is shown but can't be edited (no editing flow yet). */
  disabled = input(false);
  inputmode = input('');
  autocomplete = input('');
}
