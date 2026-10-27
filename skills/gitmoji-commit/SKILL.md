---
name: gitmoji-commit
description: Commit the currently staged files with a gitmoji + conventional-commit message like "🐛 fix: Fix scrollbar behaviour". Reads the staged diff, picks the emoji and type, adds a scope only in monorepos, splits unrelated changes into several commits when it helps, and runs git commit without pushing. Use when the user says "/gitmoji-commit", "commit my staged files", "write a commit message", or "gitmoji commit".
---

# Gitmoji commit

Look at what is staged, write a gitmoji commit message, and run `git commit`. **Never push.** The user reviews and pushes themselves.

## Message format

```
<emoji> <type>[(scope)]: <Summary>
```

- **One emoji** from the mapping below, matching the primary purpose of the change.
- **Type** is a Conventional Commit type (`feat`, `fix`, `style`, `refactor`, `docs`, `chore`, `perf`, `test`, `ci`, `build`, `revert`, `dx`, `infra`, ...). Where the table lists several, pick the one that fits the diff.
- **Summary**: sentence case (capital first letter, rest lowercase except proper nouns and identifiers), imperative present tense ("Fix", "Add", "Remove", not "Fixed" or "Adds"), no trailing period, ideally under 72 characters total. Say what changed in plain words, not file names.
- **Scope**: omit by default. Add one only in a monorepo (see below).
- **Body**: omit by default. Only for large changes (many files, or several distinct things in one commit): a blank line, then 2–5 short `- ` bullets of what changed. No explanations of why, no issue numbers.
- Keep the repo's history in mind: run `git log --format=%s -10` and match any local habit that doesn't contradict the above.

Examples:

```
🐛 fix: Fix scrollbar behaviour
✨ feat: Add watch tracker support
💄 style: Make card grid spacing consistent
🐛 fix(A1): Fix scrollbar behaviour
📝 docs: Update installation guide
```

## Procedure

1. **Inspect the index.**
   - `git status --short` and `git diff --cached --name-status`
   - `git diff --cached --stat`, then `git diff --cached` (for big diffs, read per file or per group).
   - If nothing is staged, say so and stop. Do not stage anything on your own.
   - Ignore pure noise (lockfiles, generated files) when deciding the message, but still commit them with the change that caused them.
2. **Decide whether to split.** Most of the time: one commit. Split only when staged files clearly fall into separate concerns that a reviewer would want as separate commits, for example:
   - a bug fix plus an unrelated docs update,
   - a feature plus an unrelated dependency bump or config change,
   - changes to different projects in a monorepo (always split per project).
   Rules for splitting:
   - Split by **whole files** only. Never use `git add -p` or split hunks. If one file mixes concerns, put it in the commit it mostly belongs to.
   - Don't split into tiny commits. Two or three groups is typical.
   - Tell the user the plan (groups and messages) in a few lines before running it, then continue without waiting.
3. **Commit.**
   - Single commit: `git commit -m "<subject>"` (add a second `-m` for a body). Use the staged index as it is.
   - Split: save the staged file list, `git reset -q` to unstage everything, then for each group `git add -- <files>` and `git commit -m "..."`. Order commits sensibly (e.g. fix before the docs about it). If any step fails, re-stage the files that haven't been committed so the user's index ends up as close to the original as possible, and report what happened.
   - Quote messages safely for the shell in use (PowerShell vs Bash). Emoji need no escaping, but don't use backticks or `$` unquoted.
   - Never use `--no-verify`, `--amend`, or `--force`. If a hook fails, show the error, fix the cause if it is in the staged changes, otherwise stop and report.
   - If the environment asks for an attribution trailer on commits, add it. Otherwise add none.
4. **Report** with `git log --oneline -n <count>` for the commits you made, and remind the user nothing was pushed. Keep it to a couple of lines.

## Monorepo scope

A repo is a monorepo when it holds several independent projects in folders (e.g. `apps/*`, `packages/*`, or top-level folders that each have their own `package.json` / project config), not one app with a `src/` tree.

- If every staged file is inside one project folder: add that folder name as the scope, e.g. `🐛 fix(A1): Fix scrollbar behaviour`. Use the folder name exactly as it appears.
- If files span multiple projects: split into one commit per project.
- Files at the repo root (README, CI, root config) get no scope.
- In a single-app repo, never add a scope, even for areas like `catalog` or `search`.

