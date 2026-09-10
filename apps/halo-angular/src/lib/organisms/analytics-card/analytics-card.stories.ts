import type { Meta, StoryObj } from '@storybook/angular';
import { AnalyticsCard } from './analytics-card';
const meta: Meta<AnalyticsCard> = {
  title: 'Organisms/Analytics card',
  component: AnalyticsCard,
  args: {
    gauge: { value: '47%', percent: 47, caption: 'FG%', delta: '▲ +32%', chips: ['Div 41%', 'Peak 61%'], scale: 'off' },
    tiles: [
      { label: 'Kill %', value: '42%', tag: 'Avg 38%', delta: '▲ +11%', tone: 'up' },
      { label: 'Serve in play', value: '93%', tag: 'Avg 90%', delta: 'steady', tone: 'flat' },
    ],
    chart: {
      title: 'K', titleSub: 'per match', trend: '▲ +12% · vs last 10', season: '184', accent: 'off',
      points: [2.4, 2.2, 1.4, 2.2, 2.3, 2.4, 3, 2.2, 2.2, 2.2],
      statChips: ['K', 'ACE', 'BLK', 'DIG', 'AST', 'E', 'HIT%'],
      legendLabel: 'K / match', verdictTitle: 'Trending up',
      verdictText: 'Kills carry your scoring. G11 (15) is your season high.',
    },
  },
  render: (a) => ({ props: a, template: `<div style="padding:16px 0"><halo-analytics-card [gauge]="gauge" [tiles]="tiles" [chart]="chart" /></div>` }),
};
export default meta;
export const Offence: StoryObj<AnalyticsCard> = {};
