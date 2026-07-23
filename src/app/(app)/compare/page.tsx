"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge, type Level } from "@/components/ui/Badge";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { EmptyState } from "@/components/ui/EmptyState";
import { useApiFetch } from "@/lib/api-client";
import { readStoredScores, severityLevel } from "@/lib/reports";

interface Tenant {
  id: string;
  name: string;
  jurisdiction: string;
}

interface ApiDoc {
  id: string;
  filename: string;
}

/** A gap derived from one engine finding for this tenant. */
interface Gap {
  level: Level;
  title: string;
  issue: string;
  lawRef?: string;
  domain: string;
}

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

function gapForCitation(gaps: Gap[], citation: string | null): number {
  if (!citation || gaps.length === 0) return 0;
  const c = normalize(citation);
  if (!c) return 0;
  const i = gaps.findIndex((g) => {
    const ref = normalize(g.lawRef ?? "");
    return ref && (ref.includes(c) || c.includes(ref));
  });
  return i >= 0 ? i : 0;
}

function Selector({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: number;
  onChange: (i: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        disabled={options.length === 0}
        className="rc-selector"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "11px 16px",
          cursor: options.length ? "pointer" : "default",
          fontSize: 13.5,
          fontWeight: 500,
          width: "100%",
          minHeight: 36,
          textAlign: "left",
          color: "var(--ink)",
          fontFamily: "var(--font-sans)",
          opacity: options.length ? 1 : 0.6,
        }}
      >
        <span>{options[value] ?? "—"}</span>
        <span aria-hidden="true" style={{ fontSize: 10, color: "var(--faint)" }}>
          ▾
        </span>
      </button>

      {open && options.length > 0 && (
        <div
          role="listbox"
          aria-label={label}
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 20,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: 6,
            boxShadow: "0 12px 32px rgba(15,18,24,0.16)",
          }}
        >
          {options.map((opt, i) => (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={i === value}
              onClick={() => {
                onChange(i);
                setOpen(false);
              }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "9px 12px",
                border: "none",
                borderRadius: "var(--radius-item)",
                cursor: "pointer",
                fontSize: 13.5,
                fontWeight: 500,
                fontFamily: "var(--font-sans)",
                background: i === value ? "var(--accent-tint)" : "transparent",
                color: i === value ? "var(--accent-ink)" : "var(--ink)",
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const PANEL: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-card)",
  padding: "20px 24px",
};

const PANEL_HEAD: React.CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 18,
};

const NOTE_BOX = (bg: string): React.CSSProperties => ({
  marginTop: 18,
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  background: bg,
  borderRadius: 9,
  padding: "12px 16px",
});

const NOTE_LABEL = (color: string): React.CSSProperties => ({
  flexShrink: 0,
  fontSize: 10.5,
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color,
  marginTop: 2,
});

const STEP_BTN: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: 13,
  fontWeight: 500,
  color: "var(--muted)",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-control)",
  padding: "8px 16px",
  minHeight: 36,
  cursor: "pointer",
};

