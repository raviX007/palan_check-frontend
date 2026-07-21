"use client";

import { useState } from "react";
import { SectionHeading, SHELL, SECTION_GAP } from "./shared";
import type { Level } from "@/components/ui/Badge";

interface Company {
  name: string;
  meta: string;
  scope: string;
  scopeTone: Level;
  kicker: string;
  analysis: string;
  findings: { level: Level; text: string }[];
  cites: string[];
}

const COMPANIES: Company[] = [
  {
    name: "NovaPay Fintech",
    meta: "Bengaluru · 45 employees · processes UPI transaction data",
    scope: "India · DPDP + Labour",
    scopeTone: "med",
    kicker: "NovaPay Fintech · DPDP analysis",
    analysis:
      "Based on NovaPay’s profile: 45 employees processing UPI transaction data in Bengaluru and Mumbai. You likely qualify as a Significant Data Fiduciary under DPDP. The volume of financial personal data processed triggers the threshold.",
    findings: [
      {
        level: "high",
        text: "Section 10(2): Must appoint a DPO resident in India. Current status: no DPO designated.",
      },
      {
        level: "high",
        text: "Section 10(1)(b): Must conduct an annual Data Protection Impact Assessment for UPI processing.",
      },
      {
        level: "med",
        text: "Section 10(1)(d): Must appoint an independent data auditor. Current status: not in place.",
      },
    ],
    cites: ["DPDP Sec 10(1)", "DPDP Sec 10(2)", "DPDP Rules §4", "NovaPay Policy §3"],
  },
  {
    name: "EduSpark Academy",
    meta: "Mumbai · 25 employees · processes children's learning data",
    scope: "India · DPDP (children)",
    scopeTone: "med",
    kicker: "EduSpark Academy · DPDP analysis",
    analysis:
      "With 25 employees processing children’s learning data, EduSpark is unlikely to be designated a Significant Data Fiduciary on volume alone, so no mandatory DPO yet. But children’s data carries its own stricter duties, and designation criteria include data sensitivity.",
    findings: [
      {
        level: "high",
        text: "Section 9(1): Verifiable parental consent required before processing any child’s data.",
      },
      {
        level: "med",
        text: "Section 9(3): Tracking and targeted advertising directed at children are prohibited.",
      },
      {
        level: "low",
        text: "Section 13: A grievance contact for data principals is required regardless of SDF status.",
      },
    ],
    cites: ["DPDP §9", "DPDP §10(2)", "DPDP §13", "EduSpark Policy §2"],
  },
  {
    name: "DataFlow GmbH",
    meta: "Berlin · 80 employees · EU customer data + deploys AI",
    scope: "EU · GDPR + AI Act",
    scopeTone: "low",
    kicker: "DataFlow GmbH · GDPR + AI Act analysis",
    analysis:
      "Under GDPR Article 37, a DPO is mandatory where core activities involve regular and systematic monitoring of data subjects at scale; DataFlow’s analytics product likely qualifies. Deploying AI models adds EU AI Act provider obligations on top.",
    findings: [
      {
        level: "high",
        text: "GDPR Art. 37: DPO designation required; may be an external service provider based in the EU.",
      },
      {
        level: "med",
        text: "EU AI Act Art. 16: Provider obligations: risk management, logging, and technical documentation.",
      },
      {
        level: "low",
        text: "GDPR Art. 30: Records of processing activities must be maintained and current.",
      },
    ],
    cites: ["GDPR Art. 37", "EU AI Act Art. 16", "EDPB WP243"],
  },
];

const LEVEL_WORD: Record<Level, string> = {
  high: "High",
  med: "Medium",
  low: "Low",
  ok: "OK",
};

export function InteractiveDemo() {
  const [selected, setSelected] = useState(0);
  const c = COMPANIES[selected];

  return (
    <section id="demo" style={{ ...SHELL, marginTop: SECTION_GAP }}>
      <SectionHeading
        kicker="The killer feature"
        title="Different company, different answer"
        lead="Select a company. The same question, “Do I need a Data Protection Officer?”, produces a different, contextual answer."
      />

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          marginTop: 36,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "clamp(16px, 3vw, 24px)",
        }}
      >
        <div
          style={{
            flex: "1 1 250px",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--faint)",
              padding: "2px 4px",
            }}
          >
            Select company
          </div>

          {COMPANIES.map((co, i) => {
            const active = i === selected;
            return (
              <button
                key={co.name}
                type="button"
                onClick={() => setSelected(i)}
                aria-pressed={active}
                className="palan-demo-co"
                style={{
                  textAlign: "left",
                  border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                  background: active ? "var(--accent-tint)" : "var(--surface)",
                  borderRadius: 10,
                  padding: "14px 16px",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                }}
              >
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>
                  {co.name}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    marginTop: 3,
                    lineHeight: 1.5,
                  }}
                >
                  {co.meta}
                </div>
                <div
                  style={{
                    display: "inline-block",
                    fontSize: 10.5,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: `var(--${co.scopeTone})`,
                    background: `var(--${co.scopeTone}-bg)`,
                    borderRadius: 5,
                    padding: "3px 8px",
                    marginTop: 8,
                  }}
                >
                  {co.scope}
                </div>
              </button>
            );
          })}
        </div>

        <div
          style={{
            flex: "999 1 340px",
            minWidth: 0,
            border: "1px solid var(--border-soft)",
            background: "var(--bg)",
            borderRadius: 12,
            padding: "clamp(16px, 3vw, 24px)",
          }}
        >
          <div
            style={{
              display: "inline-block",
              background: "var(--accent-tint)",
              color: "var(--ink)",
              borderRadius: "10px 10px 3px 10px",
              padding: "9px 14px",
              fontSize: 13,
            }}
          >
            Do I need a Data Protection Officer?
          </div>

          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--faint)",
              margin: "18px 0 10px",
            }}
          >
            {c.kicker}
          </div>

          <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "var(--ink)", margin: 0 }}>
            {c.analysis}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
            {c.findings.map((f) => (
              <div
                key={f.text}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  background: `var(--${f.level}-bg)`,
                  borderRadius: 8,
                  padding: "10px 14px",
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: `var(--${f.level})`,
                    marginTop: 2,
                  }}
                >
                  {LEVEL_WORD[f.level]}
                </span>
                <span style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--ink)" }}>
                  {f.text}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            {c.cites.map((cite) => (
              <span
                key={cite}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--muted)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-chip)",
                  padding: "4px 10px",
                  background: "var(--surface)",
                }}
              >
                {cite}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
