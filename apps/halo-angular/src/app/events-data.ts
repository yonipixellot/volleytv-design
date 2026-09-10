import { StateCode } from './federation-state';
import { LiveSide } from '../lib/organisms/live-game-card/live-game-card';
import { UpcomingSide } from '../lib/organisms/upcoming-row/upcoming-row';
import { t, fmtShortDay, fmtDayNum } from './i18n/i18n';

/**
 * events-data — the seed catalogue behind Home's rails AND the per-rail
 * "See all" lane pages (/events/:lane), extracted from HomePage so both
 * surfaces render the same events (wireframe-PT WatchLaneAll parity).
 */

export interface LiveGame { home: LiveSide; away: LiveSide; meta: string; st?: StateCode; teams?: string[]; }
export interface RailItem { title: string; sub: string; thumb: string; date?: string; score?: string; duration?: string; st?: StateCode; teams?: string[]; }
export interface Fixture { day: string; time: string; home: UpcomingSide; away: UpcomingSide; st?: StateCode; teams?: string[]; }

/** The seed carries dates as display labels ("Sun 12 May"), which is what the
 *  cards show. A calendar filter needs a real day, so this parses the label
 *  rather than a second date field being added beside every item and then
 *  drifting from the one on screen. The year is a constant because the seed is
 *  a single 2026 season; a real feed would carry the day itself. */
/**
 * External content — the operator's OWN uploads, not game-pipeline footage.
 * Open to every persona and NEVER narrowed by the Events filters: it is not
 * scoped to a team, a league or a state, so the filter dimensions have nothing
 * to match. Lives here rather than on Home because the "See all" lane renders
 * the same list (Maryna 2026-09-02).
 */
/** The heading over the external rail AND over its See all page. One string,
 *  because the two are the same section and a reader who taps See all should
 *  land on the title they tapped (Maryna 2026-09-03). Names the body that
 *  supplies the videos, not the format: "More videos" describes any rail on
 *  the page, and the point of this one is where it came from. */
export const EXTERNAL_TITLE = t('home.moreFrom', { org: 'Volley TV' });

export const EXTERNAL_CONTENT: RailItem[] = [
  { title: t('ext.stateFinals'), sub: 'Metro Volleyball League', duration: '8:24', thumb: 'img/game-1.webp' },
  { title: t('ext.coachingClinic'), sub: 'Volley TV Academy', duration: '12:05', thumb: 'img/game-2.webp' },
  { title: t('ext.meetNational'), sub: 'Volley TV', duration: '5:47', thumb: 'img/game-3.webp' },
  { title: t('ext.refSignals'), sub: 'Volley TV', duration: '6:12', thumb: 'img/game-4.webp' },
  { title: t('ext.juniorPathways'), sub: 'Metro Volleyball League', duration: '9:38', thumb: 'img/game-5.webp' },
  { title: t('ext.servingDrills'), sub: 'Volley TV Academy', duration: '14:20', thumb: 'img/game-6.webp' },
];

