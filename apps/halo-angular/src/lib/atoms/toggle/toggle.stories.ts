import type { Meta, StoryObj } from '@storybook/angular';
import { HaloToggle } from './toggle';

const meta: Meta<HaloToggle> = {
  title: 'Atoms/Toggle',
  component: HaloToggle,
  args: { disabled: false, ariaLabel: 'Toggle setting' },
  parameters: { docs: { description: { component: 'On/off switch used in Settings rows and filters.' } } },
};
export default meta;

type Story = StoryObj<HaloToggle>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const On: Story = { args: { on: true } };
export const OnDisabled: Story = { args: { on: true, disabled: true } };

export const States: Story = {
  parameters: { pseudo: { focusVisible: ['.r-focus button'] } },
  render: () => ({
    template: `
      <div style="display:grid;grid-template-columns:repeat(5,auto);justify-content:start;gap:16px;align-items:center;padding:24px;font-family:var(--body);font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--ink3)">
        <span>Off</span><span>On</span><span>Focus</span><span>Off·disabled</span><span>On·disabled</span>
        <halo-toggle ariaLabel="Demo" />
        <halo-toggle [on]="true" ariaLabel="Demo" />
        <span class="r-focus"><halo-toggle ariaLabel="Demo" /></span>
        <halo-toggle [disabled]="true" ariaLabel="Demo" />
        <halo-toggle [on]="true" [disabled]="true" ariaLabel="Demo" />
      </div>
    `,
  }),
};
