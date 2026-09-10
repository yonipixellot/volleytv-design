import type { Meta, StoryObj } from '@storybook/angular';
import { DateRangePicker } from './date-range-picker';

/** A fortnight of games with gaps in it, so the disabled days are visible as
 *  disabled rather than the whole month reading as pickable. */
const DAYS = [
  '2026-05-03', '2026-05-04', '2026-05-05', '2026-05-06', '2026-05-07',
  '2026-05-08', '2026-05-09', '2026-05-10', '2026-05-11', '2026-05-12',
];
const PRESETS = [
  { value: 'all', label: 'All dates' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'season', label: 'This season' },
];

/**
 * The date filter's panel. It ships inside `halo-event-filter-bar`'s anchored
 * menu (a category with a `date` config), so these stories show it on its own
 * only to make its two views reviewable.
 *
 * Presets first, calendar second, and no pickable day without a game behind it.
 * The reasoning is on the component.
 */
const meta: Meta<DateRangePicker> = {
  title: 'Molecules/DateRangePicker',
  component: DateRangePicker,
  args: { presets: PRESETS, days: DAYS, anchor: '2026-05-12', value: 'all' },
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<DateRangePicker>;

/** How the panel opens when the filter is off or on a named span. */
export const Presets: Story = {};

/** A preset that is not the default, so the radio sits away from the top. */
export const PresetChosen: Story = { args: { value: '30d' } };

/** A stored range opens straight into the calendar, on its own month, with both
 *  ends marked and the days between them banded. */
export const RangeChosen: Story = { args: { value: '2026-05-05..2026-05-09' } };

/** A range of one day — what picking the same day twice produces. */
export const SingleDay: Story = { args: { value: '2026-05-07..2026-05-07' } };

/** Two months of content, so the header's arrows are live and the archive can
 *  be walked. The single-month lane seed leaves them both disabled, which hides
 *  half of what the header does. */
export const AcrossMonths: Story = {
  args: {
    days: ['2026-04-25', '2026-04-26', '2026-04-28', ...DAYS],
    anchor: '2026-05-12',
    value: '2026-04-26..2026-05-05',
  },
};
