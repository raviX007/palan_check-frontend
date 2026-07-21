import { SHELL } from "./shared";

/** Text pills only — no logo images (design v3). */
const STACK = ["LangGraph", "Graph RAG", "MCP Protocol", "Langfuse", "pgvector", "FlashRank"];

export function TrustBar() {
  return (
    <div style={SHELL}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
          justifyContent: "center",
          marginTop: 72,
          padding: "22px 0",
          borderTop: "1px solid var(--border-soft)",
          borderBottom: "1px solid var(--border-soft)",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--faint)",
          }}
        >
          Powered by
        </span>
        {STACK.map((s) => (
          <span
            key={s}
            style={{
              fontSize: 12.5,
              fontWeight: 500,
              color: "var(--muted)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-pill)",
              padding: "6px 14px",
              background: "var(--surface)",
            }}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
