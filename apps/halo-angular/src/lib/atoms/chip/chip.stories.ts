import type { Meta, StoryObj } from '@storybook/angular';
import { Chip } from './chip';

const meta: Meta<Chip> = {
  title: 'Atoms/Chip',
  component: Chip,
  render: () => ({ template: `<div style="padding:24px;display:flex;gap:8px"><halo-chip>Div 41%</halo-chip><halo-chip>Peak 61%</halo-chip></div>` }),
};
export default meta;
type Story = StoryObj<Chip>;

export const Default: Story = {};

export const Tones: Story = {
  render: () => ({
    template: `
      <div style="padding:24px;display:flex;flex-direction:column;gap:12px;align-items:flex-start">
        <halo-chip>neutral · Div 41%</halo-chip>
        <halo-chip tone="accent">accent · K</halo-chip>
        <halo-chip tone="pos">pos · +12%</halo-chip>
        <halo-chip tone="live" [dot]="true">Live</halo-chip>
        <div style="position:relative;width:160px;height:90px;border-radius:12px;background:#26292f url('img/hl-1.webp') center/cover;display:grid;place-items:end start;padding:8px">
          <halo-chip tone="media">12:04</halo-chip>
        </div>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="padding:24px;display:flex;gap:12px;align-items:center">
        <halo-chip>sm (default)</halo-chip>
        <halo-chip size="md">md badge</halo-chip>
        <halo-chip tone="live" size="md" [dot]="true">Live</halo-chip>
      </div>
    `,
  }),
};
