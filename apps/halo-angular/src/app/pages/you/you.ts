import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Location } from '@angular/common';
import { GridColumns } from '../../grid-columns';
import { Router } from '@angular/router';
import { SegmentedToggle } from '../../../lib/molecules/segmented-toggle/segmented-toggle';
import { EventFilterBar, FilterBarCategory } from '../../../lib/organisms/event-filter-bar/event-filter-bar';
import { TabNav } from '../../tab-nav';
import { NotificationStore } from '../../notification-store';
import { ReelStore } from '../../reel-store';
import { ProfileState, ViewProfile } from '../../profile-state';
import { ViewContext } from '../../view-context';
import { UpgradeState } from '../../upgrade-state';
import { ToastState } from '../../toast-state';
import { isClipLocked, isPremiumPlay } from '../../clip-access';
import { teamIdOf, TEAM_LINKS } from '../../team-data';
import { AdSlot } from '../../../lib/organisms/ad-slot/ad-slot';
import { BlurLock } from '../../../lib/organisms/blur-lock/blur-lock';
import { StatusBar } from '../../../lib/molecules/status-bar/status-bar';
import { AppTopBar } from '../../app-top-bar';
import { HaloIcon } from '../../../lib/atoms/icon/icon';
import { ProfileIdentity, IdentityTeam } from '../../../lib/organisms/profile-identity/profile-identity';
import { StatGrid, StatGridCell } from '../../../lib/molecules/stat-grid/stat-grid';
import { EmptyState } from '../../../lib/molecules/empty-state/empty-state';
import { HaloButton } from '../../../lib/atoms/button/button';
import { Score } from '../../../lib/atoms/score/score';
import { averagesFor } from '../../stats-data';
import { SectionHeader } from '../../../lib/molecules/section-header/section-header';
import { RailCard } from '../../../lib/organisms/rail-card/rail-card';
import { AnalyticsCard, GaugeData, TileData, ChartData } from '../../../lib/organisms/analytics-card/analytics-card';
import { StatDatum } from '../../../lib/organisms/trend-chart/trend-chart';
import { ShotMap } from '../../../lib/organisms/shot-map/shot-map';
import { BottomNav } from '../../../lib/organisms/bottom-nav/bottom-nav';
import { t, plural, pctile, fmtDate } from '../../i18n/i18n';
import { TPipe } from '../../i18n/t.pipe';

export type ClipSource = 'my' | 'ai';
export type ClipDate = 'all' | 'season' | '30d';
export interface Clip {
  title: string;
  dur: string;
  thumb: string;
  source: ClipSource;
}
/** A horizontal (16:9) game video — recap or game highlights, distinct from the
    athlete's vertical personal clips. Plays in the horizontal player. */
export interface GameVideo {
  title: string;
  kind: string;
  dur: string;
  thumb: string;
}
export interface ClipGame {
  id: string;
  opponent: string;
  score: string;
  /** ISO date for filtering. */
  date: string;
  /** Short display date, e.g. "Jun 3". */
  dateLabel: string;
  /** Horizontal game highlights + recap (16:9). */
  videos: GameVideo[];
  clips: Clip[];
}

/** You — the athlete profile: identity, season strip, Offence / Attack map / Defence analytics. */
@Component({
  selector: 'halo-you-page',
  standalone: true,
  imports: [AppTopBar, StatusBar, HaloIcon, ProfileIdentity, StatGrid, SectionHeader, RailCard, AnalyticsCard, ShotMap, BottomNav, AdSlot, BlurLock, SegmentedToggle, EmptyState, HaloButton, Score, EventFilterBar, GridColumns, TPipe],
  templateUrl: './you.html',
  styleUrl: './you.scss',
})
export class YouPage {
  protected readonly plural = plural;
  protected tabNav = inject(TabNav);
  protected notifs = inject(NotificationStore);
  // FederationState injection removed 2026-08-27 — it was never read here.
  // Nothing on You is federation-scoped: it's the viewer's own profile and clips.
  private vc = inject(ViewContext);
  private upgrade = inject(UpgradeState);
  private toast = inject(ToastState);
  private reel = inject(ReelStore);
  protected profileState = inject(ProfileState);
  private router = inject(Router);

  private location = inject(Location);
  /** No avatar-upload flow exists yet — the header always falls back to initials. */

  constructor() {
    /* You is Basic+ only, and FANS have no You tab at all (Yuval 2026-08-23).
       The route guard bounces on navigation, but the dev-bar can flip tier or
       persona while we're already here — re-apply the rule reactively. */
    effect(() => {
      if (this.vc.caps().isFan) { void this.router.navigateByUrl('/home'); return; }
      if (this.vc.tier() === 'free') {
        this.upgrade.open();
        void this.router.navigateByUrl('/home');
      }
    });
    /* Restore the tab on history-back (game icon → game page → back): the tab
       is mirrored into the URL, so /you?tab=Clips re-selects Clips. */
    effect(() => {
      const t = this.tabQ();
      if (this.tabs.includes(t)) this.activeTab.set(t);
    });
  }

