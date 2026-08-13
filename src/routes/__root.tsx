import type { ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AppShell } from "@/components/fitness/shell";
import { useFitnessStore } from "@/store/fitness";
import { Onboarding } from "@/components/fitness/onboarding";
import { ClientOnly } from "@/components/fitness/client-only";
import { isPagesSpa } from "@/lib/public-url";
import appCss from "@/styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { title: "CoreForge — Ab Training" },
      {
        name: "description",
        content:
          "Follow-along abs workouts with full-body form demos. Open the app, start a circuit, and follow along.",
      },
      { name: "theme-color", content: "#0a0b0c" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Outfit:wght@500;600;700&display=swap",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <ClientOnly
        fallback={
          <AppShell>
            <div className="flex min-h-[50dvh] items-center justify-center">
              <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--color-primary)]/40" />
            </div>
          </AppShell>
        }
      >
        <AppBody />
      </ClientOnly>
    </RootDocument>
  );
}

function AppBody() {
  const onboarded = useFitnessStore((s) => s.profile.onboarded);

  return (
    <AppShell>
      {onboarded ? <Outlet /> : <Onboarding />}
      <Toaster />
    </AppShell>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  if (isPagesSpa) {
    return <>{children}</>;
  }
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
