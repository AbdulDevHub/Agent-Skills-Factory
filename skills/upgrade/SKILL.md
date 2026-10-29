---
name: upgrade
description: Self-improvement loop for the user's Claude setup. "/upgrade u3 u7" plans and applies those items from the Upgrades inbox (sent by the Toolbox mod's Upgrades tab); "/upgrade" alone reviews the current conversation and adds what it finds to the inbox. Replaces /retro. Run when the user types "/upgrade" or asks to review this conversation for anything to save or optimize.
argument-hint: "[item ids, e.g. u3 u7]"
disable-model-invocation: true
---

# Upgrade

The Toolbox mod scans finished chats in the background and collects suggested changes to the user's setup in an inbox, `~/.claude/toolbox/upgrades.json`. The Toolbox's **Upgrades** tab lets the user pick items and sends them here as `/upgrade <ids>`.

- `GUIDE.md` (next to this file) says what counts as an upgrade and where each kind goes. Read it first in both modes.
- `inbox.mjs` (next to this file) reads and updates the inbox. Always use it, never hand-edit the JSON: the mod writes the same file.

```bash
node ~/.claude/skills/upgrade/inbox.mjs show u3 u7                # the items, as JSON
node ~/.claude/skills/upgrade/inbox.mjs applied u3 "what was written where"
node ~/.claude/skills/upgrade/inbox.mjs dropped u3 "why it is not needed"
node ~/.claude/skills/upgrade/inbox.mjs add '[{"kind":"rule","title":"…","detail":"…","target":"…"}]' "<project folder>"
```

## With ids: apply the picked items

1. **Read** the items with `show`. Each one has `kind`, `title`, `detail` (exact text or a short spec), `target`, `project` (the folder of the chat it came from) and `sources` (how many chats it came up in). An `escalate` item names, in `escalates`, an applied item whose problem came back: read that one too and make the fix stronger (see GUIDE.md).
2. **Re-check** each item against the files GUIDE.md §2 lists. If it is already covered, or the target no longer exists, plan to mark it `dropped` with a reason. If the wording should change to fit the file, say how.
3. **Plan.**
   - If any item is a `skill`, `hook`, `agent` or `mod`, enter plan mode and write a short plan covering each item: the files touched and the exact text or spec.
   - Otherwise, show one compact table and ask with AskUserQuestion (multiSelect, every item pre-listed, "Other" to edit wording):

   | id | What | Where | Exact text / change |
   |---|---|---|---|

4. **Apply** only what the user approved. Follow GUIDE.md §3 for where each kind goes and which skill to load first (`update-config` for settings and hooks, `skill-creator` for new skills, the global-mod rule for mods). Match the surrounding style of each file.
5. **Record** each result with `inbox.mjs`:
   - applied: one-line note naming the file(s) written,
   - dropped: the reason,
   - items the user declined: leave open, so they can snooze them from the tab.
6. **Report** in a few lines: what was written where, anything dropped or skipped, and anything the user must do (restart for settings, `/reload-plugins` for mods, push `~/.agents`). Mention that the Toolbox's Applied view keeps the log.

## Without ids: review this conversation

This mode replaces /retro.

1. Scan the conversation from the first message using GUIDE.md §1. Check what already exists (§2) and what is already in the inbox (`show` with no ids lists the open items), so nothing is suggested twice.
2. Show the candidates in the same table (id column left blank), most valuable first. Ask with AskUserQuestion (multiSelect) whether to:
   - apply them now (then follow steps 3–6 above after adding them), or
   - add them to the inbox for later.
3. Add the chosen items with `add`, giving the current project folder. Report the new ids.

"Nothing worth saving" is a fine outcome. Claude-reflect's correction queue is retired; this skill and the background scan replace it.
