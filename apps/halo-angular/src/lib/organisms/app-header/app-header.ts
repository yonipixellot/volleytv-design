import { Component, ElementRef, ViewChild, effect, inject, input, output } from '@angular/core';
import { IconButton } from '../../atoms/icon-button/icon-button';
import { Avatar } from '../../atoms/avatar/avatar';
import { HaloIcon } from '../../atoms/icon/icon';
import type { NavItem } from '../bottom-nav/bottom-nav';
import { TenantConfig } from '../../../app/tenant';
import { TPipe } from '../../../app/i18n/t.pipe';

/**
 * Top app bar (.gtop) — Yoni 2026-08-23 layout: the OFFICIAL Hoops TV lockup
 * on the LEFT (brandmark icon + wordmark, Green colorway on dark themes,
 * Purple on light — the supplied files verbatim), menu + bell on the RIGHT.
 * The federation switcher is GONE from the bar (2026-08-27): state/territory
 * is a filter on Home's Events row, so the header is pure app chrome.
 *
 * Menu trigger is the user's avatar (2026-08-26 — was a gear icon, then a
 * hamburger). The page behind it mixes account identity, app preferences
 * AND sign-out, which reads closer to Gmail/Slack/Notion's "your photo opens
 * everything about you" pattern than a pure Settings entry — and unlike any
 * line-glyph it can't be misread (the gear glyph on hand read as "sun" at
 * this size). Renders via the shared `halo-avatar` atom (photo with a
 * monogram fallback) — there's no avatar upload yet, so every persona
 * renders the fallback in practice; `avatarSrc` stays wired for whenever
 * that ships. Stays a pure input (no ViewContext injection, matches
 * SettingsPanel) so it still renders in Storybook.
 */
@Component({
  selector: 'halo-app-header',
  standalone: true,
  imports: [IconButton, Avatar, HaloIcon, TPipe],
  template: `
    <header class="gtop">
      <button class="wmbtn" type="button" [attr.aria-label]="brandName() + ', home'" (click)="home.emit()">
        <!-- Each half is guarded: a runtime logo override (DEV bar) fills the
             emblem and blanks the wordmark, and an <img> with an empty src would
             otherwise render as a broken-image glyph. -->
        @if (bmDark()) { <img class="bm bm-dark" [src]="bmDark()" alt="" /> }
        @if (bmLight()) { <img class="bm bm-light" [src]="bmLight()" alt="" /> }
        @if (wmDark()) { <img class="wm wm-dark" [src]="wmDark()" [alt]="brandName()" /> }
        @if (wmLight()) { <img class="wm wm-light" [src]="wmLight()" [alt]="brandName()" /> }
      </button>
      <!-- Inline tab nav — desktop only (see .scss). On mobile the floating
           dock owns this, so the row is hidden rather than duplicated.
           Labels are bare text: at desktop density the tab icon just repeats
           the word next to it. Home is deliberately NOT a tab here — the
           wordmark to the left already is the way back (Maryna 2026-08-28).
           The lock stays, since it says something the label can't. -->
      @if (navItems().length) {
        <nav class="hnav" [attr.aria-label]="'hdr.main' | t">
          @for (it of navItems(); track it.key) {
            <button class="hni" type="button"
              [class.on]="it.key === activeNav()" [class.locked]="it.locked"
              [attr.aria-current]="it.key === activeNav() ? 'page' : null"
              (click)="navSelect.emit(it.key)">
              {{ it.label }}
              @if (it.locked) { <halo-icon name="lock" [size]="11" /> }
            </button>
          }
        </nav>
      }
      <span class="sp"></span>
      <!-- No state/territory switcher here since 2026-08-27: it only ever
           scoped Home's Events feed, so it now lives there as a filter pill
           beside Club / League / Team. The header is pure app chrome. -->
      <!-- Each trigger anchors its OWN panel: the popover is positioned against
           the span around the control, so it needs no arithmetic against the
           other controls in the bar and cannot drift when one of them resizes. -->
      <span #bellWrap class="hact">
        <halo-icon-button icon="bell" [ariaLabel]="'settings.notifications' | t" [count]="unread()"
          haspopup="dialog" [active]="notifOpen()" (click)="bell.emit()" />
        @if (notifOpen()) {
          <div class="pop-catch" (click)="notifClose.emit()"></div>
          <div class="pop pop-notif" role="dialog" [attr.aria-label]="'settings.notifications' | t"
               (keydown)="onDialogKeydown($event)">
            <ng-content select="[slot-notifications]" />
          </div>
        }
      </span>

      <span class="hact">
      <button #trigger class="avbtn" type="button"
        [attr.aria-label]="menuOpen() ? ('hdr.closeAccount' | t) : ('hdr.account' | t)"
        aria-haspopup="menu" [attr.aria-expanded]="menuOpen()" [attr.aria-controls]="menuOpen() ? 'acct-pop' : null"
        (click)="menu.emit()">
        <halo-avatar [src]="avatarSrc()" [monogram]="initials()" [size]="36" />
      </button>

      <!-- Account menu, from the tablet band up. The avatar is the anchor, so
           the popover is positioned against THIS header rather than the shell:
           nothing to keep in sync with the bar's height, and it travels with it.
           Below that band the trigger routes to the full screen instead and this
           never renders — see AccountMenuState.

           Content is projected: the header stays a pure organism that knows
           nothing about personas or settings rows, and still renders in
           Storybook (Maryna 2026-08-29). -->
      @if (menuOpen()) {
        <!-- Catches the click that dismisses. Transparent, not a scrim: a menu
             hanging off a control is not a modal, and dimming the page would
             say it is. -->
        <div class="pop-catch" (click)="menuClose.emit()"></div>
        <div #pop id="acct-pop" class="pop" role="menu" [attr.aria-label]="'hdr.account' | t"
             (keydown)="onPopKeydown($event)">
          <ng-content select="[slot-menu]" />
        </div>
      }
      </span>
    </header>
  `,
  styleUrl: './app-header.scss',
})
export class AppHeader {
  // The lockup comes from the tenant, not from an import: this component is
  // shared, and a second tenant must not mean editing it.
  private tenant = inject(TenantConfig);
  protected bmDark = this.tenant.brandmarkDark;
  protected bmLight = this.tenant.brandmarkLight;
  protected wmDark = this.tenant.wordmarkDark;
  protected wmLight = this.tenant.wordmarkLight;
  protected brandName = this.tenant.name;
  /** Unread notification COUNT (CM-1417) — 0 hides the badge. */
  unread = input(0);
  /** The menu trigger's photo — no upload flow exists yet, so this is always
   *  empty in practice; wired for whenever that ships. */
  avatarSrc = input('');
  /** Two-letter monogram `halo-avatar` shows in place of a photo. */
  initials = input('TW');
  /** Tab set for the inline desktop nav. The PAGE decides what belongs here:
   *  it applies the same entitlement gating the bottom dock gets (locked
   *  "You" on Free, no "You" for fans) and drops "home", which the wordmark
   *  covers. Empty (the default) renders no nav at all. */
  navItems = input<NavItem[]>([]);
  /** Key of the current tab, e.g. 'home'. */
  activeNav = input('');
  /** Whether the account popover is showing. Owned by the app, not here: the
   *  same state decides whether the trigger opens a menu or routes to a screen. */
  menuOpen = input(false);
  menu = output<void>();
  /** Dismissed from inside the popover — Esc, or a click outside it. */
  menuClose = output<void>();
  /** Whether the notifications popover is showing. Same owner as menuOpen. */
  notifOpen = input(false);
  notifClose = output<void>();
  bell = output<void>();
  /** Wordmark tap → Home tab. */
  home = output<void>();
  /** Inline nav tab chosen (desktop). Emits the NavItem key. */
  navSelect = output<string>();

