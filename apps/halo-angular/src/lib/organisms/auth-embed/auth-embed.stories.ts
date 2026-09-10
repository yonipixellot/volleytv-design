import type { Meta, StoryObj } from '@storybook/angular';
import { AuthEmbed } from './auth-embed';
import { IDP_SIGN_IN_SHOT } from '../../brand/idp';

const meta: Meta<AuthEmbed> = {
  title: 'Organisms/Auth embed',
  component: AuthEmbed,
  args: { shotSrc: IDP_SIGN_IN_SHOT },
  parameters: {
    docs: {
      description: {
        component:
          "**This is where the identity provider's iframe goes.** In the product the slot holds an " +
          'iframe of their own sign-in page, rendered 1:1 and never restyled by us. Here it is a ' +
          'still picture of their card, so the prototype makes no third-party request and nothing in ' +
          'it can be typed into.\n\n' +
          'The prototype did embed it for real. Cross-origin we can neither scroll their document nor ' +
          'mask inside it, so isolating their card meant an oversized frame pulled up and left by a ' +
          'measured crop — constants taken at one column width. On a wider column their card stopped ' +
          "filling the window and their page's canvas showed as a tinted edge around ours. The durable " +
          'fix is an embed mode from whoever owns the provider page; see `IDP_SIGN_IN_CROP` in ' +
          'lib/brand/idp.ts for the measurements that path would start from.',
      },
    },
  },
};
export default meta;

export const Default: StoryObj<AuthEmbed> = {};

/** How sign-in presents it: floating on the brand field. The artwork carries its
 *  own rounded edge and transparent corners, so the component adds only a
 *  drop-shadow — nothing to clip, no radius of ours to match against theirs. */
export const OnBrandField: StoryObj<AuthEmbed> = {
  render: (args) => ({
    props: args,
    template: `
      <div style="padding:24px;background:radial-gradient(ellipse 90% 60% at 50% 18%, var(--brand-field-glow) 0%, transparent 60%), var(--brand-field)">
        <halo-auth-embed [shotSrc]="shotSrc" />
      </div>`,
  }),
};
