import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { HaloIcon, ALL_ICONS } from './icon';
import { IconGallery } from './icon-gallery';

const meta: Meta<HaloIcon> = {
  title: 'Atoms/Icon',
  component: HaloIcon,
  decorators: [moduleMetadata({ imports: [HaloIcon] })],
  args: { name: 'bell', size: 24 },
  argTypes: {
    name: { control: 'select', options: ALL_ICONS },
    size: { control: { type: 'range', min: 12, max: 64, step: 2 } },
  },
};
export default meta;

type Story = StoryObj<HaloIcon>;

export const Single: Story = {};

export const Gallery: StoryObj = {
  render: () => ({ template: `<halo-icon-gallery />`, moduleMetadata: { imports: [IconGallery] } }),
};
