import { CSSProperties } from "react";

interface CardProps {
  children: React.ReactNode;
  padding?: string;
  style?: CSSProperties;
}

export function Card({ children, padding = "20px 24px", style }: CardProps) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid var(--s200)",
      borderRadius: "10px",
      padding,
      ...style,
    }}>
      {children}
    </div>
  );
}
