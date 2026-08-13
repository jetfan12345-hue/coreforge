#!/usr/bin/env python3
"""Build looping form demos from identity-locked stills (concat slideshow)."""
from __future__ import annotations

import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path("/workspace")
GEN = ROOT / "screenshots/gen"
PUB = ROOT / "public/exercises"
MALE = PUB / "male"
TMP = Path(tempfile.mkdtemp(prefix="cf-demo-"))

VW, VH = 400, 736
LW, LH = 672, 448


def run(args: list[str]) -> None:
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit(f"cmd failed ({r.returncode}): {' '.join(args)}\n{r.stderr}")


def to_jpeg(src: Path, dest: Path, w: int, h: int) -> Path:
    im = Image.open(src).convert("RGB")
    im = ImageOps.fit(im, (w, h), Image.Resampling.LANCZOS, centering=(0.5, 0.45))
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "JPEG", quality=90, optimize=True)
    return dest


def hflip(src: Path, dest: Path) -> Path:
    Image.open(src).convert("RGB").transpose(Image.Transpose.FLIP_LEFT_RIGHT).save(
        dest, "JPEG", quality=92, optimize=True
    )
    return dest


def mp4(stills: list[Path], dest: Path, w: int, h: int, hold: float = 1.15) -> None:
    scaled: list[Path] = []
    for i, s in enumerate(stills):
        p = TMP / f"{dest.stem}-{i}.jpg"
        to_jpeg(s, p, w, h)
        scaled.append(p)
    # ping-pong, then repeat until ~6s
    if len(scaled) == 1:
        seq = scaled
        hold = max(hold, 4.0)
    else:
        seq = scaled + list(reversed(scaled[1:-1]))
        while len(seq) * hold < 5.5:
            seq = seq + seq
    lst = TMP / f"{dest.stem}.txt"
    lines: list[str] = []
    for p in seq:
        lines.append(f"file '{p}'")
        lines.append(f"duration {hold}")
    # concat demuxer needs the last file repeated
    lines.append(f"file '{seq[-1]}'")
    lst.write_text("\n".join(lines) + "\n")
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
            f"fps=24,format=yuv420p,scale={w}:{h}",
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


