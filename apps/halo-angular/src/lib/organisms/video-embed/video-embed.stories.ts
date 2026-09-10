import type { Meta, StoryObj } from '@storybook/angular';
import { componentWrapperDecorator } from '@storybook/angular';
import { VideoEmbed } from './video-embed';

const meta: Meta<VideoEmbed> = {
  title: 'Organisms/Video Embed',
  component: VideoEmbed,
  decorators: [componentWrapperDecorator((story) => `<div style="padding:16px;max-width:420px">${story}</div>`)],
  args: {
    kindLabel: 'FULL GAME · 16:9',
    title: 'Full game',
    sub: 'Watch the whole thing',
    duration: '1:42:10',
    poster: 'img/game-1.webp',
  },
};
export default meta;
type Story = StoryObj<VideoEmbed>;

export const FullGame: Story = {};
export const Recap: Story = {
  args: { kindLabel: 'RECAP · 16:9', title: 'Recap', sub: 'Top plays in 60 seconds', duration: '1:04', poster: 'img/game-2.webp' },
};
/** Missing/failed poster → branded frame fallback. */
export const MissingPoster: Story = { args: { title: 'Semi final · Full game', poster: '', duration: '1:52:04' } };
