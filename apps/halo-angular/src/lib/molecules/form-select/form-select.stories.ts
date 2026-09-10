import type { Meta, StoryObj } from '@storybook/angular';
import { componentWrapperDecorator } from '@storybook/angular';
import { FormSelect } from './form-select';

const meta: Meta<FormSelect> = {
  title: 'Molecules/Form Select',
  component: FormSelect,
  decorators: [componentWrapperDecorator((story) => `<div style="max-width:360px">${story}</div>`)],
  args: {
    label: 'Country',
    placeholder: 'Select your country…',
    value: '',
    options: [
      { value: 'au', label: 'Australia' },
      { value: 'nz', label: 'New Zealand' },
      { value: 'us', label: 'United States' },
    ],
  },
};
export default meta;
type Story = StoryObj<FormSelect>;

export const Default: Story = {};
export const Selected: Story = { args: { value: 'au' } };
export const WithHint: Story = { args: { hint: 'Sets your default competition feed.' } };
export const WithError: Story = { args: { error: 'Pick a country to continue.' } };
export const Disabled: Story = { args: { value: 'au', disabled: true } };

export const States: Story = {
  parameters: { pseudo: { focusWithin: ['.r-focus .wrap'] } },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex;flex-direction:column;gap:20px;max-width:360px;padding:24px">
        <halo-form-select label="Rest" [options]="options" placeholder="Select your country…" />
        <span class="r-focus" style="display:contents"><halo-form-select label="Focus" [options]="options" placeholder="Select your country…" /></span>
        <halo-form-select label="Error" [options]="options" error="Pick a country to continue." />
        <halo-form-select label="Disabled" [options]="options" value="au" [disabled]="true" />
      </div>
    `,
  }),
};
