import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MAX_W } from "./shared";

const NAV = [
  { href: "#capabilities", label: "Features" },
  { href: "#demo", label: "Demo" },
  { href: "#architecture", label: "Architecture" },
  { href: "#pricing", label: "Pricing" },
];

const BTN: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: 36,
  fontSize: 13,
  fontWeight: 500,
  borderRadius: "var(--radius-control)",
  padding: "8px 16px",
  textDecoration: "none",
};

const PRIMARY: React.CSSProperties = {
  ...BTN,
  color: "var(--on-accent)",
  background: "var(--accent)",
  border: "1px solid var(--accent)",
};

const SECONDARY: React.CSSProperties = {
  ...BTN,
  color: "var(--ink)",
  background: "var(--surface)",
  border: "1px solid var(--border)",
};

export function Header() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "var(--topbar)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          maxWidth: MAX_W,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "13px clamp(16px, 4vw, 40px)",
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
              flexShrink: 0,
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

        <nav
          aria-label="Page sections"
          className="palan-marketing-nav"
          style={{ display: "flex", alignItems: "center", gap: 4 }}
        >
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="palan-anchor"
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--muted)",
                padding: "6px 10px",
                textDecoration: "none",
              }}
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <ThemeToggle />
          <Show when="signed-out">
            <Link href="/quick-check" className="palan-btn palan-btn-secondary" style={SECONDARY}>
              Quick check
            </Link>
            <Link href="/sign-in" className="palan-btn palan-btn-primary" style={PRIMARY}>
              Sign in
            </Link>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard" className="palan-btn palan-btn-primary" style={PRIMARY}>
              Dashboard
            </Link>
          </Show>
        </div>
      </div>
    </header>
  );
}
