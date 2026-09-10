import { Component, computed, input, output } from '@angular/core';
import { HaloIcon } from '../../atoms/icon/icon';
import { t } from '../../../app/i18n/i18n';
import { TPipe } from '../../../app/i18n/t.pipe';

export type PersonaKind = 'player' | 'parent' | 'fan' | 'coach';

const ICON_PATHS: Record<PersonaKind, string> = {
  player: 'M10 9 a3 3 0 1 0 0 -6 a3 3 0 1 0 0 6 Z M3 17 c0 -3.5 3 -6 7 -6 s7 2.5 7 6',
  parent:
    'M5 8 a3 3 0 1 0 0 -6 a3 3 0 1 0 0 6 Z M15 8 a3 3 0 1 0 0 -6 a3 3 0 1 0 0 6 Z M2 17 c0 -3 2 -5 5 -5 M13 12 c3 0 5 2 5 5 M10 17 c-1.5 0 -2.5 -1 -2.5 -2.5 s1 -2.5 2.5 -2.5 s2.5 1 2.5 2.5 S 11.5 17 10 17 Z',
  fan: 'M10 2 L12.6 7.4 L18.5 8.3 L14.2 12.4 L15.3 18.3 L10 15.5 L4.7 18.3 L5.8 12.4 L1.5 8.3 L7.4 7.4 Z',
  coach: 'M2 4 h16 v9 h-7 l-2 3 -2 -3 H2 Z M5 7.5 h10 M5 10.5 h6',
};

const DEFAULTS: Record<PersonaKind, { title: string; sub: string }> = {
  player: { title: t('persona.player'), sub: t('persona.playerSub') },
  parent: { title: t('persona.parent'), sub: t('persona.parentSub') },
  fan: { title: t('persona.fan'), sub: t('persona.fanSub') },
  coach: { title: t('persona.coach'), sub: t('persona.coachSub') },
};

/**
 * Persona picker row (onboarding). `featured` gives the recommended emphasis
 * (accent halo + ring), `disabled` dims a not-yet-available option (coach).
 */
@Component({
  // `title` is a global HTML attribute, so a static `title="…"` in a caller's
  // template stays on the HOST and the browser raises its own tooltip over the
  // component — duplicating text already on screen (Maryna 2026-08-30). The
  // input keeps its natural name; the host simply stops carrying it.
  host: { '[attr.title]': 'null' },
  selector: 'halo-persona-card',
  standalone: true,
  imports: [HaloIcon, TPipe],
  template: `
    <button
      class="pc"
      type="button"
      [class.featured]="featured()"
      [class.disabled]="disabled()"
      [disabled]="disabled()"
      (click)="pick.emit(kind())"
    >
      <span class="well">
        <svg viewBox="0 0 20 20" width="22" height="22" fill="none"
             stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
          <path [attr.d]="iconPath()" />
        </svg>
      </span>
      <span class="txt">
        <span class="ttl">{{ title() || def().title }}</span>
        <span class="sub">{{ sub() || def().sub }}</span>
      </span>
      @if (disabled()) {
        <span class="soon">{{ 'persona.soon' | t }}</span>
      } @else {
        <halo-icon class="chev" name="chevron-right" [size]="16" />
      }
    </button>
  `,
  styleUrl: './persona-card.scss',
})
export class PersonaCard {
  kind = input.required<PersonaKind>();
  title = input('');
  sub = input('');
  featured = input(false);
  disabled = input(false);
  pick = output<PersonaKind>();

  iconPath = computed(() => ICON_PATHS[this.kind()]);
  def = computed(() => DEFAULTS[this.kind()]);
}
