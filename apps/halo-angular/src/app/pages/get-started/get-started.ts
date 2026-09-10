import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { OnboardStepper } from '../../../lib/molecules/onboard-stepper/onboard-stepper';
import { OnboardDock } from '../../../lib/layouts/onboard-dock/onboard-dock';
import { PersonaCard, PersonaKind } from '../../../lib/organisms/persona-card/persona-card';
import { HaloButton } from '../../../lib/atoms/button/button';
import { HaloIcon } from '../../../lib/atoms/icon/icon';
import { t } from '../../i18n/i18n';
import { TenantConfig } from '../../tenant';
import { TPipe } from '../../i18n/t.pipe';

type Step = 'choice' | 'persona' | 'athlete' | 'claimed' | 'guardian' | 'noLink' | 'parent' | 'parentLinked' | 'coach';
interface LinkResult { name: string; number: number; position: string; teamName: string; }
interface RosterRow { id: string; name: string; number: number; position: string; teamId: string; claimed: boolean; }
interface TeamRow { id: string; name: string; division: string; mono: string; claimCode: string; }

const TEAMS: TeamRow[] = [
  { id: 't1', name: 'Netsetters 1', division: `${t('comp.mondayMen14')} · ${t('grade.open')}`, mono: 'NS', claimCode: 'HOOP24' },
  { id: 't3', name: 'Northside Flames', division: `${t('comp.tuesdayB2Women')} · ${t('grade.openB3')}`, mono: 'NF', claimCode: 'FLAMES24' },
];
const ROSTER: RosterRow[] = [
  { id: 'r1', name: 'Tal Weiss', number: 7, position: 'SG', teamId: 't1', claimed: false },
  { id: 'r2', name: 'Owen Park', number: 9, position: 'PF', teamId: 't1', claimed: false },
  { id: 'r3', name: 'Aman Singh', number: 4, position: 'PG', teamId: 't3', claimed: false },
];

/**
 * Non-SSO onboarding (C13) — the generic-tenant flow for deployments WITHOUT
 * the Basketball Australia SSO relationship graph. A separate orchestrator from
 * the SSO /onboarding (which only CONFIRMS pre-linked relationships): here every
 * persona has an explicit, recoverable path to being linked.
 *   Athlete → claim by invite code / roster name → claimed (+ invite guardian) OR no-link fallback
 *   Parent  → guardian-invite code → scoped single-athlete inherit
 *   Coach   → auto-detected teams (pending) + not-recognised fallback
 *   Fan     → straight through to Home
 */
@Component({
  selector: 'halo-get-started-page',
  standalone: true,
  imports: [OnboardStepper, OnboardDock, PersonaCard, HaloButton, HaloIcon, TPipe],
  templateUrl: './get-started.html',
  styleUrls: ['../onboarding/onboarding.scss', './get-started.scss'],
})
export class GetStartedPage {
  private router = inject(Router, { optional: true });
  /** Lockup + IdP name on the choice screen come from the tenant, never a literal (V1, fork 2026-09-08). */
  protected tenant = inject(TenantConfig);

  // The account-model chooser is the flow's front door (Yoni 2026-08-22):
  // SSO (the tenant IdP, V2) is primary; this manual email path (V1) stays as-is.
  step = signal<Step>('choice');
  goSso(): void { void this.router?.navigate(['/auth/sign-in']); }   // BA chain starts at the SSO email screen
  linkQuery = signal('');
  parentCode = signal('');
  link = signal<LinkResult | null>(null);
  notified = signal(false);
  copied = signal(false);
  linkError = signal(false);

  protected coachTeams = TEAMS;
  protected guardianLink = computed(() => {
    const first = this.link()?.name.split(' ')[0]?.toLowerCase() ?? 'athlete';
    return `halo.tv/guardian/inv-${first}-7f3a2`;
  });

  private resolveLink(raw: string): LinkResult | null {
    const q = raw.trim().toLowerCase();
    if (!q) return null;
    const byCode = TEAMS.find((t) => t.claimCode.toLowerCase() === q);
    if (byCode) {
      const me = ROSTER.find((r) => r.teamId === byCode.id && !r.claimed);
      if (me) return { name: me.name, number: me.number, position: me.position, teamName: byCode.name };
    }
    const byName = ROSTER.find((r) => !r.claimed && r.name.toLowerCase().includes(q));
    if (byName) {
      const team = TEAMS.find((t) => t.id === byName.teamId);
      return { name: byName.name, number: byName.number, position: byName.position, teamName: team?.name ?? t('gs.yourTeamFallback') };
    }
    return null;
  }

  pick(kind: PersonaKind) {
    this.linkError.set(false);
    if (kind === 'player') this.step.set('athlete');
    else if (kind === 'parent') this.step.set('parent');
    else if (kind === 'coach') this.step.set('coach');
    else this.finish(); // fan
  }
  submitAthlete() {
    const r = this.resolveLink(this.linkQuery());
    if (r) { this.link.set(r); this.step.set('claimed'); }
    else this.step.set('noLink');
  }
  submitParent() {
    if (!this.parentCode().trim()) { this.linkError.set(true); return; }
    const me = ROSTER[0];
    this.link.set({ name: me.name, number: me.number, position: me.position, teamName: TEAMS.find((t) => t.id === me.teamId)?.name ?? t('gs.theirTeamFallback') });
    this.step.set('parentLinked');
  }
  copyGuardian() { navigator?.clipboard?.writeText(this.guardianLink()).catch(() => {}); this.copied.set(true); }
  finish() { void this.router?.navigate(['/home']); }
}
