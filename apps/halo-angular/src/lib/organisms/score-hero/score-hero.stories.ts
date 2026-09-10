import type { Meta, StoryObj } from '@storybook/angular';
import { componentWrapperDecorator } from '@storybook/angular';
import { ScoreHero } from './score-hero';

const meta: Meta<ScoreHero> = {
  title: 'Organisms/Score Hero',
  component: ScoreHero,
  decorators: [componentWrapperDecorator((story) => `<div style="padding:16px">${story}</div>`)],
  args: {
    statusLabel: 'Final',
    when: 'Sun 12 May',
    venue: 'Rowland Cowan',
    homeName: 'Netsetters 1',
    awayName: 'Bayside Breakers',
    homeCrest: 'img/logo-netsetters.svg',
    awayCrest: 'img/logo-breakers.svg',
    homeScore: 3,
    awayScore: 1,
  },
};
export default meta;
type Story = StoryObj<ScoreHero>;

export const HomeWin: Story = {};
export const AwayWin: Story = { args: { homeScore: 1, awayScore: 3 } };
