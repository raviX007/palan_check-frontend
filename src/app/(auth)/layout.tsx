import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
        fontFamily: "var(--font-sans)",
        color: "var(--ink)",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "16px clamp(16px, 4vw, 40px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              background: "var(--accent)",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--on-accent)",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            P
          </div>
          <span
            style={{
              fontWeight: 600,
              fontSize: 17,
              letterSpacing: "-0.01em",
              color: "var(--ink)",
            }}
          >
            Palan Check
          </span>
        </Link>
        <ThemeToggle />
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 400 }}>{children}</div>
      </div>

      <div
        style={{
          textAlign: "center",
          padding: "20px 24px 40px",
          fontSize: 12.5,
          color: "var(--faint)",
        }}
      >
        No account? <Link href="/quick-check">Try the free quick check</Link>
      </div>
    </div>
  );
}
