import type { Meta, StoryObj } from '@storybook/angular';
import { InvitePage } from './invite';

const meta: Meta<InvitePage> = {
  title: 'Pages/Onboarding/Invite',
  component: InvitePage,
  parameters: { layout: 'fullscreen' },
};
export default meta;
export const Default: StoryObj<InvitePage> = {};
