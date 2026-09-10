import { Component, effect, computed, inject, input, signal } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { IconButton } from '../../../../lib/atoms/icon-button/icon-button';
import { HaloIcon } from '../../../../lib/atoms/icon/icon';
import { ViewContext } from '../../../view-context';
import { UpgradeState } from '../../../upgrade-state';
import { ShareState } from '../../../share-state';
import { ToastState } from '../../../toast-state';
import { ReelStore, ReelMoment } from '../../../reel-store';
import { StoryProgress } from '../../../story-progress';
import { TEAMMATE_REELS, teammateReelById } from '../../../teammate-reels';
import { isClipLocked, isPremiumPlay } from '../../../clip-access';
import { reelVideo } from '../../../media-manifest';
import { PremiumTicket } from '../../../../lib/molecules/premium-ticket/premium-ticket';
import { TeamName } from '../../../../lib/atoms/team-name/team-name';
import { Score } from '../../../../lib/atoms/score/score';
import { teamIdOf } from '../../../team-data';
import { tr } from '../../../i18n/i18n';
import { TPipe } from '../../../i18n/t.pipe';

/** One reel moment — captioned by its ACTION (Assist / Block…), not a punchy
 *  clip title; the reel itself is titled "#7 Player Highlights" (Yoni 2026-08-23).
 *  The moments live in the shared ReelStore so removal reflects in You › Clips. */
type Clip = ReelMoment;

/** Highlight viewer — Instagram-style vertical story player. Flat BA.
 *  This is the athlete's OWN reel, so it's tier-gated per `clip-access`:
 *  premium sees all, basic loses digs/blocks, free is fully locked. */
@Component({
  selector: 'halo-highlight-page',
  standalone: true,
  imports: [IconButton, HaloIcon, PremiumTicket, TeamName, Score, TPipe],
  templateUrl: './highlight.html',
  styleUrl: './highlight.scss',
})
export class HighlightPage {
  private router = inject(Router, { optional: true });
  private location = inject(Location, { optional: true });
  private vc = inject(ViewContext);
  private upgrade = inject(UpgradeState);
  private shareState = inject(ShareState);
  private toast = inject(ToastState);
  private reel = inject(ReelStore);
  private progress = inject(StoryProgress);

  /** ?player=<id> — open a TEAMMATE's reel instead of the viewer's own (the
   *  game page's Highlights › Teammates grid passes it). Absent = own reel,
   *  which is the only one that is "Yours" and the only one downloadable. */
  playerId = input('', { alias: 'player' });
  /**
   * SINGLE-CLIP MODE — `?clip=<title>&thumb=<file>`.
   *
   * You › Clips is a library, not a story: each tile is one clip the athlete
   * owns, and tapping it means "play this one". Opening the whole reel there
   * put the viewer inside somebody's story — a progress bar of eight segments,
   * neighbours either side, arrows to other people — when they had asked for
   * one video (Maryna 2026-08-30). The story chrome is what a CIRCLE opens; a
   * tile opens its own clip and nothing else.
   *
   * The two params carry everything the page renders, so the clip is
   * deep-linkable without a shared store: You's folders are page data, and a
   * prototype with no real video needs only the caption and the frame.
   */
  clip = input('');
  clipThumb = input('', { alias: 'thumb' });
  // `?? ''` on EVERY query-bound input. `withComponentInputBinding` writes
  // `undefined` into an input whose query param is absent — it does not leave
  // the declared default — so `this.clip().trim()` threw on the ordinary reel,
  // the one with no ?clip at all, and the whole viewer rendered blank. Second
  // time this exact trap has bitten (Maryna 2026-08-30).
  protected single = computed(() => (this.clip() ?? '').trim().length > 0);

  /** Which game the reel belongs to, and where the reel was opened from — see
   *  goToGamePage() below. */
  game = input('');
  from = input('');
  protected showGameLink = computed(() => (this.from() ?? '') !== 'game');
  private teammate = computed(() => teammateReelById(this.playerId() ?? '') ?? null);
  /** Own reel? Drives the Yours badge, the title AND download visibility. */
  protected isOwn = computed(() => this.teammate() === null);

