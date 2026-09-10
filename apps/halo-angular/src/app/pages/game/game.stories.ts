import type { Meta, StoryObj } from '@storybook/angular';
import { GamePage } from './game';

const meta: Meta<GamePage> = {
  title: 'Pages/Game',
  component: GamePage,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Game detail — final (score, full game + recap, highlights, team & player stats) or pre-game (matchup + lineups).' } },
  },
};
export default meta;
type Story = StoryObj<GamePage>;

export const Final: Story = { args: { state: 'final' } };
export const PreGame: Story = { args: { state: 'pregame' } };
