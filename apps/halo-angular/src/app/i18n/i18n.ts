import { en, type Key } from './en';

export type { Key };
/** English only in this fork (Yoni 2026-09-08). The runtime is kept so a
 *  language can be cherry-picked back from upstream halo-design as a data-only
 *  change: add the dictionary, widen this union, add a LANGS row. */
export type Lang = 'en';

export interface LangDef {
  code: Lang;
  /** Shown in the picker in its own script, so a user who cannot read the
   *  current language can still find theirs. */
  native: string;
  dir: 'ltr' | 'rtl';
  /** BCP-47 tag for Intl date/number formatting. */
  locale: string;
  /** Google Fonts family covering this script (none = self-hosted fonts do). */
  webFont?: string;
}

export const LANGS: readonly LangDef[] = [
  { code: 'en', native: 'English', dir: 'ltr', locale: 'en-AU' },
];

const STORAGE_KEY = 'halo:lang';
const isLang = (v: unknown): v is Lang => v === 'en';

/**
 * The language is fixed for the lifetime of the page. Module-level, not a
 * signal: seed content (`events-data.ts` and friends) is built in module-level
 * consts at import time, so the only way every surface, data included, re-renders
 * in a new language is to persist the choice and reload. `?lang=xx` on the URL
 * wins over the stored choice and is persisted, which makes deep-linked review
 * ("open this screen in Japanese") a one-liner.
 */
function detect(): Lang {
  try {
    const fromUrl = new URLSearchParams(location.search).get('lang');
    if (isLang(fromUrl)) {
      localStorage.setItem(STORAGE_KEY, fromUrl);
      return fromUrl;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLang(stored)) return stored;
  } catch { /* SSR / private mode */ }
  return 'en';
}

export const LANG: Lang = detect();
export const LANG_DEF: LangDef = LANGS.find((l) => l.code === LANG) ?? LANGS[0];
export const DIR = LANG_DEF.dir;
export const LOCALE = LANG_DEF.locale;
export const IS_RTL = DIR === 'rtl';

const DICT: Record<Lang, Record<Key, string>> = { en };

/** Translate a key in the current language, substituting `{param}` slots. */
export function t(key: Key, params?: Record<string, string | number>): string {
  let s: string = DICT[LANG][key] ?? en[key] ?? key;
  if (params) s = s.replace(/\{(\w+)\}/g, (m, k: string) => (k in params ? String(params[k]) : m));
  return s;
}

/** "1 game" / "{n} games": Hebrew has a distinct singular form and Japanese has
 *  no plural, so both forms are full strings and the number lives inside them. */
export function plural(n: number, one: Key, many: Key): string {
  return n === 1 ? t(one) : t(many, { n });
}

/**
 * Persist + reload, with the choice written INTO the URL. Storage alone was not
 * enough (Yuval 2026-09-03): a link opened from Slack's in-app browser and then
 * handed to Safari, a private window, or a copied URL all start with empty
 * storage, and the first router navigation had already dropped `?lang=`, so the
 * app flashed the chosen language once and came back in English. The URL is the
 * carrier that survives every hand-off; storage is the convenience on top.
 */
export function setLang(code: Lang): void {
  if (code === LANG) return;
  try { localStorage.setItem(STORAGE_KEY, code); } catch { /* private mode */ }
  const url = new URL(location.href);
  url.searchParams.set('lang', code);
  history.replaceState(history.state, '', url.toString());
  location.reload();
}

/**
 * Keep `?lang=` on the URL after every router navigation (the router rebuilds
 * the URL from its own state and drops it). English is the default and stays
 * implicit, so English links look the way they always did. Called from the app
 * root on NavigationEnd; a plain history rewrite so the router's own state is
 * untouched.
 */
export function keepLangInUrl(): void {
  if (LANG === 'en') return;
  try {
    const url = new URL(location.href);
    if (url.searchParams.get('lang') === LANG) return;
    url.searchParams.set('lang', LANG);
    history.replaceState(history.state, '', url.toString());
  } catch { /* non-browser */ }
}

