import type { Meta, StoryObj } from '@storybook/angular';
import { SectionHeader } from './section-header';

const meta: Meta<SectionHeader> = {
  title: 'Molecules/Section header',
  component: SectionHeader,
  args: { title: 'Full games', count: '14 games', seeAll: true, tone: 'accent' },
  argTypes: { tone: { control: 'inline-radio', options: ['accent', 'def', 'live', 'past'] } },
};
export default meta;

type Story = StoryObj<SectionHeader>;

export const Default: Story = {};
export const Live: Story = { args: { title: 'Live now', count: '2 games', seeAll: false, tone: 'live' } };
