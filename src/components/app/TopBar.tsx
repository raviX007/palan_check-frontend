"use client";

import { useEffect, useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useApiFetch } from "@/lib/api-client";
import { jurisdictionPill } from "@/lib/reports";
import { CommandPaletteChip } from "./CommandPalette";
import { PATH_TITLES } from "./nav-items";

export function TopBar({ title }: { title?: string }) {
  const pathname = usePathname();
  const apiFetch = useApiFetch();
  const [jurisdiction, setJurisdiction] = useState<string | undefined>();

  // The pill must reflect the signed-in tenant, not a hardcoded region.
  useEffect(() => {
    apiFetch<{ jurisdiction: string }>("/tenants/me")
      .then((t) => setJurisdiction(t.jurisdiction))
      .catch(() => undefined);
  }, [apiFetch]);
  // Nested routes (/reports/<id>) fall back to their section title.
  const section = Object.keys(PATH_TITLES).find(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const current = title ?? (section ? PATH_TITLES[section] : undefined) ?? "RegulationCheck";

  return (
    <div
      style={{
        minHeight: 56,
        background: "var(--topbar)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "0 clamp(16px, 4vw, 40px)",
        position: "sticky",
        top: 0,
        zIndex: 30,
        flexShrink: 0,
      }}
    >
      {/* Breadcrumb: trail is muted, the current segment is ink 500. */}
      <nav aria-label="Breadcrumb" style={{ fontSize: 13, color: "var(--muted)", minWidth: 0 }}>
        <span style={{ color: "var(--muted)" }}>RegulationCheck</span>
        <span aria-hidden="true" style={{ margin: "0 8px", color: "var(--faint)" }}>
          /
        </span>
        <span aria-current="page" style={{ color: "var(--ink)", fontWeight: 500 }}>
          {current}
        </span>
      </nav>

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <CommandPaletteChip />

        <div
          className="rc-jurisdiction-pill"
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "var(--muted)",
            border: "1px solid var(--border)",
            background: "var(--chip-bg)",
            borderRadius: "var(--radius-pill)",
            padding: "5px 13px",
            whiteSpace: "nowrap",
          }}
        >
          {jurisdictionPill(jurisdiction)}
        </div>

        <ThemeToggle />

        {/* Sign-out lives here, not in the sidebar — the top bar survives the
            <920px collapse where the sidebar disappears. */}
        <UserButton
          appearance={{
            elements: {
              avatarBox: { width: 30, height: 30 },
              userButtonPopoverCard: {
                background: "var(--surface)",
                border: "1px solid var(--border)",
              },
            },
          }}
        />
      </div>
    </div>
  );
}
