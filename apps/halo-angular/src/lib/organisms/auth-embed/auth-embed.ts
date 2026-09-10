import { Component, input } from '@angular/core';

/**
 * The identity provider's sign-in card — a PICTURE of it, on purpose.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FOR DEVELOPERS: THIS IS WHERE THE PROVIDER'S IFRAME GOES.
 *
 * In the product this slot holds an <iframe> of the identity provider's own
 * sign-in page (`IDP_SIGN_IN_URL` in lib/brand/idp.ts), rendered 1:1 — never
 * restyled, re-themed or rebuilt by us. Here it is a still image, so the
 * prototype has no third-party request, no cross-origin surprises and nothing
 * that can be typed into.
 *
 * The prototype embedded it for real and this is why it stopped: their page
 * wraps the card in a brand panel above and a tinted canvas either side, and
 * cross-origin we can neither scroll their document nor mask inside it. The
 * only lever is to render the frame larger than its window and pull it up and
 * left by a measured crop — three constants (kept in idp.ts as
 * IDP_SIGN_IN_CROP) taken at ONE column width. Widen the column and their card
 * no longer fills the window, so their canvas shows as a tinted edge around
 * ours. Re-measuring only moves the width at which that happens.
 *
 * The durable fix is an embed mode, or a postMessage height, from whoever owns
 * halo.pixellot.tv. Until then: picture here, iframe when the real thing lands.
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Component({
  selector: 'halo-auth-embed',
  standalone: true,
  template: `
    <!-- Decorative: the button wrapping this screen is already named by its own
         visible text ("Sign in with Australian Basketball iD · Preview · tap to
         sign in"), so describing the picture would announce the same thing a
         second time. -->
    <img class="shot" [src]="shotSrc()" alt="" />
  `,
  styleUrl: './auth-embed.scss',
})
export class AuthEmbed {
  /** Picture of the provider's card. Artwork carries its own rounded corners,
   *  its own hairline and transparent corners — so this component adds no
   *  frame of its own, only the shadow that floats it. */
  shotSrc = input.required<string>();
}
