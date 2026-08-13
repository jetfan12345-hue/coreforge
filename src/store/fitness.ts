import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  exercises,
  estimateExerciseCalories,
  getExercise,
  kgFromProfile,
  type UnitMode,
} from "@/data/exercises";
import {
  EMPTY_GEAR,
  ROUND_REST_SECONDS,
  type GearKit,
  type SessionPhase,
  type SessionSlot,
  alternativesFor,
} from "@/data/programs";

export interface UserProfile {
  name: string;
  age: number;
  weight: number;
  height: number;
  weightUnit: "lb" | "kg";
  heightUnit: "in" | "cm";
  goal: "strength" | "definition" | "endurance";
  /** Rest between moves in seconds (5–20) */
  restSeconds: number;
  gear: GearKit;
  programStartedAt: string | null;
  includeGearOverload: boolean;
  onboarded: boolean;
  /** Demo coach in exercise media */
  demoModel: "female" | "male";
  /** Female coach trash-talks mid-workout (on-screen lines only — never TTS / MP3). */
  coachTrashTalk: boolean;
}


export interface LoggedSet {
  reps: number;
  seconds: number;
  weightLbs?: number;
}

export interface WorkoutExerciseLog {
  exerciseId: string;
  sets: LoggedSet[];
  unit: UnitMode;
  calories: number;
  completedAt: string;
  skipped?: boolean;
  phase?: SessionPhase;
}

export interface DayWorkout {
  id: string;
  date: string;
  startedAt: string;
  finishedAt: string;
  exercises: WorkoutExerciseLog[];
  totalCalories: number;
  notes?: string;
  programId?: string;
}

export interface ActiveSet {
  reps: number;
  seconds: number;
  weightLbs?: number;
  done: boolean;
}

export interface ActiveExercise {
  exerciseId: string;
  sets: ActiveSet[];
  skipped?: boolean;
  phase: SessionPhase;
  round?: number;
  totalRounds?: number;
  circuitIndex?: number;
  circuitLength?: number;
}

export interface ActiveWorkout {
  date: string;
  startedAt: string;
  exercises: ActiveExercise[];
  currentExerciseIndex: number;
  programId?: string;
  /** Circuit / follow-along session */
  circuitMode: boolean;
}

interface FitnessState {
  profile: UserProfile;
  history: DayWorkout[];
  active: ActiveWorkout | null;
  favorites: string[];
  customIds: string[];
  setProfile: (partial: Partial<UserProfile>) => void;
  completeOnboarding: (profile: Partial<UserProfile>) => void;
  setGear: (partial: Partial<GearKit>) => void;
  toggleGear: (key: keyof GearKit) => void;
  toggleFavorite: (id: string) => void;
  toggleCustom: (id: string) => void;
  setCustomIds: (ids: string[]) => void;
  setRestSeconds: (seconds: number) => void;
  /** Legacy / custom: flat id list (single round, no warmup unless ids include them) */
  startWorkout: (
    exerciseIds: string[],
    opts?: { date?: string; programId?: string; circuitMode?: boolean },
  ) => void;
  /** Preferred: full session slots from buildSessionSlots */
  startSession: (
    slots: SessionSlot[],
    opts?: { date?: string; programId?: string },
  ) => void;
  updateActiveSet: (
    exerciseIndex: number,
    setIndex: number,
    patch: Partial<ActiveSet>,
  ) => void;
  markSetDone: (exerciseIndex: number, setIndex: number, done?: boolean) => void;
  /** Complete current move (all sets) and optionally return rest type */
  completeCurrentMove: () => {
    advanced: boolean;
    restSeconds: number;
    isRoundRest: boolean;
  } | null;
  setCurrentExercise: (index: number) => void;
  addSet: (exerciseIndex: number) => void;
  skipExercise: (exerciseIndex?: number) => void;
  swapExercise: (exerciseIndex: number, newExerciseId: string) => void;
  finishWorkout: (notes?: string) => DayWorkout | null;
  cancelWorkout: () => void;
  deleteWorkout: (id: string) => void;
  getWorkoutsForDate: (date: string) => DayWorkout[];
  getCaloriesForDate: (date: string) => number;
  bodyWeightKg: () => number;
  streakDays: () => number;
  getAlternatives: (exerciseId: string, excludeIds?: string[]) => string[];
}

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function clampRest(n: number): number {
  return Math.min(20, Math.max(5, Math.round(n)));
}

