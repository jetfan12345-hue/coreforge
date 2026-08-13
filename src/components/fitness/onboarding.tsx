import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Dumbbell,
  Zap,
} from "lucide-react";
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
import { useFitnessStore, type UserProfile } from "@/store/fitness";
import { cn } from "@/lib/utils";

type Step = "gear" | "you" | "rest";

export function Onboarding() {
  const complete = useFitnessStore((s) => s.completeOnboarding);
  const existing = useFitnessStore((s) => s.profile);
  const [step, setStep] = useState<Step>("gear");
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
  const stepIndex = step === "gear" ? 0 : step === "you" ? 1 : 2;

  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-md flex-col justify-center py-6">
      <div className="mb-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-primary)]">
          Welcome · step {stepIndex + 1} of 3
        </p>
        <div className="mb-4 flex gap-1.5">
          {([0, 1, 2] as const).map((i) => (
            <span
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition",
                i <= stepIndex
                  ? "bg-[var(--color-primary)]"
                  : "bg-[var(--color-surface-2)]",
              )}
            />
          ))}
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-balance">
          {step === "gear" && "What gear do you have?"}
          {step === "you" && "About you"}
          {step === "rest" && "How you like to train"}
        </h1>
        <p className="mt-3 text-sm text-[var(--color-muted)]">
          {step === "gear" &&
            "Tap what you own. Advanced works with zero gear — equipment is optional overload only."}
          {step === "you" &&
            "Stats power calorie estimates. Change anytime in Profile."}
          {step === "rest" &&
            "Dense ab circuits feel best with short rests. Set your default (5–20s)."}
        </p>
      </div>

      {step === "gear" && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() =>
              setForm((f) => ({
                ...f,
                gear: { ...EMPTY_GEAR },
              }))
            }
            className={cn(
              "flex w-full items-center gap-3 rounded-[var(--radius-xl)] border px-4 py-3.5 text-left transition",
              ownedCount === 0
                ? "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10"
                : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-strong)]",
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                ownedCount === 0
                  ? "bg-[var(--color-primary)] text-[var(--color-primary-fg)]"
                  : "bg-[var(--color-surface-2)] text-[var(--color-muted)]",
              )}
            >
              {ownedCount === 0 ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="text-xs font-semibold">0</span>
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">No gear · floor only</p>
              <p className="text-xs text-[var(--color-muted)]">
                Beginner, mid, and advanced all run bodyweight-first
              </p>
            </div>
          </button>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
            {GEAR_OPTIONS.map(({ key, label, hint }) => {
              const on = Boolean(form.gear?.[key]);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleGear(key)}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-[var(--radius-xl)] border px-3 py-3 text-left transition",
                    on
                      ? "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/12"
                      : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-strong)]",
                  )}
                >
                  <span className="flex w-full items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{label}</span>
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border",
                        on
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-fg)]"
                          : "border-[var(--color-border-strong)]",
                      )}
                    >
                      {on && <Check className="h-3 w-3" />}
                    </span>
                  </span>
                  <span className="text-[11px] text-[var(--color-subtle)]">
                    {hint}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="flex items-start gap-2 text-xs text-[var(--color-muted)]">
            <Dumbbell className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-primary)]" />
            {ownedCount === 0
              ? "No problem — every plan works on a mat alone."
              : `${ownedCount} tool${ownedCount === 1 ? "" : "s"} saved. Advanced can layer these as optional overload.`}
          </p>

          <Button className="w-full" size="lg" onClick={() => setStep("you")}>
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {step === "you" && (
        <div className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="What should we call you?"
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

          <div className="flex gap-2 pt-1">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setStep("gear")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button className="flex-1" onClick={() => setStep("rest")}>
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === "rest" && (
        <div className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="space-y-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3">
            <Label className="text-xs font-medium uppercase tracking-wide text-[var(--color-subtle)]">
              Demo coach
            </Label>
            <p className="text-xs text-[var(--color-muted)]">
              Who shows form in videos — change anytime in profile.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { value: "female" as const, label: "Female" },
                  { value: "male" as const, label: "Male" },
                ] as const
              ).map((opt) => {
                const on = (form.demoModel ?? "female") === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set("demoModel", opt.value)}
                    className={cn(
                      "rounded-[var(--radius-md)] border px-3 py-2.5 text-left transition",
                      on
                        ? "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10"
                        : "border-[var(--color-border)] bg-[var(--color-surface)]",
                    )}
                  >
                    <span className="block text-sm font-medium">{opt.label}</span>
                    <span className="text-[11px] text-[var(--color-subtle)]">
                      Form videos
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3">
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
            <div className="flex justify-between text-[10px] text-[var(--color-subtle)]">
              <span>5s hustle</span>
              <span>20s recover</span>
            </div>
          </div>


          {form.demoModel === "female" && (
            <button
              type="button"
              onClick={() => set("coachTrashTalk", !form.coachTrashTalk)}
              className={cn(
                "flex w-full items-start gap-3 rounded-[var(--radius-lg)] border px-3 py-3 text-left transition",
                form.coachTrashTalk
                  ? "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10"
                  : "border-[var(--color-border)] bg-[var(--color-surface-2)]",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                  form.coachTrashTalk
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-fg)]"
                    : "border-[var(--color-border-strong)]",
                )}
              >
                {form.coachTrashTalk && <Check className="h-3 w-3" />}
              </span>
              <span>
                <span className="block text-sm font-medium">
                  Coach talks shit
                </span>
                <span className="text-xs text-[var(--color-muted)]">
                  On-screen roasts mid-set. Female coach only.
                </span>
              </span>
            </button>
          )}

          {ownedCount > 0 && (
            <button
              type="button"
              onClick={() =>
                set("includeGearOverload", !form.includeGearOverload)
              }
              className={cn(
                "flex w-full items-start gap-3 rounded-[var(--radius-lg)] border px-3 py-3 text-left transition",
                form.includeGearOverload
                  ? "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10"
                  : "border-[var(--color-border)] bg-[var(--color-surface-2)]",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                  form.includeGearOverload
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-fg)]"
                    : "border-[var(--color-border-strong)]",
                )}
              >
                {form.includeGearOverload && <Check className="h-3 w-3" />}
              </span>
              <span>
                <span className="block text-sm font-medium">
                  Add gear overload on Advanced
                </span>
                <span className="text-xs text-[var(--color-muted)]">
                  Optional bar / wheel / plates / cable blocks after the
                  bodyweight circuit
                </span>
              </span>
            </button>
          )}

          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setStep("you")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              className="flex-1"
              size="lg"
              onClick={() =>
                complete({
                  name: form.name.trim() || "Athlete",
                  age: form.age,
                  weight: form.weight,
                  height: form.height,
                  weightUnit: form.weightUnit,
                  heightUnit: form.heightUnit,
                  goal: form.goal,
                  restSeconds: rest,
                  gear: form.gear,
                  includeGearOverload: form.includeGearOverload,
                  demoModel: form.demoModel ?? "female",
                  coachTrashTalk: form.coachTrashTalk ?? false,
                  programStartedAt: new Date().toISOString().slice(0, 10),
                })

              }
            >
              Start training
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
