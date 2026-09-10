import { Component, computed, inject, input, output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

export type SocialProvider = 'apple' | 'google';

/** OAuth CTA — provider glyph + label on a quiet card surface. */
@Component({
  selector: 'halo-social-button',
  standalone: true,
  template: `
    <button class="sbtn" type="button" [disabled]="disabled()" (click)="press.emit()">
      <span class="ic" [innerHTML]="glyph()"></span>
      {{ label() }}
    </button>
  `,
  styleUrl: './social-button.scss',
})
export class SocialButton {
  provider = input<SocialProvider>('apple');
  /** Full label, e.g. "Continue with Apple" / "Sign up with Google". */
  label = input('Continue');
  disabled = input(false);
  press = output<void>();

  private san = inject(DomSanitizer);
  glyph = computed(() =>
    this.san.bypassSecurityTrustHtml(this.provider() === 'apple' ? APPLE : GOOGLE),
  );
}

// Apple mark — inherits currentColor (ink).
const APPLE = `<svg viewBox="0 0 20 20" width="17" height="17" fill="currentColor" aria-hidden="true"><path d="M13.6 10.6c0-1.9 1.5-2.8 1.6-2.9-.9-1.3-2.2-1.5-2.7-1.5-1.1-.1-2.2.7-2.8.7-.6 0-1.5-.7-2.4-.6-1.2 0-2.4.7-3 1.8-1.3 2.2-.3 5.5.9 7.3.6.9 1.3 1.9 2.2 1.8.9 0 1.2-.6 2.3-.6s1.4.6 2.4.6c1 0 1.6-.9 2.2-1.8.7-1 1-2 1-2.1 0-.1-1.9-.7-1.9-3zM11.9 4.9c.5-.6.8-1.5.7-2.4-.7 0-1.6.5-2.1 1.1-.5.5-.9 1.4-.8 2.3.8.1 1.6-.4 2.2-1z"/></svg>`;

// Google "G" — brand quadrants.
const GOOGLE = `<svg viewBox="0 0 20 20" width="17" height="17" aria-hidden="true"><path fill="#4285F4" d="M19.6 10.2c0-.7-.1-1.4-.2-2H10v3.8h5.4c-.2 1.2-.9 2.3-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"/><path fill="#34A853" d="M10 20c2.7 0 4.9-.9 6.6-2.4l-3.2-2.5c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.7-5.6-4.1H1.1v2.6C2.8 17.8 6.1 20 10 20z"/><path fill="#FBBC05" d="M4.4 11.9c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V5.5H1.1C.4 6.9 0 8.4 0 10s.4 3.1 1.1 4.5l3.3-2.6z"/><path fill="#EA4335" d="M10 4c1.5 0 2.8.5 3.8 1.5l2.8-2.8C14.9 1.1 12.7 0 10 0 6.1 0 2.8 2.2 1.1 5.5l3.3 2.6C5.2 5.7 7.4 4 10 4z"/></svg>`;
