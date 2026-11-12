# Build and Polish

Load for Build and Polish modes, after SKILL.md sections 2 and 3. Everything here refines the core rules; nothing here overrides them.

## The hero is a thesis (brand register)

Open with the most characteristic thing in the subject's world, in whatever form fits: a headline, a photograph, a live demo, an interactive moment. Choose it on purpose. Before building, describe the page in one sentence the way a competitor would describe theirs; if that sentence fits the typical landing page in the category, start over.

- One dominant idea per viewport; long scroll with deliberate pacing is fine.
- Image-led subjects (food, travel, hotels, fashion, photography, physical products) need real imagery. Zero images on such a brief is a bug, and a coloured block where a photo belongs is worse than an honest stock photo. Search for the subject's physical object ("hand-cut pasta on a scratched wooden table"), not the category ("Italian food"). Only reference image URLs you have confirmed load.
- Alt text is part of the voice: describe what is in the picture, specifically.
- Typography carries personality. Write three concrete voice words for the brand (physical-object words, not "modern" or "clean"), then pick fonts for those words. If the pick matches your first reflex, look again.

## Brand versus product, in practice

| Concern | Brand | Product |
|---|---|---|
| Type | Display + body pair, or one family with strong contrast; fluid `clamp()` headings | One sans family often enough; fixed rem scale; ratio 1.125 to 1.2 |
| Colour | Committed, Full palette or Drenched allowed | Restrained by default; one surface may earn more |
| Layout | Asymmetry and grid-breaking allowed for emphasis | Predictable grids; responsive is structural (collapse sidebar, stack table) |
| Motion | One orchestrated entrance can be the voice | 150 to 250 ms, state changes only, no page-load choreography |
| Navigation | Minimal, can be part of the art direction | Standard: top bar plus side nav, tabs, breadcrumbs, command palette |
| Density | Air | Tables, many labels and dense panels are fine when users need them |

Product extra rules:
- A second neutral layer for sidebars, toolbars and panels, slightly different from the content surface.
- Accent only on primary actions, selection and state. Inactive states are never fully saturated.
- No display fonts in labels, buttons or data. No custom scrollbars or reinvented form controls for flavour.
- Modals are a last resort: try inline editing or progressive disclosure first.

Extension popups and mod panes are product register with a small, fixed width: design for that width first, keep one primary action visible without scrolling, and follow the host's light/dark setting.

## Component patterns

**Buttons**
- One primary action per view; secondary actions visually quieter; destructive actions use the danger colour and sit apart from the primary.
- Label with the verb and object. Loading state disables the button and shows progress inside it, keeping its width.
- Icon-only buttons need an `aria-label` and a tooltip.

**Cards and lists**
- Use spacing and alignment to group before reaching for a card. When cards are right and the count varies: `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`.
- Vary size or span when items differ in importance; identical tiles repeated endlessly is a ban.
- Lists over 50 items: paginate or virtualise.

**Tables**
- Left-align text, right-align numbers, tabular figures. Sticky header on long tables. Sortable columns set `aria-sort`.
- On phones, let the table scroll inside its own container or turn rows into stacked label/value pairs; never let it push the page wide.

**Overlays (menus, popovers, dialogs)**
- An absolutely positioned dropdown inside an `overflow: hidden/auto` parent gets clipped. Use the native `popover` attribute or `<dialog>` (top layer), `position: fixed`, or a portal.
- Modal dialogs: `<dialog>` with `showModal()` (focus trap and Escape for free) or make the page behind `inert`. Return focus to the trigger on close. Scrim 40 to 60% black.

**Icons**
- One icon set, one stroke width, filled or outline per hierarchy level, sized from tokens. No emoji as structural icons.

**Chips, badges and tags**
- Pick the element by meaning: status badge, filter chip, or removable value. When a row of chips runs out of room, wrap it before shrinking labels; a "+3" overflow must open to show the hidden values.

**Empty, loading and error**
- Empty: why it is empty and the next action, ideally a button.
- Loading: skeletons shaped like the content for anything over about 300 ms; never an empty frame.
- Error: what happened, how to recover (retry, edit, help), and keep the user's input.

## Forms (adapted from ui-ux-pro-max section 8)

- A visible label for every input; placeholders are examples, never labels. Mark required fields.
- Group related fields (`fieldset`/`legend`); four or so fields per group before a visual break.
- Use semantic input types (`email`, `tel`, `number`) and `autocomplete` attributes so phones show the right keyboard and autofill works. Mobile input height at least 44 px.
- Validate on blur, not on every keystroke (password strength is the exception). Show the error below the field, linked with `aria-describedby`, announced with `role="alert"` or a polite live region.
- After a failed submit with several errors, focus a summary at the top that links to each field (inline errors stay); with one error, focus that field.
- Submit shows loading, then success or error. Long forms autosave drafts. Confirm before discarding unsaved changes.
- Persistent helper text under complex inputs. Password fields get a show/hide toggle.
- Read-only looks different from disabled. Disabled uses reduced emphasis plus the `disabled` attribute.
- Prefer undo over confirmation for reversible destructive actions (remove now, "Undo" toast, delete after it expires). Confirm only the truly irreversible.

## Navigation (adapted from ui-ux-pro-max section 9)

- Navigation stays in the same place on every page. The current location is highlighted (colour plus weight or an indicator, not colour alone).
- Five or so top-level items at most; group the rest. Icons in navigation carry text labels.
- Back is predictable and restores scroll position, filters and input. Key screens are reachable by URL.
- Breadcrumbs for hierarchies three or more levels deep. Overflow actions go in a "More" menu, not crammed in.
- Do not mix tabs, sidebar and bottom nav at the same level. Modals are not navigation.
- Wide screens (1024 px and up) suit a sidebar; small screens suit a top bar or bottom bar.
- After a route change, move focus to the main content. Destructive items (sign out, delete account) sit apart from normal items.
- When a destination is unavailable, say why instead of hiding it.

## Responsive behaviour

- Design at 390 px and at 1280 px from the start; check 768 px too. Content first on phones; secondary panels fold away.
- Container queries for components that live in both narrow and wide slots; viewport media queries for page layout.
- Readable measure on wide screens: cap prose width; increase side gutters as the screen grows.
- Fixed headers and bottom bars reserve padding so content is never hidden under them. Avoid nested scroll areas.
- Images: `srcset`/`sizes`, modern formats, `loading="lazy"` below the fold, explicit dimensions.
- Fonts: `font-display: swap`, preload only the one or two critical files.
- Touch: primary actions within thumb reach on phones; no hover-only interactions; `touch-action: manipulation` on tappable controls.

## Polish pass

Run on existing UI, in this order, fixing as you go:
1. **Squint test**: blur your view of the screenshot. The most important element, the second, and the groupings should still be obvious. If not, fix hierarchy with size, weight and space.
2. **Spacing**: replace off-scale values with tokens; tighten inside groups, open up between sections.
3. **Type**: one scale, consistent weights, line length, no orphans in headings.
4. **Colour**: token-only, contrast passes, one accent, dark mode checked.
5. **States**: walk every control through hover, focus, active, disabled, loading, error.
6. **Copy**: verbs on buttons, specific errors, useful empty states.
7. **Bans**: run SKILL.md section 5 over the result.
8. **Details**: optical alignment of icons, consistent radius and shadow scale, no stray borders.
