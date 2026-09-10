import { Component, signal } from '@angular/core';
import { SettingsPage } from '../../../settings-page';
import { HaloToggle } from '../../../../lib/atoms/toggle/toggle';
import { TPipe } from '../../../i18n/t.pipe';

/**
 * Notifications settings (C22). One master switch for now — the same
 * allow/don't-allow choice the onboarding permission prompt already asks,
 * just reachable again afterwards (Yuval 2026-08-26: per-type controls read
 * as promising granularity we don't have yet). Per-type toggles and the
 * sharing-export channels are archived below, not deleted, for when that
 * granularity is real.
 */
@Component({
  selector: 'halo-notifications-page',
  standalone: true,
  imports: [SettingsPage, HaloToggle, TPipe],
  templateUrl: './notifications.html',
  styleUrls: ['../settings-common.scss', './notifications.scss'],
})
export class NotificationsPage {
  allowed = signal(true);

  // Archived 2026-08-26 — per-type toggles (drop-ready / recaps / releases)
  // and the sharing-export channels (in-app / push / email). Restore once
  // there's an actual reason to offer this granularity: a real push backend
  // wired per notification type, and (for the share row) sharing itself.
  //
  // interface Toggle { k: string; label: string; sub: string; initial: boolean; }
  // interface Channel { key: string; label: string; initial: boolean; }
  // interface ChannelToggle { k: string; label: string; sub: string; channels: Channel[]; }
  //
  // private vc = inject(ViewContext);
  // private showDrops = computed(() => this.vc.caps().isAthlete || this.vc.caps().isParent);
  // private allToggles: Toggle[] = [
  //   { k: 'drops', label: 'Your drop is ready', sub: 'When your game highlights are ready to watch', initial: true },
  //   { k: 'recaps', label: 'Game recaps', sub: 'Final scores + recaps for teams you follow', initial: true },
  //   { k: 'releases', label: 'New releases & features', sub: 'Occasional product news, no spam', initial: false },
  // ];
  // protected toggles = computed(() => this.allToggles.filter((t) => t.k !== 'drops' || this.showDrops()));
  // channelToggles: ChannelToggle[] = [
  //   {
  //     k: 'share',
  //     label: 'Shared file ready',
  //     sub: 'When a video you shared finishes exporting',
  //     channels: [
  //       { key: 'inapp', label: 'In-app', initial: true },
  //       { key: 'push', label: 'Push', initial: true },
  //       { key: 'email', label: 'Email', initial: false },
  //     ],
  //   },
  // ];
  // prefs = signal<Record<string, boolean>>(
  //   Object.fromEntries(this.allToggles.map((t) => [t.k, t.initial])),
  // );
  // channelPrefs = signal<Record<string, Record<string, boolean>>>(
  //   Object.fromEntries(
  //     this.channelToggles.map((t) => [t.k, Object.fromEntries(t.channels.map((c) => [c.key, c.initial]))]),
  //   ),
  // );
  // setPref(k: string, v: boolean): void { this.prefs.update((p) => ({ ...p, [k]: v })); }
  // setChannel(tk: string, ck: string, v: boolean): void {
  //   this.channelPrefs.update((p) => ({ ...p, [tk]: { ...p[tk], [ck]: v } }));
  // }
}
