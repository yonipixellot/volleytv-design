import { Injectable, computed, signal } from '@angular/core';
import {
  VOLLEYTV_LOGO_SRC, VOLLEYTV_NAME,
  VOLLEYTV_BRANDMARK_CORAL_SRC, VOLLEYTV_BRANDMARK_TEAL_SRC,
  VOLLEYTV_WORDMARK_CORAL_SRC, VOLLEYTV_WORDMARK_TEAL_SRC,
} from '../lib/brand/volleytv-preset';
import { IDP_SIGN_IN_SHOT, IDP_CODE_SHOT, IDP_SIGN_IN_URL } from '../lib/brand/idp';

/**
 * WHO THIS DEPLOYMENT IS.
 *
 * Everything a second tenant would otherwise have to fork: the skin attribute,
 * the brand name, the four lockup files, and the identity provider. It exists
 * because the answer used to be spread across the codebase as literals —
 * `data-skin="hoopstv"` hardcoded on the shell, and `HOOPSTV_*` constants (this fork ships Volley TV)
 * imported directly by the app header and all seven auth screens. The token
 * layer was already white-label; this is the layer above it (Maryna 2026-08-30).
 *
 * A NEW TENANT IS A NEW `TenantBrand` OBJECT plus a skin block in `_tokens.scss`
 * and its artwork. No shared component changes, and no page changes.
 *
 * Runtime, not build-time, on purpose: the admin app already injects
 * `--primary` / `--secondary` inline on the `.halo` root, and `use()` is the
 * same door for the rest of the identity. Signals, so a swap re-renders.
 */
export interface TenantIdp {
  /** The provider's own name, as the user meets it on the sign-in screen. */
  name: string;
  /** Their hosted page, for when the iframe replaces our stand-in pictures. */
  url: string;
  /** Stand-in shots of the provider's two steps: email, then one-time code. */
  signInShot: string;
  codeShot: string;
}

export interface TenantBrand {
  /** The `data-skin` value — must match a skin block in `_tokens.scss`. */
  skin: string;
  /** Display name, used wherever the product names its operator. */
  name: string;
  /** The primary lockup (a plate of its own; used by the auth screens). */
  logoSrc: string;
  /** Header lockup halves. Dark-ground colourway first, light second. */
  brandmarkDark: string;
  brandmarkLight: string;
  wordmarkDark: string;
  wordmarkLight: string;
  /** null on a tenant that signs its own users in. */
  idp: TenantIdp | null;
}

export const VOLLEYTV_TENANT: TenantBrand = {
  skin: 'volleytv',
  name: VOLLEYTV_NAME,
  logoSrc: VOLLEYTV_LOGO_SRC,
  brandmarkDark: VOLLEYTV_BRANDMARK_CORAL_SRC,
  brandmarkLight: VOLLEYTV_BRANDMARK_TEAL_SRC,
  wordmarkDark: VOLLEYTV_WORDMARK_CORAL_SRC,
  wordmarkLight: VOLLEYTV_WORDMARK_TEAL_SRC,
  idp: {
    name: 'Volley TV Club iD',
    url: IDP_SIGN_IN_URL,
    signInShot: IDP_SIGN_IN_SHOT,
    codeShot: IDP_CODE_SHOT,
  },
};

@Injectable({ providedIn: 'root' })
export class TenantConfig {
  private readonly _brand = signal<TenantBrand>(VOLLEYTV_TENANT);
  readonly brand = this._brand.asReadonly();

  // --- Runtime branding OVERRIDE ------------------------------------------
  // The live equivalent of the admin app's two colour knobs + logo upload,
  // exposed through the DEV bar so a reviewer can preview a re-skin without a
  // rebuild. null on each = "use the skin/brand default"; a value wins because
  // the colours are injected inline on the `.halo` root (inline beats the skin
  // rule, exactly the contract documented in _tokens.scss) and the logo is
  // folded into the mark getters below.
  private readonly _ovPrimary = signal<string | null>(null);
  private readonly _ovSecondary = signal<string | null>(null);
  private readonly _ovLogo = signal<string | null>(null);

