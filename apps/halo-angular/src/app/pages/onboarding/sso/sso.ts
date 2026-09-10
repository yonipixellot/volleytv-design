import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { OnboardStepper } from '../../../../lib/molecules/onboard-stepper/onboard-stepper';
import { OnboardDock } from '../../../../lib/layouts/onboard-dock/onboard-dock';
import { FollowRow } from '../../../../lib/organisms/follow-row/follow-row';
import { HaloButton } from '../../../../lib/atoms/button/button';
import { EmptyState } from '../../../../lib/molecules/empty-state/empty-state';
import { HaloIcon } from '../../../../lib/atoms/icon/icon';
import { Crest } from '../../../../lib/atoms/crest/crest';
import { EventFilterBar, FilterBarCategory } from '../../../../lib/organisms/event-filter-bar/event-filter-bar';
import { FollowStore } from '../../../follow-store';
import { ViewContext } from '../../../view-context';
import { t, plural } from '../../../i18n/i18n';
import { TPipe } from '../../../i18n/t.pipe';
import { TenantConfig } from '../../../tenant';

type Step =
  | 'handoff' | 'identify' | 'confirm' | 'teams'
  | 'teammates' | 'notif' | 'consent';

/** The identification result — BA IdentifyStep's four outcomes, all wired. */
type Outcome = 'single' | 'multi' | 'family' | 'none';

interface FollowOpt { id: string; regId?: string; name: string; meta: string; crest?: string; mono: string; followed: boolean; locked?: boolean; st?: string; org?: string; }
interface BrowseLeague { id: string; name: string; meta: string; teams: FollowOpt[]; }
interface LockedCard { regId: string; name: string; meta: string; crest?: string; mono: string; }
/** A roster, per team. `regId` is the SAME registry id the locked team cards on
 *  the Teams step carry, which is what keeps the two screens from disagreeing
 *  about which teams you are on. `athlete` is set only in the family flow, where
 *  a team belongs to one of the kids rather than to you. */
interface TeammateGroup { regId: string; team: string; athlete?: string; people: FollowOpt[]; }

/**
 * SSO onboarding (V2) — the "fully SSO by client" flow, ported from the AU-BA
 * reference (PlayerOnboarding). Branded "Hoops TV ID". EVERYTHING
 * identity-shaped arrives PRE-LINKED from the SSO graph and is CONFIRMED here,
 * never entered — the deliberate contrast to /get-started (non-SSO). All four
 * identification outcomes are wired (BA parity):
 *   single — athlete, one matched team (locked) → 5 steps
 *   multi  — athlete on TWO teams (both locked, BA DG-11)  → 5 steps
 *   family — parent: confirm pre-linked athletes, kids' teams locked → 5 steps
 *   none   — signed in but no record matched yet: browse-only + notice → 3 steps
 */
@Component({
  selector: 'halo-sso-onboarding-page',
  standalone: true,
  imports: [OnboardStepper, OnboardDock, FollowRow, HaloButton, HaloIcon, Crest, EventFilterBar, EmptyState, TPipe],
  templateUrl: './sso.html',
  styleUrls: ['../onboarding.scss', './sso.scss'],
})
export class SsoOnboardingPage {
  /** Header lockup on the handoff screen — tenant brandmark + wordmark, same files as sign-in (V1). */
  protected tenant = inject(TenantConfig);
  protected readonly plural = plural;
  private router = inject(Router, { optional: true });
  private follows = inject(FollowStore);
  protected vc = inject(ViewContext);

  step = signal<Step>('handoff');
  outcome = signal<Outcome>('single');

  /** Fan / not-recognised skips confirm + teammates (BA shape; no premium step — Yoni 2026-08-23).
   *  One order per outcome, and the count, the position and the named journey are
   *  all read off it — so a change to the flow cannot leave the stepper disagreeing
   *  with itself. */
  protected order = computed<Step[]>(() =>
    this.outcome() === 'none'
      ? ['teams', 'notif', 'consent']
      : this.outcome() === 'family'
        ? ['confirm', 'teams', 'teammates', 'notif', 'consent']
        : ['identify', 'teams', 'teammates', 'notif', 'consent'],
  );

  /** Short enough to sit five across under the track without wrapping. */
  private static readonly STEP_NAMES: Record<Step, string> = {
    handoff: '',
    identify: t('ob.stepYou'),
    confirm: t('ob.stepAthletes'),
    teams: t('ob.stepTeams'),
    teammates: t('ob.teammates'),
    notif: t('ob.stepAlerts'),
    consent: t('ob.stepFinish'),
  };

