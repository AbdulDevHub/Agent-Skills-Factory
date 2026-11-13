---
name: omni-ui
description: "Design, build, restyle, critique or audit any web UI: pages, landing pages, dashboards, components, extension popups, mod panes. Use for 'make it look better', 'polish', 'redesign', 'review this UI', and for spacing, type, colour and animation choices. Not for charts alone (dataviz), SEO (web-seo-optimization), React performance (vercel-react-best-practices) or published Artifacts (artifact-design)."
---

# OmniUI

One skill for making web UI that looks intentional, reads clearly and works for everyone. Text only: no scripts, no generators, no registry files.

**How to use it: a reference, not a rulebook.** Most of this skill is merged from other people's design skills (see `SOURCES.md`). Those were written against older models' habits and are sometimes wrong for a given page. Treat the taste rules (sections 3 to 5: colour, type, layout, bans, copy tells) as defaults and a checklist of common failure modes. When your own judgment, the brief or the project's existing look says something else would clearly be better, do that and say why in one line. Firm only: accessibility (contrast, keyboard, focus, touch targets, reduced motion), the user's own instructions, and the verify step (section 6).

## 1. Modes

Pick the mode from the request, then load only the reference it names.

| Mode | When | Load |
|---|---|---|
| Build | New page, component, popup or pane; "redesign" | `references/build.md` |
| Polish | "Make it look better", "polish", spacing/type/colour fixes on existing UI | `references/build.md`, then `references/critique.md` for the self-check |
| Critique or Audit | "Review this UI", "audit", "what's wrong with this page" | `references/critique.md` and `references/a11y-checklist.md` |
| Animate | Add or fix motion, transitions, hover and loading feedback | `references/motion.md` |
| Consistency | UI drifts between screens; before adding to an existing UI with no tokens file | `references/consistency.md` |

Every mode runs sections 2 to 7 below. Critique and Audit report findings and change no code unless asked.

## 2. Ground

Before any design choice, pin three things and state them in one line each:
- **Subject**: what this is, named concretely (not "a SaaS app").
- **Audience**: who uses it, where, and in what state of mind (rushed, exploring, focused).
- **The page's single job**: the one thing a visitor should do or understand.

If the brief leaves these open, choose them yourself and say what you chose. The subject's own world (its materials, objects, vocabulary) is where distinctive choices come from. Use the brief's real content throughout; never lorem ipsum.

Ask once, up front, for real photos, numbers, prices and names; never invent them. For a named real brand, take its colours, logo and type from its own site or brand guidelines, not from memory (from huashu-design).

Pick the **register**:
- **Brand** (landing, marketing, portfolio, campaign, about page): the design is the product. Needs a point of view, real imagery when the subject implies it, one memorable signature element.
- **Product** (app, dashboard, tool, settings, extension popup, mod pane): the design serves a task. Earned familiarity beats novelty; one well-tuned sans family is often right; density is allowed; motion conveys state only.

Pick the register from the surface, not the company: a tool's landing page is brand; a fashion label's docs are product. Docs, articles and help pages use the product rules with comprehension first: readable measure, clear heading structure, then make reading pleasant.

Read what already exists, and reuse it:
- `context/UI_RULES.md`, `context/UI_TOKENS.md` and `DESIGN.md` when present. They win over anything in this skill.
- At least one real stylesheet, theme or component file. Use the existing tokens and components when they work; branch out only when the UX clearly wins.
- If the project already committed to a brand colour, font or look, preserve it. The bans and reflex lists below apply to new choices, not to an identity that is already shipping.

Never create `PRODUCT.md`, `ui-registry.md` or `design-system/MASTER.md`. Project design memory lives only in `context/UI_TOKENS.md` and `context/UI_RULES.md` (section 7).

## 3. Plan before code

Do this in your head or in a short plan block, then build. Skip only for a one-property fix.

1. **Token plan**
   - Colour roles in OKLCH: background, surface, ink (text), muted ink, one accent, border, plus state colours (focus, error, warning, success). Pick a colour strategy first: Restrained (tinted neutrals plus one accent at 10% or less: the product default), Committed (one saturated colour carries 30 to 60% of the surface), Full palette (3 to 4 named roles), or Drenched (the surface is the colour).
   - Theme: write one sentence of physical scene (who, where, what light, what mood). If it does not force light or dark, add detail until it does. Dark is never the default "because tools look cool dark"; light is never the default "to be safe".
   - Type scale: families and roles, sizes, weights, line heights.
   - Spacing scale on a 4 px base, radius scale, shadow scale, motion durations and one easing curve.
