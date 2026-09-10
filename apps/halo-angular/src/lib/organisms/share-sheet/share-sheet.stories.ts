import type { Meta, StoryObj } from '@storybook/angular';
import { ShareSheet } from './share-sheet';

const meta: Meta<ShareSheet> = {
  title: 'Organisms/Share sheet',
  component: ShareSheet,
  args: { open: true, title: 'Share', sub: 'Netsetters vs Vikings · Full game', url: 'https://halo.tv/g/abc123', showScope: false },
  parameters: { docs: { description: { component: 'Share sheet for games, clips and highlights.' } } },
};
export default meta;

type Story = StoryObj<ShareSheet>;

export const Default: Story = {};
export const WithScope: Story = { args: { showScope: true } };
