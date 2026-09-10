import { Component, input, output, signal } from '@angular/core';
import { HaloIcon } from '../../atoms/icon/icon';
import { t } from '../../../app/i18n/i18n';

export interface StoryItem {
  label: string;
  /** Team logo image URL — shown on the shared white crest plate. */
  logo?: string;
  /** Player number — shown on the brand fill. People only; teams ignore it. */
  number?: string;
  /** Active ("You") gets the gold accent ring. */
  active?: boolean;
  /** What the circle is — hosts route taps by this (you/kid → vertical reel,
      player → that player's vertical reel, team → the game recap in the
      horizontal player). Also decides how the circle is PAINTED: person =
      number on --primary, team = logo or initials on the neutral --mono-plate. */
  kind?: 'you' | 'kid' | 'team' | 'player';
  /** For player circles — the reel id (teammate-reels.ts) the tap opens. */
  reelId?: string;
  /** For you/kid circles — the ProfileState id this circle represents, so a
      tap can focus that person app-wide before opening their reel. */
  profileId?: string;
  /** For team circles — the team's REGISTRY name, when the host needs to route
   *  to its page. The label is a short form on purpose (the 60px column
   *  ellipsises anything longer), so "Breakers" and "Vikings" do not resolve
   *  against a registry holding "Bayside Breakers" and "Vikings Grey". */
  team?: string;
  /** Has unseen content → colored ring; cleared once viewed (journeys doc). */
  unseen?: boolean;
  /** NOTHING inside — a third state, and not the same as "seen it all". The
   *  circle stays: it is a relationship, not a piece of content, and dropping it
   *  would make the rail's membership change between visits, shift every other
   *  circle's position, and hide a team the moment after you followed it
   *  (Maryna 2026-09-02). It is drawn quieter, takes no ring colour, and the
   *  host sends the tap somewhere with something in it. */
  empty?: boolean;
  /** Sortable recency of this circle's NEWEST content — higher is newer. Feeds
      the newest-first order below; absent sorts last within its band. */
  newestAt?: number;
}

/**
 * Order the rail. This is the whole ordering contract, in one place, because it
 * was the reviewer's first question (2026-08-28):
 *
 *   1. the viewer's OWN circle (`kind: 'you'`) — always pinned first
 *   2. everything else WITH unseen content — newest first
 *   3. everything else, already seen — newest first
 *
 * There is no max: the rail scrolls.
 *
 * Two decisions worth keeping written down, because both look like bugs:
 *
 * · Dependents are NOT pinned. A kid competes on recency like any other circle
 *   (Maryna 2026-08-28) — if a kid has nothing new there is nothing to open,
 *   and the Menu's "Viewing as" switcher is the reliable way to reach them.
 * · We deliberately do NOT group or label by relationship (no "You / Your teams
 *   / Following" headers). Recency order and relationship order are mutually
 *   exclusive, and the viewer already recognises their own team and their own
 *   kids by crest, number and name. Relationship is answered by the trailing
 *   "Follow more" circle → Manage following, not by captions.
 */
export function orderStories(items: readonly StoryItem[]): StoryItem[] {
  const own = items.filter((s) => s.kind === 'you');
  const rest = items
    .filter((s) => s.kind !== 'you')
    .sort(
      (a, b) =>
        Number(!!b.unseen) - Number(!!a.unseen) || (b.newestAt ?? 0) - (a.newestAt ?? 0),
    );
  return [...own, ...rest];
}

/**
 * Followed player/team "stories" rail. Subtle ring on all; accent ring on the
 * active one. Ordering is the host's job via `orderStories` above — the rail
 * paints what it is given, so a team page can order differently.
 *
 * Differentiation is by RECOGNITION, not by position or caption: a person is a
 * jersey number on the brand fill, a team is its crest (or initials) on the
 * neutral plate, and the name sits under both.
 */
@Component({
  selector: 'halo-stories-rail',
  standalone: true,
  template: `
    <div class="stories">
      @for (s of items(); track s.label) {
        <button class="story" type="button" [class.on]="s.active"
          [class.unseen]="s.unseen && !s.active" [class.empty]="s.empty && !s.active"
          (click)="open.emit(s)">
          <span class="rg">
            <span class="im" [class.person]="isPerson(s)" [class.plate]="hasLogo(s)" [class.mono]="!isPerson(s) && !hasLogo(s)">
              @if (hasLogo(s)) {
                <img [src]="s.logo" alt="" (error)="onLogoFail(s.label)" />
              } @else {
                <span class="tx">{{ isPerson(s) ? s.number : initials(s.label) }}</span>
              }
            </span>
          </span>
          <span class="lb">{{ s.label }}</span>
        </button>
      }

      <!-- Trailing "Follow more" → Manage following. A SECOND entry point, not
           the only one (the Menu row is the primary), so it is fine that a long
           rail scrolls it out of view: it is on screen exactly when the rail is
           short, which is when a viewer still has following to do. On a brand
           new account it is the only circle, so it doubles as the empty state. -->
      @if (showAdd()) {
        <button class="story add" type="button" (click)="add.emit()">
          <span class="rg">
            <span class="im"><halo-icon name="plus" [size]="22" /></span>
          </span>
          <span class="lb">{{ addLabel() }}</span>
        </button>
      }
    </div>
  `,
  imports: [HaloIcon],
  styleUrl: './stories-rail.scss',
})
export class StoriesRail {
  items = input.required<StoryItem[]>();
  /** Render the trailing "Follow more" circle. */
  showAdd = input(false);
  /** One word: the 60px label column ellipsises anything longer, and "Follow"
   *  is the verb the rest of the app already uses (Follow all / Unfollow /
   *  Manage following). */
  addLabel = input(t('common.follow'));
  open = output<StoryItem>();
  add = output<void>();

  /** Logos that 404'd — those circles fall back to initials, same as the crest
   *  atom does, so a missing asset never leaves an empty white disc. */
  protected failed = signal<ReadonlySet<string>>(new Set());

  protected onLogoFail(label: string): void {
    this.failed.update((f) => new Set(f).add(label));
  }

  protected isPerson(s: StoryItem): boolean {
    return s.kind !== 'team';
  }
  protected hasLogo(s: StoryItem): boolean {
    return !!s.logo && !this.failed().has(s.label);
  }

  /** Club initials: one letter per word (max 2), or the first two letters of a
   *  single-word name — "Northside Flames" → NF, "Netsetters" → HO. */
  protected initials(label: string): string {
    const w = label.trim().split(/[\s·-]+/).filter(Boolean);
    const s = w.length > 1 ? w[0][0] + w[1][0] : (w[0] ?? '').slice(0, 2);
    return s.toUpperCase();
  }
}
