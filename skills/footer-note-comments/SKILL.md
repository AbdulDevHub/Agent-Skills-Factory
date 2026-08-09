---
name: footer-note-comments
description: Write concise algorithm/interview code (e.g. LeetCode solutions) with a numbered "footer notes" block instead of inline comments, so the code stays clean but the reasoning behind non-obvious lines is preserved. Use this skill whenever the user asks to solve a coding problem, write a LeetCode/HackerRank/interview-style solution, or explicitly asks for "footer notes", "footnote comments", or code that's "concise but explained". Also use it when the user asks to add this style of documentation to existing code.
---

# Footer Note Comments

A commenting style for short, self-contained algorithm solutions (LeetCode-style problems,
coding interview practice, small scripts). The code stays dense and readable top-to-bottom;
the "why" for tricky lines lives in a numbered footer block below the code instead of
crowding the logic with inline comments.

The point isn't decoration — it's so that future-you (or someone else) can reread the
code in 30 seconds and remember *why* a non-obvious line was written that way, without
having to re-derive the reasoning from scratch.

## When to use this

Use this style by default whenever writing a solution to a coding problem — especially
algorithmic ones with a "trick" (two pointers, sliding window, DP, greedy proofs, bit
tricks, etc.) where some lines aren't self-explanatory just from reading them.

Don't use it for boilerplate-heavy code, production code with a team style guide, or
code where every line is already obvious — the footer would just be noise.

## The template

```
<code with numbered markers on select lines, e.g. `# [1]`, `# [2]`>

# ==============================================================================
# FOOTER NOTES
# ==============================================================================
# Approach: <one sentence naming the pattern/strategy in plain English>
#
# [1] <Short Title Case Label>:
#     <what this line does AND why it's written this way, wrapped to ~78 cols>
#
# [2] <Short Title Case Label>:
#     <...>
```

Adapt the comment character to the language (`#` for Python, `//` for C++/Java/JS,
`--` for SQL, etc.) — the structure stays the same.

## Rules

1. **Write the code first, clean.** Get the solution correct and readable on its own
   before adding any markers. If the code needs comments to be understood at all, fix
   the naming/structure first — footer notes are for *rationale*, not for compensating
   for unclear code.

2. **Mark sparingly.** Only number a line if it clears one of these bars:
   - The reasoning isn't recoverable just by reading the line (e.g. why `max()` and not
     just assignment; why a boundary is `+1` and not `+0`).
   - It encodes an edge case that isn't visually obvious (e.g. "this guard prevents
     double-counting when the window is empty").
   - It's the crux of the algorithm's cleverness — the one or two lines that *are* the
     trick.
   Do not mark lines whose purpose is already obvious from variable names and structure
   (e.g. `result = max(result, ...)` rarely needs its own footnote). If you're marking
   more than ~30-40% of the lines, you're over-marking — pull back.

3. **Number in reading order**, top to bottom, starting at `[1]`. Don't renumber
   existing markers if you're only appending new code — numbers don't need to be
   semantically meaningful, just sequential and unambiguous.

4. **Always start the footer with a one-line "Approach" summary** before the numbered
   notes. This is the single most useful line for future review — it should name the
   pattern (e.g. "sliding window with a last-seen-index map", "bottom-up DP over subset
   sums", "monotonic stack to find next greater element") so the reader can recall the
   whole strategy before reading any line-level detail.

5. **Each footnote has two parts**: a short Title Case label (a few words, functions
   like a subject line) and a body explaining what the line does *and* why it's written
   that way — not just a restatement of the code. Wrap body text to a consistent width
   (~78 columns is a good default) for readability in an editor or terminal.

6. **Keep the footer separated from the code** with a full-width `=` banner line and a
   centered "FOOTER NOTES" (or per-language equivalent) header, so it reads as a
   distinct section, not more code.

## Example

```python
class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        last_seen = {}
        left = 0
        result = 0
        for right in range(len(s)):
            char = s[right]
            if char in last_seen:
                left = max(last_seen[char] + 1, left)  # [1]

            last_seen[char] = right
            result = max(result, right - left + 1)

        return result

# ==============================================================================
# FOOTER NOTES
# ==============================================================================
# Approach: Sliding window, shrinking from the left whenever the current
# char was last seen inside the window. last_seen tracks each char's most
# recent index for O(1) duplicate checks.
#
# [1] Left boundary jump:
#     Jump left to just past the duplicate's last index. The max() guards
#     against moving left backward when the duplicate occurred before the
#     current window started (e.g. "abba" — the first 'a' is stale by the
#     time we hit the second one).
```

Notice only one line is marked — `last_seen[char] = right` and the `result = max(...)`
line aren't, because their purpose is obvious from reading them. The Approach line lets
you recall "oh, sliding window" instantly without reading the footnote at all.

## Workflow

When asked to solve a problem in this style:

1. Solve it normally — write correct, clean code first.
2. Re-read the code and identify which lines (if any) would confuse you on a re-read in
   a few months. Mark only those.
3. Write the footer: Approach line first, then one entry per marker, in order.
4. If the user gives you an existing solution and asks to "add footer notes" to it,
   don't rewrite their logic — just identify non-obvious lines, add markers, and write
   the footer block below the existing code.