  protected total = computed(() => this.order().length);
  protected stepNames = computed(() => this.order().map((s) => SsoOnboardingPage.STEP_NAMES[s]));
  protected stepNo = computed(() => {
    const i = this.order().indexOf(this.step());
    return i < 0 ? 1 : i + 1;
  });

  /** ?returning=1 (from sign-in): known identity — handoff lands on Home. */
  returning = input('');

  /** Demo seeding (Storybook + review deep links): ?demoOutcome=family lands
   *  on that persona's flow, ?demoStep=<step> on a specific screen. Bound from
   *  query params via withComponentInputBinding, same as `returning`. */
  demoOutcome = input('');
  demoStep = input('');
  /** Empty-state preview. `?demoEmpty=browse` empties the league browse and
   *  `?demoEmpty=teammates` empties the roster, so both states can be SEEN.
   *  They are unreachable from the mock otherwise — the roster always has three
   *  people and no team is ever fully locked — which is exactly why they were
   *  missing in the first place and why nobody noticed (Maryna 2026-08-30).
   *  `?demoEmpty=filters` shows the OTHER browse empty state — the one that says
   *  the filters matched nothing. It is faked rather than seeded with real
   *  filter values: which state/league pair happens to have no overlap is a
   *  property of the mock data, and a preview link should not break the next
   *  time someone edits a league.
   *  Comma-separated, so `?demoEmpty=browse,teammates` shows both. */
  demoEmpty = input('');
  /** `?? ''` is load-bearing. withComponentInputBinding writes UNDEFINED into an
   *  input whose query param is absent — it does not leave the declared default
   *  in place. demoOutcome and demoStep never noticed because they are only read
   *  inside an effect behind a truthiness check; this one calls .split() on the
   *  value, so the normal case (no param in the URL) threw and took the whole
   *  Teams and Teammates template down with it (Maryna 2026-08-30). */
  protected emptyDemo = computed(() =>
    new Set((this.demoEmpty() ?? '').split(',').map((v) => v.trim()).filter(Boolean)));

  /** The DEV-bar persona drives the identification outcome, so switching to
   *  Multi-Team Athlete actually changes this flow. It used to change nothing
   *  here: `outcome` was set only by this page's own "simulate result" panel or
   *  by ?demoOutcome, so the dev bar could say Multi-Team Athlete while the
   *  screen showed a single roster, and the two dev controls quietly disagreed
   *  (Maryna 2026-09-02).
   *
   *  Read off derived CAPABILITIES, never persona keys, per the app's own rule.
   *  A parent maps to `family` even when they are also an athlete: the parent
   *  flow is the one that has an extra screen, so it is the more informative
   *  half of Parent + Athlete to show.
   *
   *  ?demoOutcome still decides where a review link LANDS: its effect is
   *  declared after this one, so it runs second on the first pass and wins the
   *  initial value. Only a later persona change re-runs this one, which is the
   *  point: the deep link seeds the screen, the dev bar keeps steering it. */
  private syncOutcomeToPersona(): void {
    const caps = this.vc.caps();
    const o: Outcome = caps.isParent ? 'family'
      : caps.isAthlete ? (caps.multiTeam ? 'multi' : 'single')
        : 'none';
    untracked(() => {
      if (this.outcome() === o) return;
      this.outcome.set(o);
      // The step list is per-outcome, so the step you are ON may not exist in
      // the flow you just switched to: `none` has no teammates screen, and
      // leaving it up would show a stepper counting from 1 beside step 3.
      const s = this.step();
      if (s !== 'handoff' && !this.order().includes(s)) this.step.set(this.order()[0]);
    });
  }

  constructor() {
    // mock IdP handoff — BA's SsoHandoffScreen auto-advances after 1700ms;
    // the whole screen is also tappable (leaveHandoff) to continue at once.
    setTimeout(() => this.leaveHandoff(), 1700);
    effect(() => this.syncOutcomeToPersona());
    effect(() => {
      const o = this.demoOutcome() as Outcome | '';
      if (!o || !['single', 'multi', 'family', 'none'].includes(o)) return;
      this.outcome.set(o as Outcome);
      const first: Step = o === 'family' ? 'confirm' : 'teams';
      const s = this.demoStep() as Step | '';
      this.step.set(s && s !== 'handoff' ? s : first);
    });
  }

