import type { Meta, StoryObj } from '@storybook/angular';
import { PlayerDisc } from './player-disc';
const meta: Meta<PlayerDisc> = {
  title: 'Atoms/Player disc',
  component: PlayerDisc,
  args: { number: 7, size: 70 },
  argTypes: { size: { control: { type: 'range', min: 40, max: 120, step: 2 } } },
  render: (a) => ({ props: a, template: `<div style="padding:24px"><halo-player-disc [number]="number" [size]="size" /></div>` }),
};
export default meta;
export const Default: StoryObj<PlayerDisc> = {};
export const Sizes: StoryObj<PlayerDisc> = {
  render: () => ({
    template: `<div style="padding:24px;display:flex;gap:16px;align-items:center">
      <halo-player-disc [number]="7" [size]="44" /><halo-player-disc [number]="7" [size]="70" /><halo-player-disc [number]="23" [size]="96" />
    </div>`,
  }),
};
