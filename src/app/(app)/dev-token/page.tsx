"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function DevTokenPage() {
  if (process.env.NODE_ENV === "production") return null;

  const { getToken } = useAuth();
  const [token, setToken] = useState("");

  useEffect(() => {
    getToken().then((t) => setToken(t ?? ""));
  }, [getToken]);

  return (
    <div>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>
        Dev — Clerk JWT
      </h1>
      <p style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "0.75rem" }}>
        Copy this token into Swagger Authorize. Expires in ~60s — refresh the page for a new one.
      </p>
      <textarea
        readOnly
        value={token}
        rows={6}
        style={{
          width: "100%", fontFamily: "monospace", fontSize: "0.75rem",
          padding: "0.75rem", border: "1px solid #e2e8f0", borderRadius: "6px",
          background: "#f8fafc", resize: "none",
        }}
      />
      <button
        onClick={() => navigator.clipboard.writeText(token)}
        style={{
          marginTop: "0.5rem", padding: "0.5rem 1rem", background: "#2563eb",
          color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.875rem",
        }}
      >
        Copy to clipboard
      </button>
    </div>
  );
}