function CompareInner() {
  const apiFetch = useApiFetch();
  const searchParams = useSearchParams();
  const citation = searchParams.get("citation");

  const [docs, setDocs] = useState<string[]>([]);
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(0);
  const [selectedReg, setSelectedReg] = useState(0);
  const [gapIndex, setGapIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      apiFetch<Tenant>("/tenants/me").catch(() => null),
      apiFetch<ApiDoc[]>("/documents/?doc_type=company").catch(() => [] as ApiDoc[]),
    ])
      .then(([tenant, companyDocs]) => {
        if (cancelled) return;
        setDocs(companyDocs.map((d) => d.filename));

        const stored = tenant ? readStoredScores(tenant.id) : null;
        const derived: Gap[] = stored
          ? Object.entries(stored.scores)
              .filter(([key]) => key !== "overall")
              .flatMap(([domain, d]) =>
                (d.findings ?? []).map((f) => ({
                  level: severityLevel(f.severity),
                  title: f.title,
                  issue: f.description,
                  lawRef: f.source_id,
                  domain: domain.toUpperCase(),
                })),
              )
          : [];
        setGaps(derived);
        setGapIndex(gapForCitation(derived, citation));
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [apiFetch, citation]);

  const step = useCallback(
    (delta: number) => {
      setGapIndex((i) => Math.min(gaps.length - 1, Math.max(0, i + delta)));
    },
    [gaps.length],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = document.activeElement?.tagName ?? "";
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  const gap = gaps[gapIndex];

  return (
    <div style={{ maxWidth: 1060, margin: "0 auto", paddingTop: 16 }}>
      <div>
        <h1
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            fontSize: 24,
            letterSpacing: "-0.02em",
            margin: "0 0 10px 0",
            lineHeight: 1.15,
            color: "var(--ink)",
          }}
        >
          Document vs regulation
        </h1>
        <div style={{ fontSize: 13, color: "var(--muted)" }}>
          Your document, side by side with what the law requires, gap by gap.
        </div>
      </div>

      <div
        style={{
          marginTop: 28,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        <Selector
          label="Your document"
          options={docs}
          value={selectedDoc}
          onChange={setSelectedDoc}
        />
        <Selector
          label="Regulation"
          options={gaps.map((g) => g.lawRef ?? g.domain)}
          value={selectedReg}
          onChange={(i) => {
            setSelectedReg(i);
            setGapIndex(i);
          }}
        />
      </div>

      {!loaded ? null : !gap ? (
        <div style={{ marginTop: 16 }}>
          <EmptyState
            title="Nothing to compare yet"
            action={
              <Link
                href="/chat"
                className="rc-btn rc-btn-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  minHeight: 36,
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--on-accent)",
                  background: "var(--accent)",
                  border: "1px solid var(--accent)",
                  borderRadius: "var(--radius-control)",
                  padding: "10px 18px",
                  textDecoration: "none",
                }}
              >
                Ask a question
              </Link>
            }
          >
            Gaps appear here once the engine has assessed your documents. Ask a compliance
            question to run an assessment.
          </EmptyState>
        </div>
      ) : (
        <>
          <div
            style={{
              marginTop: 16,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 16,
              alignItems: "start",
            }}
          >
            <div style={PANEL}>
              <div style={PANEL_HEAD}>
                <SectionLabel>Your document</SectionLabel>
                <span
                  style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}
                >
                  {docs[selectedDoc] ?? "—"}
                </span>
              </div>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 15.5,
                  lineHeight: 1.7,
                  margin: 0,
                  color: "var(--ink)",
                }}
              >
                {gap.title}
              </p>
              <div style={NOTE_BOX("var(--med-bg)")}>
                <span style={NOTE_LABEL("var(--med)")}>Gap</span>
                <span style={{ fontSize: 13, lineHeight: 1.6, color: "var(--muted)" }}>
                  {gap.issue}
                </span>
              </div>
            </div>

            <div style={PANEL}>
              <div style={PANEL_HEAD}>
                <div
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--accent-ink)",
                  }}
                >
                  Required by law
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--accent-ink)",
                  }}
                >
                  {gap.lawRef ?? gap.domain}
                </span>
              </div>
              <p
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.65,
                  margin: 0,
                  color: "var(--muted)",
                }}
              >
                {gap.lawRef
                  ? `This finding cites ${gap.lawRef}. The engine does not return the statute text yet — open the regulatory corpus to read the section in full.`
                  : "The engine did not attach a statute reference to this finding."}
              </p>
              <div style={NOTE_BOX("var(--ok-bg)")}>
                <span style={NOTE_LABEL("var(--ok)")}>To pass</span>
                <span style={{ fontSize: 13, lineHeight: 1.6, color: "var(--muted)" }}>
                  Close the gap described on the left, then re-run the assessment from Chat.
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-card)",
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => step(-1)}
              disabled={gapIndex === 0}
              className="rc-step-btn"
              style={{ ...STEP_BTN, opacity: gapIndex === 0 ? 0.4 : 1 }}
            >
              ← Previous
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                aria-live="polite"
                style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}
              >
                Gap {gapIndex + 1} of {gaps.length}
              </span>
              <Badge level={gap.level} />
            </div>

            <button
              type="button"
              onClick={() => step(1)}
              disabled={gapIndex === gaps.length - 1}
              className="rc-step-btn"
              style={{ ...STEP_BTN, opacity: gapIndex === gaps.length - 1 ? 0.4 : 1 }}
            >
              Next →
            </button>

            <span
              title="Keyboard shortcut"
              style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--faint)" }}
            >
              ← →
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={null}>
      <CompareInner />
    </Suspense>
  );
}
