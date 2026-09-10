import type { Meta, StoryObj } from '@storybook/angular';
import { PremiumSheet } from './premium-sheet';

const meta: Meta<PremiumSheet> = {
  title: 'Organisms/Premium sheet',
  component: PremiumSheet,
  args: { open: true, selected: '' },
  parameters: { docs: { description: { component: 'Upgrade / plan-picker sheet for the premium upsell.' } } },
};
export default meta;

type Story = StoryObj<PremiumSheet>;

export const Default: Story = {};