def kenburns(still: Path, dest: Path, w: int, h: int, seconds: float = 4.0) -> None:
    jpg = TMP / f"{dest.stem}-kb.jpg"
    to_jpeg(still, jpg, w, h)
    frames = int(24 * seconds)
    run(
        [
            "ffmpeg",
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-loop",
            "1",
            "-i",
            str(jpg),
            "-vf",
            f"scale={w * 2}:{h * 2},zoompan=z='min(zoom+0.0006,1.06)':d={frames}:s={w}x{h}:fps=24,format=yuv420p",
            "-t",
            str(seconds),
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


# --- flips ---
hflip(GEN / "penguin-reach-right.jpg", GEN / "penguin-reach-left-flip.jpg")
hflip(GEN / "deadbug-opp-b.jpg", GEN / "deadbug-opp-b-flip.jpg")
hflip(GEN / "shoulder-tap-l.jpg", GEN / "shoulder-tap-r.jpg")
hflip(GEN / "hipdip-right.jpg", GEN / "hipdip-left-flip.jpg")
hflip(GEN / "male-deadbug-opp.jpg", GEN / "male-deadbug-opp-flip.jpg")
hflip(GEN / "male-penguin.jpg", GEN / "male-penguin-flip.jpg")

# Bird-dog extension from the original clip (audit still), not the rebuilt slideshow.
bird_ext_src = ROOT / "screenshots/audit/bird-dog-t90.jpg"
if bird_ext_src.exists():
    Image.open(bird_ext_src).convert("RGB").save(GEN / "bird-dog-extend.jpg", "JPEG", quality=92)
hflip(GEN / "bird-dog-extend.jpg", GEN / "bird-dog-extend-flip.jpg")

print("female…")
to_jpeg(GEN / "penguin-reach-right.jpg", PUB / "penguin-crunch.jpg", VW, VH)
mp4(
    [
        PUB / "heel-touch.jpg",
        GEN / "penguin-reach-right.jpg",
        PUB / "heel-touch.jpg",
        GEN / "penguin-reach-left-flip.jpg",
    ],
    PUB / "penguin-crunch.mp4",
    VW,
    VH,
)

to_jpeg(GEN / "deadbug-start.jpg", PUB / "dead-bug.jpg", VW, VH)
mp4(
    [
        GEN / "deadbug-start.jpg",
        GEN / "deadbug-opp-b.jpg",
        GEN / "deadbug-start.jpg",
        GEN / "deadbug-opp-b-flip.jpg",
    ],
    PUB / "dead-bug.mp4",
    VW,
    VH,
)

to_jpeg(GEN / "flutter-a.jpg", PUB / "flutter-kick.jpg", LW, LH)
mp4(
    [GEN / "flutter-a.jpg", GEN / "flutter-b.jpg"],
    PUB / "flutter-kick.mp4",
    LW,
    LH,
    hold=0.7,
)

to_jpeg(GEN / "reverse-peak.jpg", PUB / "reverse-crunch.jpg", LW, LH)
mp4(
    [GEN / "reverse-start.jpg", GEN / "reverse-peak.jpg"],
    PUB / "reverse-crunch.mp4",
    LW,
    LH,
)

# V-up: keep a copy of the original flat start before overwriting the poster
vup_start = TMP / "vup-start-orig.jpg"
Image.open(ROOT / "screenshots/before/v-up.jpg").convert("RGB").save(
    vup_start, "JPEG", quality=92
)
to_jpeg(GEN / "vup-peak.jpg", PUB / "v-up.jpg", VW, VH)
mp4([vup_start, GEN / "vup-peak.jpg"], PUB / "v-up.mp4", VW, VH)

to_jpeg(GEN / "shoulder-tap-l.jpg", PUB / "plank-shoulder-tap.jpg", LW, LH)
mp4(
    [
        ROOT / "screenshots/before/plank-shoulder-tap.jpg",
        GEN / "shoulder-tap-l.jpg",
        ROOT / "screenshots/before/plank-shoulder-tap.jpg",
        GEN / "shoulder-tap-r.jpg",
    ],
    PUB / "plank-shoulder-tap.mp4",
    LW,
    LH,
)

to_jpeg(GEN / "hipdip-right.jpg", PUB / "plank-hip-dip.jpg", VW, VH)
mp4(
    [GEN / "hipdip-right.jpg", GEN / "hipdip-left-flip.jpg"],
    PUB / "plank-hip-dip.mp4",
    VW,
    VH,
)

# Bird dog from original still + extension
bird_start = ROOT / "screenshots/before/bird-dog.jpg"
mp4(
    [
        bird_start,
        GEN / "bird-dog-extend.jpg",
        bird_start,
        GEN / "bird-dog-extend-flip.jpg",
    ],
    PUB / "bird-dog.mp4",
    LW,
    LH,
)

print("male…")
to_jpeg(GEN / "male-deadbug-start.jpg", MALE / "dead-bug.jpg", VW, VH)
mp4(
    [
        GEN / "male-deadbug-start.jpg",
        GEN / "male-deadbug-opp.jpg",
        GEN / "male-deadbug-start.jpg",
        GEN / "male-deadbug-opp-flip.jpg",
    ],
    MALE / "dead-bug.mp4",
    VW,
    VH,
)

to_jpeg(GEN / "male-penguin.jpg", MALE / "penguin-crunch.jpg", VW, VH)
mp4(
    [GEN / "male-penguin.jpg", GEN / "male-penguin-flip.jpg"],
    MALE / "penguin-crunch.mp4",
    VW,
    VH,
)

to_jpeg(GEN / "male-prone-t.jpg", MALE / "prone-t.jpg", LW, LH)
try:
    kenburns(GEN / "male-prone-t.jpg", MALE / "prone-t.mp4", LW, LH)
except SystemExit:
    mp4([GEN / "male-prone-t.jpg"], MALE / "prone-t.mp4", LW, LH, hold=4.0)

print("ok", TMP)
for p in [
    PUB / "penguin-crunch.mp4",
    PUB / "dead-bug.mp4",
    MALE / "dead-bug.mp4",
    MALE / "penguin-crunch.mp4",
    MALE / "prone-t.mp4",
]:
    print(p.name, p.stat().st_size)
