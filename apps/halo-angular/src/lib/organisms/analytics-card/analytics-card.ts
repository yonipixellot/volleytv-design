import { Component, input, output } from '@angular/core';
import { PerfGauge } from '../../molecules/perf-gauge/perf-gauge';
import { StatTile } from '../../molecules/stat-tile/stat-tile';
import { TrendChart, StatDatum } from '../trend-chart/trend-chart';

export interface GaugeData { value: string; percent: number; caption: string; short?: string; delta?: string; chips?: string[]; scale?: 'off' | 'def'; }
export interface TileData { label: string; short?: string; value: string | number; tag?: string; delta?: string; tone?: 'up' | 'flat'; }
export interface ChartData {
  title: string; titleSub?: string; trend?: string; season?: string | number; points: number[];
  accent?: 'off' | 'def'; statChips?: string[]; legendLabel?: string; verdictTitle?: string; verdictText?: string;
}

/**
 * Offence / Defence analytics: a season-summary card, then a separate trend card
 * that carries its own controls.
 *
 * TWO cards, not one with a divider (Maryna 2026-08-28). The selectors live in
 * the trend block, and while everything sat in a single container they appeared
 * to scope the gauge and split tiles above them too — which never change, so
 * switching a metric read as "nothing happened". One container means one scope
 * to a reader; the interaction guidance says the same thing from the other end:
 * controls belong above the content they scope, never inside a card whose rest
 * they do not govern.
 */
@Component({
  selector: 'halo-analytics-card',
  standalone: true,
  imports: [PerfGauge, StatTile, TrendChart],
  template: `
    <!-- Block 1 — static: this window's shooting summary. Nothing here responds
         to the trend block's controls, so it is its own card. -->
    <div class="card">
      <div class="impact">
        <halo-perf-gauge
          [value]="gauge().value" [percent]="gauge().percent" [caption]="gauge().caption"
          [short]="gauge().short || ''"
          [delta]="gauge().delta || ''" [scale]="gauge().scale || 'off'" />
        <div class="mblocks">
          @for (t of tiles(); track t.label) {
            <halo-stat-tile [label]="t.label" [short]="t.short || ''" [value]="t.value"
              [tag]="t.tag || ''" [delta]="t.delta || ''" [tone]="t.tone || 'up'" />
          }
        </div>
      </div>
    </div>

    <!-- Block 2 — dynamic: range + metric selectors and the plot they scope. -->
    <div class="card trend-card">
      <halo-trend-chart
        [title]="chart().title" [titleSub]="chart().titleSub || ''" [trend]="chart().trend || ''"
        [season]="chart().season || ''" [points]="chart().points" [accent]="chart().accent || 'off'"
        [statChips]="chart().statChips || []" [lockedChips]="lockedChips()" [statData]="statData()" (upgrade)="upgrade.emit()"
        [legendLabel]="chart().legendLabel || 'per game'"
        [verdictTitle]="chart().verdictTitle || ''" [verdictText]="chart().verdictText || ''" />
    </div>
  `,
  styleUrl: './analytics-card.scss',
})
export class AnalyticsCard {
  gauge = input.required<GaugeData>();
  tiles = input.required<TileData[]>();
  chart = input.required<ChartData>();
  /** Stat chips gated behind Premium — selecting one blurs the chart + upsell. */
  lockedChips = input<string[]>([]);
  /** Per-stat datasets so the chip row actually switches the trend chart. */
  statData = input<Record<string, StatDatum>>({});
  upgrade = output<void>();
}
