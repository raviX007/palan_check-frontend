export function Architecture() {
  return (
    <section className="arch" id="architecture">
      <div className="arch-inner">
        <div className="arch-header">
          <div className="section-label">Architecture</div>
          <div className="section-title">4 layers, one PostgreSQL instance</div>
          <p className="section-desc" style={{ textAlign: "center" }}>
            Everything — vectors, BM25 index, knowledge graph, tenant data — runs on a single Neon PostgreSQL database.
          </p>
        </div>
        <div className="arch-layers">
          <div className="arch-layer">
            <div>
              <div className="arch-layer-num">Layer 1</div>
              <div className="arch-layer-name">Retrieval Pipeline</div>
            </div>
            <div className="arch-layer-detail">
              <span className="arch-chip primary">pgvector Semantic</span>
              <span className="arch-chip primary">GIN Index BM25</span>
              <span className="arch-chip primary">LightRAG Graph</span>
              <span className="arch-chip neutral">FlashRank Reranker</span>
            </div>
          </div>
          <div className="arch-connector">↓ Top-K chunks + graph paths ↓</div>
          <div className="arch-layer">
            <div>
              <div className="arch-layer-num">Layer 2</div>
              <div className="arch-layer-name">Agent Orchestration</div>
            </div>
            <div className="arch-layer-detail">
              <span className="arch-chip primary">Router Agent</span>
              <span className="arch-chip neutral">DPDP Agent</span>
              <span className="arch-chip neutral">Labour Code Agent</span>
              <span className="arch-chip neutral">GDPR Agent</span>
              <span className="arch-chip green">Synthesis Agent</span>
            </div>
          </div>
          <div className="arch-connector">↓ Structured tool calls ↓</div>
          <div className="arch-layer">
            <div>
              <div className="arch-layer-num">Layer 3</div>
              <div className="arch-layer-name">Tool Layer</div>
            </div>
            <div className="arch-layer-detail">
              <span className="arch-chip primary">Custom MCP Server</span>
              <span className="arch-chip neutral">Function Tools</span>
              <span className="arch-chip neutral">Filesystem MCP</span>
              <span className="arch-chip neutral">Search MCP</span>
            </div>
          </div>
          <div className="arch-connector">↓ Traces + metrics ↓</div>
          <div className="arch-layer">
            <div>
              <div className="arch-layer-num">Layer 4</div>
              <div className="arch-layer-name">Observability</div>
            </div>
            <div className="arch-layer-detail">
              <span className="arch-chip blue">Langfuse Tracing</span>
              <span className="arch-chip blue">50+ Eval Test Cases</span>
              <span className="arch-chip neutral">Cost Monitoring</span>
              <span className="arch-chip neutral">Prompt Versioning</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
