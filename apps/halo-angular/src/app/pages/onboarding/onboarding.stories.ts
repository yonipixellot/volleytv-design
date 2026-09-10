import type { Meta, StoryObj } from '@storybook/angular';
import { OnboardingPage } from './onboarding';

const meta: Meta<OnboardingPage> = {
  title: 'Pages/Onboarding',
  component: OnboardingPage,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Onboarding flow — persona → follow teams → follow players → done. Fully interactive here (pick a persona to advance).' } },
  },
};
export default meta;
export const Default: StoryObj<OnboardingPage> = {};
