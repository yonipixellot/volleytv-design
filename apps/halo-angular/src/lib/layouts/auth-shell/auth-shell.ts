import { Component, input } from '@angular/core';
import { ClientLogo } from '../../atoms/client-logo/client-logo';

/**
 * Auth screen frame — branded dark canvas with a soft accent glow up top, the
 * client logo centred, and a capped form column. Content is projected in.

 */
@Component({
  selector: 'halo-auth-shell',
  standalone: true,
  imports: [ClientLogo],
  template: `
    <div class="auth">
      <div class="col">
        <div class="brand">
          <div class="brand-card">
            <!-- Official artwork goes in as a plain <img> sized in CSS, the same
                 element and the same token the provider sign-in screen uses. Routed
                 through halo-client-logo it carried an inline pixel height, which no
                 stylesheet can answer per breakpoint — that is how the two screens
                 ended up with two different lockups. -->
            @if (logoSrc()) {
              <img class="brand-lockup" [src]="logoSrc()" [alt]="clientName()" />
            } @else {
              <halo-client-logo [svg]="logoSvg()" [name]="clientName()" [height]="96" />
            }
          </div>
        </div>
        <div class="form"><ng-content /></div>
      </div>
    </div>
  `,
  styleUrl: './auth-shell.scss',
})
export class AuthShell {
  logoSvg = input('');
  /** Image logo (rendered verbatim — official artwork must not be recoloured). */
  logoSrc = input('');
  clientName = input('Halo');
}
