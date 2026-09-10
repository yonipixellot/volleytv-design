import { Component, ElementRef, computed, inject, signal, viewChild, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { TeamName } from '../../../../lib/atoms/team-name/team-name';
import { Score } from '../../../../lib/atoms/score/score';
import { teamIdOf } from '../../../team-data';
import { HaloIcon } from '../../../../lib/atoms/icon/icon';
import { LIVE_VIDEO } from '../../../media-manifest';
import { t } from '../../../i18n/i18n';
import { TPipe } from '../../../i18n/t.pipe';
// import { ShareState } from '../../../share-state'; // archived 2026-08-26, see below

/** Live player — full-bleed feed, LIVE pill + ticking clock, score, auto-hiding glass controls. */
@Component({
  selector: 'halo-live-player-page',
  standalone: true,
  imports: [HaloIcon, TeamName, Score, TPipe],
  templateUrl: './live.html',
  styleUrl: './live.scss',
})
export class LivePlayerPage implements OnDestroy {
  protected readonly meta = `${t('comp.mondayMen14')} · ${t('grade.open')} · ${t('watch.court', { n: 2 })}`;
  teamIdOf = teamIdOf;
  openTeam(id: string): void { void this.router?.navigate(['/team', id]); }
  private router = inject(Router, { optional: true });
  private location = inject(Location, { optional: true });

  /** CSS takeover, not the Fullscreen API — same reasoning as the VOD player,
   *  see the long note on `fs` in vod.ts (iPhone has no
   *  Element.requestFullscreen, and its native video fullscreen would take our
   *  chrome, and with it the team names and the game link, off the screen). */
  protected fs = signal(false);
  toggleFullscreen(): void {
    this.fs.update((v) => !v);
    this.reveal();
  }

  /* No "go to the game page" link here, unlike the VOD player: the game page
     has no live state, and nothing in the live flow links to it. See the note
     in live.html. */
  // Share archived 2026-08-26: no sharing anywhere yet. Kept here, commented,
  // so ShareState wiring can be restored later without rebuilding it.
  // private share = inject(ShareState);

  /** Which file plays — see `media-manifest.ts`. Every live entry point lands
   *  on this one player, so one demo file stands in for all of them. */
  protected videoSrc = LIVE_VIDEO;
  private vidEl = viewChild<ElementRef<HTMLVideoElement>>('vid');

  playing = signal(true);
  /** Live autostarts muted (proto parity, Yoni 2026-07-12); speaker toggles it. */
  muted = signal(true);
  /** The on-air match clock — independent of the demo file's own (looping)
   *  position, the way a real broadcast clock never resets with the feed. */
  private secs = signal(1240);
  private timer = setInterval(() => this.playing() && this.secs.update((s) => s + 1), 1000);

  // controls auto-hide: hidden after 3s idle; a tap/move reveals them
  controlsShown = signal(true);
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  runtime = computed(() => {
    const m = Math.floor(this.secs() / 60);
    const s = this.secs() % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  });

  constructor() { this.armHide(); }
  ngOnDestroy() {
    clearInterval(this.timer);
    if (this.hideTimer) clearTimeout(this.hideTimer);
  }

  private armHide() {
    if (this.hideTimer) clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => this.controlsShown.set(false), 3000);
  }
  reveal() {
    this.controlsShown.set(true);
    this.armHide();
  }
  toggle() {
    const next = !this.playing();
    this.playing.set(next);
    this.reveal();
    const v = this.vidEl()?.nativeElement;
    if (!v) return;
    if (next) void v.play().catch(() => this.playing.set(false));
    else v.pause();
  }
  /** Autoplay start, once the element exists — same rejected-promise handling
   *  as the VOD player (a refusing browser just leaves the poster up). */
  onMeta(): void {
    const v = this.vidEl()?.nativeElement;
    if (v && this.playing()) void v.play().catch(() => this.playing.set(false));
  }
  toggleMute() {
    this.muted.update((m) => !m);
    this.reveal();
  }
  // openShare() {
  //   this.reveal();
  //   this.share.open({
  //     title: 'Netsetters 1 vs Vikings Grey',
  //     sub: 'Live · Monday Men 14 - 2026 Winter · Open',
  //   });
  // }
  /** Back = wherever the viewer came from (Yuval 2026-08-23); /home only when
      the player IS the entry point (deep link — no in-app history to pop). */
  close() {
    if (this.location && (window.history.state?.navigationId ?? 1) > 1) this.location.back();
    else this.router?.navigate(['/home']);
  }
}