export const SEED_YEAR = 2026;
const MONTH3 = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
export function isoOfLabel(label?: string): string | null {
  const m = /(\d{1,2})\s+([A-Za-z]{3})/.exec(label ?? '');
  if (!m) return null;
  const mi = MONTH3.indexOf(m[2].toLowerCase());
  if (mi < 0) return null;
  return `${SEED_YEAR}-${String(mi + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}

/** Filter categories (proto EventFilterBar ontology minus State, which the
    federation switcher owns). Team is also driven by the quick tabs. */
/** `state` is the federation scope (was a header switcher until 2026-08-27 —
    now just another Events filter on Home, since it only ever narrowed this
    feed). It reads `st` on the item rather than the team ontology. */
export type FilterCat = 'state' | 'organization' | 'league' | 'competition' | 'team';
/** `grade` stays on the team as data (rosters and profiles show it) but is no
    longer a filter dimension — dropped from the Events bar 2026-08-27. */
export interface TeamAttrs { organization: string; league: string; competition: string; grade: string; }

/** Team → its club / league / competition / age-group. Drives both the filter
    option lists and each event's filterable attributes (an event's attrs are
    the union across its teams). */
export const TEAMS: Record<string, TeamAttrs> = {
  'Netsetters 1':     { organization: 'Netsetters VC', league: t('league.metro'),   competition: t('comp.mondayMen14'), grade: t('grade.open') },
  'Bayside Breakers':  { organization: 'Bayside VC',   league: t('league.country'), competition: t('comp.tuesdayB3Men'),              grade: t('grade.openA1') },
  'Northside Flames':  { organization: 'Northside VC',   league: t('comp.tuesdayB2Women'), competition: t('comp.tuesdayB2Women'),         grade: t('grade.openB3') },
  'Harbour Blues': { organization: 'Harbour VC', league: t('league.metro'),   competition: t('comp.mondayMen14'), grade: t('grade.open') },
  'Spike City':       { organization: 'Spike City VC',      league: t('league.metro'),   competition: t('comp.mondayMen14'), grade: t('grade.open') },
  'Vikings Grey':    { organization: 'Vikings VC',   league: t('league.metro'),   competition: t('comp.mondayMen14'), grade: t('grade.open') },
  'Hustle HQ':       { organization: 'Hustle VC',    league: t('league.country'), competition: t('comp.tuesdayB3Men'),              grade: t('grade.openA1') },
  'Torres':          { organization: 'Torres VC',    league: t('league.metro'),   competition: t('comp.mondayMen14'), grade: t('grade.open') },
  'Medium Fund.':    { organization: 'Medium VC',    league: t('league.metro'),   competition: t('comp.mondayMen14'), grade: t('grade.open') },
};

/** ~10 games per rail so the carousels + "See all" lanes read as real
    (Yuval 2026-08-24). Live cards carry the CURRENT SET's rally score (LiveSide.score)
    with the set named in the meta line; finished matches show sets won. */
export const LIVE_GAMES: LiveGame[] = [
  { home: { name: 'Bayside', crest: 'img/logo-breakers.svg', score: 21 }, away: { name: 'Northside', crest: 'img/team-northside-flames.svg', score: 19 }, meta: `${t('comp.mondayMen14')} · ${t('grade.open')} · ${t('games.setN', { n: 2 })}`, st: 'MET', teams: ['Bayside Breakers', 'Northside Flames'] },
  { home: { name: 'Netsetters', crest: 'img/logo-netsetters.svg', score: 24 }, away: { name: 'Spike City', crest: 'img/logo-spikecity.svg', score: 22 }, meta: `${t('comp.mondayMen14')} · ${t('grade.open')} · ${t('games.setN', { n: 3 })}`, st: 'MET', teams: ['Netsetters 1', 'Spike City'] },
  { home: { name: 'Netsetters', crest: 'img/logo-netsetters.svg', score: 24 }, away: { name: 'Vikings', mono: 'VG', score: 20, crest: 'img/team-vikings-grey.svg' }, meta: `${t('comp.mondayMen14')} · ${t('grade.open')} · ${t('games.setN', { n: 3 })}`, st: 'MET', teams: ['Netsetters 1', 'Vikings Grey'] },
  { home: { name: 'Hustle HQ', mono: 'HH', score: 14, crest: 'img/team-hustle-hq.svg' }, away: { name: 'Harbour', crest: 'img/logo-blues.svg', score: 12 }, meta: `${t('comp.tuesdayB3Men')} · ${t('grade.openA1')} · ${t('games.setN', { n: 4 })}`, st: 'NTH', teams: ['Hustle HQ', 'Harbour Blues'] },
  { home: { name: 'Torres', mono: 'TS', score: 18, crest: 'img/team-torres.svg' }, away: { name: 'Medium Fund.', mono: 'MF', score: 22, crest: 'img/team-medium-fund.svg' }, meta: `${t('comp.mondayMen14')} · ${t('grade.open')} · ${t('games.setN', { n: 1 })}`, st: 'MET', teams: ['Torres', 'Medium Fund.'] },
  { home: { name: 'Northside', crest: 'img/team-northside-flames.svg', score: 23 }, away: { name: 'Harbour', crest: 'img/logo-blues.svg', score: 21 }, meta: `${t('comp.tuesdayB2Women')} · ${t('grade.openB3')} · ${t('games.setN', { n: 5 })}`, st: 'STH', teams: ['Northside Flames', 'Harbour Blues'] },
  { home: { name: 'Bayside', crest: 'img/logo-breakers.svg', score: 9 }, away: { name: 'Hustle HQ', mono: 'HH', score: 13, crest: 'img/team-hustle-hq.svg' }, meta: `${t('comp.tuesdayB3Men')} · ${t('grade.openA1')} · ${t('games.setN', { n: 2 })}`, st: 'NTH', teams: ['Bayside Breakers', 'Hustle HQ'] },
  { home: { name: 'Vikings', mono: 'VG', score: 16, crest: 'img/team-vikings-grey.svg' }, away: { name: 'Spike City', crest: 'img/logo-spikecity.svg', score: 14 }, meta: `${t('comp.mondayMen14')} · ${t('grade.open')} · ${t('games.setN', { n: 3 })}`, st: 'EST', teams: ['Vikings Grey', 'Spike City'] },
  { home: { name: 'Netsetters', crest: 'img/logo-netsetters.svg', score: 12 }, away: { name: 'Torres', mono: 'TS', score: 9, crest: 'img/team-torres.svg' }, meta: `${t('comp.mondayMen14')} · ${t('grade.open')} · ${t('games.setN', { n: 1 })}`, st: 'MET', teams: ['Netsetters 1', 'Torres'] },
  { home: { name: 'Harbour', crest: 'img/logo-blues.svg', score: 19 }, away: { name: 'Medium Fund.', mono: 'MF', score: 17, crest: 'img/team-medium-fund.svg' }, meta: `${t('comp.mondayMen14')} · ${t('grade.open')} · ${t('games.setN', { n: 4 })}`, st: 'WST', teams: ['Harbour Blues', 'Medium Fund.'] },
];

export const FULL_GAMES: RailItem[] = [
  { date: fmtShortDay(new Date(2026, 4, 12)), title: 'Netsetters · Vikings', score: '3–1', sub: `${t('comp.mondayMen14')} · ${t('kind.fullGame')}`, duration: '1:42:10', thumb: 'img/game-7.webp', st: 'MET', teams: ['Netsetters 1', 'Vikings Grey'] },
  { date: fmtShortDay(new Date(2026, 4, 11)), title: 'Bayside · Northside', score: '3–2', sub: `${t('comp.tuesdayB3Men')} · ${t('kind.fullGame')}`, duration: '1:38:52', thumb: 'img/game-8.webp', st: 'STH', teams: ['Bayside Breakers', 'Northside Flames'] },
  { date: fmtShortDay(new Date(2026, 4, 10)), title: 'Hustle HQ · Harbour', score: '1–3', sub: `${t('comp.tuesdayB3Men')} · ${t('kind.fullGame')}`, duration: '1:45:03', thumb: 'img/game-9.webp', st: 'NTH', teams: ['Hustle HQ', 'Harbour Blues'] },
  { date: fmtShortDay(new Date(2026, 4, 9)), title: 'Torres · Medium Fund.', score: '3–0', sub: `${t('comp.mondayMen14')} · ${t('kind.fullGame')}`, duration: '1:39:20', thumb: 'img/game-10.webp', st: 'MET', teams: ['Torres', 'Medium Fund.'] },
  { date: fmtShortDay(new Date(2026, 4, 8)), title: 'Spike City · Netsetters', score: '0–3', sub: `${t('comp.mondayMen14')} · ${t('kind.fullGame')}`, duration: '1:41:07', thumb: 'img/game-1.webp', st: 'EST', teams: ['Spike City', 'Netsetters 1'] },
  { date: fmtShortDay(new Date(2026, 4, 7)), title: 'Northside · Harbour', score: '3–1', sub: `${t('comp.tuesdayB2Women')} · ${t('kind.fullGame')}`, duration: '1:44:15', thumb: 'img/game-2.webp', st: 'STH', teams: ['Northside Flames', 'Harbour Blues'] },
  { date: fmtShortDay(new Date(2026, 4, 6)), title: 'Vikings · Torres', score: '2–3', sub: `${t('comp.mondayMen14')} · ${t('kind.fullGame')}`, duration: '1:37:48', thumb: 'img/game-3.webp', st: 'MET', teams: ['Vikings Grey', 'Torres'] },
  { date: fmtShortDay(new Date(2026, 4, 5)), title: 'Bayside · Hustle HQ', score: '3–1', sub: `${t('comp.tuesdayB3Men')} · ${t('kind.fullGame')}`, duration: '1:40:33', thumb: 'img/game-4.webp', st: 'NTH', teams: ['Bayside Breakers', 'Hustle HQ'] },
  { date: fmtShortDay(new Date(2026, 4, 4)), title: 'Netsetters · Harbour', score: '3–2', sub: `${t('comp.mondayMen14')} · ${t('kind.fullGame')}`, duration: '1:43:26', thumb: 'img/game-5.webp', st: 'MET', teams: ['Netsetters 1', 'Harbour Blues'] },
  { date: fmtShortDay(new Date(2026, 4, 3)), title: 'Medium Fund. · Spike City', score: '1–3', sub: `${t('comp.mondayMen14')} · ${t('kind.fullGame')}`, duration: '1:38:11', thumb: 'img/game-6.webp', st: 'WST', teams: ['Medium Fund.', 'Spike City'] },
];

/** Game-highlight videos are described exactly like the full game they cut
    from — teams + score + date, no per-play subtitle (Yuval 2026-08-23). */
export const GAME_HIGHLIGHTS: RailItem[] = [
  { date: fmtShortDay(new Date(2026, 4, 12)), title: 'Netsetters · Vikings', score: '3–1', sub: `${t('comp.mondayMen14')} · ${t('home.gameHighlights')}`, duration: '2:10', thumb: 'img/hl-1.webp', st: 'MET', teams: ['Netsetters 1', 'Vikings Grey'] },
  { date: fmtShortDay(new Date(2026, 4, 11)), title: 'Bayside · Northside', score: '3–2', sub: `${t('comp.tuesdayB3Men')} · ${t('home.gameHighlights')}`, duration: '1:44', thumb: 'img/hl-2.webp', st: 'STH', teams: ['Bayside Breakers', 'Northside Flames'] },
  { date: fmtShortDay(new Date(2026, 4, 10)), title: 'Hustle HQ · Harbour', score: '1–3', sub: `${t('comp.tuesdayB3Men')} · ${t('home.gameHighlights')}`, duration: '1:36', thumb: 'img/hl-3.webp', st: 'NTH', teams: ['Hustle HQ', 'Harbour Blues'] },
  { date: fmtShortDay(new Date(2026, 4, 9)), title: 'Torres · Medium Fund.', score: '3–0', sub: `${t('comp.mondayMen14')} · ${t('home.gameHighlights')}`, duration: '1:52', thumb: 'img/hl-4.webp', st: 'MET', teams: ['Torres', 'Medium Fund.'] },
  { date: fmtShortDay(new Date(2026, 4, 8)), title: 'Spike City · Netsetters', score: '0–3', sub: `${t('comp.mondayMen14')} · ${t('home.gameHighlights')}`, duration: '2:03', thumb: 'img/hl-5.webp', st: 'EST', teams: ['Spike City', 'Netsetters 1'] },
  { date: fmtShortDay(new Date(2026, 4, 7)), title: 'Northside · Harbour', score: '3–1', sub: `${t('comp.tuesdayB2Women')} · ${t('home.gameHighlights')}`, duration: '1:48', thumb: 'img/hl-6.webp', st: 'STH', teams: ['Northside Flames', 'Harbour Blues'] },
  { date: fmtShortDay(new Date(2026, 4, 6)), title: 'Vikings · Torres', score: '2–3', sub: `${t('comp.mondayMen14')} · ${t('home.gameHighlights')}`, duration: '1:39', thumb: 'img/hl-7.webp', st: 'MET', teams: ['Vikings Grey', 'Torres'] },
  { date: fmtShortDay(new Date(2026, 4, 5)), title: 'Bayside · Hustle HQ', score: '3–1', sub: `${t('comp.tuesdayB3Men')} · ${t('home.gameHighlights')}`, duration: '2:15', thumb: 'img/hl-8.webp', st: 'NTH', teams: ['Bayside Breakers', 'Hustle HQ'] },
  { date: fmtShortDay(new Date(2026, 4, 4)), title: 'Netsetters · Harbour', score: '3–2', sub: `${t('comp.mondayMen14')} · ${t('home.gameHighlights')}`, duration: '1:57', thumb: 'img/hl-9.webp', st: 'MET', teams: ['Netsetters 1', 'Harbour Blues'] },
  { date: fmtShortDay(new Date(2026, 4, 3)), title: 'Medium Fund. · Spike City', score: '1–3', sub: `${t('comp.mondayMen14')} · ${t('home.gameHighlights')}`, duration: '1:41', thumb: 'img/hl-10.webp', st: 'WST', teams: ['Medium Fund.', 'Spike City'] },
];

/* The month is part of the day, and it has to be: "Sat 17" cannot be resolved
   to a date, so nothing could filter or group these — and the team page already
   settled that a fixture list is exactly where the date is the point (Yuval
   2026-08-31). Added when the Upcoming lane got its date filter (Maryna
   2026-09-02). */
export const UPCOMING: Fixture[] = [
  { day: fmtShortDay(new Date(2026, 4, 17)), time: '18:30', home: { name: 'Netsetters 1', crest: 'img/logo-netsetters.svg' }, away: { name: 'Vikings Grey', mono: 'VG', crest: 'img/team-vikings-grey.svg' }, st: 'MET', teams: ['Netsetters 1', 'Vikings Grey'] },
  { day: fmtShortDay(new Date(2026, 4, 18)), time: '14:00', home: { name: 'Bayside Breakers', crest: 'img/logo-breakers.svg' }, away: { name: 'Hustle HQ', mono: 'HH', crest: 'img/team-hustle-hq.svg' }, st: 'NTH', teams: ['Bayside Breakers', 'Hustle HQ'] },
  { day: fmtShortDay(new Date(2026, 4, 21)), time: '19:10', home: { name: 'Northside', crest: 'img/team-northside-flames.svg' }, away: { name: 'Harbour', crest: 'img/logo-blues.svg' }, st: 'STH', teams: ['Northside Flames', 'Harbour Blues'] },
  { day: fmtShortDay(new Date(2026, 4, 23)), time: '17:45', home: { name: 'Torres', mono: 'TS', crest: 'img/team-torres.svg' }, away: { name: 'Medium Fund.', mono: 'MF', crest: 'img/team-medium-fund.svg' }, st: 'MET', teams: ['Torres', 'Medium Fund.'] },
  { day: fmtShortDay(new Date(2026, 4, 24)), time: '12:15', home: { name: 'Netsetters 1', crest: 'img/logo-netsetters.svg' }, away: { name: 'Spike City', crest: 'img/logo-spikecity.svg' }, st: 'MET', teams: ['Netsetters 1', 'Spike City'] },
  { day: fmtShortDay(new Date(2026, 4, 25)), time: '15:30', home: { name: 'Vikings Grey', mono: 'VG', crest: 'img/team-vikings-grey.svg' }, away: { name: 'Torres', mono: 'TS', crest: 'img/team-torres.svg' }, st: 'EST', teams: ['Vikings Grey', 'Torres'] },
  { day: fmtShortDay(new Date(2026, 4, 27)), time: '18:00', home: { name: 'Harbour', crest: 'img/logo-blues.svg' }, away: { name: 'Bayside Breakers', crest: 'img/logo-breakers.svg' }, st: 'STH', teams: ['Harbour Blues', 'Bayside Breakers'] },
  { day: fmtShortDay(new Date(2026, 4, 29)), time: '19:40', home: { name: 'Hustle HQ', mono: 'HH', crest: 'img/team-hustle-hq.svg' }, away: { name: 'Northside', crest: 'img/team-northside-flames.svg' }, st: 'NTH', teams: ['Hustle HQ', 'Northside Flames'] },
  { day: fmtShortDay(new Date(2026, 4, 31)), time: '13:00', home: { name: 'Spike City', crest: 'img/logo-spikecity.svg' }, away: { name: 'Medium Fund.', mono: 'MF', crest: 'img/team-medium-fund.svg' }, st: 'WST', teams: ['Spike City', 'Medium Fund.'] },
  { day: fmtShortDay(new Date(2026, 5, 1)), time: '16:20', home: { name: 'Netsetters 1', crest: 'img/logo-netsetters.svg' }, away: { name: 'Bayside Breakers', crest: 'img/logo-breakers.svg' }, st: 'MET', teams: ['Netsetters 1', 'Bayside Breakers'] },
];


/* LIVE_AS_RAIL and UPCOMING_AS_RAIL removed 2026-08-27. Both projected a game
   onto the video-card shape so the "See all" lanes could reuse one grid, and
   both lied: a fixture that has not been played got a stock thumbnail and a
   player tap, and a live game lost its score, LIVE badge and stream. Each lane
   now renders the same card its section on Home renders. */
