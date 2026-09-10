import { Component, computed, inject, signal } from '@angular/core';
import { ToastState } from '../../../toast-state';
import { SettingsPage } from '../../../settings-page';
import { SegmentedToggle, SegOption } from '../../../../lib/molecules/segmented-toggle/segmented-toggle';
import { Crest } from '../../../../lib/atoms/crest/crest';
import { PlayerDisc } from '../../../../lib/atoms/player-disc/player-disc';
import { HaloIcon } from '../../../../lib/atoms/icon/icon';
import { EventFilterBar, FilterBarCategory } from '../../../../lib/organisms/event-filter-bar/event-filter-bar';
import { ViewContext } from '../../../view-context';
import { Router } from '@angular/router';
import { FollowStore } from '../../../follow-store';

import type { TeamInfo as FollowedTeam } from '../../../team-data';
import { t, tr } from '../../../i18n/i18n';
import { TPipe } from '../../../i18n/t.pipe';
interface FollowedPlayer { id: string; name: string; number: string; position: string; teamName: string; }

/**
 * Manage following (C23). Segmented Teams / Players tabs with live counts,
 * inline unfollow, empty states, and an "Add more" discovery CTA. Teams tab is
 * for all roles; the Players tab (own-team teammates) is Athletes-only per the
 * follow model. Followed team names link to /team/:id (own/followed gating);
 * suggested (unfollowed) names stay plain. Replaces the /follows placeholder.
 */
@Component({
  selector: 'halo-following-page',
  standalone: true,
  imports: [SettingsPage, SegmentedToggle, Crest, PlayerDisc, HaloIcon, EventFilterBar, TPipe],
  templateUrl: './following.html',
  styleUrls: ['../settings-common.scss', './following.scss'],
})
export class FollowingPage {
  private vc = inject(ViewContext);
  private toast = inject(ToastState);
  private router = inject(Router);
  private store = inject(FollowStore);

  /** Followed team names are hyperlinks (own/followed gating rule). */
  openTeam(id: string): void { void this.router.navigate(['/team', id]); }

  /* "Add more" opens an inline discovery section (unfollowed teams from the
     whole registry / unfollowed teammates) with real follow-through. The
     PT's full MEN-M6 pattern is a dedicated add-page with a league accordion
     — that port belongs to the Cluster-2 flows work; this keeps the button
     genuinely connected meanwhile. Chip filters ported 2026-08-26: the exact
     same halo-event-filter-bar and the exact same three categories —
     State/Organisation/League — as onboarding's SSO team browser (no
     Division; onboarding doesn't filter by it either), so this is the same
     control the user already used once, not a lookalike. */
  discoverOpen = signal(false);
  protected allDiscoverTeams = computed(() => this.store.discoverTeams());

  private readonly DISCOVER_CATS = [
    { key: 'state', label: t('filter.state') },
    { key: 'club', label: t('filter.org') },
    { key: 'league', label: t('filter.league') },
  ] as const;
  discoverFilters = signal<Record<string, string[]>>({ state: [], club: [], league: [] });
  discoverCategories = computed<FilterBarCategory[]>(() => {
    const all = this.allDiscoverTeams();
    const vals = (key: 'state' | 'club' | 'league') => [...new Set(all.map((t) => t[key]).filter(Boolean))].sort();
    return this.DISCOVER_CATS.map((c) => ({ key: c.key, label: c.label, options: vals(c.key) }));
  });
  discoverTeams = computed(() => {
    const f = this.discoverFilters();
    return this.allDiscoverTeams().filter((t) =>
      (f['state'].length === 0 || f['state'].includes(t.state)) &&
      (f['club'].length === 0 || f['club'].includes(t.club)) &&
      (f['league'].length === 0 || f['league'].includes(t.league)),
    );
  });
  toggleDiscoverFilter(cat: string, value: string): void {
    const f = { ...this.discoverFilters() };
    f[cat] = f[cat].includes(value) ? f[cat].filter((v) => v !== value) : [...f[cat], value];
    this.discoverFilters.set(f);
  }
  clearDiscoverFilters(): void { this.discoverFilters.set({ state: [], club: [], league: [] }); }

  discoverPlayers = signal<FollowedPlayer[]>([
    { id: 'p9', name: 'A. Novak', number: '9', position: t('pos.setter'), teamName: 'Netsetters 1' },
    { id: 'p15', name: 'S. Okafor', number: '15', position: t('pos.outside'), teamName: 'Netsetters 1' },
    { id: 'p3', name: 'D. Rossi', number: '3', position: t('pos.libero'), teamName: 'Netsetters 1' },
  ]);
  followTeam(t: FollowedTeam): void {
    this.store.follow(t.id);
    this.toast.show(tr('team.followingToast', { team: t.name }), 'pos');
  }
  followPlayer(p: FollowedPlayer): void {
    this.discoverPlayers.update((xs) => xs.filter((x) => x.id !== p.id));
    this.players.update((xs) => [...xs, p]);
    this.toast.show(t('team.followingToast', { team: p.name }), 'pos');
  }

  /** Players tab is Athletes-only (fan/parent/coach don't follow players). */
  protected showPlayers = computed(() => this.vc.caps().isAthlete);

  teams = computed(() => this.store.followedTeams());
  players = signal<FollowedPlayer[]>([
    { id: 'p7', name: 'Tal Weiss', number: '7', position: t('pos.outside'), teamName: 'Netsetters 1' },
    { id: 'p12', name: 'J. Torres', number: '12', position: t('pos.opposite'), teamName: 'Netsetters 1' },
    { id: 'p4', name: 'M. Chen', number: '4', position: t('pos.middle'), teamName: 'Netsetters 1' },
  ]);

  tab = signal<'teams' | 'players'>('teams');
  protected activeTab = computed(() => (this.showPlayers() ? this.tab() : 'teams'));

  protected tabOptions = computed<SegOption[]>(() => [
    { key: 'teams', label: t('fol.teams'), count: this.teams().length },
    { key: 'players', label: t('fol.players'), count: this.players().length },
  ]);

  setTab(k: string): void { this.tab.set(k === 'players' ? 'players' : 'teams'); }
  unfollowTeam(id: string): void { this.store.unfollow(id); }
  unfollowPlayer(id: string): void { this.players.update((xs) => xs.filter((p) => p.id !== id)); }
}
