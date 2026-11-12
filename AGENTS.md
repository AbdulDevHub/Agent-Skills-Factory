# Agent-Skills-Factory

Verify: none

- Removing a skill: delete its folder, its link in `~/.claude/skills` or `skills-disabled`, its `.skill-lock.json` entry, and its rows in README.md and External Skills.md. Then commit. Push only after I confirm.
- Updating external skills: check first whether I edited it. Edited skills are tracked in git and updated only through `scripts/update-skills.ps1` (merge), never a plain reinstall or pull. Unmodified external skills stay uncommitted.
- Merging or rewriting skills from several sources: settle the scope with /grill-me first, replace the old skill under the same name, track it here. Writing-style skills: voice-first minimal edits, final text plus a short "What changed", a voice sample only when given.
- Examples in skills and docs use only details present in the example input. Never invent facts, names or numbers. Run the reviewer agent on new skills.
- Keep must-follow rules in the first 5,000 tokens of SKILL.md; move long material to `references/`.
