---
name: setup-agent-context
description: Scaffold or update AI-agent context files for a coding project — AGENTS.md at the project root, plus a context/ folder holding PROGRESS_TRACKER.md and any other relevant files (ARCHITECTURE.md, BUILD_PLAN.md, CODE_STANDARDS.md, LIBRARY_DOCS.md, UI_RULES.md, UI_TOKENS.md, etc). Use this whenever the user asks to set up agent context files, wants an AGENTS.md, wants a progress tracker for AI coding sessions, says something like "set up agent context files for this project," "/setup-agent-context," "add AI context files," or "scaffold this for vibe coding" — for both brand-new/empty projects and already-established codebases that don't yet have this setup. Also use this on repos that already have some of these files but are missing others, or have out-of-date content that should be refreshed.
---

# Setup Agent Context

Scaffolds (or updates) a small set of Markdown files that give future AI coding sessions durable, self-explaining context about a project — so a new session doesn't need to rediscover the project from scratch, and doesn't need to know these files trace back to this skill.

## Core principle

Every generated file must explain itself: a short purpose header (3-5 lines) at the top saying what the file is for and how it should be used/updated. This header is permanent — it does not get deleted once real content is added. A future agent (or the user) should be able to open any one of these files cold and understand its role without knowing this skill exists.

The flip side: keep everything else lean. Research on AI context files consistently shows that verbose, generic, LLM-boilerplate content (restating "write clean code," padding with obvious advice) measurably hurts agent performance and burns tokens. Write only what's specific to *this* project and not otherwise obvious from the codebase. Prefer exact commands, concrete conventions, and real project facts over generic advice.

## Step 1: Detect mode

Before creating anything, figure out which situation you're in — don't ask the user, decide from context:

- **New/empty project**: little or no existing source code (empty repo, fresh scaffold, no meaningful git history).
  - If the user's request (this message or the conversation so far, e.g. a chained planning session) already describes what's being built → fill AGENTS.md and the context files with **real content immediately**, not placeholders. Don't default to placeholder text out of caution if you already have enough information to write something real.
  - If genuinely nothing is known yet about the project's purpose → write the purpose headers and structural scaffolding, with clear inline notes on what the agent should fill in once the project direction is known.
- **Established project**: real source files, dependencies, existing README, meaningful git history. Read the codebase (package manifests, folder structure, existing docs, recent commits) and populate every file with real, specific content — not placeholders.
- **Files already exist** (partial or full AGENTS.md / context/ folder / README from a prior run or written by hand): merge, don't overwrite blindly.
  - Add missing sections and missing files.
  - You may restructure or reword existing sections to follow the conventions below, since the user is explicitly inviting this by invoking the skill.
  - Never silently delete content that doesn't fit the template — fold it in somewhere sensible instead of dropping it.
  - No need to summarize changes back to the user afterward — they track this with git.

## Step 2: Create/update root files

### `AGENTS.md` (project root)

Keep this file terse and machine-facing — aim for roughly 20-40 lines excluding the purpose header. Sections:

1. **Purpose header** (3-5 lines) — what this file is, that it's read by AI coding agents, and the standing maintenance clause (see below).
2. **Project overview** — one or two sentences, not a duplicate of the README's overview.
3. **Tech stack** — languages, frameworks, key dependencies.
4. **Setup & run commands** — exact, copy-pasteable (install, dev server, test, build, lint).
5. **Conventions & constraints** — non-obvious rules an agent wouldn't infer from the code itself. Skip anything generic ("write clean code") — only project-specific rules.
6. **Boundaries** — files/areas the agent should not touch or should be careful with, if any exist.
7. **Where to look for more** — point explicitly to `README.md` (for the plain-language project overview) and `context/` (for progress tracking and any deeper docs), so an agent doesn't have to guess what else exists.

**Standing maintenance clause** — always include this, worded plainly, inside the purpose header or as its own short line:
> After any meaningful change to this project, update this file, `context/PROGRESS_TRACKER.md`, and the "Project Overview" section of `README.md` to reflect the current state — do this proactively, without being asked.

### `README.md`

Don't rewrite the whole README. Ensure it has a **"Project Overview"** section (create it near the top if missing) written in plain, jargon-light language — the kind of explanation someone could give in an interview to show they understand what the project does and why, not an implementation walkthrough. This is distinct from AGENTS.md's terse technical notes. If a README doesn't exist yet, create a minimal one with at least this section (expand with standard sections — install, usage — if you have enough project info to write them meaningfully).

### `context/PROGRESS_TRACKER.md`

Purpose header (3-5 lines), then:

- **Current state** — what's working right now.
- **In progress** — active work.
- **Next steps** — near-term backlog.
- **Session log** — dated entries of what was done and key decisions made, most recent first.

**Pruning the session log**: use judgment, not a fixed entry count. When older entries are no longer useful for picking up where things left off (superseded decisions, resolved issues, stale in-progress notes), collapse them into a short running "earlier history" summary paragraph rather than deleting them outright or letting the log grow unbounded. Keep enough recent detail that a new session can pick up exactly where the last one left off.

## Step 3: Decide which optional `context/` files to add

Always create `context/PROGRESS_TRACKER.md`. Beyond that, use project signals to decide — don't ask the user, and don't create files nobody needs. Each file gets its own 3-5 line purpose header plus focused content, in `SCREAMING_SNAKE_CASE.md`.

| File | Create when... | Purpose |
|---|---|---|
| `ARCHITECTURE.md` | Non-trivial data flow, database/schema, multiple services or layers | System boundaries, folder structure, data flow, schema — keeps code in the right layer |
| `BUILD_PLAN.md` | Project is explicitly phased/roadmap-driven (multi-milestone build, not a quick script) | Ordered, incremental steps for implementing upcoming features; scope enforcement |
| `CODE_STANDARDS.md` | Multi-file/multi-contributor project, or user asks for strict conventions | Naming, error handling, type strictness, style rules beyond what a linter enforces |
| `LIBRARY_DOCS.md` | 2+ non-trivial third-party APIs/SDKs in use | Project-specific usage rules/examples for those libraries, to prevent hallucinated or outdated API usage |
| `UI_RULES.md` | Has a frontend/UI (framework like React/Vue/Svelte detected, or a `components/`-style folder) | Layout, responsive behavior, component composition, accessibility standards |
| `UI_TOKENS.md` | Has a frontend/UI with a design system or consistent styling | Design variables — color, typography, spacing, breakpoints |

This table is a starting point, not a closed set — invent a new `context/` file if a project has a genuinely distinct, recurring need that doesn't fit any of the above (e.g. `MIGRATIONS.md` for a project with heavy schema evolution). Don't create a file "just in case" — every file should earn its place based on something actually true about the project.

## Step 4: Sanity check before finishing

- Every created/updated file has a purpose header.
- AGENTS.md is not bloated and does not duplicate README content.
- AGENTS.md explicitly references `README.md` and `context/` so an agent knows to look there.
- Nothing that already existed was silently deleted.
- Placeholder content is only present where the project's purpose is genuinely still unknown — otherwise everything is filled with real, specific detail.
