# Upgrade guide

What counts as an upgrade and where each one goes. Read by the `/upgrade` skill and by the Toolbox mod's background scan (which sends this file to Haiku as its instructions), so keep it short and self-contained.

## 1. What to look for in a chat

| Signal | Example | Usually becomes |
|---|---|---|
| A resource or location revealed | "my about-me is in Dev Mountain/src/pages/about-me.md" | reference line (rule) |
| A fact about the user, role, goals, constraints | Pro plan, graduating April 2027, uses `uv` | rule or memory |
| A correction or "no, do it this way" | "don't leave a3", "use report.tex not PDF" | rule |
| A confirmed approach the user liked | "good, keep doing X" | rule |
| Project state or convention not in the repo docs | due date, grading rule, deploy step | rule in that project's AGENTS.md |
| A permission prompt the user approved for a safe command | `ssh ...`, `docker compose ps` | permission |
| A command that failed due to environment quirks | Windows shim, missing toolchain | rule (environment note) |
| A multi-step routine done by hand, likely to recur | ssh pull → make → run → collect timings | skill |
| Something that should happen automatically every time | "always run X after Y" | hook |
| A focused job worth isolating with its own tools/model | spec checker, test writer | agent |
| A skill/plugin/connector that misfired or was never needed | | skill-tweak |
| A change to how a mod behaves or looks | "the pane should remember the tab" | mod |

Skip anything that only mattered to that chat, anything derivable from code or git history, and anything already set up. Prefer **few, high-value items**: 0–6 per chat is normal, and none is a fine answer. A one-word reply like "no" or "use typescript" with no clear lasting rule behind it is not an upgrade.

## 2. Before suggesting, check what exists

- `~/.claude/CLAUDE.md` (global) and the project's `CLAUDE.md` / `AGENTS.md` / `context/*.md`
- The project memory index: `~/.claude/projects/<cwd-slug>/memory/MEMORY.md`
- `~/.claude/settings.json` (`permissions`, `hooks`)
- Skills: `~/.agents/skills/` (source of truth; `~/.claude/skills` holds links); agents: `~/.claude/agents/`
- `~/.claude/WORKFLOW.md`

If an existing entry covers the item, suggest updating it rather than adding a new one. If an existing entry is now wrong, suggest fixing or removing it.

## 3. Where each kind goes

- **rule, every project** (who the user is, global tools, cross-project resources) → `~/.claude/CLAUDE.md`, one short line under the fitting section. Keep that file lean: pointers, not contents.
- **rule, one project** → that project's `AGENTS.md` (or `context/PROGRESS_TRACKER.md` for state); its `CLAUDE.md` if it has no AGENTS.md.
- **memory** (useful background, not a rule) → a memory file in the project memory dir with frontmatter (`name`, `description`, `metadata.type`: user | feedback | project | reference) plus a one-line pointer in `MEMORY.md`. Memory is per-project; anything needed across projects is a global rule instead.
- **permission / hook** → `~/.claude/settings.json` (load the `update-config` skill first). Hook scripts live in `~/.claude/hooks/` with a line in `~/.claude/hooks/README.md`.
- **skill** → load `anthropic-skills:skill-creator`, create it in `~/.claude/skills/<name>/` (the sync hook moves it into `~/.agents` and commits it).
- **skill-tweak** → edit the skill in `~/.agents/skills/<name>/`, or turn it off from the Toolbox.
- **agent** → `~/.claude/agents/<name>.md` (model `sonnet` or `haiku` unless it truly needs more: Pro plan).
- **mod** → follow the global-mod rule in `~/.claude/CLAUDE.md` (build in the dev-mods session folder, copy to `~/.claude/plugins/<mod>/`).
- **escalate** (an applied upgrade whose problem came back) → make it stronger: a rule that was ignored becomes a hook or a sharper rule placed higher; a skill that misfired gets its description fixed.
