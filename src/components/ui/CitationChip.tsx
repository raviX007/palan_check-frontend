interface CitationChipProps {
  label: string;
  onClick?: () => void;
}

export function CitationChip({ label, onClick }: CitationChipProps) {
  return (
    <span
      onClick={onClick}
      title={label}
      style={{
        fontFamily: "var(--font-m)", fontSize: "0.6875rem",
        background: "var(--brand-50)", color: "var(--brand-700)",
        border: "1px solid var(--brand-200)", padding: "3px 10px",
        borderRadius: "4px", cursor: onClick ? "pointer" : "default",
        display: "inline-block", whiteSpace: "nowrap",
        transition: "background .15s",
      }}
      onMouseEnter={(e) => {
        if (onClick) (e.currentTarget as HTMLElement).style.background = "var(--brand-100)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "var(--brand-50)";
      }}
    >
      {label}
    </span>
  );
}
