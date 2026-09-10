/**
 * Identity provider — "Volley TV Club iD" (a placeholder provider for the dummy).
 *
 * Sign-in is not a Halo screen: the provider serves its own page and we embed
 * it 1:1, unstyled and un-themed, in both light and dark (Maryna 2026-08-27).
 * This constant is the only handle we have on it, which is also why it lives
 * next to the brand presets rather than inside a page.
 */
export const IDP_SIGN_IN_URL = 'https://halo.pixellot.tv/auth/sign-in';

/**
 * A picture of the provider's sign-in card — the placeholder the app renders
 * instead of embedding their page. See halo-auth-embed for why a picture is the
 * right call here rather than a re-measured crop.
 *
 * Cropped tight to the white card, no surrounding canvas: the frame supplies the
 * corner radius and the shadow, so the artwork itself needs neither.
 */
export const IDP_SIGN_IN_SHOT = 'img/idp/club-id-sign-in.svg';

/**
 * The provider's SECOND card: the one-time code screen their page shows after
 * the email. Same status as the first — a picture of somebody else's page, not
 * a form of ours. It exists because the round-trip is two screens, and standing
 * in for it with one made the tap look like a sign-in that never asked for the
 * code (Maryna 2026-08-30).
 */
export const IDP_CODE_SHOT = 'img/idp/club-id-code.svg';

/**
 * The live embed's measurements, kept with the provider rather than in a page —
 * they are facts about halo.pixellot.tv, not about our layout. Only in play if
 * IDP_SIGN_IN_SHOT is dropped and the iframe comes back.
 *
 * We show their CARD and nothing else: not their brand panel (this screen
 * already carries our lockup) and not their page canvas (we already have a
 * background). `cropLeft` is the inset their page puts around the card, handed
 * back so the card fills our column. Measured at phone width, and that is the
 * whole problem — they drift the moment the column is wider or the provider
 * changes that page. The durable fix is an embed mode (or a postMessage height)
 * from whoever owns halo.pixellot.tv.
 */
export const IDP_SIGN_IN_CROP = { cropTop: 359, cropLeft: 42, height: 462 } as const;
