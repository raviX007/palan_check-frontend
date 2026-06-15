import Link from "next/link";

export function Hero() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            DPDP Rules 2025 now covered
          </div>
          <h1>
            Agentic compliance for Indian and EU{" "}
            <em>regulatory frameworks</em>
          </h1>
          <p className="hero-sub">
            Multi-agent reasoning across DPDP Act, Labour Codes, GDPR, and EU AI Act.
            The same question produces different answers based on your company profile —
            because compliance is never one-size-fits-all.
          </p>
          <div className="hero-ctas">
            <Link href="/quick-check" className="btn btn-primary">
              Check Your Compliance in 30 Seconds
            </Link>
            <Link href="/sign-in" className="btn btn-ghost">Sign In</Link>
          </div>
          <div className="hero-penalty">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Non-compliance penalty: up to ₹250 Crore per violation under DPDP Act 2023
          </div>
        </div>

        <div className="hero-preview">
          <div className="preview-bar">
            <span className="preview-dot r" />
            <span className="preview-dot y" />
            <span className="preview-dot g" />
            <span className="preview-url">palancheck.vercel.app/chat</span>
          </div>
          <div className="preview-body">
            <div className="preview-sidebar">
              <div className="preview-nav">
                <div className="preview-nav-item">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                  </svg>
                  Dashboard
                </div>
                <div className="preview-nav-item active">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Chat
                </div>
                <div className="preview-nav-item">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                  </svg>
                  Documents
                </div>
                <div className="preview-nav-item">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  </svg>
                  Reports
                </div>
                <div className="preview-nav-label">Company</div>
                <div className="preview-nav-company">
                  <div className="preview-nav-company-name">🇮🇳 NovaPay Fintech</div>
                  <div className="preview-nav-company-meta">Bengaluru · 45 emp</div>
                </div>
              </div>
              <div className="preview-main">
                <div className="preview-trace">
                  <div className="preview-trace-title">Agent Trace</div>
                  <div className="preview-step"><span className="done">✓</span> Router → DPDP domain <span className="ms">12ms</span></div>
                  <div className="preview-step"><span className="done">✓</span> Retriever: 4 chunks <span className="ms">89ms</span></div>
                  <div className="preview-step"><span className="done">✓</span> Reranker: Sec 10(2) <span className="ms">15ms</span></div>
                  <div className="preview-step"><span className="running">●</span> LLM: Generating... <span className="ms">1.2s</span></div>
                  <div className="preview-step"><span className="pending">○</span> Synthesis: Pending</div>
                </div>
                <div className="preview-msg">
                  <div className="preview-msg-user">Does NovaPay need a DPO under DPDP?</div>
                  <div className="preview-msg-ai">
                    Based on NovaPay&apos;s profile — 45 employees processing UPI transaction data — you likely qualify as a <strong>Significant Data Fiduciary</strong>. Section 10(2) requires appointment of a Data Protection Officer...
                    <div className="preview-citations">
                      <span className="preview-cite">DPDP Sec 10(2)</span>
                      <span className="preview-cite">DPDP Rules §4</span>
                      <span className="preview-cite">NovaPay Policy §3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
