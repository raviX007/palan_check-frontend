"use client";

import { useState } from "react";
import Link from "next/link";

const SCORES = [
  { label: "DPDP Act", pct: 65, color: "var(--amber-500)", textColor: "var(--amber-700)", cls: "amber" },
  { label: "Labour Codes", pct: 40, color: "var(--red-500)", textColor: "var(--red-700)", cls: "red" },
  { label: "Overall", pct: 52, color: "var(--amber-500)", textColor: "var(--amber-700)", cls: "amber" },
];

type Severity = "high" | "medium" | "low";

interface Finding {
  severity: Severity;
  title: string;
  body: string;
  remediation: string;
  citations: string[];
}

interface Domain {
  label: string;
  findings: Finding[];
}

const DOMAINS: Domain[] = [
  {
    label: "🇮🇳 DPDP Act 2023 — Findings",
    findings: [
      {
        severity: "high",
        title: "Privacy policy missing purpose specification",
        body: "Section 6(1)(b) requires explicit purpose for each category of personal data collected. NovaPay's privacy policy uses generic \"to improve services\" language without specifying purposes for UPI transaction data vs. customer contact information.",
        remediation: "Add specific purpose statement for each data type — UPI transaction data (payment processing), customer contact info (account management, support), device data (security monitoring).",
        citations: ["DPDP Sec 6(1)(b)", "NovaPay Policy §3"],
      },
      {
        severity: "medium",
        title: "No consent withdrawal mechanism",
        body: "Section 6(5) requires \"ease of withdrawal equal to ease of giving consent.\" No self-service consent withdrawal mechanism found in NovaPay's privacy policy or application.",
        remediation: "Add self-service consent dashboard where users can withdraw consent for non-essential data processing with the same number of clicks as initial consent.",
        citations: ["DPDP Sec 6(5)"],
      },
      {
        severity: "medium",
        title: "No Data Processing Agreement with vendors",
        body: "Section 8(2) requires Data Fiduciaries to have valid contracts with Data Processors. No DPA found in NovaPay's uploaded vendor agreement.",
        remediation: "Draft and execute a DPA with all third-party vendors processing personal data on NovaPay's behalf.",
        citations: ["DPDP Sec 8(2)", "NovaPay Vendor Agreement"],
      },
    ],
  },
  {
    label: "🇮🇳 Labour Codes — Findings",
    findings: [
      {
        severity: "high",
        title: "CTC structure violates 50% basic pay rule",
        body: "Code on Wages Section 2(y) defines wages and requires basic pay to constitute at least 50% of CTC. NovaPay's current structure allocates only 35% to basic pay, with the remainder in HRA, special allowances, and other components.",
        remediation: "Restructure employee compensation to allocate minimum 50% of CTC as basic pay. This will increase PF/gratuity liability — factor this into budget planning.",
        citations: ["Code on Wages §2(y)", "NovaPay CTC Structure"],
      },
      {
        severity: "low",
        title: "ESIC registration current for Karnataka",
        body: "NovaPay's ESIC registration for Karnataka employees earning below ₹21,000/month appears to be in order. Verify Maharashtra office registration is also active.",
        remediation: "",
        citations: ["Social Security Code §3"],
      },
    ],
  },
];

const REMEDIATION = [
  {
    priority: "Priority 1 — This Week",
    color: "var(--red-700)",
    items: [
      "Update privacy policy with specific purpose per data category",
      "Restructure CTC to minimum 50% basic pay",
    ],
  },
  {
    priority: "Priority 2 — This Month",
    color: "var(--amber-700)",
    items: [
      "Build self-service consent withdrawal UI",
      "Draft and execute Data Processing Agreement with all vendors",
      "Verify Maharashtra ESIC registration status",
    ],
  },
];

const SEV_CONFIG: Record<Severity, { label: string; bg: string; color: string; border: string; borderLeft: string }> = {
  high:   { label: "🔴 HIGH",   bg: "var(--red-50)",   color: "var(--red-700)",   border: "1px solid rgba(239,68,68,.2)",    borderLeft: "4px solid var(--red-500)" },
  medium: { label: "🟡 MEDIUM", bg: "var(--amber-50)", color: "var(--amber-700)", border: "1px solid rgba(245,158,11,.2)",   borderLeft: "4px solid var(--amber-500)" },
  low:    { label: "🟢 LOW",    bg: "var(--green-50)", color: "var(--green-700)", border: "1px solid rgba(34,197,94,.2)",    borderLeft: "4px solid var(--green-500)" },
};

function SeverityBadge({ sev }: { sev: Severity }) {
  const c = SEV_CONFIG[sev];
  return (
    <span style={{
      fontSize: "0.6875rem", fontWeight: 600, padding: "2px 10px",
      borderRadius: "100px", background: c.bg, color: c.color, border: c.border,
    }}>
      {c.label}
    </span>
  );
}

