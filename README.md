# Agent Skills Factory: Open-Source SKILL.md Skills for Claude Code, Codex & Cursor

![Agent Skills Factory banner: robots assembling agent skill blocks on a production line](./Screenshot.jpg)

[![skills CLI](https://img.shields.io/badge/npx%20skills-add-black)](#install)
[![Claude Code plugin](https://img.shields.io/badge/Claude%20Code-plugin%20marketplace-d97757)](#install)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/AbdulDevHub/Agent-Skills-Factory?style=social)](https://github.com/AbdulDevHub/Agent-Skills-Factory/stargazers)

Reusable [Agent Skills](https://agentskills.io) (`SKILL.md` folders) that make AI coding agents better at everyday developer work: writing `AGENTS.md` context files, gitmoji + conventional commits, humanizing AI-written prose, web SEO, markdownlint cleanup and more. They work with Claude Code, OpenAI Codex, Cursor, GitHub Copilot, Gemini CLI and any other agent that reads the open `SKILL.md` format.

## Install

Any agent, through the [skills CLI](https://github.com/vercel-labs/skills) (pick the ones you want):

```bash
npx skills@latest add AbdulDevHub/Agent-Skills-Factory
```

One skill only:

```bash
npx skills@latest add AbdulDevHub/Agent-Skills-Factory --skill gitmoji-commit
```

Claude Code, as a plugin:

```text
/plugin install agent-skills-factory --marketplace AbdulDevHub/Agent-Skills-Factory
```

## Skills

| Skill | What it does |
| --- | --- |
| [`context-bootstrap`](./skills/context-bootstrap/SKILL.md) | Interviews you in six stages and writes a new project's AI-context docs: `AGENTS.md`, architecture, build plan, code standards, library docs, progress tracker, UI rules and tokens. |
| [`setup-agent-context`](./skills/setup-agent-context/SKILL.md) | Scaffolds or refreshes `AGENTS.md` plus a `context/` folder for new or existing codebases. |
| [`gitmoji-commit`](./skills/gitmoji-commit/SKILL.md) | Commits staged files with a gitmoji + conventional-commit message (`🐛 fix: ...`), splitting unrelated changes into separate commits. Never pushes. |
| [`git-reformat-history-agent`](./skills/git-reformat-history-agent/SKILL.md) | Rewrites a whole repo's commit history into conventional-commits + gitmoji style. |
| [`humanizer`](./skills/humanizer/SKILL.md) | Removes AI writing patterns from prose while keeping the writer's voice, or flags them without rewriting. Merged from three MIT projects (credited in the skill). |
| [`web-seo-optimization`](./skills/web-seo-optimization/SKILL.md) | SEO and social-sharing setup for React, Vite, Next.js and static sites: meta tags, Open Graph, JSON-LD, PWA manifest, sitemap, robots.txt. |
| [`markdownlint-fix`](./skills/markdownlint-fix/SKILL.md) | Fixes or suppresses markdownlint warnings across a project and configures rule exceptions. |
| [`context7-mcp`](./skills/context7-mcp/SKILL.md) | Tells the agent when to pull current library docs from the Context7 MCP server instead of relying on stale training data. |
| [`footer-note-comments`](./skills/footer-note-comments/SKILL.md) | Writes LeetCode/interview-style solutions with a numbered "footer notes" block instead of inline comments. |
| [`free-helpers`](./skills/free-helpers/SKILL.md) | Offloads bulky or parallel jobs to free models (Gemini, OpenRouter, Groq, Cerebras via a local hub, Copilot CLI) when Claude usage is tight. |
| [`js-style-refactor`](./skills/js-style-refactor/SKILL.md) | Refactors JavaScript into my personal style. Useful as a template for encoding your own style as a skill. |
| [`upgrade`](./skills/upgrade/SKILL.md) | Self-improvement loop for a Claude Code setup: reviews a conversation for things worth saving and applies queued upgrades. |

## Keeping third-party skills in sync without losing edits

This repo is also my live `~/.agents` folder, so it manages skills I didn't write. The interesting part is the tooling around that:

- **Edits are detected automatically.** A session hook fingerprints each external skill at install time (`.skill-baseline.json`). If its content later changes without an upstream update, the skill counts as modified: it's un-ignored and committed.
- **Updates three-way merge.** [`scripts/update-skills.ps1`](./scripts/update-skills.ps1) runs `npx skills update`, then merges upstream changes into each locally edited skill with `git merge-file` (old upstream as the base, fetched by its locked tree hash). Clean merges are committed; conflicts are left as `<<<<<<<` markers.
- **Everything is pinned.** Unmodified external skills are gitignored and recorded in `.skill-lock.json`, so `npx skills experimental_install` restores the exact set, like `npm ci`.

Modified external skills kept in git under their original licenses:

| Skill | Source | License | What I changed |
| --- | --- | --- | --- |
| `grill-me` | [mattpocock/skills](https://github.com/mattpocock/skills) | MIT | Self-contained interview instructions and a description that triggers on "grill me", "stress-test this", etc. |
| `skill-creator` | [anthropics/skills](https://github.com/anthropics/skills) | Apache 2.0 (`LICENSE.txt`) | Test cases as per-case folders under `evals/`, matching the `claude plugin eval` layout. |

The unmodified ones (design systems, code review, diagramming, backend SDKs) are listed with sources in [External Skills.md](./External%20Skills.md).

```powershell
powershell -ExecutionPolicy Bypass -File ~/.agents/scripts/update-skills.ps1
```

The former `archive/` folder (an August 2026 snapshot of every skill) lives in git history: `git checkout 84d2200 -- archive`.

## Contributing

Issues and PRs are welcome, especially bug reports from running a skill in an agent other than Claude Code. Each skill is a folder at `skills/<name>/SKILL.md` with YAML frontmatter (`name`, `description`); quote any description that contains a colon.

## License

My skills and scripts are [MIT](./LICENSE). Skills adapted from other projects keep their original license, included in their folder.

Built by [Abdul Khan](https://github.com/AbdulDevHub).
