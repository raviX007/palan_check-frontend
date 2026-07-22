"use client";

import { useState, useRef, useEffect, useCallback, DragEvent } from "react";
import { useAuth } from "@clerk/nextjs";
import { useApiFetch } from "@/lib/api-client";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const MAX_MB = 10;

type DocStatus = "processing" | "embedded" | "failed";
type Jurisdiction = "in" | "eu";
type Tab = "corpus" | "company";

interface CompanyDoc {
  id: string;
  name: string;
  pages: number | null;
  sections: number | null;
  status: DocStatus;
  uploadedAt: string;
  /** Set while the POST is in flight — we have no byte-level progress. */
  uploading?: boolean;
  error?: string;
}

interface RegulatoryDoc {
  id: string;
  name: string;
  pages: number | null;
  sections: number | null;
  status: DocStatus;
  jurisdiction: Jurisdiction;
  uploading?: boolean;
  error?: string;
}

interface ApiDoc {
  id: string;
  filename: string;
  status: string;
  page_count: number | null;
  section_count: number | null;
  jurisdiction: string | null;
  created_at: string;
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
}

function toStatus(s: string): DocStatus {
  if (s === "embedded") return "embedded";
  if (s === "failed") return "failed";
  return "processing"; // uploading | processing | extracted → still in progress
}

function toCompanyDoc(d: ApiDoc): CompanyDoc {
  return {
    id: d.id,
    name: d.filename,
    pages: d.page_count,
    sections: d.section_count,
    status: toStatus(d.status),
    uploadedAt: relativeTime(d.created_at),
  };
}

function toRegulatoryDoc(d: ApiDoc): RegulatoryDoc {
  return {
    id: d.id,
    name: d.filename,
    pages: d.page_count,
    sections: d.section_count,
    status: toStatus(d.status),
    jurisdiction: (d.jurisdiction ?? "in") as Jurisdiction,
  };
}

const ACRONYMS = new Set([
  "dpdp", "gdpr", "eu", "rbi", "it", "osh", "dsa", "dora", "nis2", "crr",
  "mifid", "edpb", "sccs", "cert", "in", "ai", "hr", "pwc", "ey", "spdi",
]);

/**
 * Rows show a readable title over the raw filename. This is a presentation
 * transform only — the exact filename is always displayed beneath it.
 */
function humanTitle(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "").replace(/^\d+[-_\s]*/, "");
  const words = base.split(/[-_\s]+/).filter(Boolean);
  if (words.length === 0) return filename;
  return words
    .map((w) =>
      ACRONYMS.has(w.toLowerCase())
        ? w.toUpperCase()
        : w.charAt(0).toUpperCase() + w.slice(1),
    )
    .join(" ");
}

function contentsLabel(pages: number | null, sections: number | null): string {
  const parts: string[] = [];
  if (pages != null) parts.push(`${pages} page${pages === 1 ? "" : "s"}`);
  if (sections != null) parts.push(`${sections} section${sections === 1 ? "" : "s"}`);
  return parts.length ? parts.join(" · ") : "—";
}

function StatusCell({ status }: { status: DocStatus }) {
  if (status === "embedded") return <Badge level="ok">Ready</Badge>;
  if (status === "failed") return <Badge level="high">Failed</Badge>;
  return <Badge level="low">Processing</Badge>;
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
  padding: "14px 24px",
  borderBottom: "1px solid var(--border-soft)",
};

const TABLE_SHELL: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-card)",
  overflow: "hidden",
};

