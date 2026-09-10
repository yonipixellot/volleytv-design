import { Injectable, signal } from '@angular/core';

export type A11yText = 'default' | 'large' | 'xlarge';
export type A11yMotion = 'system' | 'reduce';
export type A11yContrast = 'default' | 'high';

const KEY = 'halo:a11y';

/**
 * A11yPrefs — Layer-2 accessibility preferences (PT AccessibilityPanel port).
 * First-party controls over our own tokens (NOT a bought overlay widget):
 * the shell binds these to data attributes and _tokens.scss re-derives.
 * Persisted so an anonymous viewer's choices survive into the session.
 */
@Injectable({ providedIn: 'root' })
export class A11yPrefs {
  readonly text = signal<A11yText>('default');
  readonly motion = signal<A11yMotion>('system');
  readonly contrast = signal<A11yContrast>('default');
  readonly panelOpen = signal(false);

  constructor() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const v = JSON.parse(raw) as { text?: A11yText; motion?: A11yMotion; contrast?: A11yContrast };
        if (v.text) this.text.set(v.text);
        if (v.motion) this.motion.set(v.motion);
        if (v.contrast) this.contrast.set(v.contrast);
      }
    } catch { /* first run */ }
  }

  set(part: Partial<{ text: A11yText; motion: A11yMotion; contrast: A11yContrast }>): void {
    if (part.text) this.text.set(part.text);
    if (part.motion) this.motion.set(part.motion);
    if (part.contrast) this.contrast.set(part.contrast);
    try {
      localStorage.setItem(KEY, JSON.stringify({ text: this.text(), motion: this.motion(), contrast: this.contrast() }));
    } catch { /* private mode */ }
  }

  /**
   * WHICH CONTROL OPENED THE PANEL, because on a pointer the panel is a popover
   * on its trigger and there are two of them: the pre-auth fab, bottom-right,
   * and the header avatar's menu, top-right. Anchored to the fab regardless, it
   * hung in the lower right of a signed-in page with nothing under it to have
   * come from (Maryna 2026-08-30).
   */
  readonly origin = signal<'fab' | 'menu'>('menu');

  open(from: 'fab' | 'menu' = 'menu'): void {
    this.origin.set(from);
    this.panelOpen.set(true);
  }
  close(): void { this.panelOpen.set(false); }
  /** The fab is the panel's only trigger and sits above its click-away scrim,
   *  so pressing it again must SHUT the panel. Without this the second press
   *  re-opened what was already open and the control read as dead
   *  (Maryna 2026-08-30). */
  toggle(from: 'fab' | 'menu' = 'menu'): void {
    if (this.panelOpen()) { this.panelOpen.set(false); return; }
    this.open(from);
  }
}
