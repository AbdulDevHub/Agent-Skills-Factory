# Consistency

Load for Consistency mode: UI drifts between screens, or you are about to add to an existing UI that has no `context/UI_TOKENS.md`. Idea adapted from imprint's audit mode (see `SOURCES.md`); its `ui-registry.md` file is not used. The single record is `context/UI_TOKENS.md` plus `context/UI_RULES.md`.

## When to run

- Before the first UI change on a project with no `UI_TOKENS.md`: run it to set a baseline.
- When something "looks off" but the cause is unclear: spacing, radius or colour drift is the usual reason.
- After a large build, before reporting done, on the files you touched.

## 1. Extract what is actually used

Read the stylesheets, theme files and components (for large projects, start with the shared components and the two or three busiest screens). Collect every distinct value for the properties that make components look like they belong together:

| Property | Collect |
|---|---|
| Colour | Every background, text, border and accent value: hex, rgb, OKLCH, named, Tailwind colour classes, CSS variables |
| Spacing | Padding, margin and gap values |
| Radius | Every `border-radius` / `rounded-*` value, per component type |
| Type | Font families, sizes, weights, line heights, letter spacing |
| Shadow | Every `box-shadow` / `shadow-*` value |
| States | Hover, focus, active and disabled treatments per component type |
| Motion | Durations and easing curves |

Skip widths and heights, flex/grid structure, positioning and z-index, and breakpoint variants: they depend on context and are not consistency rules.

For each value, note the files that use it and how often. A plain search is enough: grep for `#[0-9a-fA-F]{3,8}`, `rgb(`, `oklch(`, `px`, `rounded-`, `shadow`, `font-size`, `transition`.

## 2. Compare with the tokens

If `context/UI_TOKENS.md` exists, compare every collected value with it. If it does not, the baseline is the value most components already use, checked against SKILL.md section 4 (a majority value that fails contrast is still wrong).

List the drift (format only; fill in the real values and counts):

```
<property>  <value A> (<n> uses)  vs  <value B> (<n> uses in <files>)  → standardise on <value>
Text muted <value> (<n> uses)  vs  <value> (<n> uses, fails 4.5:1)     → use the muted-ink token
Hard-coded <file>:<line>  <raw value>                                   → replace with <token>
```

Group findings by property. Flag every hard-coded value that bypasses the token system, with `file:line`. Flag near-duplicates (two greys a few steps apart, 14 px and 15 px gaps) as candidates to merge.

## 3. Decide with the user

Present the drift report and a proposed baseline: one value per role (card radius, card border, primary button, secondary button, text primary, text secondary, text muted, input background, input border, section spacing, focus ring, default transition). Ask once:
- Do these baselines look right?
- Any drift that is intentional (a marketing page with its own radius, for example)?

Do not change code or write tokens before the answer, unless the user already asked you to fix the drift.

## 4. Fix the code or update the tokens

For each drift item, one of two outcomes:
- **Fix the code**: replace the stray value with the token. Prefer the shared component over patching each use.
- **Update the tokens**: if the stray value is the better choice and the user agrees, change the token and migrate the old uses.

Then write the confirmed baseline into `context/UI_TOKENS.md` (values, grouped by role) and any pattern rules into `context/UI_RULES.md` ("cards use the surface token, radius-md, no shadow; hover raises the border colour"). Update existing entries instead of appending duplicates.

## 5. Report

End with: the baseline written, the drift fixed (count and files), anything left on purpose, and a `ui-checker` run on the screens that changed. Visual fixes are not done until the check comes back (SKILL.md section 6).

## Keeping it consistent

After any UI build, compare the new component with `UI_TOKENS.md` before reporting done. If you introduced a value that is not in the tokens, either switch to an existing token or add the new one to the file with a one-line reason. A tokens file that is sometimes updated is unreliable.
