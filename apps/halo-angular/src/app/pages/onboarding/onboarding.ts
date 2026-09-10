import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { OnboardStepper } from '../../../lib/molecules/onboard-stepper/onboard-stepper';
import { OnboardDock } from '../../../lib/layouts/onboard-dock/onboard-dock';
import { PersonaCard, PersonaKind } from '../../../lib/organisms/persona-card/persona-card';
import { FollowRow } from '../../../lib/organisms/follow-row/follow-row';
import { FormField } from '../../../lib/molecules/form-field/form-field';
import { HaloButton } from '../../../lib/atoms/button/button';
import { HaloIcon } from '../../../lib/atoms/icon/icon';
import { Crest } from '../../../lib/atoms/crest/crest';
import { t } from '../../i18n/i18n';
import { TPipe } from '../../i18n/t.pipe';

type Step = 'persona' | 'team' | 'players' | 'notif' | 'done' | 'coachEmail' | 'coachTeams' | 'coachInvite';

interface TeamOpt { id: string; name: string; org: string; crest?: string; mono?: string; followed: boolean; }
interface Person { id: string; name: string; meta: string; mono: string; followed: boolean; notify: boolean; }
interface Jersey { n: number; name: string; pos: string; taken?: boolean; }

/** Onboarding — player flow: persona → pick your team → claim on the roster → notifications → done. */
@Component({
  selector: 'halo-onboarding-page',
  standalone: true,
  imports: [OnboardStepper, OnboardDock, PersonaCard, FollowRow, FormField, HaloButton, HaloIcon, Crest, TPipe],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.scss',
})
export class OnboardingPage {
  private router = inject(Router, { optional: true });

  step = signal<Step>('persona');

  /** Player claims a roster spot; parent/fan follow only (no jersey claim) —
      proto Onboarding onPick branches these paths (FOLLOW_PLAYERS_ENABLED=false
      for the follow path). Drives which steps show + the stepper count. */
  flow = signal<'player' | 'follow' | 'coach'>('player');
  protected followFlow = computed(() => this.flow() === 'follow');
  protected coachFlow = computed(() => this.flow() === 'coach');
  /** The one ordered list of steps per flow: follow=3 (persona→teams→notif),
   *  player=4 (+claim), coach=5 (persona→find teams→teams→invite→notif).
   *  The count, the current position, the named journey and the Back target are
   *  all read off this, so a change to a flow cannot leave four places to update
   *  and three of them stale. 'done' is deliberately absent: it is the outcome,
   *  not a step you are on the way through, and it shows no stepper. */
  protected order = computed<Step[]>(() =>
    this.coachFlow()
      ? ['persona', 'coachEmail', 'coachTeams', 'coachInvite', 'notif']
      : this.followFlow()
        ? ['persona', 'team', 'notif']
        : ['persona', 'team', 'players', 'notif'],
  );

  protected total = computed(() => this.order().length);
  protected stepNo = computed(() => Math.max(1, this.order().indexOf(this.step()) + 1));

  /** Step NAMES for the wide-screen stepper. Taken from each step's own title
   *  so the list and the page cannot drift apart, and shortened only where the
   *  title is a sentence ("Find yourself on the roster" → "Roster"). The bar
   *  alone said how far along you were but never what was coming. */
  private stepName(s: Step): string {
    switch (s) {
      case 'persona': return t('ob.stepYou');
      // The same screen, named for what it does in each flow: a follower is
      // picking teams to watch, a player is confirming the one they play for.
      case 'team': return this.followFlow() ? t('ob.stepFollowTeams') : t('ob.yourTeam');
      case 'players': return t('ob.stepRoster');
      case 'coachEmail': return t('ob.stepFindTeams');
      case 'coachTeams': return t('ob.yourTeams');
      case 'coachInvite': return t('ob.stepInvite');
      default: return t('ob.stepAlerts');
    }
  }
  protected stepNames = computed<string[]>(() => this.order().map((s) => this.stepName(s)));

  /** Back always means "the previous step of this flow" — the seven hand-written
   *  targets this replaces were seven chances to disagree with the order above. */
  protected goBack(): void {
    const i = this.order().indexOf(this.step());
    if (i > 0) this.step.set(this.order()[i - 1]);
  }

  // ---- coach flow ----
  coachEmail = signal('');
  coachChecking = signal(false);
  coachResolved = signal(false);
  coachNotFound = signal(false);
  /** The coach's teams, resolved from the Advantage-email lookup (demo: fixed). */
  coachTeams: TeamOpt[] = [
    { id: 't1', name: 'Netsetters 1', org: `${t('comp.mondayMen14')} · ${t('grade.open')}`, crest: 'img/logo-netsetters.svg', followed: true },
    { id: 't3', name: 'Northside Flames', org: 'Tuesday B2 Women · Open B/3', crest: 'img/team-northside-flames.svg', followed: true },
  ];
  protected coachEmailValid = computed(() => /.+@.+\..+/.test(this.coachEmail().trim()));
  protected coachInviteLink = (teamId: string) => `halo.app/invite/${teamId}?code=coach-2026`;
  copiedTeamId = signal<string | null>(null);

  checkCoachEmail(): void {
    if (!this.coachEmailValid()) return;
    this.coachNotFound.set(false);
    this.coachChecking.set(true);
    // Demo lookup: a "coach@" address resolves to teams; anything else → not found.
    setTimeout(() => {
      this.coachChecking.set(false);
      if (/coach|advantage|netsetters/i.test(this.coachEmail())) {
        this.coachResolved.set(true);
        this.step.set('coachTeams');
      } else {
        this.coachNotFound.set(true);
      }
    }, 900);
  }
  copyInvite(teamId: string): void {
    navigator?.clipboard?.writeText(this.coachInviteLink(teamId)).catch(() => {});
    this.copiedTeamId.set(teamId);
    setTimeout(() => this.copiedTeamId.update((c) => (c === teamId ? null : c)), 1400);
  }

