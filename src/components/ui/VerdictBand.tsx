"use client";

import { useEffect, useRef, useState } from "react";
import type { Level } from "./Badge";

/**
 * The one score treatment — Dashboard and Report detail share it.
 * Values follow the design files (44px score, 26/28 + 20/24 padding), which
 * outrank components.tsx in the handoff's priority order.
 */
export function VerdictBand({
  score,
  percent,
  tone = "med",
  note,
  footer,
  label = "Overall readiness",
  help,
  children,
}: {
  /** Display string, e.g. "68%". */
  score: string;
  /** Numeric 0–100 driving the bar. Omit to hide the bar. */
  percent?: number;
  tone?: Level;
  note?: React.ReactNode;
  /** Small muted line under the note, e.g. "Last assessed …". */
  footer?: React.ReactNode;
  label?: React.ReactNode;
  /** Scoring-methodology text shown in the "?" popover. */
  help?: React.ReactNode;
  /** Right column — "Next actions" rows or per-domain score bars. */
  children: React.ReactNode;
}) {
  const [helpOpen, setHelpOpen] = useState(false);
  const helpRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!helpOpen) return;
    function onDown(e: MouseEvent) {
      if (!helpRef.current?.contains(e.target as Node)) setHelpOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setHelpOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [helpOpen]);

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "26px 28px" }}>
        <div ref={helpRef} style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--faint)",
            }}
          >
            {label}
          </div>

          {help && (
            <button
              type="button"
              onClick={() => setHelpOpen((o) => !o)}
              aria-label="How is this scored?"
              aria-expanded={helpOpen}
              className="rc-help-dot"
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                border: "1px solid var(--border)",
                background: "var(--chip-bg)",
                color: "var(--muted)",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                lineHeight: 1,
              }}
            >
              ?
            </button>
          )}

          {helpOpen && help && (
            <div
              role="note"
              style={{
                position: "absolute",
                top: 26,
                left: 0,
                zIndex: 20,
                width: 232,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "13px 15px",
                boxShadow: "0 12px 32px rgba(15,18,24,0.16)",
              }}
            >
              <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 5 }}>
                How this is scored
              </div>
              <p style={{ fontSize: 12, lineHeight: 1.6, color: "var(--muted)", margin: 0 }}>
                {help}
              </p>
            </div>
          )}
        </div>

        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            fontSize: 44,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            fontVariantNumeric: "tabular-nums",
            marginTop: 10,
            color: `var(--${tone})`,
          }}
        >
          {score}
        </div>

        {percent !== undefined && (
          <div
            style={{
              height: 5,
              background: "var(--row)",
              borderRadius: 3,
              marginTop: 14,
              maxWidth: 220,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min(100, Math.max(0, percent))}%`,
                background: `var(--${tone})`,
                transition: "width .6s",
              }}
            />
          </div>
        )}

        {note && (
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 12, lineHeight: 1.5 }}>
            {note}
          </div>
        )}
        {footer && (
          <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 14 }}>{footer}</div>
        )}
      </div>

      <div style={{ padding: "20px 24px" }}>{children}</div>
    </div>
  );
}
