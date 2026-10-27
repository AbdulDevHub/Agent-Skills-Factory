---
name: js-style-refactor
description: Refactor or review existing JavaScript (browser or Node) into the user's personal coding style - flat single-file layout, one `state` object, cached `elements`, feature-namespaced object literals, uppercase section banners, no semicolons, double quotes, 2-space indent, ~100 columns. Use this skill whenever the user asks to refactor, clean up, restyle, review, "make this match my style", or normalize a .js/.mjs/.cjs file or snippet, even if they never say "style". Also use it when they paste JavaScript and ask for it to be "tidied", "reorganized", or "written the way I write code".
---

# JS Style Refactor

Rewrite or review JavaScript so it matches the user's established style, derived from their `script.js` (a vanilla-JS video player). The goal is a consistent look and structure, **without changing what the code does**.

## Workflow

1. **Read the whole input first.** Identify the features it contains, the shared mutable data, any DOM/element lookups (or env/config in Node), and the entry point.
2. **Restructure** into the layout below, then **reformat** to the formatting rules.
3. **Preserve behavior.** This is a style refactor. Do not change logic, public names the user's other files depend on, or timing/ordering of side effects.
4. **Report** using the output format at the bottom. Anything that looks like a bug gets flagged, not silently fixed (see "Fix while refactoring" for the narrow exceptions).

For a worked layout, read `references/example.md`. For a formatter config, copy `assets/.prettierrc` (matches the formatting rules exactly).

## Formatting rules

- `"use strict"` as the first line of classic scripts and CommonJS files. Skip it in ES modules (already strict).
- **No semicolons.** If a line starts with `(`, `[`, or a template literal, guard it with a leading `;` (e.g. `;[a, b] = [b, a]`).
- **Double quotes** for strings; template literals only for interpolation or multi-line strings.
- **2-space indent**, print width **100**.
- Trailing commas in multi-line objects/arrays, none in multi-line function arguments (Prettier `es5`).
- Arrow functions always parenthesize params: `(e) => ...`.
- `const` by default, `let` only when reassigned, never `var`.
- Prefer `async`/`await` over `.then` chains.
- Short guards stay on one line: `if (!state.isReady) return` and `if (action) action()`. Use braces once the body needs a second statement.
- Ternaries are fine for simple toggles (`el.paused ? el.play() : el.pause()`); split a nested ternary into `if` or a lookup object.

## File layout (top to bottom)

Use this order, skipping sections the code doesn't need:

1. `"use strict"`
2. `// ----------------------------- GLOBAL VARIABLES -----------------------------`
   - `const preferences = { ... }` for user-tweakable constants
   - `const state = { ... }` - the **single** mutable object for runtime data. Every field is declared up front with its initial value (`null`, `false`, `0`, `new Map()`), with a short trailing comment if the meaning isn't obvious. No loose `let` variables at module level.
   - `const CONSTANT_LISTS = [...]` in UPPER_SNAKE_CASE for fixed tables
   - `const elements = { ... }` - every DOM lookup (`document.querySelector`) cached **once**, camelCase keys. In Node, the equivalent is a `config` object built from `process.env`/CLI args, and external handles (db, clients) go in `state`.
3. `// ----------------------------- UTILITIES -----------------------------` - `const utils = { ... }` holding pure helpers (`clamp`, `formatTime`, `hashFile`).
4. One section per feature, each a **namespaced object literal** of plain methods: `storage`, `videoControls`, `fileManagement`, `cursorHandler`, and so on. Name the object after the feature, in camelCase. No classes, no inheritance, no module-level function soup.
5. `// ----------------------------- EVENT HANDLERS -----------------------------` - handlers that coordinate several features. Keyboard shortcuts go in a lookup object (`const keyActions = { " ": () => ..., ArrowLeft: ... }`) followed by `const action = keyActions[...]` / `if (action) action()`, never a long `if/else` or `switch` chain (a `switch` on `e.key` is fine for tiny, uniform cases).
6. `// ----------------------------- INITIALIZATION -----------------------------` - `initializeX()` functions for setup, plus a single `initializeEventListeners()` that wires **all** listeners, grouped with sub-banners: `// ============= FILE HANDLING EVENTS =============` (13 equals signs each side).
7. The very last line is the call: `initializeEventListeners()` (or `main()` in Node).

Section banners are uppercase, exactly `// ` + 29 dashes + space + NAME + space + 29 dashes. Blank line between methods in a namespace object.

## Conventions inside namespaces

- Call siblings by **full namespace**, not `this`: `videoControls.updateIndicators()`. Methods get passed around as callbacks (`onclick = videoControls.togglePlay`), where `this` would be lost.
- Pass handlers **by reference** (`onclick = videoControls.rewind`), or wrap them in an arrow when arguments are needed (`() => videoControls.adjustSpeed(-0.1)`). Never write `() => videoControls.rewind` (a function that returns the function without calling it).
- Methods read/write shared data through `state.x` and `elements.y` directly; they don't take those as parameters.
- Names: verbs for methods (`toggle`, `update`, `handleDrop`, `calculateSamplingRate`), `is`/`has` prefixes for booleans (`isVideoReady`), camelCase everywhere except UPPER_SNAKE constants.
- Dedupe with `toggle`-style methods that flip state and update the UI together.

## Comments and logging

- Comments are short, lowercase-leading or sentence fragments, placed on the line **above** a block (`// Toggle stretched full screen`) or trailing a one-liner entry in a lookup object. Explain intent or a non-obvious reason; don't narrate obvious code.
- Remove commented-out code. Keep comments that record *why* (e.g. "Store at half-second precision").
- Lifecycle events use `console.info` with a full sentence and trailing period (`console.info("Video state saved in local storage.")`). Don't add logging that wasn't there, and don't strip existing lifecycle logs.
- Errors: `try/catch` around fallible platform calls (file pickers, preloading); log with `console.warn("Error doing X:", error)` or `console.info` for expected cancellations. A bare `catch {` is fine when the error is unused.

## Fix while refactoring

Fix these automatically, since they are style problems rather than behavior changes:

- **Copy-pasted blocks** (the same 4+ lines in 2+ places): extract one method in the owning namespace and call it.
- **`this` inside namespace methods**: replace with the namespace name.
- Unused variables/imports and dead code: remove, and mention it.
- Loose module-level `let`s: move into `state`.
- Repeated `querySelector` calls: move into `elements`.

Do **not** silently change anything that alters behavior. That includes handlers that return a function instead of calling it (e.g. `() => videoControls.rewind`): flag it in **Noticed** and offer the fix, unless the user has said "fix bugs too". Everything else that smells like a bug (race conditions, wrong units, off-by-one, unhandled promise) goes under **Noticed** only.

## Node specifics

- CommonJS: `"use strict"` on top, `const x = require("x")` grouped before GLOBAL VARIABLES under an `// ----- IMPORTS -----` banner. ESM: `import` lines at top, no `"use strict"`.
- Replace `elements` with `config`; keep `state` for runtime handles and counters.
- Feature namespaces are the same pattern (`db`, `routes`, `jobs`). Entry point `async function main()` called on the last line, with `main().catch((error) => { console.error(error); process.exit(1) })`.

## Output format

1. The full refactored code in one fenced block (or the edited file, if working with files).
2. A short **Changes** list (what moved where, what was deduplicated). Keep it to a few bullets.
3. A **Noticed** list for suspected bugs or behavior risks you deliberately left alone. Omit if empty.

If the input is too large to reproduce, refactor section by section and say which sections remain.