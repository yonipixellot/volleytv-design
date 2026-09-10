import type { Meta, StoryObj } from '@storybook/angular';
import { Skeleton } from './skeleton';

const meta: Meta<Skeleton> = {
  title: 'Atoms/Skeleton',
  component: Skeleton,
};
export default meta;
type Story = StoryObj<Skeleton>;

export const Bar: Story = {
  render: () => ({ template: `<div style="padding:24px;max-width:320px"><halo-skeleton /></div>` }),
};

export const RailCard: Story = {
  render: () => ({
    template: `
      <div style="padding:24px;max-width:230px;display:flex;flex-direction:column;gap:8px">
        <halo-skeleton h="124px" />
        <halo-skeleton w="82%" h="13px" />
        <halo-skeleton w="55%" h="11px" />
      </div>
    `,
  }),
};

export const Row: Story = {
  render: () => ({
    template: `
      <div style="padding:24px;max-width:340px;display:flex;gap:12px;align-items:center">
        <halo-skeleton w="46px" h="46px" [round]="true" style="flex:none" />
        <div style="flex:1;display:flex;flex-direction:column;gap:8px">
          <halo-skeleton w="60%" h="13px" />
          <halo-skeleton w="38%" h="11px" />
        </div>
      </div>
    `,
  }),
};
