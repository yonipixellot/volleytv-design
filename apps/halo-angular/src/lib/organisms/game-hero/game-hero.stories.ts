import type { Meta, StoryObj } from '@storybook/angular';
import { GameHero } from './game-hero';

const meta: Meta<GameHero> = {
  title: 'Organisms/Game hero',
  component: GameHero,
  args: {
    homeName: 'Netsetters 1', awayName: 'Vikings Grey',
    homeScore: 24, awayScore: 20,
    status: 'live', meta: 'Monday Men 14 - 2026 Winter · Open',
    image: 'img/hero-court.webp',
  },
  argTypes: { status: { control: 'inline-radio', options: ['live', 'pre', 'final'] } },
};
export default meta;

type Story = StoryObj<GameHero>;

export const Live: Story = {};
export const Final: Story = { args: { status: 'final' } };
export const Upcoming: Story = { args: { status: 'pre', tipTime: 'Sat 7:30 PM' } };
