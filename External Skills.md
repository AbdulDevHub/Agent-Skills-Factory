# External Skills

Skills installed via the `skills` CLI (vercel-labs/skills), tracked in `.skill-lock.json`. Use this as a lookup so you never have to re-find a source repo by hand again.

| Skill | Source Repo | What it does | Install command |
| --- | --- | --- | --- |
| `impeccable` | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | Multi-command design/UI polish agent — critique, harden, brand, animate, colorize, typeset, etc. — for auditing and improving frontend UI quality. | `npx skills add pbakaus/impeccable --skill impeccable` |
| `find-skills` | [vercel-labs/skills](https://github.com/vercel-labs/skills) | Meta-skill that helps an agent search, evaluate, and install other skills from the open skills ecosystem. | `npx skills add vercel-labs/skills --skill find-skills` |
| `ui-ux-pro-max` | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Extended UI/UX design-system guidance for building polished interfaces. | `npx skills add nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max` |
| `agent-browser` | [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser) | Gives an agent browser automation/control capabilities (navigate, click, inspect pages). | `npx skills add vercel-labs/agent-browser --skill agent-browser` |
| `web-design-guidelines` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | House style guidelines for building web UI (spacing, typography, layout conventions). | `npx skills add vercel-labs/agent-skills --skill web-design-guidelines` |
| `vercel-react-best-practices` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) (`react-best-practices`) | Large rule set of React/Next.js performance and correctness best practices (rendering, async, bundling, server components). | `npx skills add vercel-labs/agent-skills --skill react-best-practices` |
| `frontend-design` | [anthropics/skills](https://github.com/anthropics/skills) | Anthropic's official skill for distinctive, non-templated frontend visual design decisions. | `npx skills add anthropics/skills --skill frontend-design` |
| `skill-creator` | [anthropics/skills](https://github.com/anthropics/skills) | Anthropic's official skill for designing, scaffolding, and creating custom agent skills. | `npx skills add anthropics/skills --skill skill-creator` |
| `architect` | [JavaScript-Mastery-Pro/skills](https://github.com/JavaScript-Mastery-Pro/skills) | Interviews you on load-bearing technical decisions before a feature is built; writes a build spec to `docs/specs/`. | `npx skills@latest add jsmastery-pro/skills` |
| `imprint` | [JavaScript-Mastery-Pro/skills](https://github.com/JavaScript-Mastery-Pro/skills) | Bootstraps project AI-context files (`AGENTS.md`) for a codebase. | `npx skills@latest add jsmastery-pro/skills` |
| `recover` | [JavaScript-Mastery-Pro/skills](https://github.com/JavaScript-Mastery-Pro/skills) | Root-causes a failing test/bug via reproduce → localize → fix → verify loop. | `npx skills@latest add jsmastery-pro/skills` |
| `remember` | [JavaScript-Mastery-Pro/skills](https://github.com/JavaScript-Mastery-Pro/skills) | Keeps `AGENTS.md` and scope/spec status current after a change ships. | `npx skills@latest add jsmastery-pro/skills` |
| `review` | [JavaScript-Mastery-Pro/skills](https://github.com/JavaScript-Mastery-Pro/skills) | Pre-merge verification: runs the app against the spec, or does a second-model code review. | `npx skills@latest add jsmastery-pro/skills` |
| `grill-me` | [mattpocock/skills](https://github.com/mattpocock/skills) (`productivity/grill-me`) | Interviews you relentlessly, one question at a time, to stress-test a plan or design before you build it. | `npx skills add mattpocock/skills --skill grill-me` |
| `insforge` | [insforge/agent-skills](https://github.com/insforge/agent-skills) | Core SDK integration reference for the Insforge backend platform (auth, database, storage, AI, payments, realtime). | `npx skills add insforge/agent-skills --skill insforge` |
| `insforge-cli` | [insforge/agent-skills](https://github.com/insforge/agent-skills) | CLI reference for Insforge — deploys, migrations, branching, functions, schedules. | `npx skills add insforge/agent-skills --skill insforge-cli` |
| `insforge-debug` | [insforge/agent-skills](https://github.com/insforge/agent-skills) | Debugging/diagnostics reference for Insforge (logs, metrics, DB health, policies, advisor). | `npx skills add insforge/agent-skills --skill insforge-debug` |
| `insforge-integrations` | [insforge/agent-skills](https://github.com/insforge/agent-skills) | Third-party auth integration guides for Insforge (Auth0, Clerk, WorkOS, Stytch, Kinde, etc). | `npx skills add insforge/agent-skills --skill insforge-integrations` |
| `brainstorming` | [obra/superpowers](https://github.com/obra/superpowers) | Structured brainstorming skill with a visual companion (local server + HTML canvas) for exploring ideas interactively. | `npx skills add obra/superpowers --skill brainstorming` |
| `drawio-skill` | [Agents365-ai/drawio-skill](https://github.com/Agents365-ai/drawio-skill) | Generates and edits draw.io diagrams — shape libraries, autolayout, style presets, import parsers for multiple languages. | `npx skills add Agents365-ai/drawio-skill --skill drawio-skill` |
| `image-generation` | [bytedance/deer-flow](https://github.com/bytedance/deer-flow) | Image generation skill (script + templates) for producing images as part of an agent workflow. | `npx skills add bytedance/deer-flow --skill image-generation` |
| `humanizer` | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | Rewrites AI-sounding text to read more naturally/human. | `npx skills add NousResearch/hermes-agent --skill humanizer` |
| `code-reviewer` | [Shubhamsaboo/awesome-llm-apps](https://github.com/Shubhamsaboo/awesome-llm-apps) | Code review skill with rule files for correctness, security (SQLi, XSS), performance (N+1), and maintainability. | `npx skills add Shubhamsaboo/awesome-llm-apps --skill code-reviewer` |
| `git-commit` | [github/awesome-copilot](https://github.com/github/awesome-copilot) | Generates well-formed git commit messages from staged changes. | `npx skills add github/awesome-copilot --skill git-commit` |
| `diagram-maker` | [openclaw/openclaw](https://github.com/openclaw/openclaw) | Creates diagrams (SVG / Excalidraw-style) from a description. | `npx skills add openclaw/openclaw --skill diagram-maker` |

## Install everything at once

```bash
npx skills experimental_install
```

Run this from `C:\Users\kokok\.agents` with `.skill-lock.json` present — it reads the lock file and reinstalls every skill above at the exact recorded version, like `npm ci`.
