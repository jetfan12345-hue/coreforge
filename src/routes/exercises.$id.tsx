import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Heart, Play, Flame, Clock, Target } from "lucide-react";
import { getExercise, estimateExerciseCalories } from "@/data/exercises";
import { ExerciseMedia } from "@/components/fitness/exercise-media";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFitnessStore } from "@/store/fitness";
import { toast } from "sonner";

export const Route = createFileRoute("/exercises/$id")({
  component: ExerciseDetailPage,
});

function ExerciseDetailPage() {
  const { id } = Route.useParams();
  const exercise = getExercise(id);
  const navigate = useNavigate();
  const bodyKg = useFitnessStore((s) => s.bodyWeightKg());
  const profile = useFitnessStore((s) => s.profile);
  const favorites = useFitnessStore((s) => s.favorites);
  const toggleFavorite = useFitnessStore((s) => s.toggleFavorite);
  const startWorkout = useFitnessStore((s) => s.startWorkout);

  if (!exercise) {
    return (
      <div className="py-16 text-center">
        <p className="text-[var(--color-muted)]">Exercise not found.</p>
        <Button asChild className="mt-4" variant="secondary">
          <Link to="/exercises">Back to library</Link>
        </Button>
      </div>
    );
  }

  const est = estimateExerciseCalories({
    met: exercise.met,
    bodyWeightKg: bodyKg,
    sets: exercise.defaultSets,
    reps: exercise.defaultReps,
    secondsPerSet: exercise.defaultSeconds,
    unit: exercise.unit,
  });
  const isFav = favorites.includes(exercise.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link to="/exercises">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <span className="text-xs text-[var(--color-muted)]">Exercise detail</span>
      </div>

      <ExerciseMedia exercise={exercise} />

      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-1.5 flex flex-wrap gap-1.5">
              <Badge>#{exercise.popularRank} popular</Badge>
              <Badge variant="secondary" className="capitalize">
                {exercise.difficulty}
              </Badge>
              {exercise.weighted && <Badge variant="weighted">Weighted</Badge>}
            </div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              {exercise.name}
            </h1>
          </div>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => toggleFavorite(exercise.id)}
            aria-label="Toggle favorite"
          >
            <Heart
              className={
                isFav ? "fill-[var(--color-danger)] text-[var(--color-danger)]" : ""
              }
            />
          </Button>
        </div>
        <p className="text-sm text-[var(--color-muted)]">{exercise.description}</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Metric
          icon={<Flame className="h-3.5 w-3.5 text-[var(--color-primary)]" />}
          label="Est. burn"
          value={`~${est} cal`}
          hint={`${profile.weight}${profile.weightUnit}`}
        />
        <Metric
          icon={<Clock className="h-3.5 w-3.5" />}
          label="Default"
          value={`${exercise.defaultSets}×${
            exercise.unit === "reps"
              ? exercise.defaultReps
              : `${exercise.defaultSeconds}s`
          }`}
          hint={`${exercise.restSeconds}s rest`}
        />
        <Metric
          icon={<Target className="h-3.5 w-3.5" />}
          label="MET"
          value={String(exercise.met)}
          hint="intensity"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {exercise.focus.map((f) => (
          <Badge key={f} variant="secondary" className="capitalize">
            {f}
          </Badge>
        ))}
        {exercise.equipment.map((eq) => (
          <Badge key={eq} variant="secondary" className="capitalize">
            {eq}
          </Badge>
        ))}
      </div>

      <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="font-display text-base font-semibold">How to</h2>
        <ol className="mt-3 space-y-2.5">
          {exercise.howTo.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-[var(--color-muted)]">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-xs font-semibold text-[var(--color-primary)] tabular">
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="sticky bottom-24 z-20 flex gap-2 sm:static sm:bottom-auto">
        <Button
          className="flex-1"
          size="lg"
          onClick={() => {
            startWorkout([exercise.id]);
            toast.success(`Started ${exercise.name}`);
            void navigate({ to: "/workout" });
          }}
        >
          <Play className="h-4 w-4" />
          Log this move
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="flex-1"
          onClick={() => {
            startWorkout(
              [
                exercise.id,
                "plank",
                "bicycle-crunch",
                "russian-twist",
              ].filter((x, i, a) => a.indexOf(x) === i),
            );
            void navigate({ to: "/workout" });
          }}
        >
          Add to circuit
        </Button>
      </div>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <div className="mb-1 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-[var(--color-subtle)]">
        {icon}
        {label}
      </div>
      <div className="font-display text-base font-semibold tabular">{value}</div>
      <div className="text-[11px] text-[var(--color-subtle)]">{hint}</div>
    </div>
  );
}