/**
 * Runs before Angular bootstraps: `<html lang dir>` so CSS `:lang()` font stacks,
 * `[dir=rtl]` mirroring and screen readers all see the language from the first
 * paint; and the script's web font, loaded only when it is needed (League
 * Spartan / Inter have no Hebrew, kana or kanji glyphs).
 */
export function applyDocumentLang(doc: Document = document): void {
  doc.documentElement.lang = LANG;
  doc.documentElement.dir = DIR;
  if (LANG_DEF.webFont && !doc.getElementById('halo-webfont')) {
    const link = doc.createElement('link');
    link.id = 'halo-webfont';
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${LANG_DEF.webFont}&display=swap`;
    doc.head.appendChild(link);
  }
}

/**
 * Translated string → its English source. Clip gating (`clip-access.ts`) classifies
 * plays by matching English words in the title; the titles are now translated,
 * so the classifier runs on the English the string came from. Identity when a
 * string is not from the dictionary (team names, free text).
 */
let REVERSE: Map<string, string> | null = null;
export function englishOf(s: string): string {
  if (LANG === 'en') return s;
  if (!REVERSE) {
    REVERSE = new Map();
    const cur = DICT[LANG];
    for (const k of Object.keys(en) as Key[]) REVERSE.set(cur[k], en[k]);
  }
  return REVERSE.get(s) ?? s;
}

/** Alias for files where a local variable is already called `t`. */
export const tr = t;

/** "92nd pct": English needs the ordinal suffix, the other two take the bare number. */
export function pctile(n: number): string {
  if (LANG !== 'en') return t('stat.pctile', { n });
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return t('stat.pctile', { n: `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}` });
}

/** Intl helpers bound to the current locale. */
export function fmtDate(d: Date, opts: Intl.DateTimeFormatOptions): string {
  return d.toLocaleDateString(LOCALE, opts);
}
export function fmtTime(d: Date): string {
  return d.toLocaleTimeString(LOCALE, { hour: 'numeric', minute: '2-digit' });
}
/** "Sun 12 May" in English (en-AU's own short form inserts a comma the design
 *  never had); the locale's short form elsewhere. */
export function fmtShortDay(d: Date): string {
  if (LANG === 'en') return `${EN_WD[d.getDay()]} ${d.getDate()} ${EN_MON[d.getMonth()]}`;
  return d.toLocaleDateString(LOCALE, { weekday: 'short', day: 'numeric', month: 'short' });
}
/** "Sat 17": weekday + day-of-month, no month. */
export function fmtDayNum(d: Date): string {
  if (LANG === 'en') return `${EN_WD[d.getDay()]} ${d.getDate()}`;
  return d.toLocaleDateString(LOCALE, { weekday: 'short', day: 'numeric' });
}
export const EN_WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const EN_MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** Weekday / month name tables in the current locale (1 Feb 2026 is a Sunday). */
export const WEEKDAYS: string[] = LANG === 'en' ? EN_WD : Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(LOCALE, { weekday: 'short' }).format(new Date(2026, 1, 1 + i)));
export const WEEKDAY_NARROW: string[] = LANG === 'en' ? ['S', 'M', 'T', 'W', 'T', 'F', 'S'] : Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(LOCALE, { weekday: 'narrow' }).format(new Date(2026, 1, 1 + i)));
export const MONTH_ABBR: string[] = LANG === 'en' ? EN_MON : Array.from({ length: 12 }, (_, i) => new Intl.DateTimeFormat(LOCALE, { month: 'short' }).format(new Date(2026, i, 1)));
export function fmtMonthYear(y: number, m: number): string {
  return new Date(y, m, 1).toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' });
}
/** Country name in the current language (ISO region code). */
export function regionName(code: string): string {
  try { return new Intl.DisplayNames([LOCALE], { type: 'region' }).of(code.toUpperCase()) ?? code; } catch { return code; }
}
export function fmtNumber(n: number, opts?: Intl.NumberFormatOptions): string {
  return n.toLocaleString(LOCALE, opts);
}
