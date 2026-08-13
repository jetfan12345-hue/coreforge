import { useState } from "react";
import { ArrowRight, Check, Dumbbell, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EMPTY_GEAR,
  GEAR_OPTIONS,
  type GearKit,
} from "@/data/programs";
import { CoachPresence } from "@/components/fitness/coach-presence";
import { heroImage } from "@/data/exercises";
import { useFitnessStore, type UserProfile } from "@/store/fitness";
import { cn } from "@/lib/utils";

type Gate = "start" | "details";

export function Onboarding() {
  const complete = useFitnessStore((s) => s.completeOnboarding);
  const existing = useFitnessStore((s) => s.profile);
  const [gate, setGate] = useState<Gate>("start");
  const [form, setForm] = useState<UserProfile>({
    ...existing,
    gear: { ...EMPTY_GEAR, ...(existing.gear ?? {}) },
    restSeconds: existing.restSeconds ?? 10,
    includeGearOverload: existing.includeGearOverload ?? true,
    onboarded: false,
  });

  const set = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleGear = (key: keyof GearKit) =>
    setForm((f) => ({
      ...f,
      gear: { ...EMPTY_GEAR, ...f.gear, [key]: !f.gear?.[key] },
    }));

  const rest = form.restSeconds ?? 10;
  const ownedCount = GEAR_OPTIONS.filter((g) => form.gear?.[g.key]).length;
  const coach = form.demoModel ?? existing.demoModel ?? "female";

  const finish = (opts: { floor: boolean }) => {
    complete({
      name: form.name.trim() || existing.name.trim() || "Athlete",
      age: form.age || 30,
      weight: form.weight || 180,
      height: form.height || 70,
      weightUnit: form.weightUnit,
      heightUnit: form.heightUnit,
      goal: form.goal,
      restSeconds: rest,
      gear: opts.floor ? { ...EMPTY_GEAR } : form.gear,
      includeGearOverload: opts.floor ? true : form.includeGearOverload,
      demoModel: form.demoModel ?? existing.demoModel ?? "female",
      coachTrashTalk: form.coachTrashTalk ?? existing.coachTrashTalk ?? false,
      programStartedAt: new Date().toISOString().slice(0, 10),
    });
  };

  if (gate === "start") {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-end px-5 pb-10 pt-8">
        <div className="relative mb-8 overflow-hidden rounded-[28px] border border-[var(--color-border)]">
          <img
            src={heroImage(coach)}
            alt=""
            className="aspect-[4/5] h-[min(52dvh,440px)] w-full object-cover object-[center_18%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-primary)]">
              CoreForge
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-white text-balance">
              Abs. Six minutes. Let’s go.
            </h1>
            <p className="mt-2 text-sm text-white/70">
              Warm-up, a short floor circuit, stretch. Follow the demo.
            </p>
          </div>
        </div>

        <Button
          size="lg"
          className="h-14 w-full text-base font-semibold"
          onClick={() => finish({ floor: true })}
        >
          Get to it
          <ArrowRight className="h-5 w-5" />
        </Button>
        <button
          type="button"
          onClick={() => setGate("details")}
          className="mt-3 w-full py-3 text-sm font-medium text-[var(--color-muted)] underline-offset-4 hover:text-[var(--color-fg)] hover:underline"
        >
          Enter some details
        </button>
        <p className="mt-2 text-center text-[11px] text-[var(--color-subtle)]">
          Floor only · change gear anytime in You
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-5 py-6">
      <p className="mb-1 text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-primary)]">
        Optional
      </p>
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        A few details
      </h1>
      <p className="mt-2 mb-5 text-sm text-[var(--color-muted)]">
        Skip any of this. You can train without filling it in.
      </p>

      <div className="space-y-4 pb-8">
        <div className="space-y-2 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <Label className="text-xs font-medium uppercase tracking-wide text-[var(--color-subtle)]">
            Demo coach
          </Label>
          <CoachPresence
            value={form.demoModel ?? "female"}
            onChange={(v) => set("demoModel", v)}
            trashTalk={form.coachTrashTalk}
            onTrashTalkChange={(v) => set("coachTrashTalk", v)}
          />
        </div>

        <div className="space-y-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div>
            <p className="text-sm font-semibold">Gear</p>
            <p className="text-xs text-[var(--color-muted)]">
              Floor-only works. Tools unlock extra Advanced moves.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setForm((f) => ({
                ...f,
                gear: { ...EMPTY_GEAR },
              }))
            }
            className={cn(
              "flex w-full items-center gap-3 rounded-[var(--radius-lg)] border px-3 py-3 text-left transition",
              ownedCount === 0
                ? "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10"
                : "border-[var(--color-border)] bg-[var(--color-surface-2)]",
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                ownedCount === 0
                  ? "bg-[var(--color-primary)] text-[var(--color-primary-fg)]"
                  : "bg-[var(--color-surface-3)] text-[var(--color-muted)]",
              )}
            >
              {ownedCount === 0 ? (
                <Check className="h-4 w-4" />
              ) : (
                <Dumbbell className="h-4 w-4" />
              )}
            </span>
            <span>
              <span className="block text-sm font-medium">No gear · floor only</span>
              <span className="text-xs text-[var(--color-muted)]">
                Beginner through Advanced still run
              </span>
            </span>
          </button>
          <div className="grid grid-cols-2 gap-2">
            {GEAR_OPTIONS.map(({ key, label, hint }) => {
              const on = Boolean(form.gear?.[key]);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleGear(key)}
                  className={cn(
                    "flex flex-col items-start gap-0.5 rounded-[var(--radius-lg)] border px-3 py-2.5 text-left transition",
                    on
                      ? "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/12"
                      : "border-[var(--color-border)] bg-[var(--color-surface-2)]",
                  )}
                >
                  <span className="flex w-full items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{label}</span>
                    <span
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-full border",
                        on
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-fg)]"
                          : "border-[var(--color-border-strong)]",
                      )}
                    >
                      {on && <Check className="h-2.5 w-2.5" />}
                    </span>
                  </span>
                  <span className="text-[10px] text-[var(--color-subtle)]">
                    {hint}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Optional"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min={13}
                max={100}
                value={form.age}
                onChange={(e) => set("age", Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Goal</Label>
              <Select
                value={form.goal}
                onValueChange={(v) => set("goal", v as UserProfile["goal"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="definition">Definition</SelectItem>
                  <SelectItem value="strength">Strength</SelectItem>
                  <SelectItem value="endurance">Endurance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight</Label>
              <div className="flex gap-2">
                <Input
                  id="weight"
                  type="number"
                  min={50}
                  value={form.weight}
                  onChange={(e) => set("weight", Number(e.target.value) || 0)}
                />
                <Select
                  value={form.weightUnit}
                  onValueChange={(v) => set("weightUnit", v as "lb" | "kg")}
                >
                  <SelectTrigger className="w-[72px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lb">lb</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height</Label>
              <div className="flex gap-2">
                <Input
                  id="height"
                  type="number"
                  min={36}
                  value={form.height}
                  onChange={(e) => set("height", Number(e.target.value) || 0)}
                />
                <Select
                  value={form.heightUnit}
                  onValueChange={(v) => set("heightUnit", v as "in" | "cm")}
                >
                  <SelectTrigger className="w-[72px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">in</SelectItem>
                    <SelectItem value="cm">cm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[var(--color-subtle)]">
                <Zap className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                Rest between sets
              </Label>
              <span className="font-display text-sm font-semibold tabular text-[var(--color-primary)]">
                {rest}s
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={20}
              step={1}
              value={rest}
              onChange={(e) => set("restSeconds", Number(e.target.value))}
              className="w-full accent-[var(--color-primary)]"
              aria-label="Rest seconds between sets"
            />
          </div>
        </div>

        <Button
          size="lg"
          className="h-14 w-full text-base font-semibold"
          onClick={() => finish({ floor: ownedCount === 0 })}
        >
          Get to it
          <ArrowRight className="h-5 w-5" />
        </Button>
        <button
          type="button"
          onClick={() => setGate("start")}
          className="w-full py-2 text-sm text-[var(--color-muted)]"
        >
          Back
        </button>
      </div>
    </div>
  );
}
