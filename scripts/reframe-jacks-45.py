#!/usr/bin/env python3
"""Re-export jumping jacks as 4:5 so a full-width phone card keeps overhead hands."""
from __future__ import annotations

import shutil
import subprocess
import tempfile
from pathlib import Path

ASSETS = Path("/opt/cursor/artifacts/assets")
PUB = Path("/workspace/public/exercises")
VW, VH = 720, 900  # 4:5


def run(args: list[str]) -> None:
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit(f"cmd failed ({r.returncode}): {' '.join(args)}\n{r.stderr}")


def fill_45(src: Path, dest: Path) -> None:
    """Fit the whole person into 4:5; fill side gaps with a blurred crop (no black bars)."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    run(
        [
            "ffmpeg",
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            str(src),
            "-filter_complex",
            (
                f"[0:v]scale={VW}:{VH}:force_original_aspect_ratio=increase,"
                f"crop={VW}:{VH},boxblur=24:8[bg];"
                f"[0:v]scale={VW}:{int(VH * 0.9)}:force_original_aspect_ratio=decrease[fg];"
                "[bg][fg]overlay=(W-w)/2:(H-h)/2"
            ),
            "-frames:v",
            "1",
            "-q:v",
            "2",
            str(dest),
        ]
    )


def mp4(stills: list[Path], dest: Path, hold: float = 0.7) -> None:
    tmp = Path(tempfile.mkdtemp(prefix="cf-jacks-"))
    scaled: list[Path] = []
    for i, s in enumerate(stills):
        p = tmp / f"{i:02d}.jpg"
        fill_45(s, p)
        scaled.append(p)
    seq = scaled + list(reversed(scaled[1:-1]))
    while len(seq) * hold < 5.8:
        seq = seq + seq
    seq = seq[: max(6, int(6.2 / hold) + 1)]
    lst = tmp / "list.txt"
    lines: list[str] = []
    for p in seq:
        lines.append(f"file '{p}'")
        lines.append(f"duration {hold}")
    lines.append(f"file '{seq[-1]}'")
    lst.write_text("\n".join(lines) + "\n")
    dest.parent.mkdir(parents=True, exist_ok=True)
    run(
        [
            "ffmpeg",
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(lst),
            "-vf",
            f"fps=24,format=yuv420p,scale={VW}:{VH}",
            "-t",
            "6.1",
            "-c:v",
            "libx264",
            "-crf",
            "20",
            "-preset",
            "fast",
            "-movflags",
            "+faststart",
            "-an",
            str(dest),
        ]
    )
    shutil.rmtree(tmp, ignore_errors=True)


def job(closed: str, opened: str, jpg: Path, video: Path) -> None:
    c = ASSETS / closed
    o = ASSETS / opened
    if not c.exists() or not o.exists():
        raise FileNotFoundError(c if not c.exists() else o)
    fill_45(c, jpg)
    mp4([c, o], video, hold=0.7)
    print(jpg, jpg.stat().st_size)
    print(video, video.stat().st_size)


job(
    "female-jacks-closed.png",
    "female-jacks-open.png",
    PUB / "jumping-jacks.jpg",
    PUB / "jumping-jacks.mp4",
)
job(
    "male-jacks-closed.png",
    "male-jacks-open.png",
    PUB / "male" / "jumping-jacks.jpg",
    PUB / "male" / "jumping-jacks.mp4",
)


def cover_45(src: Path, dest: Path, y_bias: float = 0.12) -> None:
    """Crunch-style 4:5: tight window around the person, then scale."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    run(
        [
            "ffmpeg",
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            str(src),
            "-vf",
            f"crop=920:1150:52:380,scale={VW}:{VH}",
            "-frames:v",
            "1",
            "-q:v",
            "2",
            str(dest),
        ]
    )


def mp4_cover(stills: list[Path], dest: Path, hold: float, y_bias: float) -> None:
    tmp = Path(tempfile.mkdtemp(prefix="cf-cover-"))
    scaled: list[Path] = []
    for i, s in enumerate(stills):
        p = tmp / f"{i:02d}.jpg"
        cover_45(s, p, y_bias)
        scaled.append(p)
    seq = scaled + list(reversed(scaled[1:-1]))
    while len(seq) * hold < 5.8:
        seq = seq + seq
    seq = seq[: max(6, int(6.2 / hold) + 1)]
    lst = tmp / "list.txt"
    lines: list[str] = []
    for p in seq:
        lines.append(f"file '{p}'")
        lines.append(f"duration {hold}")
    lines.append(f"file '{seq[-1]}'")
    lst.write_text("\n".join(lines) + "\n")
    dest.parent.mkdir(parents=True, exist_ok=True)
    run(
        [
            "ffmpeg",
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(lst),
            "-vf",
            f"fps=24,format=yuv420p,scale={VW}:{VH}",
            "-t",
            "6.1",
            "-c:v",
            "libx264",
            "-crf",
            "20",
            "-preset",
            "fast",
            "-movflags",
            "+faststart",
            "-an",
            str(dest),
        ]
    )
    shutil.rmtree(tmp, ignore_errors=True)


# Crunch still had a huge ceiling after the 4:5 CSS crop — zoom to the person.
cover_45(ASSETS / "female-crunch-b.png", PUB / "crunch.jpg", 0.12)
mp4_cover(
    [ASSETS / "female-crunch-a.png", ASSETS / "female-crunch-b.png"],
    PUB / "crunch.mp4",
    0.85,
    0.12,
)
if (ASSETS / "male-crunch-b.png").exists():
    cover_45(ASSETS / "male-crunch-b.png", PUB / "male" / "crunch.jpg", 0.12)
    mp4_cover(
        [ASSETS / "male-crunch-a.png", ASSETS / "male-crunch-b.png"],
        PUB / "male" / "crunch.mp4",
        0.85,
        0.12,
    )

print("ok")
