import type { Meta, StoryObj } from '@storybook/angular';
import { HomePage } from './home';

const meta: Meta<HomePage> = {
  title: 'Pages/Home',
  component: HomePage,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'The Home events/discovery feed, assembled from organisms with mock data. Try Theme (dark/light) and Skin (neutral base / Volley TV).' } },
  },
};
export default meta;

type Story = StoryObj<HomePage>;

export const Default: Story = {};
