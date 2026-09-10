import type { Meta, StoryObj } from '@storybook/angular';
import { GamesPage } from './games';
const meta: Meta<GamesPage> = {
  title: 'Pages/Games',
  component: GamesPage,
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Schedule — month picker, day strip, Live / Past / Upcoming ladder cards. Try Theme + Skin.' } } },
};
export default meta;
export const Default: StoryObj<GamesPage> = {};
