"use client";

import { SignIn } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

/** Shared by every demo account — seeded by palan-api/Scripts/seed_demo_users.py */
const DEMO_PASSWORD = "PalanDemo!2026";

/**
 * Clerk may ask for an email code on a new device. These are `+clerk_test`
 * addresses, so no mail is ever sent and the code is always this value.
 */
const DEMO_CODE = "424242";

const DEMO_ACCOUNTS = [
  {
    name: "NovaPay Fintech",
    email: "novapay+clerk_test@demo.com",
    scope: "IN · DPDP + Labour",
    meta: "Bengaluru · 45 employees · fintech",
  },
  {
    name: "EduSpark Academy",
    email: "eduspark+clerk_test@demo.com",
    scope: "IN · Children's data",
    meta: "Hyderabad · 25 employees · edtech",
  },
  {
    name: "FreshBasket",
    email: "freshbasket+clerk_test@demo.com",
    scope: "IN · DPDP + Labour",
    meta: "Mumbai · 120 employees · grocery delivery",
  },
  {
    name: "DataFlow GmbH",
    email: "dataflow+clerk_test@demo.com",
    scope: "EU · GDPR + AI Act",
    meta: "Berlin · 15 employees · B2B SaaS",
  },
];

export default function SignInPage() {
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);
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

      {/* One shared password for every demo account. */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "var(--accent-tint)",
          borderRadius: 9,
          padding: "10px 14px",
          marginBottom: 10,
        }}
      >
        <span style={{ fontSize: 12.5, color: "var(--ink)" }}>Password</span>
        <code
          style={{
            flex: 1,
            fontFamily: "var(--font-mono)",
            fontSize: 12.5,
            color: "var(--accent-ink)",
          }}
        >
          {DEMO_PASSWORD}
        </code>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(DEMO_PASSWORD).then(() => setCopied(true));
          }}
          style={{
            fontSize: 11.5,
            fontWeight: 500,
            color: "var(--accent-ink)",
            background: "transparent",
            border: "1px solid var(--accent)",
            borderRadius: "var(--radius-chip)",
            padding: "4px 10px",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <p style={{ fontSize: 11.5, color: "var(--faint)", margin: "0 0 10px", lineHeight: 1.5 }}>
        Pick a company to prefill its email, then paste the password. If asked for an email
        verification code, enter{" "}
        <code style={{ fontFamily: "var(--font-mono)", color: "var(--accent-ink)" }}>
          {DEMO_CODE}
        </code>{" "}
        — these are test addresses, so no mail is sent. Each account sees a different
        jurisdiction and document set.
      </p>

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
                {a.email}
              </div>
              <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 2 }}>{a.meta}</div>
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
