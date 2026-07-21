"use client";

import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { SectionLabel } from "@/components/ui/SectionLabel";

const ENGINE_URL = process.env.NEXT_PUBLIC_ENGINE_URL || "http://localhost:8001";

interface DomainStat {
  passed: number;
  total: number;
  pass_rate: number;
}

interface FailedCase {
  case_id: string;
  domain: string;
  input: string;
  expected: string;
  got: string;
}

interface CaseProgress {
  case_id: string;
  domain: string;
  status: "running" | "done";
  score?: number;
  passed?: boolean;
  reason?: string;
}

interface EvalResult {
  total: number;
  passed: number;
  overall_pass_rate: number;
  domain_summary: Record<string, DomainStat>;
  failed_cases: FailedCase[];
  duration_seconds: number;
}

type RunState = "idle" | "running" | "done" | "error";

const DOMAIN_LABELS: Record<string, string> = {
  dpdp: "DPDP",
  labour: "Labour Codes",
  gdpr: "GDPR",
  cross: "Cross-domain",
};

const DOMAIN_OPTIONS = [
  { value: "all", label: "All domains" },
  { value: "dpdp", label: "DPDP only" },
  { value: "labour", label: "Labour only" },
  { value: "gdpr", label: "GDPR only" },
  { value: "cross", label: "Cross-domain only" },
];

function pct(n: number) {
  return Math.round(n * 100);
}

const HEADER_ROW: React.CSSProperties = {
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
};

const DATA_ROW: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  padding: "13px 24px",
  borderBottom: "1px solid var(--border-soft)",
  fontSize: 12.5,
};

const TABLE_SHELL: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-card)",
  overflow: "hidden",
};

const MONO: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 11.5,
  color: "var(--muted)",
};

function StatTileLive({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card style={{ padding: "20px 24px" }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--faint)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 600,
          fontSize: 34,
          lineHeight: 1.1,
          marginTop: 8,
          fontVariantNumeric: "tabular-nums",
          color: "var(--ink)",
        }}
      >
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>{sub}</div>}
    </Card>
  );
}

