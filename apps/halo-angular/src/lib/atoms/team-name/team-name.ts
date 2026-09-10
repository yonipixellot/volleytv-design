import { Component, computed, input, output } from '@angular/core';

/**
 * TeamName — the app's NameLink: renders a team name as an inline link to its
 * team page when `teamId` resolves, plain text otherwise. Uses span[role=link]
 * (never <button>) so it is safe INSIDE wholly-tappable cards/rows; taps stop
 * propagation so the card's own action doesn't fire. Keyboard: Enter opens.
 * Hover/focus show the link affordance (accent + underline).
 */
@Component({
  selector: 'halo-team-name',
  standalone: true,
  template: `
    @if (teamId()) {
      <span class="tn link" role="link" tabindex="0"
            (click)="$event.stopPropagation(); open.emit(teamId()!)"
            (keydown.enter)="$event.stopPropagation(); open.emit(teamId()!)"
      >{{ name() }}</span>
    } @else {
      <span class="tn">{{ name() }}</span>
    }
  `,
  styles: [`
    :host { display: contents; }
    .tn { font: inherit; color: inherit; }
    .tn.link {
      cursor: pointer;
      border-radius: 3px;
      transition: color var(--dur-fast), text-decoration-color var(--dur-fast);
      text-decoration: underline;
      text-decoration-color: transparent;
      text-underline-offset: 3px;
      text-decoration-thickness: 1.5px;
    }
    /* Split on purpose: focus-visible stays unscoped because a keyboard user
       has no pointer, while the hover half is pointer-only so it does not
       stick after a tap. */
    .tn.link:focus-visible {
      color: var(--accent);
      text-decoration-color: color-mix(in srgb, var(--accent) 65%, transparent);
    }
    @media (hover: hover) {
      .tn.link:hover {
        color: var(--accent);
        text-decoration-color: color-mix(in srgb, var(--accent) 65%, transparent);
      }
    }
    .tn.link:active { color: var(--accent); }
  `],
})
export class TeamName {
  name = input.required<string>();
  teamId = input<string | null>(null);
  open = output<string>();
}

export interface TeamLinkRef { name: string; id: string; }

/**
 * TeamText — renders ANY text and links every team name found inside it
 * ("Netsetters 1 · Q3", "Netsetters 1 vs Vikings Grey", "Netsetters 1 · #7").
 * Pages pass the registry as `links`; unmatched text stays plain.
 */
@Component({
  selector: 'halo-team-text',
  standalone: true,
  imports: [TeamName],
  template: `@for (p of parts(); track $index) {@if (p.id) {<halo-team-name [name]="p.text" [teamId]="p.id" (open)="open.emit($event)" />} @else {{{ p.text }}}}`,
  styles: [`:host { display: contents; }`],
})
export class TeamText {
  text = input.required<string>();
  links = input<TeamLinkRef[]>([]);
  open = output<string>();

  parts = computed<{ text: string; id?: string }[]>(() => {
    const t = this.text();
    const ls = this.links();
    const out: { text: string; id?: string }[] = [];
    let i = 0;
    while (i < t.length) {
      let best: { idx: number; l: TeamLinkRef } | null = null;
      for (const l of ls) {
        const idx = t.indexOf(l.name, i);
        if (idx >= 0 && (!best || idx < best.idx || (idx === best.idx && l.name.length > best.l.name.length))) {
          best = { idx, l };
        }
      }
      if (!best) { out.push({ text: t.slice(i) }); break; }
      if (best.idx > i) out.push({ text: t.slice(i, best.idx) });
      out.push({ text: best.l.name, id: best.l.id });
      i = best.idx + best.l.name.length;
    }
    return out;
  });
}
