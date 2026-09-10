import type { Meta, StoryObj } from '@storybook/angular';
import { componentWrapperDecorator } from '@storybook/angular';
import { StatGrid } from './stat-grid';

const meta: Meta<StatGrid> = {
  title: 'Molecules/Stat grid',
  component: StatGrid,
  decorators: [componentWrapperDecorator((story) => `<div style="max-width:360px">${story}</div>`)],
};
export default meta;
type Story = StoryObj<StatGrid>;

/** Season averages — six stats fill the three columns exactly. */
export const SeasonAverages: Story = {
  args: {
    label: 'Averages · per game',
    cells: [
      { k: 'PTS', v: '14.3', hot: true },
      { k: 'GP', v: '21' },
      { k: 'K', v: '11.2' },
      { k: 'ACE', v: '1.4' },
      { k: 'BLK', v: '1.0' },
      { k: 'AST', v: '3.2' },
    ],
  },
};

/** Single-game box score — five stats, which never divide into three columns.
 *  PTS becomes a full-width band (it's the sum of the shooting rows anyway) and
 *  the four contributors sit under it in an even 2×2. Each cell states its
 *  distance from the player's own season average. */
export const GameBoxScore: Story = {
  args: {
    cols: 2,
    cells: [
      { k: 'PTS', v: 18, hero: true, delta: 3.7, note: 'Above your 14.3 season average' },
      { k: 'K', v: 12, delta: -0.2 },
      { k: 'ACE', v: 2, delta: 0.4 },
      { k: 'BLK', v: 3, delta: 1.9 },
      { k: 'AST', v: 5, delta: 1.8 },
    ],
  },
};

/** A quiet night: every delta below the average, and none of it painted red. */
export const BelowAverage: Story = {
  args: {
    cols: 2,
    cells: [
      { k: 'PTS', v: 6, hero: true, delta: -8.3, note: 'A quieter night than your 14.3 average' },
      { k: 'K', v: 6, delta: -2.2 },
      { k: 'ACE', v: 0, delta: -1.6 },
      { k: 'BLK', v: 2, delta: -0.1 },
      { k: 'AST', v: 1, delta: -2.2 },
    ],
  },
};

/** Level with the average: the delta reads as a word, not "+0.0". */
export const LevelWithAverage: Story = {
  args: {
    cols: 2,
    cells: [
      { k: 'PTS', v: 14, hero: true, delta: 0, note: 'In line with your 14.0 season average' },
      { k: 'K', v: 12, delta: 0 },
      { k: 'ACE', v: 2, delta: 0.4 },
      { k: 'BLK', v: 2, delta: 0 },
      { k: 'AST', v: 3, delta: -0.2 },
    ],
  },
};

/** Game one: there is no season to compare against, so no deltas at all. */
export const FirstGameOfSeason: Story = {
  args: {
    cols: 2,
    cells: [
      { k: 'PTS', v: 12, hero: true, note: 'First game of the season' },
      { k: 'K', v: 9 },
      { k: 'ACE', v: 1 },
      { k: 'BLK', v: 2 },
      { k: 'AST', v: 2 },
    ],
  },
};

/** Flush: dividers only, no card of its own — for a grid that sits INSIDE
 *  another card, like the team page's fixture counts or You's rail averages. */
export const Flush: StoryObj<StatGrid> = {
  args: {
    flush: true,
    showDelta: false,
    cols: 3,
    cells: [
      { k: 'Live', v: 1 },
      { k: 'Upcoming', v: 1 },
      { k: 'Total', v: 4 },
    ],
  },
};
