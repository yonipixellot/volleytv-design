import type { Meta, StoryObj } from '@storybook/angular';
import { ColorTokens } from './color-tokens';

const meta: Meta<ColorTokens> = {
  title: 'Tokens/Colors',
  component: ColorTokens,
  parameters: { docs: { description: { component: 'The BA colour palette, resolved live from CSS custom properties. Switch the Theme toolbar (Dark/Light) to see both modes.' } } },
};
export default meta;

type Story = StoryObj<ColorTokens>;

export const Palette: Story = {};
