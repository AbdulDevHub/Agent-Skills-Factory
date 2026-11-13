# Rewrite a repo's whole commit history (merged from git-reformat-history-agent)

Use only when the user asks to reformat old commit messages ("reformat commit history", "fix all commit messages", "/reformat-commits"). It rewrites every commit hash, so it suits single-author repos only. File contents, authors and dates stay as they are; only messages change.

## Message format

Same as SKILL.md: `<emoji> <type>: <Summary>` in sentence case, imperative, using SKILL.md's gitmoji table. Skip commits that already match. When a diff gives little to go on, guess from the files (`.md` → 📝 docs, `.css`/visual → 💄 style, images/fonts → 🍱 chore, renames/moves → 🚚 refactor, new page or component → ✨ feat, CI files → 👷 ci, config/lockfiles → 🔧 chore). Never stop to ask about a single commit; pick the best guess.

## Steps

1. **List history:** `git log --format="%H %s"`. Read `git show --stat <hash>` for each commit that needs a new message.
2. **Preview and confirm.** Show an old → new table and ask once before rewriting: this is hard to undo.
3. **Back up:** `git clone --mirror . ../<repo>-backup.git`, and save `git remote get-url origin` (filter-repo removes the remote).
4. **Rewrite with git-filter-repo** (install with `uv tool install git-filter-repo` if missing; never `git filter-branch`, which breaks on Windows paths). Write the map and the callback to temp files, never inline:

   ```python
   import subprocess, json, os, tempfile

   COMMIT_MAP = {}  # "<full hash>": "<new message>"
   ORIGIN_URL = "<from step 3>"

   tmp = tempfile.gettempdir().replace("\\", "/")
   map_path = f"{tmp}/commit_map.json"
   with open(map_path, "w", encoding="utf-8") as f:
       json.dump(COMMIT_MAP, f, ensure_ascii=False)

   callback = f'''import json
   with open(r"{map_path}", encoding="utf-8") as fh:
       m = json.load(fh)
   h = commit.original_id.decode("utf-8") if commit.original_id else None
   cur = commit.message.decode("utf-8", errors="replace").strip()
   commit.message = (m.get(h, cur) + "\\n").encode("utf-8")
   '''

   r = subprocess.run(["git", "filter-repo", "--force", "--commit-callback", callback], text=True)
   if r.returncode == 0:
       subprocess.run(["git", "remote", "add", "origin", ORIGIN_URL])
   ```

   Run it with `uv run <script>.py`. Use `commit.message` and `commit.original_id`, not a bare `message` variable (raises UnboundLocalError).
5. **Verify:** `git log --oneline -10`, and confirm the commit count matches the backup.
6. **Push only when the user says so.** It needs `git push --force origin <branch>`; tell them the backup path in case they want to undo.
