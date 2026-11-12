# Motion

Load for Animate mode, or when a build adds transitions. SKILL.md section 4 (Motion) is the rule; this file is how.

## Decide first

Motion is a budget. Spend it where it explains something:
- **Feedback**: a press, a toggle, a save, a copy.
- **State change**: open and close, expand and collapse, show and hide, loading to loaded.
- **Spatial continuity**: where a panel came from, where an item went, which way navigation moved.
- **Attention**: one signature moment that draws the eye to the page's single job.

Cut anything that is only decoration. One orchestrated moment lands harder than many scattered effects, and extra animation is itself an AI tell.

Register:
- **Brand**: one rehearsed entrance (hero, headline, key image) can be part of the voice. Fade-and-rise on every scrolled section is the saturated default: do not.
- **Product**: 150 to 250 ms, state changes only, no page-load choreography; users are mid-task.

Before building, write a short motion plan: the one signature moment (if any), which interactions get feedback, which state changes get transitions, and the durations and easing token.

## Timing

| Duration | Use |
|---|---|
| 100 to 150 ms | Instant feedback: press, toggle, colour change |
| 150 to 250 ms | Small state changes: hover, tooltip, menu open |
| 250 to 300 ms | Larger changes: drawer, dialog, accordion |
| Up to 500 ms | Brand entrances only, once per page |

- Exits run at about 75% of the entrance duration.
- Feedback over 500 ms feels laggy. Under about 80 ms feels instant.
- Stagger list items 30 to 50 ms apart and cap the total (10 items at 50 ms = 500 ms; past that, shorten the step or stagger only the first few). Use a custom property: `animation-delay: calc(var(--i, 0) * 40ms)`.
- One shared set of duration and easing tokens for the whole UI so everything moves with the same rhythm.

## Easing

```css
--ease-out: cubic-bezier(0.25, 1, 0.5, 1);     /* default: entrances and most transitions */
--ease-out-strong: cubic-bezier(0.16, 1, 0.3, 1); /* decisive, for larger moves */
--ease-in: cubic-bezier(0.5, 0, 0.75, 0);      /* exits only */
```

No bounce, no elastic overshoot, no `linear` for UI movement (linear is fine for spinners and progress).

## Properties

Animate `transform` (translate, scale, rotate) and `opacity` only. They run on the compositor and do not cause layout.
- Moving or resizing: translate and scale, not top, left, width or height.
- Expanding to an unknown height (accordions): do not animate `height`. Use a FLIP technique (measure the start and end, then animate a transform) or let the panel open instantly and fade its content in.
- Press feedback: `scale(0.97)` on active, back to 1 on release.
- Fades should go fully to 0 or stay visible; do not leave elements lingering at low opacity.
- `will-change` only on elements about to animate (on hover or an `.is-animating` class), never page-wide.

## Patterns

- **Hover**: colour or shadow shift, or `translateY(-1px)`, 150 ms. Never the only way to reveal something.
- **Menus and popovers**: fade plus a small scale (0.96 → 1) from the trigger's side.
- **Dialogs and drawers**: backdrop fades; panel scales in from its trigger or slides from its edge. Move focus inside; return it on close.
- **Tabs**: slide the indicator with transform; crossfade the content.
- **Lists**: new items fade and slide in a few pixels; removed items fade out, then the gap closes.
- **Loading**: skeleton with a gentle shimmer for content; a progress bar when the duration is known.
- **Success and error**: a colour transition plus an icon; a short shake only for a rejected input, and only when reduced motion is off.
- **Scroll-triggered reveals**: use `IntersectionObserver` and unobserve after the first run. The content must be visible without the animation: render it visible, then enhance. A reveal gated on a class can leave a section blank in background tabs and headless renderers.
- **Navigation direction**: forward moves left or up, back moves right or down; keep it consistent.

## Interaction rules (adapted from ui-ux-pro-max section 7)

- Never block input during an animation; a new tap or key press interrupts the current one immediately.
- Rapid state changes cancel or replace the running animation and set the final state explicitly; correctness never depends on an `animationend` or `transitionend` event.
- Match loading feedback to the expected wait: no indicator that flashes for near-instant work, no unexplained long wait.
- One or two animated elements per view at a time.
- Motion must not shift layout or cause layout shift (CLS).
- Drag, swipe and pinch track the pointer in real time.
- Parallax only when subtle, and never with reduced motion on.

## Reduced motion

Required on every project.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Where motion carries meaning (a panel arriving from the side), replace it with a short crossfade rather than nothing. Autoplaying or looping motion gets a pause control.

## Libraries

CSS transitions and `@keyframes` cover most UI. For sequences, layout animation or gestures, use the libraries in `~/.claude/reference/libraries.md` (Animation section; Motion is preferred over `framer-motion` for new work).

## Check

- Smooth at 60 fps on the target viewport; no jank in the `ui-checker` run.
- Feels responsive: nothing makes the user wait.
- Reduced motion on: everything still works and nothing jumps.
- Each animation can be explained in one sentence of purpose.
