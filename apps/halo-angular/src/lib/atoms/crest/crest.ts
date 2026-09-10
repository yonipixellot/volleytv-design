import { Component, input } from '@angular/core';

/** Team crest tile. Shows a logo image when `src` is set, else a monogram on a rounded green tile. */
@Component({
  selector: 'halo-crest',
  standalone: true,
  template: `
    <span class="crest" [class.mono]="!src() || imgFailed" [style.width.px]="size()" [style.height.px]="size()"
          [style.borderRadius.px]="size() * 0.27">
      @if (src() && !imgFailed) {
        <img [src]="src()" [alt]="alt()" (error)="imgFailed = true" />
      } @else {
        <span class="mono-t" [style.fontSize.px]="size() * 0.42">{{ monogram() }}</span>
      }
    </span>
  `,
  styleUrl: './crest.scss',
})
export class Crest {
  imgFailed = false;
  src = input<string>('');
  monogram = input('H1');
  alt = input('');
  size = input(44);
}
