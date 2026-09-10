import { Component, ElementRef, ViewChild, computed, effect, inject, input, output, signal } from '@angular/core';
import { HaloIcon } from '../../atoms/icon/icon';
import { SettingsRow, SettingsSection, settingsSections } from './settings-sections';
import { Avatar } from '../../atoms/avatar/avatar';
import { StatusBar } from '../../molecules/status-bar/status-bar';
import { PageTop } from '../../molecules/page-top/page-top';
import { TPipe } from '../../../app/i18n/t.pipe';
import { LANG, LANGS, LANG_DEF, setLang, t, type Lang } from '../../../app/i18n/i18n';


/**
 * Account & settings — the avatar's full-page destination: status bar, title + X
 * header, an identity card (persona eyebrow + name + sub + avatar), then
 * grouped ACCOUNT / APP sections, each row a tinted icon-chip + title +
 * subtitle with an optional right-side value ("English") or tag.
 *
 * A page, not a sheet (2026-08-26 — was `halo-menu-sheet`, a fixed-position
 * drawer): it now renders in the routed page region exactly like Notification
 * Center, so the status bar and the dev bar stay put and it arrives with the
 * same (absent) animation instead of sliding in over the whole viewport. That
 * a fixed overlay pinned to `top: 0` sat *under* the dev bar and clipped its
 * own clock/battery row was the symptom; being an overlay at all was the cause.
 *
 * Pure organism: everything variable arrives as inputs (name/sub/personaLabel/
 * avatar/plan/language/theme), so it stays decoupled from the app's ViewContext
 * and renders in Storybook.
 */
@Component({
  selector: 'halo-settings-panel',
  standalone: true,
  imports: [HaloIcon, Avatar, StatusBar, PageTop, TPipe],
  template: `
    <div class="pnl" [class.halo-page]="variant() === 'page'" [class.pnl--pop]="variant() === 'popover'">
      @if (variant() === 'page') {
        <halo-status-bar time="9:30" />
      }

      <!-- Status bar + halo-page-top: the exact two components Notification
           Center opens with, so both screens are identical down to the pixel.
           X (not a back-chevron) — reachable from every tab, not a drill-down.

           "Account & settings", not "Settings" (2026-08-26): the trigger is the
           user's avatar, not a gear, because this is an account hub that
           contains settings — identity card, profile, follows and sign out are
           half the rows. A bare "Settings" names only the smaller half, and a
           gear trigger would promise pure configuration then hand you your own
           account. Not "You" either: that's already a bottom tab. -->
      @if (variant() === 'page') {
        <halo-page-top
          [title]="'settings.accountSettings' | t"
          [dismissLabel]="'settings.closeAccountSettings' | t"
          (dismiss)="close.emit()" />
      }

      @if (pane() === 'lang') {
        <!-- Language REPLACES the menu rather than opening beside it. A menu that
             sprouts a second menu sideways has two things to aim at and two ways
             to lose the first one; swapping the pane keeps one surface, one
             target, and one way back (Maryna 2026-08-29). -->
        <div class="pane-top">
          <button #back class="pane-back" type="button"
            [attr.aria-label]="'lang.back' | t" (click)="showMain()">
            <halo-icon name="chevron-left" [size]="18" />
          </button>
          <span class="pane-t">{{ 'lang.title' | t }}</span>
        </div>
        <!-- Each option is written in its own script and tagged with its own
             lang, so a reader who cannot read the current language can still
             find theirs, and a screen reader switches voice per row. -->
        <nav class="rows" [attr.aria-label]="'lang.nav' | t">
          @for (l of langs; track l.code) {
            <button class="row lang-opt" type="button" [attr.lang]="l.code"
              [attr.aria-current]="l.code === lang ? 'true' : null" (click)="pick(l.code)">
              <span class="ck"><halo-icon name="check" [size]="15" [strokeWidth]="3.2" /></span>
              <span class="tx"><span class="lb">{{ l.native }}</span></span>
            </button>
          }
        </nav>
        <p class="pane-note">{{ 'lang.note' | t }}</p>
      } @else {

      <!-- Not a link (2026-08-27) — it went to the same place as the "Account
           & profile" row right below it, so tapping it was a silent duplicate
           of that row rather than a distinct destination. -->
      <div #mainFirst class="acct">
        <halo-avatar [src]="avatarSrc()" [monogram]="initials()" [size]="46" />
        <span class="who">
          @if (personaLabel()) { <em class="eb">{{ personaLabel() }}</em> }
          <b>{{ name() }}</b>
          @if (sub()) { <small>{{ sub() }}</small> }
        </span>
      </div>

      @for (sec of sections(); track sec.key) {
        <p class="sec">{{ sec.label }}</p>
        <nav class="rows" [attr.aria-label]="sec.label">
          @for (r of sec.rows; track r.key) {
            <button
              class="row"
              type="button"
              [attr.data-row]="r.key"
              (click)="onRow(r)"
            >
              <span class="ic"><halo-icon [name]="r.icon" [size]="18" /></span>
              <span class="tx">
                <span class="lb">{{ r.label }}</span>
                @if (r.sub) { <small>{{ r.sub }}</small> }
              </span>
              @if (r.value) { <span class="val">{{ r.value }}</span> }
              @if (r.tag) { <span class="tag">{{ r.tag }}</span> }
              @if (showChevron(r)) { <halo-icon class="ar" name="chevron-right" [size]="16" /> }
            </button>
          }
        </nav>
      }

      <button class="row signout" type="button" (click)="signOut.emit()">
        <span class="ic"><halo-icon name="logout" [size]="18" /></span>
        <span class="tx"><span class="lb">{{ 'settings.signOut' | t }}</span></span>
      </button>
      }
    </div>
  `,
  styleUrl: './settings-panel.scss',
})
export class SettingsPanel {
  name = input('Tal Weiss');
  sub = input(`${t('role.player')} · #7 · Netsetters 1`);
  personaLabel = input('');
  /** No avatar-upload flow exists yet, so this is always empty in practice;
   *  wired for whenever that ships. `halo-avatar` shows `initials` instead. */
  avatarSrc = input('');
  protected initials = computed(() =>
    this.name().trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
  );
  /**
   * `page` is the phone screen: status bar, title + X, full width.
   * `popover` is the same content hanging off the header avatar from the tablet
   * band up — the page chrome comes off because the popover already has an edge
   * and a way out (click away, Esc), and repeating a title above a menu the
   * avatar just opened only states what the user did a moment ago.
   *
   * One organism with two presentations rather than two components: the rows,
   * their grouping and their gating are the thing that must never differ
   * between the two, and here they cannot (Maryna 2026-08-29).
   */
  variant = input<'page' | 'popover'>('page');
  /**
   * Whether the panel is currently on screen.
   *
   * The popover keeps this component alive between openings — it is projected
   * from the page, so it sits outside the header's `@if` and is only hidden,
   * never destroyed. Without this, a Language panel left open was still open the
   * next time the menu was opened, appearing unbidden beside it.
   */
  visible = input(true);
  theme = input<'dark' | 'light'>('dark');
  planLabel = input(t('settings.planAllAccessMonthly'));
  language = input(LANG_DEF.native);
  protected readonly langs = LANGS;
  protected readonly lang = LANG;
  /** Coach persona → surface the Coach Admin entry (roster claim management). */
  isCoach = input(false);

