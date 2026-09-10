import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { TEAM_LINKS } from '../../team-data';
import { GridColumns } from '../../grid-columns';
import { BackBar } from '../../../lib/molecules/back-bar/back-bar';
import { ScoreHero } from '../../../lib/organisms/score-hero/score-hero';
import { VideoEmbed } from '../../../lib/organisms/video-embed/video-embed';
import { SegmentedToggle } from '../../../lib/molecules/segmented-toggle/segmented-toggle';
import { StatGrid, StatGridCell } from '../../../lib/molecules/stat-grid/stat-grid';
import { SectionHeader } from '../../../lib/molecules/section-header/section-header';
import { HaloIcon, IconName } from '../../../lib/atoms/icon/icon';
import { Crest } from '../../../lib/atoms/crest/crest';
import { BlurLock } from '../../../lib/organisms/blur-lock/blur-lock';
import { BottomNav, NavItem } from '../../../lib/organisms/bottom-nav/bottom-nav';
import { TabNav } from '../../tab-nav';
import { ViewContext } from '../../view-context';
import { UpgradeState } from '../../upgrade-state';
import { ProfileState } from '../../profile-state';
import { isClipLocked, isPremiumPlay } from '../../clip-access';
import { TEAMMATE_REELS } from '../../teammate-reels';
import { GAME_STATS, GameStat, averagesFor, boxScoreFor } from '../../stats-data';
import { t, fmtTime } from '../../i18n/i18n';
import { TPipe } from '../../i18n/t.pipe';

/** `type` = stat-code play label (K / ACE / BLK / DIG / AST) — Basic tier
    shows THAT on the tile instead of the editorial title (Yuval 2026-08-23).
    `playerId`/`playerName` are set on TEAMMATE clips only (own clips need no
    attribution) — they carry whose reel a tile opens (2026-08-26). */
interface Clip {
  title: string; type: string; duration: string; thumb: string;
  playerId?: string; playerName?: string;
}
// `pct` = bar fill, value against a strong-single-game cap (PTS is the hero → full).
interface BoxCell { k: string; v: string; pct: number; hot?: boolean; }
interface TeamStatRow { label: string; homeV: string; awayV: string; homeSub?: string; awaySub?: string; homePct: number; awayPct: number; }
interface PlayerRow { jersey: number; name: string; pts: number; k: number; ace: number; blk: number; dig: number; self?: boolean; }

/** Game detail — final (Video / Highlights / Stats tabs) or pre-game (lineups). Flat BA. */
@Component({
  selector: 'halo-game-page',
  standalone: true,
  imports: [BackBar, ScoreHero, VideoEmbed, SegmentedToggle, StatGrid, SectionHeader, HaloIcon, Crest, BlurLock, BottomNav, GridColumns, TPipe],
  templateUrl: './game.html',
  styleUrl: './game.scss',
})
export class GamePage {
  private router = inject(Router, { optional: true });
  private location = inject(Location, { optional: true });
  protected tabNav = inject(TabNav);
  private vc = inject(ViewContext);
  private upgrade = inject(UpgradeState);
  private profiles = inject(ProfileState);
  private firstNameOf = (n: string): string => n.trim().split(/\s+/)[0] ?? n;

  /** Persistent bottom nav — You item drops for fans (Yuval 2026-08-23). */
  protected navItems = computed<NavItem[]>(() => [
    { key: 'home', label: t('nav.home'), icon: 'home' },
    { key: 'games', label: t('nav.games'), icon: 'games' },
    ...(this.vc.caps().isFan ? [] : [{ key: 'you', label: t('nav.you'), icon: 'user' as const, locked: this.vc.tier() === 'free' }]),
  ]);

  /** Own-content gate: Fans (not the athlete) and FREE tier can't see your
      highlights / your stats — proto blur-locks them with an upgrade path.
      BASIC is NOT hidden (Yuval 2026-08-23): it sees the grids and stats,
      tiles labelled by play type; only premium plays stay clip-locked. */
  protected caps = computed(() => this.vc.caps());
  lockOwn = computed(() => this.vc.caps().isFan || this.vc.tier() === 'free');
  /** Per-clip tier gate (basic loses digs and blocks) — shared with the player. */
  clipLocked = (c: Clip): boolean => isClipLocked(c.title, this.vc.tier());
  clipPremium = (c: Clip): boolean => isPremiumPlay(c.title);
  /** Basic reads the play TYPE on the card (K / ACE / BLK / DIG). */
  clipLabel = (c: Clip): string => (this.vc.tier() === 'basic' ? c.type : c.title);
  openUpgrade(): void { this.upgrade.open(); }
  onHighlightTap(c: Clip): void {
    if (this.clipLocked(c)) this.upgrade.open();
    else this.openHighlight(c.playerId);
  }

