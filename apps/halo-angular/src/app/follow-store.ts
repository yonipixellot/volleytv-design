import { Injectable, computed, signal } from '@angular/core';
import { TEAMS, type TeamInfo } from './team-data';

/**
 * App-wide followed-teams state (prototype: in-memory, seeded). Single source
 * of truth for the Following page, the team page's Follow toggle, and the
 * own/followed gating of team-name hyperlinks (only the viewer's own +
 * followed teams link to /team/:id — opponents stay plain text).
 */
@Injectable({ providedIn: 'root' })
export class FollowStore {
  /** 'nets' is the viewer's OWN team; braves/flames are followed. */
  private ids = signal<Set<string>>(new Set(['nets', 'braves', 'flames']));

  readonly followedTeams = computed<TeamInfo[]>(() =>
    TEAMS.filter((t) => this.ids().has(t.id)),
  );
  readonly discoverTeams = computed<TeamInfo[]>(() =>
    TEAMS.filter((t) => !this.ids().has(t.id)),
  );

  isFollowed(id: string): boolean { return this.ids().has(id); }

  /** Team-name links are gated to own/followed — returns the /team id or null. */
  linkIdForName(name: string): string | null {
    const t = TEAMS.find((x) => x.name === name);
    return t && this.ids().has(t.id) ? t.id : null;
  }

  follow(id: string): void { this.ids.update((s) => new Set(s).add(id)); }
  unfollow(id: string): void { this.ids.update((s) => { const n = new Set(s); n.delete(id); return n; }); }
  /** Returns the new state (true = now following). */
  toggle(id: string): boolean {
    const now = !this.isFollowed(id);
    now ? this.follow(id) : this.unfollow(id);
    return now;
  }
}
