export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--s50)",
      fontFamily: "var(--font-b)",
      WebkitFontSmoothing: "antialiased",
    }}>
      <div style={{ width: "100%", maxWidth: "420px", padding: "24px" }}>
        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
          <div style={{
            width: "44px", height: "44px", background: "var(--brand-600)",
            borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M12 3L1 9l11 6 9-4.91V17M4 11.16V17l8 4 8-4v-5.84" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: "1.25rem", color: "var(--s900)" }}>Palan Check</span>
          <span style={{ fontSize: "0.75rem", color: "var(--s500)", marginTop: "-8px" }}>
            Agentic Compliance Engine
          </span>
        </div>

        {children}

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "0.8125rem", color: "var(--s500)" }}>
          No account?{" "}
          <a href="/quick-check" style={{ color: "var(--brand-600)", fontWeight: 500, textDecoration: "none" }}>
            Try the free Quick Check
          </a>
        </p>
      </div>
    </div>
  );
}
