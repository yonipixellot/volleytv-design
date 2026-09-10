import { Component, input } from '@angular/core';

/** iOS-style status bar: time left, signal / wifi / battery right (.status). */
@Component({
  selector: 'halo-status-bar',
  standalone: true,
  template: `
    <div class="status">
      <span>{{ time() }}</span>
      <span class="st-r" aria-hidden="true">
        <svg width="17" height="12" viewBox="0 0 17 12"><g fill="currentColor"><rect x="0" y="7" width="3" height="5" rx="1"/><rect x="4.5" y="4.5" width="3" height="7.5" rx="1"/><rect x="9" y="2" width="3" height="10" rx="1"/><rect x="13.5" y="0" width="3" height="12" rx="1" opacity=".4"/></g></svg>
        <svg width="17" height="12" viewBox="0 0 17 12"><path d="M8.5 3.5C11 3.5 13 4.5 14.5 6M8.5 3.5C6 3.5 4 4.5 2.5 6M8.5 7C9.7 7 10.8 7.5 11.5 8.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
        <svg width="25" height="12" viewBox="0 0 25 12"><rect x="0.5" y="1" width="21" height="10" rx="2.5" fill="none" stroke="currentColor" stroke-width="1" opacity=".5"/><rect x="2" y="2.5" width="16" height="7" rx="1" fill="currentColor"/><rect x="23" y="4" width="1.5" height="4" rx=".7" fill="currentColor" opacity=".5"/></svg>
      </span>
    </div>
  `,
  styles: [`
    :host { display: block; }
    // The iOS-style clock/signal mock is meaningless chrome on a real browser,
    // so it goes at the tablet breakpoint — on EVERY route, not just Home. It
    // was scoped to .dhome, which left the fake battery sitting on top of
    // Settings and Notifications at tablet width (Maryna 2026-08-28).
    @media (min-width: 768px) { :host { display: none; } }
    .status {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-4) var(--pad-x) var(--space-1);
      font-family: var(--body);
      font-weight: 600;
      font-size: var(--fs-body-lg);
      color: var(--ink);
    }
    .st-r { display: flex; gap: var(--gap-tight); align-items: center; }
  `],
})
export class StatusBar {
  time = input('9:30');
}
