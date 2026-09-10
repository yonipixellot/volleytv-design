import type { Meta, StoryObj } from '@storybook/angular';
import { FollowingPage } from './following';

const meta: Meta<FollowingPage> = {
  title: 'Pages/Settings/Following',
  component: FollowingPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;
export const Default: StoryObj<FollowingPage> = {};
