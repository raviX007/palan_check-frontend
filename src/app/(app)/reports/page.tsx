"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApiFetch } from "@/lib/api-client";
import { EmptyState } from "@/components/ui/EmptyState";
import { scoreTone } from "@/components/ui/ScoreBar";
import { buildReport, readStoredScores, type Report } from "@/lib/reports";

interface Tenant {
  id: string;
  name: string;
  jurisdiction: string;
}

const CTA: React.CSSProperties = {
  flexShrink: 0,
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
};

export default function ReportsPage() {
  const apiFetch = useApiFetch();
  const [report, setReport] = useState<Report | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    apiFetch<Tenant>("/tenants/me")
      .then((t) => setReport(buildReport(t, readStoredScores(t.id))))
      .catch(() => null)
      .finally(() => setLoaded(true));
  }, [apiFetch]);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", paddingTop: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
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
            Reports
          </h1>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            Point-in-time compliance assessments, generated from chat answers.
          </div>
        </div>

        <Link href="/chat" className="palan-btn palan-btn-primary" style={CTA}>
          New report
        </Link>
      </div>

      {!loaded ? null : !report ? (
        <div style={{ marginTop: 28 }}>
          <EmptyState
            title="No reports yet"
            action={
              <Link href="/chat" className="palan-btn palan-btn-primary" style={CTA}>
                Ask a question
              </Link>
            }
          >
            Reports are generated from chat answers: ask a compliance question, then choose{" "}
            <strong>Generate full report</strong> under the answer.
          </EmptyState>
        </div>
      ) : (
        <>
          <div
            style={{
              marginTop: 28,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-card)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "12px 24px",
                borderBottom: "1px solid var(--border-soft)",
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--faint)",
              }}
            >
              <span style={{ flex: 1 }}>Report</span>
              <span style={{ width: 110 }}>Generated</span>
              <span style={{ width: 90 }}>Readiness</span>
              <span style={{ width: 80 }}>Findings</span>
            </div>

            <Link
              href={`/reports/${report.id}`}
              className="palan-doc-row"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "15px 24px",
                color: "var(--ink)",
                textDecoration: "none",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{report.company}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>
                  {report.scope}
                </div>
              </div>
              <div style={{ width: 110, fontSize: 12.5, color: "var(--muted)" }}>
                {report.generated}
              </div>
              <div
                style={{
                  width: 90,
                  fontSize: 13,
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                  color: `var(--${scoreTone(report.overall)})`,
                }}
              >
                {report.overall}%
              </div>
              <div style={{ width: 80, fontSize: 12.5, color: "var(--muted)" }}>
                {report.findingCount}
                {report.highCount > 0 && (
                  <>
                    {" · "}
                    <span style={{ color: "var(--high)", fontWeight: 500 }}>
                      {report.highCount} high
                    </span>
                  </>
                )}
              </div>
            </Link>
          </div>

          <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 12 }}>
            Reports are snapshots. Regenerate after documents change.
          </div>
        </>
      )}
    </div>
  );
}
