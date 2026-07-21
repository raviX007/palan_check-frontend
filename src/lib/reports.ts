import type { Level } from "@/components/ui/Badge";

/**
 * Reports are derived from the engine's own analysis of THIS tenant's
 * documents — the `domain_scores` payload the chat page persists to
 * `palan_scores_<tenant_id>`. Nothing here is fabricated: if the engine has
 * not scored anything yet, there is no report and the UI shows an empty state.
 *
 * TODO: move to GET /reports once palan-api exposes it; localStorage is a
 * stopgap that only sees assessments made in this browser.
 */

export interface StoredFinding {
  severity: string;
  title: string;
  description: string;
  source_id?: string;
}

export interface StoredDomainScore {
  score: number;
  band: "green" | "amber" | "red";
  gap_count: number;
  breakdown?: { critical: number; high: number; medium: number; low: number };
  findings?: StoredFinding[];
}

export interface StoredScores {
  scores: Record<string, StoredDomainScore>;
  updatedAt: string;
}

export interface ReportFinding {
  level: Level;
  title: string;
  body: string;
  /** The engine does not emit remediation text yet. */
  remediation?: string;
  citations: string[];
}

export interface ReportDomain {
  label: string;
  score: number;
  findings: ReportFinding[];
}

export interface Report {
  id: string;
  company: string;
  scope: string;
  generated: string;
  overall: number;
  findingCount: number;
  highCount: number;
  domains: ReportDomain[];
}

export const DOMAIN_LABELS: Record<string, string> = {
  dpdp: "DPDP Act 2023",
  labour: "Labour Codes",
  gdpr: "GDPR",
  ai_act: "EU AI Act",
  overall: "Overall",
};

export function severityLevel(sev: string | undefined): Level {
  switch (sev?.toLowerCase()) {
    case "critical":
    case "high":
      return "high";
    case "medium":
      return "med";
    case "low":
      return "low";
    default:
      return "low";
  }
}

export function scopeFor(jurisdiction: string | undefined): string {
  return jurisdiction === "EU" ? "GDPR + EU AI Act" : "DPDP + Labour Codes";
}

export function jurisdictionPill(jurisdiction: string | undefined): string {
  return jurisdiction === "EU" ? "EU · GDPR + AI Act" : "India · DPDP + Labour";
}

export function readStoredScores(tenantId: string): StoredScores | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`palan_scores_${tenantId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredScores;
    if (!parsed?.scores) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Stable id so a report has its own URL. */
export function reportId(tenantId: string): string {
  return `assessment-${tenantId}`;
}

/**
 * Build a report from stored engine scores. Returns null when the engine has
 * produced nothing for this tenant — callers show an empty state.
 */
export function buildReport(
  tenant: { id: string; name: string; jurisdiction?: string },
  stored: StoredScores | null,
): Report | null {
  if (!stored) return null;

  const domains: ReportDomain[] = Object.entries(stored.scores)
    .filter(([key]) => key !== "overall")
    .map(([key, d]) => ({
      label: DOMAIN_LABELS[key] ?? key.toUpperCase(),
      score: d.score,
      findings: (d.findings ?? []).map((f) => ({
        level: severityLevel(f.severity),
        title: f.title,
        body: f.description,
        citations: f.source_id ? [f.source_id] : [],
      })),
    }));

  if (domains.length === 0) return null;

  const all = domains.flatMap((d) => d.findings);
  const overall =
    stored.scores.overall?.score ??
    Math.round(domains.reduce((n, d) => n + d.score, 0) / domains.length);

  return {
    id: reportId(tenant.id),
    company: tenant.name,
    scope: scopeFor(tenant.jurisdiction),
    generated: new Date(stored.updatedAt).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    overall,
    findingCount: all.length,
    highCount: all.filter((f) => f.level === "high").length,
    domains,
  };
}
