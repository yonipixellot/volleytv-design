import type { Meta, StoryObj } from '@storybook/angular';
import { TrendChart } from './trend-chart';
const meta: Meta<TrendChart> = {
  title: 'Organisms/Trend chart',
  component: TrendChart,
  args: {
    title: 'K', titleSub: 'per match', trend: '▲ +12% · vs last 10', season: '184', accent: 'off',
    points: [2.4, 2.2, 1.4, 2.2, 2.3, 2.4, 3, 2.2, 2.2, 2.2],
    statChips: ['K', 'ACE', 'BLK', 'DIG', 'AST', 'E', 'HIT%'],
    legendLabel: 'K / match', verdictTitle: 'Trending up',
    verdictText: 'Kills carry your scoring. G11 (15) is your season high.',
  },
  argTypes: { accent: { control: 'inline-radio', options: ['off', 'def'] } },
  render: (a) => ({ props: a, template: `<div style="padding:24px"><halo-trend-chart [title]="title" [titleSub]="titleSub" [trend]="trend" [season]="season" [accent]="accent" [points]="points" [statChips]="statChips" [legendLabel]="legendLabel" [verdictTitle]="verdictTitle" [verdictText]="verdictText" /></div>` }),
};
export default meta;
export const Offence: StoryObj<TrendChart> = {};
export const Defence: StoryObj<TrendChart> = { args: { title: 'Defence', titleSub: 'BLK + DIG / match', trend: '▲ +18% · vs last 10', season: '2.9', accent: 'def', points: [2, 3, 2, 3.5, 2, 3, 4, 3, 2, 3.5], statChips: [], legendLabel: 'Defence / game', verdictTitle: 'Active hands', verdictText: 'Steals + blocks are up 18% over the last 10.' } };
