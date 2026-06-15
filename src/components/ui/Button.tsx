import { CSSProperties, MouseEvent } from "react";

type Variant = "primary" | "outline" | "ghost";

interface ButtonProps {
  variant?: Variant;
  children: React.ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  style?: CSSProperties;
}

const BASE: CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: "6px",
  fontFamily: "var(--font-b)", fontWeight: 600, fontSize: "0.8125rem",
  borderRadius: "8px", cursor: "pointer", transition: "all .15s",
  padding: "8px 16px", border: "none",
};

const VARIANTS: Record<Variant, CSSProperties> = {
  primary: { background: "var(--brand-600)", color: "#fff" },
  outline: { background: "#fff", color: "var(--s700)", border: "1.5px solid var(--s200)" },
  ghost:   { background: "transparent", color: "var(--s600)", border: "1px solid var(--s200)" },
};

export function Button({ variant = "primary", children, onClick, disabled, type = "button", style }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...BASE, ...VARIANTS[variant], opacity: disabled ? 0.5 : 1, ...style }}
    >
      {children}
    </button>
  );
}
