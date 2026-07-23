import { CSSProperties } from "react";

const CHIP: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 11.5,
  color: "var(--muted)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-chip)",
  padding: "4px 10px",
  background: "var(--chip-bg)",
  textDecoration: "none",
  display: "inline-block",
  whiteSpace: "nowrap",
  transition: "border-color .15s, color .15s",
};

interface CitationChipProps {
  children: React.ReactNode;
  /** Target statute/document — usually a /compare deep link. */
  href?: string;
  onClick?: () => void;
  title?: string;
}

/**
 * Anything clickable is a real <a> or <button> — never a div/span with onClick.
 * Hover (accent border + accent-ink text) lives in globals.css (.rc-cite).
 */
export function CitationChip({ children, href, onClick, title }: CitationChipProps) {
  if (href) {
    return (
      <a className="rc-cite" href={href} title={title} style={CHIP}>
        {children}
      </a>
    );
  }
  if (onClick) {
    return (
      <button className="rc-cite" type="button" onClick={onClick} title={title}
        style={{ ...CHIP, cursor: "pointer" }}>
        {children}
      </button>
    );
  }
  return (
    <span title={title} style={CHIP}>
      {children}
    </span>
  );
}
