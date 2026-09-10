import type { Meta, StoryObj } from '@storybook/angular';
import { FedBall } from './fed-ball';

const meta: Meta<FedBall> = {
  title: 'Atoms/Fed ball',
  component: FedBall,
  args: { color: '#ffce3a', size: 42 },
  argTypes: { color: { control: 'select', options: ['#ffce3a', '#2e6fd8', '#77bbee', '#d0641f', '#ff8822', '#e94f3d', '#59c47f', '#ff7a00', '#f0b429'] } },
  parameters: { docs: { description: { component: 'The official BA swirl ball in a federation colorway — change `color` to see the approved dribble-bounce swap (topbar state roundel). One vector, nine tuned colorways.' } } },
};
export default meta;
export const Default: StoryObj<FedBall> = {};
