"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";

interface PaletteCtx {
  open: () => void;
}

const Ctx = createContext<PaletteCtx>({ open: () => {} });

/** Lets the TopBar search chip (or anything else) open the palette. */
export function useCommandPalette() {
  return useContext(Ctx);
}

interface Action {
  label: string;
  kind: "Page" | "Action";
  href?: string;
  run?: () => void;
  /** Eval Suite is internal tooling — hidden from non-admins. */
  adminOnly?: boolean;
}

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);

  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { resolvedTheme, setTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.publicMetadata?.role === "admin";

  const open = useCallback(() => {
    setQuery("");
    setSel(0);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  const actions = useMemo<Action[]>(
    () => [
      { label: "Go to Dashboard", kind: "Page", href: "/dashboard" },
      { label: "Go to Chat", kind: "Page", href: "/chat" },
      { label: "Go to Documents", kind: "Page", href: "/documents" },
      { label: "Go to Reports", kind: "Page", href: "/reports" },
      { label: "Go to Compare", kind: "Page", href: "/compare" },
      { label: "Ask a compliance question", kind: "Action", href: "/chat" },
      { label: "Upload a document", kind: "Action", href: "/documents" },
      { label: "Compare document vs regulation", kind: "Action", href: "/compare" },
      { label: "Go to Eval Suite", kind: "Page", href: "/eval", adminOnly: true },
      {
        label: "Switch light / dark theme",
        kind: "Action",
        run: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
      },
      { label: "Sign out", kind: "Action", run: () => void signOut({ redirectUrl: "/" }) },
    ],
    [resolvedTheme, setTheme, signOut],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return actions
      .filter((a) => !a.adminOnly || isAdmin)
      .filter((a) => !q || a.label.toLowerCase().includes(q));
  }, [actions, query, isAdmin]);

  const run = useCallback(
    (a: Action) => {
      setIsOpen(false);
      if (a.run) a.run();
      else if (a.href) router.push(a.href);
    },
    [router],
  );

  // Global ⌘K / Ctrl-K toggle.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((o) => {
          if (!o) {
            setQuery("");
            setSel(0);
          }
          return !o;
        });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Arrow / Enter / Escape while the dialog is open.
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSel((s) => Math.min(s + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSel((s) => Math.max(s - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const a = results[Math.min(sel, results.length - 1)];
        if (a) run(a);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, results, sel, run]);

  // Focus the input when the dialog opens (autoFocus is unreliable here).
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // Keep the highlighted row in view when navigating by keyboard.
  useEffect(() => {
    if (!isOpen) return;
    listRef.current?.querySelectorAll("button")[sel]?.scrollIntoView({ block: "nearest" });
  }, [sel, isOpen]);

  const safeSel = Math.min(sel, Math.max(results.length - 1, 0));

  return (
    <Ctx.Provider value={{ open }}>
      {children}

      {isOpen && (
        <>
          <div
            onClick={close}
            style={{ position: "fixed", inset: 0, background: "rgba(15,18,24,0.4)", zIndex: 50 }}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Command menu"
            style={{
              position: "fixed",
              top: 110,
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(560px, calc(100vw - 48px))",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-card)",
              boxShadow: "0 24px 64px rgba(15,18,24,0.28)",
              zIndex: 51,
              overflow: "hidden",
            }}
          >
            <div style={{ borderBottom: "1px solid var(--border-soft)", padding: "4px 16px" }}>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSel(0);
                }}
                placeholder="Search pages and actions…"
                aria-label="Search pages and actions"
                role="combobox"
                aria-expanded
                aria-controls="rc-cmd-list"
                aria-activedescendant={
                  results.length ? `rc-cmd-opt-${safeSel}` : undefined
                }
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontFamily: "var(--font-sans)",
                  fontSize: 14.5,
                  color: "var(--ink)",
                  padding: "12px 0",
                }}
              />
            </div>

            <div
              ref={listRef}
              id="rc-cmd-list"
              role="listbox"
              aria-label="Commands"
              style={{ padding: 6, maxHeight: 320, overflowY: "auto" }}
            >
              {results.map((a, i) => (
                <button
                  key={a.label}
                  type="button"
                  id={`rc-cmd-opt-${i}`}
                  role="option"
                  onClick={() => run(a)}
                  onMouseMove={() => setSel(i)}
                  aria-selected={i === safeSel}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 12px",
                    border: "none",
                    borderRadius: "var(--radius-control)",
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    fontSize: 13.5,
                    fontWeight: 500,
                    background: i === safeSel ? "var(--accent-tint)" : "transparent",
                    color: i === safeSel ? "var(--accent-ink)" : "var(--ink)",
                  }}
                >
                  <span style={{ flex: 1 }}>{a.label}</span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "var(--faint)",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {a.kind}
                  </span>
                </button>
              ))}

              {results.length === 0 && (
                <div
                  style={{
                    padding: "18px 12px",
                    fontSize: 13,
                    color: "var(--faint)",
                    textAlign: "center",
                  }}
                >
                  No matching commands
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                borderTop: "1px solid var(--border-soft)",
                padding: "9px 16px",
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                color: "var(--faint)",
              }}
            >
              <span>↑↓ navigate</span>
              <span>↵ open</span>
              <span>esc close</span>
            </div>
          </div>
        </>
      )}
    </Ctx.Provider>
  );
}

/** The "Search ⌘K" chip that lives in the TopBar. */
export function CommandPaletteChip() {
  const { open } = useCommandPalette();
  return (
    <button
      type="button"
      onClick={open}
      aria-label="Open command menu"
      aria-haspopup="dialog"
      className="rc-search-chip"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontFamily: "var(--font-sans)",
        fontSize: 12,
        fontWeight: 500,
        color: "var(--muted)",
        background: "var(--chip-bg)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-pill)",
        padding: "6px 8px 6px 13px",
        cursor: "pointer",
      }}
    >
      <span>Search</span>
      <span
        aria-hidden="true"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10.5,
          color: "var(--faint)",
          border: "1px solid var(--border)",
          borderRadius: 4,
          padding: "1px 5px",
          background: "var(--surface)",
        }}
      >
        ⌘K
      </span>
    </button>
  );
}
