import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Lightbulb,
  SkipForward,
  RefreshCw,
  Play,
  Pause,
  PartyPopper,
} from "lucide-react";
import { getExercise, estimateExerciseCalories, type Exercise } from "@/data/exercises";
import {
  FINISH_LINES,
  STREAK_LINES,
  TRASH_TALK_LINES,
  pickLine,
  pickLineIndex,
} from "@/data/coach-lines";
import {
  unlockCoachAudio,
  playCoachLine,
  preloadCoachAudio,
  isCoachAudioUnlocked,
} from "@/lib/coach-audio";
import { ExerciseMedia } from "@/components/fitness/exercise-media";
import { ConfettiBurst } from "@/components/fitness/confetti";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFitnessStore } from "@/store/fitness";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/workout")({
  component: WorkoutPage,
});

const REST_PRESETS = [5, 10, 15, 20] as const;

type CelebrateState = {
  calories: number;
  streak: number;
  skipped: number;
  headline: string;
  sub: string;
};

function WorkoutPage() {
  const navigate = useNavigate();
  const active = useFitnessStore((s) => s.active);
  const bodyKg = useFitnessStore((s) => s.bodyWeightKg());
  const restPreference = useFitnessStore((s) => s.profile.restSeconds ?? 10);
  const coachTrashTalk = useFitnessStore(
    (s) => s.profile.coachTrashTalk ?? false,
  );
  const setRestSeconds = useFitnessStore((s) => s.setRestSeconds);
  const updateActiveSet = useFitnessStore((s) => s.updateActiveSet);
  const completeCurrentMove = useFitnessStore((s) => s.completeCurrentMove);
  const skipExercise = useFitnessStore((s) => s.skipExercise);
  const swapExercise = useFitnessStore((s) => s.swapExercise);
  const getAlternatives = useFitnessStore((s) => s.getAlternatives);
  const finishWorkout = useFitnessStore((s) => s.finishWorkout);
  const cancelWorkout = useFitnessStore((s) => s.cancelWorkout);
  const streakDaysFn = useFitnessStore((s) => s.streakDays);

  const [restLeft, setRestLeft] = useState(0);
  const [restKind, setRestKind] = useState<"move" | "round">("move");
  const [tipIndex, setTipIndex] = useState(0);
  const [swapOpen, setSwapOpen] = useState(false);
  const [workLeft, setWorkLeft] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [coachLine, setCoachLine] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState<CelebrateState | null>(null);
  const autoStarted = useRef<string | null>(null);
  const trashAt = useRef(0);
  const completingTimed = useRef(false);

  const current = active?.exercises[active.currentExerciseIndex];
  const exercise = current ? getExercise(current.exerciseId) : undefined;
  const circuitMode = active?.circuitMode ?? false;
  const isTimed =
    exercise?.unit === "time" || exercise?.unit === "hold" || false;

  // Unlock + preload on first interaction so mid-set audio is never blocked.
  useEffect(() => {
    const unlock = () => {
      unlockCoachAudio();
      void preloadCoachAudio();
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
    // Also unlock immediately if coach is already on and user navigated here via tap.
    if (coachTrashTalk) unlock();
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, [coachTrashTalk]);

  useEffect(() => {
    if (coachTrashTalk) {
      unlockCoachAudio();
      void preloadCoachAudio();
    }
  }, [coachTrashTalk]);

  const progress = useMemo(() => {
    if (!active) return 0;
    const total = active.exercises.length;
    const done = active.exercises.filter(
      (e) => e.skipped || e.sets.every((s) => s.done),
    ).length;
    return total ? Math.round((done / total) * 100) : 0;
  }, [active]);

  const liveCals = useMemo(() => {
    if (!active) return 0;
    return active.exercises.reduce((sum, ae) => {
      if (ae.skipped) return sum;
      const meta = getExercise(ae.exerciseId);
      if (!meta) return sum;
      const doneSets = ae.sets.filter((st) => st.done);
      const sets = doneSets.length ? doneSets : [];
      if (!sets.length) return sum;
      const totalReps = sets.reduce((a, st) => a + st.reps, 0);
      const avgSeconds =
        sets.reduce((a, st) => a + st.seconds, 0) / Math.max(sets.length, 1);
      return (
        sum +
        estimateExerciseCalories({
          met: meta.met,
          bodyWeightKg: bodyKg,
          sets: sets.length,
          reps: Math.round(totalReps / Math.max(sets.length, 1)),
          secondsPerSet: avgSeconds,
          unit: meta.unit,
        })
      );
    }, 0);
  }, [active, bodyKg]);

  const fireTrashTalk = useCallback(
    (force = false) => {
      if (!coachTrashTalk) return;
      const now = Date.now();
      if (!force && now - trashAt.current < 12_000) return;
      trashAt.current = now;
      if (!isCoachAudioUnlocked()) {
        unlockCoachAudio();
      }
      const idx = pickLineIndex(TRASH_TALK_LINES.length, now);
      const line = TRASH_TALK_LINES[idx]!;
      setCoachLine(line);
      void playCoachLine(idx);
      window.setTimeout(() => {
        setCoachLine((cur) => (cur === line ? null : cur));
      }, 4500);
    },
    [coachTrashTalk],
  );

  useEffect(() => {
    if (!isTimed || !timerRunning || workLeft <= 0) return;
    const t = window.setInterval(() => {
      setWorkLeft((w) => Math.max(0, w - 1));
    }, 1000);
    return () => window.clearInterval(t);
  }, [isTimed, timerRunning, workLeft > 0]);

  useEffect(() => {
    if (restLeft <= 0) return;
    const t = window.setInterval(() => {
      setRestLeft((r) => Math.max(0, r - 1));
    }, 1000);
    return () => window.clearInterval(t);
  }, [restLeft > 0]);

  useEffect(() => {
    if (restLeft === Math.max(3, Math.floor(restPreference / 2))) {
      fireTrashTalk();
    }
  }, [restLeft, restPreference, fireTrashTalk]);

  useEffect(() => {
    setTipIndex(0);
    completingTimed.current = false;
    if (!exercise || !current || !active) return;
    const key = `${active.currentExerciseIndex}-${exercise.id}`;
    if (autoStarted.current === key) return;
    autoStarted.current = key;
    if (isTimed && restLeft <= 0) {
      const sec = current.sets[0]?.seconds || exercise.defaultSeconds || 30;
      setWorkLeft(sec);
      setTimerRunning(true);
    } else {
      setTimerRunning(false);
      setWorkLeft(0);
    }
  }, [exercise?.id, active?.currentExerciseIndex]);

  const finishSession = useCallback(() => {
    const skipped = active?.exercises.filter((e) => e.skipped).length ?? 0;
    const result = finishWorkout();
    const streak = streakDaysFn();
    setCelebrate({
      calories: result?.totalCalories ?? liveCals,
      streak,
      skipped,
      headline: pickLine(FINISH_LINES),
      sub: streak > 0 ? pickLine(STREAK_LINES) : "First session in the books.",
    });
  }, [active, finishWorkout, streakDaysFn, liveCals]);

  const advanceAfterMove = useCallback(() => {
    if (!active || !current || !exercise) return;
    updateActiveSet(active.currentExerciseIndex, 0, {
      done: true,
      reps: isTimed ? 1 : (current.sets[0]?.reps ?? exercise.defaultReps),
      seconds: isTimed
        ? current.sets[0]?.seconds || exercise.defaultSeconds
        : (current.sets[0]?.seconds ?? 0),
    });
    const outcome = completeCurrentMove();
    fireTrashTalk(true);
    if (!outcome || !outcome.advanced) {
      finishSession();
      return;
    }
    setRestLeft(outcome.restSeconds || restPreference);
    setRestKind(outcome.isRoundRest ? "round" : "move");
    setTimerRunning(false);
  }, [
    active,
    current,
    exercise,
    isTimed,
    updateActiveSet,
    completeCurrentMove,
    fireTrashTalk,
    finishSession,
    restPreference,
  ]);

  // Auto-complete timed move when timer hits 0
  useEffect(() => {
    if (!isTimed || !timerRunning || workLeft > 0) return;
    if (completingTimed.current) return;
    if (restLeft > 0) return;
    completingTimed.current = true;
    setTimerRunning(false);
    advanceAfterMove();
  }, [workLeft, isTimed, timerRunning, restLeft, advanceAfterMove]);

  if (!active || !current || !exercise) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-lg font-semibold text-foreground">No active workout</p>
        <p className="text-sm text-muted-foreground">
          Start a session from Home to train.
        </p>
        <Button asChild>
          <Link to="/">Back home</Link>
        </Button>
      </div>
    );
  }

  const phase = current.phase ?? "work";
  const headerSub = (() => {
    if (phase === "warmup") return "Warm-up";
    if (phase === "cooldown") return "Cooldown";
    if (current.totalRounds && current.round) {
      return `Round ${current.round} of ${current.totalRounds} · Move ${(current.circuitIndex ?? 0) + 1}/${current.circuitLength ?? "?"}`;
    }
    return `Move ${active.currentExerciseIndex + 1} of ${active.exercises.length}`;
  })();

  const targetReps = current.sets[0]?.reps ?? exercise.defaultReps;

  const handleSkip = () => {
    unlockCoachAudio();
    const name = exercise.name;
    skipExercise(active.currentExerciseIndex);
    setRestLeft(0);
    setTimerRunning(false);
    toast.message(`Skipped ${name}`, {
      description: "Move on — you can finish without it.",
    });
    if (coachTrashTalk) {
      const line = TRASH_TALK_LINES[11]!;
      setCoachLine(line);
      void playCoachLine(11);
      window.setTimeout(() => {
        setCoachLine((cur) => (cur === line ? null : cur));
      }, 4500);
    }
    const after = useFitnessStore.getState().active;
    if (
      after &&
      after.currentExerciseIndex >= after.exercises.length - 1 &&
      after.exercises.every((e) => e.skipped || e.sets.every((s) => s.done))
    ) {
      finishSession();
    }
  };

  const handleSwap = (newId: string) => {
    const next = getExercise(newId);
    swapExercise(active.currentExerciseIndex, newId);
    setSwapOpen(false);
    setRestLeft(0);
    autoStarted.current = null;
    toast.success(`Swapped for ${next?.name ?? "alternative"}`);
  };

  const handleDone = () => {
    if (current.skipped || restLeft > 0) return;
    unlockCoachAudio();
    setTimerRunning(false);
    advanceAfterMove();
  };

  const alts = useMemo(() => {
    return getAlternatives(exercise.id)
      .map((id) => getExercise(id))
      .filter((e): e is Exercise => Boolean(e));
  }, [exercise.id, getAlternatives]);

  const tips = exercise.tips.length ? exercise.tips : exercise.howTo;
  const tip = tips[tipIndex % tips.length] ?? "";

  if (celebrate) {
    return (
      <div className="relative mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-5 p-6 text-center">
        <ConfettiBurst active />
        <PartyPopper className="h-10 w-10 text-[var(--color-primary)]" />
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {celebrate.headline}
        </h1>
        <p className="text-sm text-[var(--color-muted)]">{celebrate.sub}</p>
        <div className="grid w-full grid-cols-3 gap-3">
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
            <p className="text-xs text-[var(--color-subtle)]">Calories</p>
            <p className="text-xl font-semibold tabular">{celebrate.calories}</p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
            <p className="text-xs text-[var(--color-subtle)]">Streak</p>
            <p className="text-xl font-semibold tabular">{celebrate.streak}d</p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
            <p className="text-xs text-[var(--color-subtle)]">Skipped</p>
            <p className="text-xl font-semibold tabular">{celebrate.skipped}</p>
          </div>
        </div>
        <Button className="w-full" onClick={() => navigate({ to: "/" })}>
          Back home
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 p-4 pb-28">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            cancelWorkout();
            navigate({ to: "/" });
          }}
        >
          <ChevronLeft className="h-4 w-4" />
          Exit
        </Button>
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-subtle)]">
            {headerSub}
          </p>
          <p className="text-sm font-semibold">{exercise.name}</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--color-muted)]">
          <Flame className="h-3.5 w-3.5 text-[var(--color-primary)]" />
          <span className="tabular">{liveCals}</span>
        </div>
      </div>

      <Progress value={progress} className="h-1.5" />

      <ExerciseMedia exercise={exercise} className="max-h-[46vh]" />

      {coachLine && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 px-3 py-2.5 text-sm font-medium text-[var(--color-primary)]">
          {coachLine}
        </div>
      )}

      {restLeft > 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-subtle)]">
            {restKind === "round" ? "Round rest" : "Rest"}
          </p>
          <p className="font-display text-5xl font-bold tabular">{restLeft}s</p>
          <div className="flex flex-wrap justify-center gap-2">
            {REST_PRESETS.map((s) => (
              <Button
                key={s}
                size="sm"
                variant={restPreference === s ? "default" : "secondary"}
                onClick={() => {
                  setRestSeconds(s);
                  setRestLeft(s);
                }}
              >
                {s}s
              </Button>
            ))}
          </div>
          <Button
            className="w-full"
            onClick={() => {
              unlockCoachAudio();
              setRestLeft(0);
            }}
          >
            Skip rest
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {isTimed ? (
            <div className="flex flex-col items-center gap-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <p className="font-display text-5xl font-bold tabular">{workLeft}s</p>
              <div className="flex w-full gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    unlockCoachAudio();
                    setTimerRunning((r) => !r);
                  }}
                >
                  {timerRunning ? (
                    <>
                      <Pause className="h-4 w-4" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" /> Resume
                    </>
                  )}
                </Button>
                <Button className="flex-1" onClick={handleDone}>
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <p className="text-center text-sm text-[var(--color-muted)]">
                Target{" "}
                <span className="font-semibold text-foreground tabular">
                  {targetReps}
                </span>{" "}
                reps · finish the set then tap Done
              </p>
              <Button size="lg" className="w-full" onClick={handleDone}>
                Done
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={handleSkip}>
              <SkipForward className="h-4 w-4" />
              Skip
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setSwapOpen(true)}
              disabled={!alts.length}
            >
              <RefreshCw className="h-4 w-4" />
              Swap
            </Button>
          </div>

          {tip && (
            <button
              type="button"
              onClick={() => setTipIndex((i) => i + 1)}
              className="flex w-full items-start gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2.5 text-left text-sm text-[var(--color-muted)]"
            >
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary)]" />
              <span>{tip}</span>
              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 opacity-40" />
            </button>
          )}
        </div>
      )}

      {circuitMode && (
        <p className="text-center text-xs text-[var(--color-subtle)]">
          Circuit mode · one set per move
        </p>
      )}

      <Dialog open={swapOpen} onOpenChange={setSwapOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Swap exercise</DialogTitle>
            <DialogDescription>
              Pick an alternative that hits a similar pattern.
            </DialogDescription>
          </DialogHeader>
          <div className="grid max-h-[50vh] gap-2 overflow-y-auto">
            {alts.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => handleSwap(a.id)}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2.5 text-left text-sm font-medium hover:border-[var(--color-primary)]/40"
              >
                {a.name}
                <span className="mt-0.5 block text-xs font-normal text-[var(--color-muted)]">
                  {a.focus.join(" · ")}
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