  /** Route param on /game/:id (withComponentInputBinding). The page still
      renders ONE seed game whatever the id — it exists so the players can round
      trip it: game → player (?game=<id>) → "Go to the game page" → /game/<id>.
      Wire it to real data when a game registry lands. */
  id = input('');

  /** 'final' (default) or 'pregame'. */
  state = input<'final' | 'pregame'>('final');
  /** ?processing=1 — final game whose assets are still rendering: the
      Highlights and Stats tabs show a "being generated" placeholder instead
      of content (parity with Maryna's postgame processing state). */
  protected processingParam = input('', { alias: 'processing' });
  protected processing = computed(() => this.processingParam() === '1');
  /** Deep-link the tab (?tab=highlights|stats) so the dev-bar "New" panel and
      notifications land on the exact surface (Yoni 2026-08-24). */
  protected tabParam = input('', { alias: 'tab' });
  private tabParamFx = effect(() => {
    const t = this.tabParam();
    if (t === 'video' || t === 'highlights' || t === 'stats') this.tab.set(t);
  });

  /** Scores are SETS WON — a volleyball result is 3–1, not the rally points
      (the four set scores were 25–20 · 25–21 · 22–25 · 23–18). */
  home = { name: 'Netsetters 1', sub: 'Netsetters', crest: 'img/logo-netsetters.svg', mono: 'NS', score: 3 };
  /** Own team → its team page (opponents stay plain per the gating rule). */
  homeTeamId = 'nets';
  teamLinks = TEAM_LINKS;
  awayTeamId = 'vik';
  openTeam(id: string): void { void this.router?.navigate(['/team', id]); }
  away = { name: 'Vikings Grey', sub: 'Vikings', crest: 'img/team-northside-flames.svg', mono: 'VG', score: 1 };
  when = `${t('time.yesterday')} · ${fmtTime(new Date(2026, 4, 9, 19, 30))}`;
  jersey = 7;

  // ---- tab state ----
  tab = signal<'video' | 'highlights' | 'stats'>('video');
  hlScope = signal('you');
  statScope = signal('you');
  playerTeam = signal('home');

  /** No PERSONAL content on a game for fans OR coaches (Yuval 2026-08-23 +
      journeys doc): neither is an athlete, so no Highlights tab and Stats
      offers only the Team scope. */
  private noOwn = computed(() => this.vc.caps().isFan || this.vc.caps().isCoach);
  tabs = computed(() => [
    { key: 'video', label: t('game.video') },
    ...(this.noOwn() ? [] : [{ key: 'highlights', label: t('kind.highlights'), count: this.yourClips.length }]),
    { key: 'stats', label: t('you.stats') },
  ]);
  hlScopes = computed(() => [{ key: 'you', label: this.ownScopeLabel() }, { key: 'teammates', label: t('game.teammates') }]);
  statScopes = computed(() =>
    this.noOwn()
      ? [{ key: 'team', label: t('game.team') }]
      : [{ key: 'you', label: this.ownScopeLabel() }, { key: 'team', label: t('game.team') }],
  );

