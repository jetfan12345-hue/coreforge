# CoreForge — handoff for the next Build session

Read this before changing anything. The user wants **accurate exercise demos**, a **consistent hot fitness-model look**, and a **polished circuit app** (not a scaffold).

## Product

CoreForge is a follow-along core / abs trainer. Mainstream abs-app feel (Caynax / Leap Fitness “Abs Workout”). Trash talk is an **option**, not the personality of the whole product.

Session shape (every program):

1. **Warmup** (1 pass) — jumping jacks, mountain climbers
2. **Work circuit** — **6** moves in a row, repeat 2–3 rounds (mix of timed holds and reps)
3. **Cooldown** (1 pass) — cobra stretch, prone T

~10–15 min Month 1, ~15–20 min Month 2.

Gear-aware **Advanced overload only**: barbell / plates / cable / pull-up bar / ab wheel / dumbbells / **resistance bands** / bench unlock extra moves. Gear lives in **You** (profile), not on Home.

## First-run

- **Get to it** — train now: beginner / floor / female / trash talk **off**. Lands on Home with one Start button.
- **Enter some details** — optional gear, Male/Female, trash talk, stats.
- Never a 3-step quiz.

## Trash talk

- **Off by default.** Female coach only when it is on. Same funny/mean library in `src/data/coach-lines.ts`.
- Default chrome, Home, onboarding, and player: clean / professional. No roast copy in your face.
- “Forge / don’t be a pussy” stays **only** inside optional coach lines, never default UI.
- Toggle lives in **You** (and Enter some details). When on + Female, play `public/audio/coach/{id}.mp3` (ara, ids from `coach-lines.ts`) via `coachAudioUrl` / `playCoachLineById`. Missing files → text only. Never play old `line-NN.mp3` clips. Male or roast off → silence.

## Circuits (balanced 6)

Each work block covers brace, flexion (crunch **or** sit-up), lower abs (reverse crunch — not stacked with flutter / leg raise), one rotation **or** anti-rotation, and **one** lateral/oblique slot (not left + right as two slots).

### Month 1 (2 rounds weeks 1–2, 3 rounds weeks 3–4)

- **Week 1 Foundations** — dead bug, crunch, reverse crunch, bird dog, penguin (heel reach), plank
- **Week 2 Add rotation** — dead bug, crunch, reverse crunch, bicycle, side plank, plank
- **Week 3 Longer density** — hollow, sit-up, reverse crunch, shoulder taps, side plank, plank
- **Week 4 Bridge** — hollow, sit-up, reverse crunch, bicycle, side plank, plank

### Month 2 (3 rounds)

- **Week 1 Density** — hollow, crunch, reverse crunch, bicycle, alternating hip dips, plank
- **Week 2 Brace + sit-up** — dead bug, sit-up, reverse crunch, bicycle, side plank, hollow
- **Week 3 Full control** — hollow, sit-up, reverse crunch, shoulder taps, hip dips, plank
- **Week 4 Peak week** — hollow, sit-up, reverse crunch, windshield wiper, hip dips, plank

### Advanced (3 rounds)

- hollow, dragon flag, reverse crunch, windshield wiper, hip dips, shoulder taps
- Optional gear overload from You

Do **not** put left and right side-plank hip dip as two circuit slots. Do **not** open Advanced with a crunch-family pile (v-up + tuck-up + flutter + bicycle). Warmup climbers already hit hip flexors — do not also stack leg raise + flutter + v-up.

## What the user already signed off on

- Male **or** female coach — labels are **Male / Female only** (no “ginger coach” / “blonde coach”).
- Male look: buff dude, curly **natural orange-red** hair + beard, big smile.
- Female look: hot fitness model, **same physique every clip**, skimpy / fitted athletic wear, **hella sweaty**, outfits can vary.
- Calories (not kcal).
- Hip shift **deleted**.
- Cross-body mountain climber **deleted**.
- Side plank hip dip exists as **two catalog exercises** (left and right) but circuits use **one** alternating hip dip or one side plank.
- Finish overlay + **confetti**; extra love for a **2-day streak**. Roast finish lines only when trash talk is on.
- Bird dog = true bird dog (quadruped, opposite arm + opposite leg), alternate sides, then loop. Ankle-reach on the back is **not** bird dog.
- Penguin crunch is the heel-reach move: supine, knees bent, feet flat, reach side to side toward heels. **Heel-touch was deleted** as a duplicate of penguin.
- Dead bug: supine, tabletop, **opposite** arm + opposite leg extend toward the floor, then switch. Not a sit-up, not a hollow rock.
- Crunch: small spinal flexion only — **not** a sit-up.
- Sit-up: starts on the floor and comes all the way up.
- Catalog stays tight. Dropped as duplicate / filler / posterior padding: heel-touch, scissors (near flutter), long-arm crunch, toe-touch crunch, swimmer (not in abs circuits). Prefer fewer correct moves.

## Known form / media debt

Audited 2026-08-13. Penguin is a distinct heel-reach demo. Dead bug, flutter kick, reverse crunch, V-up, plank shoulder tap, and plank hip dip were rebuilt so the *motion* matches the cues. Crunch ROM and hollow hold were verified. Male coach covers the beginner circuit (incl. dead bug, penguin, prone T).

Demos are ~**6s**, **whole person in frame** (jumping jacks: arms and all, ~5% headroom). Player is a **full-width 4:5 card**: still paints first, video fades on top when ready. Do not go back to a height-capped 9:16 letterbox.

Media lives in `public/exercises/{id}.jpg|.mp4` (female) and `public/exercises/male/` (male, incomplete beyond beginner — UI falls back to female on 404). Cache-bust with the `V` constant in `src/data/exercises.ts`.

**Identity lock:** keep physique + face consistent. Do not regenerate a shredded model in one clip and a soft model in the next. Prefer editing from an identity-lock still, then image-to-video.

## Architecture notes

- TanStack Start. `vite.config.ts` must stay standalone (no vendored `vite-tanstack-config`). Gate `nitro({ preset: "vercel" })` on `command === "build"` so dev stays on a single port.
- Lasting URL: **https://jetfan12345-hue.github.io/coreforge/** — `npm run build:pages` + `.github/workflows/pages.yml` publishes `gh-pages`. GitHub blocks apps from *enabling* Pages; once the repo owner sets Settings → Pages → source **GitHub Actions** or branch **gh-pages**, that URL is the app. Nested routes use hash (`#/workout`). `npm run dev` / Vercel nitro build are unchanged.
- Persist profile in Zustand (`src/store/fitness.ts`). `demoModel` and `coachTrashTalk` merge on rehydrate. Default `coachTrashTalk: false`.
- `resolveExerciseMedia()` switches male/female paths.
- Workout player is cinema mode (no bottom nav). Coach lines overlay the demo **only when trash talk is on**, and the matching ara clip plays if that `{id}.mp3` exists.
- Do not re-scaffold. Edit in place. Leave the dev server running.
- Do **not** deploy to ZeroDeploy from this workspace.

## How to continue

1. Clone this repo into the Build workspace.
2. `npm install` if needed, write `startup.sh`, `npm run dev` on `0.0.0.0:8080`.
3. Open the app: Get to it → Start circuit → follow jumping jacks full-body.
4. Confirm Home has one Start, Month 1 / Month 2 / Advanced, no gear/rest wall.
5. Then polish: form videos, sweatier consistent models, celebration.

Do **not** ask the user to run commands. Speak in product terms.
