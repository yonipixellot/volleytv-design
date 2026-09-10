import type { Meta, StoryObj } from '@storybook/angular';
import { componentWrapperDecorator } from '@storybook/angular';
import { FollowRow } from './follow-row';

const meta: Meta<FollowRow> = {
  title: 'Organisms/Follow Row',
  component: FollowRow,
  decorators: [componentWrapperDecorator((story) => `<div style="max-width:380px">${story}</div>`)],
  args: { name: 'Bayside Breakers', meta: 'State League Div 1 · Open', crest: 'img/logo-breakers.svg', followed: false },
};
export default meta;
type Story = StoryObj<FollowRow>;

export const Team: Story = {};
export const TeamFollowed: Story = { args: { followed: true } };
/** People get the circular avatar; teams keep the rounded club plate. */
export const Player: Story = {
  args: { kind: 'person', name: 'Tal Weiss', meta: 'Netsetters 1 · #7', crest: '', mono: 'TW', showBell: true, followed: true, notify: true },
};
export const PlayerUnfollowed: Story = {
  args: { kind: 'person', name: 'Dylan Cross', meta: '#4 · SF', crest: '', mono: 'DC', followed: false },
};
