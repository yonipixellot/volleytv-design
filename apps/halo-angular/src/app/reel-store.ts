import { Injectable, signal } from '@angular/core';
import { t } from './i18n/i18n';

export interface ReelMoment {
  /** The play behind the moment (No-look set / Line shot kill / Solo block) — also the
      caption subtitle and the `clip-access` gating key. */
  action: string;
  thumb: string;
}

/**
 * ReelStore — the athlete's OWN reel, shared between the vertical highlight
 * player and You › Clips so "Remove this moment" disappears from BOTH
 * (Yuval's moment-player feedback, 2026-08-23). Session-scoped mock state,
 * same pattern as NotificationStore.
 */
@Injectable({ providedIn: 'root' })
export class ReelStore {
  readonly moments = signal<ReelMoment[]>([
    { action: t('play.noLookSet'), thumb: 'img/clip-1.webp' },
    { action: t('play.lineShot'), thumb: 'img/clip-2.webp' },
    { action: t('play.soloBlock'), thumb: 'img/clip-3.webp' },
  ]);

  /** Actions removed this session — You › Clips hides matching tiles. */
  private readonly removed = signal<ReadonlySet<string>>(new Set());

  /** Is a clip title one of the removed reel moments? (case-insensitive) */
  isRemoved(title: string): boolean {
    return this.removed().has(title.toLowerCase());
  }

  remove(action: string): void {
    this.moments.update((ms) => ms.filter((m) => m.action !== action));
    this.removed.update((s) => new Set(s).add(action.toLowerCase()));
  }
}
