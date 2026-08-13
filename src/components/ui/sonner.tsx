import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-fg)] shadow-[var(--shadow-soft)]",
          description: "text-[var(--color-muted)]",
        },
      }}
    />
  );
}
