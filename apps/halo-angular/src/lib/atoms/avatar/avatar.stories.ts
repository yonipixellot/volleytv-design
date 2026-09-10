import type { Meta, StoryObj } from '@storybook/angular';
import { Avatar } from './avatar';

const meta: Meta<Avatar> = {
  title: 'Atoms/Avatar',
  component: Avatar,
  render: (args) => ({
    props: args,
    template: `<div style="padding:24px"><halo-avatar [src]="src" [monogram]="monogram" [alt]="alt" [size]="size" [color]="color" /></div>`,
  }),
  args: { src: '', monogram: 'TW', alt: '', size: 46, color: '' },
};
export default meta;
type Story = StoryObj<Avatar>;

export const Monogram: Story = {};
export const Photo: Story = { args: { src: 'img/av-weiss.png', alt: 'Tal Weiss' } };

export const SizesAndTints: Story = {
  render: () => ({
    template: `
      <div style="padding:24px;display:flex;gap:16px;align-items:center">
        <halo-avatar monogram="TW" [size]="32" />
        <halo-avatar monogram="TW" [size]="46" />
        <halo-avatar monogram="TW" [size]="70" />
        <halo-avatar monogram="VG" [size]="46" color="#10b866" />
        <halo-avatar monogram="HH" [size]="46" color="#ffce3a" />
        <halo-avatar monogram="TS" [size]="46" color="#1a1c22" />
      </div>
    `,
  }),
};
/** Broken photo URL → monogram fallback (never the browser broken-image glyph). */
export const BrokenPhoto: Story = { args: { src: 'img/no-such-photo.png', monogram: 'TW' } };
