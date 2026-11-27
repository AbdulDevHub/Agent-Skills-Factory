---
name: learn-from-video
description: "Learn from YouTube videos directly: download with the user's StreamForge yt-dlp, get a timestamped transcript (captions, or local Whisper when YouTube blocks them), cut frame contact sheets to read slides and on-screen text, extract the useful info, then delete every downloaded file. The tools and model live in the user's Video Generation repo. Use when the user shares YouTube links and asks to extract, summarise, learn from or apply what a video says, or says 'watch this video', 'what does this video say', 'pull the useful info from'."
---

# Learn From Video

Read a video the way a careful note-taker would: what is said (transcript) plus what is shown (slides, code, tables), then keep only what is useful. Downloaded media is never kept; the tools and the Whisper model stay in the Video Generation repo between runs.

## 1. Tool

The tool lives in the user's Video Generation repo (`C:\Users\kokok\Downloads\Code Vault\Video Generation`) as `pnpm ff learn`. On every run it:
- pulls the user's StreamForge (`AbdulDevHub/StreamForge`, private) into that repo's gitignored `.cache/tools/StreamForge`, without LFS, so the weekly yt-dlp update PRs come through;
- uses that repo's own ffmpeg (ffmpeg-static);
- keeps the faster-whisper model in that repo's `.cache/models/hf` (about 0.5 GB, downloaded once).

If the repo is missing, say so and stop; don't rebuild the tool elsewhere.

## 2. Run

From any project, put the URLs first, then the flags:

```bash
pnpm --dir "C:/Users/kokok/Downloads/Code Vault/Video Generation" ff learn URL [URL ...] --out "<scratchpad>/videos"
```

Per video it leaves `<id>.meta.md` (title, chapters, description with links), `<id>.txt` (timestamped transcript) and `<id>_frames/` (2x2 contact sheets, one frame per 20 s) in `--out`. The command deletes the video and audio itself. Flags: `--every 10` for denser frames on slide-heavy talks, `--no-frames` for talking-head videos, `--whisper` to skip YouTube captions (poor auto-captions), `--model medium.en` if names come out garbled. Run it in the background; two 12-minute videos take a few minutes on CPU. Full output is in that repo's `.cache/logs/learn.log`.

## 3. Study

1. Read `meta.md` first: the chapters are the outline and the description holds the real links (repos, tools) the transcript only mumbles.
2. Read the whole transcript. Whisper mishears names ("Tay's skill" = Taste Skill, "Clod" = Claude); fix them against the description and frames.
3. Look at the contact sheets at chapter boundaries and wherever the transcript says "as you can see", "this prompt", "here". Slides and screen recordings often hold the exact wording (quoted rules, prompt templates, tables) that speech paraphrases.
4. Separate what the source says from the presenter's add-ons and sponsor plugs, and flag paid tools, affiliate links and unverifiable claims.

## 4. Deliver

- Lead with the useful info: short bullets per video, each a concrete, reusable point (a rule, a prompt pattern, a tool with its install line, a number). Skip intros, subscribe asks and filler.
- When the user wants it applied (a skill, notes, a project), propose the exact changes and follow the user's normal approval flow; credit the source (video title and the original author) where the target keeps sources.

## 5. Clean up (always)

Before replying, even when a step failed, delete the `--out` folder and say so in the reply. Keep the StreamForge clone and the Whisper model: they live in the Video Generation repo's `.cache/` on purpose.

Use a literal absolute path in `rm -rf`; the guard hook blocks recursive deletes of paths built from shell variables.

## Gotchas

- Captions often fail with HTTP 429 (rate limit); the script then transcribes locally. Don't retry captions in a loop.
- `--js-runtimes node` prints "n challenge solving failed" warnings; the 480p download still works. If downloads start failing, the weekly StreamForge workflow may not have merged its yt-dlp update yet: check the repo's open pull requests.
- faster-whisper's own decoder (PyAV) can crash with `metadata_errors`; the script (`tools/py/video_learn.py` in the Video Generation repo) avoids it by feeding raw 16 kHz samples from ffmpeg.
