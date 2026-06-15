import Link from "next/link";

const tiers = [
  {
    name: "Community",
    price: "Free",
    period: "",
    description: "Get started with DPDP compliance",
    popular: false,
    cta: { label: "Get Started", href: "/sign-up", enabled: true },
    features: [
      "5 queries per month",
      "DPDP Act only",
      "Chat interface",
      "1 user",
      "Community support",
    ],
  },
  {
    name: "Starter",
    price: "₹4,999",
    period: "/month",
    description: "For growing teams with Indian compliance needs",
    popular: false,
    cta: { label: "Coming Soon", href: "#", enabled: false },
    features: [
      "100 queries per month",
      "All Indian regulations (DPDP + Labour Codes)",
      "PDF compliance reports",
      "Compare view (policy vs regulation)",
      "3 users",
      "Email support",
    ],
  },
  {
    name: "Professional",
    price: "₹14,999",
    period: "/month",
    description: "For companies operating across jurisdictions",
    popular: true,
    cta: { label: "Coming Soon", href: "#", enabled: false },
    features: [
      "Unlimited queries",
      "DPDP + GDPR + EU AI Act",
      "Full API access",
      "MCP server integration",
      "Custom eval dashboard",
      "10 users",
      "Priority support",
    ],
  },
];

export function Pricing() {
  return (
    <section className="pricing">
      <div className="pricing-inner">
        <div className="pricing-header">
          <div className="section-label">Pricing</div>
          <div className="section-title">Simple, transparent pricing</div>
          <p className="section-desc" style={{ textAlign: "center" }}>
            Start free. Upgrade when your compliance needs grow.
          </p>
        </div>
        <div className="pricing-grid">
          {tiers.map((tier) => (
            <div key={tier.name} className={`pricing-card${tier.popular ? " popular" : ""}`}>
              {tier.popular && <div className="pricing-badge">Most Popular</div>}
              <div className="pricing-name">{tier.name}</div>
              <div className="pricing-price">
                {tier.price}
                {tier.period && <span className="pricing-period">{tier.period}</span>}
              </div>
              <div className="pricing-desc">{tier.description}</div>
              <ul className="pricing-features">
                {tier.features.map((f) => (
                  <li key={f} className="pricing-feature">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              {tier.cta.enabled ? (
                <Link href={tier.cta.href} className="pricing-cta pricing-cta-primary">
                  {tier.cta.label}
                </Link>
              ) : (
                <span className="pricing-cta pricing-cta-disabled">{tier.cta.label}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
