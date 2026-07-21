import { SectionHeading, SHELL, SECTION_GAP, CARD } from "./shared";

/** Six equal cards — title + description, no icon tiles (design v3). */
const FEATURES = [
  {
    title: "Multi-tenant reasoning",
    desc: "Same question, different answers. A 45-person fintech gets different DPDP obligations than a 25-person edtech or a German SaaS company. Company profile drives every response.",
  },
  {
    title: "Graph-enhanced retrieval",
    desc: "Triple retrieval: pgvector semantic search, BM25 keyword matching, and LightRAG knowledge-graph traversal. FlashRank reranking. All on a single PostgreSQL instance.",
  },
  {
    title: "4 regulatory domains",
    desc: "DPDP Act 2023, four Labour Codes (Wages, IR, Social Security, OSH), GDPR, and EU AI Act. Domain-specific agents understand cross-references and exceptions.",
  },
  {
    title: "Custom MCP server",
    desc: "Regulatory corpus exposed as discoverable tools via Model Context Protocol. Agents don't just search: they use structured tools like get_penalty_info() and compare_against_regulation().",
  },
  {
    title: "Agent trace visibility",
    desc: "Watch every reasoning step in real time: router classification, retrieval chunks, reranker scores, LLM generation, synthesis merge. Full Langfuse observability with cost tracking.",
  },
  {
    title: "Gap analysis reports",
    desc: "Upload your privacy policy or employment contract. Get a structured report: findings by severity, specific section citations, and a prioritized remediation plan you can act on.",
  },
];

export function Features() {
  return (
    <section id="capabilities" style={{ ...SHELL, marginTop: SECTION_GAP }}>
      <SectionHeading
        kicker="Capabilities"
        title="Four agents, one compliance answer"
        lead="Domain-specific agents collaborate through LangGraph to deliver contextual, citation-backed compliance guidance."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 18,
          marginTop: 36,
        }}
      >
        {FEATURES.map((f) => (
          <div key={f.title} style={CARD}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: "var(--ink)" }}>
              {f.title}
            </div>
            <p style={{ fontSize: 13.5, lineHeight: 1.65, color: "var(--muted)", margin: 0 }}>
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
