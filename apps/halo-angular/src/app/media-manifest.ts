/**
 * MEDIA MANIFEST — the one place that knows which real footage backs a frame.
 *
 * The prototype was poster-only until 2026-09-09: every player frame was an
 * `<img>` and playback was a designed STATE, not a video element (see the long
 * note on the loader in `pages/watch/vod/vod.ts`). Real demo footage arrived,
 * so the two players now carry a `<video>` — and this file is what keeps that
 * from leaking into content data.
 *
 * Nothing here changes what the app SAYS. A moment is still identified by its
 * poster (`img/clip-4.webp`) everywhere else in the app — ReelStore,
 * `teammate-reels.ts`, the game page's clip grid all keep their `thumb` — and
 * this maps that identity onto a file. Adding footage means dropping files in
 * `public/media` and moving a number here, never editing a reel.
 *
 * The files are tracked in git since 2026-09-10 (licensed client footage): the
 * footage is a third-party school-match broadcast. Regenerate them from the
 * masters with `tools/prepare-media.sh`.
 */

/** Horizontal match footage, keyed by the VOD player's `kind`. `full-match.mp4`
 *  was dropped from the project (project-size cleanup, 2026-09-10): `full` now
 *  reuses the live player's file rather than carrying a second full-length
 *  master, which is the same "one file, two kinds" reasoning `recap` already
 *  used against `highlights.mp4`. */
const GAME_VIDEO: Record<string, string> = {
  full: 'media/live/1min_womens.mp4',
  // A recap IS a cut-down of the game, so it plays the highlights reel rather
  // than the full match. One file, two kinds.
  recap: 'media/game/highlights.mp4',
  highlights: 'media/game/highlights.mp4',
};

/**
 * How many vertical clips sit in `public/media/reel`. The app has twenty clip
 * posters (`clip-1.webp` … `clip-20.webp`) and the demo set is one player's
 * nine, so the mapping WRAPS: poster 10 plays clip 1 again. A repeat is the
 * honest failure here — the alternative was leaving half the reel as a still
 * while the other half moved, which reads as broken rather than as a demo.
 *
 * Raise this when more clips are transcoded in; `prepare-media.sh` writes them
 * in the same `clip-N.mp4` sequence, so nothing else has to change.
 */
const REEL_CLIP_COUNT = 9;

/** Full-game / recap / highlights footage for the horizontal player. */
export const gameVideo = (kind: string | undefined): string =>
  GAME_VIDEO[kind ?? 'full'] ?? GAME_VIDEO['full'];

/** Live-player footage. Every "Watch live" entry point (Home's live rail,
 *  the Live-now lane, a team/games ladder chip, the "team is live"
 *  notification) lands on the one live player, so one file backs all of
 *  them the same way this file also backs the VOD player's `full` kind
 *  above. */
export const LIVE_VIDEO = 'media/live/1min_womens.mp4';

/**
 * The vertical clip behind a moment's poster. Takes the `thumb` a moment
 * already carries and returns the footage for it, or '' when the poster is not
 * one of the numbered clips (a caller-supplied `?thumb=` on a single clip, say)
 * — the players fall back to the poster `<img>` on an empty string, which is
 * exactly how they behaved before any of this existed.
 */
export const reelVideo = (thumb: string): string => {
  const n = /clip-(\d+)\.webp$/.exec(thumb ?? '');
  if (!n) return '';
  const i = ((parseInt(n[1], 10) - 1) % REEL_CLIP_COUNT) + 1;
  return `media/reel/clip-${i}.mp4`;
};
