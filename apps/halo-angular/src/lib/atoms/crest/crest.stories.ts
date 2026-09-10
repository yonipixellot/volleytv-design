import type { Meta, StoryObj } from '@storybook/angular';
import { Crest } from './crest';

const meta: Meta<Crest> = {
  title: 'Atoms/Crest',
  component: Crest,
  args: { monogram: 'H1', size: 44 },
  argTypes: { size: { control: { type: 'range', min: 28, max: 96, step: 2 } } },
};
export default meta;

type Story = StoryObj<Crest>;

export const Monogram: Story = {};
export const WithLogo: Story = { args: { src: 'img/logo-blues.svg', alt: 'Blues' } };
export const Sizes: Story = {
  render: () => ({
    template: `<div style="padding:24px;display:flex;gap:16px;align-items:center">
      <halo-crest monogram="H1" [size]="32" /><halo-crest monogram="H1" [size]="44" /><halo-crest monogram="H1" [size]="64" />
    </div>`,
  }),
};
/** Broken logo URL → monogram tile fallback. */
export const BrokenLogo: Story = { args: { src: 'img/no-such-logo.png', monogram: 'H1' } };