  // ---- Which player this game is "about" for the viewer (Yuval 2026-08-24) ----
  // A parent's own-content scope is their KID, not "You #7". When TWO of the
  // viewer's players are in the same game, a picker chooses between them.
  /** My players (self + kids) who actually play in THIS game — matched by team. */
  protected gamePlayers = computed(() => {
    const teams = [this.home.name, this.away.name];
    return this.profiles.profiles().filter((p) => {
      if (p.number == null) return false;               // non-playing (coach)
      return !!p.team && teams.includes(p.team);
    });
  });
  /** Two+ of my players in one game → offer the picker, UNLESS the viewer is one
   *  of them. A parent who also plays gets no You/Maya switch on a game page:
   *  their own scope is the default and the choice reads as a question the page
   *  should not be asking (product, 2026-08-30).
   *  A parent who does not play keeps it — there the picker is the only way to
   *  say which child's game this is. */
  protected showGamePicker = computed(() =>
    this.gamePlayers().length > 1 && !(this.caps().isAthlete && this.caps().isParent));
  protected playerOptions = computed(() =>
    this.gamePlayers().map((p) => ({ key: p.id, label: p.id === 'self' ? t('common.you') : this.firstNameOf(p.name) })),
  );
  protected focusedId = signal('self');
  private focusGuard = effect(() => {
    const ids = this.gamePlayers().map((p) => p.id);
    if (ids.length && !ids.includes(this.focusedId())) this.focusedId.set(ids[0]);
  });
  protected focused = computed(() => this.gamePlayers().find((p) => p.id === this.focusedId()) ?? this.gamePlayers()[0] ?? null);
  /** Jersey shown on the "Your game stats" header — the focused player's. */
  protected focusedNumber = computed(() => this.focused()?.number ?? this.jersey);
  /** Scope label: "You · #7" for the athlete themself, else "Maya · #12". */
  protected ownScopeLabel = computed(() => {
    const f = this.focused();
    if (!f) return `${t('common.you')} · #${this.jersey}`;
    return f.id === 'self' ? `${t('common.you')} · #${f.number}` : `${this.firstNameOf(f.name)} · #${f.number}`;
  });
  /** Possessive for headers/upsells: "Your" / "Maya's". */
  protected ownPoss = computed(() => {
    const f = this.focused();
    return !f || f.id === 'self' ? t('common.your') : t('common.possessive', { name: this.firstNameOf(f.name) });
  });
  teamScopes = [{ key: 'home', label: 'Netsetters 1' }, { key: 'away', label: 'Vikings Grey' }];
  /** Player table shows LAST name only (ellipsis if long, full on hover). */
  lastName = (name: string): string => name.trim().split(/\s+/).pop() ?? name;
  /** Keep state legal if the dev-bar flips persona mid-view (fan/coach). */
  private noOwnGuard = effect(() => {
    if (!this.noOwn()) return;
    if (this.tab() === 'highlights') this.tab.set('video');
    if (this.statScope() === 'you') this.statScope.set('team');
  });

  // ---- Video tab ----
  // The caption names the fixture, not the result: the scoreline is already on
  // the card beside it, and writing it a second time as "Netsetters 1 64 · Vikings
  // Grey 58" was a THIRD grammar for a score on one screen — and one the recap
  // card next to it did not share (Maryna 2026-08-30).
  fullGame = { title: t('game.watchFullGame'), sub: 'Netsetters 1 vs Vikings Grey', duration: '1:42:10', poster: 'img/game-1.webp' };
  recap = { title: t('kind.recap'), sub: 'Netsetters 1 vs Vikings Grey', duration: '3:07', poster: 'img/game-2.webp' };

  // ---- Highlights tab ----
  // 22 moments, because a real AI-clipped game produces that many and three
  // rows do not hold them: at 1440 the grid is 6 columns, so 18 show and the
  // rest sit behind Show all. Six clips filled one row and the control never
  // appeared, which made the overflow behaviour impossible to see (Maryna
  // 2026-09-03). The mix keeps premium plays (digs / blocks) in it,
  // since those are what a Basic tier has locked.
  yourClips: Clip[] = [
    { title: t('play.lineShot'), type: 'K', duration: '0:14', thumb: 'img/clip-1.webp' },
    { title: t('play.setPointKill'), type: 'K', duration: '0:11', thumb: 'img/clip-2.webp' },
    { title: t('play.stuffBlock'), type: 'BLK', duration: '0:19', thumb: 'img/clip-3.webp' },
    { title: t('play.seasonMix'), type: 'K', duration: '1:02', thumb: 'img/clip-4.webp' },
    { title: t('play.crossCourtKill'), type: 'K', duration: '0:10', thumb: 'img/clip-5.webp' },
    { title: t('play.noLookSet'), type: 'AST', duration: '0:16', thumb: 'img/clip-6.webp' },
    { title: t('play.jumpServeAce'), type: 'ACE', duration: '0:13', thumb: 'img/clip-7.webp' },
    { title: t('play.transitionKill'), type: 'K', duration: '0:17', thumb: 'img/clip-8.webp' },
    { title: t('play.pancakeDig'), type: 'DIG', duration: '0:09', thumb: 'img/clip-9.webp' },
    { title: t('play.digToKill'), type: 'DIG', duration: '0:12', thumb: 'img/clip-10.webp' },
    { title: t('play.floatAce'), type: 'ACE', duration: '0:08', thumb: 'img/clip-11.webp' },
    { title: t('play.pipeAttack'), type: 'K', duration: '0:18', thumb: 'img/clip-12.webp' },
    { title: t('play.divingDig'), type: 'DIG', duration: '0:10', thumb: 'img/clip-13.webp' },
    { title: t('play.tipKill'), type: 'K', duration: '0:12', thumb: 'img/clip-14.webp' },
    { title: t('play.backSetAssist'), type: 'AST', duration: '0:15', thumb: 'img/clip-15.webp' },
    { title: t('play.aceToSeal'), type: 'ACE', duration: '0:14', thumb: 'img/clip-16.webp' },
    { title: t('play.sharpAngle'), type: 'K', duration: '0:16', thumb: 'img/clip-17.webp' },
    { title: t('play.soloBlock'), type: 'BLK', duration: '0:11', thumb: 'img/clip-18.webp' },
    { title: t('play.pursuitSave'), type: 'DIG', duration: '0:09', thumb: 'img/clip-19.webp' },
    { title: t('play.overpassKill'), type: 'K', duration: '0:13', thumb: 'img/clip-20.webp' },
    { title: t('play.backRowAttack'), type: 'K', duration: '0:15', thumb: 'img/clip-1.webp' },
    { title: t('play.matchPointKill'), type: 'K', duration: '0:22', thumb: 'img/clip-2.webp' },
  ];
  /** Derived from the shared TEAMMATE_REELS so a tile and the reel it opens
      can't disagree about whose highlight it is (2026-08-26). */
  teammateClips: Clip[] = TEAMMATE_REELS.flatMap((r) =>
    r.clips.map((c) => ({
      title: c.action, type: c.type, duration: c.duration, thumb: c.thumb,
      playerId: r.id, playerName: `${r.name} · #${r.jersey}`,
    })),
  );
  clips = computed(() => (this.hlScope() === 'you' ? this.yourClips : this.teammateClips));

