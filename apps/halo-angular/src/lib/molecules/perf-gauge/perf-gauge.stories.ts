import type { Meta, StoryObj } from '@storybook/angular';
import { PerfGauge } from './perf-gauge';
const meta: Meta<PerfGauge> = {
  title: 'Molecules/Perf gauge',
  component: PerfGauge,
  args: { value: '47%', percent: 47, caption: 'Field goal (FG%)', short: 'FG%', delta: '▲ +32%', scale: 'off' },
  argTypes: { scale: { control: 'inline-radio', options: ['off', 'def'] }, percent: { control: { type: 'range', min: 0, max: 100 } } },
  render: (a) => ({ props: a, template: `<div style="padding:24px"><halo-perf-gauge [value]="value" [percent]="percent" [caption]="caption" [short]="short" [delta]="delta" [scale]="scale" /></div>` }),
};
export default meta;
export const Offence: StoryObj<PerfGauge> = {};
export const Defence: StoryObj<PerfGauge> = { args: { value: '73', percent: 92, caption: 'Digs (DIG)', short: 'DIG', delta: '92nd pct', scale: 'def' } };

/** The caption carries a full name and an abbreviation; below 768 only the
 *  short one renders. Narrow the Storybook viewport to see the swap. */
export const ShortFormOnly: StoryObj<PerfGauge> = { args: { caption: '', short: 'FG%' } };
