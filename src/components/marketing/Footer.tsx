import Link from "next/link";
import { MAX_W } from "./shared";

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", background: "var(--side)" }}>
      <div
        style={{
          maxWidth: MAX_W,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          padding: "20px clamp(16px, 4vw, 40px)",
          fontSize: 12.5,
          color: "var(--faint)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 18,
              height: 18,
              background: "var(--accent)",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--on-accent)",
              fontWeight: 700,
              fontSize: 10,
              flexShrink: 0,
            }}
          >
            P
          </div>
          <span>RegulationCheck · Agentic Compliance Engine. Built by Ravi Raj.</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span>Not legal advice</span>
          <a href="https://github.com/raviX007" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          {/* TODO: replace with the real profile URL — kept generic rather than guessed. */}
          <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <Link href="/sign-in" style={{ fontWeight: 500 }}>
            Sign in
          </Link>
        </div>
      </div>
    </footer>
  );
}
