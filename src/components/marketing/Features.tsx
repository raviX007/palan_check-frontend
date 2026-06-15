const features = [
  {
    title: "Multi-Tenant Reasoning",
    desc: "Same question, different answers. A 45-person fintech gets different DPDP obligations than a 25-person edtech or a German SaaS company. Company profile drives every response.",
    icon: <svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    title: "Graph-Enhanced Retrieval",
    desc: "Triple retrieval: pgvector semantic search, BM25 keyword matching, and LightRAG knowledge graph traversal. FlashRank reranking. All on a single PostgreSQL instance.",
    icon: <svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  },
  {
    title: "4 Regulatory Domains",
    desc: "DPDP Act 2023, four Labour Codes (Wages, IR, Social Security, OSH), GDPR, and EU AI Act. Domain-specific agents understand cross-references and exceptions.",
    icon: <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  },
  {
    title: "Custom MCP Server",
    desc: "Regulatory corpus exposed as discoverable tools via Model Context Protocol. Agents don't just search — they use structured tools like get_penalty_info() and compare_against_regulation().",
    icon: <svg viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  },
  {
    title: "Agent Trace Visibility",
    desc: "Watch every reasoning step in real-time: Router classification, retrieval chunks, reranker scores, LLM generation, synthesis merge. Full Langfuse observability with cost tracking.",
    icon: <svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  },
  {
    title: "Gap Analysis Reports",
    desc: "Upload your privacy policy or employment contract. Get a structured report: findings by severity, specific section citations, and a prioritized remediation plan you can act on.",
    icon: <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>,
  },
];

export function Features() {
  return (
    <section className="features" id="features">
      <div className="features-inner">
        <div className="features-header">
          <div className="section-label">Capabilities</div>
          <div className="section-title">Four agents, one compliance answer</div>
          <p className="section-desc" style={{ textAlign: "center" }}>
            Domain-specific agents collaborate through LangGraph to deliver contextual, citation-backed compliance guidance.
          </p>
        </div>
        <div className="features-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
