import { publicUrl } from "@/lib/public-url";

export type CoachLineKind =
  | "start"
  | "work"
  | "rest"
  | "pause"
  | "skip"
  | "quit"
  | "last"
  | "finish"
  | "streak2"
  | "streakHot";

export type CoachLine = {
  id: string;
  text: string;
  kind: CoachLineKind;
  /**
   * True only when public/audio/coach/{id}.mp3 is a recording of exactly this
   * text. Everything else is on-screen text only (no mismatched clean clip).
   */
  audio?: true;
};

/** Ara TTS clip for a line id. Missing files must not fail the build. */
export function coachAudioUrl(id: string): string {
  return publicUrl(`/audio/coach/${id}.mp3`);
}

/**
 * Female-coach library. ADULT, EXPLICIT, OPT-IN ONLY (off by default, toggle
 * says "explicit, 18+"). Savage gym coach roasting a guy to get him moving.
 * Hard limits: no slurs about race, ethnicity, sexuality or disability; nothing
 * about self-harm or suicide.
 *
 * Audio: the 75 prerecorded ara clips were voiced from the older, cleaner copy,
 * so only lines marked `audio: true` (text identical to the recording) play a
 * clip. All other lines display silently. Rewritten 2026-10-03.
 */
export const COACH_LINES: CoachLine[] = [
  // —— session start ——
  { id: "st1", kind: "start", text: "Oh look who finally showed up. Get on the floor, bitch, we're starting." },
  { id: "st2", kind: "start", text: "Phone down. Ego down. Ass on the mat. Let's fucking go." },
  { id: "st3", kind: "start", text: "Warm up like you mean it, not like some soft little sissy stretching for the camera." },
  { id: "st4", kind: "start", text: "You came here for abs, not a hug. Move, pussy." },
  { id: "st5", kind: "start", text: "Clock's running. Your excuses aren't. Start working, dipshit." },
  { id: "st6", kind: "start", text: "Fix your shit form today or I roast you for the whole damn session." },
  { id: "st7", kind: "start", text: "Welcome to hell, sweetheart. Shut up and start." },
  { id: "st8", kind: "start", text: "No warm-up whining. Get the blood moving, you bitch-ass couch potato." },

  // —— mid-set ——
  { id: "pussy", kind: "work", text: "Keep going. Don't be a pussy.", audio: true },
  { id: "w1", kind: "work", text: "That's it? That's all you've got? Pathetic. Again." },
  { id: "w2", kind: "work", text: "Your core's whining. Tell it to shut the fuck up and work." },
  { id: "w3", kind: "work", text: "Quit being soft. Squeeze, you limp-dick motherfucker." },
  { id: "w4", kind: "work", text: "Do it like you actually give a shit for once in your life." },
  { id: "w5", kind: "work", text: "Brace the fuck up. That gut isn't going to flatten itself." },
  { id: "w6", kind: "work", text: "Stop staring at the timer like it owes you money. Work." },
  { id: "w7", kind: "work", text: "Oh, it burns? Good. Burn harder, bitch." },
  { id: "w8", kind: "work", text: "You're not hurt. You're being a dramatic little bitch. Keep going." },
  { id: "w9", kind: "work", text: "Hold it. I said HOLD IT. Don't sag like a wet fucking noodle." },
  { id: "w10", kind: "work", text: "Abs don't grow from vibes, dumbass. Squeeze." },
  { id: "w11", kind: "work", text: "If you can still think about tacos, you're not working, you lazy fuck." },
  { id: "w12", kind: "work", text: "Don't you dare tap out. Finish the goddamn set." },
  { id: "w13", kind: "work", text: "That form is sloppy as shit. Tighten it up." },
  { id: "w14", kind: "work", text: "Quit cheating the reps, you sneaky little bitch. I see you." },
  { id: "w15", kind: "work", text: "My grandma does more than this before her coffee. Move." },
  { id: "w16", kind: "work", text: "Stop negotiating. The answer is fuck no. Keep going." },
  { id: "w17", kind: "work", text: "Soft core, soft life. Pick one, pussy." },
  { id: "w18", kind: "work", text: "You fold like a cheap lawn chair. Get your shit together." },
  { id: "w19", kind: "work", text: "Harder. Harder. Jesus Christ, are you even trying?" },
  { id: "w20", kind: "work", text: "Stop letting your back do the work, you lazy-ass cheater." },
  { id: "w21", kind: "work", text: "Make the seconds hurt or get the fuck out of my gym." },
  { id: "w22", kind: "work", text: "If this feels comfortable, you're doing it wrong, sissy." },
  { id: "w23", kind: "work", text: "I've seen hungover frat boys work harder than you. Embarrassing." },
  { id: "w24", kind: "work", text: "Don't fake the last reps. Earn them, bitch." },
  { id: "w25", kind: "work", text: "Brace like somebody's about to punch your soft-ass gut." },
  { id: "w26", kind: "work", text: "That's not a breather, that's you being a pussy. Get back in it." },
  { id: "w27", kind: "work", text: "Hate me? Good. Use it. You still don't get to quit, asshole." },
  { id: "w28", kind: "work", text: "Wipe that bitch face off and squeeze." },
  { id: "w29", kind: "work", text: "Big talk, tiny effort. Classic small-dick energy. Prove me wrong." },
  { id: "w30", kind: "work", text: "Hips where they belong, dumbass. Own the midline or go home and cry." },
  { id: "w31", kind: "work", text: "Ugly? Yes. Shaking? Yes. Keep fucking going." },
  { id: "w32", kind: "work", text: "Waiting for motivation? It's not coming. Move your ass." },
  { id: "w33", kind: "work", text: "This is where soft little boys quit. Are you a soft little boy?" },
  { id: "w34", kind: "work", text: "Sweat is the receipt. Pay the fuck up." },
  { id: "w35", kind: "work", text: "Your excuses are louder than your reps. Shut up and work." },
  { id: "w36", kind: "work", text: "One honest rep beats ten bitch-ass fake ones." },
  { id: "w37", kind: "work", text: "Eyes off the ceiling, dipshit. It's not going to save you." },
  { id: "w38", kind: "work", text: "You look like you're texting your ex. Tighten the fuck up." },
  { id: "w39", kind: "work", text: "That's the burn. Stop running from it like a scared little sissy." },

  // —— rest ——
  { id: "r1", kind: "rest", text: "Rest. Don't make it your whole fucking personality." },
  { id: "r2", kind: "rest", text: "Breathe, bitch. Then come back meaner." },
  { id: "r3", kind: "rest", text: "That's a reload, not a nap. Don't get cozy, princess." },
  { id: "r4", kind: "rest", text: "Shake your arms out. Don't shake off what's left of your balls." },
  { id: "r5", kind: "rest", text: "Sip your water, sissy. The clock is still mine." },
  { id: "r6", kind: "rest", text: "Next set starts whether your soft ass is ready or not." },
  { id: "r7", kind: "rest", text: "Enjoy the break. It's the only thing you're good at." },
  { id: "r8", kind: "rest", text: "Reset the brace. We're not done making you suffer." },
  { id: "r9", kind: "rest", text: "Stop moaning like a little bitch and get ready." },
  { id: "r10", kind: "rest", text: "Catch your breath. You sound like a fucking leaf blower." },

  // —— pause ——
  { id: "p1", kind: "pause", text: "Pause? Who told you that you could pause, pussy?" },
  { id: "p2", kind: "pause", text: "Oh, we need a timeout now? Cute. Hurry the fuck up." },
  { id: "p3", kind: "pause", text: "Paused. Your abs are laughing at you." },
  { id: "p4", kind: "pause", text: "Take your little break. I'm counting, bitch." },
  { id: "p5", kind: "pause", text: "Pausing again? Jesus, you're soft." },
  { id: "p6", kind: "pause", text: "Fine, pause. Then get your ass back on the floor." },

  // —— skip ——
  { id: "s1", kind: "skip", text: "Skipped it? Bold move for a guy with no abs, coward." },
  { id: "s2", kind: "skip", text: "Skip. Wow. Don't call that strategy, you bitch-ass quitter." },
  { id: "s3", kind: "skip", text: "Okay, sissy, next one. Don't you dare skip twice." },
  { id: "s4", kind: "skip", text: "You ghosted that move like a bad Tinder date. Pathetic." },
  { id: "s5", kind: "skip", text: "Skip city. Population: your sorry ass." },
  { id: "s6", kind: "skip", text: "Too hard? Aww. Pussy." },
  { id: "s7", kind: "skip", text: "Skipping the hard ones is how you stay soft forever." },
  { id: "s8", kind: "skip", text: "That one scared you? Grow a pair and do the next one." },

  // —— quitting (Exit) ——
  { id: "q1", kind: "quit", text: "Leaving? Of course you are, you fucking quitter." },
  { id: "q2", kind: "quit", text: "Walk away then, pussy. Your gut will be right here waiting." },
  { id: "q3", kind: "quit", text: "Running already? Soft as a fucking marshmallow." },
  { id: "q4", kind: "quit", text: "Quit now and you're just a bitch with a gym app." },
  { id: "q5", kind: "quit", text: "Go ahead. Tap Discard. Prove me right, coward." },
  { id: "q6", kind: "quit", text: "Sit your ass back down and finish, you whiny little shit." },

  // —— last move ——
  { id: "l1", kind: "last", text: "Last move. Don't get sentimental. Get fucking vicious." },
  { id: "l2", kind: "last", text: "This is the closer. Leave something ugly on that floor." },
  { id: "l3", kind: "last", text: "Final set. Sandbag this and I'll call you a pussy forever." },
  { id: "l4", kind: "last", text: "One more. Empty the tank, not your excuses, bitch." },
  { id: "l5", kind: "last", text: "Don't coast the last one. That's why your abs are still imaginary, dumbass." },
  { id: "l6", kind: "last", text: "Last one. Make me shut up for once." },

  // —— finish ——
  { id: "f1", kind: "finish", text: "Done. Look at you, not a total pussy after all." },
  { id: "f2", kind: "finish", text: "That's a session. Go be insufferable about it, asshole." },
  { id: "f3", kind: "finish", text: "Clocked out. Still soft, but less soft. Progress, bitch." },
  { id: "f4", kind: "finish", text: "Finished. Not pretty. Pretty wasn't the fucking assignment." },
  { id: "f5", kind: "finish", text: "Your abs filed a complaint. I ignored that shit." },
  { id: "f6", kind: "finish", text: "Session closed. Don't undo it with a fucking donut." },
  { id: "f7", kind: "finish", text: "You showed up and didn't quit. Shocking. Proud-ish of you, dipshit." },
  { id: "f8", kind: "finish", text: "Forged. Go flex in the mirror like the cocky bastard you are." },

  // —— 2-day streak ——
  { id: "t1", kind: "streak2", text: "Two days in a row? Holy shit, the pussy has a pulse." },
  { id: "t2", kind: "streak2", text: "Back-to-back. I like you a little more. Don't make it weird, dumbass." },
  { id: "t3", kind: "streak2", text: "Day two. Don't fuck it up tomorrow." },
  { id: "t4", kind: "streak2", text: "Two straight. That's not luck, that's you finally growing a pair." },
  { id: "t5", kind: "streak2", text: "Streak of two. See you tomorrow, bitch. Don't ghost me." },

  // —— 3+ day streak ——
  { id: "h1", kind: "streakHot", text: "You're on a heater. Skip tomorrow and you're my bitch again." },
  { id: "h2", kind: "streakHot", text: "Streak's alive. Feed it. Don't starve it like a soft little sissy." },
  { id: "h3", kind: "streakHot", text: "Consistent as hell. I almost respect you. Almost." },
  { id: "h4", kind: "streakHot", text: "Look at this badass. Break the streak and I'll roast your ass all week." },
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
