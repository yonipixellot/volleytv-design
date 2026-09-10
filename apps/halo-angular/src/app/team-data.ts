import type { TeamRow } from '../lib/organisms/ladder-card/ladder-card';
import { t, fmtShortDay, fmtTime } from './i18n/i18n';

export interface TeamMatch {
  chipTone: 'live' | 'fin' | 'up';
  chipText: string;
  round: string;
  teams: TeamRow[];
  footMeta?: string;
  footCta?: string;
}

/** Team registry + per-team fixtures for the /team/:id page (PT parity:
 *  TeamProfile hero + Live/Recent/Upcoming). Ids match the follow seeds.
 *  `league`/`division` are the "league · division" line shown everywhere
 *  (team.html's subtitle, Manage following's rows) — `league` was called
 *  `org` until 2026-08-26, which collided with the real meaning of
 *  "Organisation" once the Manage-following filter needed to match
 *  onboarding's State/Organisation/League triple exactly (onboarding's own
 *  browse seed, sso.ts's FollowOpt.org, is a CLUB name like "Vikings VC" —
 *  a different thing from the league name). `club` and `state` are net-new,
 *  additive fields for that filter; club values match sso.ts's org values
 *  for the teams the two seeds share. */
export interface TeamInfo {
  id: string;
  name: string;
  league: string;
  division: string;
  state: string;
  club: string;
  mono: string;
  crest?: string;
}

export const TEAMS: TeamInfo[] = [
  { id: 'nets', name: 'Netsetters 1', league: t('comp.mondayMen14'), division: t('grade.open'), state: 'MET', club: 'Netsetters VC', mono: 'NS', crest: 'img/logo-netsetters.svg' },
  { id: 'braves', name: 'Bayside Breakers', league: t('comp.tuesdayB3Men'), division: t('grade.openA1'), state: 'MET', club: 'Bayside VC', mono: 'BB', crest: 'img/logo-breakers.svg' },
  { id: 'flames', name: 'Northside Flames', league: t('comp.tuesdayB2Women'), division: t('grade.openB3'), state: 'STH', club: 'Northside VC', mono: 'NF', crest: 'img/team-northside-flames.svg' },
  { id: 'vik', name: 'Vikings Grey', league: t('comp.mondayMen14'), division: t('grade.open'), state: 'MET', club: 'Vikings VC', mono: 'VG' },
  { id: 'hus', name: 'Hustle HQ', league: t('comp.mondayMen14'), division: t('grade.open'), state: 'NTH', club: 'Hustle VC', mono: 'HH' },
  { id: 'cc', name: 'Chump Centrals', league: t('comp.mondayMen14'), division: t('grade.open'), state: 'MET', club: 'Chump VC', mono: 'CC' },
  { id: 'sky', name: 'Sky Riders', league: t('comp.mondayMen14'), division: t('grade.open'), state: 'EST', club: 'Sky VC', mono: 'SR' },
  { id: 'met', name: 'Melton Meteors', league: t('comp.tuesdayB3Men'), division: t('grade.openA1'), state: 'MET', club: 'Melton VC', mono: 'MM' },
  { id: 'reds', name: 'Richmond Redbacks', league: t('comp.tuesdayB2Women'), division: t('grade.openB3'), state: 'MET', club: 'Richmond VC', mono: 'RR' },
];

export const teamById = (id: string): TeamInfo | undefined => TEAMS.find((t) => t.id === id);
export const teamByName = (name: string): TeamInfo | undefined => TEAMS.find((t) => t.name === name);
/** Registry as link refs for halo-team-text. */
export const TEAM_LINKS = TEAMS.map((t) => ({ name: t.name, id: t.id }));
/** Name → /team id resolver for halo-team-name (null = plain text, unknown team). */
export const teamIdOf = (name: string): string | null => teamByName(name)?.id ?? null;

export interface TeamFixtures {
  live: TeamMatch[];
  recent: TeamMatch[];
  upcoming: TeamMatch[];
}

/**
 * Demo fixtures per team, in the games-page LadderMatch card language.
 *
 * Dates are absolute, not just weekdays. "Sat · 5:00 PM" answers *which day of
 * the week* and leaves "which Saturday" to the reader, which is unanswerable on
 * a page that lists several of them; a fixture list is exactly where the date is
 * the point (Yuval 2026-08-31). Format matches the events lane and the ladder
 * card's own round line: "Sat 9 May".
 *
 * One format, no relative words. "Yesterday" was the SUBSTITUTE for a date, and
 * keeping it beside "Sat 16 May" in the same column is the drift it was there to
 * avoid. The section header already says whether these are past or upcoming.
 *
 * All dates hang off the mock's today, 2026-05-10 (a Sunday) — the same anchor
 * the games page uses as TODAY_ISO.
 */
