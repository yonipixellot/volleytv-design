import type { Meta, StoryObj } from '@storybook/angular';
import { EmptyState } from './empty-state';
import { HaloButton } from '../../atoms/button/button';

const meta: Meta<EmptyState> = {
  title: 'Molecules/Empty State',
  component: EmptyState,
  args: { icon: 'search', title: 'No games this week', sub: 'Try another date, or follow more teams to fill your feed.' },
};
export default meta;
type Story = StoryObj<EmptyState>;

export const Default: Story = {};

export const WithCta: Story = {
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: [HaloButton] },
    template: `
      <halo-empty-state [icon]="icon" [title]="title" [sub]="sub">
        <halo-button size="sm" variant="glass">Find teams</halo-button>
      </halo-empty-state>
    `,
  }),
  args: { icon: 'heart', title: 'Not following anyone yet', sub: 'Follow teams and players to build your Home feed.' },
};
