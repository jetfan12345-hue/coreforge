import { publicUrl } from "@/lib/public-url";

export type CoachLineKind =
  | "work"
  | "rest"
  | "skip"
  | "last"
  | "finish"
  | "streak2"
  | "streakHot";

export type CoachLine = {
  id: string;
  text: string;
  kind: CoachLineKind;
};

/** Ara TTS clip for a line id. Missing files must not fail the build. */
export function coachAudioUrl(id: string): string {
  return publicUrl(`/audio/coach/${id}.mp3`);
}

/**
 * Female-coach on-screen library. Voice: mean-funny, not corporate gym-bro.
 * Playback uses public/audio/coach/{id}.mp3 (ara) only — never the old line-NN clips.
 */
export const COACH_LINES: CoachLine[] = [
  // —— mid-set bite ——
  { id: "pussy", kind: "work", text: "Keep going. Don't be a pussy." },
  { id: "w1", kind: "work", text: "That's it? I thought you wanted abs." },
  { id: "w2", kind: "work", text: "Your core is gossiping about quitting. Shut it up." },
  { id: "w3", kind: "work", text: "Shake it off. Shake it off. Don't you dare stop." },
  { id: "w4", kind: "work", text: "Cute. Now do it like you mean it." },
  { id: "w5", kind: "work", text: "If your belly's still talking, you're not bracing." },
  { id: "w6", kind: "work", text: "Eyes up. Ribs down. Stop looking at the timer like it owes you." },
  { id: "w7", kind: "work", text: "That's the easy second. The next one is the one that counts." },
  { id: "w8", kind: "work", text: "You're not dying. You're just dramatic." },
  { id: "w9", kind: "work", text: "Hold it. I said hold it. Don't float." },
  { id: "w10", kind: "work", text: "Abs don't grow from vibes. Squeeze." },
  { id: "w11", kind: "work", text: "If you can still think about dinner, go harder." },
  { id: "w12", kind: "work", text: "Don't tap out for a yawn. Finish the damn set." },
  { id: "w13", kind: "work", text: "That's form. Don't turn it into a flop." },
  { id: "w14", kind: "work", text: "You're halfway to looking expensive. Don't cheap out now." },
  { id: "w15", kind: "work", text: "Breathe. Then punish the next rep." },
  { id: "w16", kind: "work", text: "I can see you negotiating with yourself. I already said no." },
  { id: "w17", kind: "work", text: "Soft core, soft life. Pick one." },
  { id: "w18", kind: "work", text: "Don't collapse like a lawn chair." },
  { id: "w19", kind: "work", text: "That's it — mean it. Mean it more." },
  { id: "w20", kind: "work", text: "Your lower back is not the hero. Steal the work back." },
  { id: "w21", kind: "work", text: "Stop counting the seconds. Make the seconds count." },
  { id: "w22", kind: "work", text: "If this feels polite, you're cheating." },
  { id: "w23", kind: "work", text: "Come on. I've seen better from a hungover Tuesday." },
  { id: "w24", kind: "work", text: "Don't let the last three reps be theater." },
  { id: "w25", kind: "work", text: "Brace like somebody's about to poke you." },
  { id: "w26", kind: "work", text: "That's not a rest. That's a pause. Get back in it." },
  { id: "w27", kind: "work", text: "You're allowed to hate me. You're not allowed to quit." },
  { id: "w28", kind: "work", text: "Core on. Face off. Nobody asked for the grimace." },
  { id: "w29", kind: "work", text: "Little crunch. Big attitude. Don't mix them up." },
  { id: "w30", kind: "work", text: "Don't flop the hips. Own the midline." },
  { id: "w31", kind: "work", text: "Yes. Ugly. Perfect. Keep that." },
  { id: "w32", kind: "work", text: "If you're waiting for motivation, you're already late." },
  { id: "w33", kind: "work", text: "This is the part where most people get cute. Don't." },
  { id: "w34", kind: "work", text: "Sweat is the receipt. Pay up." },
  { id: "w35", kind: "work", text: "Don't you dare make this pretty. Make it work." },
  { id: "w36", kind: "work", text: "One more honest rep beats ten lazy ones." },
  { id: "w37", kind: "work", text: "I didn't put you here to admire the ceiling." },
  { id: "w38", kind: "work", text: "Tighten up. You look like you're texting." },
  { id: "w39", kind: "work", text: "That's the burn. Don't run from it like a tourist." },
  { id: "w40", kind: "work", text: "Keep going. Your future abs are watching and they're bored." },

  // —— rest, still biting ——
  { id: "r1", kind: "rest", text: "Rest if you must. Don't make it a personality." },
  { id: "r2", kind: "rest", text: "Breathe. Then come back meaner." },
  { id: "r3", kind: "rest", text: "That's not a nap. That's a reload." },
  { id: "r4", kind: "rest", text: "Shake the arms. Don't shake the standard." },
  { id: "r5", kind: "rest", text: "Water if you need it. Excuses if you don't." },
  { id: "r6", kind: "rest", text: "Next set starts whether your ego is ready or not." },
  { id: "r7", kind: "rest", text: "Cute break. Don't fall in love with it." },
  { id: "r8", kind: "rest", text: "Reset the brace. We're not done being annoying." },

  // —— skip shame ——
  { id: "s1", kind: "skip", text: "Skipped? Bold. I'll remember that." },
  { id: "s2", kind: "skip", text: "Fine. Skip. Don't pretend it was strategy." },
  { id: "s3", kind: "skip", text: "Okay coward. Next one. Make it count." },
  { id: "s4", kind: "skip", text: "You just ghosted a move. Stay for the next one." },
  { id: "s5", kind: "skip", text: "Skip city. Population: you. Don't move in." },

  // —— last move ——
  { id: "l1", kind: "last", text: "Last move. Don't get sentimental. Get vicious." },
  { id: "l2", kind: "last", text: "This is the closer. Leave something ugly on the floor." },
  { id: "l3", kind: "last", text: "Final set. If you sandbag this I will haunt your fridge." },
  { id: "l4", kind: "last", text: "One more. Make it the one you'd replay." },
  { id: "l5", kind: "last", text: "Don't coast the last one. That's how abs stay hypothetical." },

  // —— finish gloat ——
  { id: "f1", kind: "finish", text: "Done. You didn't die. Shocking." },
  { id: "f2", kind: "finish", text: "That's a session. Go be insufferable about it." },
  { id: "f3", kind: "finish", text: "Core clocked in. You can clock out looking smug." },
  { id: "f4", kind: "finish", text: "Finished. Not pretty. Pretty wasn't the assignment." },
  { id: "f5", kind: "finish", text: "That's the work. Your abs filed the complaint. We ignored it." },
  { id: "f6", kind: "finish", text: "Session closed. Don't undo it with a victory donut. Or do. I'm not your mom." },
  { id: "f7", kind: "finish", text: "You showed up and stayed. That's the whole trick." },
  { id: "f8", kind: "finish", text: "Forged. Now go walk like you have a secret." },

  // —— 2-day streak extra love ——
  { id: "t1", kind: "streak2", text: "Two days. That's a habit trying to happen. Don't ghost it tomorrow." },
  { id: "t2", kind: "streak2", text: "Back-to-back. I like you a little more. Don't make it weird." },
  { id: "t3", kind: "streak2", text: "Day two. The universe noticed. So did I." },
  { id: "t4", kind: "streak2", text: "Two in a row. That's not luck. That's you being slightly dangerous." },
  { id: "t5", kind: "streak2", text: "Streak of two. Extra love. Extra expectation. See you tomorrow." },

  // —— hotter streaks ——
  { id: "h1", kind: "streakHot", text: "You're on a heater. Don't get cute and skip tomorrow." },
  { id: "h2", kind: "streakHot", text: "Streak's alive. Feed it. Don't put it on a diet." },
  { id: "h3", kind: "streakHot", text: "Consistent. Terrifying. Keep being a problem." },
];

