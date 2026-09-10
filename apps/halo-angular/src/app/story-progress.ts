import { Injectable, computed, inject, signal } from '@angular/core';
import { ReelStore } from './reel-store';
import { teammateReelById } from './teammate-reels';

export type StoryKind = 'you' | 'kid' | 'team' | 'player' | undefined;

/**
 * HOW MUCH OF A CIRCLE HAS BEEN WATCHED.
 *
 * The stories rail's accent ring means "there is something in here you have not
 * seen". It used to clear on the TAP — the circle went grey the instant you
 * opened it, before the player had rendered a frame, so a circle holding three
 * highlights was marked finished after the first one and the two behind it were
 * unreachable by ring (Maryna 2026-09-02). The ring now clears only when every
 * item in the circle has actually been shown.
 *
 * Progress is per ITEM, not per circle, because that is the only granularity
 * that can answer "did you see all of it". The player is what knows: it reports
 * each item as it puts it on screen, through `markItem`.
 *
 * Prototype seams, both named so they are not mistaken for the product:
 *
 * · `opened` is how the player learns WHICH circle it is crediting. A real
 *   implementation would carry the circle's id in the route rather than in a
 *   service; the route today is a bare /watch/highlight.
 * · What is "in" a circle is derived from the prototype's own content: a person
 *   circle holds their reel's moments, a team circle holds one game recap.
 *   The backend owns this, along with the window that decides how long an item
 *   counts as new at all (a week, per the competition's own cadence).
 *
 * Nothing here persists: a reload starts everything unseen again, same as the
 * set it replaces.
 */
@Injectable({ providedIn: 'root' })
export class StoryProgress {
  private reel = inject(ReelStore);

  /** Circle label → the item keys shown so far. Torres starts finished, so the
   *  grey "nothing new" ring is visible on first load next to the accent ones
   *  rather than only after watching something (Maryna 2026-09-02). Keyed by
   *  the moment's action, the same key the reel player reports. */
  private seen = signal<Record<string, ReadonlySet<string>>>({
    Torres: new Set(teammateReelById('torres')?.clips.map((c) => c.action) ?? []),
  });

  /** Which circle the open player belongs to, set on the tap that opened it. */
  readonly opened = signal<string | null>(null);

  /** Prototype seed: circles whose item count is not the default for their kind.
   *  Vikings is deliberately at zero so the EMPTY state is on screen without
   *  anyone having to watch their way into it (Maryna 2026-09-02). The backend
   *  owns this number, together with the window that decides how long an item
   *  counts as new at all. */
  private static readonly ITEMS: Record<string, number> = { Vikings: 0 };

  /** How many items a circle holds. A person's circle is their reel (a followed
   *  player's, the reel behind `reelId`); a team's is the one game recap. Zero
   *  means the circle is EMPTY, which is a state of its own and never rings — an
   *  accent ring is a promise of content. */
  total(label: string, kind: StoryKind, reelId?: string): number {
    const override = StoryProgress.ITEMS[label];
    if (override !== undefined) return override;
    if (kind === 'player') return teammateReelById(reelId ?? '')?.clips.length ?? 0;
    return kind === 'team' ? 1 : this.reel.moments().length;
  }

  /** Nothing inside — a state of its own, and not the same as "seen it all". */
  isEmpty(label: string, kind: StoryKind, reelId?: string): boolean {
    return this.total(label, kind, reelId) === 0;
  }

  seenCount(label: string): number { return this.seen()[label]?.size ?? 0; }

  /** The ring's whole condition: something in here, and not all of it seen. */
  unseen(label: string, kind: StoryKind, reelId?: string): boolean {
    const total = this.total(label, kind, reelId);
    return total > 0 && this.seenCount(label) < total;
  }

  /** The player reporting one item onto the screen. Idempotent: re-watching an
   *  item cannot un-see it, and a Set makes repeats free. */
  markItem(label: string, key: string): void {
    if (!label || !key) return;
    this.seen.update((m) => {
      const next = new Set(m[label] ?? []);
      if (next.has(key)) return m;
      next.add(key);
      return { ...m, [label]: next };
    });
  }

  /** Marks the item the currently open circle is showing. */
  markCurrent(key: string): void {
    const label = this.opened();
    if (label) this.markItem(label, key);
  }

  /** Total items seen across every circle — a review aid, not product state. */
  readonly totalSeen = computed(() =>
    Object.values(this.seen()).reduce((n, s) => n + s.size, 0));
}
