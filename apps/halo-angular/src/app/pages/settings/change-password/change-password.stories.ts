import type { Meta, StoryObj } from '@storybook/angular';
import { ChangePasswordPage } from './change-password';

const meta: Meta<ChangePasswordPage> = {
  title: 'Pages/Settings/Change password',
  component: ChangePasswordPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;
export const Default: StoryObj<ChangePasswordPage> = {};