When unsure whether a repo is a monorepo, look at the top-level directory listing and `git log` for existing `type(scope):` usage.

## Gitmoji → type mapping

Pick the emoji by the primary purpose of the change. When several fit, prefer the more specific one.

| Emoji | Type(s) | Meaning |
|---|---|---|
| ✨ | feat | New feature |
| 🐛 | fix | Fix a bug |
| 🚑️ | fix | Critical hotfix |
| 🩹 | fix | Small non-critical fix |
| 🥅 | fix \| refactor | Catch errors |
| 🦺 | feat \| fix | Validation |
| 👽️ | fix \| refactor | Adapt to external API changes |
| 🔒️ | fix \| sec | Security or privacy fix |
| 🛂 | feat \| sec | Auth, roles, permissions |
| 🚨 | style \| fix | Fix compiler/linter warnings |
| 💥 | feat! \| fix! | Breaking changes |
| 💄 | style | UI or styling |
| 🎨 | style | Improve code structure/format |
| ✏️ | docs \| style | Fix typos |
| 📱 | style \| feat | Responsive design |
| 💫 | style \| feat | Animations or transitions |
| ♿️ | accessibility \| style | Accessibility |
| 🚸 | ux \| feat | Improve user experience |
| 🍱 | chore \| style | Assets |
| ⚡️ | perf | Performance |
| 🧵 | refactor \| perf | Concurrency |
| ♻️ | refactor | Refactor code |
| 🔥 | refactor \| chore | Remove code or files |
| ⚰️ | refactor | Remove dead code |
| 🗑️ | refactor \| chore | Deprecate code |
| 🚚 | refactor \| chore | Move or rename files/paths/routes |
| 🏗️ | arch \| refactor | Architectural change |
| 💩 | refactor | Improve poor code |
| 🦖 | refactor | Backwards compatibility |
| 🏷️ | types \| feat | Add or update types |
| 📝 | docs | Documentation |
| 💡 | docs | Source code comments |
| 💬 | feat \| docs | Text and literals |
| ✅ | test | Add/update tests |
| 🧪 | test | Add a failing test |
| 🤡 | test | Mocks |
| 📸 | test | Snapshots |
| 🧐 | chore \| test | Data inspection |
| 👷 | ci | CI configuration |
| 💚 | ci | Fix CI build |
| 🔧 | chore | Config files |
| 🔨 | chore | Dev scripts |
| 🧑‍💻 | dx \| chore | Developer experience |
| 🧱 | infra \| chore | Infrastructure |
| 🚀 | chore \| build | Deploy |
| 📦️ | build \| chore | Compiled files or packages |
| ➕ | chore \| deps | Add a dependency |
| ➖ | chore \| deps | Remove a dependency |
| ⬆️ | chore \| deps | Upgrade dependencies |
| ⬇️ | chore \| deps | Downgrade dependencies |
| 📌 | chore \| deps | Pin dependency versions |
| 🔖 | chore \| release | Release/version tag |
| 🎉 | chore | Initial commit / project setup |
| 🙈 | chore | .gitignore |
| 📄 | chore | License |
| 🔐 | chore | Secrets |
| 👥 | chore | Contributors |
| 🔊 | chore | Add/update logs |
| 🔇 | chore | Remove logs |
| 🗃️ | db \| chore | Database change |
| 🌱 | db \| chore | Seed files |
| 🌐 | feat \| i18n | Internationalization |
| 🔍️ | seo \| feat | SEO |
| 📈 | feat \| chore | Analytics |
| 🚩 | feat | Feature flags |
| 👔 | feat | Business logic |
| 🩺 | feat \| chore | Health checks |
| ✈️ | feat | Offline support |
| 💸 | feat \| chore | Sponsorship/financial infrastructure |
| 🥚 | feat | Easter egg |
| ⚗️ | experiment \| feat | Experiments/prototypes |
| 🍻 | feat \| refactor | Experimental or playful code |
| 🚧 | wip | Work in progress |
| ⏪️ | revert | Revert changes |
| 🔀 | merge | Merge branches |

Source: https://dev-mountain.vercel.app/resources/tools-workflow/commit-lint-guide#gitmoji--commit-type-mapping
