import type { Meta, StoryObj } from '@storybook/angular';
import { CompleteProfilePage } from './complete-profile';

const meta: Meta<CompleteProfilePage> = {
  title: 'Pages/Auth/Complete profile',
  component: CompleteProfilePage,
  parameters: { layout: 'fullscreen' },
};
export default meta;
export const Default: StoryObj<CompleteProfilePage> = {};
