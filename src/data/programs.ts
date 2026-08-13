import {
  exercises,
  estimateExerciseCalories,
  getExercise,
  type Difficulty,
  type Equipment,
} from "./exercises";

export type ProgramId = "beginner" | "intermediate" | "advanced" | "custom";

export type SessionPhase = "warmup" | "work" | "cooldown";

export type GearKit = {
  barbell: boolean;
  plate: boolean;
  cable: boolean;
  "pull-up bar": boolean;
  "ab wheel": boolean;
  dumbbell: boolean;
  band: boolean;
  bench: boolean;
};

export const EMPTY_GEAR: GearKit = {
  barbell: false,
  plate: false,
  cable: false,
  "pull-up bar": false,
  "ab wheel": false,
  dumbbell: false,
  band: false,
  bench: false,
};

/** 8 options → balanced 2×4 grid on onboarding */
export const GEAR_OPTIONS: { key: keyof GearKit; label: string; hint: string }[] = [
  { key: "barbell", label: "Barbell", hint: "Olympic bar / landmine" },
  { key: "plate", label: "Weight plates", hint: "25s · 45s" },
  { key: "cable", label: "Cable / pulldown", hint: "High pulley + rope" },
  { key: "pull-up bar", label: "Pull-up bar", hint: "Doorway or rack" },
  { key: "ab wheel", label: "Ab wheel", hint: "Rollout wheel" },
  { key: "dumbbell", label: "Dumbbells", hint: "Any pair" },
  { key: "band", label: "Resistance bands", hint: "Rubber straps · loops" },
  { key: "bench", label: "Bench", hint: "Flat bench" },
];

export interface Program {
  id: Exclude<ProgramId, "custom">;
  name: string;
  tagline: string;
  description: string;
  durationMin: number;
  /** Work circuit only (no warmup/cooldown) */
  exerciseIds: string[];
  bodyweightOnly: boolean;
}

/** Every session starts with these (1 pass). */
export const WARMUP_IDS = ["jumping-jacks", "mountain-climber"] as const;

/** Every session ends with these (1 pass, holds). */
export const COOLDOWN_IDS = [
  "cobra-stretch",
  "prone-t",
] as const;

/** Rest between full rounds of the work circuit (seconds). */
export const ROUND_REST_SECONDS = 30;

/**
 * Science-informed core order inside the work circuit:
 * brace → flex → lower → rotate → dynamic / posterior
 * Session shape: warmup → circuit × rounds → cooldown
 */
export const programs: Program[] = [
  {
    id: "beginner",
    name: "Beginner core",
    tagline: "Month 1 · circuits · builds weekly",
    description:
      "Warm-up, 6–7 floor moves in a row for 2–3 rounds, then stretch. Zero gear required.",
    durationMin: 14,
    bodyweightOnly: true,
    exerciseIds: [
      "dead-bug",
      "crunch",
      "bird-dog",
      "penguin-crunch",
      "leg-raise",
      "plank",
    ],
  },
  {
    id: "intermediate",
    name: "Intermediate burn",
    tagline: "Month 2 · denser circuits",
    description:
      "Same follow-along format, harder work block: hollow, V-ups, reverse crunch, dips, flutters.",
    durationMin: 18,
    bodyweightOnly: true,
    exerciseIds: [
      "hollow-hold",
      "bicycle-crunch",
      "reverse-crunch",
      "side-plank-hip-dip-left",
      "side-plank-hip-dip-right",
      "v-up",
      "flutter-kick",
    ],
  },
  {
    id: "advanced",
    name: "Advanced forge",
    tagline: "Hard bodyweight · gear optional",
    description:
      "Elite floor circuit first. Own a bar, wheel, plates, cable, or bands? Optional overload tacked on.",
    durationMin: 22,
    bodyweightOnly: true,
    exerciseIds: [
      "hollow-hold",
      "dragon-flag",
      "windshield-wiper",
      "v-up",
      "plank-hip-dip",
      "tuck-up",
      "flutter-kick",
      "swimmer",
    ],
  },
];

