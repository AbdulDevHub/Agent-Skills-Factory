"""Download YouTube videos, transcribe them and cut frame sheets for an agent to study.

Usage:
    uv run --no-project --with faster-whisper python -I video_learn.py --bin <dir with yt-dlp.exe and ffmpeg.exe> --out <empty work dir> URL [URL ...]

For each video it writes into --out:
    <id>.meta.md    title, channel, length, upload date, description, chapters
    <id>.txt        timestamped transcript (YouTube captions if they download, else local Whisper)
    <id>_frames/    2x2 contact sheets, one frame every --every seconds (4 frames per sheet)
The video and audio files are deleted as soon as they are no longer needed.
Delete the whole --out folder when you are done.
"""

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")


def run(cmd: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")


def vtt_to_lines(vtt: Path) -> list[str]:
    """Collapse YouTube auto-caption VTT (rolling duplicates) into timestamped lines."""
    out, last = [], ""
    stamp = None
    for raw in vtt.read_text(encoding="utf-8", errors="replace").splitlines():
        m = re.match(r"(\d+):(\d+):(\d+)\.\d+ -->", raw)
        if m:
            h, mi, s = map(int, m.groups())
            stamp = f"[{h * 60 + mi}:{s:02d}]"
            continue
        text = re.sub(r"<[^>]+>", "", raw).strip()
        if not text or text == last or raw.startswith(("WEBVTT", "Kind:", "Language:")):
            continue
        last = text
        out.append(f"{stamp} {text}")
    return out


def whisper(pcm: Path, txt: Path, model_name: str) -> None:
    import numpy as np
    from faster_whisper import WhisperModel

    # Feed raw samples: faster-whisper's own decoder (PyAV) breaks on some version pairs.
    audio = np.fromfile(pcm, dtype=np.int16).astype(np.float32) / 32768.0
    model = WhisperModel(model_name, device="cpu", compute_type="int8")
    segs, _ = model.transcribe(audio, vad_filter=True, beam_size=1)
    with txt.open("w", encoding="utf-8") as f:
        for s in segs:
            f.write(f"[{int(s.start) // 60}:{int(s.start) % 60:02d}] {s.text.strip()}\n")


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--bin", required=True, type=Path)
    p.add_argument("--out", required=True, type=Path)
    p.add_argument("--every", type=int, default=20, help="seconds between frames")
    p.add_argument("--model", default="small.en")
    p.add_argument("--no-frames", action="store_true")
    p.add_argument("urls", nargs="+")
    a = p.parse_args()

    ytdlp, ffmpeg = str(a.bin / "yt-dlp.exe"), str(a.bin / "ffmpeg.exe")
    a.out.mkdir(parents=True, exist_ok=True)

    for url in a.urls:
        common = [ytdlp, "--js-runtimes", "node", "--ffmpeg-location", str(a.bin),
                  "-P", str(a.out), "-o", "%(id)s.%(ext)s", "--no-playlist", "-i"]
        # 1. Metadata + captions (cheap; often rate-limited with HTTP 429).
        run(common + ["--skip-download", "--write-info-json", "--write-auto-subs", "--write-subs",
                      "--sub-langs", "en", "--sub-format", "vtt", "--sleep-subtitles", "5", url])
        infos = sorted(a.out.glob("*.info.json"), key=lambda f: f.stat().st_mtime)
        if not infos:
            print(f"FAILED metadata for {url}")
            continue
        info = json.loads(infos[-1].read_text(encoding="utf-8"))
        vid = info["id"]
        infos[-1].unlink()
        chapters = "\n".join(f"- {int(c['start_time']) // 60}:{int(c['start_time']) % 60:02d} {c['title']}"
                             for c in info.get("chapters") or [])
        (a.out / f"{vid}.meta.md").write_text(
            f"# {info['title']}\n\n{info.get('channel')} | {info.get('duration_string')} | "
            f"uploaded {info.get('upload_date')}\n{url}\n\n## Chapters\n{chapters or '(none)'}\n\n"
            f"## Description\n{info.get('description', '')}\n", encoding="utf-8")

        txt = a.out / f"{vid}.txt"
        vtts = list(a.out.glob(f"{vid}*.vtt"))
        if vtts:
            txt.write_text("\n".join(vtt_to_lines(vtts[0])) + "\n", encoding="utf-8")
            for v in vtts:
                v.unlink()
            source = "captions"

        need_video = not a.no_frames or not txt.exists()
        mp4 = a.out / f"{vid}.mp4"
        if need_video:
            # 2. Low-res video: enough for slides and on-screen text, small on disk.
            run(common + ["-f", "bv*[height<=480]+ba/b[height<=480]", "--merge-output-format", "mp4", url])
            if not mp4.exists():
                print(f"FAILED video download for {url}")
                continue

        if not txt.exists():
            # 3. Local transcription.
            pcm = a.out / f"{vid}.pcm"
            run([ffmpeg, "-loglevel", "error", "-y", "-i", str(mp4), "-ac", "1", "-ar", "16000", "-f", "s16le", str(pcm)])
            whisper(pcm, txt, a.model)
            pcm.unlink()
            source = "whisper"

        if not a.no_frames:
            # 4. Contact sheets: 4 frames per image, so a 12-minute video is about 9 images.
            fdir = a.out / f"{vid}_frames"
            fdir.mkdir(exist_ok=True)
            run([ffmpeg, "-loglevel", "error", "-i", str(mp4), "-vf",
                 f"fps=1/{a.every},scale=640:-1,tile=2x2", str(fdir / "s%02d.jpg")])

        if mp4.exists():
            mp4.unlink()
        print(f"OK {vid} | {info['title']} | transcript from {source} | {a.out}")


if __name__ == "__main__":
    main()
