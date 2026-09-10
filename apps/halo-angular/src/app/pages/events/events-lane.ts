import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { StatusBar } from '../../../lib/molecules/status-bar/status-bar';
import { HaloIcon } from '../../../lib/atoms/icon/icon';
import { RailCard } from '../../../lib/organisms/rail-card/rail-card';
import { UpcomingRow } from '../../../lib/organisms/upcoming-row/upcoming-row';
import { LiveGameCard } from '../../../lib/organisms/live-game-card/live-game-card';
import { EventFilterBar, FilterBarCategory } from '../../../lib/organisms/event-filter-bar/event-filter-bar';
import { DatePreset } from '../../../lib/molecules/date-range-picker/date-range-picker';
import { BottomNav, NavItem } from '../../../lib/organisms/bottom-nav/bottom-nav';
import { TabNav } from '../../tab-nav';
import { ViewContext } from '../../view-context';
import { EventFiltersState } from '../../event-filters';
import { EXTERNAL_CONTENT, EXTERNAL_TITLE, Fixture, FULL_GAMES, GAME_HIGHLIGHTS, isoOfLabel, LIVE_GAMES, LiveGame, RailItem, UPCOMING } from '../../events-data';
import { teamIdOf, TEAM_LINKS } from '../../team-data';
import { t, plural } from '../../i18n/i18n';
import { TPipe } from '../../i18n/t.pipe';

/* A lane carries exactly ONE kind of content, and it is the same card the
   section on Home uses. Live and Upcoming used to be mapped onto RailItem so
   they could reuse the video grid, which gave both a stock thumbnail and a
   video-player tap: a fixture that has not been played looked watchable, and a
   live game lost its score, its LIVE badge and its stream (2026-08-27). */
/* A constant, not toLocaleDateString({ month: 'short' }): under en-AU that call
   returns "Sept" for September, four letters where every other month has three
   (same call, same fix, as the Games page). */
const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface LaneCfg {
  title: string;
  empty: string;
  noun?: string;
  items?: RailItem[];
  fixtures?: Fixture[];
  live?: LiveGame[];
  /** Does time run FORWARD on this lane? An upcoming list is read towards the
   *  future, so its presets are "Next 7 days" and its anchor is the NEAREST
   *  fixture rather than the newest item. Getting this backwards is not a
   *  cosmetic slip: "Last 7 days" over a fixture list matches nothing at all
   *  (Maryna 2026-09-02). */
  future?: boolean;
  /** Does the Events filter bar apply here? False on a lane whose content is not
   *  scoped to a team, a league or a state, where every filter dimension would
   *  have nothing to match and would silently empty the page. The bar is not
   *  rendered at all there: a control that cannot change the result is worse
   *  than no control (Maryna 2026-09-02). */
  filtered?: boolean;
}

/** Per-lane recipe — which catalogue and copy a "See all" lane shows. */
const LANES: Record<string, LaneCfg> = {
  'live-now': { title: t('home.liveNow'), live: LIVE_GAMES, empty: t('events.emptyLive'), noun: 'game' },
  'full-games': { title: t('home.fullGames'), items: FULL_GAMES, empty: t('events.emptyFull') },
  'game-highlights': { title: t('home.gameHighlights'), items: GAME_HIGHLIGHTS, empty: t('events.emptyHl') },
  'upcoming': { title: t('home.upcoming'), fixtures: UPCOMING, empty: t('events.emptyUpcoming'), noun: 'game', future: true },
  // The operator's own uploads. Unfiltered by design, so this lane shows no
  // filter bar and its empty copy cannot blame filters that are not there.
  'external': { title: EXTERNAL_TITLE, items: EXTERNAL_CONTENT, empty: t('events.emptyExternal'), filtered: false },
};

/**
 * EventsLanePage — the "See all" destination for a Home rail (wireframe-PT
 * WatchLaneAll): back + lane title, the SAME event filters OPEN at the top
 * (selection carries over from Home via EventFiltersState), and the lane's
 * full set as a grid grouped under date dividers, newest first.
 */
@Component({
  selector: 'halo-events-lane-page',
  standalone: true,
  imports: [StatusBar, HaloIcon, RailCard, UpcomingRow, LiveGameCard, EventFilterBar, BottomNav, TPipe],
  templateUrl: './events-lane.html',
  styleUrl: './events-lane.scss',
})
export class EventsLanePage {
  /** "3 games" / "12 videos" in the current language, singular forms included. */
  protected countLabel = computed(() => this.cfg().noun === 'game' ? plural(this.total(), 'count.game1', 'count.gameN') : plural(this.total(), 'count.video1', 'count.videoN'));
  protected ef = inject(EventFiltersState);
  private router = inject(Router);
  private location = inject(Location);
  protected tabNav = inject(TabNav);
  private vc = inject(ViewContext);

