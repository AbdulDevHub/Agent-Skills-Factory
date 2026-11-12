# External Skills

Skills installed via the `skills` CLI (vercel-labs/skills), tracked in `.skill-lock.json`. Use this as a lookup so you never have to re-find a source repo by hand again.

Skills marked "modified" carry my own edits, so they live in git too. Update everything with `scripts/update-skills.ps1` (see README), not a bare `npx skills update`, so those edits get merged instead of overwritten.

| Skill | Source Repo | What it does | Install command |
| --- | --- | --- | --- |
| `find-skills` | [vercel-labs/skills](https://github.com/vercel-labs/skills) | Meta-skill that helps an agent search, evaluate, and install other skills from the open skills ecosystem. | `npx skills add vercel-labs/skills --skill find-skills` |
| `vercel-react-best-practices` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) (`react-best-practices`) | Large rule set of React/Next.js performance and correctness best practices (rendering, async, bundling, server components). | `npx skills add vercel-labs/agent-skills --skill react-best-practices` |
| `skill-creator` (modified, tracked in git) | [anthropics/skills](https://github.com/anthropics/skills) | Anthropic's official skill for designing, scaffolding, and creating custom agent skills. | `npx skills add anthropics/skills --skill skill-creator` |
| `skill-creator-plus` (parked in `skills-disabled`) | [robonuggets/skill-creator-plus](https://github.com/robonuggets/skill-creator-plus) | Audits skills against Anthropic's authoring rules (pass/fail per rule with file:line evidence, stdlib Python validator); changes nothing until approved. MIT. | `npx skills add robonuggets/skill-creator-plus -g -a claude-code -y` |
| `architect` | [JavaScript-Mastery-Pro/skills](https://github.com/JavaScript-Mastery-Pro/skills) | Interviews you on load-bearing technical decisions before a feature is built; writes a build spec to `docs/specs/`. | `npx skills@latest add jsmastery-pro/skills` |
| `grill-me` (modified, tracked in git) | [mattpocock/skills](https://github.com/mattpocock/skills) (`productivity/grill-me`) | Interviews you relentlessly, one question at a time, to stress-test a plan or design before you build it. | `npx skills add mattpocock/skills --skill grill-me` |
| `drawio-skill` | [Agents365-ai/drawio-skill](https://github.com/Agents365-ai/drawio-skill) | Generates and edits draw.io diagrams — shape libraries, autolayout, style presets, import parsers for multiple languages. | `npx skills add Agents365-ai/drawio-skill --skill drawio-skill` |
| `image-generation` | [bytedance/deer-flow](https://github.com/bytedance/deer-flow) | Image generation skill (script + templates) for producing images as part of an agent workflow. | `npx skills add bytedance/deer-flow --skill image-generation` |
| `diagram-maker` | [openclaw/openclaw](https://github.com/openclaw/openclaw) | Creates diagrams (SVG / Excalidraw-style) from a description. | `npx skills add openclaw/openclaw --skill diagram-maker` |

## Install everything at once

```bash
npx skills experimental_install
```

Run this from `C:\Users\kokok\.agents` with `.skill-lock.json` present — it reads the lock file and reinstalls every skill above at the exact recorded version, like `npm ci`.