  leaveHandoff(): void {
    if (this.step() !== 'handoff') return;
    if (this.returning()) { void this.router?.navigate(['/home']); return; }
    this.step.set('identify');
  }

  // ---- identify — BA IdentifyStep parity: auto-resolving "Finding your
  // teams…" loader; the DEV panel stands in for the backend identification
  // result so all paths are demoable (not part of the product flow). ----
  devOptions: { key: Outcome; label: string; note: string }[] = [
    { key: 'single', label: 'One team', note: 'Identified · athlete' },
    { key: 'multi', label: 'Multiple teams', note: 'Domestic + rep' },
    { key: 'family', label: 'Parent · multiple athletes', note: 'Confirm & follow' },
    { key: 'none', label: 'No team matched', note: 'Not identified' },
  ];
  resolveIdentity(o: { key: Outcome }): void {
    this.outcome.set(o.key);
    this.step.set(o.key === 'family' ? 'confirm' : 'teams');
  }

  // ---- family (parent) — pre-linked children from the SSO/CMP payload;
  // onboarding CONFIRMS them, never builds them ----
  kids: { name: string; teamNames: string; mono: string }[] = [
    { name: 'Maya Weiss', teamNames: 'Vikings Grey · Hustle HQ', mono: 'MW' },
    { name: 'Noah Weiss', teamNames: 'Chump Centrals', mono: 'NW' },
  ];

  // ---- follow-teams — matched team(s) arrive pre-followed + LOCKED ----
  /** Locked hero cards per outcome (BA DG-11: multi locks ALL matched teams;
   *  a parent locks the CHILDREN's teams; not-recognised locks nothing). */
  protected lockedCards = computed<LockedCard[]>(() => {
    switch (this.outcome()) {
      case 'multi': return [
        { regId: 'nets', name: 'Netsetters 1', meta: `${t('ob.yourTeam')} · ${t('sso.fromYourId')}`, crest: 'img/logo-netsetters.svg', mono: 'H1' },
        { regId: 'vik', name: 'Vikings Grey', meta: `${t('sso.yourRepTeam')} · ${t('sso.fromYourId')}`, crest: 'img/team-vikings-grey.svg', mono: 'VG' },
      ];
      case 'family': return [
        { regId: 'vik', name: 'Vikings Grey', meta: `${t('sso.teamOf', { name: 'Maya' })} · ${t('grade.open')}`, crest: 'img/team-vikings-grey.svg', mono: 'VG' },
        { regId: 'hus', name: 'Hustle HQ', meta: `${t('sso.teamOf', { name: 'Maya' })} · ${t('grade.open')}`, crest: 'img/team-hustle-hq.svg', mono: 'HH' },
        { regId: 'cc', name: 'Chump Centrals', meta: `${t('sso.teamOf', { name: 'Noah' })} · ${t('grade.open')}`, crest: 'img/team-chump-centrals.svg', mono: 'CC' },
      ];
      case 'none': return [];
      default: return [
        { regId: 'nets', name: 'Netsetters 1', meta: `${t('ob.yourTeam')} · ${t('sso.fromYourId')}`, crest: 'img/logo-netsetters.svg', mono: 'H1' },
      ];
    }
  });
  private lockedRegIds = computed(() => new Set(this.lockedCards().map((c) => c.regId)));

  /** Per-outcome copy for the teams step (BA TeamsStepLocked heading logic). */
  protected teamsHeading = computed(() => ({
    single: t('ob.yourTeam'), multi: t('sso.yourTeamsHeading'),
    family: t('sso.athletesTeams'), none: t('ob.followTeams'),
  })[this.outcome()]);
  protected teamsSub = computed(() => ({
    single: t('sso.subSingle'),
    multi: t('sso.subMulti'),
    family: t('sso.subFamily'),
    none: t('sso.subNone'),
  })[this.outcome()]);
  protected lockedEyebrow = computed(() =>
    this.outcome() === 'family' ? t('sso.athletesTeams') : this.outcome() === 'multi' ? t('sso.yourTeamsHeading') : t('ob.yourTeam'));

