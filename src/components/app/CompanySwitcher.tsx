"use client";

import { OrganizationSwitcher, useOrganization, useUser } from "@clerk/nextjs";

function NoOrgFallback() {
  const { user } = useUser();
  const name = user?.fullName ?? user?.emailAddresses[0]?.emailAddress ?? "Account";

  return (
    <div style={{ padding: "8px 12px" }}>
      <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--ink)" }}>
        {name}
      </div>
      <div style={{ fontSize: "0.6875rem", color: "var(--muted)", marginTop: "2px" }}>
        No organization — contact admin
      </div>
    </div>
  );
}

export function CompanySwitcher() {
  const { isLoaded, organization } = useOrganization();

  if (!isLoaded) return null;

  if (!organization) return <NoOrgFallback />;

  return (
    <OrganizationSwitcher
      hidePersonal={true}
      afterSelectOrganizationUrl="/dashboard"
      appearance={{
        elements: {
          rootBox: { width: "100%" },
          organizationSwitcherTrigger: {
            padding: "8px 12px",
            borderRadius: "7px",
            width: "100%",
            justifyContent: "flex-start",
            color: "var(--ink)",
            fontSize: "13.5px",
            fontWeight: 500,
            background: "transparent",
          },
          organizationSwitcherTriggerIcon: { color: "var(--faint)" },
          organizationPreviewTextContainer: { color: "var(--ink)" },
          organizationPreviewSecondaryIdentifier: { color: "var(--muted)" },
        },
      }}
    />
  );
}
