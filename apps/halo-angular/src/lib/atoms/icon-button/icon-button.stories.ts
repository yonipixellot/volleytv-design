import type { Meta, StoryObj } from '@storybook/angular';
import { IconButton } from './icon-button';

const meta: Meta<IconButton> = {
  title: 'Atoms/IconButton',
  component: IconButton,
  render: (args) => ({
    props: args,
    template: `<halo-icon-button [icon]="icon" [ariaLabel]="ariaLabel" [size]="size" [dot]="dot" [disabled]="disabled" />`,
  }),
  args: { icon: 'menu', ariaLabel: 'Menu', size: 'md', dot: false, disabled: false } as any,
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    icon: { control: 'text' },
  },
};
export default meta;
type Story = StoryObj<IconButton>;

export const Medium: Story = {};
export const Small: Story = { args: { size: 'sm', icon: 'close', ariaLabel: 'Close' } as any };
export const Large: Story = { args: { size: 'lg', icon: 'share', ariaLabel: 'Share' } as any };
export const Bell: Story = { args: { icon: 'bell', ariaLabel: 'Notifications', dot: true } as any };
export const Share: Story = { args: { icon: 'share', ariaLabel: 'Share' } as any };
export const Disabled: Story = { args: { disabled: true } as any };

/** The full chrome set, sizes side by side. */
export const Gallery: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap:16px; align-items:center; padding:20px; background:var(--bg,#0f120e)">
        <halo-icon-button icon="menu" ariaLabel="Menu" />
        <halo-icon-button icon="bell" ariaLabel="Notifications" [dot]="true" />
        <halo-icon-button icon="share" ariaLabel="Share" />
        <halo-icon-button icon="close" ariaLabel="Close" size="sm" />
      </div>`,
  }),
};

export const States: Story = {
  parameters: { pseudo: { hover: ['.r-hover button'], focusVisible: ['.r-focus button'], active: ['.r-active button'] } },
  render: () => ({
    template: `
      <div style="display:grid;grid-template-columns:repeat(5,auto);justify-content:start;gap:16px;align-items:center;padding:24px;font-family:var(--body);font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--ink3)">
        <span>Rest</span><span>Hover</span><span>Focus</span><span>Active</span><span>Disabled</span>
        <halo-icon-button icon="share" ariaLabel="Share" />
        <span class="r-hover"><halo-icon-button icon="share" ariaLabel="Share" /></span>
        <span class="r-focus"><halo-icon-button icon="share" ariaLabel="Share" /></span>
        <span class="r-active"><halo-icon-button icon="share" ariaLabel="Share" /></span>
        <halo-icon-button icon="share" ariaLabel="Share" [disabled]="true" />
      </div>
    `,
  }),
};
