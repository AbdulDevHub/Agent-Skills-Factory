---
name: retro
description: End-of-thread retrospective. Reviews the whole conversation and proposes what to save, create or change so future sessions go better - memories, CLAUDE.md/AGENTS.md lines, permissions, hooks, skills, agents - then applies only what the user approves. Run when the user types "/retro" or asks to "review this conversation for anything to save or optimize".
disable-model-invocation: true
---

# Retro

Review this conversation like a teammate doing a retrospective: what did we learn that the *next* session should already know or have? Propose, get approval, apply. Never write anything before approval.

## 1. Mine the conversation

Scan from the first message to now. Look for:

| Signal | Example | Usually becomes |
|---|---|---|
| A resource or location revealed | "my about-me is in Dev Mountain/src/pages/about-me.md" | reference line |
| A fact about the user, role, goals, constraints | Pro plan, graduating April 2027, uses `uv` | user fact |
| A correction or "no, do it this way" | "don't leave a3", "use report.tex not PDF" | feedback rule |
| A confirmed approach the user liked | "good, keep doing X" | feedback rule |
| Project state or convention not in the repo docs | due date, grading rule, deploy step | AGENTS.md / PROGRESS_TRACKER |
| A permission prompt the user approved for a safe command | `ssh ...`, `docker compose ps` | allowlist entry |
| A command that failed due to environment quirks | Windows shim, missing toolchain | environment note |
| A multi-step routine done by hand, likely to recur | ssh pull → make → run → collect timings | skill or slash command |
| Something that should happen automatically every time | "always run X after Y" | hook |
| A focused job worth isolating with its own tools/model | spec checker, test writer | subagent |
| A skill/plugin/connector that misfired or was never needed | | disable / adjust description |

Skip anything that only mattered to this conversation, anything already derivable from code or git history, and anything already saved (check step 2). Prefer **few, high-value items** - 0-6 is normal. Saying "nothing worth saving" is a fine outcome.

## 2. Check what already exists (avoid duplicates)

Read before proposing:
- `~/.claude/CLAUDE.md` (global) and the project's `CLAUDE.md` / `AGENTS.md` / `context/*.md`
- The project memory index: `~/.claude/projects/<cwd-slug>/memory/MEMORY.md` (if present)
- `~/.claude/settings.json` (`permissions`, `hooks`)
- Skills: `~/.agents/skills/` (the source of truth; `~/.claude/skills` holds links), agents: `~/.claude/agents/`
- `~/.claude/WORKFLOW.md`

If an existing entry covers the item, propose updating it rather than adding a new one. If an existing entry is now wrong, propose fixing or removing it.

## 3. Route each item to the right home

- **Applies in every project, every session** (who the user is, global tools, cross-project resources like the about-me file) → `~/.claude/CLAUDE.md`, as one short line under the fitting section (create a `## Reference` section for pointers). Keep that file lean: pointers, not contents.
- **Only this project** → the project's `AGENTS.md` (or `context/PROGRESS_TRACKER.md` for state). If the project has a `CLAUDE.md` instead, use that.
- **Useful background, not a rule** (recallable when relevant) → auto-memory file in the project memory dir, with frontmatter (`name`, `description`, `metadata.type`: user | feedback | project | reference) plus a one-line pointer in `MEMORY.md`. Memory is per-project, so anything needed across projects goes in global CLAUDE.md instead.
- **Permissions / hooks / env** → `~/.claude/settings.json` (load the `update-config` skill first). Hook scripts live in `~/.claude/hooks/` and get a line in `~/.claude/hooks/README.md`.
- **New skill** → load `anthropic-skills:skill-creator`, create it in `~/.claude/skills/<name>/` (the sync hook moves it into `~/.agents` and commits it). New mods follow the global-mod rule in CLAUDE.md.
- **New subagent** → `~/.claude/agents/<name>.md` (model `sonnet` or `haiku` unless it truly needs more - Pro plan).
- **Pure correction capture** overlaps with claude-reflect's `/reflect`; mention it if its queue has items, don't duplicate its work.

## 4. Propose

Show one compact table, most valuable first:

| # | What | Where | Exact text / change | Why it helps |
|---|---|---|---|---|

Write the exact line(s) to be added, not a description of them. For skills/hooks/agents, give a 2-3 line spec instead. Then ask with AskUserQuestion (multiSelect; group items if there are more than 4, and remind the user they can use "Other" to edit wording or exclude items).

## 5. Apply and report

Apply only the approved items, matching the surrounding style of each file. Then report in a few lines: what was written where (paths), anything skipped, and anything the user must do themselves (e.g. push `~/.agents`, restart session for settings).
