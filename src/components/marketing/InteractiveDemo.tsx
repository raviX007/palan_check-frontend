"use client";

import { useState } from "react";

const companies = [
  {
    name: "🇮🇳 NovaPay Fintech",
    meta: "Bengaluru · 45 employees · Fintech\nProcesses UPI transaction data",
    jurisdiction: "india",
    jurisdictionLabel: "India — DPDP + Labour Codes",
    answer: {
      header: "NovaPay Fintech — DPDP Analysis",
      text: "Based on NovaPay's profile — <strong>45 employees processing UPI transaction data</strong> in Bengaluru and Mumbai — you likely qualify as a <strong>Significant Data Fiduciary</strong> under DPDP. The volume of financial personal data processed triggers the threshold.",
      findings: [
        { severity: "high", text: "Section 10(2): Must appoint a DPO resident in India. Current status: No DPO designated." },
        { severity: "high", text: "Section 10(1)(b): Must conduct annual Data Protection Impact Assessment for UPI processing." },
        { severity: "medium", text: "Section 10(1)(d): Must appoint independent data auditor. Current status: Not in place." },
      ],
      citations: ["DPDP Sec 10(1)", "DPDP Sec 10(2)", "DPDP Rules §4", "NovaPay Policy §3"],
    },
  },
  {
    name: "🇮🇳 EduSpark Academy",
    meta: "Mumbai · 25 employees · EdTech\nProcesses children's learning data",
    jurisdiction: "india",
    jurisdictionLabel: "India — DPDP (children's data)",
    answer: {
      header: "EduSpark Academy — DPDP Analysis",
      text: "EduSpark processes <strong>children's learning data</strong> (under-18 users). Under DPDP, <strong>children's data receives the highest protection tier</strong> regardless of company size. Even with 25 employees, EduSpark faces stricter obligations than larger companies processing only adult data.",
      findings: [
        { severity: "high", text: "Section 9: Processing children's data requires verifiable parental consent. No mechanism detected." },
        { severity: "high", text: "Section 9(2): Cannot track, profile, or serve targeted advertising to children. Current analytics likely violates this." },
        { severity: "medium", text: "Section 10(2): DPO appointment likely required — children's data processing is a strong indicator for SDF classification." },
      ],
      citations: ["DPDP Sec 9(1)", "DPDP Sec 9(2)", "DPDP Sec 10(2)", "DPDP Rules §3"],
    },
  },
  {
    name: "🇪🇺 DataFlow GmbH",
    meta: "Berlin · 80 employees · SaaS\nProcesses EU customer data + deploys AI",
    jurisdiction: "eu",
    jurisdictionLabel: "EU — GDPR + AI Act",
    answer: {
      header: "DataFlow GmbH — GDPR + AI Act Analysis",
      text: "DataFlow is an <strong>EU-based SaaS company deploying AI systems</strong>. This triggers <strong>both GDPR and EU AI Act</strong> obligations. Under GDPR, systematic monitoring of data subjects at scale requires a DPO. Under the AI Act, deploying high-risk AI requires conformity assessments.",
      findings: [
        { severity: "high", text: "GDPR Art 37: Must designate a DPO — systematic monitoring of EU data subjects at scale." },
        { severity: "high", text: "AI Act Art 6: If AI system is categorized as high-risk, must complete conformity assessment before deployment." },
        { severity: "medium", text: "GDPR Art 35: Must conduct DPIA for automated processing with legal effects on individuals." },
      ],
      citations: ["GDPR Art 37", "GDPR Art 35", "AI Act Art 6", "AI Act Art 9"],
    },
  },
];

const severityIcon: Record<string, string> = { high: "🔴", medium: "🟡", low: "🟢" };

export function InteractiveDemo() {
  const [active, setActive] = useState(0);
  const a = companies[active].answer;

  return (
    <section className="demo" id="demo">
      <div className="demo-inner">
        <div className="demo-header">
          <div className="section-label">The Killer Feature</div>
          <div className="section-title">Different company, different answer</div>
          <p className="section-desc" style={{ textAlign: "center" }}>
            Select a company below. The same question — &ldquo;Do I need a Data Protection Officer?&rdquo; —
            produces a different, contextual answer.
          </p>
        </div>
        <div className="demo-showcase">
          <div className="demo-companies">
            <div className="demo-label">Select Company</div>
            {companies.map((c, i) => (
              <div
                key={c.name}
                className={`demo-company${active === i ? " active" : ""}`}
                onClick={() => setActive(i)}
              >
                <div className="demo-company-name">{c.name}</div>
                <div className="demo-company-meta">{c.meta}</div>
                <span className={`demo-company-jurisdiction ${c.jurisdiction}`}>
                  {c.jurisdictionLabel}
                </span>
              </div>
            ))}
          </div>
          <div className="demo-answer">
            <div className="demo-question">
              <span style={{ color: "var(--brand-400)", marginRight: 6 }}>🧑</span>
              Do I need a Data Protection Officer?
            </div>
            <div className="demo-answer-header">{a.header}</div>
            <div
              className="demo-answer-text"
              dangerouslySetInnerHTML={{ __html: a.text }}
            />
            {a.findings.map((f, i) => (
              <div key={i} className={`demo-finding ${f.severity}`}>
                <span className="finding-icon">{severityIcon[f.severity]}</span>
                <span className="finding-text">{f.text}</span>
              </div>
            ))}
            <div className="demo-citations">
              {a.citations.map((c) => (
                <span key={c} className="demo-cite">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