  /** Route-borne tab (?tab=Clips) — see the restore effect above. */
  tabQ = input('', { alias: 'tab' });
  setTab(t: string): void {
    this.activeTab.set(t);
    this.location.replaceState('/you', 'tab=' + t);
  }

  /** Per-clip tier gate on the Clips tiles — same rule as the highlight player. */
  clipLocked = (c: Clip): boolean => isClipLocked(c.title, this.vc.tier());
  clipPremium = (c: Clip): boolean => isPremiumPlay(c.title);
  /**
   * Tap a clip tile: locked → paywall; otherwise play THAT clip.
   *
   * It used to open `/watch/highlight` bare, which is the whole reel — story
   * chrome, eight progress segments, other people's reels either side. Clips is
   * a library, and a tile in a library plays its own file (Maryna 2026-08-30).
   * The title and the frame are all the player renders, so they travel in the
   * URL and the clip stays deep-linkable.
   */
  onClipTap(c: Clip): void {
    if (this.clipLocked(c)) { this.upgrade.open(); return; }
    void this.router.navigate(['/watch/highlight'], {
      queryParams: { clip: c.title, thumb: c.thumb },
    });
  }
  /** Game highlights / recap are 16:9 → the horizontal player (not the reel). */
  /** Pass the video's own kind through so the player names and clocks it
      correctly (2026-08-27): these are 1-3 minute recaps and highlight
      reels, not the 1:42:10 full game the player used to assume. */
  openVod(kind?: string, total?: string): void {
    const k = kind === t('kind.recap') ? 'recap' : kind === t('home.gameHighlights') ? 'highlights' : 'full';
    void this.router.navigate(['/watch/vod'], { queryParams: { kind: k, ...(total ? { total } : {}) } });
  }
  notYetEditor(): void { this.toast.show(t('you.editorSoon')); }
  /** Download a clip straight from the card (Yuval 2026-08-23) — prototype
      stub: real export isn't wired, so confirm the intent via a toast. */
  downloadClip(c: Clip): void { this.toast.show(t('you.downloading', { title: c.title })); }
  /** Clips-folder ball chip → the game's detail page (demo data has one game page). */
  openGamePage(): void { void this.router.navigate(['/game']); }
  teamIdOf = teamIdOf;
  teamLinks = TEAM_LINKS;
  openTeamId(id: string): void { void this.router.navigate(['/team', id]); }

  /** You is Basic+ only (Free is bounced by the route guard); Premium unlocks depth. */
  protected premium = computed(() => this.vc.caps().isPremium);
  protected openUpgrade(): void {
    this.upgrade.open();
  }
  // Clips first (2026-08-27): the reel is what an athlete opens this tab for;
  // stats are the deeper read. Order here drives BOTH the tab strip and the
  // landing tab, so the default follows automatically.
  tabs = ['Clips', 'Stats'];
  protected caps = computed(() => this.vc.caps());

  /** Same order, as the segmented control's options — minus any tab this viewer
   *  is not offered. Derived, not filtered at the call site, so the strip and
   *  the guard below cannot disagree. */
  protected tabOptions = computed(() =>
    this.tabs.filter((tab) => tab !== 'Stats' || this.caps().showStatsTab).map((tab) => ({ key: tab, label: tab === 'Stats' ? t('you.stats') : t('you.clips') })));
  activeTab = signal('Clips');
  /** A withheld tab must also be unreachable by URL: `/you?tab=Stats` set the
   *  signal directly, so basic could deep-link past the hidden switcher into the
   *  surface it does not have (Maryna 2026-08-30). */
  protected effectiveTab = computed(() =>
    this.tabOptions().some((o) => o.key === this.activeTab()) ? this.activeTab() : this.tabs[0]);

