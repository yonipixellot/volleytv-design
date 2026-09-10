import type { Meta, StoryObj } from '@storybook/angular';
import { DeleteAccountPage } from './delete-account';

const meta: Meta<DeleteAccountPage> = {
  title: 'Pages/Settings/Delete account',
  component: DeleteAccountPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;
export const Default: StoryObj<DeleteAccountPage> = {};
