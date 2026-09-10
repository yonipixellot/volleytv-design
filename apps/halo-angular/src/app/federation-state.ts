import { Injectable, computed, inject, signal } from '@angular/core';
import { ViewContext } from './view-context';
import { VOLLEYTV_MARK_SVG, VOLLEYTV_NAME } from '../lib/brand/volleytv-preset';
import { t } from './i18n/i18n';

/** Six generic regional leagues stand in for a federation's member bodies
 *  (fork 2026-09-08; the Hoops TV build carried Basketball Australia's 8 state
 *  federations here). Placeholder names and monogram crests — a real tenant
 *  brings its own. */
export type RegionCode = 'NTH' | 'STH' | 'EST' | 'WST' | 'MET' | 'CST';
/** Kept as the name the rest of the app imports; the axis is "region" now. */
export type StateCode = RegionCode;

export interface StateInfo {
  code: RegionCode;
  name: string;
  crest: string;
  /** Header lockups for a DARK / LIGHT background. The header switcher is
      retired (2026-08-27), so both point at the crest until it returns. */
  wmDark: string;
  wmLight: string;
  /** The region's ball colourway (drives FedBall). */
  ballColor: string;
}

const region = (code: RegionCode, ballColor: string): StateInfo => ({
  code, name: t(`region.${code}`), crest: `img/region-${code.toLowerCase()}.svg`,
  wmDark: `img/region-${code.toLowerCase()}.svg`, wmLight: `img/region-${code.toLowerCase()}.svg`, ballColor,
});

export const REGIONS: StateInfo[] = [
  region('NTH', '#2e9ad8'),
  region('STH', '#7b61ff'),
  region('EST', '#f2b134'),
  region('WST', '#e0525f'),
  region('MET', '#2fbf8f'),
  region('CST', '#3ec6d6'),
];
/** The name the Events filter and the region sheet import. */
export const STATES = REGIONS;

const STORAGE_KEY = 'halo:federation-state';

/**
 * RETIRED 2026-08-27 — nothing injects this any more. The header switcher and
 * its bottom sheet are gone: region is now an Events filter on Home (see
 * EventFiltersState), which is the only feed it ever scoped. Kept, with
 * `halo-state-sheet`, because `STATES` above is still the data source for that
 * filter's options and the picker may return as a Settings preference.
 *
 * FederationState — the single source of truth for the active region. `null`
 * is the "all regions" view under the tenant's own mark. Persisted to
 * localStorage so the choice survives reloads.
 */
@Injectable({ providedIn: 'root' })
export class FederationState {
  private vc = inject(ViewContext);
  readonly states = REGIONS;
  private _selected = signal<RegionCode | null>(this.restore());
  readonly selected = this._selected.asReadonly();

  private _pickerOpen = signal(false);
  readonly pickerOpen = this._pickerOpen.asReadonly();

  readonly current = computed<StateInfo | null>(
    () => REGIONS.find((s) => s.code === this._selected()) ?? null,
  );

  /** Header logo: the tenant's inline mark for all-regions, else '' (region uses `src`). */
  readonly headerSvg = computed(() => (this.current() ? '' : VOLLEYTV_MARK_SVG));
  readonly headerSrc = computed(() => {
    const st = this.current();
    if (!st) return '';
    return this.vc.theme() === 'dark' ? st.wmDark : st.wmLight;
  });
  readonly headerName = computed(() => this.current()?.name ?? VOLLEYTV_NAME);
  /** Short code for the header switcher — the region code, or 'ALL'. */
  readonly shortCode = computed(() => this.current()?.code ?? 'ALL');
  /** Current region's ball colorway — brand coral on the all-regions view. */
  readonly ballColor = computed(() => this.current()?.ballColor ?? '#ff6b35');
  /** Short label for the context chip. */
  readonly label = computed(() => this.current()?.name ?? VOLLEYTV_NAME);

  select(code: RegionCode | null): void {
    this._selected.set(code);
    this.persist(code);
    this._pickerOpen.set(false);
  }
  open(): void { this._pickerOpen.set(true); }
  close(): void { this._pickerOpen.set(false); }
  toggle(): void { this._pickerOpen.update((v) => !v); }

  private restore(): RegionCode | null {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return v && REGIONS.some((s) => s.code === v) ? (v as RegionCode) : null;
    } catch { return null; }
  }
  private persist(code: RegionCode | null): void {
    try {
      if (code) localStorage.setItem(STORAGE_KEY, code);
      else localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
  }
}
