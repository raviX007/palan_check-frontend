import { CSSProperties } from "react";

/**
 * Severity/status is ALWAYS a word + a token colour pair — never colour alone,
 * never a coloured dot, never an emoji glyph (AGENT.md hard constraints).
 */
export type Level = "high" | "med" | "low" | "ok";

const LEVEL_LABEL: Record<Level, string> = {
  high: "High",
  med: "Medium",
  low: "Low",
  ok: "OK",
};

interface BadgeProps {
  level: Level;
  children?: React.ReactNode;
  style?: CSSProperties;
}

export function Badge({ level, children, style }: BadgeProps) {
  return (
    <span
      style={{
        fontSize: 10.5,
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: `var(--${level})`,
        background: `var(--${level}-bg)`,
        borderRadius: 5,
        padding: "4px 9px",
        whiteSpace: "nowrap",
        display: "inline-block",
        ...style,
      }}
    >
      {children ?? LEVEL_LABEL[level]}
    </span>
  );
}

/** Alias matching the handoff reference naming. */
export const SeverityBadge = Badge;