export function teamFixtures(id: string): TeamFixtures {
  const base: TeamFixtures = { live: [], recent: [], upcoming: [] };
  if (id === 'nets') {
    base.live = [
      { chipTone: 'live', chipText: `${t('status.liveCaps')} · ${t('games.setN', { n: 3 })}`, round: t('games.round', { n: 13 }), footMeta: `${t('venue.kilsyth')} · ${t('watch.court', { n: 2 })}`, footCta: t('cta.watchLive'),
        teams: [{ name: 'Netsetters 1', mono: 'NS', score: 21, crest: 'img/logo-netsetters.svg' }, { name: 'Sky Riders', mono: 'SR', score: 18, crest: 'img/team-sky-riders.svg' }] },
    ];
    // NINE rounds back, on the competition's weekly cadence, so the section
    // overflows its six-card cap and the See all is real rather than described
    // (Maryna 2026-09-02). Opponents are all from this team's own league, and
    // home and away alternate the way a fixture list does — the card puts the
    // home side first, so the winner is not always the top row.
    base.recent = [
      { chipTone: 'fin', chipText: t('status.final').toUpperCase(), round: t('games.round', { n: 12 }), footMeta: `${fmtShortDay(new Date(2026, 4, 9))} · ${fmtTime(new Date(2026, 4, 9, 19, 30))}`, footCta: t('cta.watchReplay'),
        teams: [{ name: 'Netsetters 1', mono: 'NS', score: 3, win: true, crest: 'img/logo-netsetters.svg' }, { name: 'Vikings Grey', mono: 'VG', score: 1, crest: 'img/team-vikings-grey.svg' }] },
      { chipTone: 'fin', chipText: t('status.final').toUpperCase(), round: t('games.round', { n: 11 }), footMeta: `${fmtShortDay(new Date(2026, 4, 2))} · ${fmtTime(new Date(2026, 4, 2, 17, 0))}`, footCta: t('cta.watchReplay'),
        teams: [{ name: 'Hustle HQ', mono: 'HH', score: 1, crest: 'img/team-hustle-hq.svg' }, { name: 'Netsetters 1', mono: 'NS', score: 3, win: true, crest: 'img/logo-netsetters.svg' }] },
      { chipTone: 'fin', chipText: t('status.final').toUpperCase(), round: t('games.round', { n: 10 }), footMeta: `${fmtShortDay(new Date(2026, 3, 25))} · ${fmtTime(new Date(2026, 3, 25, 19, 30))}`, footCta: t('cta.watchReplay'),
        teams: [{ name: 'Netsetters 1', mono: 'NS', score: 3, win: true, crest: 'img/logo-netsetters.svg' }, { name: 'Sky Riders', mono: 'SR', score: 0, crest: 'img/team-sky-riders.svg' }] },
      { chipTone: 'fin', chipText: t('status.final').toUpperCase(), round: t('games.round', { n: 9 }), footMeta: `${fmtShortDay(new Date(2026, 3, 18))} · ${fmtTime(new Date(2026, 3, 18, 17, 0))}`, footCta: t('cta.watchReplay'),
        teams: [{ name: 'Chump Centrals', mono: 'CC', score: 3, win: true, crest: 'img/team-chump-centrals.svg' }, { name: 'Netsetters 1', mono: 'NS', score: 2, crest: 'img/logo-netsetters.svg' }] },
      { chipTone: 'fin', chipText: t('status.final').toUpperCase(), round: t('games.round', { n: 8 }), footMeta: `${fmtShortDay(new Date(2026, 3, 11))} · ${fmtTime(new Date(2026, 3, 11, 19, 30))}`, footCta: t('cta.watchReplay'),
        teams: [{ name: 'Netsetters 1', mono: 'NS', score: 3, win: true, crest: 'img/logo-netsetters.svg' }, { name: 'Melton Meteors', mono: 'MM', score: 0, crest: 'img/team-melton-meteors.svg' }] },
      { chipTone: 'fin', chipText: t('status.final').toUpperCase(), round: t('games.round', { n: 7 }), footMeta: `${fmtShortDay(new Date(2026, 3, 4))} · ${fmtTime(new Date(2026, 3, 4, 18, 15))}`, footCta: t('cta.watchReplay'),
        teams: [{ name: 'Vikings Grey', mono: 'VG', score: 3, win: true, crest: 'img/team-vikings-grey.svg' }, { name: 'Netsetters 1', mono: 'NS', score: 2, crest: 'img/logo-netsetters.svg' }] },
      { chipTone: 'fin', chipText: t('status.final').toUpperCase(), round: t('games.round', { n: 6 }), footMeta: `${fmtShortDay(new Date(2026, 2, 28))} · ${fmtTime(new Date(2026, 2, 28, 19, 30))}`, footCta: t('cta.watchReplay'),
        teams: [{ name: 'Netsetters 1', mono: 'NS', score: 3, win: true, crest: 'img/logo-netsetters.svg' }, { name: 'Hustle HQ', mono: 'HH', score: 0, crest: 'img/team-hustle-hq.svg' }] },
      { chipTone: 'fin', chipText: t('status.final').toUpperCase(), round: t('games.round', { n: 5 }), footMeta: `${fmtShortDay(new Date(2026, 2, 21))} · ${fmtTime(new Date(2026, 2, 21, 17, 0))}`, footCta: t('cta.watchReplay'),
        teams: [{ name: 'Sky Riders', mono: 'SR', score: 3, win: true, crest: 'img/team-sky-riders.svg' }, { name: 'Netsetters 1', mono: 'NS', score: 1, crest: 'img/logo-netsetters.svg' }] },
      { chipTone: 'fin', chipText: t('status.final').toUpperCase(), round: t('games.round', { n: 4 }), footMeta: `${fmtShortDay(new Date(2026, 2, 14))} · ${fmtTime(new Date(2026, 2, 14, 19, 30))}`, footCta: t('cta.watchReplay'),
        teams: [{ name: 'Netsetters 1', mono: 'NS', score: 3, win: true, crest: 'img/logo-netsetters.svg' }, { name: 'Chump Centrals', mono: 'CC', score: 2, crest: 'img/team-chump-centrals.svg' }] },
    ];
    // Three rounds ahead, DELIBERATELY under the cap: a fixture list is
    // published a few rounds out, and it shows that See all is per section
    // rather than per page.
    base.upcoming = [
      { chipTone: 'up', chipText: `${fmtShortDay(new Date(2026, 4, 16)).toUpperCase()} · ${fmtTime(new Date(2026, 4, 16, 19, 30))}`, round: t('games.round', { n: 14 }), footMeta: `${t('venue.kilsyth')} · ${t('watch.court', { n: 1 })}`,
        teams: [{ name: 'Netsetters 1', mono: 'NS', crest: 'img/logo-netsetters.svg' }, { name: 'Chump Centrals', mono: 'CC', crest: 'img/team-chump-centrals.svg' }] },
      { chipTone: 'up', chipText: `${fmtShortDay(new Date(2026, 4, 23)).toUpperCase()} · ${fmtTime(new Date(2026, 4, 23, 17, 0))}`, round: t('games.round', { n: 15 }), footMeta: `${t('venue.skyDome')} · ${t('watch.court', { n: 3 })}`,
        teams: [{ name: 'Sky Riders', mono: 'SR', crest: 'img/team-sky-riders.svg' }, { name: 'Netsetters 1', mono: 'NS', crest: 'img/logo-netsetters.svg' }] },
      { chipTone: 'up', chipText: `${fmtShortDay(new Date(2026, 4, 30)).toUpperCase()} · ${fmtTime(new Date(2026, 4, 30, 19, 30))}`, round: t('games.round', { n: 16 }), footMeta: `${t('venue.kilsyth')} · ${t('watch.court', { n: 2 })}`,
        teams: [{ name: 'Netsetters 1', mono: 'NS', crest: 'img/logo-netsetters.svg' }, { name: 'Melton Meteors', mono: 'MM', crest: 'img/team-melton-meteors.svg' }] },
    ];
    return base;
  }
  const team = teamById(id);
  if (!team) return base;
  base.recent = [
    { chipTone: 'fin', chipText: t('status.final').toUpperCase(), round: t('games.round', { n: 12 }), footMeta: `${fmtShortDay(new Date(2026, 4, 3))} · ${fmtTime(new Date(2026, 4, 3, 15, 0))}`, footCta: t('cta.watchReplay'),
      teams: [{ name: team.name, mono: team.mono, score: 3, win: true }, { name: 'Sky Riders', mono: 'SR', score: 1, crest: 'img/team-sky-riders.svg' }] },
  ];
  return base;
}
