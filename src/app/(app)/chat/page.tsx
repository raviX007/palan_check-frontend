"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import Link from "next/link";
import { useApiFetch } from "@/lib/api-client";

const ENGINE_URL = process.env.NEXT_PUBLIC_ENGINE_URL || "http://localhost:8001";

const NODE_LABELS: Record<string, string> = {
  router: "Router",
  retriever: "Retriever",
  reranker: "Reranker",
  dpdp_agent: "DPDP Agent",
  labour_agent: "Labour Agent",
  gdpr_agent: "GDPR Agent",
  synthesis: "Synthesis",
  stream_answer: "Streaming Answer",
};

const SUGGESTED = [
  "Does our company need a DPO under DPDP?",
  "What are our Labour Code obligations?",
  "Review our privacy policy for DPDP gaps",
  "What data processing consent requirements apply to us?",
];

interface Warning {
  type: string;
  message: string;
  severity?: string;
}

interface Finding {
  severity: string;
  title: string;
  description: string;
  source_id?: string;
}

interface DomainScore {
  score: number;
  band: "green" | "amber" | "red";
  gap_count: number;
  breakdown?: { critical: number; high: number; medium: number; low: number };
  findings?: Finding[];
}

interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  citations?: string[];
  warnings?: Warning[];
  domainScores?: Record<string, DomainScore>;
  isTyping?: boolean;
}

interface TraceStep {
  node: string;
  label: string;
  status: "running" | "done";
}

interface TenantInfo {
  id: string;
  name: string;
  jurisdiction: string;
  employee_count: number;
  city: string | null;
  industry: string | null;
}

function renderContent(text: unknown) {
  const str = typeof text === "string" ? text : String(text ?? "");
  return str.split("\n\n").map((para, i) => {
    const html = para.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    return <p key={i} dangerouslySetInnerHTML={{ __html: html }} style={{ marginBottom: "8px" }} />;
  });
}

function citationToString(c: unknown): string {
  if (typeof c === "string") return c;
  if (c && typeof c === "object") {
    const obj = c as Record<string, unknown>;
    // Prefer pre-formatted string; fall back to composing from law + section
    if (typeof obj.formatted === "string") return obj.formatted;
    if (typeof obj.law === "string" && typeof obj.section === "string")
      return `${obj.law}, ${obj.section}`;
    // Legacy / generic keys
    const val = obj.text || obj.title || obj.citation || obj.reference || obj.name;
    if (typeof val === "string") return val;
  }
  return "";  // discard unreadable shapes rather than showing raw JSON
}

