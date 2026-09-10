import type { Meta, StoryObj } from '@storybook/angular';
import { componentWrapperDecorator } from '@storybook/angular';
import { PersonaCard } from './persona-card';

const meta: Meta<PersonaCard> = {
  title: 'Organisms/Persona Card',
  component: PersonaCard,
  decorators: [componentWrapperDecorator((story) => `<div style="max-width:380px">${story}</div>`)],
  args: { kind: 'player', featured: false, disabled: false },
  argTypes: { kind: { control: 'inline-radio', options: ['player', 'parent', 'fan', 'coach'] } },
};
export default meta;
type Story = StoryObj<PersonaCard>;

export const Featured: Story = { args: { kind: 'player', featured: true } };
export const Default: Story = { args: { kind: 'parent' } };
export const Fan: Story = { args: { kind: 'fan' } };
export const DisabledCoach: Story = { args: { kind: 'coach', disabled: true } };
