"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import Link from "next/link";
import { useApiFetch } from "@/lib/api-client";
import { Badge, type Level } from "@/components/ui/Badge";
import { CitationChip } from "@/components/ui/CitationChip";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { SectionLabel } from "@/components/ui/SectionLabel";

const ENGINE_URL = process.env.NEXT_PUBLIC_ENGINE_URL || "http://localhost:8001";

/**
 * Engine node names are internal jargon. The UI shows what the step achieved;
 * the raw node name stays available as a tooltip for debugging.
 */
const NODE_LABELS: Record<string, string> = {
  router: "Understood question",
  retriever: "Searched the corpus",
  reranker: "Ranked by relevance",
  dpdp_agent: "Checked DPDP obligations",
  labour_agent: "Checked Labour Codes",
  gdpr_agent: "Checked GDPR obligations",
  stream_answer: "Drafted the answer",
  synthesis: "Attached citations",
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

interface TraceStep {
  node: string;
  label: string;
  status: "running" | "done";
}

interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  citations?: string[];
  warnings?: Warning[];
  domainScores?: Record<string, DomainScore>;
  isTyping?: boolean;
  trace?: TraceStep[];
  traceOpen?: boolean;
  elapsedMs?: number;
  vote?: "up" | "down";
  stopped?: boolean;
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
    if (typeof obj.formatted === "string") return obj.formatted;
    if (typeof obj.law === "string" && typeof obj.section === "string")
      return `${obj.law}, ${obj.section}`;
    const val = obj.text || obj.title || obj.citation || obj.reference || obj.name;
    if (typeof val === "string") return val;
  }
  return ""; // discard unreadable shapes rather than showing raw JSON
}

function upsertTrace(trace: TraceStep[], node: string, label: string, status: "running" | "done") {
  const idx = trace.findIndex((s) => s.node === node);
  if (idx >= 0) {
    const updated = [...trace];
    updated[idx] = { node, label, status };
    return updated;
  }
  return [...trace, { node, label, status }];
}

/** Engine bands map onto the severity tokens. */
function bandLevel(band: "green" | "amber" | "red"): Level {
  if (band === "green") return "ok";
  if (band === "amber") return "med";
  return "high";
}

