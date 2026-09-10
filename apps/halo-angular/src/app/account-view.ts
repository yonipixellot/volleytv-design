import { Injectable, computed, inject } from '@angular/core';
import { ViewContext } from './view-context';

/**
 * The identity Account & settings shows, derived from the active persona.
 *
 * Extracted from SettingsPage (2026-08-29) because the same identity now has
 * two presentations — the full page on a phone and the header popover from the
 * tablet band up. Two copies of this would drift the first time a persona's
 * subtitle changed on one of them.
 */
@Injectable({ providedIn: 'root' })
export class AccountView {
  private vc = inject(ViewContext);
  private caps = this.vc.caps;

  readonly name = computed(() => (this.caps().isFan ? 'Guest viewer' : 'Tal Weiss'));

  readonly sub = computed(() => {
    const c = this.caps();
    if (c.isCoach) return 'Coach · Netsetters 1';
    if (c.isFan) return 'Following 3 teams';
    if (c.isParent && !c.isAthlete) return 'Parent · 2 athletes';
    if (c.isParent && c.isAthlete) return 'Parent + Player · #7';
    return 'Player · #7 · Netsetters 1';
  });

  readonly personaLabel = computed(() => this.vc.current().label);

  /** No avatar-upload flow exists yet — `halo-avatar` always falls back to
   *  initials in practice; wired for whenever that ships. */
  readonly avatarSrc = computed(() => '');

  readonly planLabel = computed(() => {
    switch (this.caps().tier) {
      case 'premium': return 'All-Access · monthly';
      case 'basic': return 'Basic · monthly';
      default: return 'Free';
    }
  });
}
