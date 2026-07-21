"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Sample answers only — these are fixed general-rule statements, not model
 * output. No sign-up and no LLM cost, as the copy states.
 */
const ANSWERS = [
  {
    q: "Do we need a DPO?",
    text: "Only if you are notified as a Significant Data Fiduciary under §10, but every company needs a grievance contact under §13, and processing children’s data raises the bar. The safe default: name a privacy point of contact now.",
    cites: ["DPDP §10(2)", "DPDP §13"],
  },
  {
    q: "Is our privacy notice valid?",
    text: "A valid notice must list each category of personal data and its specific purpose, in English plus any Eighth Schedule language the user chooses. Generic “to improve services” language fails §6(1).",
    cites: ["DPDP §6(1)(b)", "DPDP §5(3)"],
  },
  {
    q: "Overtime rules for our team?",
    text: "Work beyond the standard schedule must be paid at at least twice the ordinary wage rate, and you must keep an overtime register that reconciles with payroll each cycle.",
    cites: ["Code on Wages §33", "OSH Code §25"],
  },
];

export function QuickCheck() {
  const [picked, setPicked] = useState(0);
  const a = ANSWERS[picked];

  return (
    <div
      style={{
        maxWidth: 640,
        margin: "32px auto 0",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "26px 28px",
        boxShadow: "0 1px 2px rgba(23,28,38,0.04), 0 8px 24px rgba(23,28,38,0.06)",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {ANSWERS.map((item, i) => {
          const active = i === picked;
          return (
            <button
              key={item.q}
              type="button"
              onClick={() => setPicked(i)}
              aria-pressed={active}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 12.5,
                fontWeight: 500,
                minHeight: 36,
                color: active ? "var(--on-accent)" : "var(--muted)",
                background: active ? "var(--accent)" : "var(--chip-bg)",
                border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                borderRadius: "var(--radius-pill)",
                padding: "7px 14px",
                cursor: "pointer",
              }}
            >
              {item.q}
            </button>
          );
        })}
      </div>

      <div
        style={{ marginTop: 18, borderTop: "1px solid var(--border-soft)", paddingTop: 16 }}
      >
        <p style={{ fontSize: 13.5, lineHeight: 1.65, margin: 0, color: "var(--ink)" }}>
          {a.text}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          {a.cites.map((c) => (
            <span
              key={c}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--muted)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-chip)",
                padding: "3px 9px",
                background: "var(--chip-bg)",
              }}
            >
              {c}
            </span>
          ))}
        </div>

        <div
          style={{
            marginTop: 14,
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "var(--accent-tint)",
            borderRadius: 9,
            padding: "11px 14px",
          }}
        >
          <span style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--ink)", flex: 1 }}>
            This is the general rule. <Link href="/sign-in">Sign in</Link> for an answer specific
            to your company&rsquo;s size, sector and data.
          </span>
        </div>
      </div>
    </div>
  );
}
