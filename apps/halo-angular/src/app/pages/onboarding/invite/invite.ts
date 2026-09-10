import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OnboardStepper } from '../../../../lib/molecules/onboard-stepper/onboard-stepper';
import { OnboardDock } from '../../../../lib/layouts/onboard-dock/onboard-dock';
import { FormField } from '../../../../lib/molecules/form-field/form-field';
import { FollowRow } from '../../../../lib/organisms/follow-row/follow-row';
import { HaloButton } from '../../../../lib/atoms/button/button';
import { HaloIcon } from '../../../../lib/atoms/icon/icon';
import { Crest } from '../../../../lib/atoms/crest/crest';
import { t } from '../../../i18n/i18n';
import { TPipe } from '../../../i18n/t.pipe';

type Step = 'entry' | 'auth' | 'teams' | 'claim' | 'notif' | 'done';
interface Jersey { n: number; name: string; pos: string; taken?: boolean; }
interface Person { id: string; name: string; meta: string; mono: string; followed: boolean; }

/**
 * Coach-invite PLAYER wizard (C12) — reached via a coach invite link
 * (/onboarding/invite/:code). Separate from the persona onboarding: the team is
 * LOCKED to the invite (can't be removed), and auth is embedded. Flow: invite
 * welcome → sign up / sign in → locked team → claim roster + follow teammates →
 * notifications → Home. Coach side is demo-hardcoded (proto parity).
 */
@Component({
  selector: 'halo-invite-page',
  standalone: true,
  imports: [OnboardStepper, OnboardDock, FormField, FollowRow, HaloButton, HaloIcon, Crest, TPipe],
  templateUrl: './invite.html',
  styleUrl: '../onboarding.scss',
})
export class InvitePage {
  private router = inject(Router, { optional: true });
  private route = inject(ActivatedRoute);

  /** Invite context — production reads it from the deep link; demo-hardcoded. */
  protected code = this.route.snapshot.paramMap.get('code') ?? 'demo-invite-001';
  protected coachName = `${t('inv.coach')} Sarah`;
  protected team = { id: 't1', name: 'Netsetters 1', org: `${t('comp.mondayMen14')} · ${t('grade.open')}`, crest: 'img/logo-netsetters.svg' };

  step = signal<Step>('entry');
  /** Rail index: entry+auth=1, teams=2, claim=3, notif=4. */
  protected railStep = computed(() => {
    const s = this.step();
    return s === 'entry' || s === 'auth' ? 1 : s === 'teams' ? 2 : s === 'claim' ? 3 : 4;
  });

  // auth
  authMode = signal<'signup' | 'signin'>('signup');
  email = signal('');
  password = signal('');
  protected authValid = computed(() => this.email().includes('@') && this.password().length >= 4);
  openAuth(mode: 'signup' | 'signin') { this.authMode.set(mode); this.step.set('auth'); }

  // teams (invited team is locked; a couple optional follows)
  moreTeams = signal([
    { id: 'd1', name: 'Vikings Grey', org: `${t('comp.mondayMen14')} · ${t('grade.open')}`, crest: 'img/team-northside-flames.svg', followed: false },
    { id: 'd2', name: 'Harbour Blues', org: `${t('league.stateDiv1')} · ${t('grade.open')}`, crest: 'img/logo-blues.svg', followed: false },
  ]);
  setMoreFollowed(id: string, followed: boolean) {
    this.moreTeams.update((l) => l.map((t) => (t.id === id ? { ...t, followed } : t)));
  }

  // claim + follow
  jerseys: Jersey[] = [
    { n: 4, name: 'Dylan', pos: 'SF' }, { n: 7, name: 'Tal', pos: 'SG' },
    { n: 9, name: 'Owen', pos: 'PF' }, { n: 12, name: 'Aiden', pos: 'PG' },
    { n: 21, name: 'Noah', pos: 'C', taken: true }, { n: 23, name: 'Marcus', pos: 'C' },
  ];
  claimed = signal<Jersey | null>(null);
  teammates = signal<Person[]>([
    { id: 'p1', name: 'Aiden Cole', meta: '#12 · S', mono: 'AC', followed: true },
    { id: 'p2', name: 'Marcus Lee', meta: '#23 · MB', mono: 'ML', followed: true },
    { id: 'p3', name: 'Dylan Cross', meta: '#4 · OH', mono: 'DC', followed: false },
  ]);
  claim(j: Jersey) { if (!j.taken) this.claimed.set(j); }
  changeJersey() { this.claimed.set(null); }
  setTeammateFollowed(id: string, followed: boolean) {
    this.teammates.update((l) => l.map((p) => (p.id === id ? { ...p, followed } : p)));
  }

  finish() { void this.router?.navigate(['/home']); }
}
