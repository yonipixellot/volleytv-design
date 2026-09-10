import type { Meta, StoryObj } from '@storybook/angular';
import { UpgradePage } from './upgrade';

const meta: Meta<UpgradePage> = {
  title: 'Pages/Upgrade',
  component: UpgradePage,
  parameters: { layout: 'fullscreen' },
};
export default meta;
export const Default: StoryObj<UpgradePage> = {};
