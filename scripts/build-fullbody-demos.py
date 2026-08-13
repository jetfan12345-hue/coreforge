#!/usr/bin/env python3
"""Build ~6s full-body 9:16 looping demos from identity-locked stills."""
from __future__ import annotations

import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path("/workspace")
ASSETS = Path("/opt/cursor/artifacts/assets")
GEN = ROOT / "screenshots/gen"
PUB = ROOT / "public/exercises"
MALE = PUB / "male"
AFTER = ROOT / "screenshots/after"
TMP = Path(tempfile.mkdtemp(prefix="cf-fullbody-"))

VW, VH = 400, 736


def run(args: list[str]) -> None:
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit(f"cmd failed ({r.returncode}): {' '.join(args)}\n{r.stderr}")


def grab(name: str) -> Path:
    src = ASSETS / name
    if not src.exists():
        raise FileNotFoundError(src)
    dest = GEN / name
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)
    return dest


def to_jpeg(src: Path, dest: Path) -> Path:
    im = Image.open(src).convert("RGB")
    im = ImageOps.fit(im, (VW, VH), Image.Resampling.LANCZOS, centering=(0.5, 0.5))
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "JPEG", quality=90, optimize=True)
    return dest


def hflip(src: Path, dest: Path) -> Path:
    Image.open(src).convert("RGB").transpose(Image.Transpose.FLIP_LEFT_RIGHT).save(
        dest, "JPEG", quality=92, optimize=True
    )
    return dest


def mp4(stills: list[Path], dest: Path, hold: float = 0.85) -> None:
    scaled: list[Path] = []
    for i, s in enumerate(stills):
        p = TMP / f"{dest.stem}-{i}.jpg"
        to_jpeg(s, p)
        scaled.append(p)
    if len(scaled) == 1:
        seq = scaled
        hold = max(hold, 6.0)
    else:
        seq = scaled + list(reversed(scaled[1:-1]))
        while len(seq) * hold < 5.8:
            seq = seq + seq
        seq = seq[: max(6, int(6.2 / hold) + 1)]
    lst = TMP / f"{dest.stem}.txt"
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


def letterbox_existing(src: Path, dest: Path) -> None:
    """Pad any remaining clip into 9:16 so the player never crops the person."""
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
            f"scale={VW}:{VH}:force_original_aspect_ratio=decrease,pad={VW}:{VH}:(ow-iw)/2:(oh-ih)/2:black,fps=24,format=yuv420p",
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


GEN.mkdir(parents=True, exist_ok=True)
AFTER.mkdir(parents=True, exist_ok=True)

# --- female ---
print("female…")
f_jacks_c = grab("female-jacks-closed.png")
f_jacks_o = grab("female-jacks-open.png")
to_jpeg(f_jacks_c, PUB / "jumping-jacks.jpg")
mp4([f_jacks_c, f_jacks_o], PUB / "jumping-jacks.mp4", hold=0.7)

f_cl_a = grab("female-climber-a.png")
f_cl_b = grab("female-climber-b.png")
to_jpeg(f_cl_a, PUB / "mountain-climber.jpg")
mp4([f_cl_a, f_cl_b], PUB / "mountain-climber.mp4", hold=0.7)

f_plank = grab("female-plank.png")
to_jpeg(f_plank, PUB / "plank.jpg")
mp4([f_plank], PUB / "plank.mp4")

f_cr_a = grab("female-crunch-a.png")
f_cr_b = grab("female-crunch-b.png")
to_jpeg(f_cr_b, PUB / "crunch.jpg")
mp4([f_cr_a, f_cr_b], PUB / "crunch.mp4", hold=0.85)

f_bi_a = grab("female-bicycle-a.png")
f_bi_b = grab("female-bicycle-b.png")
to_jpeg(f_bi_a, PUB / "bicycle-crunch.jpg")
mp4([f_bi_a, f_bi_b], PUB / "bicycle-crunch.mp4", hold=0.7)

f_hollow = grab("female-hollow.png")
to_jpeg(f_hollow, PUB / "hollow-hold.jpg")
mp4([f_hollow], PUB / "hollow-hold.mp4")

f_fl_a = grab("female-flutter-a.png")
f_fl_b = grab("female-flutter-b.png")
to_jpeg(f_fl_a, PUB / "flutter-kick.jpg")
mp4([f_fl_a, f_fl_b], PUB / "flutter-kick.mp4", hold=0.55)

