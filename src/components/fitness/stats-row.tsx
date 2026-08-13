import { Flame, CalendarCheck, Dumbbell, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatsRow({
  items,
}: {
  items: { label: string; value: string; icon?: "flame" | "calendar" | "dumbbell" | "trend" }[];
}) {
  const icons = {
    flame: Flame,
    calendar: CalendarCheck,
    dumbbell: Dumbbell,
    trend: TrendingUp,
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon ? icons[item.icon] : Flame;
        return (
          <div
            key={item.label}
            className={cn(
              "rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5",
            )}
          >
            <div className="mb-2 flex items-center gap-1.5 text-[var(--color-subtle)]">
              <Icon className="h-3.5 w-3.5" />
              <span className="text-[11px] font-medium uppercase tracking-wide">
                {item.label}
              </span>
            </div>
            <div className="font-display text-xl font-semibold tabular tracking-tight">
              {item.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
