/** Unhinged female coach trash talk — on-screen text + matched voice clips. */
export const TRASH_TALK_LINES = [
  "Keep going — don't be a pussy.",
  "That all you got? Pathetic. Hit it again.",
  "Squeeze harder. I want you shaking.",
  "Quit soft-serving those reps.",
  "Sweat or quit. Pick one.",
  "Core's on fire? Good. Suffer through it.",
  "Don't you dare half-ass this set.",
  "Move like you mean it, not like you're napping.",
  "Rest's over. Get back on the mat.",
  "Two more. Stop negotiating with yourself.",
  "Looking weak. Fix that face and finish.",
  "If you skip, I'll know. And I'll judge you.",
  "Abs don't grow from excuses.",
  "Hold it. Stop trembling and own it.",
  "Last move — don't embarrass yourself now.",
  "You're not dying. You're just soft. Keep going.",
  "Breathe and crush it. No drama.",
  "That rest was longer than my patience. Up.",
] as const;

/** Matched MP3 under /public/audio/coach/line-XX.mp3 (same index as TRASH_TALK_LINES). */
export function coachAudioUrl(index: number): string {
  const i = ((index % TRASH_TALK_LINES.length) + TRASH_TALK_LINES.length) % TRASH_TALK_LINES.length;
  return `/audio/coach/line-${String(i).padStart(2, "0")}.mp3`;
}

export const STREAK_LINES = [
  "Two days straight. Don't get cocky.",
  "Streak locked. Keep showing up or lose it.",
  "Back-to-back. Maybe you're not soft after all.",
] as const;

export const FINISH_LINES = [
  "Session done. Go hydrate, animal.",
  "That's a wrap. Don't undo it with junk food.",
  "Finished. I'm almost proud. Almost.",
] as const;

export function pickLineIndex(poolLength: number, seed?: number): number {
  if (poolLength <= 0) return 0;
  if (typeof seed === "number") {
    return Math.abs(Math.floor(seed)) % poolLength;
  }
  return Math.floor(Math.random() * poolLength);
}

export function pickLine(pool: readonly string[], seed?: number): string {
  if (!pool.length) return "";
  return pool[pickLineIndex(pool.length, seed)]!;
}
