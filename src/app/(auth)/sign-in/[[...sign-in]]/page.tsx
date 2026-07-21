"use client";

import { SignIn, useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTheme } from "next-themes";

/**
 * No credential lives in this bundle. Clicking a company asks /api/demo-signin
 * for a 60-second Clerk sign-in ticket, minted server-side where the secret key
 * lives. `key` is the only value sent, and the server maps it against its own
 * allowlist, so no arbitrary account can be targeted.
 */
const DEMO_ACCOUNTS = [
  {
    key: "novapay",
    name: "NovaPay Fintech",
    email: "novapay+clerk_test@demo.com",
    scope: "IN · DPDP + Labour",
    meta: "Bengaluru · 45 employees · fintech",
  },
  {
    key: "eduspark",
    name: "EduSpark Academy",
    email: "eduspark+clerk_test@demo.com",
    scope: "IN · Children's data",
    meta: "Hyderabad · 25 employees · edtech",
  },
  {
    key: "freshbasket",
    name: "FreshBasket",
    email: "freshbasket+clerk_test@demo.com",
    scope: "IN · DPDP + Labour",
    meta: "Mumbai · 120 employees · grocery delivery",
  },
  {
    key: "dataflow",
    name: "DataFlow GmbH",
    email: "dataflow+clerk_test@demo.com",
    scope: "EU · GDPR + AI Act",
    meta: "Berlin · 15 employees · B2B SaaS",
  },
];

export default function SignInPage() {
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const { signIn } = useSignIn();
  const router = useRouter();
  const isDark = resolvedTheme === "dark";

  /**
   * One-click demo sign-in. The server mints a short-lived Clerk ticket; the
   * browser only ever holds that ticket, never a password. A server-issued
   * ticket also satisfies the new-device check, so there is no code to enter.
   */
  async function signInAsDemo(company: string, demoEmail: string) {
    if (!signIn) return;
    setBusy(company);
    setNotice(null);
    setEmail(demoEmail);

    try {
      const response = await fetch("/api/demo-signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company }),
      });
      const data = (await response.json()) as { ticket?: string; error?: string };
      if (!response.ok || !data.ticket) {
        throw new Error(data.error ?? "Could not start demo sign-in.");
      }

      const { error } = await signIn.ticket({ ticket: data.ticket });
      if (error) throw error;

      if (signIn.status === "complete") {
        await signIn.finalize({ navigate: () => router.push("/dashboard") });
        return;
      }

      setNotice(`Clerk needs one more step (${signIn.status}). Use the form above.`);
    } catch (err) {
      const message =
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Could not sign in. Check that the demo users are seeded.";
      setNotice(message);
    } finally {
      setBusy(null);
    }
  }

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

      <p style={{ fontSize: 11.5, color: "var(--faint)", margin: "0 0 10px", lineHeight: 1.5 }}>
        Pick a company to sign in instantly — no password or verification code needed. Each
        account sees a different jurisdiction and document set.
      </p>

      {notice && (
        <div
          role="status"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            background: "var(--med-bg)",
            borderRadius: 9,
            padding: "10px 14px",
            marginBottom: 10,
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
              marginTop: 2,
            }}
          >
            Note
          </span>
          <span style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--muted)" }}>
            {notice}
          </span>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {DEMO_ACCOUNTS.map((a) => (
          <button
            key={a.email}
            type="button"
            onClick={() => signInAsDemo(a.key, a.email)}
            disabled={busy !== null}
            aria-label={`Sign in as ${a.name}`}
            className="palan-demo-account"
            style={{
              opacity: busy !== null && busy !== a.key ? 0.5 : 1,
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
                color: busy === a.email ? "var(--accent-ink)" : "var(--muted)",
                background: busy === a.email ? "var(--accent-tint)" : "var(--chip-bg)",
                border: `1px solid ${busy === a.email ? "var(--accent-tint)" : "var(--border)"}`,
                borderRadius: 5,
                padding: "3px 8px",
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              {busy === a.key ? "Signing in…" : a.scope}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
