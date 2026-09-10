import type { Meta, StoryObj } from '@storybook/angular';
import { ClientLogo } from './client-logo';
import { VOLLEYTV_MARK_SVG } from '../../brand/volleytv-preset';

const meta: Meta<ClientLogo> = {
  title: 'Atoms/Client logo',
  component: ClientLogo,
  args: { svg: '', src: '', name: 'Halo', height: 44 },
  argTypes: { height: { control: { type: 'range', min: 24, max: 96, step: 1 } } },
  parameters: { docs: { description: { component: 'The replaceable client brand mark. Provide an inline SVG, an image URL, or fall back to a wordmark. Emblem recolours with the accent — try the Volley TV mark with Theme/Skin toggles.' } } },
};
export default meta;

type Story = StoryObj<ClientLogo>;

/** Example tenant mark: Volley TV (themeable inline SVG). */
export const VolleyTvMark: Story = { args: { svg: VOLLEYTV_MARK_SVG, height: 46 } };

/** Fallback when a client has only a name. */
export const Wordmark: Story = { args: { name: 'Volley TV', height: 40 } };
