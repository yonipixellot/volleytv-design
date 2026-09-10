# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Athletes** — play for one team ("self") or several ("multi-team"); have a "You · #N" identity, personal stats, and an auto-tagged personal highlight reel.
- **Parents** — follow one or more linked children's teams and games; may or may not also be an athlete themselves ("Parent", "Parent + Athlete", "Parent + Athlete · multi-team").
- **Children with their own login** — a restricted persona: same athlete surfaces, scoped permissions.
- **Coaches** — team-admin surfaces (roster management, claim approvals) on top of the athlete/fan view.
- **Fans** — follow teams/players and watch without a playing or parental identity; no personal stats or highlight reel.

Persona is never a stored identity in the product — it's a preset over five orthogonal capability axes (self / multi-team / parent / child / coach), and every persona is a combination of these (see `ViewContext`/`PersonaAxes`). Subscription tier (Free / Basic / Premium) is a second, independent axis that gates content depth, not identity.

## Product Purpose

Halo is an **OTT (over-the-top) streaming platform for sports leagues and federations**; this repo is its volleyball tenant, **Volley TV**: live match streaming, full-match replays, and personal + team highlight reels, wrapped around team/player following, competition and federation browsing, and account/subscription management. A league or federation (a "tenant") stands up its own branded instance of the platform for its members — players, their families, coaches, and fans — to watch and follow games.

## Positioning

A white-label OTT layer purpose-built for league/federation operators, not a single consumer-facing streaming brand: any league can stand up its own branded tenant (wordmark, colorway, ball/crest art) over one shared product and design system, without forking the codebase. Content and terminology scope to whatever tier of volleyball the tenant runs (currently club / school / college indoor 6v6; the architecture doesn't assume that ceiling — see Operating Context).

Within that, the personal-highlight-reel mechanism — an athlete's own plays auto-tagged by type (kill, ace, block, dig, set assist) and gated per subscription tier — is the athlete/parent-facing hook a generic league-streaming product wouldn't have.

## Operating Context

- **Tenants:** each is a distinct brand skin (`data-skin`, brand tokens `--primary`/`--secondary`) over the shared app shell, declared as one `TenantBrand` object in `app/tenant.ts` (skin, name, lockup files, identity provider) and swappable at runtime via `TenantConfig.use()`. This build ships the "Volley TV" tenant, a **placeholder brand** for sales demos (no real partner behind it). It carries 6 generic regional leagues plus an "all regions" view; switching region re-brands the wordmark and re-scopes content, the same mechanic the Hoops TV build uses for Basketball Australia's 8 state federations.
- **League tier today, open-ended tomorrow:** live content is currently framed as club / school / college competitions ("Monday Men Div 1", "U18 Girls" etc.). This is the current tenant's level, not a hard product ceiling — the platform is built to onboard other clients, including higher/professional tiers, later.
- **Core loops:** browse live/upcoming/past games and highlight rails on Home; watch a live stream, a full-game VOD, or a personal/team highlight clip; follow teams and players; switch federation/competition scope; manage account, following list, and subscription; coaches additionally manage roster claims.
- **Video formats carry meaning:** game footage (live, full games, team highlights) is horizontal 16:9 in the horizontal player; an athlete's own personal highlight reel is vertical 9:16 in a separate story-style player. These are not interchangeable.

## Capabilities and Constraints

- **Two independent gating axes** (never conflate them): persona (`ViewContext.caps()` — isAthlete/isParent/isChild/isCoach/isFan/multiTeam) controls what's *shown/scoped*; subscription tier (Free/Basic/Premium) controls content *depth*.
- **Tier gate on personal highlights** (`clip-access.ts`, the single source of truth for this rule): Premium unlocks every personal clip; Basic unlocks common plays (kills / set assists / aces) but locks the premium plays (digs / blocks); Free locks all of an athlete's own highlight content. Tenant-uploaded ("external") content is never filtered by tier.
- **Brand assets are locked, not themeable, per tenant:** tenant logo/wordmark files are rendered verbatim (no recolor, no effects, no altered element relationships); Volley TV's are placeholders drawn to that rule. Region crest/ball art is themeable through the token layer. Don't conflate the two asset classes.
- **[Undecided]** Whether/when non-junior (e.g. professional/elite) league tenants are actually scheduled, and what if anything in the current data model would need to change to support them.
- **[Undecided]** Real backend integration timeline — the build currently runs on mock data (see Evidence on Hand); no confirmed date for connecting real game/stats feeds.

## Brand Commitments

- **Halo** is the underlying multi-tenant platform/design-system name; **Volley TV** is this repo's tenant brand, a working placeholder (coral lockups for dark grounds, deep teal for light) until a real volleyball client brings its own style guide. **Hoops TV** (basketball) lives in the upstream `halo-design` repo.
- Regions are generic placeholders (monogram crests, ball colourways); there is no federation partner behind this build.
- The design system already ships brand knobs (`--primary`/`--secondary`, derived `--accent`) specifically so a new tenant's skin doesn't require touching component code.

## Evidence on Hand

- Game, live, highlight, and fixture content is **mocked** (`events-data.ts` and similar) — there is no live backend/game-stats feed wired up yet. Future work must not present this mock content as real usage data, real customer testimonials, or real viewership numbers.
- Every brand, region and club asset in this build is a placeholder; none represents a real partner.
- A completed WCAG 2.1 AA (+ partial 2.2 AA) accessibility audit exists (`A11Y-AUDIT.md`, axe-core 4.13 against all 12 live routes, 0 violations at last run) with a dated list of specific fixes already applied — treat its documented gaps/fixes as the accessibility baseline to preserve, not redo from scratch.

## Product Principles

1. **Persona and tier are orthogonal, and the UI only ever reads derived capabilities** (`caps()`), never a raw persona key — adding a persona or a tier rule must not fan out into `if persona === …` checks across pages.
2. **Tenant skins are a token/asset swap, not a fork** — new brand work (colors, wordmarks, federation art) goes through the existing brand-knob/token layer so the shared component set and design system stay singular across tenants.
3. **Video format follows content meaning, not convenience** — horizontal is game footage, vertical is an athlete's personal reel; don't blur that line for layout convenience.
4. **Official brand and federation assets are used verbatim** where the source style guide says so (tenant wordmarks, region crests) — recoloring or altering them is a defect, not a style choice.
5. **Never present mock data as real** — this build runs on placeholder game/stats content; any user-facing or stakeholder-facing claim of real usage, viewership, or testimonials must be flagged as fabricated until a real data source is wired up.

## Accessibility & Inclusion

WCAG 2.1 AA is the confirmed baseline (audit already performed and passing at 0 violations across all 12 routes, both themes; see Evidence on Hand). The product also ships a user-facing accessibility control panel (text size, contrast, motion) as a real feature, not just a compliance checkbox — preserve and extend it rather than replacing it with a purely automated-compliance approach.
