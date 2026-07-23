"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApiFetch } from "@/lib/api-client";
import { Badge, type Level } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CitationChip } from "@/components/ui/CitationChip";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { VerdictBand } from "@/components/ui/VerdictBand";
import { EmptyState } from "@/components/ui/EmptyState";
import { scoreTone } from "@/components/ui/ScoreBar";
import { severityLevel, scopeFor } from "@/lib/reports";

interface User {
  id: string;
  clerk_user_id: string;
  email: string;
  full_name: string | null;
  role: string;
  tenant_id: string;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  jurisdiction: string;
  employee_count: number;
  city: string | null;
  industry: string | null;
}

interface DomainScore {
  score: number;
  band: "green" | "amber" | "red";
  gap_count: number;
  findings?: { severity: string; title: string; description: string; source_id?: string }[];
}

const SCORE_HELP =
  "Share of checks passed against every statute section in scope, weighted by severity: high ×3, medium ×2, low ×1. Recalculated whenever your documents or answers change.";

const SEVERITY_RANK: Record<Level, number> = { high: 0, med: 1, low: 2, ok: 3 };

interface NextAction {
  level: Level;
  title: string;
  desc: string;
  citation?: string;
}

/** Next actions come from the engine's own findings for this tenant. */
function deriveNextActions(scores: Record<string, DomainScore> | null): NextAction[] {
  if (!scores) return [];
  return Object.entries(scores)
    .filter(([key]) => key !== "overall")
    .flatMap(([, d]) => d.findings ?? [])
    .map((f) => ({
      level: severityLevel(f.severity),
      title: f.title,
      desc: f.description,
      citation: f.source_id,
    }))
    .sort((a, b) => SEVERITY_RANK[a.level] - SEVERITY_RANK[b.level])
    .slice(0, 3);
}

const row: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  padding: "10px 0",
  borderBottom: "1px solid var(--border-soft)",
  fontSize: 13,
};