  /** Persistent bottom nav — You item drops for fans (Yuval 2026-08-23). */
  protected navItems = computed<NavItem[]>(() => [
    { key: 'home', label: t('nav.home'), icon: 'home' },
    { key: 'games', label: t('nav.games'), icon: 'games' },
    ...(this.vc.caps().isFan ? [] : [{ key: 'you', label: t('nav.you'), icon: 'user' as const, locked: this.vc.tier() === 'free' }]),
  ]);

  /** Lane slug from the route (/events/:lane). */
  lane = input('full-games');
  protected cfg = computed<LaneCfg>(() => LANES[this.lane()] ?? LANES['full-games']);
  /** Every lane filters unless it says otherwise. */
  protected filtered = computed(() => this.cfg().filtered !== false);

  /** DATE. Held HERE and not in EventFiltersState on purpose: that store is
   *  shared with Home, and a date is only a useful filter over a list you can
   *  read day by day, which is this page and not a row of four cards
   *  (manager 2026-09-02).
   *
   *  The value is either a preset key or `start..end` in ISO. A flat list of
   *  every day was the first attempt and it does not survive a season: the
   *  options grow with the archive, each one holds a game or two, and none of
   *  them can say "that week" (Maryna 2026-09-02).
   */
  /** Held in the SHARED store now, so it survives a lane change like every other
   *  filter (see EventFiltersState.date). What stays local is the option list and
   *  the window maths, because both are properties of THIS lane's catalogue. */
  protected fDate = this.ef.date;

  /** Relative presets are measured from the NEWEST game, not from the real
   *  today: this is an archive being browsed, and the clip filters on /you
   *  already anchor "Last 30 days" the same way. Against a real feed the newest
   *  game and today are the same week anyway. */
  protected future = computed(() => this.cfg().future === true);
  /** The day the relative presets count from: the NEAREST fixture where time runs
   *  forward, the newest game where it runs back. */
  private anchor = computed(() => {
    const days = [...this.laneDays()].sort();
    return (this.future() ? days[0] : days.at(-1)) ?? '';
  });

  /** Every day this lane holds, ISO, from the catalogue BEFORE the date filter
   *  and after the others — so the calendar only offers days that have games
   *  under the filters currently on. */
  protected laneDays = computed<string[]>(() => {
    const out = new Set<string>();
    for (const it of this.itemsBeforeDate()) {
      const d = isoOfLabel(it.date);
      if (d) out.add(d);
    }
    // A fixture carries its day on `day`, not `date` — and it is the lane where
    // "when" is the whole question, so it must contribute.
    for (const f of this.fixturesBeforeDate()) {
      const d = isoOfLabel(f.day);
      if (d) out.add(d);
    }
    return [...out].sort();
  });

  protected presets = computed<DatePreset[]>(() => [
    { value: this.ef.ALL_DATES, label: t('date.all') },
    { value: '7d', label: this.future() ? t('date.next7') : t('date.last7') },
    { value: '30d', label: this.future() ? t('date.next30') : t('you.last30') },
    { value: 'season', label: t('you.thisSeason') },
  ]);

  protected barCategories = computed<FilterBarCategory[]>(() => [
    ...this.ef.CATEGORIES.map((c) => ({ key: c.key, label: c.label, options: this.ef.options(c.key) })),
    // Only where the lane's content HAS dates. Live is all happening now and a
    // fixture states its own day, so the pill would filter nothing there.
    ...(this.laneDays().length
      ? [{
        key: 'date', label: t('you.filterDate'), options: [], single: true,
        defaultValue: this.ef.ALL_DATES,
        date: { presets: this.presets(), days: this.laneDays(), anchor: this.anchor() },
        pillText: this.datePillText(),
      }]
      : []),
  ]);
  /** Date is always a present value, including 'all' — that is what puts the
   *  dot on "All dates". The bar knows not to count it as an active filter. */
  protected barSelected = computed<Record<string, string[]>>(() => ({
    ...this.ef.filters(), date: [this.fDate()],
  }));

  /** The pill says what is ON, in as few characters as the row can spare:
   *  "3-12 May" for a range inside one month, "28 Apr - 3 May" across two,
   *  "11 May" for a single day, the preset's own name otherwise. */
  private datePillText(): string {
    const v = this.fDate();
    if (!v.includes('..')) return this.presets().find((p) => p.value === v)?.label ?? v;
    const [a, b] = v.split('..');
    if (a === b) return this.dayMon(a);
    return a.slice(0, 7) === b.slice(0, 7)
      ? `${+a.slice(8)}-${this.dayMon(b)}`
      : `${this.dayMon(a)} - ${this.dayMon(b)}`;
  }
  private dayMon(day: string): string {
    return `${+day.slice(8)} ${MONTH_ABBR[+day.slice(5, 7) - 1]}`;
  }

  /** Lane content after the OTHER filters, before the date one. */
  private itemsBeforeDate = computed(() => {
    const items = this.cfg().items ?? [];
    return this.filtered() ? items.filter((x) => this.ef.passes(x)) : items;
  });

