import { Component, computed, input, output, signal } from '@angular/core';
import { HaloIcon } from '../../atoms/icon/icon';
import { t } from '../../../app/i18n/i18n';
import { TPipe } from '../../../app/i18n/t.pipe';

export interface ShareTarget { id: string; label: string; }
export type ShareScope = 'moment' | 'full';

/**
 * ShareSheet — the slide-up share surface reused by every player (live / VOD /
 * highlight), mirroring the proto's single ShareSheet. A row of share targets
 * (Copy link, Message, Email, More) over an optional "this moment / all
 * moments" export scope. Copy-link is functional (clipboard); other targets
 * emit `share` for the host to route. Accessible dialog (Esc + backdrop close).
 */
@Component({
  // `title` is a global HTML attribute, so a static `title="…"` in a caller's
  // template stays on the HOST and the browser raises its own tooltip over the
  // component — duplicating text already on screen (Maryna 2026-08-30). The
  // input keeps its natural name; the host simply stops carrying it.
  host: { '[attr.title]': 'null' },
  selector: 'halo-share-sheet',
  standalone: true,
  imports: [HaloIcon, TPipe],
  template: `
    @if (open()) {
      <div class="scrim" (click)="close.emit()"></div>
      <div class="sheet" role="dialog" aria-modal="true" [attr.aria-label]="'Share ' + title()"
           tabindex="-1" (keydown)="onKey($event)">
        <span class="grip" aria-hidden="true"></span>

        <div class="hd">
          <div class="ic"><halo-icon name="share" [size]="17" /></div>
          <div class="txt">
            <div class="t">{{ title() }}</div>
            @if (sub()) { <div class="s">{{ sub() }}</div> }
          </div>
        </div>

        @if (showScope()) {
          <div class="scope" role="radiogroup" [attr.aria-label]="'share.what' | t">
            <button class="sc" type="button" role="radio" [attr.aria-checked]="scope() === 'moment'"
                    [class.on]="scope() === 'moment'" (click)="scope.set('moment')">{{ 'share.thisMoment' | t }}</button>
            <button class="sc" type="button" role="radio" [attr.aria-checked]="scope() === 'full'"
                    [class.on]="scope() === 'full'" (click)="scope.set('full')">{{ 'share.allMoments' | t }}</button>
          </div>
        }

        <div class="targets">
          <button class="tg" type="button" (click)="copyLink()">
            <span class="ti"><halo-icon [name]="copied() ? 'check' : 'globe'" [size]="18" /></span>
            <span class="tl">{{ copied() ? ('share.copied' | t) : ('ob.copyLink' | t) }}</span>
          </button>
          <button class="tg" type="button" (click)="pick('message')">
            <span class="ti"><halo-icon name="mail" [size]="18" /></span>
            <span class="tl">{{ 'share.message' | t }}</span>
          </button>
          <button class="tg" type="button" (click)="pick('email')">
            <span class="ti"><halo-icon name="mail" [size]="18" /></span>
            <span class="tl">{{ 'auth.email' | t }}</span>
          </button>
          <button class="tg" type="button" (click)="pick('more')">
            <span class="ti"><halo-icon name="plus" [size]="18" /></span>
            <span class="tl">{{ 'share.more' | t }}</span>
          </button>
        </div>

        <p class="note">{{ 'share.note' | t }}</p>
      </div>
    }
  `,
  styleUrl: './share-sheet.scss',
})
export class ShareSheet {
  open = input(false);
  title = input(t('share.title'));
  sub = input('');
  url = input('');
  showScope = input(false);

  close = output<void>();
  /** Emits the chosen target id (plus scope when relevant) for the host to route. */
  share = output<{ target: string; scope: ShareScope }>();

  protected scope = signal<ShareScope>('moment');
  protected copied = signal(false);

  protected copyLink(): void {
    const link = this.url() || (typeof location !== 'undefined' ? location.href : '');
    try {
      void navigator?.clipboard?.writeText(link);
    } catch { /* clipboard unavailable — sheet still confirms the intent */ }
    this.copied.set(true);
    this.share.emit({ target: 'copy', scope: this.scope() });
    setTimeout(() => this.copied.set(false), 1600);
  }
  protected pick(target: string): void {
    this.share.emit({ target, scope: this.scope() });
    this.close.emit();
  }
  protected onKey(e: KeyboardEvent): void {
    if (e.key === 'Escape') this.close.emit();
  }
}
