"use client";

import { SignIn } from "@clerk/nextjs";
import { useState } from "react";

const DEMO_ACCOUNTS = [
  { flag: "🇮🇳", name: "NovaPay Fintech",   email: "novapay@demo.com",   password: "demo123", badge: "DPDP + Labour",    badgeType: "india" },
  { flag: "🇮🇳", name: "EduSpark Academy",  email: "eduspark@demo.com",  password: "demo123", badge: "Children's Data", badgeType: "india" },
  { flag: "🇪🇺", name: "DataFlow GmbH",     email: "dataflow@demo.com",  password: "demo123", badge: "GDPR + AI Act",   badgeType: "eu"    },
];

export default function SignInPage() {
  const [email, setEmail] = useState<string | undefined>(undefined);

  return (
    <div>
      <SignIn
        key={email}
        fallbackRedirectUrl="/"
        initialValues={email ? { emailAddress: email } : undefined}
        appearance={{
          layout: { socialButtonsVariant: "iconButton" },
          elements: {
            rootBox: "w-full",
            card: "shadow-none border border-slate-200 rounded-xl",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            formButtonPrimary: "bg-brand-600 hover:bg-brand-700 text-sm font-semibold rounded-lg",
            formFieldInput: "rounded-lg text-sm",
            formFieldLabel: "text-slate-700 text-xs font-medium",
            footerActionLink: "text-brand-600 font-medium",
            footer: "hidden",
          },
        }}
      />

      {/* Demo accounts */}
      <div style={{
        display: "flex", alignItems: "center", gap: "12px",
        margin: "20px 0 16px", fontSize: "0.75rem", color: "var(--s400)",
      }}>
        <span style={{ flex: 1, height: "1px", background: "var(--s200)", display: "block" }} />
        Demo accounts — click to prefill
        <span style={{ flex: 1, height: "1px", background: "var(--s200)", display: "block" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {DEMO_ACCOUNTS.map((a) => (
          <button
            key={a.email}
            onClick={() => setEmail(a.email)}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "8px 12px", borderRadius: "8px", cursor: "pointer",
              border: "1px solid transparent", background: "transparent",
              width: "100%", textAlign: "left", fontFamily: "var(--font-b)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--brand-50)";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--brand-200)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.borderColor = "transparent";
            }}
          >
            <span style={{ fontSize: "0.875rem", flexShrink: 0 }}>{a.flag}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--s800)" }}>{a.name}</div>
              <div style={{ fontSize: "0.6875rem", color: "var(--s500)", fontFamily: "var(--font-m)" }}>
                {a.email} · pw: {a.password}
              </div>
            </div>
            <span style={{
              fontSize: "0.5625rem", fontWeight: 500, padding: "2px 8px",
              borderRadius: "100px", flexShrink: 0,
              ...(a.badgeType === "india"
                ? { background: "rgba(249,115,22,.08)", color: "#c2410c", border: "1px solid rgba(249,115,22,.15)" }
                : { background: "rgba(37,99,235,.08)", color: "#1d4ed8", border: "1px solid rgba(37,99,235,.15)" }),
            }}>
              {a.badge}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
