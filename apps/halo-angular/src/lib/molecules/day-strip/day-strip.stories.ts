import type { Meta, StoryObj } from '@storybook/angular';
import { DayStrip } from './day-strip';
const meta: Meta<DayStrip> = {
  title: 'Molecules/Day strip',
  component: DayStrip,
  args: { days: [{ w: 'Sat', n: 9 }, { w: 'Sun', n: 10 }, { w: 'Mon', n: 11 }, { w: 'Tue', n: 12 }, { w: 'Wed', n: 13 }, { w: 'Thu', n: 14 }], activeIndex: 2 },
};
export default meta;
export const Default: StoryObj<DayStrip> = {};

/** `has` marks the days that carry games — including the selected one, so a
 *  scan of the strip is not contradicted by the current selection. */
export const WithGameDots: StoryObj<DayStrip> = {
  args: {
    days: [
      { w: 'Sat', n: 9, has: true },
      { w: 'Sun', n: 10, has: true },
      { w: 'Mon', n: 11, has: true },
      { w: 'Tue', n: 12 },
      { w: 'Wed', n: 13 },
      { w: 'Thu', n: 14, has: true },
    ],
    activeIndex: 1,
  },
};

/** Today keeps its ring while another day is selected — the two markers read
 *  as two different facts, not one. */
export const TodayAndSelection: StoryObj<DayStrip> = {
  args: {
    days: [
      { w: 'Sat', n: 9, has: true },
      { w: 'Sun', n: 10, has: true, today: true },
      { w: 'Mon', n: 11, has: true },
      { w: 'Tue', n: 12 },
      { w: 'Wed', n: 13 },
      { w: 'Thu', n: 14, has: true },
    ],
    activeIndex: 3,
  },
};