const recentIds: string[] = [];
const RECENT_CAP = 14;

function takeFrom(pool: CoachLine[]): CoachLine {
  const fresh = pool.filter((l) => !recentIds.includes(l.id));
  const pick = (fresh.length ? fresh : pool)[Math.floor(Math.random() * (fresh.length ? fresh.length : pool.length))]!;
  recentIds.push(pick.id);
  if (recentIds.length > RECENT_CAP) recentIds.shift();
  return pick;
}

export function pickCoachLine(kind: CoachLineKind = "work"): CoachLine {
  const pool = COACH_LINES.filter((l) => l.kind === kind);
  return takeFrom(pool.length ? pool : COACH_LINES.filter((l) => l.kind === "work"));
}

export function pickFinishLine(streak: number): CoachLine {
  if (streak === 2) return pickCoachLine("streak2");
  if (streak >= 3) return pickCoachLine("streakHot");
  return pickCoachLine("finish");
}

/** Professional finish copy when trash talk is off. */
export function pickCleanFinish(streak: number): {
  headline: string;
  sub: string;
  quote: string;
} {
  if (streak === 2) {
    return {
      headline: "Two-day streak",
      sub: "Come back tomorrow and it starts to stick.",
      quote: "Nice work. See you tomorrow.",
    };
  }
  if (streak >= 3) {
    return {
      headline: `${streak}-day streak`,
      sub: "Keep showing up. That’s the whole program.",
      quote: "Session complete.",
    };
  }
  if (streak === 1) {
    return {
      headline: "Session complete",
      sub: "Day one is in the books. Tomorrow makes it a streak.",
      quote: "Nice work.",
    };
  }
  return {
    headline: "Session complete",
    sub: "First session in the books.",
    quote: "Nice work.",
  };
}
