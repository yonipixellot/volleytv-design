import type { Meta, StoryObj } from '@storybook/angular';
import { SettingsShell } from './settings-shell';

const meta: Meta<SettingsShell> = {
  title: 'Layouts/Settings shell',
  component: SettingsShell,
  render: (args) => ({
    props: args,
    template: `<halo-settings-shell [title]="title" [autoBack]="autoBack">
      <div style="padding:16px;color:var(--ink2)">Settings section content goes here.</div>
    </halo-settings-shell>`,
  }),
  args: { title: 'Account', autoBack: true },
};
export default meta;

type Story = StoryObj<SettingsShell>;

export const Default: Story = {};
