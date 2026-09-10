import { t } from './i18n/i18n';
/** One teammate moment — `action` doubles as the reel caption, the grid tile
 *  label and the `clip-access` gating key (same contract as ReelMoment). */
export interface TeammateClip {
  action: string;
  /** Play type surfaced on Basic (K / ACE / BLK / DIG / AST). */
  type: string;
  duration: string;
  thumb: string;
}

export interface TeammateReel {
  id: string;
  name: string;
  jersey: number;
  clips: TeammateClip[];
}

/**
 * Teammate reels — the OTHER players' highlights, read by both the game's
 * Highlights › Teammates grid and the vertical reel player, so a tile and the
 * reel it opens always describe the same person (2026-08-26). Same
 * shared-store reasoning as ReelStore, which covers the viewer's own reel.
 *
 * Names + jerseys match game.ts's `homeRoster`, so the Teammates grid, the reel
 * player and the player-stats table can't disagree about who is on the team.
 *
 * These are NOT downloadable: download is own-content only, so the reel player
 * hides that control whenever it's showing one of these (see highlight.ts).
 */
export const TEAMMATE_REELS: TeammateReel[] = [
  { id: 'cole', name: 'Aiden Cole', jersey: 12, clips: [{ action: t('play.noLookSet'), type: 'AST', duration: '0:18', thumb: 'img/clip-1.webp' }] },
  { id: 'lee', name: 'Marcus Lee', jersey: 23, clips: [{ action: t('play.crossCourtKill'), type: 'K', duration: '0:12', thumb: 'img/clip-2.webp' }] },
  { id: 'cross', name: 'Dylan Cross', jersey: 4, clips: [{ action: t('play.stuffBlock'), type: 'BLK', duration: '0:15', thumb: 'img/clip-3.webp' }] },
  { id: 'pratt', name: 'Owen Pratt', jersey: 9, clips: [{ action: t('play.jumpServeAce'), type: 'ACE', duration: '0:20', thumb: 'img/clip-4.webp' }] },
];

export const teammateReelById = (id: string): TeammateReel | undefined =>
  TEAMMATE_REELS.find((r) => r.id === id);
