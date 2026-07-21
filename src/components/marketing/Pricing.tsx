import Link from "next/link";
import { SectionHeading, SHELL, SECTION_GAP, Check, CHECK_ROW } from "./shared";

interface Tier {
  name: string;
  price: string;
  per?: string;
  desc: string;
  features: string[];
  cta: "signup" | "soon";
  popular?: boolean;
}

const TIERS: Tier[] = [
  {
    name: "Community",
    price: "Free",
    desc: "Get started with DPDP compliance",
    features: [
      "5 queries per month",
      "DPDP Act only",
      "Chat interface",
      "1 user",
      "Community support",
    ],
    cta: "signup",
  },
  {
    name: "Starter",
    price: "₹4,999",
    per: " /month",
    desc: "For growing teams with Indian compliance needs",
    features: [
      "100 queries per month",
      "All Indian regulations (DPDP + Labour Codes)",
      "PDF compliance reports",
      "Compare view (policy vs regulation)",
      "3 users",
      "Email support",
    ],
    cta: "soon",
  },
  {
    name: "Professional",
    price: "₹14,999",
    per: " /month",
    desc: "For companies operating across jurisdictions",
    features: [
      "Unlimited queries",
      "DPDP + GDPR + EU AI Act",
      "Full API access",
      "MCP server integration",
      "Custom eval dashboard",
      "10 users",
      "Priority support",
    ],
    cta: "soon",
    popular: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" style={{ ...SHELL, marginTop: SECTION_GAP }}>
      <SectionHeading
        kicker="Pricing"
        title="Simple, transparent pricing"
        lead="Start free. Upgrade when your compliance needs grow."
      />

      {/* No align-items: start — cards stretch so CTAs bottom-align. */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 18,
          marginTop: 36,
        }}
      >
        {TIERS.map((t) => (
          <div
            key={t.name}
            style={{
              position: "relative",
              background: "var(--surface)",
              border: t.popular ? "1.5px solid var(--accent)" : "1px solid var(--border)",
              borderRadius: "var(--radius-card)",
              padding: "26px 28px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {t.popular && (
              <div
                style={{
                  position: "absolute",
                  top: -11,
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: 10.5,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--on-accent)",
                  background: "var(--accent)",
                  borderRadius: "var(--radius-pill)",
                  padding: "4px 12px",
                  whiteSpace: "nowrap",
                }}
              >
                Most popular
              </div>
            )}

            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--faint)",
              }}
            >
              {t.name}
            </div>

            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                fontSize: 34,
                marginTop: 10,
                color: "var(--ink)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {t.price}
              {t.per && (
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--faint)" }}>
                  {t.per}
                </span>
              )}
            </div>

            <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 6 }}>{t.desc}</div>

            {/* flex:1 pushes the CTA to the bottom of every card */}
            <div
              style={{
                flex: 1,
                borderTop: "1px solid var(--border-soft)",
                margin: "18px 0",
                paddingTop: 18,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {t.features.map((f) => (
                <div key={f} style={CHECK_ROW}>
                  <Check />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            {t.cta === "signup" ? (
              <Link
                href="/sign-in"
                className="palan-btn palan-btn-primary"
                style={{
                  display: "block",
                  textAlign: "center",
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: "var(--on-accent)",
                  background: "var(--accent)",
                  border: "1px solid var(--accent)",
                  borderRadius: "var(--radius-control)",
                  padding: "11px 0",
                  textDecoration: "none",
                }}
              >
                Get started
              </Link>
            ) : (
              <div
                aria-disabled="true"
                style={{
                  textAlign: "center",
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: "var(--faint)",
                  background: "var(--row)",
                  border: "1px solid var(--border-soft)",
                  borderRadius: "var(--radius-control)",
                  padding: "11px 0",
                }}
              >
                Coming soon
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
