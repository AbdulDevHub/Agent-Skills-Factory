# Sources

`omni-ui` (OmniUI, first named `ui-ux`) merges five earlier skills into one (Fable audit S5, 2026-11). Nothing here is loaded for design work; it records where each rule came from, the licence terms, and how to pull in upstream changes.

Merged 2026-11-12 from the upstream versions listed below (fetched that day), not only from the copies installed in June 2026.

## Source skills

| Source | Repo and path | Author | Licence | Version merged | Used for |
|---|---|---|---|---|---|
| frontend-design | [anthropics/skills](https://github.com/anthropics/skills) `skills/frontend-design/` | Anthropic | Apache-2.0 (`LICENSE.txt` in the skill folder) | path commit `41bbe19d1a1a` (2026-09-03) | Ground, plan before code, the five generated-page looks, hero as thesis, UX writing, "remove one accessory" |
| impeccable | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) `.claude/skills/impeccable/` | Paul Bakaus | Apache-2.0 (repo `LICENSE`; its `NOTICE.md` covers only the iOS/Android references, not used here) | v4.8.2, path commit `b856e5010f2d` (2026-11-10) | Bans (`reference/craft-floor.md`), colour, type and layout numbers, browser surfaces, register split, critique heuristics, personas, cognitive load, severity, audit dimensions, motion timing and easing |
| impeccable (older) | same repo, `.agents/skills/impeccable/` as installed 2026-06-18 | Paul Bakaus | Apache-2.0 | v3.7.1 | `reference/brand.md`, `product.md` and `interaction-design.md` (not in v4.8.2): brand/product table, imagery rules, overlay and focus patterns |
| ui-ux-pro-max | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) `.claude/skills/ui-ux-pro-max/` | Next Level Builder | MIT (repo `LICENSE`) | path commit `4f2dbb67e649` (2026-11-07); rules from `references/quick-reference.md` | Sections 1, 2 (a11y-checklist), 7 (motion), 8, 9 (build: forms, navigation), pre-delivery checklist (SKILL.md section 6) |
| web-design-guidelines | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) `skills/web-design-guidelines/`; rules in [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) `command.md` | Vercel | Skill repo: **no licence file**. Rules repo: MIT | skill `ba46938889d4`, rules `4ecfb9fb8d1d` | Only the idea of terse `file:line` findings and a pointer to the guidelines URL. No text copied. |
| imprint | [JavaScript-Mastery-Pro/skills](https://github.com/JavaScript-Mastery-Pro/skills) `skills/imprint/` | JavaScript Mastery | MIT (repo `LICENSE`) | copy installed 2026-06-18 (skills-lock folder hash `7ae49f6`, not checkable upstream); **no longer in the repo** (checked 2026-11-12) | consistency.md: extract used values, compare, list drift, confirm, fix. Its `ui-registry.md` file is not used. |
| taste-skill | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) `skills/taste-skill/` | Leonxlnx | MIT (repo `LICENSE`) | v2.5.1, repo commit `f6b7657` (2026-11-07) | SKILL.md section 5: brand-page structure and copy tells (from its SKILL.md and `references/copy-tells.md`). Paraphrased. |
| hallmark | [nutlope/hallmark](https://github.com/nutlope/hallmark) | Nutlope | MIT | README only, 2026-11-13 | One idea in SKILL.md section 3: build and review the hero first. Its Floor/Reflex/Finish tiers match the "firm vs reference" framing at the top of SKILL.md. Rewritten. |
| huashu-design | [alchaincyf/huashu-design](https://github.com/alchaincyf/huashu-design) | alchaincyf | MIT (demo stickers PolyForm Shield, not used) | README only, 2026-11-13 | One idea in SKILL.md section 2: real brand assets from the brand's own sources, ask once for real material. Rewritten. |
| avoid-ai-design | [funboy322/avoid-ai-design](https://github.com/funboy322/avoid-ai-design) | funboy322 | MIT | not copied | Link only (section 8), for critiques. |
| gauntlet-loop | [robonuggets/gauntlet-loop](https://github.com/robonuggets/gauntlet-loop) | RoboNuggets (idea credited there to Matt Shumer) | CC BY 4.0 | repo commit `9b1975a1b8f0` (2026-08-05, "Credit Matt Shumer") | One idea in critique.md: name a quality bar, then compare blind against it. Rewritten, not copied. |

## What was copied and what was rewritten

- Verbatim or near-verbatim: the ban list items and the five generated-page looks (SKILL.md section 5), the Nielsen heuristic list and score bands, the P0 to P3 table. These come from Apache-2.0 sources (see the notice below).
- Everything else is rewritten in this skill's own words.
- ui-ux-pro-max (MIT) rules are paraphrased; MIT asks that the copyright and permission notice travel with substantial copies, so keep the repo link above if text is ever copied verbatim.
- Vercel: the skill repo has no licence, and the rules repo (MIT) was used only as a link. No Vercel text is copied.

## Apache-2.0 notice

Parts of `SKILL.md` section 5 and `references/critique.md` are derived from:
- frontend-design, Copyright Anthropic, PBC, licensed under the Apache License, Version 2.0.
- impeccable, Copyright Paul Bakaus, licensed under the Apache License, Version 2.0.

Licence text: https://www.apache.org/licenses/LICENSE-2.0. You may not use these files except in compliance with the License; they are distributed on an "AS IS" basis, without warranties or conditions of any kind.

Modifications made here: wording condensed and rewritten in places, lists from both sources merged and reordered, product-specific commands, scripts and file conventions removed, numbers kept as in the source.

## Deliberately left out

Per Fable audit S5, do not bring these back during an update:
- Any scripts, CLIs, hooks or detectors (impeccable's launcher, live mode, detector hook, pin, doctor; ui-ux-pro-max's search tool and CSV data; the Vercel fetch wrapper).
- Generated project files: `PRODUCT.md`, `DESIGN.md` writing, surface briefs, `ui-registry.md`, `design-system/MASTER.md`. Project design memory lives in `context/UI_TOKENS.md` and `context/UI_RULES.md` only.
- impeccable's 23 sub-commands and routing; ui-ux-pro-max's style catalogues, palettes, chart and stack sections, and native-app (iOS/Android) rules.
- Image generation steps, comp/plate review flows, multi-agent critique orchestration.
- taste-skill's kit and scripts (gate.mjs Stop hook, deal/start/moments dealers, copy-lint, consistency checker, photo search, assets) and its one-section-per-screen and "deal, never choose" rules.

Settled choices that differ from the newest upstream (keep unless the user decides otherwise):
- **Motion uses transform and opacity only.** impeccable v4.8 allows blur, clip-path and mask when smooth; the audit chose the stricter rule.
- **Two registers, brand and product.** impeccable v4.8 uses four modes (Persuade, Operate, Read, Experience); SKILL.md folds Read into product and Experience into brand.

## Checking for updates

Run this when the user asks to update OmniUI, or about every three months. Work in a scratch folder, never in the skills repo.

1. **See what changed.** For each row in the table, list commits to that path since the recorded one:
   ```
   gh api "repos/<owner>/<repo>/commits?path=<path>&per_page=20" --jq '.[] | .sha[0:12] + " " + .commit.committer.date[0:10] + " " + (.commit.message|split("\n")[0])'
   ```
   Stop at the recorded commit. No newer commits means nothing to do for that source. An empty result means the path moved or was removed: look at the repo tree before assuming either.
2. **Check the licence first.** `gh api repos/<owner>/<repo>/license --jq .license.spdx_id`. A 404 is expected for two repos: anthropics/skills keeps the licence per skill (check `gh api repos/anthropics/skills/contents/skills/frontend-design/LICENSE.txt --jq .name` instead), and vercel-labs/agent-skills has none (copy nothing from it anyway). For any other source, if the licence changed or vanished, copy nothing new from it and tell the user.
3. **Read the diff**, not the whole skill: `gh api repos/<owner>/<repo>/compare/<recorded>...<latest> --jq '.files[] | select(.filename | startswith("<path>")) | .filename + "\n" + (.patch // "")'`, or a shallow sparse clone into the scratch folder when the patch is too large.
4. **Keep only what helps here.** Take a change if it adds or corrects a concrete design rule (a new ban, a better number, a WCAG update, a clearer check) that fits an existing section. Skip anything on the "Deliberately left out" list, anything that only reorganises the upstream skill, and anything that re-decides a settled choice above (raise those with the user instead).
5. **Merge into the right file** within its budget: SKILL.md stays at 250 lines or fewer with must-follow rules near the top; references stay near their sizes (build 150, critique 150, motion 100, a11y-checklist 120, consistency 80). Replace an older rule rather than adding a second version of it.
6. **Record it.** Update the "Version merged" column with the new commit and date, and add a line under "Update log" saying what was taken and what was skipped.
7. **Check the result**: run the `reviewer` agent on the diff, and tell the user what changed. Commit only when the user asks.

## Update log

- 2026-11-12: first merge. Pulled latest upstreams the same day; took impeccable v4.8.2's craft-floor bans and browser-surface theming, frontend-design's five-look list and headline-accent tell, ui-ux-pro-max's WCAG 2.2 items (focus not obscured, drag alternative, 24 px web target minimum, accessible authentication, redundant entry, IME Enter), cancellable transitions and error-summary focus rule. imprint had been removed upstream, so its June copy was used.
- 2026-11-13: user decision: the merged rules are a reference, not hard rules (future models are expected to need them less). SKILL.md now says so near the top; only accessibility, the user's instructions and the verify step are firm. Keep that framing in future merges.
- 2026-11-13: research pass. Took two ideas (hero first from Hallmark; real brand assets and ask-once from huashu-design), added reference-site and designlang pointers and a link to avoid-ai-design's catalogue. Skipped: unslop (CC BY, duplicates), superdesign (hosted service and login), installing any of their scripts.
- 2026-11-13: added taste-skill v2.5.1 (MIT): brand-page structure rules and a condensed copy-tells list in SKILL.md section 5. Skipped its scripts, hook, asset kit and per-trade layout system.