/** Progressive month 1 — 4 weekly work circuits (6–7 moves). */
export const beginnerMonthWeeks: {
  week: number;
  label: string;
  exerciseIds: string[];
}[] = [
  {
    week: 1,
    label: "Foundations",
    exerciseIds: [
      "dead-bug",
      "crunch",
      "bird-dog",
      "penguin-crunch",
      "leg-raise",
      "plank",
    ],
  },
  {
    week: 2,
    label: "Add rotation",
    exerciseIds: [
      "dead-bug",
      "crunch",
      "russian-twist",
      "reverse-crunch",
      "side-plank",
      "plank-shoulder-tap",
      "flutter-kick",
    ],
  },
  {
    week: 3,
    label: "Longer density",
    exerciseIds: [
      "bird-dog",
      "long-arm-crunch",
      "leg-raise",
      "penguin-crunch",
      "side-plank",
      "swimmer",
      "plank",
    ],
  },
  {
    week: 4,
    label: "Bridge to mid",
    exerciseIds: [
      "dead-bug",
      "bicycle-crunch",
      "reverse-crunch",
      "russian-twist",
      "side-plank",
      "flutter-kick",
      "hollow-hold",
    ],
  },
];

/** Month 2 intermediate work circuits */
export const intermediateMonthWeeks: {
  week: number;
  label: string;
  exerciseIds: string[];
}[] = [
  {
    week: 1,
    label: "Density",
    exerciseIds: [
      "hollow-hold",
      "bicycle-crunch",
      "reverse-crunch",
      "side-plank-hip-dip-left",
      "side-plank-hip-dip-right",
      "v-up",
      "flutter-kick",
    ],
  },
  {
    week: 2,
    label: "Lower emphasis",
    exerciseIds: [
      "dead-bug",
      "leg-raise",
      "scissors",
      "tuck-up",
      "side-crunch",
      "swimmer",
      "flutter-kick",
    ],
  },
  {
    week: 3,
    label: "Full ROM",
    exerciseIds: [
      "hollow-hold",
      "sit-up",
      "v-up",
      "russian-twist",
      "plank-shoulder-tap",
      "side-plank",
      "bicycle-crunch",
    ],
  },
  {
    week: 4,
    label: "Forge prep",
    exerciseIds: [
      "hollow-hold",
      "tuck-up",
      "windshield-wiper",
      "v-up",
      "plank-hip-dip",
      "scissors",
      "swimmer",
      "flutter-kick",
    ],
  },
];

export const advancedGearBlocks: {
  needs: (keyof GearKit)[];
  exerciseIds: string[];
  label: string;
}[] = [
  {
    needs: ["pull-up bar"],
    exerciseIds: ["hanging-leg-raise"],
    label: "Bar",
  },
  {
    needs: ["ab wheel"],
    exerciseIds: ["ab-wheel-rollout"],
    label: "Wheel",
  },
  {
    needs: ["barbell"],
    exerciseIds: ["barbell-rollout", "landmine-rotation"],
    label: "Barbell",
  },
  {
    needs: ["plate"],
    exerciseIds: ["weighted-situp", "weighted-russian-twist"],
    label: "Plates",
  },
  {
    needs: ["cable"],
    exerciseIds: ["cable-crunch"],
    label: "Cable",
  },
  {
    needs: ["band"],
    exerciseIds: ["band-pallof", "band-woodchop"],
    label: "Bands",
  },
];

export function getProgram(id: Exclude<ProgramId, "custom">): Program | undefined {
  return programs.find((p) => p.id === id);
}