  // ---- whose profile — driven by the app-wide ProfileState (menu + Home stay
  //      in sync) for the PERSON case; the multi-team athlete's TEAM picker is a
  //      separate, within-profile control that stays local to this tab.
  protected switcherIsTeam = computed(() => this.vc.caps().multiTeam && !this.vc.caps().isParent);
  /* Multi-team athlete: the SAME person on two teams, so only the team (and
     its grade) varies. metaLines stays empty — the team line renders the team
     and the picker shows the grade. */
  private teamProfiles: ViewProfile[] = [
    { id: 'nets', name: 'Tal Weiss', number: 7 as number | null, metaLines: [] as string[], team: 'Netsetters 1', grade: `${t('grade.open')} · ${t('grade.tierA')}`, pill: 'Netsetters 1', avatar: 'H', crest: 'img/logo-netsetters.svg', mono: 'H1' },
    { id: 'vik', name: 'Tal Weiss', number: 12 as number | null, metaLines: [] as string[], team: 'Vikings Grey', grade: `${t('grade.open')} · ${t('grade.rep')}`, pill: 'Vikings Grey', avatar: 'V', crest: '', mono: 'VG' },
  ];
  private localTeamId = signal('nets');
  /** The switcher's entries: teams (multi-team athlete) or people (ProfileState). */
  protected profiles = computed(() => (this.switcherIsTeam() ? this.teamProfiles : this.profileState.profiles()));
  protected selProfile = computed(() =>
    this.switcherIsTeam()
      ? (this.teamProfiles.find((p) => p.id === this.localTeamId()) ?? this.teamProfiles[0])
      : this.profileState.selected(),
  );
  /* The card's team line. A single-team profile gets a one-entry array, which
     is why the card looks the same either way — only the chevron differs. */
  protected identityTeams = computed<IdentityTeam[]>(() => {
    if (this.switcherIsTeam()) {
      return this.teamProfiles.map((p) => ({ id: p.id, name: p.team, crest: p.crest, mono: p.mono, number: p.number, grade: p.grade }));
    }
    const p = this.selProfile();
    // A profile that carries its own team list drives the picker directly: the
    // person doesn't change with the choice, only which squad is in context.
    // That's the coach case (ProfileState seeds their squads).
    if (p.teams?.length) return p.teams;
    return p.team ? [{ id: p.id, name: p.team, crest: p.crest, mono: p.mono, number: p.number, grade: p.grade }] : [];
  });
  /** Which squad a multi-team profile (coach) is looking at. */
  private profileTeamId = signal('');
  protected activeTeamId = computed(() => {
    if (this.switcherIsTeam()) return this.localTeamId();
    const p = this.selProfile();
    if (!p.teams?.length) return p.id;
    const picked = this.profileTeamId();
    // Falls back to the first squad whenever the pick doesn't belong to this
    // profile (persona switched under us).
    return p.teams.some((t) => t.id === picked) ? picked : p.teams[0].id;
  });
  /** Picking a team re-scopes the profile: its number and grade come with it. */
  protected pickTeam(id: string): void {
    if (this.switcherIsTeam()) { this.localTeamId.set(id); return; }
    if (this.selProfile().teams?.length) this.profileTeamId.set(id);
  }

  protected showSwitcher = computed(() => this.profiles().length > 1);
  switcherOpen = signal(false);
  pickProfile(id: string): void {
    if (this.switcherIsTeam()) this.localTeamId.set(id); else this.profileState.select(id);
    this.switcherOpen.set(false);
  }

  /* Per-game averages as a 2×3 grid (PTS featured). Read from stats-data.ts,
     the same source the game page compares a single game against — two literals
     would drift apart the moment either page was edited. */
  protected season = computed<StatGridCell[]>(() => {
    const s = averagesFor(this.selProfile().id) ?? averagesFor('self')!;
    return [
      // One decimal throughout: a 1.0 rendered as "1" beside 1.4 and 8.1 read as a
      // different kind of number (UI review U3, 2026-09-08). GP is a count.
      { k: 'PTS', v: s.avg.PTS.toFixed(1), hot: true },
      { k: 'GP', v: s.gp },
      { k: 'K', v: s.avg.K.toFixed(1) },
      { k: 'ACE', v: s.avg.ACE.toFixed(1) },
      { k: 'BLK', v: s.avg.BLK.toFixed(1) },
      { k: 'DIG', v: s.avg.DIG.toFixed(1) },
    ];
  });

