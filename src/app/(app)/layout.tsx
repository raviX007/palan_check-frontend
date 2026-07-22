import { Sidebar } from "@/components/app/Sidebar";
import { TopBar } from "@/components/app/TopBar";
import { PillNav } from "@/components/app/PillNav";
import { CommandPaletteProvider } from "@/components/app/CommandPalette";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <CommandPaletteProvider>
      <div className="rc-shell">
        <Sidebar />
        <div className="rc-main">
          <TopBar />
          <PillNav />
          <main style={{ flex: 1, padding: "24px clamp(16px, 4vw, 40px) 96px" }}>
            {children}
          </main>
        </div>
      </div>
    </CommandPaletteProvider>
  );
}
