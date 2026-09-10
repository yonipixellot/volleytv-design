import type { Meta, StoryObj } from '@storybook/angular';
import { StatusBar } from './status-bar';

const meta: Meta<StatusBar> = {
  title: 'Molecules/Status bar',
  component: StatusBar,
  args: { time: '9:30' },
};
export default meta;

export const Default: StoryObj<StatusBar> = {};
