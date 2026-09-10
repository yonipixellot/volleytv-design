import type { Meta, StoryObj } from '@storybook/angular';
import { SpaceTokens } from './space-tokens';

const meta: Meta<SpaceTokens> = {
  title: 'Tokens/Spacing',
  component: SpaceTokens,
  parameters: { docs: { description: { component: 'Layout rhythm, micro spacing scale, and radii. Pages compose from the layout tokens via the .halo-page / .halo-stack / .halo-rail utilities.' } } },
};
export default meta;

export const Scale: StoryObj<SpaceTokens> = {};
