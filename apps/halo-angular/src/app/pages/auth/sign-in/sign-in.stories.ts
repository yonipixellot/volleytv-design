import type { Meta, StoryObj } from '@storybook/angular';
import { SignInPage } from './sign-in';

const meta: Meta<SignInPage> = {
  title: 'Pages/Auth/Sign In',
  component: SignInPage,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: "Sign in — three stages on one route. Default: the identity provider's own card, embedded 1:1 (see Organisms/Auth embed), floating on the shared brand field with our type-only wordmark above it; a tap stands in for the whole provider round-trip and lands on the SSO handoff, which continues on the same field. Our own email screen (?sso=1) and the classic email+password form (?classic=1) are the non-provider variants." } },
  },
};
export default meta;
export const Default: StoryObj<SignInPage> = {};