  /** "Follow more teams" browse — BA's LeagueAccordion shape: single-open
   *  accordion, teams alphabetical, selection upstream. Teams carry registry ids
   *  so finish() applies them to FollowStore. */
  leagues = signal<BrowseLeague[]>([
    { id: 'l1', name: t('comp.mondayMen14'), meta: t('grade.open'), teams: [
      { id: 's3', regId: 'vik', name: 'Vikings Grey', meta: `${t('comp.mondayMen14')} · ${t('grade.open')}`, crest: 'img/team-vikings-grey.svg', mono: 'VG', followed: false, st: 'MET', org: 'Vikings VC' },
      { id: 's4', regId: 'hus', name: 'Hustle HQ', meta: `${t('comp.mondayMen14')} · ${t('grade.open')}`, crest: 'img/team-hustle-hq.svg', mono: 'HH', followed: false, st: 'NTH', org: 'Hustle VC' },
      { id: 's5', regId: 'cc', name: 'Chump Centrals', meta: `${t('comp.mondayMen14')} · ${t('grade.open')}`, crest: 'img/team-chump-centrals.svg', mono: 'CC', followed: false, st: 'MET', org: 'Chump VC' },
      { id: 's6', regId: 'sky', name: 'Sky Riders', meta: `${t('comp.mondayMen14')} · ${t('grade.open')}`, crest: 'img/team-sky-riders.svg', mono: 'SR', followed: false, st: 'EST', org: 'Sky VC' },
    ].sort((a, b) => a.name.localeCompare(b.name)) },
    { id: 'l2', name: t('comp.tuesdayB3Men'), meta: t('grade.openA1'), teams: [
      { id: 's1', regId: 'braves', name: 'Bayside Breakers', meta: `${t('league.stateDiv1')} · ${t('grade.openA1')}`, crest: 'img/logo-breakers.svg', mono: 'BB', followed: false, st: 'MET', org: 'Bayside VC' },
      { id: 's7', regId: 'met', name: 'Melton Meteors', meta: `${t('comp.tuesdayB3Men')} · ${t('grade.openA1')}`, crest: 'img/team-melton-meteors.svg', mono: 'MM', followed: false, st: 'MET', org: 'Melton VC' },
    ] },
    { id: 'l3', name: t('comp.tuesdayB2Women'), meta: t('grade.openB3'), teams: [
      { id: 's2', regId: 'flames', name: 'Northside Flames', meta: `${t('comp.tuesdayB2Women')} · ${t('grade.openB3')}`, crest: 'img/team-northside-flames.svg', mono: 'NF', followed: false, st: 'STH', org: 'Northside VC' },
      { id: 's8', regId: 'reds', name: 'Richmond Redbacks', meta: `${t('comp.tuesdayB2Women')} · ${t('grade.openB3')}`, crest: 'img/team-richmond-redbacks.svg', mono: 'RR', followed: false, st: 'MET', org: 'Richmond VC' },
    ] },
  ]);

  /** WHICH leagues are open — a set, not one id. Single-open is the BA product
   *  call (May 2026) and it is right for browsing a registry cold; it is the
   *  wrong answer once a filter has produced a shortlist, because a filter that
   *  matches teams across three leagues could only ever show one of them
   *  (Maryna 2026-08-31). So the mode follows the filter: one at a time while
   *  browsing, all matches while filtered. */
  private openIds = signal<Set<string>>(new Set(['l1']));
  isLeagueOpen(id: string): boolean { return this.openIds().has(id); }
  toggleLeague(id: string): void {
    const open = new Set(this.openIds());
    if (this.browseFiltered()) {
      // Filtered: several leagues ARE the answer, so the heads act independently
      // and closing one is still a real action.
      if (open.has(id)) open.delete(id); else open.add(id);
    } else {
      // Browsing: one at a time, so a long registry stays scannable.
      const wasOpen = open.has(id);
      open.clear();
      if (!wasOpen) open.add(id);
    }
    this.openIds.set(open);
  }
  /** Filtering opens what it matched. It used to leave every match collapsed:
   *  State = SA narrowed eight teams to one and then asked for another tap to
   *  see it, so the result of the filter was a closed door. The Clips folders on
   *  /you already work this way (Maryna 2026-08-31).
   *  Called from the two places a filter can change, rather than an effect, so
   *  the seeding happens once per change and reads the already-recomputed
   *  visibleLeagues() rather than racing it. */
  private openMatches(): void {
    const vis = this.visibleLeagues();
    this.openIds.set(new Set(
      (this.browseFiltered() ? vis : vis.slice(0, 1)).map((l) => l.id)));
  }

