import type { Meta, StoryObj } from '@storybook/angular';
import { LadderCard } from './ladder-card';
const meta: Meta<LadderCard> = {
  title: 'Organisms/Ladder card',
  component: LadderCard,
  render: (a) => ({ props: a, template: `<div style="padding:16px 0"><halo-ladder-card [chipTone]="chipTone" [chipText]="chipText" [round]="round" [teams]="teams" [footMeta]="footMeta" [footCta]="footCta" /></div>` }),
};
export default meta;
type Story = StoryObj<LadderCard>;
export const Live: Story = { args: { chipTone: 'live', chipText: 'Live · Set 2 · 18–15', round: 'Round 9', teams: [{ name: 'Netsetters 1', crest: 'img/logo-netsetters.svg', score: 3, win: true }, { name: 'Bayside Breakers', crest: 'img/logo-breakers.svg', score: 1, lo: true }], footMeta: 'Rowland Cowan · Court 2', footCta: 'Watch live' } };
export const Final: Story = { args: { chipTone: 'fin', chipText: 'Final · Round 8', round: 'Sat 3 May', teams: [{ name: 'Bayside Breakers', crest: 'img/logo-breakers.svg', score: 3, win: true }, { name: 'Northside Flames', crest: 'img/team-northside-flames.svg', score: 1, lo: true }], footMeta: 'DC Stadium', footCta: 'Watch replay' } };
export const Upcoming: Story = { args: { chipTone: 'up', chipText: 'First serve', round: 'Today · 13:58 · Rowland Cowan', teams: [{ name: 'Netsetters 1', crest: 'img/logo-netsetters.svg', score: null }, { name: 'Spike City', crest: 'img/logo-spikecity.svg', score: null }] } };


/** Yoni exploration: 3 alternatives to the footer "Watch live ›" row. */
export const CtaOptions: StoryObj<LadderCard> = {
  render: () => ({
    props: {
      live: [
        { name: 'Netsetters 1', mono: 'NS', score: 3, win: true },
        { name: 'Bayside Breakers', mono: 'BB', score: 1, lo: true },
      ],
      fin: [
        { name: 'Spike City', mono: 'SC', score: 1, lo: true },
        { name: 'Northside Flames', mono: 'NF', score: 3, win: true },
      ],
    },
    template: `
      <div style="display:grid;gap:24px;max-width:390px">
        <div>
          <p style="font:700 11px Inter;letter-spacing:.1em;color:var(--ink3);margin:0 0 8px;text-transform:uppercase">A · Full-width pill</p>
          <halo-ladder-card chipTone="live" chipText="Live · Set 2 · 18–15" round="Round 9" [teams]="live" footMeta="" footCta="Watch live" ctaStyle="block" />
          <div style="height:10px"></div>
          <halo-ladder-card chipTone="fin" chipText="Final · Round 9" round="" [teams]="fin" footMeta="Earlier today" footCta="Watch replay" ctaStyle="block" />
        </div>
        <div>
          <p style="font:700 11px Inter;letter-spacing:.1em;color:var(--ink3);margin:0 0 8px;text-transform:uppercase">B · Chip in the status row</p>
          <halo-ladder-card chipTone="live" chipText="Live · Set 2 · 18–15" round="" [teams]="live" footMeta="" footCta="Watch live" ctaStyle="chip" />
          <div style="height:10px"></div>
          <halo-ladder-card chipTone="fin" chipText="Final · Round 9" round="" [teams]="fin" footMeta="" footCta="Replay" ctaStyle="chip" />
        </div>
        <div>
          <p style="font:700 11px Inter;letter-spacing:.1em;color:var(--ink3);margin:0 0 8px;text-transform:uppercase">C · Floating play disc</p>
          <halo-ladder-card chipTone="live" chipText="Live · Set 2 · 18–15" round="Round 9" [teams]="live" footMeta="" footCta="Watch live" ctaStyle="disc" />
          <div style="height:10px"></div>
          <halo-ladder-card chipTone="fin" chipText="Final · Round 9" round="" [teams]="fin" footMeta="Earlier today" footCta="Watch replay" ctaStyle="disc" />
        </div>
      </div>
    `,
  }),
};
