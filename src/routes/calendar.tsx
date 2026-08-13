import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import { format, parseISO } from "date-fns";
import { Flame, Trash2, Dumbbell } from "lucide-react";
import { getExercise } from "@/data/exercises";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFitnessStore, dateKey } from "@/store/fitness";
import { toast } from "sonner";
import "react-day-picker/style.css";

export const Route = createFileRoute("/calendar")({
  component: CalendarPage,
});

function CalendarPage() {
  const navigate = useNavigate();
  const history = useFitnessStore((s) => s.history);
  const deleteWorkout = useFitnessStore((s) => s.deleteWorkout);
  const startWorkout = useFitnessStore((s) => s.startWorkout);
  const [selected, setSelected] = useState<Date>(new Date());

  const selectedKey = dateKey(selected);
  const dayWorkouts = history.filter((w) => w.date === selectedKey);

  const workoutDays = useMemo(() => {
    return history.map((w) => parseISO(w.date));
  }, [history]);

  const monthCals = useMemo(() => {
    const y = selected.getFullYear();
    const m = selected.getMonth();
    return history
      .filter((w) => {
        const d = parseISO(w.date);
        return d.getFullYear() === y && d.getMonth() === m;
      })
      .reduce((a, w) => a + w.totalCalories, 0);
  }, [history, selected]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Training log
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Tap a day to review what you trained · {monthCals} cal this month
        </p>
      </div>

      <Card>
        <CardContent className="flex justify-center p-4 sm:p-5">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={(d) => d && setSelected(d)}
            modifiers={{ trained: workoutDays }}
            modifiersClassNames={{
              trained: "rdp-trained",
            }}
            className="rdp-root"
          />
        </CardContent>
      </Card>

      <style>{`
        .rdp-trained:not(.rdp-selected) .rdp-day_button {
          box-shadow: inset 0 -3px 0 0 var(--color-primary);
        }
      `}</style>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">
            {format(selected, "EEEE, MMM d")}
          </h2>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              startWorkout(
                ["bicycle-crunch", "plank", "russian-twist", "leg-raise"],
                { date: selectedKey },
              );
              void navigate({ to: "/workout" });
            }}
          >
            Train this day
          </Button>
        </div>

        {dayWorkouts.length === 0 ? (
          <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)]/50 px-5 py-10 text-center">
            <Dumbbell className="mx-auto mb-2 h-6 w-6 text-[var(--color-subtle)]" />
            <p className="text-sm text-[var(--color-muted)]">
              No sessions logged for this day yet.
            </p>
          </div>
        ) : (
          dayWorkouts.map((w) => (
            <Card key={w.id}>
              <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base">
                    {w.exercises.length} exercise
                    {w.exercises.length === 1 ? "" : "s"}
                  </CardTitle>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
                    <Flame className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                    {w.totalCalories} cal ·{" "}
                    {format(parseISO(w.finishedAt), "h:mm a")}
                  </p>
                </div>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => {
                    deleteWorkout(w.id);
                    toast.message("Session removed");
                  }}
                  aria-label="Delete session"
                >
                  <Trash2 className="h-4 w-4 text-[var(--color-muted)]" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {w.exercises.map((ex, i) => {
                  const meta = getExercise(ex.exerciseId);
                  return (
                    <div
                      key={`${ex.exerciseId}-${i}`}
                      className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {meta?.name ?? ex.exerciseId}
                        </p>
                        <p className="text-xs text-[var(--color-subtle)]">
                          {ex.sets.length} set{ex.sets.length === 1 ? "" : "s"}
                          {ex.sets[0]?.weightLbs
                            ? ` · ${ex.sets[0].weightLbs} lb`
                            : ""}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs tabular text-[var(--color-primary)]">
                        {ex.calories} cal
                      </span>
                    </div>
                  );
                })}
                {w.notes && (
                  <p className="text-xs text-[var(--color-muted)]">{w.notes}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </section>

      {history.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-display text-lg font-semibold">Recent</h2>
          {history.slice(0, 8).map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => setSelected(parseISO(w.date))}
              className="flex w-full items-center justify-between rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-left transition hover:border-[var(--color-border-strong)]"
            >
              <span className="text-sm font-medium">
                {format(parseISO(w.date), "MMM d, yyyy")}
              </span>
              <span className="text-xs text-[var(--color-muted)]">
                {w.exercises.length} moves · {w.totalCalories} cal
              </span>
            </button>
          ))}
        </section>
      )}
    </div>
  );
}