  // ---- Clips tab ----
  // Direct parity with the design-yoni proto's "Clips" tab (HighlightsTabBody):
  // a Source · Game · Date filter bar over per-game collapsible folders; each
  // folder opens on a 3-col grid of 9:16 clip tiles. Most-recent game open by
  // default; filtering auto-opens matching folders and hides empty ones.
  clipGames: ClipGame[] = [
    {
      id: 'g1', opponent: 'Vikings Grey', score: '3–1', date: '2026-06-03', dateLabel: fmtDate(new Date(2026, 5, 3), { month: 'short', day: 'numeric' }),
      videos: [
        { title: t('you.fullGameRecap'), kind: t('kind.recap'), dur: '3:12', thumb: 'img/game-1.webp' },
        { title: t('you.topPlays'), kind: t('home.gameHighlights'), dur: '1:40', thumb: 'img/game-2.webp' },
      ],
      // The BUSIEST game in the seed, deliberately: eighteen AI moments, so the
      // row cap and its "Show all" are on screen at EVERY width (Maryna
      // 2026-09-02). Two rows is 6 tiles at three columns, 10 at five and 16 at
      // eight, so a folder needs more than sixteen to prove the control on a
      // 1920 screen. Nothing smaller demonstrates it there, because with less
      // the tiles genuinely fit and showing the control would be the defect.
      clips: [
        // the clip from the "Your clip is ready" notification (CM-1417) — kept here to rewatch
        { title: t('play.requested'), dur: '0:12', thumb: 'img/clip-1.webp', source: 'ai' },
        { title: t('play.lineShot'), dur: '0:09', thumb: 'img/clip-2.webp', source: 'ai' },
        { title: t('play.crossCourtKill'), dur: '0:07', thumb: 'img/clip-3.webp', source: 'ai' },
        { title: t('play.digToKill'), dur: '0:11', thumb: 'img/clip-4.webp', source: 'my' },
        { title: t('play.backRowAttack'), dur: '0:08', thumb: 'img/clip-5.webp', source: 'ai' },
        { title: t('play.jumpServeAce'), dur: '0:12', thumb: 'img/clip-6.webp', source: 'my' },
        { title: t('play.setPointKill'), dur: '0:06', thumb: 'img/clip-7.webp', source: 'ai' },
        { title: t('play.sharpAngle'), dur: '0:08', thumb: 'img/clip-8.webp', source: 'ai' },
        { title: t('play.overpassKill'), dur: '0:07', thumb: 'img/clip-9.webp', source: 'ai' },
        { title: t('play.pancakeDig'), dur: '0:10', thumb: 'img/clip-10.webp', source: 'ai' },
        { title: t('play.pipeAttack'), dur: '0:09', thumb: 'img/clip-11.webp', source: 'ai' },
        { title: t('play.stuffBlock'), dur: '0:11', thumb: 'img/clip-12.webp', source: 'ai' },
        { title: t('play.quickKill'), dur: '0:06', thumb: 'img/clip-13.webp', source: 'my' },
        { title: t('play.transitionKill'), dur: '0:13', thumb: 'img/clip-14.webp', source: 'ai' },
        { title: t('play.aceToSeal'), dur: '0:14', thumb: 'img/clip-15.webp', source: 'ai' },
        { title: t('play.slideKill'), dur: '0:08', thumb: 'img/clip-16.webp', source: 'ai' },
        { title: t('play.offSpeedKill'), dur: '0:07', thumb: 'img/clip-17.webp', source: 'ai' },
        { title: t('play.pursuitSave'), dur: '0:12', thumb: 'img/clip-18.webp', source: 'ai' },
        { title: t('play.tipKill'), dur: '0:06', thumb: 'img/clip-19.webp', source: 'ai' },
        { title: t('play.blockAssist'), dur: '0:10', thumb: 'img/clip-20.webp', source: 'ai' },
        { title: t('play.floatAce'), dur: '0:08', thumb: 'img/clip-1.webp', source: 'ai' },
      ],
    },
    {
      id: 'g2', opponent: 'Hustle HQ', score: '3–1', date: '2026-05-24', dateLabel: fmtDate(new Date(2026, 4, 24), { month: 'short', day: 'numeric' }),
      videos: [
        { title: t('you.fullGameRecap'), kind: t('kind.recap'), dur: '2:58', thumb: 'img/game-3.webp' },
        { title: t('you.topPlays'), kind: t('home.gameHighlights'), dur: '1:22', thumb: 'img/game-4.webp' },
      ],
      clips: [
        { title: t('play.noLookSet'), dur: '0:10', thumb: 'img/clip-2.webp', source: 'ai' },
        { title: t('play.matchPointKill'), dur: '0:07', thumb: 'img/clip-3.webp', source: 'ai' },
        { title: t('play.soloBlock'), dur: '0:08', thumb: 'img/clip-4.webp', source: 'my' },
        { title: t('play.backSetAssist'), dur: '0:13', thumb: 'img/clip-5.webp', source: 'ai' },
      ],
    },
    {
      id: 'g3', opponent: 'Chump Centrals', score: '3–0', date: '2026-05-21', dateLabel: fmtDate(new Date(2026, 4, 21), { month: 'short', day: 'numeric' }),
      videos: [
        { title: t('you.fullGameRecap'), kind: t('kind.recap'), dur: '2:45', thumb: 'img/game-5.webp' },
      ],
      clips: [
        { title: t('play.freeBallKill'), dur: '0:09', thumb: 'img/clip-6.webp', source: 'ai' },
        { title: t('play.shortServeAce'), dur: '0:07', thumb: 'img/clip-7.webp', source: 'my' },
        { title: t('play.roofBlock'), dur: '0:06', thumb: 'img/clip-8.webp', source: 'ai' },
      ],
    },
    // Five more rounds back, on the competition's weekly cadence, so the folder
    // list runs past one page and the Load more is real rather than described.
    // The dates also straddle the "Last 30 days" cutoff, which makes that filter
    // do something visible too.
    {
      id: 'g4', opponent: 'Sky Riders', score: '2–3', date: '2026-05-14', dateLabel: fmtDate(new Date(2026, 4, 14), { month: 'short', day: 'numeric' }),
      videos: [{ title: t('you.fullGameRecap'), kind: t('kind.recap'), dur: '3:04', thumb: 'img/game-6.webp' }],
      clips: [
        { title: t('play.setterDump'), dur: '0:08', thumb: 'img/clip-9.webp', source: 'ai' },
        { title: t('play.divingDig'), dur: '0:07', thumb: 'img/clip-10.webp', source: 'ai' },
        { title: t('play.rallyWin'), dur: '0:09', thumb: 'img/clip-11.webp', source: 'my' },
      ],
    },
    {
      id: 'g5', opponent: 'Torres', score: '3–0', date: '2026-05-07', dateLabel: fmtDate(new Date(2026, 4, 7), { month: 'short', day: 'numeric' }),
      videos: [{ title: t('you.fullGameRecap'), kind: t('kind.recap'), dur: '2:51', thumb: 'img/game-7.webp' }],
      clips: [
        { title: t('play.softBlock'), dur: '0:08', thumb: 'img/clip-12.webp', source: 'ai' },
        { title: t('play.jumpSetAssist'), dur: '0:06', thumb: 'img/clip-13.webp', source: 'ai' },
        { title: t('play.crossCourtKill'), dur: '0:07', thumb: 'img/clip-14.webp', source: 'ai' },
        { title: t('play.joustWin'), dur: '0:10', thumb: 'img/clip-15.webp', source: 'my' },
      ],
    },
    {
      id: 'g6', opponent: 'Medium Fund.', score: '2–3', date: '2026-04-30', dateLabel: fmtDate(new Date(2026, 3, 30), { month: 'short', day: 'numeric' }),
      videos: [{ title: t('you.fullGameRecap'), kind: t('kind.recap'), dur: '3:08', thumb: 'img/game-8.webp' }],
      clips: [
        { title: t('play.oneHandSet'), dur: '0:09', thumb: 'img/clip-16.webp', source: 'ai' },
        { title: t('play.overheadDig'), dur: '0:07', thumb: 'img/clip-17.webp', source: 'ai' },
      ],
    },
    {
      id: 'g7', opponent: 'Spike City', score: '3–2', date: '2026-04-23', dateLabel: fmtDate(new Date(2026, 3, 23), { month: 'short', day: 'numeric' }),
      videos: [{ title: t('you.fullGameRecap'), kind: t('kind.recap'), dur: '2:47', thumb: 'img/game-9.webp' }],
      clips: [
        { title: t('play.lineShot'), dur: '0:08', thumb: 'img/clip-18.webp', source: 'ai' },
        { title: t('play.jumpServeAce'), dur: '0:07', thumb: 'img/clip-19.webp', source: 'ai' },
        { title: t('play.divingDig'), dur: '0:11', thumb: 'img/clip-20.webp', source: 'ai' },
      ],
    },
    {
      id: 'g8', opponent: 'Hustle HQ', score: '3–2', date: '2026-04-16', dateLabel: fmtDate(new Date(2026, 3, 16), { month: 'short', day: 'numeric' }),
      videos: [{ title: t('you.fullGameRecap'), kind: t('kind.recap'), dur: '3:15', thumb: 'img/game-10.webp' }],
      clips: [
        { title: t('play.setPointKill'), dur: '0:06', thumb: 'img/clip-1.webp', source: 'ai' },
        { title: t('play.crossCourtKill'), dur: '0:09', thumb: 'img/clip-2.webp', source: 'my' },
      ],
    },
  ];

