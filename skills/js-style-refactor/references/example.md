# Worked example

## Before (typical messy input)

```js
let count = 0;
let timer;
const btn = document.getElementById('btn');
function inc() { count++; render(); }
function render() {
    document.querySelector('#out').innerText = 'Count: ' + count;
    if (count > 10) { document.querySelector('#out').style.color = 'red'; } else { document.querySelector('#out').style.color = 'black'; }
}
function startAuto() {
    timer = setInterval(function() { inc() }, 1000);
}
function stopAuto() { clearInterval(timer); timer = null; }
btn.onclick = inc;
document.addEventListener('keydown', function(e) {
    if (e.key == 's') { startAuto(); }
    else if (e.key == 'x') { stopAuto(); }
    else if (e.key == 'r') { count = 0; render(); }
});
```

## After

```js
"use strict"

// ----------------------------- GLOBAL VARIABLES -----------------------------
const preferences = { autoIncrementMs: 1000, warningThreshold: 10 }
const state = {
  count: 0,
  autoTimer: null,
}

const elements = {
  button: document.querySelector("#btn"),
  output: document.querySelector("#out"),
}

// ----------------------------- COUNTER -----------------------------
const counter = {
  increment() {
    state.count++
    counter.render()
  },

  reset() {
    state.count = 0
    counter.render()
  },

  render() {
    elements.output.innerText = `Count: ${state.count}`
    elements.output.style.color = state.count > preferences.warningThreshold ? "red" : "black"
  },

  startAuto() {
    state.autoTimer = setInterval(counter.increment, preferences.autoIncrementMs)
  },

  stopAuto() {
    clearInterval(state.autoTimer)
    state.autoTimer = null
  },
}

// ----------------------------- EVENT HANDLERS -----------------------------
const eventHandlers = {
  handleKeyboardShortcuts: (e) => {
    const keyActions = {
      s: counter.startAuto, // Start auto-increment
      x: counter.stopAuto, // Stop auto-increment
      r: counter.reset, // Reset count
    }

    const action = keyActions[e.key]
    if (action) action()
  },
}

// ----------------------------- INITIALIZATION -----------------------------
function initializeEventListeners() {
  // ============= COUNTER EVENTS =============
  elements.button.addEventListener("click", counter.increment)

  // ============= WINDOW EVENTS =============
  document.addEventListener("keydown", eventHandlers.handleKeyboardShortcuts)
}

initializeEventListeners()
```

## What changed (the summary you'd give the user)

- Loose `let`s moved into `state`; DOM lookups cached in `elements`; magic numbers into `preferences`.
- Functions grouped into a `counter` namespace; the if/else key chain became a `keyActions` lookup.
- Duplicate `querySelector("#out")` calls and the if/else color branch collapsed into one ternary.
- Behavior is identical: `innerText` and the (unguarded) `startAuto` were kept as-is. A refactor like this would list under **Noticed**: "calling `startAuto` twice leaks a timer; `s` pressed twice starts two intervals."