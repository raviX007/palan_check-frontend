"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "./nav-items";

/**
 * Horizontal pill nav shown below 920px, where the sidebar collapses away.
 * Visibility is CSS-driven (.rc-pillnav in globals.css) so there is no
 * matchMedia hydration flicker.
 */
export function PillNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="rc-pillnav">
      {NAV.map(({ href, label, icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "8px 14px",
              minHeight: 36,
              borderRadius: "var(--radius-pill)",
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              whiteSpace: "nowrap",
              textDecoration: "none",
              color: active ? "var(--accent-ink)" : "var(--muted)",
              background: active ? "var(--accent-tint)" : "transparent",
              border: `1px solid ${active ? "transparent" : "var(--border)"}`,
            }}
          >
            {icon}
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
