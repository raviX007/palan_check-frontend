"use client";

import { useState } from "react";

const DOCS = [
  "📄 NovaPay Privacy Policy",
  "📄 Employment Contract",
  "📄 Vendor Agreement",
];

const REGS = [
  "📜 DPDP Act — Section 6 (Notice)",
  "📜 DPDP Act — Section 10 (SDF)",
  "📜 Code on Wages — Section 2(y)",
];

type GapSeverity = "high" | "medium" | "low";

interface Gap {
  severity: GapSeverity;
  docLabel: string;
  docText: string;
  docNote: string;
  regLabel: string;
  regCite: string;
  regText: string[];
  regNote: string;
}

const GAPS: Gap[] = [
  {
    severity: "high",
    docLabel: "NovaPay Privacy Policy §3",
    docText: '"We collect and process your personal data to improve our services and provide you with a better user experience. Your data may be used for analytics, customer support, and service optimization."',
    docNote: "⚠️ Too vague — missing specific purpose per data category. Does not distinguish between UPI transaction data, customer contact info, and device metadata.",
    regCite: "DPDP Act Sec 6(1)(b)",
    regLabel: "Required by Law",
    regText: [
      'The notice to the Data Principal shall contain — (b) [a description of personal data] sought to be collected and the [purpose of processing] such personal data.',
      'Each category of personal data must have a [specific, stated purpose]. Generic language like "to improve services" does not satisfy the requirement.',
    ],
    regNote: "✅ Requirement: Enumerate each data type collected and its explicit purpose.",
  },
  {
    severity: "high",
    docLabel: "NovaPay Privacy Policy §5",
    docText: '"Users may contact our support team to request changes to their data preferences. We will process such requests within 30 days."',
    docNote: "⚠️ No self-service mechanism — DPDP requires withdrawal to be as easy as giving consent. A support ticket flow does not meet this bar.",
    regCite: "DPDP Act Sec 6(5)",
    regLabel: "Required by Law",
    regText: [
      'The Data Principal shall have the right to [withdraw consent] at any time, with the ease of such withdrawal being [commensurate with the ease] of giving consent.',
      'A mechanism requiring users to email support and wait 30 days does not satisfy the withdrawal ease requirement.',
    ],
    regNote: "✅ Requirement: Provide a self-service, real-time consent withdrawal mechanism.",
  },
  {
    severity: "medium",
    docLabel: "NovaPay Vendor Agreement §8",
    docText: '"Vendor shall process data solely for purposes outlined in this agreement and shall maintain appropriate technical measures to protect such data."',
    docNote: "⚠️ Incomplete — missing mandatory DPA clauses: data return/deletion obligations, audit rights, sub-processor restrictions.",
    regCite: "DPDP Act Sec 8(2)",
    regLabel: "Required by Law",
    regText: [
      'A Data Fiduciary shall be [responsible for compliance] with the provisions of this Act in respect of any processing undertaken by a [Data Processor] on its behalf.',
      'Contracts with Data Processors must specify: purpose limitation, security obligations, [audit rights], and [data deletion] requirements.',
    ],
    regNote: "✅ Requirement: Execute a compliant DPA covering all mandatory DPDP clauses.",
  },
];

const SEV: Record<GapSeverity, { label: string; bg: string; color: string; border: string }> = {
  high:   { label: "🔴 HIGH",   bg: "var(--red-50)",   color: "var(--red-700)",   border: "1px solid rgba(239,68,68,.2)" },
  medium: { label: "🟡 MEDIUM", bg: "var(--amber-50)", color: "var(--amber-700)", border: "1px solid rgba(245,158,11,.2)" },
  low:    { label: "🟢 LOW",    bg: "var(--green-50)", color: "var(--green-700)", border: "1px solid rgba(34,197,94,.2)" },
};

function renderRegText(text: string) {
  const parts = text.split(/(\[.*?\])/g);
  return parts.map((part, i) =>
    part.startsWith("[") && part.endsWith("]")
      ? <mark key={i} style={{ background: "rgba(34,197,94,.15)", padding: "1px 4px", borderRadius: "3px", fontStyle: "normal" }}>{part.slice(1, -1)}</mark>
      : <span key={i}>{part}</span>
  );
}

