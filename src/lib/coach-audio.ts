/** Reliable coach trash-talk playback (unlock + preload + shared element). */

import { coachAudioUrl, TRASH_TALK_LINES } from "@/data/coach-lines";

const COACH_AUDIO_V = 20;

let audioEl: HTMLAudioElement | null = null;
let audioCtx: AudioContext | null = null;
let unlocked = false;
let preloaded = false;

function resolveUrl(index: number): string {
  const base = coachAudioUrl(index);
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}v=${COACH_AUDIO_V}`;
}

function ensureEl(): HTMLAudioElement {
  if (!audioEl) {
    audioEl = new Audio();
    audioEl.preload = "auto";
    audioEl.setAttribute("playsinline", "true");
    audioEl.setAttribute("webkit-playsinline", "true");
  }
  return audioEl;
}

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (AC && !audioCtx) audioCtx = new AC();
    return audioCtx;
  } catch {
    return null;
  }
}

/** Call from a user gesture (tap / key) so later mid-workout plays aren't blocked. */
export function unlockCoachAudio(): void {
  if (typeof window === "undefined") return;
  unlocked = true;
  const el = ensureEl();
  const ctx = ensureCtx();
  if (ctx?.state === "suspended") {
    void ctx.resume().catch(() => undefined);
  }
  // Silent unlock play so the browser marks this element as user-activated.
  el.muted = true;
  el.volume = 0;
  el.src = resolveUrl(0);
  void el
    .play()
    .then(() => {
      el.pause();
      el.currentTime = 0;
      el.muted = false;
      el.volume = 1;
    })
    .catch(() => {
      el.muted = false;
      el.volume = 1;
    });
  void preloadCoachAudio();
}

export function isCoachAudioUnlocked(): boolean {
  return unlocked;
}

/** Preload a few lines so Done / rest cues start instantly. */
export async function preloadCoachAudio(): Promise<void> {
  if (typeof window === "undefined" || preloaded) return;
  preloaded = true;
  const indexes = [0, 1, 2, 8, 11, 16];
  await Promise.all(
    indexes.map(
      (i) =>
        new Promise<void>((resolve) => {
          const a = new Audio();
          a.preload = "auto";
          a.src = resolveUrl(i);
          const done = () => resolve();
          a.addEventListener("canplaythrough", done, { once: true });
          a.addEventListener("error", done, { once: true });
          window.setTimeout(done, 2500);
          a.load();
        }),
    ),
  );
}

/**
 * Play a trash-talk line by index. Safe to call repeatedly; stops any prior line.
 * Returns a Promise that resolves when playback starts (or fails silently).
 */
export function playCoachLine(index: number): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const i =
    ((index % TRASH_TALK_LINES.length) + TRASH_TALK_LINES.length) %
    TRASH_TALK_LINES.length;
  const url = resolveUrl(i);
  const el = ensureEl();
  const ctx = ensureCtx();
  if (ctx?.state === "suspended") {
    void ctx.resume().catch(() => undefined);
  }
  if (!unlocked) {
    unlocked = true;
  }

  try {
    el.pause();
  } catch {
    // ignore
  }
  el.muted = false;
  el.volume = 1;
  el.src = url;
  el.load();

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    const tryPlay = () => {
      void el
        .play()
        .then(finish)
        .catch(() => {
          // One more attempt after a short delay (some browsers need it).
          window.setTimeout(() => {
            void el.play().then(finish).catch(finish);
          }, 60);
        });
    };
    if (el.readyState >= 3) {
      tryPlay();
    } else {
      el.addEventListener("canplay", tryPlay, { once: true });
      window.setTimeout(tryPlay, 100);
    }
  });
}

/** Profile sample — always play line 0 from a fresh gesture. */
export function playCoachSample(): void {
  unlocked = true;
  const ctx = ensureCtx();
  if (ctx?.state === "suspended") {
    void ctx.resume().catch(() => undefined);
  }
  void playCoachLine(0);
}
