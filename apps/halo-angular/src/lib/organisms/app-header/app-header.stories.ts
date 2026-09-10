import type { Meta, StoryObj } from '@storybook/angular';
import { AppHeader } from './app-header';

const meta: Meta<AppHeader> = {
  title: 'Organisms/App header',
  component: AppHeader,
  args: { unread: 3 },
  parameters: { docs: { description: { component: 'Top bar: Volley TV wordmark left (Coral on dark / Teal on light, verbatim), menu + bell right. The federation switcher lives on Home’s Events row, not in the bar.' } } },
};
export default meta;

type Story = StoryObj<AppHeader>;

export const Default: Story = {};
export const NoUnread: Story = { args: { unread: 0 } };
