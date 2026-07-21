/** Dashed container that explains what belongs here, plus a way to start. */
export function EmptyState({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px dashed var(--faint)",
        borderRadius: "var(--radius-card)",
        padding: "56px 32px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--ink)" }}>{title}</div>
      <div style={{ fontSize: 13, color: "var(--muted)", maxWidth: 400, lineHeight: 1.55 }}>
        {children}
      </div>
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  );
}