export default function DocumentsPage() {
  const apiFetch = useApiFetch();
  const { getToken } = useAuth();

  const [tab, setTab] = useState<Tab>("corpus");

  const [regulatoryDocs, setRegulatoryDocs] = useState<RegulatoryDoc[]>([]);
  const [regJurisdiction, setRegJurisdiction] = useState<Jurisdiction>("in");
  const regFileRef = useRef<HTMLInputElement>(null);

  const [docs, setDocs] = useState<CompanyDoc[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  /** Retained so a failed upload can be retried without re-picking the file. */
  const pendingFiles = useRef<Map<string, File>>(new Map());

  const fetchCompanyDocs = useCallback(() => {
    apiFetch<ApiDoc[]>("/documents/?doc_type=company")
      .then((data) => setDocs(data.map(toCompanyDoc)))
      .catch(() => null);
  }, [apiFetch]);

  const fetchRegulatoryDocs = useCallback(() => {
    apiFetch<ApiDoc[]>(`/documents/?doc_type=regulatory&jurisdiction=${regJurisdiction}`)
      .then((data) => setRegulatoryDocs(data.map(toRegulatoryDoc)))
      .catch(() => null);
  }, [apiFetch, regJurisdiction]);

  useEffect(() => {
    fetchCompanyDocs();
  }, [fetchCompanyDocs]);
  useEffect(() => {
    fetchRegulatoryDocs();
  }, [fetchRegulatoryDocs]);

  // Poll every 4s while any document is still processing
  useEffect(() => {
    const hasPending = docs.some((d) => d.status === "processing" && !d.uploading);
    if (!hasPending) return;
    const id = setInterval(fetchCompanyDocs, 4000);
    return () => clearInterval(id);
  }, [docs, fetchCompanyDocs]);

  useEffect(() => {
    const hasPending = regulatoryDocs.some((d) => d.status === "processing" && !d.uploading);
    if (!hasPending) return;
    const id = setInterval(fetchRegulatoryDocs, 4000);
    return () => clearInterval(id);
  }, [regulatoryDocs, fetchRegulatoryDocs]);

  async function openDocument(docId: string) {
    const token = await getToken();
    const res = await fetch(`${API_URL}/api/v1/documents/${docId}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  /** Company documents are tenant-owned, so they can be deleted.
   *  The regulatory corpus is shared and read-only — no delete path here. */
  async function deleteDoc(id: string) {
    try {
      await apiFetch(`/documents/${id}`, { method: "DELETE" });
      setDocs((prev) => prev.filter((d) => d.id !== id));
    } catch {
      alert("Failed to delete document. Please try again.");
    }
  }

  function rejectReason(file: File): string | null {
    if (file.size > MAX_MB * 1024 * 1024) {
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      return `Upload failed: the file is ${mb} MB, over the ${MAX_MB} MB limit. Compress or split it, then retry.`;
    }
    if (!/\.(pdf|docx)$/i.test(file.name)) {
      return "Upload failed: only PDF and DOCX files are supported. Convert the file, then retry.";
    }
    return null;
  }

  const uploadCompany = useCallback(
    async (file: File, tempId: string) => {
      pendingFiles.current.set(tempId, file);

      const reason = rejectReason(file);
      if (reason) {
        setDocs((prev) =>
          prev.map((d) =>
            d.id === tempId ? { ...d, status: "failed", uploading: false, error: reason } : d,
          ),
        );
        return;
      }

      try {
        const form = new FormData();
        form.append("file", file);
        form.append("doc_type", "company");
        const created = await apiFetch<ApiDoc>("/documents/upload", {
          method: "POST",
          body: form,
          headers: {},
        });
        pendingFiles.current.delete(tempId);
        setDocs((prev) => prev.map((d) => (d.id === tempId ? toCompanyDoc(created) : d)));
      } catch (err) {
        setDocs((prev) =>
          prev.map((d) =>
            d.id === tempId
              ? {
                  ...d,
                  status: "failed",
                  uploading: false,
                  error: `Upload failed: ${
                    err instanceof Error ? err.message : "the server rejected the file"
                  }. Check the file, then retry.`,
                }
              : d,
          ),
        );
      }
    },
    [apiFetch],
  );

  const uploadRegulatory = useCallback(
    async (file: File, tempId: string) => {
      pendingFiles.current.set(tempId, file);

      const reason = rejectReason(file);
      if (reason) {
        setRegulatoryDocs((prev) =>
          prev.map((d) =>
            d.id === tempId ? { ...d, status: "failed", uploading: false, error: reason } : d,
          ),
        );
        return;
      }

      try {
        const form = new FormData();
        form.append("file", file);
        form.append("doc_type", "regulatory");
        form.append("jurisdiction", regJurisdiction);
        const created = await apiFetch<ApiDoc>("/documents/upload", {
          method: "POST",
          body: form,
          headers: {},
        });
        pendingFiles.current.delete(tempId);
        setRegulatoryDocs((prev) =>
          prev.map((d) => (d.id === tempId ? toRegulatoryDoc(created) : d)),
        );
      } catch (err) {
        setRegulatoryDocs((prev) =>
          prev.map((d) =>
            d.id === tempId
              ? {
                  ...d,
                  status: "failed",
                  uploading: false,
                  error: `Upload failed: ${
                    err instanceof Error ? err.message : "the server rejected the file"
                  }. Check the file, then retry.`,
                }
              : d,
          ),
        );
      }
    },
    [apiFetch, regJurisdiction],
  );

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      const tempId = `temp-${Date.now()}-${file.name}`;
      setDocs((prev) => [
        {
          id: tempId,
          name: file.name,
          pages: null,
          sections: null,
          status: "processing",
          uploadedAt: "Just now",
          uploading: true,
        },
        ...prev,
      ]);
      await uploadCompany(file, tempId);
    }
  }

  async function addRegulatoryFiles(files: FileList | null) {
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      const tempId = `temp-reg-${Date.now()}-${file.name}`;
      setRegulatoryDocs((prev) => [
        {
          id: tempId,
          name: file.name,
          pages: null,
          sections: null,
          status: "processing",
          jurisdiction: regJurisdiction,
          uploading: true,
        },
        ...prev,
      ]);
      await uploadRegulatory(file, tempId);
    }
  }

  function retry(id: string, kind: Tab) {
    const file = pendingFiles.current.get(id);
    if (!file) return;
    if (kind === "company") {
      setDocs((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, status: "processing", uploading: true, error: undefined } : d,
        ),
      );
      uploadCompany(file, id);
    } else {
      setRegulatoryDocs((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, status: "processing", uploading: true, error: undefined } : d,
        ),
      );
      uploadRegulatory(file, id);
    }
  }

  function removeFailed(id: string, kind: Tab) {
    pendingFiles.current.delete(id);
    if (kind === "company") setDocs((prev) => prev.filter((d) => d.id !== id));
    else setRegulatoryDocs((prev) => prev.filter((d) => d.id !== id));
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  const displayedRegDocs = regulatoryDocs.filter((d) => d.jurisdiction === regJurisdiction);
  const corpusActive = tab === "corpus";

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "10px 16px",
    fontSize: 13.5,
    fontWeight: active ? 600 : 500,
    color: active ? "var(--ink)" : "var(--muted)",
    background: "transparent",
    border: "none",
    borderBottom: `2px solid ${active ? "var(--accent)" : "transparent"}`,
    marginBottom: -1,
    cursor: "pointer",
    minHeight: 36,
  });

  const segStyle = (active: boolean): React.CSSProperties => ({
    padding: "7px 16px",
    fontSize: 12.5,
    fontWeight: 500,
    cursor: "pointer",
    color: active ? "var(--on-accent)" : "var(--muted)",
    background: active ? "var(--accent)" : "transparent",
    border: "none",
    minHeight: 36,
  });

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", paddingTop: 16 }}>
      {/* Header — one primary CTA, contextual to the active tab. */}
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
            Documents
          </h1>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            The regulatory corpus your answers cite, and your own policies under review.
          </div>
        </div>

        <button
          type="button"
          onClick={() => (corpusActive ? regFileRef.current : fileRef.current)?.click()}
          className="rc-btn rc-btn-primary"
          style={{
            flexShrink: 0,
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--on-accent)",
            background: "var(--accent)",
            border: "1px solid var(--accent)",
            borderRadius: "var(--radius-control)",
            padding: "10px 18px",
            minHeight: 36,
            cursor: "pointer",
          }}
        >
          {corpusActive ? "Upload regulation" : "Upload document"}
        </button>
      </div>

      <div
        role="tablist"
        aria-label="Document collections"
        style={{
          marginTop: 28,
          display: "flex",
          alignItems: "center",
          gap: 4,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={corpusActive}
          onClick={() => setTab("corpus")}
          style={tabStyle(corpusActive)}
        >
          Regulatory corpus
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!corpusActive}
          onClick={() => setTab("company")}
          style={tabStyle(!corpusActive)}
        >
          Company documents
        </button>
      </div>

      <input
        ref={regFileRef}
        type="file"
        multiple
        accept=".pdf,.docx"
        style={{ display: "none" }}
        onChange={(e) => {
          setTab("corpus");
          addRegulatoryFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={fileRef}
        type="file"
        multiple
        accept=".pdf,.docx"
        style={{ display: "none" }}
        onChange={(e) => {
          setTab("company");
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {corpusActive ? (
        <div style={{ marginTop: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div
              style={{
                display: "inline-flex",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-control)",
                overflow: "hidden",
                background: "var(--chip-bg)",
              }}
            >
              <button
                type="button"
                aria-pressed={regJurisdiction === "in"}
                onClick={() => setRegJurisdiction("in")}
                style={segStyle(regJurisdiction === "in")}
              >
                India
              </button>
              <button
                type="button"
                aria-pressed={regJurisdiction === "eu"}
                onClick={() => setRegJurisdiction("eu")}
                style={{
                  ...segStyle(regJurisdiction === "eu"),
                  borderLeft: "1px solid var(--border)",
                }}
              >
                EU
              </button>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--faint)" }}>
              Shared across all tenants · read-only
            </div>
          </div>

          {displayedRegDocs.length === 0 ? (
            <EmptyState title="No regulatory documents yet">
              The {regJurisdiction === "in" ? "India" : "EU"} corpus is empty. Upload a statute or
              guidance PDF and it becomes citable across every tenant.
            </EmptyState>
          ) : (
            <div style={TABLE_SHELL}>
              <div style={HEADER_ROW}>
                <span style={{ flex: 1 }}>Document</span>
                <span style={{ width: 150 }}>Contents</span>
                <span style={{ width: 100 }}>Status</span>
              </div>

              {displayedRegDocs.map((doc, i, all) => {
                const isTemp = doc.id.startsWith("temp-");
                const rowStyle = {
                  ...DATA_ROW,
                  borderBottom: i < all.length - 1 ? DATA_ROW.borderBottom : "none",
                };

                if (doc.error) {
                  return (
                    <div key={doc.id} style={{ ...rowStyle, flexWrap: "wrap" }}>
                      <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink)" }}>
                          {humanTitle(doc.name)}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--high)",
                            marginTop: 3,
                            lineHeight: 1.5,
                          }}
                        >
                          {doc.error}
                        </div>
                      </div>
                      <div style={{ width: 220, display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => retry(doc.id, "corpus")}
                          className="rc-btn-secondary"
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: "var(--ink)",
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-item)",
                            padding: "6px 12px",
                            cursor: "pointer",
                          }}
                        >
                          Retry
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFailed(doc.id, "corpus")}
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: "var(--high)",
                            background: "transparent",
                            border: "none",
                            padding: "6px 8px",
                            cursor: "pointer",
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={doc.id} className="rc-doc-row" style={rowStyle}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {isTemp ? (
                        <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink)" }}>
                          {humanTitle(doc.name)}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openDocument(doc.id)}
                          className="rc-doc-title"
                          style={{
                            fontSize: 13.5,
                            fontWeight: 500,
                            color: "var(--ink)",
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            textAlign: "left",
                            fontFamily: "var(--font-sans)",
                          }}
                        >
                          {humanTitle(doc.name)}
                        </button>
                      )}
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color: "var(--faint)",
                          marginTop: 3,
                        }}
                      >
                        {doc.name}
                      </div>
                    </div>
                    <div style={{ width: 150, fontSize: 12.5, color: "var(--muted)" }}>
                      {doc.uploading ? "Uploading…" : contentsLabel(doc.pages, doc.sections)}
                    </div>
                    <div style={{ width: 100 }}>
                      <StatusCell status={doc.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div style={{ marginTop: 22 }}>
          {docs.length === 0 ? (
            <EmptyState
              title="No documents yet"
              action={
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="rc-btn rc-btn-primary"
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--on-accent)",
                    background: "var(--accent)",
                    border: "1px solid var(--accent)",
                    borderRadius: "var(--radius-control)",
                    padding: "10px 18px",
                    minHeight: 36,
                    cursor: "pointer",
                  }}
                >
                  Browse files
                </button>
              }
            >
              Drag &amp; drop your privacy policy, employment contracts, or notices here. They stay
              private to your company · PDF or DOCX · max {MAX_MB} MB.
            </EmptyState>
          ) : (
            <>
              <div style={TABLE_SHELL}>
                <div style={HEADER_ROW}>
                  <span style={{ flex: 1 }}>Document</span>
                  <span style={{ width: 150 }}>Contents</span>
                  <span style={{ width: 100 }}>Status</span>
                  <span style={{ width: 70 }} />
                </div>

                {docs.map((doc, i, all) => {
                  const isTemp = doc.id.startsWith("temp-");
                  const rowStyle = {
                    ...DATA_ROW,
                    borderBottom: i < all.length - 1 ? DATA_ROW.borderBottom : "none",
                  };

                  if (doc.error) {
                    return (
                      <div key={doc.id} style={{ ...rowStyle, flexWrap: "wrap" }}>
                        <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink)" }}>
                            {humanTitle(doc.name)}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--high)",
                              marginTop: 3,
                              lineHeight: 1.5,
                            }}
                          >
                            {doc.error}
                          </div>
                        </div>
                        <div style={{ width: 220, display: "flex", gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => retry(doc.id, "company")}
                            className="rc-btn-secondary"
                            style={{
                              fontSize: 12,
                              fontWeight: 500,
                              color: "var(--ink)",
                              background: "var(--surface)",
                              border: "1px solid var(--border)",
                              borderRadius: "var(--radius-item)",
                              padding: "6px 12px",
                              cursor: "pointer",
                            }}
                          >
                            Retry
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFailed(doc.id, "company")}
                            style={{
                              fontSize: 12,
                              fontWeight: 500,
                              color: "var(--high)",
                              background: "transparent",
                              border: "none",
                              padding: "6px 8px",
                              cursor: "pointer",
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={doc.id} className="rc-doc-row" style={rowStyle}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {isTemp ? (
                          <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink)" }}>
                            {humanTitle(doc.name)}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openDocument(doc.id)}
                            className="rc-doc-title"
                            style={{
                              fontSize: 13.5,
                              fontWeight: 500,
                              color: "var(--ink)",
                              background: "none",
                              border: "none",
                              padding: 0,
                              cursor: "pointer",
                              textAlign: "left",
                              fontFamily: "var(--font-sans)",
                            }}
                          >
                            {humanTitle(doc.name)}
                          </button>
                        )}
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            color: "var(--faint)",
                            marginTop: 3,
                          }}
                        >
                          {doc.name} · {doc.uploadedAt}
                        </div>
                      </div>
                      <div style={{ width: 150, fontSize: 12.5, color: "var(--muted)" }}>
                        {doc.uploading ? "Uploading…" : contentsLabel(doc.pages, doc.sections)}
                      </div>
                      <div style={{ width: 100 }}>
                        <StatusCell status={doc.status} />
                      </div>
                      <div style={{ width: 70 }}>
                        <button
                          type="button"
                          onClick={() => deleteDoc(doc.id)}
                          className="rc-delete-btn"
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: "var(--muted)",
                            background: "transparent",
                            border: "none",
                            padding: "6px 8px",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                style={{
                  marginTop: 16,
                  border: `1px dashed ${dragging ? "var(--accent)" : "var(--faint)"}`,
                  background: dragging ? "var(--accent-tint)" : "transparent",
                  borderRadius: "var(--radius-card)",
                  padding: "18px 24px",
                  textAlign: "center",
                  transition: "border-color .15s, background .15s",
                }}
              >
                <span style={{ fontSize: 12.5, color: "var(--muted)" }}>
                  Drag &amp; drop more files here or{" "}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      font: "inherit",
                      color: "var(--accent-ink)",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    browse
                  </button>{" "}
                  · PDF or DOCX · max {MAX_MB} MB · private to your company
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
