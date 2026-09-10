import { Injectable, computed, signal } from '@angular/core';
import { t } from './i18n/i18n';

/**
 * ViewContext — the single source of truth for WHO is looking and WHAT they can
 * see. Persona and tier are two orthogonal axes (PRD: persona = show/hide/scope,
 * tier = free/basic/premium depth; PPV is a third axis handled per-item).
 *
 * Persona is NEVER a stored identity — it is a *preset over capability axes*
 * (self / multiTeam / parent / child / coach). UI reads the derived `caps`
 * signal, never the persona key directly, so adding a persona can't fan out into
 * `if persona === …` checks across the app.
 *
 * The 8 presets mirror the wireframe prototype's DEV persona switcher exactly.
 */

export type PersonaKey =
  | 'adult'
  | 'multi'
  | 'parent'
  | 'parentAthlete'
  | 'parentAthleteMulti'
  | 'child'
  | 'fan'
  | 'coach';

export type Tier = 'free' | 'basic' | 'premium';
export type Theme = 'dark' | 'light';

/** Raw capability axes a persona turns on. UI decisions derive from these. */
export interface PersonaAxes {
  self: boolean; // is an athlete themselves (has a "You · #N" identity)
  multiTeam: boolean; // plays for / follows more than one team
  parent: boolean; // has linked children
  child: boolean; // is a child with their own login (restricted)
  coach: boolean; // has team-admin surfaces
}

export interface Persona {
  key: PersonaKey;
  label: string;
  emoji: string;
  axes: PersonaAxes;
}

const A = (
  self: boolean,
  multiTeam: boolean,
  parent: boolean,
  child: boolean,
  coach: boolean,
): PersonaAxes => ({ self, multiTeam, parent, child, coach });

/** Order + labels/emoji match the wireframe DEV switcher. */
export const PERSONAS: Persona[] = [
  { key: 'adult', label: t('persona.adult'), emoji: '🏐', axes: A(true, false, false, false, false) },
  { key: 'multi', label: t('persona.multi'), emoji: '🔀', axes: A(true, true, false, false, false) },
  { key: 'parent', label: t('persona.parent'), emoji: '👪', axes: A(false, false, true, false, false) },
  { key: 'parentAthlete', label: t('persona.parentAthlete'), emoji: '🧑‍👦', axes: A(true, false, true, false, false) },
  { key: 'parentAthleteMulti', label: t('persona.parentAthleteMulti'), emoji: '🧑‍👧‍👦', axes: A(true, true, true, false, false) },
  { key: 'child', label: t('persona.child'), emoji: '🧒', axes: A(true, false, false, true, false) },
  { key: 'fan', label: t('persona.fan'), emoji: '📣', axes: A(false, false, false, false, false) },
  { key: 'coach', label: t('persona.coach'), emoji: '📋', axes: A(false, false, false, false, true) },
];

export const TIERS: { key: Tier; label: string }[] = [
  { key: 'free', label: t('tier.free') },
  { key: 'basic', label: t('tier.basic') },
  { key: 'premium', label: t('tier.premium') },
];

/** Everything the UI actually branches on — derived, never persona-keyed. */
export interface Caps {
  isAthlete: boolean;
  isParent: boolean;
  isChild: boolean;
  isCoach: boolean;
  isFan: boolean;
  multiTeam: boolean;
  /** Owns footage → can open the editor / trim own highlights. */
  canEdit: boolean;
  /** Parent with kids → show a "whose games" switcher. */
  showKidsSwitcher: boolean;
  /** Tier depth. */
  tier: Tier;
  isPremium: boolean;
  /** Premium-only analytical surfaces (Insights, shot-map, season trend). */
  canSeeInsights: boolean;
  /** Is the Stats tab OFFERED at all. Distinct from canSeeInsights, which says
   *  whether its contents are readable: free sees the tab with its cards blurred
   *  behind an upgrade prompt, because free is who that prompt is for. Basic has
   *  already paid, so a locked tab is a nag rather than an offer, and the tab is
   *  withheld instead (product, 2026-08-30 — flagged as temporary). */
  showStatsTab: boolean;
}

@Injectable({ providedIn: 'root' })
export class ViewContext {
  private _persona = signal<PersonaKey>('adult');
  private _tier = signal<Tier>('premium');
  private _theme = signal<Theme>('dark');

  readonly persona = this._persona.asReadonly();
  readonly tier = this._tier.asReadonly();
  readonly theme = this._theme.asReadonly();

  readonly current = computed<Persona>(
    () => PERSONAS.find((p) => p.key === this._persona()) ?? PERSONAS[0],
  );

  readonly caps = computed<Caps>(() => {
    const { axes } = this.current();
    const tier = this._tier();
    const isFan = !axes.self && !axes.parent && !axes.coach;
    return {
      isAthlete: axes.self,
      isParent: axes.parent,
      isChild: axes.child,
      isCoach: axes.coach,
      isFan,
      multiTeam: axes.multiTeam,
      canEdit: axes.self || axes.coach,
      showKidsSwitcher: axes.parent,
      tier,
      isPremium: tier === 'premium',
      canSeeInsights: tier === 'premium',
      showStatsTab: tier !== 'basic',
    };
  });

  setPersona(key: PersonaKey): void {
    this._persona.set(key);
  }

  setTier(tier: Tier): void {
    this._tier.set(tier);
  }

  setTheme(theme: Theme): void {
    this._theme.set(theme);
  }

  toggleTheme(): void {
    this._theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
  }
}