  readonly ovPrimary = this._ovPrimary.asReadonly();
  readonly ovSecondary = this._ovSecondary.asReadonly();
  readonly ovLogo = this._ovLogo.asReadonly();

  setPrimary(hex: string | null): void { this._ovPrimary.set(hex || null); }
  setSecondary(hex: string | null): void { this._ovSecondary.set(hex || null); }
  /** A data: URL for an uploaded image, or null to fall back to the brand marks. */
  setLogo(url: string | null): void { this._ovLogo.set(url || null); }
  /** Back to the shipped identity — the DEV bar's "reset brand". */
  resetBranding(): void { this._ovPrimary.set(null); this._ovSecondary.set(null); this._ovLogo.set(null); }
  readonly hasBrandingOverride = computed(() =>
    !!(this._ovPrimary() || this._ovSecondary() || this._ovLogo()));
  private readonly hasColorOverride = computed(() => !!(this._ovPrimary() || this._ovSecondary()));

  // Inline custom-property values for the `.halo` root. Each is null unless a
  // colour is overridden, so Angular removes the binding and the skin defaults
  // apply untouched. --on-primary/--on-secondary are auto-derived for contrast
  // so an arbitrary knob still reads; --accent-deep/--brand-grad reference the
  // knobs generically so the derived ornaments re-colour with them (the skin
  // blocks pin those to literals, which inline overrides restore to derivations).
  readonly primaryVar = computed(() => this._ovPrimary());
  readonly secondaryVar = computed(() => this._ovSecondary());
  readonly onPrimaryVar = computed(() => { const p = this._ovPrimary(); return p ? ink(p) : null; });
  readonly onSecondaryVar = computed(() => { const s = this._ovSecondary(); return s ? ink(s) : null; });
  readonly accentDeepVar = computed(() =>
    this.hasColorOverride() ? 'color-mix(in srgb, var(--accent) 80%, #000)' : null);
  readonly brandGradVar = computed(() =>
    this.hasColorOverride() ? 'linear-gradient(150deg, var(--secondary), var(--primary))' : null);
  readonly brandGradInkVar = computed(() =>
    this.hasColorOverride() ? 'var(--on-primary)' : null);

  readonly skin = computed(() => this._brand().skin);
  readonly name = computed(() => this._brand().name);
  // An uploaded logo replaces every mark. The header draws an emblem + a
  // wordmark side by side; a single uploaded lockup fills the emblem slot and
  // the wordmark blanks out (the header guards the empty src) so it shows once,
  // and the auth screens show it as their big lockup through logoSrc.
  readonly logoSrc = computed(() => this._ovLogo() ?? this._brand().logoSrc);
  readonly brandmarkDark = computed(() => this._ovLogo() ?? this._brand().brandmarkDark);
  readonly brandmarkLight = computed(() => this._ovLogo() ?? this._brand().brandmarkLight);
  readonly wordmarkDark = computed(() => this._ovLogo() ? '' : this._brand().wordmarkDark);
  readonly wordmarkLight = computed(() => this._ovLogo() ? '' : this._brand().wordmarkLight);
  readonly idp = computed(() => this._brand().idp);

  /** Swap the whole identity. The admin app's entry point for a re-skin. */
  use(brand: TenantBrand): void { this._brand.set(brand); }
}

/**
 * Pick a legible ink for an arbitrary brand fill — the app ships hand-tuned
 * --on-primary/--on-secondary per skin, but a DEV-bar colour is arbitrary, so
 * derive one: brand Midnight ink on a light fill, white on a dark one, split by
 * WCAG relative luminance. Not a design token — a fallback for preview.
 */
function ink(hex: string): string {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return '#ffffff';
  const h = m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1];
  const ch = [0, 2, 4].map((i) => {
    const v = parseInt(h.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  const L = 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  return L > 0.4 ? '#0e1d2c' : '#ffffff';
}
