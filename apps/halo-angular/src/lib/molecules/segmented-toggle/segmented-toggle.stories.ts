import type { Meta, StoryObj } from '@storybook/angular';
import { componentWrapperDecorator } from '@storybook/angular';
import { SegmentedToggle } from './segmented-toggle';

const meta: Meta<SegmentedToggle> = {
  title: 'Molecules/Segmented Toggle',
  component: SegmentedToggle,
  decorators: [componentWrapperDecorator((story) => `<div style="max-width:360px">${story}</div>`)],
  args: {
    value: 'signin',
    options: [
      { key: 'signin', label: 'Sign in' },
      { key: 'signup', label: 'Sign up' },
    ],
  },
};
export default meta;
type Story = StoryObj<SegmentedToggle>;

export const Default: Story = {};
export const SignUpActive: Story = { args: { value: 'signup' } };
export const Three: Story = {
  args: {
    value: 'week',
    options: [
      { key: 'day', label: 'Day' },
      { key: 'week', label: 'Week' },
      { key: 'month', label: 'Month' },
    ],
  },
};
export const TabsMode: Story = {
  render: () => ({
    props: {
      opts: [
        { key: 'video', label: 'Video' },
        { key: 'highlights', label: 'Highlights', count: 6 },
        { key: 'stats', label: 'Stats' },
        { key: 'lineups', label: 'Lineups' },
        { key: 'ladder', label: 'Ladder' },
      ],
      val: 'highlights',
    },
    template: `<div style="padding:24px;max-width:390px"><halo-segmented-toggle mode="tabs" [options]="opts" [value]="val" /></div>`,
  }),
};

export const States: Story = {
  parameters: { pseudo: { hover: ['.r-hover .segbtn:first-child'], focusVisible: ['.r-focus .segbtn:first-child'] } },
  render: () => ({
    props: { opts: [ { key: 'a', label: 'Sign in' }, { key: 'b', label: 'Sign up' } ] },
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;max-width:320px;padding:24px">
        <halo-segmented-toggle [options]="opts" value="a" />
        <span class="r-hover" style="display:contents"><halo-segmented-toggle [options]="opts" value="b" /></span>
        <span class="r-focus" style="display:contents"><halo-segmented-toggle [options]="opts" value="b" /></span>
      </div>
    `,
  }),
};
