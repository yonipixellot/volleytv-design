import type { Meta, StoryObj } from '@storybook/angular';
import { LivePlayerPage } from './live';

const meta: Meta<LivePlayerPage> = {
  title: 'Pages/Watch/Live Player',
  component: LivePlayerPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Full-bleed live viewer — LIVE pill + ticking clock, score, glass controls that auto-hide ' +
          'after 3s idle. ' +
          '\n\nCarries the team names (linked to the team pages) and keeps them in fullscreen, where ' +
          'they move into a top overlay inside the frame and hide with the controls — a caption ' +
          'sitting permanently over a live game is noise (Netflix / YouTube behaviour). ' +
          '\n\n**No "go to the game page" link here**, unlike the VOD player. The game page has no ' +
          'live state (`state` is `final | pregame`, and its own copy reads "Stats come after ' +
          'first serve"), and nothing in the live flow links to it — Home\'s hero and live cards both ' +
          'open this player directly. A link would land the viewer on a pre-game placeholder for a ' +
          'game that is on right now. The ticket scopes the link to full-game / game-highlights.' +
          '\n\nFullscreen is a CSS takeover rather than the Fullscreen API; the reasoning lives on ' +
          '`fs` in vod.ts (no `Element.requestFullscreen` on iPhone, and iOS native video fullscreen ' +
          'would take our chrome off the screen).',
      },
    },
  },
};
export default meta;

export const Default: StoryObj<LivePlayerPage> = {};
