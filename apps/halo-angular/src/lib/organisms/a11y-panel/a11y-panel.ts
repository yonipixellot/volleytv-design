import { Component, input, output } from '@angular/core';
import { HaloIcon } from '../../atoms/icon/icon';
import { SegmentedToggle, type SegOption } from '../../molecules/segmented-toggle/segmented-toggle';
import { t } from '../../../app/i18n/i18n';
import { TPipe } from '../../../app/i18n/t.pipe';

/**
 * AccessibilityPanel + Fab — PT Layer-2 port (AccessibilityFab/Panel).
 * The trigger is the PRE-AUTH entry point only (signed-in users reach the same
 * prefs from Menu → Accessibility): anonymous viewers on a shared link have
 * no menu, and WCAG 3.2.6 asks for consistent help per context, not an
 * omnipresent control. Never an interstitial, never gates sign-in.
 * First-party controls over our own tokens — not a bought overlay widget.
 *
 * It no longer places itself. The PT port pinned it bottom-right, which on any
 * screen with a bottom CTA dock meant a floating circle sitting inside the
 * page's primary action and winning on z-index (Maryna 2026-08-31). Its host
 * positions it — see .prechrome in app.scss — and a button that does not choose
 * its own corner can be composed with the theme control beside it.
 */
@Component({
  selector: 'halo-a11y-fab',
  standalone: true,
  imports: [HaloIcon, TPipe],
  template: `
    <button class="afab" type="button" [attr.aria-label]="'a11y.options' | t" (click)="press.emit()">
      <halo-icon name="accessibility" [size]="22" />
    </button>
  `,
  styles: [`
    /* No position and no z-index: the host places this. 44px, down from 48, to
       sit level with the theme control beside it — still the size WCAG 2.5.5
       asks for. Its own ground and elevation, because it is its own object: the
       cluster beside it is a gap, not a surface (see .prechrome in app.scss). */
    .afab {
      width: 44px; height: 44px; display: grid; place-items: center;
      border-radius: 50%; cursor: pointer;
      /* A skin with a brand pairing for this control (Hoops TV: White_on_Blaze)
         sets these three tokens instead of overriding here. */
      color: var(--fab-ink);
      background: var(--fab-bg);
      border: 1px solid var(--fab-edge);
      box-shadow: var(--shadow-2);
    }
  `],
})
export class A11yFab {
  press = output<void>();
}

@Component({
  selector: 'halo-a11y-panel',
  standalone: true,
  imports: [HaloIcon, SegmentedToggle, TPipe],
  template: `
    @if (open()) {
      <div class="scrim" (click)="close.emit()"></div>
      <div class="sheet" [class.at-menu]="anchor() === 'menu'"
           role="dialog" aria-modal="true" [attr.aria-label]="'a11y.options' | t">
        <span class="grip" aria-hidden="true"></span>
        <div class="hd-row">
          <h2 class="hd">{{ 'settings.accessibility' | t }}</h2>
          <button class="x" type="button" [attr.aria-label]="'common.close' | t" (click)="close.emit()"><halo-icon name="close" [size]="15" /></button>
        </div>
        <p class="sub">{{ 'a11y.sub' | t }}</p>

        <div class="grp">
          <span class="lab" id="a11y-text">{{ 'a11y.textSize' | t }}</span>
          <halo-segmented-toggle [options]="textOpts" [value]="text()" (valueChange)="textChange.emit($any($event))" />
        </div>
        <div class="grp">
          <span class="lab" id="a11y-contrast">{{ 'a11y.contrast' | t }}</span>
          <halo-segmented-toggle [options]="contrastOpts" [value]="contrast()" (valueChange)="contrastChange.emit($any($event))" />
        </div>
        <div class="grp">
          <span class="lab" id="a11y-motion">{{ 'a11y.motion' | t }}</span>
          <halo-segmented-toggle [options]="motionOpts" [value]="motion()" (valueChange)="motionChange.emit($any($event))" />
        </div>
      </div>
    }
  `,
  styleUrl: './a11y-panel.scss',
})
export class A11yPanel {
  open = input(false);
  /** Which control opened it, so the desktop popover lands on that control:
   *  the pre-auth fab bottom-right, the header avatar's menu top-right. Ignored
   *  below 1024, where the panel is a bottom drawer either way. */
  anchor = input<'fab' | 'menu'>('menu');
  text = input('default');
  contrast = input('default');
  motion = input('system');
  textChange = output<string>();
  contrastChange = output<string>();
  motionChange = output<string>();
  close = output<void>();

  textOpts: SegOption[] = [
    { key: 'default', label: t('a11y.default') },
    { key: 'large', label: t('a11y.large') },
    { key: 'xlarge', label: t('a11y.xlarge') },
  ];
  contrastOpts: SegOption[] = [
    { key: 'default', label: t('a11y.default') },
    { key: 'high', label: t('a11y.high') },
  ];
  motionOpts: SegOption[] = [
    { key: 'system', label: t('a11y.system') },
    { key: 'reduce', label: t('a11y.reduce') },
  ];
}
