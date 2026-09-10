import type { Meta, StoryObj } from '@storybook/angular';
import { BackBar } from './back-bar';

const meta: Meta<BackBar> = {
  title: 'Molecules/Back Bar',
  component: BackBar,
  parameters: { layout: 'fullscreen' },
  args: {
    homeName: 'Netsetters 1',
    awayName: 'Bayside Breakers',
    homeCrest: 'img/logo-netsetters.svg',
    awayCrest: 'img/logo-breakers.svg',
  },
};
export default meta;
export const Default: StoryObj<BackBar> = {};
