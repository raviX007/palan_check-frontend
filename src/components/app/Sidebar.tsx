"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CompanySwitcher } from "./CompanySwitcher";

const NAV = [
  {
    href: "/dashboard", label: "Dashboard",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  },
  {
    href: "/chat", label: "Chat",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
  {
    href: "/documents", label: "Documents",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>,
  },
  {
    href: "/reports", label: "Reports",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>,
  },
  {
    href: "/compare", label: "Compare",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>,
  },
];

const RECENT = [
  "Does NovaPay need a DPO?",
  "Contract worker obligations",
  "Privacy policy gaps",
];

const s = {
  sidebar: {
    width: "224px", background: "var(--s900)", padding: "20px 12px",
    position: "fixed" as const, height: "100vh", display: "flex",
    flexDirection: "column" as const, overflowY: "auto" as const, zIndex: 40,
  },
  logo: { display: "flex", alignItems: "center", gap: "10px", padding: "4px 12px", marginBottom: "24px" },
  mark: {
    width: "28px", height: "28px", background: "var(--brand-600)", borderRadius: "6px",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  name: { fontWeight: 700, fontSize: "0.9375rem", color: "#fff" },
  label: {
    fontSize: "0.5625rem", fontWeight: 600, color: "var(--s500)",
    textTransform: "uppercase" as const, letterSpacing: "0.08em",
    padding: "16px 12px 6px",
  },
  item: (active: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: "9px", padding: "8px 12px",
    borderRadius: "6px", fontSize: "0.8125rem", fontWeight: 500,
    color: active ? "#fff" : "var(--s400)",
    background: active ? "var(--brand-600)" : "transparent",
    cursor: "pointer", marginBottom: "1px", textDecoration: "none",
    transition: "all .15s",
  }),
  companyBox: { padding: "10px 12px", marginTop: "4px" },
  companyName: { fontSize: "0.8125rem", fontWeight: 600, color: "#fff", display: "flex", alignItems: "center", gap: "6px" },
  companyMeta: { fontSize: "0.6875rem", color: "var(--s500)", marginTop: "2px" },
  recentWrap: { padding: "4px 12px" },
  recentItem: { fontSize: "0.6875rem", color: "var(--s500)", padding: "5px 0", cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const },
  spacer: { flex: 1 },
  adminWrap: { padding: "0 12px", marginBottom: "8px" },
  adminItem: {
    display: "flex", alignItems: "center", gap: "9px", padding: "8px 12px",
    borderRadius: "6px", fontSize: "0.8125rem", fontWeight: 500,
    color: "var(--s500)", cursor: "pointer", textDecoration: "none",
  },
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={s.sidebar}>
      <Link href="/" style={{ ...s.logo, textDecoration: "none" }}>
        <div style={s.mark}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M12 3L1 9l11 6 9-4.91V17M4 11.16V17l8 4 8-4v-5.84" />
          </svg>
        </div>
        <span style={s.name}>Palan Check</span>
      </Link>

      <div style={s.label}>Navigation</div>
      {NAV.map(({ href, label, icon }) => (
        <Link key={href} href={href} style={s.item(pathname === href)}>
          {icon} {label}
        </Link>
      ))}

      <div style={s.label}>Company</div>
      <div style={s.companyBox}>
        <CompanySwitcher />
      </div>

      <div style={s.label}>Recent Queries</div>
      <div style={s.recentWrap}>
        {RECENT.map((q) => (
          <div key={q} style={s.recentItem}>"{q}"</div>
        ))}
      </div>

      <div style={s.spacer} />

      <div style={s.label}>Admin</div>
      <div style={s.adminWrap}>
        <Link href="/eval" style={s.adminItem}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/>
            <path d="M8.5 2h7"/>
          </svg>
          Eval Suite
        </Link>
      </div>
    </aside>
  );
}
