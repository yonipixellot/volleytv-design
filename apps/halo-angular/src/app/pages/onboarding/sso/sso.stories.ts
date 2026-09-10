import type { Meta, StoryObj } from '@storybook/angular';
import { SsoOnboardingPage } from './sso';

/* SSO onboarding (Volley TV Club iD) — one story per identification outcome
   (BA parity: single / multi / family / none) plus the shared tail steps.
   demoOutcome/demoStep are the same inputs the review deep links use
   (/onboarding/sso?demoOutcome=family&demoStep=teams). */
const meta: Meta<SsoOnboardingPage> = {
  title: 'Pages/Onboarding/SSO (Volley TV Club iD)',
  component: SsoOnboardingPage,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'The fully-SSO onboarding: handoff → identify (auto-resolve + dev panel) → per-outcome flow. Athlete (1 or 2 locked teams), Parent (confirm pre-linked kids → kids’ teams locked), Not-matched (browse-only, 4 steps) — then a simple notifications consent → consent (marketing + ATSI), which finishes into the app.' } },
  },
};
export default meta;

type Story = StoryObj<SsoOnboardingPage>;

/** Handoff → identify loader with the dev simulate-result panel. */
export const HandoffAndIdentify: Story = {};

// ---- athlete · one team (P1 path) ----
export const AthleteTeams: Story = { args: { demoOutcome: 'single' } };
export const AthleteTeammates: Story = { args: { demoOutcome: 'single', demoStep: 'teammates' } };

// ---- P2 personas ----
/** Multi-team athlete (BA DG-11): BOTH matched teams locked. */
export const MultiTeamAthlete: Story = { args: { demoOutcome: 'multi' } };
/** Parent: confirm the pre-linked children (SSO/CMP payload). */
export const FamilyConfirmAthletes: Story = { args: { demoOutcome: 'family' } };
/** Parent: the kids' teams arrive locked with per-kid eyebrows. */
export const FamilyTeams: Story = { args: { demoOutcome: 'family', demoStep: 'teams' } };
/** Parent: follow the kids' teammates across their teams. */
export const FamilyTeammates: Story = { args: { demoOutcome: 'family', demoStep: 'teammates' } };
/** Signed in but no record matched (§3b): browse-only + notice, 4 steps. */
export const NotMatched: Story = { args: { demoOutcome: 'none' } };

// ---- shared tail ----
export const Notifications: Story = { args: { demoOutcome: 'single', demoStep: 'notif' } };
export const Consent: Story = { args: { demoOutcome: 'single', demoStep: 'consent' } };
