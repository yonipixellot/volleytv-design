import type { Meta, StoryObj } from '@storybook/angular';
import { Spinner } from './spinner';

const meta: Meta<Spinner> = {
  title: 'Atoms/Spinner',
  component: Spinner,
  render: () => ({
    template: `
      <div style="padding:24px;display:flex;gap:20px;align-items:center;color:var(--ink)">
        <halo-spinner [size]="12" />
        <halo-spinner />
        <halo-spinner [size]="24" />
        <span style="color:var(--accent)"><halo-spinner [size]="18" /></span>
      </div>
    `,
  }),
};
export default meta;
export const Sizes: StoryObj<Spinner> = {};
