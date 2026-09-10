import type { Meta, StoryObj } from '@storybook/angular';
import { NotificationsPage } from './notifications';

const meta: Meta<NotificationsPage> = {
  title: 'Pages/Settings/Notifications',
  component: NotificationsPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;
export const Default: StoryObj<NotificationsPage> = {};
