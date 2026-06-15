"use client";

import { useState, useCallback } from "react";

const ENGINE_URL = process.env.NEXT_PUBLIC_ENGINE_URL || "http://localhost:8001";

// ── types ──────────────────────────────────────────────────────────────────

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

// ── domain config ──────────────────────────────────────────────────────────

const DOMAIN_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  dpdp:   { label: "DPDP",         bg: "rgba(249,115,22,.08)",  color: "#c2410c" },
  labour: { label: "Labour Codes", bg: "rgba(22,163,74,.08)",   color: "#15803d" },
  gdpr:   { label: "GDPR",         bg: "rgba(37,99,235,.08)",   color: "#1d4ed8" },
  cross:  { label: "Cross-domain", bg: "rgba(139,92,246,.08)",  color: "#6d28d9" },
};

const DOMAIN_BAR_COLORS: Record<string, string> = {
  dpdp:   "var(--amber-500)",
  labour: "var(--green-500)",
  gdpr:   "var(--blue-500, #3b82f6)",
  cross:  "#a855f7",
};

const TH: React.CSSProperties = {
  textAlign: "left", padding: "10px 20px",
  fontSize: "0.6875rem", fontWeight: 600,
  textTransform: "uppercase", letterSpacing: "0.04em",
  color: "var(--s500)", background: "var(--s50)",
  borderBottom: "1px solid var(--s200)",
};
const TD: React.CSSProperties = {
  padding: "12px 20px", borderBottom: "1px solid var(--s100)", fontSize: "0.8125rem",
};

// ── helpers ────────────────────────────────────────────────────────────────

function pct(n: number) { return Math.round(n * 100); }

function StatusIcon({ passed }: { passed?: boolean }) {
  if (passed === undefined) return <span style={{ color: "var(--s400)" }}>–</span>;
  return passed
    ? <span style={{ color: "#16a34a", fontWeight: 700 }}>✓</span>
    : <span style={{ color: "#dc2626", fontWeight: 700 }}>✗</span>;
}

