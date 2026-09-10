import type { Meta, StoryObj } from '@storybook/angular';
import { ShotMap } from './shot-map';
const meta: Meta<ShotMap> = {
  title: 'Organisms/Attack path',
  component: ShotMap,
  args: { shotType: 'Kills' },
};
export default meta;
export const Default: StoryObj<ShotMap> = {};
/** Only the attacks from one set — what the set filter shows. */
export const SingleSet: StoryObj<ShotMap> = {
  args: {
    kills: [{ x1: 30, y1: 146, x2: 98, y2: 28, set: 1 }, { x1: 32, y1: 142, x2: 26, y2: 40, set: 1 }, { x1: 62, y1: 134, x2: 48, y2: 70, set: 1 }],
    errors: [{ x1: 30, y1: 146, x2: 44, y2: 110, set: 1 }],
    attemptsPerSet: [8, 0, 0, 0, 0],
  },
};