  // Filter state — Source is a segmented TOGGLE in the filter row (Yuval
  // 2026-08-23): AI moments = vertical tiles only; My clips = a mix of the
  // vertical row and the horizontal (16:9) videos row. Game/Date stay pills.
  readonly SRC_OPTS = [
    { key: 'ai', label: t('you.moments') },
    { key: 'my', label: t('you.myClips') },
  ];
  readonly DATE_OPTS: { value: ClipDate; label: string }[] = [
    { value: 'all', label: t('you.allTime') },
    { value: 'season', label: t('you.thisSeason') },
    { value: '30d', label: t('you.last30') },
  ];
  srcSel = signal<ClipSource>('ai');
  /** Coaches have no AI moments — the toggle hides and My clips is forced. */
  srcMode = computed<ClipSource>(() => (this.vc.caps().isCoach ? 'my' : this.srcSel()));
  fGame = signal<string[]>([]);
  fDate = signal<ClipDate>('all');
  private expanded = signal<Set<string>>(new Set(['g1']));

  /** Empty-state preview: `?demoEmpty=clips` renders Clips with no content at
   *  all. `?? ''` because withComponentInputBinding writes UNDEFINED into an
   *  input whose query param is absent — it does not leave the declared default
   *  in place, and calling a string method on it takes the template down
   *  (Maryna 2026-08-30). */
  demoEmpty = input('');
  protected emptyDemo = computed(() => (this.demoEmpty() ?? '').trim());
  protected noContentDemo = computed(() => this.emptyDemo().split(',').includes('clips'));
  /** The filtered variant is faked rather than driven by real filter values:
   *  which game/date pair happens to have no overlap is a property of the mock
   *  data, and a preview link should not break the next time someone edits a
   *  fixture (Maryna 2026-08-30). */
  protected noMatchDemo = computed(() => this.emptyDemo() === 'clipfilters');
  /** The three combinations the manager asked to see: clips without stats,
   *  stats without clips, and neither. Comma-separated, so `?demoEmpty=clips,stats`
   *  is the both-empty case. They are independent because they come from
   *  different places in production: clips are cut from footage, stats are
   *  scored by an official (Maryna 2026-08-30). */
  protected clipsEmpty = computed(() => this.emptyDemo().split(',').includes('clips'));
  protected statsEmpty = computed(() => this.emptyDemo().split(',').includes('stats'));
  /** Both sides empty is not two empty tabs, it is ONE empty account. The tab
   *  switcher becomes a choice between two identical nothings, which is the
   *  Honest Affordance Rule the other way round: an affordance that leads
   *  nowhere (Maryna 2026-08-30). */
  protected allEmpty = computed(() => this.clipsEmpty() && this.statsEmpty());

