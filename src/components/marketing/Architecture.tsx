import { SectionHeading, SHELL, SECTION_GAP } from "./shared";

type ChipTone = "accent" | "neutral" | "ok";

interface Layer {
  n: number;
  name: string;
  chips: { label: string; tone: ChipTone }[];
  connector?: string;
}

const LAYERS: Layer[] = [
  {
    n: 1,
    name: "Retrieval pipeline",
    chips: [
      { label: "pgvector Semantic", tone: "accent" },
      { label: "GIN Index BM25", tone: "accent" },
      { label: "LightRAG Graph", tone: "accent" },
      { label: "FlashRank Reranker", tone: "neutral" },
    ],
    connector: "↓ Top-K chunks + graph paths ↓",
  },
  {
    n: 2,
    name: "Agent orchestration",
    chips: [
      { label: "Router Agent", tone: "accent" },
      { label: "DPDP Agent", tone: "neutral" },
      { label: "Labour Code Agent", tone: "neutral" },
      { label: "GDPR Agent", tone: "neutral" },
      { label: "Synthesis Agent", tone: "ok" },
    ],
    connector: "↓ Structured tool calls ↓",
  },
  {
    n: 3,
    name: "Tool layer",
    chips: [
      { label: "Custom MCP Server", tone: "accent" },
      { label: "Function Tools", tone: "neutral" },
      { label: "Filesystem MCP", tone: "neutral" },
      { label: "Search MCP", tone: "neutral" },
    ],
    connector: "↓ Traces + metrics ↓",
  },
  {
    n: 4,
    name: "Observability",
    chips: [
      { label: "Langfuse Tracing", tone: "accent" },
      { label: "50+ Eval Test Cases", tone: "accent" },
      { label: "Cost Monitoring", tone: "neutral" },
      { label: "Prompt Versioning", tone: "neutral" },
    ],
  },
];

const CHIP: Record<ChipTone, React.CSSProperties> = {
  accent: { color: "var(--accent-ink)", background: "var(--accent-tint)" },
  neutral: { color: "var(--muted)", background: "var(--row)" },
  ok: { color: "var(--ok)", background: "var(--ok-bg)" },
};

export function Architecture() {
  return (
    <section id="architecture" style={{ ...SHELL, marginTop: SECTION_GAP }}>
      <SectionHeading
        kicker="Architecture"
        title="4 layers, one PostgreSQL instance"
        lead="Everything (vectors, BM25 index, knowledge graph, tenant data) runs on a single Neon PostgreSQL database."
      />

      <div style={{ maxWidth: 880, margin: "36px auto 0" }}>
        {LAYERS.map((layer) => (
          <div key={layer.n}>
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-card)",
                padding: "22px 26px",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div style={{ flex: "0 0 190px" }}>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--accent-ink)",
                    marginBottom: 6,
                  }}
                >
                  LAYER {layer.n}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>
                  {layer.name}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {layer.chips.map((c) => (
                  <span
                    key={c.label}
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      borderRadius: 7,
                      padding: "6px 12px",
                      ...CHIP[c.tone],
                    }}
                  >
                    {c.label}
                  </span>
                ))}
              </div>
            </div>

            {layer.connector && (
              <div
                aria-hidden="true"
                style={{
                  textAlign: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--faint)",
                  padding: "10px 0",
                }}
              >
                {layer.connector}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
