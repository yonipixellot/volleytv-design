import type { Meta, StoryObj } from '@storybook/angular';
import { BlurLock } from './blur-lock';

const meta: Meta<BlurLock> = {
  title: 'Organisms/Blur lock',
  component: BlurLock,
  render: (args) => ({
    props: args,
    template: `<halo-blur-lock [locked]="locked" [title]="title" [note]="note">
      <div style="padding:20px;display:grid;gap:8px">
        <div style="font-size:var(--fs-d-md);font-family:var(--disp);color:var(--accent)">27.4</div>
        <div style="color:var(--ink2)">Kills per match · season trend and attack map</div>
      </div>
    </halo-blur-lock>`,
  }),
  args: { locked: true, title: 'Premium', note: 'Upgrade to see full season stats' },
};
export default meta;

type Story = StoryObj<BlurLock>;

export const Locked: Story = {};
export const Unlocked: Story = { args: { locked: false } };