  private wasOpen = false;

  @ViewChild('trigger') private triggerEl?: ElementRef<HTMLButtonElement>;
  @ViewChild('bellWrap') private bellEl?: ElementRef<HTMLElement>;
  @ViewChild('pop') private popEl?: ElementRef<HTMLElement>;

  constructor() {
    // Focus follows the menu in and back out again. Without the return trip a
    // keyboard user who presses Escape is left at the top of the document with
    // no idea where they were.
    effect(() => {
      const open = this.menuOpen();
      // Only hand focus BACK if the menu was actually open. Without this the
      // effect's first run — where `open` is false and nothing has focus yet —
      // focused the avatar on every page load, and the global focus ring drew a
      // box around it before the user had touched anything.
      const wasOpen = this.wasOpen;
      this.wasOpen = open;
      queueMicrotask(() => {
        if (open) this.firstItem()?.focus();
        else if (wasOpen && document.activeElement === document.body) this.triggerEl?.nativeElement.focus();
      });
    });
  }

  /** Notifications is a feed, not a menu: Escape and focus return, but no arrow
   *  walking. Arrow keys in a list of headlines would fight the scroll. */
  protected onDialogKeydown(e: KeyboardEvent): void {
    if (e.key !== 'Escape') return;
    e.stopPropagation();
    this.notifClose.emit();
    this.bellEl?.nativeElement.querySelector('button')?.focus();
  }

  private items(): HTMLElement[] {
    const root = this.popEl?.nativeElement;
    return root ? Array.from(root.querySelectorAll<HTMLElement>('button:not(:disabled)')) : [];
  }
  private firstItem(): HTMLElement | undefined { return this.items()[0]; }

  /** Arrow keys, Home/End and Escape — the menu-button keyboard contract. A
   *  menu you can open with the keyboard but only walk with Tab is a list that
   *  claims to be a menu. */
  protected onPopKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') { e.stopPropagation(); this.menuClose.emit(); this.triggerEl?.nativeElement.focus(); return; }
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(e.key)) return;
    const list = this.items();
    if (!list.length) return;
    e.preventDefault();
    const at = list.indexOf(document.activeElement as HTMLElement);
    const next =
      e.key === 'Home' ? 0
      : e.key === 'End' ? list.length - 1
      : e.key === 'ArrowDown' ? (at + 1) % list.length
      : (at - 1 + list.length) % list.length;
    list[next]?.focus();
  }
}
