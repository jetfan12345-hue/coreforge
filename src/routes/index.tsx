import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Play,
  Sparkles,
} from "lucide-react";
import {
  exercises,
  getExercise,
  heroImage,
  resolveExerciseMedia,
  type Equipment,
} from "@/data/exercises";

import {
  beginnerMonthWeeks,
  buildSessionSlots,
  circuitRounds,
  estimateSessionDurationMin,
  intermediateMonthWeeks,
  programs,
  currentProgramWeek,
  resolveProgramExercises,
  sessionCalories,
  sessionSummary,
  type ProgramId,
} from "@/data/programs";
import { Button } from "@/components/ui/button";
import { StatsRow } from "@/components/fitness/stats-row";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFitnessStore, dateKey, isResumableSession } from "@/store/fitness";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: HomePage,
});

type CustomGearFilter =
  | "bodyweight"
  | "any-gear"
  | "barbell"
  | "plate"
  | "cable"
  | "pull-up bar"
  | "ab wheel"
  | "band"
  | "dumbbell";

const GEAR_FILTERS: { value: CustomGearFilter; label: string }[] = [
  { value: "bodyweight", label: "No gear" },
  { value: "any-gear", label: "Needs gear" },
  { value: "barbell", label: "Barbell" },
  { value: "plate", label: "Plates" },
  { value: "cable", label: "Cable" },
  { value: "pull-up bar", label: "Bar" },
  { value: "ab wheel", label: "Wheel" },
  { value: "band", label: "Bands" },
  { value: "dumbbell", label: "DBs" },
];

