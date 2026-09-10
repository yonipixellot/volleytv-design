import type { Meta, StoryObj } from '@storybook/angular';
import { PlaceholderPage } from './placeholder';

const meta: Meta<PlaceholderPage> = {
  title: 'Pages/Placeholder',
  component: PlaceholderPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;
export const Default: StoryObj<PlaceholderPage> = {};
