import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { exercises, sortByPopular, type Equipment } from "@/data/exercises";
import { ExerciseCard } from "@/components/fitness/exercise-card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFitnessStore } from "@/store/fitness";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/exercises/")({
  component: ExercisesPage,
});

type GearTab =
  | "bodyweight"
  | "any-gear"
  | "barbell"
  | "plate"
  | "cable"
  | "pull-up bar"
  | "ab wheel"
  | "all";

/** Primary split people want: no gear vs gear, then specific tools */
const GEAR_TABS: { value: GearTab; label: string }[] = [
  { value: "bodyweight", label: "No gear" },
  { value: "any-gear", label: "Needs gear" },
  { value: "all", label: "All" },
  { value: "barbell", label: "Barbell" },
  { value: "plate", label: "Plates" },
  { value: "cable", label: "Cable / pulldown" },
  { value: "pull-up bar", label: "Pull-up" },
  { value: "ab wheel", label: "Ab wheel" },
];

function ExercisesPage() {
  const bodyKg = useFitnessStore((s) => s.bodyWeightKg());
  const favorites = useFitnessStore((s) => s.favorites);
  const [q, setQ] = useState("");
  const [gear, setGear] = useState<GearTab>("bodyweight");
  const [level, setLevel] = useState<
    "all" | "beginner" | "intermediate" | "advanced" | "favorites"
  >("all");

  const list = useMemo(() => {
    let items = sortByPopular(exercises);

    if (gear === "bodyweight") {
      items = items.filter(
        (e) =>
          e.equipment.every((eq) => eq === "bodyweight") && !e.weighted,
      );
    } else if (gear === "any-gear") {
      items = items.filter(
        (e) =>
          e.weighted || e.equipment.some((eq) => eq !== "bodyweight"),
      );
    } else if (gear !== "all") {
      items = items.filter((e) => e.equipment.includes(gear as Equipment));
    }

    if (level === "beginner" || level === "intermediate" || level === "advanced") {
      items = items.filter((e) => e.difficulty === level);
    }
    if (level === "favorites") {
      items = items.filter((e) => favorites.includes(e.id));
    }

    if (q.trim()) {
      const s = q.toLowerCase();
      items = items.filter(
        (e) =>
          e.name.toLowerCase().includes(s) ||
          e.focus.some((f) => f.includes(s)) ||
          e.equipment.some((eq) => eq.includes(s)) ||
          (s.includes("pulldown") && e.equipment.includes("cable")) ||
          (s.includes("pull down") && e.equipment.includes("cable")),
      );
    }
    return items;
  }, [q, gear, level, favorites]);

  const bodyCount = list.filter(
    (e) => e.equipment.every((eq) => eq === "bodyweight") && !e.weighted,
  ).length;
  const gearCount = list.length - bodyCount;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Exercise library
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {list.length === 0
            ? "No moves match these filters"
            : gearCount === 0
              ? `${bodyCount} bodyweight · form demos`
              : bodyCount === 0
                ? `${gearCount} with gear · form demos`
                : `${bodyCount} bodyweight · ${gearCount} with gear · form demos`}
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-subtle)]" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search moves, barbell, plates, cable…"
          className="pl-9"
        />
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-subtle)]">
          Equipment
        </p>
        <Tabs value={gear} onValueChange={(v) => setGear(v as GearTab)}>
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
            {GEAR_TABS.map(({ value, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className={cn("flex-none data-[state=active]:shadow-none")}
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-subtle)]">
          Level
        </p>
        <Tabs value={level} onValueChange={(v) => setLevel(v as typeof level)}>
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
            {(
              [
                ["all", "All"],
                ["beginner", "Beginner"],
                ["intermediate", "Intermediate"],
                ["advanced", "Advanced"],
                ["favorites", "Favorites"],
              ] as const
            ).map(([value, label]) => (
              <TabsTrigger
                key={value}
                value={value}
                className={cn("flex-none data-[state=active]:shadow-none")}
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((ex, i) => (
          <ExerciseCard
            key={ex.id}
            exercise={ex}
            bodyKg={bodyKg}
            listIndex={i + 1}
          />
        ))}
      </div>

      {list.length === 0 && (
        <p className="py-12 text-center text-sm text-[var(--color-muted)]">
          No exercises match that filter.
        </p>
      )}
    </div>
  );
}
