---
name: probe-my-brain
description: "Questions the user about what is unclear before building. Full mode turns a rough idea, feature or project into an approved build plan: homework in the codebase, term check, a better-not-bigger ambition pass, approaches, one-at-a-time grilling and a written plan. Quick mode, mid-build, asks only about the 1 to 3 uncertain decisions in a suggested fix, feature or change, then carries on. Use when the user types /probe-my-brain, says \"help me plan this out\", \"I am unsure about this\", \"I'm not sure what to do\", \"probe my brain\", \"pick my brain\", wants to plan, brainstorm or design a feature or project before building, says \"think bigger\" or \"be ambitious\" about a build, or starts a new project in plan mode."
---

# Probe My Brain

A thinking partner that questions the user before building. It has two modes:

- **Full mode** (new project, big feature, "help me plan this out"): turns an idea into a plan the user approves, and on the way makes the idea sharper and more ambitious in quality, not scope. Nothing gets built until the user explicitly approves the plan.
- **Quick mode** (mid-build, a suggested fix, feature or change, "I am unsure about this"): settles only the uncertain decisions, then gets back to work. See [Quick mode](#quick-mode).

**Pick the mode.** Use full mode for a new project, a change touching several parts of the system, or when the user asks to plan. Use quick mode when work is already underway and the request is one fix, feature or change. When unsure, start in quick mode and switch to full mode if the questions turn up more than 3 open decisions; say you are switching.

## Rules for every run

1. **No building before approval.** Reading, searching, throwaway experiments and writing the plan itself (including the plan-mode plan file) are fine. Code, installs and file edits wait for an explicit "yes", because a plan changed after building costs far more than one changed before. "Sounds good" to a single answer is not approval of the plan.
2. **Homework before questions.** If the code, docs, `AGENTS.md`, `context/` or the conversation already answers something, use the answer and don't ask. Every question costs the user attention.
3. **One question at a time, with your recommendation.** Give the user something to react to: "My take: X, because Y. Agree?" Several questions at once get shallow answers.
4. **Adaptive pressure.** Be a friendly thinking partner by default. Push hard when an answer is vague, contradicts an earlier one, or touches something risky (data loss, security, money, irreversible choices, big scope). Name the gap plainly and ask again. Don't let weak answers slide.
5. **Better, not bigger.** Every ambitious suggestion must raise the outcome, the standard or the perspective. Drop anything that only adds scope.
6. **Never invent data or access.** If a tool, dataset or account is missing, name it and what it would unlock. Ask before any step that costs money, can't be undone or replaces what the user asked for.

## Quick mode

For a fix, feature or change suggested while building. Rules 2, 3, 4 and 6 apply; Rule 1 becomes "no building until the open questions are settled".

1. **Homework.** Read only the code and context the change touches. Answer what you can from it.
2. **List the unknowns.** Name the 1 to 3 decisions that would change what gets built and that the code can't answer. If there are none, say so in one line, state your plan in 1 to 3 bullets and start.
3. **Ask one at a time**, highest impact first, in the same format as Step 5 below ("My take: X, because Y. Agree?").
4. **Confirm and go.** Sum up the agreed approach in 1 to 3 bullets and carry on building. No written plan, ambition pass or approaches step, unless the user asks for one.

## Full mode workflow

Copy this checklist and tick it off. Skip a step only when its "done when" line is already true.

```text
Probe My Brain progress:
- [ ] 1 Homework done
- [ ] 2 Terms aligned
- [ ] 3 Ambition pass
- [ ] 4 Approach chosen
- [ ] 5 Decisions grilled
- [ ] 6 Blueprint ready
- [ ] 7 Plan written, checked and approved
```

**Step 1. Homework.** Read the request, then the relevant code, docs, `AGENTS.md`, `context/` files and recent commits. Build a picture of what exists and what is being asked. If the request is small and already clear, say so and offer to say "Blueprint ready" and go straight to a short plan (Step 7). Done when you can state what exists, what is wanted and the biggest open question.

**Step 2. Terms.** Pick the 3 to 5 words in the request that could mean two things. Give your reading of each and ask the user to correct any that are off:

```text
Before we dig in, here is how I'm reading a few words:
- "[term]": [your definition]
- "[term]": [your definition]
Anything off?
```

Use the corrected meanings from then on. Done when the user confirms or corrects them.

**Step 3. Ambition pass (short).** In one line, name the goal behind the goal: what the user actually wants this to achieve. Then make at most one suggestion from whichever lens fits best:
- **Altitude**: aim at the real outcome instead of the literal task.
- **Depth**: work from raw material and the methods a top expert would use.
- **Range**: borrow a method from another field.

Pair the suggestion with an outside check, such as a test, a metric or real data, that would prove it worked. The user can take it, change it or drop it. If they say "think bigger" or "be ambitious", or the idea clearly deserves more, open [references/ambition.md](references/ambition.md) and run the full pass. Done when the user has reacted to the suggestion.

**Step 4. Approaches.** Offer 2 or 3 concrete ways to build it, each with its main trade-off, and recommend one with the reason. Skip this when only one sensible approach exists, and say why. Done when the user picks one.

**Step 5. Grill the decisions.** Walk the decision tree, highest impact first: the decision that affects the most later work comes first. Ask only about decisions that change what gets built. Leave details that can be settled while coding. For each one:

```text
[The decision]
My take: [what you'd do and why]
Agree, or do you see it differently?
```

If the codebase can answer a question, look it up instead of asking. Skip a question when an earlier answer made it irrelevant. Apply Rule 4 to every answer. Done when no unresolved decision would change the implementation.

**Step 6. Stop.** Don't keep asking for the sake of thoroughness. When Step 5 is done, say "Blueprint ready."

**Step 7. Write, check and hand over the plan.**

```markdown
## Plan: [name]

### Goal
[One paragraph: what we're building and the goal behind it]

### Terms
- [term]: [agreed meaning]

### Decisions
- [decision]: [choice] because [reason]

### Assumptions
- [anything assumed but not confirmed]

### Files
- [path]: create / modify / delete, and its one job

### Steps
1. [ordered, each with a checkable result]

### Outside check
[The test, metric or real-world check that proves it works, and the pass condition]
```

If the work covers several independent parts, split it into separate plans, each producing something that works on its own. Before showing the plan, check it:
- Does every decision and term from the conversation appear?
- Are names and paths consistent across steps?
- Is the length in proportion to the work?

Fix what fails. If a gap comes from an unsettled decision, return to Step 5. In plan mode, write the plan to the plan file and request approval the way plan mode does. Otherwise, show it in chat and wait for an explicit yes. For a new project, offer to run `/setup-agent-context` afterwards so the plan lands in `context/BUILD_PLAN.md`. Done when the user approves. If they ask for changes, return to the step their change touches.

## Resources

- [references/ambition.md](references/ambition.md): the full Altitude ladder, the Depth questions, the Range crew and the outside-check format. Open in Step 3 when the user asks for more ambition or the idea deserves it.

## Credits

Built from ideas in these MIT-licensed skills, rewritten in my own words:
- [grill-me](https://github.com/mattpocock/skills) by Matt Pocock: relentless one-at-a-time interviewing with recommended answers.
- [architect](https://github.com/JavaScript-Mastery-Pro/skills) by JavaScript Mastery: homework first, term alignment, the stop rule and "Blueprint ready".
- [be-ambitious](https://github.com/robonuggets/be-ambitious) by robonuggets, after Felix Rieseberg's essay on ambition: Altitude, Depth, Range and the outside judge.
- [brainstorming](https://github.com/obra/superpowers) and [writing-plans](https://github.com/obra/superpowers) by Jesse Vincent (obra/superpowers): approaches with trade-offs, the approval gate, the file map, splitting plans and the self-check.