f_cobra = grab("female-cobra.png")
to_jpeg(f_cobra, PUB / "cobra-stretch.jpg")
mp4([f_cobra], PUB / "cobra-stretch.mp4")

f_db_a = grab("female-deadbug-a.png")
f_db_b = grab("female-deadbug-b.png")
f_db_b_flip = TMP / "female-deadbug-b-flip.jpg"
hflip(f_db_b, f_db_b_flip)
to_jpeg(f_db_a, PUB / "dead-bug.jpg")
mp4([f_db_a, f_db_b, f_db_a, f_db_b_flip], PUB / "dead-bug.mp4", hold=0.8)

f_pen_r = grab("female-penguin-r.png")
f_pen_l = grab("female-penguin-l.png")
to_jpeg(f_pen_r, PUB / "penguin-crunch.jpg")
mp4([f_pen_r, f_cr_a, f_pen_l], PUB / "penguin-crunch.mp4", hold=0.75)

f_bd_a = grab("female-birddog-a.png")
f_bd_b = grab("female-birddog-b.png")
f_bd_b_flip = TMP / "female-birddog-b-flip.jpg"
hflip(f_bd_b, f_bd_b_flip)
to_jpeg(f_bd_b, PUB / "bird-dog.jpg")
mp4([f_bd_a, f_bd_b, f_bd_a, f_bd_b_flip], PUB / "bird-dog.mp4", hold=0.8)

f_lr_a = grab("female-legraise-a.png")
f_lr_b = grab("female-legraise-b.png")
to_jpeg(f_lr_b, PUB / "leg-raise.jpg")
mp4([f_lr_a, f_lr_b], PUB / "leg-raise.mp4", hold=0.9)

f_prone = grab("female-prone-t.png")
to_jpeg(f_prone, PUB / "prone-t.jpg")
mp4([f_prone], PUB / "prone-t.mp4")

f_rev_a = grab("female-reverse-a.png")
f_rev_b = grab("female-reverse-b.png")
to_jpeg(f_rev_b, PUB / "reverse-crunch.jpg")
mp4([f_rev_a, f_rev_b], PUB / "reverse-crunch.mp4", hold=0.85)

f_v_a = grab("female-vup-a.png")
f_v_b = grab("female-vup-b.png")
to_jpeg(f_v_b, PUB / "v-up.jpg")
mp4([f_v_a, f_v_b], PUB / "v-up.mp4", hold=0.85)

f_sit_b = grab("female-situp-b.png")
to_jpeg(f_sit_b, PUB / "sit-up.jpg")
mp4([f_cr_a, f_sit_b], PUB / "sit-up.mp4", hold=0.9)

f_side = grab("female-sideplank.png")
to_jpeg(f_side, PUB / "side-plank.jpg")
mp4([f_side], PUB / "side-plank.mp4")

f_hd_r = grab("female-hipdip-r.png")
f_hd_l = grab("female-hipdip-l.png")
to_jpeg(f_hd_r, PUB / "plank-hip-dip.jpg")
mp4([f_hd_r, f_hd_l], PUB / "plank-hip-dip.mp4", hold=0.8)
to_jpeg(f_hd_l, PUB / "side-plank-hip-dip-left.jpg")
mp4([f_side, f_hd_l], PUB / "side-plank-hip-dip-left.mp4", hold=0.85)
to_jpeg(f_hd_r, PUB / "side-plank-hip-dip-right.jpg")
mp4([f_side, f_hd_r], PUB / "side-plank-hip-dip-right.mp4", hold=0.85)

f_tap = grab("female-shouldertap.png")
f_tap_flip = TMP / "female-shouldertap-flip.jpg"
hflip(f_tap, f_tap_flip)
to_jpeg(f_tap, PUB / "plank-shoulder-tap.jpg")
mp4([f_plank, f_tap, f_plank, f_tap_flip], PUB / "plank-shoulder-tap.mp4", hold=0.7)

# --- male ---
print("male…")
m_jacks_c = grab("male-jacks-closed.png")
m_jacks_o = grab("male-jacks-open.png")
to_jpeg(m_jacks_c, MALE / "jumping-jacks.jpg")
mp4([m_jacks_c, m_jacks_o], MALE / "jumping-jacks.mp4", hold=0.7)

