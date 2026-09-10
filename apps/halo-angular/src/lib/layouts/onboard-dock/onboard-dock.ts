import { Component } from '@angular/core';

/** Sticky bottom CTA dock for onboarding — gradient fade + hairline, content projected. */
@Component({
  selector: 'halo-onboard-dock',
  standalone: true,
  template: `<div class="dock"><div class="inner"><ng-content /></div></div>`,
  styleUrl: './onboard-dock.scss',
})
export class OnboardDock {}