export default function EvalPage() {
  const [runState, setRunState] = useState<RunState>("idle");
  const [domain, setDomain] = useState("all");
  const [progress, setProgress] = useState<CaseProgress[]>([]);
  const [result, setResult] = useState<EvalResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [runAt, setRunAt] = useState<string | null>(null);

  const runSuite = useCallback(async () => {
    setRunState("running");
    setProgress([]);
    setResult(null);
    setErrorMsg("");
    setRunAt(new Date().toLocaleString());

    try {
      const response = await fetch(`${ENGINE_URL}/eval/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Engine returned ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split(/\r?\n\r?\n/);
        buffer = blocks.pop() ?? "";

        for (const block of blocks) {
          if (!block.trim()) continue;
          let eventType = "message";
          let data = "";
          for (const line of block.split(/\r?\n/)) {
            const t = line.trimEnd();
            if (t.startsWith("event: ")) eventType = t.slice(7).trim();
            else if (t.startsWith("data: ")) data = t.slice(6);
          }

          if (!data) continue;
          try {
            const payload = JSON.parse(data);

            if (eventType === "progress") {
              setProgress((prev) => {
                const idx = prev.findIndex((p) => p.case_id === payload.case_id);
                if (idx >= 0) {
                  const updated = [...prev];
                  updated[idx] = payload as CaseProgress;
                  return updated;
                }
                return [...prev, payload as CaseProgress];
              });
            } else if (eventType === "done") {
              setResult(payload as EvalResult);
              setRunState("done");
            }
          } catch {}
        }
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not reach the engine.");
      setRunState("error");
    }
  }, [domain]);

  const isRunning = runState === "running";
  const domainSummary = result?.domain_summary ?? {};
  const doneCount = progress.filter((p) => p.status === "done").length;

  return (
    <div style={{ maxWidth: 940, margin: "0 auto", paddingTop: 16 }}>
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
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <SectionLabel accent>Admin</SectionLabel>
            <Badge level="low" style={{ letterSpacing: "0.08em" }}>
              Internal
            </Badge>
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
            Eval Suite
          </h1>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            Quality runs of the answer pipeline against the golden question set.
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            disabled={isRunning}
            aria-label="Domain to evaluate"
            style={{
              padding: "9px 12px",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-control)",
              fontSize: 13,
              color: "var(--ink)",
              background: "var(--surface)",
              fontFamily: "var(--font-sans)",
              cursor: isRunning ? "default" : "pointer",
              minHeight: 36,
            }}
          >
            {DOMAIN_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={runSuite}
            disabled={isRunning}
            className="palan-btn palan-btn-primary"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              fontWeight: 500,
              color: "var(--on-accent)",
              background: "var(--accent)",
              border: "1px solid var(--accent)",
              borderRadius: "var(--radius-control)",
              padding: "10px 18px",
              minHeight: 36,
              cursor: isRunning ? "default" : "pointer",
              opacity: isRunning ? 0.6 : 1,
            }}
          >
            {isRunning ? "Running…" : "Run evals now"}
          </button>
        </div>
      </div>

      {runState === "error" && (
        <div
          style={{
            marginTop: 24,
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            background: "var(--high-bg)",
            borderRadius: 9,
            padding: "12px 16px",
          }}
        >
          <span
            style={{
              flexShrink: 0,
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--high)",
              marginTop: 2,
            }}
          >
            Failed
          </span>
          <span style={{ fontSize: 13, lineHeight: 1.6, color: "var(--muted)" }}>
            {errorMsg} — is the engine running at{" "}
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{ENGINE_URL}</span>?
          </span>
        </div>
      )}

      {(isRunning || result) && (
        <div
          style={{
            marginTop: 28,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
          }}
        >
          <StatTileLive
            label="Pass rate"
            value={result ? `${pct(result.overall_pass_rate)}%` : "—"}
            sub={result ? `${result.passed} of ${result.total} cases` : "in progress"}
          />
          <StatTileLive
            label="Failing"
            value={
              result
                ? String(result.total - result.passed)
                : String(progress.filter((p) => p.status === "done" && p.passed === false).length)
            }
            sub={result ? "across all domains" : `${doneCount} of ${progress.length} evaluated`}
          />
          <StatTileLive
            label="Duration"
            value={result ? `${result.duration_seconds}s` : "—"}
            sub={runAt ? `Last run ${runAt}` : undefined}
          />
        </div>
      )}

      {Object.keys(domainSummary).length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div style={{ marginBottom: 12 }}>
            <SectionLabel>By domain</SectionLabel>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
            {Object.entries(domainSummary).map(([dom, stats]) => {
              const p = pct(stats.pass_rate ?? 0);
              return (
                <Card key={dom} style={{ padding: "16px 20px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>
                      {DOMAIN_LABELS[dom] ?? dom}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        fontVariantNumeric: "tabular-nums",
                        color: "var(--ink)",
                      }}
                    >
                      {p}%
                    </span>
                  </div>
                  <ScoreBar score={p} />
                  <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 6 }}>
                    {stats.passed}/{stats.total} passing
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {isRunning && progress.length > 0 && (
        <div style={{ marginTop: 28, ...TABLE_SHELL }}>
          <div style={HEADER_ROW}>
            <span style={{ flex: 1 }}>Case</span>
            <span style={{ width: 130 }}>Domain</span>
            <span style={{ width: 90 }}>Score</span>
            <span style={{ width: 90 }}>Result</span>
          </div>
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {[...progress].reverse().map((p) => (
              <div key={p.case_id} style={DATA_ROW}>
                <span style={{ ...MONO, flex: 1 }}>{p.case_id}</span>
                <span style={{ width: 130, color: "var(--muted)" }}>
                  {DOMAIN_LABELS[p.domain] ?? p.domain}
                </span>
                <span
                  style={{
                    width: 90,
                    ...MONO,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {p.score !== undefined ? p.score.toFixed(2) : "—"}
                </span>
                <span style={{ width: 90 }}>
                  {p.status === "running" ? (
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>Running…</span>
                  ) : p.passed ? (
                    <Badge level="ok">Passed</Badge>
                  ) : (
                    <Badge level="high">Failed</Badge>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && result.failed_cases.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <SectionLabel>Failed cases</SectionLabel>
            <Badge level="high">
              {result.failed_cases.length} regression
              {result.failed_cases.length === 1 ? "" : "s"}
            </Badge>
          </div>

          <div style={TABLE_SHELL}>
            <div style={HEADER_ROW}>
              <span style={{ width: 130 }}>Case</span>
              <span style={{ width: 120 }}>Domain</span>
              <span style={{ flex: 1 }}>Expected</span>
              <span style={{ flex: 1 }}>Got</span>
            </div>
            {result.failed_cases.map((row, i, all) => (
              <div
                key={row.case_id}
                style={{
                  ...DATA_ROW,
                  alignItems: "flex-start",
                  borderBottom: i < all.length - 1 ? DATA_ROW.borderBottom : "none",
                }}
              >
                <span style={{ ...MONO, width: 130 }}>{row.case_id}</span>
                <span style={{ width: 120, color: "var(--muted)" }}>
                  {DOMAIN_LABELS[row.domain] ?? row.domain}
                </span>
                <span style={{ flex: 1, color: "var(--ok)", lineHeight: 1.55 }}>
                  {row.expected}
                </span>
                <span style={{ flex: 1, color: "var(--high)", lineHeight: 1.55 }}>{row.got}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && result.failed_cases.length === 0 && (
        <div
          style={{
            marginTop: 28,
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            background: "var(--ok-bg)",
            borderRadius: 9,
            padding: "14px 18px",
          }}
        >
          <span
            style={{
              flexShrink: 0,
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--ok)",
              marginTop: 2,
            }}
          >
            Passed
          </span>
          <span style={{ fontSize: 13, lineHeight: 1.6, color: "var(--muted)" }}>
            All {result.total} cases passed · {pct(result.overall_pass_rate)}% pass rate.
          </span>
        </div>
      )}

      {runState === "idle" && (
        <div style={{ marginTop: 28 }}>
          <EmptyState title="No eval run yet">
            Choose a domain and run the suite to evaluate the compliance pipeline against the
            golden question set. Runs are not stored — results live until you leave the page.
          </EmptyState>
        </div>
      )}
    </div>
  );
}
