import { Component, signal } from '@angular/core';
import { SettingsPage } from '../../../settings-page';
import { HaloIcon } from '../../../../lib/atoms/icon/icon';
import { TPipe } from '../../../i18n/t.pipe';

interface ClaimedPlayer { id: string; name: string; number: string; email: string; }
interface CoachTeam { id: string; name: string; mono: string; roster: ClaimedPlayer[]; }

interface RevokeTarget { teamId: string; playerId: string; playerName: string; }

const emailFor = (name: string) =>
  `${name.toLowerCase().replace(/[^a-z\s]/g, '').trim().split(/\s+/).join('.')}@example.com`;
const inviteLinkFor = (teamId: string) => `halo.app/invite/${teamId}?code=coach-2026`;

/**
 * Coach Admin Panel (C29). Lists the teams a coach coaches — each with its
 * invite link (copy) and the players who've claimed a roster spot (name + #num
 * + email), with a per-claim Revoke (confirm sheet → removed, no undo). The
 * ongoing coach-management surface, reachable from the menu. Coach-gated route.
 */
@Component({
  selector: 'halo-coach-admin-page',
  standalone: true,
  imports: [SettingsPage, HaloIcon, TPipe],
  templateUrl: './coach-admin.html',
  styleUrls: ['../settings-common.scss', './coach-admin.scss'],
})
export class CoachAdminPage {
  protected inviteLinkFor = inviteLinkFor;

  teams = signal<CoachTeam[]>([
    {
      id: 't1', name: 'Netsetters 1', mono: 'NS',
      roster: [
        { id: 'r1', name: 'Tal Weiss', number: '7', email: emailFor('Tal Weiss') },
        { id: 'r2', name: 'Jordan Torres', number: '14', email: emailFor('Jordan Torres') },
      ],
    },
    {
      id: 't3', name: 'Northside Flames', mono: 'NF',
      roster: [
        { id: 'r3', name: 'Aman Singh', number: '9', email: emailFor('Aman Singh') },
      ],
    },
  ]);

  copiedTeamId = signal<string | null>(null);
  confirmTarget = signal<RevokeTarget | null>(null);
  lastRevoked = signal<string | null>(null);

  copy(teamId: string): void {
    const link = inviteLinkFor(teamId);
    navigator?.clipboard?.writeText(link).catch(() => {});
    this.copiedTeamId.set(teamId);
    setTimeout(() => this.copiedTeamId.update((c) => (c === teamId ? null : c)), 1400);
  }

  confirmRevoke(): void {
    const t = this.confirmTarget();
    if (!t) return;
    this.teams.update((teams) =>
      teams.map((tm) => (tm.id === t.teamId ? { ...tm, roster: tm.roster.filter((p) => p.id !== t.playerId) } : tm)),
    );
    this.lastRevoked.set(t.playerName);
    this.confirmTarget.set(null);
    setTimeout(() => this.lastRevoked.update((c) => (c === t.playerName ? null : c)), 3600);
  }
}