  /** Lane content after the Events filters (state/territory included) — seed
      order is already newest-first, matching the grouping below. */
  protected itemsF = computed(() => {
    const [from, to] = this.window();
    if (!from) return this.itemsBeforeDate();
    return this.itemsBeforeDate().filter((x) => {
      const d = isoOfLabel(x.date);
      return !!d && d >= from && d <= to;
    });
  });
  /** The selection as one closed ISO window, whichever form it took. An empty
   *  `from` means no date filter, which keeps the item filter above branch-free. */
  private window(): [string, string] {
    const v = this.fDate();
    if (v.includes('..')) { const [a, b] = v.split('..'); return [a, b]; }
    const end = this.anchor();
    if (!end || v === this.ef.ALL_DATES) return ['', ''];
    const days = this.laneDays();
    if (v === 'season') {
      // The whole catalogue, from the anchor outwards the way time runs.
      return this.future() ? [end, days.at(-1) ?? end] : [days[0] ?? '', end];
    }
    const span = v === '7d' ? 6 : 29; // inclusive of the anchor day itself
    const [y, m, d] = end.split('-').map(Number);
    const t = new Date(y, m - 1, d + (this.future() ? span : -span));
    const other = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
    return this.future() ? [end, other] : [other, end];
  }
  private fixturesBeforeDate = computed(() => {
    const fx = this.cfg().fixtures ?? [];
    return this.filtered() ? fx.filter((x) => this.ef.passes(x)) : fx;
  });
  protected fixturesF = computed(() => {
    const [from, to] = this.window();
    if (!from) return this.fixturesBeforeDate();
    return this.fixturesBeforeDate().filter((f) => {
      const d = isoOfLabel(f.day);
      return !!d && d >= from && d <= to;
    });
  });
  protected liveF = computed(() => (this.cfg().live ?? []).filter((x) => this.ef.passes(x)));

  /**
   * LOAD MORE, not a See all.
   *
   * This page IS the full list — it is where every See all on Home and on a team
   * page arrives — so there is nowhere further to send anyone. A season is
   * hundreds of games, and rendering all of them was the state before this: one
   * unbounded scroll, with the date filter narrowing it but nothing bounding it
   * (Maryna 2026-09-02).
   *
   * 24 a page, because the feed is a grid of 2, 3, 4, 5 or 6 columns depending
   * on width and the page size has to leave rows whole: 24 divides by 2, 3, 4
   * and 6 exactly, and is one short of tidy only at five columns.
   */
  private static readonly PAGE = 24;
  protected shown = signal(EventsLanePage.PAGE);
  /** Back to the first page whenever the RESULT changes underneath. Without this
   *  a viewer 96 cards deep who then picks a team stays 96 cards deep in a list
   *  that is now nine long — the same reason the game page's moment grid
   *  collapses when its scope switches. */
  private resetPaging = effect(() => {
    this.ef.filters(); this.fDate(); this.lane();
    this.shown.set(EventsLanePage.PAGE);
  });
  protected itemsShown = computed(() => this.itemsF().slice(0, this.shown()));
  protected fixturesShown = computed(() => this.fixturesF().slice(0, this.shown()));
  protected liveShown = computed(() => this.liveF().slice(0, this.shown()));
  /** How many are still behind the button. A lane carries one KIND of content,
   *  so summing the three is summing one non-empty list and two empty ones. */
  protected remaining = computed(() => Math.max(0, this.total() - (
    this.itemsShown().length + this.fixturesShown().length + this.liveShown().length)));
  loadMore(): void { this.shown.update((n) => n + EventsLanePage.PAGE); }

  /** One entry point for the bar, because the date lives outside the store. */
  setFilter(cat: string, value: string): void {
    if (cat === 'date') { this.fDate.set(value); return; }
    this.ef.toggle(cat as never, value);
  }
  /** One call now: the store resets the date along with the rest. */
  clearFilters(): void { this.ef.clear(); }

  protected total = computed(() => this.itemsF().length + this.fixturesF().length + this.liveF().length);
  /** Count noun — "video" for the clip lanes, "game" for live/upcoming. */
  protected noun = computed(() => this.cfg().noun ?? 'video');

  teamIdOf = teamIdOf;
  teamLinks = TEAM_LINKS;
  openTeam(id: string): void { void this.router.navigate(['/team', id]); }
  /** Lane-aware kind so a highlights lane doesn't open as FULL GAME
      with full-game runtimes (2026-08-27). */
  openLive(): void { void this.router.navigate(['/watch/live']); }
  openVod(total?: string): void {
    const k = this.lane() === 'game-highlights' ? 'highlights' : 'full';
    void this.router.navigate(['/watch/vod'], { queryParams: { kind: k, ...(total ? { total } : {}) } });
  }
  back(): void { this.location.back(); }
}
