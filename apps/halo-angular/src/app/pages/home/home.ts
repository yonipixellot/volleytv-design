import { teamIdOf, TEAM_LINKS } from '../../team-data';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TabNav } from '../../tab-nav';
import { NotificationStore } from '../../notification-store';
import { ViewContext } from '../../view-context';
import { ProfileState } from '../../profile-state';
import { AdSlot } from '../../../lib/organisms/ad-slot/ad-slot';
import { StatusBar } from '../../../lib/molecules/status-bar/status-bar';
import { AppTopBar } from '../../app-top-bar';
import { StoriesRail, StoryItem, orderStories } from '../../../lib/organisms/stories-rail/stories-rail';
import { GameHero } from '../../../lib/organisms/game-hero/game-hero';
import { SectionHeader } from '../../../lib/molecules/section-header/section-header';
import { LiveGameCard } from '../../../lib/organisms/live-game-card/live-game-card';
import { RailCard } from '../../../lib/organisms/rail-card/rail-card';
import { UpcomingRow } from '../../../lib/organisms/upcoming-row/upcoming-row';
import { HaloIcon } from '../../../lib/atoms/icon/icon';
import { BottomNav, NavItem } from '../../../lib/organisms/bottom-nav/bottom-nav';
import { EventFilterBar, FilterBarCategory } from '../../../lib/organisms/event-filter-bar/event-filter-bar';
import { SegmentedToggle } from '../../../lib/molecules/segmented-toggle/segmented-toggle';
import { VOLLEYTV_MARK_SVG } from '../../../lib/brand/volleytv-preset';
import { StateCode } from '../../federation-state';
import { EventFiltersState } from '../../event-filters';
import { StoryProgress } from '../../story-progress';
import { RailCapacity } from '../../rail-capacity';
import { EXTERNAL_CONTENT, EXTERNAL_TITLE, Fixture, FULL_GAMES, GAME_HIGHLIGHTS, LIVE_GAMES, LiveGame, RailItem, UPCOMING } from '../../events-data';
import { t, plural } from '../../i18n/i18n';
import { TPipe } from '../../i18n/t.pipe';

/** Prototype recency seed, keyed by circle label — "how new is this circle's
    newest content", higher is newer. Stands in for the content backend so the
    rail's newest-first order is demoable and reviewable. Netsetters leads
    because it is the live game in the hero. */
const CIRCLE_RECENCY: Record<string, number> = {
  Netsetters: 95, Maya: 88, Breakers: 80, You: 60, Flames: 40, Noah: 30, Torres: 12,
};

