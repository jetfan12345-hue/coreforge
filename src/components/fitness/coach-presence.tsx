import { Check } from "lucide-react";
import { heroImage, type DemoModel } from "@/data/exercises";
import { pickCoachLine } from "@/data/coach-lines";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

const COACH_COPY: Record<DemoModel, { label: string; blurb: string }> = {
  female: {
    label: "Female",
    blurb: "Full library · optional trash talk",
  },
  male: {
    label: "Male",
    blurb: "Beginner circuit · no trash talk",
  },
};

export function CoachPresence({
  value,
  onChange,
  trashTalk,
  onTrashTalkChange,
  sampleLine,
}: {
  value: DemoModel;
  onChange: (next: DemoModel) => void;
  trashTalk?: boolean;
  onTrashTalkChange?: (next: boolean) => void;
  sampleLine?: string;
}) {
  const preview = useMemo(
    () => sampleLine ?? pickCoachLine("work").text,
    [sampleLine, trashTalk],
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {(["female", "male"] as const).map((m) => {
          const on = value === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => onChange(m)}
              className={cn(
                "overflow-hidden rounded-[var(--radius-lg)] border text-left transition",
                on
                  ? "border-[var(--color-primary)]/50 ring-1 ring-[var(--color-primary)]/30"
                  : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]",
              )}
            >
              <div className="relative h-28 w-full sm:h-32">
                <img
                  src={heroImage(m)}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover object-[center_18%]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                {on && (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-primary-fg)]">
                    <Check className="h-3 w-3" />
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 p-2.5">
                  <p className="text-sm font-semibold text-white">
                    {COACH_COPY[m].label}
                  </p>
                  <p className="text-[10px] text-white/75">{COACH_COPY[m].blurb}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {value === "female" && onTrashTalkChange && (
        <button
          type="button"
          onClick={() => onTrashTalkChange(!trashTalk)}
          className={cn(
            "flex w-full items-start gap-3 rounded-[var(--radius-lg)] border px-3 py-3 text-left transition",
            trashTalk
              ? "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10"
              : "border-[var(--color-border)] bg-[var(--color-surface-2)]",
          )}
        >
          <span
            className={cn(
              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
              trashTalk
                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-fg)]"
                : "border-[var(--color-border-strong)]",
            )}
          >
            {trashTalk && <Check className="h-3 w-3" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium">Coach talks shit</span>
            <span className="block text-xs text-[var(--color-muted)]">
              On-screen lines mid-set. Female only. No robot voice.
            </span>
            {trashTalk && (
              <span className="mt-2 block rounded-md border border-[var(--color-primary)]/25 bg-black/25 px-2.5 py-1.5 font-display text-sm font-semibold text-[var(--color-primary)]">
                “{preview}”
              </span>
            )}
          </span>
        </button>
      )}

      {value === "male" && (
        <p className="text-xs text-[var(--color-muted)]">
          Trash talk stays with the female coach. Flip to Female to turn it on.
        </p>
      )}
    </div>
  );
}