m_cl_a = grab("male-climber-a.png")
m_cl_b = grab("male-climber-b.png")
to_jpeg(m_cl_a, MALE / "mountain-climber.jpg")
mp4([m_cl_a, m_cl_b], MALE / "mountain-climber.mp4", hold=0.7)

m_plank = grab("male-plank.png")
to_jpeg(m_plank, MALE / "plank.jpg")
mp4([m_plank], MALE / "plank.mp4")

m_cr_a = grab("male-crunch-a.png")
m_cr_b = grab("male-crunch-b.png")
to_jpeg(m_cr_b, MALE / "crunch.jpg")
mp4([m_cr_a, m_cr_b], MALE / "crunch.mp4", hold=0.85)

m_cobra = grab("male-cobra.png")
to_jpeg(m_cobra, MALE / "cobra-stretch.jpg")
mp4([m_cobra], MALE / "cobra-stretch.mp4")

m_db_a = grab("male-deadbug-a.png")
m_db_b = grab("male-deadbug-b.png")
m_db_b_flip = TMP / "male-deadbug-b-flip.jpg"
hflip(m_db_b, m_db_b_flip)
to_jpeg(m_db_a, MALE / "dead-bug.jpg")
mp4([m_db_a, m_db_b, m_db_a, m_db_b_flip], MALE / "dead-bug.mp4", hold=0.8)

m_pen = grab("male-penguin.png")
m_pen_flip = TMP / "male-penguin-flip.jpg"
hflip(m_pen, m_pen_flip)
to_jpeg(m_pen, MALE / "penguin-crunch.jpg")
mp4([m_pen, m_pen_flip], MALE / "penguin-crunch.mp4", hold=0.8)

m_bd_a = grab("male-birddog-a.png")
m_bd_b = grab("male-birddog-b.png")
m_bd_b_flip = TMP / "male-birddog-b-flip.jpg"
hflip(m_bd_b, m_bd_b_flip)
to_jpeg(m_bd_b, MALE / "bird-dog.jpg")
mp4([m_bd_a, m_bd_b, m_bd_a, m_bd_b_flip], MALE / "bird-dog.mp4", hold=0.8)

m_lr_a = grab("male-legraise-a.png")
m_lr_b = grab("male-legraise-b.png")
to_jpeg(m_lr_b, MALE / "leg-raise.jpg")
mp4([m_lr_a, m_lr_b], MALE / "leg-raise.mp4", hold=0.9)

m_prone = grab("male-prone-t.png")
to_jpeg(m_prone, MALE / "prone-t.jpg")
mp4([m_prone], MALE / "prone-t.mp4")

# Letterbox leftover female clips that we did not rebuild, so 9:16 contain never chops.
rebuilt = {
    "jumping-jacks",
    "mountain-climber",
    "plank",
    "crunch",
    "bicycle-crunch",
    "hollow-hold",
    "flutter-kick",
    "cobra-stretch",
    "dead-bug",
    "penguin-crunch",
    "bird-dog",
    "leg-raise",
    "prone-t",
    "reverse-crunch",
    "v-up",
    "sit-up",
    "side-plank",
    "plank-hip-dip",
    "side-plank-hip-dip-left",
    "side-plank-hip-dip-right",
    "plank-shoulder-tap",
}
print("letterbox leftovers…")
for f in sorted(PUB.glob("*.mp4")):
    if f.stem in rebuilt:
        continue
    tmp = TMP / f"lb-{f.name}"
    letterbox_existing(f, tmp)
    shutil.move(tmp, f)

# After stills for the PR
to_jpeg(f_jacks_o, AFTER / "jumping-jacks.jpg")
to_jpeg(m_jacks_o, AFTER / "male-jumping-jacks.jpg")
to_jpeg(f_cl_a, AFTER / "mountain-climber.jpg")
to_jpeg(f_plank, AFTER / "plank.jpg")
to_jpeg(f_bi_a, AFTER / "bicycle-crunch.jpg")
to_jpeg(f_hollow, AFTER / "hollow-hold.jpg")
to_jpeg(f_fl_a, AFTER / "flutter-kick.jpg")

print("ok")
for p in [
    PUB / "jumping-jacks.mp4",
    PUB / "mountain-climber.mp4",
    MALE / "jumping-jacks.mp4",
    PUB / "plank.mp4",
]:
    print(p.relative_to(ROOT), p.stat().st_size, end=" ")
    dur = subprocess.check_output(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=nw=1:nk=1",
            str(p),
        ],
        text=True,
    ).strip()
    print(dur)
