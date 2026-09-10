import { Injectable, computed, signal } from '@angular/core';
import { FilterCat, TEAMS, TeamAttrs } from './events-data';
import { STATES, StateCode } from './federation-state';
import { t } from './i18n/i18n';

/** State/territory options, by full name — the same 8 federations the header
    switcher used to offer. Name (not code) because a pill reading "Victoria"
    names itself; "VIC" only does so to someone who already knows the set. */
const STATE_CODE_BY_NAME: Record<string, StateCode> = Object.fromEntries(
  STATES.map((s) => [s.name, s.code]),
);

/**
 * EventFiltersState — the Events filter selection, shared between Home and
 * the per-rail "See all" lane pages so a filter applied on Home carries into
 * the lane (wireframe-PT parity: WatchLaneAll seeds its bar from the tab).
 * Multi-select per category, AND across categories, OR within one.
 */
@Injectable({ providedIn: 'root' })
export class EventFiltersState {
  // State first: it's the widest scope, so it reads left-to-right from broad
  // (where) to narrow (which team).
  readonly CATEGORIES: { key: FilterCat; label: string }[] = [
    { key: 'state', label: t('filter.stateTerritory') },
    { key: 'organization', label: t('filter.club') },
    { key: 'league', label: t('filter.league') },
    { key: 'competition', label: t('filter.comp') },
    { key: 'team', label: t('filter.team') },
  ];

  private empty(): Record<FilterCat, string[]> {
    return { state: [], organization: [], league: [], competition: [], team: [] };
  }

  readonly filters = signal<Record<FilterCat, string[]>>(this.empty());

  /**
   * THE DATE FILTER, and it lives here for one reason: so it survives moving
   * between lanes the way its neighbours do. It used to be a signal on the lane
   * page, which meant a viewer who narrowed Full games to a week and then opened
   * Game highlights lost the window while club, league and team came along
   * (Maryna 2026-09-02).
   *
   * A preset key, or `start..end` in ISO. Not part of `filters` above because it
   * is not a set of catalogue values: the presets resolve against each lane's own
   * newest game, and a range is matched, not looked up.
   *
   * DELIBERATELY not counted by `activeCount` below. Home neither shows a date
   * pill nor applies a date — its sections already answer "when" — so counting
   * it there would badge the Filters button, hide the hero and print an empty
   * state for a filter that page does not have.
   */
  readonly ALL_DATES = 'all';
  readonly date = signal<string>(this.ALL_DATES);
  readonly dateActive = computed(() => this.date() !== this.ALL_DATES);

  /** Distinct option values for a category, from the team ontology. */
  options(cat: FilterCat): string[] {
    if (cat === 'state') return STATES.map((s) => s.name);
    if (cat === 'team') return Object.keys(TEAMS);
    return [...new Set(Object.values(TEAMS).map((t) => t[cat as keyof TeamAttrs] as string))].sort();
  }
  isSelected(cat: FilterCat, value: string): boolean { return this.filters()[cat].includes(value); }
  toggle(cat: FilterCat, value: string): void {
    const f = { ...this.filters() };
    f[cat] = f[cat].includes(value) ? f[cat].filter((v) => v !== value) : [...f[cat], value];
    this.filters.set(f);
  }
  clear(): void {
    this.filters.set(this.empty());
    this.date.set(this.ALL_DATES);
  }
  /** The filters a surface with the pill row can show — the date is excluded on
   *  purpose, see above. */
  readonly activeCount = computed(() =>
    Object.values(this.filters()).reduce((n, v) => n + v.length, 0),
  );
  readonly active = computed(() => this.activeCount() > 0);

  /** An event's filterable attributes = the union across its teams. */
  private eventAttrs(teams: string[] = []): Record<FilterCat, string[]> {
    const attr = (k: keyof TeamAttrs) => teams.map((t) => TEAMS[t]?.[k]).filter((v): v is string => !!v);
    return { state: [], organization: attr('organization'), league: attr('league'), competition: attr('competition'), team: teams };
  }
  /** True if the item passes every active category (AND across, OR within). */
  passes(item: { teams?: string[]; st?: StateCode }): boolean {
    const f = this.filters();
    // State lives on the item itself, not on its teams (a team can travel).
    if (f.state.length && !f.state.some((n) => STATE_CODE_BY_NAME[n] === item.st)) return false;
    const a = this.eventAttrs(item.teams);
    return (['organization', 'league', 'competition', 'team'] as FilterCat[]).every(
      (cat) => f[cat].length === 0 || f[cat].some((v) => a[cat].includes(v)),
    );
  }
}
