import { Card } from "./Card";

/** Big number + caption — problem stats and eval KPIs. */
export function StatTile({
  value,
  caption,
  tone,
  children,
}: {
  value: string;
  caption: string;
  tone?: "high" | "ok";
  /** Optional delta line under the caption. */
  children?: React.ReactNode;
}) {
  return (
    <Card style={{ padding: "20px 22px", borderRadius: "var(--radius-panel)" }}>
      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 600,
          fontSize: 30,
          fontVariantNumeric: "tabular-nums",
          color: tone ? `var(--${tone})` : "var(--ink)",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 6, lineHeight: 1.5 }}>
        {caption}
      </div>
      {children}
    </Card>
  );
}
