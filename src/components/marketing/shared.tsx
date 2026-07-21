/** Shared layout primitives for the marketing page. */

export const MAX_W = 1120;

export const SHELL: React.CSSProperties = {
  maxWidth: MAX_W,
  margin: "0 auto",
  padding: "0 clamp(20px, 5vw, 40px)",
};

/** 96px rhythm between marketing sections. */
export const SECTION_GAP = 96;

export const CARD: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-card)",
  padding: "24px 26px",
};

export const H2: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontWeight: 600,
  fontSize: "clamp(26px, 3vw, 32px)",
  letterSpacing: "-0.015em",
  lineHeight: 1.2,
  margin: 0,
  color: "var(--ink)",
};

export const KICKER: React.CSSProperties = {
  fontSize: 11.5,
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--accent-ink)",
  marginBottom: 14,
};

export const LEAD: React.CSSProperties = {
  fontSize: 14.5,
  lineHeight: 1.65,
  color: "var(--muted)",
  margin: "14px 0 0 0",
};

export const CHECK_ROW: React.CSSProperties = {
  display: "flex",
  gap: 9,
  fontSize: 13,
  color: "var(--ink)",
};

export function Check() {
  return (
    <span aria-hidden="true" style={{ color: "var(--ok)", flexShrink: 0 }}>
      ✓
    </span>
  );
}

export function SectionHeading({
  kicker,
  title,
  lead,
}: {
  kicker?: string;
  title: string;
  lead?: string;
}) {
  return (
    <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
      {kicker && <div style={KICKER}>{kicker}</div>}
      <h2 style={H2}>{title}</h2>
      {lead && <p style={LEAD}>{lead}</p>}
    </div>
  );
}

/** Primary / secondary CTA styles shared by header, hero and pricing. */
export const CTA_PRIMARY: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 36,
  fontSize: 14,
  fontWeight: 500,
  color: "var(--on-accent)",
  background: "var(--accent)",
  border: "1px solid var(--accent)",
  borderRadius: "var(--radius-control)",
  padding: "11px 22px",
  textDecoration: "none",
};

export const CTA_SECONDARY: React.CSSProperties = {
  ...CTA_PRIMARY,
  color: "var(--ink)",
  background: "var(--surface)",
  border: "1px solid var(--border)",
};
