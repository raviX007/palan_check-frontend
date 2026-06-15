interface ScoreBarProps {
  score: number;
  color?: string;
  height?: number;
}

export function ScoreBar({ score, color = "var(--brand-600)", height = 5 }: ScoreBarProps) {
  return (
    <div style={{
      height: `${height}px`, background: "var(--s200)",
      borderRadius: "100px", overflow: "hidden",
    }}>
      <div style={{
        width: `${Math.min(100, Math.max(0, score))}%`,
        height: "100%", background: color,
        borderRadius: "100px", transition: "width .6s",
      }} />
    </div>
  );
}
