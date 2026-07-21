"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApiFetch } from "@/lib/api-client";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { VerdictBand } from "@/components/ui/VerdictBand";
import { FindingAccordion } from "@/components/ui/FindingAccordion";
import { ScoreBar, scoreTone } from "@/components/ui/ScoreBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { buildReport, readStoredScores, type Report } from "@/lib/reports";

interface Tenant {
  id: string;
  name: string;
  jurisdiction: string;
}

const SCORE_HELP =
  "Share of checks passed against every statute section in scope, weighted by severity: high ×3, medium ×2, low ×1. Domain scores roll up into this overall number.";

export default function ReportDetailPage() {
  const apiFetch = useApiFetch();
  const [report, setReport] = useState<Report | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    apiFetch<Tenant>("/tenants/me")
      .then((t) => setReport(buildReport(t, readStoredScores(t.id))))
      .catch(() => null)
      .finally(() => setLoaded(true));
  }, [apiFetch]);

  if (!loaded) return null;

  if (!report) {
    return (
      <div style={{ maxWidth: 860, margin: "0 auto", paddingTop: 16 }}>
        <EmptyState
          title="Report not available"
          action={
            <Link
              href="/reports"
              className="palan-btn palan-btn-secondary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: 36,
                fontSize: 13,
                fontWeight: 500,
                color: "var(--ink)",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-control)",
                padding: "10px 18px",
                textDecoration: "none",
              }}
            >
              Back to reports
            </Link>
          }
        >
          This assessment is no longer stored in this browser. Ask a compliance question to
          generate a new one.
        </EmptyState>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", paddingTop: 16 }}>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24 }}>
        <Link href="/reports" style={{ color: "var(--muted)" }}>
          Reports
        </Link>
        <span aria-hidden="true" style={{ margin: "0 8px", color: "var(--faint)" }}>
          /
        </span>
        <span style={{ color: "var(--ink)", fontWeight: 500 }}>{report.company}</span>
      </div>

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
          <div style={{ marginBottom: 10 }}>
            <SectionLabel accent>Compliance report</SectionLabel>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 600,
              fontSize: 34,
              letterSpacing: "-0.015em",
              margin: "0 0 12px 0",
              lineHeight: 1.15,
              color: "var(--ink)",
            }}
          >
            {report.company}
          </h1>
          <div
            style={{
              fontSize: 13,
              color: "var(--muted)",
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <span>Generated {report.generated}</span>
            <span style={{ color: "var(--faint)" }}>·</span>
            <span>{report.scope}</span>
            <span style={{ color: "var(--faint)" }}>·</span>
            <span>
              {report.findingCount} finding{report.findingCount === 1 ? "" : "s"} across{" "}
              {report.domains.length} domain{report.domains.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 36 }}>
        <VerdictBand
          score={`${report.overall}%`}
          percent={report.overall}
          tone={scoreTone(report.overall)}
          help={SCORE_HELP}
          note={
            report.highCount > 0 ? (
              <>
                {report.findingCount} findings ·{" "}
                <span style={{ color: "var(--high)", fontWeight: 500 }}>
                  {report.highCount} high-priority
                </span>
              </>
            ) : (
              `${report.findingCount} findings · none high-priority`
            )
          }
          footer={`Generated ${report.generated}`}
        >
          <div style={{ marginBottom: 12 }}>
            <SectionLabel>By domain</SectionLabel>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {report.domains.map((d) => (
              <div key={d.label}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>
                    {d.label}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      fontVariantNumeric: "tabular-nums",
                      color: `var(--${scoreTone(d.score)})`,
                    }}
                  >
                    {d.score}%
                  </span>
                </div>
                <ScoreBar score={d.score} />
              </div>
            ))}
          </div>
        </VerdictBand>
      </div>

      {report.domains.map((domain) => (
        <section key={domain.label} style={{ marginTop: 36 }}>
          <div
            style={{
              paddingBottom: 10,
              borderBottom: "1px solid var(--border)",
              marginBottom: 16,
            }}
          >
            <SectionLabel>
              {domain.label} — {domain.findings.length} finding
              {domain.findings.length === 1 ? "" : "s"}
            </SectionLabel>
          </div>

          {domain.findings.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              No specific gaps identified for this domain.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {domain.findings.map((f, i) => (
                <FindingAccordion
                  key={`${f.title}-${i}`}
                  level={f.level}
                  title={f.title}
                  remediation={f.remediation}
                  citations={f.citations.map((c) => ({
                    label: c,
                    href: `/compare?citation=${encodeURIComponent(c)}`,
                  }))}
                >
                  {f.body}
                </FindingAccordion>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
