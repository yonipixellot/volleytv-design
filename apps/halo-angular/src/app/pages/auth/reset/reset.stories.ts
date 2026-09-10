import type { Meta, StoryObj } from '@storybook/angular';
import { ResetPage } from './reset';

const meta: Meta<ResetPage> = {
  title: 'Pages/Auth/Reset Password',
  component: ResetPage,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Set a new password from an email link — new + confirm, then a saved state.' } },
  },
};
export default meta;
export const Default: StoryObj<ResetPage> = {};
