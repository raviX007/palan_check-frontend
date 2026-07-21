"use client";

import { SignUp } from "@clerk/nextjs";
import { useTheme } from "next-themes";

export default function SignUpPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <SignUp
      key={resolvedTheme}
      fallbackRedirectUrl="/dashboard"
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
  );
}
