import { Injectable, signal } from '@angular/core';

export interface ShareContext {
  /** What's being shared — used in the sheet header + copied link text. */
  title: string;
  /** Optional sub line (e.g. "Full game · Sun 12 May"). */
  sub?: string;
  /** Shareable URL (defaults to the current location at open time). */
  url?: string;
  /** Show the "this moment / all moments" export scope (highlight player only). */
  showScope?: boolean;
}

/**
 * App-wide state for the share funnel. Any player control bar (live / VOD /
 * highlight) calls `open(ctx)`; the ShareSheet reads `isOpen` + `context`.
 * Kept separate from routing so any surface can raise the sheet, mirroring
 * the proto's single reusable ShareSheet.
 */
@Injectable({ providedIn: 'root' })
export class ShareState {
  private _open = signal(false);
  readonly isOpen = this._open.asReadonly();
  readonly context = signal<ShareContext>({ title: '' });

  open(ctx: ShareContext): void {
    this.context.set(ctx);
    this._open.set(true);
  }
  close(): void {
    this._open.set(false);
  }
}
