import type { Meta, StoryObj } from '@storybook/angular';
import { signal } from '@angular/core';
import { EventFilterBar, FilterBarCategory } from './event-filter-bar';

const SHORT = [
  { key: 'state', label: 'Region', options: ['NTH', 'STH', 'EST', 'MET'] },
  { key: 'org', label: 'Organisation', options: ['Volleyball East', 'Volleyball Metro', 'Volleyball South'] },
  { key: 'league', label: 'League', options: ['State League Div 1', 'State League Div 2', 'Junior League'] },
];

/** Home and Events carry this: five categories, and Team runs to dozens. */
const LONG = [
  ...SHORT,
  { key: 'comp', label: 'Comp', options: ['2026 Winter', '2026 Summer', '2025 Winter', '2025 Summer'] },
  {
    key: 'team',
    label: 'Team',
    options: [
      'Bayside Breakers', 'Brisbane Capitals', 'Canberra Gunners', 'Dandenong Rangers',
      'Harbour Blues', 'Geelong Supercats', 'Netsetters 1', 'Netsetters 2',
      'Hustle HQ', 'Kilsyth Kestrels', 'Mediums', 'Melbourne Tigers',
      'Northside Flames', 'Nunawading Spectres', 'Spike City', 'Southern Districts',
      'Sturt Sabres', 'Torres Strait', 'Vikings Grey', 'Waverley Falcons',
    ],
  },
];

/** The bar is stateful in use: the pills ARE the filter state, so the stories
 *  hold the selection the way a page does rather than faking a static shot. */
function live(categories: FilterBarCategory[]) {
  const selected = signal<Record<string, string[]>>(
    Object.fromEntries(categories.map((c) => [c.key, []])),
  );
  return {
    props: {
      categories,
      selected,
      onToggle: (e: { cat: string; value: string }) => {
        const f = { ...selected() };
        f[e.cat] = f[e.cat].includes(e.value) ? f[e.cat].filter((v) => v !== e.value) : [...f[e.cat], e.value];
        selected.set(f);
      },
      onClear: () => selected.set(Object.fromEntries(categories.map((c) => [c.key, []]))),
    },
    template: `
      <div style="padding:8px 0 320px">
        <halo-event-filter-bar [categories]="categories" [selected]="selected()"
          (toggleOption)="onToggle($event)" (clear)="onClear()" />
      </div>`,
  };
}

const meta: Meta<EventFilterBar> = {
  title: 'Organisms/Event filter bar',
  component: EventFilterBar,
  parameters: {
    docs: {
      description: {
        component:
          'Multi-select filter row. Each category is a pill sized to its label; the pill shows the ' +
          'category when empty, the value when one is picked, and "Category · N" for several. Opening ' +
          'a pill anchors a menu with a find field above the options: typing narrows the list, Enter ' +
          'takes the first match, Escape clears the query and then closes the menu. There is no Apply ' +
          'step. Clearing is a link, not a button (see the Clear-a-filter rule in DESIGN.md).',
      },
    },
  },
};
export default meta;
type Story = StoryObj<EventFilterBar>;

/** Three short categories, as onboarding and Following use it. */
export const Default: Story = { render: () => live(SHORT) };

/** Five categories with a long Team list — the case the find field is for. Also
 *  the case for the menu's edge clamp: the last pill's menu is measured on open
 *  and nudged back inside the viewport. */
export const LongLists: Story = { render: () => live(LONG) };

/** You's clip filters: many-of Game beside one-of Date. A `single` category is a
 *  radio list that replaces rather than accumulates and closes on the pick, and
 *  its `defaultValue` ("All time") is ticked without counting as a filter. */
export const SingleSelect: Story = {
  render: () => live([
    {
      key: 'game', label: 'Game',
      options: [
        { value: 'g1', label: 'vs Vikings Growlers' },
        { value: 'g2', label: 'vs Hustle HQ' },
        { value: 'g3', label: 'vs Chump Centrals' },
      ],
    },
    {
      key: 'date', label: 'Date', single: true, defaultValue: 'all',
      options: [
        { value: 'all', label: 'All time' },
        { value: 'season', label: 'This season' },
        { value: '30d', label: 'Last 30 days' },
      ],
    },
  ]),
};
