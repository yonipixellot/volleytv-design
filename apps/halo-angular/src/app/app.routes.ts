import { inject } from '@angular/core';
import { Routes, Router } from '@angular/router';
import { ViewContext } from './view-context';
import { UpgradeState } from './upgrade-state';

import { HomePage } from './pages/home/home';
import { GamesPage } from './pages/games/games';
import { YouPage } from './pages/you/you';
import { SignInPage } from './pages/auth/sign-in/sign-in';
import { SignUpPage } from './pages/auth/sign-up/sign-up';
import { ForgotPage } from './pages/auth/forgot/forgot';
import { ResetPage } from './pages/auth/reset/reset';
import { VerifyPage } from './pages/auth/verify/verify';
import { CompleteProfilePage } from './pages/auth/complete-profile/complete-profile';
import { OnboardingPage } from './pages/onboarding/onboarding';
import { SsoOnboardingPage } from './pages/onboarding/sso/sso';
import { VerifyCodePage } from './pages/auth/verify-code/verify-code';
import { GamePage } from './pages/game/game';
import { TeamPage } from './pages/team/team';
import { LivePlayerPage } from './pages/watch/live/live';
import { VodPage } from './pages/watch/vod/vod';
import { HighlightPage } from './pages/watch/highlight/highlight';
import { EventsLanePage } from './pages/events/events-lane';
import { PlaceholderPage } from './pages/placeholder/placeholder';
import { UpgradePage } from './pages/upgrade/upgrade';
import { AccountPage } from './pages/settings/account/account';
import { ChangePasswordPage } from './pages/settings/change-password/change-password';
import { DeleteAccountPage } from './pages/settings/delete-account/delete-account';
import { SettingsPage } from './pages/settings/settings';
import { NotificationsPage } from './pages/settings/notifications/notifications';
import { NotificationCenterPage } from './pages/notifications/notification-center';
import { FollowingPage } from './pages/settings/following/following';
import { SubscriptionPage } from './pages/settings/subscription/subscription';
import { CoachAdminPage } from './pages/settings/coach-admin/coach-admin';
import { InvitePage } from './pages/onboarding/invite/invite';
import { GetStartedPage } from './pages/get-started/get-started';
import { LanguagePage } from './pages/settings/language/language';
import { t } from './i18n/i18n';

/** You is Premium/Basic-only. On Free, bounce home and raise the upgrade sheet. */
const youGuard = () => {
  const vc = inject(ViewContext);
  if (vc.tier() === 'free') {
    inject(UpgradeState).open();
    return inject(Router).parseUrl('/home');
  }
  return true;
};

/** Coach Admin is coach-persona-only. Non-coaches bounce home. */
const coachGuard = () => {
  const vc = inject(ViewContext);
  return vc.caps().isCoach ? true : inject(Router).parseUrl('/home');
};

