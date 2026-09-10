import type { Meta, StoryObj } from '@storybook/angular';
import { ForgotPage } from './forgot';

const meta: Meta<ForgotPage> = {
  title: 'Pages/Auth/Forgot Password',
  component: ForgotPage,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Forgot password — request a reset link, then a sent-confirmation state (submit the email to see it).' } },
  },
};
export default meta;
export const Default: StoryObj<ForgotPage> = {};
