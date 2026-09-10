import { Component, ElementRef, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { teamIdOf } from '../../team-data';
import { TabNav } from '../../tab-nav';
import { NotificationStore } from '../../notification-store';
import { ViewContext } from '../../view-context';
import { AdSlot } from '../../../lib/organisms/ad-slot/ad-slot';
import { StatusBar } from '../../../lib/molecules/status-bar/status-bar';
import { AppTopBar } from '../../app-top-bar';
import { HaloIcon } from '../../../lib/atoms/icon/icon';
import { Chip } from '../../../lib/atoms/chip/chip';
import { DayStrip, DayCell } from '../../../lib/molecules/day-strip/day-strip';
import { SectionHeader } from '../../../lib/molecules/section-header/section-header';
import { LadderCard, TeamRow } from '../../../lib/organisms/ladder-card/ladder-card';
import { BottomNav, NavItem } from '../../../lib/organisms/bottom-nav/bottom-nav';
import { VOLLEYTV_MARK_SVG } from '../../../lib/brand/volleytv-preset';
import { StateCode } from '../../federation-state';
import { t, plural, fmtDate, fmtShortDay, fmtMonthYear, WEEKDAYS, WEEKDAY_NARROW, MONTH_ABBR } from '../../i18n/i18n';
import { TPipe } from '../../i18n/t.pipe';

interface Match { chipTone: 'live' | 'fin' | 'up'; chipText: string; round: string; teams: TeamRow[]; footMeta?: string; footCta?: string; st?: StateCode; }
interface DayGames { live: Match[]; past: Match[]; upcoming: Match[]; }
interface MonthOpt { key: string; label: string; year: number; month: number; }

/* A constant, not `toLocaleDateString({ month: 'short' })`. Under en-AU that
   call returns "Sept" for September — four letters where every other month has
   three, which is the one thing an abbreviation is for (Maryna 2026-08-29). */
// WEEKDAYS / MONTH_ABBR now come from i18n.ts: the English tables above, the
// locale's own short names for Hebrew and Japanese.
const pad = (n: number) => String(n).padStart(2, '0');

const MONTHS: MonthOpt[] = [
  { key: '2026-04', label: fmtMonthYear(2026, 3), year: 2026, month: 3 },
  { key: '2026-05', label: fmtMonthYear(2026, 4), year: 2026, month: 4 },
  { key: '2026-06', label: fmtMonthYear(2026, 5), year: 2026, month: 5 },
];

/* Games keyed by ISO date — selecting a day (or month) recomputes which set of
   Live / Past / Upcoming cards render. Dates not present here show an empty
   state, so switching days visibly changes the schedule. */
const GAMES_BY_DATE: Record<string, DayGames> = {
  '2026-04-26': {
    live: [], past: [
      { chipTone: 'fin', chipText: t('status.final'), round: 'Sun 26 Apr', st: 'MET',
        teams: [
          { name: 'Netsetters 1', crest: 'img/logo-netsetters.svg', score: 3, win: true },
          { name: 'Harbour Blues', crest: 'img/logo-blues.svg', score: 1, lo: true },
        ], footCta: t('cta.watchReplay') },
    ], upcoming: [],
  },
  '2026-05-09': {
    live: [], past: [
      { chipTone: 'fin', chipText: t('status.final'), round: 'Sat 9 May', st: 'STH',
        teams: [
          { name: 'Bayside Breakers', crest: 'img/logo-breakers.svg', score: 3, win: true },
          { name: 'Northside Flames', crest: 'img/team-northside-flames.svg', score: 2, lo: true },
        ], footCta: t('cta.watchReplay') },
    ], upcoming: [],
  },
  '2026-05-10': {
    live: [
      { chipTone: 'live', chipText: `${t('status.live')} · ${t('games.setN', { n: 3 })}`, round: 'Round 9', st: 'MET',
        teams: [
          { name: 'Netsetters 1', crest: 'img/logo-netsetters.svg', score: 18, win: true },
          { name: 'Bayside Breakers', crest: 'img/logo-breakers.svg', score: 15, lo: true },
        ], footCta: t('cta.watchLive') },
    ],
    past: [
      { chipTone: 'fin', chipText: t('status.final'), round: 'Earlier today', st: 'STH',
        teams: [
          { name: 'Spike City', crest: 'img/logo-spikecity.svg', score: 1, lo: true },
          { name: 'Northside Flames', crest: 'img/team-northside-flames.svg', score: 3, win: true },
        ], footCta: t('cta.watchReplay') },
    ],
    upcoming: [
      { chipTone: 'up', chipText: `${t('games.tipoff')} · 13:58`, round: 'Today · 13:58', st: 'MET',
        teams: [
          { name: 'Netsetters 1', crest: 'img/logo-netsetters.svg', score: null },
          { name: 'Spike City', crest: 'img/logo-spikecity.svg', score: null },
        ] },
    ],
  },
  '2026-05-11': {
    live: [], past: [], upcoming: [
      { chipTone: 'up', chipText: `${t('games.tipoff')} · 18:30`, round: 'Mon 11 · 18:30', st: 'MET',
        teams: [
          { name: 'Bayside Breakers', crest: 'img/logo-breakers.svg', score: null },
          { name: 'Harbour Blues', crest: 'img/logo-blues.svg', score: null },
        ] },
    ],
  },
  '2026-05-16': {
    live: [], past: [], upcoming: [
      { chipTone: 'up', chipText: `${t('games.tipoff')} · 15:30`, round: 'Sat 16 · 15:30', st: 'STH',
        teams: [
          { name: 'Northside Flames', crest: 'img/team-northside-flames.svg', score: null },
          { name: 'Harbour Blues', crest: 'img/logo-blues.svg', score: null },
        ] },
    ],
  },
  '2026-06-06': {
    live: [], past: [], upcoming: [
      { chipTone: 'up', chipText: `${t('games.tipoff')} · 12:00`, round: 'Sat 6 Jun · 12:00', st: 'NTH',
        teams: [
          { name: 'Netsetters 1', crest: 'img/logo-netsetters.svg', score: null },
          { name: 'Northside Flames', crest: 'img/team-northside-flames.svg', score: null },
        ] },
    ],
  },
};
const EMPTY: DayGames = { live: [], past: [], upcoming: [] };

/* "Today" in the prototype. The seed catalogue is a fixed May 2026 week, so the
   device date would land on an empty month; a real build reads the clock. */
const TODAY_ISO = '2026-05-10';

/** Games — the schedule: month picker, day strip, Live / Past / Upcoming ladder cards. */
@Component({
  selector: 'halo-games-page',
  standalone: true,
  imports: [AppTopBar, StatusBar, HaloIcon, Chip, DayStrip, SectionHeader, LadderCard, BottomNav, AdSlot, TPipe],
  templateUrl: './games.html',
  styleUrl: './games.scss',
})
export class GamesPage {
  protected readonly plural = plural;
  protected tabNav = inject(TabNav);
  protected notifs = inject(NotificationStore);
  private vc = inject(ViewContext);
  private router = inject(Router);
  /** No avatar-upload flow exists yet — the header always falls back to initials. */

  /* NOT state-scoped (2026-08-27): this schedule lists the games of the teams
     the viewer follows, so a federation filter had nothing to narrow — it only
     ever emptied days that did have games. The state/territory choice now
     lives in Home's Events filters, which is the only feed it belongs to. */

  protected months = MONTHS;
  monthKey = signal('2026-05');
  selectedIndex = signal(9); // May 10 (index = date - 1) — the live day
  pickerOpen = signal(false);

  protected currentMonth = computed(() => MONTHS.find((m) => m.key === this.monthKey()) ?? MONTHS[1]);
  protected monthLabel = computed(() => this.currentMonth().label);
  /**
   * What the PILL says: "Sep 2026", not "September 2026". The trigger has to be
   * one width whichever month is showing — spelling it out made September 40%
   * wider than May and pushed the chevron out of the pill. The menu below still
   * spells every month out, so nothing is lost, only the trigger is disciplined.
   */
  protected monthAbbr = computed(() => `${MONTH_ABBR[this.currentMonth().month]} ${this.currentMonth().year}`);
  /** "May" — the narrow-screen label. At 320px the title, the Today button and
   *  a full "May 2026" pill measured 277px against 276px of room; the year
   *  stays visible in the month menu (2026-08-27). */
  protected monthShort = computed(() => MONTH_ABBR[this.currentMonth().month]);

  /** Full month of day cells with real weekday labels, each flagged when that
      date actually carries games so the strip can be scanned without tapping
      through empty days (2026-08-27). */
  protected days = computed<DayCell[]>(() => {
    const { year, month } = this.currentMonth();
    const count = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: count }, (_, i) => {
      const iso = `${year}-${pad(month + 1)}-${pad(i + 1)}`;
      const d = GAMES_BY_DATE[iso];
      return {
        w: WEEKDAYS[new Date(year, month, i + 1).getDay()],
        n: i + 1,
        has: !!d && d.live.length + d.past.length + d.upcoming.length > 0,
        today: iso === TODAY_ISO,
      };
    });
  });

  /**
   * The date rail's rows — the same month the strip shows, plus what each day
   * actually holds. The strip only ever carried a dot; a rail has the width to
   * say "Live" or "3 games", which is the point of standing it upright.
   *
   * Counts and the live flag come from the schedule itself. Tip-off times are
   * deliberately not shown: the data carries them only inside display strings
   * ("Tipoff · 13:58"), and parsing those back out would be presenting a guess
   * as a fact (Maryna 2026-08-29).
   */
  protected railDays = computed(() => {
    const { year, month } = this.currentMonth();
    const count = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: count }, (_, i) => {
      const iso = `${year}-${pad(month + 1)}-${pad(i + 1)}`;
      const d = GAMES_BY_DATE[iso];
      const count = d ? d.live.length + d.past.length + d.upcoming.length : 0;
      const live = !!d && d.live.length > 0;
      const label = new Date(year, month, i + 1)
         ;
      return {
        iso,
        i,
        w: WEEKDAYS[new Date(year, month, i + 1).getDay()],
        n: i + 1,
        count,
        live,
        today: iso === TODAY_ISO,
        // State is carried visually by the node's colour, and colour alone is
        // never allowed to carry meaning — so the row says it in words here.
        a11y: `${label}. ${count === 0 ? t('games.a11yNone') : live ? t('games.a11yLive', { games: plural(count, 'count.game1', 'count.gameN') }) : plural(count, 'count.game1', 'count.gameN')}`,
      };
    });
  });

  /**
   * The month as a 7-column grid, with blanks before the 1st so the dates fall
   * under their weekday.
   *
   * A grid rather than 31 rows: measured, only 4 of May's 31 days carry games,
   * so a row-per-day list was 87% empty and needed 685px of its own scroll to
   * hold 4 useful entries. A grid states the same month in six rows, which is
   * what lets the panel be one fixed block that never scrolls (2026-08-29).
   */
  protected monthGrid = computed(() => {
    const { year, month } = this.currentMonth();
    const lead = new Date(year, month, 1).getDay();
    return { lead: Array.from({ length: lead }), days: this.railDays() };
  });

  protected weekdayHeads = WEEKDAY_NARROW;

  /** Only the days that carry games. This is the list you actually scan. */
  protected gameDays = computed(() => this.railDays().filter((d) => d.count > 0));

  /**
   * The day's sections as data rather than three near-identical template blocks.
   * The order is the render order, which is what lets the sponsor banner land
   * after the FIRST section whichever one that turns out to be.
   */
  protected sections = computed(() => {
    const out: { key: string; title: string; tone: 'live' | 'accent' | 'def'; games: Match[]; act: boolean }[] = [];
    if (this.live().length) out.push({ key: 'live', title: t('home.liveNow'), tone: 'live', games: this.live(), act: true });
    if (this.past().length) out.push({ key: 'past', title: t('games.past'), tone: 'def', games: this.past(), act: true });
    if (this.upcoming().length) out.push({ key: 'up', title: t('home.upcoming'), tone: 'accent', games: this.upcoming(), act: false });
    return out;
  });

  private host = inject(ElementRef) as ElementRef<HTMLElement>;

  constructor() {
    // Keep the chosen day in view in the rail. Switching month moves the
    // selection to that month's first day WITH games, which on a 31-row list is
    // routinely below the fold — without this the rail looks like it ignored the
    // change. `nearest` so it only scrolls when it has to.
    effect(() => {
      const i = this.selectedIndex();
      this.monthKey();
      queueMicrotask(() => {
        const list = this.host.nativeElement.querySelector('.gdays');
        if (!list || getComputedStyle(list).display === 'none') return;
        list.querySelector<HTMLElement>('.gd.on')?.scrollIntoView({ block: 'nearest' });
        void i;
      });
    });
  }

  /** "Saturday, 10 May" — the heading over the games column. */
  protected selectedLabel = computed(() => {
    const { year, month } = this.currentMonth();
    const d = new Date(year, month, this.selectedIndex() + 1);
    return fmtDate(d, { weekday: 'long', day: 'numeric', month: 'long' });
  });

  /** ISO date of the selected cell. */
  protected selectedIso = computed(() => {
    const { year, month } = this.currentMonth();
    return `${year}-${pad(month + 1)}-${pad(this.selectedIndex() + 1)}`;
  });
  private dayGames = computed<DayGames>(() => GAMES_BY_DATE[this.selectedIso()] ?? EMPTY);
  protected live = computed(() => this.dayGames().live);
  protected past = computed(() => this.dayGames().past);
  protected upcoming = computed(() => this.dayGames().upcoming);
  protected hasGames = computed(() => this.live().length + this.past().length + this.upcoming().length > 0);
  /* Section headers only when the day actually MIXES states (2026-08-27). With
     a single group they label a group of one and repeat what each card's own
     chip already says: "Past" over one card reading FINAL, "Upcoming" over one
     reading TIPOFF · 18:30. Five of six seeded days carry one group. */
  protected groupCount = computed(() =>
    [this.live(), this.past(), this.upcoming()].filter((g) => g.length > 0).length,
  );
  protected showHeads = computed(() => this.groupCount() > 1);

  /* An empty day is a dead end: it says "pick another day" without saying
     WHICH. These are the closest days that actually carry games, one before and
     one after, so the suggestion is a tap rather than a hunt (2026-08-27).
     Searched across the whole catalogue, so a suggestion may switch month. */
  protected nearestDays = computed(() => {
    if (this.hasGames()) return [];
    const sel = this.selectedIso();
    const dated = Object.entries(GAMES_BY_DATE)
      .filter(([, d]) => d.live.length + d.past.length + d.upcoming.length > 0)
      .map(([iso]) => iso)
      .sort();
    const before = dated.filter((iso) => iso < sel).pop();
    const after = dated.find((iso) => iso > sel);
    const label = (iso: string) => {
      const [y, m, day] = iso.split('-').map(Number);
      const dt = new Date(y, m - 1, day);
      return fmtShortDay(dt);
    };
    /* `dir` drives which side the chevron sits on, so the button says whether
       it moves you back or forward before you read the date (2026-08-27). */
    return [
      ...(before ? [{ iso: before, label: label(before), dir: 'back' as const }] : []),
      ...(after ? [{ iso: after, label: label(after), dir: 'fwd' as const }] : []),
    ];
  });

  /* Return to today from anywhere in the calendar — a viewer who browsed a
     month ahead should not have to walk back (2026-08-27). Shown only when the
     selection is somewhere else, so it appears exactly when it can do work. */
  protected onToday = computed(() => this.selectedIso() === TODAY_ISO);
  protected goToToday(): void { this.goToDay(TODAY_ISO); }

  /** Jump to a suggested day, switching month when it belongs to another one. */
  protected goToDay(iso: string): void {
    const monthKey = iso.slice(0, 7);
    if (monthKey !== this.monthKey()) this.monthKey.set(monthKey);
    this.selectedIndex.set(Number(iso.slice(-2)) - 1);
  }

  /** First day (index) in a month that actually has games — where selection lands
      when you switch months, so the schedule opens on something, not a blank. */
  private firstGameIndex(monthKey: string): number {
    const keys = Object.keys(GAMES_BY_DATE).filter((k) => k.startsWith(monthKey)).sort();
    if (!keys.length) return 0;
    return Number(keys[0].slice(-2)) - 1;
  }

  selectMonth(key: string): void {
    this.monthKey.set(key);
    this.selectedIndex.set(this.firstGameIndex(key));
    this.pickerOpen.set(false);
  }

  /** Card tap → game detail, EXCEPT upcoming which deep-links to the team's
      page (journeys doc — no separate pre-game screen). */
  teamIdOf = teamIdOf;
  openTeam(id: string): void { void this.router.navigate(['/team', id]); }
  /** Live and finished cards only: an upcoming fixture is not tappable
   *  (halo-ladder-card enforces that), so there is no 'up' branch here. */
  openGame(_m: Match): void {
    void this.router.navigate(['/game']);
  }
  /** Footer CTA → the player: live → live stream, past → replay (VOD). */
  onCta(m: Match): void {
    void this.router.navigate([m.chipTone === 'live' ? '/watch/live' : '/watch/vod']);
  }

  /** You tab: locked on Free (athlete metrics are Basic+), GONE for fans. */
  protected navItems = computed<NavItem[]>(() => [
    { key: 'home', label: t('nav.home'), icon: 'home' },
    { key: 'games', label: t('nav.games'), icon: 'games' },
    ...(this.vc.caps().isFan ? [] : [{ key: 'you', label: t('nav.you'), icon: 'user' as const, locked: this.vc.tier() === 'free' }]),
  ]);
  logoSvg = VOLLEYTV_MARK_SVG;
}
