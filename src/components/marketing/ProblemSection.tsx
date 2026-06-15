export function ProblemSection() {
  return (
    <section className="problem">
      <div className="problem-inner">
        <div>
          <div className="section-label">The Problem</div>
          <div className="section-title">Every Indian tech company is suddenly regulated</div>
          <p className="section-desc">
            DPDP Act 2023 was passed. Rules notified November 14, 2025. Full compliance deadline: May 2027.
            Four new Labour Codes replace 29 legacy laws. Zero AI tools exist for Indian regulatory compliance —
            only expensive consulting firms or foreign platforms legally excluded from being registered Consent Managers.
          </p>
        </div>
        <div className="problem-stats">
          <div className="stat-card danger">
            <div className="stat-number">₹250 Cr</div>
            <div className="stat-label">Maximum penalty per DPDP violation</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">May 2027</div>
            <div className="stat-label">Full compliance deadline</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">4 Codes</div>
            <div className="stat-label">New Labour Codes replacing 29 laws</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">0 tools</div>
            <div className="stat-label">AI compliance tools for Indian law</div>
          </div>
        </div>
      </div>
    </section>
  );
}
