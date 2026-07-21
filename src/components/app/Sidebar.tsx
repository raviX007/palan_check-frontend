"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { CompanySwitcher } from "./CompanySwitcher";
import { NAV } from "./nav-items";

const s = {
  logo: { display: "flex", alignItems: "center", gap: "10px", padding: "0 24px 28px 24px" },
  mark: {
    width: "26px", height: "26px", background: "var(--accent)", borderRadius: "6px",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  name: { fontWeight: 600, fontSize: "17px", letterSpacing: "-0.01em", color: "var(--ink)" },
  nav: { display: "flex", flexDirection: "column" as const, gap: "2px", padding: "0 14px" },
  label: {
    fontSize: "10.5px", fontWeight: 600, color: "var(--faint)",
    textTransform: "uppercase" as const, letterSpacing: "0.12em",
    padding: "0 12px 8px 12px",
  },
  section: { padding: "26px 14px 0 14px" },
  /** Active state is a tinted pill — never a left accent bar. */
  item: (active: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: "9px", padding: "8px 12px",
    minHeight: 36, borderRadius: "var(--radius-item)", fontSize: "13.5px",
    fontWeight: active ? 600 : 500,
    color: active ? "var(--accent-ink)" : "var(--muted)",
    background: active ? "var(--accent-tint)" : "transparent",
    textDecoration: "none",
  }),
  recentItem: {
    display: "block", padding: "6px 12px", fontSize: "12.5px", color: "var(--muted)",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const,
    textDecoration: "none",
  },
  spacer: { flex: 1 },
  bottom: { padding: "14px 14px 0 14px", borderTop: "1px solid var(--border)", marginTop: "16px" },
  bottomItem: {
    display: "block", padding: "8px 12px", borderRadius: "var(--radius-item)", fontSize: "13px",
    color: "var(--muted)", fontWeight: 500, textDecoration: "none",
  },
};

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  // Eval Suite is internal tooling. Hiding the link is UX; proxy.ts is the guard.
  const isAdmin = user?.publicMetadata?.role === "admin";

  return (
    <aside className="palan-sidebar">
      <Link href="/" style={{ ...s.logo, textDecoration: "none" }}>
        <div style={s.mark}>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="var(--on-accent)" strokeWidth="2">
            <path d="M12 3L1 9l11 6 9-4.91V17M4 11.16V17l8 4 8-4v-5.84" />
          </svg>
        </div>
        <span style={s.name}>Palan Check</span>
      </Link>

      <nav style={s.nav} aria-label="Primary">
        <div style={s.label}>Navigation</div>
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className="palan-navlink"
              style={s.item(active)}
            >
              {icon}
              {label}
            </Link>
          );
        })}
      </nav>

      <div style={s.section}>
        <div style={s.label}>Company</div>
        <CompanySwitcher />
      </div>

      {/* Recent chats stay hidden until palan-api stores conversation history —
          showing sample questions here reads as this tenant's own activity. */}

      <div style={s.spacer} />

      <div style={s.bottom}>
        {isAdmin && (
          <Link href="/eval" className="palan-navlink" style={s.bottomItem}>
            Eval Suite
          </Link>
        )}
        {/* TODO: no /help route exists yet — kept inert rather than 404ing. */}
        <a
          href="#"
          title="Product guide, scoring methodology and FAQs"
          className="palan-navlink"
          style={s.bottomItem}
        >
          Help &amp; documentation
        </a>
      </div>
    </aside>
  );
}