  private ownJersey = 7;
  protected jersey = computed(() => this.teammate()?.jersey ?? this.ownJersey);
  // "Player Highlights" names a REEL. One clip out of the library is not that,
  // and labelling it so promised a story the screen does not contain.
  protected sectionLabel = computed(() =>
    this.single() ? tr('watch.yourClip') : this.isOwn() ? tr('watch.playerHighlights') : tr('watch.teammate'));
  /** Reel title — every moment carries the REEL's identity, not its own name,
   *  so a teammate's reel is titled by that player, never "#7". */
  protected reelTitle = computed(() => {
    if (this.single()) return this.clip() ?? '';
    const t = this.teammate();
    return t ? `#${t.jersey} ${t.name} ${tr('kind.highlights')}` : `#${this.ownJersey} ${tr('watch.playerHighlights')}`;
  });
  /**
   * THE DECK — every reel this viewer can move between, in one order: their own
   * first, then the teammates. It exists because a reel on a phone is the whole
   * screen and a reel on a desktop is a card in the middle of one, and the room
   * either side of it is the affordance Instagram uses: the neighbouring reels
   * sit there, dimmed, one click away. Without it the desktop viewer could only
   * go BACK to the grid and in again to see the next player (Maryna 2026-08-30).
   *
   * Same list the game page's Teammates grid reads, so the deck and the grid
   * can never disagree about who is on the team.
   */
  protected deck = computed(() => [
    { id: '', title: `#${this.ownJersey} ${tr('watch.playerHighlights')}`, thumb: this.reel.moments()[0]?.thumb ?? '' },
    ...TEAMMATE_REELS.map((r) => ({
      id: r.id, title: `#${r.jersey} ${r.name}`, thumb: r.clips[0]?.thumb ?? '',
    })),
  ]);
  private deckIdx = computed(() => Math.max(0, this.deck().findIndex((r) => r.id === (this.playerId() ?? ''))));
  // Null in single-clip mode: there is no reel to walk sideways from, so the
  // neighbours and both arrows stand down with the rest of the story chrome.
  protected prevReel = computed(() => (this.single() ? null : this.deck()[this.deckIdx() - 1] ?? null));
  protected nextReel = computed(() => (this.single() ? null : this.deck()[this.deckIdx() + 1] ?? null));
  /**
   * Switch reels. `player` is dropped for the own reel so the URL of "mine"
   * stays the plain one, and every other param (game, from) is kept.
   *
   * REPLACE, never push. Moving sideways in the deck is not navigation, it is
   * the same viewing session continuing — and pushing made both exits lie: the
   * corner close pops one entry, so from the middle of the deck it turned back
   * a reel instead of leaving, and the browser's own back button walked the
   * deck in reverse before it ever reached the page you came from (Maryna
   * 2026-08-30).
   */
  openReel(id: string): void {
    void this.router?.navigate([], {
      queryParams: { player: id || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
  /** A new reel starts at its first moment. The router reuses this component
   *  across the query-param change, so the index does not reset itself. */
  private reelChanged = effect(() => { this.playerId(); this.clip(); this.i.set(0); this.showUpsell.set(false); });

  /** Every moment this reel puts on screen is reported to the circle that
   *  opened it, so the rail's ring clears on the LAST one rather than on the
   *  tap. Keyed by the moment's action, which is what identifies a moment
   *  everywhere else in the app (ReelStore removes by it too).
   *
   *  A locked moment still counts as shown: the viewer has seen everything this
   *  circle is going to give them at their tier, so leaving the ring lit would
   *  promise content the tier does not include. */
  private reportSeen = effect(() => {
    const key = this.current().action;
    if (key) this.progress.markCurrent(key);
  });

  home = { name: 'Netsetters 1', mono: 'NS', score: 3, crest: 'img/logo-netsetters.svg' };
  away = { name: 'Vikings Grey', mono: 'VG', score: 1, crest: 'img/team-vikings-grey.svg' };

  clips = computed<Clip[]>(() =>
    this.single()
      ? [{ action: this.clip() ?? '', thumb: (this.clipThumb() ?? '') || 'img/clip-1.webp' }]
      : this.teammate()?.clips ?? this.reel.moments());
  i = signal(0);
  /** Clamped so a removal that shortens the reel never indexes past the end;
      the empty-reel fallback only paints the frame while close() navigates. */
  current = computed<Clip>(() => {
    const c = this.clips();
    return c[Math.min(this.i(), c.length - 1)] ?? { action: '', thumb: '' };
  });

  /** The footage behind the moment on screen — '' when there is none for this
   *  poster, which is the template's cue to keep the still. See
   *  `media-manifest.ts` for why the mapping lives away from the reel data. */
  protected clipVideo = computed(() => reelVideo(this.current().thumb));

  /** Per-clip tier gate (own reel) — keyed on the moment's action. */
  clipLocked = (c: Clip): boolean => isClipLocked(c.action, this.vc.tier());
  clipPremium = (c: Clip): boolean => isPremiumPlay(c.action);
  currentLocked = computed(() => isClipLocked(this.current().action, this.vc.tier()));
  /** "and N more from this game" — locked clips beyond the one on screen. */
  lockedMore = computed(() =>
    Math.max(this.clips().filter((c) => this.clipLocked(c)).length - 1, 0),
  );
  /** Next playable clip AFTER the current one (PT FR4) — null hides the skip
      so an all-locked reel offers no free path forward. */
  nextFree = computed(() => {
    for (let k = this.i() + 1; k < this.clips().length; k++) {
      if (!this.clipLocked(this.clips()[k])) return k;
    }
    return null;
  });
  skipToFree() { const k = this.nextFree(); if (k !== null) this.i.set(k); }

  /** Terminal upsell: basic reel that contains gated premium plays. */
  private hasGatedPremium = computed(() => this.clips().some((c) => this.clipLocked(c)));
  showUpsell = signal(false);

  prev() {
    if (this.showUpsell()) { this.showUpsell.set(false); return; }
    this.i.update((v) => Math.max(0, v - 1));
  }
  next() {
    if (this.showUpsell()) { this.close(); return; }
    if (this.i() < this.clips().length - 1) this.i.update((v) => v + 1);
    else if (this.hasGatedPremium() && this.vc.tier() !== 'premium') this.showUpsell.set(true);
    else this.close();
  }

  teamIdOf = teamIdOf;
  openTeamId(id: string): void { void this.router?.navigate(['/team', id]); }
  openUpgrade() { this.upgrade.open(); }
  /** Primary CTA → the game PAGE (hub: stats/recap/lineups), not the player (Yoni 2026-08-23). */
  /** Same contract as the VOD / live players: target the game being watched,
   *  and stand down when the reel was opened FROM the game page. The reel needs
   *  no fullscreen handling — all of its chrome is already an overlay on the
   *  video, so this link survives without help (2026-08-28). */
  goToGamePage() {
    const g = this.game() ?? '';
    void this.router?.navigate(g ? ['/game', g] : ['/game']);
  }
  // Share archived 2026-08-26: Player Highlights has no share affordance
  // (users can't share their own player reel). Kept here, commented, so the
  // ShareSheet wiring (incl. the ?share=1 deep link) can be restored later
  // without rebuilding it.
  //
  // /** Opens the shared ShareSheet. Export ("this moment / all moments") lives
  //     inside the sheet now — the standalone Download control was retired (proto D12). */
  // /** ?share=1 (clip-ready notification deep link, CM-1417): the clip's
  //  *  download/share experience — the sheet auto-raises over the clip. */
  // autoShare = input('', { alias: 'share' });
  // private autoShareFx = effect(() => {
  //   if (this.autoShare()) setTimeout(() => this.share(), 700);
  // });
  //
  // share() {
  //   this.shareState.open({
  //     title: this.reelTitle,
  //     sub: this.current().action,
  //     showScope: true,
  //   });
  // }

  /** Download — replaces the archived share affordance above (2026-08-26).
   *  OWN highlights only: you can download your own clips, never a
   *  teammate's, so the template omits the control entirely when
   *  `isOwn()` is false rather than showing it disabled — an unavailable
   *  action shouldn't advertise itself. Stubbed to a toast until the real
   *  export flow (editor hand-off) ships. */
  download(): void {
    this.toast.show(tr('watch.editorToast'), 'neutral');
  }

  /** Back = wherever the viewer came from (Yuval 2026-08-23); /home only when
      the player IS the entry point (deep link — no in-app history to pop). */
  close() {
    if (this.location && (window.history.state?.navigationId ?? 1) > 1) this.location.back();
    else this.router?.navigate(['/home']);
  }
}
