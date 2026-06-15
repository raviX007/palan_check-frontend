"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApiFetch } from "@/lib/api-client";

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
}

interface StoredScores {
  scores: Record<string, DomainScore>;
  updatedAt: string;
}

const BAND_STYLE: Record<string, { color: string; bg: string; border: string; label: string }> = {
  green: { color: "#16a34a", bg: "#f0fdf4", border: "rgba(34,197,94,.2)",   label: "Compliant"    },
  amber: { color: "#d97706", bg: "#fffbeb", border: "rgba(245,158,11,.2)",  label: "Needs Review" },
  red:   { color: "#dc2626", bg: "#fef2f2", border: "rgba(239,68,68,.2)",   label: "At Risk"      },
};

const DOMAIN_LABELS: Record<string, string> = {
  dpdp:    "DPDP Act",
  labour:  "Labour Law",
  gdpr:    "GDPR",
  overall: "Overall Score",
};

const SCORE_ORDER = ["dpdp", "labour", "gdpr", "overall"];

const RECENT_QUERIES = [
  { q: "Does NovaPay need a DPO?", time: "2 hours ago", status: "Answered" },
  { q: "Contract worker obligations under DPDP", time: "Yesterday", status: "Answered" },
  { q: "Privacy policy gaps for mobile app users", time: "2 days ago", status: "Answered" },
  { q: "Data localisation requirements", time: "3 days ago", status: "Answered" },
];

