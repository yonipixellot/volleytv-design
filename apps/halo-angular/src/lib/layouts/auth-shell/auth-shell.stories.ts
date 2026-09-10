import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { AuthShell } from './auth-shell';
import { HaloButton } from '../../atoms/button/button';
import { VOLLEYTV_LOGO_SRC, VOLLEYTV_MARK_SVG, VOLLEYTV_NAME } from '../../brand/volleytv-preset';

const meta: Meta<AuthShell> = {
  title: 'Layouts/Auth shell',
  component: AuthShell,
  decorators: [moduleMetadata({ imports: [HaloButton] })],
  render: (args) => ({
    props: args,
    template: `<halo-auth-shell [logoSvg]="logoSvg" [logoSrc]="logoSrc" [clientName]="clientName">
      <div style="display:grid;gap:12px">
        <halo-button variant="primary" [block]="true">Continue with Apple</halo-button>
        <halo-button variant="glass" [block]="true">Continue with email</halo-button>
      </div>
    </halo-auth-shell>`,
  }),
  args: { logoSvg: VOLLEYTV_MARK_SVG, clientName: 'Halo' },
};
export default meta;

type Story = StoryObj<AuthShell>;

export const Default: Story = {};
/** The live app configuration — the Volley TV lockup rendered verbatim. */
export const VolleyTv: Story = { args: { logoSvg: '', logoSrc: VOLLEYTV_LOGO_SRC, clientName: VOLLEYTV_NAME } };
export const Wordmark: Story = { args: { logoSvg: '', clientName: 'Volley TV' } };