function HomePage() {
  const navigate = useNavigate();
  const profile = useFitnessStore((s) => s.profile);
  const history = useFitnessStore((s) => s.history);
  const customIds = useFitnessStore((s) => s.customIds);
  const toggleCustom = useFitnessStore((s) => s.toggleCustom);
  const startSession = useFitnessStore((s) => s.startSession);
  const bodyKg = useFitnessStore((s) => s.bodyWeightKg());
  const active = useFitnessStore((s) => s.active);
  const canResume = isResumableSession(active);
  const streak = useFitnessStore((s) => s.streakDays());
  const today = dateKey(new Date());

  const [tab, setTab] = useState<ProgramId>("beginner");
  const [customGear, setCustomGear] = useState<CustomGearFilter>("bodyweight");

  const stats = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);
    const weekKeys = new Set<string>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekAgo);
      d.setDate(weekAgo.getDate() + i);
      weekKeys.add(dateKey(d));
    }
    const weekWorkouts = history.filter((w) => weekKeys.has(w.date));
    const weekCals = weekWorkouts.reduce((a, w) => a + w.totalCalories, 0);
    const todayCals = history
      .filter((w) => w.date === today)
      .reduce((a, w) => a + w.totalCalories, 0);
    const daysHit = new Set(weekWorkouts.map((w) => w.date)).size;
    return { todayCals, weekCals, sessions: history.length, daysHit };
  }, [history, today]);

  const weekStrip = useMemo(() => {
    const days: { key: string; label: string; hit: boolean; isToday: boolean }[] =
      [];
    const hit = new Set(history.map((w) => w.date));
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = dateKey(d);
      days.push({
        key,
        label: d.toLocaleDateString(undefined, { weekday: "narrow" }),
        hit: hit.has(key),
        isToday: key === today,
      });
    }
    return days;
  }, [history, today]);

  const rest = profile.restSeconds ?? 10;
  const gear = profile.gear;
  const weekNum = currentProgramWeek(profile.programStartedAt);
  const weekGoal = 4;
  const weekProgress = Math.min(100, Math.round((stats.daysHit / weekGoal) * 100));

  const activeProgram = programs.find((p) => p.id === tab);

  const weekMeta = useMemo(() => {
    if (tab === "beginner") {
      return (
        beginnerMonthWeeks.find((w) => w.week === weekNum) ??
        beginnerMonthWeeks[0]
      );
    }
    if (tab === "intermediate") {
      return (
        intermediateMonthWeeks.find((w) => w.week === weekNum) ??
        intermediateMonthWeeks[0]
      );
    }
    return null;
  }, [tab, weekNum]);

  const workIds = useMemo(() => {
    if (tab === "custom") return customIds;
    return resolveProgramExercises(tab, {
      week: weekNum,
      gear,
      includeGearOverload: profile.includeGearOverload,
    });
  }, [tab, customIds, weekNum, gear, profile.includeGearOverload]);

  const slots = useMemo(() => {
    return buildSessionSlots(tab, {
      week: weekNum,
      gear,
      includeGearOverload: profile.includeGearOverload,
      customIds: tab === "custom" ? customIds : undefined,
    });
  }, [tab, weekNum, gear, profile.includeGearOverload, customIds]);

  const summary = sessionSummary(slots);
  const rounds = circuitRounds(tab, weekNum);
  const estCals = sessionCalories(slots, bodyKg);
  const estMin = estimateSessionDurationMin(slots, rest);

  const customPool = useMemo(() => {
    if (customGear === "bodyweight") {
      return exercises.filter(
        (e) =>
          e.equipment.every((eq) => eq === "bodyweight") &&
          !e.weighted &&
          e.role !== "warmup" &&
          e.role !== "cooldown",
      );
    }
    if (customGear === "any-gear") {
      return exercises.filter(
        (e) => e.weighted || e.equipment.some((eq) => eq !== "bodyweight"),
      );
    }
    return exercises.filter((e) =>
      e.equipment.includes(customGear as Equipment),
    );
  }, [customGear]);

  const launch = () => {
    if (!slots.length) return;
    startSession(slots, {
      programId: tab === "custom" ? "custom" : tab,
    });
    void navigate({ to: "/workout" });
  };

  const levelLabel =
    tab === "beginner"
      ? "Month 1"
      : tab === "intermediate"
        ? "Month 2"
        : tab === "advanced"
          ? "Advanced"
          : "Custom";

  const showScoreboard =
    stats.sessions > 0 ||
    stats.todayCals > 0 ||
    stats.weekCals > 0 ||
    streak > 0;

  return (
    <div className="space-y-6">
      {canResume && (
        <Button asChild className="w-full" size="lg">
          <Link to="/workout">
            Resume workout
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      )}

      <section className="space-y-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as ProgramId)}>
          <TabsList className="grid h-auto w-full grid-cols-4 gap-1 p-1">
            {(
              [
                ["beginner", "Month 1"],
                ["intermediate", "Month 2"],
                ["advanced", "Advanced"],
                ["custom", "Custom"],
              ] as const
            ).map(([value, label]) => (
              <TabsTrigger
                key={value}
                value={value}
                className="px-1 py-2.5 text-[11px] sm:text-xs data-[state=active]:shadow-none"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex items-center gap-3 border-b border-[var(--color-border)] p-3">
            <img
              src={heroImage(profile.demoModel ?? "female")}
              alt=""
              className="h-14 w-14 shrink-0 rounded-[var(--radius-md)] object-cover object-[center_18%]"
            />
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-lg font-semibold tracking-tight">
                {tab === "custom"
                  ? "Your custom circuit"
                  : activeProgram?.name}
              </h1>
              <p className="text-xs text-[var(--color-muted)]">
                {tab === "custom"
                  ? "Build your own — optional"
                  : `${weekMeta ? `Wk ${weekNum} · ${weekMeta.label}` : levelLabel} · ${rounds} rounds · ~${estMin} min · ~${estCals} cal`}
              </p>
            </div>
          </div>

          <div className="space-y-3 p-4 sm:p-5">
            <Button
              className="h-14 w-full text-base font-semibold"
              size="lg"
              variant={canResume ? "secondary" : "default"}
              disabled={!slots.length}
              onClick={launch}
            >
              <Play className="h-5 w-5" />
              {canResume ? "Start new circuit" : "Start circuit"}
              <ArrowRight className="h-5 w-5" />
            </Button>
            {!slots.length && tab === "custom" && (
              <p className="text-center text-xs text-[var(--color-muted)]">
                Pick at least one move for your circuit.
              </p>
            )}

            <p className="pointer-events-none text-center text-xs text-[var(--color-subtle)]">
              Warm-up 2 · Circuit {summary.workPerRound || 6}×{rounds} · Cooldown 2
            </p>

            {tab === "custom" && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {GEAR_FILTERS.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setCustomGear(f.value)}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
                        customGear === f.value
                          ? "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                          : "border-[var(--color-border)] text-[var(--color-muted)]",
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <div className="max-h-56 space-y-1 overflow-y-auto">
                  {customPool.map((ex) => {
                    const on = customIds.includes(ex.id);
                    return (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => toggleCustom(ex.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-[var(--radius-md)] border px-2.5 py-2 text-left transition",
                          on
                            ? "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10"
                            : "border-transparent hover:bg-[var(--color-surface)]",
                        )}
                      >
                        <img
                          src={ex.image}
                          alt=""
                          className="h-10 w-10 rounded-md object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{ex.name}</p>
                          <p className="text-[11px] text-[var(--color-subtle)]">
                            {ex.unit === "reps"
                              ? `${ex.defaultReps} reps`
                              : `${ex.defaultSeconds}s`}{" "}
                            · {ex.focus[0]}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-full border",
                            on
                              ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-fg)]"
                              : "border-[var(--color-border-strong)]",
                          )}
                        >
                          {on && <Check className="h-3 w-3" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {tab !== "custom" && (
              <ol className="space-y-2">
                <li className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-subtle)]">
                  Work circuit (×{rounds})
                </li>
                {workIds.map((id, i) => {
                  const ex = getExercise(id);
                  if (!ex) return null;
                  const thumb = resolveExerciseMedia(
                    ex,
                    profile.demoModel ?? "female",
                  ).image;
                  return (
                    <li
                      key={`${id}-${i}`}
                      className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-2"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface)] text-[11px] font-semibold tabular text-[var(--color-muted)]">
                        {i + 1}
                      </span>
                      <img
                        src={thumb}
                        alt=""
                        className="h-11 w-11 rounded-md object-cover"
                        onError={(e) => {
                          e.currentTarget.src = ex.image;
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{ex.name}</p>
                        <p className="text-[11px] text-[var(--color-subtle)]">
                          {ex.unit === "reps"
                            ? `${ex.defaultReps} reps`
                            : `${ex.defaultSeconds}s ${ex.unit}`}{" "}
                          · {ex.focus.slice(0, 2).join(", ")}
                        </p>
                      </div>
                    </li>
                  );
                })}
                <li className="pt-1 text-[11px] font-medium uppercase tracking-wide text-[var(--color-subtle)]">
                  Always included
                </li>
                <li className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-muted)]">
                  <span className="font-medium text-[var(--color-fg)]">Warm-up:</span>{" "}
                  Jumping jacks · Mountain climbers
                  <br />
                  <span className="font-medium text-[var(--color-fg)]">Cooldown:</span>{" "}
                  Cobra stretch · Prone T
                </li>
              </ol>
            )}

            <p className="text-center text-[11px] text-[var(--color-subtle)]">
              Rest, gear, and coach settings live in{" "}
              <Link to="/profile" className="underline underline-offset-2">
                You
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {showScoreboard && (
        <StatsRow
          items={[
            { label: "Today", value: `${stats.todayCals} cal`, icon: "flame" },
            { label: "This week", value: `${stats.weekCals}`, icon: "trend" },
            { label: "Streak", value: `${streak}d`, icon: "calendar" },
            { label: "Sessions", value: String(stats.sessions), icon: "dumbbell" },
          ]}
        />
      )}

      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-medium">This week</p>
          <p className="text-xs tabular text-[var(--color-muted)]">
            {stats.daysHit}/{weekGoal} days
          </p>
        </div>
        <div className="mb-3 grid grid-cols-7 gap-1.5">
          {weekStrip.map((d) => (
            <div key={d.key} className="flex flex-col items-center gap-1">
              <span className="text-[10px] uppercase text-[var(--color-subtle)]">
                {d.label}
              </span>
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold tabular",
                  d.hit
                    ? "bg-[var(--color-primary)] text-[var(--color-primary-fg)]"
                    : d.isToday
                      ? "border border-[var(--color-primary)]/50 bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                      : "bg-[var(--color-surface-2)] text-[var(--color-subtle)]",
                )}
              >
                {d.hit ? "✓" : d.isToday ? "·" : ""}
              </span>
            </div>
          ))}
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
          <div
            className="h-full rounded-full bg-[var(--color-primary)] transition-all"
            style={{ width: `${weekProgress}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-[var(--color-subtle)]">
          Program week {weekNum} of 4
          {weekMeta ? ` · ${weekMeta.label}` : ""}
          {stats.daysHit >= weekGoal
            ? " · goal hit"
            : ` · ${weekGoal - stats.daysHit} more day${weekGoal - stats.daysHit === 1 ? "" : "s"} to goal`}
        </p>
      </div>

      <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
          <p className="text-sm font-medium">How sessions work</p>
        </div>
        <ul className="space-y-1.5 text-xs text-[var(--color-muted)]">
          <li>· Warm-up (jacks + climbers) raises heart rate before floor work</li>
          <li>· Six core moves in a row, then the whole circuit repeats</li>
          <li>· Timer and Skip sit under the demo — next move is labeled</li>
          <li>· Cooldown stretches open the abs and hips when you’re done</li>
        </ul>
      </section>
    </div>
  );
}
