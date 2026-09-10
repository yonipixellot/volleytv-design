import { Component, DestroyRef, ElementRef, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { DecimalPipe, Location } from '@angular/common';
import { gameVideo } from '../../../media-manifest';
import { StoryProgress } from '../../../story-progress';
import { Router } from '@angular/router';
import { TeamName } from '../../../../lib/atoms/team-name/team-name';
import { teamIdOf } from '../../../team-data';
import { HaloIcon } from '../../../../lib/atoms/icon/icon';
import { HaloButton } from '../../../../lib/atoms/button/button';
import { Score } from '../../../../lib/atoms/score/score';
import { t, fmtShortDay } from '../../../i18n/i18n';
import { TPipe } from '../../../i18n/t.pipe';
// import { ShareState } from '../../../share-state'; // archived 2026-08-26, see below

/** "m:ss" or "h:mm:ss" to seconds; 0 when unparseable. */
const secs = (t: string): number =>
  t.split(':').reduce((acc, part) => acc * 60 + (parseInt(part, 10) || 0), 0);

/** Seconds back to "m:ss", or "h:mm:ss" once it passes an hour. */
const fmt = (s: number): string => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
};

/** VOD viewer — full-game / recap / highlights playback with scrubber + title;
    missing-video fallback. */
/** The kind's display name. `kind` arrives from the URL and is absent on a direct load
 *  of /watch/vod, so it falls back to the full game rather than throwing: a thrown
 *  computed here aborted the template and blanked every control (Yoni 2026-09-07). */
const KIND_LABEL = (k: string | undefined): string =>
  ({ full: t('kind.fullGame'), recap: t('kind.recap'), highlights: t('home.gameHighlights') } as Record<string, string>)[k ?? 'full'] ?? t('kind.fullGame');

@Component({
  selector: 'halo-vod-page',
  standalone: true,
  imports: [HaloIcon, HaloButton, TeamName, Score, TPipe, DecimalPipe],
  templateUrl: './vod.html',
  styleUrl: './vod.scss',
})
export class VodPage {
  protected readonly meta = `${t('comp.mondayMen14')} · ${t('grade.open')} · ${fmtShortDay(new Date(2026, 4, 12))}`;
  teamIdOf = teamIdOf;
  openTeam(id: string): void { void this.router?.navigate(['/team', id]); }
  private router = inject(Router, { optional: true });
  private progress = inject(StoryProgress);
  private location = inject(Location, { optional: true });

  /**
   * Fullscreen is a CSS takeover, NOT the Fullscreen API, for two reasons that
   * both come from the ticket (loader / team names / link to the game page):
   *
   * 1. `Element.requestFullscreen` does not exist on iPhone Safari, so the old
   *    `requestFullscreen?.()` was a silent no-op there — the button did
   *    nothing on a large part of a mobile-first audience.
   * 2. The only native fullscreen iOS offers is `video.webkitEnterFullscreen()`,
   *    which hands the screen to Apple's own player and takes OUR chrome with
   *    it. The team names and the game-page link could not exist inside it, so
   *    native fullscreen cannot satisfy the ticket at all.
   *
   * A fixed, viewport-filling overlay keeps our chrome and behaves the same on
   * both platforms. Orientation is CSS too: `screen.orientation.lock()` is
   * Android-only, so portrait rotates the frame with a transform the way mobile
   * web players do, instead of asking an API iOS does not have (2026-08-28).
   */
  protected fs = signal(false);
  toggleFullscreen(): void { this.fs.update((v) => !v); }
  // Share archived 2026-08-26: no sharing anywhere yet. Kept here, commented,
  // so ShareState wiring can be restored later without rebuilding it.
  // private share = inject(ShareState);

  /** What's playing: drives the eyebrow chip, the fallback copy AND the clock.
   *  'highlights' added 2026-08-27 — Home's highlights rail lands here too and
   *  used to be labelled FULL GAME. */
  kind = input<'full' | 'recap' | 'highlights'>('full');

  /** A team circle holds exactly one item, its game recap, so showing the recap
   *  IS the whole circle and the rail's ring clears here. Reported by the player
   *  rather than by the tap that opened it, for the same reason the reel does:
   *  opening is not watching (Maryna 2026-09-02). Only for `recap` — the same
   *  player also serves the Full games and Game highlights rails, which no
   *  circle owns. */
  private reportSeen = effect(() => {
    if (this.kind() === 'recap') this.progress.markCurrent('recap');
  });
  /** When true, the video isn't ready — show the fallback instead of the player. */
  missing = input(false);

