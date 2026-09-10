import { Component, input, output } from '@angular/core';
import type { Toast } from '../../../app/toast-state';

/**
 * Toast stack host — renders transient feedback pills above the bottom nav.
 * Presentational: the list + dismiss live in ToastState (mounted app-wide in
 * app.html, same pattern as the sheets). `aria-live=polite` announces new
 * toasts to screen readers; tap dismisses early.
 */
@Component({
  selector: 'halo-toasts',
  standalone: true,
  template: `
    <div class="stack" aria-live="polite">
      @for (t of toasts(); track t.id) {
        <!-- A div, not a button: an optional action button lives inside, and a
             button inside a button is invalid. Tap-to-dismiss moved onto the
             message so the pill still clears early. -->
        <div class="toast" [class]="t.tone" role="status">
          <button class="msg" type="button" [attr.aria-label]="'Dismiss: ' + t.message" (click)="dismiss.emit(t.id)">
            <span class="dot" aria-hidden="true"></span>{{ t.message }}
          </button>
          @if (t.actionLabel) {
            <button class="act" type="button" (click)="act.emit(t.id)">{{ t.actionLabel }}</button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: contents; }
    .stack {
      position: fixed;
      left: 50%;
      transform: translateX(-50%);
      // Rides just clear of the floating dock: nav clearance minus the dock's
      // own bottom offset. The 22px here was the retired --pad-x standing in
      // for that offset, which is exactly how a stale value hides in a calc().
      bottom: calc(var(--nav-clear) - var(--space-6));
      z-index: calc(var(--z-modal) + 20);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--gap-tight);
      pointer-events: none;
      width: max-content;
      max-width: min(92vw, 360px);
    }
    .toast {
      pointer-events: auto;
      display: inline-flex;
      align-items: center;
      border: 1px solid var(--hair);
      border-radius: var(--r-pill);
      background: var(--card);
      color: var(--ink);
      font-family: var(--body);
      font-weight: 700;
      font-size: var(--fs-body);
      box-shadow: var(--shadow-2), var(--edge);
      animation: halo-toast-in var(--dur-slow) var(--ease-out-soft) both;
    }
    /* The message carries the pill's padding so the pill itself stays a bare
       container — that keeps the action flush against the right edge. */
    .msg {
      display: inline-flex;
      align-items: center;
      gap: var(--gap-tight);
      padding: var(--space-3) var(--space-4);
      border: 0;
      background: none;
      color: inherit;
      font: inherit;
      cursor: pointer;
      text-align: start;
    }
    /* Divider, not a filled button: the action is a recovery affordance, not the
       point of the toast. */
    .act {
      align-self: stretch;
      padding: var(--space-3) var(--space-4) var(--space-3) var(--space-4);
      border: 0;
      border-inline-start: 1px solid var(--hair);
      background: none;
      color: var(--accent);
      font: inherit;
      cursor: pointer;
      border-start-start-radius: 0; border-end-start-radius: 0; border-start-end-radius: var(--r-pill); border-end-end-radius: var(--r-pill);
    }
    .dot { flex: none; width: 6px; height: 6px; border-radius: 50%; background: var(--ink3); }
    .toast.pos .dot { background: var(--pos); }
    .toast.live .dot { background: var(--live); }
    @media (prefers-reduced-motion: reduce) {
      .toast { animation: none; }
    }
    @keyframes halo-toast-in {
      from { transform: translateY(8px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `],
})
export class HaloToasts {
  toasts = input<Toast[]>([]);
  dismiss = output<number>();
  /** The optional action was tapped — the host runs it (ToastState.run). */
  act = output<number>();
}