/** Bottom-tab routes (home/games/you) + auth, onboarding, game detail, players. */
export const routes: Routes = [
  { path: 'home', component: HomePage, title: `Halo · ${t('nav.home')}` },
  { path: 'games', component: GamesPage, title: `Halo · ${t('route.myGames')}` },
  { path: 'you', component: YouPage, title: `Halo · ${t('nav.you')}`, canActivate: [youGuard] },

  { path: 'auth/sign-in', component: SignInPage, title: `Halo · ${t('auth.signIn')}` },
  { path: 'auth/sign-up', component: SignUpPage, title: `Halo · ${t('auth.signUp')}` },
  { path: 'auth/forgot', component: ForgotPage, title: `Halo · ${t('route.forgot')}` },
  { path: 'auth/reset', component: ResetPage, title: `Halo · ${t('route.reset')}` },
  { path: 'auth/verify', component: VerifyPage, title: `Halo · ${t('route.verify')}` },
  { path: 'auth/verify-code', component: VerifyCodePage, title: `Halo · ${t('route.verify')}` },
  { path: 'auth/complete-profile', component: CompleteProfilePage, title: `Halo · ${t('route.completeProfile')}` },
  { path: 'onboarding', component: OnboardingPage, title: `Halo · ${t('route.getStarted')}` },
  { path: 'onboarding/sso', component: SsoOnboardingPage, title: `Halo · ${t('route.clubId')}` },
  { path: 'get-started', component: GetStartedPage, title: `Halo · ${t('route.getStarted')}` },

  // Addressable since 2026-08-28 so the players' "Go to the game page" link can
  // point at the game it is actually playing (it used to hardcode ['/game']).
  // The bare path stays: the dev-bar changelog and several in-app links predate
  // the param, and the page still renders one seed game either way.
  { path: 'game', component: GamePage, title: `Halo · ${t('route.game')}` },
  { path: 'game/:id', component: GamePage, title: `Halo · ${t('route.game')}` },
  { path: 'team/:id', component: TeamPage, title: `Halo · ${t('route.team')}` },
  { path: 'watch/live', component: LivePlayerPage, title: `Halo · ${t('status.live')}` },
  { path: 'watch/vod', component: VodPage, title: `Halo · ${t('route.watch')}` },
  { path: 'watch/highlight', component: HighlightPage, title: `Halo · ${t('route.highlight')}` },
  // "See all" lane pages — a Home rail's full, date-grouped catalogue.
  { path: 'events/:lane', component: EventsLanePage, title: `Halo · ${t('home.events')}` },

  // Settings destinations (structure mirrors the wireframe). Placeholder-backed
  // for now — when a real screen lands, swap only that route's `component`.
  // The header avatar's own screen — a route since 2026-08-26 (was an overlay
  // sheet at app root), so it behaves exactly like the bell's feed below.
  { path: 'settings', component: SettingsPage, title: `Halo · ${t('settings.accountSettings')}` },
  { path: 'account', component: AccountPage, title: `Halo · ${t('settings.account')}` },
  { path: 'account/change-password', component: ChangePasswordPage, title: `Halo · ${t('pw.change')}` },
  { path: 'account/delete', component: DeleteAccountPage, title: `Halo · ${t('account.deleteAccount')}` },
  // bell feed (CM-1417); the notification SETTINGS toggles live under /settings
  { path: 'notifications', component: NotificationCenterPage, title: `Halo · ${t('settings.notifications')}` },
  { path: 'settings/notifications', component: NotificationsPage, title: `Halo · ${t('route.notifSettings')}` },
  { path: 'follows', component: FollowingPage, title: `Halo · ${t('route.following')}` },
  { path: 'subscription', component: SubscriptionPage, title: `Halo · ${t('sub.title')}` },
  { path: 'coach-admin', component: CoachAdminPage, title: `Halo · ${t('settings.coachAdmin')}`, canActivate: [coachGuard] },
  { path: 'privacy', component: PlaceholderPage, title: `Halo · ${t('route.privacy')}`, data: { title: t('route.privacy'), icon: 'shield' } },
  { path: 'language', component: LanguagePage, title: `Halo · ${t('lang.nav')}` },
  { path: 'accessibility', component: PlaceholderPage, title: `Halo · ${t('settings.accessibility')}`, data: { title: t('settings.accessibility'), icon: 'accessibility' } },
  { path: 'tour', component: PlaceholderPage, title: `Halo · ${t('route.tour')}`, data: { title: t('route.tour'), icon: 'compass' } },
  { path: 'help', component: PlaceholderPage, title: `Halo · ${t('route.help')}`, data: { title: t('settings.helpAbout'), icon: 'info', key: 'help' } },
  { path: 'feedback', component: PlaceholderPage, title: `Halo · ${t('route.feedback')}`, data: { title: t('route.feedback'), icon: 'mail' } },
  { path: 'invite', component: InvitePage, title: `Halo · ${t('route.playerInvite')}` },
  { path: 'onboarding/invite/:code', component: InvitePage, title: `Halo · ${t('route.playerInvite')}` },
  { path: 'upgrade', component: UpgradePage, title: `Halo · ${t('common.upgrade')}` },

  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: '**', redirectTo: 'home' },
];