  constructor() {
    // Leaving the menu on the language pane and coming back to it later would
    // reopen on a screen the user never asked for a second time.
    effect(() => { if (!this.visible()) this.pane.set('main'); });
  }

  close = output<void>();
  navigate = output<string>();
  toggleTheme = output<void>();
  /** Settings → Accessibility: opens the app-level A11yPanel (same prefs as the
   *  pre-auth fab — WCAG 3.2.6 consistent help, reachable after onboarding). */
  openA11y = output<void>();
  signOut = output<void>();

  /** One list, three surfaces — see settings-sections.ts. */
  sections = computed<SettingsSection[]>(() =>
    settingsSections({ isCoach: this.isCoach(), theme: this.theme(), language: this.language() }),
  );

  private host = inject(ElementRef) as ElementRef<HTMLElement>;

  /**
   * Focus follows the pane, in both directions — a swap that leaves focus behind
   * strands a keyboard user on a pane they can no longer reach.
   *
   * Driven by ViewChild SETTERS rather than a microtask after the click: the
   * element being focused does not exist yet when the signal is set, and a
   * queued microtask ran before Angular had rendered it, so focus silently fell
   * back to the document body (measured, both directions). A setter fires at the
   * exact moment the element appears.
   */
  private pendingFocus: 'back' | 'lang' | null = null;

  @ViewChild('back') set backRef(el: ElementRef<HTMLButtonElement> | undefined) {
    if (el && this.pendingFocus === 'back') { this.pendingFocus = null; el.nativeElement.focus(); }
  }
  @ViewChild('mainFirst') set mainRef(el: ElementRef<HTMLElement> | undefined) {
    if (el && this.pendingFocus === 'lang') {
      this.pendingFocus = null;
      this.host.nativeElement.querySelector<HTMLElement>('[data-row="lang"]')?.focus();
    }
  }

  /** Which pane the popover is showing. The page variant never leaves 'main' —
   *  there Language is a row that drills into its own screen. */
  protected pane = signal<'main' | 'lang'>('main');
  protected showMain(): void {
    this.pendingFocus = 'lang';
    this.pane.set('main');
  }

  /** Picking the current language just closes the pane; any other persists
   *  and reloads (see i18n.ts for why a reload, not a signal). */
  protected pick(code: Lang): void {
    if (code === LANG) { this.showMain(); return; }
    setLang(code);
  }

  protected showChevron(r: SettingsRow): boolean {
    return this.variant() === 'page' ? !!r.chevron : !!r.submenu;
  }

  protected onRow(r: SettingsRow): void {
    if (r.submenu && this.variant() === 'popover') {
      this.pendingFocus = 'back';
      this.pane.set('lang');
      return;
    }
    if (r.action === 'theme') { this.toggleTheme.emit(); return; }
    if (r.action === 'a11y') { this.openA11y.emit(); return; }
    this.go(r.path!);
  }

  protected go(path: string): void {
    this.navigate.emit(path);
  }
}
