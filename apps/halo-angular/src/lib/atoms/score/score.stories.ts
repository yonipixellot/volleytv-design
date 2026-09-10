import type { Meta, StoryObj } from '@storybook/angular';
import { Score } from './score';

const meta: Meta<Score> = {
  title: 'Atoms/Score',
  component: Score,
  args: { home: 64, away: 58 },
  parameters: {
    docs: { description: { component:
      'One scoreline for the whole app: en dash, display face, tabular figures, air proportional to the size. Size, weight and colour are inherited from the surface — the atom owns the glyph, not the hierarchy.' } },
  },
};
export default meta;
type S = StoryObj<Score>;

export const Default: S = {};

/** Where a surface marks the result, the winner takes the accent and the other
 *  half goes quiet neutral. The dash never takes the accent. */
export const WithWinner: S = { args: { winner: 'home' } };

/** Older mock data stores the pair as one string, whatever separator it was
 *  written with. The atom normalises all of them. */
export const FromAPairString: S = {
  args: { home: null, away: null, pair: '64 · 58' },
};

/** The atom inherits size and weight, so one component serves the 12px chip and
 *  the 54px hero. */
export const Sizes: S = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:20px;align-items:flex-start;color:var(--ink)">
        <span style="font-size:var(--fs-caption);font-weight:700"><halo-score home="3" away="1" /></span>
        <span style="font-size:var(--fs-heading);font-weight:700;color:var(--accent)"><halo-score home="3" away="1" /></span>
        <span style="font-size:var(--fs-d-2xl);font-weight:600"><halo-score home="24" away="20" /></span>
      </div>`,
    moduleMetadata: { imports: [Score] },
  }),
};
