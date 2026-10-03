import { coachAudioUrl } from "@/data/coach-lines";

/**
 * Play id-named ara trash-talk clips from /audio/coach/{id}.mp3.
 * Never uses the old robotic line-NN.mp3 files.
 * Missing / 404 clips stay silent — text still shows. No console spam.
 */

let current: HTMLAudioElement | null = null;
let playGen = 0;

function releaseCurrent() {
  if (!current) return;
  current.onerror = null;
  current.onended = null;
  current.pause();
  current.removeAttribute("src");
  try {
    current.load();
  } catch {
    /* ignore */
  }
  current = null;
}

export function stopCoachAudio() {
  playGen += 1;
  releaseCurrent();
}

export function playCoachLineById(id: string) {
  if (typeof window === "undefined" || !id) return;
  playGen += 1;
  const generation = playGen;
  releaseCurrent();

  const audio = new Audio();
  audio.preload = "auto";
  audio.onerror = () => {
    if (generation !== playGen) return;
    releaseCurrent();
  };
  audio.onended = () => {
    if (generation !== playGen) return;
    releaseCurrent();
  };
  audio.src = coachAudioUrl(id);
  current = audio;
  void audio.play().catch(() => {
    if (generation !== playGen) return;
    releaseCurrent();
  });
}
