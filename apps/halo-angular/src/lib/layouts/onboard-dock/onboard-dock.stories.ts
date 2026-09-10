import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { OnboardDock } from './onboard-dock';
import { HaloButton } from '../../atoms/button/button';

const meta: Meta<OnboardDock> = {
  title: 'Layouts/Onboard dock',
  component: OnboardDock,
  decorators: [moduleMetadata({ imports: [HaloButton] })],
  render: () => ({
    template: `<halo-onboard-dock>
      <halo-button variant="primary" [block]="true">Continue</halo-button>
    </halo-onboard-dock>`,
  }),
  parameters: { docs: { description: { component: 'Sticky bottom dock holding the primary CTA through onboarding steps.' } } },
};
export default meta;

type Story = StoryObj<OnboardDock>;

export const Default: Story = {};
