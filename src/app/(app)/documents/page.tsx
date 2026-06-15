"use client";

import { useState, useRef, useEffect, useCallback, DragEvent } from "react";
import { useAuth } from "@clerk/nextjs";
import { useApiFetch } from "@/lib/api-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type DocStatus = "processing" | "embedded" | "failed";
type Jurisdiction = "in" | "eu";

interface CompanyDoc {
  id: string;
  name: string;
  pages: number | null;
  sections: number | null;
  status: DocStatus;
  progress?: number;
  uploadedAt: string;
}

interface RegulatoryDoc {
  id: string;
  name: string;
  pages: number | null;
  sections: number | null;
  status: DocStatus;
  jurisdiction: Jurisdiction;
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

function StatusBadge({ status, progress }: { status: DocStatus; progress?: number }) {
  if (status === "embedded") {
    return (
      <span style={{
        fontSize: "0.6875rem", fontWeight: 500, padding: "3px 10px", borderRadius: "100px",
        display: "inline-flex", alignItems: "center", gap: "4px",
        background: "var(--green-50)", color: "var(--green-700)", border: "1px solid rgba(34,197,94,.2)",
      }}>✓ Ready</span>
    );
  }
  if (status === "failed") {
    return (
      <span style={{
        fontSize: "0.6875rem", fontWeight: 500, padding: "3px 10px", borderRadius: "100px",
        display: "inline-flex", alignItems: "center", gap: "4px",
        background: "var(--red-50)", color: "var(--red-700)", border: "1px solid rgba(239,68,68,.2)",
      }}>✗ Failed</span>
    );
  }
  return (
    <div>
      <span style={{
        fontSize: "0.6875rem", fontWeight: 500, padding: "3px 10px", borderRadius: "100px",
        display: "inline-flex", alignItems: "center", gap: "4px",
        background: "var(--blue-50)", color: "#1d4ed8", border: "1px solid rgba(59,130,246,.2)",
      }}>⏳ Processing</span>
      {progress !== undefined && (
        <div style={{ height: "4px", background: "var(--s200)", borderRadius: "2px", marginTop: "6px", width: "140px" }}>
          <div style={{ height: "100%", background: "var(--blue-500)", borderRadius: "2px", width: `${progress}%`, transition: "width .3s" }} />
        </div>
      )}
    </div>
  );
}


const TH: React.CSSProperties = {
  textAlign: "left", padding: "10px 16px", fontSize: "0.6875rem", fontWeight: 600,
  textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--s500)",
  background: "var(--s50)", borderBottom: "1px solid var(--s200)",
};
const TD: React.CSSProperties = {
  padding: "12px 16px", borderBottom: "1px solid var(--s100)", verticalAlign: "top",
};

const JURISDICTION_LABELS: Record<Jurisdiction, string> = { in: "🇮🇳 India", eu: "🇪🇺 EU" };

