import type { Meta, StoryObj } from '@storybook/angular';
import { SubscriptionPage } from './subscription';

const meta: Meta<SubscriptionPage> = {
  title: 'Pages/Settings/Subscription',
  component: SubscriptionPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;
export const Default: StoryObj<SubscriptionPage> = {};
