# CoreForge

Circuit-style core training app: warmup → 6–8 work moves × rounds → cooldown stretches. Male or female demo coach, timed + rep moves, gear-aware programs, finish confetti, optional trash-talk coach.

## Stack

React 19 · TypeScript · Vite · TanStack Start / Router · Tailwind v4 · Zustand

## Run

```bash
npm install
npm run dev      # 0.0.0.0:8080
npm run build
npm run typecheck
```

## Share with Grok Build

Open a **new Grok Build** chat and paste:

> Clone https://github.com/jetfan12345-hue/coreforge and continue from HANDOFF.md. This is CoreForge, my abs / core training app. Review the whole project, run it, and make it more awesome.

That repo is the source of truth for another Build session.

## App map

| Path | What |
| --- | --- |
| `src/data/exercises.ts` | Exercise catalog + media resolver |
| `src/data/programs.ts` | Beginner / intermediate / advanced + warmup / cooldown |
| `src/data/coach-lines.ts` | Trash-talk lines |
| `src/store/fitness.ts` | Profile, history, active workout |
| `src/routes/workout.tsx` | Player, celebration, trash talk |
| `src/routes/profile.tsx` | Male/Female coach + trash-talk toggle |
| `public/exercises/` | Female demo stills + videos |
| `public/exercises/male/` | Male demo stills + videos |
| `public/audio/coach/` | Optional trash-talk clips |

See [HANDOFF.md](./HANDOFF.md) for current product state and open issues.
