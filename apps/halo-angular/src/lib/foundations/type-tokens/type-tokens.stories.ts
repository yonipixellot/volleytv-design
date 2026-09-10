import type { Meta, StoryObj } from '@storybook/angular';
import { TypeTokens } from './type-tokens';

const meta: Meta<TypeTokens> = {
  title: 'Tokens/Typography',
  component: TypeTokens,
  parameters: { docs: { description: { component: 'Display face = Antonio, body face = Inter. The scale below is the same one used across the app screens.' } } },
};
export default meta;

type Story = StoryObj<TypeTokens>;

export const Scale: Story = {};
