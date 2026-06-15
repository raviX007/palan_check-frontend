"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

const PATH_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/chat": "Chat",
  "/documents": "Documents",
  "/reports": "Reports",
  "/compare": "Compare",
  "/eval": "Eval Suite",
};

export function TopBar({ title }: { title?: string }) {
  const { user } = useUser();
  const pathname = usePathname();
  const resolvedTitle = title ?? PATH_TITLES[pathname] ?? "Palan Check";

  const initials = user
    ? ((user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "")).toUpperCase() ||
      user.emailAddresses[0]?.emailAddress[0]?.toUpperCase() ||
      "U"
    : "U";

  return (
    <div style={{
      height: "56px",
      borderBottom: "1px solid var(--s200)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 28px",
      background: "#fff",
      position: "sticky",
      top: 0,
      zIndex: 30,
      flexShrink: 0,
    }}>
      <span style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--s900)" }}>
        {resolvedTitle}
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "5px",
          padding: "3px 10px", borderRadius: "100px",
          background: "rgba(249,115,22,.08)", color: "#c2410c",
          border: "1px solid rgba(249,115,22,.15)",
          fontSize: "0.6875rem", fontWeight: 500,
        }}>
          🇮🇳 India — DPDP + Labour
        </div>

        <div style={{
          width: "30px", height: "30px", borderRadius: "50%",
          background: "var(--brand-600)", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.6875rem", fontWeight: 700, flexShrink: 0,
        }}>
          {initials}
        </div>

        <UserButton />
      </div>
    </div>
  );
}