function severityLevel(sev: string | undefined): Level {
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

export default function ChatPage() {
  const apiFetch = useApiFetch();
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [composerFocused, setComposerFocused] = useState(false);
  const [selectedScore, setSelectedScore] = useState<{ domain: string; data: DomainScore } | null>(
    null,
  );
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    apiFetch<TenantInfo>("/tenants/me")
      .then(setTenant)
      .catch(() => null);
  }, [apiFetch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setSelectedScore(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      const tag = (document.activeElement && document.activeElement.tagName) || "";
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        document.getElementById("composer-input")?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /** Abort the in-flight stream, keeping whatever text already arrived. */
  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const send = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || isLoading) return;

      setInput("");
      setIsLoading(true);

      const agentId = `a-${Date.now()}`;
      const startedAt = Date.now();
      const controller = new AbortController();
      abortRef.current = controller;

      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, role: "user", content: q },
        { id: agentId, role: "agent", content: "", isTyping: true, trace: [] },
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
          signal: controller.signal,
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
                      : m,
                  ),
                );
              } catch {}
            } else if (eventType === "trace" && data) {
              try {
                const { step, status } = JSON.parse(data) as {
                  step: string;
                  status: "running" | "done";
                };
                const label = NODE_LABELS[step] || step;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === agentId
                      ? { ...m, trace: upsertTrace(m.trace ?? [], step, label, status) }
                      : m,
                  ),
                );
              } catch {}
            } else if (eventType === "warning" && data) {
              try {
                const w = JSON.parse(data) as Warning;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === agentId ? { ...m, warnings: [...(m.warnings ?? []), w] } : m,
                  ),
                );
              } catch {}
            } else if (eventType === "error" && data) {
              try {
                const { message: errMsg } = JSON.parse(data) as { message: string; code?: string };
                setMessages((prev) =>
                  prev.map((m) => (m.id === agentId ? { ...m, content: errMsg, isTyping: false } : m)),
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

                // Persist latest scores so the dashboard can read them
                if (domainScores && tenant?.id) {
                  try {
                    localStorage.setItem(
                      `rc_scores_${tenant.id}`,
                      JSON.stringify({
                        scores: domainScores,
                        updatedAt: new Date().toISOString(),
                      }),
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
                          elapsedMs: Date.now() - startedAt,
                        }
                      : m,
                  ),
                );
              } catch {}
            }
          }
        }
      } catch (err) {
        const aborted = err instanceof DOMException && err.name === "AbortError";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === agentId
              ? aborted
                ? {
                    ...m,
                    isTyping: false,
                    stopped: true,
                    elapsedMs: Date.now() - startedAt,
                    content: m.content || "Stopped before an answer was drafted.",
                  }
                : {
                    ...m,
                    content: `Error: ${
                      err instanceof Error
                        ? err.message
                        : "Could not reach the engine. Is it running?"
                    }`,
                    isTyping: false,
                  }
              : m,
          ),
        );
      } finally {
        abortRef.current = null;
        setIsLoading(false);
      }
    },
    [tenant, isLoading],
  );

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  function toggleTrace(id: string) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, traceOpen: !m.traceOpen } : m)));
  }

  function vote(id: string, dir: "up" | "down") {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, vote: m.vote === dir ? undefined : dir } : m)),
    );
  }

  const hasMessages = messages.length > 0;

  return (
    <div
      style={{
        margin: "-24px clamp(-40px, -4vw, -16px)",
        height: "calc(100vh - 56px)",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div
          style={{
            maxWidth: 780,
            margin: "0 auto",
            padding: "32px clamp(14px, 4vw, 32px) 24px",
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          {!hasMessages && (
            <div>
              <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 12 }}>
                {tenant ? `Suggested questions for ${tenant.name}` : "Suggested questions"}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {SUGGESTED.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => send(q)}
                    className="rc-suggest-chip"
                    style={{
                      fontSize: 12.5,
                      color: "var(--muted)",
                      padding: "6px 14px",
                      minHeight: 36,
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-pill)",
                      cursor: "pointer",
                      background: "var(--surface)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) =>
            msg.role === "user" ? (
              <div
                key={msg.id}
                style={{
                  alignSelf: "flex-end",
                  maxWidth: "70%",
                  background: "var(--accent-tint)",
                  borderRadius: "8px 14px 4px 14px",
                  padding: "12px 18px",
                  fontSize: 14,
                  color: "var(--ink)",
                }}
              >
                {msg.content}
              </div>
            ) : (
              <div key={msg.id} style={{ display: "flex", gap: 14 }}>
                <div
                  style={{
                    flexShrink: 0,
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    background: "var(--accent)",
                    color: "var(--on-accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  P
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Agent trace — one line while working, collapsible once done. */}
                  {msg.trace && msg.trace.length > 0 && (
                    <div
                      style={{
                        border: "1px solid var(--border)",
                        borderRadius: 9,
                        background: "var(--chip-bg)",
                        overflow: "hidden",
                        marginBottom: 14,
                      }}
                    >
                      {msg.isTyping ? (
                        (() => {
                          const running = msg.trace.find((s) => s.status === "running");
                          const doneCount = msg.trace.filter((s) => s.status === "done").length;
                          return (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "9px 14px",
                                fontSize: 12,
                                color: "var(--muted)",
                              }}
                            >
                              <span
                                aria-hidden="true"
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  background: "var(--accent)",
                                  flexShrink: 0,
                                  animation: "rc-pulse 1.2s ease-in-out infinite",
                                }}
                              />
                              <span style={{ fontWeight: 500 }}>
                                {running
                                  ? `Working: step ${doneCount + 1} of ${msg.trace.length} · ${running.label}…`
                                  : "Working…"}
                              </span>
                              <span style={{ flex: 1 }} />
                              <button
                                type="button"
                                onClick={stopStreaming}
                                className="rc-stop-btn"
                                style={{
                                  fontSize: 11.5,
                                  fontWeight: 500,
                                  color: "var(--muted)",
                                  background: "transparent",
                                  border: "1px solid var(--border)",
                                  borderRadius: "var(--radius-chip)",
                                  padding: "3px 10px",
                                  cursor: "pointer",
                                }}
                              >
                                Stop
                              </button>
                            </div>
                          );
                        })()
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => toggleTrace(msg.id)}
                            aria-expanded={!!msg.traceOpen}
                            className="rc-trace-toggle"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "9px 14px",
                              cursor: "pointer",
                              fontSize: 12,
                              color: "var(--muted)",
                              width: "100%",
                              background: "transparent",
                              border: "none",
                              textAlign: "left",
                              fontFamily: "var(--font-sans)",
                            }}
                          >
                            <span
                              aria-hidden="true"
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: msg.stopped ? "var(--med)" : "var(--ok)",
                                flexShrink: 0,
                              }}
                            />
                            <span style={{ fontWeight: 500, color: "var(--muted)" }}>
                              {msg.stopped ? "Stopped after" : "Answered in"} {msg.trace.length}{" "}
                              step{msg.trace.length !== 1 ? "s" : ""}
                              {msg.elapsedMs ? ` · ${(msg.elapsedMs / 1000).toFixed(1)}s` : ""}
                            </span>
                            <span style={{ flex: 1 }} />
                            <span aria-hidden="true" style={{ fontSize: 11 }}>
                              {msg.traceOpen ? "▴" : "▾"}
                            </span>
                          </button>

                          {msg.traceOpen && (
                            <div
                              style={{
                                borderTop: "1px solid var(--border-soft)",
                                padding: "12px 14px",
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                              }}
                            >
                              {msg.trace.map((step) => (
                                <div
                                  key={step.node}
                                  title={step.node}
                                  style={{
                                    display: "flex",
                                    alignItems: "baseline",
                                    gap: 10,
                                    fontSize: 12.5,
                                  }}
                                >
                                  <span
                                    aria-hidden="true"
                                    style={{ color: "var(--ok)", fontWeight: 600 }}
                                  >
                                    ✓
                                  </span>
                                  <span style={{ fontWeight: 500, color: "var(--ink)" }}>
                                    {step.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Answer */}
                  {msg.isTyping && !msg.content ? (
                    <div style={{ display: "flex", gap: 4, padding: "8px 0" }}>
                      {[0, 0.2, 0.4].map((delay, i) => (
                        <div
                          key={i}
                          style={{
                            width: 6,
                            height: 6,
                            background: "var(--faint)",
                            borderRadius: "50%",
                            animation: "rc-bounce 1.4s infinite",
                            animationDelay: `${delay}s`,
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 14, lineHeight: 1.65, color: "var(--ink)" }}>
                      {renderContent(msg.content)}
                      {msg.isTyping && (
                        <span
                          aria-hidden="true"
                          style={{
                            display: "inline-block",
                            width: 8,
                            height: 15,
                            background: "var(--accent)",
                            marginLeft: 3,
                            verticalAlign: "text-bottom",
                            animation: "rc-blink 1s steps(2) infinite",
                          }}
                        />
                      )}
                    </div>
                  )}

                  {/* Warnings — amber notes with recovery copy, never red. */}
                  {!msg.isTyping && msg.warnings && msg.warnings.length > 0 && (
                    <div
                      style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}
                    >
                      {msg.warnings.map((w, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 10,
                            background: "var(--med-bg)",
                            borderRadius: 9,
                            padding: "11px 14px",
                          }}
                        >
                          <span
                            style={{
                              flexShrink: 0,
                              fontSize: 10.5,
                              fontWeight: 600,
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              color: "var(--med)",
                              marginTop: 1,
                            }}
                          >
                            Note
                          </span>
                          <span style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--muted)" }}>
                            {w.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Domain scores — real buttons, open the detail dialog. */}
                  {!msg.isTyping &&
                    msg.domainScores &&
                    Object.keys(msg.domainScores).length > 0 && (
                      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {Object.entries(msg.domainScores).map(([domain, sc]) => {
                          const level = bandLevel(sc.band);
                          return (
                            <button
                              key={domain}
                              type="button"
                              onClick={() => setSelectedScore({ domain, data: sc })}
                              aria-haspopup="dialog"
                              className="rc-score-card"
                              style={{
                                background: "var(--surface)",
                                border: "1px solid var(--border)",
                                borderRadius: "var(--radius-panel)",
                                padding: "10px 14px",
                                minWidth: 116,
                                cursor: "pointer",
                                textAlign: "left",
                                fontFamily: "var(--font-sans)",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.06em",
                                  color: "var(--faint)",
                                  marginBottom: 6,
                                }}
                              >
                                {domain === "overall" ? "Overall" : domain.toUpperCase()}
                              </div>
                              <div
                                style={{
                                  fontSize: 20,
                                  fontWeight: 600,
                                  color: `var(--${level})`,
                                  lineHeight: 1,
                                  fontVariantNumeric: "tabular-nums",
                                  marginBottom: 8,
                                }}
                              >
                                {sc.score}
                                <span style={{ fontSize: 11, color: "var(--faint)", fontWeight: 400 }}>
                                  /100
                                </span>
                              </div>
                              <ScoreBar score={sc.score} height={4} />
                              <div style={{ marginTop: 8 }}>
                                <Badge level={level}>
                                  {sc.gap_count} gap{sc.gap_count !== 1 ? "s" : ""}
                                </Badge>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                  {/* Citations */}
                  {!msg.isTyping && msg.citations && msg.citations.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
                      {msg.citations.map((c, i) => (
                        <CitationChip key={i} href={`/compare?citation=${encodeURIComponent(c)}`}>
                          {c}
                        </CitationChip>
                      ))}
                    </div>
                  )}

                  {/* Footer actions */}
                  {!msg.isTyping && msg.content && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        marginTop: 14,
                        paddingTop: 12,
                        borderTop: "1px solid var(--border-soft)",
                      }}
                    >
                      <Link href="/reports" style={{ fontSize: 12.5, fontWeight: 500 }}>
                        Generate full report →
                      </Link>
                      <span style={{ flex: 1 }} />
                      <button
                        type="button"
                        onClick={() => vote(msg.id, "up")}
                        aria-pressed={msg.vote === "up"}
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: 12,
                          fontWeight: 500,
                          color: msg.vote === "up" ? "var(--accent-ink)" : "var(--faint)",
                          background: "none",
                          border: "none",
                          padding: "2px 4px",
                          cursor: "pointer",
                        }}
                      >
                        Helpful
                      </button>
                      <button
                        type="button"
                        onClick={() => vote(msg.id, "down")}
                        aria-pressed={msg.vote === "down"}
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: 12,
                          fontWeight: 500,
                          color: msg.vote === "down" ? "var(--accent-ink)" : "var(--faint)",
                          background: "none",
                          border: "none",
                          padding: "2px 4px",
                          cursor: "pointer",
                        }}
                      >
                        Not helpful
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ),
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Composer */}
      <div
        style={{
          flexShrink: 0,
          borderTop: "1px solid var(--border)",
          background: "var(--side)",
          padding: "16px clamp(14px, 4vw, 32px) 18px",
        }}
      >
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              background: "var(--surface)",
              border: `1px solid ${composerFocused ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 12,
              padding: "6px 6px 6px 18px",
              transition: "border-color .15s",
            }}
          >
            <input
              id="composer-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              onFocus={() => setComposerFocused(true)}
              onBlur={() => setComposerFocused(false)}
              disabled={isLoading}
              placeholder={
                isLoading
                  ? "Analyzing…"
                  : "Ask about compliance, e.g. “Do we need parental consent for trials?”"
              }
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                color: "var(--ink)",
                background: "transparent",
                padding: "8px 0",
                opacity: isLoading ? 0.5 : 1,
              }}
            />
            {isLoading ? (
              <button
                type="button"
                onClick={stopStreaming}
                className="rc-btn rc-btn-secondary"
                style={{
                  flexShrink: 0,
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--ink)",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-control)",
                  padding: "9px 18px",
                  minHeight: 36,
                  cursor: "pointer",
                }}
              >
                Stop
              </button>
            ) : (
              <button
                type="button"
                onClick={() => send(input)}
                disabled={!input.trim()}
                className={input.trim() ? "rc-btn rc-btn-primary" : undefined}
                style={{
                  flexShrink: 0,
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                  fontWeight: 500,
                  color: input.trim() ? "var(--on-accent)" : "var(--faint)",
                  background: input.trim() ? "var(--accent)" : "var(--row)",
                  border: `1px solid ${input.trim() ? "var(--accent)" : "var(--row)"}`,
                  borderRadius: "var(--radius-control)",
                  padding: "9px 18px",
                  minHeight: 36,
                  cursor: input.trim() ? "pointer" : "default",
                }}
              >
                Send
              </button>
            )}
          </div>
          <div
            style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 8, textAlign: "center" }}
          >
            Press{" "}
            <span
              style={{
                fontFamily: "var(--font-mono)",
                border: "1px solid var(--border)",
                borderRadius: 4,
                padding: "0 4px",
              }}
            >
              /
            </span>{" "}
            to focus the composer · Answers cite exact sections; verify before acting.
          </div>
        </div>
      </div>

      {/* Score detail dialog */}
      {selectedScore &&
        (() => {
          const { domain, data } = selectedScore;
          const level = bandLevel(data.band);
          return (
            <div
              onClick={() => setSelectedScore(null)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15,18,24,0.45)",
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-label={`${domain} compliance score`}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-panel)",
                  padding: 28,
                  width: "min(500px, 92vw)",
                  maxHeight: "82vh",
                  overflowY: "auto",
                  boxShadow: "0 24px 64px rgba(15,18,24,0.28)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <SectionLabel>Compliance score</SectionLabel>
                    <h2
                      style={{
                        fontSize: 20,
                        fontWeight: 600,
                        color: "var(--ink)",
                        margin: "6px 0 0",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {domain === "overall" ? "Overall" : domain.toUpperCase()}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedScore(null)}
                    aria-label="Close"
                    style={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      color: "var(--faint)",
                      fontSize: 18,
                      lineHeight: 1,
                      padding: "4px 6px",
                      borderRadius: "var(--radius-chip)",
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div
                  style={{
                    marginBottom: 20,
                    padding: "16px 18px",
                    background: "var(--surface)",
                    borderRadius: "var(--radius-panel)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 40,
                        fontWeight: 600,
                        color: `var(--${level})`,
                        lineHeight: 1,
                        fontVariantNumeric: "tabular-nums",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {data.score}
                    </span>
                    <span style={{ fontSize: 14, color: "var(--faint)" }}>/100</span>
                    <span style={{ marginLeft: 4 }}>
                      <Badge level={level} />
                    </span>
                  </div>
                  <ScoreBar score={data.score} height={6} />
                </div>

                {data.breakdown && (
                  <div style={{ marginBottom: 20 }}>
                    <SectionLabel>Findings breakdown</SectionLabel>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                      {(["critical", "high", "medium", "low"] as const).map((sev) => {
                        const count = data.breakdown![sev];
                        if (!count) return null;
                        return (
                          <Badge key={sev} level={severityLevel(sev)}>
                            {count} {sev}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                {data.findings && data.findings.length > 0 ? (
                  <div>
                    <SectionLabel>Gaps &amp; issues ({data.findings.length})</SectionLabel>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                        marginTop: 10,
                      }}
                    >
                      {data.findings.map((f, i) => (
                        <div
                          key={i}
                          style={{
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-panel)",
                            padding: "12px 14px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              marginBottom: 6,
                            }}
                          >
                            <Badge level={severityLevel(f.severity)} />
                            <span
                              style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}
                            >
                              {f.title}
                            </span>
                          </div>
                          <p
                            style={{
                              fontSize: 13,
                              color: "var(--muted)",
                              lineHeight: 1.55,
                              margin: 0,
                            }}
                          >
                            {f.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p
                    style={{
                      textAlign: "center",
                      color: "var(--faint)",
                      fontSize: 13,
                      padding: "16px 0",
                    }}
                  >
                    No specific gaps identified for this domain.
                  </p>
                )}
              </div>
            </div>
          );
        })()}
    </div>
  );
}
