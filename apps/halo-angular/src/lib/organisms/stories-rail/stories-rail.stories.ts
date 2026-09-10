import type { Meta, StoryObj } from '@storybook/angular';
import { StoriesRail, StoryItem, orderStories } from './stories-rail';

// Two paint rules, keyed off `kind`: a person is their number on the brand
// fill, a team is its logo or — with no logo file — its initials on the
// neutral plate. `newestAt` is the recency of that circle's newest content.
const raw: StoryItem[] = [
  { label: 'You', number: '7', kind: 'you', active: true, newestAt: 60 },
  { label: 'Maya', number: '12', kind: 'kid', unseen: true, newestAt: 88 },
  { label: 'Netsetters', kind: 'team', unseen: true, newestAt: 95 },
  { label: 'Breakers', logo: 'img/logo-breakers.svg', kind: 'team', unseen: true, newestAt: 80 },
  { label: 'Flames', logo: 'img/team-northside-flames.svg', kind: 'team', newestAt: 40 },
  { label: 'Northside Flames', kind: 'team', newestAt: 12 },
];

const meta: Meta<StoriesRail> = {
  title: 'Organisms/Stories rail',
  component: StoriesRail,
  args: { items: orderStories(raw), showAdd: true },
  parameters: {
    docs: {
      description: {
        component:
          'Followed people and teams, newest content first. **Order:** the viewer\'s own circle is ' +
          'pinned first, then every other circle with unseen content newest-first, then the ' +
          'already-seen ones newest-first, then the "Follow more" circle. **No max** — the rail ' +
          'scrolls. Ordering lives in the exported `orderStories()` helper, not in the component, ' +
          'so a host can order differently; see its doc comment for the two decisions that look ' +
          'like bugs (dependents are not pinned, and there are deliberately no relationship captions).',
      },
    },
  },
};
export default meta;

/** The full rail: own circle pinned, then newest-first, then "Follow more". */
export const Default: StoryObj<StoriesRail> = {};

/**
 * The ordering contract, made visible. The `raw` array below is deliberately in
 * a "wrong" order; `orderStories()` produces what you see. Note that **Maya
 * (a dependent) outranks the athlete's own team** because she has newer content:
 * kids compete on recency like anything else (2026-08-28).
 */
export const Ordering: StoryObj<StoriesRail> = {
  render: () => ({
    props: { items: orderStories(raw), showAdd: true },
    template: `
      <div style="padding:12px 0">
        <halo-stories-rail [items]="items" [showAdd]="showAdd" />
        <ol style="margin:12px 24px;padding-left:20px;font-family:var(--body);font-size:12px;color:var(--ink3);line-height:1.7">
          <li><b>You</b> — pinned, regardless of recency</li>
          <li><b>Unseen, newest first</b> — Netsetters (95), Maya (88), Breakers (80)</li>
          <li><b>Seen, newest first</b> — Flames (40), Northside Flames (12)</li>
          <li><b>Follow more</b> — always last</li>
        </ol>
      </div>
    `,
  }),
};

/**
 * A brand-new account follows nobody, so the "Follow more" circle is the only
 * one in the rail and doubles as the empty state. This is what answers "how does
 * someone who has never used Halo know what this rail is for".
 */
export const FirstRun: StoryObj<StoriesRail> = {
  args: { items: [], showAdd: true },
};

/**
 * With `showAdd` off and nothing followed the rail renders nothing at all, and
 * the PAGE owns the empty state (see Molecules/Empty State). Kept because hosts
 * other than Home reuse the rail without the add affordance.
 */
export const EmptyWithoutAdd: StoryObj<StoriesRail> = {
  args: { items: [], showAdd: false },
};

/** Fan or coach: no own circle to pin, so the rail is purely newest-first. */
export const NoOwnCircle: StoryObj<StoriesRail> = {
  args: { items: orderStories(raw.filter((s) => s.kind !== 'you')), showAdd: true },
};