  filterActive = computed(() =>
    this.noMatchDemo() || this.fGame().length > 0 || this.fDate() !== 'all');
  activeFilterCount = computed(() => this.fGame().length + (this.fDate() !== 'all' ? 1 : 0));

  /** Games after Game+Date filters, clips scoped to the Source toggle.
      Moments removed in the reel player (ReelStore) are gone here too.
      Coach: clips are always empty (they create reels; no AI moments) but
      the folders stay so each can offer the Create-reel card. */
  filteredGames = computed<ClipGame[]>(() => {
    if (this.noContentDemo() || this.noMatchDemo()) return [];
    const games = this.fGame();
    const date = this.fDate();
    const cutoff = date === '30d' ? '2026-05-04' : null; // 30d before the latest game
    const mode = this.srcMode();
    const coach = this.vc.caps().isCoach;
    return this.clipGames
      .filter((g) => games.length === 0 || games.includes(g.id))
      .filter((g) => !cutoff || g.date >= cutoff)
      .map((g) => ({
        ...g,
        clips: coach ? [] : g.clips
          .filter((c) => !this.reel.isRemoved(c.title))
          .filter((c) => c.source === mode),
      }))
      .filter((g) => coach || g.clips.length > 0 || (mode === 'my' && g.videos.length > 0));
  });

  gameFilterOptions = (): { value: string; label: string }[] =>
    this.clipGames.map((g) => ({ value: g.id, label: t('you.vsOpponent', { team: g.opponent }) }));

  /** The two clip filters, in the shared bar's shape. Game is many-of; Date is
   *  one-of, with "All time" as the option that means no filter. */
  protected clipCategories = computed<FilterBarCategory[]>(() => [
    { key: 'game', label: t('you.filterGame'), options: this.gameFilterOptions() },
    { key: 'date', label: t('you.filterDate'), options: this.DATE_OPTS, single: true, defaultValue: 'all' },
  ]);
  /** Date is always present as a value, including 'all' — that is what puts the
   *  dot on "All time". The bar knows not to count it (defaultValue above). */
  protected clipSelected = computed<Record<string, string[]>>(() => ({
    game: this.fGame(),
    date: [this.fDate()],
  }));
  setClipFilter(cat: string, value: string): void {
    if (cat === 'date') { this.fDate.set(value as ClipDate); return; }
    this.toggleGame(value);
  }

  /**
   * THE TWO LEVELS OF "A LOT OF CONTENT" ON THIS TAB, and they need different
   * answers (Maryna 2026-09-02).
   *
   * Folders are games, and a season is a long list of them, so the list is
   * paged: six, then Load more. Six matches the team page's fixture sections —
   * same shape of thing, a vertical list on a page that IS the destination.
   *
   * Clips are the contents of one folder, and there the answer is the one the
   * game page already uses for the same grid: nine tiles and a Show all. Not a
   * page-by-page reveal, because a folder is one game and "all of it" is a
   * knowable, small number.
   */
  private static readonly FOLDER_PAGE = 6;
  /** ROWS, not tiles. The grid is `auto-fill`, so the column count follows the
   *  container and a fixed tile count leaves a half-empty row above the control
   *  — which claims the tiles ran out of room while they plainly had not
   *  (Maryna 2026-09-02). Two rows for a folder, because a folder is one of
   *  several on the page and two rows is a peek; the game page's own moment tab
   *  takes three, being the whole screen. */
  private static readonly CLIP_ROWS = 2;
  /** Measured by `haloGridColumns` on the grid itself. 3 is the phone value, so
   *  the first paint before the measurement lands is not a wrong shape. */
  protected clipCols = signal(3);
  protected foldersShown = signal(YouPage.FOLDER_PAGE);
  /** Folders whose clip grid has been opened out, by game id. */
  private clipsOpen = signal<ReadonlySet<string>>(new Set());

