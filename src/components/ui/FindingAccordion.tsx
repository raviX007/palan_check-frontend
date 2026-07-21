"use client";

import { useState } from "react";
import { Badge, type Level } from "./Badge";
import { CitationChip } from "./CitationChip";

/** Report findings. The header is a real <button> with aria-expanded. */
export function FindingAccordion({
  level,
  title,
  defaultOpen = false,
  remediation,
  citations,
  children,
}: {
  level: Level;
  title: string;
  defaultOpen?: boolean;
  /** Omitted when the source has no remediation text. */
  remediation?: React.ReactNode;
  citations: { label: string; href?: string }[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-panel)",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "16px 22px",
          cursor: "pointer",
          width: "100%",
          minHeight: 36,
          background: "transparent",
          border: "none",
          textAlign: "left",
        }}
      >
        <Badge level={level} />
        <span style={{ fontSize: 14.5, fontWeight: 600, flex: 1, color: "var(--ink)" }}>
          {title}
        </span>
        <span aria-hidden="true" style={{ fontSize: 12, color: "var(--faint)" }}>
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div style={{ padding: "4px 22px 22px", borderTop: "1px solid var(--border-soft)" }}>
          <p style={{ fontSize: 13.5, lineHeight: 1.65, color: "var(--muted)", margin: "16px 0 0" }}>
            {children}
          </p>
          {remediation && (
            <div
              style={{
                marginTop: 16,
                background: "var(--accent-tint)",
                borderRadius: 9,
                padding: "14px 18px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--accent-ink)",
                  marginBottom: 6,
                }}
              >
                Remediation
              </div>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--ink)", margin: 0 }}>
                {remediation}
              </p>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            {citations.map((c) => (
              <CitationChip key={c.label} href={c.href}>
                {c.label}
              </CitationChip>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