  /**
   * MOMENTS PAGE, THEY ARE NOT LINKED AWAY.
   *
   * The other overflowing lists on the app are PREVIEWS — a Home rail shows one
   * row and See all opens the full catalogue. This grid is already that full
   * list: it is every moment of this one game, inside the game's own tab, so
   * there is nowhere for a See all to go. A long game therefore grows the tab
   * rather than truncating it (Maryna 2026-09-02).
   *
   * It grows a page at a time. One reveal used to hand over the whole list at
   * once, which is fine at 22 moments and a wall of tiles at 60, and this tab
   * has no section to collapse the way a clip folder on /you does (Maryna
   * 2026-09-03). Paging keeps each press the same size as the first screen.
   *
   * Three rows a page: enough to show what kind of moments a game produced
   * without handing over everything before anyone has asked. The scope toggle
   * above (You / Teammates) is the other half of the answer — it is what makes
   * a busy game navigable at all.
   */
  /** ROWS, not tiles, for the same reason as the clip grid on /you: this grid is
   *  `auto-fill`, so nine tiles is three tidy rows at three columns and one and a
   *  half at six, leaving a half-empty row above the control (Maryna
   *  2026-09-02). Three rows here, where a clip folder takes two: this tab is
   *  the whole screen for one game, not one section among several. */
  private static readonly MOMENT_ROWS = 3;
  /** Measured by `haloGridColumns`; 3 is the phone value, so the first paint
   *  before the measurement lands is not a wrong shape. */
  protected momentCols = signal(3);
  /** Pages revealed so far. A page is MOMENT_ROWS of whatever the grid is
   *  currently showing, so the step is three rows at every width instead of a
   *  tile count that means three rows on a phone and half a row at 2000. */
  protected momentPages = signal(1);
  protected momentsCap = computed(() =>
    this.momentCols() * GamePage.MOMENT_ROWS * this.momentPages());
  protected shownClips = computed(() => this.clips().slice(0, this.momentsCap()));
  protected momentsHidden = computed(() => this.clips().length - this.shownClips().length);
  protected loadMoreMoments(): void { this.momentPages.update((n) => n + 1); }
  /** Back to one page on a scope switch: the count and the contents both change,
   *  so a grown grid would carry one scope's decision into the other's. */
  private collapseOnScopeChange = effect(() => { this.hlScope(); this.momentPages.set(1); });

