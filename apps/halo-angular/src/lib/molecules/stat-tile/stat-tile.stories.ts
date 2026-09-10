import type { Meta, StoryObj } from '@storybook/angular';
import { StatTile } from './stat-tile';
const meta: Meta<StatTile> = {
  title: 'Molecules/Stat tile',
  component: StatTile,
  args: { label: 'Kill %', short: 'K%', value: '42%', tag: 'Avg 38%', delta: '▲ +11%', tone: 'up' },
  argTypes: { tone: { control: 'inline-radio', options: ['up', 'flat'] } },
  render: (a) => ({ props: a, template: `<div style="width:200px;padding:24px"><halo-stat-tile [label]="label" [short]="short" [value]="value" [tag]="tag" [delta]="delta" [tone]="tone" /></div>` }),
};
export default meta;
export const Up: StoryObj<StatTile> = {};
export const Flat: StoryObj<StatTile> = { args: { label: 'Serve in play', short: 'SRV', value: '93%', tag: 'Avg 90%', delta: 'steady', tone: 'flat' } };
