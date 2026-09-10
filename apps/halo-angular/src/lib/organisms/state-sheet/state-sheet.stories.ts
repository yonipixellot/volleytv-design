import type { Meta, StoryObj } from '@storybook/angular';
import { StateSheet } from './state-sheet';

const meta: Meta<StateSheet> = {
  title: 'Organisms/State sheet',
  component: StateSheet,
  args: { open: true },
  parameters: { docs: { description: { component: 'State-federation switcher opened from the Watch header.' } } },
};
export default meta;

type Story = StoryObj<StateSheet>;

export const Default: Story = {};
