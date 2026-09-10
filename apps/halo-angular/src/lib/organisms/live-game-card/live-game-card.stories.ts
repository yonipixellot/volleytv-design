import type { Meta, StoryObj } from '@storybook/angular';
import { LiveGameCard } from './live-game-card';

const meta: Meta<LiveGameCard> = {
  title: 'Organisms/Live game card',
  component: LiveGameCard,
  args: {
    home: { name: 'Bayside', crest: 'img/logo-breakers.svg' },
    away: { name: 'Northside', crest: 'img/team-northside-flames.svg' },
    meta: 'Monday Men 14 - 2026 Winter · Open · Court 2',
  },
  render: (args) => ({ props: args, template: `<div style="padding:24px"><halo-live-game-card [home]="home" [away]="away" [meta]="meta" /></div>` }),
};
export default meta;

export const Default: StoryObj<LiveGameCard> = {};