function FindingCard({ f }: { f: Finding }) {
  const c = SEV_CONFIG[f.severity];
  return (
    <div style={{
      background: "#fff", border: "1px solid var(--s200)", borderLeft: c.borderLeft,
      borderRadius: "10px", padding: "18px 20px", marginBottom: "12px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <SeverityBadge sev={f.severity} />
        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--s800)" }}>{f.title}</span>
      </div>
      <p style={{ fontSize: "0.8125rem", color: "var(--s600)", lineHeight: 1.6, marginBottom: "10px" }}>
        {f.body}
      </p>
      {f.remediation && (
        <div style={{
          fontSize: "0.8125rem", color: "var(--s700)", background: "var(--s50)",
          padding: "10px 14px", borderRadius: "6px", marginBottom: "10px",
        }}>
          <strong style={{ color: "var(--brand-600)" }}>Remediation:</strong> {f.remediation}
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {f.citations.map((c) => (
          <span key={c} style={{
            fontFamily: "var(--font-m)", fontSize: "0.6875rem",
            background: "var(--brand-50)", color: "var(--brand-700)",
            border: "1px solid var(--brand-200)", padding: "3px 10px", borderRadius: "4px",
            cursor: "pointer",
          }}>
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  function toggle(key: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  return (
    <div style={{ maxWidth: "900px" }}>

      {/* Report Header */}
      <div style={{
        background: "#fff", border: "1px solid var(--s200)",
        borderRadius: "10px", padding: "24px", marginBottom: "20px",
      }}>
        <div style={{ fontFamily: "var(--font-d)", fontSize: "1.25rem", fontWeight: 700, color: "var(--s900)", marginBottom: "4px" }}>
          Compliance Report — NovaPay Fintech Pvt Ltd
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--s400)", display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "16px" }}>
          <span>📅 Generated: Feb 22, 2026</span>
          <span>⏱ 2.1 seconds</span>
          <span>💰 ₹0.12 API cost</span>
          <span>📊 5 findings across 2 domains</span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {["📥 Download PDF", "📥 Download Markdown"].map((label) => (
            <button key={label} style={{
              padding: "7px 14px", border: "1.5px solid var(--s200)", borderRadius: "6px",
              fontSize: "0.75rem", fontWeight: 500, color: "var(--s600)", background: "#fff",
              cursor: "pointer", fontFamily: "var(--font-b)", display: "inline-flex", alignItems: "center", gap: "4px",
            }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--brand-200)";
                (e.currentTarget as HTMLElement).style.color = "var(--brand-600)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--s200)";
                (e.currentTarget as HTMLElement).style.color = "var(--s600)";
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Score Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
        {SCORES.map((s) => (
          <div key={s.label} style={{
            background: "#fff", border: "1px solid var(--s200)",
            borderRadius: "10px", padding: "16px", textAlign: "center",
          }}>
            <div style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--s500)", marginBottom: "6px" }}>
              {s.label}
            </div>
            <div style={{ fontFamily: "var(--font-d)", fontSize: "1.5rem", fontWeight: 700, color: s.textColor }}>
              {s.pct}%
            </div>
            <div style={{ height: "6px", background: "var(--s200)", borderRadius: "3px", overflow: "hidden", marginTop: "8px" }}>
              <div style={{ height: "100%", background: s.color, borderRadius: "3px", width: `${s.pct}%`, transition: "width .6s" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Domain Sections */}
      {DOMAINS.map((domain) => (
        <div key={domain.label} style={{ marginBottom: "28px" }}>
          <div style={{
            fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase",
            letterSpacing: "0.06em", color: "var(--s500)",
            paddingBottom: "8px", borderBottom: "2px solid var(--s200)", marginBottom: "14px",
          }}>
            {domain.label}
          </div>
          {domain.findings.map((f) => (
            <FindingCard key={f.title} f={f} />
          ))}
        </div>
      ))}

      {/* Remediation Plan */}
      <div style={{ background: "#fff", border: "1px solid var(--s200)", borderRadius: "10px", padding: "20px 24px" }}>
        <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--s800)", marginBottom: "14px" }}>
          📋 Remediation Plan
        </div>
        {REMEDIATION.map((group) => (
          <div key={group.priority} style={{ marginBottom: "16px" }}>
            <div style={{
              fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase",
              letterSpacing: "0.04em", color: group.color, marginBottom: "8px",
            }}>
              {group.priority}
            </div>
            {group.items.map((item) => {
              const key = `${group.priority}:${item}`;
              const done = checked.has(key);
              return (
                <div
                  key={item}
                  onClick={() => toggle(key)}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: "8px",
                    padding: "6px 0", fontSize: "0.8125rem",
                    color: done ? "var(--s400)" : "var(--s600)",
                    cursor: "pointer", userSelect: "none",
                    textDecoration: done ? "line-through" : "none",
                  }}
                >
                  <div style={{
                    width: "16px", height: "16px", flexShrink: 0, marginTop: "1px",
                    border: done ? "none" : "1.5px solid var(--s300)",
                    borderRadius: "4px",
                    background: done ? "var(--green-500)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {done && (
                      <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#fff" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </div>
                  {item}
                </div>
              );
            })}
          </div>
        ))}
      </div>

    </div>
  );
}
