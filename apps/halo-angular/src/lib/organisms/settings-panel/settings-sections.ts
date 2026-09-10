import type { IconName } from '../../atoms/icon/icon';
import { t } from '../../../app/i18n/i18n';

export interface SettingsRow {
  key: string;
  icon: IconName;
  label: string;
  sub?: string;
  value?: string;
  tag?: string;
  /** Route this row leads to. Rows without one act in place (theme) or open
   *  something (accessibility, language). */
  path?: string;
  action?: 'theme' | 'a11y';
  chevron?: boolean;
  /** Opens a pane beside or inside the menu rather than leaving for a screen. */
  submenu?: boolean;
}
export interface SettingsSection { key: string; label: string; rows: SettingsRow[]; }

export interface SettingsSectionOpts {
  isCoach: boolean;
  theme: 'dark' | 'light';
  language: string;
}

/**
 * The one list of what Account & settings contains.
 *
 * Three surfaces read it: the phone screen, the header popover, and the desktop
 * sidebar. They are the same list by construction — a second copy is a second
 * place to forget a setting, and the user then has to learn which of them has
 * the one they want (Maryna 2026-08-29).
 *
 * Rows archived per Yuval (2026-08-20): Subscription, Privacy & permissions,
 * Take a tour, Share feedback. Hidden here but their routes and pages are kept.
 * Notifications restored 2026-08-26 and moved from Account to App the same day:
 * it is a single device-level switch now, the same shape as Language and Theme.
 */
export function settingsSections(o: SettingsSectionOpts): SettingsSection[] {
  return [
    {
      key: 'account',
      label: t('settings.account'),
      rows: [
        { key: 'profile', icon: 'user', label: t('settings.accountProfile'), sub: t('settings.accountProfileSub'), path: 'account', chevron: true },
        { key: 'follows', icon: 'heart', label: t('settings.manageFollowing'), sub: t('settings.manageFollowingSub'), path: 'follows', chevron: true },
        ...(o.isCoach
          ? [{ key: 'coach', icon: 'games' as IconName, label: t('settings.coachAdmin'), sub: t('settings.coachAdminSub'), path: 'coach-admin', chevron: true }]
          : []),
      ],
    },
    {
      key: 'app',
      label: t('settings.app'),
      rows: [
        { key: 'notifs', icon: 'bell', label: t('settings.notifications'), path: 'settings/notifications', chevron: true },
        { key: 'lang', icon: 'globe', label: t('lang.nav'), value: o.language, path: 'language', chevron: true, submenu: true },
        { key: 'theme', icon: o.theme === 'dark' ? 'sun' : 'moon', label: o.theme === 'dark' ? t('settings.lightMode') : t('settings.darkMode'), action: 'theme' },
        { key: 'a11y', icon: 'accessibility', label: t('settings.accessibility'), sub: t('settings.accessibilitySub'), action: 'a11y', chevron: true },
        { key: 'help', icon: 'info', label: t('settings.helpAbout'), path: 'help', chevron: true },
      ],
    },
  ];
}
