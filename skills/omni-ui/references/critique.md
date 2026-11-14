# Critique and Audit

Load for Critique or Audit mode. Report findings; change code only if the user asks. Read the source files and have `ui-checker-agent` look at the live page before judging; a critique from code alone misses what the screen shows.

## Contents
- Name a quality bar first
- Two passes (design review, technical audit)
- Heuristic scores (critique) and audit scores (audit)
- Cognitive load checklist
- Personas
- Severity
- Output format

## Name a quality bar first

Before looking closely, name the bar the work is measured against: a specific product, site or page the user respects, or one they name (ask once if it is not obvious; otherwise pick two plausible ones and say so). Then compare the work against the bar as if you did not know which one you made: same viewport, same task, side by side. List where the bar is better and why. "Good" means "at least as good as the bar at the page's single job", not "has no obvious bugs".

Idea from gauntlet-loop (robonuggets/gauntlet-loop, CC BY 4.0), credited in `SOURCES.md`. Only the named-bar, blind-compare step is used here; the builder/critic loop is not.

## Two passes

Do the design pass before reading any tool output (checker report, linter) so the tools do not anchor your judgment. Then fold the tool findings in, noting where they agree, what they caught that you missed, and any false positives.

**Pass A: design review**
- AI-slop verdict against SKILL.md section 5. Start the report with it.
- Hierarchy: is the page's single job obvious within two seconds?
- Cognitive load: see the checklist below.
- Register fit: does a brand page have a point of view; does a product screen feel familiar and trustworthy?
- Copy, states and edge cases (empty, one item, 500 items, very long text).

**Pass B: technical audit**
- Accessibility via `a11y-checklist.md`.
- Responsive: 1280x800 and 390x844, no horizontal scroll, touch targets.
- Theming: hard-coded colours, broken dark mode, tokens bypassed.
- Performance: layout shift, unoptimised images, animating layout properties.
- Console errors and warnings.

## Heuristic scores (critique)

Score Nielsen's ten heuristics 0 to 4. Be honest: 4 means genuinely excellent; most real interfaces land between 20 and 32 out of 40.

| # | Heuristic | Look for |
|---|---|---|
| 1 | Visibility of system status | Loading, save confirmation, progress, current location |
| 2 | Match with the real world | User's words, no jargon, natural order |
| 3 | User control and freedom | Undo, cancel, back, clear filters, escape from flows |
| 4 | Consistency and standards | Same word and same look for the same action everywhere |
| 5 | Error prevention | Constraints, good defaults, confirm only the irreversible |
| 6 | Recognition over recall | Visible options, labels on icons, recent items |
| 7 | Flexibility and efficiency | Keyboard shortcuts, bulk actions, power paths that stay out of the way |
| 8 | Aesthetic and minimalist design | Every element earns its place; one clear focal point |
| 9 | Error recovery | Plain, specific errors near the problem; input kept |
| 10 | Help and documentation | Help in context, at the moment of need |

Bands: 36 to 40 excellent; 28 to 35 good; 20 to 27 acceptable, needs work; 12 to 19 poor; 0 to 11 critical.

## Audit scores (audit)

Score five dimensions 0 to 4: Accessibility, Performance, Responsive, Theming, Anti-patterns (0 = five or more slop tells, 4 = none). Bands out of 20: 18 to 20 excellent, 14 to 17 good, 10 to 13 acceptable, 6 to 9 poor, 0 to 5 critical.

## Cognitive load checklist

Count the failures: 0 to 1 is fine, 2 to 3 needs attention, 4 or more is critical.
- [ ] One clear focus; nothing competes with the primary task.
- [ ] Information in groups of about four.
- [ ] Related items grouped by proximity or a shared surface.
- [ ] Obvious order of importance.
- [ ] One decision at a time.
- [ ] Four or fewer visible options at any decision point (one primary, one or two secondary, the rest in a menu).
- [ ] Nothing has to be remembered from a previous screen.
- [ ] Complexity revealed only when needed.

## Personas (pick two or three)

Walk the primary task as each and report what broke, naming exact elements.
- **Power user**: wants keyboard shortcuts, bulk actions, skippable onboarding, Escape on every modal.
- **First-timer**: needs labelled icons, plain words, an obvious first step, confirmation that things worked.
- **Keyboard and screen-reader user**: tab order, visible focus, labels, announced state changes, no colour-only meaning.
- **Stress tester**: empty and huge data, long strings, emoji, refresh mid-flow, double submit.
- **One-handed phone user**: thumb reach, 44 px targets, interrupted sessions keep state, slow network.

Landing pages: first-timer, stress tester, phone user. Dashboards and tools: power user, keyboard user. Forms and checkout: first-timer, keyboard user, phone user.

## Severity

| Level | Meaning | Action |
|---|---|---|
| P0 | Blocks the task | Fix now |
| P1 | Serious difficulty, or fails WCAG AA | Fix before release |
| P2 | Annoying, workaround exists | Next pass |
| P3 | Polish | If time allows |

Unsure between two levels? Ask whether a user would contact support about it; if yes, it is at least P1. Too many P3s is noise: keep the list to what matters.

## Output format

Findings use one terse line each, grouped by severity, highest first:

```
<P0-P3>  <file>:<line>  <what is wrong, with the measured value if any>  →  <the concrete fix>
```

Use real values you measured (contrast ratio, pixel size), never estimates. When only a URL is available, use the selector or page region instead of `file:line`. Every finding names a concrete fix; drop "consider exploring".

Full critique report, in this order:
1. **AI-slop verdict** (pass or fail, with the specific tells).
2. **Quality bar** and the blind-compare gaps.
3. **Scores** (heuristics table for a critique, five dimensions for an audit) with the band.
4. **What works**: two or three things, and why.
5. **Findings** in the line format above, P0 first.
6. **Persona red flags** in one or two lines each.
7. **Next steps**: the three fixes with the most impact, and whether to run Polish or Consistency mode next.

Keep it direct: name the element, say why it hurts the user, give the fix. Do not soften, and do not list false positives you have not checked.
