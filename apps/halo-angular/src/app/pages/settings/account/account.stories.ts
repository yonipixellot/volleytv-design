import type { Meta, StoryObj } from '@storybook/angular';
import { AccountPage } from './account';

const meta: Meta<AccountPage> = {
  title: 'Pages/Settings/Account',
  component: AccountPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;
export const Default: StoryObj<AccountPage> = {};
