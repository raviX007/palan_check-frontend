"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";

/** Build-time constant — this page is a local debugging aid only. */
const IS_DEV = process.env.NODE_ENV !== "production";

export default function DevTokenPage() {
  // Hooks run unconditionally; the production guard happens after them so the
  // hook order can never differ between renders.
  const { getToken } = useAuth();
  const [token, setToken] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!IS_DEV) return;
    let cancelled = false;
    getToken().then((t) => {
      if (!cancelled) setToken(t ?? "");
    });
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  if (!IS_DEV) return null;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", paddingTop: 16 }}>
      <SectionLabel accent>Development only</SectionLabel>
      <h1
        style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 600,
          fontSize: 24,
          letterSpacing: "-0.02em",
          margin: "10px 0",
          lineHeight: 1.15,
          color: "var(--ink)",
        }}
      >
        Clerk JWT
      </h1>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16, lineHeight: 1.6 }}>
        Copy this token into Swagger Authorize. It expires in about 60 seconds — reload for a new
        one. Treat it like a password: it authenticates as your user.
      </p>

      <textarea
        readOnly
        value={token}
        rows={6}
        aria-label="Clerk JWT"
        style={{
          width: "100%",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          lineHeight: 1.6,
          padding: 12,
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-control)",
          background: "var(--chip-bg)",
          color: "var(--ink)",
          resize: "none",
        }}
      />

      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(token).then(() => setCopied(true));
        }}
        disabled={!token}
        className="rc-btn rc-btn-primary"
        style={{
          marginTop: 10,
          fontFamily: "var(--font-sans)",
          fontSize: 13,
          fontWeight: 500,
          color: "var(--on-accent)",
          background: "var(--accent)",
          border: "1px solid var(--accent)",
          borderRadius: "var(--radius-control)",
          padding: "10px 18px",
          minHeight: 36,
          cursor: token ? "pointer" : "not-allowed",
          opacity: token ? 1 : 0.5,
        }}
      >
        {copied ? "Copied" : "Copy to clipboard"}
      </button>
    </div>
  );
}
