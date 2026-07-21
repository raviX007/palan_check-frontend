import { HTMLAttributes } from "react";

/**
 * The one container. No shadows — shadows are reserved for overlays
 * (command palette, popovers, menus).
 */
export function Card({ style, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        padding: "24px 28px",
        ...style,
      }}
      {...rest}
    />
  );
}
