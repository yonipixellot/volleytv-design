import type { Meta, StoryObj } from '@storybook/angular';
import { NotificationCenterPage } from './notification-center';

const meta: Meta<NotificationCenterPage> = {
  title: 'Pages/Notifications',
  component: NotificationCenterPage,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Notification center (CM-1417) — the bell\'s full-page feed from the HALO store (never Braze UI): the 4 MVP triggers with the epic\'s copy, Today/Earlier groups, unread accent rows, Clear empties the feed, tap = mark read + deep-link.' } },
  },
};
export default meta;
export const Default: StoryObj<NotificationCenterPage> = {};
