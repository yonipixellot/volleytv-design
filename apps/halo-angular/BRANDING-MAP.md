# Branding fields → UI

What an operator sets in the admin panel, and where each field lands in the app.
Written from the app rather than from the admin schema, so it says what is
actually read.

There are exactly **two** destinations for a branding field. One that maps to
neither is dead on arrival, however well formed it is, and that is the answer for
eight of the fourteen.

| Destination | What lives there |
| --- | --- |
| `app/tenant.ts` → `TenantBrand` | Name, artwork, identity provider. A plain object swapped at runtime; signals, so a swap re-renders with no reload. |
| `styles/_tokens.scss` → `[data-skin]` | Colour, as CSS custom properties, one block per theme. The admin can also inject `--primary` / `--secondary` inline on the root with no rebuild. |

## How the three colour fields relate

An operator sets **two** brand colours. The app derives `--accent` — what carries
buttons, links and headings — from that pair, and **which of the two leads can
flip per theme**. So one colour can be the accent on the dark ground and only a
surface on the light one.

It flips because the accent has to hold text, which means clearing 4.5:1. A pale
brand colour works on a dark ground and fails on white, so the darker of the two
takes over in the light theme. That is the whole job of the third colour field.

**Surfaces are not the operator's.** `--card`, `--card2`, `--court` and
`--screen` come from the platform, so the app reads as one product whichever
operator runs it, and the surface-and-ink pairings behind the WCAG AA baseline do
not have to be re-verified per operator. The two washes are the only intended
reach into the background, and they are a tint over it rather than a replacement.

## Read by the app

| Field | Where it shows |
| --- | --- |
| `name` | The copy on all seven auth screens · the sign-in lead and its button where the operator signs its own users in · the alt text of the header logo · **the wordmark the app draws itself** in the display typeface whenever no logo file resolves |
| `logoFull` | **Auth screens only:** the plate at the top of sign up, forgot password, verify, verify code, reset password and complete profile, and the large stacked lockup on the sign-in brand panel. Not the header logo |
| `logoMark` | **The app header, top left, on every screen**, at every width, and beside the wordmark on sign-in at phone width. The app reads a colourway per theme: one file for dark, one for light |
| `primaryColor` | The interactive colour, normally the dark theme's accent. **Home:** the unseen ring on a story circle, the jersey-number disc, Watch live, the active team tab's underline, See all, section headings, a live card's border tint. **Games:** the selected day, the ring on today, the active month, a winner's score. **You:** the profile header gradient, highlighted averages, the active segment, set filter pills, a clip tile's play button. **Game:** the leading score, the Editor pill, the active segment, a moment tile's play badge, hot stat values. **Team:** the Follow pill when following, section headings, See all. **Auth:** the panel behind the form and its glow, every primary button, the brand card's fill and border. **Onboarding:** step progress, the selected persona, Follow pills, selected days in the calendar. **Everywhere:** the filled bottom-nav item, the focus ring, the live badge, toasts |
| `accentColor` | The **light theme's** accent: the same list as `primaryColor`, on the pale ground. Nothing on dark |
| `secondaryColor` | The other accent candidate, so where a theme is led by it the `primaryColor` list is painted by this instead. Plus what must **not** flip with the theme, and the second stop of every brand gradient: Watch live on the hero, the gradient inside a story ring, a clip tile's round play button, the glow at the centre of the auth panel, the icon fill in an inline-SVG lockup, and the brand gradient behind artwork-less cards, the video frame and the splash |

## Not read by the app

Missing slots rather than faults. Each needs a decision before it can be wired.

| Field | Why nothing happens |
| --- | --- |
| `hueA` / `hueB` | The upper and lower background washes, the tint that stops the dark canvas reading as flat black. They feed `--bg`, and **nothing in the app paints `--bg`** — the one rule that reads it is `.sb-frame`, applied by `.storybook/preview.ts` alone, so the washes show in Storybook and nowhere in the product. The shell paints the flat `--screen`; verified on a running build, where the shell's computed `background-image` is `none`. If they are wired they need a ceiling: they arrive around 0.30–0.40 alpha where the platform's own washes are 0.16 and 0.06, and at that strength a wash stops tinting the ground and starts replacing it |
| `appLogo` | There is one logo source and `logoFull` fills it. The app draws no distinction between "the logo on the auth plate" and "the logo in the app" |
| `initial` | No monogram slot for the operator. The two-letter discs belong to **teams** and the number discs to **people** |
| `tagline` | No surface prints it. Under the lockup on the auth screens is the natural home |
| `appFavicon` | One fixed icon ships for everyone, set in the page HTML before any operator is known |
| `authHeroDark` / `authHeroLight` | The auth screens have no image slot: that panel is a colour gradient built from the two brand colours. The only per-theme artwork pair in the record, which the logo fields are not |

## Two shortfalls in what the record supplies

**No wordmark, and no per-ground colourways.** The header lockup is mark plus
wordmark with a colourway per theme, which is five assets: one plate lockup, two
brandmarks, two wordmarks. The record supplies three images and no wordmark. So
either the admin grows the missing fields, or we state that an operator ships one
mark and the app derives the rest, a wordmark set from `name` and one file used on
both grounds. Either is workable; leaving it unstated makes every new operator
guesswork.

**A second colour is not optional.** With `secondaryColor` empty the app has one
colour instead of two: every gradient above collapses to a single hue, the
elements pinned to it come out the same as everything else, and the light theme is
left without a second usable colour, which forces `accentColor` into that role.

## Related

- `app/tenant.ts` — `TenantBrand`, the shape a record has to become
- `styles/_tokens.scss` — the skin blocks, one per theme
- `DESIGN.md` — the two-knob colour model this is measured against