  personas: { kind: PersonaKind; featured?: boolean; disabled?: boolean }[] = [
    { kind: 'player', featured: true },
    { kind: 'parent' },
    { kind: 'fan' },
    { kind: 'coach' },
  ];

  // ---- team step ----
  teamPicker = signal(false);
  teamSearch = signal('');
  myTeam = signal<TeamOpt | null>(null);
  pickable: TeamOpt[] = [
    { id: 't1', name: 'Netsetters 1', org: `${t('comp.mondayMen14')} · ${t('grade.open')}`, crest: 'img/logo-netsetters.svg', followed: false },
    { id: 't2', name: 'Bayside Breakers', org: `${t('league.stateDiv1')} · ${t('grade.open')}`, crest: 'img/logo-breakers.svg', followed: false },
    { id: 't3', name: 'Spike City', org: t('comp.mondayMen14'), crest: 'img/logo-spikecity.svg', followed: false },
  ];
  filteredPickable = computed(() => {
    const q = this.teamSearch().toLowerCase().trim();
    return q ? this.pickable.filter((t) => t.name.toLowerCase().includes(q)) : this.pickable;
  });
  divisionTeams = signal<TeamOpt[]>([
    { id: 'd1', name: 'Vikings Grey', org: `${t('comp.mondayMen14')} · ${t('grade.open')}`, crest: 'img/team-northside-flames.svg', followed: false },
    { id: 'd2', name: 'Northside Flames', org: `${t('league.stateDiv1')} · ${t('grade.open')}`, crest: 'img/team-northside-flames.svg', followed: false },
    { id: 'd3', name: 'Harbour Blues', org: `${t('league.stateDiv1')} · ${t('grade.open')}`, crest: 'img/logo-blues.svg', followed: false },
  ]);

  pickTeam(t: TeamOpt) { this.myTeam.set(t); this.teamPicker.set(false); this.teamSearch.set(''); }
  changeTeam() { this.myTeam.set(null); }
  setDivisionFollowed(id: string, followed: boolean) {
    this.divisionTeams.update((l) => l.map((t) => (t.id === id ? { ...t, followed } : t)));
  }

  // ---- players / claim step ----
  jerseys: Jersey[] = [
    { n: 4, name: 'Dylan', pos: 'SF' }, { n: 7, name: 'Tal', pos: 'SG' },
    { n: 9, name: 'Owen', pos: 'PF' }, { n: 12, name: 'Aiden', pos: 'PG' },
    { n: 21, name: 'Noah', pos: 'C', taken: true }, { n: 23, name: 'Marcus', pos: 'C' },
  ];
  claimed = signal<Jersey | null>(null);
  teammates = signal<Person[]>([
    { id: 'p1', name: 'Aiden Cole', meta: '#12 · S', mono: 'AC', followed: true, notify: false },
    { id: 'p2', name: 'Marcus Lee', meta: '#23 · MB', mono: 'ML', followed: true, notify: false },
    { id: 'p3', name: 'Dylan Cross', meta: '#4 · OH', mono: 'DC', followed: false, notify: false },
  ]);
  rivals = signal<Person[]>([
    { id: 'r1', name: 'Jordan Reed', meta: '#11 · Vikings Grey', mono: 'JR', followed: false, notify: false },
    { id: 'r2', name: 'Kai Nguyen', meta: '#3 · Northside Flames', mono: 'KN', followed: false, notify: false },
  ]);

  claim(j: Jersey) { if (!j.taken) this.claimed.set(j); }
  changeJersey() { this.claimed.set(null); }
  setPersonFollowed(list: 'teammates' | 'rivals', id: string, followed: boolean) {
    const sig = list === 'teammates' ? this.teammates : this.rivals;
    sig.update((l) => l.map((p) => (p.id === id ? { ...p, followed } : p)));
  }
  setPersonNotify(list: 'teammates' | 'rivals', id: string, notify: boolean) {
    const sig = list === 'teammates' ? this.teammates : this.rivals;
    sig.update((l) => l.map((p) => (p.id === id ? { ...p, notify } : p)));
  }

  teammateCount = computed(() => this.teammates().filter((p) => p.followed).length);
  followingCount = computed(
    () => this.teammates().filter((p) => p.followed).length + this.rivals().filter((p) => p.followed).length,
  );

  /** The chosen persona, KEPT. `pick()` used to collapse parent and fan into one
      'follow' flow and throw the kind away, so the follow-teams step could not
      tell them apart — and the registration disclaimer is for everyone EXCEPT
      fans (Maryna 2026-08-30). */
  protected persona = signal<PersonaKind | null>(null);
  protected isFan = computed(() => this.persona() === 'fan');

  pick(kind: PersonaKind) {
    this.persona.set(kind);
    if (kind === 'coach') {
      // Coach path: Advantage-email lookup → teams → invite summary → notif.
      this.flow.set('coach');
      this.step.set('coachEmail');
      return;
    }
    // Parent/Fan follow teams but never claim a roster spot (proto onPick).
    this.flow.set(kind === 'player' ? 'player' : 'follow');
    this.step.set('team');
  }
  finish() { this.router?.navigate(['/home']); }
}
