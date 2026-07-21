"use client";

import { SignIn } from "@clerk/nextjs";
import { useState } from "react";
import { useTheme } from "next-themes";

const DEMO_ACCOUNTS = [
  {
    name: "NovaPay Fintech",
    email: "novapay@demo.com",
    password: "demo123",
    scope: "IN · DPDP + Labour",
  },
  {
    name: "EduSpark Academy",
    email: "eduspark@demo.com",
    password: "demo123",
    scope: "IN · Children's data",
  },
  {
    name: "DataFlow GmbH",
    email: "dataflow@demo.com",
    password: "demo123",
    scope: "EU · GDPR + AI Act",
  },
];

export default function SignInPage() {
  const [email, setEmail] = useState<string | undefined>(undefined);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div>
      {/* Matched to the design via Clerk's appearance variables rather than
          rebuilding the form with Clerk Elements. */}
      <SignIn
        key={`${email}-${resolvedTheme}`}
        fallbackRedirectUrl="/dashboard"
        initialValues={email ? { emailAddress: email } : undefined}
        appearance={{
          layout: { socialButtonsVariant: "iconButton" },
          variables: {
            colorPrimary: isDark ? "#6D7BE8" : "#4050C6",
            colorText: isDark ? "#E8EAF0" : "#171C26",
            colorBackground: isDark ? "#171B23" : "#FFFFFF",
            colorInputBackground: isDark ? "#12151C" : "#F7F8FA",
            colorInputText: isDark ? "#E8EAF0" : "#171C26",
            colorTextSecondary: isDark ? "#9AA3B2" : "#5C6470",
            borderRadius: "8px",
            fontFamily: "var(--font-sans)",
          },
          elements: {
            rootBox: { width: "100%" },
            card: {
              boxShadow: "none",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-card)",
              background: "var(--surface)",
            },
            headerTitle: { fontSize: "18px", fontWeight: 600, letterSpacing: "-0.01em" },
            headerSubtitle: { fontSize: "13px", color: "var(--muted)" },
            formButtonPrimary: { fontSize: "13px", fontWeight: 500, textTransform: "none" },
            formFieldInput: { fontSize: "13.5px" },
            formFieldLabel: { fontSize: "12.5px", fontWeight: 500 },
          },
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          margin: "24px 0 12px",
          fontSize: 11.5,
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--faint)",
        }}
      >
        <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
        Demo accounts
        <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {DEMO_ACCOUNTS.map((a) => (
          <button
            key={a.email}
            type="button"
            onClick={() => setEmail(a.email)}
            className="palan-demo-account"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              minHeight: 36,
              borderRadius: "var(--radius-item)",
              cursor: "pointer",
              border: "1px solid transparent",
              background: "transparent",
              width: "100%",
              textAlign: "left",
              fontFamily: "var(--font-sans)",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{a.name}</div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--faint)",
                  fontFamily: "var(--font-mono)",
                  marginTop: 2,
                }}
              >
                {a.email} · {a.password}
              </div>
            </div>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--muted)",
                background: "var(--chip-bg)",
                border: "1px solid var(--border)",
                borderRadius: 5,
                padding: "3px 8px",
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              {a.scope}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
