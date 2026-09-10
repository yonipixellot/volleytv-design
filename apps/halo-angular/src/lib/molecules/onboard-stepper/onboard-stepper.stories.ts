import type { Meta, StoryObj } from '@storybook/angular';
import { OnboardStepper } from './onboard-stepper';

const meta: Meta<OnboardStepper> = {
  title: 'Molecules/Onboard Stepper',
  component: OnboardStepper,
  args: { step: 1, total: 3, showBack: false },
};
export default meta;
type Story = StoryObj<OnboardStepper>;

export const Step1: Story = {};
export const Step2WithBack: Story = { args: { step: 2, showBack: true } };
export const Step3: Story = { args: { step: 3, showBack: true } };
