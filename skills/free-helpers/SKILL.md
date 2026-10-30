---
name: free-helpers
description: Hand jobs to free models (Gemini, OpenRouter :free, Groq, Cerebras, NVIDIA, Mistral via the local FreeLLMAPI hub; Copilot CLI for coding in a throwaway worktree; a paste-it-yourself Antigravity handoff). Use when a job is very bulky or needs many parallel subagents, when Claude usage is near its cap, when another model is clearly better at the task (e.g. SVG/animation, image generation), for a second opinion on a plan or diff, when the user says "ask Gemini", "use the free models/helpers", or for Antigravity/Copilot/FreeLLMAPI/Ollama setup questions.
---

# Free helpers

Claude stays the planner and the reviewer. Helpers are free and weaker, so use them only when it makes sense:
- **Bulk jobs:** many files to summarise, classify or convert, or something that would need lots of subagents.
- **Usage pressure:** Claude usage is near the cap, or a job big enough to wipe out a Pro window.
- **A better model for the task:** see `MODELS.md` (for example, Gemini for SVG and animation, Nano Banana for images through a handoff).
- **Second opinions:** on a plan or diff. Weigh the answer; don't just adopt it.
- **Otherwise:** do it yourself. The user pays for Claude and wants high-quality output.

Whenever a helper was used, the reply says so in one line: what went to which model (the helper prints `answered by …`).

## Never send (the guard enforces most of this; don't try to get around it)
- Secrets and keys, `.env` files, credentials.
- Personal info: resume, about-me, notes, email, calendar, `~/OneDrive`, `~/Documents`.
- Graded course work (CSC367 and any `CSC*` folder). CSC367 work on the lab machine stays with Claude.
- Employer or work code. Any folder with a `.no-free-helpers` file is blocked; offer to add one to work repos.

If the guard blocks a call, don't strip the content out to sneak it through. Do the job with Claude instead.
The blocked list is in `~/.claude/helpers/blocklist.txt`.

## Commands (`helper` is on PATH in Bash and PowerShell)
| Job | Command |
|---|---|
| Question / text job | `helper ask [--model smart\|fast\|gemini\|<id>] [--file f]... [--out f] "prompt"` (`-` = stdin) |
| Bulk | run several `helper ask … --out part-N.md` calls in the background in parallel, then merge |
| Coding | `helper code [--model <id>] "task"` (in a git repo) → runs Copilot CLI on free models in a sandboxed worktree of HEAD and prints a diff file. **Review the diff yourself**, then `git apply <diff>`; finish with `helper code --clean <id>` |
| GitHub's own models | `helper code --gh [--model <name>] "task"`. This uses the user's student Copilot AI credits, so use it sparingly and only for jobs worth it |
| Antigravity / images / huge jobs | `helper handoff [--file f]... [--copy] "task"` → tell the user to paste it into Antigravity; later `helper handoff --check <id>` |
| Models | `helper models` (lists the hub's models), `helper status` |
| Privacy dry run | `helper guard <path>…` or `… \| helper guard -` |

Aliases: `smart` = `auto:smart` (reasoning, Gemini first), `fast` = `auto:fast` (bulk; Groq/Cerebras first), and `gemini` = the newest Gemini. They're set in `~/.claude/helpers/config.json`.
- Free models make things up and miss details. Check facts and code before using them.
- Give helpers small, self-contained prompts with the files attached. They don't see this conversation.

## Rules
- **Never call `agy` yourself** (not even `agy -p` or `agy models`). Google's FAQ says wrapping it in another agent can get the account suspended. Antigravity is used only through `helper handoff`, which the user runs.
- **Paid OpenRouter:** the user has a funded key, but it is never stored. When a paid model is clearly worth it, ask first with a cost estimate.
- **Ollama** is off on this laptop; only the small `nomic-embed-text` embedding model is OK. Turn on bigger local models once the user has the MacBook.
- **New models:** a weekly check (SessionStart hook, `helper models --check`) adds "Research new model …" items to the Upgrades inbox. When applying one:
  - research the model;
  - update `MODELS.md` and the aliases;
  - tell the user to check Antigravity's own list for a newer default.

Setup and config commands for every tool are in `SETUP.md`. For Google-specific setup questions, also try `helper ask --model gemini`.
