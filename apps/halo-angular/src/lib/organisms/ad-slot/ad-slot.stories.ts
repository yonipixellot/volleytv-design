import type { Meta, StoryObj } from '@storybook/angular';
import { AdSlot } from './ad-slot';

const meta: Meta<AdSlot> = {
  title: 'Organisms/Ad slot',
  component: AdSlot,
  args: { creative: 'img/game-1.webp', href: '#', sponsor: 'Rebel Sport' },
  parameters: { docs: { description: { component: 'Sponsored in-feed ad unit shown to free-tier users.' } } },
};
export default meta;

type Story = StoryObj<AdSlot>;

export const Default: Story = {};
export const NoSponsor: Story = { args: { sponsor: '' } };
export const Empty: Story = { args: { creative: '' } };
/** A creative that never arrives. The slot keeps its box and its label, and
 *  shows the placeholder rather than the browser's broken-image glyph. */
export const CreativeFailed: Story = { args: { creative: 'img/does-not-exist.png' } };
