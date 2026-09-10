import { Component, computed, input, output } from '@angular/core';
import { Crest } from '../../atoms/crest/crest';
import { HaloIcon } from '../../atoms/icon/icon';
import { TPipe } from '../../../app/i18n/t.pipe';

export interface TeamRow { name: string; crest?: string; mono?: string; score?: number | null; win?: boolean; lo?: boolean; }

/** Match / ladder card (.lad): status chip + round, two-row team ladder, footer meta + CTA.
 *
 *  An UPCOMING card (`chipTone='up'`) is information only, and the rule lives
 *  here rather than at each call site so a new page cannot reintroduce it
 *  (2026-08-27): no card tap and no keyboard role. A fixture has no content of
 *  its own yet, and tapping a two-team card used to navigate to whichever team
 *  happened to be listed first. Live and finished cards keep opening the game.
 *
 *  Team names are plain text on EVERY variant: the card's own tap owns the
 *  whole surface, so a link inside it made one tap mean two destinations. */
@Component({
  selector: 'halo-ladder-card',
  standalone: true,
  imports: [Crest, HaloIcon, TPipe],
  template: `
    <article class="lad" [class.static]="!interactive()">
      <!-- The card used to BE a role=button with tabindex — with real <button> CTAs inside,
           which is nested-interactive (4.1.2) and an invalid role on <article>. A transparent
           overlay button carries "open the game"; the CTAs sit above it (a11y audit 2026-09-02 G5). -->
      @if (interactive()) {
        <button class="lad-open" type="button" [attr.aria-label]="'card.openGame' | t" (click)="tap()"></button>
      }
      <div class="lad-top">
        <span class="lchip" [class]="chipTone()">
          @if (chipTone() === 'live') { <span class="pz"></span> }
          {{ chipText() }}
        </span>
        @if (ctaStyle() === 'chip' && footCta()) {
          <span class="lrnd sm">{{ footMeta() }}</span>
          <button class="cta chip" [class.live]="chipTone() === 'live'" type="button" (click)="cta.emit(); $event.stopPropagation()">{{ footCta() }}<halo-icon name="chevron-right" [size]="12" /></button>
        } @else {
          <span class="lrnd">{{ metaLine() }}</span>
        }
      </div>

      @for (t of teams(); track t.name) {
        <div class="trow" [class.win]="t.win" [class.lo]="t.lo">
          <halo-crest [src]="t.crest || ''" [monogram]="t.mono || '?'" [size]="34" />
          <span class="nm">{{ t.name }}</span>
          @if (t.score !== null && t.score !== undefined) { <span class="sc num">{{ t.score }}</span> }
          @else { <span class="tm">–</span> }
        </div>
      }

      @if (ctaStyle() === 'row' && (footMeta() || footCta())) {
        <div class="lad-foot">
          <span class="mt">{{ footMeta() }}</span>
          @if (footCta()) {
            <button class="cta" type="button" (click)="cta.emit(); $event.stopPropagation()">{{ footCta() }}<halo-icon name="chevron-right" [size]="13" /></button>
          }
        </div>
      }
      @if (ctaStyle() === 'block' && footCta()) {
        <button class="cta block" [class.live]="chipTone() === 'live'" type="button" (click)="cta.emit(); $event.stopPropagation()">
          <halo-icon name="play" [size]="13" /> {{ footCta() }}
        </button>
      }
      @if (ctaStyle() === 'disc' && footCta()) {
        <button class="cta disc" [class.live]="chipTone() === 'live'" type="button" [attr.aria-label]="footCta()" (click)="cta.emit(); $event.stopPropagation()">
          <halo-icon name="play" [size]="16" />
        </button>
      }
    </article>
  `,
  styleUrl: './ladder-card.scss',
})
export class LadderCard {
  chipTone = input<'live' | 'fin' | 'up'>('up');
  chipText = input.required<string>();
  round = input('');
  teams = input<TeamRow[]>([]);
  footMeta = input('');
  /**
   * The round and the meta, joined by a dot ONLY when there are two of them.
   * It used to be `round + (footMeta ? ' · ' + footMeta : '')`, which is right
   * until the round is empty — and the team page passes no round, so every
   * card there opened with a dangling "· Yesterday · 7:30 PM" (Maryna
   * 2026-08-30). A separator belongs between two things, never in front of one.
   */
  protected metaLine = computed(() =>
    [this.round(), this.ctaStyle() !== 'row' ? this.footMeta() : '']
      .filter(Boolean)
      .join(' · '));
  footCta = input('');
  /** CTA treatment: 'row' footer link (default) · 'block' full-width pill ·
      'chip' compact pill in the top row · 'disc' floating play disc. */
  ctaStyle = input<'row' | 'block' | 'chip' | 'disc'>('row');
  /** Footer CTA tap (Watch live / replay) — routes to the player. */
  cta = output<void>();
  /** Whole-card tap — routes to the game detail page (proto parity). Never
   *  emitted for an upcoming fixture. */
  open = output<void>();

  /** Upcoming fixtures are read-only; everything else opens its game. */
  protected interactive = computed(() => this.chipTone() !== 'up');

  protected tap(): void {
    if (this.interactive()) this.open.emit();
  }
  protected onSpace(e: Event): void {
    if (!this.interactive()) return;
    e.preventDefault();
    this.open.emit();
  }
}
