import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Dumbbell, Heart, Timer, Flame } from "lucide-react";
import type { Exercise } from "@/data/exercises";
import { estimateExerciseCalories, resolveExerciseMedia } from "@/data/exercises";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useFitnessStore } from "@/store/fitness";

export function ExerciseCard({
  exercise,
  bodyKg,
  compact,
}: {
  exercise: Exercise;
  bodyKg: number;
  compact?: boolean;
}) {
  const favorites = useFitnessStore((s) => s.favorites);
  const toggleFavorite = useFitnessStore((s) => s.toggleFavorite);
  const demoModel = useFitnessStore((s) => s.profile.demoModel ?? "male");
  const media = resolveExerciseMedia(exercise, demoModel);
  const [imgSrc, setImgSrc] = useState(media.image);
  const isFav = favorites.includes(exercise.id);
  const est = estimateExerciseCalories({
    met: exercise.met,
    bodyWeightKg: bodyKg,
    sets: exercise.defaultSets,
    reps: exercise.defaultReps,
    secondsPerSet: exercise.defaultSeconds,
    unit: exercise.unit,
  });

  useEffect(() => {
    setImgSrc(media.image);
  }, [media.image]);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] transition hover:border-[var(--color-border-strong)]",
        compact ? "flex gap-3 p-3" : "flex flex-col",
      )}
    >
      <Link
        to="/exercises/$id"
        params={{ id: exercise.id }}
        className={cn(compact ? "flex min-w-0 flex-1 gap-3" : "block")}
      >
        <div
          className={cn(
            "relative overflow-hidden bg-[var(--color-surface-2)]",
            compact
              ? "h-20 w-20 shrink-0 rounded-[var(--radius-md)]"
              : "aspect-[5/3] w-full",
          )}
        >
          <img
            src={imgSrc}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            onError={(e) => {
              if (imgSrc !== media.femaleImage) {
                setImgSrc(media.femaleImage);
              } else {
                (e.target as HTMLImageElement).style.display = "none";
              }
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          {!compact && (
            <div className="absolute bottom-2 left-2 flex gap-1.5">
              <Badge variant="secondary" className="bg-black/50 text-white border-0">
                #{exercise.popularRank}
              </Badge>
              {exercise.weighted && <Badge variant="weighted">Weighted</Badge>}
            </div>
          )}
        </div>

        <div className={cn(compact ? "min-w-0 py-0.5" : "p-4 pt-3")}>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-[15px] font-semibold leading-snug tracking-tight">
              {exercise.name}
            </h3>
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-[var(--color-muted)]">
            {exercise.description}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--color-subtle)]">
            <span className="inline-flex items-center gap-1">
              <Flame className="h-3 w-3 text-[var(--color-primary)]" />~{est} cal
            </span>
            <span className="inline-flex items-center gap-1 capitalize">
              <Timer className="h-3 w-3" />
              {exercise.unit === "reps"
                ? `${exercise.defaultSets}×${exercise.defaultReps}`
                : exercise.unit === "hold"
                  ? `${exercise.defaultSeconds}s hold`
                  : `${exercise.defaultSeconds}s`}
            </span>
            {exercise.equipment[0] !== "bodyweight" && (
              <span className="inline-flex items-center gap-1">
                <Dumbbell className="h-3 w-3" />
                {exercise.equipment[0]}
              </span>
            )}
          </div>
        </div>
      </Link>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(exercise.id);
        }}
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/55"
        aria-label={isFav ? "Remove favorite" : "Add favorite"}
      >
        <Heart
          className={cn(
            "h-4 w-4",
            isFav && "fill-[var(--color-danger)] text-[var(--color-danger)]",
          )}
        />
      </button>
    </div>
  );
}
