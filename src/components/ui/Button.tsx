import { ButtonHTMLAttributes, CSSProperties } from "react";

type Variant = "primary" | "secondary" | "ghost";

const BASE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  fontFamily: "var(--font-sans)",
  fontSize: 13,
  fontWeight: 500,
  borderRadius: "var(--radius-control)",
  padding: "10px 18px",
  minHeight: 36, // hit target floor
  cursor: "pointer",
  transition: "background .15s, border-color .15s, color .15s",
};

const VARIANTS: Record<Variant, CSSProperties> = {
  primary: {
    color: "var(--on-accent)",
    background: "var(--accent)",
    border: "1px solid var(--accent)",
  },
  secondary: {
    color: "var(--ink)",
    background: "var(--surface)",
    border: "1px solid var(--border)",
  },
  ghost: {
    color: "var(--muted)",
    background: "transparent",
    border: "none",
  },
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

/**
 * Only ONE primary button per view — the accent is a budget, not a default.
 * Hover states live in globals.css (.palan-btn-*) so they work without JS.
 */
export function Button({
  variant = "primary",
  type = "button",
  disabled,
  className,
  style,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={["palan-btn", `palan-btn-${variant}`, className]
        .filter(Boolean)
        .join(" ")}
      style={{
        ...BASE,
        ...VARIANTS[variant],
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
      {...rest}
    />
  );
}