  /** Back to the first page when the RESULT changes under the viewer: the game
   *  filter, the date filter and the AI/My source toggle all rebuild this list. */
  private resetFolderPaging = effect(() => {
    this.fGame(); this.fDate(); this.srcMode();
    this.foldersShown.set(YouPage.FOLDER_PAGE);
  });

  protected shownGames = computed(() => this.filteredGames().slice(0, this.foldersShown()));
  protected foldersLeft = computed(() =>
    Math.max(0, this.filteredGames().length - this.shownGames().length));
  loadMoreFolders(): void {
    this.foldersShown.update((n) => n + YouPage.FOLDER_PAGE);
  }

  /** The clips of one folder, capped until its Show all is used. */
  protected clipsCap = computed(() => this.clipCols() * YouPage.CLIP_ROWS);
  clipsOf = (g: ClipGame): ClipGame['clips'] =>
    (this.clipsOpen().has(g.id) ? g.clips : g.clips.slice(0, this.clipsCap()));
  clipsHidden = (g: ClipGame): number => g.clips.length - this.clipsOf(g).length;
  clipsAllShown = (g: ClipGame): boolean => this.clipsOpen().has(g.id);
  /**
   * A state the viewer switched on, they can switch off. Eighteen tiles inside
   * one folder of eight is a real cost to scroll past, and the control is
   * already in place, so the way back is a label rather than a new element
   * (Maryna 2026-09-02). `Load more` has no counterpart on purpose: nobody
   * expects to un-load a page, and collapsing would throw the reader back up
   * the page.
   */
  toggleAllClips(id: string): void {
    this.clipsOpen.update((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    // Collapsing removes rows ABOVE the control, so it travels up the page and
    // out from under the pointer. Bring it back to where the eye already is.
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(`[data-clips-toggle="${id}"]`)
        ?.scrollIntoView({ block: 'nearest' });
    });
  }

  isFolderOpen = (id: string): boolean => this.filterActive() || this.expanded().has(id);

  /* Where the press STARTED. A `click` fires on the nearest common ancestor of
     mousedown and mouseup, so a press that begins on the overflow button and
     drifts a pixel before release is reported on the ROW — and the row is the
     folder's toggle, so the panel shut under the user's hand while the button
     they were aiming at had visibly taken the hover (Maryna 2026-08-30).
     stopPropagation on the button cannot help: by then the event is the row's
     own. The origin is the only thing that says whose click it was. */
  toggleFolder(id: string): void {
    const next = new Set(this.expanded());
    next.has(id) ? next.delete(id) : next.add(id);
    this.expanded.set(next);
  }

  /* Per-game overflow menu (2026-08-27). Replaces two icon-only circles in the
     folder header: a hand-drawn "basketball" that read as a prohibition sign at
     15px, and an `--primary`-filled pencil that was the loudest thing in the
     row while having NO click handler at all. Labelled menu items say what each
     action does instead of asking the user to tap and find out by being
     navigated away. One trigger, so the header also stops nesting two buttons
     inside its own role="button". */
  menuFolder = signal<string | null>(null);
  isMenuOpen = (id: string): boolean => this.menuFolder() === id;
  toggleMenu(id: string): void {
    this.menuFolder.set(this.menuFolder() === id ? null : id);
  }
  closeMenu(): void { this.menuFolder.set(null); }
  /** Menu → the game's detail page. */
  menuOpenGame(): void { this.closeMenu(); this.openGamePage(); }
  /** Menu → clip editor. Honest toast until the editor ships; the old button
   *  silently did nothing. */
  menuEditClips(): void { this.closeMenu(); this.notYetEditor(); }

