import type { Meta, StoryObj } from '@storybook/angular';
import { UpcomingRow } from './upcoming-row';

const meta: Meta<UpcomingRow> = {
  title: 'Organisms/Upcoming row',
  component: UpcomingRow,
  args: {
    day: 'Sat 17', time: '18:30',
    home: { name: 'Netsetters 1', crest: 'img/logo-netsetters.svg' },
    away: { name: 'Vikings Grey', mono: 'VG' },
  },
  render: (args) => ({ props: args, template: `<div style="padding:24px 0"><halo-upcoming-row [day]="day" [time]="time" [home]="home" [away]="away" /></div>` }),
};
export default meta;

export const Default: StoryObj<UpcomingRow> = {};
