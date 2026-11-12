---
name: ship
description: "End-of-day polish and publish for the current repo: SEO and social check, README and screenshot refresh, agent context update, gitmoji commit, push. Use for 'ship it', 'polish and push', 'wrap up this repo', or any request that bundles SEO, README, commit and push."
---

# Ship

Polish the current repo and publish it in one pass. Asking for `ship` is the user's go-ahead to commit and push. Skip any step that does not apply. Stop only when a step fails, and say which step and why.

Runs fine on Sonnet at medium effort.

## Steps

1. **Preflight.** Run `git status --short`; if this is not a git repo, stop. Check visibility with `gh repo view --json visibility`. For a **public** repo, scan the pending diff (including untracked files) for secrets, API keys, `.env` values, personal data (email, home paths with the username, phone numbers) and coursework (assignment handouts, lab solutions) before anything else. If you find any, stop and list them.
2. **Verify.** Run the `Verify-full:` command from AGENTS.md if it has one, else `Verify:`. Skip when it is `none`. Stop on failure and show the output.
3. **SEO (web projects only).** Run the `web-seo-optimization` checklist as an audit and fix what is missing.
4. **README.**
   - Title in Title Case.
   - The description matches the current features.
   - The tech stack mentions Claude Code.
   - If UI files changed since the README screenshot was last committed (`git log -1 --format=%H -- <screenshot>` vs `git diff --name-only <that commit>`), refresh it through the `ui-checker` agent and save it over the old path.
5. **GitHub metadata.** Check with `gh repo view --json description,repositoryTopics,homepageUrl`. The description starts with an emoji, topics are set, and homepage is set when there is a live site. Fix with `gh repo edit` (`--description`, `--add-topic`, `--homepage`). Skip when there is no GitHub remote.
6. **Agent context.** Run `setup-agent-context` in update mode (refresh AGENTS.md and `context/PROGRESS_TRACKER.md`).
7. **Commit and push.** Commit with `gitmoji-commit`, splitting unrelated changes. Then `git push` to the existing remote and branch. Never force-push, never create a remote, and never push a repo whose AGENTS.md says to push only after the user confirms (ask first there).
8. **Report**, five bullets or fewer: what changed, how it was verified, the commit(s), and the repo or live link.
