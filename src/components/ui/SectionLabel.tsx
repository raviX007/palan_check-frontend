/** Uppercase kicker above headings and column groups. */
export function SectionLabel({
  accent = false,
  children,
}: {
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        fontSize: 11.5,
        fontWeight: 600,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: accent ? "var(--accent-ink)" : "var(--faint)",
      }}
    >
      {children}
    </div>
  );
}
