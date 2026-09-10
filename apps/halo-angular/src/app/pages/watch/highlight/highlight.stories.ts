import type { Meta, StoryObj } from '@storybook/angular';
import { HighlightPage } from './highlight';

const meta: Meta<HighlightPage> = {
  title: 'Pages/Watch/Highlight Viewer',
  component: HighlightPage,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Vertical story player — progress segments, tap zones to advance, caption + link to the game page.' } },
  },
};
export default meta;
export const Default: StoryObj<HighlightPage> = {};
