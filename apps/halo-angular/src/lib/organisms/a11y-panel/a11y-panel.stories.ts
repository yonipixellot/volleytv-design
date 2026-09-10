import type { Meta, StoryObj } from '@storybook/angular';
import { A11yPanel, A11yFab } from './a11y-panel';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<A11yPanel> = {
  title: 'Organisms/Accessibility panel',
  component: A11yPanel,
  decorators: [moduleMetadata({ imports: [A11yFab] })],
};
export default meta;
type Story = StoryObj<A11yPanel>;

/** Layer-2 prefs sheet (PT AccessibilityPanel port) — text size / contrast / motion. */
export const Open: Story = { args: { open: true, text: 'default', contrast: 'default', motion: 'system' } };
/** The pre-auth entry point. Unpositioned: its host places it — in the app it
 *  sits on the pre-auth chrome plate beside the theme control. */
export const Fab: Story = { render: () => ({ template: `<halo-a11y-fab />` }) };