const ALERTS = [
  {
    severity: "high",
    title: "DPO Appointment Required",
    desc: "Under DPDP Act §13, your data volume likely triggers mandatory DPO appointment within 90 days.",
  },
  {
    severity: "high",
    title: "Privacy Notice Non-Compliant",
    desc: "Current mobile app privacy notice missing mandatory disclosures under DPDP §6(1).",
  },
  {
    severity: "medium",
    title: "Grievance Redressal Gap",
    desc: "No formal grievance mechanism for data principals as required by DPDP §13(6).",
  },
];

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div style={{
      height: "5px", background: "var(--s200)", borderRadius: "100px",
      marginTop: "10px", overflow: "hidden",
    }}>
      <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: "100px", transition: "width .6s" }} />
    </div>
  );
}

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
        // Load persisted scores for this tenant from localStorage
        try {
          const raw = localStorage.getItem(`palan_scores_${u.tenant_id}`);
          if (raw) {
            const parsed = JSON.parse(raw) as { scores: Record<string, DomainScore>; updatedAt: string };
            setScores(parsed.scores);
            setScoresUpdatedAt(parsed.updatedAt);
          }
        } catch {}
        return apiFetch<Tenant>(`/tenants/${u.tenant_id}`);
      })
      .then(setTenant)
      .catch(() => null);
  }, [apiFetch]);

  return (
    <div style={{ maxWidth: "1100px" }}>
      {/* Company header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "24px",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--s900)" }}>
              {tenant?.jurisdiction === "EU" ? "🇪🇺" : "🇮🇳"} {tenant?.name ?? "Loading…"}
            </span>
            {tenant && (
              <span style={{
                fontSize: "0.625rem", fontWeight: 500, padding: "2px 8px",
                borderRadius: "100px", background: "rgba(249,115,22,.08)",
                color: "#c2410c", border: "1px solid rgba(249,115,22,.15)",
              }}>
                {tenant.jurisdiction === "EU" ? "GDPR + AI Act" : "DPDP + Labour"}
              </span>
            )}
          </div>
          <p style={{ fontSize: "0.8125rem", color: "var(--s500)", marginTop: "3px" }}>
            {[tenant?.city, tenant?.employee_count ? `${tenant.employee_count} employees` : null, tenant?.industry]
              .filter(Boolean).join(" · ")}
            {user?.full_name && <span> · Signed in as {user.full_name}</span>}
          </p>
        </div>
        <Link href="/chat" style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          background: "var(--brand-600)", color: "#fff", padding: "9px 18px",
          borderRadius: "8px", fontSize: "0.8125rem", fontWeight: 600,
          textDecoration: "none",
        }}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Ask Compliance Question
        </Link>
      </div>

      {/* Score cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {scores
          ? SCORE_ORDER.filter((d) => scores[d]).map((domain) => {
              const s = scores[domain];
              const style = BAND_STYLE[s.band];
              return (
                <div key={domain} style={{
                  background: style.bg, border: `1px solid ${style.border}`,
                  borderRadius: "10px", padding: "18px 20px",
                }}>
                  <p style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--s500)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {DOMAIN_LABELS[domain] ?? domain}
                  </p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "8px" }}>
                    <span style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--s900)", lineHeight: 1 }}>{s.score}</span>
                    <span style={{ fontSize: "0.8125rem", color: "var(--s400)" }}>/100</span>
                  </div>
                  <ScoreBar score={s.score} color={style.color} />
                  <p style={{ fontSize: "0.6875rem", fontWeight: 500, marginTop: "8px", color: style.color }}>
                    {style.label} · {s.gap_count} gap{s.gap_count !== 1 ? "s" : ""}
                  </p>
                </div>
              );
            })
          : SCORE_ORDER.map((domain) => (
              <div key={domain} style={{
                background: "#fff", border: "1px solid var(--s200)",
                borderRadius: "10px", padding: "18px 20px",
              }}>
                <p style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--s500)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {DOMAIN_LABELS[domain] ?? domain}
                </p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "8px" }}>
                  <span style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--s300)", lineHeight: 1 }}>—</span>
                </div>
                <ScoreBar score={0} color="var(--s200)" />
                <p style={{ fontSize: "0.6875rem", color: "var(--s400)", marginTop: "8px" }}>
                  No data yet
                </p>
              </div>
            ))
        }
      </div>
      {scoresUpdatedAt && (
        <p style={{ fontSize: "0.6875rem", color: "var(--s400)", marginTop: "-16px", marginBottom: "24px" }}>
          Last assessed: {new Date(scoresUpdatedAt).toLocaleString()}
        </p>
      )}

      {/* 2-column grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        {/* Company profile */}
        <div style={{ background: "#fff", border: "1px solid var(--s200)", borderRadius: "10px", padding: "20px 24px" }}>
          <h2 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--s800)", marginBottom: "16px" }}>Company Profile</h2>
          {[
            { label: "Industry", value: tenant?.industry ?? "—" },
            { label: "Size", value: tenant?.employee_count ? `${tenant.employee_count} employees` : "—" },
            { label: "Jurisdiction", value: tenant?.jurisdiction === "EU" ? "🇪🇺 European Union" : "🇮🇳 India" },
            { label: "City", value: tenant?.city ?? "—" },
            { label: "Regulatory Scope", value: tenant?.jurisdiction === "EU" ? "GDPR + AI Act" : "DPDP + Labour Codes" },
          ].map((row) => (
            <div key={row.label} style={{
              display: "flex", justifyContent: "space-between",
              padding: "8px 0", borderBottom: "1px solid var(--s100)",
              fontSize: "0.8125rem",
            }}>
              <span style={{ color: "var(--s500)" }}>{row.label}</span>
              <span style={{ color: "var(--s800)", fontWeight: 500 }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Recent queries */}
        <div style={{ background: "#fff", border: "1px solid var(--s200)", borderRadius: "10px", padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--s800)" }}>Recent Queries</h2>
            <Link href="/chat" style={{ fontSize: "0.75rem", color: "var(--brand-600)", fontWeight: 500 }}>View all</Link>
          </div>
          {RECENT_QUERIES.map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", justifyContent: "space-between",
              padding: "10px 0", borderBottom: i < RECENT_QUERIES.length - 1 ? "1px solid var(--s100)" : "none",
              gap: "8px",
            }}>
              <div style={{ minWidth: 0 }}>
                <p style={{
                  fontSize: "0.8125rem", color: "var(--s800)", fontWeight: 500,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {item.q}
                </p>
                <p style={{ fontSize: "0.6875rem", color: "var(--s400)", marginTop: "2px" }}>{item.time}</p>
              </div>
              <span style={{
                fontSize: "0.625rem", fontWeight: 500, padding: "2px 8px",
                borderRadius: "100px", background: "var(--green-50)",
                color: "var(--green-700)", border: "1px solid rgba(34,197,94,.2)",
                flexShrink: 0,
              }}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* High priority alerts */}
      <div style={{ background: "#fff", border: "1px solid var(--s200)", borderRadius: "10px", padding: "20px 24px" }}>
        <h2 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--s800)", marginBottom: "16px" }}>
          High Priority Alerts
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {ALERTS.map((alert, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: "12px",
              padding: "12px 16px", borderRadius: "8px",
              ...(alert.severity === "high"
                ? { background: "var(--red-50)", border: "1px solid rgba(239,68,68,.2)" }
                : { background: "var(--amber-50)", border: "1px solid rgba(245,158,11,.2)" }),
            }}>
              <div style={{
                width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: alert.severity === "high" ? "var(--red-500)" : "var(--amber-500)",
                marginTop: "1px",
              }}>
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#fff" strokeWidth="2.5">
                  <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: "0.8125rem", fontWeight: 600,
                  color: alert.severity === "high" ? "var(--red-700)" : "var(--amber-700)",
                  marginBottom: "3px",
                }}>
                  {alert.title}
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--s600)", lineHeight: 1.5 }}>
                  {alert.desc}
                </p>
              </div>
              <Link href="/chat" style={{
                fontSize: "0.6875rem", fontWeight: 500, flexShrink: 0,
                color: "var(--brand-600)", padding: "4px 10px",
                border: "1px solid var(--brand-200)", borderRadius: "6px",
              }}>
                Ask
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
