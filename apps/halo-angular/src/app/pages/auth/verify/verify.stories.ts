import type { Meta, StoryObj } from '@storybook/angular';
import { VerifyPage } from './verify';

const meta: Meta<VerifyPage> = {
  title: 'Pages/Auth/Verify',
  component: VerifyPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;
export const Default: StoryObj<VerifyPage> = {};
