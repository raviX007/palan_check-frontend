import Link from "next/link";
import { SHELL, CTA_PRIMARY, CTA_SECONDARY } from "./shared";

/** Dark product shot. Fixed palette by design — it depicts the dark-theme app. */
const SHOT = {
  bg: "#14181F",
  panel: "#171C25",
  border: "#2A313D",
  rule: "#232A35",
  dim: "#68717F",
  text: "#C6CBD6",
  bright: "#E8EAF0",
  accent: "#8894F0",
  cite: "#9AA6FA",
  ok: "#66BD8F",
  bubble: "#242B4C",
};

const traceRow = (label: string, ms: string) => (
  <div key={label} style={{ display: "flex", gap: 8, fontSize: 11 }}>
    <span aria-hidden="true" style={{ color: SHOT.ok }}>
      ✓
    </span>
    <span style={{ color: SHOT.text }}>{label}</span>
    <span style={{ flex: 1 }} />
    <span style={{ fontFamily: "var(--font-mono)", color: SHOT.dim }}>{ms}</span>
  </div>
);

export function Hero() {
  return (
    <section style={{ ...SHELL, paddingTop: 64 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "clamp(32px, 5vw, 56px)",
          alignItems: "center",
        }}
      >
        <div style={{ flex: "1 1 420px", minWidth: 0 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              border: "1px solid var(--border)",
              background: "var(--surface)",
              borderRadius: "var(--radius-pill)",
              padding: "6px 14px",
              marginBottom: 20,
            }}
          >
            <span
              aria-hidden="true"
              style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ok)" }}
            />
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)" }}>
              DPDP Rules 2025 now covered
            </span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 600,
              fontSize: "clamp(34px, 4.5vw, 48px)",
              letterSpacing: "-0.02em",
              lineHeight: 1.12,
              margin: 0,
              color: "var(--ink)",
            }}
          >
            Agentic compliance for Indian and EU{" "}
            <span style={{ color: "var(--accent-ink)" }}>regulatory frameworks</span>
          </h1>

          <p
            style={{
              fontSize: 16,
              lineHeight: 1.65,
              color: "var(--muted)",
              margin: "20px 0 0",
              maxWidth: 520,
            }}
          >
            Multi-agent reasoning across the DPDP Act, Labour Codes, GDPR, and EU AI Act. The same
            question produces different answers based on your company profile, because compliance
            is never one-size-fits-all.
          </p>

          <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
            <a href="#quick-check" className="palan-btn palan-btn-primary" style={CTA_PRIMARY}>
              Check your compliance in 30 seconds
            </a>
            <Link href="/sign-in" className="palan-btn palan-btn-secondary" style={CTA_SECONDARY}>
              Sign in
            </Link>
          </div>

          <div style={{ fontSize: 12.5, color: "var(--high)", marginTop: 22 }}>
            Non-compliance penalty: up to ₹250 crore per violation under the DPDP Act 2023
          </div>
        </div>

        <div style={{ flex: "1 1 400px", minWidth: 0 }}>
          <div
            aria-hidden="true"
            style={{
              background: SHOT.bg,
              border: `1px solid ${SHOT.border}`,
              borderRadius: "var(--radius-card)",
              overflow: "hidden",
              boxShadow: "0 24px 56px rgba(23,28,38,0.22)",
              fontSize: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 14px",
                borderBottom: `1px solid ${SHOT.rule}`,
              }}
            >
              {["#E0655A", "#D5A052", "#66BD8F"].map((c) => (
                <span
                  key={c}
                  style={{ width: 9, height: 9, borderRadius: "50%", background: c }}
                />
              ))}
              <span
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10.5,
                  color: SHOT.dim,
                }}
              >
                palancheck.app/chat
              </span>
            </div>

            <div style={{ padding: "16px 18px 18px" }}>
              <div
                style={{
                  border: `1px solid ${SHOT.border}`,
                  borderRadius: 8,
                  background: SHOT.panel,
                  padding: "10px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {traceRow("Understood question", "12ms")}
                {traceRow("Searched the corpus · 4 sections", "89ms")}
                {traceRow("Ranked by relevance · §10(2) top", "15ms")}
                <div style={{ display: "flex", gap: 8, fontSize: 11, alignItems: "center" }}>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: SHOT.accent,
                      animation: "palan-pulse 1.2s ease-in-out infinite",
                    }}
                  />
                  <span style={{ color: SHOT.bright }}>Drafting the answer…</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                <div
                  style={{
                    background: SHOT.bubble,
                    color: SHOT.bright,
                    borderRadius: "10px 10px 3px 10px",
                    padding: "8px 12px",
                    fontSize: 11.5,
                  }}
                >
                  Does NovaPay need a DPO under DPDP?
                </div>
              </div>

              <div
                style={{ marginTop: 12, color: SHOT.text, fontSize: 11.5, lineHeight: 1.6 }}
              >
                Based on NovaPay&rsquo;s profile:{" "}
                <span style={{ color: SHOT.bright, fontWeight: 600 }}>
                  45 employees processing UPI transaction data
                </span>
                . You likely qualify as a Significant Data Fiduciary. Section 10(2) requires
                appointment of a Data Protection Officer…
              </div>

              <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                {["DPDP §10(2)", "DPDP Rules §4", "NovaPay Policy §3"].map((c) => (
                  <span
                    key={c}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: SHOT.cite,
                      border: `1px solid ${SHOT.border}`,
                      borderRadius: 5,
                      padding: "3px 8px",
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
