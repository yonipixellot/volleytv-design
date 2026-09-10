import type { Meta, StoryObj } from '@storybook/angular';
import { HaloButton } from './button';

const meta: Meta<HaloButton> = {
  title: 'Atoms/Button',
  component: HaloButton,
  render: (args) => ({
    props: args,
    template: `<halo-button [variant]="variant" [size]="size" [block]="block" [loading]="loading" [disabled]="disabled">${'{{ label }}'}</halo-button>`,
  }),
  args: { variant: 'primary', size: 'md', block: false, loading: false, disabled: false, label: 'Sign in' } as any,
  argTypes: { variant: { control: 'inline-radio', options: ['primary', 'premium', 'secondary', 'glass', 'ghost', 'link'] }, size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
};
export default meta;
type Story = StoryObj<HaloButton & { label: string }>;

export const Primary: Story = {};
export const Glass: Story = { args: { variant: 'glass', label: 'Continue with Apple' } as any };
export const Ghost: Story = { args: { variant: 'ghost', label: 'Skip for now' } as any };
export const Loading: Story = { args: { loading: true, label: 'Signing in…' } as any };
export const Block: Story = { args: { block: true, label: 'Continue' } as any };
export const Secondary: Story = { args: { variant: 'secondary', label: 'Follow team' } as any };
export const Disabled: Story = { args: { disabled: true, label: 'Sign in' } as any };
export const Small: Story = { args: { size: 'sm', label: 'Follow' } as any };
export const Large: Story = { args: { size: 'lg', label: 'Watch live' } as any };
export const Premium: Story = { args: { variant: 'premium', label: 'Go Premium' } as any };
export const Link: Story = { args: { variant: 'link', label: 'Maybe later' } as any };
/** Disabled is a NEUTRAL recipe — never dimmed accent/gold (the muddy-gold bug). */
export const DisabledPremium: Story = { args: { variant: 'premium', disabled: true, label: 'Go Premium' } as any };

/** Full interaction matrix — hover/focus/active are FORCED via the
 *  pseudo-states addon so every state is visible at once. */
export const States: Story = {
  parameters: {
    pseudo: { hover: ['.r-hover .btn'], focusVisible: ['.r-focus .btn'], active: ['.r-active .btn'] },
  },
  render: () => ({
    template: `
      <style>.sgrid{display:grid;grid-template-columns:90px repeat(4,auto);gap:12px 16px;align-items:center;padding:24px;font-family:var(--body)}.sgrid .h{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--ink3)}</style>
      <div class="sgrid">
        <span></span><span class="h">Primary</span><span class="h">Secondary</span><span class="h">Glass</span><span class="h">Ghost</span>
        <span class="h">Rest</span>
        <halo-button>Sign in</halo-button><halo-button variant="secondary">Follow</halo-button><halo-button variant="glass">Apple</halo-button><halo-button variant="ghost">Skip</halo-button>
        <span class="h r-hover" style="grid-column:1">Hover</span>
        <span class="r-hover" style="display:contents"><halo-button>Sign in</halo-button><halo-button variant="secondary">Follow</halo-button><halo-button variant="glass">Apple</halo-button><halo-button variant="ghost">Skip</halo-button></span>
        <span class="h r-focus" style="grid-column:1">Focus</span>
        <span class="r-focus" style="display:contents"><halo-button>Sign in</halo-button><halo-button variant="secondary">Follow</halo-button><halo-button variant="glass">Apple</halo-button><halo-button variant="ghost">Skip</halo-button></span>
        <span class="h r-active" style="grid-column:1">Active</span>
        <span class="r-active" style="display:contents"><halo-button>Sign in</halo-button><halo-button variant="secondary">Follow</halo-button><halo-button variant="glass">Apple</halo-button><halo-button variant="ghost">Skip</halo-button></span>
        <span class="h" style="grid-column:1">Disabled</span>
        <halo-button [disabled]="true">Sign in</halo-button><halo-button variant="secondary" [disabled]="true">Follow</halo-button><halo-button variant="glass" [disabled]="true">Apple</halo-button><halo-button variant="ghost" [disabled]="true">Skip</halo-button>
        <span class="h" style="grid-column:1">Loading</span>
        <halo-button [loading]="true">Signing in…</halo-button><halo-button variant="secondary" [loading]="true">Following…</halo-button><halo-button variant="glass" [loading]="true">Working…</halo-button><halo-button variant="ghost" [loading]="true">Working…</halo-button>
      </div>
    `,
  }),
};
