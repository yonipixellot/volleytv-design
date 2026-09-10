import type { Meta, StoryObj } from '@storybook/angular';
import { SettingsPanel } from './settings-panel';

const meta: Meta<SettingsPanel> = {
  title: 'Organisms/Settings panel',
  component: SettingsPanel,
  args: {
    name: 'Tal Weiss', sub: 'Player · #7 · Netsetters 1',
    personaLabel: 'Athlete', planLabel: 'All-Access · monthly', language: 'English', isCoach: false,
  },
  parameters: {
    docs: {
      description: {
        component:
          'Account & settings, in the two shapes it takes. `page` is the phone screen ' +
          'reached from the header avatar; `popover` is the same rows hanging off that ' +
          'avatar from the tablet band up, where routing a whole screen away to flip one ' +
          'toggle throws out the page the user was on.\n\n' +
          'One organism, not two components: the rows, their grouping and their ' +
          'entitlement gating are exactly the thing that must never differ between the ' +
          'two, and a second component is a second place to forget a setting.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<SettingsPanel>;

export const Default: Story = {};
export const Coach: Story = { args: { isCoach: true, sub: 'Coach · Netsetters', personaLabel: 'Coach' } };

/** The header popover. The surface, the edge and the scroll cap belong to
 *  halo-app-header, so here it renders on the story canvas without them. */
export const Popover: Story = {
  args: { variant: 'popover' },
  render: (args) => ({
    props: args,
    template: `
      <div style="width:340px;background:var(--card);border:1px solid var(--hair);border-radius:var(--r-card);overflow:hidden">
        <halo-settings-panel variant="popover" [name]="name" [sub]="sub" [personaLabel]="personaLabel"
          [planLabel]="planLabel" [language]="language" [isCoach]="isCoach" [theme]="theme" />
      </div>`,
  }),
};
