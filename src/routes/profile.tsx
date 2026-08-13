import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Check, Dumbbell, Save, Zap } from "lucide-react";
import {
  cmFromProfile,
  estimateBmr,
  kgFromProfile,
} from "@/data/exercises";
import { describeGearUnlock, GEAR_OPTIONS } from "@/data/programs";
import { pickCoachLine } from "@/data/coach-lines";
import { CoachPresence } from "@/components/fitness/coach-presence";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFitnessStore, type UserProfile } from "@/store/fitness";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const profile = useFitnessStore((s) => s.profile);
  const setProfile = useFitnessStore((s) => s.setProfile);
  const toggleGear = useFitnessStore((s) => s.toggleGear);
  const setRestSeconds = useFitnessStore((s) => s.setRestSeconds);
  const history = useFitnessStore((s) => s.history);
  const streak = useFitnessStore((s) => s.streakDays());

  const derived = useMemo(() => {
    const kg = kgFromProfile(profile.weight, profile.weightUnit);
    const cm = cmFromProfile(profile.height, profile.heightUnit);
    const bmr = estimateBmr(kg, cm, profile.age);
    return { kg, cm, bmr, sessions: history.length };
  }, [profile, history.length]);

  const saveField = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile({ [key]: value } as Partial<UserProfile>);
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 p-4 pb-24">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Gear, rest, coach demos, and body metrics. Streak: {streak} day
          {streak === 1 ? "" : "s"} · {derived.sessions} session
          {derived.sessions === 1 ? "" : "s"} logged.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-[var(--color-primary)]" />
            Available gear
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {GEAR_OPTIONS.map((g) => {
            const on = Boolean(profile.gear?.[g.key]);
            return (
              <button
                key={g.key}
                type="button"
                onClick={() => {
                  const nextOn = !profile.gear?.[g.key];
                  toggleGear(g.key);
                  const { title, moves } = describeGearUnlock(g.key);
                  if (nextOn) {
                    toast.success(`${title} unlocked`, {
                      description: moves.length
                        ? `Advanced can add ${moves.join(" · ")}`
                        : "Logged. Advanced can layer this as overload.",
                    });
                  }
                }}
                className={cn(
                  "rounded-[var(--radius-lg)] border px-3 py-2.5 text-left text-sm transition",
                  on
                    ? "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10 font-medium"
                    : "border-[var(--color-border)] bg-[var(--color-surface-2)]",
                )}
              >
                <span className="flex items-center gap-2">
                  {on && <Check className="h-3.5 w-3.5 text-[var(--color-primary)]" />}
                  {g.label}
                </span>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rest between moves</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {[5, 10, 15, 20].map((s) => (
            <Button
              key={s}
              size="sm"
              variant={(profile.restSeconds ?? 10) === s ? "default" : "secondary"}
              onClick={() => setRestSeconds(s)}
            >
              {s}s
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[var(--color-primary)]" />
            Demo coach
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-[var(--color-muted)]">
            Who shows form. Male covers the beginner circuit; Female has the
            full library.
          </p>
          <CoachPresence
            value={profile.demoModel ?? "female"}
            onChange={(v) => setProfile({ demoModel: v })}
            trashTalk={profile.coachTrashTalk}
            onTrashTalkChange={(next) => {
              setProfile({ coachTrashTalk: next });
              if (next) {
                toast.message("Coach on", {
                  description: pickCoachLine("work").text,
                });
              } else {
                toast.message("Coach off");
              }
            }}
          />
          {(profile.demoModel ?? "female") === "female" &&
            profile.coachTrashTalk && (
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => {
                  toast.message(pickCoachLine("work").text);
                }}
              >
                Another line
              </Button>
            )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Body metrics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={profile.age}
              onChange={(e) => saveField("age", Number(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Goal</Label>
            <Select
              value={profile.goal}
              onValueChange={(v) =>
                saveField("goal", v as UserProfile["goal"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strength">Strength</SelectItem>
                <SelectItem value="definition">Definition</SelectItem>
                <SelectItem value="endurance">Endurance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="weight">Weight ({profile.weightUnit})</Label>
            <Input
              id="weight"
              type="number"
              value={profile.weight}
              onChange={(e) =>
                saveField("weight", Number(e.target.value) || 0)
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Weight unit</Label>
            <Select
              value={profile.weightUnit}
              onValueChange={(v) =>
                saveField("weightUnit", v as UserProfile["weightUnit"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lb">lb</SelectItem>
                <SelectItem value="kg">kg</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="height">Height ({profile.heightUnit})</Label>
            <Input
              id="height"
              type="number"
              value={profile.height}
              onChange={(e) =>
                saveField("height", Number(e.target.value) || 0)
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Height unit</Label>
            <Select
              value={profile.heightUnit}
              onValueChange={(v) =>
                saveField("heightUnit", v as UserProfile["heightUnit"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">in</SelectItem>
                <SelectItem value="cm">cm</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-xs text-[var(--color-muted)]">
            Est. BMR ~{Math.round(derived.bmr)} cal · {derived.kg.toFixed(1)} kg ·{" "}
            {Math.round(derived.cm)} cm
          </div>
          <Button
            className="col-span-2"
            onClick={() => toast.success("Profile saved on this device")}
          >
            <Save className="h-4 w-4" />
            Saved automatically
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
