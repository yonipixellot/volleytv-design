import type { Meta, StoryObj } from '@storybook/angular';
import { SignUpPage } from './sign-up';

const meta: Meta<SignUpPage> = {
  title: 'Pages/Auth/Sign Up',
  component: SignUpPage,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Sign up — account details (step 1 of 3): name, email, password, birth date, gender, country.' } },
  },
};
export default meta;
export const Default: StoryObj<SignUpPage> = {};
