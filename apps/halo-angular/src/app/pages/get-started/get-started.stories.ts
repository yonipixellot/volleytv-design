import type { Meta, StoryObj } from '@storybook/angular';
import { GetStartedPage } from './get-started';

const meta: Meta<GetStartedPage> = {
  title: 'Pages/Get started',
  component: GetStartedPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;
export const Default: StoryObj<GetStartedPage> = {};
