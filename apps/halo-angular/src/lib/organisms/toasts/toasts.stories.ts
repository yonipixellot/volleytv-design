import type { Meta, StoryObj } from '@storybook/angular';
import { HaloToasts } from './toasts';

const meta: Meta<HaloToasts> = {
  title: 'Organisms/Toasts',
  component: HaloToasts,
  args: {
    toasts: [
      { id: 1, message: 'Link copied', tone: 'neutral' },
      { id: 2, message: 'Following Northside Flames', tone: 'pos' },
      { id: 3, message: 'Could not save — try again', tone: 'live' },
    ],
  },
};
export default meta;
type Story = StoryObj<HaloToasts>;

export const Stack: Story = {
  render: (args) => ({
    props: args,
    // the host is position:fixed; give the story canvas height so it shows
    template: `<div style="height:300px"><halo-toasts [toasts]="toasts" /></div>`,
  }),
};