  /** Which game this is playing, so "Go to the game page" targets it. Absent
   *  (Home rails, deep links) falls back to the unparameterised /game. */
  game = input('');
  /** Where the player was opened from. `from=game` hides the game-page link:
   *  you are already there (Maryna 2026-08-28). */
  from = input('');
  protected showGameLink = computed(() => this.from() !== 'game');
  /** From 768 the metadata block is a ROW (text left, button right, see .title
   *  in vod.scss) and the button drops to `sm`: beside two lines of text a 44px
   *  block reads as a slab, and a pointer does not need the touch floor. Below
   *  768 it stacks under the text at the default size, because a phone does
   *  need it and long club names leave no room beside them. Same matchMedia
   *  pattern as RailCapacity: ask the query the CSS asked, not innerWidth. */
  private readonly wideMq = typeof window === 'undefined' ? null : window.matchMedia('(min-width: 768px)');
  protected wide = signal(this.wideMq?.matches ?? false);
  private readonly watchWide = (() => {
    if (!this.wideMq) return;
    const mq = this.wideMq;
    const read = () => this.wide.set(mq.matches);
    mq.addEventListener('change', read);
    inject(DestroyRef).onDestroy(() => mq.removeEventListener('change', read));
  })();
  goToGamePage(): void {
    void this.router?.navigate(this.game() ? ['/game', this.game()] : ['/game']);
  }

  /* Loader — the designed states, now ALSO fed by the real element.
     Until 2026-09-09 there was no <video> here (the frame was an <img>), so
     these were query-param-only: reviewable states standing in for events that
     did not exist yet (Maryna 2026-08-28: "відео поки не додавай, лоадер як
     стан"). Real footage landed, so `waiting` / `playing` / `canplay` now drive
     `stalled` — and the params are KEPT, because Storybook and design review
     still need to summon either state on demand without stalling a network.
       ?loading=1   first paint, nothing buffered yet — no controls
       ?buffering=1 stalled mid-playback — controls stay, spinner over the frame */
  // Public so Storybook can drive the two states as args (see vod.stories.ts).
  loadingParam = input('', { alias: 'loading' });
  bufferingParam = input('', { alias: 'buffering' });
  /** The element's own stall, as reported by `waiting` / `playing`. */
  protected stalled = signal(false);
  protected loading = computed(() => this.loadingParam() === '1');
  protected buffering = computed(() => this.bufferingParam() === '1' || this.stalled());

  /** Which file plays — see `media-manifest.ts`. */
  protected videoSrc = computed(() => gameVideo(this.kind()));
  private vidEl = viewChild<ElementRef<HTMLVideoElement>>('vid');

  /** Real clock, once the element reports it. Zero until metadata lands, which
   *  is what keeps the seeded RUNTIME labels below on screen in the meantime
   *  rather than flashing "0:00 of 0:00". */
  private dur = signal(0);
  private cur = signal(0);
  private buffEnd = signal(0);

  onMeta(): void {
    const v = this.vidEl()?.nativeElement;
    if (!v) return;
    this.dur.set(Number.isFinite(v.duration) ? v.duration : 0);
    // The chrome paints `playing` true on arrival, so honour it. Autoplay is
    // only allowed muted, and a rejected promise is normal (a browser that
    // refuses just leaves the poster up) — it must not reach the console as an
    // unhandled rejection.
    if (this.playing()) void v.play().catch(() => this.playing.set(false));
  }

  onTime(): void {
    const v = this.vidEl()?.nativeElement;
    if (!v) return;
    this.cur.set(v.currentTime);
    if (!this.dur() && Number.isFinite(v.duration)) this.dur.set(v.duration);
    this.buffEnd.set(v.buffered.length ? v.buffered.end(v.buffered.length - 1) : 0);
  }

  /** Click anywhere on the bar seeks there. */
  seekTo(ev: MouseEvent): void {
    const bar = ev.currentTarget as HTMLElement | null;
    const v = this.vidEl()?.nativeElement;
    if (!bar || !v || !this.dur()) return;
    const r = bar.getBoundingClientRect();
    if (!r.width) return;
    v.currentTime = Math.min(this.dur(), Math.max(0, ((ev.clientX - r.left) / r.width) * this.dur()));
    this.onTime();
  }