const defaultProfile: UserProfile = {
  name: "",
  age: 30,
  weight: 180,
  height: 70,
  weightUnit: "lb",
  heightUnit: "in",
  goal: "definition",
  restSeconds: 10,
  gear: { ...EMPTY_GEAR },
  programStartedAt: null,
  includeGearOverload: true,
  onboarded: false,
  demoModel: "female",
  coachTrashTalk: false,
};


function buildSets(exerciseId: string, circuitMode: boolean): ActiveSet[] {
  const ex = getExercise(exerciseId) ?? exercises[0];
  const setCount = circuitMode ? 1 : Math.max(1, ex.defaultSets);
  return Array.from({ length: setCount }, () => ({
    reps: ex.unit === "reps" ? ex.defaultReps : 1,
    seconds: ex.unit === "reps" ? 0 : ex.defaultSeconds,
    weightLbs: ex.weighted ? 25 : undefined,
    done: false,
  }));
}

function slotsToActive(
  slots: SessionSlot[],
  circuitMode: boolean,
): ActiveExercise[] {
  return slots.map((slot) => ({
    exerciseId: slot.exerciseId,
    sets: buildSets(slot.exerciseId, circuitMode),
    phase: slot.phase,
    round: slot.round,
    totalRounds: slot.totalRounds,
    circuitIndex: slot.circuitIndex,
    circuitLength: slot.circuitLength,
  }));
}

