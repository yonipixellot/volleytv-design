/**
 * Player stats — ONE source for the season averages the You tab shows and the
 * single-game box scores the game page shows (2026-08-27).
 *
 * They used to be two unrelated literals, one per page. The game card now
 * states each stat's distance from that player's own average, so the two sets
 * have to come from the same place: otherwise the card could claim "+3.7 on
 * your average" while the You tab showed a different average.
 *
 * Volleyball vocabulary (fork 2026-09-08): PTS = kills + aces + blocks, the
 * three ways a player scores, so the band over the 2×2 is the sum of three of
 * its cells the way it was for the shooting rows. DIG is the fourth cell; set
 * assists live on the team sheet, not here (see flags-for-yuval F1).
 *
 * Prototype seed data. Keyed by ProfileState profile id.
 */

/** The stat codes a box score and the averages share, in display order. */
export const GAME_STATS = ['PTS', 'K', 'ACE', 'BLK', 'DIG'] as const;
export type GameStat = (typeof GAME_STATS)[number];

/** Per-match averages across the season, plus matches played. */
export interface SeasonAverages {
  gp: number;
  avg: Record<GameStat, number>;
}

const AVERAGES: Record<string, SeasonAverages> = {
  self: { gp: 21, avg: { PTS: 13.6, K: 11.2, ACE: 1.4, BLK: 1.0, DIG: 8.1 } },
  maya: { gp: 18, avg: { PTS: 9.8, K: 8.1, ACE: 1.1, BLK: 0.6, DIG: 6.4 } },
  noah: { gp: 14, avg: { PTS: 6.9, K: 5.4, ACE: 0.8, BLK: 0.7, DIG: 4.9 } },
};

/** One player's line from one match. */
export type BoxScore = Record<GameStat, number>;

/** This match's box score per player. The demo match has one line wired. */
const BOX_SCORES: Record<string, BoxScore> = {
  self: { PTS: 17, K: 14, ACE: 2, BLK: 1, DIG: 9 },
  maya: { PTS: 8, K: 6, ACE: 1, BLK: 1, DIG: 7 },
  noah: { PTS: 9, K: 7, ACE: 1, BLK: 1, DIG: 3 },
};

export const averagesFor = (profileId: string): SeasonAverages | null => AVERAGES[profileId] ?? null;
export const boxScoreFor = (profileId: string): BoxScore | null => BOX_SCORES[profileId] ?? null;