  // ---- Stats · You ----
  /* PTS as a full-width band over an even 2×2 (2026-08-27). Five stats never
     divided into three columns: PTS spanning two cells of three read as a
     layout error. As a band it is also honest about the hierarchy, since PTS is
     the SUM of kills, aces and blocks, not a sibling of them.

     Every cell carries its distance from the FOCUSED player's own season
     average, from the same source the You tab reads (stats-data.ts): "18" says
     nothing until you know he averages 14.3. Deltas disappear when there is no
     season to compare against yet, e.g. game one. */
  protected yourBox = computed<StatGridCell[]>(() => {
    const id = this.focused()?.id ?? 'self';
    const box = boxScoreFor(id);
    if (!box) return [];
    const season = averagesFor(id);
    // Round the delta before it is shown, so a 4 vs 4.2 average reads as "0.2
    // below" and only a true tie reads as "average".
    const deltaOf = (k: GameStat): number | undefined => {
      if (!season || season.gp === 0) return undefined;
      return Math.round((box[k] - season.avg[k]) * 10) / 10;
    };
    return GAME_STATS.map((k) => ({
      k,
      v: box[k],
      delta: deltaOf(k),
      ...(k === 'PTS' ? { hero: true, note: this.ptsVerdict(box.PTS, season) } : {}),
    }));
  });

  /** The band's one line, derived from the delta — never authored per game.
   *  Thresholds: a game inside a point of the average is "in line with", and
   *  beating the average by half again is called out as a big night. */
  private ptsVerdict(pts: number, season: ReturnType<typeof averagesFor>): string {
    if (!season || season.gp === 0) return t('game.firstGame');
    const avg = season.avg.PTS;
    const d = pts - avg;
    // Possessive follows the focused player: a parent reading Maya's line must
    // not be told it beats "your" average (2026-08-27).
    const whose = this.ownPossLower(), avgS = avg.toFixed(1);
    if (d >= avg * 0.5) return t('game.biggestScoring', { whose, avg: avgS });
    if (d >= 1) return t('game.aboveAvg', { whose, avg: avgS });
    if (d > -1) return t('game.inLineAvg', { whose, avg: avgS });
    return t('game.quieterNight', { whose, avg: avgS });
  }
  /** No season to compare against (game one) means no legend either. */
  protected hasDeltas = computed(() => this.yourBox().some((c) => c.delta !== undefined));
  /** Possessive handed to the grid for its spoken deltas. */
  protected ownPossLower = computed(() => {
    const p = this.ownPoss();
    return p === t('common.your') ? t('common.yourLower') : p;
  });

  // ---- Stats · Team ----
  // One row per stat: label above, a single centre-split bar between the two
  // values (the % rows fold into their parent stat as sub-values) — full-width
  // bars read at 390px where twin half-bars + a centre label could not.
  // Same five stat codes as everywhere else (Yuval 2026-08-23); values agree
  // with the 3–1 final (95–84 in rally points): 45 K + 6 ACE + 9 BLK + 35
  // opponent errors = 95 · 40 K + 4 ACE + 7 BLK + 33 opponent errors = 84.
  teamStats: TeamStatRow[] = [
    { label: 'PTS', homeV: '95', awayV: '84', homePct: 53, awayPct: 47 },
    { label: 'K', homeV: '45', awayV: '40', homePct: 53, awayPct: 47 },
    { label: 'ACE', homeV: '6', awayV: '4', homePct: 60, awayPct: 40 },
    { label: 'BLK', homeV: '9', awayV: '7', homePct: 56, awayPct: 44 },
    { label: 'DIG', homeV: '52', awayV: '47', homePct: 53, awayPct: 47 },
  ];
  /** Home share of the split bar (both fills always sum to 100). */
  share(s: TeamStatRow): number { return (s.homePct / (s.homePct + s.awayPct)) * 100; }

