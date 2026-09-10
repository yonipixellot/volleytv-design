import type { Meta, StoryObj } from '@storybook/angular';
import { componentWrapperDecorator } from '@storybook/angular';
import { SocialButton } from './social-button';

const meta: Meta<SocialButton> = {
  title: 'Molecules/Social Button',
  component: SocialButton,
  decorators: [componentWrapperDecorator((story) => `<div style="max-width:360px">${story}</div>`)],
  args: { provider: 'apple', label: 'Continue with Apple' },
  argTypes: { provider: { control: 'inline-radio', options: ['apple', 'google'] } },
};
export default meta;
type Story = StoryObj<SocialButton>;

export const Apple: Story = {};
export const Google: Story = { args: { provider: 'google', label: 'Continue with Google' } };

export const States: Story = {
  parameters: { pseudo: { hover: ['.r-hover button'], focusVisible: ['.r-focus button'] } },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;max-width:340px;padding:24px">
        <halo-social-button provider="apple" />
        <span class="r-hover" style="display:contents"><halo-social-button provider="apple" /></span>
        <span class="r-focus" style="display:contents"><halo-social-button provider="google" /></span>
      </div>
    `,
  }),
};
