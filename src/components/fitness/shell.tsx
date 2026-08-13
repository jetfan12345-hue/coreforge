import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, Dumbbell, Home, UserRound, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFitnessStore } from "@/store/fitness";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/exercises", label: "Moves", icon: Dumbbell },
  { to: "/calendar", label: "Log", icon: CalendarDays },
  { to: "/profile", label: "You", icon: UserRound },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = useFitnessStore((s) => s.active);

  return (
    <div className="mesh-bg min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pt-4 md:max-w-3xl md:px-6">
        <header className="mb-4 flex items-center justify-between gap-3">
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] text-[var(--color-primary-fg)] shadow-[0_0_24px_color-mix(in_oklab,var(--color-primary)_35%,transparent)]">
              <Flame className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <div className="leading-tight">
              <div className="font-display text-base font-semibold tracking-tight">
                CoreForge
              </div>
              <div className="text-xs text-[var(--color-subtle)]">Abs first. Progress daily.</div>
            </div>
          </Link>
          {active && (
            <Link
              to="/workout"
              className="rounded-full border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10 px-3 py-1.5 text-xs font-medium text-[var(--color-primary)]"
            >
              Resume workout
            </Link>
          )}
        </header>

        <main className="flex-1 pb-28">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-bg)_92%,transparent)] backdrop-blur-md safe-pb">
          <div className="mx-auto grid max-w-lg grid-cols-4 gap-1 px-2 py-2 md:max-w-3xl">
            {nav.map(({ to, label, icon: Icon }) => {
              const isActive =
                to === "/"
                  ? pathname === "/"
                  : pathname === to || pathname.startsWith(`${to}/`);
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-[var(--radius-md)] text-[11px] font-medium transition-colors",
                    isActive
                      ? "bg-[var(--color-surface-2)] text-[var(--color-primary)]"
                      : "text-[var(--color-muted)] hover:text-[var(--color-fg)]",
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 1.75} />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
