import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Pause, Play, RotateCcw, Volume2, ListChecks } from "lucide-react";
import type { Exercise } from "@/data/exercises";
import { resolveExerciseMedia } from "@/data/exercises";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFitnessStore } from "@/store/fitness";

/** Full-ROM demo player: looping video (preferred) + image fallback + form cues + best practices. */
export function ExerciseMedia({
  exercise,
  className,
  autoPlay = true,
  compact = false,
  overlay,
}: {
  exercise: Exercise;
  className?: string;
  autoPlay?: boolean;
  compact?: boolean;
  overlay?: ReactNode;
}) {
  const demoModel = useFitnessStore((s) => s.profile.demoModel ?? "female");
  const media = useMemo(
    () => resolveExerciseMedia(exercise, demoModel),
    [exercise, demoModel],
  );
  const [playing, setPlaying] = useState(autoPlay);
  const [cueIndex, setCueIndex] = useState(0);
  const [imgSrc, setImgSrc] = useState(media.image);
  const [videoSrc, setVideoSrc] = useState(media.video);
  const [useVideo, setUseVideo] = useState(Boolean(media.video));
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const cues = exercise.cues;
  const tips = exercise.tips.slice(0, 3);
  const gradient = useMemo(() => hashGradient(exercise.id), [exercise.id]);

  useEffect(() => {
    setCueIndex(0);
    setImgSrc(media.image);
    setVideoSrc(media.video);
    setUseVideo(Boolean(media.video));
    setPlaying(autoPlay);
  }, [exercise.id, media.image, media.video, autoPlay]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !useVideo) return;
    if (playing) {
      void el.play().catch(() => undefined);
    } else {
      el.pause();
    }
  }, [playing, useVideo, videoSrc]);

  useEffect(() => {
    if (!playing || cues.length === 0) return;
    const id = window.setInterval(() => {
      setCueIndex((i) => (i + 1) % cues.length);
    }, 1800);
    return () => window.clearInterval(id);
  }, [playing, cues.length]);

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-2)]",
          className,
        )}
      >
        <div className="relative aspect-[4/5] h-full max-h-[inherit] w-full sm:aspect-video">
          {useVideo && videoSrc ? (
            <video
              key={videoSrc}
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover object-center"
              src={videoSrc}
              poster={imgSrc}
              autoPlay={playing}
              muted
              loop
              playsInline
              onError={() => {
                // Male missing → try female video, then still image
                if (videoSrc !== media.femaleVideo && media.femaleVideo) {
                  setVideoSrc(media.femaleVideo);
                  setImgSrc(media.femaleImage);
                } else {
                  setUseVideo(false);
                }
              }}
            />
          ) : imgSrc ? (
            <img
              src={imgSrc}
              alt={`${exercise.name} demonstration`}
              className={cn(
                "absolute inset-0 h-full w-full object-cover object-center transition-transform duration-[4s] ease-out",
                playing && "scale-105",
              )}
              onError={() => {
                if (imgSrc !== media.femaleImage) {
                  setImgSrc(media.femaleImage);
                } else {
                  setImgSrc("");
                }
              }}
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: gradient }}
            >
              <FormSilhouette exerciseId={exercise.id} />
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/15" />
          {overlay}

          <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-white/90 backdrop-blur-sm">
              {useVideo ? "Full-ROM loop" : "Demo"}
            </span>
            {exercise.weighted && (
              <span className="rounded-full bg-[var(--color-accent)]/90 px-2.5 py-1 text-[11px] font-semibold text-[var(--color-accent-fg)]">
                Weighted
              </span>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 p-4">
            <div className="pointer-events-none mb-3 min-h-[1.5rem]">
              <p
                key={cueIndex}
                className="cue-enter font-display text-lg font-semibold tracking-tight text-white drop-shadow"
              >
                {cues[cueIndex]}
              </p>
              <div className="mt-2 flex gap-1">
                {cues.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      i === cueIndex ? "bg-[var(--color-primary)]" : "bg-white/25",
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="icon-sm"
                variant="secondary"
                className="border-0 bg-white/15 text-white hover:bg-white/25"
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? "Pause demo" : "Play demo"}
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                size="icon-sm"
                variant="secondary"
                className="border-0 bg-white/15 text-white hover:bg-white/25"
                onClick={() => {
                  setCueIndex(0);
                  const el = videoRef.current;
                  if (el) {
                    el.currentTime = 0;
                    if (playing) void el.play().catch(() => undefined);
                  }
                }}
                aria-label="Restart demo"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <span className="pointer-events-none ml-auto flex items-center gap-1.5 text-xs text-white/70">
                <Volume2 className="h-3.5 w-3.5" />
                Form guide
              </span>
            </div>
          </div>
        </div>
      </div>

      {!compact && tips.length > 0 && (
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="mb-2.5 flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-[var(--color-primary)]" />
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-subtle)]">
              Best practices
            </h3>
          </div>
          <ul className="space-y-2">
            {tips.map((tip, i) => (
              <li key={tip} className="flex gap-2.5 text-sm text-[var(--color-muted)]">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/15 text-[11px] font-semibold text-[var(--color-primary)] tabular">
                  {i + 1}
                </span>
                <span className="pt-0.5 leading-snug">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function hashGradient(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  const a = 160 + (Math.abs(h) % 40);
  const b = 180 + (Math.abs(h >> 8) % 50);
  return `linear-gradient(145deg, hsl(${a} 28% 18%), hsl(${b} 22% 10%))`;
}

function FormSilhouette({ exerciseId }: { exerciseId: string }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 text-center">
      <svg viewBox="0 0 120 160" className="h-40 w-32 text-white/80" fill="none">
        <circle cx="60" cy="22" r="12" stroke="currentColor" strokeWidth="3" />
        <path
          d={pathFor(exerciseId)}
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="text-sm text-white/70">Demo visual loading… form cues still work</p>
    </div>
  );
}

function pathFor(id: string): string {
  if (id.includes("plank")) return "M25 70 H95 M40 70 V120 M80 70 V120 M35 120 H45 M75 120 H85";
  if (id.includes("twist")) return "M60 40 V85 M40 55 L80 70 M50 85 L40 130 M70 85 L85 130";
  if (id.includes("raise") || id.includes("leg"))
    return "M60 40 V80 M45 55 L75 55 M50 80 L40 100 M70 80 L85 55 M55 100 H65";
  return "M60 40 V90 M40 55 L80 55 M50 90 L40 130 M70 90 L85 130";
}
