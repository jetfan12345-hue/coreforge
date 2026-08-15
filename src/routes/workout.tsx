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
  pickCoachLine,
  pickCleanFinish,
  pickFinishLine,
  type CoachLineKind,
} from "@/data/coach-lines";
import { playCoachLineById, stopCoachAudio } from "@/lib/coach-audio";
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
  quote: string;
};

function WorkoutPage() {
  const navigate = useNavigate();
  const active = useFitnessStore((s) => s.active);
  const bodyKg = useFitnessStore((s) => s.bodyWeightKg());
  const restPreference = useFitnessStore((s) => s.profile.restSeconds ?? 10);
  const coachTrashTalk = useFitnessStore(
    (s) => s.profile.coachTrashTalk ?? false,
  );
  const demoModel = useFitnessStore((s) => s.profile.demoModel ?? "female");
  const trashEnabled = coachTrashTalk && demoModel === "female";
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
  const [paused, setPaused] = useState(false);
  const [coachLine, setCoachLine] = useState<string | null>(null);
  const [goFlash, setGoFlash] = useState(false);
  const [celebrate, setCelebrate] = useState<CelebrateState | null>(null);
  const autoStarted = useRef<string | null>(null);
  const trashAt = useRef(0);
  const skipLock = useRef(false);
  const completingTimed = useRef(false);

  const current = active?.exercises[active.currentExerciseIndex];
  const exercise = current ? getExercise(current.exerciseId) : undefined;
  const circuitMode = active?.circuitMode ?? false;
  const isTimed =
    exercise?.unit === "time" || exercise?.unit === "hold" || false;
  const phase = current?.phase ?? "work";

  const remainingWork = useMemo(() => {
    if (!active) return false;
    return active.exercises
      .slice(active.currentExerciseIndex + 1)
      .some((e) => (e.phase ?? "work") === "work" && !e.skipped);
  }, [active]);
  const isLastWork = phase === "work" && !remainingWork;

  const fireTrashTalk = useCallback(
    (kind: CoachLineKind = "work", opts?: { force?: boolean; holdMs?: number }) => {
      if (!trashEnabled) {
        stopCoachAudio();
        return;
      }
      const now = Date.now();
      if (!opts?.force && now - trashAt.current < 7_000) return;
      trashAt.current = now;
      const line = pickCoachLine(kind);
      setCoachLine(line.text);
      playCoachLineById(line.id);
      window.setTimeout(() => {
        setCoachLine((cur) => (cur === line.text ? null : cur));
      }, opts?.holdMs ?? 4200);
    },
    [trashEnabled],
  );

  useEffect(() => {
    if (!trashEnabled) stopCoachAudio();
  }, [trashEnabled]);

  useEffect(() => () => stopCoachAudio(), []);

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
    setTipIndex(0);
    completingTimed.current = false;
    if (!exercise || !current || !active) return;
    const key = `${active.currentExerciseIndex}-${exercise.id}`;
    if (autoStarted.current === key) return;
    autoStarted.current = key;
    setPaused(false);
    if (isTimed && restLeft <= 0) {
      const sec = current.sets[0]?.seconds || exercise.defaultSeconds || 30;
      setWorkLeft(sec);
      setTimerRunning(true);
      setGoFlash(true);
      window.setTimeout(() => setGoFlash(false), 900);
    } else {
      setTimerRunning(false);
      setWorkLeft(0);
    }
  }, [exercise?.id, active?.currentExerciseIndex]);

  useEffect(() => {
    if (!trashEnabled || !exercise) return;
    if (restLeft > 0) {
      fireTrashTalk("rest", { force: true, holdMs: 3800 });
      return;
    }
    if (phase !== "work") return;
    if (skipLock.current) {
      skipLock.current = false;
    } else {
      fireTrashTalk(isLastWork ? "last" : "work", { force: true, holdMs: 4800 });
    }
    const t = window.setInterval(() => fireTrashTalk("work"), 8000);
    return () => window.clearInterval(t);
  }, [
    exercise?.id,
    active?.currentExerciseIndex,
    restLeft > 0,
    trashEnabled,
    phase,
    isLastWork,
    fireTrashTalk,
  ]);

  const finishSession = useCallback(() => {
    const skipped = active?.exercises.filter((e) => e.skipped).length ?? 0;
    const result = finishWorkout();
    const streak = streakDaysFn();
    const twoDay = streak === 2;
    toast.dismiss();
    if (trashEnabled) {
      const closer = pickFinishLine(streak);
      playCoachLineById(closer.id);
      setCelebrate({
        calories: result?.totalCalories ?? liveCals,
        streak,
        skipped,
        headline: twoDay
          ? "Two days. That's a streak, not a fluke."
          : streak >= 3
            ? `${streak}-day heater.`
            : "Session closed.",
        sub: twoDay
          ? "Come back tomorrow and it's real. Don't ghost me now."
          : streak > 2
            ? "Feed it tomorrow. Don't put a streak on a diet."
            : streak === 1
              ? "Day one in the books. Tomorrow makes it a streak."
              : "First session in the books.",
        quote: closer.text,
      });
    } else {
      const clean = pickCleanFinish(streak);
      setCelebrate({
        calories: result?.totalCalories ?? liveCals,
        streak,
        skipped,
        ...clean,
      });
    }
  }, [active, finishWorkout, streakDaysFn, liveCals, trashEnabled]);

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
    finishSession,
    restPreference,
  ]);

  useEffect(() => {
    if (!isTimed || !timerRunning || workLeft > 0) return;
    if (completingTimed.current) return;
    if (restLeft > 0) return;
    completingTimed.current = true;
    setTimerRunning(false);
    advanceAfterMove();
  }, [workLeft, isTimed, timerRunning, restLeft, advanceAfterMove]);

  const alts = useMemo(() => {
    if (!exercise) return [];
    return getAlternatives(exercise.id)
      .map((id) => getExercise(id))
      .filter((e): e is Exercise => Boolean(e));
  }, [exercise?.id, getAlternatives]);

  if (celebrate) {
    const twoDay = celebrate.streak === 2;
    return (
      <div className="relative mx-auto flex min-h-[80dvh] max-w-lg flex-col items-center justify-center gap-5 overflow-hidden p-6 text-center">
        <ConfettiBurst
          active
          durationMs={twoDay ? 6400 : 3600}
          count={twoDay ? 220 : 160}
        />
        <PartyPopper className="h-12 w-12 text-[var(--color-primary)] drop-shadow-[0_0_18px_color-mix(in_oklab,var(--color-primary)_55%,transparent)]" />
        {twoDay && (
          <p className="rounded-full border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">
            2-day streak · extra love
          </p>
        )}
          {celebrate.streak >= 3 && (
          <p className="rounded-full border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">
            {celebrate.streak}-day streak
          </p>
        )}
        <h1 className="font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          {celebrate.headline}
        </h1>
        <p className="max-w-sm text-sm text-[var(--color-muted)]">{celebrate.sub}</p>
        <p className="max-w-sm rounded-[var(--radius-xl)] border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 px-4 py-3 font-display text-lg font-semibold text-[var(--color-primary)]">
          “{celebrate.quote}”
        </p>
        <div className="grid w-full grid-cols-3 gap-3">
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
            <p className="text-xs text-[var(--color-subtle)]">Calories</p>
            <p className="text-2xl font-semibold tabular">{celebrate.calories}</p>
          </div>
          <div
            className={cn(
              "rounded-[var(--radius-lg)] border bg-[var(--color-surface)] p-3",
              twoDay || celebrate.streak >= 3
                ? "border-[var(--color-primary)]/50"
                : "border-[var(--color-border)]",
            )}
          >
            <p className="text-xs text-[var(--color-subtle)]">Streak</p>
            <p className="text-2xl font-semibold tabular">{celebrate.streak}d</p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
            <p className="text-xs text-[var(--color-subtle)]">Skipped</p>
            <p className="text-2xl font-semibold tabular">{celebrate.skipped}</p>
          </div>
        </div>
        <Button className="w-full" size="lg" onClick={() => navigate({ to: "/" })}>
          Back home
        </Button>
      </div>
    );
  }

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

  const headerSub = (() => {
    if (phase === "warmup") return "Warm-up";
    if (phase === "cooldown") return "Cooldown";
    if (current.totalRounds && current.round) {
      return `Round ${current.round} of ${current.totalRounds} · Move ${(current.circuitIndex ?? 0) + 1}/${current.circuitLength ?? "?"}`;
    }
    return `Move ${active.currentExerciseIndex + 1} of ${active.exercises.length}`;
  })();

  const targetReps = current.sets[0]?.reps ?? exercise.defaultReps;
  const nextSlot = active.exercises[active.currentExerciseIndex + 1];
  const nextExercise = nextSlot ? getExercise(nextSlot.exerciseId) : undefined;
  const urgent = isTimed && timerRunning && workLeft > 0 && workLeft <= 5;

  const handleSkip = () => {
    skipExercise(active.currentExerciseIndex);
    setRestLeft(0);
    setTimerRunning(false);
    skipLock.current = true;
    fireTrashTalk("skip", { force: true, holdMs: 4500 });
    const after = useFitnessStore.getState().active;
    if (
      after &&
      after.exercises.every((e) => e.skipped || e.sets.every((s) => s.done))
    ) {
      finishSession();
      return;
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
    setTimerRunning(false);
    advanceAfterMove();
  };

  const tips = exercise.tips.length ? exercise.tips : exercise.howTo;
  const tip = tips[tipIndex % tips.length] ?? "";

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-lg flex-col gap-3 p-3 pb-6",
        phase === "warmup" && "workout-phase-warmup",
        phase === "work" && "workout-phase-work",
        phase === "cooldown" && "workout-phase-cool",
      )}
    >
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
          <p
            className={cn(
              "text-[11px] font-semibold uppercase tracking-wide",
              phase === "warmup" && "text-[var(--color-warn)]",
              phase === "work" && "text-[var(--color-primary)]",
              phase === "cooldown" && "text-[var(--color-success)]",
            )}
          >
            {headerSub}
          </p>
          <p className="text-sm font-semibold">{exercise.name}</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--color-muted)]">
          <Flame className="h-3.5 w-3.5 text-[var(--color-primary)]" />
          <span className="tabular">{liveCals}</span>
          <span className="text-[var(--color-subtle)]">cal</span>
        </div>
      </div>

      <Progress value={progress} className="h-1.5" />

      <ExerciseMedia
        exercise={exercise}
        className=""
        compact
        playing={!paused && restLeft <= 0}
        showPlaybackToggle={false}
        overlay={
          <>
            {goFlash && restLeft <= 0 && (
              <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                <span className="go-stamp font-display text-7xl font-black tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.65)]">
                  GO
                </span>
              </div>
            )}
            {coachLine && (
              <div className="pointer-events-none absolute inset-x-3 top-12 z-10 sm:top-14">
                <p className="coach-line-pop rounded-[var(--radius-lg)] border border-[var(--color-primary)]/45 bg-black/70 px-3 py-2.5 text-center font-display text-base font-semibold leading-snug text-white shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:text-lg">
                  {coachLine}
                </p>
              </div>
            )}
          </>
        }
      />

      {restLeft > 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-subtle)]">
            {restKind === "round" ? "Round rest" : "Rest"}
          </p>
          <p className="font-display text-6xl font-bold tabular tracking-tight">
            {restLeft}
            <span className="text-3xl text-[var(--color-muted)]">s</span>
          </p>
          {nextExercise && (
            <p className="text-sm text-[var(--color-muted)]">
              Up next · <span className="font-semibold text-foreground">{nextExercise.name}</span>
            </p>
          )}
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
          <Button className="w-full" onClick={() => setRestLeft(0)}>
            Skip rest
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {isTimed ? (
            <div className="flex flex-col items-center gap-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <p
                className={cn(
                  "font-display text-6xl font-bold tabular tracking-tight",
                  urgent && "timer-urgent",
                )}
              >
                {workLeft}
                <span className="text-3xl text-[var(--color-muted)]">s</span>
              </p>
              <div className="flex w-full gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setPaused((p) => !p);
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
              <p className="text-center font-display text-4xl font-bold tabular">
                {targetReps}
                <span className="ml-1 text-lg font-semibold text-[var(--color-muted)]">
                  reps
                </span>
              </p>
              <p className="text-center text-sm text-[var(--color-muted)]">
                Finish the set, then tap Done
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
          {nextExercise
            ? `Next · ${nextExercise.name}`
            : isLastWork
              ? "Last move · leave something ugly on the floor"
              : "Last move · finish strong"}
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