// ── component ──────────────────────────────────────────────────────────────

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
              setProgress(prev => {
                const idx = prev.findIndex(p => p.case_id === payload.case_id);
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

  // ── render ──────────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: "1100px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <div style={{ fontFamily: "var(--font-d)", fontSize: "1.25rem", fontWeight: 700, color: "var(--s900)" }}>
            Eval Suite Results
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--s400)", marginTop: "2px" }}>
            {runAt
              ? `Latest run: ${runAt}${result ? ` · Duration: ${result.duration_seconds}s` : ""}`
              : "No run yet — click Run Full Suite to start"}
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <select
            value={domain}
            onChange={e => setDomain(e.target.value)}
            disabled={isRunning}
            style={{
              padding: "7px 12px", border: "1.5px solid var(--s200)", borderRadius: "8px",
              fontSize: "0.8125rem", color: "var(--s700)", background: "#fff",
              fontFamily: "var(--font-b)", cursor: "pointer",
            }}
          >
            <option value="all">All Domains</option>
            <option value="dpdp">DPDP only</option>
            <option value="labour">Labour only</option>
            <option value="gdpr">GDPR only</option>
            <option value="cross">Cross-domain only</option>
          </select>
          <button
            onClick={runSuite}
            disabled={isRunning}
            style={{
              padding: "8px 18px",
              background: isRunning ? "var(--brand-400)" : "var(--brand-600)",
              color: "#fff", border: "none", borderRadius: "8px",
              fontSize: "0.8125rem", fontWeight: 600, fontFamily: "var(--font-b)",
              cursor: isRunning ? "default" : "pointer", transition: "background .15s",
            }}
          >
            {isRunning ? "⏳ Running…" : "▶ Run Eval Suite"}
          </button>
        </div>
      </div>

      {/* Error banner */}
      {runState === "error" && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px",
          padding: "12px 16px", marginBottom: "20px",
          fontSize: "0.875rem", color: "#dc2626", display: "flex", gap: "8px",
        }}>
          <span>⚠️</span>
          <span>{errorMsg} — Is the engine running at {ENGINE_URL}?</span>
        </div>
      )}

      {/* Summary cards — show skeleton while running, real data when done */}
      {(isRunning || result) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "24px" }}>
          {[
            {
              label: "Total Cases",
              value: result ? String(result.total) : progress.filter(p => p.status === "done").length + "…",
              sub: "Profile-dependent tests",
              color: "var(--blue-500, #3b82f6)",
            },
            {
              label: "Passing",
              value: result ? String(result.passed) : progress.filter(p => p.status === "done" && p.passed).length + "…",
              sub: result ? `${pct(result.overall_pass_rate)}% pass rate` : "in progress",
              color: "var(--green-700, #15803d)",
            },
            {
              label: "Failing",
              value: result
                ? String(result.total - result.passed)
                : progress.filter(p => p.status === "done" && p.passed === false).length + "…",
              sub: "Across all domains",
              color: "var(--red-700, #b91c1c)",
            },
            {
              label: "Duration",
              value: result ? `${result.duration_seconds}s` : "–",
              sub: "End-to-end eval time",
              color: "var(--s700)",
            },
          ].map(card => (
            <div key={card.label} style={{
              background: "#fff", border: "1px solid var(--s200)",
              borderRadius: "10px", padding: "18px", textAlign: "center",
            }}>
              <div style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--s500)", marginBottom: "6px" }}>
                {card.label}
              </div>
              <div style={{ fontFamily: "var(--font-d)", fontSize: "1.75rem", fontWeight: 700, color: card.color }}>
                {card.value}
              </div>
              <div style={{ fontSize: "0.6875rem", color: "var(--s400)", marginTop: "4px" }}>{card.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Domain breakdown — appears when at least one domain is complete */}
      {Object.keys(domainSummary).length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "24px" }}>
          {Object.entries(domainSummary).map(([dom, stats]) => {
            const cfg = DOMAIN_CONFIG[dom] ?? { label: dom, bg: "var(--s50)", color: "var(--s700)" };
            const barColor = DOMAIN_BAR_COLORS[dom] ?? "var(--brand-500)";
            const p = pct(stats.pass_rate ?? 0);
            return (
              <div key={dom} style={{ background: "#fff", border: "1px solid var(--s200)", borderRadius: "10px", padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--s700)" }}>{cfg.label}</span>
                  <span style={{ fontFamily: "var(--font-m)", fontSize: "0.875rem", fontWeight: 600, color: cfg.color }}>{p}%</span>
                </div>
                <div style={{ height: "8px", background: "var(--s200)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ height: "100%", background: barColor, borderRadius: "4px", width: `${p}%`, transition: "width .6s" }} />
                </div>
                <div style={{ fontSize: "0.6875rem", color: "var(--s400)", marginTop: "6px" }}>
                  {stats.passed}/{stats.total} passing
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Live progress table — visible while running */}
      {isRunning && progress.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid var(--s200)", borderRadius: "10px", overflow: "hidden", marginBottom: "24px" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--s200)" }}>
            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--s700)" }}>
              Live Progress — {progress.filter(p => p.status === "done").length} / {progress.length} done
            </span>
          </div>
          <div style={{ maxHeight: "260px", overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Case", "Domain", "Result", "Score"].map(h => <th key={h} style={TH}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {[...progress].reverse().map((p, i) => {
                  const last = i === progress.length - 1;
                  const cell: React.CSSProperties = { ...TD, borderBottom: last ? "none" : TD.borderBottom };
                  const cfg = DOMAIN_CONFIG[p.domain] ?? { label: p.domain, bg: "var(--s50)", color: "var(--s700)" };
                  return (
                    <tr key={p.case_id}>
                      <td style={cell}><span style={{ fontFamily: "var(--font-m)", fontSize: "0.75rem", color: "var(--brand-600)" }}>{p.case_id}</span></td>
                      <td style={cell}><span style={{ fontSize: "0.6875rem", padding: "2px 8px", borderRadius: "4px", background: cfg.bg, color: cfg.color }}>{cfg.label}</span></td>
                      <td style={cell}>
                        {p.status === "running"
                          ? <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", border: "2px solid var(--brand-400)", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
                          : <StatusIcon passed={p.passed} />}
                      </td>
                      <td style={{ ...cell, fontFamily: "var(--font-m)", color: "var(--s600)" }}>
                        {p.score !== undefined ? p.score.toFixed(2) : "–"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Failed cases — appears when run is complete */}
      {result && result.failed_cases.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid var(--s200)", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{
            padding: "16px 20px", borderBottom: "1px solid var(--s200)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--s700)" }}>Failed Test Cases</span>
            <span style={{
              fontSize: "0.6875rem", color: "var(--red-700, #b91c1c)",
              background: "var(--red-50, #fef2f2)", padding: "2px 10px",
              borderRadius: "100px", border: "1px solid rgba(239,68,68,.2)",
            }}>
              {result.failed_cases.length} failure{result.failed_cases.length !== 1 ? "s" : ""}
            </span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Case ID", "Domain", "Expected", "Got"].map(h => <th key={h} style={TH}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {result.failed_cases.map((row, i) => {
                const last = i === result.failed_cases.length - 1;
                const cell: React.CSSProperties = { ...TD, borderBottom: last ? "none" : "1px solid var(--s100)" };
                const cfg = DOMAIN_CONFIG[row.domain] ?? { label: row.domain, bg: "var(--s50)", color: "var(--s700)" };
                return (
                  <tr key={row.case_id}>
                    <td style={cell}><span style={{ fontFamily: "var(--font-m)", fontSize: "0.75rem", color: "var(--brand-600)", fontWeight: 500 }}>{row.case_id}</span></td>
                    <td style={cell}><span style={{ fontSize: "0.6875rem", fontWeight: 500, padding: "2px 8px", borderRadius: "4px", background: cfg.bg, color: cfg.color }}>{cfg.label}</span></td>
                    <td style={{ ...cell, color: "var(--green-700, #15803d)", fontSize: "0.75rem", maxWidth: "280px" }}>{row.expected}</td>
                    <td style={{ ...cell, color: "var(--red-700, #b91c1c)", fontSize: "0.75rem", maxWidth: "280px" }}>{row.got}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* All passed banner */}
      {result && result.failed_cases.length === 0 && (
        <div style={{
          background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px",
          padding: "18px 20px", display: "flex", alignItems: "center", gap: "12px",
        }}>
          <span style={{ fontSize: "1.5rem" }}>🎉</span>
          <div>
            <div style={{ fontWeight: 600, color: "#15803d", fontSize: "0.9375rem" }}>All tests passing</div>
            <div style={{ fontSize: "0.75rem", color: "#16a34a", marginTop: "2px" }}>
              {result.passed}/{result.total} cases passed · {pct(result.overall_pass_rate)}% pass rate
            </div>
          </div>
        </div>
      )}

      {/* Idle state placeholder */}
      {runState === "idle" && (
        <div style={{
          background: "#fff", border: "1px solid var(--s200)", borderRadius: "10px",
          padding: "48px", textAlign: "center", color: "var(--s400)",
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "12px" }}>⚖️</div>
          <div style={{ fontSize: "0.9375rem", fontWeight: 500, color: "var(--s600)", marginBottom: "6px" }}>
            No eval run yet
          </div>
          <div style={{ fontSize: "0.8125rem" }}>
            Select a domain and click <strong>Run Eval Suite</strong> to evaluate the compliance pipeline against {" "}
            60 real test cases across DPDP, Labour, GDPR, and cross-domain scenarios.
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
