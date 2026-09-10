import { Component, computed, input, output, signal } from '@angular/core';
import { TeamText, type TeamLinkRef } from '../../atoms/team-name/team-name';
import { PlayerDisc } from '../../atoms/player-disc/player-disc';
import { Crest } from '../../atoms/crest/crest';
import { HaloIcon } from '../../atoms/icon/icon';
import { TPipe } from '../../../app/i18n/t.pipe';

/** One of the viewer's teams, as shown on the identity card's team line. */
export interface IdentityTeam {
  id: string;
  name: string;
  /** Crest image; falls back to `mono` when absent or broken. */
  crest?: string;
  mono?: string;
  /** Jersey number IN THIS TEAM — a player often wears different numbers. */
  number?: number | null;
  /** Grade / tier in this team. */
  grade?: string;
}

/**
 * Player identity row (.idrow): number disc + name, with the active TEAM on a
 * second line right under the name (crest + name).
 *
 * One team and several teams are the SAME layout (2026-08-27): the only
 * difference is a chevron, and whether the line is a button. Switching team
 * shouldn't re-shape the card, and a chevron beside a value is this app's own
 * "opens a picker" signal (halo-event-filter-bar pills, the Games month pill).
 *
 * The picker is an ANCHORED MENU, not a bottom sheet (2026-08-27): two or three
 * options chosen from a trigger at the top of the screen. That's the same
 * language as the Games month pill and the profile switcher; sheets in this app
 * are for global scope (federation) or content-heavy choices (premium, share).
 *
 * `number = null` hides the disc — non-playing personas (coach) are name-only.
 */
@Component({
  selector: 'halo-profile-identity',
  standalone: true,
  imports: [PlayerDisc, TeamText, Crest, HaloIcon, TPipe],
  template: `
    <div class="idrow">
      <!-- Same concentric-rings motif as halo-upcoming-row's .updeco, same
           geometry: the card lost its right-hand crest, and an empty half was
           reading as a mistake rather than as space (2026-08-27). -->
      <span class="iddeco" aria-hidden="true"></span>
      @if (number() !== null) {
        <div class="pav"><halo-player-disc [number]="number()!" [size]="70" [ring]="false" /></div>
      }
      <div class="idtxt">
        <div class="nm" [class.long]="name().length > 14">{{ name() }}</div>

        @if (active(); as a) {
          <div class="teamwrap">
            @if (canSwitch()) {
              <button class="team" type="button" [attr.aria-label]="'ob.changeTeam' | t"
                [class.open]="menuOpen()"
                aria-haspopup="listbox" [attr.aria-expanded]="menuOpen()"
                (click)="menuOpen.set(!menuOpen())">
                <halo-crest [src]="a.crest || ''" [monogram]="a.mono || ''" [size]="20" />
                <span class="team-nm">{{ a.name }}</span>
                <halo-icon class="team-chev halo-chev" name="chevron-down" [size]="14" />
              </button>

              @if (menuOpen()) {
                <button class="team-away" type="button" [attr.aria-label]="'you.closeTeamPicker' | t"
                  (click)="menuOpen.set(false)"></button>
                <div class="team-menu" role="listbox" [attr.aria-label]="'ob.yourTeams' | t"
                  (keydown)="onMenuKey($event)">
                  @for (t of teams(); track t.id) {
                    <button class="tm-opt" type="button" role="option"
                      [class.on]="t.id === a.id" [attr.aria-selected]="t.id === a.id"
                      (click)="choose(t.id)">
                      <halo-crest [src]="t.crest || ''" [monogram]="t.mono || ''" [size]="26" />
                      <span class="tm-tx">
                        <span class="tm-nm">{{ t.name }}</span>
                        @if (subOf(t)) { <span class="tm-sub">{{ subOf(t) }}</span> }
                      </span>
                      @if (t.id === a.id) { <halo-icon class="tm-ck" name="check" [size]="15" /> }
                    </button>
                  }
                </div>
              }
            } @else {
              <div class="team static">
                <halo-crest [src]="a.crest || ''" [monogram]="a.mono || ''" [size]="20" />
                <span class="team-nm">{{ a.name }}</span>
              </div>
            }
          </div>
        }

        @if (metaLines().length) {
          <div class="mt">
            @for (l of metaLines(); track l; let last = $last) {
              <halo-team-text [text]="l" [links]="teamLinks()" (open)="openTeam.emit($event)" />@if (!last) { <br /> }
            }
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './profile-identity.scss',
})
export class ProfileIdentity {
  name = input.required<string>();
  number = input<string | number | null>(7);
  /** Extra lines under the team (a coach's role). Empty for athletes: the
   *  jersey number is on the disc and the grade lives in the team picker. */
  metaLines = input<string[]>([]);
  teamLinks = input<TeamLinkRef[]>([]);
  /** The viewer's teams for this profile. One entry = a static line. */
  teams = input<IdentityTeam[]>([]);
  activeTeamId = input('');
  pick = output<string>();
  openTeam = output<string>();

  protected menuOpen = signal(false);
  protected active = computed(() => this.teams().find((t) => t.id === this.activeTeamId()) ?? this.teams()[0]);
  protected canSwitch = computed(() => this.teams().length > 1);

  /** "#12 · Open · Rep" — the number belongs to the TEAM, not the person, so
   *  it has to be visible while choosing between them. */
  protected subOf(t: IdentityTeam): string {
    return [t.number != null ? '#' + t.number : '', t.grade ?? ''].filter(Boolean).join(' · ');
  }

  protected choose(id: string): void {
    this.menuOpen.set(false);
    this.pick.emit(id);
  }

  protected onMenuKey(e: KeyboardEvent): void {
    if (e.key === 'Escape') this.menuOpen.set(false);
  }
}
