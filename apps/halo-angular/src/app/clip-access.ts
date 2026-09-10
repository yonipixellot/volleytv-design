import { Tier } from './view-context';
import { englishOf } from './i18n/i18n';

/**
 * clipAccess — the tier gate for a reel of the athlete's OWN highlights.
 * Single source of truth so the vertical HighlightPage (per-clip locked slides)
 * and the You → Clips tiles agree on what's locked. Direct port of the proto's
 * `packages/ui/src/screens/home/reelAccess.ts`, in volleyball vocabulary
 * (fork 2026-09-08; the split is flagged for Yuval as F2).
 *
 * Tier split:
 *   • Premium — every highlight; nothing locked.
 *   • Basic   — kills / set assists / aces are watchable; the PREMIUM plays
 *               (digs / blocks — the defensive plays) are locked.
 *   • Free    — own content is fully locked.
 *
 * Play type is derived from the clip TITLE (no real play-type field on the mock
 * feed yet — same heuristic as the proto). [NEED: real play-type field.]
 * Covered by clip-access.spec.ts: renaming a play must not silently move it
 * across the paywall.
 */

/** Premium-only plays — the defensive half of the vocabulary. */
const PREMIUM_PLAYS = new Set(['dig', 'block']);

/** Order matters: `find` takes the first match. Digs and blocks go first so a
 *  "Dig to kill" or "Soft block and put away" is classed by the defensive act
 *  that made it; aces before assists so "Ace to seal the set" is not a set;
 *  kills before assists so "Set-point kill" is a kill. */
const PLAY_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /\bdig|pancake|pursuit|save\b/i, label: 'dig' },
  { re: /block|stuff|roof|joust/i, label: 'block' },
  { re: /\bace\b|serve/i, label: 'ace' },
  { re: /kill|swing|attack|put away|spike|dump|rally|tip\b/i, label: 'kill' },
  { re: /\bset\b|assist|dish|no-?look/i, label: 'set assist' },
];

/** Human play-type label from a clip title, or null when nothing matches. */
export const playOf = (title: string): string | null =>
  PLAY_PATTERNS.find((p) => p.re.test(englishOf(title)))?.label ?? null;

/** Is THIS own-highlight clip locked for the given owner tier? */
export const isClipLocked = (title: string, tier: Tier): boolean => {
  if (tier === 'premium') return false;
  if (tier === 'free') return true; // own content fully gated
  return PREMIUM_PLAYS.has(playOf(title) ?? ''); // basic: premium plays only
};

/** A premium play — earns a gold progress segment regardless of tier. */
export const isPremiumPlay = (title: string): boolean =>
  PREMIUM_PLAYS.has(playOf(title) ?? '');
