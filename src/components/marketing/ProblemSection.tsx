import { KICKER, H2, SHELL, SECTION_GAP } from "./shared";

const STATS: { value: string; caption: string; tone?: "high" }[] = [
  { value: "₹250 Cr", caption: "Maximum penalty per DPDP violation", tone: "high" },
  { value: "May 2027", caption: "Full compliance deadline" },
  { value: "4 Codes", caption: "New Labour Codes replacing 29 laws" },
  { value: "0 tools", caption: "AI compliance tools for Indian law" },
];

export function ProblemSection() {
  return (
    <section style={SHELL}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "clamp(32px, 5vw, 56px)",
          alignItems: "center",
          marginTop: SECTION_GAP - 8,
        }}
      >
        <div style={{ flex: "1 1 400px", minWidth: 0 }}>
          <div style={KICKER}>The problem</div>
          <h2 style={H2}>Every Indian tech company is suddenly regulated</h2>
          <p style={{ fontSize: 14.5, lineHeight: 1.7, color: "var(--muted)", margin: "18px 0 0" }}>
            DPDP Act 2023 was passed. Rules notified November 14, 2025. Full compliance deadline:
            May 2027. Four new Labour Codes replace 29 legacy laws. Zero AI tools exist for Indian
            regulatory compliance; only expensive consulting firms or foreign platforms legally
            excluded from being registered Consent Managers.
          </p>
        </div>

        <div
          style={{
            flex: "1 1 380px",
            minWidth: 0,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: 14,
          }}
        >
          {STATS.map((s) => (
            <div
              key={s.value}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-panel)",
                padding: "20px 22px",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                  fontSize: 30,
                  fontVariantNumeric: "tabular-nums",
                  color: s.tone ? `var(--${s.tone})` : "var(--ink)",
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: "var(--muted)",
                  marginTop: 6,
                  lineHeight: 1.5,
                }}
              >
                {s.caption}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