/** Home — the events/discovery feed. First fully-assembled product screen. */
@Component({
  selector: 'halo-home-page',
  standalone: true,
  imports: [AppTopBar, StatusBar, StoriesRail, GameHero, SectionHeader, LiveGameCard, RailCard, UpcomingRow, HaloIcon, BottomNav, AdSlot, EventFilterBar, SegmentedToggle, TPipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomePage {
  protected readonly plural = plural;
  protected readonly heroMeta = t('comp.mondayMen14') + ' · ' + t('grade.open');
  teamIdOf = teamIdOf;
  teamLinks = TEAM_LINKS;
  openTeam(id: string): void { void this.router.navigate(['/team', id]); }
  /** "See all" on a rail → that rail's full lane page: filter bar open,
      list grouped under date dividers (wireframe-PT WatchLaneAll). */
  seeAll(lane: 'live-now' | 'full-games' | 'game-highlights' | 'upcoming' | 'external'): void { void this.router.navigate(['/events', lane]); }
  protected tabNav = inject(TabNav);
  protected notifs = inject(NotificationStore);
  private vc = inject(ViewContext);
  protected profile = inject(ProfileState);
  private router = inject(Router);
  /** No avatar-upload flow exists yet — the header always falls back to initials. */

  /** Orphan-nav wiring: every card/circle tap opens the matching player route.
      Story circles open the vertical personal reel; game highlights are horizontal
      videos (openVod), like the full game / live. */
  /** You → own vertical reel; team circles → the game recap in the
   *  HORIZONTAL player (highlights taxonomy — Yoni 2026-08-23). */
  openStory(s: StoryItem): void {
    // The ring is NOT cleared here. Opening a circle is not watching it: this
    // marked a circle of three highlights finished on the first tap, before the
    // player had drawn a frame. The player reports each item it shows instead,
    // and the ring goes grey when the last one lands (Maryna 2026-09-02).
    this.progress.opened.set(s.label);
    // Nothing to play, so the tap goes where there IS something: the team's own
    // page. An empty circle that opened an empty player was the actual defect
    // behind "hide the circle" — the paint was never the problem (Maryna
    // 2026-09-02).
    if (s.empty) {
      // teamIdOf returns null for a team with no page of its own; Manage
      // following is then the honest destination rather than a dead tap.
      const id = s.kind === 'team' ? teamIdOf(s.team ?? s.label) : null;
      if (id) { this.openTeam(id); return; }
      void this.router.navigate(s.kind === 'team' ? ['/follows'] : ['/you']);
      return;
    }
    if (s.kind === 'team') { void this.router.navigate(['/watch/vod'], { queryParams: { kind: 'recap' } }); return; }
    // Tapping a person circle focuses them app-wide (You tab / game page follow)
    // before opening their vertical reel.
    if (s.profileId) this.profile.select(s.profileId);
    void this.router.navigate(['/watch/highlight']); // own / kid vertical reel
  }
  /** `kind` so the player names what it's playing and clocks it at the right
      length (2026-08-27): the Game highlights rail lands here too, and without
      it a 2-minute clip opened as FULL GAME at 1:42:10. */
  openVod(kind: 'full' | 'recap' | 'highlights' = 'full', total?: string): void {
    void this.router.navigate(['/watch/vod'], { queryParams: { kind, ...(total ? { total } : {}) } });
  }
  openLive(_item?: unknown): void { void this.router.navigate(['/watch/live']); }
  /** External Content rail → its VOD (tenant-uploaded, no game page). */
  openExternal(_x?: unknown): void { void this.router.navigate(['/watch/vod']); }
  /** You tab: locked on Free (athlete metrics are Basic+), GONE for fans. */
  protected navItems = computed<NavItem[]>(() => [
    { key: 'home', label: t('nav.home'), icon: 'home' },
    { key: 'games', label: t('nav.games'), icon: 'games' },
    ...(this.vc.caps().isFan ? [] : [{ key: 'you', label: t('nav.you'), icon: 'user' as const, locked: this.vc.tier() === 'free' }]),
  ]);
  logoSvg = VOLLEYTV_MARK_SVG;

  // Quick team tabs — one-tap Team filter (proto Quick Tune). Synced with the
  // Team dimension of the shared EventFiltersState.
  teamTabs = [t('home.allGames'), 'Netsetters 1', 'Bayside Breakers', 'Northside Flames'];
  readonly teamTabOptions = this.teamTabs.map((t) => ({ key: t, label: t }));

  /** Shared filter selection — also feeds the /events lane pages. */
  protected ef = inject(EventFiltersState);
  protected progress = inject(StoryProgress);
  protected rail = inject(RailCapacity);
  /** Collapsing structure (Yuval 2026-08-23): the pill bar hides behind the
      "Filters" toggle until asked for — six dimensions shouldn't be the first
      thing a visitor reads on the landing feed. */
  filtersExpanded = signal(false);
  toggleFiltersBar(): void { this.filtersExpanded.update((v) => !v); }
  protected barCategories = computed<FilterBarCategory[]>(() =>
    this.ef.CATEGORIES.map((c) => ({ key: c.key, label: c.label, options: this.ef.options(c.key) })),
  );
  clearFilters(): void { this.ef.clear(); }
  protected activeCount = this.ef.activeCount;
  protected filterActive = computed(() => this.activeCount() > 0);

  /** Team tab = quick single-select of the Team dimension. */
  selectTeam(tab: string): void {
    const f = { ...this.ef.filters() };
    f.team = tab === t('home.allGames') ? [] : [tab];
    this.ef.filters.set(f);
  }
  /** Which tab reads as active: All games unless exactly one team is picked. */
  protected activeTeamTab = computed(() => {
    const t = this.ef.filters().team;
    return t.length === 1 ? t[0] : this.teamTabs[0];
  });

  /** Circles ordered NEWEST FIRST behind the viewer's own pinned circle — see
      the ordering contract on `orderStories`. A parent sees every kid at once
      (Yuval 2026-08-24), and since 2026-08-28 the kids take their place by
      recency rather than sitting in a fixed block behind "You". Fans/coaches
      have no own circle, so their rail is purely newest-first. */
  stories = computed<StoryItem[]>(() => {
    const caps = this.vc.caps();
    const rank = (label: string): number => CIRCLE_RECENCY[label] ?? 0;
    const out: StoryItem[] = [];
    if (caps.isAthlete || caps.isParent) {
      const sel = this.profile.selectedId();
      for (const p of this.profile.profiles()) {
        // Every person circle is the jersey number on --primary (2026-08-27):
        // the per-kid hexes here were arbitrary and read as team colors.
        const label = p.id === 'self' ? t('common.you') : p.pill;
        out.push({
          label,
          number: String(p.number ?? '7'),
          active: p.id === sel,
          kind: p.id === 'self' ? 'you' : 'kid',
          profileId: p.id,
          unseen: this.progress.unseen(label, p.id === 'self' ? 'you' : 'kid'),
          empty: this.progress.isEmpty(label, p.id === 'self' ? 'you' : 'kid'),
          newestAt: rank(label),
        });
      }
    }
    // Teams with a logo file show the logo; the rest fall back to their
    // initials on the neutral plate, which the rail derives from the label.
    for (const t of [
      { label: 'Netsetters', team: 'Netsetters 1', logo: 'img/logo-netsetters.svg' },
      { label: 'Breakers', team: 'Bayside Breakers', logo: 'img/logo-breakers.svg' },
      { label: 'Flames', team: 'Northside Flames', logo: 'img/team-northside-flames.svg' },
      { label: 'Torres', team: 'Torres' },
      // A followed team with nothing in it, so the rail shows all five circle
      // states at once: active, unseen, seen, empty, and the Follow action.
      { label: 'Vikings', team: 'Vikings Grey' },
    ]) {
      out.push({
        ...t, kind: 'team',
        unseen: this.progress.unseen(t.label, 'team'),
        empty: this.progress.isEmpty(t.label, 'team'),
        newestAt: rank(t.label),
      });
    }
    return orderStories(out);
  });

  /** The rail's trailing "+" circle. A second entry point to the same screen the
      Menu's "Manage following" row opens (settings-panel.ts). */
  manageFollowing(): void { void this.router.navigate(['/follows']); }

  live: LiveGame[] = LIVE_GAMES;
  fullGames: RailItem[] = FULL_GAMES;
  highlights: RailItem[] = GAME_HIGHLIGHTS;
  upcoming: Fixture[] = UPCOMING;

  /** External Content — tenant/state uploads (not game-pipeline footage).
      Open to EVERY persona, NO federation/filter/age scoping (journeys doc). */
  external: RailItem[] = EXTERNAL_CONTENT;
  protected externalTitle = EXTERNAL_TITLE;

  /** The shared Events filters — state/territory is one of its dimensions
      since 2026-08-27 (it used to be a separate header switcher). */
  private applyFilters<T extends { st?: StateCode; teams?: string[] }>(xs: T[]): T[] {
    return xs.filter((x) => this.ef.passes(x));
  }

  protected liveF = computed(() => this.applyFilters(this.live));
  protected fullGamesF = computed(() => this.applyFilters(this.fullGames));
  protected highlightsF = computed(() => this.applyFilters(this.highlights));
  protected upcomingF = computed(() => this.applyFilters(this.upcoming));

  /** The hero is the calm default — hidden once any filter narrows the feed. */
  protected showHero = computed(() => !this.filterActive());
  /** Filters are applied but nothing matches → show a cleared/empty note. */
  protected stateEmpty = computed(
    () => this.filterActive() &&
      this.liveF().length + this.fullGamesF().length + this.highlightsF().length + this.upcomingF().length === 0,
  );
}
