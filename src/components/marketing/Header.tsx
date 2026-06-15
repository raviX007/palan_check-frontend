import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";

export function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="logo">
          <div className="logo-mark">
            <svg viewBox="0 0 24 24">
              <path d="M12 3L1 9l11 6 9-4.91V17M4 11.16V17l8 4 8-4v-5.84" />
            </svg>
          </div>
          <span className="logo-name">Palan Check</span>
        </Link>
        <nav className="header-nav">
          <a href="/#features">Features</a>
          <a href="/#demo">Demo</a>
          <a href="/#architecture">Architecture</a>
          <Link href="/quick-check" className="btn btn-nav-outline">Quick Check</Link>
          <Show when="signed-out">
            <Link href="/sign-in" className="btn btn-nav-solid">Sign In</Link>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard" className="btn btn-nav-outline">Dashboard</Link>
            <UserButton />
          </Show>
        </nav>
      </div>
    </header>
  );
}
