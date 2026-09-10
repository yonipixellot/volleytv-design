import type { Meta, StoryObj } from '@storybook/angular';
import { VodPage } from './vod';

const meta: Meta<VodPage> = {
  title: 'Pages/Watch/VOD Viewer',
  component: VodPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Full-game / recap / highlights playback. Carries the three things the player owes the ' +
          'viewer (ticket 2026-08-28): a **loader** for first paint and for stalls, **team names** ' +
          'that link to the team pages, and a **link to the game page**. ' +
          '\n\n**Fullscreen is a CSS takeover, not the Fullscreen API.** `Element.requestFullscreen` ' +
          'does not exist on iPhone Safari, and the only native fullscreen iOS offers ' +
          '(`video.webkitEnterFullscreen`) hands the screen to Apple\'s player and takes our chrome ' +
          'with it — the team names and game link could not exist inside it. Orientation is CSS too: ' +
          '`screen.orientation.lock()` is Android-only, so portrait rotates the frame with a ' +
          'transform the way mobile web players do. See the note on `fs` in vod.ts.' +
          '\n\nThe team names and the game link have **one placement per mode, never both at once**: ' +
          'the metadata block below the frame inline, a top overlay inside the frame in fullscreen ' +
          '(YouTube moves its title the same way).',
      },
    },
  },
};
export default meta;

export const Default: StoryObj<VodPage> = {};

/** Recap — a SHORT runtime, so the clock and scrubber must not show full-game numbers. */
export const Recap: StoryObj<VodPage> = { args: { kind: 'recap' } };

/** Game highlights — Home's highlights rail lands here too. */
export const Highlights: StoryObj<VodPage> = { args: { kind: 'highlights' } };

/**
 * First paint: nothing buffered yet, so the controls are not offered at all —
 * there is nothing to scrub. Designed state, not wired playback: the prototype
 * frame is an `<img>`, so there are no `waiting` / `canplay` events yet.
 */
export const Loading: StoryObj<VodPage> = { args: { loadingParam: '1' } };

/**
 * Stalled mid-playback. The opposite trade from `Loading`: the controls stay
 * reachable and the scrubber keeps showing the buffered-ahead range, so the
 * spinner reads as "catching up", not as a dead player.
 */
export const Buffering: StoryObj<VodPage> = { args: { bufferingParam: '1' } };

/**
 * Opened FROM the game page (`?from=game`). The game-page link is omitted, not
 * disabled: a link back to the page you just came from is chrome, not
 * navigation. Team names stay linked — those go somewhere else.
 */
export const OpenedFromGamePage: StoryObj<VodPage> = { args: { from: 'game', game: 'g-12may' } };

/** Video not processed yet — the fallback replaces the player entirely. */
export const NotAvailable: StoryObj<VodPage> = { args: { missing: true } };
