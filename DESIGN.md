---
name: Halo
description: White-label OTT sports-streaming design system — a brand-neutral chassis that tenants re-skin through two color knobs, on one 4px rhythm grid addressed by semantic tokens.
colors:
  ink: "#eef1f6"
  ink-muted: "rgba(238, 241, 246, .60)"
  ink-subtle: "rgba(238, 241, 246, .52)"
  screen: "#0b0c0f"
  card: "#16181d"
  card-raised: "#1e2126"
  hairline: "rgba(255, 255, 255, .09)"
  live: "#ff5a5f"
  live-filled: "#d12b2f"
  positive: "#37d886"
  premium-gold: "#ffce3a"
  crest-plate: "#ffffff"
  crest-edge: "rgba(18, 22, 30, .22)"
  player-bg: "#000000"
  skin-base-primary: "#5c86ff"
  skin-base-secondary: "#8b5cff"
  skin-volleytv-primary: "#0f5c6e"
  skin-volleytv-secondary: "#ff6b35"
typography:
  display:
    fontFamily: "'League Spartan', 'Antonio', 'Arial Narrow', sans-serif"
    fontSize: "54px"
    fontWeight: 700
    lineHeight: 0.8
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "'League Spartan', 'Antonio', 'Arial Narrow', sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.02em"
  title:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.08em"
rounded:
  pill: "100px"
  card: "24px"
  card-sm: "18px"
  field: "15px"
  phone: "46px"
spacing:
  space-1: "4px"
  space-2: "8px"
  space-3: "12px"
  space-4: "16px"
  space-5: "20px"
  space-6: "24px"
  space-7: "28px"
  space-8: "32px"
  space-9: "36px"
  space-10: "40px"
  space-11: "44px"
  space-12: "48px"
  pad-x: "16px"
  pad-x-wide: "clamp(24px, 3.2vw, 64px)"
  pad-block-x: "var(--pad-x)"
  measure-task: "720px"
  measure-page: "1080px"
  rail-w: "320px"
  nav-w: "220px"
  stack: "12px"
  rail-gap: "12px"
  nav-clear: "108px"
  content-max: "2240px"
  block-gap: "32px"
  section-bottom: "16px"
  pad-card: "16px"
  pad-card-sm: "12px"
  pad-control-y: "8px"
  pad-control-x: "16px"
  pad-field-y: "12px"
  pad-field-x: "16px"
  gap-tight: "8px"
  gap-snug: "12px"
  gap-loose: "16px"
components:
  button-primary:
    rounded: "{rounded.field}"
    padding: "16px 20px"
  button-premium:
    backgroundColor: "{colors.premium-gold}"
    textColor: "#221600"
    rounded: "{rounded.field}"
    padding: "16px 20px"
  button-glass:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "16px 20px"
  button-disabled:
    backgroundColor: "{colors.card-raised}"
    textColor: "{colors.ink-subtle}"
    rounded: "{rounded.field}"
    padding: "16px 20px"
  chip:
    backgroundColor: "{colors.card-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.card-sm}"
    padding: "16px"
  input:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "12px 16px"
  icon-button:
    backgroundColor: "{colors.card-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "38px"
---

# Design System: Halo

## Overview

**Creative North Star: "Quiet chassis, loud sport"**

Halo is not one brand's app skin — it's a base layer that tenants wear, and the roster grows. Every screen is built from the same flat, tonal, dark-first chassis: near-black surfaces, hairline borders instead of heavy card outlines, restrained neutral chrome everywhere the product itself isn't the point. The chassis stays deliberately quiet so two things can be loud instead — the tenant's own two brand colors, and the actual sport: game photography, live scores, and team crests sit on top of the neutral surfaces at full color and contrast.