  // Browse filter — State · Organisation · League (Yuval 2026-08-23, replacing
  // the age-only chips; Grade dropped 2026-08-26 — not offered as a filter).
  // Multi-select per category, AND across.
  private readonly BROWSE_CATS = [
    { key: 'state', label: t('filter.state') },
    { key: 'org', label: t('filter.org') },
    { key: 'league', label: t('filter.league') },
  ] as const;
  browseFilters = signal<Record<string, string[]>>({ state: [], org: [], league: [] });
  /** A browse team's attributes = its own state/org + its league's name. */
  private teamAttrs(t: FollowOpt, l: BrowseLeague): Record<string, string> {
    return { state: t.st ?? '', org: t.org ?? '', league: l.name };
  }
  protected browseCategories = computed<FilterBarCategory[]>(() => {
    const all = this.leagues();
    const vals = (key: string) => [...new Set(all.flatMap((l) => l.teams.map((t) => this.teamAttrs(t, l)[key])).filter(Boolean))].sort();
    return this.BROWSE_CATS.map((c) => ({ key: c.key, label: c.label, options: vals(c.key) }));
  });
  private teamPasses(t: FollowOpt, l: BrowseLeague): boolean {
    const f = this.browseFilters(); const a = this.teamAttrs(t, l);
    return Object.keys(f).every((k) => f[k].length === 0 || f[k].includes(a[k]));
  }
  toggleBrowseFilter(cat: string, value: string): void {
    const f = { ...this.browseFilters() };
    f[cat] = f[cat].includes(value) ? f[cat].filter((v) => v !== value) : [...f[cat], value];
    this.browseFilters.set(f);
    this.openMatches();
  }
  clearBrowseFilters(): void {
    this.browseFilters.set({ state: [], org: [], league: [] });
    this.openMatches();
  }
  /** Browse = leagues minus the LOCKED teams (already followed above), narrowed
   *  by the filter bar; leagues emptied by the lock/filter are dropped. */
  protected visibleLeagues = computed(() => {
    const demo = this.emptyDemo();
    if (demo.has('browse') || demo.has('filters')) return [];
    const locked = this.lockedRegIds();
    return this.leagues()
      .map((l) => ({ ...l, teams: l.teams.filter((t) => !locked.has(t.regId ?? '') && this.teamPasses(t, l)) }))
      .filter((l) => l.teams.length > 0);
  });

  /** Any browse filter engaged. Tells the two empty states apart: a filter that
      matched nothing is the user's own doing and is undone with Clear, while an
      empty browse with no filters on means there is genuinely nothing left to
      follow (Maryna 2026-08-30). */
  protected browseFiltered = computed(() => {
    if (this.emptyDemo().has('filters')) return true;
    const f = this.browseFilters();
    return Object.values(f).some((v) => v.length > 0);
  });

  followedIn(l: BrowseLeague): number { return l.teams.filter((t) => t.followed).length; }

  protected browseTeams = computed(() => {
    const locked = this.lockedRegIds();
    return this.leagues().flatMap((l) => l.teams).filter((t) => !locked.has(t.regId ?? ''));
  });
  /** Locked team(s) + browse picks — the "Continue — N teams" CTA count. */
  protected teamCount = computed(() =>
    this.lockedCards().length + this.browseTeams().filter((t) => t.followed).length);

  nextFromTeams(): void { this.step.set(this.outcome() === 'none' ? 'notif' : 'teammates'); }
  /** Back always means "the previous step of this outcome's flow". The two
   *  hand-written targets this replaces also sent the not-identified flow back
   *  to `identify`, a screen that flow never had. */
  goBack(): void {
    const i = this.order().indexOf(this.step());
    if (i > 0) this.step.set(this.order()[i - 1]);
  }

