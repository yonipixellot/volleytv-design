import type { Meta, StoryObj } from '@storybook/angular';
import { RadiusTokens } from './radius-tokens';

const meta: Meta<RadiusTokens> = {
  title: 'Tokens/Radius',
  component: RadiusTokens,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'The corner-radius scale. Field / Card / Pill / Phone-frame radii, shared across every skin and theme.' } },
  },
};
export default meta;

export const Scale: StoryObj<RadiusTokens> = {};