2. **ASCII wireframe** of the main view at desktop and at phone width. Mark the primary action and the signature element.
3. **Self-critique**: check the plan against section 5. If any part reads like the default you would produce for any similar page, revise it and say what changed and why.
4. **Build**; on a brand page, build the hero first and look at it before building the rest, since it sets the look for everything after (from Hallmark). Derive every colour, size and spacing value from the token plan. Define tokens as CSS custom properties (or the project's existing system); no raw hex or one-off pixel values in components. Watch selector specificity so section and component rules do not cancel each other.

## 4. Core rules

### Colour
- Write colours in OKLCH. One accent; it marks primary actions, current selection and state, not decoration.
- Tint neutrals slightly toward the brand hue (chroma 0.005 to 0.015), not toward "warm" or "cool" by habit.
- Body text contrast at least 4.5:1; large text (24 px, or 18.7 px bold) and UI parts (icons, borders of inputs, focus rings) at least 3:1. Placeholder text needs 4.5:1 too.
- No dim grey text for "elegance". If contrast is close, move the text toward the ink end of the ramp. Grey text on a coloured background looks washed out: use a darker shade of that background's own hue.
- Design dark mode as its own palette (lighter, less saturated tones; surfaces step up in lightness), never an inversion. Check contrast in both themes separately.
- Colour is never the only signal: pair it with an icon, text or shape.

### Type
- Two families at most. Pair on a contrast axis (serif with sans, geometric with humanist) or use one family in several weights; never two near-identical sans faces.
- A real scale: brand pages use a ratio of 1.25 or more with fluid `clamp()` headings (max 6rem); product UI uses 1.125 to 1.2 with fixed rem sizes.
- Body text at least 16 px, line height 1.5 to 1.7; prose 45 to 75 characters per line (`max-width` in `ch`).
- Display letter-spacing no tighter than -0.04em. `text-wrap: balance` on h1 to h3, `text-wrap: pretty` on long prose.
- Tabular figures for numbers in tables, prices and timers. No all-caps body copy or all-caps labels.
- Do not accent one word of a headline (one word in italic, bold or another colour); it is a common generated-page tell.
- Long URLs, IDs and user text wrap with `overflow-wrap: anywhere`; never `word-break: break-all` on prose.

### Layout
- Spacing from a 4/8 scale (4, 8, 12, 16, 24, 32, 48, 64, 96). Tight inside groups (8 to 12), generous between sections (48 to 96), more space above a heading than below it. Equal spacing everywhere means no rhythm.
- Shadows come from one scale and have an offset and a soft blur; a zero-offset coloured glow is decoration.
- Build hierarchy from size, weight and space first, then contrast. Do not box things to group them: cards only when the item is truly distinct and actionable, never cards inside cards.
- Do not park content beside empty space: no narrow column stranded on one side of a wide screen with nothing opposite, no half-empty rows. Content width and the grid should fit what is there.
- Flex for one dimension, Grid for two. `gap` instead of margins between siblings. A named z-index scale (dropdown, sticky, backdrop, modal, toast, tooltip), never 999.
- Responsive to 390 px with no horizontal scroll; prefer `min-height: 100dvh` over `100vh`; never disable zoom.

### Motion
- Every animation must have a purpose: feedback, a state change, spatial continuity, or drawing the eye to one thing. A reveal must add meaning; content is visible by default and never waits on a class to appear.
- 150 to 300 ms for UI transitions (instant press feedback may be 100 to 150 ms; one brand-page entrance may run up to 500 ms); exits about 75% of the entrance. Ease-out (for example `cubic-bezier(0.25, 1, 0.5, 1)`); no bounce, no elastic, no linear for UI movement.
- Movement and reveals animate `transform` and `opacity` only. Never width, height, top, left or margins. State colour changes (background, border, text colour on hover or focus) may fade; they are not movement.
- Respect `prefers-reduced-motion`: every animation gets an instant or crossfade alternative.
- Never block input during an animation. Details: `references/motion.md`.

### States
Every interactive element ships with: default, hover, `:focus-visible` (2 to 3 px ring, 3:1 contrast, offset), active/pressed, disabled (reduced emphasis plus the semantic attribute), loading (skeleton for content, spinner only inside the control), empty, error, and success where it applies. Set the right cursor: `pointer` on clickable things, `grab`/`grabbing` on draggable ones, `not-allowed` on disabled, `text` on editable text. Never `outline: none` without a visible replacement.

Theme the browser surfaces you did not draw: text selection (`::selection`), caret (`caret-color`), scrollbars (`scrollbar-color`), link underline offset, and form controls (`accent-color`, `color-scheme`). Left at browser defaults they show the page was assembled, not built.

### UX writing
- Active voice; name things by what the user controls ("Notifications", not "Webhook config"). Sentence case, plain verbs, no filler.
- Buttons say what happens ("Save changes", not "Submit"), and the same action keeps the same word through the flow ("Publish" → "Published").
- Errors are specific: what went wrong and how to fix it, next to the field, in the interface's voice, without apology ("Email needs an @", not "Invalid input").
- Empty states say why it is empty and offer the next action. Each element does one job: a label labels, an example demonstrates.

## 5. Bans: the AI-slop test

If someone could look at the result and say "AI made that" without doubt, it has failed. The lists below are the usual reasons: when you reach for one of these by reflex, stop and consider a different structure. They are tells to check against, not prohibitions; if one is genuinely the best choice for this page, keep it and say why.

The brief's own words win: if it pins a look that appears below, build it. The lists are for choices the brief leaves free.

**Strongest tell**
- **A kicker or eyebrow above a heading** (small tracked all-caps label such as "ABOUT", "PROCESS"). Usually delete it and let the heading speak.

**Page scaffolds** (from impeccable's craft floor)
- Same-size cards of icon + heading + text as the page structure. Nested cards are always wrong.
- The hero-metric template: big number, small label, supporting stats, accent. Fine only when it shows real data the user needs.
- Section numbers (01 / 02 / 03) unless the order itself carries information the reader needs.
- A modal for a task that needs neither interruption nor protected focus.

**Surface habits** (from impeccable's craft floor)
- Gradient text (`background-clip: text`). Emphasis comes from weight or size.
- Glass and blur as decoration rather than a specific effect.
- A coloured `border-left` or `border-right` above 1px on cards, list items, callouts or alerts.
- Hard offset shadows (`box-shadow: 4px 4px 0`) outside a deliberately neobrutalist design.
- Sparklines, progress rings and soft-shadowed rounded rectangles standing in for real content.
- Monospace as a costume for "technical" instead of for code, data or measurement.
- A system display face (Impact, Arial Black, the platform sans) as the display voice of a brand page.
- Emoji or Unicode glyphs standing in for icons. Use one real icon set, one stroke and weight.
- Geometric masks (circle, polygon cut-outs) faking an organic photo edge.
- Light or dark chosen by category instead of by the use scene.
- Text that overflows its container at any breakpoint.

**The five generated-page looks** (from frontend-design). Do not spend a free choice on any of them:
1. Warm cream background (near #F4F1EA) with a high-contrast serif display and a terracotta or clay accent (often near #D97757, Claude's own accent, so on a user's page it reads as a tell).
2. Near-black background with a single bright acid-green or vermilion accent.
3. Broadsheet layout: hairline rules, zero radius, dense newspaper-like columns.
4. The SaaS-card kit: content chopped into identical rounded cards, one radius on everything, the same soft grey shadow under each, gradient washes as decoration.
5. Template chrome: tracked all-caps eyebrows, meta strings joined with middle dots ("A · B · C"), "WORD — fragment" labels, tinted near-black (#0B0B0B, #111) standing in for black, monospace for small data labels, "→" appended to link and button text.

Reflex check at two levels: if the theme and palette can be guessed from the category alone ("fintech → navy and gold"), rework them; if the aesthetic can be guessed from the category plus "not the obvious one" ("dev tool, not SaaS-cream → editorial serif"), rework again. Spend boldness in one place (the signature element) and keep the rest quiet. Before shipping, remove one accessory.

Also refuse: the warm cream/sand body background by reflex (OKLCH L 0.84 to 0.97, C below 0.06, hue 40 to 100), fade-and-slide-up on every section, and a hover transition on every card.

**Brand-page structure** (from taste-skill)
- Show the real thing: real photographs of the product, people or place, and software's own UI as live HTML doing its actual job (a code-review tool shows a diff with its Accept action), never a generic dashboard mock or drawn stand-in. A real product's icon, never a redrawn look-alike.
- No caption under an image explaining or labelling it; photo credits go in one footer line.
- Equal left and right content edges at every width: every block sits on the container or grid lines.
- One object never carries the page: the hero subject leads at most three sections; other sections get a different kind of visual (use, detail, context, a type moment).
- Shader effects, 3D scenes and animated grounds only where the subject is technical (software, games, hardware). A cafe, shop or studio gets photographs, flat colour and type.

**Copy tells** (from taste-skill; a cluster is the signal, not one hit). Each stands in for a fact the brief should supply:
- Hype words: elevate, unlock, unleash, empower, seamless, effortless, cutting-edge, robust, powerful, world-class, game-changing, transformative. Literal trade use stays (a climbing harness).
- Stock lines: "Unlock the power of", "Say goodbye to", "Whether you're A or B", "Trusted by teams worldwide", "Ready to transform your X?", "X made simple", "It's not just X, it's Y".
- Invented specifics: unsourced proof figures ("3x faster", "10,000+ teams"), a strip of three stats over one-word labels, polished testimonials, the default cast (Priya, Marcus, Acme, Lumen, Nimbus). Use only the brief's facts and names; without them, a plainer line.
- Shapes: two-fragment headings ("Twelve rooms. Three ways to stay."), contrast frames ("isn't a slogan here", "rather than", "without the"), negation runs ("No forms, no back-and-forth."), a dry quip closing every paragraph, virtue words about ourselves (honest, thoughtful, intentional, genuinely), process talk ("Below, you'll find").
- Over-correction counts too: banning dashes breeds comma splices; banning hype breeds calm words (quietly, steady). Replace the adjective with a fact.

Credit: bans adapted from impeccable by Paul Bakaus (Apache-2.0) and frontend-design by Anthropic (Apache-2.0); brand-page structure and copy tells paraphrased from taste-skill by Leonxlnx (MIT). See `SOURCES.md`.

## 6. Verify

Never report UI work as done before the check comes back.

1. Send the page to the `ui-checker` agent with the URL (dev server or `file://`), what changed, and what right looks like. It checks 1280x800 and 390x844, light and dark when the site has both. Do not take screenshots in the main chat.
2. Pre-delivery checklist (adapted from ui-ux-pro-max). Fix every miss before reporting:
   - [ ] Text contrast 4.5:1 and UI contrast 3:1, in light and in dark.
   - [ ] Keyboard: every control reachable, focus order matches visual order, focus ring visible, Escape closes overlays.
   - [ ] Touch targets at least 44x44 px with 8 px between them (extend the hit area with padding if the icon is smaller).
   - [ ] No layout shift: images have width/height or `aspect-ratio`, async content has reserved space, press states do not move neighbours.
   - [ ] No horizontal scroll at 390 px; no text overflow; no content hidden behind sticky bars.
   - [ ] All states present (section 4), including empty, loading and error with real copy.
   - [ ] `prefers-reduced-motion` honoured.
   - [ ] Console clean: no errors or warnings from your change.
   - [ ] Section 5 bans: none present.

   If `ui-checker` returns FIX or any box stays unticked, fix it and return to step 1. Done when the checker says PASS and every box is ticked.
3. If the project README shows a screenshot of what changed, refresh that screenshot in the same task.

## 7. Persist

When the user confirms the result, write what was decided so the next session matches it:
- `context/UI_TOKENS.md`: colour roles (OKLCH plus hex), type scale, spacing, radius, shadow and motion tokens actually used.
- `context/UI_RULES.md`: register, the theme scene sentence, the signature element, component patterns and states, and any project-specific bans or exceptions.
Update existing entries rather than appending duplicates. If `context/` does not exist, create only these two files.

## 8. Pointers

- UI kits, animated components and animation libraries: `~/.claude/reference/libraries.md` (Fancy / animated components, Animation).
- Ready-made scroll, hover and ambient effects: cinematic-site-components (listed in `libraries.md`); use one effect as the signature, not five.
- Charts and data visualisation: the `dataviz` skill.
- Reference sites (free): oklch.com (OKLCH picker with gamut check), Radix Colors (12-step accessible scales with dark pairs), Realtime Colors (preview a palette and font pair on a live mock), Typewolf (fonts real sites use, Google Fonts pairings), Fontshare (free display fonts). Visual galleries are in `~/.claude/reference/tools.md`.
- Matching a reference site: `npx designlang <url>` extracts its tokens (colours, type, spacing, motion) as a starting point; `npx designlang slop <url>` scores how generic a page looks. Untested here; needs Node 20+ and a one-time Chromium download.
- Longer AI-tell catalogue (67 tells with fixes and severities) to consult during a critique: https://github.com/funboy322/avoid-ai-design `references/ai-tells-catalog.md`.
- Optional extra audit: Vercel's Web Interface Guidelines, https://github.com/vercel-labs/web-interface-guidelines (fetch and apply when the user asks for a second rule set).
- Maintaining this skill (where each rule came from, how to pull upstream updates): `SOURCES.md`. Not needed for design work.
