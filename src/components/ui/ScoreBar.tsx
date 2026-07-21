import type { Level } from "./Badge";

/** Score → tone. Used by verdict band, report domains and the eval table. */
export function scoreTone(score: number): Level {
  if (score >= 80) return "ok";
  if (score >= 50) return "med";
  return "high";
}

interface ScoreBarProps {
  score: number;
  /** Override the tone-derived fill colour. Prefer letting the tone decide. */
  color?: string;
  height?: number;
}

export function ScoreBar({ score, color, height = 5 }: ScoreBarProps) {
  const pct = Math.min(100, Math.max(0, score));
  return (
    <div
      role="presentation"
      style={{
        height,
        background: "var(--row)",
        borderRadius: "var(--radius-pill)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: color ?? `var(--${scoreTone(score)})`,
          borderRadius: "var(--radius-pill)",
          transition: "width .6s",
        }}
      />
    </div>
  );
}
