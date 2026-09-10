import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { IconButton } from '../../../lib/atoms/icon-button/icon-button';
import { Crest } from '../../../lib/atoms/crest/crest';
import { HaloIcon } from '../../../lib/atoms/icon/icon';
import { StatGrid, StatGridCell } from '../../../lib/molecules/stat-grid/stat-grid';
import { SectionHeader } from '../../../lib/molecules/section-header/section-header';
import { LadderCard } from '../../../lib/organisms/ladder-card/ladder-card';
import { EmptyState } from '../../../lib/molecules/empty-state/empty-state';
import { BottomNav } from '../../../lib/organisms/bottom-nav/bottom-nav';
import { StatusBar } from '../../../lib/molecules/status-bar/status-bar';
import { TabNav } from '../../tab-nav';
import { FollowStore } from '../../follow-store';
import { EventFiltersState } from '../../event-filters';
import { ToastState } from '../../toast-state';
import { teamById, teamFixtures, teamIdOf, type TeamMatch } from '../../team-data';
import { t, tr, plural } from '../../i18n/i18n';
import { TPipe } from '../../i18n/t.pipe';

/** Team profile — PT parity (TeamProfile): hero (crest · name · counts ·
 *  follow toggle) over Live / Recent / Upcooming fixture sections; upcoming
 *  and recent render empty states rather than disappearing (spec 06b). */
@Component({
  selector: 'halo-team-page',
  standalone: true,
  imports: [IconButton, Crest, StatGrid, SectionHeader, LadderCard, EmptyState, BottomNav, StatusBar, HaloIcon, TPipe],
  templateUrl: './team.html',
  styleUrl: './team.scss',
})
export class TeamPage {
  protected tabNav = inject(TabNav);
  private router = inject(Router);
  private toast = inject(ToastState);
  protected follows = inject(FollowStore);
  private ef = inject(EventFiltersState);

  /**
   * SIX PER SECTION, then See all.
   *
   * A team's fixtures are a vertical stack, not a rail, so the cap is a fixed
   * count rather than one row of a grid: nothing about the width changes how
   * many cards fit down the page. Six is two-plus rounds of a weekly
   * competition, which is as much history as a team page is asked for before
   * someone wants the whole list (Maryna 2026-09-02). Before this the page
   * rendered every fixture, so a full season was one long scroll with no
   * listing to escape to.
   */
  private static readonly PER_SECTION = 6;
  protected shown = (list: TeamMatch[]): TeamMatch[] => list.slice(0, TeamPage.PER_SECTION);
  protected hasMore = (list: TeamMatch[]): boolean => list.length > TeamPage.PER_SECTION;
  protected countOf = (list: TeamMatch[]): string => plural(list.length, 'count.game1', 'count.gameN');

  /**
   * See all goes to the SAME lane page Home's rails go to, with this team
   * pre-selected in the shared filter bar — not to a per-team listing of its
   * own. One screen, one set of filters, and the bar at the top of it says out
   * loud why the list is narrowed and lets the viewer widen it, which a bespoke
   * team listing could not (Maryna 2026-09-02).
   *
   * Filters are CLEARED first. The selection is shared with Home, so arriving
   * with someone's leftover state filter still on would show fewer games than
   * the team page just promised.
   */
  protected seeAll(lane: 'live-now' | 'full-games' | 'upcoming'): void {
    this.ef.clear();
    this.ef.toggle('team', this.team().name);
    void this.router.navigate(['/events', lane]);
  }

  /** Route param (withComponentInputBinding). */
  id = input('nets');

  protected team = computed(() => teamById(this.id()) ?? teamById('nets')!);
  protected fx = computed(() => teamFixtures(this.team().id));
  /**
   * THREE DIVIDED CELLS, not a dot-separated sentence. "1 live · 1 upcoming ·
   * 4 games" put the total in a list with two of its own parts, so it read as a
   * fourth number rather than the sum of the others. Divided cells state that
   * these are three counts of one thing and let the eye compare them, and the
   * app already owns that table — halo-stat-grid, in its inline layout.
   *
   * Live first, then upcoming, then the total: now, next, altogether
   * (Maryna 2026-08-30).
   */
  /**
   * DEMO: `?demoEmpty=games` empties this team's fixtures so the page-level
   * empty state is reachable from the dev bar. Every team in the mock data has
   * games, which is exactly why the state was never seen.
   */
  demoEmpty = input('', { alias: 'demoEmpty' });
  private noGamesDemo = computed(() => (this.demoEmpty() ?? '') === 'games');
  protected hasGames = computed(() => {
    if (this.noGamesDemo()) return false;
    const f = this.fx();
    return f.live.length + f.recent.length + f.upcoming.length > 0;
  });

  protected countCells = computed<StatGridCell[]>(() => {
    const f = this.noGamesDemo() ? { live: [], recent: [], upcoming: [] } : this.fx();
    return [
      { k: t('status.live'), v: f.live.length },
      { k: t('home.upcoming'), v: f.upcoming.length },
      { k: t('team.total'), v: f.live.length + f.recent.length + f.upcoming.length },
    ];
  });

  protected following = computed(() => this.follows.isFollowed(this.team().id));
  toggleFollow(): void {
    const t = this.team();
    const now = this.follows.toggle(t.id);
    this.toast.show(now ? tr('team.followingToast', { team: t.name }) : tr('team.unfollowedToast', { team: t.name }), now ? 'pos' : 'neutral');
  }

  teamIdOf = teamIdOf;
  openTeamId(id: string): void { void this.router.navigate(['/team', id]); }
  /** Live and finished cards only — upcoming fixtures are read-only. */
  openGame(_m: TeamMatch): void {
    void this.router.navigate(['/game']);
  }
  onCta(m: TeamMatch): void {
    void this.router.navigate([m.chipTone === 'live' ? '/watch/live' : '/watch/vod']);
  }
  back(): void { window.history.length > 1 ? window.history.back() : void this.router.navigate(['/games']); }
}
