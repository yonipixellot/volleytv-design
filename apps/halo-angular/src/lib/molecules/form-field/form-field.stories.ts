import type { Meta, StoryObj } from '@storybook/angular';
import { componentWrapperDecorator } from '@storybook/angular';
import { FormField } from './form-field';

const meta: Meta<FormField> = {
  title: 'Molecules/Form Field',
  component: FormField,
  decorators: [componentWrapperDecorator((story) => `<div style="max-width:360px">${story}</div>`)],
  args: { label: 'Email', placeholder: 'you@school.com', value: '' },
};
export default meta;
type Story = StoryObj<FormField>;

export const Default: Story = {};
export const Filled: Story = { args: { value: 'tal@school.com' } };
export const WithHint: Story = { args: { label: 'Password', placeholder: 'At least 6 characters', hint: 'Minimum 6 characters' } };
export const WithError: Story = { args: { label: 'Password', value: '123', error: 'Use at least 6 characters' } };

export const States: Story = {
  parameters: { pseudo: { focusWithin: ['.r-focus .wrap'] } },
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:20px;max-width:360px;padding:24px">
        <halo-form-field label="Rest" placeholder="Email address" />
        <span class="r-focus" style="display:contents"><halo-form-field label="Focus" placeholder="Email address" /></span>
        <halo-form-field label="With hint" placeholder="Email address" hint="We only use this to sign you in." />
        <halo-form-field label="Error" value="a@b" error="Enter a valid email address." />
      </div>
    `,
  }),
};
