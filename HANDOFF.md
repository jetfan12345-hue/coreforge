# CoreForge — handoff for the next Build session

Read this before changing anything. The user wants **accurate exercise demos**, a **consistent hot fitness-model look**, and a **polished circuit app** (not a scaffold).

## Product

CoreForge is a follow-along core / abs trainer.

Session shape (every program):

1. **Warmup** (1 pass) — jumping jacks, mountain climbers
2. **Work circuit** — 6–8 moves in a row, repeat 2–3 rounds (mix of timed holds and reps)
3. **Cooldown** (1 pass) — cobra stretch, prone T

Gear-aware programs: bodyweight by default; barbell / plates / cable / pull-up bar / ab wheel / dumbbells / **resistance bands** / bench unlock extra moves (Pallof, woodchop, rollouts, hanging raises, etc.).

## What the user already signed off on

- Male **or** female coach — labels are **Male / Female only** (no “ginger coach” / “blonde coach”).
- Male look: buff dude, curly **natural orange-red** hair + beard, big smile.
- Female look: hot fitness model, **same physique every clip**, skimpy / fitted athletic wear, **hella sweaty**, outfits can vary.
- Calories (not kcal).
- Hip shift **deleted**.
- Cross-body mountain climber **deleted**.
- Side plank hip dip is **two exercises**: left and right.
- Finish overlay + **confetti**; extra love for a **2-day streak**.
- Trash talk: **female coach only**, on-screen lines like “keep going don’t be a pussy”. Speech synthesis was **removed** because it sounded like a digital dude. There are optional MP3s under `public/audio/coach/` — only use them if they actually sound like a hot English-accent woman. If they sound robotic/male, do not play them.
- Bird dog = true bird dog (quadruped, opposite arm + opposite leg), alternate sides, then loop. Ankle-reach on the back is **not** bird dog.
- Penguin crunch (aka heel-touch / “penguins”) is a **separate** move: supine, knees bent, feet flat, reach side to side toward heels. If the demo is still wrong, **delete it** rather than ship a bad pose.
- Dead bug: supine, tabletop, **opposite** arm + opposite leg extend toward the floor, then switch. Not a sit-up, not a hollow rock.
- Crunch: small spinal flexion only — **not** a sit-up. Long-arm crunch same idea, arms overhead, tiny lift.
- Sit-up: starts on the floor and comes all the way up.
- Flutter kick, reverse crunch, V-up, hollow rock, heel touch, plank shoulder tap, plank hip dip: form must match the written cues.

## Known form / media debt (fix these first if reviewing)

Audited 2026-08-13. Penguin is a distinct heel-reach demo (no longer a copy of heel-touch). Dead bug, flutter kick, reverse crunch, V-up, plank shoulder tap, and plank hip dip were rebuilt so the *motion* matches the cues. Crunch ROM and hollow hold were verified as matching the written form. Male coach now covers the beginner circuit (incl. dead bug, penguin, prone T).

Media lives in `public/exercises/{id}.jpg|.mp4` (female) and `public/exercises/male/` (male, incomplete beyond beginner — UI falls back to female on 404). Cache-bust with the `V` constant in `src/data/exercises.ts`.

**Identity lock:** keep physique + face consistent. Do not regenerate a shredded model in one clip and a soft model in the next. Prefer editing from an identity-lock still, then image-to-video.

## Architecture notes

- TanStack Start. `vite.config.ts` must stay standalone (no vendored `vite-tanstack-config`). Gate `nitro({ preset: "vercel" })` on `command === "build"` so dev stays on a single port.
- Preview / sandbox: listen on `0.0.0.0:8080`. Own `/workspace/startup.sh` (idempotent).
- Persist profile in Zustand (`src/store/fitness.ts`). `demoModel` and `coachTrashTalk` merge on rehydrate.
- `resolveExerciseMedia()` switches male/female paths.
- Do not re-scaffold. Edit in place. Leave the dev server running.

## How to continue

1. Clone this repo into the Build workspace.
2. `npm install` if needed, write `startup.sh`, `npm run dev` on `0.0.0.0:8080`.
3. Open the app, flip Male/Female, play beginner circuit, watch every demo.
4. Fix form videos that still don’t match the table above.
5. Then polish: UX, programs, sweatier consistent models, celebration, trash talk quality.

Do **not** ask the user to run commands. Speak in product terms.
