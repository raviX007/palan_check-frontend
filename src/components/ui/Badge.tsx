type Variant = "high" | "medium" | "low" | "info" | "success" | "default";

const STYLES: Record<Variant, { bg: string; color: string; border: string }> = {
  high:    { bg: "var(--red-50)",   color: "var(--red-700)",   border: "1px solid rgba(239,68,68,.2)" },
  medium:  { bg: "var(--amber-50)", color: "var(--amber-700)", border: "1px solid rgba(245,158,11,.2)" },
  low:     { bg: "var(--green-50)", color: "var(--green-700)", border: "1px solid rgba(34,197,94,.2)" },
  info:    { bg: "var(--brand-50)", color: "var(--brand-700)", border: "1px solid var(--brand-200)" },
  success: { bg: "var(--green-50)", color: "var(--green-700)", border: "1px solid rgba(34,197,94,.2)" },
  default: { bg: "var(--s100)",     color: "var(--s600)",      border: "1px solid var(--s200)" },
};

const LABELS: Partial<Record<Variant, string>> = {
  high: "🔴 HIGH", medium: "🟡 MEDIUM", low: "🟢 LOW",
};

interface BadgeProps {
  variant?: Variant;
  children?: React.ReactNode;
}

export function Badge({ variant = "default", children }: BadgeProps) {
  const s = STYLES[variant];
  return (
    <span style={{
      fontSize: "0.6875rem", fontWeight: 600, padding: "2px 10px",
      borderRadius: "100px", background: s.bg, color: s.color, border: s.border,
      display: "inline-block",
    }}>
      {children ?? LABELS[variant] ?? variant}
    </span>
  );
}
