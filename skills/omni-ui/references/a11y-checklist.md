# Accessibility checklist

Load for Critique or Audit mode, and run it on every Build before reporting done. Target: WCAG 2.2 AA. Adapted from ui-ux-pro-max sections 1 and 2 (see `SOURCES.md`). Each item is a check on the built page, not an intention.

## Contrast and colour

- [ ] Body text, placeholder text and error/success text at least 4.5:1 against their background.
- [ ] Large text (24 px, or 18.7 px bold) at least 3:1.
- [ ] UI parts at least 3:1: input borders, icons that carry meaning, focus rings, chart lines.
- [ ] Both themes checked separately; dark mode values are not assumed from light.
- [ ] Colour is never the only signal: errors have an icon or text, links in prose are underlined or otherwise marked, chart series differ by shape or label too.

## Structure and semantics

- [ ] One `h1`; headings in order with no skipped levels; headings describe their section.
- [ ] Landmarks: `header`, `nav`, `main`, `footer`; one `main`.
- [ ] Real elements: `button` for actions, `a href` for navigation, `label` for inputs, `table` for tabular data. No clickable `div`s.
- [ ] Page `lang` set; page `title` names the page.
- [ ] Lists are `ul`/`ol`; related form fields in `fieldset` with a `legend`.

## Keyboard

- [ ] Every interactive element is reachable with Tab and works with Enter or Space (and arrow keys inside composite widgets: tabs, menus, radio groups, using roving `tabindex`).
- [ ] Tab order matches the visual order. No positive `tabindex`.
- [ ] A skip link ("Skip to main content") appears on first Tab.
- [ ] No keyboard traps; Escape closes menus, popovers and dialogs.
- [ ] Dialogs move focus inside on open, keep it inside while open, and return it to the trigger on close.
- [ ] After a route change, focus moves to the main content or its heading.
- [ ] Every drag action has a single-pointer and keyboard alternative (buttons to move up and down, a menu).

## Focus

- [ ] A visible `:focus-visible` style on every focusable element: 2 to 3 px, at least 3:1 against what surrounds it, offset from the element.
- [ ] Never `outline: none` without a replacement.
- [ ] Sticky headers, cookie banners and overlays never cover the focused control (use `scroll-padding-top` for sticky headers).

## Names, roles and states (ARIA basics)

- [ ] Prefer native HTML; add ARIA only when no element does the job. No ARIA beats wrong ARIA.
- [ ] Icon-only buttons have an accessible name (`aria-label` or visually hidden text).
- [ ] Decorative icons and images next to visible text are hidden (`aria-hidden="true"`, `alt=""`); meaningful images have alt text that says what matters in context.
- [ ] Toggles expose state: `aria-expanded` on disclosure triggers, `aria-pressed` on toggle buttons, `aria-current="page"` on the active nav link, `aria-selected` in tabs.
- [ ] Custom widgets follow the WAI-ARIA Authoring Practices pattern for that widget (tabs, menu button, combobox, dialog).
- [ ] Status changes are announced without moving focus: one `role="status"` or `aria-live="polite"` region, with a complete phrase ("3 items in cart", not "3"). Errors that block use `role="alert"`.
- [ ] Toasts never steal focus and stay long enough to read; important ones can be reopened.

## Forms

- [ ] Every input has a visible `label` tied with `for`/`id`; placeholders are never the label.
- [ ] Required fields marked in text, not by colour alone.
- [ ] Errors are specific, placed under the field, linked with `aria-describedby`, and kept until fixed.
- [ ] After a failed submit with several errors, focus a summary at the top that links to each field; with one error, focus that field.
- [ ] `autocomplete` attributes set on personal-data fields (name, email, address, one-time code); paste allowed; password managers work.
- [ ] Information already entered in the same flow is not asked for again.
- [ ] Custom Enter-to-submit shortcuts do not fire while an input method editor (IME) is composing text; keep an explicit submit button.

## Touch and pointer (adapted from ui-ux-pro-max section 2)

- [ ] Touch targets at least 44x44 px on touch layouts (WCAG 2.2 minimum is 24x24 CSS px); at least 8 px between neighbouring targets. Extend small icons' hit areas with padding or a pseudo-element.
- [ ] Nothing depends on hover alone; tap or click does the primary action.
- [ ] Visual feedback on press within about 100 ms; async buttons show loading and block double submit.
- [ ] No precise taps required on thin edges or tiny icons; drags start only after a small movement threshold.
- [ ] Swipe actions have a visible alternative (a button or menu item).
- [ ] Primary touch targets stay clear of the notch and the gesture bar (`env(safe-area-inset-*)`).
- [ ] `touch-action: manipulation` on tappable controls; system gestures (back swipe, pinch zoom) are not blocked.

## Zoom, reflow and motion

- [ ] Works at 200% zoom and at 320 px wide without horizontal scroll (except data tables and maps).
- [ ] Text resizes without clipping: no fixed heights on text containers; prefer wrapping over truncation, and give truncated text a way to see it in full.
- [ ] Viewport meta does not disable zoom.
- [ ] `prefers-reduced-motion` honoured; autoplaying or looping content (carousels, video, marquees) has pause and stops on focus.
- [ ] Nothing flashes more than three times a second.

## Consistency of help

- [ ] Help, contact and search sit in the same place on every page.
- [ ] Time limits can be turned off, extended, or are long enough not to matter.

## How to report

Each miss is a finding in `critique.md` format (`severity  file:line  problem  →  fix`). Failing WCAG AA is at least P1; a blocked keyboard path or an unlabelled primary control is P0.