  /** Arrows nudge 5s, Home/End jump the ends — the slider role promises both. */
  onScrubKey(ev: KeyboardEvent): void {
    const v = this.vidEl()?.nativeElement;
    if (!v || !this.dur()) return;
    const step = ({ ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5 } as Record<string, number>)[ev.key];
    let to: number | null = step !== undefined ? v.currentTime + step : null;
    if (ev.key === 'Home') to = 0;
    if (ev.key === 'End') to = this.dur();
    if (to === null) return;
    ev.preventDefault();
    v.currentTime = Math.min(this.dur(), Math.max(0, to));
    this.onTime();
  }
  /** Buffered-ahead share of the bar. Sits behind the played fill so a stall
   *  reads as "there is more downloaded than played", the way it does in a real
   *  player. Real `buffered` once the element reports a range; the seeded step
   *  ahead of progress is the fallback for the design-only states, where there
   *  is no network to have downloaded anything. */
  protected bufferedPct = computed(() => {
    const d = this.dur();
    if (d && this.buffEnd()) return Math.min(100, (this.buffEnd() / d) * 100);
    return Math.min(100, this.progressPct() + 18);
  });

  /* Runtime shown in the controls. Recaps and highlights are SHORT (the app's
     own data says so: game.ts recap 3:07, events-data highlights 1:36–2:15),
     so the player must not show full-game numbers on them — it read "12:04 of
     1:42:10" on a 3-minute recap until 2026-08-27. Elapsed and total live
     together here, and the scrubber is computed FROM them, so the bar can
     never disagree with the clock the way a hardcoded 12% width could.
     `total`/`at` are optional query inputs for a caller with real values. */
  private static readonly RUNTIME: Record<string, { at: string; total: string }> = {
    full: { at: '12:04', total: '1:42:10' },
    recap: { at: '0:58', total: '3:07' },
    highlights: { at: '0:31', total: '1:44' },
  };
  protected kindLabel = computed(() =>
    KIND_LABEL(this.kind()).toUpperCase());
  /** Sentence-case noun for the "… not available yet." fallback. */
  protected kindNoun = computed(() =>
    KIND_LABEL(this.kind()));

  at = input('');
  total = input('');
  private runtime = computed(() => VodPage.RUNTIME[this.kind()] ?? VodPage.RUNTIME['full']);
  /** The element's duration wins once it exists: the seeded numbers were the
   *  only truth available while the frame was a still, and a real 4:00 match
   *  must not advertise 1:42:10. An explicit `total=` still overrides both, for
   *  a caller that knows better, and the seed covers the pre-metadata frame. */
  protected totalLabel = computed(() =>
    this.total() || (this.dur() ? fmt(Math.round(this.dur())) : this.runtime().total));
  /** Elapsed: an explicit `at`, else ~30% of whatever the total actually is.
   *  Derived rather than fixed so a caller-supplied duration can never end up
   *  shorter than the elapsed time beside it (a 0:14 clip reading "0:31 of
   *  0:14"). Falls back to the per-kind default when no total was passed. */
  protected atLabel = computed(() => {
    if (this.dur()) return fmt(Math.round(this.cur()));
    if (this.at()) return this.at();
    if (!this.total()) return this.runtime().at;
    return fmt(Math.round(secs(this.total()) * 0.3));
  });
  /** Scrubber fill %, derived from the two labels above. */
  protected progressPct = computed(() => {
    const a = secs(this.atLabel());
    const t = secs(this.totalLabel());
    if (!t) return 0;
    return Math.min(100, Math.max(0, (a / t) * 100));
  });

  playing = signal(true);
  muted = signal(false);

  toggle() {
    const next = !this.playing();
    this.playing.set(next);
    const v = this.vidEl()?.nativeElement;
    if (!v) return;
    if (next) void v.play().catch(() => this.playing.set(false));
    else v.pause();
  }
  /** `[muted]` on the template is a property binding, so the element follows
   *  the signal on its own — this only flips it. Unmuting after an autoplay
   *  start can be refused by the browser, which is the platform's call to make,
   *  not ours to work around. */
  toggleMute() { this.muted.update((m) => !m); }
  // openShare() {
  //   this.share.open({
  //     title: 'Netsetters 1 vs Vikings Grey',
  //     sub: (this.kind() === 'recap' ? 'Recap' : 'Full game') + ' · Sun 12 May',
  //   });
  // }
  /** Back = wherever the viewer came from (Yuval 2026-08-23); /home only when
      the player IS the entry point (deep link — no in-app history to pop). */
  close() {
    if (this.location && (window.history.state?.navigationId ?? 1) > 1) this.location.back();
    else this.router?.navigate(['/home']);
  }
}
