---
name: learn-from-video
description: "Learn from YouTube videos directly: download with the user's StreamForge yt-dlp, get a timestamped transcript (captions, or local Whisper when YouTube blocks them), cut frame contact sheets to read slides and on-screen text, extract the useful info, then delete every downloaded file. Use when the user shares YouTube links and asks to extract, summarise, learn from or apply what a video says, or says 'watch this video', 'what does this video say', 'pull the useful info from'."
---

# Learn From Video

Read a video the way a careful note-taker would: what is said (transcript) plus what is shown (slides, code, tables), then keep only what is useful. Nothing downloaded is kept afterwards.

## 1. Tool

The user's StreamForge repo (private, `AbdulDevHub/StreamForge`) ships `bin/yt-dlp.exe` and `bin/ffmpeg.exe`.

The user rarely needs this, so nothing is kept between runs: clone fresh each time into the session scratchpad, and delete it at the end (section 5).

```bash
GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 -q https://github.com/AbdulDevHub/StreamForge.git "<scratchpad>/StreamForge"
git -C "<scratchpad>/StreamForge" lfs pull --include "bin/ffmpeg.exe"
```

The LFS pull fetches only ffmpeg (about 140 MB); skip ffplay/ffprobe to save LFS quota. Any other yt-dlp + ffmpeg pair works the same way. Never write downloads into the clone: use a separate, empty `--out` folder.

## 2. Run

```bash
HF_HOME="<scratchpad>/hf" uv run --quiet --no-project --with faster-whisper python -I ~/.agents/skills/learn-from-video/scripts/video_learn.py --bin "<StreamForge>/bin" --out "<scratchpad>/videos" URL [URL ...]
```

Per video it leaves `<id>.meta.md` (title, chapters, description with links), `<id>.txt` (timestamped transcript) and `<id>_frames/` (2x2 contact sheets, one frame per 20 s). Video and audio are deleted by the script. Flags: `--every 10` for denser frames on slide-heavy talks, `--no-frames` for talking-head videos, `--model medium.en` if names come out garbled. Run it in the background; two 12-minute videos take a few minutes on CPU.

## 3. Study

1. Read `meta.md` first: the chapters are the outline and the description holds the real links (repos, tools) the transcript only mumbles.
2. Read the whole transcript. Whisper mishears names ("Tay's skill" = Taste Skill, "Clod" = Claude); fix them against the description and frames.
3. Look at the contact sheets at chapter boundaries and wherever the transcript says "as you can see", "this prompt", "here". Slides and screen recordings often hold the exact wording (quoted rules, prompt templates, tables) that speech paraphrases.
4. Separate what the source says from the presenter's add-ons and sponsor plugs, and flag paid tools, affiliate links and unverifiable claims.

## 4. Deliver

- Lead with the useful info: short bullets per video, each a concrete, reusable point (a rule, a prompt pattern, a tool with its install line, a number). Skip intros, subscribe asks and filler.
- When the user wants it applied (a skill, notes, a project), propose the exact changes and follow the user's normal approval flow; credit the source (video title and the original author) where the target keeps sources.

## 5. Clean up (always)

Before replying, even when a step failed, delete all three and say so in the reply:
- the `--out` folder;
- the StreamForge clone;
- the `<scratchpad>/hf` Whisper model folder (about 0.5 GB; `HF_HOME` keeps it out of `~/.cache`, where the guard hook blocks deletes).

Use literal absolute paths in `rm -rf`; the guard hook blocks recursive deletes of paths built from shell variables.

## Gotchas

- Captions often fail with HTTP 429 (rate limit); the script then transcribes locally. Don't retry captions in a loop.
- `--js-runtimes node` prints "n challenge solving failed" warnings; the 480p download still works. If downloads start failing, the weekly StreamForge workflow may not have merged its yt-dlp update yet: check the repo's open pull requests.
- `python -I` ignores `PYTHONIOENCODING`; scripts must call `sys.stdout.reconfigure(encoding="utf-8")` for emoji in titles.
- faster-whisper's own decoder (PyAV) can crash with `metadata_errors`; the script avoids it by feeding raw 16 kHz samples from ffmpeg.