The system owns no palette. It owns a **contract**: two knobs (`--primary`, `--secondary`), a rule for which one leads the accent role per theme, and a set of semantic tokens every component reads instead. Coral and deep teal belong to Volley TV (this repo's tenant); lime and purple belong to Hoops TV in the upstream repo; signal blue is only the neutral fallback when nobody has set a knob. Any hex in this document is an example of a skin, never a description of Halo. If a design decision cannot survive its accent changing overnight, it is not a Halo decision.

Space is the other half of the contract, and it is the half that used to leak. Depth is tonal rather than skeuomorphic — a small ladder of dark, soft-blurred shadows separates chips, cards, and floating surfaces without ever reading glossy. Corners are consistently soft. And every gap in the product now resolves to one 4px rhythm grid, reached through a token that names the *role* rather than the number, because the alternative was measurable: four separate components each hardcoded their own screen inset, drifted to 22 / 22 / 26 / 26px, and no rule in this file could tell you which was right.

**Key Characteristics:**
- No palette of its own — two CSS custom properties change per tenant, and everything interactive derives from them.
- Dark-first: every token, shadow, and scrim is authored for the dark theme first, with an explicit AA-checked light variant.
- Flat and tonal elevation — depth from layered near-black surfaces and colorless shadows, never surface texture.
- All-soft-corner shape language — pills for controls, 15–24px radii for everything else. No sharp rectangles.
- One 4px rhythm grid, addressed by semantic spacing tokens; a raw px spacing value in a component is a defect.
- Two fixed exceptions to tenant theming: Premium gold and OS-style system controls.

## Colors

Two systems layered on each other: a **fixed role scale** identical in every tenant, and a **per-tenant knob pair** the role scale never touches.

### Primary
- **The primary knob** (`--primary`): one of the tenant's two brand colors, supplied per skin and overridable at runtime — the admin app injects `style="--primary:…;--secondary:…"` on the `.halo` root, so a re-skin needs no rebuild. It has no default identity; the frontmatter's `skin-base-primary` is a fallback for an unconfigured tenant, not Halo's color.

### Secondary
- **The secondary knob** (`--secondary`): the tenant's second brand color, used wherever a skin needs two distinguishable hues rather than one repeated one — most visibly the brand gradient ornament.

### Tertiary — the derived accent
- **`--accent`** is not a third color. It is whichever knob *leads* for the current skin and theme, and the lead can flip between themes: Volley TV is coral-led on dark and teal-led on light (Hoops TV, upstream, is lime-led on dark and purple-led on light). Every interactive color in the product derives from `--accent`, plus `--accent-deep` (84% mixed toward black) for pressed states.

### Neutral
- **Ink** and its two muted steps carry all text. `ink-subtle` is accessibility-load-bearing, not a stylistic opacity — it was raised from a failing value during an audit specifically to clear WCAG AA 4.5:1. Treat its number as a test result.
- **Screen / Card / Card-raised** are the three-step surface stack: the page ground, the resting surface, and the surface that sits visually above it (chips, hovered rows).
- **Hairline** is the only border treatment in the system. There is no heavier card-border weight to reach for.

### Status colors — tenant-independent by role and by hue
- **Live** is the indicator hue for the live dot, ring, and glow; **live-filled** is its darker sibling, used only where a *filled* badge carries white text and the brighter one would fail contrast.
- **Positive** marks confirmations and upward deltas.
- **Premium gold** is identical in every tenant and every theme.

### Named Rules

**The Two-Knob Rule.** A tenant is defined entirely by its two knobs plus which one leads per theme. If a skin needs a third color to feel on-brand, the component needs a new semantic token — not the tenant a third knob.

**The No-House-Palette Rule.** Halo has no brand color, and no document, mockup, or component may imply one. Components read `--accent` and the role tokens; a tenant hex never appears in component CSS. When you need to *show* color, show it labeled as a skin.

**The Gold Exception Rule.** Premium gold never derives from the knobs. "Premium" is platform language, not brand language, so it reads identically under every league's colors. OS-style system controls (the toggle green) are exempt for the same reason: a switch should read as a switch, not as brand.

## Typography

**Display Font:** League Spartan (variable, 100–900), with Antonio as its metric-matched fallback.
**Body Font:** Inter (variable, 100–900).

**Character:** A tall, condensed, geometric display face for anything shouting a name, a score, or a section title, set against a workmanlike, highly legible body face for everything you actually read. The two never trade roles — body text is never League Spartan, and the display face never carries a paragraph.

### The Two Faces Rule

Which face is decided by what the text **is**, not by where it sits. League Spartan takes exactly three kinds of text:

| League Spartan | |
| --- | --- |
| **Titles** | the name of a surface or a block: page, panel, sheet, section header, empty-state headline |
| **Names** | proper nouns: team, player, plan |
| **Numbers** | figures read as figures: scores, prices, stats, counts |

Inter takes everything else, without exception: sentences, subtitles, helper text, list-row titles, form labels, values, buttons, meta, and the 12px tracked caps used for eyebrows and group labels.

**A list-row title is not a title.** "Hoopstars 1 is live" names an event inside a panel, not the panel, so it is Inter while the panel's own name above it is League Spartan. Set both the same and the panel loses any rank between itself and its contents.

**The row wins over the name.** Titles and names collide on one case: a team name inside a list row is both. The row wins — the display face is for a name being *presented* (a hero, a scoreline, a card headline), not for one being *listed*. Row titles are Inter 700 / 16 whatever they name.

**Case is a separate axis from face.** Choosing the display face does not choose uppercase — measured across the app, 67 of its 81 uses are sentence case. A title that is a *label* goes uppercase (`NOTIFICATIONS`, a section header, a team name in a hero); a title that is a *sentence* stays sentence case ("You're all caught up"), because uppercase turns a sentence into a slogan. Body goes uppercase only at 12px, tracked, 800.

**The panel test:** every panel opens with one display line and nothing under it competes. If two lines in one panel share a face and a size, one of them is in the wrong place.

### Hierarchy

Five body steps and five display steps, named for their role rather than a t-shirt size, so the choice is visible where it is made.

- **Display** (700, 54px, line-height 0.8): hero score numerals only, the loudest text on any screen. Four smaller display steps carry names and sub-scores down to the 20px section header.
- **Headline** (700, 20px, tracked 0.02em, uppercase): section titles. Takes the tenant accent rather than neutral ink — headings are one of the few text elements allowed to carry brand color.
- **Title** (700, 18px): card and row titles — team names, video titles.
- **Body** (500, 14px, line-height 1.5): standard UI copy and list text. One step above it, 16px, carries control labels and subtitles.
- **Label** (700, 12px, tracked 0.08em, uppercase): meta captions, tags, tab labels. Always tracked wide and uppercase, never mixed case. 12px is the floor of the system.

The scale was ten body steps, seven of them a single pixel apart (9/10/11/12/13/14/15/16). That is a gradient, not a hierarchy — nobody can see 10 against 11 — and it put the most-used text in the product at 12px. Five steps, and a floor raised from 9px to 12px.

### Named Rules

**The Metric-Match Rule.** League Spartan ships oversized ascent/descent metrics; every display use overrides `ascent-override`/`descent-override` so caps sit optically centered instead of floating in an oversized box. Never drop the display face into a layout without checking this — it is also why the type scale carries a 20px headline step that visually matches Antonio at 24px.

**The One Voice Rule.** A component is either display (League Spartan, shouting) or body (Inter, reading). Never both in one text node.

**The Ratio-Not-Grid Rule.** The type scale is a ratio scale and is deliberately *not* on the 4px rhythm grid. Font sizes reference `--fs-*`; the rhythm grid governs the space *around* type, never the type itself. Do not round a step to a multiple of four.

**The Reachable-Size Rule.** A hardcoded `font-size` is a defect, and not for tidiness: the accessibility text control re-derives the whole `--fs-*` scale, so a literal is the one value it cannot reach. Everything around it grows and that label does not, for exactly the user who asked for larger text. Machine-checked by `bun run lint:spacing`, with the same escape hatch as the spacing rules — a size genuinely off the ladder may stay a literal if it states why.

## Layout

One content inset governs the screen: `pad-x` (16px) on phones, and from the tablet breakpoint up `pad-x-wide` — a single `clamp(24px, 3.2vw, 64px)` that grows with the viewport instead of stepping at each breakpoint (24.6px at 768, 32.8 at 1024, 41 at 1280) rather than jumping to a second fixed number. Everything that meets the screen edge — header, status bar, stories rail, section headers, hero, card rails, empty states, filter rows — takes that same inset. There is no second, wider "section" inset; the one that existed put every section header 4px off the cards it introduced.

**A block reads `pad-block-x`, never `pad-x` or `pad-x-wide` directly.** It resolves to `pad-x`, and a route that owns a wide layout raises it to `pad-x-wide` once, for its whole subtree: `.dhome` at the tablet breakpoint (`styles.scss`), the Games column at 1024 where that page becomes two panes. This is the only decision either route makes about insets; every block then follows, and a new block is correct by writing one token.

The rule exists because the alternative was tried. The choice used to be re-made per component — five organisms carried a near-identical `:host-context(.dhome) @media (min-width: 768px)` widening block, which meant Games, marked with a different class, inherited none of them and padded its column instead while every block kept the phone inset it carries for a full-bleed page. Measured on one screen: painted left edges at 421 for the banner, 437 for a section heading and 445 for a card, against Home's single 41. A page-level block also has no business insetting itself differently from its neighbours: the ladder card sat at 24px where the heading above it sat at 16, on both pages that stack it.

**A page declares its measure; it does not invent a number.** `measure-task` (720) is a single-column task: one form, one list of rows, one decision — wider puts a label at one end of the screen and its control at the other. `measure-page` (1080, stepping once to 1360 past 1600) is a content page: cards, grids, media. A page that is itself a grid — Home, the event lanes — takes no measure at all and lets the grid add columns inside `pad-block-x`.

Ten measures were in play before this: 720, 840, 940, 1028, 1080, 1120, 1180, 1360, 1400 and 1560, one per screen as each was adapted, and no two pages lined up.

**Two rail widths, two jobs.** `rail-w` (320) is the page's own rail: what stays true while the column beside it scrolls — see The Rail Rule under Named Rules. `nav-w` (220) is a list of destinations, like the settings sidebar. The distinction that matters is width and purpose, not the kind of thing inside.

**A click-away scrim must not cover the button that opened it.** The scrim is `fixed; inset: 0`, so it covers its own trigger, and every second press lands on the scrim instead: press, nothing; press, opens; press, nothing. The trigger stacks with its menu, above the scrim, and stays a real toggle. Four menus shipped with this before it was caught — a folder overflow, two filter pills and a month picker.

**A panel that opens must animate to its height, not appear at it.** Content created by a template condition arrives at full size in one frame; measured on the clips folders, that was an instant 420px shove of everything below. A grid row from `0fr` to `1fr` opens to the content's own height without anyone having to know it in advance. Two rules make it work: the element that clips carries nothing but the clip — padding on it leaves the content visible inside that padding — and the top hairline is an inset shadow, because a border is painted outside the content box and survives the collapse.

**Four bands**, hardcoded as literal `min-width` values because custom properties cannot be read inside a media-query condition:

| Band | Canvas | Rails | Navigation |
| --- | --- | --- | --- |
| **< 768** phone | centred 430px frame | horizontal scroll | floating dock |
| **768–1023** portrait tablet | grows | 2-column grid | floating dock |
| **1024–1279** landscape tablet | grows | 3-column grid | inline header |
| **1280–1599** desktop | grows | 4-column grid | inline header |
| **1600–1999** wide | grows | 5-column grid | inline header |
| **≥ 2000** very wide | stops at `content-max` (2240px) | 6-column grid | inline header |

**A wide screen earns more cards, not bigger ones.** Held at four columns a card went from 290px at 1280 to 440 at 1920 and 599 at 2560 — the same layout stretched, still holding 12px text. Each column step is placed so the card lands back near 290–350px, the width it holds at 1280. Past `content-max` the canvas stops growing and the body's ambient backdrop surrounds it, which is the same device-frame language the phone band already uses.

Anything with a fixed dimension needs a ceiling for the same reason. The hero's height is a clamp rather than a constant, because only its width was moving and it flattened to 6.8:1 at 2560; the ad's 21:4 ratio is capped by a max-height, because a fixed ratio on a growing canvas is a growing billboard.

A tablet is neither a big phone nor a small desktop, and treating it as either is the failure this table exists to prevent. The nav switches at 1024 rather than 768 because a portrait tablet is held like a large phone, while a landscape one has the width for an inline row and would leave the dock floating lost in the middle of it. Rails show one full row per band and put the rest behind the section's See all, so the last row is never ragged.

The phone frame ends at 768, not 1280. Held to 1280 it made every tablet a 430px column adrift in an empty screen — 44% of an iPad portrait unused, 66% at 1279px, then the whole viewport one pixel later — while text truncated inside the column with 600px sitting empty beside it.

Vertical rhythm between stacked cards runs on `stack`; horizontal rail spacing on `rail-gap`. Between two page-level blocks the gap is `block-gap`; a heading takes `section-bottom` to the content it introduces — deliberately smaller, at a 2:1 ratio, so the heading binds downward instead of floating between two blocks. At 1.33:1 that binding visibly fails, which is why the smaller number is the load-bearing one.

### Named Rules

**The 4px Rhythm Rule.** Every padding, margin, and gap is a step on the 4px grid. Reach for the semantic token that names the role first (`pad-card`, `gap-tight`, `pad-control-x`, `stack`); use a primitive `space-*` step only for one-off rhythm no role names. The ladder is arithmetic, not a lookup table — `space-N` is always N × 4px, from `space-1` (4px) to `space-12` (48px) — so there is nothing to memorise and no room to invent a step. Pick the smallest one that reads right; `10px`, `14px`, `22px` are never the answer.

The ladder has a ceiling on purpose. Above 48px a value is a **layout dimension** rather than rhythm — a hero offset, clearance under a fixed dock, the drop that centres an empty state — and naming those would pollute the scale with one-offs. They stay literals, under the same obligation as the sub-grid end: state the reason. The most valuable case is a *coupled* one, where a padding and a `calc()` elsewhere must move together; the comment is what stops the pair silently drifting apart.

**The Raw-Value Rule.** A raw px spacing value in a component is a defect, not a style choice. The grid alone does not hold: before this rule the codebase had 930 hardcoded spacing literals against 101 token references, 62% of them off any grid, and four separate components each inventing the screen inset. A role token means the decision is made once and every page inherits it — which is the whole mechanism by which a new page adapts for free.

This rule is **machine-checked**, because the version of it that lived only in this file was ignored for months: `bun run lint:spacing` (`tools/lint-spacing.mjs`) fails on any raw padding, margin, or gap, reads the inline `styles:` blocks that a CSS linter cannot, and knows about the two reason-bearing exceptions. Pre-existing sub-grid values whose rationale is lost sit in `tools/spacing-baseline.json` — recorded debt, not an exemption, and a list that may only shrink. Write the rule down without the checker and you have written a wish.

**The Optical Correction Rule.** Values below 4px, and sub-pixel values, are off the grid *by design* — they are a separate, sanctioned class: hairline offsets, geometric derivations from another dimension, and cap-height compensation under the display face. They stay legal, and each one must carry a one-line reason in the code — on the declaration or in the comment block just above its rule. Without a stated reason it is a defect, not an optical correction. The canonical example is the hero score's asymmetric `8.4px / 8.7px` margins, which equalize the measured ink gaps above and below the numerals; equal margins measure 14.6 / 17.3.

**The One-Owner-Per-Gap Rule.** A page-level block contributes **nothing** at its bottom edge. The space between two blocks belongs to the block *below* it, which owns it once via `block-gap`; the only sanctioned bottom edge is a heading's `section-bottom`. Gaps composed from two neighbours are not a style problem, they are an arithmetic one: the same section gap rendered 30px after a card rail and 32px after the ad banner, because the rail contributed 2px and the banner 4px and the heading added 28px to whichever it landed next to. No value was wrong; the sum was unownable. This rule is machine-checked, and the checker **discovers** the blocks from the page templates rather than from a list, so a block added tomorrow is covered without anyone remembering to register it.

**The Ornament-Yields-First Rule.** When a row runs out of room, decoration gives way before content, and content truncates before it pushes anything off-screen. Ordering this in flexbox takes an explicit shrink factor, not hope: at equal factors the decorative rule in a section header kept 34 of its 40px while the heading clipped 28px, because shrink is distributed by basis × factor.

## Elevation & Depth

Depth is tonal and layered, never glossy. Four shadow roles per theme, scaled by how raised a surface reads, plus one hairline highlight that fakes top lighting on floating surfaces without an actual light source.

### Shadow Vocabulary
- **Shadow 1 — chip level** (`0 4px 12px -4px rgba(0,0,0,.5)`): the smallest lift, for pills and small controls.
- **Shadow 2 — card level** (`0 8px 20px -10px rgba(0,0,0,.5)`): default resting elevation for any card or tile.
- **Shadow 3 — floating level** (`0 20px 44px -18px rgba(0,0,0,.6)`): nav docks, popovers, hero cards — anything that detaches from the page.
- **Shadow Up — sheet level** (`0 -18px 50px -16px rgba(0,0,0,.55)`): bottom sheets and takeovers, cast upward because they enter from the bottom edge.
- **Edge** (`inset 0 1px 0 rgba(255,255,255,.07)`): a 1px inner top highlight on floating surfaces; the only place light direction is implied.

The light theme carries the same four roles re-authored on a blue-black (`rgba(16,24,40,…)`) base at lower opacities, and inverts `edge` to a near-white inner highlight.

Brand-accent glows — a colored halo behind a primary button or a live badge — are a deliberate exception, mixed from the accent or status color at use time rather than drawn from the tonal ladder. They exist to say "this is the one thing to press" or "this is live right now."

### Named Rules

**The Colorless Shadow Rule.** Every structural shadow is black-based regardless of tenant color. Only the accent-glow exception is tinted, and it is never load-bearing for hierarchy — remove every glow and the page must still read correctly.

## Shapes

Every corner is soft, and the softness scales with how grabbable the element is: **pill** for anything tappable with a label (buttons at their most casual, filter chips, tab docks, badges); **card** for the largest surfaces (hero cards, the phone-frame corner); **card-sm** for standard cards, tiles, rows, and sheets; **field** for buttons, inputs, and anything text-entry-adjacent. Icon-only controls are perfect circles, never rounded rectangles.

There is no sharp-cornered surface anywhere in the system, and no separate large-pill radius — 100px resolves to a true stadium shape at every control height.

### Named Rules

**The Closed-Radius Rule.** The radius scale is closed: five named steps, no sixth. It is also exempt from the 4px rhythm grid — `field` at 15px and `card-sm` at 18px are shape language, not rhythm, and they do not drift because no component writes a raw radius. Inventing a radius outside the scale is the defect; an off-grid value inside it is not.

## Components

Component character in one phrase: **quiet chassis, loud sport** — controls are deliberately calm (neutral fills, hairline borders, no gradients at rest) so that photography, scores, and the tenant's color are the only saturated things on screen.

### Buttons
- **Shape:** field radius; one shared atom renders every variant, and no bespoke button CSS exists elsewhere in the codebase.
- **Primary:** accent-filled, `on-accent` text, a soft accent-tinted glow. Hover brightens the fill (`filter: brightness(1.05)`) and never changes the underlying hue.
- **Premium:** fixed-gold gradient, independent of the tenant accent — the one variant that looks identical in every skin.
- **Secondary:** solid `--primary`, distinct from the primary CTA's `--accent` fill, for a strong action that shouldn't compete with the hero CTA.
- **Glass / Ghost / Link:** glass is a quiet card surface with a hairline border; ghost is transparent text-only for toolbars and over-media chrome; link is inline text that gains an underline and accent color on hover and focus.
- **Disabled:** always the neutral recipe — `card-raised` fill, muted ink, no shadow. Never a dimmed version of a colored variant; a dimmed accent read as a third, muddy variant in practice and was deliberately replaced.

### Chips
- **Style:** `card-raised` background, hairline border, pill radius, uppercase label type, `pad-control-y` / `pad-control-x` interior.
- **State:** active fills with a low-opacity accent tint and an accent-tinted border rather than inverting to a solid fill.

### Cards / Containers
- **Corner:** `card-sm` for the vast majority; `card` only for hero-level surfaces.
- **Background:** `card`, one flat fill, never a gradient.
- **Shadow:** Shadow 2 at rest. Interactive cards do not gain elevation on hover — hover is handled by background and border tint, not lift.
- **Border:** 1px hairline, always. It is the system's only border weight.
- **Interior:** `pad-card`, or `pad-card-sm` for compact rows and dense list items.

### Inputs / Fields
- **Style:** `card` background, hairline border, field radius, `pad-field-y` / `pad-field-x` interior so the tap target clears WCAG comfortably.
- **Focus:** border shifts to the accent plus a soft 3px accent-tinted ring. Never a hard outline alone.
- **Error:** the same ring treatment recolored to the live status red.

### Navigation
Two presentations of one navigation, never both at once. Below 1280px it is a floating pill dock: circular icon-plus-label tabs with the active tab filled solid in the accent — "a basketball" is the internal name for that treatment. At 1280px and above the dock disappears and the tabs move inline into the top header as **text-only labels** — no tab icons, because at header density the glyph only repeats the word beside it — with the active tab marked by a low-opacity accent tint on a pill, not a solid fill that would fight the wordmark next to it. A lock badge is the one glyph that survives into the header row, because it says something the label cannot.

The header nav deliberately omits **Home**: the wordmark to its left already goes there, and a Home tab beside it is a second control for one destination.

### Section header (signature component)
The recurring device that introduces every rail: an accent tick, an uppercase display title, a decorative rule, a count, and an optional See all. It is also the system's worked example of the Ornament-Yields-First Rule — the rule collapses to nothing before the title concedes, the title truncates before the count is lost, and the count never leaves the screen. Titles carry **tenant** text, so the truncation path is a real path, not a defensive nicety.

### Interaction states

Every control carries default, hover, focus, pressed and disabled. Focus and pressed are **system-wide floors**, declared once in `styles.scss` with `:where()` so they cost no specificity and a component overrides them with a plain class. Focus is a 2px accent outline on a contrast halo, keyboard-only. Pressed is `scale(var(--press-scale))`, 0.97 by default; a large surface sets its own — 3% off a 40px control reads as a press, 3% off a 302px card reads as a lurch, so cards use 0.99.

Hover is the pointer-only layer and lives inside `@media (hover: hover)`. The recipe for a surface is a tint, never a lift: the border takes 30% accent into the hairline and the background steps `card` → `card-raised`. Where the surface carries media, the **media** moves — the thumbnail grows a few percent inside its own clip while the card itself holds still. Text controls hover on the label, and a directional control may nudge its glyph toward where the click leads.

Motion carries the state, so `prefers-reduced-motion` cannot simply delete it: pressed swaps the scale for a brightness drop, because a press that acknowledges nothing is worse than no press at all.

### Named Rules

**The Every-Band Rule.** A new page, or an existing one being adapted, is designed at **every band before it ships** — not at the two widths the author happens to have open. Responsive is not a pass you do afterwards; a layout built at one width and stretched later is how this product ended up with 44% of an iPad unused, a hero flattened to 6.8:1 at 2560, and a settings row with its label at one end of the screen and its chevron at the other. Walk the ladder: 375, 768, 1024, 1280, 1920. Check both themes at each. If a band has no answer yet, say so and let the page take the 720px cap — an honest fallback beats a layout that only works where it was built.

**The Band Rule.** A width breakpoint comes from the ladder: 768 / 1024 / 1280 / 1600 / 2000, plus 360 / 390 / 480 / 520 for sub-phone tweaks. Inventing a number creates a band that exists in one file, which no page, token or document knows about, and the next person cannot tell it from a value someone reached for. Machine-checked by `bun run lint:spacing`.

**The Unadapted-Page Rule.** A page that has not been given a wide layout stops at a readable 720px column once the shell uncaps, rather than running full bleed. Stretching an unadapted list to the full viewport is worse than the phone frame it replaced: it puts a row's label at one end of the screen and its chevron at the other. A route opts into the full width by declaring it owns one.

**The Pointer-Only Hover Rule.** Every `:hover` sits inside `@media (hover: hover)`. On a touch screen a hover rule sticks after the tap and leaves a card looking selected until something else is touched.

**The Content-Moves Rule.** A card never lifts, scales or shifts on hover — its media does. A lifting card in a horizontal rail jostles its neighbours, and the rails are how this product is browsed.

**The Rail Rule.** A rail is for what stays true while the column beside it changes: the identity the page is about, and the controls that act on it. You pins the athlete, their team and their season averages while clips and stats scroll past; Game pins the two teams, the score and Editor while Video, Highlights and Stats do. Games pins a calendar. What a rail must not be is a second copy of the content — the earlier form of this rule said "a rail holds controls, not facts", which was written from one bad case (a scoreboard pinned beside a page that repeated it) and then contradicted by every rail we shipped, all of which hold facts. The test is not facts-versus-controls, it is *does this stay put while the reader moves*.

**The Innermost-Control Rule.** `:active` matches an element *and every ancestor*, so a control nested inside a control presses both. Only the innermost one animates: the press rule excludes any element that contains an interactive descendant being pressed. The clips folder header is a 980px `role="button"`, and pressing the 50px overflow disc inside it scaled the whole row — the disc slid 13px left while the title slid 13px right, which reads as the page lurching, not as a press. The exclusion names interactive descendants specifically; a blanket `:not(:has(:active))` would also cancel the press on every button that merely contains an icon.

**The Disclosure-Chevron Rule.** A chevron that opens something points **down when closed and up when open**, everywhere, and the flip is driven by the trigger's own `aria-expanded` — not by a page-local `.open` class. That attribute is the state the control already publishes to assistive tech, so the picture and the announcement cannot drift, and a control that gains the flip has gained the aria at the same time. For some of these controls the flip is the only feedback there is: the menu opens below the fold, and without it a tap looks like nothing happened.

**The Near-Miss Rule.** Hit-testing follows `border-radius`, so the corners of a round button's box fall through to whatever is behind it. Where that "behind" is itself a control, a two-pixel miss does something destructive: aiming at the clips overflow disc and landing wide collapsed the whole folder. A round control in an interactive row gets a square hit overlay, and the region around it swallows clicks so a miss does nothing rather than something. The same applies to a slipped press: `click` fires on the nearest common ancestor of mousedown and mouseup, so a press that starts on a button and drifts a pixel is reported on the row — the row must check where the press *started*, not where it landed.

**A query-bound input arrives `undefined`, not as its default.** `withComponentInputBinding` writes `undefined` into an input whose query param is absent — it does not leave the declared `input('')` in place. So any `input('')` read as a string (`.trim()`, `.split()`, `.includes()`) throws on the ordinary case, the one *without* the parameter, and the whole surface renders blank. It has bitten twice: You's empty-state preview flags, and the reel viewer's single-clip mode, where opening a plain story showed an empty frame. Every query-bound input is read through `?? ''`, and the first test after adding one is the URL **without** it.

**The Host-Attribute Rule.** A component input named after a global HTML attribute leaks onto the host. `title` is the one that bit: a static `title="…"` in a caller's template stays in the DOM, and the browser raises its own tooltip over the component, duplicating text already on screen. Eleven components carried it. The input keeps its natural name; the component clears the host attribute.

**A bottom sheet is a thumb's answer.** On a pointer it stops being one: the accessibility panel left a 430px strip on the floor of a 1280px window, under a dimmed page, with a drag grip no mouse can drag. From 1024 it opens as a popover on its own trigger, joining the "opens a menu" language the header menu, the month pill and the folder overflow already speak. Two things make it work. The scrim stays but goes clear — it still catches the click-away and still makes the dialog modal, so `aria-modal` remains honest; what it stops doing is hiding the page, which for text-size and contrast controls was hiding the one thing the panel exists to change. And the trigger sits *above* that scrim and toggles, or the second press lands on the scrim and the control reads as dead.

**The follow pill is one control in two colours, and it names the action.** Following is the QUIET state: the accent pill is the invitation, and once accepted it steps back to a muted one. The label is "Follow" then "Unfollow" — never "Following", which describes a status and makes the one button that unfollows read as a badge. Both states share a `min-width` sized for the longer word, so a toggle can never reflow the row it sits in — 100px, which is what "Unfollow" needs at body size. The label is body, not caption: at 12px the pill read as a tag rather than the control it is, and on the team card it is the only action in the card. It lives once, as `.halo-follow-pill`; it had drifted to three copies, and the third — the team page's hero — had the colours inverted and the label wrong.

**Clearing a filter is a link, not a button.** It used to sit in the filter row as a fourth pill, the same shape as Game and Date in quieter ink, which put a destructive control in the same visual class as the three beside it that only narrow — and made "Clear" read as one more filter you could apply. Accent text, no box: it is the row's only action, and it should be the only thing in the row that is not a pill. One recipe (`.halo-clear-link`) serves every filter row so two of them cannot drift. The recovery action inside an *empty state* is a different case and stays a button: there it is the way out of a dead end, not a control beside the thing it acts on.

**One control, one focus ring.** The system floor in `styles.scss` gives every `input`, `select` and `textarea` a 2px accent outline *and* a 4px halo. A field whose box is drawn by a wrapper — `halo-form-field`, `halo-form-select`, the filter menu's find field — already answers focus with `:focus-within` on that wrapper, so the floor lands a second indicator inside the first: one ring around the box, one around the text. All three set `outline: none` on the inner control and all three *missed the halo*, because `outline: none` does not touch `box-shadow` and the floor sets both. The wrapped control resets both on `:focus-visible`; the wrapper is the indicator. Note the floor is right and stays: it is what gives a bare control its ring for free. What is wrong is drawing it twice, and the reset belongs to whoever took the job away.

**One filter picker, and it is a component.** You's clip filters were a second implementation of the filter bar written inside the page: its own pill, menu, click-away backdrop, checkbox and radio, about ninety lines of template and CSS restating what `halo-event-filter-bar` already did. The tell was the find field: adding search to "all the filters" would have meant writing it twice, and the second copy would have drifted the day after. The page now passes categories to the shared bar, which grew the two things it was missing — an option whose stored value differs from its label (a game id shown as "vs Hustle HQ"), and a `single` category that replaces rather than accumulates, draws a radio dot instead of a check, and closes on the pick. A `single` category also names its `defaultValue`, the option meaning "no filter", which is ticked but not counted, so sitting on "All time" does not light the pill or raise the Clear link. Two consequences worth stating. The scale went UP, not down: the ported page used 40px pills at `--fs-body` and 44px option rows, the bar used 34 at `--fs-caption`, and the bar moved to meet the page, because 12px is too small for a pill's label and 34px is under every touch-target floor. And the pill label is 500, the body weight, not 700: these are labels on a filter, not headings, and at 700 a row of five read as five titles.

**A menu anchored to its trigger has to be clamped to the screen.** The option menu opens at its pill's left edge, which put the last pill's menu 85px past the right of a 375 viewport. Flipping to the pill's right edge is not the fix: it corrects the wide pill at the end of the row and pushes a narrow one 55px off the LEFT instead. One measured nudge handles both edges, applied as a transform so it cannot re-enter the layout it was measured from. Measured, not derived from the pill's index, because which pill overflows depends on where the wrapping row broke and how wide the longest option is.

**A one-time consent is a checkbox; a setting you live with is a switch.** The onboarding Finish step asked for two consents in two different controls: Terms & Conditions as a checkbox, the marketing opt-in as a toggle right beneath it. Both are answered once, in a form, on the way to somewhere else, so both are checkboxes now and the marketing row reuses the T&C row exactly. The switch is not wrong in general, it is wrong here: a switch says "a state you return to and change", which is what the Alerts step and Settings are, and using it for a form answer makes a one-off decision look like a preference you now own.

**A picker with a list has a find field, and every picker gets one.** The filter menus opened with checkboxes and nothing else, which is fine for four states and hopeless for the Team category on Home and Events, where the list runs to dozens and the answer is a name the user already knows. The field sits above the options, inside the menu, and narrows them live on a case-insensitive substring, so typing "vic" finds Basketball Victoria and not only VIC. It goes in *every* menu, including the four-option ones: the categories are the same control repeated across a row, and a search box in three of five makes the other two look broken. Four things it settles. The field borrows the form field's language, `--r-field`, the quiet surface, the accent focus ring, but not the component: `halo-form-field` is a 48px row at `--fs-body-lg` and would be the largest thing inside a menu of 38px option rows. The list scrolls and the field does not, so the thing the scrolling is *for* stays in view. Escape backs out one step at a time, the query first and the menu second, and Enter takes the first match so a search that leaves one option does not then need a click. And the field is focused on open only where `(hover: hover) and (pointer: fine)` holds: on a phone, focusing raises the software keyboard over the very list it is meant to narrow. The menu is a `role="group"` wrapping a `role="listbox"`, because a listbox may only contain options and the field would be invalid inside it.

**A skin never reaches into a component.** Three shared components used to carry a `:host-context(.halo[data-skin='hoopstv'])` override — the section heading's brand colour, the federation crest's pinned gold, the accessibility fab's Blaze pairing — which meant onboarding a second tenant would have meant *editing shared components*, the one thing the token layer exists to prevent. Each is now a hook: `section-ink`, `fed-crest-ink`, `fab-bg`/`fab-ink`/`fab-edge`, carrying the neutral answer at `:root` and overridden by the skin block. The component reads a token and knows nothing about who is wearing it. A status colour still wins over a hook — a LIVE section stays red whatever the brand says.

**Who the deployment is belongs in one object.** The skin used to be a literal on the shell (`data-skin="hoopstv"`) and the brand artwork an import in eight files — the app header and all seven auth screens. `TenantConfig` holds the skin, the name, the four lockup files and the identity provider, as signals, so `use(brand)` re-skins at runtime the way the admin app already injects `--primary`/`--secondary` inline. A new tenant is: one `TenantBrand` object, one skin block in `_tokens.scss`, its artwork. No component and no page changes.

**A white plate needs a dark edge, in both themes.** Club logos are supplied on white, so every crest sits on one shared white chip — which on a light surface means white on white, and `--hair` at 12% ink was not enough to hold it: a crest beside a team name simply dissolved. The plate's edge is its own token (`crest-edge`), a dark neutral in both themes rather than the theme's hairline, because the edge only has a job on the light side; on dark it reads as the printed edge of a badge. It is drawn as an `outline` with `outline-offset: -1px`, never an inset shadow: the logo is an `<img>` filling the plate, and an inset shadow paints *under* content, so a ring written that way exists and is invisible. An outline paints above content and the negative offset keeps it on the plate's own edge without growing the box. Everything that draws the plate takes it — the crest atom, the stories rail's logo circles, the state sheet.

**One media card, one hover.** A poster, a play disc on it, a title under it — four components draw that object (the home rail card, the game page's video cards, the game's highlight tiles, You's clip tiles) and each had written its own answer to the pointer: one scaled its media, one did nothing at all, two moved a border and stopped. The recipe lives once, in `.halo-media-card`: accent into the hairline, surface up one step, and the *content* scales rather than the card, because a card that grew would jostle its neighbours in a rail or a grid. A locked tile is excluded from the scale — its poster is already blurred and enlarged to tease, and a second transform fights the one that is selling it. Note the resting border and surface had to move into the shared class as well: left in the components, `.htile[_ngcontent]` and `.halo-media-card:hover` both score (0,2,0) and the component sheet is injected later, so the resting border won the hover and the media scaled while the card sat still.

**The Innermost-Hover Rule.** A card that is itself a link, holding a button that goes somewhere *else*, must not light both at once: on the Games live card the card opens the game page and the button opens the video, and a shared highlight tells the viewer nothing about which one the next click will give them. The card's hover stands down while the pointer is on the button (`:hover:not(:has(.cta:hover))`), and the button answers for itself — the tinted variants deepen their own tint, the solid disc goes to the pressed accent. Same reasoning as the innermost-control press rule, one input earlier.

**The Honest Affordance Rule.** Only something that does something gets a hover state. Home's upcoming-row is a `<div>` with no click, no output and no role; giving it a hover would advertise an action that does not exist. A paid ad placement is the same case from the other side: it stays a flat surface, because "the content reacts" is how editorial cards invite a click and lending that to advertising makes the ad behave like the app's own content.

**The Deck Rule (story viewer, desktop).** A reel on a phone is the whole screen; on a desktop it is a card in the middle of one, and the room either side of it is an affordance, not a margin. The neighbouring reels sit there dimmed and one click away, with an arrow in each gap and the close moved off the story into the page's corner — the shape Instagram's desktop story viewer uses, and the reason is the same: without it the only way to the next player is back out to the grid and in again. Three things it settles. The neighbours appear at 1024, not 768: on a portrait tablet the reel already takes the width and the cards were sliced in half by the viewport edge, name and all. The empty slot at either end keeps its box (`visibility: hidden`), so the reel does not slide sideways on the first and last player. And there is one exit per width: the reel's own close is the phone's, the corner close is the desktop's, never both. Below 768 the deck is `display: contents` and the phone layout is untouched.

**A percentage needs a definite height to resolve against, and a flex item sized by `flex-grow` does not give one.** The deck's children are fractions of its height — the reel fills it, a neighbour takes 58% — and inside a flex chain that measured 0×0 for the reel and a full-height stretch for the neighbour. A grid *track* does give one, so the host is a grid; and the chain above it has to be definite too, because `.shell` carries only `min-height: 100dvh`, a floor. Stating the page height as `100dvh` minus the two measured bar tokens is what makes every percentage under it mean something. The same fix, in the same words, that both video players needed.

**The One-Scoreline Rule.** A result is written one way in this product: an **en dash** between two numerals, in the **display face with tabular figures**, with air proportional to the size. It lives in `halo-score`, so the glyph exists once. Three things it is not. Not a hyphen — too short to hold two numbers apart at any size. Not a middle dot — that is this app's *metadata* separator ("Tuesday B3 Men · Open A/1"), and lending it to scores made a result read like a field list. And not the body face, which is what a score chip on You had drifted to. Size, weight and colour stay with the surface, because those are hierarchy: the home hero's deliberate 600 and the rail's 700 both survive; what a surface no longer chooses is the punctuation. Before this, the same fact was written four ways across five screens, in three faces. A caption is covered too: the full-game card restated the score as "Hoopstars 1 64 · Vikings Grey 58" beside a card that already showed it, in a grammar the recap card next to it did not share. A caption names the fixture; the scoreline states the result.

**The Player-Chrome Rule.** On the web a video lives *inside* the site, and only fullscreen takes the screen. The app header stays over the players, the page never scrolls, and the floating close button is a phone affordance that stands down from 1024 up: there the wordmark, the nav and the browser's back are the exits, and a glass circle over the footage is one more thing painted on the game. It sits, besides, exactly where a desktop player's system controls are expected. YouTube and Twitch keep their chrome and have no X; Netflix has one because its player *is* the page. Two consequences follow. The player's height is `100dvh` minus the two measured bar tokens (`devbar-h`, `topbar-h`), which read 0 when their bar is absent, so one expression is right at every band; and the fullscreen takeover has to opt *out* of that subtraction, or it comes up short by exactly the chrome it just covered. Nothing may hang below the last row either: the game-link's 44px hit area overhangs its label by 20px, and on a page that is exactly viewport-tall that overhang was the entire scrollbar.

**The frame is the page; the ratio is the video's.** The stage spans the full width and the footage sits inside it at its own proportions, contained and never cropped, because the format carries meaning. A desktop window is wider than 16:9, so past the height clamp there is dark either side of the picture: that surround belongs to the player, and the control bar runs the width of the player rather than of the picture. Shrinking the frame onto the footage was tried and rejected, since it makes the player's width jump with whatever aspect the source happens to have. The metadata below takes the page inset, on the same line as the wordmark.

### Account / overflow menu (signature component)
One component, two presentations from the same data and interaction contract: a full-height slide-in drawer from the left edge on mobile, and on desktop a small anchored dropdown under the avatar trigger with the page-dimming scrim removed entirely — nothing needs protecting from a page the user can still see. The presentations are pure CSS branches; the menu data, sections, and behavior never fork.

## Do's and Don'ts

### Do:
- **Do** derive every interactive color from `--accent`, and treat the two knobs as the only tenant inputs.
- **Do** reach for the semantic spacing token that names the role (`pad-card`, `gap-tight`, `stack`, `pad-x`) before any primitive step, and for a primitive step before any literal.
- **Do** state a one-line reason beside every value that leaves the ladder at either end — sub-4px optical corrections and above-48px layout dimensions. That comment is what makes it a decision instead of a defect.
- **Do** run `bun run lint:spacing` before opening a PR that touches styles, and treat a shrinking `spacing-baseline.json` as real progress.
- **Do** give a new page-level block a top gap and no bottom edge, so the block below it is never guessing what the block above already contributed.
- **Do** design a new surface at every band before shipping it, and verify the ladder — 375, 768, 1024, 1280, 1920 — in both themes.
- **Do** wrap every `:hover` in `@media (hover: hover)`, and let the system's `:where()` floors give a new control its focus ring and press state for free.
- **Do** move the media on hover and leave the card still, so a rail never jostles.
- **Do** keep Premium gold and the OS-style system green fixed across every tenant and theme; they are platform language.
- **Do** use perfect circles for every icon-only control at the sanctioned 38px (34px small, 44px large).
- **Do** author shadows colorless, reserving color for the deliberate accent-glow exception on primary buttons and live indicators.
- **Do** treat `ink-subtle`'s opacity as an accessibility test result, not a stylistic choice.
- **Do** hardcode 768px and 1280px in `min-width` queries — custom properties are unreadable inside a media-query condition.
- **Do** give a flex row an explicit shrink order when it can run out of room, and verify it at 375px with the longest real tenant string.

### Don't:
- **Don't** name, ship, or imply a house palette for Halo. There is no Halo green, blue, or purple — only a tenant's.
- **Don't** put a tenant hex in component CSS, ever, even "temporarily" for one skin.
- **Don't** introduce a third brand knob. If a component needs another hue, it needs a semantic token, like the status colors have.
- **Don't** write a raw px padding, margin, or gap in a component when a role token exists — that is how four components each invented the screen inset.
- **Don't** land on an off-grid spacing value because it looked right. Round to the nearest 4px step and adjust the surrounding layout instead.
- **Don't** put the type scale or the radius scale on the rhythm grid. They are a ratio scale and a closed set; the grid governs space, not shape or size of type.
- **Don't** apply a dimmed version of a colored button for the disabled state — disabled is always the neutral recipe.
- **Don't** give any surface a sharp corner, or invent a radius outside the five named steps.
- **Don't** add a glossy gradient, bevel, or skeuomorphic highlight to a card or button at rest.
- **Don't** run two navigation models on one screen. The mobile dock and the inline desktop header are exclusive alternates gated by the same breakpoint.
- **Don't** let a heading clip so that decoration can keep its full width.
- **Don't** invent a breakpoint. Use a band, or state why this screen needs one of its own.
- **Don't** ship a layout built at one width on the assumption that responsive is a later pass. It is the same work, done once, at the point where it is cheap.
- **Don't** put a hover state on something that isn't interactive, or on a paid placement. A hover is a promise that a click does something.
- **Don't** delete the pressed feedback under `prefers-reduced-motion` — swap the scale for a tonal cue instead.
- **Don't** put a bottom margin or padding on a page-level block. If two blocks need more air, raise the gap on the lower one; splitting it across both is how the rhythm drifted in the first place.
