import type { Meta, StoryObj } from '@storybook/angular';
import { CoachAdminPage } from './coach-admin';

const meta: Meta<CoachAdminPage> = {
  title: 'Pages/Settings/Coach admin',
  component: CoachAdminPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;
export const Default: StoryObj<CoachAdminPage> = {};