export const useFitnessStore = create<FitnessState>()(
  persist(
    (set, get) => ({
      profile: defaultProfile,
      history: [],
      active: null,
      favorites: ["bicycle-crunch", "plank", "hollow-hold", "v-up"],
      customIds: ["plank", "bicycle-crunch", "russian-twist", "leg-raise"],

      setProfile: (partial) =>
        set((s) => ({
          profile: {
            ...s.profile,
            ...partial,
            restSeconds:
              partial.restSeconds !== undefined
                ? clampRest(partial.restSeconds)
                : s.profile.restSeconds,
            gear: partial.gear
              ? { ...EMPTY_GEAR, ...s.profile.gear, ...partial.gear }
              : s.profile.gear ?? { ...EMPTY_GEAR },
          },
        })),

      completeOnboarding: (partial) =>
        set((s) => ({
          profile: {
            ...s.profile,
            ...partial,
            restSeconds:
              partial.restSeconds !== undefined
                ? clampRest(partial.restSeconds)
                : s.profile.restSeconds ?? 10,
            gear: {
              ...EMPTY_GEAR,
              ...(s.profile.gear ?? {}),
              ...(partial.gear ?? {}),
            },
            programStartedAt:
              partial.programStartedAt ??
              s.profile.programStartedAt ??
              todayISO(),
            includeGearOverload:
              partial.includeGearOverload ??
              s.profile.includeGearOverload ??
              true,
            onboarded: true,
          },
        })),

      setGear: (partial) =>
        set((s) => ({
          profile: {
            ...s.profile,
            gear: { ...EMPTY_GEAR, ...s.profile.gear, ...partial },
          },
        })),

      toggleGear: (key) =>
        set((s) => ({
          profile: {
            ...s.profile,
            gear: {
              ...EMPTY_GEAR,
              ...s.profile.gear,
              [key]: !s.profile.gear?.[key],
            },
          },
        })),

      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        })),

      toggleCustom: (id) =>
        set((s) => ({
          customIds: s.customIds.includes(id)
            ? s.customIds.filter((f) => f !== id)
            : [...s.customIds, id],
        })),

      setCustomIds: (ids) => set({ customIds: ids }),

      setRestSeconds: (seconds) =>
        set((s) => ({
          profile: { ...s.profile, restSeconds: clampRest(seconds) },
        })),

      bodyWeightKg: () => {
        const p = get().profile;
        return kgFromProfile(p.weight, p.weightUnit);
      },

      streakDays: () => {
        const days = new Set(get().history.map((w) => w.date));
        let streak = 0;
        const d = new Date();
        const key = (dt: Date) =>
          `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
        if (!days.has(key(d))) {
          d.setDate(d.getDate() - 1);
        }
        while (days.has(key(d))) {
          streak += 1;
          d.setDate(d.getDate() - 1);
        }
        return streak;
      },

      getAlternatives: (exerciseId, excludeIds) => {
        const gear = get().profile.gear ?? EMPTY_GEAR;
        return alternativesFor(exerciseId, { gear, excludeIds });
      },

      startWorkout: (exerciseIds, opts) => {
        const day = opts?.date ?? todayISO();
        const circuitMode = opts?.circuitMode ?? false;
        const items: ActiveExercise[] = exerciseIds.map((id) => ({
          exerciseId: id,
          sets: buildSets(id, circuitMode),
          phase: "work" as SessionPhase,
        }));
        set({
          active: {
            date: day,
            startedAt: new Date().toISOString(),
            exercises: items,
            currentExerciseIndex: 0,
            programId: opts?.programId,
            circuitMode,
          },
        });
      },

      startSession: (slots, opts) => {
        const day = opts?.date ?? todayISO();
        set({
          active: {
            date: day,
            startedAt: new Date().toISOString(),
            exercises: slotsToActive(slots, true),
            currentExerciseIndex: 0,
            programId: opts?.programId,
            circuitMode: true,
          },
        });
      },

      updateActiveSet: (exerciseIndex, setIndex, patch) =>
        set((s) => {
          if (!s.active) return s;
          const exercises = s.active.exercises.map((ex, i) => {
            if (i !== exerciseIndex) return ex;
            const sets = ex.sets.map((st, j) =>
              j === setIndex ? { ...st, ...patch } : st,
            );
            return { ...ex, sets };
          });
          return { active: { ...s.active, exercises } };
        }),

      markSetDone: (exerciseIndex, setIndex, done = true) =>
        set((s) => {
          if (!s.active) return s;
          const exercises = s.active.exercises.map((ex, i) => {
            if (i !== exerciseIndex) return ex;
            const sets = ex.sets.map((st, j) =>
              j === setIndex ? { ...st, done } : st,
            );
            return { ...ex, sets };
          });
          return { active: { ...s.active, exercises } };
        }),

      completeCurrentMove: () => {
        const s = get();
        if (!s.active) return null;
        const idx = s.active.currentExerciseIndex;
        const current = s.active.exercises[idx];
        if (!current) return null;

        const exercises = s.active.exercises.map((ex, i) =>
          i === idx
            ? { ...ex, sets: ex.sets.map((st) => ({ ...st, done: true })) }
            : ex,
        );

        let next = idx + 1;
        while (next < exercises.length && exercises[next]?.skipped) next += 1;

        const advanced = next < exercises.length;
        let isRoundRest = false;
        if (advanced) {
          const cur = exercises[idx];
          const nxt = exercises[next];
          isRoundRest =
            cur.phase === "work" &&
            nxt.phase === "work" &&
            (nxt.round ?? 1) > (cur.round ?? 1);
        }

        const restSeconds = isRoundRest
          ? ROUND_REST_SECONDS
          : s.profile.restSeconds ?? 10;

        set({
          active: {
            ...s.active,
            exercises,
            currentExerciseIndex: advanced ? next : idx,
          },
        });

        return { advanced, restSeconds, isRoundRest };
      },

      setCurrentExercise: (index) =>
        set((s) =>
          s.active
            ? { active: { ...s.active, currentExerciseIndex: index } }
            : s,
        ),

      addSet: (exerciseIndex) =>
        set((s) => {
          if (!s.active) return s;
          const exercises = s.active.exercises.map((ex, i) => {
            if (i !== exerciseIndex) return ex;
            const last = ex.sets[ex.sets.length - 1];
            return {
              ...ex,
              sets: [
                ...ex.sets,
                {
                  reps: last?.reps ?? 10,
                  seconds: last?.seconds ?? 30,
                  weightLbs: last?.weightLbs,
                  done: false,
                },
              ],
            };
          });
          return { active: { ...s.active, exercises } };
        }),

      skipExercise: (exerciseIndex) =>
        set((s) => {
          if (!s.active) return s;
          const idx = exerciseIndex ?? s.active.currentExerciseIndex;
          const exercises = s.active.exercises.map((ex, i) =>
            i === idx
              ? {
                  ...ex,
                  skipped: true,
                  sets: ex.sets.map((st) => ({ ...st, done: true })),
                }
              : ex,
          );
          let next = idx + 1;
          while (next < exercises.length && exercises[next]?.skipped) next += 1;
          if (next >= exercises.length) next = idx;
          return {
            active: {
              ...s.active,
              exercises,
              currentExerciseIndex: next,
            },
          };
        }),

      swapExercise: (exerciseIndex, newExerciseId) =>
        set((s) => {
          if (!s.active) return s;
          if (!getExercise(newExerciseId)) return s;
          const exercises = s.active.exercises.map((ex, i) => {
            if (i !== exerciseIndex) return ex;
            return {
              ...ex,
              exerciseId: newExerciseId,
              sets: buildSets(newExerciseId, s.active!.circuitMode),
              skipped: false,
            };
          });
          return { active: { ...s.active, exercises } };
        }),

      finishWorkout: (notes) => {
        const s = get();
        if (!s.active) return null;
        const bodyKg = s.bodyWeightKg();
        const logs: WorkoutExerciseLog[] = s.active.exercises.map((ae) => {
          const meta = getExercise(ae.exerciseId);
          if (ae.skipped) {
            return {
              exerciseId: ae.exerciseId,
              sets: [],
              unit: meta?.unit ?? "reps",
              calories: 0,
              completedAt: new Date().toISOString(),
              skipped: true,
              phase: ae.phase,
            };
          }
          const doneSets = ae.sets.filter((st) => st.done);
          const sets = doneSets.length ? doneSets : ae.sets;
          const unit = meta?.unit ?? "reps";
          const totalReps = sets.reduce((a, st) => a + st.reps, 0);
          const avgSeconds =
            sets.reduce((a, st) => a + st.seconds, 0) / Math.max(sets.length, 1);
          const calories = estimateExerciseCalories({
            met: meta?.met ?? 4,
            bodyWeightKg: bodyKg,
            sets: sets.length,
            reps: Math.round(totalReps / Math.max(sets.length, 1)),
            secondsPerSet: avgSeconds,
            unit,
          });
          return {
            exerciseId: ae.exerciseId,
            sets: sets.map(({ reps, seconds, weightLbs }) => ({
              reps,
              seconds,
              weightLbs,
            })),
            unit,
            calories,
            completedAt: new Date().toISOString(),
            phase: ae.phase,
          };
        });
        const workout: DayWorkout = {
          id: uid(),
          date: s.active.date,
          startedAt: s.active.startedAt,
          finishedAt: new Date().toISOString(),
          exercises: logs,
          totalCalories: logs.reduce((a, e) => a + e.calories, 0),
          notes,
          programId: s.active.programId,
        };
        set((state) => ({
          history: [workout, ...state.history],
          active: null,
        }));
        return workout;
      },

      cancelWorkout: () => set({ active: null }),

      deleteWorkout: (id) =>
        set((s) => ({ history: s.history.filter((w) => w.id !== id) })),

      getWorkoutsForDate: (date) => get().history.filter((w) => w.date === date),

      getCaloriesForDate: (date) =>
        get()
          .history.filter((w) => w.date === date)
          .reduce((a, w) => a + w.totalCalories, 0),
    }),
    {
      name: "coreforge-fitness-v3",
      partialize: (s) => ({
        profile: s.profile,
        history: s.history,
        favorites: s.favorites,
        customIds: s.customIds,
        active: s.active,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<FitnessState>;
        const rawProfile = (p.profile ?? {}) as Partial<UserProfile>;
        const profile: UserProfile = {
          ...current.profile,
          ...rawProfile,
          restSeconds: clampRest(
            rawProfile.restSeconds ?? current.profile.restSeconds ?? 10,
          ),
          gear: {
            ...EMPTY_GEAR,
            ...(current.profile.gear ?? {}),
            ...(rawProfile.gear ?? {}),
          },
          programStartedAt:
            rawProfile.programStartedAt ??
            current.profile.programStartedAt ??
            null,
          includeGearOverload:
            rawProfile.includeGearOverload ??
            current.profile.includeGearOverload ??
            true,
          demoModel:
            rawProfile.demoModel === "female" || rawProfile.demoModel === "male"
              ? rawProfile.demoModel
              : (current.profile.demoModel ?? "female"),
          coachTrashTalk:
            typeof rawProfile.coachTrashTalk === "boolean"
              ? rawProfile.coachTrashTalk
              : (current.profile.coachTrashTalk ?? false),
        };
        // Migrate older active workouts missing circuit fields
        let active = p.active ?? current.active;
        if (active && active.circuitMode === undefined) {
          active = {
            ...active,
            circuitMode: false,
            exercises: active.exercises.map((ex) => ({
              ...ex,
              phase: ex.phase ?? "work",
            })),
          };
        }
        if (active) {
          const kept = active.exercises.filter((ex) => getExercise(ex.exerciseId));
          active = kept.length
            ? {
                ...active,
                exercises: kept,
                currentExerciseIndex: Math.min(
                  active.currentExerciseIndex,
                  kept.length - 1,
                ),
              }
            : null;
        }
        const customIds = (p.customIds ?? current.customIds).filter((id) =>
          getExercise(id),
        );
        const favorites = (p.favorites ?? current.favorites).filter((id) =>
          getExercise(id),
        );
        return {
          ...current,
          ...p,
          profile,
          active,
          customIds,
          favorites,
        };
      },
    },
  ),
);

export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
