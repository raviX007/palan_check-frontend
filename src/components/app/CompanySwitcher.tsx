"use client";

import { OrganizationSwitcher, useOrganization, useUser } from "@clerk/nextjs";

function NoOrgFallback() {
  const { user } = useUser();
  const name = user?.fullName ?? user?.emailAddresses[0]?.emailAddress ?? "Account";

  return (
    <div style={{ padding: "8px 12px" }}>
      <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#fff" }}>
        {name}
      </div>
      <div style={{ fontSize: "0.6875rem", color: "var(--s500)", marginTop: "2px" }}>
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
            borderRadius: "6px",
            width: "100%",
            justifyContent: "flex-start",
            color: "#fff",
            fontSize: "0.8125rem",
            fontWeight: 500,
            background: "transparent",
          },
          organizationSwitcherTriggerIcon: { color: "var(--s400)" },
          organizationPreviewTextContainer: { color: "#fff" },
          organizationPreviewSecondaryIdentifier: { color: "var(--s400)" },
        },
      }}
    />
  );
}