export default function DocumentsPage() {
  const apiFetch = useApiFetch();
  const { getToken } = useAuth();

  const [regulatoryDocs, setRegulatoryDocs] = useState<RegulatoryDoc[]>([]);
  const [regJurisdiction, setRegJurisdiction] = useState<Jurisdiction>("in");
  const [regUploading, setRegUploading] = useState(false);
  const regFileRef = useRef<HTMLInputElement>(null);

  const [docs, setDocs] = useState<CompanyDoc[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => { fetchCompanyDocs(); }, [fetchCompanyDocs]);
  useEffect(() => { fetchRegulatoryDocs(); }, [fetchRegulatoryDocs]);

  // Poll every 4s while any document is still processing
  useEffect(() => {
    const hasPending = docs.some((d) => d.status === "processing");
    if (!hasPending) return;
    const id = setInterval(fetchCompanyDocs, 4000);
    return () => clearInterval(id);
  }, [docs, fetchCompanyDocs]);

  useEffect(() => {
    const hasPending = regulatoryDocs.some((d) => d.status === "processing");
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

  async function deleteDoc(id: string) {
    try {
      await apiFetch(`/documents/${id}`, { method: "DELETE" });
      setDocs((prev) => prev.filter((d) => d.id !== id));
    } catch {
      alert("Failed to delete document. Please try again.");
    }
  }

  async function deleteRegulatoryDoc(id: string) {
    try {
      await apiFetch(`/documents/${id}`, { method: "DELETE" });
      setRegulatoryDocs((prev) => prev.filter((d) => d.id !== id));
    } catch {
      alert("Failed to delete document. Please try again.");
    }
  }

  async function addFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const tempId = `temp-${Date.now()}-${file.name}`;
      setDocs((prev) => [{
        id: tempId, name: file.name, pages: null, sections: null,
        status: "processing", uploadedAt: "Just now", progress: 50,
      }, ...prev]);

      try {
        const form = new FormData();
        form.append("file", file);
        form.append("doc_type", "company");

        const created = await apiFetch<ApiDoc>("/documents/upload", {
          method: "POST", body: form, headers: {},
        });
        setDocs((prev) => prev.map((d) => d.id === tempId ? toCompanyDoc(created) : d));
      } catch {
        setDocs((prev) => prev.map((d) =>
          d.id === tempId ? { ...d, status: "failed" as DocStatus, progress: undefined } : d
        ));
      }
    }
    setUploading(false);
  }

  async function addRegulatoryFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setRegUploading(true);

    for (const file of Array.from(files)) {
      const tempId = `temp-reg-${Date.now()}-${file.name}`;
      setRegulatoryDocs((prev) => [{
        id: tempId, name: file.name, pages: null, sections: null,
        status: "processing", jurisdiction: regJurisdiction,
      }, ...prev]);

      try {
        const form = new FormData();
        form.append("file", file);
        form.append("doc_type", "regulatory");
        form.append("jurisdiction", regJurisdiction);

        const created = await apiFetch<ApiDoc>("/documents/upload", {
          method: "POST", body: form, headers: {},
        });
        setRegulatoryDocs((prev) => prev.map((d) => d.id === tempId ? toRegulatoryDoc(created) : d));
      } catch {
        setRegulatoryDocs((prev) => prev.map((d) =>
          d.id === tempId ? { ...d, status: "failed" as DocStatus } : d
        ));
      }
    }
    setRegUploading(false);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  const displayedRegDocs = regulatoryDocs.filter((d) => d.jurisdiction === regJurisdiction);

  return (
    <div style={{ maxWidth: "1000px" }}>

      {/* ── Regulatory Corpus ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <div>
          <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--s700)" }}>
            📜 Regulatory Corpus
          </span>
          <span style={{ fontSize: "0.8125rem", fontWeight: 400, color: "var(--s400)", marginLeft: "6px" }}>
            (shared across all tenants)
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {(["in", "eu"] as Jurisdiction[]).map((j) => (
            <button
              key={j}
              onClick={() => setRegJurisdiction(j)}
              style={{
                padding: "5px 14px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 500,
                cursor: "pointer", border: "1px solid",
                background: regJurisdiction === j ? "var(--brand-600)" : "#fff",
                color: regJurisdiction === j ? "#fff" : "var(--s600)",
                borderColor: regJurisdiction === j ? "var(--brand-600)" : "var(--s200)",
                transition: "all .15s",
              }}
            >
              {JURISDICTION_LABELS[j]}
            </button>
          ))}
          <button
            onClick={() => regFileRef.current?.click()}
            disabled={regUploading}
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "6px 14px", background: "var(--s800)", color: "#fff",
              border: "none", borderRadius: "8px", fontSize: "0.75rem",
              fontWeight: 600, fontFamily: "var(--font-b)", cursor: regUploading ? "not-allowed" : "pointer",
              opacity: regUploading ? 0.7 : 1,
            }}
          >
            {regUploading ? "⏳ Uploading…" : "📤 Upload Regulation"}
          </button>
          <input
            ref={regFileRef}
            type="file"
            multiple
            accept=".pdf,.docx"
            style={{ display: "none" }}
            onChange={(e) => { addRegulatoryFiles(e.target.files); e.target.value = ""; }}
          />
        </div>
      </div>

      <div style={{ border: "1px solid var(--s200)", borderRadius: "10px", overflow: "hidden", background: "#fff", marginBottom: "32px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={TH}>Document</th>
              <th style={{ ...TH, textAlign: "center" }}>Pages</th>
              <th style={{ ...TH, textAlign: "center" }}>Sections</th>
              <th style={TH}>Status</th>
              <th style={{ ...TH, width: "40px" }} />
            </tr>
          </thead>
          <tbody>
            {displayedRegDocs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ ...TD, textAlign: "center", color: "var(--s400)", padding: "32px", borderBottom: "none" }}>
                  No {JURISDICTION_LABELS[regJurisdiction]} regulatory documents yet — upload one above.
                </td>
              </tr>
            ) : (
              displayedRegDocs.map((doc, i) => {
                const last = i === displayedRegDocs.length - 1;
                const cell: React.CSSProperties = { ...TD, borderBottom: last ? "none" : "1px solid var(--s100)" };
                const isTemp = doc.id.startsWith("temp-");
                return (
                  <tr key={doc.id}>
                    <td style={cell}>
                      <span
                        onClick={() => !isTemp && openDocument(doc.id)}
                        style={{
                          display: "flex", alignItems: "center", gap: "6px",
                          fontSize: "0.8125rem", fontWeight: 500, color: "var(--s800)",
                          cursor: isTemp ? "default" : "pointer",
                        }}
                        onMouseEnter={(e) => { if (!isTemp) (e.currentTarget as HTMLElement).style.color = "var(--brand-600)"; }}
                        onMouseLeave={(e) => { if (!isTemp) (e.currentTarget as HTMLElement).style.color = "var(--s800)"; }}
                      >
                        📜 {doc.name}
                      </span>
                    </td>
                    <td style={{ ...cell, textAlign: "center", fontSize: "0.8125rem", color: "var(--s600)" }}>{doc.pages ?? "—"}</td>
                    <td style={{ ...cell, textAlign: "center", fontFamily: "var(--font-m)", fontSize: "0.75rem", color: "var(--s500)" }}>{doc.sections ?? "—"}</td>
                    <td style={cell}><StatusBadge status={doc.status} /></td>
                    <td style={cell}>
                      <button
                        onClick={() => deleteRegulatoryDoc(doc.id)}
                        title="Delete"
                        style={{ color: "var(--s400)", cursor: "pointer", fontSize: "0.875rem", background: "none", border: "none", padding: "4px" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--red-500)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--s400)")}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Company Documents ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--s700)" }}>
          📄 Company Documents
        </span>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "8px 16px", background: "var(--brand-600)", color: "#fff",
            border: "none", borderRadius: "8px", fontSize: "0.8125rem",
            fontWeight: 600, fontFamily: "var(--font-b)", cursor: uploading ? "not-allowed" : "pointer",
            opacity: uploading ? 0.7 : 1,
          }}
        >
          {uploading ? "⏳ Uploading…" : "📤 Upload Document"}
        </button>
      </div>

      <div style={{ border: "1px solid var(--s200)", borderRadius: "10px", overflow: "hidden", background: "#fff", marginBottom: "16px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={TH}>Document</th>
              <th style={{ ...TH, textAlign: "center" }}>Pages</th>
              <th style={{ ...TH, textAlign: "center" }}>Sections</th>
              <th style={TH}>Status</th>
              <th style={{ ...TH, width: "40px" }} />
            </tr>
          </thead>
          <tbody>
            {docs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ ...TD, textAlign: "center", color: "var(--s400)", padding: "32px", borderBottom: "none" }}>
                  No documents yet — upload your first file below.
                </td>
              </tr>
            ) : (
              docs.map((doc, i) => {
                const last = i === docs.length - 1;
                const cell: React.CSSProperties = { ...TD, borderBottom: last ? "none" : "1px solid var(--s100)" };
                const isTemp = doc.id.startsWith("temp-");
                return (
                  <tr key={doc.id}>
                    <td style={cell}>
                      <span
                        onClick={() => !isTemp && openDocument(doc.id)}
                        style={{
                          display: "flex", alignItems: "center", gap: "6px",
                          fontSize: "0.8125rem", fontWeight: 500, color: "var(--s800)",
                          cursor: isTemp ? "default" : "pointer",
                        }}
                        onMouseEnter={(e) => { if (!isTemp) (e.currentTarget as HTMLElement).style.color = "var(--brand-600)"; }}
                        onMouseLeave={(e) => { if (!isTemp) (e.currentTarget as HTMLElement).style.color = "var(--s800)"; }}
                      >
                        📄 {doc.name}
                      </span>
                      <div style={{ fontSize: "0.6875rem", color: "var(--s400)", marginTop: "2px" }}>{doc.uploadedAt}</div>
                    </td>
                    <td style={{ ...cell, textAlign: "center", fontSize: "0.8125rem", color: "var(--s600)" }}>{doc.pages ?? "—"}</td>
                    <td style={{ ...cell, textAlign: "center", fontFamily: "var(--font-m)", fontSize: "0.75rem", color: "var(--s500)" }}>{doc.sections ?? "—"}</td>
                    <td style={cell}><StatusBadge status={doc.status} progress={doc.progress} /></td>
                    <td style={cell}>
                      <button
                        onClick={() => deleteDoc(doc.id)}
                        title="Delete"
                        style={{ color: "var(--s400)", cursor: "pointer", fontSize: "0.875rem", background: "none", border: "none", padding: "4px" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--red-500)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--s400)")}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Drop Zone ── */}
      <input
        ref={fileRef}
        type="file"
        multiple
        accept=".pdf,.docx"
        style={{ display: "none" }}
        onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
      />
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? "var(--brand-400)" : "var(--s200)"}`,
          borderRadius: "10px", padding: "28px", textAlign: "center",
          background: dragging ? "var(--brand-50)" : "#fff",
          cursor: "pointer", transition: "all .15s",
        }}
      >
        <div style={{ fontSize: "1.25rem", marginBottom: "6px" }}>📤</div>
        <div style={{ fontSize: "0.8125rem", color: "var(--s500)" }}>
          Drag & drop PDF or DOCX here, or{" "}
          <span style={{ color: "var(--brand-600)", fontWeight: 500 }}>browse files</span>
        </div>
        <div style={{ fontSize: "0.6875rem", color: "var(--s400)", marginTop: "4px" }}>
          Max 10 MB per file · Supported: .pdf, .docx
        </div>
      </div>
    </div>
  );
}