export default function ChatPage() {
  const apiFetch = useApiFetch();
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [traceSteps, setTraceSteps] = useState<TraceStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [selectedScore, setSelectedScore] = useState<{ domain: string; data: DomainScore } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiFetch<TenantInfo>("/tenants/me")
      .then(setTenant)
      .catch(() => null);
  }, [apiFetch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, traceSteps]);

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => { if (e.key === "Escape") setSelectedScore(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const send = useCallback(async (text: string) => {
    const q = text.trim();
    if (!q || isLoading) return;

    setInput("");
    setIsLoading(true);
    setTraceSteps([]);

    const agentId = `a-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", content: q },
      { id: agentId, role: "agent", content: "", isTyping: true },
    ]);

    const tenantProfile = tenant
      ? {
          company_name: tenant.name,
          industry: tenant.industry || "technology",
          city: tenant.city || "India",
          employee_count: tenant.employee_count || 0,
          jurisdiction: tenant.jurisdiction || "IN",
        }
      : {};

    try {
      const response = await fetch(`${ENGINE_URL}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          tenant_id: tenant?.id ?? "",
          tenant_profile: tenantProfile,
          conversation_id: "",
          user_id: "",
        }),
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
        // sse-starlette uses \r\n line endings; split on both \n\n and \r\n\r\n
        const blocks = buffer.split(/\r?\n\r?\n/);
        buffer = blocks.pop() ?? "";

        for (const block of blocks) {
          if (!block.trim()) continue;

          let eventType = "message";
          let data = "";
          for (const line of block.split(/\r?\n/)) {
            const trimmed = line.trimEnd();
            if (trimmed.startsWith("event: ")) eventType = trimmed.slice(7).trim();
            else if (trimmed.startsWith("data: ")) data = trimmed.slice(6);
          }

          if (eventType === "token" && data) {
            try {
              const token = JSON.parse(data) as string;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === agentId
                    ? { ...m, content: (m.content || "") + token, isTyping: false }
                    : m
                )
              );
            } catch {}
          } else if (eventType === "trace" && data) {
            try {
              const { step, status } = JSON.parse(data) as { step: string; status: "running" | "done" };
              const label = NODE_LABELS[step] || step;
              setTraceSteps((prev) => {
                const idx = prev.findIndex((s) => s.node === step);
                if (idx >= 0) {
                  const updated = [...prev];
                  updated[idx] = { node: step, label, status };
                  return updated;
                }
                return [...prev, { node: step, label, status }];
              });
            } catch {}
          } else if (eventType === "warning" && data) {
            try {
              const w = JSON.parse(data) as Warning;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === agentId
                    ? { ...m, warnings: [...(m.warnings ?? []), w] }
                    : m
                )
              );
            } catch {}
          } else if (eventType === "error" && data) {
            try {
              const { message: errMsg } = JSON.parse(data) as { message: string; code?: string };
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === agentId
                    ? { ...m, content: errMsg, isTyping: false }
                    : m
                )
              );
            } catch {}
          } else if (eventType === "done" && data) {
            try {
              const result = JSON.parse(data) as {
                final_answer?: string;
                citations?: unknown[];
                citation_warnings?: string[];
                domain_scores?: Record<string, DomainScore>;
              };
              const citations = (result.citations ?? []).map(citationToString).filter(Boolean);
              const citationWarnings: Warning[] = (result.citation_warnings ?? []).map((msg) => ({
                type: "unverified_citation",
                message: msg,
                severity: "warning",
              }));
              const domainScores = result.domain_scores ?? undefined;

              // Persist latest scores to localStorage so the dashboard can read them
              if (domainScores && tenant?.id) {
                try {
                  localStorage.setItem(
                    `palan_scores_${tenant.id}`,
                    JSON.stringify({ scores: domainScores, updatedAt: new Date().toISOString() })
                  );
                } catch {}
              }

              setMessages((prev) =>
                prev.map((m) =>
                  m.id === agentId
                    ? {
                        ...m,
                        content: m.content || result.final_answer || "No response generated.",
                        citations,
                        domainScores,
                        warnings: [...(m.warnings ?? []), ...citationWarnings],
                        isTyping: false,
                      }
                    : m
                )
              );
            } catch {}
          }
        }
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === agentId
            ? { ...m, content: `Error: ${err instanceof Error ? err.message : "Could not reach the engine. Is it running?"}`, isTyping: false }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [tenant, isLoading]);

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  const showTrace = traceSteps.length > 0;
  const hasMessages = messages.length > 0;

  return (
    <div style={{
      margin: "-24px -28px",
      height: "calc(100vh - 56px)",
      display: "flex",
      flexDirection: "column",
      background: "var(--s50)",
    }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>

        {/* Suggested chips */}
        {!hasMessages && (
          <div style={{ marginBottom: "24px" }}>
            <p style={{ fontSize: "0.8125rem", color: "var(--s500)", marginBottom: "12px" }}>
              {tenant ? `Suggested questions for ${tenant.name}` : "Suggested questions"}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {SUGGESTED.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  style={{
                    fontSize: "0.75rem", color: "var(--s500)", padding: "6px 14px",
                    border: "1px solid var(--s200)", borderRadius: "100px",
                    cursor: "pointer", background: "#fff",
                    fontFamily: "var(--font-b)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--brand-200)";
                    (e.currentTarget as HTMLElement).style.color = "var(--brand-600)";
                    (e.currentTarget as HTMLElement).style.background = "var(--brand-50)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--s200)";
                    (e.currentTarget as HTMLElement).style.color = "var(--s500)";
                    (e.currentTarget as HTMLElement).style.background = "#fff";
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Agent Trace panel — live updates from SSE */}
        {showTrace && (
          <div style={{
            background: "#fff", border: "1px solid var(--s200)",
            borderRadius: "10px", padding: "14px 18px", marginBottom: "20px",
          }}>
            <div style={{ marginBottom: "10px" }}>
              <span style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--s500)" }}>
                Agent Trace
              </span>
            </div>
            {traceSteps.map((step) => (
              <div key={step.node} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "5px 0", fontSize: "0.8125rem" }}>
                <span style={{ width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {step.status === "done" ? (
                    <span style={{ color: "#16a34a", fontSize: "0.875rem" }}>✓</span>
                  ) : (
                    <span style={{
                      display: "inline-block", width: "10px", height: "10px", borderRadius: "50%",
                      border: "2px solid var(--brand-400)", borderTopColor: "transparent",
                      animation: "spin 0.8s linear infinite",
                    }} />
                  )}
                </span>
                <span style={{ color: step.status === "running" ? "var(--brand-600)" : "var(--s600)", fontWeight: step.status === "running" ? 500 : 400 }}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) =>
          msg.role === "user" ? (
            <div key={msg.id} style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
              <div style={{
                background: "var(--brand-50)", border: "1px solid var(--brand-200)",
                color: "var(--brand-700)", padding: "10px 16px",
                borderRadius: "12px 12px 2px 12px",
                maxWidth: "75%", fontSize: "0.875rem", lineHeight: 1.6,
              }}>
                {msg.content}
              </div>
            </div>
          ) : (
            <div key={msg.id} style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <div style={{
                width: "28px", height: "28px", background: "var(--s100)", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.75rem", flexShrink: 0, marginTop: "2px",
              }}>
                ⚖️
              </div>
              <div style={{ maxWidth: "80%" }}>
                <div style={{
                  background: "#fff", border: "1px solid var(--s200)",
                  padding: "14px 18px", borderRadius: "2px 12px 12px 12px",
                  fontSize: "0.875rem", lineHeight: 1.7, color: "var(--s700)",
                }}>
                  {msg.isTyping ? (
                    <div style={{ display: "flex", gap: "4px", padding: "4px 0" }}>
                      {[0, 0.2, 0.4].map((delay, i) => (
                        <div key={i} style={{
                          width: "6px", height: "6px", background: "var(--s400)", borderRadius: "50%",
                          animation: "bounce 1.4s infinite",
                          animationDelay: `${delay}s`,
                        }} />
                      ))}
                    </div>
                  ) : (
                    renderContent(msg.content)
                  )}
                </div>

                {!msg.isTyping && msg.warnings && msg.warnings.length > 0 && (
                  <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {msg.warnings.map((w, i) => {
                      const isInfo = w.severity === "info";
                      return (
                        <div key={i} style={{
                          display: "flex", alignItems: "flex-start", gap: "8px",
                          background: isInfo ? "#f0f9ff" : "#fffbeb",
                          border: `1px solid ${isInfo ? "#bae6fd" : "#fde68a"}`,
                          borderRadius: "6px", padding: "8px 12px",
                          fontSize: "0.75rem", lineHeight: 1.5,
                          color: isInfo ? "#0369a1" : "#92400e",
                        }}>
                          <span style={{ flexShrink: 0, marginTop: "1px" }}>{isInfo ? "ℹ️" : "⚠️"}</span>
                          <span>{w.message}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {!msg.isTyping && msg.domainScores && Object.keys(msg.domainScores).length > 0 && (
                  <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {Object.entries(msg.domainScores).map(([domain, s]) => {
                      const bandColor  = s.band === "green" ? "#16a34a" : s.band === "amber" ? "#d97706" : "#dc2626";
                      const bandBg     = s.band === "green" ? "#f0fdf4" : s.band === "amber" ? "#fffbeb" : "#fef2f2";
                      const bandBorder = s.band === "green" ? "rgba(34,197,94,.25)" : s.band === "amber" ? "rgba(245,158,11,.25)" : "rgba(239,68,68,.25)";
                      return (
                        <div
                          key={domain}
                          onClick={() => setSelectedScore({ domain, data: s })}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.10)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
                          style={{
                            background: bandBg, border: `1px solid ${bandBorder}`,
                            borderRadius: "8px", padding: "8px 14px", minWidth: "90px",
                            cursor: "pointer", transition: "box-shadow .15s, transform .15s",
                          }}
                        >
                          <p style={{ fontSize: "0.625rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--s500)", marginBottom: "4px" }}>
                            {domain === "overall" ? "Overall" : domain.toUpperCase()}
                          </p>
                          <p style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--s900)", lineHeight: 1 }}>
                            {s.score}<span style={{ fontSize: "0.6875rem", color: "var(--s400)", fontWeight: 400 }}>/100</span>
                          </p>
                          <div style={{ height: "3px", background: "var(--s200)", borderRadius: "100px", marginTop: "6px", overflow: "hidden" }}>
                            <div style={{ width: `${s.score}%`, height: "100%", background: bandColor, borderRadius: "100px", transition: "width .6s" }} />
                          </div>
                          <p style={{ fontSize: "0.625rem", fontWeight: 500, color: bandColor, marginTop: "4px", textTransform: "capitalize" }}>
                            {s.band} · {s.gap_count} gap{s.gap_count !== 1 ? "s" : ""}
                          </p>
                          <p style={{ fontSize: "0.5625rem", color: "var(--s400)", marginTop: "3px" }}>click for details</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {!msg.isTyping && msg.citations && msg.citations.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
                    {msg.citations.map((c, i) => (
                      <span key={i} style={{
                        fontFamily: "var(--font-m)", fontSize: "0.6875rem",
                        background: "var(--brand-50)", color: "var(--brand-700)",
                        border: "1px solid var(--brand-200)", padding: "3px 10px",
                        borderRadius: "4px",
                      }}>
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {!msg.isTyping && msg.content && (
                  <div style={{ display: "flex", gap: "8px", marginTop: "10px", alignItems: "center" }}>
                    <Link href="/reports" style={{
                      fontSize: "0.75rem", fontWeight: 500, padding: "5px 12px",
                      border: "1px solid var(--brand-200)", borderRadius: "6px",
                      background: "var(--brand-50)", color: "var(--brand-700)",
                      textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px",
                    }}>
                      📄 Generate Full Report
                    </Link>
                    {["👍", "👎"].map((emoji) => (
                      <button key={emoji} style={{
                        fontSize: "0.75rem", fontWeight: 500, padding: "5px 10px",
                        border: "1px solid var(--s200)", borderRadius: "6px",
                        background: "#fff", cursor: "pointer", color: "var(--s600)",
                        fontFamily: "var(--font-b)",
                      }}>
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{
        background: "#fff", borderTop: "1px solid var(--s200)",
        padding: "14px 28px", flexShrink: 0,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          background: "var(--s50)", border: `1.5px solid ${isLoading ? "var(--brand-300)" : "var(--s200)"}`,
          borderRadius: "10px", padding: "4px 6px 4px 16px",
          transition: "border-color .15s",
        }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            disabled={isLoading}
            placeholder={isLoading ? "Analyzing…" : "Ask about compliance…"}
            style={{
              flex: 1, border: "none", background: "transparent",
              fontFamily: "var(--font-b)", fontSize: "0.875rem",
              color: "var(--s800)", padding: "8px 0", outline: "none",
              opacity: isLoading ? 0.5 : 1,
            }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || isLoading}
            style={{
              width: "36px", height: "36px",
              background: (input.trim() && !isLoading) ? "var(--brand-600)" : "var(--s200)",
              border: "none", borderRadius: "8px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: (input.trim() && !isLoading) ? "pointer" : "default", flexShrink: 0,
              transition: "background .15s",
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" strokeWidth="2.5">
              <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Score detail modal */}
      {selectedScore && (() => {
        const { domain, data } = selectedScore;
        const bandColor  = data.band === "green" ? "#16a34a" : data.band === "amber" ? "#d97706" : "#dc2626";
        const bandBg     = data.band === "green" ? "#f0fdf4" : data.band === "amber" ? "#fffbeb" : "#fef2f2";
        const bandBorder = data.band === "green" ? "rgba(34,197,94,.25)" : data.band === "amber" ? "rgba(245,158,11,.25)" : "rgba(239,68,68,.25)";
        const sevCfg: Record<string, [string, string]> = {
          critical: ["#dc2626", "#fef2f2"],
          high:     ["#ea580c", "#fff7ed"],
          medium:   ["#d97706", "#fffbeb"],
          low:      ["#6b7280", "#f9fafb"],
        };
        return (
          <div
            onClick={() => setSelectedScore(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ background: "#fff", borderRadius: "14px", padding: "28px", width: "min(500px, 92vw)", maxHeight: "82vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.22)" }}
            >
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                <div>
                  <p style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--s400)", marginBottom: "4px" }}>Compliance Score</p>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--s900)", margin: 0 }}>
                    {domain === "overall" ? "Overall" : domain.toUpperCase()}
                  </h2>
                </div>
                <button onClick={() => setSelectedScore(null)} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--s400)", fontSize: "1.125rem", lineHeight: 1, padding: "4px 6px", borderRadius: "6px" }}>✕</button>
              </div>

              {/* Score bar */}
              <div style={{ marginBottom: "20px", padding: "16px 18px", background: bandBg, borderRadius: "10px", border: `1px solid ${bandBorder}` }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "10px" }}>
                  <span style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--s900)", lineHeight: 1 }}>{data.score}</span>
                  <span style={{ fontSize: "0.875rem", color: "var(--s400)" }}>/100</span>
                  <span style={{ marginLeft: "8px", fontSize: "0.75rem", fontWeight: 600, padding: "3px 10px", borderRadius: "100px", background: bandColor + "22", color: bandColor, textTransform: "capitalize" }}>{data.band}</span>
                </div>
                <div style={{ height: "6px", background: "rgba(0,0,0,0.08)", borderRadius: "100px", overflow: "hidden" }}>
                  <div style={{ width: `${data.score}%`, height: "100%", background: bandColor, borderRadius: "100px", transition: "width .6s" }} />
                </div>
              </div>

              {/* Breakdown chips */}
              {data.breakdown && (
                <div style={{ marginBottom: "20px" }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--s600)", marginBottom: "10px" }}>Findings Breakdown</p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {(["critical", "high", "medium", "low"] as const).map((sev) => {
                      const count = data.breakdown![sev];
                      if (!count) return null;
                      const [color, bg] = sevCfg[sev];
                      return (
                        <div key={sev} style={{ padding: "5px 12px", borderRadius: "6px", background: bg, border: `1px solid ${color}33` }}>
                          <span style={{ fontSize: "0.9375rem", fontWeight: 700, color }}>{count}</span>
                          <span style={{ fontSize: "0.6875rem", color: "var(--s500)", marginLeft: "5px", textTransform: "capitalize" }}>{sev}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Findings list */}
              {data.findings && data.findings.length > 0 ? (
                <div>
                  <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--s600)", marginBottom: "10px" }}>
                    Gaps &amp; Issues ({data.findings.length})
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {data.findings.map((f, i) => {
                      const [sevColor] = sevCfg[f.severity?.toLowerCase()] ?? ["#6b7280", "#f9fafb"];
                      return (
                        <div key={i} style={{ border: "1px solid var(--s200)", borderLeft: `3px solid ${sevColor}`, borderRadius: "8px", padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
                            <span style={{ fontSize: "0.5625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: sevColor }}>{f.severity}</span>
                            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--s800)" }}>{f.title}</span>
                          </div>
                          <p style={{ fontSize: "0.8125rem", color: "var(--s600)", lineHeight: 1.55, margin: 0 }}>{f.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p style={{ textAlign: "center", color: "var(--s400)", fontSize: "0.875rem", padding: "16px 0" }}>No specific gaps identified for this domain.</p>
              )}
            </div>
          </div>
        );
      })()}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
