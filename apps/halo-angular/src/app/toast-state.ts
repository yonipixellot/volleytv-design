import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  /** neutral = confirmation; pos = success; live = error/destructive. */
  tone: 'neutral' | 'pos' | 'live';
  /** One optional action, for undoing what the toast is reporting. Added for
   *  "Clear all" on the notification centre (2026-08-28): the app's only
   *  confirm pattern is delete-account's type-your-email page, which is far too
   *  heavy for a bulk clear, and an undo is the lighter standard answer for a
   *  reversible destructive action. */
  actionLabel?: string;
  action?: () => void;
}

/**
 * App-wide transient feedback (copied link, followed team, saved settings…).
 * Any surface calls `show(message, tone?)`; the HaloToasts host (mounted in
 * app.html, like the sheets) renders the stack and auto-dismisses after 3s.
 */
@Injectable({ providedIn: 'root' })
export class ToastState {
  private seq = 0;
  readonly toasts = signal<Toast[]>([]);

  show(message: string, tone: Toast['tone'] = 'neutral', action?: { label: string; run: () => void }): void {
    const t: Toast = { id: ++this.seq, message, tone, actionLabel: action?.label, action: action?.run };
    this.toasts.update((list) => [...list, t].slice(-3)); // cap the stack at 3
    // An undo is only useful while it is on screen, so the window to act is the
    // toast's own 3s life. Longer would leave a stale offer; shorter is a trap.
    setTimeout(() => this.dismiss(t.id), 3000);
  }

  /** Run a toast's action and dismiss it — the action is single-use. */
  run(id: number): void {
    this.toasts().find((t) => t.id === id)?.action?.();
    this.dismiss(id);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
