import type { Meta, StoryObj } from '@storybook/angular';
import { TeamPage } from './team';

const meta: Meta<TeamPage> = {
  title: 'Pages/Team',
  component: TeamPage,
  parameters: { layout: 'fullscreen' },
  args: { id: 'nets' },
};
export default meta;
type Story = StoryObj<TeamPage>;

export const OwnTeam: Story = {};
export const FollowedTeam: Story = { args: { id: 'flames' } };
