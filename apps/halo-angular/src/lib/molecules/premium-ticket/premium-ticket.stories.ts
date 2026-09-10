import type { Meta, StoryObj } from '@storybook/angular';
import { PremiumTicket } from './premium-ticket';

const meta: Meta<PremiumTicket> = {
  title: 'Molecules/Premium Ticket',
  component: PremiumTicket,
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width:330px;padding:24px;background:linear-gradient(160deg,#1c150a,#0b0a08);min-height:280px;display:grid;place-items:center">
        <halo-premium-ticket [title]="title" [meta]="meta" [cta]="cta" [skipLabel]="skipLabel" style="width:100%" />
      </div>
    `,
  }),
  args: { title: 'Block of the night', meta: 'Northside Flames · Set 4 · and 2 more from this match', cta: 'Unlock all 3', skipLabel: '' },
};
export default meta;
type Story = StoryObj<PremiumTicket>;

export const Default: Story = {};
export const WithSkip: Story = { args: { skipLabel: 'Keep watching free' } };
export const AnalyticsGate: Story = { args: { title: 'Offence insights are Premium', meta: 'Hitting %, kill trends & attack mix.', cta: 'Upgrade' } };
