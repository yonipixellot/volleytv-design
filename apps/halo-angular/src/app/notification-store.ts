import { Injectable, computed, signal } from '@angular/core';
import { t } from './i18n/i18n';

// 'clip' archived 2026-08-26 — its only seed (n2 below) deep-linked to the
// highlight page's ?share=1 auto-share prompt, and sharing has no UI entry
// point anywhere in the app right now (ShareState/ShareSheet archived
// earlier this session). Restore alongside sharing itself, not before.
export type NotifType = 'live' | 'recap' | 'highlight'; // | 'clip'

/** One in-app notification record — the HALO store is the source of truth
 *  (CM-1417: the bell panel never renders from Braze). `route`/`query` are the
 *  stored deep-link metadata that resolves the destination without Braze. */
export interface HaloNotification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  section: 'today' | 'earlier';
  read: boolean;
  route: string[];
  query?: Record<string, string>;
}

/**
 * App notification center store (CM-1417 MVP, PT stand-in for the backend
 * store). Seeds the epic's 4 triggers with its exact copy templates on our
 * fixtures; unread drives the bell badge; tapping marks read + deep-links;
 * Clear empties the feed.
 */
@Injectable({ providedIn: 'root' })
export class NotificationStore {
  private items = signal<HaloNotification[]>([
    // 1 · live_started — followers of the team
    { id: 'n1', type: 'live', title: t('notif.teamLive', { team: 'Netsetters 1' }), body: t('notif.underway', { opp: 'Vikings Grey' }), time: t('time.now'), section: 'today', read: false, route: ['/watch/live'] },
    // 4 · clip_creation_ready archived 2026-08-26 — see the NotifType note
    // above; its route/query pair (?share=1) has nowhere to land right now.
    // { id: 'n2', type: 'clip', title: 'Your clip is ready', body: 'The clip you requested from Netsetters 1 vs Vikings Grey is ready to download.', time: '10m', section: 'today', read: false, route: ['/watch/highlight'], query: { share: '1' } },
    // 3 · highlights_ready (player scope) — athlete copy variant
    { id: 'n3', type: 'highlight', title: t('notif.hlReady'), body: t('notif.hlReadyBody', { home: 'Netsetters 1', away: 'Vikings Grey' }), time: t('time.hoursShort', { n: 2 }), section: 'today', read: false, route: ['/watch/highlight'] },
    // 2 · highlights_ready (team scope) — recap
    { id: 'n4', type: 'recap', title: t('notif.recapReady'), body: t('notif.recapReadyBody', { home: 'Netsetters 1', away: 'Vikings Grey' }), time: t('time.hoursShort', { n: 5 }), section: 'today', read: true, route: ['/watch/vod'], query: { kind: 'recap' } },
    { id: 'n5', type: 'recap', title: t('notif.recapReady'), body: t('notif.recapReadyBody', { home: 'Bayside Breakers', away: 'Northside Flames' }), time: t('time.yesterday'), section: 'earlier', read: true, route: ['/watch/vod'], query: { kind: 'recap' } },
  ]);

  readonly all = this.items.asReadonly();
  readonly unread = computed(() => this.items().filter((n) => !n.read).length);
  readonly today = computed(() => this.items().filter((n) => n.section === 'today'));
  readonly earlier = computed(() => this.items().filter((n) => n.section === 'earlier'));

  markRead(id: string): void {
    this.items.update((xs) => xs.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  /**
   * Everything read. Called when the centre has been OPEN for a moment, not on
   * tap (Maryna 2026-08-28): reviewers expected the badge to clear by visiting,
   * which is also what the platform guidance says — badges indicate unread and
   * "clear after user visits" (Apple HIG / Material, via the design reference).
   *
   * One flat model on purpose: no separate `seen` field. In a feed where every
   * notification is a TASK ("your highlight is ready, tap to view") a per-item
   * dot would double as a to-do list, which is worth having — but we chose the
   * simple model first and can add it when the volume justifies it.
   */
  markAllRead(): void {
    this.items.update((xs) => xs.map((n) => (n.read ? n : { ...n, read: true })));
  }

  /** The batch removed by the last clearAll(), so it can be put back. */
  private lastCleared: HaloNotification[] = [];
  /** "Clear all" empties the feed. Recoverable for as long as the undo toast is
   *  up — PatternFly's "unclear last". The badge is NOT what this is for any
   *  more: opening the centre already clears it, so clearing is a deliberate
   *  "empty my list", not the only way to silence the bell. */
  clearAll(): void {
    this.lastCleared = this.items();
    this.items.set([]);
  }
  undoClear(): void {
    if (!this.lastCleared.length) return;
    this.items.set(this.lastCleared);
    this.lastCleared = [];
  }
}
