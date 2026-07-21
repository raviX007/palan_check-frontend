/** Single source of truth for primary navigation — Sidebar, PillNav and the
 *  command palette all read from here so they can never drift apart. */
export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const ico = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
} as const;

export const NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg {...ico}>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: "/chat",
    label: "Chat",
    icon: (
      <svg {...ico}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: "/documents",
    label: "Documents",
    icon: (
      <svg {...ico}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
      </svg>
    ),
  },
  {
    href: "/reports",
    label: "Reports",
    icon: (
      <svg {...ico}>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" />
      </svg>
    ),
  },
  {
    href: "/compare",
    label: "Compare",
    icon: (
      <svg {...ico}>
        <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
      </svg>
    ),
  },
];

/** Breadcrumb / document titles per route. */
export const PATH_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/chat": "Chat",
  "/documents": "Documents",
  "/reports": "Reports",
  "/compare": "Compare",
  "/eval": "Eval Suite",
};
