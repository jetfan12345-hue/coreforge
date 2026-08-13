# CoreForge — handoff for the next Build session

Read this before changing anything. The user wants **accurate exercise demos**, a **consistent hot fitness-model look**, and a **polished circuit app** (not a scaffold).

## Product

CoreForge is a follow-along core / abs trainer.

Session shape (every program):

1. **Warmup** (1 pass) — jumping jacks, mountain climbers
2. **Work circuit** — 6–8 moves in a row, repeat 2–3 rounds (mix of timed holds and reps)
3. **Cooldown** (1 pass) — cobra stretch, prone T

Gear-aware programs: bodyweight by default; barbell / plates / cable / pull-up bar / ab wheel / dumbbells / **resistance bands** / bench unlock extra moves (Pallof, woodchop, rollouts, hanging raises, etc.). Turning a tool on toasts the moves it unlocks.

## What the user already signed off on

- Male **or** female coach — labels are **Male / Female only** (no “ginger coach” / “blonde coach”).
- Male look: buff dude, curly **natural orange-red** hair + beard, big smile.
- Female look: hot fitness model, **same physique every clip**, skimpy / fitted athletic wear, **hella sweaty**, outfits can vary.
- Calories (not kcal).
- Hip shift **deleted**.
- Cross-body mountain climber **deleted**.
- Side plank hip dip is **two exercises**: left and right.
- Finish overlay + **confetti**; extra love for a **2-day streak**.
- Trash talk: **female coach only**, **on-screen lines** (huge library: funny / mean-funny / mid-set bite / finish gloat / 2-day extra love). Voice is “keep going don’t be a pussy,” not corporate gym-bro. Speech synthesis was **removed**. **Do not play MP3s** — if they sound robotic or male they break the product. Text is the product.
- Bird dog = true bird dog (quadruped, opposite arm + opposite leg), alternate sides, then loop. Ankle-reach on the back is **not** bird dog.
- Penguin crunch is the heel-reach move: supine, knees bent, feet flat, reach side to side toward heels. **Heel-touch was deleted** as a duplicate of penguin.
- Dead bug: supine, tabletop, **opposite** arm + opposite leg extend toward the floor, then switch. Not a sit-up, not a hollow rock.
- Crunch: small spinal flexion only — **not** a sit-up.
- Sit-up: starts on the floor and comes all the way up.
- Flutter kick, reverse crunch, V-up, hollow hold, plank shoulder tap, plank hip dip: form must match the written cues.
- Catalog stays tight. Dropped as duplicate / filler / posterior padding: heel-touch, scissors (near flutter), long-arm crunch, toe-touch crunch, swimmer (not in abs circuits). Prefer fewer correct moves.

## Known form / media debt

Audited 2026-08-13. Penguin is a distinct heel-reach demo. Dead bug, flutter kick, reverse crunch, V-up, plank shoulder tap, and plank hip dip were rebuilt so the *motion* matches the cues. Crunch ROM and hollow hold were verified. Male coach covers the beginner circuit (incl. dead bug, penguin, prone T).

Media lives in `public/exercises/{id}.jpg|.mp4` (female) and `public/exercises/male/` (male, incomplete beyond beginner — UI falls back to female on 404). Cache-bust with the `V` constant in `src/data/exercises.ts`.

**Identity lock:** keep physique + face consistent. Do not regenerate a shredded model in one clip and a soft model in the next. Prefer editing from an identity-lock still, then image-to-video.

## Architecture notes

- TanStack Start. `vite.config.ts` must stay standalone (no vendored `vite-tanstack-config`). Gate `nitro({ preset: "vercel" })` on `command === "build"` so dev stays on a single port.
- Public live copy for Don (click this): **https://black-tree-1904.zerodeploy.app/** — static SPA, form demos, trash talk, cinema player. Lasts until 16 Aug 2026 unless Pages is on.
- Lasting URL: **https://jetfan12345-hue.github.io/coreforge/** — `npm run build:pages` + `.github/workflows/pages.yml` publishes `gh-pages`. GitHub blocks apps from *enabling* Pages; once the repo owner sets Settings → Pages → source **GitHub Actions** or branch **gh-pages**, that URL is the app. Nested routes use hash (`#/workout`). `npm run dev` / Vercel nitro build are unchanged.
- Persist profile in Zustand (`src/store/fitness.ts`). `demoModel` and `coachTrashTalk` merge on rehydrate.
- `resolveExerciseMedia()` switches male/female paths.
- Workout player is cinema mode (no bottom nav). Coach lines overlay the demo. `src/lib/coach-audio.ts` is a no-op on purpose.
- Do not re-scaffold. Edit in place. Leave the dev server running.

## How to continue

1. Clone this repo into the Build workspace.
2. `npm install` if needed, write `startup.sh`, `npm run dev` on `0.0.0.0:8080`.
3. Open the app, flip Male/Female, play beginner circuit, watch every demo.
4. Fix form videos that still don’t match the table above.
5. Then polish: UX, programs, sweatier consistent models, celebration, trash talk quality.

Do **not** ask the user to run commands. Speak in product terms.
