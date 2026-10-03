import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, Dumbbell, Home, UserRound, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { isResumableSession, useFitnessStore } from "@/store/fitness";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/exercises", label: "Moves", icon: Dumbbell },
  { to: "/calendar", label: "Log", icon: CalendarDays },
  { to: "/profile", label: "You", icon: UserRound },
] as const;

function routePath(pathname: string, hash: string): string {
  const fromHash = hash.replace(/^#/, "").split("?")[0];
  let raw = fromHash.startsWith("/") ? fromHash : pathname;
  raw = raw.replace(/\/+$/, "") || "/";
  if (raw === "/coreforge" || raw.startsWith("/coreforge/")) {
    raw = raw.slice("/coreforge".length) || "/";
  }
  if (raw === "/index.html" || raw.endsWith("/index.html")) return "/";
  return raw;
}

function isHomePath(path: string): boolean {
  return path === "/" || path === "" || path === "/index.html";
}

function tabIsActive(path: string, to: string): boolean {
  if (to === "/") return path === "/";
  return path === to || path.startsWith(`${to}/`);
}

export function AppShell({ children }: { children: ReactNode }) {
  const location = useRouterState({ select: (s) => s.location });
  const path = routePath(location.pathname, location.hash);
  const active = useFitnessStore((s) => s.active);
  const onboarded = useFitnessStore((s) => s.profile.onboarded);
  const cinema = path === "/workout" || !onboarded;
  const showHeaderResume = isResumableSession(active) && !isHomePath(path);

  return (
    <div className="mesh-bg min-h-dvh">
      <div
        className={cn(
          "mx-auto flex w-full max-w-lg flex-col md:max-w-3xl",
          cinema ? "h-dvh overflow-hidden px-0 pt-0" : "min-h-dvh px-4 pt-4 md:px-6",
        )}
      >
        {!cinema && (
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
          {showHeaderResume && (
            <Link
              to="/workout"
              className="rounded-full border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10 px-3 py-1.5 text-xs font-medium text-[var(--color-primary)]"
            >
              Resume workout
            </Link>
          )}
        </header>
        )}

        <main
          className={cn(
            "flex-1",
            cinema ? "flex min-h-0 flex-col overflow-hidden" : "pb-28",
          )}
        >
          {children}
        </main>

        {!cinema && (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-bg)_92%,transparent)] backdrop-blur-md safe-pb">
          <div className="mx-auto grid max-w-lg grid-cols-4 gap-1 px-2 py-2 md:max-w-3xl">
            {nav.map(({ to, label, icon: Icon }) => {
              const isActive = tabIsActive(path, to);
              return (
                <Link
                  key={to}
                  to={to}
                  activeOptions={{ exact: to === "/" }}
                  aria-current={isActive ? "page" : undefined}
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
        )}
      </div>
    </div>
  );
}
