import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Clock,
  Dumbbell,
  Flame,
  Play,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { exercises, getExercise, heroImage, resolveExerciseMedia, type Equipment } from "@/data/exercises";

import {
  advancedGearBlocks,
  beginnerMonthWeeks,
  buildSessionSlots,
  circuitRounds,
  estimateSessionDurationMin,
  GEAR_OPTIONS,
  intermediateMonthWeeks,
  programs,
  currentProgramWeek,
  describeGearUnlock,
  resolveProgramExercises,
  sessionCalories,
  sessionSummary,
  type ProgramId,
} from "@/data/programs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsRow } from "@/components/fitness/stats-row";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFitnessStore, dateKey } from "@/store/fitness";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { pickCoachLine } from "@/data/coach-lines";

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

const REST_PRESETS = [5, 10, 15, 20] as const;

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
  const toggleGear = useFitnessStore((s) => s.toggleGear);
  const setProfile = useFitnessStore((s) => s.setProfile);
  const startSession = useFitnessStore((s) => s.startSession);
  const setRestSeconds = useFitnessStore((s) => s.setRestSeconds);
  const bodyKg = useFitnessStore((s) => s.bodyWeightKg());
  const active = useFitnessStore((s) => s.active);
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
  const ownedGear = GEAR_OPTIONS.filter((g) => gear?.[g.key]);

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

  const bodyCount = exercises.filter(
    (e) =>
      e.equipment.every((eq) => eq === "bodyweight") &&
      !e.weighted &&
      (!e.role || e.role === "work"),
  ).length;
  const gearCount = exercises.filter(
    (e) => e.weighted || e.equipment.some((eq) => eq !== "bodyweight"),
  ).length;

  const launch = () => {
    if (!slots.length) return;
    startSession(slots, {
      programId: tab === "custom" ? "custom" : tab,
    });
    void navigate({ to: "/workout" });
  };

  const displayIds = workIds;

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-[var(--color-muted)]">
          {profile.name ? `Hey ${profile.name}` : "Hey there"}
          <span className="text-[var(--color-subtle)]">
            {streak > 0 ? ` · ${streak}-day streak` : " · pick a level & train"}
          </span>
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Train your core
        </h1>
        <p className="mt-2 max-w-md text-sm text-[var(--color-muted)]">
          Warm-up → {summary.workPerRound || 6}–8 move circuit × rounds → cooldown
          stretches. Skip or swap any move.
        </p>
      </section>

      <StatsRow
        items={[
          { label: "Today", value: `${stats.todayCals} cal`, icon: "flame" },
          { label: "This week", value: `${stats.weekCals}`, icon: "trend" },
          { label: "Streak", value: `${streak}d`, icon: "calendar" },
          { label: "Sessions", value: String(stats.sessions), icon: "dumbbell" },
        ]}
      />

      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-[var(--color-primary)]" />
            <p className="text-sm font-medium">Your gear</p>
          </div>
          <p className="text-xs text-[var(--color-muted)]">
            {ownedGear.length === 0
              ? "Floor only · advanced still works"
              : `${ownedGear.length} owned`}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {GEAR_OPTIONS.map(({ key, label, hint }) => {
            const on = Boolean(gear?.[key]);
            const unlocks = advancedGearBlocks.find((b) =>
              b.needs.includes(key),
            );
            const unlockNames = (unlocks?.exerciseIds ?? [])
              .map((id) => getExercise(id)?.shortName)
              .filter(Boolean)
              .slice(0, 2)
              .join(" · ");
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  const nextOn = !gear?.[key];
                  toggleGear(key);
                  if (nextOn) {
                    const { title, moves } = describeGearUnlock(key);
                    toast.success(`${title} unlocked`, {
                      description: moves.length
                        ? `Advanced can add ${moves.join(" · ")}`
                        : "Logged. Advanced can layer this as overload.",
                    });
                  }
                }}
                className={cn(
                  "rounded-[var(--radius-md)] border px-2.5 py-2 text-left transition",
                  on
                    ? "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/15"
                    : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]",
                )}
              >
                <p
                  className={cn(
                    "text-[11px] font-semibold",
                    on
                      ? "text-[var(--color-primary)]"
                      : "text-[var(--color-fg)]",
                  )}
                >
                  {on ? "✓ " : ""}
                  {label}
                </p>
                <p className="text-[10px] text-[var(--color-subtle)]">
                  {on && unlockNames ? `Unlocks ${unlockNames}` : hint}
                </p>
              </button>
            );
          })}
        </div>
        {ownedGear.length > 0 && (
          <button
            type="button"
            onClick={() =>
              setProfile({ includeGearOverload: !profile.includeGearOverload })
            }
            className={cn(
              "mt-3 flex w-full items-center gap-2 rounded-[var(--radius-md)] border px-3 py-2 text-left text-xs transition",
              profile.includeGearOverload
                ? "border-[var(--color-primary)]/30 bg-[var(--color-primary)]/8 text-[var(--color-primary)]"
                : "border-[var(--color-border)] text-[var(--color-muted)]",
            )}
          >
            <span
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                profile.includeGearOverload
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-fg)]"
                  : "border-[var(--color-border-strong)]",
              )}
            >
              {profile.includeGearOverload && <Check className="h-2.5 w-2.5" />}
            </span>
            Layer owned gear as Advanced overload (bodyweight circuit first)
          </button>
        )}
      </div>

      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-[var(--color-primary)]" />
            <p className="text-sm font-medium">This week</p>
          </div>
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

      {active && (
        <Button asChild className="w-full" size="lg">
          <Link to="/workout">
            Resume workout
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      )}

      <section className="space-y-4">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold tracking-tight">
                Today’s session
              </h2>
              <p className="text-xs text-[var(--color-muted)]">
                Follow-along circuit · mix of timed & rep moves · auto warm-up & stretch
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <div className="flex overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)]">
                {(["female", "male"] as const).map((m) => {
                  const on = (profile.demoModel ?? "female") === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setProfile({ demoModel: m })}
                      className={cn(
                        "flex items-center gap-1.5 px-1.5 py-1 text-[11px] font-semibold transition",
                        on
                          ? "bg-[var(--color-primary)] text-[var(--color-primary-fg)]"
                          : "text-[var(--color-muted)]",
                      )}
                    >
                      <img
                        src={heroImage(m)}
                        alt=""
                        className="h-6 w-6 rounded-full object-cover object-[center_18%]"
                      />
                      {m === "female" ? "Female" : "Male"}
                    </button>
                  );
                })}
              </div>
              {(profile.demoModel ?? "female") === "female" && (
                <button
                  type="button"
                  onClick={() => {
                    const next = !profile.coachTrashTalk;
                    setProfile({ coachTrashTalk: next });
                    toast.message(next ? "Coach on" : "Coach off", {
                      description: next ? pickCoachLine("work").text : undefined,
                    });
                  }}
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    profile.coachTrashTalk
                      ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                      : "text-[var(--color-subtle)]",
                  )}
                >
                  {profile.coachTrashTalk ? "Trash talk on" : "Trash talk off"}
                </button>
              )}
            </div>
          </div>
        </div>

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
          <div className="relative h-44 w-full sm:h-52">
            <img
              src={heroImage(profile.demoModel ?? "female")}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface)] via-[var(--color-surface)]/45 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4">
              <div className="mb-1 flex flex-wrap gap-1.5">
                <Badge className="border-0 bg-black/45 capitalize text-white">
                  {tab === "beginner"
                    ? "Month 1"
                    : tab === "intermediate"
                      ? "Month 2"
                      : tab}
                </Badge>
                {weekMeta && (
                  <Badge className="border-0 bg-black/45 text-white">
                    Wk {weekNum} · {weekMeta.label}
                  </Badge>
                )}
                <Badge className="border-0 bg-black/45 text-white">
                  {rounds} rounds
                </Badge>
                <Badge className="border-0 bg-black/45 text-white">
                  <Clock className="mr-1 h-3 w-3" />~{estMin} min
                </Badge>
                <Badge className="border-0 bg-black/45 text-white">
                  <Flame className="mr-1 h-3 w-3" />~{estCals} cal
                </Badge>
              </div>
              <h3 className="font-display text-xl font-semibold tracking-tight">
                {tab === "custom"
                  ? "Your custom circuit"
                  : activeProgram?.name}
              </h3>
              <p className="mt-0.5 text-xs text-white/80">
                {tab === "custom"
                  ? `${bodyCount} floor · ${gearCount} with gear — mix freely`
                  : activeProgram?.tagline}
              </p>
            </div>
          </div>

          <div className="space-y-4 p-4 sm:p-5">
            {tab !== "custom" && activeProgram && (
              <p className="text-sm text-[var(--color-muted)]">
                {activeProgram.description}
              </p>
            )}

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2 py-2">
                <p className="text-[10px] uppercase tracking-wide text-[var(--color-subtle)]">
                  Warm-up
                </p>
                <p className="font-display text-sm font-semibold">2 moves</p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 px-2 py-2">
                <p className="text-[10px] uppercase tracking-wide text-[var(--color-primary)]">
                  Circuit
                </p>
                <p className="font-display text-sm font-semibold text-[var(--color-primary)]">
                  {summary.workPerRound} × {rounds}
                </p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2 py-2">
                <p className="text-[10px] uppercase tracking-wide text-[var(--color-subtle)]">
                  Cooldown
                </p>
                <p className="font-display text-sm font-semibold">2 stretches</p>
              </div>
            </div>

            {tab === "advanced" && (
              <p className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-xs text-[var(--color-muted)]">
                Pure bodyweight forge
                {profile.includeGearOverload && ownedGear.length
                  ? ` + optional ${ownedGear.map((g) => g.label.toLowerCase()).join(", ")} overload`
                  : " — no gym required"}
                .
              </p>
            )}

            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[var(--color-subtle)]">
                  <Zap className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                  Rest between moves
                </span>
                <span className="font-display text-sm font-semibold tabular text-[var(--color-primary)]">
                  {rest}s
                </span>
              </div>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {REST_PRESETS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRestSeconds(s)}
                    className={cn(
                      "min-w-[3rem] rounded-full border px-2.5 py-1 text-[11px] font-semibold tabular transition",
                      rest === s
                        ? "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                        : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-border-strong)]",
                    )}
                  >
                    {s}s
                  </button>
                ))}
              </div>
              <input
                type="range"
                min={5}
                max={20}
                step={1}
                value={rest}
                onChange={(e) => setRestSeconds(Number(e.target.value))}
                className="w-full accent-[var(--color-primary)]"
                aria-label="Rest seconds"
              />
              <p className="mt-1.5 text-[11px] text-[var(--color-subtle)]">
                30s rest between full circuit rounds · stretches always finish the session
              </p>
            </div>

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
                {displayIds.map((id, i) => {
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

            <Button
              className="w-full"
              size="lg"
              disabled={!slots.length}
              onClick={launch}
            >
              <Play className="h-4 w-4" />
              Start circuit
              <ArrowRight className="h-4 w-4" />
            </Button>
            {!slots.length && tab === "custom" && (
              <p className="text-center text-xs text-[var(--color-muted)]">
                Pick at least one move for your circuit.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
          <p className="text-sm font-medium">How sessions work</p>
        </div>
        <ul className="space-y-1.5 text-xs text-[var(--color-muted)]">
          <li>· Warm-up (jacks + climbers) raises heart rate before floor work</li>
          <li>· 6–8 core moves in a row, then the whole circuit repeats</li>
          <li>· Timed holds and rep moves mixed — follow the demo video</li>
          <li>· Cooldown stretches open the abs and hips when you’re done</li>
        </ul>
      </section>
    </div>
  );
}
