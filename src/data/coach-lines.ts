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
  { id: "pussy", kind: "work", text: "Don't be a fucking pussy. Keep going." },
  { id: "w1", kind: "work", text: "That's it? I thought you wanted abs, not a little pity party." },
  { id: "w2", kind: "work", text: "Your core is quitting. Tell it to shut the fuck up." },
  { id: "w3", kind: "work", text: "Shake it off and move. Don't you dare stop, you baby." },
  { id: "w4", kind: "work", text: "Cute. Now do it like you actually give a shit." },
  { id: "w5", kind: "work", text: "If your belly's still jiggling excuses, brace the fuck up." },
  { id: "w6", kind: "work", text: "Eyes up. Stop staring at the timer like it owes you a break." },
  { id: "w7", kind: "work", text: "That was the easy second. The next one is gonna suck. Good." },
  { id: "w8", kind: "work", text: "You're not dying. You're just being a dramatic little bitch." },
  { id: "w9", kind: "work", text: "Hold it. I said hold it. Don't float like a lazy asshole." },
  { id: "w10", kind: "work", text: "Abs don't grow from vibes. Squeeze like you mean it, damn it." },
  { id: "w11", kind: "work", text: "If you can still think about dinner, you're not working hard enough." },
  { id: "w12", kind: "work", text: "Don't tap out. Finish the damn set." },
  { id: "w13", kind: "work", text: "That's form. Don't turn it into a sloppy fucking flop." },
  { id: "w14", kind: "work", text: "You're halfway to looking expensive. Don't cheap out now, you wimp." },
  { id: "w15", kind: "work", text: "Breathe. Then punish the next rep like it insulted you." },
  { id: "w16", kind: "work", text: "I can see you negotiating. I already said no, so shut up and move." },
  { id: "w17", kind: "work", text: "Soft core, soft life. Pick one, pussy." },
  { id: "w18", kind: "work", text: "Don't collapse like a cheap lawn chair. Get your shit together." },
  { id: "w19", kind: "work", text: "Mean it. Mean it more. Stop being polite." },
  { id: "w20", kind: "work", text: "Your lower back is not the hero. Steal the work back, damn it." },
  { id: "w21", kind: "work", text: "Stop counting the seconds. Make the seconds hurt." },
  { id: "w22", kind: "work", text: "If this feels polite, you're cheating. Go harder." },
  { id: "w23", kind: "work", text: "Come on. I've seen better from a hungover piece of shit on a Tuesday." },
  { id: "w24", kind: "work", text: "Don't let the last three reps be fake. Earn them." },
  { id: "w25", kind: "work", text: "Brace like somebody's about to punch you in the gut." },
  { id: "w26", kind: "work", text: "That's not a rest. That's you being a baby. Get back in it." },
  { id: "w27", kind: "work", text: "Hate me. Fine. You're still not allowed to quit, asshole." },
  { id: "w28", kind: "work", text: "Core on. Wipe that bitch face off. Nobody asked." },
  { id: "w29", kind: "work", text: "Little crunch, big attitude. Don't mix them up, you fraud." },
  { id: "w30", kind: "work", text: "Don't flop the hips. Own the midline or get the hell out." },
  { id: "w31", kind: "work", text: "Yes. Ugly. Perfect. Keep that nasty form working." },
  { id: "w32", kind: "work", text: "Waiting for motivation? Too late. Move your ass." },
  { id: "w33", kind: "work", text: "This is where most people get cute. Don't be most people." },
  { id: "w34", kind: "work", text: "Sweat is the receipt. Pay the fuck up." },
  { id: "w35", kind: "work", text: "Don't you dare make this pretty. Make it work." },
  { id: "w36", kind: "work", text: "One honest rep beats ten lazy ones. Stop faking it." },
  { id: "w37", kind: "work", text: "I didn't put you here to admire the ceiling, dipshit." },
  { id: "w38", kind: "work", text: "Tighten up. You look like you're texting, you slob." },
  { id: "w39", kind: "work", text: "That's the burn. Don't run from it like a tourist pussy." },
  { id: "w40", kind: "work", text: "Keep going. Your future abs are watching and they're bored as hell." },

  // —— rest, still biting ——
  { id: "r1", kind: "rest", text: "Rest if you must. Don't make it your whole damn personality." },
  { id: "r2", kind: "rest", text: "Breathe. Then come back meaner, you wimp." },
  { id: "r3", kind: "rest", text: "That's not a nap. That's a reload. Don't get cozy." },
  { id: "r4", kind: "rest", text: "Shake the arms. Don't shake the standard, bitch." },
  { id: "r5", kind: "rest", text: "Water if you need it. Excuses if you're a coward." },
  { id: "r6", kind: "rest", text: "Next set starts whether your ego is ready or not. Tough shit." },
  { id: "r7", kind: "rest", text: "Cute break. Don't fall in love with it, you lazy ass." },
  { id: "r8", kind: "rest", text: "Reset the brace. We're not done being a problem." },

  // —— skip shame ——
  { id: "s1", kind: "skip", text: "Skipped? Bold as hell. I'll remember that, coward." },
  { id: "s2", kind: "skip", text: "Fine. Skip. Don't pretend that was strategy, you baby." },
  { id: "s3", kind: "skip", text: "Okay coward. Next one. Don't you dare flake twice." },
  { id: "s4", kind: "skip", text: "You just ghosted a move. Stay and do the next one, damn it." },
  { id: "s5", kind: "skip", text: "Skip city. Population: your sorry ass. Don't move in." },

  // —— last move ——
  { id: "l1", kind: "last", text: "Last move. Don't get sentimental. Get vicious." },
  { id: "l2", kind: "last", text: "This is the closer. Leave something ugly on the floor." },
  { id: "l3", kind: "last", text: "Final set. Sandbag this and I will haunt your fridge, asshole." },
  { id: "l4", kind: "last", text: "One more. Make it the one you'd replay, not the one you faked." },
  { id: "l5", kind: "last", text: "Don't coast the last one. That's how abs stay imaginary." },

  // —— finish gloat ——
  { id: "f1", kind: "finish", text: "Done. You didn't die. Shocking, you drama queen." },
  { id: "f2", kind: "finish", text: "That's a session. Go be insufferable about it." },
  { id: "f3", kind: "finish", text: "Core clocked in. You can clock out looking smug, you bastard." },
  { id: "f4", kind: "finish", text: "Finished. Not pretty. Pretty wasn't the fucking assignment." },
  { id: "f5", kind: "finish", text: "That's the work. Your abs filed a complaint. We ignored that shit." },
  { id: "f6", kind: "finish", text: "Session closed. Don't undo it with a victory donut. Or do. I'm not your mom." },
  { id: "f7", kind: "finish", text: "You showed up and stayed. That's the whole trick, you lucky shit." },
  { id: "f8", kind: "finish", text: "Forged. Now walk like you've got a filthy little secret." },

  // —— 2-day streak extra love ——
  { id: "t1", kind: "streak2", text: "Two days. That's a habit trying to happen. Don't ghost it tomorrow, pussy." },
  { id: "t2", kind: "streak2", text: "Back-to-back. I like you a little more. Don't make it weird." },
  { id: "t3", kind: "streak2", text: "Day two. The universe noticed. So did I. Don't fuck it up." },
  { id: "t4", kind: "streak2", text: "Two in a row. That's not luck. That's you being slightly dangerous." },
  { id: "t5", kind: "streak2", text: "Streak of two. Extra love. Extra expectation. See you tomorrow, brat." },

  // —— hotter streaks ——
  { id: "h1", kind: "streakHot", text: "You're on a heater. Don't get cute and skip tomorrow, asshole." },
  { id: "h2", kind: "streakHot", text: "Streak's alive. Feed it. Don't put it on a diet, you idiot." },
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
