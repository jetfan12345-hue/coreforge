/**
 * Trash talk is on-screen text. Do not play MP3s — clips that sound
 * robotic or male break the female-coach product. These stay as no-ops
 * so leftover callers cannot sneak audio back in.
 */

export function unlockCoachAudio(): void {}

export function isCoachAudioUnlocked(): boolean {
  return true;
}

export async function preloadCoachAudio(): Promise<void> {}

export function playCoachLine(_index?: number): Promise<void> {
  return Promise.resolve();
}

export function playCoachSample(): void {}
