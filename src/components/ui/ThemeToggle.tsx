"use client";

import { useTheme } from "next-themes";

/**
 * The icon is chosen by CSS off [data-theme] rather than React state, so the
 * server and client render identical markup — no hydration mismatch, and no
 * setState-in-effect. Both glyphs are emitted; globals.css hides one.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      title="Switch theme"
      aria-label="Switch between light and dark theme"
      style={{
        width: 36,
        height: 36,
        borderRadius: "var(--radius-control)",
        border: "1px solid var(--border)",
        background: "var(--surface)",
        color: "var(--muted)",
        fontSize: 15,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span className="rc-icon-light" aria-hidden="true">◐</span>
      <span className="rc-icon-dark" aria-hidden="true">☀</span>
    </button>
  );
}