export function currentProgramWeek(startedAt?: string | null): number {
  if (startedAt) {
    const start = new Date(startedAt);
    const days = Math.floor(
      (new Date().getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    return Math.min(4, Math.max(1, Math.floor(days / 7) + 1));
  }
  const d = new Date().getDate();
  return Math.min(4, Math.max(1, Math.ceil(d / 7)));
}

/** How many times the work circuit repeats. */
export function circuitRounds(
  programId: ProgramId,
  week?: number,
): number {
  const w = week ?? currentProgramWeek();
  if (programId === "beginner") return w <= 2 ? 2 : 3;
  if (programId === "intermediate") return 3;
  if (programId === "advanced") return 3;
  return 2; // custom
}

/** Work-block exercise ids only (no warmup/cooldown). */
export function resolveProgramExercises(
  programId: ProgramId,
  opts: {
    week?: number;
    gear?: GearKit;
    includeGearOverload?: boolean;
  } = {},
): string[] {
  const week = opts.week ?? currentProgramWeek();
  const gear = opts.gear ?? EMPTY_GEAR;
  if (programId === "beginner") {
    return [
      ...(beginnerMonthWeeks.find((x) => x.week === week) ?? beginnerMonthWeeks[0])
        .exerciseIds,
    ];
  }
  if (programId === "intermediate") {
    return [
      ...(
        intermediateMonthWeeks.find((x) => x.week === week) ??
        intermediateMonthWeeks[0]
      ).exerciseIds,
    ];
  }
  if (programId === "advanced") {
    const base = [...(getProgram("advanced")?.exerciseIds ?? [])];
    if (opts.includeGearOverload !== false) {
      for (const block of advancedGearBlocks) {
        if (block.needs.every((k) => gear[k])) {
          for (const id of block.exerciseIds) {
            if (!base.includes(id)) base.push(id);
          }
        }
      }
    }
    return base;
  }
  return [];
}

export interface SessionSlot {
  exerciseId: string;
  phase: SessionPhase;
  /** 1-based round for work phase */
  round?: number;
  totalRounds?: number;
  /** Index inside the work circuit (0-based) */
  circuitIndex?: number;
  circuitLength?: number;
}

/**
 * Build full follow-along session:
 * warmup (1×) → work circuit × N rounds → cooldown (1×)
 */
export function buildSessionSlots(
  programId: ProgramId,
  opts: {
    week?: number;
    gear?: GearKit;
    includeGearOverload?: boolean;
    /** Custom program: use these as the work circuit */
    customIds?: string[];
    includeWarmup?: boolean;
    includeCooldown?: boolean;
  } = {},
): SessionSlot[] {
  const week = opts.week ?? currentProgramWeek();
  const work =
    programId === "custom"
      ? [...(opts.customIds ?? [])]
      : resolveProgramExercises(programId, opts);
  if (!work.length) return [];

  const rounds = circuitRounds(programId, week);
  const slots: SessionSlot[] = [];
  const withWarmup = opts.includeWarmup !== false;
  const withCooldown = opts.includeCooldown !== false;

  if (withWarmup) {
    for (const id of WARMUP_IDS) {
      slots.push({ exerciseId: id, phase: "warmup" });
    }
  }

  for (let r = 1; r <= rounds; r++) {
    work.forEach((id, i) => {
      slots.push({
        exerciseId: id,
        phase: "work",
        round: r,
        totalRounds: rounds,
        circuitIndex: i,
        circuitLength: work.length,
      });
    });
  }

  if (withCooldown) {
    for (const id of COOLDOWN_IDS) {
      slots.push({ exerciseId: id, phase: "cooldown" });
    }
  }

  return slots;
}

export function sessionSummary(
  slots: SessionSlot[],
): { moves: number; rounds: number; workPerRound: number } {
  const work = slots.filter((s) => s.phase === "work");
  const rounds = work[0]?.totalRounds ?? 1;
  const workPerRound = work[0]?.circuitLength ?? work.length;
  return { moves: slots.length, rounds, workPerRound };
}

function exerciseAllowedWithGear(exerciseId: string, gear: GearKit): boolean {
  const ex = getExercise(exerciseId);
  if (!ex) return false;
  return ex.equipment.every((eq) => {
    if (eq === "bodyweight") return true;
    return Boolean(gear[eq as keyof GearKit]);
  });
}

/** Calories for a full expanded session (1 set per slot). */
export function programCalories(
  exerciseIds: string[],
  bodyWeightKg: number,
  opts?: { rounds?: number },
): number {
  const rounds = opts?.rounds ?? 1;
  return exerciseIds.reduce((sum, id) => {
    const ex = getExercise(id);
    if (!ex) return sum;
    const sets = 1 * rounds;
    return (
      sum +
      estimateExerciseCalories({
        met: ex.met,
        bodyWeightKg,
        sets,
        reps: ex.defaultReps,
        secondsPerSet: ex.defaultSeconds,
        unit: ex.unit,
      })
    );
  }, 0);
}

export function sessionCalories(
  slots: SessionSlot[],
  bodyWeightKg: number,
): number {
  return slots.reduce((sum, slot) => {
    const ex = getExercise(slot.exerciseId);
    if (!ex) return sum;
    return (
      sum +
      estimateExerciseCalories({
        met: ex.met,
        bodyWeightKg,
        sets: 1,
        reps: ex.defaultReps,
        secondsPerSet: ex.defaultSeconds,
        unit: ex.unit,
      })
    );
  }, 0);
}

export function estimateDurationMin(
  exerciseIds: string[],
  restSeconds: number,
  opts?: { rounds?: number; includeWarmupCooldown?: boolean },
): number {
  const rounds = opts?.rounds ?? 1;
  const slots = opts?.includeWarmupCooldown
    ? [
        ...WARMUP_IDS.map((id) => id as string),
        ...Array.from({ length: rounds }, () => exerciseIds).flat(),
        ...COOLDOWN_IDS.map((id) => id as string),
      ]
    : Array.from({ length: rounds }, () => exerciseIds).flat();

  let work = 0;
  let rests = 0;
  for (let i = 0; i < slots.length; i++) {
    const ex = getExercise(slots[i]);
    if (!ex) continue;
    if (ex.unit === "reps") work += ex.defaultReps * 2.5;
    else work += ex.defaultSeconds || 30;
    if (i < slots.length - 1) rests += restSeconds;
  }
  // Extra rest between rounds
  if (rounds > 1 && exerciseIds.length) {
    rests += (rounds - 1) * ROUND_REST_SECONDS;
  }
  return Math.max(1, Math.round((work + rests) / 60));
}

export function estimateSessionDurationMin(
  slots: SessionSlot[],
  restSeconds: number,
): number {
  let work = 0;
  let rests = 0;
  for (let i = 0; i < slots.length; i++) {
    const ex = getExercise(slots[i].exerciseId);
    if (!ex) continue;
    if (ex.unit === "reps") work += Math.max(8, ex.defaultReps) * 2.2;
    else work += ex.defaultSeconds || 30;
    if (i < slots.length - 1) {
      const next = slots[i + 1];
      const endOfRound =
        slots[i].phase === "work" &&
        next?.phase === "work" &&
        (next.round ?? 1) > (slots[i].round ?? 1);
      rests += endOfRound ? ROUND_REST_SECONDS : restSeconds;
    }
  }
  return Math.max(1, Math.round((work + rests) / 60));
}

/** Suggest swaps: same focus preference, same or easier difficulty, gear-ok, work only */
export function alternativesFor(
  exerciseId: string,
  opts: { gear?: GearKit; excludeIds?: string[] } = {},
): string[] {
  const ex = getExercise(exerciseId);
  if (!ex) return [];
  const gear = opts.gear ?? EMPTY_GEAR;
  const exclude = new Set(opts.excludeIds ?? []);
  exclude.add(exerciseId);
  // Don't swap into pure warmup/cooldown for work moves
  const nonSwap = new Set<string>([
    ...WARMUP_IDS,
    ...COOLDOWN_IDS,
  ]);
  const difficultyRank: Record<Difficulty, number> = {
    beginner: 0,
    intermediate: 1,
    advanced: 2,
  };
  return exercises
    .filter((cand) => {
      if (exclude.has(cand.id)) return false;
      if (nonSwap.has(cand.id) && !nonSwap.has(exerciseId)) return false;
      if (!exerciseAllowedWithGear(cand.id, gear)) return false;
      if (cand.role === "warmup" || cand.role === "cooldown") {
        if (ex.role !== cand.role) return false;
      }
      const shareFocus = cand.focus.some((f) => ex.focus.includes(f));
      const notHarder =
        difficultyRank[cand.difficulty] <= difficultyRank[ex.difficulty] + 1;
      return shareFocus && notHarder;
    })
    .sort((a, b) => {
      const aShare = a.focus.filter((f) => ex.focus.includes(f)).length;
      const bShare = b.focus.filter((f) => ex.focus.includes(f)).length;
      if (bShare !== aShare) return bShare - aShare;
      return a.popularRank - b.popularRank;
    })
    .map((e) => e.id)
    .slice(0, 8);
}

export function equipmentLabel(eq: Equipment): string {
  return eq;
}

export function phaseLabel(phase: SessionPhase): string {
  if (phase === "warmup") return "Warm-up";
  if (phase === "cooldown") return "Cooldown";
  return "Circuit";
}
