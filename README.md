# Agent Skills Factory

Personal collection of AI agent skills, installable via the skills CLI.

## What's in here

- **`context-bootstrap`** — scaffolds a new project's foundational AI-context docs in one pass: `AGENTS.md`, architecture overview, build plan, code standards, library docs, progress tracker, project overview, and UI registry/rules/tokens references.
- **`context7-mcp`** — tells an agent when and how to pull current library/API docs from the Context7 MCP server instead of relying on stale training data.
- **`footer-note-comments`** — writes algorithm/interview-style code (LeetCode, HackerRank, etc.) with a numbered "footer notes" block instead of inline comments, so the code stays clean but non-obvious reasoning is still documented.
- **`git-reformat-history-agent`** — rewrites an entire repo's commit history into conventional-commits + gitmoji style, executed directly by an agent with terminal/git access.
- **`markdownlint-fix`** — fixes or suppresses markdownlint warnings across a project, including configuring `.vscode/settings.json` and rule exceptions for cases that shouldn't be auto-fixed.

Everything else this repo's skills-store references (design systems, code review, diagramming, backend SDKs, etc.) is sourced from other people's repos and deliberately not vendored here — see below.

Retired or superseded skills aren't deleted outright — check the `archive/` folder for the full list of previous skills.

## Install

Pick and choose:

```bash
npx skills@latest add AbdulDevHub/Agent-Skills-Factory
```

Restore my exact external skill set (after cloning this repo, uses `.skill-lock.json`):

```bash
npx skills experimental_install
```

See `External Skills.md` for the external skills I use but don't vendor here, with links to their original sources.
