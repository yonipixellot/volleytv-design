import type { Meta, StoryObj } from '@storybook/angular';
import { YouPage } from './you';

const meta: Meta<YouPage> = {
  title: 'Pages/You',
  component: YouPage,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Athlete profile — identity, season strip, Offence / Attack map / Defence analytics. Try Theme (dark/light) and Skin (neutral / Volley TV).' } },
  },
};
export default meta;

export const Default: StoryObj<YouPage> = {};