  // Per-player pts = K + ACE + BLK; Tal's line matches his You cubes. Six
  // starters plus the libero (the last row, digs only) per side.
  homeRoster: PlayerRow[] = [
    { jersey: 7, name: 'Tal Weiss', pts: 17, k: 14, ace: 2, blk: 1, dig: 9, self: true },
    { jersey: 12, name: 'Aiden Cole', pts: 6, k: 3, ace: 2, blk: 1, dig: 8 },
    { jersey: 23, name: 'Marcus Lee', pts: 10, k: 8, ace: 1, blk: 1, dig: 5 },
    { jersey: 4, name: 'Dylan Cross', pts: 11, k: 7, ace: 0, blk: 4, dig: 2 },
    { jersey: 9, name: 'Owen Pratt', pts: 9, k: 7, ace: 1, blk: 1, dig: 4 },
    { jersey: 15, name: 'Eli Brooks', pts: 7, k: 6, ace: 0, blk: 1, dig: 6 },
    { jersey: 2, name: 'Noah Kim', pts: 0, k: 0, ace: 0, blk: 0, dig: 18 },
  ];
  awayRoster: PlayerRow[] = [
    { jersey: 11, name: 'Jordan Reed', pts: 15, k: 12, ace: 1, blk: 2, dig: 7 },
    { jersey: 3, name: 'Kai Nguyen', pts: 5, k: 2, ace: 2, blk: 1, dig: 6 },
    { jersey: 21, name: 'Sam Ellis', pts: 11, k: 10, ace: 0, blk: 1, dig: 4 },
    { jersey: 5, name: 'Leo Barnes', pts: 10, k: 8, ace: 1, blk: 1, dig: 3 },
    { jersey: 33, name: 'Max Turner', pts: 8, k: 6, ace: 0, blk: 2, dig: 2 },
    { jersey: 8, name: 'Ava Stone', pts: 2, k: 2, ace: 0, blk: 0, dig: 5 },
    { jersey: 1, name: 'Ruby Hale', pts: 0, k: 0, ace: 0, blk: 0, dig: 20 },
  ];
  roster = computed(() => (this.playerTeam() === 'home' ? this.homeRoster : this.awayRoster));

  // sortable player-stats table
  playerCols = [
    { key: 'pts', label: 'PTS' }, { key: 'k', label: 'K' }, { key: 'ace', label: 'ACE' },
    { key: 'blk', label: 'BLK' }, { key: 'dig', label: 'DIG' },
  ];
  playerSort = signal<{ key: string; dir: 'asc' | 'desc' }>({ key: 'pts', dir: 'desc' });
  sortedRoster = computed(() => {
    const { key, dir } = this.playerSort();
    const val = (p: PlayerRow): number =>
      key === 'player' ? p.jersey : (p[key as keyof PlayerRow] as number);
    return [...this.roster()].sort((a, b) => (dir === 'asc' ? val(a) - val(b) : val(b) - val(a)));
  });
  sortBy(key: string) {
    this.playerSort.update((s) => ({
      key,
      dir: s.key === key ? (s.dir === 'asc' ? 'desc' : 'asc') : key === 'player' ? 'asc' : 'desc',
    }));
  }

  // ---- pre-game ----
  // Lineups aren't in the V1 data feed (proto hides LineupsSection behind a
  // flag for the same reason), so the upcoming page shows the countdown hero +
  // a "what lands after first serve" explainer instead — matching the proto.
  tipoffTime = '18:30';
  startsIn = t('game.startsInDays', { n: 1 });
  comp = `${t('comp.mondayMen14')} · ${t('grade.open')}`;
  comingRows: { icon: IconName; title: string; body: string }[] = [
    { icon: 'play', title: t('game.comingRecap'), body: t('game.comingRecapBody') },
    { icon: 'chart', title: t('game.comingStats'), body: t('game.comingStatsBody') },
    { icon: 'bookmark', title: t('game.comingPack'), body: t('game.comingPackBody') },
  ];

  isPre = computed(() => this.state() === 'pregame');

  /** Back = wherever the viewer came from — e.g. You › Clips' game icon
      (Yuval 2026-08-23); /home only on deep-link entry. */
  back() {
    if (this.location && (window.history.state?.navigationId ?? 1) > 1) this.location.back();
    else this.router?.navigate(['/home']);
  }
  openEditor() { /* opens the tagging editor — host-wired */ }
  /** The mode was dropped on the floor until 2026-08-27, so tapping Recap
      opened a player labelled FULL GAME with full-game runtimes. */
  openVideo(mode: 'full' | 'recap') {
    const total = mode === 'recap' ? this.recap.duration : this.fullGame.duration;
    void this.router?.navigate(['/watch/vod'], { queryParams: { kind: mode, total, ...this.playerOrigin() } });
  }
  /** `playerId` set = a TEAMMATE's reel (?player=…); absent = the viewer's own,
      which is the only one the player offers a download on. */
  openHighlight(playerId?: string) {
    void this.router?.navigate(['/watch/highlight'], {
      queryParams: { ...(playerId ? { player: playerId } : {}), ...this.playerOrigin() },
    });
  }
  /** Told to the player so it can (a) target this game with its "Go to the game
      page" link and (b) OMIT that link entirely — you are already here, and a
      link back to the page you came from is chrome, not navigation
      (Maryna 2026-08-28). */
  private playerOrigin(): Record<string, string> {
    return { from: 'game', ...(this.id() ? { game: this.id() } : {}) };
  }

}
