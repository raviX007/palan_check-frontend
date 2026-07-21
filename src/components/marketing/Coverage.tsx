import { SectionHeading, SHELL, SECTION_GAP, Check, CHECK_ROW } from "./shared";

const REGIONS = [
  {
    code: "IN",
    name: "India",
    sub: "Data protection + labour compliance",
    items: [
      "Digital Personal Data Protection Act 2023",
      "DPDP Rules 2025 (notified Nov 14)",
      "Code on Wages 2019",
      "Industrial Relations Code 2020",
      "Social Security Code 2020",
      "OSH Code 2020",
    ],
  },
  {
    code: "EU",
    name: "European Union",
    sub: "Data protection + AI regulation",
    items: [
      "General Data Protection Regulation (GDPR)",
      "EU AI Act 2024",
      "EDPB Guidelines",
    ],
  },
];

export function Coverage() {
  return (
    <section id="coverage" style={{ ...SHELL, marginTop: SECTION_GAP }}>
      <SectionHeading kicker="Coverage" title="India + EU regulatory frameworks" />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 18,
          marginTop: 36,
          alignItems: "start",
        }}
      >
        {REGIONS.map((r) => (
          <div
            key={r.code}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-card)",
              padding: "26px 28px",
            }}
          >
            {/* Region code as a text chip — no flag glyphs. */}
            <div
              style={{
                display: "inline-block",
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--accent-ink)",
                background: "var(--accent-tint)",
                borderRadius: 5,
                padding: "4px 9px",
              }}
            >
              {r.code}
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 12, color: "var(--ink)" }}>
              {r.name}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 3 }}>{r.sub}</div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}
            >
              {r.items.map((i) => (
                <div key={i} style={CHECK_ROW}>
                  <Check />
                  <span>{i}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