  toggleGame(v: string): void {
    const cur = this.fGame();
    this.fGame.set(cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]);
  }
  clearFilters(): void {
    this.fGame.set([]);
    this.fDate.set('all');
  }

  // ---- Offence ----
  offGauge: GaugeData = { value: '31%', percent: 31, caption: t('stat.hitPct'), short: 'HIT%', delta: '▲ +15%', chips: [t('stat.div', { v: '27%' }), t('stat.peak', { v: '48%' })], scale: 'off' };
  offTiles: TileData[] = [
    { label: t('stat.killPct'), short: 'K%', value: '42%', tag: t('stat.avg', { v: '38%' }), delta: '▲ +11%', tone: 'up' },
    { label: t('stat.servePct'), short: 'SRV', value: '93%', tag: t('stat.avg', { v: '90%' }), delta: t('stat.steady'), tone: 'flat' },
  ];
  offChart: ChartData = {
    title: 'K', titleSub: t('stat.perGame'), trend: `▲ +12% · ${t('stat.vsLast10')}`, season: '184', accent: 'off',
    points: [10, 11, 9, 12, 11, 10, 13, 12, 11, 12],
    statChips: ['K', 'ACE', 'BLK', 'DIG', 'AST', 'E', 'HIT%'],
    legendLabel: t('stat.perGameOf', { s: 'K' }),
    verdictTitle: t('verdict.trendingUp'),
    verdictText: t('verdict.trendingUpText'),
  };
  /** Per-chip trend data for the Offence card — picking a chip swaps the chart.
   *  K (kills) is the free stat; the rest are gated behind Premium.
   *
   *  VERDICT COPY RULES (2026-08-28). Every line obeys three rules:
   *  · never state a DIRECTION ("trending up", "climbing") — the delta line
   *    above computes it per window and would contradict the copy;
   *  · never state a WINDOW ("over the last 10", "late in the season");
   *  · second person. This is the viewer's own profile.
   *  Every match cited below is the real maximum of its own points array (the
   *  marker takes the first of equal highs); E cites the MINIMUM, since fewer
   *  attack errors is the good night. */
  offStatData: Record<string, StatDatum> = {
    'K': {
      points: [11, 9, 14, 12, 8, 13, 10, 12, 9, 11, 15, 12, 10, 13, 11, 14], season: '184',
      legendLabel: t('stat.perGameOf', { s: 'K' }), verdictTitle: t('verdict.k'),
      verdictText: t('verdict.kText'),
    },
    'ACE': {
      points: [1, 2, 0, 1, 2, 1, 3, 1, 0, 2, 1, 2, 1, 0, 2, 3], season: '22',
      legendLabel: t('stat.perGameOf', { s: 'ACE' }), verdictTitle: t('verdict.ace'),
      verdictText: t('verdict.aceText'),
    },
    'BLK': {
      points: [1, 0, 2, 1, 1, 0, 1, 2, 1, 1, 0, 3, 1, 1, 2, 1], season: '18',
      legendLabel: t('stat.perGameOf', { s: 'BLK' }), verdictTitle: t('verdict.blk'),
      verdictText: t('verdict.blkText'),
    },
    'DIG': {
      points: [7, 9, 8, 6, 10, 8, 7, 9, 11, 8, 7, 9, 12, 8, 7, 9], season: '135',
      legendLabel: t('stat.perGameOf', { s: 'DIG' }), verdictTitle: t('verdict.dig'),
      verdictText: t('verdict.digText'),
    },
    'AST': {
      points: [2, 3, 1, 2, 4, 2, 3, 2, 1, 3, 2, 4, 3, 2, 5, 2], season: '41',
      legendLabel: t('stat.perGameOf', { s: 'AST' }), verdictTitle: t('verdict.ast'),
      verdictText: t('verdict.astText'),
    },
    'E': {
      points: [4, 5, 3, 4, 6, 3, 4, 5, 3, 4, 5, 4, 3, 4, 2, 5], season: '64',
      legendLabel: t('stat.perGameOf', { s: 'E' }), verdictTitle: t('verdict.e'),
      verdictText: t('verdict.eText'),
    },
    'HIT%': {
      points: [28, 26, 34, 30, 22, 35, 29, 31, 27, 30, 38, 32, 29, 33, 36, 31], season: '31%',
      legendLabel: t('stat.perGameOf', { s: 'HIT%' }), verdictTitle: t('verdict.hit'),
      verdictText: t('verdict.hitText'),
    },
  };

  // ---- Defence ----
  defGauge: GaugeData = { value: '135', percent: 90, caption: t('stat.digs'), short: 'DIG', delta: pctile(90), chips: [`8.4 / ${t('stat.gAbbr')}`, t('stat.peak', { v: '12' })], scale: 'def' };
  defTiles: TileData[] = [
    { label: t('stat.blocks'), short: 'BLK', value: '18', tag: pctile(72), delta: `1.1 / ${t('stat.gAbbr')}`, tone: 'flat' },
    { label: t('stat.passing'), short: 'PASS', value: '2.3', tag: pctile(81), delta: t('stat.ofThree'), tone: 'flat' },
  ];
  defChart: ChartData = {
    title: t('stat.defence'), titleSub: t('stat.blkDigPerMatch'), trend: `▲ +9% · ${t('stat.vsLast10')}`, season: '9.6', accent: 'def',
    points: [8, 9, 10, 7, 11, 8, 8, 11, 12, 9, 7, 12, 13, 9, 9, 10],
    legendLabel: t('stat.defencePerGame'),
    verdictTitle: t('verdict.defence'),
    verdictText: t('verdict.defenceText'),
  };
}
