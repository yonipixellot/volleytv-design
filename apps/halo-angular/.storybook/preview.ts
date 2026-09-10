import type { Preview } from '@storybook/angular';
import { applicationConfig, componentWrapperDecorator } from '@storybook/angular';
import { provideRouter, withDisabledInitialNavigation } from '@angular/router';
import '../src/styles.scss';

const preview: Preview = {
  // Docs page for every component (D1) — the DS contract surface.
  tags: ['autodocs'],

  // Theme + skin toolbars.
  globalTypes: {
    theme: {
      description: 'Theme',
      defaultValue: 'dark',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'dark', title: 'Dark', icon: 'circle' },
          { value: 'light', title: 'Light', icon: 'circlehollow' },
        ],
        dynamicTitle: true,
      },
    },
    skin: {
      description: 'Skin',
      defaultValue: 'base',
      toolbar: {
        title: 'Skin',
        icon: 'paintbrush',
        items: [
          { value: 'base', title: 'Neutral (base)' },
          { value: 'volleytv', title: 'Volley TV' },
        ],
        dynamicTitle: true,
      },
    },
  },

  decorators: [
    // Provide a router so page components that inject Router (bottom-nav tabs,
    // auth/onboarding flows) render in Storybook. Navigation is inert here.
    applicationConfig({ providers: [provideRouter([], withDisabledInitialNavigation())] }),
    // Wrap every story in the themed .halo frame, driven by the toolbars.
    componentWrapperDecorator(
      (story) =>
        `<div class="halo sb-frame" [attr.data-skin]="skin" [attr.data-theme]="theme">${story}</div>`,
      ({ globals }) => ({
        skin: globals['skin'] ?? 'base',
        theme: globals['theme'] ?? 'dark',
      }),
    ),
  ],

  parameters: {
    layout: 'fullscreen',
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    // Phone-first canvas, matching the current Storybook's haloPhone viewport (390px).
    viewport: {
      options: {
        haloPhone: { name: 'Halo phone', styles: { width: '390px', height: '844px' } },
        // Presets aligned to the --bp-* breakpoint tokens (_tokens.scss) for the
        // desktop build: tablet = --bp-tablet (768), desktop = --bp-desktop (1280).
        tablet: { name: 'Tablet (--bp-tablet)', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop (--bp-desktop)', styles: { width: '1280px', height: '900px' } },
      },
    },
    // Fail stories on axe violations (D2). Theme sweep 2026-08-21 got the
    // matrix to 0 contrast flags — keep it that way. CI gate: run
    // `storybook test` across theme×skin in the deploy workflow (deferred to
    // the yoni/halo-angular branch — needs a push).
    a11y: { test: 'error' },
  },

  initialGlobals: {
    viewport: { value: 'haloPhone', isRotated: false },
  },
};

export default preview;