export default function ComparePage() {
  const [selectedDoc, setSelectedDoc] = useState(0);
  const [selectedReg, setSelectedReg] = useState(0);
  const [gapIndex, setGapIndex] = useState(0);

  const gap = GAPS[gapIndex];
  const sev = SEV[gap.severity];

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontFamily: "var(--font-d)", fontSize: "1.125rem", fontWeight: 700, color: "var(--s900)", marginBottom: "4px" }}>
          Document vs Regulation Comparison
        </div>
        <div style={{ fontSize: "0.8125rem", color: "var(--s500)" }}>
          Side-by-side view of your document against regulatory requirements
        </div>

        {/* Selectors */}
        <div style={{ display: "flex", gap: "12px", marginTop: "14px" }}>
          {[
            { options: DOCS, value: selectedDoc, onChange: (v: number) => { setSelectedDoc(v); setGapIndex(0); } },
            { options: REGS, value: selectedReg, onChange: (v: number) => { setSelectedReg(v); setGapIndex(0); } },
          ].map((sel, i) => (
            <select
              key={i}
              value={sel.value}
              onChange={(e) => sel.onChange(Number(e.target.value))}
              style={{
                flex: 1, padding: "8px 14px", border: "1.5px solid var(--s200)",
                borderRadius: "8px", fontSize: "0.8125rem", fontFamily: "var(--font-b)",
                color: "var(--s600)", background: "#fff", cursor: "pointer", outline: "none",
              }}
            >
              {sel.options.map((opt, j) => (
                <option key={j} value={j}>{opt}</option>
              ))}
            </select>
          ))}
        </div>
      </div>

      {/* Side-by-side panels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
        {/* Your Document */}
        <div style={{ background: "#fff", border: "1px solid var(--s200)", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{
            padding: "14px 18px", borderBottom: "1px solid var(--s200)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--amber-700)" }}>
              Your Document
            </span>
            <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--s600)" }}>
              {gap.docLabel}
            </span>
          </div>
          <div style={{ padding: "18px" }}>
            <p style={{ fontSize: "0.875rem", color: "var(--s700)", lineHeight: 1.7, marginBottom: "14px" }}>
              <em style={{ fontStyle: "normal", background: "rgba(245,158,11,.15)", padding: "1px 4px", borderRadius: "3px" }}>
                {gap.docText}
              </em>
            </p>
            <div style={{
              fontSize: "0.8125rem", padding: "10px 14px", borderRadius: "6px",
              background: "var(--amber-50)", color: "var(--amber-700)",
              border: "1px solid rgba(245,158,11,.15)",
              display: "flex", alignItems: "flex-start", gap: "6px",
            }}>
              {gap.docNote}
            </div>
          </div>
        </div>

        {/* Required by Law */}
        <div style={{ background: "#fff", border: "1px solid var(--s200)", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{
            padding: "14px 18px", borderBottom: "1px solid var(--s200)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--brand-600)" }}>
              Required by Law
            </span>
            <span style={{ fontFamily: "var(--font-m)", fontSize: "0.6875rem", color: "var(--brand-600)" }}>
              {gap.regCite}
            </span>
          </div>
          <div style={{ padding: "18px" }}>
            {gap.regText.map((para, i) => (
              <p key={i} style={{ fontSize: "0.875rem", color: "var(--s700)", lineHeight: 1.7, marginBottom: "14px" }}>
                {renderRegText(para)}
              </p>
            ))}
            <div style={{
              fontSize: "0.8125rem", padding: "10px 14px", borderRadius: "6px",
              background: "var(--green-50)", color: "var(--green-700)",
              border: "1px solid rgba(34,197,94,.15)",
              display: "flex", alignItems: "flex-start", gap: "6px",
            }}>
              {gap.regNote}
            </div>
          </div>
        </div>
      </div>

      {/* Gap navigator */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: "16px",
        padding: "16px", background: "#fff", border: "1px solid var(--s200)", borderRadius: "10px",
      }}>
        <button
          onClick={() => setGapIndex((i) => i - 1)}
          disabled={gapIndex === 0}
          style={{
            padding: "7px 16px", border: "1.5px solid var(--s200)", borderRadius: "6px",
            fontSize: "0.8125rem", fontWeight: 500, color: "var(--s600)", background: "#fff",
            cursor: gapIndex === 0 ? "default" : "pointer", fontFamily: "var(--font-b)",
            opacity: gapIndex === 0 ? 0.4 : 1,
          }}
        >
          ← Previous Gap
        </button>

        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--s700)" }}>
          Gap {gapIndex + 1} of {GAPS.length}{" "}
          <span style={{
            fontSize: "0.6875rem", fontWeight: 500, padding: "2px 8px", borderRadius: "100px",
            background: sev.bg, color: sev.color, border: sev.border, marginLeft: "6px",
          }}>
            {sev.label}
          </span>
        </span>

        <button
          onClick={() => setGapIndex((i) => i + 1)}
          disabled={gapIndex === GAPS.length - 1}
          style={{
            padding: "7px 16px", border: "1.5px solid var(--s200)", borderRadius: "6px",
            fontSize: "0.8125rem", fontWeight: 500, color: "var(--s600)", background: "#fff",
            cursor: gapIndex === GAPS.length - 1 ? "default" : "pointer", fontFamily: "var(--font-b)",
            opacity: gapIndex === GAPS.length - 1 ? 0.4 : 1,
          }}
        >
          Next Gap →
        </button>
      </div>
    </div>
  );
}
