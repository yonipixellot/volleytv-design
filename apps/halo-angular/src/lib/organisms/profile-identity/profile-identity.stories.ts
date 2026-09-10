import type { Meta, StoryObj } from '@storybook/angular';
import { ProfileIdentity } from './profile-identity';

const HOOP = { id: 'nets', name: 'Netsetters 1', crest: 'img/logo-netsetters.svg', mono: 'NS', number: 7, grade: 'Open · Tier A' };
const VIK = { id: 'vik', name: 'Vikings Grey', mono: 'VG', number: 12, grade: 'Open · Rep' };

const meta: Meta<ProfileIdentity> = {
  title: 'Organisms/Profile identity',
  component: ProfileIdentity,
  args: { name: 'Tal Weiss', number: 7, teams: [HOOP], activeTeamId: 'nets' },
};
export default meta;
type Story = StoryObj<ProfileIdentity>;

/** One team: the line is static, no chevron. */
export const OneTeam: Story = {};

/** Several teams: identical layout, plus a chevron; the line opens the picker,
 *  where each row carries the jersey number worn in that team. */
export const TwoTeams: Story = {
  args: { teams: [HOOP, VIK], activeTeamId: 'nets' },
};

/** No crest image → the monogram tile. */
export const NoTeamLogo: Story = {
  args: { teams: [VIK], activeTeamId: 'vik' },
};

/** Long team name truncates; the chevron holds its place. */
export const LongTeamName: Story = {
  args: {
    teams: [
      { id: 'nb', name: 'Northern Beaches Volleyball U18 Division 2', mono: 'NB', number: 4, grade: 'U18 · Division 2' },
      VIK,
    ],
    activeTeamId: 'nb',
  },
};

/** Coach: no jersey disc, role on the line under the team. */
export const Coach: Story = {
  args: { name: 'Tal Weiss', number: null, metaLines: ['Coach'] },
};

/** Long person name steps down a size and clamps to two lines. */
export const LongName: Story = {
  args: { name: 'Aleksandra Kovalenko', number: 23 },
};