  // ---- follow-teammates (athlete: own roster; family: the kids' teammates) ----
  /** One roster PER TEAM, never one merged list (manager, 2026-09-02). A
   *  multi-team athlete was shown three people with no way to tell which of
   *  their two teams each played for, and the two rosters are the reason that
   *  athlete is in this flow at all. The team is now the group heading, so each
   *  row's meta carries only the jersey and position. */
  private athleteGroups = signal<TeammateGroup[]>([
    { regId: 'nets', team: 'Netsetters 1', people: [
      { id: 't1', name: 'Aiden Cole', meta: '#12 · S', mono: 'AC', followed: true },
      { id: 't2', name: 'Marcus Lee', meta: '#23 · MB', mono: 'ML', followed: true },
      { id: 't3', name: 'Dylan Cross', meta: '#4 · OH', mono: 'DC', followed: false },
    ] },
    { regId: 'vik', team: 'Vikings Grey', people: [
      { id: 't4', name: 'Jordan Reed', meta: '#11 · L', mono: 'JR', followed: true },
      { id: 't5', name: 'Tyler Okafor', meta: '#6 · OPP', mono: 'TO', followed: false },
    ] },
  ]);
  private familyGroups = signal<TeammateGroup[]>([
    { regId: 'vik', team: 'Vikings Grey', athlete: 'Maya', people: [
      { id: 'f1', name: 'Ruby Chen', meta: '#12 · S', mono: 'RC', followed: true },
    ] },
    { regId: 'hus', team: 'Hustle HQ', athlete: 'Maya', people: [
      { id: 'f2', name: 'Sofia Novak', meta: '#8 · OH', mono: 'SN', followed: false },
    ] },
    { regId: 'cc', team: 'Chump Centrals', athlete: 'Noah', people: [
      { id: 'f3', name: 'Oliver Reed', meta: '#5 · MB', mono: 'OR', followed: true },
      { id: 'f4', name: 'Ethan Park', meta: '#10 · S', mono: 'EP', followed: false },
    ] },
  ]);
  /** Which groups show is DERIVED from the locked team cards, not listed a
   *  second time: `single` locks Netsetters 1 alone and so gets one roster,
   *  `multi` locks both and gets two. A team added to one screen cannot go
   *  missing from the other. */
  protected teammateGroups = computed<TeammateGroup[]>(() => {
    if (this.emptyDemo().has('teammates')) return [];
    const locked = this.lockedRegIds();
    const src = this.outcome() === 'family' ? this.familyGroups() : this.athleteGroups();
    return src.filter((g) => locked.has(g.regId) && g.people.length > 0);
  });
  /** Flat, for the "nothing came through" check only. */
  protected teammates = computed(() => this.teammateGroups().flatMap((g) => g.people));
  protected teammatesSub = computed(() =>
    this.outcome() === 'family'
      ? t('sso.tmSubFamily')
      : this.teammateGroups().length > 1
        ? t('sso.tmSubRosters')
        : t('sso.tmSubAthlete'));

  setFollowed(list: 'teams' | 'teammates', id: string, followed: boolean): void {
    if (list === 'teams') {
      this.leagues.update((ls) => ls.map((l) =>
        ({ ...l, teams: l.teams.map((t) => (t.id === id ? { ...t, followed } : t)) })));
      return;
    }
    const src = this.outcome() === 'family' ? this.familyGroups : this.athleteGroups;
    src.update((gs) => gs.map((g) =>
      ({ ...g, people: g.people.map((x) => (x.id === id ? { ...x, followed } : x)) })));
  }

  // ---- notifications — SIMPLE consent pre-prompt (BA NotifUpsell; the
  // per-category toggles live in Settings › Notifications, not onboarding) ----
  notifPerks: string[] = [
    t('sso.perkLive'),
    t('sso.perkHl'),
    t('sso.perkTeammates'),
  ];

  // ---- consent (BA ConsentStep parity: marketing opt-in + ATSI) ----
  /** "Hoops TV updates" marketing consent — opt-in, defaults OFF (Spam Act). */
  consentUpdates = signal(false);
  /** Required Terms & Conditions acceptance — gates "You're all set". */
  termsAccepted = signal(false);
  /** ATSI status — ABS standard wording, optional. PLACEHOLDER pending BA sign-off. */
  protected atsiOptions: { id: string; label: string }[] = [
    { id: 'no', label: t('sso.atsiNo') },
    { id: 'aboriginal', label: t('sso.atsiAb') },
    { id: 'tsi', label: t('sso.atsiTsi') },
    { id: 'both', label: t('sso.atsiBoth') },
    { id: 'prefer-not', label: t('auth.preferNot') },
  ];
  atsi = signal<string | null>(null);

  private applyFollows(): void {
    // apply the confirmed follows to the app for real (Watch/Home reflect them)
    for (const c of this.lockedCards()) this.follows.follow(c.regId);
    for (const t of this.browseTeams()) if (t.followed && t.regId) this.follows.follow(t.regId);
  }

  finish(): void {
    this.applyFollows();
    void this.router?.navigate(['/home']);
  }
}
