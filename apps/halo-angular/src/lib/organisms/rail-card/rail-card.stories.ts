import type { Meta, StoryObj } from '@storybook/angular';
import { RailCard } from './rail-card';

const meta: Meta<RailCard> = {
  title: 'Organisms/Rail card',
  component: RailCard,
  render: (args) => ({ props: args, template: `<div style="padding:24px"><halo-rail-card [title]="title" [sub]="sub" [date]="date" [score]="score" [duration]="duration" [thumb]="thumb" /></div>` }),
};
export default meta;

type Story = StoryObj<RailCard>;

export const FullGame: Story = {
  args: { title: 'Netsetters · Vikings', sub: 'Monday Men 14 - 2026 Winter · Full game', date: 'Sun 12 May', score: '3–1', duration: '1:42:10', thumb: 'img/game-1.webp' },
};
export const Highlight: Story = {
  args: { title: 'Line shot kill', sub: 'Netsetters 1 · Set 3', duration: '0:22', thumb: 'img/hl-1.webp' },
};
/** Missing/failed thumbnail → branded frame fallback, never a broken-image glyph. */
export const MissingThumb: Story = { args: { title: 'Round 12 · Full game', sub: 'vs Northside Flames', duration: '1:48:20', thumb: '' } };
export const BrokenThumb: Story = { args: { title: 'Round 12 · Full game', sub: 'vs Northside Flames', duration: '1:48:20', thumb: 'img/does-not-exist.png' } };
