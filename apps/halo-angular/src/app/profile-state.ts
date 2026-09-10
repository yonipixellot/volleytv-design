import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { ViewContext } from './view-context';
import { t } from './i18n/i18n';

/** A team on the identity card's team line (structurally an IdentityTeam). */
export interface ProfileTeam {
  id: string;
  name: string;
  crest?: string;
  mono?: string;
  /** Grade / tier in this team. */
  grade?: string;
  /** Jersey number in this team; null / absent for a non-playing role. */
  number?: number | null;
}

export interface ViewProfile {
  id: string;
  name: string;
  /** jersey number, or null for a non-playing profile (coach). */
  number: number | null;
  /** Extra card lines under the team. Empty for athletes since 2026-08-27:
   *  the jersey number is on the disc and the grade/tier lives in the picker.
   *  A coach keeps their role here. */
  metaLines: string[];
  /** Team shown on the card's team line. */
  team: string;
  /** Every team this profile is attached to. Set when the profile can switch
   *  between them (a coach usually runs more than one); one entry or absent
   *  means the card's team line is static. */
  teams?: ProfileTeam[];
  /** Grade / tier — the picker row's sub-label, never the card. */
  grade?: string;
  /** compact label for the switcher pill ("You" / first name). */
  pill: string;
  /** single-letter avatar. */
  avatar: string;
  /** team crest for the profile card (src or mono fallback). */
  crest?: string;
  mono?: string;
}

/**
 * ProfileState — the app-wide "Viewing as" selection (journeys doc + wireframe
 * PT). For a Parent (or Parent+Athlete) it holds the viewable PEOPLE — You
 * (when also an athlete) + each linked child — and a single-select `selectedId`
 * that scopes Home and the You tab to that person. The switcher itself lives in
 * the Menu; Home circles and the You header follow the selection.
 *
 * The multi-team athlete's TEAM picker is a separate, within-profile filter and
 * stays local to the You tab — this service is only about which PERSON.
 */
@Injectable({ providedIn: 'root' })
export class ProfileState {
  private vc = inject(ViewContext);

  readonly profiles = computed<ViewProfile[]>(() => {
    const caps = this.vc.caps();
    const out: ViewProfile[] = [];
    if (caps.isCoach) {
      out.push({
        id: 'self', name: 'Tal Weiss', number: null, metaLines: [t('role.coach')],
        team: 'Netsetters 1', pill: t('common.you'), avatar: 'T',
        crest: 'img/logo-netsetters.svg', mono: 'NS',
        // Same two teams, same ids as the Coach admin screen (coach-admin.ts):
        // one coach, several squads, so the You card has to switch between them.
        teams: [
          { id: 't1', name: 'Netsetters 1', crest: 'img/logo-netsetters.svg', mono: 'NS', grade: `${t('grade.open')} · ${t('grade.tierA')}` },
          { id: 't3', name: 'Northside Flames', crest: 'img/team-northside-flames.svg', mono: 'NF', grade: t('grade.openB3') },
        ],
      });
    } else if (caps.isAthlete) {
      out.push({ id: 'self', name: 'Tal Weiss', number: 7, metaLines: [], team: 'Netsetters 1', grade: `${t('grade.open')} · ${t('grade.tierA')}`, pill: t('common.you'), avatar: 'T', crest: 'img/logo-netsetters.svg', mono: 'NS' });
    }
    if (caps.isParent) out.push(
      { id: 'maya', name: 'Maya Weiss', number: 12, metaLines: [], team: 'Vikings Grey', grade: `${t('grade.bGirls')} · ${t('grade.tierA')}`, pill: 'Maya', avatar: 'M', mono: 'VG' },
      { id: 'noah', name: 'Noah Weiss', number: 5, metaLines: [], team: 'Chump Centrals', grade: `${t('grade.cBoys')} · ${t('grade.tierB')}`, pill: 'Noah', avatar: 'N', mono: 'CC' },
    );
    if (!out.length) out.push({ id: 'self', name: 'Tal Weiss', number: 7, metaLines: [], team: 'Netsetters 1', grade: `${t('grade.open')} · ${t('grade.tierA')}`, pill: t('common.you'), avatar: 'T', crest: 'img/logo-netsetters.svg', mono: 'NS' });
    return out;
  });

  readonly selectedId = signal('self');
  readonly selected = computed(() => this.profiles().find((p) => p.id === this.selectedId()) ?? this.profiles()[0]);
  /** Show the "Viewing as" switcher only when there's more than one person. */
  readonly showSwitcher = computed(() => this.profiles().length > 1);

  constructor() {
    // Keep the selection valid when the persona (dev-bar) changes under us.
    effect(() => {
      const ids = this.profiles().map((p) => p.id);
      if (!ids.includes(this.selectedId())) this.selectedId.set(ids[0] ?? 'self');
    });
  }

  select(id: string): void { this.selectedId.set(id); }
}