export default function DashboardPage() {
  const apiFetch = useApiFetch();
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [scores, setScores] = useState<Record<string, DomainScore> | null>(null);
  const [scoresUpdatedAt, setScoresUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<User>("/users/me")
      .then((u) => {
        setUser(u);
        // Persisted scores for this tenant.
        try {
          const raw = localStorage.getItem(`rc_scores_${u.tenant_id}`);
          if (raw) {
            const parsed = JSON.parse(raw) as {
              scores: Record<string, DomainScore>;
              updatedAt: string;
            };
            setScores(parsed.scores);
            setScoresUpdatedAt(parsed.updatedAt);
          }
        } catch {}
        return apiFetch<Tenant>(`/tenants/${u.tenant_id}`);
      })
      .then(setTenant)
      .catch(() => null);
  }, [apiFetch]);

  const isEU = tenant?.jurisdiction === "EU";
  const scope = scopeFor(tenant?.jurisdiction);
  const nextActions = deriveNextActions(scores);

  const overall = scores?.overall;
  const highCount = scores
    ? Object.values(scores).reduce((n, d) => n + (d.band === "red" ? d.gap_count : 0), 0)
    : 0;

  const meta = [
    tenant?.industry,
    tenant?.employee_count ? `${tenant.employee_count} employees` : null,
    tenant?.city,
    user?.full_name ? `Signed in as ${user.full_name}` : null,
  ].filter(Boolean) as string[];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", paddingTop: 16 }}>
      {/* Masthead — kicker, company, meta, and the single primary CTA. */}
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
            <SectionLabel accent>Compliance workspace</SectionLabel>
          </div>
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
            {tenant?.name ?? "Loading…"}
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
            {meta.map((m, i) => (
              <span key={m} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {i > 0 && <span style={{ color: "var(--faint)" }}>·</span>}
                <span>{m}</span>
              </span>
            ))}
          </div>
        </div>

        <Link
          href="/chat"
          className="rc-btn rc-btn-primary"
          style={{
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
          }}
        >
          Ask a compliance question
        </Link>
      </div>

      {/* Verdict band — honest overall readiness, or an empty state. */}
      <div style={{ marginTop: 34 }}>
        {overall ? (
          <VerdictBand
            score={`${overall.score}%`}
            percent={overall.score}
            tone={scoreTone(overall.score)}
            help={SCORE_HELP}
            note={
              highCount > 0 ? (
                <>
                  Needs attention:{" "}
                  <span style={{ color: "var(--high)", fontWeight: 500 }}>
                    {highCount} high-priority
                  </span>{" "}
                  {highCount === 1 ? "gap" : "gaps"} open.
                </>
              ) : (
                "No high-priority gaps open."
              )
            }
            footer={
              scoresUpdatedAt
                ? `Last assessed ${new Date(scoresUpdatedAt).toLocaleString()}`
                : undefined
            }
          >
            <div style={{ marginBottom: 6 }}>
              <SectionLabel>Next actions</SectionLabel>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {nextActions.length === 0 && (
                <div style={{ fontSize: 13, color: "var(--muted)", padding: "13px 0" }}>
                  No specific gaps recorded in the latest assessment.
                </div>
              )}
              {nextActions.map((a, i) => (
                <div
                  key={`${a.title}-${i}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "13px 0",
                    borderBottom:
                      i < nextActions.length - 1 ? "1px solid var(--border-soft)" : "none",
                    flexWrap: "wrap",
                  }}
                >
                  <Badge level={a.level} style={{ flexShrink: 0 }} />
                  <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>
                      {a.title}
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
                      {a.desc}
                    </div>
                  </div>
                  {a.citation && (
                    <CitationChip href={`/compare?citation=${encodeURIComponent(a.citation)}`}>
                      {a.citation}
                    </CitationChip>
                  )}
                  <Link
                    href="/chat"
                    className="rc-ask-link"
                    style={{
                      flexShrink: 0,
                      fontSize: 12.5,
                      fontWeight: 500,
                      padding: "8px 10px",
                      margin: "-8px -10px",
                      borderRadius: "var(--radius-item)",
                    }}
                  >
                    Ask →
                  </Link>
                </div>
              ))}
            </div>
          </VerdictBand>
        ) : (
          <EmptyState
            title="No assessment yet"
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
                Ask a compliance question
              </Link>
            }
          >
            Ask a compliance question or upload your policies, and {tenant?.name ?? "your company"}
            &rsquo;s readiness against {scope} will be scored here.
          </EmptyState>
        )}
      </div>

      <div
        style={{
          marginTop: 20,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 20,
        }}
      >
        <Card style={{ padding: "20px 24px" }}>
          <h2
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 600,
              fontSize: 15,
              letterSpacing: "-0.01em",
              margin: "0 0 14px 0",
              color: "var(--ink)",
            }}
          >
            Company profile
          </h2>
          {[
            { label: "Industry", value: tenant?.industry ?? "—" },
            {
              label: "Size",
              value: tenant?.employee_count ? `${tenant.employee_count} employees` : "—",
            },
            { label: "Jurisdiction", value: isEU ? "European Union" : "India" },
            { label: "City", value: tenant?.city ?? "—" },
            { label: "Regulatory scope", value: scope },
          ].map((r, i, all) => (
            <div
              key={r.label}
              style={{ ...row, borderBottom: i < all.length - 1 ? row.borderBottom : "none" }}
            >
              <span style={{ color: "var(--muted)" }}>{r.label}</span>
              <span style={{ fontWeight: 500, color: "var(--ink)" }}>{r.value}</span>
            </div>
          ))}
        </Card>

        <Card style={{ padding: "20px 24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                fontSize: 15,
                letterSpacing: "-0.01em",
                margin: 0,
                color: "var(--ink)",
              }}
            >
              Recent chats
            </h2>
            <Link href="/chat" style={{ fontSize: 12.5, fontWeight: 500 }}>
              View all
            </Link>
          </div>

          {/* No chat-history endpoint yet — say so rather than show samples. */}
          <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.55, padding: "4px 0" }}>
            Past conversations aren&rsquo;t saved yet. Ask a compliance question and the answer,
            citations and score will appear here.
          </div>
        </Card>
      </div>
    </div>
  );
}
