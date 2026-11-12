---
name: ship
description: "End-of-day polish and publish for the current repo: SEO and social check, README and screenshot refresh, agent context update, gitmoji commit, push. Use for 'ship it', 'polish and push', 'wrap up this repo', or any request that bundles SEO, README, commit and push."
---

# Ship

Polish the current repo and publish it in one pass. Asking for `ship` is the user's go-ahead to commit and push. Skip any step that does not apply. Stop only when a step fails (say which step and why) or when the repo's AGENTS.md asks for confirmation before a push.

Runs fine on Sonnet at medium effort.

## Steps

1. **Preflight.**
   - Run `git status --short`; if this is not a git repo, stop.
   - Any repo: stop if a `.env*` file (other than `.env.example`), private key or credentials file is staged, tracked, or untracked and not ignored (`git ls-files -o --exclude-standard`). Secrets belong only in a gitignored `.env`.
   - Check visibility with `gh repo view --json visibility`. If that fails there is no GitHub remote: skip step 5 and the push, and treat the repo as public for the scan below unless the user says otherwise.
   - Public repo: scan the pending diff and untracked files for secrets, API keys, personal data (email, home paths with the username, phone numbers) and coursework (assignment handouts, lab solutions). If you find any, stop and list them.
2. **Verify.** Run the `Verify-full:` command from AGENTS.md if it has one, else `Verify:`. Skip when it is `none`. Stop on failure and show the output.
3. **SEO (web projects only).** Run the `web-seo-optimization` checklist as an audit and fix what is missing.
4. **README.**
   - Title in Title Case.
   - The description matches the current features.
   - The tech stack mentions Claude Code.
   - Screenshot: find the last commit that touched it (`git log -1 --format=%H -- <screenshot>`). Refresh it through the `ui-checker` agent, saved over the old path, when UI files changed since then (`git diff --name-only <commit>` plus untracked files from `git ls-files -o --exclude-standard`), or when the README references a screenshot that was never committed.
   - If steps 3-4 changed code files, re-run the fast `Verify:` and stop on failure.
5. **GitHub metadata.** Check with `gh repo view --json description,repositoryTopics,homepageUrl`. The description starts with an emoji, topics are set, and homepage is set when there is a live site. Fix with `gh repo edit` (`--description`, `--add-topic`, `--homepage`).
6. **Agent context.** Run `setup-agent-context` on the existing files (its merge path): refresh AGENTS.md and `context/PROGRESS_TRACKER.md`.
7. **Commit and push.**
   - Re-run the step 1 checks on everything that will be committed (steps 3-6 add new text); stop on any hit.
   - Stage deliberately (`git add -A` once the checks pass), then commit with `gitmoji-commit`, splitting unrelated changes.
   - `gitmoji-commit` never pushes; `ship` does the push itself: `git push` to the existing remote and branch. Never force-push and never create a remote. If the repo's AGENTS.md says to push only after the user confirms, ask first.
8. **Report**, five bullets or fewer: what changed, how it was verified, the commit(s), and the repo or live link.
