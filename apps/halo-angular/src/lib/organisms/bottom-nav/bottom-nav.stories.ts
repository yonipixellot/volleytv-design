import type { Meta, StoryObj } from '@storybook/angular';
import { BottomNav } from './bottom-nav';

const meta: Meta<BottomNav> = {
  title: 'Organisms/Bottom nav',
  component: BottomNav,
  args: { active: 'home' },
  argTypes: { active: { control: 'inline-radio', options: ['home', 'games', 'you'] } },
  render: (args) => ({ props: args, template: `<div style="padding:24px;display:flex;justify-content:center"><halo-bottom-nav [active]="active" /></div>` }),
};
export default meta;

export const Default: StoryObj<BottomNav> = {};
